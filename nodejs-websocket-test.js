/**
 * Node.js WebSocket測試腳本
 * 用於在服務器端測試WebSocket連接（更新為多人遊戲協議）
 * 使用方法: node nodejs-websocket-test.js
 */

const WebSocket = require('ws');

function nodeTestWebSocket() {
    console.log('=== Node.js WebSocket測試（多人遊戲協議）===');
    
    const socket = new WebSocket('ws://localhost:3000');
    const playerId = 'test_player_001';
    const playerName = 'TestPlayer';
    let gameStarted = false;
    
    socket.on('open', () => {
        console.log('✅ WebSocket連接成功');
        console.log('📤 發送加入遊戲請求');
        socket.send(JSON.stringify({ 
            action: 'joinGame', 
            playerId: playerId, 
            playerName: playerName 
        }));
    });
    
    socket.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log('📥 收到訊息:', message);
            
            if (message.action === 'joinedGame') {
                console.log(`✅ 成功加入遊戲！玩家: ${message.playerName}, 總玩家數: ${message.totalPlayers}`);
                console.log(`ℹ️  ${message.message}`);
                
                // 如果只有一個玩家，嘗試開始遊戲（預期會失敗）
                if (message.totalPlayers === 1) {
                    setTimeout(() => {
                        console.log('📤 嘗試開始遊戲（預期失敗）');
                        socket.send(JSON.stringify({ 
                            action: 'startGame', 
                            playerId: playerId 
                        }));
                    }, 1000);
                }
            } else if (message.action === 'readyToStart') {
                console.log('🎮 遊戲準備就緒！');
                setTimeout(() => {
                    console.log('📤 開始遊戲');
                    socket.send(JSON.stringify({ 
                        action: 'startGame', 
                        playerId: playerId 
                    }));
                    gameStarted = true;
                }, 1000);
            } else if (message.action === 'gameOver' && message.result.includes('Need at least 2 players')) {
                console.log('ℹ️  這是預期的結果：遊戲需要至少2個玩家');
                console.log('✅ 單人連接測試成功');
                socket.close();
                return;
            } else if (message.action === 'updateGameState' && gameStarted) {
                const player = message.players ? message.players.find(p => p.id === playerId) : null;
                if (player) {
                    console.log(`🎮 玩家狀態 - 分數: ${player.score}, 是否輪到: ${player.isActive}`);
                    
                    if (player.isActive && !player.hasStood && player.score < 17) {
                        setTimeout(() => {
                            console.log('📤 測試要牌');
                            socket.send(JSON.stringify({ 
                                action: 'playerHit', 
                                playerId: playerId 
                            }));
                        }, 1000);
                    } else if (player.isActive && !player.hasStood) {
                        setTimeout(() => {
                            console.log('📤 測試停牌');
                            socket.send(JSON.stringify({ 
                                action: 'playerStand', 
                                playerId: playerId 
                            }));
                        }, 1000);
                    }
                }
            } else if (message.action === 'nextPlayer') {
                console.log('👥 輪到下一位玩家');
            } else if (message.action === 'dealerTurn') {
                console.log('🃏 莊家開始行動');
            } else if (message.action === 'gameOver') {
                console.log(`🏁 遊戲結束: ${message.result}`);
                if (message.players) {
                    message.players.forEach(player => {
                        console.log(`📊 ${player.name}: ${player.score}分 ${player.isBust ? '(爆牌)' : ''}`);
                    });
                }
                if (message.dealer) {
                    console.log(`📊 莊家: ${message.dealer.score}分`);
                }
                socket.close();
            }
        } catch (error) {
            console.error('❌ 解析失敗:', error);
        }
    });
    
    socket.on('error', (error) => {
        console.error('❌ 錯誤:', error);
    });
    
    socket.on('close', () => {
        console.log('🔌 連接已關閉');
        console.log('=== Node.js WebSocket測試完成 ===');
        process.exit(0);
    });
    
    // 超時處理
    setTimeout(() => {
        console.log('⏰ 測試超時，關閉連接');
        socket.close();
        process.exit(1);
    }, 10000);
}

// 檢查服務器是否運行
function checkServer() {
    console.log('🔍 檢查服務器狀態...');
    
    const testSocket = new WebSocket('ws://localhost:3000');
    
    testSocket.on('open', () => {
        console.log('✅ 服務器運行正常');
        testSocket.close();
        // 開始正式測試
        setTimeout(nodeTestWebSocket, 500);
    });
    
    testSocket.on('error', (error) => {
        console.log('❌ 服務器未運行或連接失敗');
        console.log('請先啟動服務器: node server.js');
        process.exit(1);
    });
}

// 執行檢查
checkServer();
