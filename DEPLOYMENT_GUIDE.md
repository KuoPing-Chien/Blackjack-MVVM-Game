# 21點遊戲 MVVM架構 - 完整部署指南

## 🎯 項目概述

這是一個使用Cocos Creator前端和Node.js後端的完整21點遊戲，採用MVVM架構設計，支持實時WebSocket通信。

### 📁 項目結構
```
Blackjack/
├── server.js                          # Node.js WebSocket後端服務器
├── package.json                       # 項目依賴配置
├── tsconfig.json                      # TypeScript配置
├── README.md                          # 項目說明
├── MVVM_SUMMARY.md                    # MVVM架構總結
└── assets/                            # Cocos Creator資源文件夾
    ├── GameModel.ts                   # 數據層 - 遊戲狀態和業務數據
    ├── GameViewModel.ts               # 邏輯層 - 業務邏輯和通信
    ├── GameView.ts                    # 視圖層 - UI管理和交互
    ├── BlackjackSceneSetup.ts         # 場景自動化設置組件
    ├── BlackjackUIConfigurator.ts     # 手動UI配置組件
    ├── IntegrationTest.ts             # 整合測試組件
    ├── MVVMTest.ts                    # MVVM架構測試
    ├── WebSocketTest.ts               # WebSocket連接測試
    ├── COCOS_CREATOR_INTEGRATION_GUIDE.md  # Cocos Creator整合指南
    └── UI_INTEGRATION_GUIDE.md        # UI整合指南
```

## 🚀 快速開始

### 1. 後端服務器啟動

```bash
# 進入項目目錄
cd /Users/kuoping/Documents/GitHub/Blackjack

# 安裝依賴（如果需要）
npm install ws

# 啟動WebSocket服務器
node server.js
```

服務器將在 `ws://localhost:3000` 啟動並等待連接。

### 2. Cocos Creator前端設置

#### 方法A：自動化場景創建（推薦）

1. **打開Cocos Creator項目**
   - 在Cocos Creator中打開 `/Users/kuoping/Documents/GitHub/Blackjack` 項目

2. **創建遊戲場景**
   - 創建新場景文件（如：`BlackjackGame.scene`）
   - 在場景中創建空節點，命名為 `GameScene`

3. **添加自動化組件**
   - 選中 `GameScene` 節點
   - 添加 `BlackjackSceneSetup` 組件
   - 保持默認配置即可：
     ```
     Auto Create UI: ✓
     Auto Connect Server: ✓
     Server Url: ws://localhost:3000
     Show Debug Info: ✓
     ```

4. **運行遊戲**
   - 點擊播放按鈕
   - 系統將自動創建完整的UI界面
   - 自動連接到WebSocket服務器
   - 開始遊戲！

#### 方法B：手動UI配置

如果需要自定義UI佈局：

1. **手動創建UI元素**
   ```
   Canvas
   ├── GameScene (添加 BlackjackUIConfigurator 組件)
   └── UI_Container
       ├── Player_Score_Label (Label組件)
       ├── Dealer_Score_Label (Label組件)
       ├── Game_Result_Label (Label組件)
       ├── Hit_Button (Button組件)
       ├── Stand_Button (Button組件)
       ├── Restart_Button (Button組件)
       └── Connection_Status_Label (Label組件)
   ```

2. **配置UI引用**
   - 將UI元素拖拽到 `BlackjackUIConfigurator` 組件對應的屬性槽中

3. **運行遊戲**
   - 組件會自動初始化MVVM架構

## 🏗️ 架構說明

### MVVM架構層次結構

```
┌─────────────────────────────────────────────────────────────┐
│                    Cocos Creator 場景                        │
├─────────────────────────────────────────────────────────────┤
│  BlackjackSceneSetup (場景管理)                             │
│  ├── 自動UI創建                                              │
│  ├── MVVM組件初始化                                          │
│  └── 服務器連接管理                                          │
├─────────────────────────────────────────────────────────────┤
│  GameView (視圖層 - View)                                   │
│  ├── UI元素綁定 (Label, Button)                             │
│  ├── 用戶交互處理 (點擊事件)                                │
│  ├── 顯示更新 (分數, 結果)                                   │
│  └── UI狀態管理                                              │
├─────────────────────────────────────────────────────────────┤
│  GameViewModel (視圖模型層 - ViewModel)                     │
│  ├── WebSocket通信管理                                       │
│  ├── 遊戲邏輯處理                                            │
│  ├── 數據綁定和事件分發                                      │
│  └── View-Model 數據橋接                                     │
├─────────────────────────────────────────────────────────────┤
│  GameModel (模型層 - Model)                                 │
│  ├── 遊戲狀態管理                                            │
│  ├── 卡牌數據結構                                            │
│  ├── 分數計算邏輯                                            │
│  └── 遊戲統計數據                                            │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Node.js 後端服務器                        │
│  ├── WebSocket服務器 (ws://localhost:3000)                  │
│  ├── 遊戲邏輯處理                                            │
│  ├── 卡牌發牌算法                                            │
│  └── 多玩家狀態管理                                          │
└─────────────────────────────────────────────────────────────┘
```

### 組件職責分工

