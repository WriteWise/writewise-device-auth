const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const { machineId, machineIdSync } = require('node-machine-id');
const { moveToApplications } = require('electron-lets-move');
const path = require('path')

let mainWindow;

if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('writewise-device-auth', process.execPath, [path.resolve(process.argv[1])])
    }
} else {
    app.setAsDefaultProtocolClient('writewise-device-auth')
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })

    // Create mainWindow, load the rest of the app, etc...
    app.whenReady().then(async () => {
        let machine_id = await machineId({ original: true }).catch((err) => { return err })
        ipcMain.handle('fetch-machine-id', async () => {
            return machine_id
        })
        createWindow()
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) createWindow()
        });
        // setTimeout(() => {
        //     shell.openExternal(`https://writewise.io/app/set-machine-id?device_id=${machine_id}`)
        //     setTimeout(() => {
        //         app.quit()
        //     }, 4000);
        // }, 10000);
    })

    app.on('open-url', async (event, url) => {
        let machine_id = await machineId({ original: true }).catch((err) => { return err })
        event.preventDefault()
        logEverywhere(url)
        const split_url = url.split("url=");
        logEverywhere(split_url)
        if (split_url.length !== 2) {
            dialog.showErrorBox('An error was encountered', `Could not fetch redirect url: ${url}`);
        } else {
            shell.openExternal(`${split_url[1]}?device_id=${machine_id}`)
            setTimeout(() => {
                app.quit()
            }, 4000);
        }

    })
}

app.on('ready', function () {
    moveToApplications(function (err, moved) {
        if (err) {
        }
        if (!moved) {
        }
    });
});

const createWindow = async () => {
    let win = new BrowserWindow({
        icon: path.join(__dirname, 'favicon.icns'),
        width: 400,
        height: 100,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.loadFile('index.html')
}
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('shell:open', () => {
    const pageDirectory = __dirname.replace('app.asar', 'app.asar.unpacked')
    const pagePath = path.join('file://', pageDirectory, 'index.html')
    shell.openExternal(pagePath)
})

function logEverywhere(s) {
    console.log(s)
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.executeJavaScript(`console.log("${s}")`)
    }
}
