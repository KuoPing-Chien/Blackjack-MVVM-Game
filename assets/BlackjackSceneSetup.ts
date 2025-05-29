/**
 * 21點遊戲場景設置組件
 * 提供完整的場景自動化配置功能
 * 在Cocos Creator編輯器中使用此組件可快速創建完整的遊戲場景
 */

import { _decorator, Component, Node, Label, Button, Canvas, Widget, UITransform, Color, Sprite, SpriteFrame, Material } from 'cc';
import { GameView } from './GameView';
import { GameViewModel } from './GameViewModel';
import { GameModel } from './GameModel';

const { ccclass, property } = _decorator;

/**
 * 場景設置組件
 * 提供一鍵式場景創建和MVVM架構整合
 */
@ccclass('BlackjackSceneSetup')
export class BlackjackSceneSetup extends Component {
    
    // ===========================================
    // 配置選項
    // ===========================================
    
    @property({
        tooltip: '是否在開始時自動創建UI'
    })
    autoCreateUI: boolean = true;

    @property({
        tooltip: '是否自動連接到後端服務器'
    })
    autoConnectServer: boolean = true;

    @property({
        tooltip: '服務器地址（WebSocket）'
    })
    serverUrl: string = 'ws://localhost:3000';

    @property({
        tooltip: '是否顯示調試信息'
    })
    showDebugInfo: boolean = true;

    // ===========================================
    // UI樣式配置
    // ===========================================
    
    @property({
        tooltip: '主要UI顏色'
    })
    primaryColor: Color = new Color(52, 152, 219);

    @property({
        tooltip: '次要UI顏色'
    })
    secondaryColor: Color = new Color(46, 204, 113);

    @property({
        tooltip: '警告顏色'
    })
    warningColor: Color = new Color(231, 76, 60);

    @property({
        tooltip: '文字顏色'
    })
    textColor: Color = new Color(255, 255, 255);

    // 私有屬性
    private gameView: GameView;
    private gameViewModel: GameViewModel;
    private gameModel: GameModel;
    private uiContainer: Node;

    /**
     * 組件啟動時執行
     */
    start() {
        if (this.autoCreateUI) {
            this.createCompleteUI();
        }
        
        if (this.autoConnectServer) {
            this.setupMVVMAndConnect();
        }
    }

    /**
     * 創建完整的UI界面
     */
    private createCompleteUI(): void {
        console.log('[場景設置] 開始創建UI界面...');
        
        // 創建主容器
        this.createMainContainer();
        
        // 創建標題區域
        this.createTitleArea();
        
        // 創建遊戲信息區域
        this.createGameInfoArea();
        
        // 創建卡牌區域
        this.createCardArea();
        
        // 創建控制按鈕區域
        this.createControlArea();
        
        // 創建狀態信息區域
        this.createStatusArea();
        
        console.log('[場景設置] UI界面創建完成');
    }

    /**
     * 創建主容器
     */
    private createMainContainer(): void {
        this.uiContainer = new Node('UI_Container');
        this.node.addChild(this.uiContainer);
        
        // 添加UITransform組件
        const uiTransform = this.uiContainer.addComponent(UITransform);
        uiTransform.setContentSize(1920, 1080);
        
        // 添加Widget組件進行自適應
        const widget = this.uiContainer.addComponent(Widget);
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.left = 0;
        widget.right = 0;
        widget.top = 0;
        widget.bottom = 0;
    }

    /**
     * 創建標題區域
     */
    private createTitleArea(): void {
        // 標題容器
        const titleContainer = new Node('Title_Container');
        this.uiContainer.addChild(titleContainer);
        
        const titleTransform = titleContainer.addComponent(UITransform);
        titleTransform.setContentSize(600, 100);
        titleContainer.setPosition(0, 400, 0);
        
        // 標題標籤
        const titleLabel = new Node('Title_Label');
        titleContainer.addChild(titleLabel);
        
        const titleLabelComponent = titleLabel.addComponent(Label);
        titleLabelComponent.string = '21點 Blackjack';
        titleLabelComponent.fontSize = 48;
        titleLabelComponent.color = this.textColor;
        
        const titleLabelTransform = titleLabel.addComponent(UITransform);
        titleLabelTransform.setContentSize(600, 100);
    }

