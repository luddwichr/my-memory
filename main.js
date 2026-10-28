
const BACKSIDE_IMAGE_PATH = './images/back-side.webp'

function createElement(tagName, cssClasses, attributes, children = [], eventHandlers = {}) {
    const element = document.createElement(tagName)
    for (const cssClass of cssClasses) {
        element.classList.add(cssClass)
    }
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, String(value))
    }
    element.append(...children)
    for (const [eventName, handler] of Object.entries(eventHandlers)) {
        element.addEventListener(eventName, handler)
    }
    return element
}

function createTextNode(text) {
    return document.createTextNode(text)
}

function replaceMainElementContent(element) {
    const mainElement = document.querySelector('.main')
    mainElement.replaceChildren(element)
}

function createCardElement({imageSrc, alt}) {
    return createElement('img', ['card'], {src: imageSrc, alt, draggable: false})
}

function createCardBackSideElement() {
    return createCardElement({imageSrc: BACKSIDE_IMAGE_PATH, alt: 'card back side'})
}

function createCellElement(card, pos, cellClickHandler) {
    return createElement('button', ['cell', 'card-hidden'], {
            'aria-label': `Card at row ${pos.row + 1}, column ${pos.col + 1}`,
            'aria-pressed': 'false',
            'data-id': card.id
        }, [createCardBackSideElement()],
        {click: () => cellClickHandler(card)})
}

function toggleCardVisibility(card) {
    const cellElement = document.querySelector(`[data-id="${card.id}"]`)
    if (cellElement.classList.toggle('card-hidden')) {
        cellElement.setAttribute('aria-pressed', 'false')
        cellElement.replaceChildren(createCardBackSideElement())
    } else {
        cellElement.setAttribute('aria-pressed', 'true')
        cellElement.replaceChildren(createCardElement(card))
    }
}

