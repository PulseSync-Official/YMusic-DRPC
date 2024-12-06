import path from 'path'
import React, { CSSProperties, useEffect, useRef, useState } from 'react'
import Layout from '../../../components/layout'
import * as styles from '../../../../../static/styles/page/index.module.scss'
import * as ex from './extensionview.module.scss'
import { NavLink, useLocation, useNavigate } from 'react-router'
import ThemeInterface from '../../../api/interfaces/theme.interface'
import ViewModal from '../../../components/context_menu_themes/viewModal'
import { createActions } from '../../../components/context_menu_themes/sectionConfig'
import Button from '../../../components/button'
import {
    MdBookmarkBorder,
    MdDesignServices,
    MdEdit,
    MdExplore,
    MdFolder,
    MdKeyboardArrowDown,
    MdMoreHoriz,
    MdSettings,
    MdStickyNote2,
    MdStoreMallDirectory,
} from 'react-icons/md'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'

interface ThemeConfig {
    sections: Section[]
}

interface Section {
    title: string
    items: Item[]
}

interface Item {
    id: string
    name: string
    description: string
    type: string
    bool?: boolean
    input?: string
    buttons?: Button[]
}

interface Button {
    name: string
    text: string
}

interface ActionOptions {
    showCheck?: boolean
    showDirectory?: boolean
    showExport?: boolean
    showDelete?: boolean
}

interface Props {
    isTheme: ThemeInterface
    isChecked: boolean
    onCheckboxChange?: (themeName: string, isChecked: boolean) => void
    exportTheme?: (themeName: string) => void
    onDelete?: (themeName: string) => void
    children?: any
    className?: string
    style?: CSSProperties
    options?: ActionOptions
}

