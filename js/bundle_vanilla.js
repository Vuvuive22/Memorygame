
const MIN_PLAYER_RATING = 0;
const MAX_PLAYER_RATING = 3;
const TWO_SECONDS = 1000;
const MATCH_LIMIT = 8;
const SEQUENTIAL_LIMIT = 16;

class Deck {
    constructor() {
        this.standardDeck = [
            { symbol: 'fa-diamond', type: 'icon', faceup: false, matched: false },
            { symbol: 'fa-diamond', type: 'icon', faceup: false, matched: false },
            { symbol: 'fa-paper-plane-o', type: 'icon', faceup: false, matched: false },
            { symbol: 'fa-paper-plane-o', type: 'icon', faceup: false, matched: false },
            { symbol: 'fa-anchor', type: 'icon', faceup: false, matched: false },
            { symbol: 'fa-anchor', type: 'icon', faceup: false, matched: false },
            { symbol: 'fa-bolt', type: 'icon', faceup: false, matched: false },
            { symbol: 'fa-bolt', type: 'icon', faceup: false, matched: false },
            { symbol: 'fa-cube', type: 'icon', faceup: false, matched: false },
            { symbol: 'fa-cube', type: 'icon', faceup: false, matched: false },
            { symbol: 'fa-leaf', type: 'icon', faceup: false, matched: false },
            { symbol: 'fa-leaf', type: 'icon', faceup: false, matched: false },
            { symbol: 'fa-bicycle', type: 'icon', faceup: false, matched: false },
            { symbol: 'fa-bicycle', type: 'icon', faceup: false, matched: false },
            { symbol: 'fa-bomb', type: 'icon', faceup: false, matched: false },
            { symbol: 'fa-bomb', type: 'icon', faceup: false, matched: false },
        ];
    }

    createSequentialDeck() {
        const deck = [];
        for (let i = 1; i <= 16; i++) {
            deck.push({
                symbol: i.toString(),
                type: 'text',
                value: i,
                faceup: false,
                matched: false
            });
        }
        return deck;
    }

    isSymbolMatch(cardDeck, firstCardIndex, secondCardIndex) {
        if (cardDeck[firstCardIndex].symbol === cardDeck[secondCardIndex].symbol) {
            return true;
        }
        return false;
    }

    shuffle(deckToShuffle = null) {
        let cardDeck = deckToShuffle ? [...deckToShuffle] : [...this.standardDeck];
        if (!deckToShuffle) {
            cardDeck = this.standardDeck.map(card => ({ ...card }));
        }

        let currentIndex = cardDeck.length;
        let temporaryValue;
        let randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = cardDeck[currentIndex];
            cardDeck[currentIndex] = cardDeck[randomIndex];
            cardDeck[randomIndex] = temporaryValue;
        }

        return cardDeck;
    }
}

class GameUI {
    constructor() {
        this.gameTimer = null;
        this.gameTimerMinutes = 0;
        this.gameTimerSeconds = 0;
        this.secondsDOMElement = document.querySelector('.timer-seconds');
        this.minutesDOMElement = document.querySelector('.timer-minutes');
    }

    buildDeck(gameDeck) {
        const deckElement = document.querySelector('.deck');
        if (deckElement.childElementCount > 0) {
            while (deckElement.firstChild) {
                deckElement.removeChild(deckElement.firstChild);
            }
        }
        const deckFragment = document.createDocumentFragment();
        gameDeck.forEach((card, cardIndex) => {
            const liElement = document.createElement('li');
            liElement.setAttribute('id', `${cardIndex}`);
            liElement.setAttribute('class', 'card');

            if (card.type === 'text') {
                liElement.innerText = card.symbol;
                liElement.classList.add('card-text');
            } else {
                const iElement = document.createElement('i');
                iElement.setAttribute('class', `fa ${card.symbol}`);
                liElement.appendChild(iElement);
            }

            deckFragment.appendChild(liElement);
        });
        deckElement.appendChild(deckFragment);
    }

