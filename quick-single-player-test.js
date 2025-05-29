/**
 * 快速单人游戏测试
 * 简单快速测试单人游戏功能
 */

const WebSocket = require('ws');

console.log('🎮 快速单人游戏测试');

const socket = new WebSocket('ws://localhost:3000');
const playerId = 'quick_test_' + Date.now();
const playerName = 'QuickTester';

socket.on('open', () => {
    console.log('✅ 连接成功，加入游戏...');
    socket.send(JSON.stringify({ 
        action: 'joinGame', 
        playerId: playerId, 
        playerName: playerName 
    }));
});

socket.on('message', (data) => {
    try {
        const message = JSON.parse(data.toString());
        
        if (message.action === 'joinedGame') {
            console.log(`✅ ${message.message}`);
            if (message.message.includes('Ready to start!')) {
                console.log('🚀 立即开始游戏...');
                socket.send(JSON.stringify({ 
                    action: 'startGame', 
                    playerId: playerId 
                }));
            }
            
        } else if (message.action === 'updateGameState') {
            const player = message.players[0];
            console.log(`📊 玩家: ${player.score}, 莊家: ${message.dealer.score}`);
            
            if (player.isActive && !player.hasStood) {
                // 简单策略：小于17就要牌，否则停牌
                if (player.score < 17) {
                    setTimeout(() => {
                        console.log('🃏 要牌');
                        socket.send(JSON.stringify({
                            action: 'playerHit', 
                            playerId: playerId 
                        }));
                    }, 1000);
                } else {
                    setTimeout(() => {
                        console.log('✋ 停牌');
                        socket.send(JSON.stringify({ 
                            action: 'playerStand', 
                            playerId: playerId 
                        }));
                    }, 1000);
                }
            }
            
        } else if (message.action === 'gameOver') {
            console.log(`🏁 游戏结束: ${message.result}`);
            const player = message.players[0];
            console.log(`📈 最终分数 - 玩家: ${player.score}, 莊家: ${message.dealer.score}`);
            console.log('✅ 测试完成');
            socket.close();
        }
    } catch (error) {
        console.error('❌ 错误:', error);
    }
});

socket.on('error', (error) => {
    console.error('❌ 连接错误:', error);
    console.log('请确保服务器正在运行: node server.js');
});

socket.on('close', () => {
    console.log('🔌 连接关闭');
    process.exit(0);
});

// 10秒超时
setTimeout(() => {
    console.log('⏰ 测试超时');
    socket.close();
    process.exit(1);
}, 10000);
