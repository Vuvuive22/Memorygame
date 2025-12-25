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
gameUI.updateBestScoreDOM();

// State to store selected options before start
let selectedMode = 'STANDARD';
let selectedNumPlayers = 1;

// Mode Selection Event Handlers
document.getElementById('mode-std').addEventListener('click', () => {
  selectedMode = 'STANDARD';
  selectedNumPlayers = 1;
  gameUI.toggleModeSelection(false);
  gameUI.toggleSizeSelection(true);
});

document.getElementById('mode-seq-1p').addEventListener('click', () => {
  selectedMode = 'SEQUENTIAL';
  selectedNumPlayers = 1;
  gameUI.toggleModeSelection(false);
  gameUI.toggleSizeSelection(true);
});

document.getElementById('mode-seq-2p').addEventListener('click', () => {
  selectedMode = 'SEQUENTIAL';
  selectedNumPlayers = 2;
  gameUI.toggleModeSelection(false);
  gameUI.toggleSizeSelection(true);
});

// Size Selection Event Handlers
document.getElementById('size-4x4').addEventListener('click', () => {
  gameUI.toggleSizeSelection(false);
  gamePlay.startNewGame(selectedMode, selectedNumPlayers, 16);
});

document.getElementById('size-6x6').addEventListener('click', () => {
  gameUI.toggleSizeSelection(false);
  gamePlay.startNewGame(selectedMode, selectedNumPlayers, 36);
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

document.querySelector('.deck').addEventListener('keydown', (event) => {
  const target = event.target;
  if (target.tagName === 'LI' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    gamePlay.turn(parseInt(target.getAttribute('id')));
  }
});

const restartButton = document.querySelector('.restart');
restartButton.addEventListener('click', (event) => {
  gamePlay.startNewGame(gamePlay.gameMode, gamePlay.numPlayers, gamePlay.gridSize);
});

const changeModeButton = document.querySelector('.change-mode');
changeModeButton.addEventListener('click', (event) => {
  gameUI.toggleModeSelection(true);
});

