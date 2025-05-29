const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 游戏配置
const GAME_CONFIG = {
    ALLOW_SINGLE_PLAYER: true, // 设置为true允许单人游戏
    MIN_PLAYERS: 1, // 最少玩家数（可以设置为1或2）
    MAX_PLAYERS: 4,  // 最多玩家数
    NAME_UPDATE_COOLDOWN_MINUTES: 5 // 姓名更新冷卻時間（分鐘）
};

// 姓名更新冷卻追蹤
const nameUpdateCooldowns = new Map(); // Map<playerId, lastUpdateTime>

let deck = [];
let gameState = {
    players: new Map(), // Map<playerId, playerData>
    dealer: null,
    currentPlayerIndex: 0,
    gamePhase: 'waiting', // 'waiting', 'playing', 'dealer_turn', 'ended'
    connectedClients: new Map() // Map<playerId, websocket>
};

function initializeDeck() {
    deck = [];
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    for (const suit of suits) {
        for (const value of values) {
            deck.push({ suit, value });
        }
    }
    deck = deck.sort(() => Math.random() - 0.5); // Shuffle deck
}

function createPlayer(playerId, playerName) {
    return {
        id: playerId,
        name: playerName,
        hand: [],
        score: 0,
        isActive: false,
        hasStood: false,
        isBust: false
    };
}

function createDealer() {
    return {
        id: 'dealer',
        name: 'Dealer',
        hand: [],
        score: 0,
        isActive: false,
        hasStood: false,
        isBust: false
    };
}

function initializeDeck() {
    deck = [];
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    for (const suit of suits) {
        for (const value of values) {
            deck.push({ suit, value });
        }
    }
    deck = deck.sort(() => Math.random() - 0.5); // Shuffle deck
}

function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    for (const card of hand) {
        if (['J', 'Q', 'K'].includes(card.value)) {
            score += 10;
        } else if (card.value === 'A') {
            aces += 1;
            score += 11;
        } else {
            score += parseInt(card.value);
        }
    }
    while (score > 21 && aces > 0) {
        score -= 10;
        aces -= 1;
    }
    return score;
}

function updatePlayerScore(player) {
    player.score = calculateScore(player.hand);
    player.isBust = player.score > 21;
}

function broadcastToAllPlayers(message) {
    gameState.connectedClients.forEach((ws, playerId) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    });
}

function getPlayersArray() {
    return Array.from(gameState.players.values());
}

/**
 * 檢查玩家是否可以更新姓名
 * @param {string} playerId - 玩家ID
 * @returns {boolean} - 是否可以更新姓名
 */
function canUpdatePlayerName(playerId) {
    if (!nameUpdateCooldowns.has(playerId)) {
        return true;
    }

    const lastUpdateTime = nameUpdateCooldowns.get(playerId);
    const now = Date.now();
    const cooldownMillis = GAME_CONFIG.NAME_UPDATE_COOLDOWN_MINUTES * 60 * 1000;
    
    return (now - lastUpdateTime) >= cooldownMillis;
}

/**
 * 獲取玩家姓名更新的剩餘冷卻時間（毫秒）
 * @param {string} playerId - 玩家ID
 * @returns {number} - 剩餘冷卻時間（毫秒）
 */
function getNameUpdateCooldownRemaining(playerId) {
    if (!nameUpdateCooldowns.has(playerId)) {
        return 0;
    }

    const lastUpdateTime = nameUpdateCooldowns.get(playerId);
    const now = Date.now();
    const cooldownMillis = GAME_CONFIG.NAME_UPDATE_COOLDOWN_MINUTES * 60 * 1000;
    const timePassed = now - lastUpdateTime;
    
    return Math.max(0, cooldownMillis - timePassed);
}

/**
 * 記錄玩家姓名更新時間
 * @param {string} playerId - 玩家ID
 */
function recordPlayerNameUpdate(playerId) {
    nameUpdateCooldowns.set(playerId, Date.now());
}

function startNewGame() {
    initializeDeck();
    
    // 重置所有玩家
    gameState.players.forEach(player => {
        player.hand = [];
        player.score = 0;
        player.isActive = false;
        player.hasStood = false;
        player.isBust = false;
    });
    
    // 重置莊家
    gameState.dealer = createDealer();
    gameState.currentPlayerIndex = 0;
    gameState.gamePhase = 'playing';
    
    // 發兩張牌給每個玩家
    gameState.players.forEach(player => {
        player.hand.push(deck.pop(), deck.pop());
        updatePlayerScore(player);
    });
    
    // 發兩張牌給莊家
    gameState.dealer.hand.push(deck.pop(), deck.pop());
    updatePlayerScore(gameState.dealer);
    
    // 設置第一個玩家為活躍
    if (gameState.players.size > 0) {
        const firstPlayer = getPlayersArray()[0];
        firstPlayer.isActive = true;
    }
    
    // 廣播遊戲狀態（隱藏莊家第二張牌）
    const hiddenDealerHand = [
        gameState.dealer.hand[0],
        { suit: 'Hidden', value: 'Hidden' }
    ];
    
    broadcastToAllPlayers({
        action: 'updateGameState',
        players: getPlayersArray(),
        dealer: {
            ...gameState.dealer,
            hand: hiddenDealerHand,
            score: calculateScore([gameState.dealer.hand[0]])
        },
        currentPlayerIndex: gameState.currentPlayerIndex,
        gamePhase: gameState.gamePhase
    });
}

