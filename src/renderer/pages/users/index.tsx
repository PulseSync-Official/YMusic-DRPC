import Layout from '../../components/layout'
import * as styles from './users.module.scss'
import * as globalStyles from '../../../../static/styles/page/index.module.scss'
import { useEffect, useState, useCallback } from 'react'
import UserInterface from '../../api/interfaces/user.interface'
import GetAllUsersQuery from '../../api/queries/user/getAllUsers.query'
import apolloClient from '../../api/apolloClient'
import toast from 'react-hot-toast'
import { FaSortUp, FaSortDown } from 'react-icons/fa'
import debounce from 'lodash.debounce'
import { MdAllOut, MdHourglassEmpty, MdLink, MdOpenInBrowser } from 'react-icons/md'
import SearchImg from './../../../../static/assets/stratis-icons/search.svg'
import { motion } from 'framer-motion'
import config from '../../api/config'
import { Link } from 'react-router-dom'
import TooltipButton from '../../components/tooltip_button'
import { Track } from '../../api/interfaces/track.interface'
import { timeAgo } from '../../utils/utils'

export default function UsersPage() {
    const [loading, setLoading] = useState(true)
    const [users, setUsers] = useState<UserInterface[]>([])
    const [page, setPage] = useState(1)
    const [maxPages, setMaxPages] = useState(1)
    const [sorting, setSorting] = useState([{ id: 'createdAt', desc: false }])
    const [search, setSearch] = useState('')

    const loadingText = 'Загрузка...'.split('')

    const containerVariants = {
        animate: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const letterVariants = {
        initial: {
            y: 0,
        },
        animate: {
            y: [0, -10, 0],
            transition: {
                y: {
                    repeat: Infinity,
                    repeatType: 'loop',
                    duration: 1,
                    ease: 'easeInOut',
                },
            },
        },
    }

    const defaultBackground = {
        background: `linear-gradient(90deg, #292C36 0%, rgba(41, 44, 54, 0.82) 100%)`,
        backgroundSize: 'cover',
    }

    const [backgroundStyle, setBackgroundStyle] = useState(defaultBackground)

    const debouncedFetchUsers = useCallback(
        debounce((page: number, perPage: number, sorting: any, search: string) => {
            setLoading(true)
            apolloClient
                .query({
                    query: GetAllUsersQuery,
                    variables: {
                        perPage,
                        page,
                        sorting,
                        search,
                    },
                    fetchPolicy: 'no-cache',
                })
                .then((result) => {
                    if (result.data) {
                        const data = result.data.getUsersWithPagination
                        setUsers(data.users)
                        setMaxPages(data.totalPages)
                    }
                    setLoading(false)
                })
                .catch((e) => {
                    console.error(e)
                    toast.error('Произошла ошибка!')
                    setLoading(false)
                })
        }, 300),
        [],
    )

    useEffect(() => {
        debouncedFetchUsers(page, 50, sorting, search)
    }, [sorting, page, search, debouncedFetchUsers])

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= maxPages) {
            setPage(newPage)
        }
    }

    const handleSort = (field: string) => {
        setPage(1)
        setSorting((prevSorting) => {
            if (prevSorting.length > 0 && prevSorting[0].id === field) {
                return [{ id: field, desc: !prevSorting[0].desc }]
            } else {
                return [{ id: field, desc: true }]
            }
        })
    }

    const getSortIcon = (field: string) => {
        if (sorting.length === 0 || sorting[0].id !== field) {
            return null
        }
        return sorting[0].desc ? (
            <FaSortDown className={styles.sortIcon} />
        ) : (
            <FaSortUp className={styles.sortIcon} />
        )
    }

    const renderPagination = () => {
        const pages = []
        const maxPageButtons = 2
        let startPage = Math.max(1, page - Math.floor(maxPageButtons / 2))
        let endPage = startPage + maxPageButtons - 1

        if (endPage > maxPages) {
            endPage = maxPages
            startPage = Math.max(1, endPage - maxPageButtons + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    className={`${styles.paginationButton} ${i === page ? styles.active : ''}`}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>,
            )
        }

        return (
            <div className={styles.pagination}>
                <button
                    className={styles.paginationButtonLR}
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                >
                    Назад
                </button>
                {startPage > 1 && (
                    <>
                        <button
                            className={styles.paginationButton}
                            onClick={() => handlePageChange(1)}
                        >
                            1
                        </button>
                        {startPage > 2 && (
                            <span className={styles.ellipsis}>...</span>
                        )}
                    </>
                )}
                {pages}
                {endPage < maxPages && (
                    <>
                        {endPage < maxPages - 1 && (
                            <span className={styles.ellipsis}>...</span>
                        )}
                        <button
                            className={styles.paginationButton}
                            onClick={() => handlePageChange(maxPages)}
                        >
                            {maxPages}
                        </button>
                    </>
                )}
                <button
                    className={styles.paginationButtonLR}
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === maxPages}
                >
                    Вперед
                </button>
            </div>
        )
    }

    const isFieldSorted = (field: string) =>
        sorting.length > 0 && sorting[0].id === field

    useEffect(() => {
        const usersWithBanner = users.filter((user) => user.bannerHash)

        const checkBannerAvailability = (userList: string | any[], index = 0) => {
            if (index >= userList.length) {
                setBackgroundStyle(defaultBackground)
                return
            }

            const img = new Image()
            img.src = `${config.S3_URL}/banners/${userList[index].bannerHash}.${userList[index].bannerType}`

            img.onload = () => {
                setBackgroundStyle({
                    background: `linear-gradient(90deg, #292C36 0%, rgba(41, 44, 54, 0.82) 100%), url(${config.S3_URL}/banners/${userList[index].bannerHash}.${userList[index].bannerType}) no-repeat center center`,
                    backgroundSize: 'cover',
                })
            }

            img.onerror = () => checkBannerAvailability(userList, index + 1)
        }

        if (usersWithBanner.length > 0) {
            checkBannerAvailability(usersWithBanner)
        } else {
            setBackgroundStyle(defaultBackground)
        }
    }, [users])

    return (
        <Layout title="Пользователи">
            <div className={globalStyles.page}>
                <div className={globalStyles.container}>
                    <div className={globalStyles.main_container}>
                        <div
                            className={styles.searchContainer}
                            style={backgroundStyle}
                        >
                            <div className={styles.titlePage}>Пользователи</div>
                            <div className={styles.BoxContainer}>
                                <div className={styles.searchBoxContainer}>
                                    <SearchImg />
                                    <input
                                        className={styles.searchInput}
                                        type="text"
                                        placeholder="Поиск..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value)
                                            setPage(1)
                                        }}
                                    />
                                </div>
                                <div className={styles.userNav}>
                                    <div className={styles.userNavContainer}>
                                        <button
                                            className={`${styles.userNavButton} ${isFieldSorted('createdAt') ? styles.activeSort : ''}`}
                                            onClick={() => handleSort('createdAt')}
                                        >
                                            <MdHourglassEmpty /> Дата регистрации{' '}
                                            {getSortIcon('createdAt')}
                                        </button>
                                        <button
                                            className={`${styles.userNavButton} ${isFieldSorted('username') ? styles.activeSort : ''}`}
                                            onClick={() => handleSort('username')}
                                        >
                                            <MdAllOut /> Имя пользователя{' '}
                                            {getSortIcon('username')}
                                        </button>
                                    </div>
                                    {users.length > 0 && renderPagination()}
                                </div>
                            </div>
                        </div>
                        <div className={globalStyles.container30x15}>
                            {loading ? (
                                <div className={styles.loading}>
                                    <motion.div
                                        variants={containerVariants}
                                        initial="initial"
                                        animate="animate"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {loadingText.map((char, index) => (
                                            <motion.span
                                                key={index}
                                                variants={letterVariants}
                                                style={{
                                                    display: 'inline-block',
                                                    marginRight: '2px',
                                                }}
                                            >
                                                {char}
                                            </motion.span>
                                        ))}
                                    </motion.div>
                                </div>
                            ) : (
                                <div className={styles.userPage}>
                                    {users.length > 0 ? (
                                        <div className={styles.userGrid}>
                                            {users.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className={styles.userCard}
                                                    style={{
                                                        background:
                                                            `${config.S3_URL}/banners/${user.bannerHash}.${user.bannerType}`
                                                                ? `linear-gradient(90deg, #292C36 0%, rgba(41, 44, 54, 0.82) 100%), url(${config.S3_URL}/banners/${user.bannerHash}.${user.bannerType}) no-repeat center center`
                                                                : `linear-gradient(90deg, #292C36 0%, rgba(41, 44, 54, 0.82) 100%)`,
                                                        backgroundSize: 'cover',
                                                    }}
                                                >
                                                    <div
                                                        className={styles.cardHeader}
                                                    >
                                                        <img
                                                            className={
                                                                styles.userAvatar
                                                            }
                                                            src={`${config.S3_URL}/avatars/${user.avatarHash}.${user.avatarType}`}
                                                            alt={user.username}
                                                            onError={(e) => {
                                                                ;(
                                                                    e.currentTarget as HTMLImageElement
                                                                ).src =
                                                                    './static/assets/images/undef.png'
                                                            }}
                                                        />
                                                        <div
                                                            className={
                                                                styles.userInfo
                                                            }
                                                        >
                                                            <span
                                                                className={
                                                                    styles.username
                                                                }
                                                            >
                                                                {user.username}
                                                            </span>
                                                            <span
                                                                className={
                                                                    styles.userDate
                                                                }
                                                            >
                                                                {user.status ===
                                                                'online' ? (
                                                                    <>
                                                                        Сейчас в сети
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        Был в сети:{' '}
                                                                        {timeAgo(
                                                                            Number(
                                                                                user.lastOnline,
                                                                            ),
                                                                        )}
                                                                    </>
                                                                )}
                                                            </span>
                                                            {user.currentTrack &&
                                                                user.currentTrack
                                                                    .status ===
                                                                    'playing' && (
                                                                    <TooltipButton
                                                                        tooltipText={
                                                                            <div
                                                                                className={
                                                                                    styles.tarckInfo
                                                                                }
                                                                            >
                                                                                <div>
                                                                                    <strong>
                                                                                        Трек:
                                                                                    </strong>{' '}
                                                                                    {
                                                                                        user
                                                                                            .currentTrack
                                                                                            .title
                                                                                    }
                                                                                </div>
                                                                                <div>
                                                                                    <strong>
                                                                                        Исполнители:
                                                                                    </strong>{' '}
                                                                                    {user.currentTrack.artists
                                                                                        .map(
                                                                                            (
                                                                                                artist,
                                                                                            ) =>
                                                                                                artist.name,
                                                                                        )
                                                                                        .join(
                                                                                            ', ',
                                                                                        )}
                                                                                </div>
                                                                                {user
                                                                                    .currentTrack
                                                                                    .trackSource !==
                                                                                    'UGC' && (
                                                                                    <>
                                                                                        <div>
                                                                                            <strong>
                                                                                                Альбом:
                                                                                            </strong>{' '}
                                                                                            {user.currentTrack.albums
                                                                                                .map(
                                                                                                    (
                                                                                                        album,
                                                                                                    ) =>
                                                                                                        album.title,
                                                                                                )
                                                                                                .join(
                                                                                                    ', ',
                                                                                                )}
                                                                                        </div>
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                const linkTitle =
                                                                                                    user
                                                                                                        .currentTrack
                                                                                                        .albums[0]
                                                                                                        .id
                                                                                                window.open(
                                                                                                    `yandexmusic://album/${encodeURIComponent(linkTitle)}/track/${user.currentTrack.realId}`,
                                                                                                )
                                                                                            }}
                                                                                            className={
                                                                                                styles.trackButton
                                                                                            }
                                                                                        >
                                                                                            <MdOpenInBrowser
                                                                                                size={
                                                                                                    24
                                                                                                }
                                                                                            />
                                                                                            Открыть
                                                                                            в
                                                                                            Яндекс.Музыке{' '}
                                                                                        </button>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        }
                                                                        side="bottom"
                                                                    >
                                                                        <span
                                                                            className={
                                                                                styles.userDate
                                                                            }
                                                                        >
                                                                            <span
                                                                                key={
                                                                                    user
                                                                                        .currentTrack
                                                                                        .major
                                                                                        .id
                                                                                }
                                                                            >
                                                                                Слушает:{' '}
                                                                                {
                                                                                    user
                                                                                        .currentTrack
                                                                                        .title
                                                                                }
                                                                            </span>
                                                                        </span>
                                                                    </TooltipButton>
                                                                )}

                                                            <span
                                                                className={
                                                                    styles.userDate
                                                                }
                                                            >
                                                                Создан:{' '}
                                                                {new Date(
                                                                    user.createdAt,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                            {/*<Link*/}
                                                            {/*    to={`/user/${user.username}`}*/}
                                                            {/*>*/}
                                                            {/*    Перейти в профиль*/}
                                                            {/*</Link>*/}
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={styles.userBadges}
                                                    >
                                                        {user.badges.length > 0 &&
                                                            user.badges
                                                                .slice()
                                                                .sort(
                                                                    (a, b) =>
                                                                        b.level -
                                                                        a.level,
                                                                )
                                                                .map((_badge) => (
                                                                    <TooltipButton
                                                                        tooltipText={
                                                                            _badge.name
                                                                        }
                                                                        side="bottom"
                                                                    >
                                                                        <div
                                                                            className={`${styles.badge} ${styles[`badgeLevel${_badge.level}`]}`}
                                                                            key={`${_badge.type}-${_badge.level}`}
                                                                        >
                                                                            <img
                                                                                src={`static/assets/badges/${_badge.type}.svg`}
                                                                                alt={
                                                                                    _badge.name
                                                                                }
                                                                            />
                                                                        </div>
                                                                    </TooltipButton>
                                                                ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={styles.noResults}>
                                            Нет результатов
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
