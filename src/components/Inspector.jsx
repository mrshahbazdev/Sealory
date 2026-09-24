import React from 'react';
import {
  Box, Typography, TextField, Select, MenuItem, FormControlLabel,
  Checkbox, Slider, ToggleButtonGroup, ToggleButton, Button,
  InputAdornment, Divider
} from '@mui/material';
import {
  FormatAlignLeft, FormatAlignCenter, FormatAlignRight,
  VerticalAlignTop, VerticalAlignCenter, VerticalAlignBottom,
  FormatBold, FormatItalic
} from '@mui/icons-material';
import { BARCODE_FORMATS } from '../lib/model.js';

const FONTS = [
  'Georgia, serif',
  'Times New Roman, serif',
  'Garamond, serif',
  'Palatino Linotype, serif',
  'Arial, Helvetica, sans-serif',
  'Segoe UI, sans-serif',
  'Verdana, sans-serif',
  'Courier New, monospace',
  '"Noto Nastaliq Urdu", Georgia, serif'
];

const mmInput = { inputProps: { step: 0.5, min: 0 } };

function Mm({ label, value, onChange }) {
  return (
    <TextField
      label={label}
      type="number"
      size="small"
      value={value}
      onChange={(e) => onChange(+e.target.value)}
      InputProps={{ endAdornment: <InputAdornment position="end">mm</InputAdornment> }}
      inputProps={mmInput.inputProps}
    />
  );
}

