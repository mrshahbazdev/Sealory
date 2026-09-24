const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ipcMain, app, dialog, BrowserWindow } = require('electron');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp']);
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.bmp': 'image/bmp' };

function registerFile() {
  const dir = path.join(app.getPath('userData'), 'register');
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'issued.json');
}

function settingsFile() {
  const dir = path.join(app.getPath('userData'), 'settings');
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'settings.json');
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writeJsonAtomic(file, data) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

function registerSealIPC() {
  // ---- signing -------------------------------------------------------------
  // The institution's secret key lives in settings and signs every issued
  // certificate: sig = HMAC-SHA256(key, certno|name|date)[..16]. Verification
  // recomputes it — no server anywhere.
  ipcMain.handle('seal:hmac', (_e, { key, payload }) =>
    crypto.createHmac('sha256', String(key || '')).update(String(payload)).digest('hex').slice(0, 20)
  );

  ipcMain.handle('seal:newKey', () => crypto.randomBytes(24).toString('hex'));

  // ---- photo folder ---------------------------------------------------------
  ipcMain.handle('photos:pickFolder', async () => {
    const win = BrowserWindow.getAllWindows()[0];
    const res = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
      title: 'Choose the folder of recipient photos'
    });
    if (res.canceled || !res.filePaths.length) return null;
    const folder = res.filePaths[0];
    const files = fs.readdirSync(folder)
      .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
      .sort();
    return { folder, files };
  });

  ipcMain.handle('photos:listFolder', (_e, { folder }) => {
    try {
      return fs.readdirSync(folder)
        .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
        .sort();
    } catch {
      return null;
    }
  });

  ipcMain.handle('photos:read', (_e, { file }) => {
    const ext = path.extname(file).toLowerCase();
    if (!IMAGE_EXTS.has(ext)) return null;
    try {
      return `data:${MIME[ext] || 'image/png'};base64,${fs.readFileSync(file).toString('base64')}`;
    } catch {
      return null;
    }
  });

  // ---- institution settings -------------------------------------------------
  ipcMain.handle('settings:load', () => readJson(settingsFile(), null));
  ipcMain.handle('settings:save', (_e, settings) => {
    writeJsonAtomic(settingsFile(), settings);
    return { success: true };
  });

  // ---- issue register --------------------------------------------------------
  // Every issued certificate is logged with a snapshot of the row, so a
  // reprint years later reproduces exactly what went out.
  ipcMain.handle('register:load', () => readJson(registerFile(), { runs: [], issued: [] }));

  ipcMain.handle('register:record', (_e, { run, issued }) => {
    const reg = readJson(registerFile(), { runs: [], issued: [] });
    reg.runs.push(run);
    reg.issued.push(...issued);
    writeJsonAtomic(registerFile(), reg);
    return { success: true, count: reg.issued.length };
  });

  // ---- exports ---------------------------------------------------------------
  ipcMain.handle('export:savePDF', async (_e, { buffer, defaultName }) => {
    const win = BrowserWindow.getAllWindows()[0];
    const res = await dialog.showSaveDialog(win, {
      title: 'Save PDF',
      defaultPath: defaultName || 'certificates.pdf',
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });
    if (res.canceled || !res.filePath) return { success: false, cancelled: true };
    fs.writeFileSync(res.filePath, Buffer.from(buffer));
    return { success: true, filePath: res.filePath };
  });

  ipcMain.handle('export:savePDFFiles', async (_e, { files }) => {
    const win = BrowserWindow.getAllWindows()[0];
    const res = await dialog.showOpenDialog(win, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'Choose a folder for the per-person PDFs'
    });
    if (res.canceled || !res.filePaths.length) return { success: false, cancelled: true };
    const dir = res.filePaths[0];
    const written = [];
    for (const f of files) {
      const safe = String(f.name).replace(/[\\/:*?"<>|]/g, '-').slice(0, 120) || 'certificate';
      const target = path.join(dir, `${safe}.pdf`);
      fs.writeFileSync(target, Buffer.from(f.buffer));
      written.push(target);
    }
    return { success: true, dir, count: written.length };
  });

  ipcMain.handle('export:saveText', async (_e, { text, defaultName, filters }) => {
    const win = BrowserWindow.getAllWindows()[0];
    const res = await dialog.showSaveDialog(win, {
      title: 'Save file',
      defaultPath: defaultName || 'export.csv',
      filters: filters || [{ name: 'All files', extensions: ['*'] }]
    });
    if (res.canceled || !res.filePath) return { success: false, cancelled: true };
    fs.writeFileSync(res.filePath, text, 'utf8');
    return { success: true, filePath: res.filePath };
  });
}

module.exports = { registerSealIPC };
