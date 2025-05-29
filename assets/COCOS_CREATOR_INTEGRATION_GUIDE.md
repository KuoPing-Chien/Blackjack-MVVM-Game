# Cocos Creator UI整合完整指南

## 📋 概述

本指南將幫助你在Cocos Creator編輯器中完整設置21點遊戲的MVVM架構，實現從UI創建到遊戲運行的完整流程。

## 🚀 快速開始

### 方法一：自動場景創建（推薦）

1. **創建新場景**
   - 在Cocos Creator中創建新場景
   - 在層級管理器中創建空節點，命名為 `GameScene`

2. **添加場景設置組件**
   - 選中 `GameScene` 節點
   - 在屬性檢查器中點擊「添加組件」
   - 選擇 `BlackjackSceneSetup` 組件

3. **配置組件屬性**
   ```
   Auto Create UI: ✓ (自動創建UI)
   Auto Connect Server: ✓ (自動連接服務器)
   Server Url: ws://localhost:3000
   Show Debug Info: ✓ (顯示調試信息)
   ```

4. **運行場景**
   - 點擊播放按鈕
   - 系統將自動創建完整的UI界面
   - 自動初始化MVVM架構
   - 自動連接到WebSocket服務器

### 方法二：手動UI配置

如果你想要自定義UI佈局：

1. **創建UI元素**
   ```
   Canvas
   ├── GameScene (添加 BlackjackUIConfigurator 組件)
   ├── UI_Container
   │   ├── Title_Label (Label組件)
   │   ├── Player_Score_Label (Label組件)
   │   ├── Dealer_Score_Label (Label組件)
   │   ├── Game_Result_Label (Label組件)
   │   ├── Hit_Button (Button組件)
   │   ├── Stand_Button (Button組件)
   │   ├── Restart_Button (Button組件)
   │   └── Connection_Status_Label (Label組件)
   ```

2. **配置UI引用**
   - 將對應的UI元素拖拽到 `BlackjackUIConfigurator` 組件的屬性槽中
   - 確保所有必需的UI元素都已配置

3. **初始化組件**
   - 組件會自動設置GameView並綁定UI元素

## 🎮 遊戲功能說明

### 核心功能
- ✅ 完整的21點遊戲邏輯
- ✅ WebSocket實時通信
- ✅ MVVM架構分離
- ✅ UI自動化創建
- ✅ 遊戲統計追蹤
- ✅ 錯誤處理和重連

### UI元素功能

| UI元素 | 功能描述 |
|--------|----------|
| 玩家分數標籤 | 顯示玩家當前手牌總分 |
| 莊家分數標籤 | 顯示莊家當前手牌總分 |
| 遊戲結果標籤 | 顯示遊戲結果（勝利/失敗/平局） |
| 要牌按鈕 | 玩家請求額外卡牌 |
| 停牌按鈕 | 玩家結束回合 |
| 重新開始按鈕 | 開始新一輪遊戲 |
| 連接狀態標籤 | 顯示服務器連接狀態 |

## 🏗️ 架構說明

### MVVM架構層次

```
BlackjackSceneSetup (場景管理)
├── GameView (UI層)
│   ├── UI元素綁定
│   ├── 用戶交互處理
│   └── 顯示更新
├── GameViewModel (邏輯層)
│   ├── WebSocket通信
│   ├── 遊戲邏輯處理
│   └── 數據綁定
└── GameModel (數據層)
    ├── 遊戲狀態
    ├── 卡牌數據
    └── 分數計算
```

### 組件關係

1. **BlackjackSceneSetup**: 場景初始化和UI創建
2. **BlackjackUIConfigurator**: 手動UI配置工具
3. **GameView**: UI交互和顯示管理
4. **GameViewModel**: 業務邏輯和服務器通信
5. **GameModel**: 數據模型和狀態管理

## ⚙️ 配置選項

### BlackjackSceneSetup 配置

