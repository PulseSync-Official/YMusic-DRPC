export default interface UserInterface {
    id: string
    avatar: string
    banner: string
    username: string
    nickname: string
    createdAt: number
    status: string
    lastOnline: string
    currentTrack: any[] | null
    avatarHash: string
    avatarType: string
    bannerHash: string
    bannerType: string
    perms: string
    badges: any[]
}
