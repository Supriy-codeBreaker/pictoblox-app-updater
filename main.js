const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
autoUpdater.autoDownload = false;
let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.once('ready-to-show', async () => {
    if(app.isPackaged){
      autoUpdater.checkForUpdatesAndNotify();
    }
    else{
      console.log('ready-to-show | app not packaged!');
      await autoUpdater.checkForUpdates();
      // console.log('main | ready-to-show', result);
    }
    // setTimeout(()=>mainWindow.webContents.send('update_available'), 3000);
  });

  mainWindow.webContents.openDevTools();
}

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', (updateInfo) => {
  // mainWindow.webContents.executeJavaScript(`console.log('main | event update-available', ${updateInfo});`);
  console.log('main | event update-available', updateInfo);
  mainWindow.webContents.send('update_available', updateInfo.version);
});

autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
});

autoUpdater.on('download-progress', (progress) => {
    // mainWindow.webContents.executeJavaScript(`console.log('main | event download-progress', ${progress});`);
    const progressText = `Downloaded ${Math.round(progress.percent)}%`;
    mainWindow.webContents.send('update_download_progress', progressText)
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.on('download-app-update', async () => {
    mainWindow.webContents.send('update_downloading');
    await autoUpdater.downloadUpdate();

    // setTimeout(()=>{
    //     mainWindow.webContents.send('update_download_progress', 'Downloading 0');
    //     setTimeout(()=>{
    //         mainWindow.webContents.send('update_download_progress', 'Downloading final');
    //         setTimeout(()=>mainWindow.webContents.send('update_downloaded'),2000)
    //     }, 5000)
    // }, 2000)

    console.log('main | download-app-update downloaded');
})