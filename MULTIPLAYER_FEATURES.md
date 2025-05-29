# 多玩家21點遊戲功能說明

## 🎯 功能概述

原本的單人對莊家21點遊戲已成功升級為支持多玩家的版本。現在可以同時支持多個玩家與莊家進行21點對戰。

## 🔧 技術實現

### 1. 架構更新

**GameModel.ts** - 數據模型更新：
- 新增 `Player` 接口，包含玩家ID、名稱、手牌、分數等信息
- 更新 `GameState` 接口，支持多玩家陣列和回合管理
- 新增玩家管理方法：`addPlayer()`, `setCurrentPlayer()`

**GameViewModel.ts** - 視圖模型更新：
- 支持多玩家事件處理：`onGameStateUpdate`, `onPlayerTurnChange`
- 新增 `joinGame()` 方法讓玩家加入遊戲
- 更新消息協議支持玩家ID識別

**MultiPlayerGameView.ts** - 新的多玩家UI視圖：
- 玩家名稱輸入和加入遊戲功能
- 多玩家信息顯示（玩家1、玩家2、莊家）
- 當前回合指示器
- 回合制按鈕控制

### 2. 服務器端更新

**server.js** - 多玩家服務器邏輯：
- 玩家連接管理：`Map<playerId, playerData>`
- 遊戲狀態管理：等待、遊戲中、莊家回合、結束
- 回合制邏輯：依序處理每個玩家的動作
- 廣播機制：向所有連接的玩家同步遊戲狀態

## 🎮 遊戲流程

### 1. 玩家加入階段
1. 玩家連接到服務器
2. 輸入玩家名稱並加入遊戲
3. 等待足夠玩家（至少2人）

### 2. 遊戲開始
1. 任一玩家點擊"開始遊戲"
2. 服務器發牌給所有玩家和莊家
3. 設置第一個玩家為當前回合

### 3. 玩家回合
1. 當前玩家可以選擇"要牌"或"停牌"
2. 要牌後如果爆牌，自動進入下一玩家回合
3. 停牌後切換到下一玩家

### 4. 莊家回合
1. 所有玩家完成後，莊家自動要牌至17點以上
2. 計算所有玩家與莊家的勝負

### 5. 遊戲結束
1. 顯示每個玩家的結果
2. 可以開始新一輪遊戲

## 📋 消息協議

### 客戶端到服務器
```javascript
// 加入遊戲
{
  action: 'joinGame',
  playerId: 'player_001',
  playerName: 'Alice'
}

// 開始遊戲
{
  action: 'startGame',
  playerId: 'player_001'
}

// 要牌
{
  action: 'playerHit',
  playerId: 'player_001'
}

// 停牌
{
  action: 'playerStand',
  playerId: 'player_001'
}
```

### 服務器到客戶端
```javascript
// 遊戲狀態更新
{
  action: 'updateGameState',
  players: [...],
  dealer: {...},
  currentPlayerIndex: 0,
  gamePhase: 'playing'
}

// 下一玩家回合
{
  action: 'nextPlayer',
  players: [...],
  currentPlayerIndex: 1,
  gamePhase: 'playing'
}

// 莊家回合
{
  action: 'dealerTurn',
  dealer: {...},
  gamePhase: 'dealer_turn'
}

// 遊戲結束
{
  action: 'gameOver',
  result: 'Alice: Player Wins\\nBob: Dealer Wins',
  players: [...],
  dealer: {...},
  gamePhase: 'ended'
}
```

## 🧪 測試驗證

### 測試腳本
- `multiplayer-test.js`: 自動化多玩家遊戲測試
- 模擬兩個玩家加入、開始遊戲、要牌、停牌的完整流程

### 測試結果
✅ 玩家加入遊戲功能正常  
✅ 多玩家回合制運作正常  
✅ 遊戲狀態同步正常  
✅ 莊家回合處理正常  
✅ 遊戲結果計算正確  
✅ 連接斷開處理正常  

## 🎯 使用方式

### 1. 啟動服務器
```bash
cd /Users/kuoping/Documents/GitHub/Blackjack
node server.js
```

### 2. 在Cocos Creator中使用
1. 將 `MultiPlayerGameView.ts` 添加到場景節點
2. 配置UI元素：玩家名稱輸入框、按鈕、標籤等
3. 設置事件綁定和UI引用

### 3. 測試多玩家功能
```bash
node multiplayer-test.js
```

## 🔄 與原版本兼容性

- 保留了原有的 `GameView.ts` 用於單人模式
- 新增的 `MultiPlayerGameView.ts` 用於多人模式
- 服務器同時支持單人和多人協議
- MVVM架構保持一致

## 🚀 擴展功能

### 已實現
- [x] 多玩家支持（2-4人）
- [x] 回合制管理
- [x] 實時狀態同步
- [x] 玩家斷線處理

### 未來可擴展
- [ ] 房間系統
- [ ] 觀戰模式
- [ ] 下注功能
- [ ] 排行榜系統
- [ ] 聊天功能

## 📊 性能特點

- **低延遲**: WebSocket實時通信
- **可靠性**: 完整的錯誤處理和斷線重連
- **可擴展性**: 易於增加更多玩家
- **兼容性**: 保持與原有代碼的兼容

這個多玩家系統為21點遊戲帶來了全新的互動體驗，讓玩家可以與朋友一起享受遊戲的樂趣！
