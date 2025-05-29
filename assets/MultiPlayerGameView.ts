import { _decorator, Component, Node, Label, Button, EditBox } from 'cc';
import { GameViewModel } from './GameViewModel';
import { GameState, Player } from './GameModel';

const { ccclass, property } = _decorator;

/**
 * 多人21點遊戲的View層
 * 負責多玩家UI顯示和用戶交互
 */
@ccclass('MultiPlayerGameView')
export class MultiPlayerGameView extends Component {
    // UI元素屬性 - 玩家名稱輸入框
    @property({
        type: EditBox,
        tooltip: '玩家名稱輸入框'
    })
    playerNameInput: EditBox = null;

    // UI元素屬性 - 加入遊戲按鈕
    @property({
        type: Node,
        tooltip: '加入遊戲按鈕節點'
    })
    joinGameButton: Node = null;

    // UI元素屬性 - 開始遊戲按鈕
    @property({
        type: Node,
        tooltip: '開始遊戲按鈕節點'
    })
    startGameButton: Node = null;

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

    // UI元素屬性 - 玩家1信息顯示標籤
    @property({
        type: Label,
        tooltip: '玩家1信息顯示標籤'
    })
    player1InfoLabel: Label = null;

    // UI元素屬性 - 玩家2信息顯示標籤
    @property({
        type: Label,
        tooltip: '玩家2信息顯示標籤'
    })
    player2InfoLabel: Label = null;

    // UI元素屬性 - 莊家信息顯示標籤
    @property({
        type: Label,
        tooltip: '莊家信息顯示標籤'
    })
    dealerInfoLabel: Label = null;

    // UI元素屬性 - 當前玩家指示標籤
    @property({
        type: Label,
        tooltip: '當前玩家指示標籤'
    })
    currentPlayerLabel: Label = null;

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

    // UI元素屬性 - 遊戲狀態顯示標籤
    @property({
        type: Label,
        tooltip: '遊戲狀態顯示標籤'
    })
    gameStatusLabel: Label = null;

    // 玩家自身手牌顯示區域
    @property({
        type: Node,
        tooltip: '玩家自身手牌顯示區域'
    })
    myCardsArea: Node = null;

    // 玩家自身手牌詳情標籤
    @property({
        type: Label,
        tooltip: '玩家自身手牌詳情標籤'
    })
    myCardsLabel: Label = null;

    // 其他玩家手牌顯示區域
    @property({
        type: Node,
        tooltip: '其他玩家手牌顯示區域'
    })
    otherPlayersCardsArea: Node = null;

    // 其他玩家1手牌詳情標籤
    @property({
        type: Label,
        tooltip: '其他玩家1手牌詳情標籤'
    })
    player1CardsLabel: Label = null;

    // 其他玩家2手牌詳情標籤
    @property({
        type: Label,
        tooltip: '其他玩家2手牌詳情標籤'
    })
    player2CardsLabel: Label = null;

    // 莊家手牌詳情標籤
    @property({
        type: Label,
        tooltip: '莊家手牌詳情標籤'
    })
    dealerCardsLabel: Label = null;

    // ViewModel實例
    private viewModel: GameViewModel = null;
    
    // 當前遊戲狀態
    private currentGameState: GameState = null;
    private hasJoinedGame: boolean = false;

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
        // 生成隨機玩家ID
        const playerId = 'player_' + Math.random().toString(36).substr(2, 9);
        this.viewModel = new GameViewModel(playerId);
        
        // 綁定ViewModel回調事件
        this.viewModel.setOnGameStateUpdate((gameState) => {
            this.updateGameStateDisplay(gameState);
        });
        
        this.viewModel.setOnPlayerTurnChange((currentPlayer, allPlayers) => {
            this.updateCurrentPlayerDisplay(currentPlayer, allPlayers);
        });
        
        this.viewModel.setOnGameEnd((result, finalScores) => {
            this.handleGameEnd(result, finalScores);
        });
        
        this.viewModel.setOnConnectionStatus((connected) => {
            this.updateConnectionStatus(connected);
        });

