
const cardObjectDefinitions = [
    {id: 0, imagePath: '/images/cards/death.png'},
    {id: 1, imagePath: '/images/cards/devil.png'},
    {id: 2, imagePath: '/images/cards/fool.png'},
    {id: 3, imagePath: '/images/cards/hermit.png'},
    {id: 4, imagePath: '/images/cards/high-priestess.png'},
    {id: 5, imagePath: '/images/cards/moon.png'},
    {id: 6, imagePath: '/images/cards/sun.png'},
    {id: 7, imagePath: '/images/cards/tower.png'},
    {id: 8, imagePath: '/images/cards/wheel-green.png'},
    {id: 9, imagePath: '/images/cards/wheel-red.png'}
]

const cardBackImgPath = '/images/cards/back.png'

const cardContainerElem = document.querySelector('.card-container')

let cards = []

const playGameButtonElem = document.getElementById('playGame')

const collapsedGridAreaTemplate = '"a a a a a" "a a a a a"'
const cardCollectionCellClass = ".card-pos-a"

const numCards = cardObjectDefinitions.length

let cardPositions = []

loadGame()

function loadGame() {
    createCards()
    
    cards = document.querySelectorAll('.card')

    playGameButtonElem.addEventListener('click', () => startGame())
}

function startGame() {
    initializeNewGame()
    startRound()
}

function initializeNewGame() {

}

function startRound() {
    initializeNewRound()
    collectCards()
    // flipCards(true)
    shuffleCards()
}

function initializeNewRound() {

}

function collectCards() {
    transformGridArea(collapsedGridAreaTemplate)
    addCardsToGridAreaCell(cardCollectionCellClass)
}

function transformGridArea(areas) {
    cardContainerElem.style.gridTemplateAreas = areas
}

function addCardsToGridAreaCell(cellPositionClassName) {
    const cellPositionElem = document.querySelector(cellPositionClassName)

    cards.forEach((card, index) => {
        addChildElement(cellPositionElem, card)
    })
}

function flipCard(card, flipToBack) {
    const innerCardElem = card.firstChild

    if (flipToBack && !innerCardElem.classList.contains('flip-it')) {
        innerCardElem.classList.add('flip-it')
    } else if (innerCardElem.classList.contains('flip-it')) {
        innerCardElem.classList.remove('flip-it')
    }
}

function flipCards(flipToBack) {
    cards.forEach((card, index) => {
        setTimeout(() => {
            flipCard(card, flipToBack)
        }, index * 100)
    })
}

function shuffleCards() {
    const id = setInterval(shuffle, 12)
    let shuffleCount = 0

    function shuffle() {
        randomizeCardPositions()

        if (shuffleCount < 500) {
            shuffleCount++
        } else {
            clearInterval(id)
            dealCards()
        }
    }
}

function randomizeCardPositions() {
    const random1 = Math.floor(Math.random() * numCards)
    const random2 = Math.floor(Math.random() * numCards)

    const temp = cardPositions[random1]

    cardPositions[random1] = cardPositions[random2]
    cardPositions[random2] = temp
}

function dealCards() {
    addCardsToAppropriateCell()

    const areasTemplate = returnGridAreasMappedToCardPos()
    transformGridArea(areasTemplate)
}

function returnGridAreasMappedToCardPos() {
    let firstPart = ""
    let secondPart = ""
    let areas = ""

    cards.forEach((card, index) => {
        if (cardPositions[index] == 0) {
            areas = areas + "a "
        } else if (cardPositions[index] == 1) {
            areas = areas + "b "
        } else if (cardPositions[index] == 2) {
            areas = areas + "c "
        } else if (cardPositions[index] == 3) {
            areas = areas + "d "
        } else if (cardPositions[index] == 4) {
            areas = areas + "e "
        } else if (cardPositions[index] == 5) {
            areas = areas + "f "
        } else if (cardPositions[index] == 6) {
            areas = areas + "g "
        } else if (cardPositions[index] == 7) {
            areas = areas + "h "
        } else if (cardPositions[index] == 8) {
            areas = areas + "i "
        } else if (cardPositions[index] == 9) {
            areas = areas + "j "
        } 

        if (index == 4) {
            firstPart = areas.substring(0, areas.length - 1)
            areas = ""
        } else if (index == 9) {
            secondPart = areas.substring(0, areas.length - 1)
        }
    })

    return `"${firstPart}" "${secondPart}"`
}

