import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Stack } from '@mui/material';
import { verifyPayload } from '../lib/signing.js';

/**
 * Verify a certificate — paste the QR contents (or type cert no) and check
 * the signature against this machine's institution key. Fully offline.
 */
export default function VerifyPanel({ settings }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

  const check = async () => setResult(await verifyPayload(text, settings.secretKey));

  return (
    <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>Verify a certificate</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Paste what the QR scanner reads — it looks like <code>SLY1|CERT-0001|Name|01/01/2026|a1b2…</code>
      </Typography>

      <TextField
        multiline minRows={3} fullWidth size="small"
        placeholder="SLY1|…"
        value={text} onChange={(e) => { setText(e.target.value); setResult(null); }}
        sx={{ mb: 1 }}
      />
      <Button variant="contained" size="small" onClick={check} disabled={!text.trim()}>
        Verify
      </Button>

      {result && (
        <Box sx={{ mt: 2 }}>
          {result.ok ? (
            <Alert severity="success">
              Genuine — issued by this institution and unedited.
            </Alert>
          ) : (
            <Alert severity={result.cn ? 'error' : 'warning'}>
              {result.reason}
            </Alert>
          )}
          {result.cn && (
            <Stack spacing={0.25} sx={{ mt: 1 }}>
              <Typography variant="caption"><b>Certificate:</b> {result.cn}</Typography>
              <Typography variant="caption"><b>Issued to:</b> {result.name}</Typography>
              <Typography variant="caption"><b>Date:</b> {result.date}</Typography>
            </Stack>
          )}
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
        Verification is local and free — proof the certificate came from your institution's key,
        not a stamp of universal truth.
      </Typography>
    </Box>
  );
}
