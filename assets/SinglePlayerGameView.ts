import { _decorator, Component, Node, Label, Button } from 'cc';
import { GameViewModel } from './GameViewModel';
import { GameState, Player } from './GameModel';

const { ccclass, property } = _decorator;

/**
 * 單人21點遊戲的View層（向後兼容版本）
 * 適用於單人對莊家的傳統21點遊戲
 */
@ccclass('SinglePlayerGameView')
export class SinglePlayerGameView extends Component {
    // UI元素屬性 - 玩家分數顯示標籤
    @property({
        type: Label,
        tooltip: '玩家分數顯示標籤'
    })
    playerScoreLabel: Label = null;

    // 玩家姓名相關屬性
    @property({
        type: Label,
        tooltip: '玩家姓名顯示標籤'
    })
    playerNameLabel: Label = null;
    
    @property({
        tooltip: '玩家姓名更新冷卻時間（分鐘）'
    })
    nameUpdateCooldownMinutes: number = 5;
    
    @property({
        type: Label,
        tooltip: '冷卻時間顯示標籤'
    })
    cooldownLabel: Label = null;

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
    
    // 玩家姓名輸入相關UI
    @property({
        type: Node,
        tooltip: '姓名輸入區塊'
    })
    nameInputArea: Node = null;

    @property({
        type: Node,
        tooltip: '姓名輸入框'
    })
    nameInputField: Node = null;

    @property({
        type: Node,
        tooltip: '姓名更新按鈕'
    })
    updateNameButton: Node = null;

    // ViewModel實例
    private viewModel: GameViewModel = null;
    
    // 當前遊戲狀態
    private currentGameState: GameState = null;

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
        // 為單人模式創建固定的玩家ID
        const singlePlayerId = 'single_player';
        this.viewModel = new GameViewModel(singlePlayerId);
        
        // 綁定ViewModel回調事件
        this.viewModel.setOnGameStateUpdate((gameState) => {
            this.updateGameStateDisplay(gameState);
        });
        
        this.viewModel.setOnGameEnd((result, finalScores) => {
            this.handleGameEnd(result);
        });
        
        this.viewModel.setOnConnectionStatus((connected) => {
            this.updateConnectionStatus(connected);
        });
        
        // 添加玩家姓名更新回調
        this.viewModel.setOnPlayerNameUpdate((playerId, newName) => {
            this.updatePlayerNameDisplay(playerId, newName);
        });
        
        // 添加冷卻時間更新回調
        this.viewModel.setOnNameUpdateCooldown((cooldownEnd) => {
            this.startFormattedCooldownTimer(cooldownEnd);
        });

        // 自動加入遊戲（單人模式）
        setTimeout(() => {
            this.viewModel.joinGame();
        }, 1000);
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

        // 姓名更新按鈕點擊事件
        if (this.updateNameButton) {
            this.updateNameButton.on(Node.EventType.MOUSE_DOWN, this.onUpdateNameButtonClicked, this);
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
        this.viewModel.startGame();
        this.updateGameResult('');
        this.setButtonsInteractable(true);
    }

    /**
     * 姓名更新按鈕點擊處理
     */
    private onUpdateNameButtonClicked(): void {
        console.log('更新玩家姓名');
        const newName = this.getNameInputValue();
        this.viewModel.updatePlayerName(newName);
    }

    /**
     * 獲取姓名輸入框的值
     */
    private getNameInputValue(): string {
        if (!this.nameInputField) return '';
        
        const inputComponent = this.nameInputField.getComponent('cc.EditBox');
        if (inputComponent && typeof inputComponent['string'] === 'string') {
            return inputComponent['string'];
        }
        return '';
    }

    /**
     * 更新遊戲狀態顯示（適配單人模式）
     */
    private updateGameStateDisplay(gameState: GameState): void {
        this.currentGameState = gameState;
        
        // 單人模式：取第一個玩家作為主玩家
        let playerScore = 0;
        if (gameState.players.length > 0) {
            playerScore = gameState.players[0].score;
        }
        
        // 更新分數顯示
        this.updateScoreDisplay(playerScore, gameState.dealer.score);
        
        // 更新按鈕狀態
        const canPlay = gameState.gamePhase === 'playing' && this.isPlayerTurn();
        this.setButtonsInteractable(canPlay);
    }

