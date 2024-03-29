const { nativeTheme } = require('electron')
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron/main')
const path = require('node:path')
const fs = require('fs')
const { writeFile, readFile } = require('node:fs')

let win

const createWindow = () => {

    nativeTheme.themeSource = 'dark'

    win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: `${__dirname}/src/img.png`,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    const menuPersonalizado = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menuPersonalizado)

    win.loadFile(`${__dirname}/src/index.html`)
}

const aboutWindow = () => {
    const winAbout = new BrowserWindow({
        width: 320,
        height: 180,
        resizable: false,
        autoHideMenuBar: true,
        icon: `${__dirname}/src/img.png`

    })
    winAbout.loadFile(`${__dirname}/src/sobre.html`)
}

app.whenReady().then(() => {
    createWindow()
    novoArquivo()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

const menuTemplate = [
    {
        label: 'Arquivo',
        submenu: [
            {
                label: 'Novo',
                accelerator: 'CmdOrCtrl+N',
                click: () => novoArquivo()
            },
            {
                label: 'Abrir',
                accelerator: 'CmdOrCtrl+O',
                click: () => abrirArquivo()
            },
            {
                label: 'Salvar',
                accelerator: 'CmdOrCtrl+S',
                click: () => salvar()
            },
            {
                label: 'Salvar como',
                accelerator: 'CmdOrCtrl+Shift+S',
                click: () => salvarComo()
            },
            {
                type: 'separator'
            },
            {
                label: 'Sair',
                accelerator: 'Alt+F4',
                click: () => app.quit()
            }
        ]
    },
    {
        label: 'Editar',
        submenu: [
            {
                label: 'Desfazer',
                role: 'undo'
            },
            {
                label: 'Refazer',
                role: 'redo'
            },
            {
                type: 'separator',
            },
            {
                label: 'Recortar',
                role: 'cut'
            },
            {
                label: 'Copiar',
                role: 'copy'
            },
            {
                label: 'Colar',
                role: 'paste'
            }
        ]
    },
    {
        label: 'Exibir',
        submenu: [
            {
                label: 'Recarregar',
                role: 'reload'
            },
            {
                label: 'Ferramentas do Desenvolvedor',
                role: 'toggleDevTools'
            },
            {
                type: 'separator'
            },
            {
                label: 'Aplicar Zoom',
                role: 'zoomIn'
            },
            {
                label: 'Reduzim Zoom',
                role: 'zoomOut'
            },
            {
                label: 'Restaurar o Zoom padrão',
                role: 'resetZoom'
            }
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'Sobre',
                click: aboutWindow
            }
        ]
    }
]

let file = {}

function novoArquivo() {
    file = {
        name: 'Sem título',
        content: '',
        saved: false,
        path: app.getPath('documents') + 'Sem título'
    }
    console.log(file)
    win.webContents.send('new-file', file)
}

async function abrirArquivo() {
    let dialogFile = await dialog.showOpenDialog({
        defaultPath: file.path
    })
    console.log(dialogFile)
    if (dialogFile.canceled === true) {
        return false
    } else {

        file = {
            name: path.basename(dialogFile.filePaths[0]),
            content: lerArquivo(dialogFile.filePaths[0]),
            saved: true,
            path: dialogFile.filePaths[0]
        }
    }
    win.webContents.send('new-file', file)
}

function lerArquivo(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf-8')
    } catch (error) {
        console.log(error)
        return ''
    }
}

function salvar() {
    if (file.saved === true) {
        return salvarArquivo(file.path)
    } else {
        return salvarComo()
    }
}

async function salvarComo() {
    let dialogFile = await dialog.showSaveDialog({
        defaultPath: file.path

    })

    console.log(dialogFile)

    if (dialogFile.canceled === true) {
        return false
    } else {
        salvarArquivo(dialogFile.filePath)
    }
}

function salvarArquivo(filePath) {
    console.log(filePath)

    try {
        fs.writeFile(filePath, file.content, (error) => {
            file.path = filePath
            file.saved = true
            file.name = path.basename(filePath)
            console.log(file)
            win.webContents.send('new-file', file)
        })
    } catch (error) {
        console.log(error)
    }
}

ipcMain.on("update-content", (event, value) => {
    console.log(value)
    file.content = value
})