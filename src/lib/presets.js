import { newId, URDU_FONT } from './model.js';

/**
 * Built-in designs. Certificate templates live and die on borders, seal
 * placement and typography — these are deliberately different in structure,
 * not the same layout with a new accent colour.
 */

const T = (over) => ({
  id: newId('text'), type: 'text', side: 'front', x: 0, y: 0, w: 40, h: 8, rotate: 0,
  text: '', fontSize: 12, fontFamily: 'Georgia, serif', bold: false, italic: false,
  align: 'center', vAlign: 'middle', color: '#1e293b', lineHeight: 1.2,
  letterSpacing: 0, autoShrink: true, hideIfEmpty: false, rtl: false, ...over
});
const R = (over) => ({
  id: newId('rect'), type: 'rect', side: 'front', x: 0, y: 0, w: 40, h: 40, rotate: 0,
  fill: 'transparent', borderColor: '#0f172a', borderWidth: 0.4, radius: 0, ...over
});
const L = (over) => ({
  id: newId('line'), type: 'line', side: 'front', x: 0, y: 0, w: 40, h: 0.3, rotate: 0,
  color: '#0f172a', ...over
});
const Q = (over) => ({
  id: newId('qr'), type: 'qr', side: 'front', x: 0, y: 0, w: 18, h: 18, rotate: 0,
  value: 'SLY1|{{certno}}|{{name}}|{{date}}|{{verify}}', ecl: 'M', margin: 0,
  color: '#0f172a', ...over
});
const S = (over) => ({
  id: newId('sig'), type: 'signature', side: 'front', x: 0, y: 0, w: 42, h: 16, rotate: 0,
  dataUrl: '', nameText: '{{signatory1_name}}', titleText: '{{signatory1_title}}',
  color: '#334155', ...over
});
const P = (over) => ({
  id: newId('photo'), type: 'photo', side: 'front', x: 0, y: 0, w: 22, h: 28, rotate: 0,
  radius: 0, fit: 'cover', borderColor: '#0f172a', borderWidth: 0.3, ...over
});

const VERIFY_QR = 'SLY1|{{certno}}|{{name}}|{{date}}|{{verify}}';

function base(name, widthMm, heightMm, opts = {}) {
  return {
    id: null, name, widthMm, heightMm,
    background: opts.background || '#ffffff',
    duplex: !!opts.duplex,
    builtin: true,
    sheet: { enabled: false, pageW: 210, pageH: 297, cols: 2, rows: 5, marginLeft: 9.2, marginTop: 13.5, gapX: 5, gapY: 2.5, showCutMarks: true, showOutline: false },
    elements: []
  };
}

export const PRESETS = [];

/* ---------------------------------------------------------- Formal — A4 L */
{
  const t = base('Certificate of Completion — Formal', 297, 210, { background: '#fdfcf8' });
  const W = 297, H = 210;
  t.elements = [
    R({ x: 8, y: 8, w: W - 16, h: H - 16, borderColor: '#8a6d1d', borderWidth: 1.2 }),
    R({ x: 11, y: 11, w: W - 22, h: H - 22, borderColor: '#8a6d1d', borderWidth: 0.3 }),
    T({ x: 48, y: 22, w: W - 96, h: 9, text: '{{institution}}', fontSize: 15, bold: true, color: '#44403c', letterSpacing: 2 }),
    L({ x: W / 2 - 45, y: 34, w: 90, h: 0.3, color: '#8a6d1d' }),
    T({ x: 48, y: 42, w: W - 96, h: 16, text: 'CERTIFICATE', fontSize: 34, bold: true, color: '#292524', letterSpacing: 8 }),
    T({ x: 48, y: 59, w: W - 96, h: 7, text: 'OF COMPLETION', fontSize: 13, color: '#8a6d1d', letterSpacing: 6 }),
    T({ x: 48, y: 78, w: W - 96, h: 6, text: 'This is to certify that', fontSize: 11, italic: true, color: '#57534e' }),
    T({ x: 38, y: 88, w: W - 76, h: 14, text: '{{name}}', fontSize: 26, bold: true, italic: true, color: '#1c1917' }),
    L({ x: W / 2 - 60, y: 106, w: 120, h: 0.25, color: '#a8a29e' }),
    T({ x: 48, y: 112, w: W - 96, h: 12, text: 'has successfully completed {{course}} on {{date}}', fontSize: 11.5, color: '#44403c' }),
    T({ x: 48, y: 126, w: W - 96, h: 7, text: '{{detail}}', fontSize: 9.5, color: '#78716c' }),
    // seal
    R({ x: W / 2 - 13, y: 146, w: 26, h: 26, radius: 13, borderColor: '#8a6d1d', borderWidth: 1.2, fill: '#fef9e7' }),
    T({ x: W / 2 - 11, y: 150, w: 22, h: 18, text: '✦', fontSize: 18, color: '#8a6d1d' }),
    S({ x: 38, y: 158 }),
    S({ x: W - 80, y: 158, nameText: '{{signatory2_name}}', titleText: '{{signatory2_title}}' }),
    T({ x: 14, y: 188, w: 80, h: 5, align: 'left', text: 'No: {{certno}}', fontSize: 7.5, color: '#78716c' }),
    Q({ x: W - 33, y: 172, w: 16, h: 16, value: VERIFY_QR })
  ];
  PRESETS.push(t);
}

