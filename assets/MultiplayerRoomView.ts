/**
 * MultiplayerRoomView.ts
 * 
 * 21点多人游戏房间界面
 * 提供房间创建、加入、倒计时和多人游戏状态显示
 */

import { _decorator, Component, Node, Label, Button, EditBox, Sprite, Color, UITransform, Layout, Vec3, instantiate } from 'cc';
import { GameViewModel } from './GameViewModel';
import { Player } from './GameModel';
import { RoomState, GameResultType } from './RoomTypes';

const { ccclass, property } = _decorator;

/**
 * 多人游戏房间视图组件
 */
@ccclass('MultiplayerRoomView')
export class MultiplayerRoomView extends Component {
    // 房间信息区域
    @property({
        type: Label,
        tooltip: '房间ID标签'
    })
    roomIdLabel: Label = null;
    
    @property({
        type: Label,
        tooltip: '倒计时标签'
    })
    countdownLabel: Label = null;
    
    @property({
        type: Label,
        tooltip: '房间状态标签'
    })
    roomStateLabel: Label = null;
    
    @property({
        type: Label,
        tooltip: '玩家数量标签'
    })
    playerCountLabel: Label = null;
    
    // 玩家信息区域
    @property({
        type: Node,
        tooltip: '玩家列表容器'
    })
    playerListContainer: Node = null;
    
    @property({
        type: Node,
        tooltip: '玩家信息项预制体'
    })
    playerItemPrefab: Node = null;
    
    // 游戏控制区域
    @property({
        type: EditBox,
        tooltip: '玩家姓名输入框'
    })
    playerNameInput: EditBox = null;
    
