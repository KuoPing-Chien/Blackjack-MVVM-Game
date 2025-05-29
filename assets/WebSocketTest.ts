/**
 * WebSocket連接測試
 * 用於驗證前後端通信是否正常
 * 僅適用於瀏覽器環境（Cocos Creator）
 */

// 測試WebSocket連接
function testWebSocketConnection() {
    console.log('=== 開始WebSocket連接測試 ===');
    
    const socket = new WebSocket('ws://localhost:3000');
    
    socket.onopen = () => {
        console.log('✅ WebSocket連接成功');
        
        // 測試開始遊戲
        console.log('📤 發送開始遊戲訊息');
        socket.send(JSON.stringify({ action: 'startGame' }));
    };
    
    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('📥 收到伺服器訊息:', data);
            
            if (data.action === 'updateGameState') {
                console.log(`🎮 遊戲狀態更新 - 玩家分數: ${data.playerScore}, 莊家分數: ${data.dealerScore}`);
                
                // 測試要牌
                setTimeout(() => {
                    console.log('📤 測試要牌');
                    socket.send(JSON.stringify({ action: 'playerHit' }));
                }, 1000);
            } else if (data.action === 'gameOver') {
                console.log(`🏁 遊戲結束 - ${data.result}`);
                console.log(`📊 最終分數 - 玩家: ${data.playerScore}, 莊家: ${data.dealerScore}`);
                
                // 關閉連接
                setTimeout(() => {
                    socket.close();
                }, 1000);
            }
        } catch (error) {
            console.error('❌ 解析訊息失敗:', error);
        }
    };
    
    socket.onerror = (error) => {
        console.error('❌ WebSocket錯誤:', error);
    };
    
    socket.onclose = (event) => {
        console.log('🔌 WebSocket連接已關閉');
        console.log('=== WebSocket測試完成 ===');
    };
}

/**
 * 快速測試連接
 */
function quickConnectionTest(): Promise<boolean> {
    return new Promise((resolve) => {
        console.log('🔍 快速連接測試...');
        
        const socket = new WebSocket('ws://localhost:3000');
        let resolved = false;
        
        const timeout = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                console.log('⏰ 連接超時');
                resolve(false);
            }
        }, 3000);
        
        socket.onopen = () => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                console.log('✅ 快速連接測試成功');
                socket.close();
                resolve(true);
            }
        };
        
        socket.onerror = () => {
            if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                console.log('❌ 快速連接測試失敗');
                resolve(false);
            }
        };
    });
}

// 在瀏覽器環境中可以直接執行
if (typeof window !== 'undefined') {
    // 延遲執行，避免過早測試
    setTimeout(() => {
        console.log('🌐 自動執行WebSocket測試（如不需要可註解此行）');
        // testWebSocketConnection(); // 取消註解以自動執行測試
    }, 2000);
}

// 導出函數供其他模組使用
export { testWebSocketConnection, quickConnectionTest };
