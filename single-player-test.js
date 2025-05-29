/**
 * 单人玩家测试脚本
 * 测试单个玩家连接和基本功能
 */

const WebSocket = require('ws');

function testSinglePlayer() {
    console.log('=== 单人玩家功能测试 ===');
    
    const socket = new WebSocket('ws://localhost:3000');
    const playerId = 'single_test_player';
    const playerName = 'SingleTester';
    
    socket.on('open', () => {
        console.log('✅ 连接成功');
        console.log('📤 加入游戏...');
        socket.send(JSON.stringify({ 
            action: 'joinGame', 
            playerId: playerId, 
            playerName: playerName 
        }));
        
        // 等待一会儿，然后尝试开始游戏
        setTimeout(() => {
            console.log('📤 尝试开始游戏（预期会失败，因为需要至少2个玩家）...');
            socket.send(JSON.stringify({ 
                action: 'startGame', 
                playerId: playerId 
            }));
        }, 1000);
        
        // 3秒后关闭连接
        setTimeout(() => {
            console.log('⏰ 测试完成，关闭连接');
            socket.close();
        }, 3000);
    });
    
    socket.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log('📥 收到消息:', message);
        } catch (error) {
            console.error('❌ 解析消息失败:', error);
        }
    });
    
    socket.on('error', (error) => {
        console.error('❌ 连接错误:', error);
    });
    
    socket.on('close', () => {
        console.log('🔌 连接已关闭');
        console.log('=== 单人玩家测试完成 ===');
        process.exit(0);
    });
}

// 检查服务器
function checkServer() {
    console.log('🔍 检查服务器状态...');
    
    const testSocket = new WebSocket('ws://localhost:3000');
    
    testSocket.on('open', () => {
        console.log('✅ 服务器运行正常');
        testSocket.close();
        setTimeout(testSinglePlayer, 500);
    });
    
    testSocket.on('error', (error) => {
        console.log('❌ 服务器未运行或连接失败');
        console.log('请先启动服务器: node server.js');
        process.exit(1);
    });
}

checkServer();
