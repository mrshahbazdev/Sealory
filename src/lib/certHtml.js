import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { resolve, resolvesEmpty, referencedColumns } from './fields.js';
import { fitFontSize } from './textfit.js';

/**
 * Template + data row -> HTML, in millimetres. Canvas preview and printed
 * output both go through here, so what you see is what prints.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

export function bind(value, ctx) {
  const context = ctx && ('row' in ctx || 'index' in ctx) ? ctx : { row: ctx, index: 0 };
  return resolve(value, context);
}

export function usedColumns(elements) {
  return referencedColumns(elements);
}

export async function barcodeSVG(value, opts = {}) {
  const node = document.createElementNS(SVG_NS, 'svg');
  const text = String(value ?? '').trim();
  if (!text) return placeholderSVG('no value');

  let valid = true;
  try {
    JsBarcode(node, text, {
      format: opts.format || 'CODE128',
      width: opts.barWidth ?? 2,
      height: opts.barHeight ?? 60,
      displayValue: opts.showValue !== false,
      fontSize: opts.fontSize ?? 16,
      textMargin: 2,
      margin: 0,
      lineColor: opts.lineColor || '#000000',
      background: 'transparent',
      valid: (isValid) => { valid = isValid; }
    });
  } catch (err) {
    return placeholderSVG(/valid/i.test(err.message) ? `invalid ${opts.format || 'CODE128'}` : 'barcode error');
  }

  if (!valid || !node.childNodes.length) return placeholderSVG(`invalid ${opts.format || 'CODE128'}`);
  node.setAttribute('preserveAspectRatio', 'none');
  node.setAttribute('width', '100%');
  node.setAttribute('height', '100%');
  return new XMLSerializer().serializeToString(node);
}

function placeholderSVG(label) {
  return `<svg xmlns="${SVG_NS}" viewBox="0 0 200 60" preserveAspectRatio="none" width="100%" height="100%">
    <rect x="0" y="0" width="200" height="60" fill="#fef2f2" stroke="#dc2626" stroke-dasharray="4 3"/>
    <text x="100" y="34" font-family="sans-serif" font-size="14" fill="#dc2626" text-anchor="middle">${escapeHtml(label)}</text>
  </svg>`;
}

export async function qrSVG(value, opts = {}) {
  const text = String(value ?? '').trim();
  if (!text) return placeholderSVG('no value');
  try {
    return await QRCode.toString(text, {
      type: 'svg',
      margin: opts.margin ?? 0,
      errorCorrectionLevel: opts.ecl || 'M',
      color: { dark: opts.color || '#000000', light: '#0000' }
    });
  } catch {
    return placeholderSVG('QR error');
  }
}

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Grey silhouette shown when a row has no matched photo — keeps the run intact. */
function silhouetteSVG() {
  return `<svg xmlns="${SVG_NS}" viewBox="0 0 48 60" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <rect width="48" height="60" fill="#e2e8f0"/>
    <circle cx="24" cy="21" r="10" fill="#94a3b8"/>
    <path d="M6 60 C6 42 42 42 42 60 Z" fill="#94a3b8"/>
  </svg>`;
}

