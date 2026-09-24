import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, AppBar, Toolbar, Typography, IconButton, Tooltip, Slider,
  Chip, Drawer, List, ListItemButton, ListItemText, Divider, Button,
  Tabs, Tab, ToggleButtonGroup, ToggleButton, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import {
  FolderOpen, Save, Print, HelpOutline, GridOn, Undo, Redo, NoteAdd,
  TextFields, QrCode2, ViewWeek, ImageOutlined, CheckBoxOutlineBlank,
  HorizontalRule, Badge, Edit
} from '@mui/icons-material';
import Canvas from './components/Canvas.jsx';
import Inspector from './components/Inspector.jsx';
import DataPanel from './components/DataPanel.jsx';
import PhotosPanel from './components/PhotosPanel.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import RegisterPanel from './components/RegisterPanel.jsx';
import VerifyPanel from './components/VerifyPanel.jsx';
import PrintDialog from './components/PrintDialog.jsx';
import { createElement, blankTemplate, SIZE_PRESETS } from './lib/model.js';
import { PRESETS, presetByIndex } from './lib/presets.js';
import { SAMPLE_ROWS, SAMPLE_SETTINGS } from './lib/sampleData.js';
import { useHistory } from './lib/history.js';

const SHORTCUTS = [
  ['Ctrl+Z / Ctrl+Shift+Z', 'Undo / redo'],
  ['Delete', 'Remove selected element'],
  ['Arrow keys', 'Nudge selection (Shift = 5 mm)'],
  ['Drag / corners', 'Move and resize elements'],
  ['Hold Alt while dragging', 'Skip snapping'],
  ['Shift-click', 'Multi-select']
];

