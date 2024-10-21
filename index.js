const CardType = {
    EVENT: 'event',
    UTILITY: 'utility',
    NEGATE: 'negate',
    SANITY: 'sanity',
};

const cardObjectDefinitions = [
    {id: 0, name: 'Death', playable: false, imagePath: '/images/cards/death.png', type: CardType.EVENT, count: 10},
    {id: 1, name: 'The Devil', playable: true, imagePath: '/images/cards/devil.png', type: CardType.UTILITY, count: 10},
    {id: 2, name: 'The Fool', playable: false, imagePath: '/images/cards/fool.png', type: CardType.NEGATE, count: 17},
    {id: 3, name: 'The Hanged Man', playable: false, imagePath: '/images/cards/hanged-man.png', type: CardType.EVENT, count: 1},
    {id: 4, name: 'The Hermit', playable: true, imagePath: '/images/cards/hermit.png', type: CardType.UTILITY, count: 10},
    {id: 5, name: 'The High Priestess', playable: false, imagePath: '/images/cards/high-priestess.png', type: CardType.EVENT, count: 2},
    {id: 6, name: 'The Moon', playable: true, imagePath: '/images/cards/moon.png', type: CardType.SANITY, count: 5},
    {id: 7, name: 'The Sun', playable: true, imagePath: '/images/cards/sun.png', type: CardType.SANITY, count: 5},
    {id: 8, name: 'The Tower', playable: true, imagePath: '/images/cards/tower.png', type: CardType.SANITY, count: 20},
    {id: 9, name: 'The Wheel of Fortune (Green)', playable: true, imagePath: '/images/cards/wheel-green.png', type: CardType.SANITY, count: 10},
    {id: 10, name: 'The Wheel of Fortune (Red)', playable: true, imagePath: '/images/cards/wheel-red.png', type: CardType.SANITY, count: 10},
];

class Player {
    constructor(name, id) {
        this.name = name;
        this.id = id;
        this.sanity = 100;
        this.hand = [];
        this.altar = [];
        this.isAlive = true;
        this.isImmune = false;
        this.willRevive = false;
        
        this.selectedHandIndex = null;
        this.selectedAltarIndex = null;
        this.playCard = null;
        this.selectablePlayers = [];
        this.selectedPlayerIndex = null;
    }
    
    async drawCard() {
        await this.waitForCardDraw();

        const card = deck.pop();

        logEventMessage(`${this.name} drew ${card.name}`);
    
        // if card type == event
        if (card.type == CardType.EVENT) {
            if (card.id == 5) {
                this.drawCardHighPriestess();
    
            } else if (card.id == 3) {
                this.drawCardHangedMan();
    
            } else if (card.id == 0) {
                this.drawCardDeath();
            }
    
        // if card type is not event, add to hand
        } else {
            this.hand.push(card);
        }
    
        // update isImmune = false
        this.isImmune = false;
    }

    // if card == high priestess, update willRevive = true
    drawCardHighPriestess() {
        this.willRevive = true;
    }

    // if card == hanged man, update sanity = 0, discard hand and altar, update isImmune = false, reset turn
    drawCardHangedMan() {
        this.sanity = 0;
        this.hand = [];
        this.altar = [];
        this.isImmune = false;
    
        this.drawCard();
    }

    // if card == death, check sanity == 0 and isImmune == false, update isAlive = false
    drawCardDeath() {
        players.filter((player) => 
            player.sanity == 0 && player.isImmune == false
        ).forEach((player) => 
            player.isAlive = false
        );

        // revives anyone who previously drew the high priestess that died
        players.filter((player) => 
            player.isAlive == false && player.willRevive == true
        ).forEach((player) => {
            player.isAlive = true;
            player.willRevive = false;
            player.sanity = 100;
        });
    }

    resetAllSelections() {
        this.selectedHandIndex = null;
        this.selectedAltarIndex = null;
        this.playCard = null;
        this.selectablePlayers = [];
        this.selectedPlayerIndex = null;
    }

