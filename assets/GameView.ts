import { _decorator, Component, Node, Label, Button } from 'cc';
import { GameViewModel } from './GameViewModel';
import { GameState } from './GameModel';

const { ccclass, property } = _decorator;

/**
 * 21點遊戲的View層
 * 負責UI顯示和用戶交互
 * 現已整合UI配置驗證和自動化功能
 */
@ccclass('GameView')
export class GameView extends Component {
    // UI元素屬性 - 玩家分數顯示標籤
    @property({
        type: Label,
        tooltip: '玩家分數顯示標籤'
    })
    playerScoreLabel: Label = null;

    // UI元素屬性 - 莊家分數顯示標籤
    @property({
        type: Label,
        tooltip: '莊家分數顯示標籤'
    })
    dealerScoreLabel: Label = null;

    // UI元素屬性 - 要牌按鈕
    @property({
        type: Node,
        tooltip: '要牌按鈕節點'
    })
    hitButton: Node = null;

    // UI元素屬性 - 停牌按鈕
    @property({
        type: Node,
        tooltip: '停牌按鈕節點'
    })
    standButton: Node = null;

    // UI元素屬性 - 重新開始按鈕
    @property({
        type: Node,
        tooltip: '重新開始按鈕節點'
    })
    restartButton: Node = null;

    // UI元素屬性 - 遊戲結果顯示標籤
    @property({
        type: Label,
        tooltip: '遊戲結果顯示標籤'
    })
    gameResultLabel: Label = null;

    // UI元素屬性 - 連接狀態顯示標籤
    @property({
        type: Label,
        tooltip: '連接狀態顯示標籤'
    })
    connectionStatusLabel: Label = null;

    // 配置選項
    @property({
        tooltip: '是否在啟動時驗證UI配置'
    })
    validateUIOnStart: boolean = true;

    @property({
        tooltip: '是否啟用UI調試信息'
    })
    enableUIDebug: boolean = false;

    // ViewModel實例
    private viewModel: GameViewModel = null;
    
    // UI狀態追踪
    private isUIReady: boolean = false;

    /**
     * 組件開始時執行
     */
    start(): void {
        this.initializeViewModel();
        this.setupEventHandlers();
        this.initializeUI();
    }

    /**
     * 初始化ViewModel
     */
    private initializeViewModel(): void {
        this.viewModel = new GameViewModel();
        
        // 綁定ViewModel回調事件 - 使用新的多人遊戲API
        this.viewModel.setOnGameStateUpdate((gameState) => {
            this.updateGameDisplay(gameState);
        });
        
        this.viewModel.setOnGameEnd((result, finalScores) => {
            this.handleGameEnd(result);
        });
        
        this.viewModel.setOnConnectionStatus((connected) => {
            this.updateConnectionStatus(connected);
        });
        
        // 自動加入遊戲作為單人玩家
        // 先設置玩家名稱，然後加入遊戲
        this.viewModel.updatePlayerName('Player 1');
        this.viewModel.joinGame();
    }

    /**
     * 設置UI事件處理器
     */
    private setupEventHandlers(): void {
        // 要牌按鈕點擊事件
        if (this.hitButton) {
            this.hitButton.on(Node.EventType.MOUSE_DOWN, this.onHitButtonClicked, this);
        }

        // 停牌按鈕點擊事件
        if (this.standButton) {
            this.standButton.on(Node.EventType.MOUSE_DOWN, this.onStandButtonClicked, this);
        }

        // 重新開始按鈕點擊事件
        if (this.restartButton) {
            this.restartButton.on(Node.EventType.MOUSE_DOWN, this.onRestartButtonClicked, this);
        }
    }

    /**
     * 初始化UI狀態
     */
    private initializeUI(): void {
        this.updateScoreDisplay(0, 0);
        this.updateGameResult('');
        this.updateConnectionStatus(false);
        this.setButtonsInteractable(false);
        
        // UI配置驗證
        if (this.validateUIOnStart) {
            this.validateUIConfiguration();
        }
    }

