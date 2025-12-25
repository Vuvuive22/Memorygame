
class Deck {
  /**
   * @description Creates an instance of the Deck class.
   * @memberof Deck
   */
  constructor() {
    /*
     * Define the card decks.
     * standardDeck is the template deck for the matching game.
     *
     * symbol - FontAwesome icon name or text value
     * type - 'icon' or 'text'
     * faceup - true if the card is faceup; false if facedown
     * matched - true if the card has been sucessfully matched; false if it
     * remains unmatched
     */
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
      // Extra cards for 6x6
      { symbol: 'fa-coffee', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-coffee', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-car', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-car', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-camera', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-camera', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-envelope', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-envelope', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-gift', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-gift', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-heart', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-heart', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-key', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-key', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-plane', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-plane', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-star', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-star', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-tree', type: 'icon', faceup: false, matched: false },
      { symbol: 'fa-tree', type: 'icon', faceup: false, matched: false },
    ];
  }

  getDeck(size = 16) {
    // If size is 16, return slice. If size is 36, return all (assuming standard deck has enough).
    // shuffle() will handle taking this returned deck.
    // For now we assume standardDeck is big enough for 6x6 (36) or 4x4 (16)
    if (size > this.standardDeck.length) {
      console.error("Not enough cards in standard deck");
      return this.standardDeck;
    }
    return this.standardDeck.slice(0, size);
  }

  /**
   * @description Create a deck for sequential mode (numbers 1-size)
   * @returns {Object[]} Array of card objects
   */
  createSequentialDeck(size = 16) {
    const deck = [];
    for (let i = 1; i <= size; i++) {
      deck.push({
        symbol: i.toString(),
        type: 'text',
        value: i, // Numeric value for easy comparison
        faceup: false,
        matched: false
      });
    }
    return deck;
  }

  /**
   * @description Check to see if two cards have matching symbols
   * @param {Object[]} cardDeck Array of card objects used in the game
   * @param {Number} firstCardIndex Index of the first card to compare
   * @param {Number} secondCardIndex Index of the second card to compare
   * @returns {Boolean} True if the cards match, otherwise false if no match
   * @memberof Deck
   */
  isSymbolMatch(cardDeck, firstCardIndex, secondCardIndex) {
    if (cardDeck[firstCardIndex].symbol === cardDeck[secondCardIndex].symbol) {
      return true;
    }
    return false;
  }

  /**
   * @description Shuffle a deck of game cards.
   * @param {Object[]} [deckToShuffle=null] Optional deck to shuffle. Defaults to standardDeck.
   * @returns {Object[]} Shuffled card deck
   * @memberof Deck
   */
  shuffle(deckToShuffle = null) {
    // Clone the deck to avoid modifying the template by reference if it's the standard deck
    // For generated decks (sequential), it's already a new array, but cloning is safer.
    let cardDeck = deckToShuffle ? [...deckToShuffle] : [...this.standardDeck];

    // Deep clone objects if they are from standardDeck to prevent state mutation on the template
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

export default Deck;
