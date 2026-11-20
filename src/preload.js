const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('visio', {
  getData: () => ipcRenderer.invoke('data:get'),
  saveLinks: (links) => ipcRenderer.invoke('links:save', links),
  setSettings: (s) => ipcRenderer.invoke('settings:set', s),
  meetingActive: (b) => ipcRenderer.invoke('meeting:active', b),
  logout: () => ipcRenderer.invoke('session:logout'),
  readClipboard: () => ipcRenderer.invoke('clipboard:read'),
  openExternal: (u) => ipcRenderer.invoke('open-external', u),
  onPickSource: (fn) => ipcRenderer.on('pick-source', (_e, list) => fn(list)),
  sourcePicked: (id, audio) => ipcRenderer.send('source-picked', id, audio),
  onOpenUrl: (fn) => ipcRenderer.on('open-url', (_e, u) => fn(u)),
  localVersions: () => ipcRenderer.invoke('versions:local'),
  checkVersions: () => ipcRenderer.invoke('versions:check'),
  onVersions: (fn) => ipcRenderer.on('versions:result', (_e, r) => fn(r)),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  onUpdateProgress: (fn) => ipcRenderer.on('update:progress', (_e, p) => fn(p)),
  getChangelog: () => ipcRenderer.invoke('changelog:get')
});