    toggleModeSelection(show) {
        const modal = document.querySelector('.mode-dialog');
        if (modal) modal.style.display = show ? 'flex' : 'none';
    }

    updatePlayerTurn(playerNumber) {
        const indicator = document.querySelector('.player-turn');
        const span = document.querySelector('.current-player');
        if (indicator) indicator.style.display = 'block';
        if (span) span.innerText = playerNumber;
    }

    hidePlayerTurn() {
        const indicator = document.querySelector('.player-turn');
        if (indicator) indicator.style.display = 'none';
    }

    turnCardFaceDown(selectedCardIndex) {
        const selectedCard = document.getElementById(`${selectedCardIndex}`);
        if (!selectedCard) return;
        const isText = selectedCard.classList.contains('card-text');
        selectedCard.className = isText ? 'card card-text' : 'card';
    }

    turnCardFaceUp(selectedCardIndex) {
        const selectedCard = document.getElementById(`${selectedCardIndex}`);
        if (!selectedCard) return;
        selectedCard.classList.add('open', 'faceup');
    }

    markMatchedPair(firstCardIndex, secondCardIndex) {
        const firstSelectedCard = document.getElementById(`${firstCardIndex}`);
        if (firstSelectedCard) firstSelectedCard.classList.add('match');

        if (secondCardIndex !== null && secondCardIndex !== undefined) {
            const secondSelectedCard = document.getElementById(`${secondCardIndex}`);
            if (secondSelectedCard) secondSelectedCard.classList.add('match');
            this.animateMatchedPair(firstSelectedCard, secondSelectedCard);
        } else {
            this.animateMatchedPair(firstSelectedCard, null);
        }
    }

    isCardMatched(cardIndex) {
        const card = document.getElementById(`${cardIndex}`);
        return card && card.getAttribute('class').includes('match');
    }

    animateMatchedPair(firstSelectedCard, secondSelectedCard) {
        const matchedPairStyle = 'animation-duration: 1s; animation-name: card-match;';
        if (firstSelectedCard) firstSelectedCard.setAttribute("style", matchedPairStyle);
        if (secondSelectedCard) secondSelectedCard.setAttribute("style", matchedPairStyle);
    }

    updateMoveCount(moveCount) {
        const countElement = document.querySelector('.moves');
        if (countElement) countElement.innerText = moveCount;
    }

    updatePlayerRating(starCount, starLimit) {
        const closedStarClasses = 'rating fa fa-star';
        const openStarClasses = 'rating fa fa-star-o';
        const ratingNodeList = document.querySelectorAll('.rating');
        for (let i = 0; i < starLimit; i += 1) {
            if (ratingNodeList[i]) {
                if ((starCount - i) <= 0) {
                    ratingNodeList[i].setAttribute('class', openStarClasses);
                } else {
                    ratingNodeList[i].setAttribute('class', closedStarClasses);
                }
            }
        }
    }

    startTimer() {
        this.stopTimer();
        this.gameTimerMinutes = 0;
        if (this.minutesDOMElement) this.minutesDOMElement.innerText = '00';
        this.gameTimerSeconds = 0;
        if (this.secondsDOMElement) this.secondsDOMElement.innerText = '00';
        this.gameTimer = setInterval(this.showNewTime, 1000, this);
    }

    showNewTime(gameui) {
        gameui.gameTimerSeconds += 1;
        if (gameui.gameTimerSeconds >= 60) {
            gameui.gameTimerSeconds = 0;
            gameui.gameTimerMinutes += 1;
            if (gameui.minutesDOMElement) gameui.minutesDOMElement.innerText = ("0" + gameui.gameTimerMinutes).slice(-2);
        }
        if (gameui.secondsDOMElement) gameui.secondsDOMElement.innerText = ("0" + gameui.gameTimerSeconds).slice(-2);
    }

