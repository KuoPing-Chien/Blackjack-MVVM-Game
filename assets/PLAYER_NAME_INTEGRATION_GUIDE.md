# 玩家姓名功能整合指南

## 🎯 概述

本指南説明如何在現有的21點遊戲場景中使用新增的玩家姓名功能。這個功能允許玩家輸入姓名、連接到服務器、更新姓名，並與其他玩家進行實時同步。

## 🏗️ 整合方式

### 方式一：使用 BlackjackScene（推薦）

這是最簡單的整合方式，適合現有項目快速添加玩家姓名功能。

#### 步驟

1. **場景設定**
   - 在 Cocos Creator 中開啟您的場景
   - 選擇 Canvas 節點
   - 添加 `BlackjackScene` 組件

2. **啟用玩家姓名功能**
   - 在 BlackjackScene 組件中，確保 `Enable Player Names` 為 `true`
   - 組件會自動創建玩家姓名相關UI

3. **運行遊戲**
   - 場景會自動顯示玩家姓名輸入區域
   - 玩家可以輸入姓名並連接到服務器

### 方式二：使用 BlackjackSceneSetup（完整功能）

這提供最完整的功能，包括自動UI創建和MVVM架構整合。

#### 步驟

1. **場景設定**
   - 創建新的 2D 場景或使用現有場景
   - 確保場景有 Canvas 節點
   - 選擇 Canvas 節點
   - 添加 `BlackjackSceneSetup` 組件

2. **配置選項**
   ```
   Auto Create UI: true
   Auto Connect Server: true  
   Server Url: ws://localhost:3000
   Enable Player Names: true
   ```

3. **運行遊戲**
   - 組件會自動創建完整的UI界面
   - 包括玩家姓名區域、遊戲控制區域等

## 🎮 玩家姓名功能特色

### UI 組件

1. **玩家姓名輸入框**
   - 支援輸入和編輯玩家姓名
   - 輸入驗證和限制

2. **連接按鈕**
   - 使用輸入的姓名連接到服務器
   - 自動處理連接狀態

3. **更新姓名按鈕**
   - 連接後可以更新玩家姓名
   - 實時同步到所有其他玩家

4. **線上玩家列表**
   - 顯示當前線上的所有玩家
   - 實時更新玩家姓名變更

### 功能特點

✅ **實時姓名同步** - 一個玩家更新姓名時，所有其他玩家立即看到變更
✅ **自動連接管理** - 處理連接、重連和錯誤狀態  
✅ **姓名驗證** - 自動驗證和清理玩家姓名
✅ **多玩家支援** - 支援多個玩家同時在線
✅ **併發安全** - 處理多個玩家同時更新姓名的情況

## 🔧 自定義配置

### 伺服器設定

確保後端服務器運行在正確的端口：

```bash
cd /path/to/your/project
node server.js
```

預設服務器地址：`ws://localhost:3000`

### UI 樣式配置

在 BlackjackSceneSetup 中可以自定義：

- `Primary Color`: 主要UI顏色 
- `Secondary Color`: 次要UI顏色
- `Warning Color`: 警告顏色
- `Text Color`: 文字顏色

### 玩家姓名規則

- 最小長度：1個字符
- 最大長度：20個字符  
- 自動清除前後空格
- 不允許空白姓名

## 📱 使用流程

### 玩家體驗流程

1. **進入遊戲**
   - 玩家看到姓名輸入界面
   - 輸入想要的姓名

2. **連接遊戲**
   - 點擊"連接遊戲"按鈕
   - 系統自動連接到服務器
   - 顯示連接狀態和線上玩家

3. **遊戲中**
   - 可以隨時點擊"更新姓名"
   - 新姓名會同步到所有玩家
   - 線上玩家列表實時更新

4. **多玩家互動**
   - 看到其他玩家的姓名變更通知
   - 實時更新的玩家列表

## 🧩 組件架構

### 主要組件

1. **PlayerNameGameView** - 玩家姓名UI控制器
2. **BlackjackScene** - 整合姓名功能的場景控制器  
3. **BlackjackSceneSetup** - 完整場景自動設置
4. **GameViewModel** - 處理姓名相關的業務邏輯

### 消息流

```
PlayerNameGameView → GameViewModel → WebSocket → Server
                                                    ↓
Server → WebSocket → GameViewModel → PlayerNameGameView
```

## 🚀 快速開始範例

### 最簡單的整合方式

1. 創建新場景
2. 添加 Canvas
3. 在 Canvas 上添加 BlackjackSceneSetup 組件
4. 設定 `Enable Player Names = true`
5. 運行遊戲

### 自定義整合

如果您想要更多控制，可以：

1. 使用 BlackjackScene 組件
2. 手動配置 UI 節點  
3. 綁定 PlayerNameGameView 組件
4. 自定義事件處理

## 📋 測試檢查清單

使用以下檢查清單確保功能正常：

- [ ] 玩家姓名輸入框顯示正常
- [ ] 連接按鈕功能正常
- [ ] 能夠成功連接到服務器
- [ ] 更新姓名按鈕功能正常
- [ ] 其他玩家能看到姓名更新
- [ ] 線上玩家列表實時更新
- [ ] 多個玩家同時更新姓名正常
- [ ] 連接斷開和重連處理正常

## 🔍 故障排除

### 常見問題

**Q: 無法連接到服務器**
A: 檢查服務器是否運行在 localhost:3000，確認防火牆設定

**Q: 姓名更新不同步**  
A: 檢查網路連接，確認服務器日誌中的錯誤訊息

**Q: UI 元素沒有顯示**
A: 確認 `Enable Player Names` 設為 true，檢查 Canvas 設定

**Q: 按鈕點擊沒有反應**
A: 檢查 PlayerNameGameView 組件是否正確綁定到 UI 元素

### 調試模式

啟用 `Show Debug Info` 可以看到：
- 連接狀態詳細信息
- 消息傳送記錄  
- UI 綁定狀態
- 錯誤詳細信息

## 📚 API 參考

### PlayerNameGameView 主要方法

```typescript
// 連接到服務器
connectToServer(playerName: string): void

// 更新玩家姓名  
updatePlayerName(newName: string): void

// 獲取當前連接狀態
getConnectionStatus(): string

// 獲取線上玩家列表
getOnlinePlayers(): Player[]
```

### 事件監聽

```typescript
// 監聽姓名更新事件
onPlayerNameUpdated(callback: (player) => void): void

// 監聽連接狀態變更
onConnectionChanged(callback: (status) => void): void
```

這樣就完成了玩家姓名功能的整合！您現在可以在遊戲中享受實時的玩家姓名管理功能。
