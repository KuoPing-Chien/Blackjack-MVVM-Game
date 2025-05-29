/**
 * 緊急UI測試組件
 * 最簡化的測試，用於驗證基本UI功能
 */

import { _decorator, Component, Node, Label, Button, find, director } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('EmergencyTest')
export class EmergencyTest extends Component {

    start() {
        console.log('🚨 [緊急測試] 開始基本UI測試...');
        this.runEmergencyTest();
    }

    /**
     * 運行緊急測試
     */
    private runEmergencyTest(): void {
        console.log('\n🚨 緊急測試開始...');
        
        // 1. 測試場景基本結構
        this.testSceneStructure();
        
        // 2. 嘗試創建基本UI
        this.attemptCreateBasicUI();
        
        // 3. 測試WebSocket連接
        this.testWebSocketConnection();
        
        console.log('🚨 緊急測試完成');
    }

    /**
     * 測試場景結構
     */
    private testSceneStructure(): void {
        console.log('\n📊 [場景結構測試]');
        
        const scene = director.getScene();
        const canvas = find('Canvas');
        
        console.log(`場景存在: ${scene ? '✅' : '❌'}`);
        console.log(`Canvas存在: ${canvas ? '✅' : '❌'}`);
        console.log(`當前節點: ${this.node.name} (父節點: ${this.node.parent?.name || '無'})`);
        
        if (canvas) {
            console.log(`Canvas子節點: ${canvas.children.length}個`);
            canvas.children.forEach((child, i) => {
                console.log(`  ${i+1}. ${child.name} (active: ${child.active})`);
            });
        }
    }

    /**
     * 嘗試創建基本UI
     */
    private attemptCreateBasicUI(): void {
        console.log('\n🎨 [創建基本UI測試]');
        
        try {
            // 創建一個測試標籤
            const testLabel = new Node('EmergencyTestLabel');
            const labelComponent = testLabel.addComponent(Label);
            labelComponent.string = '緊急測試標籤';
            
            // 添加到當前節點
            this.node.addChild(testLabel);
            
            console.log('✅ 成功創建測試標籤');
            
            // 創建一個測試按鈕
            const testButton = new Node('EmergencyTestButton');
            const buttonComponent = testButton.addComponent(Button);
            const buttonLabel = testButton.addComponent(Label);
            buttonLabel.string = '測試按鈕';
            
            this.node.addChild(testButton);
            
            console.log('✅ 成功創建測試按鈕');
            
        } catch (error) {
            console.log('❌ 創建UI失敗:', error);
        }
    }

    /**
     * 測試WebSocket連接
     */
    private testWebSocketConnection(): void {
        console.log('\n🌐 [WebSocket連接測試]');
        
        try {
            const socket = new WebSocket('ws://localhost:3000');
            
            socket.onopen = () => {
                console.log('✅ WebSocket連接成功');
                socket.send(JSON.stringify({ action: 'testConnection' }));
            };
            
            socket.onmessage = (event) => {
                console.log('📥 收到服務器回應');
                socket.close();
            };
            
            socket.onerror = (error) => {
                console.log('❌ WebSocket連接失敗');
            };
            
            socket.onclose = () => {
                console.log('🔌 WebSocket測試完成');
            };
            
        } catch (error) {
            console.log('❌ WebSocket測試異常:', error);
        }
    }

    /**
     * 顯示診斷信息
     */
    public showDiagnosticInfo(): void {
        console.log('\n📋 [診斷信息]');
        console.log('如果您能看到這些日誌，說明TypeScript代碼正在執行。');
        console.log('如果UI不可見，可能的原因：');
        console.log('1. UI元素位置不正確');
        console.log('2. UI元素透明度為0');
        console.log('3. UI元素被其他元素遮擋');
        console.log('4. Canvas或父節點inactive');
        console.log('5. 攝像機設置問題');
        
        console.log('\n🔧 [建議操作]');
        console.log('1. 在Cocos Creator編輯器中檢查場景層次結構');
        console.log('2. 確保Canvas和UI節點都是active狀態');
        console.log('3. 檢查UI元素的Transform組件設置');
        console.log('4. 查看攝像機的渲染層設置');
    }
}
