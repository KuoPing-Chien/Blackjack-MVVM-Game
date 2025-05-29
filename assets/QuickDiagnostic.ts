/**
 * 快速診斷工具
 * 用於即時檢查21點遊戲的所有系統狀態
 */

import { _decorator, Component, Node, find, director, sys } from 'cc';
import { GameView } from './GameView';
import { GameViewModel } from './GameViewModel';
import { UIDemo } from './UIDemo';
import { QuickStart } from './QuickStart';
import { BlackjackUIConfigurator } from './BlackjackUIConfigurator';

const { ccclass, property } = _decorator;

@ccclass('QuickDiagnostic')
export class QuickDiagnostic extends Component {
    
    @property({
        tooltip: '是否在啟動時自動運行診斷'
    })
    autoRun: boolean = true;

    start() {
        if (this.autoRun) {
            // 延遲一點運行，確保其他組件已初始化
            this.scheduleOnce(() => {
                this.runQuickDiagnostic();
            }, 1.0);
        }
    }

    /**
     * 運行快速診斷
     */
    public runQuickDiagnostic(): void {
        console.log('\n' + '🚀'.repeat(30));
        console.log('🚀 [快速診斷] 開始系統診斷');
        console.log('🚀'.repeat(30));

        this.checkEnvironment();
        this.checkSceneStructure();
        this.checkComponents();
        this.checkUIElements();
        this.checkMVVMState();
        this.checkServerConnection();
        this.provideDiagnosticSummary();
    }

    /**
     * 檢查運行環境
     */
    private checkEnvironment(): void {
        console.log('\n🌍 [環境檢查]');
        console.log(`  平台: ${sys.platform}`);
        console.log(`  瀏覽器: ${sys.browserType}`);
        console.log(`  Cocos版本: 未知`);
        console.log(`  當前時間: ${new Date().toLocaleString()}`);
    }

    /**
     * 檢查場景結構
     */
    private checkSceneStructure(): void {
        console.log('\n🏗️ [場景結構檢查]');
        
        const scene = director.getScene();
        const canvas = find('Canvas');
        
        console.log(`  當前場景: ${scene ? '✅ 存在' : '❌ 不存在'}`);
        console.log(`  Canvas節點: ${canvas ? '✅ 存在' : '❌ 不存在'}`);
        
        if (canvas) {
            console.log(`  Canvas子節點數量: ${canvas.children.length}`);
            canvas.children.forEach((child, index) => {
                console.log(`    ${index + 1}. ${child.name} (active: ${child.active})`);
            });
        }
    }

    /**
     * 檢查組件狀態
     */
    private checkComponents(): void {
        console.log('\n🔧 [組件狀態檢查]');
        
        const canvas = find('Canvas');
        if (!canvas) {
            console.log('  ❌ Canvas不存在，無法檢查組件');
            return;
        }

        // 檢查各種組件
        const components = [
            { name: 'QuickStart', component: canvas.getComponent(QuickStart) },
            { name: 'UIDemo', component: canvas.getComponent(UIDemo) },
            { name: 'GameView', component: canvas.getComponent(GameView) },
            { name: 'BlackjackUIConfigurator', component: canvas.getComponent(BlackjackUIConfigurator) }
        ];

        components.forEach(({ name, component }) => {
            console.log(`  ${name}: ${component ? '✅ 已掛載' : '❌ 未掛載'}`);
            if (component && typeof component.enabled !== 'undefined') {
                console.log(`    └─ 啟用狀態: ${component.enabled ? '✅ 啟用' : '❌ 禁用'}`);
            }
        });
    }

    /**
     * 檢查UI元素
     */
    private checkUIElements(): void {
        console.log('\n🎨 [UI元素檢查]');
        
        const expectedUIElements = [
            'PlayerScoreLabel',
            'DealerScoreLabel', 
            'HitButton',
            'StandButton',
            'RestartButton',
            'GameResultLabel',
            'ConnectionStatusLabel'
        ];

        let foundElements = 0;
        expectedUIElements.forEach(elementName => {
            const element = this.findUIElement(elementName);
            const found = !!element;
            console.log(`  ${elementName}: ${found ? '✅ 找到' : '❌ 缺失'}`);
            if (found) {
                foundElements++;
                console.log(`    └─ 可見性: ${element.active ? '✅ 可見' : '❌ 隱藏'}`);
            }
        });

        const completeness = Math.round((foundElements / expectedUIElements.length) * 100);
        console.log(`  UI完整度: ${foundElements}/${expectedUIElements.length} (${completeness}%)`);
    }

