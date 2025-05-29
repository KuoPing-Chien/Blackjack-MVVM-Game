/**
 * 玩家姓名更新功能測試
 * 測試玩家可以在連線後更新姓名並同步給所有玩家
 */

const WebSocket = require('ws');

class PlayerNameTester {
    constructor(playerId, initialName, serverUrl = 'ws://localhost:3000') {
        this.playerId = playerId;
        this.playerName = initialName;
        this.serverUrl = serverUrl;
        this.socket = null;
        this.isConnected = false;
    }

    connect() {
        return new Promise((resolve, reject) => {
            console.log(`[${this.playerId}] 連接服務器...`);
            
            this.socket = new WebSocket(this.serverUrl);
            
            this.socket.on('open', () => {
                console.log(`[${this.playerId}] ✅ 已連接到服務器`);
                this.isConnected = true;
                
                // 自動加入遊戲
                this.joinGame();
                resolve();
            });

            this.socket.on('message', (data) => {
                this.handleMessage(data);
            });

            this.socket.on('error', (error) => {
                console.error(`[${this.playerId}] ❌ 連接錯誤:`, error.message);
                reject(error);
            });

            this.socket.on('close', () => {
                console.log(`[${this.playerId}] 🔌 連接已關閉`);
                this.isConnected = false;
            });
        });
    }

    joinGame() {
        if (this.isConnected) {
            console.log(`[${this.playerId}] 📤 加入遊戲 (姓名: ${this.playerName})`);
            this.socket.send(JSON.stringify({
                action: 'joinGame',
                playerId: this.playerId,
                playerName: this.playerName
            }));
        }
    }

    updatePlayerName(newName) {
        if (this.isConnected) {
            const oldName = this.playerName;
            this.playerName = newName;
            
            console.log(`[${this.playerId}] 📤 更新姓名: ${oldName} -> ${newName}`);
            this.socket.send(JSON.stringify({
                action: 'updatePlayerName',
                playerId: this.playerId,
                playerName: newName
            }));
        } else {
            console.warn(`[${this.playerId}] ⚠️ 未連接，無法更新姓名`);
        }
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data.toString());
            const action = message.action;
            
            switch (action) {
                case 'joinedGame':
                    console.log(`[${this.playerId}] ✅ ${message.message}`);
                    break;
                    
                case 'playerNameUpdated':
                    if (message.playerId === this.playerId) {
                        console.log(`[${this.playerId}] 🔄 自己的姓名已更新: ${message.oldName} -> ${message.newName}`);
                    } else {
                        console.log(`[${this.playerId}] 📢 其他玩家 ${message.playerId} 姓名更新: ${message.oldName} -> ${message.newName}`);
                    }
                    break;
                    
                case 'nameUpdateConfirmed':
                    console.log(`[${this.playerId}] ✅ 姓名更新確認: ${message.message}`);
                    break;
                    
                case 'nameUpdateFailed':
                    console.log(`[${this.playerId}] ❌ 姓名更新失敗: ${message.message}`);
                    break;
                    
                case 'readyToStart':
                    console.log(`[${this.playerId}] 🎮 ${message.message}`);
                    break;
                    
                default:
                    console.log(`[${this.playerId}] 📥 收到訊息: ${action}`);
            }
        } catch (error) {
            console.error(`[${this.playerId}] ❌ 解析訊息失敗:`, error);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
}

async function runPlayerNameTest() {
    console.log('=== 玩家姓名更新功能測試 ===');
    
    // 創建兩個測試玩家
    const player1 = new PlayerNameTester('player_001', 'Alice');
    const player2 = new PlayerNameTester('player_002', 'Bob');
    
    try {
        // 連接第一個玩家
        console.log('\n1. 連接第一個玩家...');
        await player1.connect();
        await sleep(1000);
        
        // 連接第二個玩家
        console.log('\n2. 連接第二個玩家...');
        await player2.connect();
        await sleep(1000);
        
        // 第一個玩家更新姓名
        console.log('\n3. 第一個玩家更新姓名...');
        player1.updatePlayerName('Alice_Updated');
        await sleep(2000);
        
        // 第二個玩家更新姓名
        console.log('\n4. 第二個玩家更新姓名...');
        player2.updatePlayerName('Bob_NewName');
        await sleep(2000);
        
        // 測試無效姓名
        console.log('\n5. 測試空白姓名（應該失敗）...');
        player1.updatePlayerName('   ');
        await sleep(2000);
        
        // 再次更新為正常姓名
        console.log('\n6. 更新為最終姓名...');
        player1.updatePlayerName('FinalAlice');
        player2.updatePlayerName('FinalBob');
        await sleep(2000);
        
        console.log('\n✅ 測試完成！');
        
    } catch (error) {
        console.error('❌ 測試失敗:', error);
    } finally {
        // 清理連接
        player1.disconnect();
        player2.disconnect();
        
        setTimeout(() => {
            console.log('🔌 所有連接已關閉');
            process.exit(0);
        }, 1000);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 檢查服務器是否運行
function checkServer() {
    console.log('🔍 檢查服務器狀態...');
    
    const testSocket = new WebSocket('ws://localhost:3000');
    
    testSocket.on('open', () => {
        console.log('✅ 服務器運行正常');
        testSocket.close();
        setTimeout(runPlayerNameTest, 500);
    });
    
    testSocket.on('error', (error) => {
        console.log('❌ 服務器未運行或連接失敗');
        console.log('請先啟動服務器: node server.js');
        process.exit(1);
    });
}

checkServer();
