/**
 * GameRoomManager.ts
 * 
 * 管理多人21点游戏房间系统
 * 处理房间创建、玩家加入/离开、倒计时和游戏状态
 */

import { _decorator, Component, Node, director, Label, Button, Sprite, Color } from 'cc';
import { GameViewModel } from './GameViewModel';
import { Player } from './GameModel';

const { ccclass, property } = _decorator;

/**
 * 房间状态
 */
enum RoomState {
    WAITING = 'waiting',     // 等待玩家加入
    COUNTDOWN = 'countdown', // 倒计时开始阶段
    PLAYING = 'playing',     // 游戏进行中
    ENDED = 'ended'          // 游戏结束
}

/**
 * 游戏结果类型
 */
enum GameResultType {
    WIN = 'win',
    LOSE = 'lose',
    TIE = 'tie',
    BUST = 'bust'
}

/**
 * 玩家操作超时配置
 */
interface TimeoutConfig {
    enabled: boolean;        // 是否启用超时
    durationSeconds: number; // 超时时间（秒）
}

/**
 * 房间配置
 */
interface RoomConfig {
    roomId: string;              // 房间ID
    maxPlayers: number;          // 最大玩家数 (1-6)
    countdownSeconds: number;    // 开始游戏倒计时（秒）
    playerTimeout: TimeoutConfig; // 玩家操作超时设置
    autoStart: boolean;          // 是否在人数达到时自动开始
    minPlayers: number;          // 最小开始人数
}

/**
 * 21点游戏房间管理器
 */
@ccclass('GameRoomManager')
export class GameRoomManager extends Component {
    // 房间信息显示UI
    @property({
        type: Label,
        tooltip: '房间ID显示标签'
    })
    roomIdLabel: Label = null;

    @property({
        type: Label,
        tooltip: '倒计时显示标签'
    })
    countdownLabel: Label = null;

    @property({
        type: Label,
        tooltip: '房间状态显示标签'
    })
    roomStateLabel: Label = null;

    @property({
        type: Label,
        tooltip: '玩家数量显示标签'
    })
    playerCountLabel: Label = null;

    // 玩家操作相关UI
    @property({
        type: Node,
        tooltip: '创建房间按钮'
    })
    createRoomButton: Node = null;

    @property({
        type: Node,
        tooltip: '加入房间按钮'
    })
    joinRoomButton: Node = null;

    @property({
        type: Node,
        tooltip: '离开房间按钮'
    })
    leaveRoomButton: Node = null;

    @property({
        type: Node,
        tooltip: '准备按钮'
    })
    readyButton: Node = null;

    // 房间设置
    @property({
        tooltip: '开始游戏倒计时（秒）',
        range: [5, 60, 5],
        slide: true
    })
    countdownSeconds: number = 30;

    @property({
        tooltip: '最大玩家数',
        range: [1, 6, 1],
        slide: true
    })
    maxPlayers: number = 6;

    @property({
        tooltip: '最小开始人数',
        range: [1, 6, 1],
        slide: true
    })
    minPlayers: number = 1;

    @property({
        tooltip: '是否启用玩家操作超时'
    })
    enablePlayerTimeout: boolean = true;

    @property({
        tooltip: '玩家操作超时时间（秒）',
        range: [10, 120, 5],
        slide: true,
        visible: function() { return this.enablePlayerTimeout; }
    })
    playerTimeoutSeconds: number = 30;

    @property({
        tooltip: '是否在人数达到时自动开始'
    })
    autoStartWhenFull: boolean = false;

    // 内部属性
    private viewModel: GameViewModel = null;
    private roomConfig: RoomConfig = null;
    private currentRoomId: string = '';
    private roomState: RoomState = RoomState.WAITING;
    private countdownTimer: number = 0;
    private countdownInterval: any = null;
    private playerTimeoutTimer: any = null;
    private currentPlayerIndex: number = -1;
    private playerResults: Map<string, GameResultType> = new Map();
    private players: Player[] = [];

    /**
     * 组件开始时执行
     */
    start() {
        this.setupViewModel();
        this.setupEventHandlers();
        this.updateUIState();
    }

