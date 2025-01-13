import SettingsInterface from '../interfaces/settings.interface'

const settingsInitials: SettingsInterface = {
    settings: {
        autoStartInTray: false,
        autoStartMusic: false,
        autoStartApp: false,
        hardwareAcceleration: true,
        deletePextAfterImport: false,
        closeAppInTray: false,
        writeMetadataAfterDownload: false,
    },
    info: {
        version: '',
    },
    mod: {
        version: '',
        musicVersion: '',
        installed: false,
        updated: false,
        changelog: [],
    },
    tokens: {
        token: '',
    },
    discordRpc: {
        appId: '',
        enableRpcButtonListen: false,
        enableGithubButton: true,
        displayPause: false,
        status: false,
        details: '',
        state: '',
        button: '',
    },
}

export default settingsInitials