function addCardsToAppropriateCell() {
    cards.forEach((card) => {
        addCardToGridCell(card)
    })
}


function createCards() {
    cardObjectDefinitions.forEach((cardItem) => {
        createCard(cardItem)
    }) 
}

// <div class="card">
//     <div class="card-inner">
//         <div class="card-front">
//             <img src="/images/cards/death.png" alt="" class="card-img">
//         </div>
//         <div class="card-back">
//             <img src="/images/cards/back.png" alt="" class="card-img">
//         </div>
//     </div>
// </div>
function createCard(cardItem) {
    // create div elements that make up a card
    const cardElem = document.createElement('div')
    const cardInnerElem = document.createElement('div')
    const cardFrontElem = document.createElement('div')
    const cardBackElem = document.createElement('div')

    // create front and back image elements for a card
    const cardFrontImg = createElement('img')
    const cardBackImg = createElement('img')

    // add class and id to card element
    addClassToElement(cardElem, 'card')
    addIdToElement(cardElem, cardItem.id)

    // add class to inner card element
    addClassToElement(cardInnerElem, "card-inner")

    // add class to front card element
    addClassToElement(cardFrontElem, "card-front")

    // add class to back card element
    addClassToElement(cardBackElem, "card-back")

    // add src attribute and appropriate value to img element - front of card
    addSrcToImageElem(cardFrontImg, cardItem.imagePath)
    
    // add src attribute and appropriate value to img element - back of card
    addSrcToImageElem(cardBackImg, cardBackImgPath)

    // assign class to front image element of front of card
    addClassToElement(cardFrontImg, 'card-img')

    // assign class to back image element of back of card
    addClassToElement(cardBackImg, 'card-img')

    // assign front image element as child element to front card element
    addChildElement(cardFrontElem, cardFrontImg)
    
    // assign back image element as child element to back card element
    addChildElement(cardBackElem, cardBackImg)

    // assign front card element as child element to inner card element
    addChildElement(cardInnerElem, cardFrontElem)

    // assign back card element as child element to inner card element
    addChildElement(cardInnerElem, cardBackElem)

    // assign inner card element as child element to card element
    addChildElement(cardElem, cardInnerElem)

    // add card element as child element to appropriate grid cell
    addCardToGridCell(cardElem)

    intializeCardPositions(cardElem)
}

function intializeCardPositions(card) {
    cardPositions.push(card.id)
}

function createElement(elemType) {
    return document.createElement(elemType)
}

function addClassToElement(elem, className) {
    elem.classList.add(className)
}

function addIdToElement(elem, id) {
    elem.id = id
}

function addSrcToImageElem(imgElem, src) {
    imgElem.src = src
}

function addChildElement(parentElem, childElem) {
    parentElem.appendChild(childElem)
}

function addCardToGridCell(card) {
    const cardPositionClassName = mapCardIdToGridCell(card)
    const cardPosElem = document.querySelector(cardPositionClassName)

    addChildElement(cardPosElem, card)
}

function mapCardIdToGridCell(card) {
    if (card.id == 0) {
        return '.card-pos-a'
    } else if (card.id == 1) {
        return '.card-pos-b'
    } else if (card.id == 2) {
        return '.card-pos-c'
    } else if (card.id == 3) {
        return '.card-pos-d'
    } else if (card.id == 4) {
        return '.card-pos-e'
    } else if (card.id == 5) {
        return '.card-pos-f'
    } else if (card.id == 6) {
        return '.card-pos-g'
    } else if (card.id == 7) {
        return '.card-pos-h'
    } else if (card.id == 8) {
        return '.card-pos-i'
    } else if (card.id == 9) {
        return '.card-pos-j'
    }
}