function createGridElement(cards, cellClickHandler) {
    const cols = Math.round(Math.sqrt(cards.length))
    const cellElements = cards.map((card, cardIdx) => {
        const row = Math.trunc(cardIdx / cols)
        const col = cardIdx % cols
        const pos = {row, col}
        return createCellElement(card, pos, cellClickHandler)
    })
    const gridElement = createElement('div', ['grid'], {}, cellElements)
    gridElement.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 150px))`
    return gridElement
}

function shuffle(array) {
    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array
}

function createGame({cards, levels}, level) {
    const cardCount = levels[level]
    const pairs = Math.trunc(cardCount / 2)
    const randomCardImages = shuffle([...cards]).slice(0, pairs)
    const drawnCards = []
    for (const [pair, imageSrc] of randomCardImages.entries()) {
        const alt = ''
        drawnCards.push({imageSrc, id: String(pair * 2), pair, alt}, {imageSrc, id: String(pair * 2 + 1), pair, alt})
    }
    return shuffle(drawnCards)
}

function createConfettiContainer() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff1493']
    const confettiCount = 500
    const confettiElements = [...Array(confettiCount)].map(() => {
        const confetti = createElement('div', ['confetti'], {})
        confetti.style.left = Math.random() * 100 + '%'
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
        confetti.style.animationDelay = Math.random() * 3 + 's'
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's'
        confetti.style.setProperty('--drift', (Math.random() * 200 - 100) + 'px')
        return confetti
    })
    const container = createElement('div', ['confetti-container'], {}, confettiElements)
    setTimeout(() => container.remove(), 8000)
    return container
}

function showAllLevelsCompletedCelebration() {
    const successTitle = createElement('h2', ['success-title'], {}, [createTextNode('Awesome!')])
    const successMessage = createElement('p', ['success-details'], {}, [createTextNode('You finished all levels of this memory game.')])
    const confettiContainer = createConfettiContainer()
    const successBox = createElement('div', ['success-box'], {}, [successTitle, successMessage, confettiContainer])
    replaceMainElementContent(successBox)
}

const cardSets = [
    {
        id: 'traffic-signs-v1',
        name: 'Traffic Signs',
        previewImage: './images/traffic-signs/20.webp',
        cards: Array.from({length: 105}).map((_, idx) => `./images/traffic-signs/${idx}.webp`),
        levels: [4, 8, 16, 24, 36, 48, 64]
    },
    {
        id: 'outer-space-v1',
        name: 'Outer space',
        previewImage: './images/outer-space/30.webp',
        cards: Array.from({length: 32}).map((_, idx) => `./images/outer-space/${idx}.webp`),
        levels: [4, 8, 16, 24, 32]
    },
    {
        id: 'noto',
        name: 'Emojis',
        previewImage: './images/noto/0.webp',
        cards: Array.from({length: 20}).map((_, idx) => `./images/noto/${idx}.webp`),
        levels: [4, 8, 14, 20]
    },
    {
        id: 'country-flags',
        name: 'Country Flags',
        previewImage: './images/country-flags/69.svg',
        cards: Array.from({length: 255}).map((_, idx) => `./images/country-flags/${idx}.svg`),
        levels: [4, 8, 16, 24, 36, 48, 64]
    },
    {
        id: 'weather-icons',
        name: 'Weather Icons',
        previewImage: './images/weather-icons/170.svg',
        cards: Array.from({length: 235}).map((_, idx) => `./images/weather-icons/${idx}.svg`),
        levels: [4, 8, 16, 24, 36, 48, 64]
    },
    {
        id: 'baby',
        name: 'Baby',
        previewImage: './images/baby/0.webp',
        cards: Array.from({length: 51}).map((_, idx) => `./images/baby/${idx}.webp`),
        levels: [4, 8, 16, 24, 36, 48, 64]
    },
]

function saveGameState(gameState) {
    localStorage.setItem('gameState', JSON.stringify(gameState))
}

function loadGameState() {
    try {
        const saved = localStorage.getItem('gameState')
        return saved ? JSON.parse(saved) : undefined
    } catch (error) {
        console.error('Failed to load game state:', error)
        return undefined
    }
}

function clearGameState() {
    localStorage.removeItem('gameState')
}

function markCardAsAriaDisabled(card) {
    document.querySelector(`[data-id="${card.id}"]`).setAttribute('aria-disabled', 'true')
}

function setupGame(cardSet, level, cards, initialSolvedCards = []) {
    const visibleCards = []
    const solvedCards = [...initialSolvedCards]

    const gameState = {
        cardSetId: cardSet.id,
        level,
        cards,
        solvedCardIds: solvedCards.map(card => card.id)
    }
    saveGameState(gameState)

    function onCellClick(card) {
        if (!(solvedCards.includes(card) || visibleCards.includes(card) || visibleCards.length === 2)) {
            visibleCards.push(card)
            toggleCardVisibility(card)
            if (visibleCards.length === 2) {
                const [a, b] = visibleCards
                if (a.pair === b.pair) {
                    solvedCards.push(a, b)
                    markCardAsAriaDisabled(a)
                    markCardAsAriaDisabled(b)
                    visibleCards.length = 0
                    gameState.solvedCardIds = solvedCards.map(card => card.id)
                    saveGameState(gameState)
                    if (solvedCards.length === cards.length) {
                        if (level < cardSet.levels.length - 1) {
                            setTimeout(() => startNewGame(cardSet, level + 1), 1000)
                        } else {
                            clearGameState()
                            setTimeout(showAllLevelsCompletedCelebration, 1000)
                        }
                    }
                } else {
                    setTimeout(() => {
                        visibleCards.length = 0
                        toggleCardVisibility(a)
                        toggleCardVisibility(b)
                    }, 1000)
                }
            }
        }
    }

    const gridElement = createGridElement(cards, onCellClick)
    replaceMainElementContent(gridElement)

    for (const card of initialSolvedCards) {
        toggleCardVisibility(card)
        markCardAsAriaDisabled(card)
    }
}

function startNewGame(cardSet, level = 0) {
    setupGame(cardSet, level, createGame(cardSet, level))
}

function restoreGameState() {
    const savedState = loadGameState()
    if (!savedState) {
        return false
    }

    const {cardSetId, level, cards, solvedCardIds} = savedState
    const cardSet = cardSets.find(cardSet => cardSet.id === cardSetId)
    if (!cardSet) {
        return false
    }

    const initialSolvedCards = solvedCardIds.map(id => cards.find(card => card.id === id)).filter(Boolean)
    setupGame(cardSet, level, cards, initialSolvedCards)
    return true
}

async function preloadImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = (error) => reject(new Error(`Loading ${imageUrl} failed.`, {cause: error}))
        img.src = imageUrl
    })
}

async function preloadImages(imageUrls) {
    const loadingStatus = createElement('p', ['loading-status'], {}, [createTextNode('Loading images...')])
    const spinner = createElement('div', ['spinner'], {})
    const loadingIndicator = createElement('div', ['loading-box'], {}, [loadingStatus, spinner])
    replaceMainElementContent(loadingIndicator)

    try {
        await Promise.all(imageUrls.map(preloadImage))
    } catch (error) {
        loadingStatus.textContent = 'Failed to load images!'
        const errorDetails = createElement('p', ['error-details'], {}, [createTextNode(error.toString())])
        loadingIndicator.replaceChild(errorDetails, spinner)
        return false
    }
    return true
}

function createFullscreenButton() {
    const title = 'activate full screen mode'
    const button = createElement('button', ['fullscreen-btn'], {
        title,
        'aria-label': title,
        'aria-pressed': 'false',
        type: 'button'
    }, [createTextNode('⛶')], {
        click: async () => {
            try {
                if (document.fullscreenElement) {
                    await document.exitFullscreen()
                } else {
                    await document.body.requestFullscreen()
                }
            } catch (error) {
                console.error('Fullscreen error:', error)
            }
        }
    })
    document.addEventListener('fullscreenchange', () => {
        button.setAttribute('aria-pressed', document.fullscreenElement ? 'true' : 'false')
    })
    return button
}

function isDarkModePreferred() {
    let storedTheme = localStorage.getItem('theme')
    if (storedTheme) {
        return storedTheme === 'dark'
    }
    const prefersDarkTheme = window.matchMedia('(prefers-color-scheme: dark)')
    return prefersDarkTheme.matches
}

function setTheme(isDarkMode) {
    if (isDarkMode) {
        localStorage.setItem('theme', 'dark')
        document.body.classList.remove('light')
        document.documentElement.style.colorScheme = 'dark'
    } else {
        localStorage.setItem('theme', 'light')
        document.body.classList.add('light')
        document.documentElement.style.colorScheme = 'light'
    }
}

function createDarkModeToggle() {
    const darkModePreferred = isDarkModePreferred()
    setTheme(darkModePreferred)
    const checkbox = createElement('input', [], {
        type: 'checkbox',
        role: 'switch',
        'aria-label': 'Toggle dark mode',
    }, [], {
        click: (event) => {
            setTheme(!event.target.checked)
        }
    })
    checkbox.checked = !darkModePreferred
    const slider = createElement('span', ['slider'], {})
    const label = createElement('label', [], {}, [checkbox, slider])
    return createElement('div', ['dark-mode-toggle'], {}, [label])
}

function dispatchCloseDialogEvent(self) {
    self.dispatchEvent(new CustomEvent('closeDialog', {bubbles: true}))
}

function showStartGameDialog() {
    const title = createElement('h2', ['dialog-title'], {}, [createTextNode('Start a new game')])
    const closeButton = createElement('button', ['dialog-close-btn'], {
        type: 'button',
        'aria-label': 'Cancel'
    }, [createTextNode('✕')], {
        click: (event) => dispatchCloseDialogEvent(event.target)
    })
    const header = createElement('div', ['dialog-header'], {}, [title, closeButton])
    const cardSetButtons = cardSets.map(cardSet => {
        const previewImage = createElement('img', ['dialog-cardset-preview-image'], {
            src: cardSet.previewImage,
            alt: cardSet.name
        })
        const text = createElement('span', [], {}, [createTextNode(cardSet.name)])
        return createElement('button', ['dialog-cardset-btn'], {
            type: 'button'
        }, [previewImage, text], {
            click: (event) => {
                dispatchCloseDialogEvent(event.target)
                startNewGame(cardSet)
            }
        })
    })
    const buttonContainer = createElement('div', ['dialog-cardset-btn-container'], {}, cardSetButtons)
    const dialog = createElement('dialog', ['start-game-dialog'], {tabIndex: "-1"}, [header, buttonContainer], {
        close: () => {
            dialog.remove()
        },
        closeDialog: () => {
            dialog.close()
        }
    })
    document.body.append(dialog)
    dialog.showModal()
}

function newGameDialogButton() {
    return createElement('button', ['new-game-btn'], {type: 'button'}, [createTextNode('New Game')], {
        click: showStartGameDialog
    })
}

function initControlArea() {
    const fullscreenBtn = createFullscreenButton()
    const darkModeToggle = createDarkModeToggle()
    const newGameBtn = newGameDialogButton()
    const controlArea = document.querySelector('.control-area')
    controlArea.addEventListener('dblclick', () => {
        const confettiContainer = createConfettiContainer()
        document.body.append(confettiContainer)
    })
    controlArea.append(fullscreenBtn, darkModeToggle, newGameBtn)
}

function showError(message) {
    const errorTitle = createElement('h2', ['error-title'], {}, [createTextNode('Error')])
    const errorMessage = createElement('p', ['error-details'], {}, [createTextNode(message)])
    const errorBox = createElement('div', ['error-box'], {}, [errorTitle, errorMessage])
    replaceMainElementContent(errorBox)
}

function handleErrorEvent({error, lineno, filename}) {
    showError(`${error.toString()} (caused by ${filename} in line ${lineno})`)
}

function registerGlobalErrorHandler() {
    globalThis.addEventListener('error', handleErrorEvent)
}

async function init() {
    registerGlobalErrorHandler()
    if ("serviceWorker" in navigator) {
        try {
            await navigator.serviceWorker.register("sw.js")
        } catch (error) {
            console.error('Service worker registration failed:', error)
        }
    }
    initControlArea()
    if (await preloadImages([BACKSIDE_IMAGE_PATH, ...cardSets.map(cardSet => cardSet.cards).flat()])) {
        if (!restoreGameState()) {
            startNewGame(cardSets[0])
        }
    }
}

await init()