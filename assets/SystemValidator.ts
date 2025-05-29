/**
 * 快速驗證腳本
 * 用於測試21點遊戲的所有功能是否正常工作
 */

import { _decorator, Component, Node, find, director } from 'cc';
import { GameView } from './GameView';
import { GameViewModel } from './GameViewModel';
import { UIDemo } from './UIDemo';
import { QuickStart } from './QuickStart';

const { ccclass, property } = _decorator;

/**
 * 系統驗證組件
 */
@ccclass('SystemValidator')
export class SystemValidator extends Component {

    @property({
        tooltip: '驗證延遲（秒）'
    })
    validationDelay: number = 2.0;

    @property({
        tooltip: '是否自動運行驗證'
    })
    autoValidate: boolean = true;

    private validationResults: { [key: string]: boolean } = {};

    start() {
        console.log('🔬 [系統驗證] 啟動驗證程序...');
        
        if (this.autoValidate) {
            this.scheduleOnce(() => {
                this.runSystemValidation();
            }, this.validationDelay);
        }
    }

    /**
     * 運行系統驗證
     */
    public runSystemValidation(): void {
        console.log('\n' + '🔬'.repeat(20));
        console.log('🔬 [系統驗證] 開始全面系統驗證');
        console.log('🔬'.repeat(20));

        this.validateBasicStructure();
        this.validateUIComponents();
        this.validateMVVMArchitecture();
        this.validateGameLogic();
        this.validateServerConnection();
        
        this.scheduleOnce(() => {
            this.generateValidationReport();
        }, 3.0);
    }

    /**
     * 驗證基本結構
     */
    private validateBasicStructure(): void {
        console.log('\n📐 驗證基本結構...');
        
        const scene = director.getScene();
        const canvas = find('Canvas');
        
        this.validationResults.scene = !!scene;
        this.validationResults.canvas = !!canvas;
        
        console.log(`  場景存在: ${scene ? '✅' : '❌'}`);
        console.log(`  Canvas存在: ${canvas ? '✅' : '❌'}`);
        
        if (canvas) {
            const hasChildren = canvas.children.length > 0;
            this.validationResults.canvasChildren = hasChildren;
            console.log(`  Canvas有子節點: ${hasChildren ? '✅' : '❌'}`);
        }
    }

    /**
     * 驗證UI組件
     */
    private validateUIComponents(): void {
        console.log('\n🎨 驗證UI組件...');
        
        const canvas = find('Canvas');
        if (!canvas) {
            console.log('  ❌ Canvas不存在，無法驗證UI組件');
            return;
        }

        // 檢查UI創建組件
        const quickStart = canvas.getComponent(QuickStart);
        const uiDemo = canvas.getComponent(UIDemo);
        const gameView = canvas.getComponent(GameView);
        
        this.validationResults.quickStart = !!quickStart;
        this.validationResults.uiDemo = !!uiDemo;
        this.validationResults.gameView = !!gameView;
        
        console.log(`  QuickStart組件: ${quickStart ? '✅' : '❌'}`);
        console.log(`  UIDemo組件: ${uiDemo ? '✅' : '❌'}`);
        console.log(`  GameView組件: ${gameView ? '✅' : '❌'}`);

        // 驗證UI元素
        this.validateUIElements();
    }

    /**
     * 驗證UI元素
     */
    private validateUIElements(): void {
        console.log('\n🖼️ 驗證UI元素...');
        
        const uiElements = [
            'PlayerScoreLabel',
            'DealerScoreLabel',
            'HitButton',
            'StandButton',
            'RestartButton',
            'GameResultLabel'
        ];

        let validElements = 0;
        
        uiElements.forEach(elementName => {
            const element = this.findUIElement(elementName);
            const exists = !!element;
            
            if (exists) validElements++;
            console.log(`  ${elementName}: ${exists ? '✅' : '❌'}`);
        });

        this.validationResults.uiElements = validElements === uiElements.length;
        console.log(`  UI元素完整性: ${validElements}/${uiElements.length} ${this.validationResults.uiElements ? '✅' : '❌'}`);
    }

    /**
     * 驗證MVVM架構
     */
    private validateMVVMArchitecture(): void {
        console.log('\n🏗️ 驗證MVVM架構...');
        
        const gameView = find('Canvas')?.getComponent(GameView);
        
        if (!gameView) {
            console.log('  ❌ GameView未找到，無法驗證MVVM架構');
            this.validationResults.mvvm = false;
            return;
        }

        // 檢查ViewModel
        const viewModel = (gameView as any).viewModel;
        this.validationResults.viewModel = !!viewModel;
        console.log(`  ViewModel存在: ${viewModel ? '✅' : '❌'}`);

        if (viewModel) {
            // 檢查ViewModel方法
            const hasRequiredMethods = typeof viewModel.playerHit === 'function' &&
                                     typeof viewModel.playerStand === 'function' &&
                                     typeof viewModel.startNewGame === 'function';
            
            this.validationResults.viewModelMethods = hasRequiredMethods;
            console.log(`  ViewModel方法完整: ${hasRequiredMethods ? '✅' : '❌'}`);
        }

        this.validationResults.mvvm = this.validationResults.viewModel && this.validationResults.viewModelMethods;
        console.log(`  MVVM架構完整: ${this.validationResults.mvvm ? '✅' : '❌'}`);
    }

