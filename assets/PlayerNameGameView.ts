import { _decorator, Component, Node, Label, Button, EditBox } from 'cc';
import { GameViewModel } from './GameViewModel';
import { GameState } from './GameModel';

const { ccclass, property } = _decorator;

/**
 * 增強版21點遊戲View - 支援玩家姓名輸入和同步
 * 負責UI顯示、用戶交互和玩家姓名管理
 */
@ccclass('PlayerNameGameView')
export class PlayerNameGameView extends Component {
    // ===== 玩家姓名相關UI =====
    @property({
        type: EditBox,
        tooltip: '玩家姓名輸入框'
    })
    playerNameInput: EditBox = null;

    @property({
        type: Button,
        tooltip: '確認姓名按鈕'
    })
    confirmNameButton: Button = null;

    @property({
        type: Button,
        tooltip: '更新姓名按鈕'
    })
    updateNameButton: Button = null;

    @property({
        type: Label,
        tooltip: '當前玩家姓名顯示'
    })
    currentPlayerNameLabel: Label = null;

    @property({
        type: Label,
        tooltip: '姓名更新冷卻時間顯示'
    })
    cooldownTimerLabel: Label = null;

    @property({
        type: Label,
        tooltip: '線上玩家列表顯示'
    })
    onlinePlayersLabel: Label = null;

    // ===== 連線相關UI =====
    @property({
        type: Button,
        tooltip: '連接服務器按鈕'
    })
    connectButton: Button = null;

    @property({
        type: Button,
        tooltip: '斷開連接按鈕'
    })
    disconnectButton: Button = null;

    @property({
        type: Label,
        tooltip: '連接狀態顯示標籤'
    })
    connectionStatusLabel: Label = null;

    // ===== 遊戲相關UI =====
    @property({
        type: Label,
        tooltip: '玩家分數顯示標籤'
    })
    playerScoreLabel: Label = null;

    @property({
        type: Label,
        tooltip: '莊家分數顯示標籤'
    })
    dealerScoreLabel: Label = null;

    @property({
        type: Button,
        tooltip: '要牌按鈕'
    })
    hitButton: Button = null;

    @property({
        type: Button,
        tooltip: '停牌按鈕'
    })
    standButton: Button = null;

    @property({
        type: Button,
        tooltip: '開始遊戲按鈕'
    })
    startGameButton: Button = null;

    @property({
        type: Label,
        tooltip: '遊戲結果顯示標籤'
    })
    gameResultLabel: Label = null;

    @property({
        type: Label,
        tooltip: '遊戲狀態顯示標籤'
    })
    gameStatusLabel: Label = null;

    // ===== 遊戲配置 =====
    @property({
        tooltip: '默認玩家姓名'
    })
    defaultPlayerName: string = '';

    @property({
        tooltip: '服務器地址'
    })
    serverUrl: string = 'ws://localhost:3000';

    @property({
        tooltip: '是否啟用調試日誌'
    })
    enableDebug: boolean = true;
    
    @property({
        tooltip: '姓名更新冷卻時間（分鐘）',
        range: [1, 60, 1],
        slide: true
    })
    nameUpdateCooldownMinutes: number = 5;

    // ===== 私有屬性 =====
    private viewModel: GameViewModel = null;
    private currentPlayerName: string = '';
    private playerId: string = '';
    private onlinePlayers: Map<string, string> = new Map(); // playerId -> playerName
    private cooldownUpdateTimer: any = null; // 冷卻計時器

    /**
     * 組件開始時執行
     */
    start(): void {
        this.initializePlayerId();
        this.initializeViewModel();
        this.setupEventHandlers();
        this.initializeUI();
        this.logDebug('PlayerNameGameView initialized');
    }

    /**
     * 初始化玩家ID
     */
    private initializePlayerId(): void {
        // 生成唯一的玩家ID
        this.playerId = 'player_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        this.logDebug(`Generated player ID: ${this.playerId}`);
    }

