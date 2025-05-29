/**
 * 21点游戏多人版服务器
 * 支持房间管理、倒计时、超时操作等高级功能
 */

const WebSocket = require('ws');
const http = require('http');
const url = require('url');

// 创建HTTP服务器和WebSocket服务器
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// 常量定义
const DEFAULT_PORT = 3000;
const MAX_PLAYERS_PER_ROOM = 6;
const DEFAULT_COUNTDOWN_SECONDS = 30;
const DEFAULT_PLAYER_TIMEOUT_SECONDS = 30;

// 游戏房间集合
const rooms = new Map();

// 客户端连接集合
const clients = new Map();

// 卡片花色和点数
const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

/**
 * 房间状态枚举
 */
const RoomState = {
    WAITING: 'waiting',
    COUNTDOWN: 'countdown',
    PLAYING: 'playing',
    DEALER_TURN: 'dealer_turn',
    ENDED: 'ended'
};

/**
 * 创建洗好的牌组
 */
function createShuffledDeck() {
    const deck = [];
    
    for (const suit of suits) {
        for (const value of values) {
            deck.push({ suit, value });
        }
    }
    
    // 洗牌
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
}

/**
 * 计算手牌得分
 */
function calculateHandScore(hand) {
    let score = 0;
    let aceCount = 0;
    
    for (const card of hand) {
        if (card.value === 'A') {
            score += 11;
            aceCount++;
        } else if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    }
    
    // 如果总分超过21并且有A，则将A从11点降为1点
    while (score > 21 && aceCount > 0) {
        score -= 10;
        aceCount--;
    }
    
    return score;
}

/**
 * 检查是否爆牌
 */
function isBust(hand) {
    return calculateHandScore(hand) > 21;
}

/**
 * 检查是否为黑杰克
 */
function isBlackjack(hand) {
    return hand.length === 2 && calculateHandScore(hand) === 21;
}

/**
 * 获取唯一房间ID
 */
function generateRoomId() {
    const randomNum = Math.floor(Math.random() * 100000).toString();
    return 'R_' + ('00000' + randomNum).slice(-5);
}

/**
 * 创建新的玩家对象
 */
function createPlayer(id, name) {
    return {
        id,
        name: name || `Player_${id.substring(0, 5)}`,
        hand: [],
        score: 0,
        isActive: false,
        hasStood: false,
        isBust: false,
        isReady: false,
    };
}

/**
 * 创建新的莊家对象
 */
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

/**
 * 创建新的游戏房间
 */
function createRoom(roomId, config) {
    const room = {
        id: roomId,
        players: [],
        dealer: createDealer(),
        deck: [],
        currentPlayerIndex: -1,
        state: RoomState.WAITING,
        
        config: {
            maxPlayers: config.maxPlayers || MAX_PLAYERS_PER_ROOM,
            countdownSeconds: config.countdownSeconds || DEFAULT_COUNTDOWN_SECONDS,
            playerTimeout: {
                enabled: config.playerTimeout?.enabled !== undefined ? config.playerTimeout.enabled : true,
                durationSeconds: config.playerTimeout?.durationSeconds || DEFAULT_PLAYER_TIMEOUT_SECONDS
            },
            autoStart: config.autoStart !== undefined ? config.autoStart : false,
            minPlayers: config.minPlayers || 1
        },
        
        countdownTimer: null,
        playerTimeoutTimer: null,
        countdown: 0
    };
    
    // 存储房间
    rooms.set(roomId, room);
    
    return room;
}

/**
 * 处理新的WebSocket连接
 */
wss.on('connection', (ws, req) => {
    const clientId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
    
    // 存储客户端连接
    clients.set(clientId, {
        ws,
        playerId: null,
        playerName: null,
        roomId: null
    });
    
    console.log(`客户端 ${clientId} 已连接`);
    
    // 处理接收到的消息
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('收到消息:', data);
            
            handleClientMessage(clientId, data);
        } catch (error) {
            console.error('处理消息错误:', error);
            sendError(ws, '无效的消息格式');
        }
    });
    
    // 处理连接关闭
    ws.on('close', () => {
        const client = clients.get(clientId);
        if (client && client.roomId) {
            handlePlayerDisconnect(clientId, client.playerId, client.roomId);
        }
        
        clients.delete(clientId);
        console.log(`客户端 ${clientId} 已断开连接`);
    });
    
    // 处理错误
    ws.on('error', (error) => {
        console.error(`客户端 ${clientId} 错误:`, error);
        clients.delete(clientId);
    });
});

