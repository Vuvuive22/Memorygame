import OnlineManager from './OnlineManager.js';
import Deck from './Deck.js';
import GamePlay from './GamePlay.js';
import GameUI from './GameUI.js';

// Instantiate the classes that implement the games functionality.
const deck = new Deck();
const gamePlay = new GamePlay();
const gameUI = new GameUI();

gamePlay.setDeck(deck);
gamePlay.setGameUI(gameUI);
gamePlay.setOnlineManager(OnlineManager);

// Show mode selection initially
gameUI.toggleModeSelection(true);
gameUI.updateBestScoreDOM();

// State to store selected options before start
let selectedMode = 'STANDARD';
let selectedNumPlayers = 1;
let currentRoomGridSize = 16;

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

document.getElementById('mode-online').addEventListener('click', () => {
  gameUI.toggleModeSelection(false);
  document.querySelector('.online-menu-dialog').style.display = 'flex';
});

// Online Menu Handlers
document.getElementById('btn-create-room').addEventListener('click', () => {
  document.querySelector('.online-menu-dialog').style.display = 'none';
  selectedMode = 'ONLINE_SEQUENTIAL';
  selectedNumPlayers = 1; // It's strictly 1 player per machine
  gameUI.toggleSizeSelection(true);
});

document.getElementById('btn-join-room').addEventListener('click', () => {
  document.querySelector('.online-menu-dialog').style.display = 'none';
  document.querySelector('.join-room-dialog').style.display = 'flex';
});

document.getElementById('btn-online-back').addEventListener('click', () => {
  document.querySelector('.online-menu-dialog').style.display = 'none';
  gameUI.toggleModeSelection(true);
});

// Join Room Logic
document.getElementById('btn-join-back').addEventListener('click', () => {
  document.querySelector('.join-room-dialog').style.display = 'none';
  document.querySelector('.online-menu-dialog').style.display = 'flex';
});

document.getElementById('btn-join-submit').addEventListener('click', async () => {
  const code = document.getElementById('room-code-input').value;
  if (code.length === 4) {
    const success = await OnlineManager.joinRoom(code);
    if (success) {
      document.querySelector('.join-room-dialog').style.display = 'none';
      showLobby(code);
    } else {
      alert("Failed to join.");
    }
  } else {
    alert("Please enter a 4-digit code.");
  }
});

// Lobby UI
function showLobby(code) {
  document.querySelector('.lobby-dialog').style.display = 'flex';
  document.getElementById('lobby-room-code').innerText = code;
}

document.getElementById('btn-lobby-leave').addEventListener('click', () => {
  OnlineManager.leaveRoom();
  document.querySelector('.lobby-dialog').style.display = 'none';
  gameUI.toggleModeSelection(true);
});

document.getElementById('btn-start-game').addEventListener('click', () => {
  // Host generates the deck
  const seqDeck = deck.createSequentialDeck(currentRoomGridSize);
  const shuffledDeck = deck.shuffle(seqDeck);
  OnlineManager.startGame(shuffledDeck);
});

// Online Manager Callbacks
OnlineManager.onOpponentUpdate = (players) => {
  // Update Lobby
  const list = document.getElementById('lobby-players-list');
  if (list) {
    list.innerHTML = '';
    Object.keys(players).forEach(key => {
      const p = players[key];
      if (typeof p !== 'object' || !p.name) return; // Skip invalid entries
      const item = document.createElement('div');
      item.className = 'player-item';
      item.innerHTML = `<strong>${p.name}</strong> <span>${p.status}</span>`; // Using innerHTML for bold
      if (p.status === 'ready') item.classList.add('ready');
      list.appendChild(item);
    });
  }

  // Update Game HUD
  const hudList = document.getElementById('online-progress-list');
  if (hudList) {
    hudList.innerHTML = '';
    Object.keys(players).forEach(key => {
      const p = players[key];
      const li = document.createElement('li');
      li.className = 'opponent-progress';
      li.innerText = `${p.name}: Found ${p.progress || 0}`;
      hudList.appendChild(li);
    });
  }

  // Show Start Button for Host
  if (OnlineManager.isHost && Object.keys(players).length > 0) {
    if (document.getElementById('btn-start-game')) {
      // Allow start even if 1 player for testing
      document.getElementById('btn-start-game').style.display = 'block';
      document.getElementById('waiting-msg').style.display = 'none';
    }
  }
};

