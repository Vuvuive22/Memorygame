const MIN_PLAYER_RATING = 0;
const MAX_PLAYER_RATING = 3;
const TWO_SECONDS = 1000;
const MATCH_LIMIT = 8;
const SEQUENTIAL_LIMIT = 16;

class GamePlay {
  /**
   * @description Creates an instance of the Game class.
   *
   * Note that the wait function used within this class was taken from
   * https://hackernoon.com/lets-make-a-javascript-wait-function-fa3a2eb88f11
   * @memberof GamePlay
   */
  constructor() {
    this.deck = null;
    this.gameDeck = [];
    this.gameUI = null;
    this.playerRating = MAX_PLAYER_RATING;
    this.moveCount = 0;
    this.flipCount = 0;
    this.matchCount = 0;
    this.firstCard = undefined;
    this.deckFragment = null;
    this.wait = ms => new Promise((r, j) => setTimeout(r, ms));
    this.isTurnInprogress = false;

    // New state
    this.gameMode = 'STANDARD';
    this.numPlayers = 1;
    this.activePlayer = 1;
    this.nextSequenceValue = 1;
  }

  /**
   * @description Set the reference to the Deck object
   * @param {Object} deck Reference to an instance of the Deck class
   * @memberof GamePlay
   */
  setDeck(deck) {
    this.deck = deck;
  }

  /**
   * @description Set the reference to the GameUI object
   * @param {Object} gameUI Reference to an instance of the GameUI class
   * @memberof GamePlay
   */
  setGameUI(gameUI) {
    this.gameUI = gameUI;
  }

  /**
   * @description Retrieve the game deck
   * @returns {Object[]} Game deck
   * @memberof GamePlay
   */
  getGameDeck() {
    return this.gameDeck;
  }

  /**
   * @description Start a new game by shuffling the template card deck
   * to create a new game deck
   * @memberof GamePlay
   */
  startNewGame(mode = 'STANDARD', numPlayers = 1, gridSize = 16) {
    this.gameMode = mode;
    this.numPlayers = numPlayers;
    this.gridSize = gridSize;
    this.activePlayer = 1;
    this.nextSequenceValue = 1;

    // Adjust Limits based on grid size
    this.matchLimit = gridSize / 2; // e.g., 8 for 16, 18 for 36
    this.sequentialLimit = gridSize;

    this.playerRating = MAX_PLAYER_RATING;
    this.gameUI.updatePlayerRating(this.playerRating, MAX_PLAYER_RATING);
    this.moveCount = 0;
    this.gameUI.updateMoveCount(this.moveCount);
    this.flipCount = 0;
    this.matchCount = 0;
    this.firstCard = undefined;
    this.isTurnInprogress = false;

    // Remove any old event listeners or state if necessary (not needed here as we rebuild deck)

    if (this.gameMode === 'SEQUENTIAL') {
      const seqDeck = this.deck.createSequentialDeck(gridSize);
      this.gameDeck = this.deck.shuffle(seqDeck);
      if (numPlayers > 1) {
        this.gameUI.updatePlayerTurn(1);
      } else {
        this.gameUI.hidePlayerTurn();
      }
    } else {
      const stdDeck = this.deck.getDeck(gridSize);
      this.gameDeck = this.deck.shuffle(stdDeck);
      this.gameUI.hidePlayerTurn();
    }

    this.gameUI.buildDeck(this.gameDeck, gridSize);

    // Explicitly reset all cards in UI just in case buildDeck didn't clear well, 
    // though buildDeck does clear child elements.
    this.gameUI.startTimer();
  }

  /**
   * @description Control a turn within the game.
   * @param {Number} selectedCardIndex Index of the selected card in the deck.
   * @returns {Boolean} True if last turn, otherwise false is returned
   * @memberof GamePlay
   */
  turn(selectedCardIndex) {
    if (this.isTurnInprogress) return false;
    if (selectedCardIndex === null) return false;
    if (this.gameUI.isCardMatched(selectedCardIndex)) return false;

    // Logic split based on Mode
    if (this.gameMode === 'SEQUENTIAL') {
      this.turnSequential(selectedCardIndex);
      return false; // Game end handled inside
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

    // Check for the end of the current game
    if (this.matchCount >= this.matchLimit) {
      this.gameUI.stopTimer();
      this.gameUI.showWinDialog(this, this.playerRating, this.moveCount);
      return true;
    }
    return false;
  }

  /**
   * @description Handle turn logic for Sequential Mode
   */
  async turnSequential(cardIndex) {
    const card = this.gameDeck[cardIndex];
    this.gameUI.turnCardFaceUp(cardIndex);
    this.moveCount += 1;
    this.gameUI.updateMoveCount(this.moveCount);

    if (card.value === this.nextSequenceValue) {
      // Correct!
      this.gameUI.markMatchedPair(cardIndex); // Single card match
      this.nextSequenceValue += 1;
      this.matchCount += 1;

      if (this.matchCount === this.sequentialLimit) {
        this.gameUI.stopTimer();
        this.gameUI.showWinDialog(this, this.playerRating, this.moveCount);
      }
    } else {
      // Wrong!
      this.isTurnInprogress = true;
      await this.wait(TWO_SECONDS);

      // Reset logic: Flip all cards down.
      // In Sequential mode, "matched" means they are Open.
      // So we need to flip down ALL cards that were "matched" (1 to matchCount) + the current one.

      this.gameUI.turnCardFaceDown(cardIndex); // The wrong one

      // Reset all matched cards in the deck
      this.gameDeck.forEach((c, idx) => {
        if (this.gameUI.isCardMatched(idx) || idx == cardIndex) {
          this.gameUI.turnCardFaceDown(idx);
          const el = document.getElementById(`${idx}`);
          el.classList.remove('match', 'open', 'faceup');
          // Reset styling if added by markMatchedPair
          el.setAttribute('style', '');

          // IMPORTANT: Re-apply 'card' class to ensure it's not broken
          // But GameUI.turnCardFaceDown already handles resetting classes mostly.
          // We need to make sure we don't accidentally leave it in a state where it thinks it's matched.
          // The logic above removes 'match', so isCardMatched() should return false next time.
        }
        // Double check: if it was matched, we mark it as unmatched in our state if we tracked it there?
        // This implementation relies on the DOM for `isCardMatched`, so removing the class is enough.
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

  /**
   * @description Process a pair of cards matched by the user
   * @param {Number} firstCardCard Index of the first card of the pair in the deck
   * @param {Number} secondCardCard Index of the second card of the pair in the deck
   * @memberof GamePlay
   */
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

  /**
   * @description Process a pair of selected cards whose symbols don't match
   * @param {Number} firstCardCard Index of the first card of the pair in the deck
   * @param {Number} secondCardCard Index of the second card of the pair in the deck
   * @memberof GamePlay
   */
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

export default GamePlay;