    /**
     * 初始化ViewModel
     */
    private initializeViewModel(): void {
        this.viewModel = new GameViewModel(this.playerId);
        
        // 設置遊戲配置
        // 冷卻時間已在GameModel默認配置中設置，這裡只需綁定回調
        
        // 綁定ViewModel回調事件
        this.viewModel.setOnGameStateUpdate((gameState) => {
            this.updateGameDisplay(gameState);
        });
        
        this.viewModel.setOnGameEnd((result, finalScores) => {
            this.handleGameEnd(result);
        });

        // 綁定連接狀態回調
        this.viewModel.setOnConnectionStateChange((isConnected, message) => {
            this.updateConnectionStatus(isConnected, message);
        });

        // 綁定玩家列表更新回調
        this.viewModel.setOnPlayersUpdate((players) => {
            this.updateOnlinePlayersList(players);
        });

        // 綁定姓名更新冷卻回調
        this.viewModel.setOnNameUpdateCooldown((cooldownEnd) => {
            this.updateCooldownDisplay(Math.ceil((cooldownEnd - Date.now()) / 1000));
        });
        
        this.logDebug(`Initialized ViewModel with cooldown: ${this.nameUpdateCooldownMinutes} minutes`);
    }

    /**
     * 設置事件處理器
     */
    private setupEventHandlers(): void {
        // 姓名相關按鈕事件
        if (this.confirmNameButton) {
            this.confirmNameButton.node.on(Button.EventType.CLICK, this.onConfirmName, this);
        }

        if (this.updateNameButton) {
            this.updateNameButton.node.on(Button.EventType.CLICK, this.onUpdateName, this);
        }

        // 連線按鈕事件
        if (this.connectButton) {
            this.connectButton.node.on(Button.EventType.CLICK, this.onConnect, this);
        }

        if (this.disconnectButton) {
            this.disconnectButton.node.on(Button.EventType.CLICK, this.onDisconnect, this);
        }

        // 遊戲按鈕事件
        if (this.startGameButton) {
            this.startGameButton.node.on(Button.EventType.CLICK, this.onStartGame, this);
        }

        if (this.hitButton) {
            this.hitButton.node.on(Button.EventType.CLICK, this.onHit, this);
        }

        if (this.standButton) {
            this.standButton.node.on(Button.EventType.CLICK, this.onStand, this);
        }

        // 姓名輸入框事件
        if (this.playerNameInput) {
            this.playerNameInput.node.on(EditBox.EventType.EDITING_DID_ENDED, this.onNameInputChanged, this);
        }
    }

    /**
     * 初始化UI
     */
    private initializeUI(): void {
        // 設置默認玩家姓名
        if (this.defaultPlayerName) {
            this.currentPlayerName = this.defaultPlayerName;
        } else {
            this.currentPlayerName = `Player${Math.floor(Math.random() * 1000)}`;
        }

        // 更新UI顯示
        this.updatePlayerNameDisplay();
        this.updateConnectionStatus(false, '未連接');
        this.updateGameButtons(false);
        this.updateOnlinePlayersList([]);

        // 初始化冷卻顯示
        this.updateCooldownDisplay(0);

        // 設置輸入框默認值
        if (this.playerNameInput) {
            this.playerNameInput.string = this.currentPlayerName;
        }
    }

    // ===== 姓名管理方法 =====

    /**
     * 確認姓名按鈕點擊事件
     */
    private onConfirmName(): void {
        const inputName = this.playerNameInput?.string?.trim();
        if (inputName && inputName.length > 0) {
            this.currentPlayerName = inputName;
            this.updatePlayerNameDisplay();
            this.logDebug(`Player name confirmed: ${this.currentPlayerName}`);
            
            // 如果已連接，通知服務器更新姓名
            if (this.viewModel && this.viewModel.isConnected) {
                this.sendNameUpdateToServer();
            }
        } else {
            this.showMessage('請輸入有效的玩家姓名');
        }
    }

    /**
     * 更新姓名按鈕點擊事件
     */
    private onUpdateName(): void {
        const inputName = this.playerNameInput?.string?.trim();
        if (inputName && inputName.length > 0 && inputName !== this.currentPlayerName) {
            // 檢查冷卻時間
            if (this.viewModel && !this.viewModel.canUpdateName()) {
                const remaining = this.viewModel.getNameUpdateCooldownRemaining();
                // 格式化為分:秒
                const minutes = Math.floor(remaining / 60);
                const seconds = remaining % 60;
                let timeDisplay = '';
                
                if (minutes > 0) {
                    timeDisplay = `${minutes}分${seconds}秒`;
                } else {
                    timeDisplay = `${seconds}秒`;
                }
                
                this.showMessage(`姓名更新冷卻中，請等待 ${timeDisplay}`);
                // 更新冷卻顯示（即使已經在顯示中，也再更新一次以確保用戶注意到）
                this.updateCooldownDisplay(remaining);
                return;
            }

            this.currentPlayerName = inputName;
            this.updatePlayerNameDisplay();
            this.logDebug(`Player name updated: ${this.currentPlayerName}`);
            
            // 通知服務器更新姓名
            if (this.viewModel && this.viewModel.isConnected) {
                const success = this.sendNameUpdateToServer();
                if (success) {
                    // 開始顯示冷卻狀態
                    this.startCooldownDisplay();
                    this.showMessage('姓名更新成功，開始冷卻倒計時');
                }
            }
        } else {
            this.showMessage('請輸入不同的玩家姓名');
        }
    }

