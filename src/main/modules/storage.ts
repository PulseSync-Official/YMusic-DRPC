import { ipcMain } from 'electron'

let store: any

async function initializeStore() {
    try {
        const ElectronStoreModule = await import('electron-store')
        const ElectronStore = ElectronStoreModule.default
        store = new ElectronStore({
            // encryptionKey: "23f24897d8028680130cd06743a333907bf3f66b63870d1ce2fa568a6a8b74b258f0ed95c5cb61c29d244f19b91ca1f696e129c0f30d27c197fab98136883c52"
        })

        ipcMain.on('electron-store-get', (event, val) => {
            event.returnValue = store.get(val)
        })

        ipcMain.on('electron-store-set', (event, key, val) => {
            store.set(key, val)
        })

        ipcMain.on('electron-store-delete', (event, key) => {
            store.delete(key)
        })

        ipcMain.on('electron-store-has', (event, key) => {
            event.returnValue = store.has(key)
        })

        console.log('ElectronStore initialized and IPC handlers set up')
    } catch (error) {
        console.error('Error initializing ElectronStore:', error)
    }
}

// Инициализация хранилища при старте приложения
initializeStore()

export { store, initializeStore }