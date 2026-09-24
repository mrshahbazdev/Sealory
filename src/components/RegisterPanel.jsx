import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Stack, Chip,
  Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import { verificationCSV, verificationHTML } from '../lib/signing.js';

/**
 * Issue register — every print run is logged with a snapshot of each row, so
 * a reprint years later reproduces exactly what went out.
 */
export default function RegisterPanel({ settings, onReprint }) {
  const [reg, setReg] = useState({ runs: [], issued: [] });
  const [query, setQuery] = useState('');

  const refresh = async () => setReg(await window.api.register.load());
  useEffect(() => { refresh(); }, []);

  const q = query.trim().toLowerCase();
  const issued = q
    ? reg.issued.filter((i) => `${i.certno} ${i.name} ${i.date}`.toLowerCase().includes(q))
    : reg.issued;

  const exportCSV = async () => {
    await window.api.export.saveText(
      verificationCSV(reg.issued),
      'verification-list.csv',
      [{ name: 'CSV', extensions: ['csv'] }]
    );
  };

  const exportHTML = async () => {
    await window.api.export.saveText(
      verificationHTML(reg.issued, settings.institution),
      'verify.html',
      [{ name: 'HTML', extensions: ['html'] }]
    );
  };

  return (
    <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>Issue register</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        {reg.issued.length.toLocaleString()} certificate(s) issued in {reg.runs.length} run(s).
      </Typography>

      <Stack direction="row" spacing={0.5} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
        <Button size="small" variant="outlined" onClick={exportCSV} disabled={!reg.issued.length}>
          Verification CSV
        </Button>
        <Button size="small" variant="outlined" onClick={exportHTML} disabled={!reg.issued.length}>
          Verification page (HTML)
        </Button>
        <Button size="small" variant="text" onClick={refresh}>Refresh</Button>
      </Stack>

      <TextField
        size="small" fullWidth placeholder="Search cert no, name or date"
        value={query} onChange={(e) => setQuery(e.target.value)} sx={{ mb: 1 }}
      />

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Cert #</TableCell>
            <TableCell>Issued to</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {issued.slice(0, 300).map((i, idx) => (
            <TableRow key={idx} hover onClick={() => onReprint(i)} sx={{ cursor: 'pointer' }}>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 11 }}>{i.certno}</TableCell>
              <TableCell sx={{ fontSize: 12 }}>{i.name}</TableCell>
              <TableCell sx={{ fontSize: 11, color: '#64748b' }}>{i.date}</TableCell>
            </TableRow>
          ))}
          {!issued.length && (
            <TableRow>
              <TableCell colSpan={3} sx={{ color: '#94a3b8' }}>
                Nothing issued yet — run a print or export and it lands here.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {issued.length > 300 && (
        <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
          Showing 300 of {issued.length.toLocaleString()} — refine the search.
        </Typography>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Click a row to reprint that one certificate.
      </Typography>
    </Box>
  );
}