/* --------------------------------------------------- Participation — A4 L */
{
  const t = base('Certificate of Participation — Band', 297, 210, { background: '#ffffff' });
  const W = 297, H = 210;
  t.elements = [
    R({ x: 0, y: 0, w: W, h: 34, fill: '#0f3d3e', borderWidth: 0 }),
    R({ x: 0, y: H - 12, w: W, h: 12, fill: '#0f3d3e', borderWidth: 0 }),
    T({ x: 20, y: 8, w: W - 40, h: 9, text: '{{institution}}', fontSize: 13, bold: true, color: '#ccfbf1', letterSpacing: 1.5, fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 20, y: 19, w: W - 40, h: 8, text: 'presents this certificate to', fontSize: 10, color: '#99f6e4', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 30, y: 52, w: W - 60, h: 18, text: '{{name}}', fontSize: 32, bold: true, color: '#134e4a', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 30, y: 76, w: W - 60, h: 7, text: 'for participating in', fontSize: 11, color: '#57534e', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 30, y: 86, w: W - 60, h: 10, text: '{{course}}', fontSize: 16, bold: true, color: '#0f766e', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 30, y: 100, w: W - 60, h: 7, text: 'held on {{date}} {{detail}}', fontSize: 10, color: '#78716c', fontFamily: 'Arial, Helvetica, sans-serif' }),
    S({ x: 40, y: 158 }),
    S({ x: W - 82, y: 158, nameText: '{{signatory2_name}}', titleText: '{{signatory2_title}}' }),
    T({ x: 20, y: 150, w: 90, h: 5, align: 'left', text: 'Certificate No: {{certno}}', fontSize: 8, color: '#94a3b8', fontFamily: 'Arial, Helvetica, sans-serif' }),
    Q({ x: W / 2 - 9, y: 150, w: 18, h: 18, value: VERIFY_QR }),
    T({ x: W / 2 - 30, y: 169, w: 60, h: 4, text: 'Scan to verify', fontSize: 6.5, color: '#94a3b8', fontFamily: 'Arial, Helvetica, sans-serif' })
  ];
  PRESETS.push(t);
}

