import Deck from './Deck.js';
import GamePlay from './GamePlay.js';
import GameUI from './GameUI.js';

// Instantiate the classes that implement the games functionality.
const deck = new Deck();
const gamePlay = new GamePlay();
const gameUI = new GameUI();

gamePlay.setDeck(deck);
gamePlay.setGameUI(gameUI);

// Show mode selection initially
gameUI.toggleModeSelection(true);

// Mode Selection Event Handlers
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

// Define event handlers for each UI element to start the game
const deckElement = document.querySelector('.deck');
document.querySelector('.deck').addEventListener('click', (event) => {
  // Check if click is on a card (li or i or span) and get the LI id
  let target = event.target;
  if (target.tagName === 'I' || target.tagName === 'SPAN') {
    target = target.parentElement;
  }
  if (target.tagName === 'LI') {
    gamePlay.turn(parseInt(target.getAttribute('id')));
  }
});

const restartButton = document.querySelector('.restart');
restartButton.addEventListener('click', (event) => {
  gamePlay.startNewGame(gamePlay.gameMode, gamePlay.numPlayers);
});