    stopTimer() {
        if (this.gameTimer !== null) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    showWinDialog(gamePlay, playerRating, moveCount) {
        document.querySelector('.game-board').setAttribute('style', 'display: none');
        document.querySelector('.win-minutes').innerText = this.gameTimerMinutes;
        document.querySelector('.win-seconds').innerText = this.gameTimerSeconds;
        document.querySelector('.win-moves').innerText = moveCount;
        document.querySelector('.win-stars').innerText = playerRating;

        const winButton = document.querySelector('.win-button');
        winButton.gamePlayRef = gamePlay;
        winButton.addEventListener('click', this.setupForNewGame);
        document.querySelector('.win-dialog').setAttribute('style', 'display: flex');
    }

    setupForNewGame(event) {
        document.querySelector('.win-dialog').setAttribute('style', 'display: none');
        document.querySelector('.game-board').setAttribute('style', 'display: flex');
        event.target.gamePlayRef.startNewGame(event.target.gamePlayRef.gameMode, event.target.gamePlayRef.numPlayers);
    }
}

class GamePlay {
    constructor() {
        this.deck = null;
        this.gameDeck = [];
        this.gameUI = null;
        this.playerRating = MAX_PLAYER_RATING;
        this.moveCount = 0;
        this.flipCount = 0;
        this.matchCount = 0;
        this.firstCard = undefined;
        this.wait = ms => new Promise((r, j) => setTimeout(r, ms));
        this.isTurnInprogress = false;

        this.gameMode = 'STANDARD';
        this.numPlayers = 1;
        this.activePlayer = 1;
        this.nextSequenceValue = 1;
    }

    setDeck(deck) {
        this.deck = deck;
    }

    setGameUI(gameUI) {
        this.gameUI = gameUI;
    }

    startNewGame(mode = 'STANDARD', numPlayers = 1) {
        this.gameMode = mode;
        this.numPlayers = numPlayers;
        this.activePlayer = 1;
        this.nextSequenceValue = 1;

        this.playerRating = MAX_PLAYER_RATING;
        this.gameUI.updatePlayerRating(this.playerRating, MAX_PLAYER_RATING);
        this.moveCount = 0;
        this.gameUI.updateMoveCount(this.moveCount);
        this.flipCount = 0;
        this.matchCount = 0;
        this.firstCard = undefined;
        this.isTurnInprogress = false;

        if (this.gameMode === 'SEQUENTIAL') {
            const seqDeck = this.deck.createSequentialDeck();
            this.gameDeck = this.deck.shuffle(seqDeck);
            if (numPlayers > 1) {
                this.gameUI.updatePlayerTurn(1);
            } else {
                this.gameUI.hidePlayerTurn();
            }
        } else {
            this.gameDeck = this.deck.shuffle();
            this.gameUI.hidePlayerTurn();
        }

        this.gameUI.buildDeck(this.gameDeck);
        this.gameUI.startTimer();
    }

    turn(selectedCardIndex) {
        if (this.isTurnInprogress) return false;
        if (selectedCardIndex === null || isNaN(selectedCardIndex)) return false;
        if (this.gameUI.isCardMatched(selectedCardIndex)) return false;

        if (this.gameMode === 'SEQUENTIAL') {
            this.turnSequential(selectedCardIndex);
            return false;
        }

        // STANDARD Logic
        if (this.firstCard === selectedCardIndex) return false;
        if (this.flipCount > 1) return false;

        this.gameUI.turnCardFaceUp(selectedCardIndex);
        this.flipCount += 1;

        if (this.flipCount === 1) {
            this.firstCard = selectedCardIndex;
        } else {
            this.moveCount += 1;
            this.gameUI.updateMoveCount(this.moveCount);
            this.isTurnInprogress = true; // Block clicks
            if (!this.deck.isSymbolMatch(this.gameDeck, this.firstCard, selectedCardIndex)) {
                this.pairNotMatched(this.firstCard, selectedCardIndex);
            } else {
                this.pairMatched(this.firstCard, selectedCardIndex);
            }
        }

        if (this.matchCount >= MATCH_LIMIT) {
            this.gameUI.stopTimer();
            this.gameUI.showWinDialog(this, this.playerRating, this.moveCount);
            return true;
        }
        return false;
    }

