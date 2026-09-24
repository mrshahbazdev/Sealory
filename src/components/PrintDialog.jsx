import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, RadioGroup, Radio, FormControlLabel,
  TextField, Select, MenuItem, Alert, Stack, Divider, Chip
} from '@mui/material';
import { documentHTML, singleDocument, countPages, countItems } from '../lib/certHtml.js';
import { signRows } from '../lib/signing.js';
import { matchPhotos } from '../lib/photos.js';

/**
 * Print / export dialog. Every run signs its rows (cert no + date + HMAC) and
 * logs itself to the issue register — that is what makes a run an *issuance*.
 */
export default function PrintDialog({ open, onClose, template, rows, range, settings, photoState }) {
  const [mode, setMode] = useState('pdf');
  const [printer, setPrinter] = useState('');
  const [printers, setPrinters] = useState([]);
  const [copies, setCopies] = useState(1);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const itemCount = useMemo(() => countItems(rows, range), [rows, range]);
  const pageCount = useMemo(() => countPages(template, rows, range), [template, rows, range]);

  const photoReport = useMemo(
    () => (photoState.files?.length ? matchPhotos(photoState.files, rows, photoState.column) : null),
    [photoState, rows]
  );

  useEffect(() => {
    if (!open) return;
    setResult(null); setError(null);
    window.api.print.listPrinters().then((list) => {
      setPrinters(list);
      const def = list.find((p) => p.isDefault);
      if (def) setPrinter(def.name);
    }).catch(() => setPrinters([]));
  }, [open]);

  const recordRun = async (signed) => {
    const issued = signed.map((r) => ({
      certno: r.__certno, name: r.__holder, date: r.__date, sig: r.__verify,
      snapshot: Object.fromEntries(Object.entries(r).filter(([k]) => !k.startsWith('__'))),
      template: template.name
    }));
    await window.api.register.record(
      { at: new Date().toISOString(), template: template.name, count: signed.length, size: `${template.widthMm}x${template.heightMm}` },
      issued
    );
    return issued.length;
  };

  const go = async () => {
    setBusy(true); setError(null); setResult(null);
    try {
      // Resolve photos for this run (already loaded data URLs or matched files)
      const photos = photoState.photos || {};
      const list = rows.length ? rows : [null];
      const signed = await signRows(list.filter(Boolean).length ? list : [{}], settings);
      // If rows empty, signed has the one placeholder row
      const runRows = rows.length ? signed : [{}];
      const ctxExtra = { photos };

      const dims = template.sheet?.enabled
        ? { widthMm: template.sheet.pageW, heightMm: template.sheet.pageH }
        : { widthMm: template.widthMm, heightMm: template.heightMm };

      if (mode === 'pdf') {
        const html = await documentHTML(template, runRows, range, ctxExtra);
        const buffer = await window.api.print.toPDFBuffer({ html, ...dims });
        const res = await window.api.export.savePDF(buffer, `${template.name || 'certificates'}.pdf`);
        if (res.success) {
          const n = await recordRun(rows.length ? signed : []);
          setResult(`${n} certificate(s) issued — saved to ${res.filePath} and logged in the register.`);
        } else if (!res.cancelled) {
          setError('Could not save that PDF.');
        }
      } else if (mode === 'files') {
        // One PDF per person: NAME-CERTNO.pdf per row
        const files = [];
        for (let i = 0; i < runRows.length; i++) {
          const html = await singleDocument(template, runRows[i], i, ctxExtra);
          const buffer = await window.api.print.toPDFBuffer({ html, ...dims });
          const safe = `${runRows[i].__holder || 'certificate'}-${runRows[i].__certno || i + 1}`;
          files.push({ name: safe, buffer });
        }
        const res = await window.api.export.savePDFFiles(files);
        if (res.success) {
          const n = await recordRun(rows.length ? signed : []);
          setResult(`${res.count} files written to ${res.dir} — ${n} logged in the register.`);
        } else if (!res.cancelled) {
          setError('Could not write those files.');
        }
      } else {
        const html = await documentHTML(template, runRows, range, ctxExtra);
        const res = await window.api.print.direct({ html, ...dims, printerName: printer, copies: template.duplex ? 1 : copies, landscape: dims.widthMm > dims.heightMm });
        if (res.success) {
          const n = await recordRun(rows.length ? signed : []);
          setResult(`${n} certificate(s) issued and logged in the register.`);
        } else {
          setError(res.error || 'Printing failed.');
        }
      }
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    }
    setBusy(false);
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Print &amp; issue</DialogTitle>
      <DialogContent>
        <Stack spacing={0.5} sx={{ mb: 1.5 }}>
          <Chip size="small" label={`${itemCount} certificate(s) · ${pageCount} page(s)`} />
          {template.duplex && <Chip size="small" variant="outlined" label="Duplex: front + back" />}
          {photoReport && photoReport.missing > 0 && (
            <Alert severity="warning">{photoReport.missing} of {itemCount} have no matched photo — they will print with a silhouette.</Alert>
          )}
        </Stack>

        <RadioGroup value={mode} onChange={(e) => setMode(e.target.value)}>
          <FormControlLabel value="pdf" control={<Radio size="small" />} label="One merged PDF" />
          <FormControlLabel value="files" control={<Radio size="small" />} label="One PDF per person (NAME-CERTNO.pdf)" />
          <FormControlLabel value="print" control={<Radio size="small" />} label="Print directly" />
        </RadioGroup>

        {mode === 'print' && (
          <>
            <Typography variant="caption" color="text.secondary">Printer</Typography>
            <Select size="small" fullWidth sx={{ mb: 1 }} value={printer} onChange={(e) => setPrinter(e.target.value)}>
              {printers.map((p) => <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>)}
            </Select>
            <TextField
              label="Copies" type="number" size="small" sx={{ width: 110 }}
              value={copies} onChange={(e) => setCopies(Math.max(1, +e.target.value || 1))}
              disabled={template.duplex}
              helperText={template.duplex ? 'Duplex designs print one copy — set copies on the printer' : undefined}
            />
          </>
        )}

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="caption" color="text.secondary">
          Issuing signs each certificate with your key and logs the run in the register.
          Certificates use numbers {settings.series.prefix}… from #{settings.series.start}.
        </Typography>

        {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}
        {result && <Alert severity="success" sx={{ mt: 1.5 }}>{result}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Close</Button>
        <Button variant="contained" onClick={go} disabled={busy}>
          {busy ? 'Working…' : mode === 'print' ? 'Print' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
