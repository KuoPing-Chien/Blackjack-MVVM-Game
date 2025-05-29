const WebSocket = require('ws');

// 創建兩個玩家連接來測試多玩家功能
class TestPlayer {
    constructor(playerId, playerName) {
        this.playerId = playerId;
        this.playerName = playerName;
        this.ws = null;
        this.connected = false;
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket('ws://localhost:3000');
                
                this.ws.on('open', () => {
                    console.log(`${this.playerName} connected`);
                    this.connected = true;
                    resolve();
                });
                
                this.ws.on('message', (data) => {
                    const message = JSON.parse(data);
                    console.log(`${this.playerName} received:`, message);
                });
                
                this.ws.on('error', (error) => {
                    console.error(`${this.playerName} WebSocket error:`, error);
                    reject(error);
                });
                
                this.ws.on('close', () => {
                    console.log(`${this.playerName} disconnected`);
                    this.connected = false;
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    sendMessage(message) {
        if (this.connected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            console.log(`${this.playerName} sent:`, message);
        } else {
            console.log(`${this.playerName} is not connected`);
        }
    }

    joinGame() {
        this.sendMessage({
            action: 'joinGame',
            playerId: this.playerId,
            playerName: this.playerName
        });
    }

    startGame() {
        this.sendMessage({
            action: 'startGame',
            playerId: this.playerId
        });
    }

    hit() {
        this.sendMessage({
            action: 'playerHit',
            playerId: this.playerId
        });
    }

    stand() {
        this.sendMessage({
            action: 'playerStand',
            playerId: this.playerId
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

async function testMultiPlayerGame() {
    console.log('=== 多玩家21點遊戲測試 ===\n');

    // 創建兩個測試玩家
    const player1 = new TestPlayer('player_001', 'Alice');
    const player2 = new TestPlayer('player_002', 'Bob');

    try {
        // 連接玩家
        console.log('1. 連接玩家...');
        await player1.connect();
        await player2.connect();
        await sleep(1000);

        // 玩家加入遊戲
        console.log('\n2. 玩家加入遊戲...');
        player1.joinGame();
        await sleep(500);
        player2.joinGame();
        await sleep(1000);

        // 開始遊戲
        console.log('\n3. 開始遊戲...');
        player1.startGame();
        await sleep(2000);

        // 模擬遊戲過程
        console.log('\n4. 模擬遊戲過程...');
        console.log('Alice 要一張牌...');
        player1.hit();
        await sleep(1000);

        console.log('Alice 再要一張牌...');
        player1.hit();
        await sleep(1000);

        console.log('Alice 停牌...');
        player1.stand();
        await sleep(1000);

        console.log('Bob 要一張牌...');
        player2.hit();
        await sleep(1000);

        console.log('Bob 停牌...');
        player2.stand();
        await sleep(3000); // 等待莊家回合和遊戲結束

        console.log('\n5. 測試完成，斷開連接...');
        player1.disconnect();
        player2.disconnect();

    } catch (error) {
        console.error('測試過程中發生錯誤:', error);
        player1.disconnect();
        player2.disconnect();
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 檢查服務器是否運行
function checkServer() {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket('ws://localhost:3000');
        ws.on('open', () => {
            ws.close();
            resolve(true);
        });
        ws.on('error', () => {
            reject(false);
        });
    });
}

// 主函數
async function main() {
    try {
        console.log('檢查服務器連接...');
        await checkServer();
        console.log('服務器連接正常，開始測試\n');
        await testMultiPlayerGame();
    } catch (error) {
        console.error('無法連接到服務器，請確保服務器正在運行在 ws://localhost:3000');
        console.error('錯誤:', error);
    }
}

if (require.main === module) {
    main();
}

module.exports = { TestPlayer, testMultiPlayerGame };
