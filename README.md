# 🎮 21點遊戲 (Blackjack) - MVVM架構實現

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![Cocos Creator](https://img.shields.io/badge/Cocos%20Creator-3.x-blue.svg)](https://www.cocos.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue.svg)](https://www.typescriptlang.org/)

## 專案概述

本專案使用 Cocos Creator 作為前端，Node.js 作為後端，實現了完整的21點（Blackjack）遊戲。代碼採用 MVVM（Model-View-ViewModel）架構模式，並包含完整的中文註解。

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

## 安裝和運行

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
