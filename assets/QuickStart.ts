/**
 * 快速啟動助手
 * 此組件專門用於解決"Cocos Creator中看不到UI"的問題
 * 掛載到任何節點上即可立即看到完整的遊戲界面
 */

import { _decorator, Component, Node, director } from 'cc';
import { UIDemo } from './UIDemo';

const { ccclass, property } = _decorator;

/**
 * 快速啟動組件
 * 使用方法：
 * 1. 在Cocos Creator中創建新場景
 * 2. 選擇任意節點（建議Canvas）
 * 3. 添加此QuickStart組件
 * 4. 點擊播放按鈕
 * 5. 立即看到完整UI！
 */
@ccclass('QuickStart')
export class QuickStart extends Component {

    @property({
        tooltip: '啟動延遲（秒）'
    })
    startDelay: number = 0.5;

    start() {
        console.log('🚀 快速啟動助手已啟動！');
        console.log('📝 準備為你創建完整的21點遊戲UI...');
        
        this.scheduleOnce(() => {
            this.quickSetup();
        }, this.startDelay);
    }

    /**
     * 快速設置UI
     */
    private quickSetup(): void {
        console.log('⚡ 開始快速設置...');
        
        // 檢查是否已有UIDemo組件
        let uiDemo = this.node.getComponent(UIDemo);
        
        if (!uiDemo) {
            // 添加UIDemo組件
            uiDemo = this.node.addComponent(UIDemo);
            console.log('✅ 已添加UIDemo組件');
        }
        
        // 確保UIDemo配置正確
        uiDemo.autoCreateUI = true;
        uiDemo.enableMVVM = true;
        uiDemo.showDebugLog = true;
        
        // 手動觸發UI創建
        uiDemo.manualCreateUI();
        
        // 顯示成功信息
        this.showSuccessMessage();
    }

    /**
     * 顯示成功信息
     */
    private showSuccessMessage(): void {
        console.log('🎉 快速啟動完成！');
        console.log('━'.repeat(50));
        console.log('✅ UI已創建完成');
        console.log('✅ MVVM架構已整合');
        console.log('✅ 遊戲可以開始了');
        console.log('━'.repeat(50));
        console.log('🎮 遊戲操作：');
        console.log('   🎯 點擊"要牌"獲取新卡牌');
        console.log('   🛑 點擊"停牌"結束回合');
        console.log('   🔄 點擊"重新開始"開始新遊戲');
        console.log('━'.repeat(50));
        
        // 確保後端服務器運行提示
        this.scheduleOnce(() => {
            this.checkServerStatus();
        }, 2);
    }

    /**
     * 檢查服務器狀態
     */
    private checkServerStatus(): void {
        console.log('🔍 檢查服務器狀態...');
        console.log('💡 如果看到"連接狀態: 未連接"，請確保：');
        console.log('   1. 打開終端');
        console.log('   2. 運行命令: cd /Users/kuoping/Documents/GitHub/Blackjack');
        console.log('   3. 運行命令: node server.js');
        console.log('   4. 看到"WebSocket server is running on port 3000"即可');
    }

    /**
     * 手動重新設置（用於調試）
     */
    public manualReset(): void {
        console.log('🔄 手動重新設置...');
        
        // 移除現有UIDemo組件
        const existingUIDemo = this.node.getComponent(UIDemo);
        if (existingUIDemo) {
            this.node.removeComponent(existingUIDemo);
            console.log('🗑️ 已移除現有UIDemo組件');
        }
        
        // 重新快速設置
        this.scheduleOnce(() => {
            this.quickSetup();
        }, 0.1);
    }
}