    selectCardHand(cardIndex) {
        this.selectedHandIndex = cardIndex;
        console.log(this.selectedHandIndex);
    }

    selectCardAltar(cardIndex) {
        this.selectedAltarIndex = cardIndex;
        console.log(this.selectedAltarIndex);
    }

    playSelectedCardHand() {
        const card = this.hand.splice(this.selectedHandIndex, 1)[0];
        console.log(card);

        return card;
    }

    playSelectedCardAltar() {
        const card = this.altar.splice(this.selectedAltarIndex, 1)[0];

        console.log(card);
        return card;
    }

    async playTurn() {
        this.resetAllSelections();

        // if hand is not empty || altar is not empty
        if (this.hand.length != 0 || this.altar.length != 0) {
            await this.waitSelectCardFromHandOrAltar();

            if (this.selectedHandIndex != null) {
                this.playTurnHand();
            } else if (this.selectedAltarIndex != null) {
                this.playTurnAltar();
            }
        }
    }

    // choose card from hand
    async playTurnHand() {
        // this.selectedHandIndex = Math.floor(Math.random() * this.hand.length);
        const card = this.playSelectedCardHand();

        if (card.id == 4) {
            if (this.checkForNegates()) {
                this.playCardHermit();
            }
        } else if (card.id == 1) {
            if (this.checkForNegates()) {
                this.playCardDevil();
            }
        } else {
            await this.waitSelectToPlayOrAltar();

            // choose play
            if (this.playCard == true) {
                if (card.id == 8) {
                    if (this.checkForNegates()) {
                        this.playCardTower();
                    }
                } else {
                    if (this.checkForNegates()) {
                        this.playCardSanity(card.id);
                    }
                }
            // choose altar
            } else {
                // add to altar
                this.altar.push(card);
                
                logEventMessage(`Card added to altar [${this.altar.map(card => card.name)}]`);
            }
        }

        displayUI();
    }
            
    // choose card (sanity) from altar
    playTurnAltar() {
        // this.selectedAltarIndex = Math.floor(Math.random() * this.hand.length);
        const card = this.playSelectedCardAltar();

        if (card.id == 8) {
            this.playCardTower();
        } else {
            this.playCardSanity(card.id);
        }
    }
               
    // TODO: add negate logic
    checkForNegates() {
        return true;
    }

    // if card == hermit, update isImmune = true
    playCardHermit() {
        this.isImmune = true;
        logEventMessage(`${this.name} is immune to status change until the next turn`);
    }

    // if card == devil, choose player where hand is not empty || altar is not empty, randomly take card
    async playCardDevil() {
        if (this.otherStealablePlayers().length >= 1) {                    
            this.selectablePlayers = this.otherStealablePlayers();

            await this.waitSelectPlayerSteal();

            const otherPlayer = this.selectablePlayers[this.selectedPlayerIndex];

            if (otherPlayer) {
                if (otherPlayer.hand.length != 0 && otherPlayer.altar.length == 0) {
                    this.stealCardHand(otherPlayer);
                } else if (otherPlayer.altar.length != 0 && otherPlayer.hand.length == 0) {
                    this.stealCardAltar(otherPlayer);
                } else {
                    // Randomly choose between hand or altar
                    const handOrAltar = Math.floor(Math.random() * 2);

                    if (handOrAltar == 0) {
                        this.stealCardHand(otherPlayer);
                    } else if (handOrAltar == 1) {
                        this.stealCardAltar(otherPlayer);
                    }
                }
            }
        }

        displayUI();
    }

    // if tower, for all player where isAlive = true and isImmune == false
    playCardTower() {
        logEventMessage(`${this.name} plays The Tower`);

        this.allTargetablePlayers().forEach((player) => {
            player.updateSanity(-10)
            logEventMessage(`${player.name}'s sanity level is now ${player.sanity}`);
        });
    }