wss.on('connection', (ws) => {
    console.log('A user connected');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data);
            
            if (data.action === 'joinGame') {
                // 玩家加入遊戲
                const playerId = data.playerId;
                const playerName = data.playerName || `Player ${gameState.players.size + 1}`;
                
                if (!gameState.players.has(playerId)) {
                    const newPlayer = createPlayer(playerId, playerName);
                    gameState.players.set(playerId, newPlayer);
                    gameState.connectedClients.set(playerId, ws);
                    
                    console.log(`Player ${playerName} (${playerId}) joined the game`);
                    
                    // 發送加入成功的確認訊息
                    const minPlayers = GAME_CONFIG.ALLOW_SINGLE_PLAYER ? GAME_CONFIG.MIN_PLAYERS : 2;
                    const readyToStart = gameState.players.size >= minPlayers;
                    
                    ws.send(JSON.stringify({
                        action: 'joinedGame',
                        playerId: playerId,
                        playerName: playerName,
                        totalPlayers: gameState.players.size,
                        message: `${playerName} joined the game. ${readyToStart ? 'Ready to start!' : 'Waiting for more players...'}`
                    }));
                    
                    // 如果有足夠玩家且遊戲未開始，準備開始遊戲
                    if (readyToStart && gameState.gamePhase === 'waiting') {
                        console.log('Ready to start game with', gameState.players.size, 'players');
                        
                        // 通知所有玩家可以開始遊戲
                        broadcastToAllPlayers({
                            action: 'readyToStart',
                            totalPlayers: gameState.players.size,
                            message: 'Game is ready to start!'
                        });
                    }
                }
            }
            
            else if (data.action === 'startGame') {
                // 開始新遊戲
                const minPlayers = GAME_CONFIG.ALLOW_SINGLE_PLAYER ? GAME_CONFIG.MIN_PLAYERS : 2;
                
                if (gameState.players.size >= minPlayers) {
                    startNewGame();
                    console.log('Game started with', gameState.players.size, 'players');
                } else {
                    const message = GAME_CONFIG.ALLOW_SINGLE_PLAYER ? 
                        `Need at least ${minPlayers} player(s) to start the game` :
                        'Need at least 2 players to start the game';
                    
                    ws.send(JSON.stringify({
                        action: 'gameOver',
                        result: message
                    }));
                }
            }
            
            else if (data.action === 'playerHit') {
                // 玩家要牌
                const playerId = data.playerId;
                const player = gameState.players.get(playerId);
                
                if (player && player.isActive && gameState.gamePhase === 'playing') {
                    player.hand.push(deck.pop());
                    updatePlayerScore(player);
                    
                    if (player.isBust) {
                        player.hasStood = true;
                        player.isActive = false;
                        moveToNextPlayer();
                    } else {
                        // 更新遊戲狀態
                        broadcastToAllPlayers({
                            action: 'updateGameState',
                            players: getPlayersArray(),
                            dealer: {
                                ...gameState.dealer,
                                hand: [gameState.dealer.hand[0], { suit: 'Hidden', value: 'Hidden' }],
                                score: calculateScore([gameState.dealer.hand[0]])
                            },
                            currentPlayerIndex: gameState.currentPlayerIndex,
                            gamePhase: gameState.gamePhase
                        });
                    }
                }
            }
            
            else if (data.action === 'playerStand') {
                // 玩家停牌
                const playerId = data.playerId;
                const player = gameState.players.get(playerId);
                
                if (player && player.isActive && gameState.gamePhase === 'playing') {
                    player.hasStood = true;
                    player.isActive = false;
                    moveToNextPlayer();
                }
            }
            
            else if (data.action === 'updatePlayerName') {
                // 更新玩家姓名
                const playerId = data.playerId;
                const newPlayerName = data.name || data.playerName; // 支持兩種參數名稱
                const player = gameState.players.get(playerId);
                
                // 檢查冷卻時間
                if (!canUpdatePlayerName(playerId)) {
                    const remainingMs = getNameUpdateCooldownRemaining(playerId);
                    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
                    
                    console.log(`Player ${playerId} name update rejected: Cooldown active (${remainingMinutes} minutes remaining)`);
                    
                    // 發送冷卻錯誤訊息
                    ws.send(JSON.stringify({
                        action: 'nameUpdateFailed',
                        playerId: playerId,
                        message: `姓名更新失敗：冷卻時間未到，請等待 ${remainingMinutes} 分鐘`,
                        cooldownRemaining: remainingMs
                    }));
                    return;
                }
                
                if (player && newPlayerName && newPlayerName.trim().length > 0) {
                    const oldName = player.name;
                    player.name = newPlayerName.trim();
                    
                    // 更新冷卻時間
                    recordPlayerNameUpdate(playerId);
                    
                    console.log(`Player ${playerId} updated name from "${oldName}" to "${player.name}" (Cooldown: ${GAME_CONFIG.NAME_UPDATE_COOLDOWN_MINUTES} minutes)`);
                    
                    // 通知所有玩家姓名更新
                    broadcastToAllPlayers({
                        action: 'playerNameUpdated',
                        playerId: playerId,
                        oldName: oldName,
                        newName: player.name,
                        players: getPlayersArray(),
                        message: `${oldName} 更名為 ${player.name}`
                    });
                    
                    // 發送確認給更新者
                    ws.send(JSON.stringify({
                        action: 'nameUpdateConfirmed',
                        playerId: playerId,
                        playerName: player.name,
                        message: `姓名已更新為: ${player.name}`,
                        cooldownMinutes: GAME_CONFIG.NAME_UPDATE_COOLDOWN_MINUTES
                    }));
                } else {
                    // 發送錯誤訊息
                    ws.send(JSON.stringify({
                        action: 'nameUpdateFailed',
                        playerId: playerId,
                        message: '更新姓名失敗：請提供有效的姓名'
                    }));
                }
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('A user disconnected');
        // 找到並移除斷線的玩家
        for (const [playerId, socket] of gameState.connectedClients) {
            if (socket === ws) {
                gameState.connectedClients.delete(playerId);
                gameState.players.delete(playerId);
                console.log(`Player ${playerId} disconnected and removed from game`);
                break;
            }
        }
    });
});

