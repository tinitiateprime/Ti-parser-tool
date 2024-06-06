const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
// contextBridge.exposeInMainWorld('electronAPI', {
//   fetch: window.fetch
// });


function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers to read and write user data
ipcMain.handle('get-users', async () => {
  const data = fs.readFileSync(path.join(__dirname, 'users.json'));
  return JSON.parse(data);
});

ipcMain.handle('save-users', async (event, users) => {
  fs.writeFileSync(path.join(__dirname, 'users.json'), JSON.stringify(users, null, 2));
});

ipcMain.handle('check-admin', async (event, credentials) => {
  const data = fs.readFileSync(path.join(__dirname, 'admins.json'));
  const admins = JSON.parse(data);
  const admin = admins.find(admin => admin.username === credentials.username && admin.password === credentials.password);
  return admin !== undefined;
});

// Load configurations
const foldersConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'folders-structure.json'), 'utf8'));
const sharepointConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'sharepoint-config.json'), 'utf8'));

// IPC handlers to interact with JSON file
ipcMain.handle('read-clients', async () => {
  try {
    const data = fs.readFileSync('clients.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading clients.json:', error);
    return [];
  }
});

ipcMain.handle('write-client', async (event, client) => {
  try {
    let data = fs.readFileSync('clients.json', 'utf8');
    let clients = JSON.parse(data);
    clients.push(client);
    fs.writeFileSync('clients.json', JSON.stringify(clients, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to clients.json:', error);
    return false;
  }
});

ipcMain.handle('modify-client', async (event, client) => {
  try {
    let data = fs.readFileSync('clients.json', 'utf8');
    let clients = JSON.parse(data);
    const index = clients.findIndex(c => c.name === client.name);
    if (index !== -1) {
      clients[index] = client;
      fs.writeFileSync('clients.json', JSON.stringify(clients, null, 2), 'utf8');
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error modifying clients.json:', error);
    return false;
  }
});

async function createFolderInSharePoint(accessToken, parentFolderUrl, folderName) {
  const response = await fetch(`${sharepointConfig.siteUrl}/_api/web/folders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json;odata=verbose',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      '__metadata': { 'type': 'SP.Folder' },
      'ServerRelativeUrl': `${parentFolderUrl}/${folderName}`
    })
  });

  if (!response.ok) {
    console.error(`Error creating folder: ${folderName}`);
  }

  return response.ok;
}

async function saveClientToSharePoint(client) {
  const { siteUrl, clientId, clientSecret, tenantId } = sharepointConfig;

  const authResponse = await fetch(`https://accounts.accesscontrol.windows.net/${tenantId}/tokens/OAuth/2`, {
    method: 'POST',
    body: new URLSearchParams({
      'grant_type': 'client_credentials',
      'client_id': clientId,
      'client_secret': clientSecret,
      'resource': siteUrl
    })
  });

  const authData = await authResponse.json();
  const accessToken = authData.access_token;

  const clientFolderUrl = `${siteUrl}/Documents/${client.name}/${client.type}/${client.period}`;

  const sourceFolderCreated = await createFolderInSharePoint(accessToken, clientFolderUrl, foldersConfig.folders['source-folder']);
  const transformedFolderCreated = await createFolderInSharePoint(accessToken, clientFolderUrl, foldersConfig.folders['transformed-folder']);
  const auditedFolderCreated = await createFolderInSharePoint(accessToken, clientFolderUrl, foldersConfig.folders['audited-folder']);

  return sourceFolderCreated && transformedFolderCreated && auditedFolderCreated;
}

ipcMain.handle('save-client-to-sharepoint', async (event, client) => {
  try {
    const success = await saveClientToSharePoint(client);
    return success;
  } catch (error) {
    console.error('Error saving client to SharePoint:', error);
    return false;
  }
});