    /**
     * 要牌按鈕點擊處理
     */
    private onHitButtonClicked(): void {
        console.log('玩家選擇要牌');
        this.viewModel.playerHit();
    }

    /**
     * 停牌按鈕點擊處理
     */
    private onStandButtonClicked(): void {
        console.log('玩家選擇停牌');
        this.viewModel.playerStand();
    }

    /**
     * 重新開始按鈕點擊處理
     */
    private onRestartButtonClicked(): void {
        console.log('重新開始遊戲');
        this.viewModel.startGame(); // 修正：startNewGame -> startGame
        this.updateGameResult('');
        this.setButtonsInteractable(true);
    }

    /**
     * 更新遊戲顯示（新的多人遊戲方法）
     */
    private updateGameDisplay(gameState: GameState): void {
        // 更新玩家分數（如果有玩家的話）
        if (gameState.players && gameState.players.length > 0) {
            const player = gameState.players[0]; // 使用第一個玩家作為主玩家
            if (this.playerScoreLabel) {
                this.playerScoreLabel.string = `玩家: ${player.score}`;
            }
        } else {
            if (this.playerScoreLabel) {
                this.playerScoreLabel.string = `玩家: 0`;
            }
        }
        
        // 更新莊家分數
        if (gameState.dealer && this.dealerScoreLabel) {
            this.dealerScoreLabel.string = `莊家: ${gameState.dealer.score}`;
        } else if (this.dealerScoreLabel) {
            this.dealerScoreLabel.string = `莊家: 0`;
        }
    }

    /**
     * 更新分數顯示（保留向後兼容性）
     */
    private updateScoreDisplay(playerScore: number, dealerScore: number): void {
        if (this.playerScoreLabel) {
            this.playerScoreLabel.string = `玩家: ${playerScore}`;
        }
        
        if (this.dealerScoreLabel) {
            this.dealerScoreLabel.string = `莊家: ${dealerScore}`;
        }
    }

    /**
     * 處理遊戲結束
     */
    private handleGameEnd(result: string): void {
        console.log('遊戲結束:', result);
        this.updateGameResult(result);
        this.setButtonsInteractable(false);
    }

    /**
     * 更新遊戲結果顯示
     */
    private updateGameResult(result: string): void {
        if (this.gameResultLabel) {
            this.gameResultLabel.string = result;
        }
    }

    /**
     * 更新連接狀態顯示
     */
    private updateConnectionStatus(connected: boolean): void {
        const status = connected ? '已連接' : '未連接';
        const color = connected ? 'green' : 'red';
        
        if (this.connectionStatusLabel) {
            this.connectionStatusLabel.string = `伺服器狀態: ${status}`;
            // 可以在這裡設置顏色，根據Cocos Creator版本的不同API可能有所差異
        }
        
        // 根據連接狀態啟用或禁用遊戲按鈕
        if (connected && this.viewModel && this.viewModel.gameState && this.viewModel.gameState.gamePhase !== 'ended') {
            this.setButtonsInteractable(true);
        } else {
            this.setButtonsInteractable(false);
        }
    }

    /**
     * 設置按鈕的可交互狀態
     */
    private setButtonsInteractable(interactable: boolean): void {
        // 只有要牌和停牌按鈕受遊戲狀態影響
        if (this.hitButton) {
            // 根據Cocos Creator版本設置按鈕的可交互狀態
            // this.hitButton.getComponent(Button).interactable = interactable;
        }
        
        if (this.standButton) {
            // this.standButton.getComponent(Button).interactable = interactable;
        }
        
        // 重新開始按鈕在遊戲結束時才可用
        if (this.restartButton) {
            // this.restartButton.getComponent(Button).interactable = !interactable;
        }
    }