    /**
     * 设置ViewModel
     */
    private setupViewModel() {
        this.viewModel = new GameViewModel();
        
        // 绑定回调
        this.viewModel.setOnGameStateUpdate((gameState) => {
            this.handleGameStateUpdate(gameState);
        });
        
        this.viewModel.setOnPlayersUpdate((players) => {
            this.players = players;
            this.updatePlayerCountDisplay();
            this.checkAutoStart();
        });
        
        this.viewModel.setOnGameEnd((result, finalScores) => {
            this.handleGameEnd(result, finalScores);
        });
        
        this.viewModel.setOnPlayerTurnChange((currentPlayer, allPlayers) => {
            this.handlePlayerTurnChange(currentPlayer);
        });
    }

    /**
     * 设置事件处理器
     */
    private setupEventHandlers() {
        if (this.createRoomButton) {
            this.createRoomButton.on(Node.EventType.TOUCH_END, this.onCreateRoom, this);
        }
        
        if (this.joinRoomButton) {
            this.joinRoomButton.on(Node.EventType.TOUCH_END, this.onJoinRoom, this);
        }
        
        if (this.leaveRoomButton) {
            this.leaveRoomButton.on(Node.EventType.TOUCH_END, this.onLeaveRoom, this);
        }
        
        if (this.readyButton) {
            this.readyButton.on(Node.EventType.TOUCH_END, this.onReady, this);
        }
    }

    /**
     * 创建房间按钮点击处理
     */
    private onCreateRoom() {
        // 生成随机房间ID
        const randomNum = Math.floor(Math.random() * 100000).toString();
        const roomId = 'R_' + ('00000' + randomNum).slice(-5);
        
        // 创建房间配置
        this.roomConfig = {
            roomId: roomId,
            maxPlayers: this.maxPlayers,
            countdownSeconds: this.countdownSeconds,
            playerTimeout: {
                enabled: this.enablePlayerTimeout,
                durationSeconds: this.playerTimeoutSeconds
            },
            autoStart: this.autoStartWhenFull,
            minPlayers: this.minPlayers
        };
        
        this.currentRoomId = roomId;
        this.roomState = RoomState.WAITING;
        
        // 连接到服务器
        this.viewModel.connectToServer('ws://localhost:3000', '', '');
        
        // 发送创建房间消息
        this.sendCreateRoomMessage();
        
        // 更新UI
        this.updateRoomDisplay();
    }

    /**
     * 加入房间按钮点击处理
     */
    private onJoinRoom() {
        // 此处应该有输入房间ID的UI
        // 暂时使用固定ID作为示例
        const roomId = this.currentRoomId || prompt('请输入房间ID', '');
        if (!roomId) return;
        
        this.currentRoomId = roomId;
        
        // 连接服务器
        this.viewModel.connectToServer('ws://localhost:3000', '', '');
        
        // 发送加入房间消息
        this.sendJoinRoomMessage();
        
        // 更新UI
        this.updateRoomDisplay();
    }

    /**
     * 离开房间按钮点击处理
     */
    private onLeaveRoom() {
        if (this.currentRoomId) {
            this.sendLeaveRoomMessage();
            this.currentRoomId = '';
            this.roomState = RoomState.WAITING;
            
            // 断开连接
            this.viewModel.disconnect();
            
            // 停止计时器
            this.stopCountdown();
            this.stopPlayerTimeout();
            
            // 更新UI
            this.updateRoomDisplay();
        }
    }

    /**
     * 准备按钮点击处理
     */
    private onReady() {
        if (this.currentRoomId && this.viewModel) {
            // 发送玩家准备消息
            this.sendReadyMessage();
            
            // 禁用准备按钮
            if (this.readyButton) {
                const button = this.readyButton.getComponent(Button);
                if (button) button.interactable = false;
            }
        }
    }