export default function Inspector({
  element, template, onPatch, onDelete, onDuplicate,
  onBringForward, onSendBackward, onSetDuplex, onSetSize, onSetSheet, onSetBackground,
  onPickImage
}) {
  const set = (key, val) => onPatch(element ? { [element.id]: { [key]: val } } : {});

  return (
    <Box sx={{ width: 300, borderLeft: '1px solid #e2e8f0', overflow: 'auto', p: 2 }}>
      {!element && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Design</Typography>

          <Typography variant="caption" color="text.secondary">Size</Typography>
          <Select
            size="small" fullWidth sx={{ mb: 1 }}
            value={`${template.widthMm}x${template.heightMm}`}
            onChange={(e) => onSetSize(e.target.value)}
            renderValue={() => `${template.widthMm} × ${template.heightMm} mm`}
          >
            {[['297x210', 'A4 landscape — certificate'], ['210x297', 'A4 portrait — certificate'],
              ['210x148', 'A5 landscape — certificate'], ['148x210', 'A5 portrait — certificate'],
              ['85.6x54', 'CR80 ID card — 85.6 × 54 mm'], ['100x70', 'Event pass — 100 × 70 mm']]
              .map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
          </Select>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <Mm label="Width" value={template.widthMm} onChange={(w) => onSetSize(`${w}x${template.heightMm}`)} />
            <Mm label="Height" value={template.heightMm} onChange={(h) => onSetSize(`${template.widthMm}x${h}`)} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary">Background</Typography>
            <input
              type="color"
              value={template.background || '#ffffff'}
              onChange={(e) => onSetBackground(e.target.value)}
              style={{ width: 40, height: 28, border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }}
            />
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{template.background}</Typography>
          </Box>

          <FormControlLabel
            control={<Checkbox size="small" checked={!!template.duplex} onChange={(e) => onSetDuplex(e.target.checked)} />}
            label={<Typography variant="body2">Duplex (front + back)</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={!!template.sheet?.enabled} onChange={(e) => onSetSheet({ enabled: e.target.checked })} />}
            label={<Typography variant="body2">Print on A4 sheet</Typography>}
          />

          {template.sheet?.enabled && (
            <Box sx={{ mt: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1, border: '1px solid #e2e8f0' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>Sheet layout</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1 }}>
                <TextField size="small" label="Columns" type="number" value={template.sheet.cols}
                  onChange={(e) => onSetSheet({ cols: Math.max(1, +e.target.value) })} />
                <TextField size="small" label="Rows" type="number" value={template.sheet.rows}
                  onChange={(e) => onSetSheet({ rows: Math.max(1, +e.target.value) })} />
                <TextField size="small" label="Left margin" type="number" value={template.sheet.marginLeft}
                  onChange={(e) => onSetSheet({ marginLeft: +e.target.value })} />
                <TextField size="small" label="Top margin" type="number" value={template.sheet.marginTop}
                  onChange={(e) => onSetSheet({ marginTop: +e.target.value })} />
                <TextField size="small" label="Gap X" type="number" value={template.sheet.gapX}
                  onChange={(e) => onSetSheet({ gapX: +e.target.value })} />
                <TextField size="small" label="Gap Y" type="number" value={template.sheet.gapY}
                  onChange={(e) => onSetSheet({ gapY: +e.target.value })} />
              </Box>
              <FormControlLabel sx={{ mt: 0.5 }}
                control={<Checkbox size="small" checked={!!template.sheet.showCutMarks}
                  onChange={(e) => onSetSheet({ showCutMarks: e.target.checked })} />}
                label={<Typography variant="body2">Cut marks</Typography>}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {template.sheet.cols * template.sheet.rows} items per A4 sheet
                {template.duplex ? ' · fronts then backs' : ''}
              </Typography>
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Nothing selected — click an element to edit it.
          </Typography>
        </>
      )}

      {element && (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, textTransform: 'capitalize' }}>
            {element.type === 'photo' ? 'Photo frame' : element.type}
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
            <Mm label="X" value={element.x} onChange={(v) => set('x', v)} />
            <Mm label="Y" value={element.y} onChange={(v) => set('y', v)} />
            <Mm label="W" value={element.w} onChange={(v) => set('w', v)} />
            <Mm label="H" value={element.h} onChange={(v) => set('h', v)} />
          </Box>

          <TextField
            label="Rotate" type="number" size="small" fullWidth sx={{ mb: 1.5 }}
            value={element.rotate || 0}
            onChange={(e) => set('rotate', +e.target.value)}
            InputProps={{ endAdornment: <InputAdornment position="end">°</InputAdornment> }}
          />

          {template.duplex && (
            <>
              <Typography variant="caption" color="text.secondary">Side</Typography>
              <ToggleButtonGroup
                size="small" exclusive fullWidth sx={{ mb: 1.5 }}
                value={element.side || 'front'}
                onChange={(_e, v) => v && set('side', v)}
              >
                <ToggleButton value="front">Front</ToggleButton>
                <ToggleButton value="back">Back</ToggleButton>
              </ToggleButtonGroup>
            </>
          )}

          {element.type === 'text' && (
            <>
              <TextField
                label="Text — {{fields}} allowed" multiline minRows={2} size="small" fullWidth sx={{ mb: 1 }}
                value={element.text}
                onChange={(e) => set('text', e.target.value)}
              />
              <Select size="small" fullWidth sx={{ mb: 1.5 }}
                value={element.fontFamily}
                onChange={(e) => set('fontFamily', e.target.value)}
                renderValue={(v) => <span style={{ fontFamily: v }}>{v.split(',')[0].replace(/"/g, '')}</span>}
              >
                {FONTS.map((f) => (
                  <MenuItem key={f} value={f}><span style={{ fontFamily: f }}>{f.split(',')[0].replace(/"/g, '')}</span></MenuItem>
                ))}
              </Select>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                <TextField label="Size" type="number" size="small" sx={{ width: 90 }}
                  value={element.fontSize} onChange={(e) => set('fontSize', +e.target.value)}
                  InputProps={{ endAdornment: <InputAdornment position="end">pt</InputAdornment> }}
                />
                <ToggleButtonGroup size="small">
                  <ToggleButton value="bold" selected={element.bold} onClick={() => set('bold', !element.bold)}><FormatBold fontSize="small" /></ToggleButton>
                  <ToggleButton value="italic" selected={element.italic} onClick={() => set('italic', !element.italic)}><FormatItalic fontSize="small" /></ToggleButton>
                </ToggleButtonGroup>
                <input type="color" value={element.color || '#000000'}
                  onChange={(e) => set('color', e.target.value)}
                  style={{ width: 32, height: 32, border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }} />
              </Box>
              <Typography variant="caption" color="text.secondary">Align</Typography>
              <ToggleButtonGroup size="small" exclusive sx={{ mb: 1 }}
                value={element.align || 'left'}
                onChange={(_e, v) => v && set('align', v)}
              >
                <ToggleButton value="left"><FormatAlignLeft fontSize="small" /></ToggleButton>
                <ToggleButton value="center"><FormatAlignCenter fontSize="small" /></ToggleButton>
                <ToggleButton value="right"><FormatAlignRight fontSize="small" /></ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="caption" color="text.secondary">Vertical</Typography>
              <ToggleButtonGroup size="small" exclusive sx={{ mb: 1.5 }}
                value={element.vAlign || 'top'}
                onChange={(_e, v) => v && set('vAlign', v)}
              >
                <ToggleButton value="top"><VerticalAlignTop fontSize="small" /></ToggleButton>
                <ToggleButton value="middle"><VerticalAlignCenter fontSize="small" /></ToggleButton>
                <ToggleButton value="bottom"><VerticalAlignBottom fontSize="small" /></ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="caption" color="text.secondary">Line height</Typography>
              <Slider size="small" min={0.8} max={2.4} step={0.05}
                value={element.lineHeight || 1.2} onChange={(_e, v) => set('lineHeight', v)}
              />
              <Typography variant="caption" color="text.secondary">Letter spacing (mm)</Typography>
              <Slider size="small" min={0} max={3} step={0.1}
                value={element.letterSpacing || 0} onChange={(_e, v) => set('letterSpacing', v)}
              />
              <FormControlLabel
                control={<Checkbox size="small" checked={element.rtl} onChange={(e) => set('rtl', e.target.checked)} />}
                label={<Typography variant="body2">Right-to-left (Urdu/Arabic)</Typography>}
              />
              <FormControlLabel
                control={<Checkbox size="small" checked={element.autoShrink} onChange={(e) => set('autoShrink', e.target.checked)} />}
                label={<Typography variant="body2">Shrink text to fit</Typography>}
              />
              <FormControlLabel
                control={<Checkbox size="small" checked={element.hideIfEmpty} onChange={(e) => set('hideIfEmpty', e.target.checked)} />}
                label={<Typography variant="body2">Hide when value is empty</Typography>}
              />
            </>
          )}

          {(element.type === 'barcode' || element.type === 'qr') && (
            <TextField
              label="Value — {{fields}} allowed" multiline minRows={2} size="small" fullWidth sx={{ mb: 1 }}
              value={element.value}
              onChange={(e) => set('value', e.target.value)}
            />
          )}

          {element.type === 'barcode' && (
            <>
              <Typography variant="caption" color="text.secondary">Format</Typography>
              <Select size="small" fullWidth sx={{ mb: 1.5 }} value={element.format}
                onChange={(e) => set('format', e.target.value)}>
                {BARCODE_FORMATS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </Select>
              <FormControlLabel
                control={<Checkbox size="small" checked={element.showValue} onChange={(e) => set('showValue', e.target.checked)} />}
                label={<Typography variant="body2">Show value under bars</Typography>}
              />
              <FormControlLabel
                control={<Checkbox size="small" checked={element.hideIfEmpty} onChange={(e) => set('hideIfEmpty', e.target.checked)} />}
                label={<Typography variant="body2">Hide when value is empty</Typography>}
              />
            </>
          )}

          {element.type === 'qr' && (
            <>
              <Typography variant="caption" color="text.secondary">Error correction</Typography>
              <Select size="small" fullWidth sx={{ mb: 1.5 }} value={element.ecl}
                onChange={(e) => set('ecl', e.target.value)}>
                {['L', 'M', 'Q', 'H'].map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </Select>
              <FormControlLabel
                control={<Checkbox size="small" checked={element.hideIfEmpty} onChange={(e) => set('hideIfEmpty', e.target.checked)} />}
                label={<Typography variant="body2">Hide when value is empty</Typography>}
              />
            </>
          )}

          {(element.type === 'image' || element.type === 'signature') && (
            <>
              <Button size="small" variant="outlined" onClick={() => onPickImage(element.id)} sx={{ mb: 1 }}>
                {element.dataUrl ? 'Replace image' : 'Choose image'}
              </Button>
              {element.type === 'signature' && (
                <>
                  <TextField label="Signatory name" size="small" fullWidth sx={{ mb: 1 }}
                    value={element.nameText} onChange={(e) => set('nameText', e.target.value)} />
                  <TextField label="Signatory title" size="small" fullWidth sx={{ mb: 1 }}
                    value={element.titleText} onChange={(e) => set('titleText', e.target.value)} />
                </>
              )}
            </>
          )}

          {element.type === 'photo' && (
            <>
              <Typography variant="caption" color="text.secondary">
                Filled per-recipient from the Photos panel. Shows a silhouette until a photo matches.
              </Typography>
              <TextField label="Corner radius" type="number" size="small" fullWidth sx={{ my: 1 }}
                value={element.radius || 0} onChange={(e) => set('radius', +e.target.value)}
                InputProps={{ endAdornment: <InputAdornment position="end">mm</InputAdornment> }}
              />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField label="Border" type="number" size="small" sx={{ width: 90 }}
                  value={element.borderWidth || 0} onChange={(e) => set('borderWidth', +e.target.value)}
                  InputProps={{ endAdornment: <InputAdornment position="end">mm</InputAdornment> }}
                />
                <input type="color" value={element.borderColor || '#0f172a'}
                  onChange={(e) => set('borderColor', e.target.value)}
                  style={{ width: 32, height: 32, border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }} />
              </Box>
            </>
          )}

          {element.type === 'rect' && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
              <TextField label="Border" type="number" size="small" sx={{ width: 90 }}
                value={element.borderWidth ?? 0.3} onChange={(e) => set('borderWidth', +e.target.value)}
                InputProps={{ endAdornment: <InputAdornment position="end">mm</InputAdornment> }}
              />
              <input type="color" value={element.borderColor || '#000000'}
                onChange={(e) => set('borderColor', e.target.value)}
                style={{ width: 32, height: 32, border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }} />
              <TextField label="Radius" type="number" size="small" sx={{ width: 90 }}
                value={element.radius || 0} onChange={(e) => set('radius', +e.target.value)} />
            </Box>
          )}

          {element.type === 'rect' && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
              <Typography variant="caption">Fill</Typography>
              <input type="color" value={element.fill === 'transparent' ? '#ffffff' : (element.fill || '#ffffff')}
                onChange={(e) => set('fill', e.target.value)}
                style={{ width: 32, height: 32, border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }} />
              <Button size="small" onClick={() => set('fill', 'transparent')}>Transparent</Button>
            </Box>
          )}

          {element.type === 'line' && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
              <Typography variant="caption">Colour</Typography>
              <input type="color" value={element.color || '#000000'}
                onChange={(e) => set('color', e.target.value)}
                style={{ width: 32, height: 32, border: '1px solid #cbd5e1', borderRadius: 4, cursor: 'pointer' }} />
            </Box>
          )}

          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button size="small" variant="outlined" onClick={onBringForward}>Bring forward</Button>
            <Button size="small" variant="outlined" onClick={onSendBackward}>Send back</Button>
            <Button size="small" variant="outlined" onClick={onDuplicate}>Duplicate</Button>
            <Button size="small" color="error" variant="outlined" onClick={onDelete}>Delete</Button>
          </Box>
        </>
      )}
    </Box>
  );
}
