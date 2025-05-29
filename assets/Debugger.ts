/**
 * 21點遊戲除錯工具
 * 用於診斷和修復常見問題
 */

import { _decorator, Component, Node, director, Canvas, find } from 'cc';
import { GameView } from './GameView';
import { GameViewModel } from './GameViewModel';
import { BlackjackUIConfigurator } from './BlackjackUIConfigurator';
import { UIDemo } from './UIDemo';
import { QuickStart } from './QuickStart';

const { ccclass, property } = _decorator;

/**
 * 除錯工具組件
 */
@ccclass('Debugger')
export class Debugger extends Component {

    @property({
        tooltip: '是否自動運行診斷'
    })
    autoRunDiagnostics: boolean = true;

    @property({
        tooltip: '診斷延遲（秒）'
    })
    diagnosticDelay: number = 1.0;

    @property({
        tooltip: '是否顯示詳細日誌'
    })
    verboseLogging: boolean = true;

    start() {
        console.log('🔍 [除錯工具] 啟動除錯程序...');
        
        if (this.autoRunDiagnostics) {
            this.scheduleOnce(() => {
                this.runFullDiagnostics();
            }, this.diagnosticDelay);
        }
    }

    /**
     * 運行完整診斷
     */
    public runFullDiagnostics(): void {
        console.log('\n' + '='.repeat(60));
        console.log('🔍 [除錯工具] 開始全面診斷');
        console.log('='.repeat(60));

        this.checkSceneStructure();
        this.checkComponents();
        this.checkUIElements();
        this.checkMVVMArchitecture();
        this.checkServerConnection();
        this.generateDiagnosticReport();

        console.log('='.repeat(60));
        console.log('🔍 [除錯工具] 診斷完成');
        console.log('='.repeat(60) + '\n');
    }

    /**
     * 檢查場景結構
     */
    private checkSceneStructure(): void {
        console.log('\n📋 檢查場景結構...');
        
        const scene = director.getScene();
        const canvas = find('Canvas');
        
        console.log(`  場景名稱: ${scene ? scene.name : '未知'}`);
        console.log(`  Canvas節點: ${canvas ? '✅ 存在' : '❌ 缺失'}`);
        
        if (canvas) {
            const children = canvas.children;
            console.log(`  Canvas子節點數量: ${children.length}`);
            
            if (this.verboseLogging) {
                children.forEach((child, index) => {
                    console.log(`    ${index + 1}. ${child.name}`);
                });
            }
        }
    }

    /**
     * 檢查組件狀態
     */
    private checkComponents(): void {
        console.log('\n🔧 檢查組件狀態...');
        
        const canvas = find('Canvas');
        
        // 檢查GameView
        const gameView = this.node.getComponent(GameView) || canvas?.getComponent(GameView);
        console.log(`  GameView: ${gameView ? '✅ 已添加' : '❌ 未找到'}`);
        
        // 檢查BlackjackUIConfigurator
        const configurator = this.node.getComponent(BlackjackUIConfigurator) || canvas?.getComponent(BlackjackUIConfigurator);
        console.log(`  BlackjackUIConfigurator: ${configurator ? '✅ 已添加' : '❌ 未找到'}`);
        
        // 檢查UIDemo
        const uiDemo = this.node.getComponent(UIDemo) || canvas?.getComponent(UIDemo);
        console.log(`  UIDemo: ${uiDemo ? '✅ 已添加' : '❌ 未找到'}`);
        
        // 檢查QuickStart
        const quickStart = this.node.getComponent(QuickStart) || canvas?.getComponent(QuickStart);
        console.log(`  QuickStart: ${quickStart ? '✅ 已添加' : '❌ 未找到'}`);
        
        if (this.verboseLogging) {
            if (gameView) console.log(`    GameView節點: ${gameView.node.name}`);
            if (configurator) console.log(`    BlackjackUIConfigurator節點: ${configurator.node.name}`);
            if (uiDemo) console.log(`    UIDemo節點: ${uiDemo.node.name}`);
            if (quickStart) console.log(`    QuickStart節點: ${quickStart.node.name}`);
        }
    }

    /**
     * 檢查UI元素
     */
    private checkUIElements(): void {
        console.log('\n🎨 檢查UI元素...');
        
        const canvas = find('Canvas');
        if (!canvas) {
            console.log('  ❌ Canvas節點不存在，無法檢查UI元素');
            return;
        }

        const uiElements = [
            'PlayerScoreLabel',
            'DealerScoreLabel', 
            'HitButton',
            'StandButton',
            'RestartButton',
            'GameResultLabel',
            'ConnectionStatusLabel'
        ];

        uiElements.forEach(elementName => {
            const element = this.findNodeRecursively(canvas, elementName);
            console.log(`  ${elementName}: ${element ? '✅ 存在' : '❌ 缺失'}`);
            
            if (element && this.verboseLogging) {
                console.log(`    路徑: ${this.getNodePath(element)}`);
            }
        });
    }