```typescript
// UI創建選項
autoCreateUI: boolean          // 自動創建UI界面
autoConnectServer: boolean     // 自動連接服務器
serverUrl: string             // WebSocket服務器地址
showDebugInfo: boolean        // 顯示調試信息

// UI樣式配置
primaryColor: Color           // 主要UI顏色
secondaryColor: Color         // 次要UI顏色
warningColor: Color          // 警告顏色
textColor: Color             // 文字顏色
```

### BlackjackUIConfigurator 配置

```typescript
// UI元素引用
playerScoreLabel: Label       // 玩家分數標籤
dealerScoreLabel: Label       // 莊家分數標籤
hitButton: Node              // 要牌按鈕
standButton: Node            // 停牌按鈕
restartButton: Node          // 重新開始按鈕
gameResultLabel: Label       // 遊戲結果標籤
connectionStatusLabel: Label // 連接狀態標籤

// 可選功能
cardPrefab: Prefab           // 卡牌預製體
playerCardContainer: Node    // 玩家卡牌容器
dealerCardContainer: Node    // 莊家卡牌容器

// 配置選項
autoSetupGameView: boolean   // 自動設置GameView
showConnectionStatus: boolean // 顯示連接狀態
debugMode: boolean           // 調試模式
```

## 🔧 開發和調試

### 服務器啟動

```bash
# 啟動Node.js後端服務器
cd /Users/kuoping/Documents/GitHub/Blackjack
node server.js
```

### 調試選項

1. **啟用調試模式**: 設置 `showDebugInfo = true`
2. **查看控制台**: 檢查瀏覽器開發者工具的控制台
3. **連接狀態**: 觀察連接狀態標籤的變化
4. **WebSocket測試**: 使用 `WebSocketTest.ts` 進行連接測試

### 常見問題解決

| 問題 | 解決方案 |
|------|----------|
| UI元素未顯示 | 檢查UI元素的UITransform組件設置 |
| 按鈕無響應 | 確認Button組件已正確添加並配置 |
| 服務器連接失敗 | 確認Node.js服務器正在運行 |
| 分數不更新 | 檢查Label組件的string屬性綁定 |

## 📱 UI佈局建議

### 推薦解析度
- **設計解析度**: 1920 x 1080
- **適配模式**: SHOW_ALL 或 FIXED_HEIGHT

### UI層次結構
```
Canvas (Canvas組件)
├── GameScene (BlackjackSceneSetup組件)
└── UI_Container (Widget組件，全屏適配)
    ├── Title_Container (標題區域)
    ├── Info_Container (分數信息區域)
    ├── Card_Container (卡牌顯示區域)
    ├── Control_Container (控制按鈕區域)
    └── Status_Container (狀態信息區域)
```

### 樣式建議
- **字體大小**: 標題48px，分數32px，按鈕24px，狀態20px
- **按鈕尺寸**: 120x60px，圓角效果
- **顏色方案**: 藍色主調，綠色確認，紅色警告

## 🎯 使用步驟總結

1. **準備工作**
   - 確保Node.js服務器運行在localhost:3000
   - 在Cocos Creator中創建新場景

2. **快速設置**
   - 添加 `BlackjackSceneSetup` 組件到場景節點
   - 配置必要的屬性（保持默認值即可）
   - 運行場景

3. **測試遊戲**
   - 檢查連接狀態顯示為「已連接」
   - 點擊「重新開始」按鈕開始遊戲
   - 使用「要牌」和「停牌」按鈕進行遊戲

4. **自定義開發**
   - 根據需要修改UI樣式
   - 擴展遊戲功能
   - 添加動畫和音效

## 🔄 更新和維護

### 版本更新
- 檢查 `MVVM_SUMMARY.md` 獲取最新的架構變更
- 更新組件文件到最新版本
- 測試所有功能正常運行

### 性能優化
- 使用對象池管理卡牌UI
- 優化WebSocket消息頻率
- 實現UI元素的懶加載

## 📞 技術支持

如果遇到問題，請檢查：
1. 控制台錯誤信息
2. 服務器連接狀態
3. UI元素配置是否正確
4. 組件屬性設置是否完整

這個完整的整合方案讓你能夠在Cocos Creator中輕鬆使用MVVM架構開發21點遊戲，同時保持代碼的可維護性和擴展性。