/* ------------------------------------------------------ Achievement — A4 P */
{
  const t = base('Certificate of Achievement — Portrait', 210, 297, { background: '#fffdf5' });
  const W = 210, H = 297;
  t.elements = [
    R({ x: 10, y: 10, w: W - 20, h: H - 20, borderColor: '#a16207', borderWidth: 0.9 }),
    R({ x: 13, y: 13, w: W - 26, h: H - 26, borderColor: '#d6d3d1', borderWidth: 0.3 }),
    R({ x: W / 2 - 16, y: 26, w: 32, h: 32, radius: 16, borderColor: '#a16207', borderWidth: 1.4, fill: '#fefce8' }),
    T({ x: W / 2 - 14, y: 31, w: 28, h: 22, text: '★', fontSize: 22, color: '#a16207' }),
    T({ x: 20, y: 66, w: W - 40, h: 8, text: '{{institution}}', fontSize: 12.5, bold: true, color: '#44403c', letterSpacing: 1.5 }),
    T({ x: 20, y: 82, w: W - 40, h: 14, text: 'CERTIFICATE', fontSize: 30, bold: true, color: '#292524', letterSpacing: 6 }),
    T({ x: 20, y: 97, w: W - 40, h: 6, text: 'OF ACHIEVEMENT', fontSize: 12, color: '#a16207', letterSpacing: 5 }),
    T({ x: 30, y: 120, w: W - 60, h: 6, text: 'This is proudly presented to', fontSize: 11, italic: true, color: '#57534e' }),
    T({ x: 20, y: 132, w: W - 40, h: 14, text: '{{name}}', fontSize: 26, bold: true, italic: true, color: '#1c1917' }),
    L({ x: 45, y: 150, w: W - 90, h: 0.25, color: '#a8a29e' }),
    T({ x: 30, y: 160, w: W - 60, h: 20, text: 'in recognition of outstanding achievement in {{course}}, awarded this day, {{date}}', fontSize: 11, color: '#44403c' }),
    T({ x: 30, y: 186, w: W - 60, h: 7, text: '{{detail}}', fontSize: 9.5, color: '#78716c' }),
    S({ x: 30, y: 236 }),
    S({ x: W - 72, y: 236, nameText: '{{signatory2_name}}', titleText: '{{signatory2_title}}' }),
    T({ x: 18, y: 268, w: 90, h: 5, align: 'left', text: 'No: {{certno}}', fontSize: 7.5, color: '#a8a29e' }),
    Q({ x: W - 34, y: 252, w: 15, h: 15, value: VERIFY_QR })
  ];
  PRESETS.push(t);
}

/* ------------------------------------------- Training — bilingual A4 L */
{
  const t = base('Training Certificate — Urdu + English', 297, 210, { background: '#ffffff' });
  const W = 297, H = 210;
  t.elements = [
    R({ x: 0, y: 0, w: W, h: 8, fill: '#1e3a8a', borderWidth: 0 }),
    R({ x: 0, y: H - 8, w: W, h: 8, fill: '#1e3a8a', borderWidth: 0 }),
    T({ x: 20, y: 16, w: W - 40, h: 11, text: '{{institution_urdu}}', fontSize: 20, bold: true, color: '#1e3a8a', rtl: true, fontFamily: URDU_FONT }),
    T({ x: 20, y: 30, w: W - 40, h: 8, text: '{{institution}}', fontSize: 12, color: '#475569', letterSpacing: 1.5 }),
    T({ x: 20, y: 48, w: W - 40, h: 14, text: 'تربیتی سرٹیفکیٹ', fontSize: 26, bold: true, color: '#0f172a', rtl: true, fontFamily: URDU_FONT }),
    T({ x: 20, y: 64, w: W - 40, h: 7, text: 'TRAINING CERTIFICATE', fontSize: 12, color: '#1e3a8a', letterSpacing: 5 }),
    T({ x: 30, y: 84, w: W - 60, h: 6, text: 'This is to certify that', fontSize: 10.5, italic: true, color: '#57534e' }),
    T({ x: 30, y: 94, w: W - 60, h: 14, text: '{{name}}', fontSize: 26, bold: true, color: '#0f172a' }),
    T({ x: 30, y: 112, w: W - 60, h: 10, text: 'has attended and completed the training programme {{course}}', fontSize: 11, color: '#334155' }),
    T({ x: 30, y: 124, w: W - 60, h: 7, text: 'held from {{detail}} — issued on {{date}}', fontSize: 10, color: '#64748b' }),
    S({ x: 42, y: 160 }),
    S({ x: W - 84, y: 160, nameText: '{{signatory2_name}}', titleText: '{{signatory2_title}}' }),
    T({ x: 16, y: 190, w: 80, h: 5, align: 'left', text: 'No: {{certno}}', fontSize: 7.5, color: '#94a3b8' }),
    Q({ x: W / 2 - 8, y: 168, w: 16, h: 16, value: VERIFY_QR })
  ];
  PRESETS.push(t);
}

