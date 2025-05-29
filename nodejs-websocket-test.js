/**
 * Node.js WebSocket測試腳本
 * 用於在服務器端測試WebSocket連接
 * 使用方法: node nodejs-websocket-test.js
 */

const WebSocket = require('ws');

function nodeTestWebSocket() {
    console.log('=== Node.js WebSocket測試 ===');
    
    const socket = new WebSocket('ws://localhost:3000');
    
    socket.on('open', () => {
        console.log('✅ WebSocket連接成功');
        socket.send(JSON.stringify({ action: 'startGame' }));
    });
    
    socket.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log('📥 收到訊息:', message);
            
            if (message.action === 'updateGameState') {
                console.log(`🎮 遊戲狀態更新 - 玩家: ${message.playerScore}, 莊家: ${message.dealerScore}`);
                
                // 測試停牌
                setTimeout(() => {
                    console.log('📤 測試停牌');
                    socket.send(JSON.stringify({ action: 'playerStand' }));
                }, 1000);
            } else if (message.action === 'gameOver') {
                console.log(`🏁 遊戲結束: ${message.result}`);
                console.log(`📊 最終分數 - 玩家: ${message.playerScore}, 莊家: ${message.dealerScore}`);
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
