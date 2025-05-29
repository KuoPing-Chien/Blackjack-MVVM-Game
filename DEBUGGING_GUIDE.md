# 21點遊戲除錯指南

## 📋 當前除錯狀態 (2025/5/29 更新)

### ✅ 已完成修復
- 所有TypeScript編譯錯誤已修復
- 後端Node.js服務器運行正常 (PID 2120, 端口3000)
- WebSocket連接測試通過
- MVVM架構組件無錯誤

### 🔧 新增診斷工具
- **QuickDiagnostic.ts** - 全面系統診斷
- **EmergencyTest.ts** - 緊急UI測試
- **Debugger.ts** - 詳細除錯工具 (381行)
- **SystemValidator.ts** - 自動化驗證系統

### ⚡ 立即行動方案
如果UI仍然不可見，請按以下順序操作：

1. **添加緊急測試組件**
   ```
   在Cocos Creator中：
   1. 選擇Canvas節點
   2. 添加EmergencyTest組件
   3. 運行項目並查看控制台日誌
   ```

2. **使用快速診斷**
   ```
   在Cocos Creator中：
   1. 選擇Canvas節點
   2. 添加QuickDiagnostic組件
   3. 運行項目，查看完整診斷報告
   ```

3. **如果以上都添加了，運行自動修復**
   ```javascript
   // 在瀏覽器控制台中執行
   find('Canvas').getComponent('QuickDiagnostic').attemptQuickFix();
   ```

### 🏥 服務器狀態確認
```bash
# 檢查服務器狀態
lsof -i :3000

# 如果服務器未運行，啟動服務器
cd /Users/kuoping/Documents/GitHub/Blackjack
node server.js
```

## 🔍 常見問題與解決方案

### 問題1：在Cocos Creator中看不到UI

**症狀：**
- 編輯器中添加了組件但UI不顯示
- 控制台沒有錯誤但畫面空白
- 點擊播放按鈕後沒有任何變化

**解決方案：**

#### 方法A：使用QuickStart組件（推薦）
```
1. 在Cocos Creator中打開項目
2. 創建新場景或打開現有場景
3. 選擇Canvas節點
4. 添加QuickStart組件
5. 點擊播放按鈕
```

#### 方法B：使用UIDemo組件
```
1. 選擇Canvas節點
2. 添加UIDemo組件
3. 確保以下設置：
   - Auto Create UI: ✓
   - Enable MVVM: ✓
   - Show Debug Log: ✓
4. 點擊播放按鈕
```

#### 方法C：使用除錯工具
```
1. 選擇任意節點
2. 添加Debugger組件
3. 設置：
   - Auto Run Diagnostics: ✓
   - Verbose Logging: ✓
4. 運行場景查看診斷報告
```

### 問題2：WebSocket連接失敗

**症狀：**
- 控制台顯示WebSocket連接錯誤
- 遊戲UI顯示但無法與伺服器通信
- 連接狀態顯示"未連接"

**解決方案：**

#### 檢查後端伺服器
```bash
cd /Users/kuoping/Documents/GitHub/Blackjack
npm start
```

#### 確認伺服器狀態
```
✅ 正常：Server is running on http://localhost:3000
❌ 異常：端口被占用或其他錯誤
```

#### 測試WebSocket連接
```javascript
// 在瀏覽器控制台中執行
const testSocket = new WebSocket('ws://localhost:3000');
testSocket.onopen = () => console.log('✅ 連接成功');
testSocket.onerror = (e) => console.log('❌ 連接失敗', e);
```

### 問題3：UI元素綁定失敗

**症狀：**
- 控制台警告"UI元素未配置"
- 按鈕點擊沒有反應
- 分數顯示不更新

**解決方案：**

#### 自動修復（使用自動化組件）
```
使用QuickStart或UIDemo組件會自動創建和綁定UI元素
```

#### 手動修復（使用BlackjackUIConfigurator）
```
1. 創建所需的UI節點：
   - PlayerScoreLabel (Label)
   - DealerScoreLabel (Label)
   - HitButton (Button)
   - StandButton (Button)
   - RestartButton (Button)
   - GameResultLabel (Label)
   - ConnectionStatusLabel (Label)

2. 在BlackjackUIConfigurator組件中：
   - 將對應節點拖拽到相應屬性欄
   - 啟用Debug Mode查看綁定狀態
```

