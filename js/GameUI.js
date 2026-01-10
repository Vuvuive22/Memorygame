
class GameUI {

  /**
   * @description Create and instance of GameUI
   * @memberof GameUI
   */
  constructor() {
    this.gameTimer = null;
    this.gameTimerMinutes = 0;
    this.gameTimerSeconds = 0;
    this.secondsDOMElement = document.querySelector('.timer-seconds');
    this.minutesDOMElement = document.querySelector('.timer-minutes');
  }

  /**
   * @description Build a DOM document fragment containing the cards the
   * user will interact with in a game
   * @param {Object[]} gameDeck Cards in the current game deck
   * @memberof GameUI
   */
  buildDeck(gameDeck, gridSize) {
    const deckElement = document.querySelector('.deck');

    // Remove existing classes for grid size to reset
    deckElement.classList.remove('grid-6x6');
    if (gridSize === 36) {
      deckElement.classList.add('grid-6x6');
    }

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
      liElement.setAttribute('tabindex', '0');
      liElement.setAttribute('role', 'button');
      liElement.setAttribute('aria-label', 'Card');

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

  // ... (keeping existing methods)

  /**
   * @description Toggle visibility of competitive info (Timer and Stars)
   * @param {Boolean} show True to show, false to hide
   */
  toggleCompetitiveInfo(show) {
    const timer = document.querySelector('.timer');
    const stars = document.querySelector('.stars');
    const displayStyle = show ? '' : 'none'; // 'flex' or block is default usually handled by CSS, '' resets to CSS default
    
    // Timer is inline-block or similar, stars is ul
    // To be safe, let's use the computed style or just set display.
    // CSS for timer is .timer { ... }, stars { ... }
    
    if (timer) timer.style.display = show ? 'inline-block' : 'none'; // Assuming inline-block based on layout
    if (stars) stars.style.display = show ? 'inline-block' : 'none';
  }

  /**
   * @description Toggle Mode Selection Modal
   * @param {Boolean} show True to show, false to hide
   */
  toggleModeSelection(show) {
    const modal = document.querySelector('.mode-dialog');
    modal.style.display = show ? 'flex' : 'none';
  }

  toggleSizeSelection(show) {
    const modal = document.querySelector('.size-dialog');
    modal.style.display = show ? 'flex' : 'none';
  }

  /**
   * @description Update the current player indicator
   * @param {Number} playerNumber 1 or 2
   */
  updatePlayerTurn(playerNumber) {
    const indicator = document.querySelector('.player-turn');
    const span = document.querySelector('.current-player');
    indicator.style.display = 'block';
    span.innerText = playerNumber;
  }

  hidePlayerTurn() {
    document.querySelector('.player-turn').style.display = 'none';
  }

  /**
   * @description Turn a card facedown on the game board
   * @param {Number} selectedCard Index of the selected card in the deck
   * @memberof GameUI
   */
  turnCardFaceDown(selectedCardIndex) {
    const selectedCard = document.getElementById(`${selectedCardIndex}`);
    // Check if it's text or icon based on class if needed, or just reset class to 'card' + 'card-text' if applicable
    // Simplify: just reset to base class.
    // However, buildDeck added 'card-text'. We need to preserve it if it was there?
    // Actually, `setAttribute('class', 'card')` wipes `card-text`.
    // We should check if it had `card-text`.
    const isText = selectedCard.classList.contains('card-text');
    selectedCard.className = isText ? 'card card-text' : 'card';
  }

  /**
   * @description Turn a card faceup on the game board
   * @param {Number} selectedCard Index of the selected card in the deck
   * @memberof GameUI
   */
  turnCardFaceUp(selectedCardIndex) {
    const selectedCard = document.getElementById(`${selectedCardIndex}`);
    selectedCard.classList.add('open', 'faceup');
  }

  /**
   * @description Check if a card is already matched
   * @param {Number} cardIndex
   * @returns {Boolean}
   * @memberof GameUI
   */
  isCardMatched(cardIndex) {
    const card = document.getElementById(`${cardIndex}`);
    return card.classList.contains('match');
  }

  /**
   * @description Mark the selected card as being matched
   * @param {Number} firstCardCard Index of the first card of the pair in the deck
   * @param {Number} secondCardCard Index of the second card of the pair in the deck
   * @memberof GameUI
   */
  markMatchedPair(firstCardIndex, secondCardIndex) {
    const firstSelectedCard = document.getElementById(`${firstCardIndex}`);
    firstSelectedCard.classList.add('match');

    // Check if secondCardIndex exists (it might not in sequential mode 1-by-1 match if we treat single card as match)
    // But in sequential mode, we "match" 1 card at a time?
    // Wait, "matched" usually implies it stays open.
    // In sequential 1-20, when you get 1, it stays open.
    // So we might call this with just one card? Or the game logic will handle it.
    // The current signature expects two cards.
    // I should make it optional or handle it.

    if (secondCardIndex !== null && secondCardIndex !== undefined) {
      const secondSelectedCard = document.getElementById(`${secondCardIndex}`);
      secondSelectedCard.classList.add('match');
      this.animateMatchedPair(firstSelectedCard, secondSelectedCard);
    } else {
      // Single card match (e.g. Sequential)
      this.animateMatchedPair(firstSelectedCard, null);
    }
  }

  /**
   * @description Animate a pair of cards successfully matched by the player
   * @param {*} firstSelectedCard DOM element of the first matched card
   * @param {*} secondSelectedCard DOM element of the second matched card
   * @memberof GameUI
   */
  animateMatchedPair(firstSelectedCard, secondSelectedCard) {
    const matchedPairStyle = 'animation-duration: 1s; animation-name: card-match;';
    firstSelectedCard.setAttribute("style", matchedPairStyle);
    if (secondSelectedCard) {
      secondSelectedCard.setAttribute("style", matchedPairStyle);
    }
  }

  /**
   * @description Display the current turn count (i.e. moves)
   * @param {Number} moveCount Number of turns the player has made in the
   * current game
   * @memberof GameUI
   */
  updateMoveCount(moveCount) {
    const countElement = document.querySelector('.moves');
    countElement.innerText = moveCount;
  }

  /**
   * @description Display the current player star rating
   * @param {Number} starCount Players current star rating
   * @param {Number} starLimit Maximum possible number of stars
   * @memberof GameUI
   */
  updatePlayerRating(starCount, starLimit) {
    const closedStarClasses = 'rating fa fa-star';
    const openStarClasses = 'rating fa fa-star-o';
    const ratingNodeList = document.querySelectorAll('.rating');
    for (let i = 0; i < starLimit; i += 1) {
      if ((starCount - i) <= 0) {
        ratingNodeList[i].setAttribute('class', openStarClasses);
      } else {
        ratingNodeList[i].setAttribute('class', closedStarClasses);
      }
    }
  }

  /**
   * @description Start a new game timer
   * @memberof GameUI
   */
  startTimer() {
    this.stopTimer();
    this.gameTimerMinutes = 0;
    this.minutesDOMElement.innerText = '00';
    this.gameTimerSeconds = 0;
    this.secondsDOMElement.innerText = '00';
    this.gameTimer = setInterval(this.showNewTime, 1000, this);
  }

  /**
   * @description Update the game timer and add the results to the DOM
   * @memberof GameUI
   */
  showNewTime(gameui) {
    gameui.gameTimerSeconds += 1;
    if (gameui.gameTimerSeconds >= 60) {
      gameui.gameTimerSeconds = 0;
      gameui.gameTimerMinutes += 1;
      gameui.minutesDOMElement.innerText = ("0" + gameui.gameTimerMinutes).slice(-2);
    }
    gameui.secondsDOMElement.innerText = ("0" + gameui.gameTimerSeconds).slice(-2);
  }

  /**
   * @description Stop the game timer if one is currently active
   * @memberof GameUI
   */
  stopTimer() {
    if (this.gameTimer !== null) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
  }

  /**
   * @description Display the game win dialog with play metrics
   * @param {*} gamePlay
   * @param {*} playerRating
   * @param {*} moveCount
   * @memberof GameUI
   */
  showWinDialog(gamePlay, playerRating, moveCount) {
    document.querySelector('.game-board').setAttribute('style', 'display: none');

    document.querySelector('.win-minutes').innerText = this.gameTimerMinutes;
    document.querySelector('.win-seconds').innerText = this.gameTimerSeconds;
    document.querySelector('.win-moves').innerText = moveCount;
    document.querySelector('.win-stars').innerText = playerRating;

    document.querySelector('.win-stars').innerText = playerRating;

    this.checkBestScore(moveCount);
    this.updateBestScoreDOM();

    const winButton = document.querySelector('.win-button');
    winButton.gamePlayRef = gamePlay; // Make gamePlay available to event handler
    winButton.addEventListener('click', this.setupForNewGame);
    document.querySelector('.win-dialog').setAttribute('style', 'display: flex');
  }

  /**
   * @description Win Button vent handler. Note that the 'win-button' element
   * is expected to contain a 'gamePlayRef' attribute containing the reference
   * to the GamePlay object instance.
   * @param {*} event The event that was triggered
   * @memberof GameUI
   */
  setupForNewGame(event) {
    document.querySelector('.win-dialog').setAttribute('style', 'display: none');
    document.querySelector('.game-board').setAttribute('style', 'display: flex');
    const gp = event.target.gamePlayRef;
    gp.startNewGame(gp.gameMode, gp.numPlayers, gp.gridSize);
  }

  /**
   * @description Check and update best score in LocalStorage
   * @param {Number} currentMoves
   */
  checkBestScore(currentMoves) {
    const bestMoves = localStorage.getItem('memory-game-best-moves');
    if (!bestMoves || currentMoves < parseInt(bestMoves)) {
      localStorage.setItem('memory-game-best-moves', currentMoves);
      return currentMoves;
    }
    return bestMoves;
  }

  /**
   * @description Update the Best Score display in the DOM
   */
  updateBestScoreDOM() {
    const bestMoves = localStorage.getItem('memory-game-best-moves');
    const bestMovesElement = document.getElementById('best-moves');
    if (bestMovesElement) {
      bestMovesElement.innerText = bestMoves ? bestMoves : '--';
    }
  }
}

export default GameUI;
