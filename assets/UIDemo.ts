/**
 * 簡化的UI演示組件
 * 專門用於在Cocos Creator編輯器中快速創建和測試UI
 * 此組件會自動創建UI並整合MVVM架構
 */

import { _decorator, Component, Node, Label, Button, Canvas, UITransform, Widget, Color, find, director, Scene } from 'cc';
import { GameView } from './GameView';

const { ccclass, property } = _decorator;

/**
 * UI演示組件 - 掛載到任何節點即可自動創建UI
 */
@ccclass('UIDemo')
export class UIDemo extends Component {

    @property({
        tooltip: '是否在start時自動創建UI'
    })
    autoCreateUI: boolean = true;

    @property({
        tooltip: '是否自動整合MVVM架構'
    })
    enableMVVM: boolean = true;

    @property({
        tooltip: '是否顯示調試信息'
    })
    showDebugLog: boolean = true;

    // UI元素引用
    private uiCanvas: Node = null;
    private gameContainer: Node = null;
    private gameView: GameView = null;

    /**
     * 組件啟動時執行
     */
    start() {
        if (this.showDebugLog) {
            console.log('🎮 [UIDemo] 開始初始化UI演示...');
        }
        
        if (this.autoCreateUI) {
            this.scheduleOnce(() => {
                this.createCompleteGameUI();
            }, 0.1);
        }
    }

    /**
     * 創建完整的遊戲UI
     */
    public createCompleteGameUI(): void {
        console.log('🎨 [UIDemo] 開始創建遊戲UI...');
        
        // 1. 確保有Canvas
        this.ensureCanvas();
        
        // 2. 創建遊戲容器
        this.createGameContainer();
        
        // 3. 創建UI元素
        this.createUIElements();
        
        // 4. 整合MVVM架構
        if (this.enableMVVM) {
            this.integrateMVVM();
        }
        
        console.log('✅ [UIDemo] UI創建完成！');
    }

    /**
     * 確保場景中有Canvas
     */
    private ensureCanvas(): void {
        // 查找現有Canvas
        this.uiCanvas = find('Canvas');
        
        if (!this.uiCanvas) {
            // 創建新的Canvas
            this.uiCanvas = new Node('Canvas');
            director.getScene().addChild(this.uiCanvas);
            
            // 添加Canvas組件
            const canvasComponent = this.uiCanvas.addComponent(Canvas);
            
            // 設置Canvas屬性
            const uiTransform = this.uiCanvas.getComponent(UITransform);
            if (uiTransform) {
                uiTransform.setContentSize(1920, 1080);
            }
            
            console.log('📱 [UIDemo] 已創建新的Canvas');
        } else {
            console.log('📱 [UIDemo] 使用現有Canvas');
        }
    }

    /**
     * 創建遊戲容器
     */
    private createGameContainer(): void {
        this.gameContainer = new Node('GameContainer');
        this.uiCanvas.addChild(this.gameContainer);
        
        // 設置容器屬性
        const containerTransform = this.gameContainer.addComponent(UITransform);
        containerTransform.setContentSize(1920, 1080);
        
        // 添加Widget組件實現全屏適配
        const widget = this.gameContainer.addComponent(Widget);
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.left = 0;
        widget.right = 0;
        widget.top = 0;
        widget.bottom = 0;
        
        console.log('📦 [UIDemo] 遊戲容器已創建');
    }

    /**
     * 創建UI元素
     */
    private createUIElements(): void {
        // 創建標題
        this.createTitle();
        
        // 創建分數區域
        this.createScoreArea();
        
        // 創建按鈕區域
        this.createButtonArea();
        
        // 創建狀態區域
        this.createStatusArea();
        
        console.log('🎯 [UIDemo] UI元素已創建');
    }

    /**
     * 創建標題
     */
    private createTitle(): void {
        const title = new Node('Title');
        this.gameContainer.addChild(title);
        
        const titleLabel = title.addComponent(Label);
        titleLabel.string = '21點 Blackjack';
        titleLabel.fontSize = 60;
        titleLabel.color = new Color(255, 255, 255, 255);
        
        const titleTransform = title.addComponent(UITransform);
        titleTransform.setContentSize(600, 80);
        
        title.setPosition(0, 400, 0);
    }

    /**
     * 創建分數區域
     */
    private createScoreArea(): void {
        // 玩家分數
        const playerScore = this.createLabel('PlayerScore', '玩家分數: 0', 36);
        this.gameContainer.addChild(playerScore);
        playerScore.setPosition(-300, 200, 0);
        
        // 莊家分數
        const dealerScore = this.createLabel('DealerScore', '莊家分數: 0', 36);
        this.gameContainer.addChild(dealerScore);
        dealerScore.setPosition(300, 200, 0);
        
        // 遊戲結果
        const gameResult = this.createLabel('GameResult', '', 42);
        this.gameContainer.addChild(gameResult);
        gameResult.setPosition(0, 100, 0);
        gameResult.getComponent(Label).color = new Color(255, 215, 0, 255); // 金色
    }

    /**
     * 創建按鈕區域
     */
    private createButtonArea(): void {
        // 要牌按鈕
        const hitButton = this.createButton('HitButton', '要牌', new Color(46, 204, 113, 255));
        this.gameContainer.addChild(hitButton);
        hitButton.setPosition(-200, -50, 0);
        
        // 停牌按鈕
        const standButton = this.createButton('StandButton', '停牌', new Color(231, 76, 60, 255));
        this.gameContainer.addChild(standButton);
        standButton.setPosition(0, -50, 0);
        
        // 重新開始按鈕
        const restartButton = this.createButton('RestartButton', '重新開始', new Color(52, 152, 219, 255));
        this.gameContainer.addChild(restartButton);
        restartButton.setPosition(200, -50, 0);
    }

