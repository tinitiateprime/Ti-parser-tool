// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const { ConfidentialClientApplication } = require('@azure/msal-node');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
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


const TENANT_ID = '8e8212a7-0509-4cde-939a-63b98c2785e2';
const CLIENT_ID = '9ae501c6-9f95-4296-8f17-c9c991fbee58';
const CLIENT_SECRET = 'NDf8Q~KHXZKsea~tDdRauKPrYHHNQmQL5v4tDc~a';
const SITE_ID = '6177bfa8-cb90-4913-aec7-e3c48989cd8b';
const DRIVE_ID = 'b!qL93YZDLE0mux-PEiYnNi-ETCISxJeJHkl1nLfsk5YG05_3vfToaTLKCyhWafbNV';


async function getAccessToken() {
  const authority = `https://login.microsoftonline.com/${TENANT_ID}`;
  const app = new ConfidentialClientApplication({
      auth: {
          clientId: CLIENT_ID,
          authority,
          clientSecret: CLIENT_SECRET,
      },
  });
  console.log('line 14 auth.js ' + app)
  const result = await app.acquireTokenByClientCredential({
      scopes: ["https://graph.microsoft.com/.default"],
  });

  if (result && result.accessToken) {
    console.log('access grated')
      return result.accessToken;
  } else {
    console.log('access denied')
      throw new Error('Could not obtain access token');
  }
}



// IPC listener for fetching folders
ipcMain.handle('fetch-folders', async (event, username) => {
  try {
    const accessToken = await getAccessToken();
    //console.log(event)
    
        const folderPath ='/All_Customers/'+username; // Change to your output folder path in the document library
         const listFolderUrl = `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/drives/${DRIVE_ID}/root:${folderPath}:/children`;
         //console.log(listFolderUrl)
          const response = await axios.get(listFolderUrl, {
              headers: {
                  'Authorization': `Bearer ${accessToken}`
              }
          });
        
        let files = []
       // console.log(response.data.value.length)
        // if(response.data.error.code =='itemNotFound'){
        //     res.send({ error : 'Item not found'})
        // }
        // for(let i=0;i<response.data.value.length;i++){
        //    // console.log('i'+i)
        //     files.push( response.data.value[i].name)
        // }
        
        // console.log(files)
        // res.json(files);
      
        
        const data = response.data.value;
       // console.log(data)
       const folders = data.map(folder => folder);


          //console.log('nMWWE : '+ JSON.stringify({folders}))
          folders.forEach(folder => {
           // console.log('folder_nmae : '+folder.name)
            files.push(folder.name)
            //console.log('FILES : '+files)
          })
       return (files)
  } catch (error) {
    console.error(error);
    return [];
  }
});


ipcMain.handle('fetch-files', async (event, username,folder) => {
try {
  const accessToken = await getAccessToken();

let folderPath = '/All_Customers/'+username+'/'+folder+'/Input'; 
let listFolderUrl = `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/drives/${DRIVE_ID}/root:${folderPath}:/children`;


  const inputResponse = await axios.get(listFolderUrl, {
      headers: {
          'Authorization': `Bearer ${accessToken}`
      }
  }); 
  console.log(inputResponse)
   folderPath = '/All_Customers/'+username+'/'+folder+'/Output'; 
    listFolderUrl = `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/drives/${DRIVE_ID}/root:${folderPath}:/children`;

  const outputResponse = await axios.get(listFolderUrl, {
      headers: {
          'Authorization': `Bearer ${accessToken}`
      }
  });

  // if (!inputResponse.ok || !outputResponse.ok) {
  //     throw new Error('Failed to fetch files');
  //   }
let inputFiles1 = []
let outputFiles1 = []
    const inputData =inputResponse.data.value;
    const outputData = outputResponse.data.value;
     const inputFiles = inputData.map(file => file);
     const outputFiles = outputData.map(file => file);

     console.log(inputFiles.length)
    inputFiles.forEach(folder => {
      //console.log('folder_nmae : '+folder.name)
      inputFiles1.push(folder.name)
       //console.log('FILES : '+files)
     })
    outputFiles.forEach(folder => {
      // console.log('folder_nmae : '+folder.name)
      outputFiles1.push(folder.name)
       //console.log('FILES : '+files)
     })
     console.log('inputFiles :'+inputFiles1)
     console.log('outputFiles :'+outputFiles1)

    return ({'inputFiles': inputFiles1 ,'outputFiles' : outputFiles1})
}
catch (error) {
  console.error(error);
  return [];
}
});