/**
 * 处理客户端消息
 */
function handleClientMessage(clientId, message) {
    const client = clients.get(clientId);
    if (!client) return;
    
    const { ws } = client;
    
    switch (message.action) {
        case 'createRoom':
            handleCreateRoom(clientId, ws, message);
            break;
            
        case 'joinRoom':
            handleJoinRoom(clientId, ws, message);
            break;
            
        case 'leaveRoom':
            handleLeaveRoom(clientId, ws, message);
            break;
            
        case 'playerReady':
            handlePlayerReady(clientId, ws, message);
            break;
            
        case 'joinGame':
            handleJoinGame(clientId, ws, message);
            break;
            
        case 'startGame':
            handleStartGame(clientId, ws, message);
            break;
            
        case 'playerHit':
            handlePlayerHit(clientId, ws, message);
            break;
            
        case 'playerStand':
            handlePlayerStand(clientId, ws, message);
            break;
            
        case 'updatePlayerName':
            handleUpdatePlayerName(clientId, ws, message);
            break;
            
        default:
            console.warn(`未知操作类型: ${message.action}`);
            sendError(ws, '未知操作类型');
    }
}

/**
 * 处理创建房间请求
 */
function handleCreateRoom(clientId, ws, message) {
    const playerId = message.playerId || clientId;
    const playerName = message.playerName || `Player_${playerId.substring(0, 5)}`;
    
    // 生成房间ID
    const roomId = message.roomId || generateRoomId();
    
    // 检查房间是否已存在
    if (rooms.has(roomId)) {
        sendError(ws, '房间已存在');
        return;
    }
    
    // 创建房间
    const room = createRoom(roomId, message.roomConfig || {});
    
    // 更新客户端信息
    const client = clients.get(clientId);
    if (client) {
        client.playerId = playerId;
        client.playerName = playerName;
        client.roomId = roomId;
    }
    
    // 添加玩家到房间
    const player = createPlayer(playerId, playerName);
    room.players.push(player);
    
    // 发送房间创建成功响应
    ws.send(JSON.stringify({
        action: 'roomCreated',
        roomId,
        roomConfig: room.config,
        players: room.players,
        message: `房间 ${roomId} 创建成功`
    }));
    
    console.log(`玩家 ${playerName} (${playerId}) 创建了房间 ${roomId}`);
}

/**
 * 处理加入房间请求
 */
function handleJoinRoom(clientId, ws, message) {
    const playerId = message.playerId || clientId;
    const playerName = message.playerName || `Player_${playerId.substring(0, 5)}`;
    const roomId = message.roomId;
    
    // 检查房间是否存在
    const room = rooms.get(roomId);
    if (!room) {
        sendError(ws, '房间不存在');
        return;
    }
    
    // 检查房间是否已满
    if (room.players.length >= room.config.maxPlayers) {
        sendError(ws, '房间已满');
        return;
    }
    
    // 检查游戏是否已经开始
    if (room.state !== RoomState.WAITING && room.state !== RoomState.COUNTDOWN) {
        sendError(ws, '游戏已经开始，无法加入');
        return;
    }
    
    // 检查玩家是否已在房间
    const existingPlayerIndex = room.players.findIndex(p => p.id === playerId);
    if (existingPlayerIndex >= 0) {
        sendError(ws, '你已经在房间中');
        return;
    }
    
    // 更新客户端信息
    const client = clients.get(clientId);
    if (client) {
        client.playerId = playerId;
        client.playerName = playerName;
        client.roomId = roomId;
    }
    
    // 添加玩家到房间
    const player = createPlayer(playerId, playerName);
    room.players.push(player);
    
    // 发送加入房间成功响应
    ws.send(JSON.stringify({
        action: 'roomJoined',
        roomId,
        players: room.players,
        roomState: room.state,
        message: `成功加入房间 ${roomId}`
    }));
    
    // 通知房间中的其他玩家
    broadcastToRoom(roomId, {
        action: 'playerJoined',
        roomId,
        player,
        players: room.players,
        message: `玩家 ${playerName} 加入了房间`
    }, playerId);
    
    console.log(`玩家 ${playerName} (${playerId}) 加入了房间 ${roomId}`);
    
    // 如果自动开始并且玩家人数达到最大，开始倒计时
    if (room.config.autoStart && room.players.length >= room.config.maxPlayers) {
        startRoomCountdown(roomId);
    }
}