    /**
     * 驗證UI配置
     */
    private validateUIConfiguration(): void {
        // 檢查必需的UI元素是否已設置
        const missingElements = [];
        
        if (!this.playerScoreLabel) {
            missingElements.push('玩家分數顯示標籤');
        }
        
        if (!this.dealerScoreLabel) {
            missingElements.push('莊家分數顯示標籤');
        }
        
        if (!this.hitButton) {
            missingElements.push('要牌按鈕');
        }
        
        if (!this.standButton) {
            missingElements.push('停牌按鈕');
        }
        
        if (!this.restartButton) {
            missingElements.push('重新開始按鈕');
        }
        
        if (!this.gameResultLabel) {
            missingElements.push('遊戲結果顯示標籤');
        }
        
        if (!this.connectionStatusLabel) {
            missingElements.push('連接狀態顯示標籤');
        }

        // 如果有缺失的元素，則記錄錯誤並禁用相關功能
        if (missingElements.length > 0) {
            console.error('UI配置錯誤，缺失以下元素:', missingElements.join(', '));
            this.setButtonsInteractable(false);
            this.isUIReady = false;
        } else {
            console.log('UI配置驗證通過');
            this.isUIReady = true;
            this.setButtonsInteractable(true);
        }
    }

    /**
     * 從場景設置組件初始化遊戲
     * 此方法由BlackjackSceneSetup調用
     */
    public initializeGame(): void {
        console.log('[GameView] 從場景設置初始化遊戲...');
        
        // 確保所有UI元素都已正確設置
        if (!this.validateCoreUIElements()) {
            console.error('[GameView] 核心UI元素未正確設置，無法初始化遊戲');
            return;
        }
        
        // 初始化ViewModel和Model
        this.initializeViewModel();
        
        // 設置UI事件處理器
        this.setupEventHandlers();
        
        // 初始化UI狀態
        this.initializeUI();
        
        console.log('[GameView] 遊戲初始化完成');
    }

    /**
     * 驗證核心UI元素是否存在
     */
    private validateCoreUIElements(): boolean {
        const requiredElements = [
            { element: this.playerScoreLabel, name: 'playerScoreLabel' },
            { element: this.dealerScoreLabel, name: 'dealerScoreLabel' },
            { element: this.hitButton, name: 'hitButton' },
            { element: this.standButton, name: 'standButton' },
            { element: this.restartButton, name: 'restartButton' }
        ];
        
        let allValid = true;
        
        for (const item of requiredElements) {
            if (!item.element) {
                console.warn(`[GameView] ${item.name} 未設置`);
                allValid = false;
            }
        }
        
        return allValid;
    }

    /**
     * 重置遊戲狀態
     */
    public resetGame(): void {
        console.log('[GameView] 重置遊戲狀態...');
        
        if (this.viewModel) {
            this.viewModel.startGame(); // 修正：startNewGame -> startGame
        }
        
        // 重置UI顯示
        this.updateScoreDisplay(0, 0);
        this.updateGameResult('');
        this.setButtonsInteractable(false);
    }

    /**
     * 獲取當前遊戲統計
     */
    public getGameStats(): any {
        if (this.viewModel) {
            return this.viewModel.gameStats;
        }
        return null;
    }

    /**
     * 手動設置服務器URL（用於場景配置）
     */
    public setServerUrl(url: string): void {
        if (this.viewModel) {
            this.viewModel.setServerUrl(url);
        }
    }

    /**
     * 獲取連接狀態
     * @returns 是否已連接到服務器
     */
    public get isConnected(): boolean {
        return this.viewModel ? this.viewModel.isConnected : false;
    }

    /**
     * 組件銷毀時清理資源
     */
    onDestroy(): void {
        // 移除事件監聽器
        if (this.hitButton) {
            this.hitButton.off(Node.EventType.MOUSE_DOWN, this.onHitButtonClicked, this);
        }
        
        if (this.standButton) {
            this.standButton.off(Node.EventType.MOUSE_DOWN, this.onStandButtonClicked, this);
        }
        
        if (this.restartButton) {
            this.restartButton.off(Node.EventType.MOUSE_DOWN, this.onRestartButtonClicked, this);
        }

        // 清理ViewModel資源
        if (this.viewModel) {
            this.viewModel.dispose();
            this.viewModel = null;
        }
    }
}