OnlineManager.onGameStart = (roomData) => {
  try {
    document.querySelector('.lobby-dialog').style.display = 'none';
    document.querySelector('.win-dialog').style.display = 'none'; // Ensure win dialog is gone
    document.querySelector('.game-board').style.display = 'flex';   // Show game board (was hidden by setupForNewGame)

    // Explicitly sync player numbers
    OnlineManager.updatePlayerState(roomData.players);
    const numPlayers = OnlineManager.currentNumPlayers;

    const safeGridSize = parseInt(roomData.gridSize);

    if (roomData.deck) {
      // Use synced deck
      if (!Array.isArray(roomData.deck)) {
        roomData.deck = Object.values(roomData.deck);
      }
      gamePlay.startNewGame('ONLINE_SEQUENTIAL', numPlayers, safeGridSize, roomData.deck);
    } else {
      console.warn("No synced deck found, falling back to local shuffle (desync risk)");
      gamePlay.startNewGame('ONLINE_SEQUENTIAL', numPlayers, safeGridSize);
    }

    document.querySelector('.online-hud').style.display = 'block';

    const activeP = roomData.activePlayer || 1;
    if (roomData.activePlayer) {
      gamePlay.setActivePlayer(roomData.activePlayer);
    }

    updateHUDTitle(activeP);

    OnlineManager.listenToMoves();
  } catch (e) {
    alert("CRITICAL ERROR in onGameStart: " + e.message + "\n" + e.stack);
    console.error(e);
  }
};

OnlineManager.onMoveReceived = (moveData) => {
  // console.log("Received move", moveData);
  gamePlay.turn(moveData.cardIndex);
};

OnlineManager.onActivePlayerChange = (playerNum) => {
  gamePlay.setActivePlayer(playerNum);
  updateHUDTitle(playerNum);
};

function updateHUDTitle(activePlayerNum) {
  const hudTitle = document.querySelector('.online-hud h3');
  if (hudTitle) {
    hudTitle.innerText = `Opponent Progress (My: ${OnlineManager.myPlayerNumber} | Active: ${activePlayerNum})`;
  }
}

OnlineManager.onGameEnd = (winnerId) => {
  if (winnerId !== OnlineManager.playerId) {
    gamePlay.gameUI.showLossDialog(gamePlay);
  } else {
    gamePlay.gameUI.showWinDialog(gamePlay, gamePlay.playerRating, gamePlay.moveCount);
  }
  document.querySelector('.online-hud').style.display = 'none';
  gameUI.toggleModeSelection(true);
};

// Size Selection Event Handlers
document.getElementById('size-4x4').addEventListener('click', async () => {
  gameUI.toggleSizeSelection(false);
  if (selectedMode === 'ONLINE_SEQUENTIAL') {
    try {
      currentRoomGridSize = 16;
      const code = await OnlineManager.createRoom(16);
      showLobby(code);
    } catch (error) {
      console.error("Create Room Error:", error);
      alert("Lỗi tạo phòng: " + error.message + "\nKiểm tra lại cấu hình Firebase trong firebase-config.js");
      gameUI.toggleModeSelection(true); // Go back
    }
  } else {
    gamePlay.startNewGame(selectedMode, selectedNumPlayers, 16);
  }
});

document.getElementById('size-6x6').addEventListener('click', async () => {
  gameUI.toggleSizeSelection(false);
  if (selectedMode === 'ONLINE_SEQUENTIAL') {
    try {
      currentRoomGridSize = 36;
      const code = await OnlineManager.createRoom(36);
      showLobby(code);
    } catch (error) {
      console.error("Create Room Error:", error);
      alert("Lỗi tạo phòng: " + error.message + "\nKiểm tra lại cấu hình Firebase trong firebase-config.js");
      gameUI.toggleModeSelection(true); // Go back
    }
  } else {
    gamePlay.startNewGame(selectedMode, selectedNumPlayers, 36);
  }
});

// Define event handlers for each UI element to start the game
// Define event handlers for each UI element to start the game
const deckElement = document.querySelector('.deck');
document.querySelector('.deck').addEventListener('click', (event) => {
  // Check if click is on a card
  const li = event.target.closest('li');

  if (li) {
    // Ensure we are clicking a card in the deck and it has an ID
    if (deckElement.contains(li) && li.hasAttribute('id')) {
      gamePlay.handleCardClick(parseInt(li.getAttribute('id')));
    }
  }
});

document.querySelector('.deck').addEventListener('keydown', (event) => {
  const target = event.target;
  if (target.tagName === 'LI' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    gamePlay.handleCardClick(parseInt(target.getAttribute('id')));
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