| 組件 | 職責 | 主要功能 |
|------|------|----------|
| **GameModel** | 數據管理 | 遊戲狀態、卡牌數據、分數計算、統計追蹤 |
| **GameViewModel** | 業務邏輯 | WebSocket通信、遊戲流程、事件處理 |
| **GameView** | UI展示 | 界面更新、用戶交互、視覺反饋 |
| **BlackjackSceneSetup** | 場景管理 | 自動UI創建、組件初始化、場景配置 |
| **BlackjackUIConfigurator** | UI配置 | 手動UI設置、元素綁定、配置驗證 |

## 🎮 遊戲功能

### 核心遊戲功能
- ✅ **完整21點遊戲邏輯**：標準Blackjack規則
- ✅ **實時WebSocket通信**：客戶端-服務器同步
- ✅ **自動化UI創建**：一鍵生成完整界面
- ✅ **MVVM架構分離**：清晰的代碼結構
- ✅ **遊戲統計追蹤**：勝率、遊戲次數統計
- ✅ **錯誤處理和重連**：網絡中斷自動恢復
- ✅ **多設備適配**：響應式UI佈局

### 用戶界面功能
- **分數顯示**：實時更新玩家和莊家分數
- **遊戲控制**：要牌、停牌、重新開始按鈕
- **狀態提示**：連接狀態、遊戲結果顯示
- **統計信息**：勝率和遊戲記錄
- **調試信息**：開發模式下的詳細日誌

## 🔧 開發和測試

### 開發環境要求
- **Cocos Creator**: 3.8.x 或更高版本
- **Node.js**: 14.x 或更高版本
- **TypeScript**: 支援ES2020+

### 測試組件使用

#### 1. WebSocket連接測試
```typescript
// 在場景中添加 WebSocketTest 組件
// 自動測試服務器連接和消息通信
```

#### 2. MVVM架構測試
```typescript
// 在場景中添加 MVVMTest 組件
// 驗證Model、ViewModel、View的綁定關係
```

#### 3. 完整整合測試
```typescript
// 在場景中添加 IntegrationTest 組件
// 測試整個系統的集成功能
```

### 調試和診斷

#### 控制台日誌
```javascript
// 啟用調試模式查看詳細日誌
showDebugInfo: true

// 日誌類型：
[GameModel] 遊戲狀態更新...
[ViewModel] WebSocket通信...
[GameView] UI更新...
[場景設置] 組件初始化...
```

#### 常見問題診斷

| 問題 | 症狀 | 解決方案 |
|------|------|----------|
| **服務器連接失敗** | 連接狀態顯示「未連接」 | 確認 `node server.js` 正在運行 |
| **UI元素未顯示** | 界面空白或不完整 | 檢查UI元素的UITransform組件 |
| **按鈕無響應** | 點擊無反應 | 確認Button組件正確配置 |
| **分數不更新** | 數字顯示錯誤 | 檢查Label組件綁定 |
| **遊戲邏輯錯誤** | 規則不正確 | 查看服務器端遊戲邏輯 |

## 📱 部署和發布

### 開發版本部署
1. **啟動後端服務器**
   ```bash
   cd /Users/kuoping/Documents/GitHub/Blackjack
   node server.js
   ```

2. **在Cocos Creator中運行**
   - 使用瀏覽器預覽或設備調試
   - 確保網絡連接到 `localhost:3000`

### 生產版本部署

#### 後端部署
```bash
# 安裝pm2進程管理器
npm install -g pm2

# 啟動生產服務器
pm2 start server.js --name blackjack-server

# 查看運行狀態
pm2 status
```

#### 前端發布
1. **構建Cocos Creator項目**
   - 選擇目標平台（Web、Android、iOS）
   - 配置發布參數
   - 修改服務器URL為生產地址

2. **服務器配置調整**
   ```javascript
   // 修改 GameModel.ts 中的服務器地址
   serverUrl: 'wss://your-production-server.com'
   ```

## 🔄 維護和更新

### 版本控制
- 檢查 `MVVM_SUMMARY.md` 獲取最新架構變更
- 定期更新組件文件
- 測試兼容性

### 性能優化建議
- **UI優化**：使用對象池管理動態UI元素
- **網絡優化**：實現消息批處理和壓縮
- **內存管理**：及時清理未使用的資源
- **渲染優化**：合理使用Canvas和UI層級

### 功能擴展
- **卡牌視覺化**：添加卡牌精靈和動畫
- **音效系統**：集成遊戲音效和背景音樂
- **多人對戰**：支持多玩家同時遊戲
- **遊戲變體**：實現不同的21點規則變體

## 📞 技術支持

### 獲取幫助
- 查看控制台錯誤信息
- 檢查網絡連接狀態
- 驗證組件配置
- 參考測試組件的實現

### 開發社區
- 提交Issue報告問題
- 分享改進建議
- 貢獻代碼優化

---

## 🎉 總結

這個項目成功展示了如何在遊戲開發中實現完整的MVVM架構：

1. **清晰的架構分離**：Model、ViewModel、View職責明確
2. **高度可維護性**：模塊化設計便於修改和擴展
3. **自動化工具鏈**：一鍵創建和配置遊戲場景
4. **完整的測試覆蓋**：多層次的測試和驗證機制
5. **生產就緒的代碼**：錯誤處理、日誌記錄、性能優化

通過這個項目，開發者可以學習到現代遊戲開發的最佳實踐，並將MVVM架構應用到其他遊戲項目中。
