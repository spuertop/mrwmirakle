const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
require('./index')


function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        icon: path.join(__dirname, 'public/favicon.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    //mainWindow.setMenu(null);
    mainWindow.loadFile('index.html')
        //mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function() {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})