/**
 * 处理离开房间请求
 */
function handleLeaveRoom(clientId, ws, message) {
    const playerId = message.playerId || clientId;
    const roomId = message.roomId;
    
    // 检查房间是否存在
    const room = rooms.get(roomId);
    if (!room) {
        sendError(ws, '房间不存在');
        return;
    }
    
    // 查找玩家
    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex < 0) {
        sendError(ws, '你不在该房间中');
        return;
    }
    
    // 获取玩家名称
    const playerName = room.players[playerIndex].name;
    
    // 从房间中移除玩家
    room.players.splice(playerIndex, 1);
    
    // 更新客户端信息
    const client = clients.get(clientId);
    if (client) {
        client.roomId = null;
    }
    
    // 发送离开房间成功响应
    ws.send(JSON.stringify({
        action: 'roomLeft',
        playerId,
        roomId,
        message: `成功离开房间 ${roomId}`
    }));
    
    // 通知房间中的其他玩家
    broadcastToRoom(roomId, {
        action: 'playerLeft',
        roomId,
        playerId,
        players: room.players,
        message: `玩家 ${playerName} 离开了房间`
    });
    
    console.log(`玩家 ${playerName} (${playerId}) 离开了房间 ${roomId}`);
    
    // 如果房间已空，销毁房间
    if (room.players.length === 0) {
        destroyRoom(roomId);
    } else if (room.state === RoomState.PLAYING && playerIndex === room.currentPlayerIndex) {
        // 如果是当前玩家离开，移至下一玩家
        progressToNextPlayer(room);
    }
}

/**
 * 处理玩家准备请求
 */
function handlePlayerReady(clientId, ws, message) {
    const playerId = message.playerId || clientId;
    const roomId = message.roomId;
    
    // 检查房间是否存在
    const room = rooms.get(roomId);
    if (!room) {
        sendError(ws, '房间不存在');
        return;
    }
    
    // 查找玩家
    const player = room.players.find(p => p.id === playerId);
    if (!player) {
        sendError(ws, '你不在该房间中');
        return;
    }
    
    // 标记玩家为准备状态
    player.isReady = true;
    
    // 发送准备成功响应
    ws.send(JSON.stringify({
        action: 'playerReady',
        roomId,
        playerId,
        message: '准备完成'
    }));
    
    // 通知房间中的其他玩家
    broadcastToRoom(roomId, {
        action: 'playerReadyStatus',
        roomId,
        playerId,
        isReady: true,
        players: room.players,
        message: `玩家 ${player.name} 已准备`
    });
    
    console.log(`玩家 ${player.name} (${playerId}) 在房间 ${roomId} 中已准备`);
    
    // 检查是否所有玩家都已准备
    const allReady = room.players.every(p => p.isReady);
    
    // 如果所有玩家都已准备且玩家数量足够，开始倒计时
    if (allReady && room.players.length >= room.config.minPlayers) {
        startRoomCountdown(roomId);
    }
}

/**
 * 处理玩家加入游戏请求（不需要房间系统时使用）
 */