    async playCardSanity(id) {
        if (id == 6 || id == 10) {
            this.selectablePlayers = this.otherTargetablePlayers();
        } else {
            this.selectablePlayers = this.allTargetablePlayers();
        }

        await this.waitSelectPlayerAffect();

        const otherPlayer = this.selectablePlayers[this.selectedPlayerIndex];

        if (otherPlayer != null) {
            // update sanity
            switch (id) {
                case 6:
                    otherPlayer.updateSanity(-50);
                    break;
                case 7:
                    otherPlayer.updateSanity(50);
                    break;
                case 9:
                    otherPlayer.updateSanity(20);
                    break;
                case 10:
                    otherPlayer.updateSanity(-20);
                    break;
            }
        }

        logEventMessage(`${otherPlayer.name}'s sanity level is now ${otherPlayer.sanity}`);
        displayUI();
    }
    
    // Timer to wait for card draw
    waitForCardDraw() {
        return new Promise((resolve, reject) => {
            const deckButton = document.getElementById('deckButton');
        
            logEventMessage(`${this.name} is drawing a card...`);

            // Set up the timeout
            const timer = setTimeout(() => {
                logEventMessage(`${this.name} drew a card automatically`);
                deckButton.removeEventListener('mousedown', onClick); // Clean up event listener
                resolve();
            }, drawTimeout);
            
            // Set up the click event listener
            function onClick(event) {
                clearTimeout(timer); // Cancel the timeout if the user clicks
                logEventMessage(`${this.name} drew a card from the deck`);

                setTimeout(() => {
                    deckButton.removeEventListener('mousedown', onClick); // Clean up event listener
                    resolve();                    
                }, 1000);
            }

            deckButton.removeAttribute('disabled');
            deckButton.addEventListener('mousedown', onClick);
        });
    }

    // Timer to choose play card from hand or altar
    waitSelectCardFromHandOrAltar() {
        return new Promise((resolve, reject) => {
            let elapsed = 0;
            const interval = setInterval(() => {
                elapsed += timeInterval;

                logEventMessage(`${this.name} is choosing a card... (${selectTimeout - elapsed})`);

                if (this.selectedHandIndex != null) {
                    clearInterval(interval);
                    resolve();
                } else if (this.selectedAltarIndex != null) {
                    clearInterval(interval);
                    resolve();
                } else if (elapsed >= selectTimeout) {
                    logEventMessage(`${this.name} did not choose a card. Ending turn...`);

                    clearInterval(interval);
                    resolve();
                }
            }, timeInterval);

            // Timeout in case the variable is not updated within the allowed time
            setTimeout(() => {
                if (this.selectedHandIndex == null && this.selectedAltarIndex == null) {
                    clearInterval(interval);
                }
            }, selectTimeout);
        });
    }
    
    // Timer to choose play card or add to altar
    waitSelectToPlayOrAltar() {        
        return new Promise((resolve, reject) => {
            let elapsed = 0;
            const interval = setInterval(() => {
                elapsed += timeInterval;

                logEventMessage(`${this.name} is choosing an action... (${selectTimeout - elapsed})`);

                if (this.playCard != null) {
                    clearInterval(interval);
                    resolve();
                } else if (elapsed >= selectTimeout) {
                    // Randomly choose
                    this.playCard = Math.floor(Math.random() * 2) == 1;

                    logEventMessage(`${this.name} did not choose an action. An action has been randomly selected...`);

                    clearInterval(interval);
                    resolve();
                }
            }, timeInterval);

            // Timeout in case the variable is not updated within the allowed time
            setTimeout(() => {
                if (this.playCard == null) {
                    clearInterval(interval);
                }
            }, selectTimeout);
        });
    }
        