    /**
     * 創建狀態區域
     */
    private createStatusArea(): void {
        // 連接狀態
        const connectionStatus = this.createLabel('ConnectionStatus', '連接狀態: 檢查中...', 24);
        this.gameContainer.addChild(connectionStatus);
        connectionStatus.setPosition(0, -200, 0);
        connectionStatus.getComponent(Label).color = new Color(150, 150, 150, 255);
        
        // 使用說明
        const instructions = this.createLabel('Instructions', 
            '使用說明: 點擊"要牌"獲取卡牌，點擊"停牌"結束回合\n目標：讓手牌總數接近21但不超過21', 20);
        this.gameContainer.addChild(instructions);
        instructions.setPosition(0, -300, 0);
        instructions.getComponent(Label).color = new Color(200, 200, 200, 255);
        
        const instructionsTransform = instructions.getComponent(UITransform);
        instructionsTransform.setContentSize(800, 60);
    }

    /**
     * 創建標籤輔助方法
     */
    private createLabel(name: string, text: string, fontSize: number): Node {
        const labelNode = new Node(name);
        
        const label = labelNode.addComponent(Label);
        label.string = text;
        label.fontSize = fontSize;
        label.color = new Color(255, 255, 255, 255);
        
        const transform = labelNode.addComponent(UITransform);
        transform.setContentSize(400, fontSize + 10);
        
        return labelNode;
    }

    /**
     * 創建按鈕輔助方法
     */
    private createButton(name: string, text: string, color: Color): Node {
        const buttonNode = new Node(name);
        
        // 按鈕背景 - 創建一個簡單的彩色背景
        const bg = new Node('Background');
        buttonNode.addChild(bg);
        
        const bgTransform = bg.addComponent(UITransform);
        bgTransform.setContentSize(150, 60);
        
        // 按鈕組件
        const button = buttonNode.addComponent(Button);
        button.transition = Button.Transition.SCALE;
        button.zoomScale = 0.9;
        
        // 按鈕文字
        const label = buttonNode.addComponent(Label);
        label.string = text;
        label.fontSize = 28;
        label.color = new Color(255, 255, 255, 255);
        
        const buttonTransform = buttonNode.addComponent(UITransform);
        buttonTransform.setContentSize(150, 60);
        
        return buttonNode;
    }

    /**
     * 整合MVVM架構
     */
    private integrateMVVM(): void {
        console.log('🔗 [UIDemo] 開始整合MVVM架構...');
        
        try {
            // 添加GameView組件到遊戲容器
            this.gameView = this.gameContainer.addComponent(GameView);
            
            // 綁定UI元素到GameView
            this.bindUIElements();
            
            // 初始化GameView
            this.gameView.initializeGame();
            
            console.log('✅ [UIDemo] MVVM架構整合完成');
            
        } catch (error) {
            console.error('❌ [UIDemo] MVVM架構整合失敗:', error);
        }
    }

    /**
     * 綁定UI元素到GameView
     */
    private bindUIElements(): void {
        if (!this.gameView) return;
        
        // 查找並綁定UI元素
        const playerScoreNode = this.gameContainer.getChildByName('PlayerScore');
        const dealerScoreNode = this.gameContainer.getChildByName('DealerScore');
        const gameResultNode = this.gameContainer.getChildByName('GameResult');
        const hitButtonNode = this.gameContainer.getChildByName('HitButton');
        const standButtonNode = this.gameContainer.getChildByName('StandButton');
        const restartButtonNode = this.gameContainer.getChildByName('RestartButton');
        const connectionStatusNode = this.gameContainer.getChildByName('ConnectionStatus');
        
        // 綁定到GameView屬性
        if (playerScoreNode) this.gameView.playerScoreLabel = playerScoreNode.getComponent(Label);
        if (dealerScoreNode) this.gameView.dealerScoreLabel = dealerScoreNode.getComponent(Label);
        if (gameResultNode) this.gameView.gameResultLabel = gameResultNode.getComponent(Label);
        if (hitButtonNode) this.gameView.hitButton = hitButtonNode;
        if (standButtonNode) this.gameView.standButton = standButtonNode;
        if (restartButtonNode) this.gameView.restartButton = restartButtonNode;
        if (connectionStatusNode) this.gameView.connectionStatusLabel = connectionStatusNode.getComponent(Label);
        
        console.log('🔗 [UIDemo] UI元素綁定完成');
    }

    /**
     * 手動觸發UI創建（用於編輯器中調用）
     */
    public manualCreateUI(): void {
        console.log('🖱️ [UIDemo] 手動觸發UI創建');
        this.createCompleteGameUI();
    }

    /**
     * 重置UI
     */
    public resetUI(): void {
        console.log('🔄 [UIDemo] 重置UI');
        
        if (this.gameContainer) {
            this.gameContainer.destroyAllChildren();
            this.createUIElements();
            
            if (this.enableMVVM && this.gameView) {
                this.bindUIElements();
            }
        }
    }

    /**
     * 切換MVVM模式
     */
    public toggleMVVM(): void {
        this.enableMVVM = !this.enableMVVM;
        console.log(`🔄 [UIDemo] MVVM模式: ${this.enableMVVM ? '已啟用' : '已停用'}`);
        
        if (this.enableMVVM && !this.gameView) {
            this.integrateMVVM();
        }
    }

    /**
     * 獲取遊戲容器
     */
    public getGameContainer(): Node {
        return this.gameContainer;
    }

    /**
     * 獲取GameView實例
     */
    public getGameView(): GameView {
        return this.gameView;
    }

    /**
     * 組件銷毀時清理
     */
    onDestroy() {
        console.log('🗑️ [UIDemo] 清理UI演示組件');
    }
}