function handleJoinGame(clientId, ws, message) {
    const playerId = message.playerId || clientId;
    const playerName = message.playerName || `Player_${playerId.substring(0, 5)}`;
    
    // 检查是否已加入房间
    const client = clients.get(clientId);
    if (client && client.roomId) {
        // 已经在房间中，无需处理
        return;
    }
    
    // 寻找可用的房间或创建新房间
    let roomId;
    let room;
    
    // 查找一个等待状态的房间
    for (const [rId, r] of rooms.entries()) {
        if (r.state === RoomState.WAITING && r.players.length < r.config.maxPlayers) {
            roomId = rId;
            room = r;
            break;
        }
    }
    
    // 如果没有找到合适的房间，创建一个新房间
    if (!room) {
        roomId = generateRoomId();
        room = createRoom(roomId, {});
        console.log(`创建默认房间 ${roomId}`);
    }
    
    // 更新客户端信息
    if (client) {
        client.playerId = playerId;
        client.playerName = playerName;
        client.roomId = roomId;
    }
    
    // 添加玩家到房间
    const player = createPlayer(playerId, playerName);
    room.players.push(player);
    
    // 发送加入游戏成功响应
    ws.send(JSON.stringify({
        action: 'joinedGame',
        roomId,
        playerId,
        players: room.players,
        message: `成功加入游戏，房间ID: ${roomId}`
    }));
    
    // 通知房间中的其他玩家
    broadcastToRoom(roomId, {
        action: 'playerJoined',
        roomId,
        player,
        players: room.players,
        message: `玩家 ${playerName} 加入了游戏`
    }, playerId);
    
    console.log(`玩家 ${playerName} (${playerId}) 加入了游戏，房间: ${roomId}`);
}

/**
 * 处理开始游戏请求
 */
function handleStartGame(clientId, ws, message) {
    const playerId = message.playerId || clientId;
    const client = clients.get(clientId);
    
    if (!client || !client.roomId) {
        sendError(ws, '你不在任何房间中');
        return;
    }
    
    const roomId = client.roomId;
    const room = rooms.get(roomId);
    
    if (!room) {
        sendError(ws, '房间不存在');
        return;
    }
    
    if (room.state === RoomState.PLAYING || room.state === RoomState.DEALER_TURN) {
        sendError(ws, '游戏已经开始');
        return;
    }
    
    if (room.players.length < room.config.minPlayers) {
        sendError(ws, `至少需要 ${room.config.minPlayers} 位玩家才能开始游戏`);
        return;
    }
    
    // 如果当前正在倒计时，停止倒计时并直接开始游戏
    if (room.countdownTimer) {
        clearInterval(room.countdownTimer);
        room.countdownTimer = null;
    }
    
    startGame(roomId);
}

/**
 * 处理玩家要牌请求
 */
function handlePlayerHit(clientId, ws, message) {
    const playerId = message.playerId || clientId;
    const client = clients.get(clientId);
    
    if (!client || !client.roomId) {
        sendError(ws, '你不在任何房间中');
        return;
    }
    
    const roomId = client.roomId;
    const room = rooms.get(roomId);
    
    if (!room || room.state !== RoomState.PLAYING) {
        sendError(ws, '游戏未在进行中');
        return;
    }
    
    // 检查是否为当前玩家
    if (room.currentPlayerIndex < 0 || room.currentPlayerIndex >= room.players.length) {
        sendError(ws, '游戏状态异常');
        return;
    }
    
    const currentPlayer = room.players[room.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
        sendError(ws, '不是你的回合');
        return;
    }
    
    // 检查玩家是否已经停牌或爆牌
    if (currentPlayer.hasStood || currentPlayer.isBust) {
        sendError(ws, '你已经停牌或爆牌');
        return;
    }
    
    // 取消超时计时器
    clearPlayerTimeout(room);
    
    // 发牌给玩家
    const card = dealCard(room);
    currentPlayer.hand.push(card);
    
    // 计算新的分数
    currentPlayer.score = calculateHandScore(currentPlayer.hand);
    
    // 检查是否爆牌
    if (currentPlayer.score > 21) {
        currentPlayer.isBust = true;
        
        // 广播玩家爆牌消息
        broadcastToRoom(roomId, {
            action: 'playerBust',
            roomId,
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            card,
            score: currentPlayer.score,
            message: `玩家 ${currentPlayer.name} 爆牌了! 分数: ${currentPlayer.score}`
        });
        
        // 进入下一个玩家回合
        progressToNextPlayer(room);
    } else {
        // 广播玩家要牌消息
        broadcastToRoom(roomId, {
            action: 'playerHit',
            roomId,
            playerId: currentPlayer.id,
            playerName: currentPlayer.name,
            card,
            score: currentPlayer.score,
            message: `玩家 ${currentPlayer.name} 要了一张牌`
        });
        
        // 更新游戏状态
        broadcastGameState(room);
        
        // 如果玩家没有爆牌，设置新的超时计时器
        startPlayerTimeout(room);
    }
}

/**
 * 处理玩家停牌请求
 */
