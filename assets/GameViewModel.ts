import { _decorator } from 'cc';
import { GameModel, GameState, ServerMessage, ClientMessage } from './GameModel';

/**
 * 21點遊戲的ViewModel
 * 負責處理遊戲邏輯和數據管理，連接Model和View
 */
export class GameViewModel {
    // 遊戲數據模型
    private gameModel: GameModel;
    // WebSocket連接
    private _socket: WebSocket = null;
    
    // 事件回調
    private _onScoreUpdate: (playerScore: number, dealerScore: number) => void;
    private _onGameEnd: (result: string) => void;
    private _onConnectionStatus: (connected: boolean) => void;

    constructor() {
        this.gameModel = new GameModel();
        this.initializeWebSocket();
    }

    /**
     * 初始化WebSocket連接
     */
    private initializeWebSocket(): void {
        try {
            this._socket = new WebSocket(this.gameModel.gameConfig.serverUrl);
            
            // 連接成功回調
            this._socket.onopen = () => {
                console.log('已連接到伺服器');
                this._onConnectionStatus?.(true);
                this.startNewGame();
            };

            // 接收訊息回調
            this._socket.onmessage = (event) => {
                this.handleServerMessage(event);
            };

            // 連接錯誤回調
            this._socket.onerror = (error) => {
                console.error('WebSocket 連接錯誤:', error);
                this._onConnectionStatus?.(false);
            };

            // 連接關閉回調
            this._socket.onclose = (event) => {
                console.warn('WebSocket 連接已關閉:', event);
                this._onConnectionStatus?.(false);
            };
        } catch (error) {
            console.error('初始化WebSocket失敗:', error);
        }
    }

    /**
     * 處理伺服器訊息
     */
    private handleServerMessage(event: MessageEvent): void {
        try {
            const data: ServerMessage = JSON.parse(event.data);
            
            switch (data.action) {
                case 'updateGameState':
                    this.updateGameState(data);
                    break;
                case 'gameOver':
                    this.handleGameEnd(data);
                    break;
                default:
                    console.warn('未知的伺服器訊息:', data);
            }
        } catch (error) {
            console.error('解析伺服器訊息失敗:', error);
        }
    }

    /**
     * 更新遊戲狀態
     */
    private updateGameState(data: ServerMessage): void {
        // 更新模型數據
        this.gameModel.updateGameState({
            playerHand: data.playerHand || [],
            dealerHand: data.dealerHand || [],
            playerScore: data.playerScore || 0,
            dealerScore: data.dealerScore || 0,
            gamePhase: 'playing'
        });
        
        // 通知View更新分數
        this._onScoreUpdate?.(
            this.gameModel.gameState.playerScore,
            this.gameModel.gameState.dealerScore
        );
    }

    /**
     * 處理遊戲結束
     */
    private handleGameEnd(data: ServerMessage): void {
        // 更新最終分數
        this.gameModel.updateGameState({
            playerScore: data.playerScore || this.gameModel.gameState.playerScore,
            dealerScore: data.dealerScore || this.gameModel.gameState.dealerScore,
            gamePhase: 'ended'
        });
        
        // 記錄遊戲統計
        const won = data.result?.includes('Player Wins') || false;
        this.gameModel.recordGameResult(won);
        
        // 通知View更新分數和遊戲結果
        this._onScoreUpdate?.(
            this.gameModel.gameState.playerScore,
            this.gameModel.gameState.dealerScore
        );
        this._onGameEnd?.(data.result || '遊戲結束');
    }

    /**
     * 發送訊息給伺服器
     */
    private sendMessage(message: ClientMessage): void {
        if (this._socket && this._socket.readyState === WebSocket.OPEN) {
            this._socket.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket未連接，無法發送訊息');
        }
    }

    /**
     * 開始新遊戲
     */
    public startNewGame(): void {
        console.log('開始新遊戲');
        this.gameModel.resetGameState();
        this.sendMessage({ action: 'startGame' });
    }

    /**
     * 玩家要牌
     */
    public playerHit(): void {
        if (this.gameModel.gameState.gamePhase === 'playing') {
            console.log('玩家要牌');
            this.sendMessage({ action: 'playerHit' });
        } else {
            console.warn('遊戲未在進行中，無法要牌');
        }
    }

    /**
     * 玩家停牌
     */
    public playerStand(): void {
        if (this.gameModel.gameState.gamePhase === 'playing') {
            console.log('玩家停牌');
            this.sendMessage({ action: 'playerStand' });
        } else {
            console.warn('遊戲未在進行中，無法停牌');
        }
    }

    /**
     * 設置分數更新回調
     */
    public setOnScoreUpdate(callback: (playerScore: number, dealerScore: number) => void): void {
        this._onScoreUpdate = callback;
    }

    /**
     * 設置遊戲結束回調
     */
    public setOnGameEnd(callback: (result: string) => void): void {
        this._onGameEnd = callback;
    }

    /**
     * 設置連接狀態回調
     */
    public setOnConnectionStatus(callback: (connected: boolean) => void): void {
        this._onConnectionStatus = callback;
    }

    /**
     * 設置服務器URL
     */
    public setServerUrl(url: string): void {
        this.gameModel.gameConfig.serverUrl = url;
        console.log('[ViewModel] 服務器URL已更新為:', url);
    }

    /**
     * 重新連接到服務器
     */
    public reconnect(): void {
        if (this._socket) {
            this._socket.close();
        }
        this.initializeWebSocket();
    }

    /**
     * 獲取當前遊戲狀態
     */
    public get gameState(): GameState {
        return this.gameModel.gameState;
    }

    /**
     * 獲取玩家分數
     */
    public get playerScore(): number {
        return this.gameModel.gameState.playerScore;
    }

    /**
     * 獲取莊家分數
     */
    public get dealerScore(): number {
        return this.gameModel.gameState.dealerScore;
    }

    /**
     * 獲取遊戲統計
     */
    public get gameStats() {
        return this.gameModel.gameStats;
    }

    /**
     * 檢查連接狀態
     */
    public get isConnected(): boolean {
        return this._socket?.readyState === WebSocket.OPEN;
    }

    /**
     * 清理資源
     */
    public dispose(): void {
        console.log('清理ViewModel資源');
        if (this._socket) {
            this._socket.close();
            this._socket = null;
        }
    }
}