    async turnSequential(cardIndex) {
        const card = this.gameDeck[cardIndex];
        if (!card) return;

        this.gameUI.turnCardFaceUp(cardIndex);
        this.moveCount += 1;
        this.gameUI.updateMoveCount(this.moveCount);

        if (card.value === this.nextSequenceValue) {
            // Correct!
            this.gameUI.markMatchedPair(cardIndex);
            this.nextSequenceValue += 1;
            this.matchCount += 1;

            if (this.matchCount === SEQUENTIAL_LIMIT) {
                this.gameUI.stopTimer();
                this.gameUI.showWinDialog(this, this.playerRating, this.moveCount);
            }
        } else {
            // Wrong!
            this.isTurnInprogress = true;
            await this.wait(TWO_SECONDS);

            this.gameUI.turnCardFaceDown(cardIndex);

            this.gameDeck.forEach((c, idx) => {
                if (this.gameUI.isCardMatched(idx) || idx == cardIndex) {
                    this.gameUI.turnCardFaceDown(idx);
                    const el = document.getElementById(`${idx}`);
                    if (el) {
                        el.classList.remove('match', 'open', 'faceup');
                        el.setAttribute('style', '');
                    }
                }
            });

            this.nextSequenceValue = 1;
            this.matchCount = 0;

            if (this.numPlayers > 1) {
                this.activePlayer = this.activePlayer === 1 ? 2 : 1;
                this.gameUI.updatePlayerTurn(this.activePlayer);
            }

            this.isTurnInprogress = false;
        }
    }

    pairMatched(firstCardIndex, secondCardIndex) {
        this.matchCount += 1;
        this.gameUI.markMatchedPair(firstCardIndex, secondCardIndex);
        this.firstCard = undefined;
        this.flipCount = 0;
        this.playerRating = this.playerRating < MAX_PLAYER_RATING
            ? this.playerRating += 1
            : this.playerRating;
        this.gameUI.updatePlayerRating(this.playerRating, MAX_PLAYER_RATING);
        this.isTurnInprogress = false;
    }

    async pairNotMatched(firstCardIndex, secondCardIndex) {
        await this.wait(TWO_SECONDS);
        this.gameUI.turnCardFaceDown(firstCardIndex);
        this.gameUI.turnCardFaceDown(secondCardIndex);
        this.firstCard = undefined;
        this.flipCount = 0;
        this.playerRating = this.playerRating > MIN_PLAYER_RATING
            ? this.playerRating -= 1
            : this.playerRating;
        this.gameUI.updatePlayerRating(this.playerRating, MAX_PLAYER_RATING);
        this.isTurnInprogress = false;
    }
}

// MAIN APP LOGIC
const deck = new Deck();
const gamePlay = new GamePlay();
const gameUI = new GameUI();

gamePlay.setDeck(deck);
gamePlay.setGameUI(gameUI);

// Init
gameUI.toggleModeSelection(true);

document.getElementById('mode-std').addEventListener('click', () => {
    gameUI.toggleModeSelection(false);
    gamePlay.startNewGame('STANDARD', 1);
});
document.getElementById('mode-seq-1p').addEventListener('click', () => {
    gameUI.toggleModeSelection(false);
    gamePlay.startNewGame('SEQUENTIAL', 1);
});
document.getElementById('mode-seq-2p').addEventListener('click', () => {
    gameUI.toggleModeSelection(false);
    gamePlay.startNewGame('SEQUENTIAL', 2);
});

document.querySelector('.deck').addEventListener('click', (event) => {
    let target = event.target;
    if (target.tagName === 'I' || target.tagName === 'SPAN') {
        target = target.parentElement;
    }
    if (target.tagName === 'LI') {
        gamePlay.turn(parseInt(target.getAttribute('id')));
    }
});

document.querySelector('.restart').addEventListener('click', (event) => {
    gamePlay.startNewGame(gamePlay.gameMode, gamePlay.numPlayers);
});