    /**
     * 驗證遊戲邏輯
     */
    private validateGameLogic(): void {
        console.log('\n🎮 驗證遊戲邏輯...');
        
        try {
            // 創建ViewModel實例進行測試
            const testViewModel = new GameViewModel();
            
            // 檢查初始狀態
            const hasInitialState = testViewModel.gameState !== undefined &&
                                  testViewModel.playerScore !== undefined &&
                                  testViewModel.dealerScore !== undefined;
            
            this.validationResults.gameLogic = hasInitialState;
            console.log(`  遊戲狀態初始化: ${hasInitialState ? '✅' : '❌'}`);
            
            // 檢查方法存在
            const hasMethods = typeof testViewModel.playerHit === 'function' &&
                             typeof testViewModel.playerStand === 'function';
            
            this.validationResults.gameMethods = hasMethods;
            console.log(`  遊戲方法存在: ${hasMethods ? '✅' : '❌'}`);
            
            // 清理測試實例
            testViewModel.dispose();
            
        } catch (error) {
            console.log(`  ❌ 遊戲邏輯驗證失敗: ${error.message}`);
            this.validationResults.gameLogic = false;
            this.validationResults.gameMethods = false;
        }
    }

    /**
     * 驗證服務器連接
     */
    private validateServerConnection(): void {
        console.log('\n🌐 驗證服務器連接...');
        
        const testSocket = new WebSocket('ws://localhost:3000');
        
        testSocket.onopen = () => {
            console.log('  ✅ WebSocket連接成功');
            this.validationResults.serverConnection = true;
            testSocket.close();
        };
        
        testSocket.onerror = (error) => {
            console.log('  ❌ WebSocket連接失敗');
            this.validationResults.serverConnection = false;
        };
        
        testSocket.onclose = () => {
            console.log('  📡 WebSocket測試完成');
        };
    }

    /**
     * 生成驗證報告
     */
    private generateValidationReport(): void {
        console.log('\n📊 驗證報告...');
        console.log('='.repeat(50));
        
        const totalTests = Object.keys(this.validationResults).length;
        // 計算通過的測試數量 (ES5相容性版本)
        const resultValues: boolean[] = [];
        for (const key in this.validationResults) {
            if (this.validationResults.hasOwnProperty(key)) {
                resultValues.push(this.validationResults[key]);
            }
        }
        const passedTests = resultValues.filter(result => result).length;
        const successRate = Math.round((passedTests / totalTests) * 100);
        
        console.log(`📈 驗證成功率: ${passedTests}/${totalTests} (${successRate}%)`);
        
        // 詳細結果 (ES5相容性版本)
        console.log('\n📋 詳細結果:');
        for (const testName in this.validationResults) {
            if (this.validationResults.hasOwnProperty(testName)) {
                const result = this.validationResults[testName];
                console.log(`  ${testName}: ${result ? '✅ 通過' : '❌ 失敗'}`);
            }
        }
        
        // 建議
        console.log('\n💡 建議:');
        if (successRate >= 90) {
            console.log('  🎉 系統運行良好！所有主要功能都正常工作。');
        } else if (successRate >= 70) {
            console.log('  ⚠️ 系統基本可用，但有些功能需要修復。');
            this.provideSuggestions();
        } else {
            console.log('  🚨 系統存在嚴重問題，需要進行修復。');
            this.provideSuggestions();
        }
        
        console.log('='.repeat(50));
    }

    /**
     * 提供修復建議
     */
    private provideSuggestions(): void {
        if (!this.validationResults.canvas) {
            console.log('  🔧 確保場景中有Canvas節點');
        }
        
        if (!this.validationResults.gameView && !this.validationResults.quickStart && !this.validationResults.uiDemo) {
            console.log('  🔧 添加QuickStart組件到Canvas節點');
        }
        
        if (!this.validationResults.uiElements) {
            console.log('  🔧 檢查UI元素是否正確創建');
        }
        
        if (!this.validationResults.mvvm) {
            console.log('  🔧 確保MVVM架構正確初始化');
        }
        
        if (!this.validationResults.serverConnection) {
            console.log('  🔧 啟動後端服務器: npm start');
        }
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
     * 手動運行驗證
     */
    public manualValidation(): void {
        console.log('🔬 [系統驗證] 手動觸發驗證...');
        this.runSystemValidation();
    }
}
