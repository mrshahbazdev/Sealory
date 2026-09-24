import React, { useMemo, useState } from 'react';
import {
  Box, Typography, Button, Stack, Select, MenuItem, Alert,
  Table, TableHead, TableRow, TableCell, TableBody, Chip
} from '@mui/material';
import { PhotoLibrary, Refresh } from '@mui/icons-material';
import { matchPhotos } from '../lib/photos.js';
import { avatarPhoto } from '../lib/sampleData.js';

/**
 * Batch photo matching: point at a folder, pick which CSV column the file
 * names correspond to, see the report BEFORE anything prints.
 */
export default function PhotosPanel({ rows, columns, photoState, onPhotos }) {
  const [loading, setLoading] = useState(false);
  const { folder, files, column, report } = photoState;

  const reportData = useMemo(
    () => (files?.length ? matchPhotos(files, rows, column) : null),
    [files, rows, column]
  );

  const pickFolder = async () => {
    setLoading(true);
    const res = await window.api.photos.pickFolder();
    setLoading(false);
    if (!res) return;
    onPhotos({ ...photoState, folder: res.folder, files: res.files, column: column || columns[0] || '' });
  };

  const rescan = async () => {
    if (!folder) return;
    const files2 = await window.api.photos.listFolder(folder);
    if (files2 === null) {
      onPhotos({ ...photoState, folder: null, files: null });
      return;
    }
    onPhotos({ ...photoState, files: files2 });
  };

  const setColumn = (col) => onPhotos({ ...photoState, column: col });

  // Load matched photos as data URLs for preview + print.
  const loadPhotos = async () => {
    if (!reportData) return;
    setLoading(true);
    const photos = {};
    for (const r of reportData.results) {
      if (r.file) {
        photos[r.index] = await window.api.photos.read(`${folder}/${r.file}`);
      }
    }
    onPhotos({ ...photoState, photos });
    setLoading(false);
  };

  // Demo: match generated avatars by name so the preview shows photos working.
  const loadAvatars = () => {
    const photos = {};
    rows.forEach((r, i) => { photos[i] = avatarPhoto(r.name || `R${i}`); });
    onPhotos({ ...photoState, photos, folder: null, files: null });
  };

  const hasPhotos = !!photoState.photos && Object.keys(photoState.photos).length > 0;

  return (
    <Box sx={{ p: 2, overflow: 'auto', flex: 1 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Photos</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Point at a folder of recipient photos — file names are matched to a column before you print.
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <Button size="small" variant="contained" startIcon={<PhotoLibrary />} onClick={pickFolder} disabled={loading}>
          Choose folder
        </Button>
        {folder && (
          <Button size="small" variant="outlined" startIcon={<Refresh />} onClick={rescan}>
            Rescan
          </Button>
        )}
      </Stack>

      {folder && (
        <Typography variant="caption" sx={{ display: 'block', mb: 1, wordBreak: 'break-all', color: '#64748b' }}>
          {folder} — {files?.length || 0} image(s)
        </Typography>
      )}

      {!folder && rows.length > 0 && (
        <Button size="small" variant="text" onClick={loadAvatars} sx={{ mb: 1 }}>
          Demo: fill photos from initials
        </Button>
      )}

      {files?.length > 0 && (
        <>
          <Typography variant="caption" color="text.secondary">Match file names to column</Typography>
          <Select size="small" fullWidth sx={{ mb: 1.5 }} value={column || ''} onChange={(e) => setColumn(e.target.value)}>
            {columns.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>

          {reportData && (
            <>
              <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                <Chip size="small" color="success" variant="outlined" label={`${reportData.matched} matched`} />
                <Chip size="small" color={reportData.missing ? 'warning' : 'default'} variant="outlined"
                  label={`${reportData.missing} no photo`} />
                <Chip size="small" color={reportData.unmatchedFiles.length ? 'warning' : 'default'} variant="outlined"
                  label={`${reportData.unmatchedFiles.length} unused files`} />
              </Stack>

              {reportData.missing > 0 && (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  {reportData.missing} recipient(s) will print with a grey silhouette — or fix the file names and rescan.
                </Alert>
              )}

              <Button size="small" variant="outlined" fullWidth onClick={loadPhotos} disabled={loading} sx={{ mb: 1.5 }}>
                {hasPhotos ? 'Reload matched photos' : 'Load matched photos'}
              </Button>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Recipient</TableCell>
                    <TableCell>File</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.results.slice(0, 60).map((r) => (
                    <TableRow key={r.index}>
                      <TableCell sx={{ fontSize: 12 }}>{String(r.cell || '(blank)')}</TableCell>
                      <TableCell sx={{ fontSize: 11, color: r.file ? '#15803d' : '#b91c1c' }}>
                        {r.file || 'no match'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {reportData.results.length > 60 && (
                <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
                  Showing 60 of {reportData.results.length}
                </Typography>
              )}

              {reportData.unmatchedFiles.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>Files with no recipient</Typography>
                  <Box sx={{ maxHeight: 120, overflow: 'auto' }}>
                    {reportData.unmatchedFiles.map((f) => (
                      <Typography key={f} variant="caption" sx={{ display: 'block', color: '#b91c1c' }}>{f}</Typography>
                    ))}
                  </Box>
                </Box>
              )}
            </>
          )}
        </>
      )}

      {hasPhotos && (
        <Alert severity="success" sx={{ mt: 1.5 }}>
          {Object.keys(photoState.photos).length} photo(s) ready — photo frames in the design will use them.
        </Alert>
      )}
    </Box>
  );
}
