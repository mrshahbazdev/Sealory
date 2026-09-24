const { contextBridge, ipcRenderer } = require('electron');

// Explicit allowlist. No generic invoke() escape hatch.
contextBridge.exposeInMainWorld('api', {
  print: {
    listPrinters: () => ipcRenderer.invoke('print:listPrinters'),
    toPDF: (payload) => ipcRenderer.invoke('print:toPDF', payload),
    toPDFBuffer: (payload) => ipcRenderer.invoke('print:toPDFBuffer', payload),
    direct: (payload) => ipcRenderer.invoke('print:direct', payload)
  },
  templates: {
    list: () => ipcRenderer.invoke('templates:list'),
    load: (id) => ipcRenderer.invoke('templates:load', id),
    save: (tpl) => ipcRenderer.invoke('templates:save', tpl),
    remove: (id) => ipcRenderer.invoke('templates:remove', id),
    duplicate: (id) => ipcRenderer.invoke('templates:duplicate', id)
  },
  seal: {
    hmac: (key, payload) => ipcRenderer.invoke('seal:hmac', { key, payload }),
    newKey: () => ipcRenderer.invoke('seal:newKey')
  },
  photos: {
    pickFolder: () => ipcRenderer.invoke('photos:pickFolder'),
    listFolder: (folder) => ipcRenderer.invoke('photos:listFolder', { folder }),
    read: (file) => ipcRenderer.invoke('photos:read', { file })
  },
  settings: {
    load: () => ipcRenderer.invoke('settings:load'),
    save: (s) => ipcRenderer.invoke('settings:save', s)
  },
  register: {
    load: () => ipcRenderer.invoke('register:load'),
    record: (run, issued) => ipcRenderer.invoke('register:record', { run, issued })
  },
  export: {
    savePDF: (buffer, defaultName) => ipcRenderer.invoke('export:savePDF', { buffer, defaultName }),
    savePDFFiles: (files) => ipcRenderer.invoke('export:savePDFFiles', { files }),
    saveText: (text, defaultName, filters) => ipcRenderer.invoke('export:saveText', { text, defaultName, filters })
  },
  app: {
    version: () => ipcRenderer.invoke('app:version'),
    openFile: (opts) => ipcRenderer.invoke('app:openFile', opts || {}),
    openUserData: () => ipcRenderer.invoke('app:openUserData')
  }
});
