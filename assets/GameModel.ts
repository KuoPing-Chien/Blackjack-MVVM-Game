/**
 * 撲克牌卡片數據模型
 */
export interface Card {
    suit: string;  // 花色：紅心、方塊、梅花、黑桃
    value: string; // 牌面值：2-10, J, Q, K, A
}

/**
 * 遊戲狀態數據模型
 */
export interface GameState {
    playerHand: Card[];     // 玩家手牌
    dealerHand: Card[];     // 莊家手牌
    playerScore: number;    // 玩家分數
    dealerScore: number;    // 莊家分數
    gamePhase: 'waiting' | 'playing' | 'ended'; // 遊戲階段
}

/**
 * 伺服器訊息數據模型
 */
export interface ServerMessage {
    action: 'updateGameState' | 'gameOver'; // 動作類型
    playerHand?: Card[];                    // 玩家手牌
    dealerHand?: Card[];                    // 莊家手牌
    playerScore?: number;                   // 玩家分數
    dealerScore?: number;                   // 莊家分數
    result?: string;                        // 遊戲結果
}

/**
 * 客戶端訊息數據模型
 */
export interface ClientMessage {
    action: 'startGame' | 'playerHit' | 'playerStand'; // 動作類型
}

/**
 * 遊戲配置數據模型
 */
export interface GameConfig {
    serverUrl: string;              // 伺服器URL
    reconnectInterval: number;      // 重連間隔（毫秒）
    maxReconnectAttempts: number;   // 最大重連次數
}

/**
 * 遊戲統計數據模型
 */
export interface GameStats {
    gamesPlayed: number;    // 遊戲局數
    gamesWon: number;       // 勝利局數
    gamesLost: number;      // 失敗局數
    winRate: number;        // 勝率
}

/**
 * 遊戲數據管理器
 * 負責管理遊戲相關的所有數據狀態
 */
export class GameModel {
    private _gameState: GameState;
    private _gameStats: GameStats;
    private _gameConfig: GameConfig;

    constructor() {
        this.initializeDefaultValues();
    }

    /**
     * 初始化預設值
     */
    private initializeDefaultValues(): void {
        this._gameState = {
            playerHand: [],
            dealerHand: [],
            playerScore: 0,
            dealerScore: 0,
            gamePhase: 'waiting'
        };

        this._gameStats = {
            gamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            winRate: 0
        };

        this._gameConfig = {
            serverUrl: 'ws://localhost:3000',
            reconnectInterval: 3000,
            maxReconnectAttempts: 5
        };
    }

    /**
     * 更新遊戲狀態
     */
    public updateGameState(newState: Partial<GameState>): void {
        this._gameState = { ...this._gameState, ...newState };
    }

    /**
     * 重置遊戲狀態
     */
    public resetGameState(): void {
        this._gameState.playerHand = [];
        this._gameState.dealerHand = [];
        this._gameState.playerScore = 0;
        this._gameState.dealerScore = 0;
        this._gameState.gamePhase = 'waiting';
    }

    /**
     * 記錄遊戲結果
     */
    public recordGameResult(won: boolean): void {
        this._gameStats.gamesPlayed++;
        if (won) {
            this._gameStats.gamesWon++;
        } else {
            this._gameStats.gamesLost++;
        }
        this._gameStats.winRate = this._gameStats.gamesWon / this._gameStats.gamesPlayed;
    }

    /**
     * 獲取當前遊戲狀態
     */
    public get gameState(): GameState {
        return { ...this._gameState };
    }

    /**
     * 獲取遊戲統計
     */
    public get gameStats(): GameStats {
        return { ...this._gameStats };
    }

    /**
     * 獲取遊戲配置
     */
    public get gameConfig(): GameConfig {
        return { ...this._gameConfig };
    }

    /**
     * 設置遊戲配置
     */
    public setGameConfig(config: Partial<GameConfig>): void {
        this._gameConfig = { ...this._gameConfig, ...config };
    }

    /**
     * 計算牌組分數
     * @param cards 卡片陣列
     * @returns 計算後的分數
     */
    public static calculateHandScore(cards: Card[]): number {
        let score = 0;
        let aces = 0;

        for (const card of cards) {
            if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
                score += 10;
            } else if (card.value === 'A') {
                aces += 1;
                score += 11;
            } else {
                score += parseInt(card.value);
            }
        }

        // 處理A的特殊計分規則
        while (score > 21 && aces > 0) {
            score -= 10;
            aces -= 1;
        }

        return score;
    }

    /**
     * 判斷是否為21點（黑傑克）
     * @param cards 卡片陣列
     * @returns 是否為21點
     */
    public static isBlackjack(cards: Card[]): boolean {
        return cards.length === 2 && this.calculateHandScore(cards) === 21;
    }

    /**
     * 判斷是否爆牌
     * @param cards 卡片陣列
     * @returns 是否爆牌
     */
    public static isBust(cards: Card[]): boolean {
        return this.calculateHandScore(cards) > 21;
    }
}
