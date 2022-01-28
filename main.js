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

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
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

autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
});

autoUpdater.on('download-progress', (progress) => {
    const progressText = `Download speed: ${progress.bytesPerSecond} - Downloaded ${progress.percent}% (${progress.transferred} + '/' + ${progress.total} + )`;
    mainWindow.webContents.send('update_download_progress', progressText)
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.on('download-app-update', async () => {
    await autoUpdater.downloadUpdate();

    // mainWindow.webContents.send('update_downloading');
    // setTimeout(()=>{
    //     mainWindow.webContents.send('update_download_progress', 'Downloading 0');
    //     setTimeout(()=>{
    //         mainWindow.webContents.send('update_download_progress', 'Downloading final');
    //         // setTimeout(()=>mainWindow.webContents.send('update_downloaded'),2000)
    //     }, 5000)
    // }, 2000)
    // setTimeout(()=>mainWindow.webContents.send('update_downloaded'),5000)

    console.log('main | download-app-update downloaded');
})