/** One element -> absolutely positioned HTML, in mm. */
export async function elementHTML(el, ctx) {
  const row = ctx?.row ?? null;

  if (el.hidden) return '';

  if (el.hideIfEmpty && (el.type === 'text' || el.type === 'barcode' || el.type === 'qr')) {
    if (resolvesEmpty(el.type === 'text' ? el.text : el.value, ctx)) return '';
  }

  const base =
    `position:absolute;left:${el.x}mm;top:${el.y}mm;width:${el.w}mm;height:${el.h}mm;` +
    (el.rotate ? `transform:rotate(${el.rotate}deg);transform-origin:center center;` : '') +
    'box-sizing:border-box;overflow:hidden;';

  if (el.type === 'text') {
    const content = bind(el.text, ctx);
    const size = el.autoShrink ? fitFontSize(el, content) : (el.fontSize || 10);
    const align = el.align || 'left';
    const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
    const vAlign = el.vAlign === 'middle' ? 'center' : el.vAlign === 'bottom' ? 'flex-end' : 'flex-start';
    const style = base +
      `display:flex;align-items:${vAlign};justify-content:${justify};` +
      `font-family:${el.fontFamily || 'Arial, Helvetica, sans-serif'};` +
      `font-size:${size}pt;` +
      `font-weight:${el.bold ? 700 : 400};` +
      `font-style:${el.italic ? 'italic' : 'normal'};` +
      `color:${el.color || '#000000'};` +
      `text-align:${align};line-height:${el.lineHeight || 1.2};` +
      `letter-spacing:${el.letterSpacing || 0}mm;` +
      'white-space:pre-wrap;word-break:break-word;' +
      (el.rtl ? 'direction:rtl;' : '');
    return `<div style="${style}">${escapeHtml(content)}</div>`;
  }

  if (el.type === 'barcode') {
    const svg = await barcodeSVG(bind(el.value, ctx), el);
    return `<div style="${base}display:flex;align-items:center;justify-content:center;">${svg}</div>`;
  }

  if (el.type === 'qr') {
    const svg = await qrSVG(bind(el.value, ctx), el);
    return `<div style="${base}display:flex;align-items:center;justify-content:center;">${svg}</div>`;
  }

  if (el.type === 'image') {
    if (!el.dataUrl) return `<div style="${base}border:1px dashed #94a3b8;"></div>`;
    return `<div style="${base}"><img src="${el.dataUrl}" style="width:100%;height:100%;object-fit:${el.fit || 'contain'};" /></div>`;
  }

  if (el.type === 'photo') {
    const src = ctx?.photos?.[ctx.index];
    const inner = src
      ? `<img src="${src}" style="width:100%;height:100%;object-fit:${el.fit || 'cover'};" />`
      : silhouetteSVG();
    const style = base +
      `border:${el.borderWidth ?? 0}mm solid ${el.borderColor || '#0f172a'};` +
      `border-radius:${el.radius || 0}mm;`;
    return `<div style="${style}">${inner}</div>`;
  }

  if (el.type === 'signature') {
    const name = bind(el.nameText || '', ctx);
    const title = bind(el.titleText || '', ctx);
    const img = el.dataUrl
      ? `<img src="${el.dataUrl}" style="height:${Math.max(4, el.h - 8)}mm;object-fit:contain;display:block;margin:0 auto;" />`
      : `<div style="height:${Math.max(4, el.h - 8)}mm;"></div>`;
    const style = base + 'display:flex;flex-direction:column;justify-content:flex-end;text-align:center;';
    return `<div style="${style}">${img}` +
      `<div style="border-top:0.3mm solid ${el.color || '#334155'};font-family:Georgia,serif;font-size:8pt;font-weight:700;color:${el.color || '#334155'};padding-top:0.8mm;">${escapeHtml(name)}</div>` +
      `<div style="font-family:Georgia,serif;font-size:6.5pt;color:${el.color || '#64748b'};">${escapeHtml(title)}</div></div>`;
  }

  if (el.type === 'rect') {
    const style = base +
      `background:${el.fill || 'transparent'};` +
      `border:${el.borderWidth ?? 0.3}mm solid ${el.borderColor || '#000000'};` +
      `border-radius:${el.radius || 0}mm;`;
    return `<div style="${style}"></div>`;
  }

  if (el.type === 'line') {
    return `<div style="${base}background:${el.color || '#000000'};"></div>`;
  }

  return '';
}

/** Elements of one side of one item, inside a fixed-size page div. */
export async function itemHTML(template, row, index, side, ctxExtra = {}) {
  const ctx = { row, index, ...ctxExtra };
  const els = (template.elements || []).filter((el) => (el.side || 'front') === side);
  const parts = await Promise.all(els.map((el) => elementHTML(el, ctx)));
  return `<div class="item">${parts.join('')}</div>`;
}

/** Expand rows into the flat list of items a run will produce. */
export function expandRows(rows, range) {
  let list = rows && rows.length ? rows : [null];
  if (range && range.mode === 'current' && rows.length) {
    list = [rows[Math.min(Math.max(0, range.index || 0), rows.length - 1)]];
  } else if (range && range.mode === 'range' && rows.length) {
    const from = Math.max(1, parseInt(range.from, 10) || 1);
    const to = Math.min(rows.length, parseInt(range.to, 10) || rows.length);
    list = rows.slice(from - 1, to);
  }
  return list;
}

const BASE_CSS = (template) => `
  html, body { margin: 0; padding: 0; background: #fff; }
  .item {
    position: relative;
    width: ${template.widthMm}mm;
    height: ${template.heightMm}mm;
    overflow: hidden;
    background: ${template.background || '#ffffff'};
    box-sizing: border-box;
  }
  svg { display: block; }
`;

