# Sealory

Offline certificate and ID-card batch printer for Windows. Design once, drop in
a CSV or Excel file of recipients, and print or export the whole batch — merged
PDF, per-person `NAME-CERTNO.pdf` files, or straight to the printer.

## Features

- Certificate sizes: A4/A5 landscape & portrait, CR80 ID card (85.6 × 54 mm),
  event pass, or any custom mm size — plus an A4 sheet mode that packs cards
  per page with cut marks.
- Duplex designs: front + back per card, in matching order for card printers
  and flip-and-reload sheets.
- `{{field}}` engine — `{{certno}}`, `{{verify}}`, `{{date}}`, `{{serial}}`,
  `{{= maths }}`, and `|transforms` — resolved per recipient.
- Batch photo matching: pick a photo folder, match file names to any column,
  see the report before printing, silhouette placeholder for misses.
- Verifiable certificates: QR carrying cert no + name + date + HMAC signature
  from your institution's secret key. Verify in-app (Verify tab) or hand out a
  CSV / self-contained HTML verification page. Proves "issued by this
  institution and not edited" — no blockchain, no server.
- Issue register: every run is logged with a row snapshot — search, reprint
  one certificate, or export the register.
- 9 built-in designs: formal / participation / achievement certificates,
  bilingual English+Urdu training certificate, sports and kids certificates,
  employee ID and membership cards, event pass.
- Fully offline: no accounts, no network calls, strict CSP.

## Development

```bash
npm install
npm run dev      # Vite + Electron
npm run dist:win # Windows installer + AppX (Windows only)
```

## How it works

Elements render to absolute-mm HTML (`src/lib/certHtml.js`). What you see is
what prints — the same document goes to the canvas preview and to a hidden
Electron window for `printToPDF`. Signatures are computed in the main process
(`electron/ipc/seal.cjs`); the issue register lives in `userData/register/`.
