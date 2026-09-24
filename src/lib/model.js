/** Sizes institutions actually print. */
export const SIZE_PRESETS = [
  { name: 'A4 landscape — certificate', w: 297, h: 210 },
  { name: 'A4 portrait — certificate', w: 210, h: 297 },
  { name: 'A5 landscape — certificate', w: 210, h: 148 },
  { name: 'A5 portrait — certificate', w: 148, h: 210 },
  { name: 'CR80 ID card — 85.6 x 54 mm', w: 85.6, h: 54 },
  { name: 'Event pass — 100 x 70 mm', w: 100, h: 70 }
];

/** CR80 cards laid out on A4 with cut marks — no card printer needed. */
export const CARD_SHEET = {
  pageW: 210, pageH: 297,
  cols: 2, rows: 5,
  marginLeft: 9.2, marginTop: 13.5,
  gapX: 5, gapY: 2.5,
  showCutMarks: true
};

export const FONTS = [
  'Georgia, serif',
  'Times New Roman, serif',
  'Garamond, serif',
  'Palatino Linotype, serif',
  'Arial, Helvetica, sans-serif',
  'Segoe UI, sans-serif',
  'Verdana, sans-serif',
  'Courier New, monospace'
];

export const URDU_FONT = '"Noto Nastaliq Urdu", "Jameel Noori Nastaleeq", Georgia, serif';

export const BARCODE_FORMATS = ['CODE128', 'EAN13', 'EAN8', 'UPC', 'CODE39', 'ITF14', 'MSI', 'pharmacode'];

let seq = 0;
export function newId(prefix = 'el') {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${seq}`;
}

export function createElement(type, template, side = 'front') {
  const cx = Math.max(2, template.widthMm * 0.1);
  const cy = Math.max(2, template.heightMm * 0.1);
  const common = { id: newId(type), type, side, x: +cx.toFixed(1), y: +cy.toFixed(1), rotate: 0 };

  switch (type) {
    case 'text':
      return {
        ...common,
        w: Math.min(template.widthMm - cx * 2, 60),
        h: 10,
        text: 'Text',
        fontSize: 12,
        fontFamily: FONTS[4],
        bold: false,
        italic: false,
        align: 'center',
        vAlign: 'middle',
        color: '#1e293b',
        lineHeight: 1.25,
        letterSpacing: 0,
        autoShrink: false,
        hideIfEmpty: false,
        rtl: false
      };

    case 'barcode':
      return {
        ...common,
        w: Math.min(template.widthMm - cx * 2, 45),
        h: Math.min(template.heightMm - cy * 2, 14),
        value: '{{certno}}',
        format: 'CODE128',
        showValue: true,
        fontSize: 14,
        barWidth: 2,
        barHeight: 60,
        lineColor: '#000000',
        hideIfEmpty: false
      };

    case 'qr':
      return {
        ...common,
        w: 20, h: 20,
        value: 'SLY1|{{certno}}|{{name}}|{{date}}|{{verify}}',
        ecl: 'M',
        margin: 0,
        color: '#000000'
      };

    case 'image':
      return { ...common, w: 20, h: 20, dataUrl: '', fit: 'contain' };

    case 'photo':
      return {
        ...common,
        w: 24, h: 30,
        radius: 0,
        fit: 'cover',
        borderColor: '#0f172a',
        borderWidth: 0.4
      };

    case 'signature':
      return {
        ...common,
        w: 40, h: 16,
        dataUrl: '',
        nameText: '{{signatory1_name}}',
        titleText: '{{signatory1_title}}',
        color: '#334155'
      };

    case 'rect':
      return {
        ...common,
        w: Math.min(template.widthMm - cx * 2, 40),
        h: 14,
        fill: 'transparent',
        borderColor: '#0f172a',
        borderWidth: 0.4,
        radius: 0
      };

    case 'line':
      return { ...common, w: Math.min(template.widthMm - cx * 2, 40), h: 0.4, color: '#0f172a' };

    default:
      throw new Error(`Unknown element type: ${type}`);
  }
}

export function blankTemplate(name = 'Untitled design', w = 297, h = 210) {
  return {
    id: null,
    name,
    widthMm: w,
    heightMm: h,
    background: '#ffffff',
    duplex: false,
    sheet: { enabled: false, ...CARD_SHEET, showOutline: false },
    elements: []
  };
}
