/**
 * Certificate numbers + verification signatures.
 *
 * Every issued row gets __certno (from the institution's number series),
 * __date (issue date) and __verify — an HMAC-SHA256 signature truncated to 20
 * hex chars, computed in the main process over the institution's secret key.
 * The QR on the certificate carries all of it, so anyone with the free app
 * can check it — and no server is involved anywhere.
 *
 * It proves the certificate was issued by that institution and not edited.
 * It is not a blockchain, and the UI should never call it one.
 */

export function certNo(series, index) {
  const n = (series.start || 1) + index;
  const padded = String(n).padStart(series.pad || 4, '0');
  return `${series.prefix || 'CERT-'}${padded}`;
}

function dateStr(d = new Date()) {
  const p = (x) => String(x).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function holderName(row) {
  if (!row) return '';
  const key = Object.keys(row).find((k) => /name|student|holder/i.test(k));
  return key ? String(row[key]) : String(row[Object.keys(row)[0]] ?? '');
}

/**
 * Attach __certno, __date, __verify and the signature payload to every row.
 * Returns the enriched rows — the QR just reads them as columns.
 */
export async function signRows(rows, settings) {
  const series = settings?.series || { prefix: 'CERT-', pad: 4, start: 1 };
  const key = settings?.secretKey || '';
  const date = dateStr();
  const nameCol = settings?.nameColumn || null;

  // Institution + signatories resolve like ordinary columns on every row.
  const sigFields = {};
  (settings?.signatories || []).forEach((sg, i) => {
    sigFields[`signatory${i + 1}_name`] = sg.name || '';
    sigFields[`signatory${i + 1}_title`] = sg.title || '';
  });
  const shared = {
    institution: settings?.institution || '',
    institution_urdu: settings?.institution_urdu || '',
    ...sigFields
  };

  const out = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] || {};
    const cn = certNo(series, i);
    const name = nameCol && row[nameCol] ? String(row[nameCol]) : holderName(row);
    const payload = `${cn}|${name}|${date}`;
    const verify = key ? await window.api.seal.hmac(key, payload) : '';
    out.push({ ...shared, ...row, certno: cn, verify, __certno: cn, __date: date, __verify: verify, __holder: name, __sigPayload: payload });
  }
  return out;
}

/** Check a scanned/pasted QR payload: SLY1|certno|name|date|sig */
export async function verifyPayload(text, secretKey) {
  const parts = String(text || '').trim().split('|');
  if (parts.length < 5 || parts[0] !== 'SLY1') {
    return { ok: false, reason: 'Not a Sealory verification code' };
  }
  const [, cn, name, date, sig] = parts;
  if (!secretKey) {
    return { ok: false, reason: 'No secret key in Settings — cannot verify', cn, name, date, sig };
  }
  const expect = await window.api.seal.hmac(secretKey, `${cn}|${name}|${date}`);
  return expect === sig
    ? { ok: true, cn, name, date, sig }
    : { ok: false, reason: 'Signature does not match — altered or issued by a different key', cn, name, date, sig };
}

/** Exported verification list — CSV the institution can hand out. */
export function verificationCSV(issued) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = 'certno,name,date,signature\n';
  return head + issued.map((i) => [i.certno, i.name, i.date, i.sig].map(esc).join(',')).join('\n');
}

/** Self-contained HTML verification page for the institution's own website. */
export function verificationHTML(issued, institution) {
  const rows = issued
    .map((i) => `<tr><td>${esc(i.certno)}</td><td>${esc(i.name)}</td><td>${esc(i.date)}</td><td class="s">${esc(i.sig)}</td></tr>`)
    .join('\n');
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(institution || 'Institution')} — Certificate verification</title>
<style>
 body{font-family:Georgia,serif;max-width:760px;margin:40px auto;padding:0 16px;color:#1e293b}
 h1{font-size:1.4rem} p{color:#475569}
 table{width:100%;border-collapse:collapse;font-size:.9rem}
 td,th{border-bottom:1px solid #e2e8f0;padding:6px 8px;text-align:left}
 th{color:#64748b;font-size:.75rem;text-transform:uppercase;letter-spacing:.05em}
 .s{font-family:monospace;font-size:.78rem;color:#64748b}
 input{width:100%;box-sizing:border-box;padding:8px;font-size:1rem;margin:12px 0}
 footer{margin-top:28px;font-size:.75rem;color:#94a3b8}
</style></head><body>
<h1>Certificate verification — ${esc(institution || 'Institution')}</h1>
<p>Search a certificate number or holder name. A match proves the certificate was
issued by ${esc(institution || 'this institution')} and has not been edited.</p>
<input id="q" placeholder="Certificate number or name" oninput="f()" autofocus>
<table><thead><tr><th>Certificate #</th><th>Issued to</th><th>Date</th><th>Signature</th></tr></thead>
<tbody id="t">${rows}</tbody></table>
<footer>Generated by Sealory — offline certificate printer. No data is sent anywhere.</footer>
<script>
function f(){var q=document.getElementById('q').value.toLowerCase();
document.querySelectorAll('#t tr').forEach(function(r){
r.style.display=r.textContent.toLowerCase().includes(q)?'':'none'})}
</script></body></html>`;
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
