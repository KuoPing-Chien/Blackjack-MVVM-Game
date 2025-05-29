/**
 * 多玩家姓名更新同步測試
 * 測試一個玩家更新姓名時，其他玩家能收到同步通知
 */

const WebSocket = require('ws');

class PlayerClient {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.socket = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket('ws://localhost:3000');
            
            this.socket.on('open', () => {
                console.log(`[${this.id}] ✅ 已連接`);
                this.joinGame();
                setTimeout(resolve, 100); // Give a small delay for message processing
            });
            
            this.socket.on('message', (data) => {
                this.handleMessage(data);
            });
            
            this.socket.on('error', (err) => {
                console.error(`[${this.id}] ❌ 連接錯誤:`, err.message);
                reject(err);
            });
        });
    }

    joinGame() {
        this.socket.send(JSON.stringify({
            action: 'joinGame',
            playerId: this.id,
            playerName: this.name
        }));
        console.log(`[${this.id}] 📤 加入遊戲 (${this.name})`);
    }

    updateName(newName) {
        const oldName = this.name;
        this.name = newName;
        this.socket.send(JSON.stringify({
            action: 'updatePlayerName',
            playerId: this.id,
            playerName: newName
        }));
        console.log(`[${this.id}] 📤 更新姓名: ${oldName} -> ${newName}`);
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data.toString());
            
            switch (message.action) {
                case 'joinedGame':
                    console.log(`[${this.id}] ✅ 加入成功: ${message.message}`);
                    break;
                    
                case 'playerNameUpdated':
                    if (message.playerId === this.id) {
                        console.log(`[${this.id}] 🔄 自己的姓名已更新: ${message.oldName} -> ${message.newName}`);
                    } else {
                        console.log(`[${this.id}] 📢 其他玩家更新姓名: ${message.playerId} (${message.oldName} -> ${message.newName})`);
                    }
                    break;
                    
                case 'nameUpdateConfirmed':
                    console.log(`[${this.id}] ✅ 姓名更新確認: ${message.message}`);
                    break;
                    
                case 'readyToStart':
                    console.log(`[${this.id}] 🎮 遊戲準備開始`);
                    break;
                    
                default:
                    // 忽略其他消息
                    break;
            }
        } catch (error) {
            console.error(`[${this.id}] ❌ 解析消息失敗:`, error);
        }
    }

    close() {
        if (this.socket) {
            this.socket.close();
        }
    }
}

async function runMultiPlayerNameTest() {
    console.log('=== 多玩家姓名同步測試 ===\n');
    
    const player1 = new PlayerClient('player_001', 'Alice');
    const player2 = new PlayerClient('player_002', 'Bob');
    const player3 = new PlayerClient('player_003', 'Charlie');
    
    try {
        // 步驟1: 連接所有玩家
        console.log('1. 連接所有玩家...');
        await player1.connect();
        await sleep(500);
        await player2.connect();
        await sleep(500);
        await player3.connect();
        await sleep(1000);
        
        // 步驟2: Player1 更新姓名
        console.log('\n2. Player1 更新姓名...');
        player1.updateName('Alice_Updated');
        await sleep(1500);
        
        // 步驟3: Player2 更新姓名
        console.log('\n3. Player2 更新姓名...');
        player2.updateName('Bob_NewName');
        await sleep(1500);
        
        // 步驟4: Player3 更新姓名
        console.log('\n4. Player3 更新姓名...');
        player3.updateName('Charlie_Final');
        await sleep(1500);
        
        // 步驟5: 同時更新（測試併發）
        console.log('\n5. 同時更新姓名（測試併發）...');
        player1.updateName('Alice_Final');
        player2.updateName('Bob_Final');
        await sleep(2000);
        
        console.log('\n✅ 多玩家姓名同步測試完成！');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        console.log('\n清理連接...');
        player1.close();
        player2.close();
        player3.close();
        
        setTimeout(() => {
            console.log('🔌 所有連接已關閉');
            process.exit(0);
        }, 1000);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 執行測試
runMultiPlayerNameTest();