    /**
     * 更新分數顯示
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
        
        // 為單人模式簡化結果顯示
        let simpleResult = result;
        if (result.includes('Player Wins')) {
            simpleResult = '玩家勝利！';
        } else if (result.includes('Dealer Wins')) {
            simpleResult = '莊家勝利！';
        } else if (result.includes('Tie')) {
            simpleResult = '平手！';
        }
        
        this.updateGameResult(simpleResult);
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
        if (this.connectionStatusLabel) {
            this.connectionStatusLabel.string = connected ? '已連接' : '未連接';
        }
    }

    /**
     * 設置按鈕可交互性
     */
    private setButtonsInteractable(interactable: boolean): void {
        if (this.hitButton) {
            const button = this.hitButton.getComponent(Button);
            if (button) button.interactable = interactable;
        }
        
        if (this.standButton) {
            const button = this.standButton.getComponent(Button);
            if (button) button.interactable = interactable;
        }
    }

    /**
     * 檢查是否為玩家回合
     */
    private isPlayerTurn(): boolean {
        if (!this.currentGameState) return false;
        
        // 單人模式：檢查是否為第一個玩家的回合
        return this.currentGameState.currentPlayerIndex === 0 && 
               this.currentGameState.players.length > 0 &&
               this.currentGameState.players[0].isActive;
    }

    /**
     * 獲取遊戲統計信息
     */
    public getGameStats() {
        return this.viewModel?.gameStats;
    }

    /**
     * 組件銷毀時清理資源
     */
    onDestroy(): void {
        if (this.viewModel) {
            this.viewModel.dispose();
        }
    }

    /**
     * 更新玩家姓名顯示
     */
    private updatePlayerNameDisplay(playerId: string, newName: string): void {
        // 假設單人模式下玩家ID固定為'single_player'
        if (playerId === 'single_player' && this.playerNameLabel) {
            this.playerNameLabel.string = newName;
        }
    }

    /**
     * 格式化冷卻時間顯示
     * @param seconds 剩餘秒數
     * @returns 格式化的時間字串 (例如: 3分30秒)
     */
    private formatCooldownTime(seconds: number): string {
        if (seconds < 60) {
            return `${seconds}秒`;
        }
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (remainingSeconds === 0) {
            return `${minutes}分鐘`;
        }
        
        return `${minutes}分${remainingSeconds}秒`;
    }
    
    /**
     * 開始冷卻計時器 (使用更好的格式)
     */
    private startFormattedCooldownTimer(cooldownEnd: number): void {
        if (this.cooldownLabel) {
            const updateCooldown = () => {
                const remainingSecs = Math.ceil((cooldownEnd - Date.now()) / 1000);
                
                if (remainingSecs > 0) {
                    this.cooldownLabel.string = `冷卻中: ${this.formatCooldownTime(remainingSecs)}`;
                    return true;
                } else {
                    this.cooldownLabel.string = '可以更新姓名';
                    this.enableNameUpdateUI(true);
                    return false;
                }
            };
            
            // 立即更新一次
            const shouldContinue = updateCooldown();
            
            if (shouldContinue) {
                // 禁用姓名更新按鈕
                this.enableNameUpdateUI(false);
                
                // 每秒更新一次
                this.unscheduleAllCallbacks();
                this.schedule(() => {
                    if (!updateCooldown()) {
                        this.unscheduleAllCallbacks();
                    }
                }, 1);
            }
        }
    }
    
    /**
     * 啟用/禁用姓名更新UI
     */
    private enableNameUpdateUI(enabled: boolean): void {
        if (this.updateNameButton) {
            const button = this.updateNameButton.getComponent(Button);
            if (button) {
                button.interactable = enabled;
            }
        }
    }
}