    /**
     * 姓名輸入框變更事件
     */
    private onNameInputChanged(): void {
        // 可以在這裡添加實時驗證邏輯
        const inputName = this.playerNameInput?.string?.trim();
        if (inputName && inputName.length > 20) {
            this.playerNameInput.string = inputName.substring(0, 20);
            this.showMessage('玩家姓名不能超過20個字符');
        }
    }

    /**
     * 發送姓名更新到服務器
     */
    private sendNameUpdateToServer(): boolean {
        if (this.viewModel) {
            return this.viewModel.updatePlayerName(this.currentPlayerName);
        }
        return false;
    }

    /**
     * 更新玩家姓名顯示
     */
    private updatePlayerNameDisplay(): void {
        if (this.currentPlayerNameLabel) {
            this.currentPlayerNameLabel.string = `當前玩家: ${this.currentPlayerName}`;
        }
    }

    /**
     * 開始冷卻顯示
     */
    private startCooldownDisplay(): void {
        if (this.viewModel) {
            const remaining = this.viewModel.getNameUpdateCooldownRemaining();
            this.updateCooldownDisplay(remaining);
        }
    }

    /**
     * 更新冷卻顯示
     */
    private updateCooldownDisplay(remainingTime: number): void {
        if (this.cooldownTimerLabel) {
            if (remainingTime > 0) {
                // 格式化為分:秒
                const minutes = Math.floor(remainingTime / 60);
                const seconds = remainingTime % 60;
                let timeDisplay = '';
                
                if (minutes > 0) {
                    timeDisplay = `${minutes}分${seconds}秒`;
                } else {
                    timeDisplay = `${seconds}秒`;
                }
                
                this.cooldownTimerLabel.string = `姓名更新冷卻: ${timeDisplay}`;
                this.cooldownTimerLabel.node.active = true;
                
                // 禁用更新按鈕
                if (this.updateNameButton) {
                    this.updateNameButton.interactable = false;
                }
                
                // 顯示提示訊息
                if (remainingTime % 10 === 0 || remainingTime <= 5) {
                    this.showMessage(`姓名更新冷卻中，還需等待 ${timeDisplay}`);
                }
            } else {
                this.cooldownTimerLabel.string = '';
                this.cooldownTimerLabel.node.active = false;
                
                // 啟用更新按鈕
                if (this.updateNameButton) {
                    this.updateNameButton.interactable = true;
                }
                
                // 冷卻結束時顯示提示
                this.showMessage('姓名更新冷卻時間已結束，可以更新姓名了');
            }
        }
    }

    /**
     * 更新線上玩家列表顯示
     */
    private updateOnlinePlayersList(players: any[]): void {
        if (this.onlinePlayersLabel) {
            if (players.length === 0) {
                this.onlinePlayersLabel.string = '線上玩家: 無';
            } else {
                const playerNames = players.map(p => p.name || p.id).join(', ');
                this.onlinePlayersLabel.string = `線上玩家 (${players.length}): ${playerNames}`;
            }
        }

        // 更新本地玩家列表
        this.onlinePlayers.clear();
        players.forEach(player => {
            this.onlinePlayers.set(player.id, player.name || player.id);
        });
    }

    // ===== 連接管理方法 =====

    /**
     * 連接按鈕點擊事件
     */
    private onConnect(): void {
        if (!this.currentPlayerName) {
            this.showMessage('請先設置玩家姓名');
            return;
        }

        this.logDebug(`Connecting to server as ${this.currentPlayerName}...`);
        if (this.viewModel) {
            this.viewModel.setServerUrl(this.serverUrl);
            this.viewModel.connectToServer(this.serverUrl, this.playerId, this.currentPlayerName);
        }
    }