/* ------------------------------------------------------------ Sports — A4 L */
{
  const t = base('Sports Day Certificate', 297, 210, { background: '#fffaf0' });
  const W = 297, H = 210;
  t.elements = [
    R({ x: 6, y: 6, w: W - 12, h: H - 12, borderColor: '#c2410c', borderWidth: 1.4, radius: 2 }),
    R({ x: 0, y: 0, w: 42, h: 42, fill: '#c2410c', borderWidth: 0 }),
    T({ x: 2, y: 4, w: 38, h: 30, text: '🏆', fontSize: 20, color: '#fff' }),
    T({ x: 40, y: 20, w: W - 80, h: 9, text: '{{institution}}', fontSize: 14, bold: true, color: '#7c2d12', letterSpacing: 2 }),
    T({ x: 40, y: 38, w: W - 80, h: 15, text: 'SPORTS CERTIFICATE', fontSize: 30, bold: true, color: '#431407', letterSpacing: 5, fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 40, y: 62, w: W - 80, h: 6, text: 'awarded to', fontSize: 11, italic: true, color: '#78716c' }),
    T({ x: 30, y: 72, w: W - 60, h: 15, text: '{{name}}', fontSize: 28, bold: true, color: '#9a3412', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 40, y: 92, w: W - 80, h: 10, text: 'for {{position}} place in {{course}}', fontSize: 12.5, color: '#431407' }),
    T({ x: 40, y: 106, w: W - 80, h: 7, text: 'at the Annual Sports Day, {{date}} {{detail}}', fontSize: 10, color: '#78716c' }),
    R({ x: W / 2 - 12, y: 148, w: 24, h: 24, radius: 12, borderColor: '#c2410c', borderWidth: 1.2, fill: '#fff7ed' }),
    T({ x: W / 2 - 10, y: 152, w: 20, h: 16, text: '🏅', fontSize: 16 }),
    S({ x: 40, y: 158 }),
    S({ x: W - 82, y: 158, nameText: '{{signatory2_name}}', titleText: '{{signatory2_title}}' }),
    T({ x: 14, y: 190, w: 80, h: 5, align: 'left', text: 'No: {{certno}}', fontSize: 7.5, color: '#a8a29e' }),
    Q({ x: W - 32, y: 174, w: 15, h: 15, value: VERIFY_QR })
  ];
  PRESETS.push(t);
}

/* -------------------------------------------------------------- Kids — A4 L */
{
  const t = base('Prize Day Certificate — Kids', 297, 210, { background: '#fefce8' });
  const W = 297, H = 210;
  t.elements = [
    R({ x: 7, y: 7, w: W - 14, h: H - 14, borderColor: '#f59e0b', borderWidth: 1, radius: 6 }),
    T({ x: 20, y: 16, w: 40, h: 16, text: '⭐', fontSize: 20 }),
    T({ x: W - 60, y: 16, w: 40, h: 16, text: '⭐', fontSize: 20 }),
    T({ x: 40, y: 24, w: W - 80, h: 9, text: '{{institution}}', fontSize: 14, bold: true, color: '#b45309', letterSpacing: 2, fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 40, y: 42, w: W - 80, h: 17, text: 'WELL DONE!', fontSize: 38, bold: true, color: '#92400e', letterSpacing: 6, fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 40, y: 68, w: W - 80, h: 6, text: 'this certificate goes to', fontSize: 11, color: '#78716c', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 30, y: 78, w: W - 60, h: 16, text: '{{name}}', fontSize: 30, bold: true, color: '#d97706', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 40, y: 100, w: W - 80, h: 10, text: 'for {{course}}', fontSize: 13, bold: true, color: '#78350f', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 40, y: 114, w: W - 80, h: 7, text: 'on Prize Day, {{date}}', fontSize: 10.5, color: '#78716c', fontFamily: 'Arial, Helvetica, sans-serif' }),
    S({ x: 42, y: 160 }),
    S({ x: W - 84, y: 160, nameText: '{{signatory2_name}}', titleText: '{{signatory2_title}}' }),
    T({ x: 14, y: 190, w: 80, h: 5, align: 'left', text: 'No: {{certno}}', fontSize: 7.5, color: '#a8a29e' }),
    Q({ x: W / 2 - 8, y: 166, w: 16, h: 16, value: VERIFY_QR })
  ];
  PRESETS.push(t);
}