    // Timer to choose player to steal
    waitSelectPlayerSteal() {
        return new Promise((resolve, reject) => {
            let elapsed = 0;
            const interval = setInterval(() => {
                elapsed += timeInterval;

                logEventMessage(`${this.name} is choosing a player to steal from... (${selectTimeout - elapsed})`);

                if (this.selectedPlayerIndex != null) {
                    clearInterval(interval);
                    resolve();
                } else if (elapsed >= selectTimeout) {
                    // Randomly choose
                    this.selectedPlayerIndex = Math.floor(Math.random() * this.selectablePlayers.length);

                    logEventMessage(`${this.name} did not choose a player. A player has been randomly selected...`);

                    clearInterval(interval);
                    resolve();
                }
            }, timeInterval);

            // Timeout in case the variable is not updated within the allowed time
            setTimeout(() => {
                if (this.selectedPlayerIndex == null) {
                    clearInterval(interval);
                }
            }, selectTimeout);
        });
    }

    // Timer to choose player to affect
    waitSelectPlayerAffect() {
        return new Promise((resolve, reject) => {
            let elapsed = 0;
            const interval = setInterval(() => {
                elapsed += timeInterval;

                logEventMessage(`${this.name} is choosing a player to affect... (${selectTimeout - elapsed})`);

                if (this.selectedPlayerIndex != null) {
                    clearInterval(interval);
                    resolve();
                } else if (elapsed >= selectTimeout) {
                    // Randomly choose
                    this.selectedPlayerIndex = Math.floor(Math.random() * this.selectablePlayers.length);

                    logEventMessage(`${this.name} did not choose a player. A player has been randomly selected...`);

                    clearInterval(interval);
                    resolve();
                }
            }, timeInterval);

            // Timeout in case the variable is not updated within the allowed time
            setTimeout(() => {
                if (this.selectedPlayerIndex == null) {
                    clearInterval(interval);
                }
            }, selectTimeout);
        });
    }

    updateSanity(delta) {
        if (this.sanity + delta >= 100) {
            this.sanity = 100;
        } else if (this.sanity + delta <= 0) {
            this.sanity = 0;
        } else {
            this.sanity = this.sanity + delta;
        }
    }

    allTargetablePlayers() {
        return players.filter((player) => 
            player.isImmune == false && 
            player.isAlive == true
        );
    }

    otherStealablePlayers() {
        return players.filter((player) => 
            player.id != this.id && 
            player.isImmune == false && 
            player.isAlive == true && 
            (player.hand.length != 0 || player.altar.length != 0)
        );
    }

    otherTargetablePlayers() {
        return players.filter((player) => 
            player.id != this.id && 
            player.isImmune == false && 
            player.isAlive == true
        );
    }

    stealCardHand(otherPlayer) {
        const i = Math.floor(Math.random() * otherPlayer.hand.length);

        const card = otherPlayer.hand[i];
        otherPlayer.hand.splice(i, 1);

        this.hand.push(card);

        logEventMessage(`${otherPlayer.name} lost ${card.name} from their hand`);
    }

    stealCardAltar(otherPlayer) {
        const i = Math.floor(Math.random() * otherPlayer.altar.length);

        const card = otherPlayer.altar[i];
        otherPlayer.altar.splice(i, 1);

        this.altar.push(card);

        logEventMessage(`${otherPlayer.name} lost ${card.name} from their altar`);
    }
}

function initializeGame() {
    initializeDeck();
    shuffle(deck);

    initializePlayers(playerList);
    shuffle(players);

    dealCards();

    startGame();
}