    /**
     * 創建遊戲信息區域
     */
    private createGameInfoArea(): void {
        // 信息容器
        const infoContainer = new Node('Info_Container');
        this.uiContainer.addChild(infoContainer);
        
        const infoTransform = infoContainer.addComponent(UITransform);
        infoTransform.setContentSize(800, 120);
        infoContainer.setPosition(0, 280, 0);
        
        // 玩家分數標籤
        const playerScoreLabel = this.createLabel('Player_Score_Label', '玩家分數: 0', 32);
        infoContainer.addChild(playerScoreLabel);
        playerScoreLabel.setPosition(-200, 30, 0);
        
        // 莊家分數標籤
        const dealerScoreLabel = this.createLabel('Dealer_Score_Label', '莊家分數: 0', 32);
        infoContainer.addChild(dealerScoreLabel);
        dealerScoreLabel.setPosition(200, 30, 0);
        
        // 遊戲結果標籤
        const gameResultLabel = this.createLabel('Game_Result_Label', '', 36);
        infoContainer.addChild(gameResultLabel);
        gameResultLabel.setPosition(0, -30, 0);
        const resultLabelComponent = gameResultLabel.getComponent(Label);
        resultLabelComponent.color = this.warningColor;
        
        // 保存引用到節點
        this.node['playerScoreLabel'] = playerScoreLabel.getComponent(Label);
        this.node['dealerScoreLabel'] = dealerScoreLabel.getComponent(Label);
        this.node['gameResultLabel'] = gameResultLabel.getComponent(Label);
    }

    /**
     * 創建卡牌區域
     */
    private createCardArea(): void {
        // 卡牌主容器
        const cardContainer = new Node('Card_Container');
        this.uiContainer.addChild(cardContainer);
        
        const cardTransform = cardContainer.addComponent(UITransform);
        cardTransform.setContentSize(1200, 300);
        cardContainer.setPosition(0, 50, 0);
        
        // 玩家卡牌區域
        const playerCardArea = this.createCardDisplayArea('Player_Card_Area', '玩家手牌', -300);
        cardContainer.addChild(playerCardArea);
        
        // 莊家卡牌區域
        const dealerCardArea = this.createCardDisplayArea('Dealer_Card_Area', '莊家手牌', 300);
        cardContainer.addChild(dealerCardArea);
    }

    /**
     * 創建卡牌顯示區域
     */
    private createCardDisplayArea(name: string, title: string, xPosition: number): Node {
        const area = new Node(name);
        
        const areaTransform = area.addComponent(UITransform);
        areaTransform.setContentSize(400, 300);
        area.setPosition(xPosition, 0, 0);
        
        // 區域標題
        const titleLabel = this.createLabel(`${name}_Title`, title, 24);
        area.addChild(titleLabel);
        titleLabel.setPosition(0, 120, 0);
        
        // 卡牌容器
        const cardDisplay = new Node(`${name}_Cards`);
        area.addChild(cardDisplay);
        
        const cardDisplayTransform = cardDisplay.addComponent(UITransform);
        cardDisplayTransform.setContentSize(380, 200);
        cardDisplay.setPosition(0, 0, 0);
        
        // 卡牌背景
        const cardBackground = new Node(`${name}_Background`);
        cardDisplay.addChild(cardBackground);
        
        const bgSprite = cardBackground.addComponent(Sprite);
        const bgTransform = cardBackground.addComponent(UITransform);
        bgTransform.setContentSize(380, 200);
        
        // 設置背景顏色
        bgSprite.color = new Color(0, 0, 0, 50);
        
        return area;
    }

    /**
     * 創建控制按鈕區域
     */
    private createControlArea(): void {
        // 控制容器
        const controlContainer = new Node('Control_Container');
        this.uiContainer.addChild(controlContainer);
        
        const controlTransform = controlContainer.addComponent(UITransform);
        controlTransform.setContentSize(600, 100);
        controlContainer.setPosition(0, -150, 0);
        
        // 要牌按鈕
        const hitButton = this.createButton('Hit_Button', '要牌', this.secondaryColor);
        controlContainer.addChild(hitButton);
        hitButton.setPosition(-150, 0, 0);
        
        // 停牌按鈕
        const standButton = this.createButton('Stand_Button', '停牌', this.warningColor);
        controlContainer.addChild(standButton);
        standButton.setPosition(0, 0, 0);
        
        // 重新開始按鈕
        const restartButton = this.createButton('Restart_Button', '重新開始', this.primaryColor);
        controlContainer.addChild(restartButton);
        restartButton.setPosition(150, 0, 0);
        
        // 保存引用到節點
        this.node['hitButton'] = hitButton;
        this.node['standButton'] = standButton;
        this.node['restartButton'] = restartButton;
    }