    /**
     * 檢查MVVM架構狀態
     */
    private checkMVVMState(): void {
        console.log('\n🏛️ [MVVM架構檢查]');
        
        const gameView = find('Canvas')?.getComponent(GameView);
        
        if (!gameView) {
            console.log('  ❌ GameView組件未找到');
            return;
        }

        console.log('  ✅ GameView組件存在');

        // 檢查ViewModel
        const viewModel = (gameView as any).viewModel;
        if (viewModel) {
            console.log('  ✅ ViewModel已初始化');
            console.log(`    └─ 連接狀態: ${viewModel.isConnected ? '✅ 已連接' : '❌ 未連接'}`);
            console.log(`    └─ 玩家分數: ${viewModel.playerScore || 0}`);
            console.log(`    └─ 莊家分數: ${viewModel.dealerScore || 0}`);
        } else {
            console.log('  ❌ ViewModel未初始化');
        }
    }

    /**
     * 檢查服務器連接
     */
    private checkServerConnection(): void {
        console.log('\n🌐 [服務器連接檢查]');
        
        // 嘗試WebSocket連接測試
        const testSocket = new WebSocket('ws://localhost:3000');
        
        testSocket.onopen = () => {
            console.log('  ✅ WebSocket連接成功');
            testSocket.close();
        };
        
        testSocket.onerror = (error) => {
            console.log('  ❌ WebSocket連接失敗');
            console.log('    請確保後端服務器正在運行：');
            console.log('    命令：cd /Users/kuoping/Documents/GitHub/Blackjack && node server.js');
        };
    }

    /**
     * 提供診斷總結
     */
    private provideDiagnosticSummary(): void {
        console.log('\n📋 [診斷總結]');
        console.log('='.repeat(50));
        
        const canvas = find('Canvas');
        const gameView = canvas?.getComponent(GameView);
        const hasUI = !!this.findUIElement('HitButton');
        
        if (!canvas) {
            console.log('🚨 嚴重問題：Canvas節點缺失');
            console.log('💡 解決方案：確保場景中有Canvas節點');
        } else if (!gameView && !canvas.getComponent(QuickStart) && !canvas.getComponent(UIDemo)) {
            console.log('🚨 嚴重問題：沒有找到任何遊戲組件');
            console.log('💡 解決方案：添加QuickStart組件到Canvas節點');
        } else if (!hasUI) {
            console.log('⚠️ UI問題：遊戲按鈕未創建');
            console.log('💡 解決方案：運行UI創建程序或檢查UIDemo組件');
        } else {
            console.log('🎉 系統狀態：基本組件正常');
            console.log('💡 建議：如果UI不可見，請檢查節點的active狀態和位置');
        }
        
        console.log('\n🔧 [快速修復建議]');
        console.log('1. 確保Canvas節點存在且active為true');
        console.log('2. 添加QuickStart組件到Canvas（如果未添加）');
        console.log('3. 檢查UI元素的可見性和位置');
        console.log('4. 確認後端服務器正在運行');
        console.log('5. 檢查瀏覽器控制台的錯誤信息');
        
        console.log('='.repeat(50));
    }

    /**
     * 查找UI元素
     */
    private findUIElement(name: string): Node | null {
        const canvas = find('Canvas');
        if (!canvas) return null;
        
        return this.searchNodeRecursively(canvas, name);
    }

    /**
     * 遞歸搜索節點
     */
    private searchNodeRecursively(parent: Node, name: string): Node | null {
        if (parent.name === name) return parent;
        
        for (const child of parent.children) {
            const result = this.searchNodeRecursively(child, name);
            if (result) return result;
        }
        
        return null;
    }

    /**
     * 手動運行診斷（可在外部調用）
     */
    public manualDiagnostic(): void {
        console.log('🔍 [手動診斷] 開始...');
        this.runQuickDiagnostic();
    }

    /**
     * 快速修復嘗試
     */
    public attemptQuickFix(): void {
        console.log('\n🔧 [快速修復] 嘗試自動修復常見問題...');
        
        const canvas = find('Canvas');
        if (!canvas) {
            console.log('❌ 無法修復：Canvas節點不存在');
            return;
        }

        // 確保Canvas是活動的
        if (!canvas.active) {
            canvas.active = true;
            console.log('✅ 修復：激活Canvas節點');
        }

        // 檢查並添加QuickStart組件
        let quickStart = canvas.getComponent(QuickStart);
        if (!quickStart) {
            quickStart = canvas.addComponent(QuickStart);
            console.log('✅ 修復：添加QuickStart組件');
        }

        console.log('🔧 快速修復完成，請檢查結果');
    }
}
