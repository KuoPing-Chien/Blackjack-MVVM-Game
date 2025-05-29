# 🎮 21點遊戲 (Blackjack) - MVVM架構實現

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![Cocos Creator](https://img.shields.io/badge/Cocos%20Creator-3.x-blue.svg)](https://www.cocos.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue.svg)](https://www.typescriptlang.org/)

## 專案概述

本專案使用 Cocos Creator 作為前端，Node.js 作為後端，實現了完整的21點（Blackjack）遊戲。代碼採用 MVVM（Model-View-ViewModel）架構模式，並包含完整的中文註解。

## 🎯 核心功能

### 🎮 遊戲模式
- **單人模式** - 一個玩家對戰莊家
- **多人模式** - 最多4個玩家同時對戰莊家
- **靈活配置** - 可在服務器端配置最少玩家數

### ⚙️ 技術特性
- WebSocket 即時通訊
- MVVM 架構模式
- TypeScript + Node.js
- Cocos Creator 3.x
- 完整的中文註解

## 架構說明

### MVVM架構組成

#### 1. Model 層 (GameModel.ts)
**職責：** 數據管理和業務邏輯
- `Card` - 撲克牌數據模型
- `GameState` - 遊戲狀態數據模型
- `ServerMessage` - 伺服器訊息數據模型
- `ClientMessage` - 客戶端訊息數據模型
- `GameConfig` - 遊戲配置數據模型
- `GameStats` - 遊戲統計數據模型
- `GameModel` - 數據管理器類

**主要功能：**
- 遊戲狀態管理
- 分數計算邏輯
- 21點和爆牌判斷
- 遊戲統計記錄

#### 2. ViewModel 層 (GameViewModel.ts)
**職責：** 業務邏輯和數據綁定
- WebSocket 連接管理
- 伺服器通信處理
- 遊戲邏輯控制
- 事件回調處理

**主要功能：**
- WebSocket 連接和重連
- 遊戲動作處理（要牌、停牌、重新開始）
- 數據更新通知
- 錯誤處理

#### 3. View 層 (GameView.ts)
**職責：** UI顯示和用戶交互
- UI 元素綁定
- 用戶輸入處理
- 顯示更新
- 事件監聽

**主要功能：**
- 分數顯示更新
- 按鈕交互控制
- 遊戲結果顯示
- 連接狀態指示

## 檔案結構

```
/assets/
├── GameModel.ts      # Model層 - 數據模型和業務邏輯
├── GameViewModel.ts  # ViewModel層 - 業務邏輯和通信
├── GameView.ts       # View層 - UI顯示和交互
├── MVVMTest.ts       # MVVM架構測試檔案
└── NewComponent.ts   # 原始組件（已重構為MVVM）

/
├── server.js         # Node.js後端伺服器
├── package.json      # 專案依賴配置
└── README.md         # 專案說明文檔
```

## 後端伺服器

### 技術棧
- **Express.js** - Web伺服器框架
- **WebSocket** - 即時通信
- **Node.js** - 運行環境

### 主要功能
- 牌組初始化和洗牌
- 遊戲邏輯處理
- 分數計算
- 即時狀態同步

## 遊戲流程

1. **連接建立**
   - 前端通過WebSocket連接到後端伺服器
   - ViewModel管理連接狀態

2. **遊戲開始**
   - 玩家點擊開始按鈕
   - 伺服器初始化牌組並發牌
   - 更新遊戲狀態

3. **遊戲進行**
   - 玩家可選擇要牌或停牌
   - 伺服器處理遊戲邏輯
   - 即時更新分數顯示

4. **遊戲結束**
   - 判斷勝負結果
   - 顯示最終分數
   - 記錄遊戲統計

## 🚀 快速開始

### 單人遊戲測試

1. **啟動服務器**
   ```bash
   node server.js
   ```

2. **測試單人遊戲**
   ```bash
   # 完整測試
   node complete-single-player-test.js
   
   # 快速測試
   node quick-single-player-test.js
   ```

### 多人遊戲測試
```bash
# 在不同終端窗口運行
node multiplayer-test.js
```

## 📦 安裝和運行

### 前置需求
- Node.js (v14+)
- Cocos Creator (v3.8+)

### 安裝步驟

1. **安裝後端依賴**
   ```bash
   cd /path/to/Blackjack
   npm install
   ```

2. **啟動後端伺服器**
   ```bash
   node server.js
   ```

3. **在Cocos Creator中**
   - 打開專案
   - 將 `GameView.ts` 組件附加到場景節點
   - 配置UI元素屬性
   - 運行遊戲

### ⚙️ 服務器配置

在 `server.js` 中可以配置遊戲參數：

```javascript
const GAME_CONFIG = {
    ALLOW_SINGLE_PLAYER: true, // 允許單人遊戲
    MIN_PLAYERS: 1,            // 最少玩家數
    MAX_PLAYERS: 4             // 最多玩家數
};
```

### UI元素配置

在Cocos Creator中，需要為 `GameView` 組件配置以下UI元素：

```typescript
@property(Label) playerScoreLabel: Label = null;      // 玩家分數標籤
@property(Label) dealerScoreLabel: Label = null;      // 莊家分數標籤
@property(Node) hitButton: Node = null;               // 要牌按鈕
@property(Node) standButton: Node = null;             // 停牌按鈕
@property(Node) restartButton: Node = null;           // 重新開始按鈕
@property(Label) gameResultLabel: Label = null;       // 遊戲結果標籤
@property(Label) connectionStatusLabel: Label = null; // 連接狀態標籤
```

## 特色功能

### 1. 完整的MVVM架構
- 清晰的職責分離
- 良好的可維護性
- 易於測試和擴展

### 2. 中文註解
- 所有代碼都包含詳細的中文註解
- 便於理解和維護

### 3. 錯誤處理
- WebSocket連接錯誤處理
- 遊戲狀態異常處理
- 用戶輸入驗證

### 4. 即時通信
- WebSocket實現即時遊戲狀態同步
- 自動重連機制

### 5. 遊戲統計
- 勝負記錄
- 勝率計算
- 遊戲局數統計

## 測試

運行測試檔案來驗證MVVM架構：

```typescript
import { MVVMTest } from './MVVMTest';
MVVMTest.runAllTests();
```

## 後續開發

### 可能的擴展功能
1. 多人遊戲支持
2. 賭注系統
3. 遊戲歷史記錄
4. 音效和動畫
5. 移動端適配

### 架構優化
1. 添加依賴注入
2. 實現數據持久化
3. 添加單元測試
4. 性能優化

## 技術特點

- **可維護性**：清晰的架構分層，便於維護和擴展
- **可測試性**：良好的組件分離，易於單元測試
- **可擴展性**：模組化設計，便於添加新功能
- **中文化**：完整的中文註解和說明

## 作者

此專案展示了如何將傳統的組件化代碼重構為現代的MVVM架構，並在遊戲開發中應用最佳實踐。

# 21點遊戲 (Blackjack Game)

一款使用Cocos Creator和Node.js開發的多人21點遊戲。

## 功能特色

- **完整的MVVM架構** - 提高代碼可維護性和擴展性
- **WebSocket即時通訊** - 實現多人遊戲同步
- **TypeScript** - 靜態類型檢查，提高代碼質量
- **玩家姓名更新** - 可即時更新自定義玩家姓名
- **姓名更新冷卻機制** - 防止頻繁更改造成混亂

## 快速開始

1. **啟動伺服器**
   ```bash
   node server.js
   ```

2. **在Cocos Creator中打開項目**
   - 創建新場景
   - 添加 `SinglePlayerTestScene` 組件到一個空節點上
   - 點擊播放按鈕開始遊戲

## 玩家姓名更新功能

### 使用方法

1. **輸入新姓名**：在輸入框中輸入您想要的新玩家姓名
2. **點擊更新按鈕**：系統會發送更新姓名請求
3. **觀察結果**：
   - 姓名更新成功：您的姓名會立即更新
   - 姓名更新失敗：會顯示錯誤信息（例如冷卻時間未到）

### 冷卻時間

為防止玩家頻繁更改姓名造成混亂，系統實施了冷卻時間機制：
- 默認冷卻時間：5分鐘
- 冷卻中：更新按鈕將被禁用，且顯示剩餘冷卻時間
- 可配置：在Inspector面板中可通過`nameUpdateCooldownMinutes`參數調整

### 示例

```typescript
// 在GameViewModel中設置自定義冷卻時間
viewModel.nameUpdateCooldownTime = 10; // 設置為10分鐘

// 在SinglePlayerGameView中設置自定義冷卻時間
gameView.nameUpdateCooldownMinutes = 1; // 設置為1分鐘
```

## 多人遊戲

遊戲支持多人模式，玩家可以同時加入遊戲並輪流出牌。每位玩家都有自己的姓名和ID。

### 姓名同步

當一個玩家更新姓名時，所有連接的玩家都會收到即時通知，並看到更新後的姓名。這使得遊戲更加社交化和互動性強。

## 開發者API

### 關鍵方法

```typescript
// 更新玩家姓名
viewModel.updatePlayerName(newName);

// 檢查是否可以更新姓名（冷卻是否結束）
const canUpdate = viewModel.canUpdateName();

// 獲取剩餘冷卻時間（秒）
const remainingSeconds = viewModel.getNameUpdateCooldownRemaining();
```

---

詳細開發文檔請參閱 [開發者指南](DEVELOPMENT_GUIDE.md)。
