/**
 * RoomTypes.ts
 * 多人游戏房间相关的类型定义
 */

import { Player } from './GameModel';

/**
 * 房间状态枚举
 */
export enum RoomState {
    WAITING = 'waiting',     // 等待玩家加入
    COUNTDOWN = 'countdown', // 倒计时开始阶段
    PLAYING = 'playing',     // 游戏进行中
    ENDED = 'ended'          // 游戏结束
}

/**
 * 游戏结果类型
 */
export enum GameResultType {
    WIN = 'win',
    LOSE = 'lose',
    TIE = 'tie',
    BUST = 'bust'
}

/**
 * 玩家操作超时配置
 */
export interface TimeoutConfig {
    enabled: boolean;        // 是否启用超时
    durationSeconds: number; // 超时时间（秒）
}

/**
 * 房间配置
 */
export interface RoomConfig {
    roomId: string;              // 房间ID
    maxPlayers: number;          // 最大玩家数 (1-6)
    countdownSeconds: number;    // 开始游戏倒计时（秒）
    playerTimeout: TimeoutConfig; // 玩家操作超时设置
    autoStart: boolean;          // 是否在人数达到时自动开始
    minPlayers: number;          // 最小开始人数
}

/**
 * 房间信息
 */
export interface RoomInfo {
    roomId: string;             // 房间ID
    state: RoomState;           // 房间状态
    players: Player[];          // 房间中的玩家
    config: RoomConfig;         // 房间配置
    countdown?: number;         // 倒计时秒数（若有）
    currentPlayerIndex?: number; // 当前玩家索引（游戏中）
}

/**
 * 房间创建请求
 */
export interface CreateRoomRequest {
    action: 'createRoom';
    playerId: string;
    playerName?: string;
    roomConfig: Partial<RoomConfig>;
}

/**
 * 加入房间请求
 */
export interface JoinRoomRequest {
    action: 'joinRoom';
    playerId: string;
    playerName?: string;
    roomId: string;
}

/**
 * 离开房间请求
 */
export interface LeaveRoomRequest {
    action: 'leaveRoom';
    playerId: string;
    roomId: string;
}

/**
 * 玩家准备请求
 */
export interface PlayerReadyRequest {
    action: 'playerReady';
    playerId: string;
    roomId: string;
}

/**
 * 房间创建响应
 */
export interface RoomCreatedResponse {
    action: 'roomCreated';
    roomId: string;
    roomConfig: RoomConfig;
    players: Player[];
    message?: string;
}

/**
 * 加入房间响应
 */
export interface RoomJoinedResponse {
    action: 'roomJoined';
    roomId: string;
    players: Player[];
    roomState: RoomState;
    message?: string;
}

/**
 * 离开房间响应
 */
export interface RoomLeftResponse {
    action: 'roomLeft';
    playerId: string;
    roomId: string;
    message?: string;
}

/**
 * 房间状态变化响应
 */
export interface RoomStateChangedResponse {
    action: 'roomStateChanged';
    roomId: string;
    roomState: RoomState;
    players: Player[];
    message?: string;
}

/**
 * 倒计时更新响应
 */
export interface CountdownUpdateResponse {
    action: 'countdownUpdate';
    roomId: string;
    seconds: number;
}

/**
 * 玩家轮换响应
 */
export interface PlayerTurnResponse {
    action: 'playerTurn';
    roomId: string;
    currentPlayer: Player;
    currentPlayerIndex: number;
    players: Player[];
    timeoutSeconds?: number;
}

/**
 * 玩家超时响应
 */
export interface PlayerTimeoutResponse {
    action: 'playerTimeout';
    roomId: string;
    playerId: string;
    message: string;
}