        console.log('多玩家遊戲視圖已初始化，玩家ID:', playerId);
    }

    /**
     * 設置UI事件處理器
     */
    private setupEventHandlers(): void {
        // 加入遊戲按鈕點擊事件
        if (this.joinGameButton) {
            this.joinGameButton.on(Node.EventType.MOUSE_DOWN, this.onJoinGameClicked, this);
        }

        // 開始遊戲按鈕點擊事件
        if (this.startGameButton) {
            this.startGameButton.on(Node.EventType.MOUSE_DOWN, this.onStartGameClicked, this);
        }

        // 要牌按鈕點擊事件
        if (this.hitButton) {
            this.hitButton.on(Node.EventType.MOUSE_DOWN, this.onHitButtonClicked, this);
        }

        // 停牌按鈕點擊事件
        if (this.standButton) {
            this.standButton.on(Node.EventType.MOUSE_DOWN, this.onStandButtonClicked, this);
        }
    }

    /**
     * 初始化UI狀態
     */
    private initializeUI(): void {
        this.updateGameResult('');
        this.updateConnectionStatus(false);
        this.updateGameStatus('等待玩家加入...');
        this.setGameButtonsInteractable(false);
        
        // 設置初始UI可見性
        this.setJoinUIVisible(true);
        this.setGameUIVisible(false);
        
        if (this.currentPlayerLabel) {
            this.currentPlayerLabel.string = '';
        }
    }

    /**
     * 加入遊戲按鈕點擊處理
     */
    private onJoinGameClicked(): void {
        const playerName = this.playerNameInput?.string || `Player_${Date.now()}`;
        console.log('玩家加入遊戲:', playerName);
        
        // 先更新玩家姓名再加入游戲
        this.viewModel.updatePlayerName(playerName);
        this.viewModel.joinGame();
        this.hasJoinedGame = true;
        
        // 更新UI
        this.setJoinUIVisible(false);
        this.setGameUIVisible(true);
        this.updateGameStatus('已加入遊戲，等待其他玩家...');
    }

    /**
     * 開始遊戲按鈕點擊處理
     */
    private onStartGameClicked(): void {
        console.log('開始新遊戲');
        this.viewModel.startGame();
        this.updateGameResult('');
    }

    /**
     * 要牌按鈕點擊處理
     */
    private onHitButtonClicked(): void {
        if (this.isCurrentPlayerTurn()) {
            console.log('玩家選擇要牌');
            this.viewModel.playerHit();
        } else {
            console.log('不是該玩家的回合');
        }
    }

    /**
     * 停牌按鈕點擊處理
     */
    private onStandButtonClicked(): void {
        if (this.isCurrentPlayerTurn()) {
            console.log('玩家選擇停牌');
            this.viewModel.playerStand();
        } else {
            console.log('不是該玩家的回合');
        }
    }

    /**
     * 更新遊戲狀態顯示
     */
    private updateGameStateDisplay(gameState: GameState): void {
        this.currentGameState = gameState;
        
        // 更新玩家信息
        if (gameState.players.length >= 1 && this.player1InfoLabel) {
            const player1 = gameState.players[0];
            this.player1InfoLabel.string = `${player1.name}: ${player1.score}分 ${player1.isBust ? '(爆牌)' : ''}`;
            
            // 更新玩家1手牌詳情
            this.updatePlayerCardsDisplay(player1, this.player1CardsLabel);
        }
        
        if (gameState.players.length >= 2 && this.player2InfoLabel) {
            const player2 = gameState.players[1];
            this.player2InfoLabel.string = `${player2.name}: ${player2.score}分 ${player2.isBust ? '(爆牌)' : ''}`;
            
            // 更新玩家2手牌詳情
            this.updatePlayerCardsDisplay(player2, this.player2CardsLabel);
        }
        
        // 更新莊家信息
        if (this.dealerInfoLabel) {
            this.dealerInfoLabel.string = `莊家: ${gameState.dealer.score}分 ${gameState.dealer.isBust ? '(爆牌)' : ''}`;
            
            // 更新莊家手牌詳情
            this.updateDealerCardsDisplay(gameState.dealer);
        }
        
        // 更新玩家本身的手牌詳情
        this.updateMyCardsDisplay(gameState.players);
        
        // 更新遊戲狀態
        this.updateGameStatus(this.getGamePhaseText(gameState.gamePhase));
        
        // 更新按鈕狀態
        this.updateButtonStates(gameState);
    }

    /**
     * 更新當前玩家顯示
     */
    private updateCurrentPlayerDisplay(currentPlayer: Player, allPlayers: Player[]): void {
        if (this.currentPlayerLabel) {
            this.currentPlayerLabel.string = `當前回合: ${currentPlayer.name}`;
        }
        
        // 更新按鈕可用性
        const isMyTurn = currentPlayer.id === this.viewModel.currentPlayerId;
        this.setGameButtonsInteractable(isMyTurn);
    }

    /**
     * 處理遊戲結束
     */
    private handleGameEnd(result: string, finalScores: { [playerId: string]: number }): void {
        console.log('遊戲結束:', result);
        this.updateGameResult(result);
        this.setGameButtonsInteractable(false);
        
        if (this.currentPlayerLabel) {
            this.currentPlayerLabel.string = '遊戲結束';
        }
        
        // 顯示最終分數
        let scoresText = '最終分數:\n';
        for (const playerId in finalScores) {
            if (finalScores.hasOwnProperty(playerId)) {
                scoresText += `${playerId}: ${finalScores[playerId]}分\n`;
            }
        }
        console.log(scoresText);
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
     * 更新遊戲狀態顯示
     */
    private updateGameStatus(status: string): void {
        if (this.gameStatusLabel) {
            this.gameStatusLabel.string = status;
        }
    }

    /**
     * 設置加入遊戲UI可見性
     */
    private setJoinUIVisible(visible: boolean): void {
        if (this.playerNameInput) {
            this.playerNameInput.node.active = visible;
        }
        if (this.joinGameButton) {
            this.joinGameButton.active = visible;
        }
    }

    /**
     * 設置遊戲UI可見性
     */
    private setGameUIVisible(visible: boolean): void {
        if (this.startGameButton) {
            this.startGameButton.active = visible;
        }
    }

    /**
     * 設置遊戲按鈕可交互性
     */
    private setGameButtonsInteractable(interactable: boolean): void {
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
     * 更新按鈕狀態
     */
    private updateButtonStates(gameState: GameState): void {
        const canPlay = gameState.gamePhase === 'playing' && this.isCurrentPlayerTurn();
        this.setGameButtonsInteractable(canPlay);
        
        // 更新開始遊戲按鈕
        if (this.startGameButton) {
            const button = this.startGameButton.getComponent(Button);
            if (button) {
                button.interactable = gameState.gamePhase === 'waiting' || gameState.gamePhase === 'ended';
            }
        }
    }

    /**
     * 檢查是否為當前玩家回合
     */
    private isCurrentPlayerTurn(): boolean {
        if (!this.currentGameState) return false;
        
        const currentPlayer = this.viewModel.currentPlayer;
        return currentPlayer && currentPlayer.id === this.viewModel.currentPlayerId;
    }

    /**
     * 獲取遊戲階段文本
     */
    private getGamePhaseText(phase: string): string {
        switch (phase) {
            case 'waiting': return '等待開始';
            case 'playing': return '遊戲進行中';
            case 'dealer_turn': return '莊家回合';
            case 'ended': return '遊戲結束';
            default: return '未知狀態';
        }
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
     * 更新玩家手牌顯示
     * @param player 玩家數據
     * @param label 顯示標籤
     */
    private updatePlayerCardsDisplay(player: Player, label: Label): void {
        if (!label) return;
        
        let cardsText = "";
        if (player.hand && player.hand.length > 0) {
            cardsText = `${player.name} 的牌: `;
            player.hand.forEach((card, index) => {
                const cardText = this.formatCardText(card);
                cardsText += cardText;
                if (index < player.hand.length - 1) {
                    cardsText += ", ";
                }
            });
        }
        
        label.string = cardsText;
    }
    
    /**
     * 更新莊家手牌顯示
     * @param dealer 莊家數據
     */
    private updateDealerCardsDisplay(dealer: Player): void {
        if (!this.dealerCardsLabel) return;
        
        let cardsText = "莊家的牌: ";
        
        if (dealer.hand && dealer.hand.length > 0) {
            // 如果遊戲正在進行中，只顯示莊家的第一張牌
            if (this.currentGameState && this.currentGameState.gamePhase === 'playing') {
                const firstCard = dealer.hand[0];
                cardsText += this.formatCardText(firstCard) + ", ?";
            } else {
                // 遊戲結束後顯示全部
                dealer.hand.forEach((card, index) => {
                    cardsText += this.formatCardText(card);
                    if (index < dealer.hand.length - 1) {
                        cardsText += ", ";
                    }
                });
            }
        }
        
        this.dealerCardsLabel.string = cardsText;
    }
    
    /**
     * 更新自己的手牌顯示
     */
    private updateMyCardsDisplay(players: Player[]): void {
        if (!this.myCardsLabel) return;
        
        // 找到自己
        const myPlayer = players.find(p => p.id === this.viewModel.currentPlayerId);
        if (!myPlayer) {
            this.myCardsLabel.string = "等待加入遊戲...";
            return;
        }
        
        let cardsText = "我的牌: ";
        if (myPlayer.hand && myPlayer.hand.length > 0) {
            myPlayer.hand.forEach((card, index) => {
                cardsText += this.formatCardText(card);
                if (index < myPlayer.hand.length - 1) {
                    cardsText += ", ";
                }
            });
            
            cardsText += `\n總點數: ${myPlayer.score}點${myPlayer.isBust ? ' (爆牌)' : ''}`;
        } else {
            cardsText += "尚未發牌";
        }
        
        this.myCardsLabel.string = cardsText;
    }
    
    /**
     * 格式化牌面文字
     */
    private formatCardText(card: any): string {
        if (!card) return "?";
        
        if (card.suit === 'Hidden' || card.value === 'Hidden') {
            return "?";
        }
        
        const suitMap = {
            'Hearts': '♥',
            'Diamonds': '♦',
            'Clubs': '♣',
            'Spades': '♠'
        };
        
        const suit = suitMap[card.suit] || card.suit;
        return `${suit}${card.value}`;
    }
}
