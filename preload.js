// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  fetchFolders: (username) => ipcRenderer.invoke('fetch-folders', username),
  fetchFiles: (username,folder) => ipcRenderer.invoke('fetch-files', username,folder),
});
