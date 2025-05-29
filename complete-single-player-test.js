/**
 * 完整的单人游戏测试
 * 测试完整的单人游戏流程：加入 → 开始 → 玩牌 → 结束
 */

const WebSocket = require('ws');

function runCompleteGameTest() {
    console.log('=== 完整单人游戏测试 ===');
    
    const socket = new WebSocket('ws://localhost:3000');
    const playerId = 'solo_player_001';
    const playerName = 'SoloPlayer';
    
    socket.on('open', () => {
        console.log('✅ 连接成功');
        console.log('📤 1. 加入游戏...');
        socket.send(JSON.stringify({ 
            action: 'joinGame', 
            playerId: playerId, 
            playerName: playerName 
        }));
    });
    
    socket.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log('📥 收到消息:', message.action);
            
            if (message.action === 'joinedGame') {
                console.log(`✅ 加入成功！${message.message}`);
                // 如果消息中包含"Ready to start!"，立即發送開始遊戲請求
                if (message.message.includes('Ready to start!')) {
                    setTimeout(() => {
                        console.log('📤 2. 开始游戏...');
                        socket.send(JSON.stringify({ 
                            action: 'startGame', 
                            playerId: playerId 
                        }));
                    }, 1000);
                }
                
            } else if (message.action === 'readyToStart') {
                console.log('🎮 准备开始游戏');
                setTimeout(() => {
                    console.log('📤 2. 开始游戏...');
                    socket.send(JSON.stringify({ 
                        action: 'startGame', 
                        playerId: playerId 
                    }));
                }, 1000);
                
            } else if (message.action === 'updateGameState') {
                const player = message.players[0];
                console.log(`🎯 玩家分数: ${player.score}, 莊家分数: ${message.dealer.score}`);
                
                if (player.isActive && !player.hasStood) {
                    if (player.score < 17) {
                        setTimeout(() => {
                            console.log('📤 3. 要牌...');
                            socket.send(JSON.stringify({ 
                                action: 'playerHit', 
                                playerId: playerId 
                            }));
                        }, 1500);
                    } else {
                        setTimeout(() => {
                            console.log('📤 4. 停牌...');
                            socket.send(JSON.stringify({ 
                                action: 'playerStand', 
                                playerId: playerId 
                            }));
                        }, 1500);
                    }
                }
                
            } else if (message.action === 'dealerTurn') {
                console.log('🎰 莊家开始行动');
                console.log(`🎯 莊家最终分数: ${message.dealer.score}`);
                
            } else if (message.action === 'gameOver') {
                console.log('🏁 游戏结束！');
                console.log(`📊 结果: ${message.result}`);
                
                const player = message.players[0];
                console.log(`📈 最终分数 - 玩家: ${player.score}, 莊家: ${message.dealer.score}`);
                console.log(`🎮 玩家状态: ${player.isBust ? '爆牌' : '正常'}`);
                
                console.log('✅ 单人游戏测试完成！');
                socket.close();
            }
        } catch (error) {
            console.error('❌ 解析消息失败:', error);
        }
    });
    
    socket.on('error', (error) => {
        console.error('❌ 连接错误:', error);
    });
    
    socket.on('close', () => {
        console.log('🔌 连接已关闭');
        console.log('=== 单人游戏测试结束 ===');
        process.exit(0);
    });
    
    // 超时处理
    setTimeout(() => {
        console.log('⏰ 测试超时');
        socket.close();
        process.exit(1);
    }, 30000);
}

// 检查服务器
function checkServer() {
    console.log('🔍 检查服务器状态...');
    
    const testSocket = new WebSocket('ws://localhost:3000');
    
    testSocket.on('open', () => {
        console.log('✅ 服务器运行正常');
        testSocket.close();
        setTimeout(runCompleteGameTest, 500);
    });
    
    testSocket.on('error', (error) => {
        console.log('❌ 服务器未运行或连接失败');
        console.log('请先启动服务器: node server.js');
        process.exit(1);
    });
}

checkServer();
