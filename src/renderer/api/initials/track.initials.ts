import { Track } from '../interfaces/track.interface'

const TrackInitials: Track = {
    event: '',
    progress: {
        duration: 0,
        loaded: 0,
        position: 0,
        played: 0,
    },
    queue: [],
    repeat: 'none',
    shuffle: false,
    speed: 1,
    currentMs: 0,
    status: '',
    volume: 100,
    linkTitle: '',
    albumArt: '',
    timestamps: [0, 0],
    url: '',
    realId: '',
    title: '',
    major: {
        id: 0,
        name: ''
    },
    available: false,
    availableForPremiumUsers: false,
    availableFullWithoutPermission: false,
    availableForOptions: [],
    disclaimers: [],
    storageDir: '',
    durationMs: 0,
    fileSize: 0,
    r128: {
        i: 0,
        tp: 0
    },
    artists: [
        {
            id: 0,
            name: '',
            various: false,
            composer: false,
            available: false,
            cover: {
                type: '',
                uri: '',
                prefix: ''
            },
            genres: [],
            disclaimers: []
        }
    ],
    albums: [
        {
            id: 0,
            title: '',
            type: '',
            metaType: '',
            year: 0,
            releaseDate: '',
            coverUri: '',
            ogImage: '',
            genre: '',
            trackCount: 0,
            likesCount: 0,
            recent: false,
            veryImportant: false,
            artists: [
                {
                    id: 0,
                    name: '',
                    various: false,
                    composer: false,
                    available: false,
                    cover: {
                        type: '',
                        uri: '',
                        prefix: ''
                    },
                    genres: [],
                    disclaimers: []
                }
            ],
            labels: [
                {
                    id: 0,
                    name: ''
                }
            ],
            available: false,
            availableForPremiumUsers: false,
            availableForOptions: [],
            availableForMobile: false,
            availablePartially: false,
            bests: [],
            disclaimers: [],
            listeningFinished: false,
            trackPosition: {
                volume: 0,
                index: 0
            }
        }
    ],
    coverUri: '',
    ogImage: '',
    lyricsAvailable: false,
    type: '',
    rememberPosition: false,
    trackSharingFlag: '',
    lyricsInfo: {
        hasAvailableSyncLyrics: false,
        hasAvailableTextLyrics: false
    },
    trackSource: '',
    specialAudioResources: [],
    liked: false,
};

export default TrackInitials;
