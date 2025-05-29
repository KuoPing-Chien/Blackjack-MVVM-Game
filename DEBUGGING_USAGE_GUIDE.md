# 除錯工具使用指南

## 🚀 現在就開始除錯！

您現在擁有完整的除錯工具套件。以下是立即開始的步驟：

### 第一步：添加診斷組件

在 **Cocos Creator** 中：

1. **打開您的項目**
2. **選擇 Canvas 節點**
3. **添加以下任一組件**：
   - `EmergencyTest` - 最基本的測試
   - `QuickDiagnostic` - 全面診斷
   - `QuickStart` - 如果還沒有的話

### 第二步：運行並查看日誌

1. **點擊播放按鈕** ▶️
2. **打開瀏覽器開發者工具**（F12）
3. **查看控制台**，您會看到詳細的診斷信息

### 第三步：根據診斷結果採取行動

## 🔧 診斷工具說明

### EmergencyTest (緊急測試)
```typescript
// 功能：最基本的系統測試
// 位置：assets/EmergencyTest.ts
// 使用：添加到Canvas節點即可自動運行
```

**提供的信息：**
- ✅ 場景結構檢查
- ✅ 基本UI創建測試
- ✅ WebSocket連接測試
- ✅ 診斷建議

### QuickDiagnostic (快速診斷)
```typescript
// 功能：全面系統診斷
// 位置：assets/QuickDiagnostic.ts  
// 使用：添加到Canvas節點，自動運行診斷
```

**提供的信息：**
- 🌍 運行環境檢查
- 🏗️ 場景結構分析
- 🔧 組件狀態檢查
- 🎨 UI元素檢查
- 🏛️ MVVM架構狀態
- 🌐 服務器連接狀態
- 🔧 自動修復功能

### SystemValidator (系統驗證器)
```typescript
// 功能：自動化驗證所有功能
// 位置：assets/SystemValidator.ts
// 使用：添加到任何節點，生成完整驗證報告
```

### Debugger (詳細除錯器)
```typescript
// 功能：最詳細的除錯信息
// 位置：assets/Debugger.ts (381行)
// 使用：手動添加並調用相應方法
```

## 🎯 常見問題快速解決

### 問題：UI完全不可見

**立即嘗試：**
```javascript
// 在瀏覽器控制台執行
find('Canvas').getComponent('QuickDiagnostic').attemptQuickFix();
```

### 問題：組件添加了但沒有效果

**檢查順序：**
1. 確保組件真的添加到了Canvas節點
2. 確保Canvas節點是active狀態
3. 查看瀏覽器控制台是否有錯誤信息
4. 檢查是否有其他組件衝突

### 問題：看到診斷日誌但UI仍不顯示

**可能原因：**
- UI元素位置不正確（在攝像機視野外）
- UI元素透明度為0
- UI元素被遮擋
- 攝像機設置問題

**解決方法：**
1. 在場景編輯器中手動檢查UI節點位置
2. 檢查UI節點的Transform組件
3. 確保攝像機能看到UI層

## 📊 診斷結果解讀

### 綠色 ✅ = 正常
- 系統運行正常
- 繼續檢查其他項目

### 紅色 ❌ = 問題
- 需要立即修復
- 查看對應的修復建議

### 黃色 ⚠️ = 警告
- 系統可運行但有隱患
- 建議修復以提高穩定性

## 🚨 緊急情況處理

如果所有診斷工具都顯示正常，但UI仍然不可見：

### 方案1：手動創建UI
```javascript
// 在瀏覽器控制台執行
const canvas = find('Canvas');
const quickStart = canvas.getComponent('QuickStart');
if (quickStart) {
    quickStart.forceCreateUI();
}
```

### 方案2：重置場景
```javascript
// 在瀏覽器控制台執行
director.loadScene(director.getScene().name);
```

### 方案3：檢查Cocos Creator設置
1. 檢查Canvas的設計分辨率
2. 檢查攝像機的渲染層設置
3. 確保UI節點在正確的層級上

## 📞 獲取幫助

如果問題仍然存在，請提供：

1. **瀏覽器控制台的完整日誌**
2. **Cocos Creator場景層次結構截圖**
3. **使用的組件清單**
4. **具體的錯誤信息**

這將幫助快速定位問題所在。

---

## 📝 更新日誌

**2025/5/29**
- ✅ 修復了所有TypeScript編譯錯誤
- ✅ 確認後端服務器運行正常
- ✅ 添加了4個新的診斷工具
- ✅ 提供了完整的除錯指南

**準備就緒！** 現在您可以開始使用這些工具來診斷和修復問題了。