function handlePlayerStand(clientId, ws, message) {
    const playerId = message.playerId || clientId;
    const client = clients.get(clientId);
    
    if (!client || !client.roomId) {
        sendError(ws, '你不在任何房间中');
        return;
    }
    
    const roomId = client.roomId;
    const room = rooms.get(roomId);
    
    if (!room || room.state !== RoomState.PLAYING) {
        sendError(ws, '游戏未在进行中');
        return;
    }
    
    // 检查是否为当前玩家
    if (room.currentPlayerIndex < 0 || room.currentPlayerIndex >= room.players.length) {
        sendError(ws, '游戏状态异常');
        return;
    }
    
    const currentPlayer = room.players[room.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
        sendError(ws, '不是你的回合');
        return;
    }
    
    // 检查玩家是否已经停牌或爆牌
    if (currentPlayer.hasStood || currentPlayer.isBust) {
        sendError(ws, '你已经停牌或爆牌');
        return;
    }
    
    // 取消超时计时器
    clearPlayerTimeout(room);
    
    // 标记玩家为停牌状态
    currentPlayer.hasStood = true;
    
    // 广播玩家停牌消息
    broadcastToRoom(roomId, {
        action: 'playerStand',
        roomId,
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        score: currentPlayer.score,
        message: `玩家 ${currentPlayer.name} 选择停牌`
    });
    
    // 进入下一个玩家回合
    progressToNextPlayer(room);
}

/**
 * 处理更新玩家名称请求
 */
function handleUpdatePlayerName(clientId, ws, message) {
    const playerId = message.playerId || clientId;
    const newName = message.name;
    
    if (!newName || newName.trim().length === 0) {
        sendError(ws, '无效的玩家名称');
        return;
    }
    
    const client = clients.get(clientId);
    if (!client) {
        sendError(ws, '客户端状态异常');
        return;
    }
    
    // 保存旧名称
    const oldName = client.playerName;
    
    // 更新客户端信息
    client.playerName = newName;
    
    // 如果在房间中，更新房间中的玩家名称
    if (client.roomId) {
        const room = rooms.get(client.roomId);
        if (room) {
            const player = room.players.find(p => p.id === playerId);
            if (player) {
                // 更新玩家名称
                player.name = newName;
                
                // 广播名称变更
                broadcastToRoom(client.roomId, {
                    action: 'playerNameUpdated',
                    roomId: client.roomId,
                    playerId,
                    oldName: oldName || '未知',
                    newName,
                    players: room.players,
                    message: `玩家 ${oldName || '未知'} 更名为 ${newName}`
                });
            }
        }
    }
    
    // 发送名称更新成功响应
    ws.send(JSON.stringify({
        action: 'nameUpdateConfirmed',
        playerId,
        oldName: oldName || '未知',
        newName,
        message: '名称更新成功'
    }));
    
    console.log(`玩家 ${oldName || playerId} 更名为 ${newName}`);
}

/**
 * 处理玩家断线
 */
function handlePlayerDisconnect(clientId, playerId, roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    // 查找玩家
    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex < 0) return;
    
    // 获取玩家名称
    const playerName = room.players[playerIndex].name;
    
    // 从房间中移除玩家
    room.players.splice(playerIndex, 1);
    
    // 通知房间中的其他玩家
    broadcastToRoom(roomId, {
        action: 'playerDisconnected',
        roomId,
        playerId,
        players: room.players,
        message: `玩家 ${playerName} 断线离开了房间`
    });
    
    console.log(`玩家 ${playerName} (${playerId}) 断线离开了房间 ${roomId}`);
    
    // 如果房间已空，销毁房间
    if (room.players.length === 0) {
        destroyRoom(roomId);
    } else if (room.state === RoomState.PLAYING && playerIndex === room.currentPlayerIndex) {
        // 如果是当前玩家离开，移至下一玩家
        progressToNextPlayer(room);
    }
}

/**
 * 开始房间倒计时
 */