/** One item per page — certificates, or individual cards for a card printer. */
async function itemDocument(template, list, ctxExtra) {
  const pages = [];
  for (let i = 0; i < list.length; i++) {
    pages.push(await itemHTML(template, list[i], i, 'front', ctxExtra));
    if (template.duplex) pages.push(await itemHTML(template, list[i], i, 'back', ctxExtra));
  }

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  @page { size: ${template.widthMm}mm ${template.heightMm}mm; margin: 0; }
  ${BASE_CSS(template)}
  .item { page-break-after: always; break-after: page; }
  .item:last-child { page-break-after: auto; break-after: auto; }
</style>
</head><body>
${pages.join('\n')}
</body></html>`;
}

/**
 * Many cards per A4 sheet with cut marks. Duplex sheets print fronts on one
 * set of sheets then backs on the next, in the same grid order, so flipping
 * the stack lines them up.
 */
async function sheetDocument(template, list, ctxExtra) {
  const s = template.sheet;
  const perPage = Math.max(1, s.cols * s.rows);
  const sides = template.duplex ? ['front', 'back'] : ['front'];
  const pageHTML = [];

  for (const side of sides) {
    for (let i = 0; i < list.length; i += perPage) {
      const slice = list.slice(i, i + perPage);
      const cells = [];
      for (let j = 0; j < slice.length; j++) {
        const col = j % s.cols;
        const row = Math.floor(j / s.cols);
        const x = s.marginLeft + col * (template.widthMm + s.gapX);
        const y = s.marginTop + row * (template.heightMm + s.gapY);
        const inner = await itemHTML(template, slice[j], i + j, side, ctxExtra);
        cells.push(`<div class="cell" style="left:${x.toFixed(3)}mm;top:${y.toFixed(3)}mm;">${inner}</div>`);
        if (s.showCutMarks) {
          const cw = template.widthMm, ch = template.heightMm;
          const m = 2;
          cells.push(
            `<div class="cut" style="left:${(x - m).toFixed(3)}mm;top:${y.toFixed(3)}mm;width:${m}mm;height:0.1mm;"></div>` +
            `<div class="cut" style="left:${(x + cw + 0.2).toFixed(3)}mm;top:${y.toFixed(3)}mm;width:${m}mm;height:0.1mm;"></div>` +
            `<div class="cut" style="left:${(x - m).toFixed(3)}mm;top:${(y + ch).toFixed(3)}mm;width:${m}mm;height:0.1mm;"></div>` +
            `<div class="cut" style="left:${(x + cw + 0.2).toFixed(3)}mm;top:${(y + ch).toFixed(3)}mm;width:${m}mm;height:0.1mm;"></div>` +
            `<div class="cut" style="left:${x.toFixed(3)}mm;top:${(y - m).toFixed(3)}mm;width:0.1mm;height:${m}mm;"></div>` +
            `<div class="cut" style="left:${x.toFixed(3)}mm;top:${(y + ch + 0.2).toFixed(3)}mm;width:0.1mm;height:${m}mm;"></div>` +
            `<div class="cut" style="left:${(x + cw).toFixed(3)}mm;top:${(y - m).toFixed(3)}mm;width:0.1mm;height:${m}mm;"></div>` +
            `<div class="cut" style="left:${(x + cw).toFixed(3)}mm;top:${(y + ch + 0.2).toFixed(3)}mm;width:0.1mm;height:${m}mm;"></div>`
          );
        }
      }
      pageHTML.push(`<div class="sheet">${cells.join('')}</div>`);
    }
  }

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  @page { size: ${s.pageW}mm ${s.pageH}mm; margin: 0; }
  ${BASE_CSS(template)}
  .sheet {
    position: relative;
    width: ${s.pageW}mm;
    height: ${s.pageH}mm;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
  }
  .sheet:last-child { page-break-after: auto; break-after: auto; }
  .cell { position: absolute; }
  .cut { position: absolute; background: #94a3b8; }
  ${s.showOutline ? '.cell { outline: 0.1mm dashed #cbd5e1; }' : ''}
</style>
</head><body>
${pageHTML.join('\n')}
</body></html>`;
}

export async function documentHTML(template, rows, range, ctxExtra = {}) {
  const list = expandRows(rows, range);
  return template.sheet?.enabled
    ? sheetDocument(template, list, ctxExtra)
    : itemDocument(template, list, ctxExtra);
}

/** Single-item document — used by per-person file export. */
export async function singleDocument(template, row, index, ctxExtra = {}) {
  return documentHTML(template, [row], { mode: 'current', index }, ctxExtra);
}

export function countPages(template, rows, range) {
  const n = expandRows(rows, range).length;
  const sides = template.duplex ? 2 : 1;
  if (!template.sheet?.enabled) return n * sides;
  const perPage = Math.max(1, template.sheet.cols * template.sheet.rows);
  return Math.ceil(n / perPage) * sides;
}

export function countItems(rows, range) {
  return expandRows(rows, range).length;
}
