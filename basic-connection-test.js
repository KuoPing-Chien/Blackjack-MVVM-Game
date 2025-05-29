/**
 * 基本WebSocket連接測試
 */

const WebSocket = require('ws');

console.log('🔍 基本連接測試');

try {
    const socket = new WebSocket('ws://localhost:3000');
    
    socket.on('open', () => {
        console.log('✅ WebSocket連接成功');
        
        // 發送一個測試消息
        const testMessage = {
            action: 'joinGame',
            playerId: 'test_123',
            playerName: 'TestPlayer'
        };
        
        console.log('📤 發送測試消息:', testMessage);
        socket.send(JSON.stringify(testMessage));
    });
    
    socket.on('message', (data) => {
        console.log('📥 收到服務器回應:', data.toString());
    });
    
    socket.on('error', (error) => {
        console.error('❌ WebSocket錯誤:', error.message);
    });
    
    socket.on('close', (code, reason) => {
        console.log('🔌 連接關閉:', code, reason?.toString());
        process.exit(0);
    });
    
    // 5秒後自動關閉
    setTimeout(() => {
        console.log('⏰ 測試結束，關閉連接');
        socket.close();
    }, 5000);
    
} catch (error) {
    console.error('❌ 創建WebSocket失敗:', error.message);
    process.exit(1);
}