function startRoomCountdown(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    // 如果已经在倒计时或游戏已开始，不再重复倒计时
    if (room.countdownTimer || room.state !== RoomState.WAITING) return;
    
    room.state = RoomState.COUNTDOWN;
    room.countdown = room.config.countdownSeconds;
    
    // 广播倒计时开始
    broadcastToRoom(roomId, {
        action: 'countdownStarted',
        roomId,
        seconds: room.countdown,
        message: `游戏将在 ${room.countdown} 秒后开始`
    });
    
    // 开始倒计时
    room.countdownTimer = setInterval(() => {
        room.countdown--;
        
        // 广播倒计时更新
        if (room.countdown % 5 === 0 || room.countdown <= 5) {
            broadcastToRoom(roomId, {
                action: 'countdownUpdate',
                roomId,
                seconds: room.countdown,
                message: room.countdown > 0 ? `游戏将在 ${room.countdown} 秒后开始` : '游戏即将开始'
            });
        }
        
        // 倒计时结束，开始游戏
        if (room.countdown <= 0) {
            clearInterval(room.countdownTimer);
            room.countdownTimer = null;
            
            startGame(roomId);
        }
    }, 1000);
    
    console.log(`房间 ${roomId} 开始倒计时: ${room.countdown} 秒`);
}

/**
 * 开始玩家操作超时计时
 */
function startPlayerTimeout(room) {
    if (!room || !room.config.playerTimeout.enabled) return;
    
    // 如果已有计时器，先清除
    clearPlayerTimeout(room);
    
    const timeoutSeconds = room.config.playerTimeout.durationSeconds;
    const currentPlayer = room.players[room.currentPlayerIndex];
    
    // 广播超时开始
    broadcastToRoom(room.id, {
        action: 'playerTimeoutStarted',
        roomId: room.id,
        playerId: currentPlayer.id,
        seconds: timeoutSeconds,
        message: `玩家 ${currentPlayer.name} 有 ${timeoutSeconds} 秒时间操作`
    });
    
    // 开始超时计时
    room.playerTimeoutTimer = setTimeout(() => {
        console.log(`玩家 ${currentPlayer.name} 操作超时，自动停牌`);
        
        // 自动停牌
        currentPlayer.hasStood = true;
        
        // 广播超时消息
        broadcastToRoom(room.id, {
            action: 'playerTimeout',
            roomId: room.id,
            playerId: currentPlayer.id,
            message: `玩家 ${currentPlayer.name} 操作超时，自动停牌`
        });
        
        // 进入下一个玩家回合
        progressToNextPlayer(room);
    }, timeoutSeconds * 1000);
}

/**
 * 清除玩家操作超时计时器
 */
function clearPlayerTimeout(room) {
    if (room.playerTimeoutTimer) {
        clearTimeout(room.playerTimeoutTimer);
        room.playerTimeoutTimer = null;
    }
}

/**
 * 开始游戏
 */
function startGame(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    console.log(`房间 ${roomId} 游戏开始`);
    
    // 重置房间状态
    room.state = RoomState.PLAYING;
    room.deck = createShuffledDeck();
    room.dealer.hand = [];
    room.dealer.score = 0;
    room.dealer.isBust = false;
    
    // 重置所有玩家状态
    for (const player of room.players) {
        player.hand = [];
        player.score = 0;
        player.isActive = false;
        player.hasStood = false;
        player.isBust = false;
        player.isReady = false;  // 重置准备状态，为下一局做准备
    }
    
    // 发初始牌
    // 先给每个玩家发一张牌
    for (const player of room.players) {
        player.hand.push(dealCard(room));
    }
    
    // 给莊家发一张牌
    room.dealer.hand.push(dealCard(room));
    
    // 再给每个玩家发一张牌
    for (const player of room.players) {
        player.hand.push(dealCard(room));
        player.score = calculateHandScore(player.hand);
    }
    
    // 给莊家发第二张牌
    room.dealer.hand.push(dealCard(room));
    room.dealer.score = calculateHandScore(room.dealer.hand);
    
    // 设置第一个玩家为当前玩家
    room.currentPlayerIndex = 0;
    if (room.players.length > 0) {
        room.players[0].isActive = true;
    }
    
    // 广播游戏开始和当前状态
    broadcastToRoom(roomId, {
        action: 'gameStarted',
        roomId,
        message: '游戏开始!'
    });
    
    // 广播游戏状态
    broadcastGameState(room);
    
    // 启动第一个玩家的超时计时
    startPlayerTimeout(room);
}

