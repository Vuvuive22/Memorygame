import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, onValue, update, push, child, get, remove, onDisconnect, onChildAdded } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

class OnlineManager {
    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.db = getDatabase(this.app);
        this.currentRoomId = null;
        this.db = getDatabase(this.app);
        this.currentRoomId = null;

        // Persist ID
        const storedId = sessionStorage.getItem('mg_playerId');
        if (storedId) {
            this.playerId = storedId;
        } else {
            this.playerId = 'player_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('mg_playerId', this.playerId);
        }
        this.isHost = false;
        this.onGameStart = null;
        this.onGameEnd = null;
        this.onMoveReceived = null; // Callback for when a move is received
        this.onActivePlayerChange = null;
        this.roomRef = null;
        this.hasGameStarted = false;
        this.myPlayerNumber = 0;
        this.currentNumPlayers = 1;
    }

    // Helper to sync player state from room data
    updatePlayerState(players) {
        if (!players) return;

        this.playersMap = players; // Save for lookup
        // Count players
        this.currentNumPlayers = Object.keys(players).length;

        // Find my number
        if (players[this.playerId]) {
            const name = players[this.playerId].name;
            // Expected "Player 1..." or "Player 2"
            const match = name.match(/Player (\d+)/);
            if (match) {
                this.myPlayerNumber = parseInt(match[1]);
            }
        }
    }

    // Generate a random 4-digit room code
    generateRoomCode() {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    // Create a room
    async createRoom(gridSize) {
        const roomCode = this.generateRoomCode();
        this.currentRoomId = roomCode;
        this.hasGameStarted = false; // Reset for new room
        this.isHost = true;
        this.myPlayerNumber = 1;
        this.roomRef = ref(this.db, 'rooms/' + roomCode);

        // Initial room state
        await set(this.roomRef, {
            status: 'waiting',
            gridSize: gridSize,
            players: {
                [this.playerId]: {
                    name: 'Player 1 (Host)',
                    progress: 0,
                    status: 'ready'
                }
            },
            gameMode: 'SEQUENTIAL', // Default setting
            deckSeed: Math.random().toString(), // Seed for deck shuffling so both get same deck
            winner: null
        });

        // Remove room on disconnect
        onDisconnect(this.roomRef).remove();

        this.listenToRoom();
        return roomCode;
    }

    // Join a room
    async joinRoom(roomCode) {
        const roomRef = ref(this.db, 'rooms/' + roomCode);
        const snapshot = await get(roomRef);

        if (snapshot.exists()) {
            const roomData = snapshot.val();

            if (roomData.status !== 'waiting') {
                throw new Error("Game already started or finished.");
            }

            const players = roomData.players || {};

            // Check if I am already in the room (rejoin)
            let isRejoin = false;
            if (players[this.playerId]) {
                console.log("Rejoining existing session...");
                // Try to parse existing number
                const match = players[this.playerId].name.match(/Player (\d+)/);
                if (match) {
                    this.myPlayerNumber = parseInt(match[1]);
                } else {
                    // Fallback if name is weird
                    this.myPlayerNumber = Object.keys(players).length + 1;
                }
                isRejoin = true;
            } else {
                if (Object.keys(players).length >= 5) { // Limitation from user request: max 5 players
                    throw new Error("Room is full.");
                }
                this.myPlayerNumber = Object.keys(players).length + 1;
            }

            this.currentRoomId = roomCode;
            this.hasGameStarted = false; // Reset for new room
            this.isHost = false;
            this.roomRef = roomRef;

            // Add self to players
            await update(child(roomRef, 'players/' + this.playerId), {
                name: isRejoin ? players[this.playerId].name : `Player ${this.myPlayerNumber}`,
                progress: 0,
                status: 'ready'
            });

            // Remove self on disconnect
            onDisconnect(child(roomRef, 'players/' + this.playerId)).remove();

            this.listenToRoom();
            return true;
        } else {
            throw new Error("Room not found.");
        }
    }

    // Listen to room updates
    listenToRoom() {
        onValue(this.roomRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) return; // Room deleted

            // Check specific states
            if (data.status === 'playing' && this.onGameStart) {
                if (!this.hasGameStarted) {
                    this.hasGameStarted = true;
                    this.onGameStart(data);
                }
            }

            // Check for winner
            if (data.winner && this.onGameEnd) {
                this.onGameEnd(data.winner);
            }

            // Progress updates
            if (data.players && this.onOpponentUpdate) {
                this.onOpponentUpdate(data.players);
            }

            // Active Player Update
            if (data.activePlayer && this.onActivePlayerChange) {
                // alert(`Debug: Listener heard ActivePlayer: ${data.activePlayer}`);
                this.onActivePlayerChange(data.activePlayer);
            }
        });
    }

    async startGame(deck) {
        if (!this.isHost) {
            alert("Bạn không phải chủ phòng! (isHost=false)");
            return;
        }

        try {
            await update(this.roomRef, {
                status: 'playing',
                deck: deck, // Save synced deck
                activePlayer: 1
            });
        } catch (e) {
            alert("Lỗi StartGame: " + e.message);
        }
    }

    async updateActiveTurn(nextPlayerNumber) {
        if (!this.currentRoomId) return;
        try {
            await update(this.roomRef, {
                activePlayer: nextPlayerNumber
            });
        } catch (e) {
            console.error("Error updating turn:", e);
        }
    }

    async sendMove(cardIndex) {
        // alert(`Debug: Checking Room ID: ${this.currentRoomId}`);
        if (!this.currentRoomId) {
            alert("Lỗi CRITICAL: Không tìm thấy Room ID! (Bạn có tạo/vào phòng chưa?)");
            return;
        }
        try {
            await push(child(this.roomRef, 'moves'), {
                cardIndex: cardIndex,
                playerId: this.playerId,
                timestamp: Date.now()
            });
            // alert("Debug: Sent Move Success"); // Uncomment if needed, but let's rely on Receive alert first
        } catch (e) {
            alert("Lỗi gửi nước đi: " + e.message + "\n(Kiểm tra Firebase Rules?)");
            console.error(e);
        }
    }

    listenToMoves() {
        const movesRef = child(this.roomRef, 'moves');
        onChildAdded(movesRef, (snapshot) => {
            const move = snapshot.val();
            if (this.onMoveReceived) {
                this.onMoveReceived(move);
            }
        });
    }

    // Update logic: Progress is the number user just found (e.g., found '1', progress = 1)
    async updateProgress(currentNumberFound) {
        if (!this.currentRoomId) return;

        const updates = {};
        updates[`players/${this.playerId}/progress`] = currentNumberFound;
        await update(this.roomRef, updates);
    }

    getPlayerIdByNumber(num) {
        if (!this.playersMap) return null;
        for (const [id, p] of Object.entries(this.playersMap)) {
            if (p.name.includes(`Player ${num}`)) return id;
        }
        return null;
    }

    // Declare win
    async declareWin(specificWinnerId) {
        if (!this.currentRoomId) return;

        // If specific ID provided, use it. Otherwise default to self (legacy safety)
        const winnerId = specificWinnerId || this.playerId;

        await update(this.roomRef, {
            winner: winnerId
        });
    }

    leaveRoom() {
        if (this.currentRoomId) {
            // Basic cleanup, though onDisconnect handles the heavy lifting if window closes
            // In a real app we might want to be more graceful
            this.currentRoomId = null;
            this.roomRef = null;
        }
    }
}

export default new OnlineManager();