    /**
     * 創建狀態信息區域
     */
    private createStatusArea(): void {
        // 狀態容器
        const statusContainer = new Node('Status_Container');
        this.uiContainer.addChild(statusContainer);
        
        const statusTransform = statusContainer.addComponent(UITransform);
        statusTransform.setContentSize(800, 80);
        statusContainer.setPosition(0, -300, 0);
        
        // 連接狀態標籤
        const connectionLabel = this.createLabel('Connection_Status_Label', '連接狀態: 未連接', 20);
        statusContainer.addChild(connectionLabel);
        connectionLabel.setPosition(-200, 20, 0);
        
        // 遊戲統計標籤
        const statsLabel = this.createLabel('Game_Stats_Label', '勝率: 0%', 20);
        statusContainer.addChild(statsLabel);
        statsLabel.setPosition(200, 20, 0);
        
        // 調試信息標籤
        if (this.showDebugInfo) {
            const debugLabel = this.createLabel('Debug_Info_Label', '調試模式已啟用', 16);
            statusContainer.addChild(debugLabel);
            debugLabel.setPosition(0, -20, 0);
            const debugLabelComponent = debugLabel.getComponent(Label);
            debugLabelComponent.color = new Color(150, 150, 150);
        }
        
        // 保存引用到節點
        this.node['connectionStatusLabel'] = connectionLabel.getComponent(Label);
        this.node['gameStatsLabel'] = statsLabel.getComponent(Label);
    }

    /**
     * 創建標籤輔助方法
     */
    private createLabel(name: string, text: string, fontSize: number): Node {
        const labelNode = new Node(name);
        
        const labelComponent = labelNode.addComponent(Label);
        labelComponent.string = text;
        labelComponent.fontSize = fontSize;
        labelComponent.color = this.textColor;
        
        const labelTransform = labelNode.addComponent(UITransform);
        labelTransform.setContentSize(300, fontSize + 10);
        
        return labelNode;
    }

    /**
     * 創建按鈕輔助方法
     */
    private createButton(name: string, text: string, color: Color): Node {
        const buttonNode = new Node(name);
        
        // 按鈕背景
        const buttonSprite = buttonNode.addComponent(Sprite);
        buttonSprite.color = color;
        
        const buttonTransform = buttonNode.addComponent(UITransform);
        buttonTransform.setContentSize(120, 60);
        
        // 按鈕組件
        const buttonComponent = buttonNode.addComponent(Button);
        buttonComponent.transition = Button.Transition.SCALE;
        buttonComponent.zoomScale = 0.9;
        
        // 按鈕文字
        const labelNode = new Node('Button_Label');
        buttonNode.addChild(labelNode);
        
        const labelComponent = labelNode.addComponent(Label);
        labelComponent.string = text;
        labelComponent.fontSize = 24;
        labelComponent.color = this.textColor;
        
        const labelTransform = labelNode.addComponent(UITransform);
        labelTransform.setContentSize(120, 60);
        
        return buttonNode;
    }

    /**
     * 設置MVVM架構並連接服務器
     */
    private setupMVVMAndConnect(): void {
        console.log('[場景設置] 開始設置MVVM架構...');
        
        // 創建GameView組件
        this.gameView = this.node.addComponent(GameView);
        
        // 綁定UI元素到GameView
        this.bindUIToGameView();
        
        // 初始化GameView（這會自動創建ViewModel和Model）
        this.gameView.initializeGame();
        
        console.log('[場景設置] MVVM架構設置完成');
    }

    /**
     * 綁定UI元素到GameView
     */
    private bindUIToGameView(): void {
        if (!this.gameView) return;
        
        // 綁定UI元素引用
        this.gameView.playerScoreLabel = this.node['playerScoreLabel'];
        this.gameView.dealerScoreLabel = this.node['dealerScoreLabel'];
        this.gameView.gameResultLabel = this.node['gameResultLabel'];
        this.gameView.hitButton = this.node['hitButton'];
        this.gameView.standButton = this.node['standButton'];
        this.gameView.restartButton = this.node['restartButton'];
        this.gameView.connectionStatusLabel = this.node['connectionStatusLabel'];
        
        console.log('[場景設置] UI元素綁定完成');
    }

    /**
     * 手動初始化場景（在編輯器中調用）
     */
    public manualSetup(): void {
        console.log('[場景設置] 執行手動設置...');
        this.createCompleteUI();
        this.setupMVVMAndConnect();
    }

    /**
     * 獲取GameView實例
     */
    public getGameView(): GameView {
        return this.gameView;
    }

    /**
     * 獲取遊戲統計信息
     */
    public getGameStats(): any {
        if (this.gameView && this.gameView['viewModel']) {
            return this.gameView['viewModel'].gameStats;
        }
        return null;
    }

    /**
     * 重置遊戲場景
     */
    public resetScene(): void {
        console.log('[場景設置] 重置遊戲場景...');
        
        if (this.gameView) {
            this.gameView.resetGame();
        }
        
        // 重置UI顯示
        if (this.node['gameResultLabel']) {
            this.node['gameResultLabel'].string = '';
        }
    }
}