/**
 * 进入下一个玩家回合
 */
function progressToNextPlayer(room) {
    // 清除当前超时计时器
    clearPlayerTimeout(room);
    
    // 重置当前玩家的活跃状态
    if (room.currentPlayerIndex >= 0 && room.currentPlayerIndex < room.players.length) {
        room.players[room.currentPlayerIndex].isActive = false;
    }
    
    // 找到下一个未停牌且未爆牌的玩家
    let nextPlayerIndex = room.currentPlayerIndex + 1;
    let foundNextPlayer = false;
    
    while (nextPlayerIndex < room.players.length) {
        const player = room.players[nextPlayerIndex];
        if (!player.hasStood && !player.isBust) {
            foundNextPlayer = true;
            break;
        }
        nextPlayerIndex++;
    }
    
    if (foundNextPlayer) {
        // 设置下一个玩家为活跃
        room.currentPlayerIndex = nextPlayerIndex;
        room.players[nextPlayerIndex].isActive = true;
        
        // 广播下一玩家回合
        broadcastToRoom(room.id, {
            action: 'playerTurn',
            roomId: room.id,
            currentPlayer: room.players[nextPlayerIndex],
            currentPlayerIndex: nextPlayerIndex,
            players: room.players,
            message: `轮到玩家 ${room.players[nextPlayerIndex].name} 出牌`
        });
        
        // 启动玩家超时计时器
        startPlayerTimeout(room);
    } else {
        // 所有玩家都已完成操作，进入莊家回合
        startDealerTurn(room);
    }
}

/**
 * 开始莊家回合
 */
function startDealerTurn(room) {
    room.state = RoomState.DEALER_TURN;
    room.dealer.isActive = true;
    
    // 广播莊家回合开始
    broadcastToRoom(room.id, {
        action: 'dealerTurn',
        roomId: room.id,
        message: '莊家回合开始'
    });
    
    // 莊家按规则要牌（小于17点时继续要牌）
    let dealerFinished = false;
    
    const dealerPlay = () => {
        // 计算莊家当前分数
        room.dealer.score = calculateHandScore(room.dealer.hand);
        
        // 显示莊家的牌
        broadcastToRoom(room.id, {
            action: 'updateGameState',
            roomId: room.id,
            gamePhase: 'dealer_turn',
            players: room.players,
            dealer: room.dealer,
            message: `莊家的牌点数: ${room.dealer.score}`
        });
        
        // 检查是否需要继续要牌
        if (room.dealer.score < 17) {
            // 延迟一秒，模拟思考时间
            setTimeout(() => {
                // 莊家要牌
                const card = dealCard(room);
                room.dealer.hand.push(card);
                room.dealer.score = calculateHandScore(room.dealer.hand);
                
                // 广播莊家要牌
                broadcastToRoom(room.id, {
                    action: 'dealerHit',
                    roomId: room.id,
                    card,
                    dealerScore: room.dealer.score,
                    message: `莊家要了一张牌: ${card.value} of ${card.suit}`
                });
                
                // 检查是否爆牌
                if (room.dealer.score > 21) {
                    room.dealer.isBust = true;
                    
                    // 广播莊家爆牌
                    broadcastToRoom(room.id, {
                        action: 'dealerBust',
                        roomId: room.id,
                        dealerScore: room.dealer.score,
                        message: '莊家爆牌!'
                    });
                    
                    // 结束游戏
                    endGame(room);
                } else {
                    // 继续莊家的回合
                    dealerPlay();
                }
            }, 1000);
        } else {
            // 莊家不需要要牌，结束游戏
            broadcastToRoom(room.id, {
                action: 'dealerStand',
                roomId: room.id,
                dealerScore: room.dealer.score,
                message: `莊家停牌，点数: ${room.dealer.score}`
            });
            
            // 结束游戏
            endGame(room);
        }
    };
    
    // 开始莊家的回合
    setTimeout(() => {
        dealerPlay();
    }, 1000);
}

/**
 * 结束游戏并结算
 */