    /**
     * 发送创建房间消息
     */
    private sendCreateRoomMessage() {
        if (!this.viewModel || !this.roomConfig) return;
        
        this.viewModel.sendCustomMessage({
            action: 'createRoom',
            roomId: this.roomConfig.roomId,
            maxPlayers: this.roomConfig.maxPlayers,
            countdownSeconds: this.roomConfig.countdownSeconds,
            playerTimeout: this.roomConfig.playerTimeout,
            autoStart: this.roomConfig.autoStart,
            minPlayers: this.roomConfig.minPlayers
        });
    }

    /**
     * 发送加入房间消息
     */
    private sendJoinRoomMessage() {
        if (!this.viewModel || !this.currentRoomId) return;
        
        this.viewModel.sendCustomMessage({
            action: 'joinRoom',
            roomId: this.currentRoomId
        });
    }

    /**
     * 发送离开房间消息
     */
    private sendLeaveRoomMessage() {
        if (!this.viewModel || !this.currentRoomId) return;
        
        this.viewModel.sendCustomMessage({
            action: 'leaveRoom',
            roomId: this.currentRoomId
        });
    }

    /**
     * 发送玩家准备消息
     */
    private sendReadyMessage() {
        if (!this.viewModel || !this.currentRoomId) return;
        
        this.viewModel.sendCustomMessage({
            action: 'playerReady',
            roomId: this.currentRoomId
        });
    }

    /**
     * 开始倒计时
     */
    public startCountdown() {
        this.stopCountdown();
        
        this.roomState = RoomState.COUNTDOWN;
        this.countdownTimer = this.roomConfig?.countdownSeconds || this.countdownSeconds;
        
        this.updateCountdownDisplay();
        
        this.countdownInterval = setInterval(() => {
            this.countdownTimer--;
            
            if (this.countdownTimer <= 0) {
                this.stopCountdown();
                this.startGame();
            } else {
                this.updateCountdownDisplay();
            }
        }, 1000);
        
        this.updateRoomDisplay();
    }

    /**
     * 停止倒计时
     */
    private stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    /**
     * 开始玩家操作超时计时
     */
    private startPlayerTimeout() {
        this.stopPlayerTimeout();
        
        if (!this.roomConfig?.playerTimeout?.enabled) return;
        
        const duration = this.roomConfig.playerTimeout.durationSeconds * 1000;
        
        this.playerTimeoutTimer = setTimeout(() => {
            // 超时时自动停牌
            console.log('玩家操作超时，自动停牌');
            if (this.viewModel) {
                this.viewModel.playerStand();
            }
        }, duration);
    }

    /**
     * 停止玩家操作超时计时
     */
    private stopPlayerTimeout() {
        if (this.playerTimeoutTimer) {
            clearTimeout(this.playerTimeoutTimer);
            this.playerTimeoutTimer = null;
        }
    }

    /**
     * 开始游戏
     */
    private startGame() {
        if (this.viewModel) {
            this.roomState = RoomState.PLAYING;
            this.viewModel.startGame();
            this.updateRoomDisplay();
        }
    }

    /**
     * 处理游戏状态更新
     */
    private handleGameStateUpdate(gameState) {
        // 更新房间状态显示
        this.roomState = gameState.gamePhase;
        this.updateRoomDisplay();
    }

    /**
     * 处理玩家轮换
     */
    private handlePlayerTurnChange(currentPlayer) {
        this.currentPlayerIndex = this.players.findIndex(p => p.id === currentPlayer.id);
        
        // 如果轮到当前玩家，开始超时计时
        if (currentPlayer.id === this.viewModel.currentPlayerId) {
            this.startPlayerTimeout();
        } else {
            this.stopPlayerTimeout();
        }
        
        this.updateRoomDisplay();
    }

    /**
     * 处理游戏结束
     */
    private handleGameEnd(result, finalScores) {
        this.roomState = RoomState.ENDED;
        this.playerResults.clear();
        
        // 解析结果并更新每个玩家的结果
        const resultLines = result.split('\n');
        for (const line of resultLines) {
            for (const player of this.players) {
                if (line.includes(player.name)) {
                    if (line.includes('Wins')) {
                        this.playerResults.set(player.id, GameResultType.WIN);
                    } else if (line.includes('Bust')) {
                        this.playerResults.set(player.id, GameResultType.BUST);
                    } else if (line.includes('Tie')) {
                        this.playerResults.set(player.id, GameResultType.TIE);
                    } else {
                        this.playerResults.set(player.id, GameResultType.LOSE);
                    }
                    break;
                }
            }
        }
        
        // 停止所有计时器
        this.stopCountdown();
        this.stopPlayerTimeout();
        
        // 更新UI
        this.updateRoomDisplay();
    }