const ExtensionViewPage: React.FC = () => {
    const [contextMenuVisible, setContextMenuVisible] = useState(false)
    const menuRef = useRef(null)

    const location = useLocation()
    const navigate = useNavigate()
    const [theme, setTheme] = useState<ThemeInterface | null>(null)

    useEffect(() => {
        const fetchedTheme = location.state?.theme as ThemeInterface
        if (fetchedTheme) {
            setTheme(fetchedTheme)
        } else {
            navigate('/extensionbeta', { replace: false })
        }
    }, [location.state, navigate])

    const handleButtonClick = () => {
        setContextMenuVisible(prev => !prev)
    }

    useEffect(() => {
        const handleClickOutside = (event: { target: any }) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setContextMenuVisible(false)
            }
        }

        if (contextMenuVisible) {
            document.addEventListener('mousedown', handleClickOutside)
        } else {
            document.removeEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [contextMenuVisible])

    const [bannerSrc, setBannerSrc] = useState(
        'static/assets/images/no_themeBackground.png',
    )
    const [selectedTheme, setSelectedTheme] = useState(
        window.electron.store.get('theme') || 'Default',
    )
    const [isThemeEnabled, setIsThemeEnabled] = useState(
        selectedTheme !== 'Default',
    )
    const [isExpanded, setIsExpanded] = useState(false)
    const [height, setHeight] = useState(84)
    const [opacity, setOpacity] = useState(1)
    const [activeTab, setActiveTab] = useState('Overview')
    const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [enableTransition, setEnableTransition] = useState(true)

    const [markdownContent, setMarkdownContent] = useState<string>('')
    const [fileExists, setFileExists] = useState<boolean | null>(null)

    useEffect(() => {
        if (theme) {
            const themeStates =
                window.electron.store.get('themes.themeIsExpanded') || {}
            if (!themeStates.hasOwnProperty(theme.name)) {
                themeStates[theme.name] = false
                window.electron.store.set('themes.themeIsExpanded', themeStates)
            }
            const initialExpandedState = themeStates[theme.name]
            setIsExpanded(initialExpandedState)
            setHeight(initialExpandedState ? 277 : 84)
        }
    }, [theme])

    const toggleExpand = () => {
        const newState = !isExpanded
        setIsExpanded(newState)

        if (theme) {
            const themeStates =
                window.electron.store.get('themes.themeIsExpanded') || {}
            themeStates[theme.name] = newState
            window.electron.store.set('themes.themeIsExpanded', themeStates)
        }
    }

    const toggleTheme = () => {
        const newTheme = isThemeEnabled ? 'Default' : theme?.name || 'Default'
        window.electron.store.set('theme', newTheme)
        setSelectedTheme(newTheme)
        window.desktopEvents.send('themeChanged', newTheme)
        setIsThemeEnabled(!isThemeEnabled)
    }

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null
        const targetHeight = isExpanded ? 277 : 84
        const step = isExpanded ? -1 : 1

        const animateHeight = () => {
            setHeight(prev => {
                if (
                    (step < 0 && prev <= targetHeight) ||
                    (step > 0 && prev >= targetHeight)
                ) {
                    if (interval) clearInterval(interval)
                    return targetHeight
                }
                return prev + step
            })
        }

        interval = setInterval(animateHeight, 5)

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isExpanded])

    const handleEnableTheme = () => {
        const newTheme = theme?.name || 'Default'
        window.electron.store.set('theme', newTheme)
        setSelectedTheme(newTheme)
        window.desktopEvents.send('themeChanged', newTheme)
        setIsThemeEnabled(true)
    }

    useEffect(() => {
        const storedTheme = window.electron.store.get('theme')
        setSelectedTheme(storedTheme)
        setIsThemeEnabled(storedTheme !== 'Default')
    }, [])

    const formatPath = (p: string) => {
        return encodeURI(p.replace(/\\/g, '/'))
    }

    const handleTagChange = (tag: string) => {
        navigate(`/extensionbeta?selectedTag=${encodeURIComponent(tag)}`, {
            replace: false,
        })
    }

    useEffect(() => {
        if (theme?.path && theme.banner) {
            const bannerPath = formatPath(`${theme.path}/${theme.banner}`)
            fetch(bannerPath)
                .then(res => {
                    if (res.ok) {
                        setBannerSrc(bannerPath)
                    } else {
                        setBannerSrc(
                            'static/assets/images/no_themeBackground.png',
                        )
                    }
                })
                .catch(() => {
                    setBannerSrc('static/assets/images/no_themeBackground.png')
                })
        }
    }, [theme])

    useEffect(() => {
        if (theme) {
            const readmePath = `${theme.path}/README.md`
            fetch(readmePath)
                .then(response => response.text())
                .then(data => {
                    setMarkdownContent(data)
                })
                .catch(() => {
                    console.error('Ошибка при загрузке README.md:')
                })
        }
    }, [theme])

    useEffect(() => {
        const checkConfigFile = async () => {
            if (theme) {
                const configPath = path.join(theme.path, 'handleEvents.json')
                const exists = await window.desktopEvents.invoke(
                    'file-event',
                    'check-file-exists',
                    configPath,
                )
                setFileExists(exists)

                if (exists) {
                    const configContent = await window.desktopEvents.invoke(
                        'file-event',
                        'read-file',
                        configPath,
                    )
                    setThemeConfig(JSON.parse(configContent))
                }
            }
        }

        if (theme) {
            checkConfigFile()
        }
    }, [theme])

    const createConfigFile = async () => {
        if (theme) {
            const configPath = path.join(theme.path, 'handleEvents.json')

            const defaultContent: ThemeConfig = {
                sections: [
                    {
                        title: 'Действия',
                        items: [
                            {
                                id: 'showHints',
                                name: 'Показать подсказки',
                                description:
                                    'Включает отображение подсказок при наведении курсора',
                                type: 'button',
                                bool: false,
                            },
                            {
                                id: 'darkMode',
                                name: 'Режим темной темы',
                                description:
                                    'Активирует тёмный режим для комфортной работы при слабом освещении',
                                type: 'button',
                                bool: true,
                            },
                            {
                                id: 'enableNotifications',
                                name: 'Уведомления',
                                description:
                                    'Включает показ всплывающих уведомлений о новых событиях',
                                type: 'button',
                                bool: false,
                            },
                        ],
                    },
                    {
                        title: 'Цветовая схема',
                        items: [
                            {
                                id: 'mainBackground',
                                name: 'Основной фон',
                                description:
                                    'Цвет фона главного окна приложения',
                                type: 'color',
                                input: '#3498db',
                                bool: true,
                            },
                        ],
                    },
                    {
                        title: 'Текстовые настройки',
                        items: [
                            {
                                id: 'greetingMessage',
                                name: 'Приветственное сообщение',
                                description:
                                    'Текст, отображаемый при запуске приложения',
                                type: 'text',
                                buttons: [
                                    {
                                        name: 'MessageParam1',
                                        text: 'Добро пожаловать!',
                                    },
                                    {
                                        name: 'MessageParam2',
                                        text: 'Отмена',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            }

            const result = await window.desktopEvents.invoke(
                'file-event',
                'create-config-file',
                configPath,
                defaultContent,
            )

            if (result.success) {
                setThemeConfig(defaultContent)
                setFileExists(true)
            } else {
                console.error(
                    'Ошибка при создании файла конфигурации:',
                    result.error,
                )
            }
        }
    }

    const saveConfig = async (updatedConfig: ThemeConfig) => {
        if (theme) {
            const configPath = path.join(theme.path, 'handleEvents.json')
            try {
                await window.desktopEvents.invoke(
                    'file-event',
                    'write-file',
                    configPath,
                    updatedConfig,
                )
            } catch (error) {
                console.error('Ошибка при сохранении конфигурации:', error)
            }
        }
    }

    const handleChange = (
        sectionIndex: number,
        itemIndex: number | null,
        key:
            | 'name'
            | 'description'
            | 'input'
            | 'text'
            | 'title'
            | 'bool'
            | 'id',
        value: any,
    ) => {
        const updatedConfig = structuredClone(themeConfig)
        if (!updatedConfig) return

        if (itemIndex !== null) {
            const section = updatedConfig.sections[sectionIndex]
            const item = section.items[itemIndex]
            if (item) {
                ;(item as any)[key] = value
            }
        } else {
            ;(updatedConfig.sections[sectionIndex] as any)[key] = value
        }

        setThemeConfig(updatedConfig)
        saveConfig(updatedConfig)
    }

    const handleButtonChange = (
        sectionIndex: number,
        itemIndex: number,
        buttonIndex: number,
        key: keyof Button,
        newValue: string,
    ) => {
        if (!themeConfig) return
        const updatedConfig = structuredClone(themeConfig)

        if (
            updatedConfig.sections[sectionIndex] &&
            updatedConfig.sections[sectionIndex].items[itemIndex] &&
            updatedConfig.sections[sectionIndex].items[itemIndex].buttons &&
            updatedConfig.sections[sectionIndex].items[itemIndex].buttons[
                buttonIndex
            ]
        ) {
            updatedConfig.sections[sectionIndex].items[itemIndex].buttons[
                buttonIndex
            ][key] = newValue
            setThemeConfig(updatedConfig)
            saveConfig(updatedConfig)
        }
    }

    function LinkRenderer(props: any) {
        return (
            <a href={props.href} target="_blank" rel="noreferrer">
                {props.children}
            </a>
        )
    }

    const renderTabContent = () => {
        if (!theme) return null

        switch (activeTab) {
            case 'Overview':
                return (
                    <div className={ex.galleryContainer}>
                        <div className={ex.markdownContent}>
                            <ReactMarkdown
                                className={ex.markdownText}
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                rehypePlugins={[rehypeRaw]}
                                components={{ a: LinkRenderer }}
                            >
                                {markdownContent || theme.description}
                            </ReactMarkdown>
                        </div>
                    </div>
                )

            case 'Settings':
                if (fileExists === false) {
                    return (
                        <div className={ex.alertContent}>
                            <div>Создать базовый handleEvent.json</div>
                            <button
                                className={ex.settingsAlertButton}
                                onClick={createConfigFile}
                            >
                                Создать файл
                            </button>
                        </div>
                    )
                }

                return (
                    <div className={ex.settingsContent}>
                        {themeConfig?.sections.map(
                            (section: Section, sectionIndex: number) => (
                                <div key={sectionIndex} className={ex.section}>
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="text"
                                                className={ex.sectionTitleInput}
                                                value={section.title}
                                                onChange={e =>
                                                    handleChange(
                                                        sectionIndex,
                                                        null,
                                                        'title',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </>
                                    ) : (
                                        <div className={ex.sectionTitle}>
                                            {section.title}
                                        </div>
                                    )}
                                    {section.items.map(
                                        (item: Item, itemIndex: number) => (
                                            <div
                                                key={itemIndex}
                                                className={`${ex.item} ${ex[`item-${item.type}`]}`}
                                            >
                                                {isEditing ? (
                                                    <>
                                                        <>
                                                            <span
                                                                className={
                                                                    ex.itemTypeInfo
                                                                }
                                                            >
                                                                Type:{' '}
                                                                {item.type}
                                                            </span>
                                                            <span
                                                                className={
                                                                    ex.itemNameEdit
                                                                }
                                                            >
                                                                id (string):{' '}
                                                            </span>
                                                            <input
                                                                type="text"
                                                                className={
                                                                    ex.itemNameInput
                                                                }
                                                                value={item.id}
                                                                onChange={e =>
                                                                    handleChange(
                                                                        sectionIndex,
                                                                        itemIndex,
                                                                        'id',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </>
                                                        <>
                                                            <span
                                                                className={
                                                                    ex.itemNameEdit
                                                                }
                                                            >
                                                                name (string):{' '}
                                                            </span>
                                                            <input
                                                                type="text"
                                                                className={
                                                                    ex.itemNameInput
                                                                }
                                                                value={
                                                                    item.name
                                                                }
                                                                onChange={e =>
                                                                    handleChange(
                                                                        sectionIndex,
                                                                        itemIndex,
                                                                        'name',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </>
                                                        <>
                                                            <span
                                                                className={
                                                                    ex.itemNameEdit
                                                                }
                                                            >
                                                                description
                                                                (string):{' '}
                                                            </span>
                                                            <input
                                                                type="text"
                                                                className={
                                                                    ex.itemDescriptionInput
                                                                }
                                                                value={
                                                                    item.description
                                                                }
                                                                onChange={e =>
                                                                    handleChange(
                                                                        sectionIndex,
                                                                        itemIndex,
                                                                        'description',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div
                                                            className={
                                                                ex.itemName
                                                            }
                                                        >
                                                            {item.name}
                                                        </div>
                                                        <div
                                                            className={
                                                                ex.itemDescription
                                                            }
                                                        >
                                                            {item.description}
                                                        </div>
                                                    </>
                                                )}

                                                {item.type === 'button' &&
                                                    (isEditing ? (
                                                        <>
                                                            <button
                                                                disabled
                                                                className={`${ex.itemButton} ${item.bool ? ex.itemButtonActive : ''}`}
                                                            >
                                                                {item.bool
                                                                    ? 'Включено'
                                                                    : 'Отключено'}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            className={`${ex.itemButton} ${item.bool ? ex.itemButtonActive : ''}`}
                                                            onClick={() =>
                                                                handleChange(
                                                                    sectionIndex,
                                                                    itemIndex,
                                                                    'bool',
                                                                    !item.bool,
                                                                )
                                                            }
                                                        >
                                                            {item.bool
                                                                ? 'Включено'
                                                                : 'Отключено'}
                                                        </button>
                                                    ))}

                                                {item.type === 'color' &&
                                                    (isEditing ? (
                                                        <>
                                                            <span
                                                                className={
                                                                    ex.itemNameEdit
                                                                }
                                                            >
                                                                input (string):{' '}
                                                            </span>
                                                            <input
                                                                type="text"
                                                                className={
                                                                    ex.itemColorInputText
                                                                }
                                                                value={
                                                                    item.input ||
                                                                    ''
                                                                }
                                                                onChange={e =>
                                                                    handleChange(
                                                                        sectionIndex,
                                                                        itemIndex,
                                                                        'input',
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="#FFFFFF"
                                                            />
                                                        </>
                                                    ) : (
                                                        <input
                                                            type="color"
                                                            className={
                                                                ex.itemColorInput
                                                            }
                                                            value={
                                                                item.input ||
                                                                '#FFFFFF'
                                                            }
                                                            onChange={e =>
                                                                handleChange(
                                                                    sectionIndex,
                                                                    itemIndex,
                                                                    'input',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    ))}

                                                {item.type === 'text' &&
                                                    item.buttons && (
                                                        <div
                                                            className={
                                                                ex.itemButtons
                                                            }
                                                        >
                                                            {item.buttons.map(
                                                                (
                                                                    button: Button,
                                                                    buttonIndex: number,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            buttonIndex
                                                                        }
                                                                        className={
                                                                            ex.buttonContainer
                                                                        }
                                                                    >
                                                                        {isEditing ? (
                                                                            <>
                                                                                <span
                                                                                    className={
                                                                                        ex.itemNameButtons
                                                                                    }
                                                                                >
                                                                                    button.name
                                                                                    (string):{' '}
                                                                                </span>
                                                                                <input
                                                                                    type="text"
                                                                                    className={
                                                                                        ex.buttonNameInput
                                                                                    }
                                                                                    value={
                                                                                        button.name
                                                                                    }
                                                                                    onChange={e => {
                                                                                        const newName =
                                                                                            e
                                                                                                .target
                                                                                                .value
                                                                                        handleButtonChange(
                                                                                            sectionIndex,
                                                                                            itemIndex,
                                                                                            buttonIndex,
                                                                                            'name',
                                                                                            newName,
                                                                                        )
                                                                                    }}
                                                                                />
                                                                                <span
                                                                                    className={
                                                                                        ex.iNBMini
                                                                                    }
                                                                                >
                                                                                    button.text
                                                                                    (string):{' '}
                                                                                </span>
                                                                                <input
                                                                                    type="text"
                                                                                    className={
                                                                                        ex.buttonTextInputEdit
                                                                                    }
                                                                                    value={
                                                                                        button.text
                                                                                    }
                                                                                    onChange={e =>
                                                                                        handleButtonChange(
                                                                                            sectionIndex,
                                                                                            itemIndex,
                                                                                            buttonIndex,
                                                                                            'text',
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <div
                                                                                    className={
                                                                                        ex.buttonName
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        button.name
                                                                                    }
                                                                                </div>
                                                                                <input
                                                                                    type="text"
                                                                                    className={
                                                                                        ex.buttonTextInput
                                                                                    }
                                                                                    value={
                                                                                        button.text
                                                                                    }
                                                                                    onChange={e =>
                                                                                        handleButtonChange(
                                                                                            sectionIndex,
                                                                                            itemIndex,
                                                                                            buttonIndex,
                                                                                            'text',
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        ),
                                    )}
                                </div>
                            ),
                        )}
                    </div>
                )
            case 'Metadata':
                return (
                    <div className={ex.alertContent}>
                        Страница "метаданные темы" в разработке
                    </div>
                )
            default:
                return null
        }
    }

    if (!theme) {
        return null
    }

    return (
        <Layout title="Стилизация">
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.main_container}>
                        <div className={styles.container0x0}>
                            {activeTab === 'Settings' &&
                                fileExists === true && (
                                    <button
                                        className={`${ex.edit} ${isEditing ? ex.activeEdit : ''}`}
                                        onClick={() =>
                                            setIsEditing(prev => !prev)
                                        }
                                    >
                                        <MdEdit />
                                    </button>
                                )}
                            <div className={ex.containerFix}>
                                <div
                                    className={ex.bannerBackground}
                                    style={{
                                        transition: enableTransition
                                            ? 'opacity 0.5s ease, height 0.5s ease, gap 0.5s ease'
                                            : 'none',
                                        opacity: opacity,
                                        backgroundImage: `url(${bannerSrc})`,
                                        backgroundSize: 'cover',
                                        height: `${height}px`,
                                    }}
                                >
                                    <Button
                                        className={ex.hideButton}
                                        onClick={() =>
                                            setIsExpanded(prev => !prev)
                                        }
                                    >
                                        <MdKeyboardArrowDown
                                            size={20}
                                            style={
                                                isExpanded
                                                    ? {
                                                          transition:
                                                              'var(--transition)',
                                                          transform:
                                                              'rotate(180deg)',
                                                      }
                                                    : {
                                                          transition:
                                                              'var(--transition)',
                                                          transform:
                                                              'rotate(0deg)',
                                                      }
                                            }
                                        />
                                    </Button>
                                </div>
                                <div className={ex.themeInfo}>
                                    <div className={ex.themeHeader}>
                                        <div className={ex.containerLeft}>
                                            <img
                                                className={ex.themeImage}
                                                src={`${theme.path}/${theme.image}`}
                                                alt={`${theme.name} image`}
                                                width="100"
                                                height="100"
                                                onError={e => {
                                                    ;(
                                                        e.target as HTMLImageElement
                                                    ).src =
                                                        'static/assets/images/no_themeImage.png'
                                                }}
                                            />
                                            <div className={ex.themeTitle}>
                                                <div
                                                    className={
                                                        ex.titleContainer
                                                    }
                                                >
                                                    <NavLink
                                                        className={ex.path}
                                                        to="/extensionbeta"
                                                    >
                                                        Extension
                                                    </NavLink>
                                                    /
                                                    <div className={ex.title}>
                                                        {theme.name ||
                                                            'Название недоступно'}
                                                    </div>
                                                    <Button
                                                        className={
                                                            ex.addFavorite
                                                        }
                                                        disabled
                                                    >
                                                        <MdBookmarkBorder
                                                            size={20}
                                                        />
                                                    </Button>
                                                </div>
                                                <div className={ex.authorInfo}>
                                                    {theme.author && (
                                                        <div>
                                                            {theme.author}
                                                        </div>
                                                    )}{' '}
                                                    -{' '}
                                                    {theme.lastModified && (
                                                        <div>
                                                            Last update:{' '}
                                                            {theme.lastModified}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={ex.rightContainer}>
                                        <div className={ex.detailsContainer}>
                                            <div className={ex.detailInfo}>
                                                {theme.version && (
                                                    <div className={ex.box}>
                                                        <MdDesignServices />{' '}
                                                        {theme.version}
                                                    </div>
                                                )}
                                                {theme.size !== undefined && (
                                                    <div className={ex.box}>
                                                        <MdFolder />{' '}
                                                        {theme.size}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={ex.detailInfo}>
                                                {Array.isArray(theme.tags) &&
                                                    theme.tags.length > 0 &&
                                                    theme.tags.map(tag => (
                                                        <Button
                                                            key={tag}
                                                            className={ex.tag}
                                                            onClick={() =>
                                                                handleTagChange(
                                                                    tag,
                                                                )
                                                            }
                                                        >
                                                            {tag}
                                                        </Button>
                                                    ))}
                                            </div>
                                        </div>
                                        <div ref={menuRef}>
                                            <div
                                                className={
                                                    ex.miniButtonsContainer
                                                }
                                            >
                                                <Button
                                                    className={`${ex.defaultButton} ${selectedTheme === theme.name ? ex.defaultButtonActive : ''}`}
                                                    onClick={
                                                        selectedTheme !==
                                                        theme.name
                                                            ? handleEnableTheme
                                                            : toggleTheme
                                                    }
                                                >
                                                    {selectedTheme !==
                                                    theme.name
                                                        ? 'Включить'
                                                        : isThemeEnabled
                                                          ? 'Выключить'
                                                          : 'Включить'}
                                                </Button>
                                                <Button
                                                    className={ex.miniButton}
                                                    onClick={() =>
                                                        setContextMenuVisible(
                                                            prev => !prev,
                                                        )
                                                    }
                                                >
                                                    <MdMoreHoriz size={20} />
                                                </Button>
                                            </div>
                                            {contextMenuVisible && (
                                                <ViewModal
                                                    items={createActions(
                                                        undefined,
                                                        isThemeEnabled,
                                                        {
                                                            showCheck: false,
                                                            showDirectory: true,
                                                            showExport: true,
                                                            showDelete: true,
                                                        },
                                                        theme,
                                                    )}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={ex.extensionNav}>
                                    <div className={ex.extensionNavContainer}>
                                        <button
                                            className={`${ex.extensionNavButton} ${activeTab === 'Overview' ? ex.activeTabButton : ''}`}
                                            onClick={() =>
                                                setActiveTab('Overview')
                                            }
                                        >
                                            <MdExplore /> Overview
                                        </button>
                                        <button
                                            className={`${ex.extensionNavButton} ${activeTab === 'Settings' ? ex.activeTabButton : ''}`}
                                            onClick={() =>
                                                setActiveTab('Settings')
                                            }
                                        >
                                            <MdSettings /> Settings
                                        </button>
                                        <button
                                            className={`${ex.extensionNavButton} ${activeTab === 'Metadata' ? ex.activeTabButton : ''}`}
                                            onClick={() =>
                                                setActiveTab('Metadata')
                                            }
                                        >
                                            <MdStickyNote2 /> Metadata
                                        </button>
                                    </div>
                                    <button
                                        className={ex.extensionNavButton}
                                        disabled
                                    >
                                        <MdStoreMallDirectory /> Store
                                    </button>
                                </div>
                                <div className={ex.extensionContent}>
                                    {isEditing && activeTab === 'Settings' && (
                                        <div className={ex.howAlert}>
                                            Подробную информацию о том, как с
                                            этим работать, можно найти в нашем{' '}
                                            <a
                                                href="https://discord.gg/qy42uGTzRy"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Discord канале
                                            </a>{' '}
                                            в разделе extension!
                                        </div>
                                    )}
                                    {renderTabContent()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default ExtensionViewPage
