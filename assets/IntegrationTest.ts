/**
 * 完整MVVM架構整合測試
 * 測試BlackjackSceneSetup與GameView的整合功能
 */

import { _decorator, Component, Node } from 'cc';
import { BlackjackSceneSetup } from './BlackjackSceneSetup';
import { GameView } from './GameView';

const { ccclass, property } = _decorator;

/**
 * 整合測試組件
 */
@ccclass('IntegrationTest')
export class IntegrationTest extends Component {
    
    @property({
        tooltip: '是否自動運行測試'
    })
    autoRunTest: boolean = true;

    @property({
        tooltip: '測試延遲時間（秒）'
    })
    testDelay: number = 2;

    private sceneSetup: BlackjackSceneSetup;

    start() {
        if (this.autoRunTest) {
            this.scheduleOnce(() => {
                this.runIntegrationTest();
            }, this.testDelay);
        }
    }

    /**
     * 運行整合測試
     */
    public runIntegrationTest(): void {
        console.log('='.repeat(50));
        console.log('🎮 開始MVVM架構整合測試');
        console.log('='.repeat(50));
        
        // 測試1: 場景設置組件
        this.testSceneSetup();
        
        // 測試2: UI自動創建
        this.testUICreation();
        
        // 測試3: MVVM綁定
        this.testMVVMBinding();
        
        // 測試4: 遊戲功能
        this.scheduleOnce(() => {
            this.testGameFunctionality();
        }, 1);
        
        // 測試5: 統計功能
        this.scheduleOnce(() => {
            this.testGameStats();
        }, 2);
        
        console.log('📊 整合測試完成');
    }

    /**
     * 測試場景設置組件
     */
    private testSceneSetup(): void {
        console.log('🔧 測試1: 場景設置組件');
        
        // 查找或創建場景設置組件
        this.sceneSetup = this.node.getComponent(BlackjackSceneSetup);
        if (!this.sceneSetup) {
            this.sceneSetup = this.node.addComponent(BlackjackSceneSetup);
            console.log('  ✅ 場景設置組件已創建');
        } else {
            console.log('  ✅ 場景設置組件已存在');
        }
        
        // 配置測試參數
        this.sceneSetup.autoCreateUI = true;
        this.sceneSetup.autoConnectServer = true;
        this.sceneSetup.showDebugInfo = true;
        
        console.log('  ✅ 場景設置組件配置完成');
    }

    /**
     * 測試UI自動創建
     */
    private testUICreation(): void {
        console.log('🎨 測試2: UI自動創建');
        
        if (this.sceneSetup) {
            // 手動觸發UI創建
            this.sceneSetup.manualSetup();
            
            // 檢查UI元素
            const uiContainer = this.node.getChildByName('UI_Container');
            if (uiContainer) {
                console.log('  ✅ UI容器已創建');
                
                // 檢查子元素
                const titleContainer = uiContainer.getChildByName('Title_Container');
                const infoContainer = uiContainer.getChildByName('Info_Container');
                const controlContainer = uiContainer.getChildByName('Control_Container');
                
                if (titleContainer) console.log('  ✅ 標題區域已創建');
                if (infoContainer) console.log('  ✅ 信息區域已創建');
                if (controlContainer) console.log('  ✅ 控制區域已創建');
                
            } else {
                console.warn('  ⚠️ UI容器未找到');
            }
        }
    }

    /**
     * 測試MVVM綁定
     */
    private testMVVMBinding(): void {
        console.log('🔗 測試3: MVVM綁定');
        
        const gameView = this.sceneSetup?.getGameView();
        if (gameView) {
            console.log('  ✅ GameView組件已獲取');
            
            // 檢查ViewModel
            if (gameView['viewModel']) {
                console.log('  ✅ ViewModel已綁定');
                
                // 檢查Model
                if (gameView['viewModel']['gameModel']) {
                    console.log('  ✅ GameModel已綁定');
                } else {
                    console.warn('  ⚠️ GameModel未綁定');
                }
            } else {
                console.warn('  ⚠️ ViewModel未綁定');
            }
            
            // 檢查UI元素綁定
            const uiElementsCheck = [
                { name: 'playerScoreLabel', element: gameView.playerScoreLabel },
                { name: 'dealerScoreLabel', element: gameView.dealerScoreLabel },
                { name: 'hitButton', element: gameView.hitButton },
                { name: 'standButton', element: gameView.standButton },
                { name: 'restartButton', element: gameView.restartButton }
            ];
            
            let bindingCount = 0;
            uiElementsCheck.forEach(item => {
                if (item.element) {
                    bindingCount++;
                    console.log(`  ✅ ${item.name} 已綁定`);
                } else {
                    console.warn(`  ⚠️ ${item.name} 未綁定`);
                }
            });
            
            console.log(`  📊 UI綁定完成度: ${bindingCount}/${uiElementsCheck.length}`);
            
        } else {
            console.warn('  ⚠️ GameView組件未找到');
        }
    }