    /**
     * 斷開連接按鈕點擊事件
     */
    private onDisconnect(): void {
        this.logDebug('Disconnecting from server...');
        if (this.viewModel) {
            this.viewModel.disconnect();
        }
    }

    /**
     * 更新連接狀態顯示
     */
    private updateConnectionStatus(isConnected: boolean, message: string): void {
        if (this.connectionStatusLabel) {
            const status = isConnected ? '已連接' : '未連接';
            this.connectionStatusLabel.string = `連接狀態: ${status} - ${message}`;
        }

        // 更新按鈕狀態
        if (this.connectButton) {
            this.connectButton.interactable = !isConnected;
        }
        if (this.disconnectButton) {
            this.disconnectButton.interactable = isConnected;
        }
        if (this.startGameButton) {
            this.startGameButton.interactable = isConnected;
        }
    }

    // ===== 遊戲控制方法 =====

    /**
     * 開始遊戲按鈕點擊事件
     */
    private onStartGame(): void {
        this.logDebug('Starting game...');
        if (this.viewModel) {
            this.viewModel.startGame();
        }
    }

    /**
     * 要牌按鈕點擊事件
     */
    private onHit(): void {
        this.logDebug('Player hits...');
        if (this.viewModel) {
            this.viewModel.playerHit();
        }
    }

    /**
     * 停牌按鈕點擊事件
     */
    private onStand(): void {
        this.logDebug('Player stands...');
        if (this.viewModel) {
            this.viewModel.playerStand();
        }
    }

    /**
     * 更新遊戲按鈕狀態
     */
    private updateGameButtons(gameInProgress: boolean): void {
        if (this.hitButton) {
            this.hitButton.interactable = gameInProgress;
        }
        if (this.standButton) {
            this.standButton.interactable = gameInProgress;
        }
    }

    // ===== 遊戲狀態更新方法 =====

    /**
     * 更新遊戲顯示
     */
    private updateGameDisplay(gameState: GameState): void {
        // 更新分數顯示
        if (this.playerScoreLabel && gameState.players.length > 0) {
            const currentPlayer = gameState.players.find(p => p.id === this.playerId);
            if (currentPlayer) {
                this.playerScoreLabel.string = `玩家分數: ${currentPlayer.score}`;
            }
        }

        if (this.dealerScoreLabel && gameState.dealer) {
            this.dealerScoreLabel.string = `莊家分數: ${gameState.dealer.score}`;
        }

        // 更新遊戲狀態
        if (this.gameStatusLabel) {
            let statusText = '';
            switch (gameState.gamePhase) {
                case 'waiting':
                    statusText = '等待開始';
                    break;
                case 'playing':
                    statusText = '遊戲進行中';
                    break;
                case 'dealer_turn':
                    statusText = '莊家回合';
                    break;
                case 'ended':
                    statusText = '遊戲結束';
                    break;
                default:
                    statusText = '未知狀態';
            }
            this.gameStatusLabel.string = `遊戲狀態: ${statusText}`;
        }

        // 更新按鈕狀態
        const isPlayerTurn = gameState.gamePhase === 'playing' && 
            gameState.players.some(p => p.id === this.playerId && p.isActive);
        this.updateGameButtons(isPlayerTurn);

        // 更新玩家列表
        this.updateOnlinePlayersList(gameState.players);
    }

    /**
     * 處理遊戲結束
     */
    private handleGameEnd(result: string): void {
        if (this.gameResultLabel) {
            this.gameResultLabel.string = `遊戲結果: ${result}`;
        }
        this.updateGameButtons(false);
        this.logDebug(`Game ended: ${result}`);
    }

    // ===== 工具方法 =====

    /**
     * 顯示訊息
     */
    private showMessage(message: string): void {
        this.logDebug(`Message: ${message}`);
        // 這裡可以顯示Toast或其他UI提示
        if (this.gameStatusLabel) {
            this.gameStatusLabel.string = message;
        }
    }

    /**
     * 調試日誌
     */
    private logDebug(message: string): void {
        if (this.enableDebug) {
            console.log(`[PlayerNameGameView] ${message}`);
        }
    }

    /**
     * 組件銷毀時清理
     */
    onDestroy(): void {
        // 清理冷卻計時器
        if (this.cooldownUpdateTimer) {
            clearTimeout(this.cooldownUpdateTimer);
            this.cooldownUpdateTimer = null;
        }
        
        if (this.viewModel) {
            this.viewModel.disconnect();
        }
    }
}