    @property({
        type: EditBox,
        tooltip: '房间ID输入框'
    })
    roomIdInput: EditBox = null;
    
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
        tooltip: '准备开始按钮'
    })
    readyButton: Node = null;
    
    @property({
        type: Node,
        tooltip: '要牌按钮'
    })
    hitButton: Node = null;
    
    @property({
        type: Node,
        tooltip: '停牌按钮'
    })
    standButton: Node = null;
    
    // 游戏结果区域
    @property({
        type: Label,
        tooltip: '游戏结果标签'
    })
    gameResultLabel: Label = null;
    
    // 玩家手牌和莊家区域
    @property({
        type: Node,
        tooltip: '玩家手牌容器'
    })
    playerHandsContainer: Node = null;
    
    @property({
        type: Node,
        tooltip: '莊家手牌容器'
    })
    dealerHandContainer: Node = null;
    
    @property({
        type: Label,
        tooltip: '莊家分数标签'
    })
    dealerScoreLabel: Label = null;
    
    @property({
        type: Label,
        tooltip: '当前玩家标签'
    })
    currentPlayerLabel: Label = null;
    
    // 配置项
    @property({
        tooltip: '默认玩家名称',
    })
    defaultPlayerName: string = 'Player';
    
    @property({
        tooltip: '服务器地址'
    })
    serverUrl: string = 'ws://localhost:3000';
    
    @property({
        tooltip: '调试模式'
    })
    debugMode: boolean = false;
    
    @property({
        tooltip: '最大玩家数',
        range: [1, 6, 1],
        slide: true
    })
    maxPlayers: number = 6;
    
    @property({
        tooltip: '倒计时秒数',
        range: [5, 60, 5],
        slide: true
    })
    countdownSeconds: number = 30;
    
    @property({
        tooltip: '玩家操作超时秒数',
        range: [10, 60, 5],
        slide: true
    })
    playerTimeoutSeconds: number = 30;
    
    // 内部属性
    private viewModel: GameViewModel = null;
    private playerId: string = '';
    private playerName: string = '';
    private currentRoomId: string = '';
    private roomState: string = RoomState.WAITING;
    private players: Player[] = [];
    private currentPlayerIndex: number = -1;
    private countdownValue: number = 0;
    private isInGame: boolean = false;
    private isMyTurn: boolean = false;
    private playerItems: Map<string, Node> = new Map();
    private playerResults: Map<string, string> = new Map();

    /**
     * 组件开始时执行
     */
    start() {
        this.initializePlayerId();
        this.initializeViewModel();
        this.setupEventListeners();
        this.updateUI();
    }
    
    /**
     * 初始化玩家ID
     */
    private initializePlayerId() {
        this.playerId = 'player_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        this.playerName = this.defaultPlayerName + Math.floor(Math.random() * 1000);
        
        // 更新姓名输入框
        if (this.playerNameInput) {
            this.playerNameInput.string = this.playerName;
        }
        
        if (this.debugMode) {
            console.log(`[MultiplayerRoomView] 初始化玩家ID: ${this.playerId}, 姓名: ${this.playerName}`);
        }
    }
    
    /**
     * 初始化ViewModel
     */
    private initializeViewModel() {
        this.viewModel = new GameViewModel(this.playerId);
        
        // 设置服务器URL
        this.viewModel.setServerUrl(this.serverUrl);
        
        // 绑定回调
        this.viewModel.setOnGameStateUpdate((gameState) => {
            this.handleGameStateUpdate(gameState);
        });
        
        this.viewModel.setOnPlayerTurnChange((currentPlayer, allPlayers) => {
            this.handlePlayerTurnChange(currentPlayer, allPlayers);
        });
        
        this.viewModel.setOnGameEnd((result, finalScores) => {
            this.handleGameEnd(result, finalScores);
        });
        
        this.viewModel.setOnConnectionStateChange((isConnected, message) => {
            this.handleConnectionStateChange(isConnected, message);
        });
        
        this.viewModel.setOnPlayersUpdate((players) => {
            this.handlePlayersUpdate(players);
        });
        
        this.viewModel.setOnRoomStateChange((roomState, roomInfo) => {
            this.handleRoomStateChange(roomState, roomInfo);
        });
        
        this.viewModel.setOnCountdownUpdate((seconds) => {
            this.handleCountdownUpdate(seconds);
        });
        
        if (this.debugMode) {
            console.log(`[MultiplayerRoomView] ViewModel初始化完成`);
        }
    }
    
    /**
     * 设置事件监听器
     */
    private setupEventListeners() {
        // 绑定按钮点击事件
        if (this.createRoomButton) {
            this.createRoomButton.on(Button.EventType.CLICK, this.onCreateRoomClicked, this);
        }
        
        if (this.joinRoomButton) {
            this.joinRoomButton.on(Button.EventType.CLICK, this.onJoinRoomClicked, this);
        }
        
        if (this.leaveRoomButton) {
            this.leaveRoomButton.on(Button.EventType.CLICK, this.onLeaveRoomClicked, this);
        }
        
        if (this.readyButton) {
            this.readyButton.on(Button.EventType.CLICK, this.onReadyClicked, this);
        }
        
        if (this.hitButton) {
            this.hitButton.on(Button.EventType.CLICK, this.onHitClicked, this);
        }
        
        if (this.standButton) {
            this.standButton.on(Button.EventType.CLICK, this.onStandClicked, this);
        }
        
        // 绑定输入框事件
        if (this.playerNameInput) {
            this.playerNameInput.node.on(EditBox.EventType.EDITING_DID_ENDED, this.onPlayerNameChanged, this);
        }
        
        if (this.roomIdInput) {
            this.roomIdInput.node.on(EditBox.EventType.EDITING_DID_ENDED, this.onRoomIdChanged, this);
        }
        
        if (this.debugMode) {
            console.log(`[MultiplayerRoomView] 事件监听器设置完成`);
        }
    }
    
    /**
     * 创建房间按钮点击事件
     */
    private onCreateRoomClicked() {
        // 更新玩家姓名
        this.updatePlayerName();
        
        // 生成随机房间ID
        const randomId = Math.floor(Math.random() * 100000).toString();
        const roomId = 'R_' + ('00000' + randomId).slice(-5);
        
        // 连接到服务器
        this.viewModel.connectToServer(this.serverUrl, this.playerId, this.playerName);
        
        // 创建房间
        this.viewModel.createRoom({
            maxPlayers: this.maxPlayers,
            countdownSeconds: this.countdownSeconds,
            playerTimeout: {
                enabled: true,
                durationSeconds: this.playerTimeoutSeconds
            },
            autoStart: false,
            minPlayers: 1
        });
        
        if (this.debugMode) {
            console.log(`[MultiplayerRoomView] 创建房间: ${roomId}`);
        }
    }
    
    /**
     * 加入房间按钮点击事件
     */
    private onJoinRoomClicked() {
        // 更新玩家姓名
        this.updatePlayerName();
        
        // 获取房间ID
        const roomId = this.roomIdInput?.string;
        if (!roomId) {
            this.showMessage('请输入房间ID');
            return;
        }
        
        // 连接到服务器
        this.viewModel.connectToServer(this.serverUrl, this.playerId, this.playerName);
        
        // 加入房间
        this.viewModel.joinRoom(roomId);
        
        if (this.debugMode) {
            console.log(`[MultiplayerRoomView] 加入房间: ${roomId}`);
        }
    }
    
    /**
     * 离开房间按钮点击事件
     */
    private onLeaveRoomClicked() {
        if (this.currentRoomId) {
            this.viewModel.leaveRoom();
            
            // 重置状态
            this.currentRoomId = '';
            this.roomState = RoomState.WAITING;
            this.players = [];
            this.currentPlayerIndex = -1;
            this.isInGame = false;
            this.isMyTurn = false;
            
            // 清空玩家列表
            this.clearPlayerList();
            
            // 更新UI
            this.updateUI();
            
            if (this.debugMode) {
                console.log(`[MultiplayerRoomView] 离开房间`);
            }
        }
    }
    
    /**
     * 准备按钮点击事件
     */
    private onReadyClicked() {
        if (this.currentRoomId) {
            this.viewModel.readyToStart();
            
            // 禁用准备按钮
            this.setButtonEnabled(this.readyButton, false);
            
            if (this.debugMode) {
                console.log(`[MultiplayerRoomView] 玩家准备`);
            }
        }
    }
    
    /**
     * 要牌按钮点击事件
     */
    private onHitClicked() {
        if (this.isInGame && this.isMyTurn) {
            this.viewModel.playerHit();
            
            if (this.debugMode) {
                console.log(`[MultiplayerRoomView] 玩家要牌`);
            }
        }
    }
    
    /**
     * 停牌按钮点击事件
     */
    private onStandClicked() {
        if (this.isInGame && this.isMyTurn) {
            this.viewModel.playerStand();
            
            if (this.debugMode) {
                console.log(`[MultiplayerRoomView] 玩家停牌`);
            }
        }
    }
    
    /**
     * 玩家姓名输入改变事件
     */
    private onPlayerNameChanged() {
        this.updatePlayerName();
    }
    
    /**
     * 房间ID输入改变事件
     */
    private onRoomIdChanged() {
        // 可以添加验证逻辑
    }
    
    /**
     * 更新玩家姓名
     */
    private updatePlayerName() {
        const newName = this.playerNameInput?.string;
        if (newName && newName !== this.playerName) {
            this.playerName = newName;
            
            if (this.viewModel && this.viewModel.isConnected) {
                this.viewModel.updatePlayerName(this.playerName);
            }
            
            if (this.debugMode) {
                console.log(`[MultiplayerRoomView] 更新玩家姓名: ${this.playerName}`);
            }
        }
    }
    
    /**
     * 处理游戏状态更新
     */
    private handleGameStateUpdate(gameState) {
        if (this.debugMode) {
            console.log(`[MultiplayerRoomView] 游戏状态更新:`, gameState);
        }
        
        this.isInGame = gameState.gamePhase === 'playing' || gameState.gamePhase === 'dealer_turn';
        
        // 更新玩家手牌显示
        this.updatePlayerHandsDisplay(gameState.players);
        
        // 更新莊家手牌显示
        this.updateDealerHandDisplay(gameState.dealer, gameState.gamePhase);
        
        // 更新当前玩家
        this.updateCurrentPlayerDisplay(gameState.currentPlayerIndex, gameState.players);
        
        // 更新UI状态
        this.updateUI();
    }
    
    /**
     * 处理玩家轮换
     */
    private handlePlayerTurnChange(currentPlayer, allPlayers) {
        if (this.debugMode) {
            console.log(`[MultiplayerRoomView] 玩家轮换:`, currentPlayer);
        }
        
        // 判断是否轮到自己
        this.isMyTurn = currentPlayer.id === this.playerId;
        
        // 更新当前玩家指示
        if (this.currentPlayerLabel) {
            this.currentPlayerLabel.string = this.isMyTurn ? 
                '轮到你出牌!' : 
                `等待${currentPlayer.name}出牌...`;
                
            // 高亮显示当前玩家标签
            this.currentPlayerLabel.color = this.isMyTurn ? 
                new Color(255, 200, 0, 255) : // 黄色高亮
                new Color(255, 255, 255, 255); // 白色普通
        }
        
        // 设置按钮可用状态
        this.setButtonEnabled(this.hitButton, this.isMyTurn);
        this.setButtonEnabled(this.standButton, this.isMyTurn);
        
        // 高亮显示当前玩家
        this.highlightCurrentPlayer(currentPlayer.id);
    }
    
    /**
     * 处理游戏结束
     */
    private handleGameEnd(result, finalScores) {
        if (this.debugMode) {
            console.log(`[MultiplayerRoomView] 游戏结束:`, result, finalScores);
        }
        
        this.roomState = RoomState.ENDED;
        this.isInGame = false;
        this.isMyTurn = false;
        
        // 解析游戏结果
        this.parseGameResults(result);
        
        // 显示游戏结果
        if (this.gameResultLabel) {
            this.gameResultLabel.string = result;
            this.gameResultLabel.node.active = true;
        }
        
        // 更新玩家结果显示
        this.updatePlayerResults();
        
        // 设置按钮状态
        this.setButtonEnabled(this.hitButton, false);
        this.setButtonEnabled(this.standButton, false);
        this.setButtonEnabled(this.readyButton, true);
        
        // 更新UI
        this.updateUI();
    }
    
    /**
     * 处理连接状态变化
     */
    private handleConnectionStateChange(isConnected, message) {
        if (this.debugMode) {
            console.log(`[MultiplayerRoomView] 连接状态:`, isConnected, message);
        }
        
        // 更新UI
        this.updateUI();
        
        // 显示消息
        this.showMessage(message);
    }
    
    /**
     * 处理玩家列表更新
     */
    private handlePlayersUpdate(players) {
        if (this.debugMode) {
            console.log(`[MultiplayerRoomView] 玩家列表更新:`, players);
        }
        
        this.players = players;
        
        // 更新玩家列表显示
        this.updatePlayerListDisplay();
        
        // 更新玩家数量显示
        this.updatePlayerCountDisplay();
    }
    
    /**
     * 处理房间状态变化
     */
    private handleRoomStateChange(roomState, roomInfo) {
        if (this.debugMode) {
            console.log(`[MultiplayerRoomView] 房间状态变化:`, roomState, roomInfo);
        }
        
        if (roomState === 'created' || roomState === 'joined') {
            this.currentRoomId = roomInfo.roomId;
        }
        
        if (roomInfo.roomState) {
            this.roomState = roomInfo.roomState;
        }
        
        if (roomInfo.players) {
            this.players = roomInfo.players;
        }
        
        // 更新UI
        this.updateRoomDisplay();
        this.updatePlayerListDisplay();
        this.updatePlayerCountDisplay();
        this.updateUI();
        
        // 显示消息
        if (roomInfo.message) {
            this.showMessage(roomInfo.message);
        }
    }
    
    /**
     * 处理倒计时更新
     */
    private handleCountdownUpdate(seconds) {
        this.countdownValue = seconds;
        
        // 更新倒计时显示
        this.updateCountdownDisplay();
    }
    
    /**
     * 更新UI状态
     */
    private updateUI() {
        const inRoom = !!this.currentRoomId;
        const isWaiting = this.roomState === RoomState.WAITING;
        const isCountdown = this.roomState === RoomState.COUNTDOWN;
        const isPlaying = this.roomState === RoomState.PLAYING;
        const isEnded = this.roomState === RoomState.ENDED;
        
        // 更新房间管理按钮
        this.setButtonEnabled(this.createRoomButton, !inRoom);
        this.setButtonEnabled(this.joinRoomButton, !inRoom);
        this.setButtonEnabled(this.leaveRoomButton, inRoom && !isPlaying);
        this.setButtonEnabled(this.readyButton, inRoom && (isWaiting || isEnded));
        
        // 更新游戏按钮
        this.setButtonEnabled(this.hitButton, isPlaying && this.isMyTurn);
        this.setButtonEnabled(this.standButton, isPlaying && this.isMyTurn);
        
        // 更新输入框
        if (this.playerNameInput) {
            this.playerNameInput.enabled = !isPlaying;
        }
        
        if (this.roomIdInput) {
            this.roomIdInput.enabled = !inRoom;
        }
        
        // 显示/隐藏游戏区域
        if (this.playerHandsContainer) {
            this.playerHandsContainer.active = inRoom;
        }
        
        if (this.dealerHandContainer) {
            this.dealerHandContainer.active = inRoom && (isPlaying || isEnded);
        }
    }
    
    /**
     * 更新房间显示
     */
    private updateRoomDisplay() {
        if (this.roomIdLabel) {
            this.roomIdLabel.string = this.currentRoomId ? `房间ID: ${this.currentRoomId}` : '未加入房间';
        }
        
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
    }
    
    /**
     * 更新倒计时显示
     */
    private updateCountdownDisplay() {
        if (this.countdownLabel) {
            if (this.countdownValue > 0) {
                this.countdownLabel.string = `游戏开始倒计时: ${this.countdownValue}秒`;
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
            const playerCount = this.players.length;
            const maxPlayers = this.maxPlayers;
            this.playerCountLabel.string = `玩家数量: ${playerCount}/${maxPlayers}`;
        }
    }
    
    /**
     * 更新玩家列表显示
     */
    private updatePlayerListDisplay() {
        // 清空现有的玩家列表
        this.clearPlayerList();
        
        if (!this.playerListContainer || !this.players || !this.playerItemPrefab) {
            return;
        }
        
        // 添加玩家项
        this.players.forEach((player, index) => {
            // 创建玩家信息项
            const playerItem = instantiate(this.playerItemPrefab);
            playerItem.active = true;
            
            // 设置玩家信息
            const nameLabel = playerItem.getChildByName('NameLabel')?.getComponent(Label);
            if (nameLabel) {
                nameLabel.string = player.name + (player.id === this.playerId ? ' (你)' : '');
                
                // 如果是自己，设置为不同颜色
                if (player.id === this.playerId) {
                    nameLabel.color = new Color(100, 200, 255, 255); // 蓝色
                }
            }
            
            const scoreLabel = playerItem.getChildByName('ScoreLabel')?.getComponent(Label);
            if (scoreLabel) {
                scoreLabel.string = `分数: ${player.score}`;
                
                // 如果爆牌，设置为红色
                if (player.isBust) {
                    scoreLabel.color = new Color(255, 100, 100, 255); // 红色
                    scoreLabel.string += ' (爆牌)';
                }
            }
            
            const statusLabel = playerItem.getChildByName('StatusLabel')?.getComponent(Label);
            if (statusLabel) {
                if (player.isActive) {
                    statusLabel.string = '轮到此玩家';
                    statusLabel.color = new Color(255, 200, 0, 255); // 黄色
                } else if (player.hasStood) {
                    statusLabel.string = '已停牌';
                    statusLabel.color = new Color(150, 150, 150, 255); // 灰色
                } else if (this.isInGame) {
                    statusLabel.string = '等待中';
                    statusLabel.color = new Color(255, 255, 255, 255); // 白色
                } else {
                    statusLabel.string = '准备中';
                    statusLabel.color = new Color(100, 255, 100, 255); // 绿色
                }
            }
            
            // 添加到容器
            this.playerListContainer.addChild(playerItem);
            
            // 保存引用
            this.playerItems.set(player.id, playerItem);
        });
    }
    
    /**
     * 清空玩家列表
     */
    private clearPlayerList() {
        if (this.playerListContainer) {
            this.playerListContainer.removeAllChildren();
        }
        
        this.playerItems.clear();
    }
    
    /**
     * 高亮显示当前玩家
     */
    private highlightCurrentPlayer(playerId: string) {
        // 移除所有高亮
        this.playerItems.forEach((item, id) => {
            const statusLabel = item.getChildByName('StatusLabel')?.getComponent(Label);
            if (statusLabel) {
                if (id === playerId) {
                    statusLabel.string = '轮到此玩家';
                    statusLabel.color = new Color(255, 200, 0, 255); // 黄色
                } else {
                    statusLabel.string = '等待中';
                    statusLabel.color = new Color(255, 255, 255, 255); // 白色
                }
            }
        });
    }
    
    /**
     * 更新玩家手牌显示
     */
    private updatePlayerHandsDisplay(players: Player[]) {
        if (!this.playerHandsContainer || !players) return;
        
        // 清空现有的手牌显示
        this.playerHandsContainer.removeAllChildren();
        
        // 只显示自己的手牌
        const myPlayer = players.find(p => p.id === this.playerId);
        if (myPlayer && myPlayer.hand) {
            const handLabel = new Node('HandLabel');
            const label = handLabel.addComponent(Label);
            
            // 格式化手牌显示
            let handText = '我的手牌: ';
            myPlayer.hand.forEach((card, index) => {
                handText += this.formatCardText(card);
                if (index < myPlayer.hand.length - 1) {
                    handText += ', ';
                }
            });
            
            handText += `\n总点数: ${myPlayer.score}`;
            
            if (myPlayer.isBust) {
                handText += ' (爆牌)';
                label.color = new Color(255, 100, 100, 255); // 红色
            } else if (myPlayer.hasStood) {
                handText += ' (已停牌)';
                label.color = new Color(150, 150, 150, 255); // 灰色
            } else if (myPlayer.isActive) {
                handText += ' (轮到你)';
                label.color = new Color(255, 200, 0, 255); // 黄色
            }
            
            label.string = handText;
            label.fontSize = 20;
            
            this.playerHandsContainer.addChild(handLabel);
        }
    }
    
    /**
     * 更新莊家手牌显示
     */
    private updateDealerHandDisplay(dealer: Player, gamePhase: string) {
        if (!this.dealerHandContainer || !dealer || !dealer.hand) return;
        
        // 清空现有的手牌显示
        this.dealerHandContainer.removeAllChildren();
        
        const handLabel = new Node('DealerHandLabel');
        const label = handLabel.addComponent(Label);
        
        // 格式化手牌显示
        let handText = '莊家手牌: ';
        
        if (gamePhase === 'playing') {
            // 游戏进行中仅显示第一张牌
            if (dealer.hand.length > 0) {
                handText += this.formatCardText(dealer.hand[0]);
                handText += ', ?';
            }
        } else {
            // 游戏结束显示全部牌
            dealer.hand.forEach((card, index) => {
                handText += this.formatCardText(card);
                if (index < dealer.hand.length - 1) {
                    handText += ', ';
                }
            });
            
            handText += `\n总点数: ${dealer.score}`;
            
            if (dealer.isBust) {
                handText += ' (爆牌)';
                label.color = new Color(255, 100, 100, 255); // 红色
            }
        }
        
        label.string = handText;
        label.fontSize = 20;
        
        this.dealerHandContainer.addChild(handLabel);
        
        // 更新莊家分数标签
        if (this.dealerScoreLabel) {
            if (gamePhase === 'playing') {
                this.dealerScoreLabel.string = '莊家分数: ?';
            } else {
                this.dealerScoreLabel.string = `莊家分数: ${dealer.score}`;
            }
        }
    }
    
    /**
     * 更新当前玩家显示
     */
    private updateCurrentPlayerDisplay(currentIndex: number, players: Player[]) {
        if (!this.currentPlayerLabel || !players) return;
        
        this.currentPlayerIndex = currentIndex;
        
        if (currentIndex >= 0 && currentIndex < players.length) {
            const currentPlayer = players[currentIndex];
            this.isMyTurn = currentPlayer.id === this.playerId;
            
            if (this.isMyTurn) {
                this.currentPlayerLabel.string = '轮到你出牌!';
                this.currentPlayerLabel.color = new Color(255, 200, 0, 255); // 黄色高亮
            } else {
                this.currentPlayerLabel.string = `等待${currentPlayer.name}出牌...`;
                this.currentPlayerLabel.color = new Color(255, 255, 255, 255); // 白色普通
            }
        } else {
            this.currentPlayerLabel.string = '';
        }
    }
    
    /**
     * 解析游戏结果
     */
    private parseGameResults(result: string) {
        // 清空先前的结果
        this.playerResults.clear();
        
        // 解析结果字符串
        const resultLines = result.split('\n');
        for (const line of resultLines) {
            for (const player of this.players) {
                if (line.includes(player.name) || line.includes(player.id)) {
                    if (line.includes('Wins') || line.includes('赢')) {
                        this.playerResults.set(player.id, GameResultType.WIN);
                    } else if (line.includes('Bust') || line.includes('爆牌')) {
                        this.playerResults.set(player.id, GameResultType.BUST);
                    } else if (line.includes('Tie') || line.includes('平局')) {
                        this.playerResults.set(player.id, GameResultType.TIE);
                    } else {
                        this.playerResults.set(player.id, GameResultType.LOSE);
                    }
                }
            }
        }
    }
    
    /**
     * 更新玩家结果显示
     */
    private updatePlayerResults() {
        this.playerItems.forEach((item, playerId) => {
            const resultType = this.playerResults.get(playerId);
            if (!resultType) return;
            
            const statusLabel = item.getChildByName('StatusLabel')?.getComponent(Label);
            if (statusLabel) {
                switch (resultType) {
                    case GameResultType.WIN:
                        statusLabel.string = '胜利';
                        statusLabel.color = new Color(0, 255, 0, 255); // 绿色
                        break;
                    case GameResultType.LOSE:
                        statusLabel.string = '失败';
                        statusLabel.color = new Color(255, 0, 0, 255); // 红色
                        break;
                    case GameResultType.TIE:
                        statusLabel.string = '平局';
                        statusLabel.color = new Color(200, 200, 200, 255); // 灰色
                        break;
                    case GameResultType.BUST:
                        statusLabel.string = '爆牌';
                        statusLabel.color = new Color(255, 100, 100, 255); // 红色
                        break;
                }
            }
        });
    }
    
    /**
     * 格式化牌面文字
     */
    private formatCardText(card: any): string {
        if (!card) return '?';
        
        const suitMap = {
            'Hearts': '♥',
            'Diamonds': '♦',
            'Clubs': '♣',
            'Spades': '♠'
        };
        
        const suit = suitMap[card.suit] || card.suit;
        return `${suit}${card.value}`;
    }
    
    /**
     * 设置按钮启用/禁用状态
     */
    private setButtonEnabled(buttonNode: Node, enabled: boolean) {
        if (!buttonNode) return;
        
        const button = buttonNode.getComponent(Button);
        if (button) {
            button.interactable = enabled;
        }
    }
    
    /**
     * 显示消息
     */
    private showMessage(message: string) {
        if (this.roomStateLabel) {
            this.roomStateLabel.string = message;
        }
        
        if (this.debugMode) {
            console.log(`[MultiplayerRoomView] 消息: ${message}`);
        }
    }
}