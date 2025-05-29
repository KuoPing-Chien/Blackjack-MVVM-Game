/**
 * 撲克牌卡片數據模型
 */
export interface Card {
    suit: string;  // 花色：紅心、方塊、梅花、黑桃
    value: string; // 牌面值：2-10, J, Q, K, A
}

/**
 * 玩家數據模型
 */
export interface Player {
    id: string;         // 玩家ID
    name: string;       // 玩家名稱
    hand: Card[];       // 玩家手牌
    score: number;      // 玩家分數
    isActive: boolean;  // 是否為當前活躍玩家
    hasStood: boolean;  // 是否已停牌
    isBust: boolean;    // 是否爆牌
}

/**
 * 遊戲狀態數據模型
 */
export interface GameState {
    players: Player[];      // 所有玩家（不包括莊家）
    dealer: Player;         // 莊家
    currentPlayerIndex: number; // 當前活躍玩家索引
    gamePhase: 'waiting' | 'playing' | 'dealer_turn' | 'ended'; // 遊戲階段
    gameResult?: string;    // 遊戲結果
}

/**
 * 伺服器訊息數據模型
 */
export interface ServerMessage {
    action: 'updateGameState' | 'gameOver' | 'nextPlayer' | 'dealerTurn'; // 動作類型
    players?: Player[];         // 所有玩家狀態
    dealer?: Player;           // 莊家狀態
    currentPlayerIndex?: number; // 當前活躍玩家索引
    gamePhase?: string;        // 遊戲階段
    result?: string;           // 遊戲結果
}

/**
 * 客戶端訊息數據模型
 */
export interface ClientMessage {
    action: 'start' | 'hit' | 'stand' | 'join' | 'startGame' | 'playerHit' | 'playerStand' | 'joinGame'; // 動作類型
    playerId?: string;         // 玩家ID
    playerName?: string;       // 玩家名稱
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
            players: [],
            dealer: {
                id: 'dealer',
                name: 'Dealer',
                hand: [],
                score: 0,
                isActive: false,
                hasStood: false,
                isBust: false
            },
            currentPlayerIndex: 0,
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
        this._gameState.players = [];
        this._gameState.dealer = {
            id: 'dealer',
            name: 'Dealer',
            hand: [],
            score: 0,
            isActive: false,
            hasStood: false,
            isBust: false
        };
        this._gameState.currentPlayerIndex = 0;
        this._gameState.gamePhase = 'waiting';
    }

    /**
     * 添加玩家
     */
    public addPlayer(playerId: string, playerName: string): void {
        const newPlayer: Player = {
            id: playerId,
            name: playerName,
            hand: [],
            score: 0,
            isActive: false,
            hasStood: false,
            isBust: false
        };
        this._gameState.players.push(newPlayer);
    }

    /**
     * 設置當前活躍玩家
     */
    public setCurrentPlayer(index: number): void {
        // 重置所有玩家的活躍狀態
        this._gameState.players.forEach(player => player.isActive = false);
        
        if (index >= 0 && index < this._gameState.players.length) {
            this._gameState.currentPlayerIndex = index;
            this._gameState.players[index].isActive = true;
        }
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
