const WebSocket = require('ws');

console.log('Starting simple name test...');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', function open() {
    console.log('Connected to server');
    
    // Join game
    ws.send(JSON.stringify({
        action: 'joinGame',
        playerId: 'test_player',
        playerName: 'TestUser'
    }));
    console.log('Sent join game message');
});

ws.on('message', function message(data) {
    console.log('Received:', data.toString());
    
    const msg = JSON.parse(data.toString());
    if (msg.action === 'joinedGame') {
        console.log('Successfully joined, now updating name...');
        setTimeout(() => {
            ws.send(JSON.stringify({
                action: 'updatePlayerName',
                playerId: 'test_player',
                playerName: 'UpdatedTestUser'
            }));
            console.log('Sent name update message');
        }, 1000);
    }
});

ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
});

ws.on('close', function close() {
    console.log('Connection closed');
});

// Close after 10 seconds
setTimeout(() => {
    console.log('Closing connection...');
    ws.close();
    process.exit(0);
}, 10000);