export default function App() {
  const { state: template, commit: commitTemplate, undo, redo } = useHistory(() => presetByIndex(0));
  const setTemplate = commitTemplate;
  const [rows, setRows] = useState(SAMPLE_ROWS);
  const [columns, setColumns] = useState(Object.keys(SAMPLE_ROWS[0]));
  const [previewIndex, setPreviewIndex] = useState(0);
  const [side, setSide] = useState('front');
  const [tab, setTab] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [zoom, setZoom] = useState(2.4);
  const [showGrid, setShowGrid] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [photoState, setPhotoState] = useState({ folder: null, files: null, column: 'roll', photos: null });
  const [settings, setSettings] = useState(SAMPLE_SETTINGS);
  const settingsLoaded = useRef(false);

  useEffect(() => {
    window.api.templates.list().then(setSavedTemplates).catch(() => {});
    window.api.settings.load().then((s) => {
      if (s && typeof s === 'object') {
        setSettings((cur) => ({
          ...cur, ...s,
          signatories: s.signatories?.length ? s.signatories : cur.signatories,
          series: { ...cur.series, ...(s.series || {}) }
        }));
      } else {
        // First run — generate a fresh verification key silently.
        window.api.seal.newKey().then((k) => setSettings((cur) => ({ ...cur, secretKey: k })));
      }
      settingsLoaded.current = true;
    }).catch(() => { settingsLoaded.current = true; });
  }, []);

  // Persist settings quietly as they change.
  useEffect(() => {
    if (settingsLoaded.current) window.api.settings.save(settings).catch(() => {});
  }, [settings]);

  const patchElements = (mapOrList, label) => {
    setTemplate((t) => ({
      ...t,
      elements: t.elements.map((el) =>
        Array.isArray(mapOrList)
          ? (mapOrList.find((m) => m.id === el.id) ? { ...el, ...mapOrList.find((m) => m.id === el.id).patch } : el)
          : (mapOrList[el.id] ? { ...el, ...mapOrList[el.id] } : el)
      )
    }), label);
  };

  const patchTemplate = (patch) => setTemplate((t) => ({ ...t, ...patch }));

  const setSize = (val) => {
    const [w, h] = String(val).split('x').map(Number);
    if (w > 0 && h > 0) patchTemplate({ widthMm: w, heightMm: h });
  };

  const addElement = (type) => {
    const el = createElement(type, template, side);
    setTemplate((t) => ({ ...t, elements: [...t.elements, el] }), `add ${type}`);
    setSelectedIds([el.id]);
  };

  const deleteSelected = () => {
    if (!selectedIds.length) return;
    setTemplate((t) => ({ ...t, elements: t.elements.filter((el) => !selectedIds.includes(el.id)) }), 'delete');
    setSelectedIds([]);
  };

  const duplicateSelected = () => {
    const src = template.elements.find((el) => el.id === selectedIds[0]);
    if (!src) return;
    const copy = { ...src, id: `${src.id}_c${Date.now().toString(36)}`, x: src.x + 4, y: src.y + 4 };
    setTemplate((t) => ({ ...t, elements: [...t.elements, copy] }), 'duplicate');
    setSelectedIds([copy.id]);
  };

  const reorder = (dir) => {
    const id = selectedIds[0];
    if (!id) return;
    setTemplate((t) => {
      const els = [...t.elements];
      const i = els.findIndex((e) => e.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= els.length) return t;
      [els[i], els[j]] = [els[j], els[i]];
      return { ...t, elements: els };
    }, 'reorder');
  };

  const pickImage = async (elId) => {
    const f = await window.api.app.openFile({
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp'] }]
    });
    if (f?.dataUrl) patchElements({ [elId]: { dataUrl: f.dataUrl } }, 'image');
  };

  const newDesign = () => {
    setTemplate(blankTemplate('Untitled design'), 'new');
    setSelectedIds([]);
  };

  const applyPreset = (i) => {
    setTemplate(presetByIndex(i), 'preset');
    setSelectedIds([]);
    setDrawerOpen(false);
  };

  const saveTemplate = async () => {
    const t = { ...template, id: template.id || `t_${Date.now().toString(36)}` };
    await window.api.templates.save(t);
    setTemplate({ ...t }, 'save');
    setSavedTemplates(await window.api.templates.list());
  };

  const loadTemplate = async (id) => {
    const t = await window.api.templates.load(id);
    if (t) { setTemplate(t, 'load'); setSelectedIds([]); }
  };

  const reprintOne = (issued) => {
    // Reprint this one certificate: load its snapshot as a single-row run.
    const snap = { ...(issued.snapshot || {}) };
    setRows([snap]);
    setColumns(Object.keys(snap));
    setPreviewIndex(0);
    setTab(0);
    setPrintOpen(true);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, textarea, [contenteditable]')) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if (mod && (e.key === 'Z' || e.key === 'y')) { e.preventDefault(); redo(); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelected(); }
      else if (e.key.startsWith('Arrow')) {
        const step = e.shiftKey ? 5 : 1;
        const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
        if (d && selectedIds.length) {
          e.preventDefault();
          patchElements(
            selectedIds.map((id) => ({ id, patch: null }))
              .map((m) => {
                const el = template.elements.find((x) => x.id === m.id);
                return { id: m.id, patch: { x: +(el.x + d[0]).toFixed(1), y: +(el.y + d[1]).toFixed(1) } };
              }),
            'nudge'
          );
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const selected = template.elements.find((el) => el.id === selectedIds[0]) || null;

  // Preview context: institution/signatory fields resolve like columns.
  const previewCtx = useMemo(() => {
    const sig = {};
    (settings.signatories || []).forEach((s, i) => {
      sig[`signatory${i + 1}_name`] = s.name;
      sig[`signatory${i + 1}_title`] = s.title;
    });
    const shared = { institution: settings.institution, institution_urdu: settings.institution_urdu, ...sig };
    const row = rows[previewIndex]
      ? { ...shared, ...rows[previewIndex], certno: `${settings.series.prefix}${String(settings.series.start + previewIndex).padStart(settings.series.pad, '0')}`, verify: 'preview0signature00' }
      : { ...shared, certno: `${settings.series.prefix}${String(settings.series.start).padStart(settings.series.pad, '0')}`, verify: 'preview0signature00' };
    return { row, index: previewIndex, photos: photoState.photos || {} };
  }, [rows, previewIndex, settings, photoState.photos]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#0f172a' }}>
        <Toolbar variant="dense" sx={{ gap: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mr: 1 }}>Sealory</Typography>

          <Tooltip title="New design"><IconButton size="small" color="inherit" onClick={newDesign}><NoteAdd /></IconButton></Tooltip>
          <Tooltip title="Designs & templates"><IconButton size="small" color="inherit" onClick={() => setDrawerOpen(true)}><FolderOpen /></IconButton></Tooltip>
          <Tooltip title="Save design"><IconButton size="small" color="inherit" onClick={saveTemplate}><Save /></IconButton></Tooltip>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: '#334155', mx: 0.5 }} />
          <Tooltip title="Undo"><IconButton size="small" color="inherit" onClick={undo}><Undo /></IconButton></Tooltip>
          <Tooltip title="Redo"><IconButton size="small" color="inherit" onClick={redo}><Redo /></IconButton></Tooltip>
          <Tooltip title="Toggle grid"><IconButton size="small" color="inherit" onClick={() => setShowGrid(!showGrid)}><GridOn /></IconButton></Tooltip>
          <Tooltip title="Shortcuts"><IconButton size="small" color="inherit" onClick={() => setHelpOpen(true)}><HelpOutline /></IconButton></Tooltip>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: '#334155', mx: 0.5 }} />
          <Tooltip title="Text"><IconButton size="small" color="inherit" onClick={() => addElement('text')}><TextFields /></IconButton></Tooltip>
          <Tooltip title="Photo frame — filled per recipient"><IconButton size="small" color="inherit" onClick={() => addElement('photo')}><Badge /></IconButton></Tooltip>
          <Tooltip title="Signature block"><IconButton size="small" color="inherit" onClick={() => addElement('signature')}><Edit /></IconButton></Tooltip>
          <Tooltip title="Verification QR"><IconButton size="small" color="inherit" onClick={() => addElement('qr')}><QrCode2 /></IconButton></Tooltip>
          <Tooltip title="Barcode"><IconButton size="small" color="inherit" onClick={() => addElement('barcode')}><ViewWeek /></IconButton></Tooltip>
          <Tooltip title="Image"><IconButton size="small" color="inherit" onClick={() => addElement('image')}><ImageOutlined /></IconButton></Tooltip>
          <Tooltip title="Rectangle"><IconButton size="small" color="inherit" onClick={() => addElement('rect')}><CheckBoxOutlineBlank /></IconButton></Tooltip>
          <Tooltip title="Line"><IconButton size="small" color="inherit" onClick={() => addElement('line')}><HorizontalRule /></IconButton></Tooltip>

          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" sx={{ color: '#94a3b8', mr: 1 }}>{template.name}</Typography>
          <Slider size="small" sx={{ width: 120, color: '#64748b' }} min={0.8} max={6} step={0.1}
            value={zoom} onChange={(_e, v) => setZoom(v)} />
          <Chip size="small" sx={{ bgcolor: '#1e293b', color: '#e2e8f0' }}
            label={`${rows.length} recipients`} />
          <Button variant="contained" color="warning" startIcon={<Print />}
            onClick={() => setPrintOpen(true)} sx={{ ml: 1 }}>
            Print &amp; issue
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Box sx={{ width: 360, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
            sx={{ borderBottom: '1px solid #e2e8f0', minHeight: 36 }}>
            <Tab label="Data" sx={{ minHeight: 36, textTransform: 'none' }} />
            <Tab label="Photos" sx={{ minHeight: 36, textTransform: 'none' }} />
            <Tab label="Register" sx={{ minHeight: 36, textTransform: 'none' }} />
            <Tab label="Verify" sx={{ minHeight: 36, textTransform: 'none' }} />
            <Tab label="Institution" sx={{ minHeight: 36, textTransform: 'none' }} />
          </Tabs>
          {tab === 0 && (
            <DataPanel rows={rows} columns={columns}
              onData={(r, c) => { setRows(r); setColumns(c); }}
              previewIndex={previewIndex} onPreviewIndex={setPreviewIndex}
              elements={template.elements} />
          )}
          {tab === 1 && <PhotosPanel rows={rows} columns={columns} photoState={photoState} onPhotos={setPhotoState} />}
          {tab === 2 && <RegisterPanel settings={settings} onReprint={reprintOne} />}
          {tab === 3 && <VerifyPanel settings={settings} />}
          {tab === 4 && <SettingsPanel settings={settings} onSettings={setSettings} />}
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {template.duplex && (
            <Box sx={{ p: 0.5, bgcolor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
              <ToggleButtonGroup size="small" exclusive value={side} onChange={(_e, v) => v && setSide(v)}>
                <ToggleButton value="front" sx={{ textTransform: 'none', px: 3 }}>Front</ToggleButton>
                <ToggleButton value="back" sx={{ textTransform: 'none', px: 3 }}>Back</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
          <Canvas
            template={template}
            selectedIds={selectedIds}
            onSelect={setSelectedIds}
            onPatchMany={(list, label) => patchElements(list, label)}
            previewCtx={previewCtx}
            zoom={zoom}
            showGrid={showGrid}
            side={side}
          />
        </Box>

        <Inspector
          element={selected}
          template={template}
          onPatch={(map) => patchElements(map, 'edit')}
          onDelete={deleteSelected}
          onDuplicate={duplicateSelected}
          onBringForward={() => reorder(1)}
          onSendBackward={() => reorder(-1)}
          onSetDuplex={(v) => patchTemplate({ duplex: v })}
          onSetSize={setSize}
          onSetSheet={(patch) => setTemplate((t) => ({ ...t, sheet: { ...t.sheet, ...patch } }))}
          onSetBackground={(v) => patchTemplate({ background: v })}
          onPickImage={pickImage}
        />
      </Box>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 320, p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Certificate &amp; card designs</Typography>
          <List dense>
            {PRESETS.map((p, i) => (
              <ListItemButton key={p.id} onClick={() => applyPreset(i)}>
                <ListItemText primary={p.name}
                  secondary={`${p.widthMm} × ${p.heightMm} mm${p.duplex ? ' · duplex' : ''}`} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Your saved designs</Typography>
          <List dense>
            {savedTemplates.map((t) => (
              <ListItemButton key={t.id} onClick={() => { loadTemplate(t.id); setDrawerOpen(false); }}>
                <ListItemText primary={t.name} secondary={`${t.widthMm} × ${t.heightMm} mm`} />
              </ListItemButton>
            ))}
            {!savedTemplates.length && (
              <Typography variant="caption" color="text.secondary" sx={{ px: 2 }}>
                Save a design and it appears here.
              </Typography>
            )}
          </List>
        </Box>
      </Drawer>

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Shortcuts</DialogTitle>
        <DialogContent dividers>
          {SHORTCUTS.map(([k, v]) => (
            <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{k}</Typography>
              <Typography variant="body2" color="text.secondary">{v}</Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions><Button onClick={() => setHelpOpen(false)}>Close</Button></DialogActions>
      </Dialog>

      <PrintDialog
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        template={template}
        rows={rows}
        range={{ mode: 'all' }}
        settings={settings}
        photoState={photoState}
      />
    </Box>
  );
}