### 問題4：編譯錯誤

**症狀：**
- TypeScript編譯失敗
- 控制台顯示類型錯誤
- 無法正常運行

**解決方案：**

#### 檢查常見錯誤
```typescript
// ❌ 錯誤的方式
buttonNode.getComponent('cc.UIOpacity')?.setOpacity?.(255);

// ✅ 正確的方式
const uiOpacity = buttonNode.getComponent('cc.UIOpacity') as any;
if (uiOpacity && typeof uiOpacity.opacity !== 'undefined') {
    uiOpacity.opacity = 255;
}
```

#### 重建項目
```
在Cocos Creator中：
Project → Build → 重新編譯
```

## 🛠️ 除錯工具使用指南

### Debugger組件功能

#### 自動診斷
- **場景結構檢查**：驗證Canvas和節點結構
- **組件狀態檢查**：確認MVVM組件是否正確添加
- **UI元素檢查**：驗證所有UI節點是否存在
- **MVVM架構檢查**：確認架構完整性
- **伺服器連接檢查**：測試WebSocket連接

#### 手動診斷
```typescript
// 在控制台中執行
const debugger = find('Debugger')?.getComponent('Debugger');
debugger?.diagnoseSpecific('scene');     // 檢查場景結構
debugger?.diagnoseSpecific('ui');        // 檢查UI元素
debugger?.diagnoseSpecific('server');    // 檢查伺服器連接
```

#### 自動修復
```typescript
// 在控制台中執行
const debugger = find('Debugger')?.getComponent('Debugger');
debugger?.autoFix();  // 自動添加QuickStart組件
```

## 📋 除錯檢查清單

### 基本檢查
- [ ] Cocos Creator項目已正確打開
- [ ] 後端伺服器正在運行（localhost:3000）
- [ ] 場景中存在Canvas節點
- [ ] 已添加UI組件（QuickStart/UIDemo/BlackjackUIConfigurator）

### UI檢查
- [ ] UI元素自動創建成功
- [ ] GameView組件已正確添加
- [ ] UI元素已正確綁定
- [ ] 按鈕事件響應正常

### 功能檢查
- [ ] WebSocket連接成功
- [ ] MVVM架構初始化完成
- [ ] 遊戲邏輯響應正常
- [ ] 分數更新正常顯示

### 調試日誌檢查
- [ ] 控制台顯示組件初始化日誌
- [ ] 沒有錯誤或警告信息
- [ ] WebSocket連接日誌正常
- [ ] UI創建日誌完整

## 🆘 緊急救援方案

### 如果所有方法都無效

#### 步驟1：清理項目
```bash
cd /Users/kuoping/Documents/GitHub/Blackjack
rm -rf temp/ library/
```

#### 步驟2：重新初始化
```
1. 重新打開Cocos Creator
2. 重新導入項目
3. 等待編譯完成
```

#### 步驟3：使用最簡方案
```
1. 創建新場景
2. 只添加QuickStart組件
3. 直接運行
```

#### 步驟4：檢查環境
```
- Cocos Creator版本：3.8.x
- Node.js版本：14.x+
- 瀏覽器：Chrome/Safari最新版
```

## 📞 技術支持

### 日誌收集
如果問題仍然存在，請提供：
1. **控制台完整日誌**
2. **Cocos Creator版本信息**
3. **具體錯誤訊息**
4. **使用的組件類型**

### 常用診斷命令
```javascript
// 檢查Canvas
console.log('Canvas:', find('Canvas'));

// 檢查組件
console.log('Components:', find('Canvas')?.components?.map(c => c.constructor.name));

// 檢查UI元素
console.log('Children:', find('Canvas')?.children?.map(c => c.name));

// 測試WebSocket
const ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => console.log('WebSocket OK');
```

## 🎉 成功標準

當以下條件都滿足時，表示除錯成功：
- ✅ UI完整顯示（標題、分數、按鈕）
- ✅ WebSocket連接成功
- ✅ 按鈕響應正常
- ✅ 分數實時更新
- ✅ 無控制台錯誤

恭喜！您的21點遊戲MVVM架構已經成功運行！
