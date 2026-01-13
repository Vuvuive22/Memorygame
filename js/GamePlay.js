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
    this.onlineManager = null; // Reference to OnlineManager
    this.pendingMove = false; // Lock to prevent spam clicking

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

  setOnlineManager(manager) {
    this.onlineManager = manager;
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
  startNewGame(mode = 'STANDARD', numPlayers = 1, gridSize = 16, predefinedDeck = null) {
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

    if (this.gameMode === 'SEQUENTIAL' || this.gameMode === 'ONLINE_SEQUENTIAL') {
      const seqDeck = this.deck.createSequentialDeck(gridSize);
      if (predefinedDeck) {
        this.gameDeck = predefinedDeck; // Use synced deck
      } else {
        this.gameDeck = this.deck.shuffle(seqDeck);
      }

    } else {
      const stdDeck = this.deck.getDeck(gridSize);
      this.gameDeck = this.deck.shuffle(stdDeck);
      this.gameUI.hidePlayerTurn();
    }

    this.gameUI.buildDeck(this.gameDeck, gridSize);

    // Explicitly reset all cards in UI just in case buildDeck didn't clear well, 
    // though buildDeck does clear child elements.
    if (this.gameMode === 'SEQUENTIAL' && this.numPlayers === 2) {
      this.gameUI.toggleCompetitiveInfo(false);
    } else {
      this.gameUI.toggleCompetitiveInfo(true);
      this.gameUI.startTimer();
    }
  }
  /**
   * @description Control a turn within the game.
   * @param {Number} selectedCardIndex Index of the selected card in the deck.
   * @returns {Boolean} True if last turn, otherwise false is returned
   * @memberof GamePlay
   */
  turn(selectedCardIndex) {
    this.pendingMove = false; // Unlock spam protection
    if (this.isTurnInprogress) {
      return false;
    }
    if (selectedCardIndex === null) return false;
    if (this.gameUI.isCardMatched(selectedCardIndex)) {
      alert("Lỗi Logic: Thẻ này đã được lật rồi!");
      return false;
    }

    // Logic split based on Mode
    if (this.gameMode === 'SEQUENTIAL' || this.gameMode === 'ONLINE_SEQUENTIAL') {
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
      // Only show Win Dialog locally? Or rely on OnlineManager?
      // For synced game, both will reach here.
      if (this.gameMode !== 'ONLINE_SEQUENTIAL') { // Let OnlineManager handle end game via onGameEnd?
        this.gameUI.showWinDialog(this, this.playerRating, this.moveCount);
      }
      return true;
    }
    return false;
  }

  // Helper to set active player
  setActivePlayer(playerNum) {
    this.activePlayer = playerNum;
    this.gameUI.updatePlayerTurn(playerNum);
  }

  handleCardClick(cardIndex) {
    if (this.gameMode === 'ONLINE_SEQUENTIAL') {
      if (this.isTurnInprogress) {
        return;
      }
      if (this.pendingMove) return; // Silent return for spam clicks

      if (this.gameUI.isCardMatched(cardIndex)) return;

      if (!this.onlineManager) {
        alert("Lỗi CRITICAL: OnlineManager chưa được kết nối!");
        return;
      }
      // Loose equality
      if (this.onlineManager.myPlayerNumber != this.activePlayer) {
        alert(`Không phải lượt của bạn!\nBạn là Player: ${this.onlineManager.myPlayerNumber}\nĐang lượt: ${this.activePlayer}`);
        return;
      }
      this.pendingMove = true;
      this.onlineManager.sendMove(cardIndex);
    } else {
      this.turn(cardIndex);
    }
  }

  /**
   * @description Handle turn logic for Sequential Mode
   */
  async turnSequential(cardIndex) {
    try {
      if (!this.gameDeck || !this.gameDeck[cardIndex]) {
        alert(`Lỗi CRITICAL: Không tìm thấy lá bài tại Index ${cardIndex}. Deck size: ${this.gameDeck ? this.gameDeck.length : 'null'}`);
        return;
      }

      const card = this.gameDeck[cardIndex];
      this.gameUI.turnCardFaceUp(cardIndex);
      this.moveCount += 1;
      this.gameUI.updateMoveCount(this.moveCount);

      if (card.value === this.nextSequenceValue) {
        // Correct!
        this.gameUI.markMatchedPair(cardIndex);
        this.nextSequenceValue += 1;
        this.matchCount += 1;

        if (this.matchCount === this.sequentialLimit) {
          this.gameUI.stopTimer();

          if (this.gameMode === 'ONLINE_SEQUENTIAL') {
            // HOST AUTHORITATIVE WIN
            if (this.onlineManager && this.onlineManager.isHost) {
              const winnerId = this.onlineManager.getPlayerIdByNumber(this.activePlayer);
              if (winnerId) {
                this.onlineManager.declareWin(winnerId);
              } else {
                alert("Lỗi: Không tìm thấy ID người thắng!");
              }
            }
            // Clients do nothing, waiting for onGameEnd listener
          } else {
            this.gameUI.showWinDialog(this, this.playerRating, this.moveCount);
          }
        } else {
          if (this.gameMode === 'ONLINE_SEQUENTIAL') {
            this.onlineManager.updateProgress(this.matchCount);
          }
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
            el.classList.remove('match', 'open', 'faceup');
            el.setAttribute('style', '');
          }
        });

        this.nextSequenceValue = 1;
        this.matchCount = 0;

        if (this.numPlayers > 1 || this.gameMode === 'ONLINE_SEQUENTIAL') {
          const nextPlayer = (this.activePlayer % this.numPlayers) + 1;

          if (this.gameMode === 'ONLINE_SEQUENTIAL') {
            // HOST AUTHORITATIVE: Only host updates turn to prevent race conditions
            if (this.onlineManager && this.onlineManager.isHost) {
              this.onlineManager.updateActiveTurn(nextPlayer);
            }
          } else {
            this.activePlayer = nextPlayer;
            this.gameUI.updatePlayerTurn(this.activePlayer);
          }
        }

        this.isTurnInprogress = false;
      }
    } catch (e) {
      alert("Lỗi Logic trong turnSequential: " + e.message);
      console.error(e);
      this.isTurnInprogress = false; // Reset lock
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