function initializeDeck() {
    deck = [];

    cardObjectDefinitions.forEach((card) => {
        for (let i = 0; i < card.count; i++) {
            deck.push(card);
        }
    })
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        // Generate a random index from 0 to i
        const j = Math.floor(Math.random() * (i + 1));
        // Swap elements deck[i] and deck[j]
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function initializePlayers(playerList) {
    players = [];

    for (let i = 0; i < playerList.length; i++) {
        players.push(new Player(playerList[i], i));
    }
}

// Deal 5 non-event cards to each player
function dealCards() {
    const eventDeck = deck.filter((card) => card.type == CardType.EVENT);
    const regularDeck = deck.filter((card) => card.type != CardType.EVENT);

    for (let i = 0; i < 5; i++) {
        players.forEach((player) => {
            player.hand.push(regularDeck.pop());
        })
    }
    
    deck = eventDeck.concat(regularDeck);
    shuffle(deck);
}

function startGame() {
    turnCount = 0;
    displayUI();

    //nextTurn();
}

async function nextTurn() {
    turnCount = (turnCount + 1) % players.length;

    displayUI();

    if (!gameOver()) {
        const player = getCurrentPlayer();
        
        // if isAlive, player does their turn
        if (player.isAlive == true) {
            await player.drawCard();

            displayUI();

            // if isAlive after card draw
            if (player.isAlive == true) {
                await player.playTurn();

                // nextTurn();
            } else {
                // nextTurn();
            }
        } else {
            // nextTurn();
        }
    } else {
        handleGameResult();
    }
}

// while at least two players live and deck is not empty
function gameOver() {
    return players.filter((player) => player.isAlive == true).length <= 1 || deck.length == 0;
}

function getCurrentPlayer() {
    return players[turnCount];
}


function handleGameResult() {
    displayUI();

    logEventMessage("The Dead");
    players.filter((player) => player.isAlive == false)
        .forEach((player) => {
            logEventMessage(player);
        })
    
    logEventMessage("The Living");
    players.filter((player) => player.isAlive == true)
        .sort((player) => player.sanity)
        .forEach((player) => {
            logEventMessage(player);
        })
}

function logEventMessage(s) {
    console.log(s);
}

// DISPLAY CODE

function loadHomePage() {
    // loadLobbyPage();
    // loadProfilePage();
    // loadHowToPlayPage();
    // loadAboutPage();
    // loadAds();

    loadGamePage();
}

function loadGamePage() {    
    playGameButtonElem.addEventListener('click', () => initializeGame());
    nextTurnButtonElem.addEventListener('click', () => nextTurn());
}

function displayUI() {
    displayPlayersData();
    displayDeck();
    displayEventMessages();
}

// Function to populate the HTML with player data
function displayPlayersData() {
    const otherPlayersContainer = document.querySelector('.other-players-container');
    const thisPlayerContainer = document.querySelector('.this-player-container');

    // Determine who the main player is
    const currentPlayer = getCurrentPlayer();
    const thisPlayer = players.find(player => player.id == currentPlayer.id);

    // Populate data for all players except the main player
    const otherPlayers = players.filter(player => player.id != currentPlayer.id);

    // Clear previous content (in case of dynamic updates)
    otherPlayersContainer.innerHTML = '';

    otherPlayers.forEach((player, i) => {
        const otherPlayerElement = createPlayerElement(player, false);

        // Append each player's data to the container
        otherPlayersContainer.appendChild(otherPlayerElement);
    });

    // Populate data for the main player

    thisPlayerContainer.innerHTML = '';
    const thisPlayerElement = createPlayerElement(thisPlayer, true);

    thisPlayerContainer.appendChild(thisPlayerElement);
}

function createPlayerElement(player, isCurrentPlayer) {
    const playerElement = document.createElement('div');
    playerElement.classList.add('player-container');
    
    // Create player sections dynamically
    playerElement.innerHTML = `
        <div class="player-data">
            <div class="name">${player.name}</div>
            <div class="status"></div>
            <div class="sanity">${player.sanity}</div>
        </div>
        <hr class="line">
        <div class="player-cards">
            <div class="hand"></div>
            <hr class="line">
            <div class="altar"></div>
        </div>
    `;

    const sanityElement = playerElement.querySelector('.sanity');

    updateSanityColor(sanityElement, player.sanity, player.isAlive);

    updateStatusIcons(playerElement, player);

    updateCardImages(playerElement, player, isCurrentPlayer);

    return playerElement;
}

function updateSanityColor(element, sanity, alive) {
    let color;
    if (alive) {
        if (sanity >= 80) {
            color = 'green';
        } else if (sanity >= 60) {
            color = 'yellow';
        } else if (sanity >= 40) {
            color = 'orange';
        } else if (sanity >= 20) {
            color = 'red';
        } else {
            color = 'gray'
        }
    } else {
        color = 'black';
    }

    element.style.color = `${color}`;
}

function updateStatusIcons(playerElement, player) {
    const statusElement = playerElement.querySelector('.status');
    statusElement.innerHTML = '';

    if (player.isAlive) {    
        if (player.isImmune) {
            const img = createImgElement('icon-img', protectedImgPath, "isImmune");

            statusElement.appendChild(img);
        }

        if (player.willRevive) {
            const img = createImgElement('icon-img', angelImgPath, "willRevive");

            statusElement.appendChild(img);        
        }
    } else {
        const img = createImgElement('icon-img', deadImgPath, "dead");

        statusElement.appendChild(img);         
    }
}

function updateCardImages(playerElement, player, isCurrentPlayer) {
    // Add hand cards elements and images
    const handElement = playerElement.querySelector('.hand');
    player.hand.forEach((card, i) => {
        const cardElement = document.createElement('div');
    
        let imgElement = null;

        if (isCurrentPlayer) {
            cardElement.classList.add('this-player-card');
            cardElement.dataset.alt = card.name;

            cardElement.addEventListener('click', () => player.selectCardHand(i));

            imgElement = createImgElement('card-img', card.imagePath, card.name);
        } else {
            cardElement.classList.add('other-player-card');

            imgElement = createImgElement('card-img', cardBackImgPath, "back");
        }
        
        cardElement.appendChild(imgElement);
        handElement.appendChild(cardElement);
    });

    // Add altar card elements and images
    const altarElement = playerElement.querySelector('.altar');
    player.altar.forEach((card, i) => {
        const cardElement = document.createElement('div');
    
        let imgElement = null;

        if (isCurrentPlayer) {
            cardElement.classList.add('this-player-card');
            cardElement.dataset.alt = card.name;

            cardElement.addEventListener('click', () => player.selectCardAltar(i));

            imgElement = createImgElement('card-img', card.imagePath, card.name);
        } else {
            cardElement.classList.add('other-player-card');

            imgElement = createImgElement('card-img', cardBackImgPath, "back");
        }
        
        
        cardElement.appendChild(imgElement);
        altarElement.appendChild(cardElement);
    });
}

function createImgElement(imgClass, imagePath, name) {
    const img = document.createElement('img');
    img.classList.add(imgClass);
    img.src = imagePath;
    img.alt = name;

    return img;
}

// Function to populate the HTML with deck data
function displayDeck() {
    const deckContainer = document.querySelector('.deck-container');

    deckContainer.innerHTML = '';

    const deckButton = document.createElement('button');
    deckButton.classList.add('deck-button');
    deckButton.id = "deckButton"
    deckButton.textContent = deck.length;
    //deckButton.disabled = true;

    deckButton.style.background = `url(${cardBackImgPath})`;

    deckContainer.appendChild(deckButton);
}

function displayEventMessages() {
    
}

// GAME CODE

const cardBackImgPath = '/images/cards/back.png';
const protectedImgPath = '/images/icons/protected-icon.png';
const angelImgPath = '/images/icons/angel-icon.png';
const deadImgPath = '/images/icons/dead-icon.png';

const playGameButtonElem = document.getElementById('playGame');
const nextTurnButtonElem = document.getElementById('nextTurn');

let playerList = ["Kenny", "Amber", "Bond", "Mina"];
let players = [];
let deck = [];
let turnCount = 0;
let selectTimeout = 5000; // 1000 = 1 second
let drawTimeout = 5000; // 1000 = 1 second
let timeInterval = 100; // checking every 0.1 second

loadHomePage();