    /**
     * 更新房间显示
     */
    private updateRoomDisplay() {
        // 更新房间ID显示
        if (this.roomIdLabel) {
            this.roomIdLabel.string = this.currentRoomId ? `房间ID: ${this.currentRoomId}` : '未加入房间';
        }
        
        // 更新房间状态显示
        if (this.roomStateLabel) {
            let stateText = '';
            switch (this.roomState) {
                case RoomState.WAITING:
                    stateText = '等待玩家加入';
                    break;
                case RoomState.COUNTDOWN:
                    stateText = '准备开始游戏';
                    break;
                case RoomState.PLAYING:
                    stateText = '游戏进行中';
                    break;
                case RoomState.ENDED:
                    stateText = '游戏已结束';
                    break;
                default:
                    stateText = '未知状态';
            }
            
            this.roomStateLabel.string = `房间状态: ${stateText}`;
        }
        
        this.updatePlayerCountDisplay();
        this.updateUIState();
    }

    /**
     * 更新倒计时显示
     */
    private updateCountdownDisplay() {
        if (this.countdownLabel) {
            if (this.roomState === RoomState.COUNTDOWN && this.countdownTimer > 0) {
                this.countdownLabel.string = `游戏开始倒计时: ${this.countdownTimer}秒`;
                this.countdownLabel.node.active = true;
            } else {
                this.countdownLabel.node.active = false;
            }
        }
    }

    /**
     * 更新玩家数量显示
     */
    private updatePlayerCountDisplay() {
        if (this.playerCountLabel) {
            const currentCount = this.players.length;
            const maxCount = this.roomConfig?.maxPlayers || this.maxPlayers;
            this.playerCountLabel.string = `玩家数量: ${currentCount}/${maxCount}`;
        }
    }

    /**
     * 更新UI按钮状态
     */
    private updateUIState() {
        const inRoom = !!this.currentRoomId;
        const isWaiting = this.roomState === RoomState.WAITING;
        const isPlaying = this.roomState === RoomState.PLAYING;
        const isEnded = this.roomState === RoomState.ENDED;
        
        // 创建房间按钮
        if (this.createRoomButton) {
            const button = this.createRoomButton.getComponent(Button);
            if (button) button.interactable = !inRoom;
        }
        
        // 加入房间按钮
        if (this.joinRoomButton) {
            const button = this.joinRoomButton.getComponent(Button);
            if (button) button.interactable = !inRoom;
        }
        
        // 离开房间按钮
        if (this.leaveRoomButton) {
            const button = this.leaveRoomButton.getComponent(Button);
            if (button) button.interactable = inRoom && (isWaiting || isEnded);
        }
        
        // 准备按钮
        if (this.readyButton) {
            const button = this.readyButton.getComponent(Button);
            if (button) button.interactable = inRoom && isWaiting;
        }
    }

    /**
     * 检查是否自动开始游戏
     */
    private checkAutoStart() {
        if (!this.roomConfig || this.roomState !== RoomState.WAITING) return;
        
        const currentCount = this.players.length;
        
        // 当玩家数达到最大值和自动开始为true时，开始倒计时
        if (this.roomConfig.autoStart && currentCount === this.roomConfig.maxPlayers) {
            this.startCountdown();
            return;
        }
        
        // 当玩家数达到最小值时，可以手动开始
        if (currentCount >= this.roomConfig.minPlayers && this.readyButton) {
            const button = this.readyButton.getComponent(Button);
            if (button) button.interactable = true;
        }
    }

    /**
     * 手动开始倒计时
     */
    public manualStartCountdown() {
        const currentCount = this.players.length;
        if (currentCount >= this.roomConfig.minPlayers && this.roomState === RoomState.WAITING) {
            this.startCountdown();
        }
    }
}