    /**
     * 檢查MVVM架構
     */
    private checkMVVMArchitecture(): void {
        console.log('\n🏗️ 檢查MVVM架構...');
        
        const gameView = this.node.getComponent(GameView) || find('Canvas')?.getComponent(GameView);
        
        if (!gameView) {
            console.log('  ❌ GameView組件未找到');
            return;
        }

        console.log('  ✅ GameView組件存在');
        
        // 檢查ViewModel
        const hasViewModel = (gameView as any).viewModel;
        console.log(`  ViewModel: ${hasViewModel ? '✅ 已初始化' : '❌ 未初始化'}`);
        
        // 檢查UI綁定
        const uiBindings = [
            { name: 'playerScoreLabel', value: gameView.playerScoreLabel },
            { name: 'dealerScoreLabel', value: gameView.dealerScoreLabel },
            { name: 'hitButton', value: gameView.hitButton },
            { name: 'standButton', value: gameView.standButton },
            { name: 'restartButton', value: gameView.restartButton }
        ];

        uiBindings.forEach(binding => {
            console.log(`  ${binding.name}: ${binding.value ? '✅ 已綁定' : '❌ 未綁定'}`);
        });
    }

    /**
     * 檢查服務器連接
     */
    private checkServerConnection(): void {
        console.log('\n🌐 檢查服務器連接...');
        
        // 嘗試WebSocket連接測試
        const testSocket = new WebSocket('ws://localhost:3000');
        
        testSocket.onopen = () => {
            console.log('  ✅ WebSocket連接成功');
            testSocket.close();
        };
        
        testSocket.onerror = (error) => {
            console.log('  ❌ WebSocket連接失敗:', error);
        };
        
        testSocket.onclose = () => {
            console.log('  📡 WebSocket連接已關閉');
        };
    }

    /**
     * 生成診斷報告
     */
    private generateDiagnosticReport(): void {
        console.log('\n📊 診斷報告總結...');
        
        const canvas = find('Canvas');
        const gameView = canvas?.getComponent(GameView);
        const configurator = canvas?.getComponent(BlackjackUIConfigurator);
        const uiDemo = canvas?.getComponent(UIDemo);
        const quickStart = canvas?.getComponent(QuickStart);
        
        console.log('📋 建議解決方案:');
        
        if (!canvas) {
            console.log('  1. ❗ 創建Canvas節點');
        }
        
        if (!gameView && !configurator && !uiDemo && !quickStart) {
            console.log('  2. ❗ 添加UI組件（建議使用QuickStart）');
        }
        
        if (gameView && !gameView.playerScoreLabel) {
            console.log('  3. ❗ 配置GameView的UI元素屬性');
        }
        
        console.log('\n🚀 快速修復建議:');
        console.log('  1. 確保場景中有Canvas節點');
        console.log('  2. 在Canvas上添加QuickStart組件');
        console.log('  3. 點擊播放按鈕運行場景');
        console.log('  4. 檢查控制台日誌確認UI創建成功');
    }

    /**
     * 遞歸查找節點
     */
    private findNodeRecursively(parent: Node, name: string): Node | null {
        if (parent.name === name) {
            return parent;
        }
        
        for (const child of parent.children) {
            const result = this.findNodeRecursively(child, name);
            if (result) {
                return result;
            }
        }
        
        return null;
    }

    /**
     * 獲取節點路徑
     */
    private getNodePath(node: Node): string {
        const path: string[] = [];
        let current = node;
        
        while (current && current.name !== 'Scene') {
            path.unshift(current.name);
            current = current.parent;
        }
        
        return path.join('/');
    }

    /**
     * 手動觸發特定診斷
     */
    public diagnoseSpecific(type: 'scene' | 'components' | 'ui' | 'mvvm' | 'server'): void {
        console.log(`🔍 [除錯工具] 運行特定診斷: ${type}`);
        
        switch (type) {
            case 'scene':
                this.checkSceneStructure();
                break;
            case 'components':
                this.checkComponents();
                break;
            case 'ui':
                this.checkUIElements();
                break;
            case 'mvvm':
                this.checkMVVMArchitecture();
                break;
            case 'server':
                this.checkServerConnection();
                break;
        }
    }

    /**
     * 自動修復常見問題
     */
    public autoFix(): void {
        console.log('🔧 [除錯工具] 開始自動修復...');
        
        const canvas = find('Canvas');
        if (!canvas) {
            console.log('❌ 無法自動修復：Canvas節點不存在');
            return;
        }
        
        // 檢查並添加QuickStart組件
        let quickStart = canvas.getComponent(QuickStart);
        if (!quickStart) {
            quickStart = canvas.addComponent(QuickStart);
            console.log('✅ 已自動添加QuickStart組件');
        }
        
        console.log('🎉 自動修復完成！');
    }
}
