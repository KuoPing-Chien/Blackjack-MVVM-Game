# 21點遊戲 UI 整合指南

## 🎯 概述

本指南將幫助您將 MVVM 架構的 21 點遊戲整合到 Cocos Creator 的 UI 系統中。我們提供了兩種配置方式：自動配置和手動配置。

## 📁 新增的檔案

- `BlackjackScene.ts` - 完整的場景管理器（自動創建UI）
- `BlackjackUIConfigurator.ts` - UI配置器組件（手動配置UI）
- `UI_INTEGRATION_GUIDE.md` - 本指南檔案

## 🚀 快速開始

### 方法一：使用 BlackjackUIConfigurator（推薦）

這是最簡單的方法，適合手動設計UI界面的開發者。

#### 1. 創建場景
在 Cocos Creator 中：
1. 創建新的 2D 場景
2. 確保場景有 Canvas 節點

#### 2. 創建UI元素
創建以下UI節點結構：
```
Canvas
└── GameUI (Node)
    ├── PlayerScoreLabel (Label) - 顯示"玩家: 0"
    ├── DealerScoreLabel (Label) - 顯示"莊家: 0"
    ├── HitButton (Button) - 要牌按鈕
    ├── StandButton (Button) - 停牌按鈕
    ├── RestartButton (Button) - 重新開始按鈕
    ├── GameResultLabel (Label) - 顯示遊戲結果
    └── ConnectionStatusLabel (Label) - 顯示連接狀態
```

#### 3. 添加組件
1. 選擇 `GameUI` 節點
2. 在屬性檢查器中點擊「添加組件」
3. 選擇「自定義組件」→「BlackjackUIConfigurator」

#### 4. 配置屬性
在 BlackjackUIConfigurator 組件中：
- 將對應的UI節點拖拽到相應的屬性槽中
- 確保「自動配置GameView組件」選項已勾選
- 如需調試，可勾選「啟用調試模式」

#### 5. 運行遊戲
- 確保後端伺服器正在運行：`node server.js`
- 在 Cocos Creator 中運行場景
- 遊戲將自動連接到伺服器並開始

### 方法二：使用 BlackjackScene（自動配置）

這種方法會自動創建整個UI結構，適合快速原型開發。

#### 1. 創建場景
在 Cocos Creator 中：
1. 創建新的 2D 場景
2. 確保場景有 Canvas 節點

#### 2. 添加組件
1. 選擇 Canvas 節點
2. 添加「BlackjackScene」組件

#### 3. 運行遊戲
- 組件會自動創建所有必需的UI元素
- 自動配置 GameView 組件
- 自動綁定所有UI元素

## 🎨 UI 元素說明

### 必需的UI元素

| 元素名稱 | 類型 | 作用 | 建議文字 |
|---------|------|------|---------|
| PlayerScoreLabel | Label | 顯示玩家分數 | "玩家: 0" |
| DealerScoreLabel | Label | 顯示莊家分數 | "莊家: 0" |
| HitButton | Button | 要牌按鈕 | "要牌" |
| StandButton | Button | 停牌按鈕 | "停牌" |
| RestartButton | Button | 重新開始按鈕 | "重新開始" |
| GameResultLabel | Label | 顯示遊戲結果 | (空白) |
| ConnectionStatusLabel | Label | 顯示連接狀態 | "伺服器狀態: 連接中..." |

### 可選的UI元素

| 元素名稱 | 類型 | 作用 |
|---------|------|------|
| PlayerCardContainer | Node | 玩家卡牌容器 |
| DealerCardContainer | Node | 莊家卡牌容器 |
| CardPrefab | Prefab | 撲克牌預製體 |

## 🎮 遊戲控制流程

### 1. 初始化階段
- UI配置器自動設置所有元素
- GameView組件初始化
- 嘗試連接WebSocket伺服器

### 2. 連接階段
- 顯示「連接中...」狀態
- 連接成功後自動開始遊戲
- 連接失敗會顯示錯誤信息

### 3. 遊戲階段
- 玩家可以點擊「要牌」或「停牌」
- 實時顯示分數更新
- 按鈕狀態根據遊戲階段自動調整

### 4. 結束階段
- 顯示遊戲結果
- 啟用「重新開始」按鈕
- 禁用「要牌」和「停牌」按鈕

## 🔧 自訂和擴展

### 自訂UI樣式
```typescript
// 在BlackjackUIConfigurator組件中
start() {
    // 自訂按鈕樣式
    this.customizeButtonStyle(this.hitButton, '#4CAF50');
    this.customizeButtonStyle(this.standButton, '#f44336');
    
    // 自訂標籤樣式
    this.customizeLabelStyle(this.playerScoreLabel, 28, '#ffffff');
}

private customizeButtonStyle(button: Node, color: string): void {
    // 實現自訂按鈕樣式
}
```

### 添加音效
```typescript
// 在遊戲事件中播放音效
public onHitButtonClicked(): void {
    // 播放要牌音效
    this.playSound('hit_sound');
    
    // 調用原有邏輯
    this.gameView?.playerHit();
}
```

### 添加動畫效果
```typescript
// 分數更新動畫
private animateScoreUpdate(label: Label, newScore: number): void {
    // 實現分數變化動畫
    tween(label.node)
        .to(0.2, { scale: new Vec3(1.2, 1.2, 1) })
        .to(0.2, { scale: new Vec3(1, 1, 1) })
        .start();
}
```

## 🐛 常見問題

### Q: UI元素無法綁定
**A:** 確保：
1. 節點名稱正確（區分大小寫）
2. 組件類型正確（Label/Button/Node）
3. 已將節點拖拽到屬性槽中

### Q: 遊戲無法連接伺服器
**A:** 檢查：
1. 後端伺服器是否正在運行
2. WebSocket URL是否正確（默認：ws://localhost:3000）
3. 防火牆設置

### Q: 按鈕點擊無反應
**A:** 確認：
1. Button組件已添加到按鈕節點
2. UI元素已正確綁定到GameView
3. 遊戲處於正確的階段

### Q: 分數顯示不更新
**A:** 檢查：
1. Label組件是否存在
2. GameView是否正確接收到伺服器消息
3. UI綁定是否正確

## 📚 進階功能

### 卡牌視覺化
如果您想要顯示實際的撲克牌：

1. 創建撲克牌預製體（Prefab）
2. 設置 `CardPrefab` 屬性
3. 創建卡牌容器節點
4. 組件會自動創建和管理卡牌顯示

### 多語言支持
```typescript
// 在UI配置器中添加語言設置
@property({
    type: Enum(Language),
    tooltip: '界面語言'
})
language: Language = Language.Chinese;
```

### 遊戲統計
```typescript
// 獲取遊戲統計
const stats = this.uiConfigurator.getGameView().gameStats;
console.log(`勝率: ${stats.winRate * 100}%`);
```

## 🎉 完成！

現在您已經成功將 MVVM 架構的 21 點遊戲整合到 Cocos Creator 中！

### 下一步
1. 自訂UI樣式和佈局
2. 添加音效和動畫
3. 實現卡牌視覺化
4. 添加更多遊戲功能

### 技術支持
如果您在整合過程中遇到問題，請檢查：
- 控制台日誌輸出
- UI元素綁定狀態
- 網路連接狀態
- 伺服器運行狀態

---

*本指南基於 MVVM 架構設計，確保代碼的可維護性和擴展性。*
