import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Stack, Divider, Alert,
  IconButton, Tooltip
} from '@mui/material';
import { ContentCopy, Visibility, VisibilityOff, Casino } from '@mui/icons-material';

/**
 * Institution profile: names (English + Urdu), logo/seal images, signatories
 * and the secret key every issued certificate is signed with.
 */
export default function SettingsPanel({ settings, onSettings }) {
  const [showKey, setShowKey] = useState(false);
  const set = (k, v) => onSettings({ ...settings, [k]: v });
  const sig = (i, k, v) => {
    const s = [...settings.signatories];
    s[i] = { ...s[i], [k]: v };
    set('signatories', s);
  };

  const pickImage = async (cb) => {
    const f = await window.api.app.openFile({
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]
    });
    if (f?.dataUrl) cb(f.dataUrl);
  };

  const genKey = async () => set('secretKey', await window.api.seal.newKey());

  return (
    <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Institution</Typography>
      <TextField label="Institution name" size="small" fullWidth sx={{ mb: 1 }}
        value={settings.institution} onChange={(e) => set('institution', e.target.value)} />
      <TextField label="Institution name (Urdu)" size="small" fullWidth sx={{ mb: 1.5 }}
        value={settings.institution_urdu} onChange={(e) => set('institution_urdu', e.target.value)}
        inputProps={{ dir: 'rtl' }} />

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button size="small" variant="outlined" onClick={() => pickImage((d) => set('logo', d))}>
          Logo image
        </Button>
        <Button size="small" variant="outlined" onClick={() => pickImage((d) => set('seal', d))}>
          Seal image
        </Button>
      </Stack>
      {settings.logo && <img src={settings.logo} alt="logo" style={{ height: 40, display: 'block', marginBottom: 8 }} />}

      <Divider sx={{ my: 1.5 }} />
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Signatories</Typography>
      {settings.signatories.map((s, i) => (
        <Box key={i} sx={{ mb: 1.5, p: 1, bgcolor: '#f8fafc', borderRadius: 1, border: '1px solid #e2e8f0' }}>
          <TextField label={`Name ${i + 1}`} size="small" fullWidth sx={{ mb: 0.5 }}
            value={s.name} onChange={(e) => sig(i, 'name', e.target.value)} />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <TextField label="Title" size="small" fullWidth
              value={s.title} onChange={(e) => sig(i, 'title', e.target.value)} />
            <Button size="small" variant="outlined" onClick={() => pickImage((d) => sig(i, 'dataUrl', d))}
              sx={{ whiteSpace: 'nowrap' }}>
              {s.dataUrl ? 'Sig ✓' : 'Sig img'}
            </Button>
          </Box>
        </Box>
      ))}
      <Typography variant="caption" color="text.secondary">
        Use {'{{signatory1_name}}'} / {'{{signatory1_title}}'} in text, or a Signature element which picks these up.
      </Typography>

      <Divider sx={{ my: 1.5 }} />
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Certificate numbering</Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <TextField label="Prefix" size="small" sx={{ width: 110 }}
          value={settings.series.prefix}
          onChange={(e) => set('series', { ...settings.series, prefix: e.target.value })} />
        <TextField label="Start #" type="number" size="small" sx={{ width: 90 }}
          value={settings.series.start}
          onChange={(e) => set('series', { ...settings.series, start: +e.target.value || 1 })} />
        <TextField label="Pad" type="number" size="small" sx={{ width: 70 }}
          value={settings.series.pad}
          onChange={(e) => set('series', { ...settings.series, pad: +e.target.value || 0 })} />
      </Box>

      <Divider sx={{ my: 1.5 }} />
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>Verification key</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Every QR carries an HMAC signature of cert no + name + date, signed with this key.
        Keep it private — anyone who has it can forge certificates.
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <TextField
          size="small" fullWidth
          type={showKey ? 'text' : 'password'}
          value={settings.secretKey}
          onChange={(e) => set('secretKey', e.target.value)}
          placeholder="Generate or paste a secret key"
        />
        <Tooltip title={showKey ? 'Hide' : 'Show'}>
          <IconButton size="small" onClick={() => setShowKey(!showKey)}>
            {showKey ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy">
          <IconButton size="small" onClick={() => navigator.clipboard.writeText(settings.secretKey)}>
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
        <Button size="small" variant="outlined" startIcon={<Casino />} onClick={genKey} sx={{ whiteSpace: 'nowrap' }}>
          New
        </Button>
      </Box>
      {!settings.secretKey && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          No key yet — QR verification will be unsigned until you generate one.
        </Alert>
      )}
    </Box>
  );
}