function moveToNextPlayer() {
    const players = getPlayersArray();
    
    // 找下一個還沒停牌的玩家
    let nextPlayerFound = false;
    for (let i = gameState.currentPlayerIndex + 1; i < players.length; i++) {
        if (!players[i].hasStood && !players[i].isBust) {
            gameState.currentPlayerIndex = i;
            players[i].isActive = true;
            nextPlayerFound = true;
            break;
        }
    }
    
    if (!nextPlayerFound) {
        // 所有玩家都完成了，開始莊家回合
        startDealerTurn();
    } else {
        // 通知輪到下一個玩家
        broadcastToAllPlayers({
            action: 'nextPlayer',
            players: getPlayersArray(),
            currentPlayerIndex: gameState.currentPlayerIndex,
            gamePhase: gameState.gamePhase
        });
    }
}

function startDealerTurn() {
    gameState.gamePhase = 'dealer_turn';
    
    // 莊家自動要牌直到17點或以上
    while (gameState.dealer.score < 17) {
        gameState.dealer.hand.push(deck.pop());
        updatePlayerScore(gameState.dealer);
    }
    
    // 通知莊家回合
    broadcastToAllPlayers({
        action: 'dealerTurn',
        dealer: gameState.dealer,
        gamePhase: gameState.gamePhase
    });
    
    // 延遲一點時間後結束遊戲
    setTimeout(() => {
        endGame();
    }, 2000);
}

function endGame() {
    gameState.gamePhase = 'ended';
    
    // 計算結果
    const results = [];
    const dealerScore = gameState.dealer.score;
    const dealerBust = gameState.dealer.isBust;
    
    gameState.players.forEach(player => {
        let result = '';
        if (player.isBust) {
            result = `${player.name}: Bust! Dealer Wins`;
        } else if (dealerBust) {
            result = `${player.name}: Dealer Bust! Player Wins`;
        } else if (player.score > dealerScore) {
            result = `${player.name}: Player Wins (${player.score} vs ${dealerScore})`;
        } else if (player.score < dealerScore) {
            result = `${player.name}: Dealer Wins (${dealerScore} vs ${player.score})`;
        } else {
            result = `${player.name}: Tie (${player.score})`;
        }
        results.push(result);
    });
    
    // 廣播遊戲結果
    broadcastToAllPlayers({
        action: 'gameOver',
        result: results.join('\n'),
        players: getPlayersArray(),
        dealer: gameState.dealer,
        gamePhase: gameState.gamePhase
    });
    
    console.log('Game ended. Results:', results);
}

server.listen(3000, () => {
    console.log('Multi-player Blackjack Server is running on http://localhost:3000');
    console.log('Waiting for players to join...');
});
