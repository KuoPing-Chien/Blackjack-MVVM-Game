console.log('直接測試開始');

const WebSocket = require('ws');

const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', () => {
    console.log('連接打開');
    socket.send(JSON.stringify({
        action: 'joinGame',
        playerId: 'direct_test',
        playerName: 'DirectTester'
    }));
});

socket.addEventListener('message', (event) => {
    console.log('收到消息:', event.data);
    
    // 測試姓名更新
    setTimeout(() => {
        socket.send(JSON.stringify({
            action: 'updatePlayerName',
            playerId: 'direct_test',
            playerName: 'UpdatedTester'
        }));
    }, 1000);
});

socket.addEventListener('error', (error) => {
    console.log('連接錯誤:', error);
});

socket.addEventListener('close', () => {
    console.log('連接關閉');
    process.exit();
});

setTimeout(() => {
    console.log('測試超時');
    socket.close();
}, 5000);
