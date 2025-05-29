/**
 * 21點遊戲UI配置器
 * 簡化的UI設置組件，方便在Cocos Creator編輯器中使用
 */

import { _decorator, Component, Node, Label, Button, Prefab, instantiate } from 'cc';
import { GameView } from './GameView';

const { ccclass, property } = _decorator;

/**
 * UI配置器組件
 * 用於快速設置和配置21點遊戲的UI元素
 */
@ccclass('BlackjackUIConfigurator')
export class BlackjackUIConfigurator extends Component {
    
    // ===========================================
    // UI元素屬性 - 在Cocos Creator編輯器中配置
    // ===========================================
    
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
        type: Node,
        tooltip: '要牌按鈕節點'
    })
    hitButton: Node = null;

    @property({
        type: Node,
        tooltip: '停牌按鈕節點'
    })
    standButton: Node = null;

    @property({
        type: Node,
        tooltip: '重新開始按鈕節點'
    })
    restartButton: Node = null;

    @property({
        type: Label,
        tooltip: '遊戲結果顯示標籤'
    })
    gameResultLabel: Label = null;

    @property({
        type: Label,
        tooltip: '連接狀態顯示標籤'
    })
    connectionStatusLabel: Label = null;

    // ===========================================
    // 可選的預製體屬性
    // ===========================================
    
    @property({
        type: Prefab,
        tooltip: '撲克牌預製體（可選）'
    })
    cardPrefab: Prefab = null;

    @property({
        type: Node,
        tooltip: '玩家卡牌容器節點（可選）'
    })
    playerCardContainer: Node = null;

    @property({
        type: Node,
        tooltip: '莊家卡牌容器節點（可選）'
    })
    dealerCardContainer: Node = null;

    // ===========================================
    // 配置選項
    // ===========================================
    
    @property({
        tooltip: '是否自動配置GameView組件'
    })
    autoSetupGameView: boolean = true;

    @property({
        tooltip: '是否在開始時顯示連接狀態'
    })
    showConnectionStatus: boolean = true;

    @property({
        tooltip: '是否啟用調試模式'
    })
    debugMode: boolean = false;

    // 內部引用
    private gameView: GameView = null;

    /**
     * 組件開始時自動配置
     */
    start() {
        if (this.debugMode) {
            console.log('🎮 開始配置21點遊戲UI');
        }
        
        if (this.autoSetupGameView) {
            this.setupGameView();
        }
        
        this.validateUIElements();
        this.initializeUI();
    }

    /**
     * 設置GameView組件
     */
    private setupGameView(): void {
        // 檢查是否已經有GameView組件
        this.gameView = this.node.getComponent(GameView);
        
        if (!this.gameView) {
            if (this.debugMode) {
                console.log('➕ 添加GameView組件');
            }
            this.gameView = this.node.addComponent(GameView);
        }
        
        // 綁定UI元素到GameView
        this.bindUIToGameView();
    }

    /**
     * 綁定UI元素到GameView組件
     */
    private bindUIToGameView(): void {
        if (!this.gameView) {
            console.error('❌ GameView組件未找到');
            return;
        }
        
        // 綁定所有UI元素
        this.gameView.playerScoreLabel = this.playerScoreLabel;
        this.gameView.dealerScoreLabel = this.dealerScoreLabel;
        this.gameView.hitButton = this.hitButton;
        this.gameView.standButton = this.standButton;
        this.gameView.restartButton = this.restartButton;
        this.gameView.gameResultLabel = this.gameResultLabel;
        this.gameView.connectionStatusLabel = this.connectionStatusLabel;
        
        if (this.debugMode) {
            console.log('🔗 UI元素綁定完成');
            this.logUIBindingStatus();
        }
    }

    /**
     * 驗證UI元素是否正確配置
     */
    private validateUIElements(): void {
        const missing: string[] = [];
        
        if (!this.playerScoreLabel) missing.push('玩家分數標籤');
        if (!this.dealerScoreLabel) missing.push('莊家分數標籤');
        if (!this.hitButton) missing.push('要牌按鈕');
        if (!this.standButton) missing.push('停牌按鈕');
        if (!this.restartButton) missing.push('重新開始按鈕');
        if (!this.gameResultLabel) missing.push('遊戲結果標籤');
        if (!this.connectionStatusLabel) missing.push('連接狀態標籤');
        
        if (missing.length > 0) {
            console.warn('⚠️ 以下UI元素未配置:', missing.join(', '));
            console.warn('請在Cocos Creator編輯器中將相應的節點拖拽到BlackjackUIConfigurator組件的屬性中');
        } else {
            if (this.debugMode) {
                console.log('✅ 所有必需的UI元素都已配置');
            }
        }
    }

    /**
     * 初始化UI狀態
     */
    private initializeUI(): void {
        // 設置初始文字
        if (this.playerScoreLabel) {
            this.playerScoreLabel.string = '玩家: 0';
        }
        
        if (this.dealerScoreLabel) {
            this.dealerScoreLabel.string = '莊家: 0';
        }
        
        if (this.gameResultLabel) {
            this.gameResultLabel.string = '';
        }
        
        if (this.connectionStatusLabel) {
            this.connectionStatusLabel.string = this.showConnectionStatus ? '伺服器狀態: 連接中...' : '';
        }
        
        if (this.debugMode) {
            console.log('🎯 UI初始化完成');
        }
    }

    /**
     * 記錄UI綁定狀態（調試用）
     */
    private logUIBindingStatus(): void {
        console.log('📊 UI綁定狀態:');
        console.log(`  玩家分數標籤: ${this.playerScoreLabel ? '✅' : '❌'}`);
        console.log(`  莊家分數標籤: ${this.dealerScoreLabel ? '✅' : '❌'}`);
        console.log(`  要牌按鈕: ${this.hitButton ? '✅' : '❌'}`);
        console.log(`  停牌按鈕: ${this.standButton ? '✅' : '❌'}`);
        console.log(`  重新開始按鈕: ${this.restartButton ? '✅' : '❌'}`);
        console.log(`  遊戲結果標籤: ${this.gameResultLabel ? '✅' : '❌'}`);
        console.log(`  連接狀態標籤: ${this.connectionStatusLabel ? '✅' : '❌'}`);
    }

    /**
     * 創建撲克牌顯示（可選功能）
     */
    public createCardDisplay(cards: any[], isPlayer: boolean): void {
        const container = isPlayer ? this.playerCardContainer : this.dealerCardContainer;
        
        if (!container || !this.cardPrefab) {
            if (this.debugMode) {
                console.log('⚠️ 卡牌容器或預製體未配置，跳過卡牌顯示');
            }
            return;
        }
        
        // 清除現有卡牌
        container.removeAllChildren();
        
        // 創建新卡牌
        cards.forEach((card, index) => {
            const cardNode = instantiate(this.cardPrefab);
            container.addChild(cardNode);
            
            // 設置卡牌位置
            cardNode.setPosition(index * 60, 0, 0);
            
            // 如果卡牌節點有Label組件，設置卡牌文字
            const cardLabel = cardNode.getComponent(Label);
            if (cardLabel) {
                cardLabel.string = `${card.suit}\n${card.value}`;
            }
        });
        
        if (this.debugMode) {
            console.log(`🃏 創建了 ${cards.length} 張${isPlayer ? '玩家' : '莊家'}卡牌`);
        }
    }

    /**
     * 更新按鈕狀態
     */
    public updateButtonStates(gamePhase: string): void {
        const isPlaying = gamePhase === 'playing';
        const isEnded = gamePhase === 'ended';
        
        // 設置要牌和停牌按鈕
        this.setButtonInteractable(this.hitButton, isPlaying);
        this.setButtonInteractable(this.standButton, isPlaying);
        
        // 重新開始按鈕在遊戲結束後才可用
        this.setButtonInteractable(this.restartButton, isEnded || gamePhase === 'waiting');
        
        if (this.debugMode) {
            console.log(`🎮 更新按鈕狀態 - 遊戲階段: ${gamePhase}`);
        }
    }

    /**
     * 設置按鈕可交互狀態
     */
    private setButtonInteractable(buttonNode: Node, interactable: boolean): void {
        if (!buttonNode) return;
        
        const button = buttonNode.getComponent(Button);
        if (button) {
            button.interactable = interactable;
        }
        
        // 視覺回饋：調整透明度 (使用UIOpacity組件)
        const uiOpacity = buttonNode.getComponent('cc.UIOpacity') as any;
        if (uiOpacity && typeof uiOpacity.opacity !== 'undefined') {
            uiOpacity.opacity = interactable ? 255 : 150;
        }
    }

    /**
     * 顯示遊戲結果動畫（可擴展）
     */
    public showGameResult(result: string): void {
        if (this.gameResultLabel) {
            this.gameResultLabel.string = result;
            
            // 可以在這裡添加動畫效果
            // 例如：淡入動畫、縮放動畫等
        }
        
        if (this.debugMode) {
            console.log(`🏆 顯示遊戲結果: ${result}`);
        }
    }

    /**
     * 重置UI狀態
     */
    public resetUI(): void {
        this.initializeUI();
        this.updateButtonStates('waiting');
        
        // 清除卡牌顯示
        if (this.playerCardContainer) {
            this.playerCardContainer.removeAllChildren();
        }
        if (this.dealerCardContainer) {
            this.dealerCardContainer.removeAllChildren();
        }
        
        if (this.debugMode) {
            console.log('🔄 UI狀態已重置');
        }
    }

    /**
     * 獲取GameView組件（外部調用）
     */
    public getGameView(): GameView {
        return this.gameView;
    }

    /**
     * 手動重新綁定UI（外部調用）
     */
    public rebindUI(): void {
        this.bindUIToGameView();
        this.validateUIElements();
        
        if (this.debugMode) {
            console.log('🔗 UI重新綁定完成');
        }
    }
}
