function throwError(message) {
    throw new Error(message)
}

function createElement(tagName, cssClasses, attributes, children = []) {
    const element = document.createElement(tagName)
    for (const cssClass of cssClasses) {
        element.classList.add(cssClass)
    }
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, String(value))
    }
    element.append(...children)
    return element
}

function createTextNode(text) {
    return document.createTextNode(text)
}

function createCardElement({imageSrc, alt}) {
    return createElement('img', ['card'], {src: imageSrc, alt, draggable: false})
}

function createCardBackSideElement() {
    return createCardElement({imageSrc: './images/back-side.webp', alt: 'card back side'})
}

function createCellElement(card, cellClickHandler) {
    const cellElement = createElement('button', ['cell', 'card-hidden'], {
        'aria-label': `Card ${card.id}`,
        'data-id': card.id
    })
    cellElement.append(createCardBackSideElement())
    cellElement.addEventListener('click', () => cellClickHandler(card))
    return cellElement
}

function toggleCardVisibility(card) {
    const cellElement = document.querySelector(`[data-id="${card.id}"]`)
    if (cellElement.classList.toggle('card-hidden')) {
        cellElement.replaceChildren(createCardBackSideElement())
    } else {
        cellElement.replaceChildren(createCardElement(card))
    }
}

function createGridElement(cardSet, cellClickHandler) {
    const gridElement = createElement('div', ['grid'], {})
    const cols = Math.trunc(Math.sqrt(cardSet.length))
    let rows = Math.ceil(Math.sqrt(cardSet.length))
    if (rows * cols < cardSet.length) {
        rows += 1
    }
    gridElement.style.gridTemplateRows = `repeat(${rows}, 1fr)`
    gridElement.style.gridTemplateColumns = `repeat(${cols}, 1fr)`
    const cellElements = []
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cardIdx = row * cols + col
            if (cardIdx === cardSet.length) {
                break
            }
            cellElements.push(createCellElement(cardSet[cardIdx], cellClickHandler))
        }
    }
    gridElement.append(...cellElements)
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

function createCardSet(cardImageSet, cardCount) {
    const pairs = Math.trunc(cardCount / 2)
    const randomCardImages = shuffle([...cardImageSet]).slice(0, pairs)
    const cards = []
    for (const [pair, imageSrc] of randomCardImages.entries()) {
        const alt = `one of pair ${pair}`
        cards.push({imageSrc, id: String(pair * 2), pair, alt}, {imageSrc, id: String(pair * 2 + 1), pair, alt})
    }
    return shuffle(cards)
}

function showAllLevelsCompletedCelebration(rootElement) {
    const successTitle = createElement('h2', ['success-title'], {}, [createTextNode('Awesome!')])
    const successMessage = createElement('p', ['success-details'], {}, [createTextNode('You finished all levels of this memory game.')])
    const successBox = createElement('div', ['success-box'], {}, [successTitle, successMessage])
    rootElement.replaceChildren(successBox)
}

function startNewGame(rootElement, {levels, cardImageSet}, level = 0) {
    const cardSet = createCardSet(cardImageSet, levels[level])
    const visibleCards = []
    const solvedCards = []

    function onCellClick(card) {
        if (!(solvedCards.includes(card) || visibleCards.includes(card) || visibleCards.length === 2)) {
            visibleCards.push(card)
            toggleCardVisibility(card)
            if (visibleCards.length === 2) {
                const [a, b] = visibleCards
                if (a.pair === b.pair) {
                    solvedCards.push(a, b)
                    visibleCards.length = 0
                    if (solvedCards.length === cardSet.length) {
                        if (level < levels.length - 1) {
                            setTimeout(() => startNewGame(rootElement, {levels, cardImageSet}, level + 1), 1000)
                        } else {
                            setTimeout(() => showAllLevelsCompletedCelebration(rootElement), 1000)
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

    const gridElement = createGridElement(cardSet, onCellClick)
    rootElement.replaceChildren(gridElement)
}

async function preloadImage(imageUrl) {
    return fetch(imageUrl).then(response => response.ok ? response : throwError(`Loading ${imageUrl} failed with status code ${response.status}`))
}

async function preloadImages(mainElement, imageUrls) {
    const loadingIndicator = createElement('div', ['loading-box'], {})
    const loadingStatus = createElement('p', ['loading-status'], {})
    loadingStatus.textContent = 'Loading images...'
    const spinner = createElement('div', ['spinner'], {})
    loadingIndicator.append(loadingStatus, spinner)
    mainElement.replaceChildren(loadingIndicator)

    try {
        await Promise.all(imageUrls.map(preloadImage))
    } catch (error) {
        loadingStatus.textContent = 'Failed to load images!'
        const errorDetails = createElement('p', ['error-details'], {})
        errorDetails.textContent = error.toString()
        loadingIndicator.replaceChild(errorDetails, spinner)
        return false
    }
    return true
}

function getMainElement() {
    return document.querySelector('.main');
}

function getControlAreaElement() {
    return document.querySelector('.control-area');
}

async function initGame() {
    const cardSets = {
        trafficSigns: Array.from({length: 105}).map((_, idx) => `./images/traffic-signs/${idx}.webp`)
    }
    const levels = [4, 8, 16, 24, 36, 48, 64]
    const mainElement = getMainElement()

    if (await preloadImages(mainElement, ['./images/back-side.webp', ...Object.values(cardSets)].flat())) {
        startNewGame(mainElement, {levels, cardImageSet: cardSets.trafficSigns})
    }
}

function createFullscreenButton() {
    const title = 'activate full screen mode'
    const fullscreenBtn = createElement('button', ['fullscreen-btn'], {
        title,
        'aria-label': title,
        'aria-pressed': 'false',
        type: 'button'
    }, [createTextNode('⛶')])
    fullscreenBtn.addEventListener('click', async () => {
        if (document.fullscreenElement) {
            fullscreenBtn.setAttribute('aria-pressed', 'false')
            await document.exitFullscreen()
        } else {
            fullscreenBtn.setAttribute('aria-pressed', 'true')
            await document.body.requestFullscreen()
        }
    })
    return fullscreenBtn
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
    } else {
        localStorage.setItem('theme', 'light')
        document.body.classList.add('light')
    }
}

function createDarkModeToggle() {
    const checkbox = createElement('input', [], {type: 'checkbox', role: 'switch', 'aria-label': 'use light mode'})
    const slider = createElement('span', ['slider'], {})
    const label = createElement('label', [], {}, [checkbox, slider])
    const darkModeToggle = createElement('div', ['dark-mode-toggle'], {}, [label])
    checkbox.addEventListener('change', () => setTheme(!checkbox.checked))
    setTheme(isDarkModePreferred())
    checkbox.checked = !isDarkModePreferred()
    return darkModeToggle
}

function initControlArea() {
    const fullscreenBtn = createFullscreenButton()
    const darkModeToggle = createDarkModeToggle()
    const controlArea = getControlAreaElement()
    controlArea.append(fullscreenBtn, darkModeToggle)
}

function showError(message) {
    const mainElement = getMainElement()
    const errorTitle = createElement('h2', ['error-title'], {}, [createTextNode('Error')])
    const errorMessage = createElement('p', ['error-details'], {}, [createTextNode(message)])
    const errorBox = createElement('div', ['error-box'], {}, [errorTitle, errorMessage])
    mainElement.replaceChildren(errorBox)
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
        await navigator.serviceWorker.register("sw.js")
    }
    initControlArea()
    await initGame()
}

await init()