/* -------------------------------------------- Employee ID — CR80 duplex */
{
  const t = base('Employee ID Card — CR80 front+back', 85.6, 54, { duplex: true, background: '#ffffff' });
  const W = 85.6, H = 54;
  t.elements = [
    // front
    R({ x: 0, y: 0, w: W, h: 14, fill: '#1e3a8a', borderWidth: 0 }),
    T({ x: 4, y: 3, w: W - 8, h: 8, text: '{{institution}}', fontSize: 9, bold: true, color: '#ffffff', letterSpacing: 0.5, fontFamily: 'Arial, Helvetica, sans-serif' }),
    P({ x: 5, y: 17, w: 20, h: 25, borderColor: '#cbd5e1', borderWidth: 0.3 }),
    T({ x: 28, y: 17, w: W - 33, h: 8, text: '{{name}}', fontSize: 10, bold: true, color: '#0f172a', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 28, y: 26, w: W - 33, h: 5, text: '{{role}}', fontSize: 7, color: '#475569', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 28, y: 32, w: W - 33, h: 5, text: 'ID: {{id}}', fontSize: 6.5, color: '#64748b', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 28, y: 37.5, w: W - 33, h: 5, text: 'Dept: {{department}}', fontSize: 6.5, color: '#64748b', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 28, y: 43, w: W - 33, h: 5, text: 'Valid till: {{valid_till}}', fontSize: 6.5, color: '#64748b', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 5, y: 44, w: 20, h: 5, text: '{{blood}}', fontSize: 7, bold: true, color: '#b91c1c' }),
    Q({ x: W - 20, y: 44.5, w: 8, h: 8, value: VERIFY_QR }),
    // back
    R({ side: 'back', x: 0, y: 0, w: W, h: H, fill: '#f8fafc', borderWidth: 0 }),
    T({ side: 'back', x: 6, y: 5, w: W - 12, h: 6, text: '{{institution}}', fontSize: 8, bold: true, color: '#1e3a8a', fontFamily: 'Arial, Helvetica, sans-serif' }),
    L({ side: 'back', x: 6, y: 12, w: W - 12, h: 0.2, color: '#cbd5e1' }),
    T({ side: 'back', x: 6, y: 15, w: W - 12, h: 14, text: 'This card remains the property of {{institution}}. If found, please return to the issuing office.', fontSize: 6, color: '#475569', align: 'left', vAlign: 'top', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ side: 'back', x: 6, y: 30, w: W - 12, h: 5, text: 'Emergency: {{emergency}}', fontSize: 6.5, color: '#475569', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    { id: newId('barcode'), type: 'barcode', side: 'back', x: 14, y: 37, w: W - 28, h: 12, rotate: 0, value: '{{id}}', format: 'CODE128', showValue: true, fontSize: 12, barWidth: 1.4, barHeight: 55, lineColor: '#0f172a' }
  ];
  PRESETS.push(t);
}

/* ------------------------------------------- Membership card — CR80 duplex */
{
  const t = base('Membership Card — CR80 front+back', 85.6, 54, { duplex: true, background: '#0f172a' });
  const W = 85.6, H = 54;
  t.elements = [
    T({ x: 6, y: 4, w: W - 12, h: 8, text: '{{institution}}', fontSize: 9.5, bold: true, color: '#fbbf24', letterSpacing: 1, fontFamily: 'Arial, Helvetica, sans-serif' }),
    L({ x: 6, y: 13, w: W - 12, h: 0.2, color: '#334155' }),
    P({ x: 6, y: 17, w: 17, h: 22, borderColor: '#fbbf24', borderWidth: 0.3 }),
    T({ x: 26, y: 17, w: W - 32, h: 8, text: '{{name}}', fontSize: 10, bold: true, color: '#f8fafc', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 26, y: 26, w: W - 32, h: 5, text: 'Member: {{id}}', fontSize: 6.5, color: '#94a3b8', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 26, y: 31.5, w: W - 32, h: 5, text: 'Plan: {{plan}}', fontSize: 6.5, color: '#94a3b8', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 26, y: 37, w: W - 32, h: 5, text: 'Expires: {{valid_till}}', fontSize: 6.5, color: '#fbbf24', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    Q({ x: W - 18, y: 40, w: 9, h: 9, value: VERIFY_QR, color: '#fbbf24' }),
    T({ x: 6, y: 46, w: 30, h: 5, text: '{{certno}}', fontSize: 5.5, color: '#64748b', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    // back
    R({ side: 'back', x: 0, y: 0, w: W, h: H, fill: '#1e293b', borderWidth: 0 }),
    T({ side: 'back', x: 6, y: 6, w: W - 12, h: 5, text: 'TERMS', fontSize: 6, bold: true, color: '#fbbf24', align: 'left', letterSpacing: 2, fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ side: 'back', x: 6, y: 13, w: W - 12, h: 22, text: 'Membership is non-transferable and must be presented on entry. Lost cards should be reported immediately.', fontSize: 5.8, color: '#94a3b8', align: 'left', vAlign: 'top', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ side: 'back', x: 6, y: 36, w: W - 12, h: 5, text: '{{institution}} · {{emergency}}', fontSize: 6, color: '#64748b', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    { id: newId('barcode'), type: 'barcode', side: 'back', x: 14, y: 42, w: W - 28, h: 9, rotate: 0, value: '{{id}}', format: 'CODE128', showValue: false, fontSize: 10, barWidth: 1.3, barHeight: 50, lineColor: '#f8fafc' }
  ];
  PRESETS.push(t);
}

/* ------------------------------------------------------ Event pass — 100x70 */
{
  const t = base('Event Pass — 100 x 70', 100, 70, { background: '#312e81' });
  const W = 100, H = 70;
  t.elements = [
    R({ x: 0, y: 0, w: W, h: 18, fill: '#f59e0b', borderWidth: 0 }),
    T({ x: 6, y: 4, w: W - 12, h: 9, text: '{{event}}', fontSize: 10, bold: true, color: '#1e1b4b', letterSpacing: 1, fontFamily: 'Arial, Helvetica, sans-serif' }),
    P({ x: 7, y: 22, w: 20, h: 26, borderColor: '#f59e0b', borderWidth: 0.3 }),
    T({ x: 30, y: 23, w: W - 37, h: 9, text: '{{name}}', fontSize: 11, bold: true, color: '#f8fafc', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 30, y: 33, w: W - 37, h: 6, text: '{{role}}', fontSize: 7.5, color: '#c7d2fe', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 30, y: 40, w: W - 37, h: 6, text: '{{institution}}', fontSize: 6.5, color: '#818cf8', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 7, y: 52, w: 50, h: 6, text: '{{date}}', fontSize: 7, color: '#c7d2fe', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    T({ x: 7, y: 58, w: 60, h: 6, text: 'No: {{certno}}', fontSize: 6, color: '#6366f1', align: 'left', fontFamily: 'Arial, Helvetica, sans-serif' }),
    Q({ x: W - 24, y: 46, w: 18, h: 18, value: VERIFY_QR, color: '#e0e7ff' })
  ];
  PRESETS.push(t);
}

export function presetByIndex(i) {
  const src = PRESETS[i] || PRESETS[0];
  return JSON.parse(JSON.stringify(src));
}