function endGame(room) {
    room.state = RoomState.ENDED;
    
    // 计算游戏结果
    const results = [];
    const dealerScore = room.dealer.score;
    const dealerBust = room.dealer.isBust;
    
    for (const player of room.players) {
        let result = '';
        
        if (player.isBust) {
            result = `玩家 ${player.name} 爆牌，得分: ${player.score}`;
            results.push(result);
            continue;
        }
        
        if (dealerBust) {
            result = `玩家 ${player.name} 获胜! 莊家爆牌，玩家得分: ${player.score}`;
        } else if (player.score > dealerScore) {
            result = `玩家 ${player.name} 获胜! 得分: ${player.score}，莊家: ${dealerScore}`;
        } else if (player.score < dealerScore) {
            result = `玩家 ${player.name} 失败. 得分: ${player.score}，莊家: ${dealerScore}`;
        } else {
            result = `玩家 ${player.name} 平局. 得分: ${player.score}，莊家: ${dealerScore}`;
        }
        
        results.push(result);
    }
    
    // 广播游戏结束
    broadcastToRoom(room.id, {
        action: 'gameOver',
        roomId: room.id,
        result: results.join('\n'),
        players: room.players,
        dealer: room.dealer,
        message: '游戏结束，请查看结果'
    });
    
    console.log(`房间 ${room.id} 游戏结束: ${results.join(' | ')}`);
    
    // 重置房间状态为等待
    room.state = RoomState.WAITING;
}

/**
 * 发牌
 */
function dealCard(room) {
    // 如果牌组已空，创建新牌组
    if (room.deck.length === 0) {
        room.deck = createShuffledDeck();
    }
    
    // 从牌组中取一张牌
    return room.deck.pop();
}

/**
 * 广播游戏状态
 */
function broadcastGameState(room) {
    broadcastToRoom(room.id, {
        action: 'updateGameState',
        roomId: room.id,
        gamePhase: room.state,
        players: room.players,
        currentPlayerIndex: room.currentPlayerIndex,
        dealer: hideSecondCard(room.dealer)
    });
}

/**
 * 隐藏莊家的第二张牌
 */
function hideSecondCard(dealer) {
    if (!dealer || !dealer.hand || dealer.hand.length < 2) {
        return dealer;
    }
    
    const hiddenDealer = { ...dealer };
    hiddenDealer.hand = [...dealer.hand];
    
    // 计算仅显示第一张牌时的分数
    const firstCardValue = dealer.hand[0].value;
    if (firstCardValue === 'A') {
        hiddenDealer.score = 11;
    } else if (['J', 'Q', 'K'].includes(firstCardValue)) {
        hiddenDealer.score = 10;
    } else {
        hiddenDealer.score = parseInt(firstCardValue);
    }
    
    // 隐藏第二张牌
    hiddenDealer.hand[1] = { suit: 'Hidden', value: 'Hidden' };
    
    return hiddenDealer;
}

/**
 * 销毁房间
 */
function destroyRoom(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    // 清理计时器
    if (room.countdownTimer) {
        clearInterval(room.countdownTimer);
    }
    
    if (room.playerTimeoutTimer) {
        clearTimeout(room.playerTimeoutTimer);
    }
    
    // 从房间集合中移除
    rooms.delete(roomId);
    
    console.log(`房间 ${roomId} 已销毁`);
}

/**
 * 向房间中的所有玩家广播消息
 */
function broadcastToRoom(roomId, message, excludePlayerId = null) {
    const room = rooms.get(roomId);
    if (!room) return;
    
    // 获取房间中的所有玩家
    for (const [clientId, client] of clients.entries()) {
        if (client.roomId === roomId && client.playerId !== excludePlayerId) {
            try {
                client.ws.send(JSON.stringify(message));
            } catch (error) {
                console.error(`向客户端 ${clientId} 发送消息失败:`, error);
            }
        }
    }
}

/**
 * 发送错误消息
 */
function sendError(ws, message) {
    try {
        ws.send(JSON.stringify({
            action: 'error',
            message
        }));
    } catch (error) {
        console.error('发送错误消息失败:', error);
    }
}

// 启动服务器
const port = process.env.PORT || DEFAULT_PORT;
server.listen(port, () => {
    console.log(`21点游戏多人版服务器已启动，监听端口 ${port}`);
    console.log(`支持最多 ${MAX_PLAYERS_PER_ROOM} 人的多人游戏，倒计时 ${DEFAULT_COUNTDOWN_SECONDS} 秒`);
});