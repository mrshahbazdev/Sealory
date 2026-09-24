/**
 * Batch photo matching.
 *
 * A folder of photos arrives named however the school happened to name it —
 * roll numbers, names, IMG_0001. Match each file's stem (name without
 * extension) against a chosen CSV column, with a normalisation pass that
 * tolerates case, spaces, dashes and trailing junk. The report is the point:
 * the admin sees exactly what did not match before printing, not after.
 */

function norm(v) {
  return String(v ?? '')
    .toLowerCase()
    .replace(/\.(png|jpe?g|webp|gif|bmp)$/i, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Looser key ignoring all separators — '2024-0417' == '2024 0417'. */
function squash(v) {
  return norm(v).replace(/\s+/g, '');
}

export function matchPhotos(files, rows, column) {
  const byStem = new Map();   // squashed stem -> file
  const byName = new Map();   // full normalised -> file
  for (const f of files) {
    const stem = f.replace(/\.[^.]+$/, '');
    const sq = squash(stem);
    if (!byStem.has(sq)) byStem.set(sq, f);
    const nm = norm(stem);
    if (!byName.has(nm)) byName.set(nm, f);
  }

  const results = rows.map((row, index) => {
    const cell = column ? row[column] : '';
    const sq = squash(cell);
    const nm = norm(cell);
    let file = byStem.get(sq) || byName.get(nm);

    // Fall back to containment: a photo named '2024-0417 ayesha' should still
    // match roll number 2024-0417 when no exact stem exists.
    if (!file && sq.length >= 4) {
      file = files.find((f) => squash(f.replace(/\.[^.]+$/, '')).startsWith(sq))
          || files.find((f) => squash(f.replace(/\.[^.]+$/, '')).includes(sq));
    }
    if (!file && nm.length >= 4) {
      file = files.find((f) => norm(f.replace(/\.[^.]+$/, '')).startsWith(nm));
    }

    return { index, cell, file: file || null };
  });

  const used = new Set(results.filter((r) => r.file).map((r) => r.file));
  const unmatchedFiles = files.filter((f) => !used.has(f));
  const matched = results.filter((r) => r.file).length;

  return { results, matched, missing: results.length - matched, unmatchedFiles };
}