    /**
     * 測試遊戲功能
     */
    private testGameFunctionality(): void {
        console.log('🎲 測試4: 遊戲功能');
        
        const gameView = this.sceneSetup?.getGameView();
        if (gameView && gameView['viewModel']) {
            const viewModel = gameView['viewModel'];
            
            // 測試連接狀態
            const isConnected = viewModel.isConnected;
            console.log('  📡 連接狀態:', isConnected ? '已連接' : '未連接');
            
            // 測試遊戲初始化
            try {
                viewModel.startGame(); // 修正方法名稱，使用 startGame 替代 startNewGame
                console.log('  ✅ 遊戲初始化成功');
                
                // 檢查遊戲狀態
                const gameState = viewModel.gameState;
                const currentPlayer = viewModel.currentPlayer;
                const dealer = viewModel.dealer;
                console.log('  📊 當前遊戲狀態:', gameState);
                console.log('  👤 當前玩家:', currentPlayer);
                console.log('  🎰 莊家狀態:', dealer);
                
            } catch (error) {
                console.error('  ❌ 遊戲初始化失敗:', error);
            }
            
            // 測試遊戲邏輯
            this.scheduleOnce(() => {
                try {
                    viewModel.playerHit();
                    console.log('  ✅ 玩家要牌功能測試完成');
                } catch (error) {
                    console.error('  ❌ 玩家要牌功能測試失敗:', error);
                }
            }, 0.5);
            
        } else {
            console.warn('  ⚠️ 無法測試遊戲功能 - GameView或ViewModel未找到');
        }
    }

    /**
     * 測試遊戲統計
     */
    private testGameStats(): void {
        console.log('📈 測試5: 遊戲統計');
        
        const gameStats = this.sceneSetup?.getGameStats();
        if (gameStats) {
            console.log('  ✅ 遊戲統計已獲取');
            console.log('  📊 統計信息:', gameStats);
            
            // 驗證統計數據結構
            const expectedFields = ['gamesPlayed', 'gamesWon', 'gamesLost', 'winRate'];
            let validFieldCount = 0;
            
            expectedFields.forEach(field => {
                if (gameStats.hasOwnProperty(field)) {
                    validFieldCount++;
                    console.log(`  ✅ ${field}: ${gameStats[field]}`);
                } else {
                    console.warn(`  ⚠️ 缺少統計欄位: ${field}`);
                }
            });
            
            console.log(`  📊 統計數據完整度: ${validFieldCount}/${expectedFields.length}`);
            
        } else {
            console.warn('  ⚠️ 無法獲取遊戲統計');
        }
    }

    /**
     * 手動運行特定測試
     */
    public runSpecificTest(testName: string): void {
        console.log(`🔍 運行特定測試: ${testName}`);
        
        switch (testName) {
            case 'scene':
                this.testSceneSetup();
                break;
            case 'ui':
                this.testUICreation();
                break;
            case 'mvvm':
                this.testMVVMBinding();
                break;
            case 'game':
                this.testGameFunctionality();
                break;
            case 'stats':
                this.testGameStats();
                break;
            default:
                console.warn('未知的測試名稱:', testName);
        }
    }

    /**
     * 生成測試報告
     */
    public generateTestReport(): any {
        console.log('📋 生成測試報告');
        console.log('='.repeat(50));
        
        const gameView = this.sceneSetup?.getGameView();
        const isConnected = gameView?.['viewModel']?.isConnected;  // 修正: isConnected 是屬性不是方法
        const gameStats = this.sceneSetup?.getGameStats();
        
        const report = {
            timestamp: new Date().toLocaleString(),
            sceneSetup: !!this.sceneSetup,
            gameView: !!gameView,
            connection: !!isConnected,
            gameStats: !!gameStats,
            uiElements: this.countUIElements(),
            mvvmBinding: this.checkMVVMBinding()
        };
        
        console.log('📊 測試報告:', report);
        console.log('='.repeat(50));
        
        return report;
    }

    /**
     * 計算UI元素數量
     */
    private countUIElements(): number {
        const uiContainer = this.node.getChildByName('UI_Container');
        return uiContainer ? this.countAllChildren(uiContainer) : 0;
    }

    /**
     * 遞歸計算所有子節點數量
     */
    private countAllChildren(node: Node): number {
        let count = node.children.length;
        node.children.forEach(child => {
            count += this.countAllChildren(child);
        });
        return count;
    }

    /**
     * 檢查MVVM綁定狀態
     */
    private checkMVVMBinding(): boolean {
        const gameView = this.sceneSetup?.getGameView();
        return !!(gameView && gameView['viewModel'] && gameView['viewModel']['gameModel']);
    }
}
