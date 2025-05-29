/**
 * 21點遊戲場景管理器
 * 負責初始化整個遊戲場景和UI元件
 */

import { _decorator, Component, Node, Label, Button, Sprite, Canvas, UITransform, Widget, director } from 'cc';
import { GameView } from './GameView';

const { ccclass, property } = _decorator;

/**
 * 21點遊戲場景控制器
 * 整合MVVM架構到Cocos Creator UI系統
 */
@ccclass('BlackjackScene')
export class BlackjackScene extends Component {
    
    // 主要容器節點
    @property(Node)
    gameContainer: Node = null;
    
    // UI面板節點
    @property(Node)
    uiPanel: Node = null;
    
    // 遊戲區域節點
    @property(Node)
    gameArea: Node = null;
    
    // 控制面板節點
    @property(Node)
    controlPanel: Node = null;
    
    // 狀態面板節點
    @property(Node)
    statusPanel: Node = null;

    /**
     * 場景開始時初始化
     */
    start() {
        console.log('🎮 初始化21點遊戲場景');
        this.initializeScene();
    }

    /**
     * 初始化場景結構
     */
    private initializeScene(): void {
        // 如果沒有手動配置UI，則自動創建
        if (!this.gameContainer) {
            this.createGameUI();
        }
        
        // 設置GameView組件
        this.setupGameView();
        
        console.log('✅ 場景初始化完成');
    }

    /**
     * 創建遊戲UI結構
     */
    private createGameUI(): void {
        console.log('🏗️ 自動創建遊戲UI結構');
        
        // 獲取Canvas節點
        const canvas = this.node.getComponent(Canvas);
        if (!canvas) {
            console.error('❌ 未找到Canvas組件');
            return;
        }

        // 創建主容器
        this.gameContainer = this.createUINode('GameContainer', this.node);
        this.setupFullScreenNode(this.gameContainer);
        
        // 創建UI面板
        this.uiPanel = this.createUINode('UIPanel', this.gameContainer);
        this.setupFullScreenNode(this.uiPanel);
        
        // 創建遊戲區域
        this.gameArea = this.createUINode('GameArea', this.uiPanel);
        this.setupGameArea(this.gameArea);
        
        // 創建控制面板
        this.controlPanel = this.createUINode('ControlPanel', this.uiPanel);
        this.setupControlPanel(this.controlPanel);
        
        // 創建狀態面板
        this.statusPanel = this.createUINode('StatusPanel', this.uiPanel);
        this.setupStatusPanel(this.statusPanel);
    }

    /**
     * 創建UI節點
     */
    private createUINode(name: string, parent: Node): Node {
        const node = new Node(name);
        parent.addChild(node);
        
        // 添加UITransform組件
        const uiTransform = node.addComponent(UITransform);
        
        return node;
    }

    /**
     * 設置全屏節點
     */
    private setupFullScreenNode(node: Node): void {
        const uiTransform = node.getComponent(UITransform);
        const widget = node.addComponent(Widget);
        
        // 設置為全屏
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.top = 0;
        widget.bottom = 0;
        widget.left = 0;
        widget.right = 0;
        
        widget.updateAlignment();
    }

    /**
     * 設置遊戲區域
     */
    private setupGameArea(node: Node): void {
        const uiTransform = node.getComponent(UITransform);
        const widget = node.addComponent(Widget);
        
        // 設置為上半部分
        widget.isAlignTop = true;
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.top = 50;
        widget.left = 50;
        widget.right = 50;
        
        uiTransform.height = 400;
        widget.updateAlignment();
        
        // 創建分數顯示區域
        this.createScoreArea(node);
    }

    /**
     * 創建分數顯示區域
     */
    private createScoreArea(parent: Node): void {
        // 玩家分數區域
        const playerArea = this.createUINode('PlayerArea', parent);
        const playerAreaWidget = playerArea.addComponent(Widget);
        playerAreaWidget.isAlignTop = true;
        playerAreaWidget.isAlignLeft = true;
        playerAreaWidget.isAlignRight = true;
        playerAreaWidget.top = 20;
        playerAreaWidget.left = 20;
        playerAreaWidget.right = 20;
        playerArea.getComponent(UITransform).height = 80;
        playerAreaWidget.updateAlignment();
        
        // 玩家分數標籤
        const playerScoreNode = this.createUINode('PlayerScoreLabel', playerArea);
        const playerScoreLabel = playerScoreNode.addComponent(Label);
        playerScoreLabel.string = '玩家: 0';
        playerScoreLabel.fontSize = 24;
        this.setupCenterLabel(playerScoreNode);
        
        // 莊家分數區域
        const dealerArea = this.createUINode('DealerArea', parent);
        const dealerAreaWidget = dealerArea.addComponent(Widget);
        dealerAreaWidget.isAlignBottom = true;
        dealerAreaWidget.isAlignLeft = true;
        dealerAreaWidget.isAlignRight = true;
        dealerAreaWidget.bottom = 20;
        dealerAreaWidget.left = 20;
        dealerAreaWidget.right = 20;
        dealerArea.getComponent(UITransform).height = 80;
        dealerAreaWidget.updateAlignment();
        
        // 莊家分數標籤
        const dealerScoreNode = this.createUINode('DealerScoreLabel', dealerArea);
        const dealerScoreLabel = dealerScoreNode.addComponent(Label);
        dealerScoreLabel.string = '莊家: 0';
        dealerScoreLabel.fontSize = 24;
        this.setupCenterLabel(dealerScoreNode);
    }

    /**
     * 設置控制面板
     */
    private setupControlPanel(node: Node): void {
        const uiTransform = node.getComponent(UITransform);
        const widget = node.addComponent(Widget);
        
        // 設置為中間部分
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.left = 50;
        widget.right = 50;
        
        uiTransform.height = 120;
        uiTransform.width = 600;
        
        // 垂直居中
        widget.alignMode = Widget.AlignMode.ONCE;
        widget.verticalCenter = -50;
        widget.updateAlignment();
        
        // 創建按鈕
        this.createControlButtons(node);
    }

    /**
     * 創建控制按鈕
     */
    private createControlButtons(parent: Node): void {
        const buttonContainer = this.createUINode('ButtonContainer', parent);
        this.setupFullScreenNode(buttonContainer);
        
        // 要牌按鈕
        const hitButton = this.createButton('HitButton', '要牌', buttonContainer);
        const hitWidget = hitButton.addComponent(Widget);
        hitWidget.isAlignLeft = true;
        hitWidget.left = 50;
        hitWidget.alignMode = Widget.AlignMode.ONCE;
        hitWidget.verticalCenter = 0;
        hitWidget.updateAlignment();
        
        // 停牌按鈕
        const standButton = this.createButton('StandButton', '停牌', buttonContainer);
        const standWidget = standButton.addComponent(Widget);
        standWidget.alignMode = Widget.AlignMode.ONCE;
        standWidget.horizontalCenter = 0;
        standWidget.verticalCenter = 0;
        standWidget.updateAlignment();
        
        // 重新開始按鈕
        const restartButton = this.createButton('RestartButton', '重新開始', buttonContainer);
        const restartWidget = restartButton.addComponent(Widget);
        restartWidget.isAlignRight = true;
        restartWidget.right = 50;
        restartWidget.alignMode = Widget.AlignMode.ONCE;
        restartWidget.verticalCenter = 0;
        restartWidget.updateAlignment();
    }

    /**
     * 創建按鈕
     */
    private createButton(name: string, text: string, parent: Node): Node {
        const buttonNode = this.createUINode(name, parent);
        const button = buttonNode.addComponent(Button);
        
        // 設置按鈕大小
        const uiTransform = buttonNode.getComponent(UITransform);
        uiTransform.width = 120;
        uiTransform.height = 60;
        
        // 創建按鈕背景（可選，如果需要視覺效果）
        const sprite = buttonNode.addComponent(Sprite);
        // sprite.spriteFrame = backgroundSpriteFrame; // 需要設置背景圖片
        
        // 創建按鈕文字
        const labelNode = this.createUINode('Label', buttonNode);
        const label = labelNode.addComponent(Label);
        label.string = text;
        label.fontSize = 18;
        this.setupCenterLabel(labelNode);
        
        return buttonNode;
    }

    /**
     * 設置狀態面板
     */
    private setupStatusPanel(node: Node): void {
        const uiTransform = node.getComponent(UITransform);
        const widget = node.addComponent(Widget);
        
        // 設置為底部
        widget.isAlignBottom = true;
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.bottom = 20;
        widget.left = 50;
        widget.right = 50;
        
        uiTransform.height = 100;
        widget.updateAlignment();
        
        // 創建狀態標籤
        this.createStatusLabels(node);
    }

    /**
     * 創建狀態標籤
     */
    private createStatusLabels(parent: Node): void {
        // 遊戲結果標籤
        const resultNode = this.createUINode('GameResultLabel', parent);
        const resultLabel = resultNode.addComponent(Label);
        resultLabel.string = '';
        resultLabel.fontSize = 20;
        const resultWidget = resultNode.addComponent(Widget);
        resultWidget.isAlignTop = true;
        resultWidget.isAlignLeft = true;
        resultWidget.isAlignRight = true;
        resultWidget.top = 10;
        resultWidget.left = 20;
        resultWidget.right = 20;
        resultNode.getComponent(UITransform).height = 30;
        resultWidget.updateAlignment();
        
        // 連接狀態標籤
        const statusNode = this.createUINode('ConnectionStatusLabel', parent);
        const statusLabel = statusNode.addComponent(Label);
        statusLabel.string = '伺服器狀態: 未連接';
        statusLabel.fontSize = 16;
        const statusWidget = statusNode.addComponent(Widget);
        statusWidget.isAlignBottom = true;
        statusWidget.isAlignLeft = true;
        statusWidget.isAlignRight = true;
        statusWidget.bottom = 10;
        statusWidget.left = 20;
        statusWidget.right = 20;
        statusNode.getComponent(UITransform).height = 25;
        statusWidget.updateAlignment();
    }

    /**
     * 設置居中標籤
     */
    private setupCenterLabel(node: Node): void {
        const widget = node.addComponent(Widget);
        widget.alignMode = Widget.AlignMode.ONCE;
        widget.horizontalCenter = 0;
        widget.verticalCenter = 0;
        widget.updateAlignment();
    }

    /**
     * 設置GameView組件
     */
    private setupGameView(): void {
        console.log('🎯 設置GameView組件');
        
        // 在gameContainer上添加GameView組件
        let gameView = this.gameContainer.getComponent(GameView);
        if (!gameView) {
            gameView = this.gameContainer.addComponent(GameView);
        }
        
        // 自動綁定UI元素
        this.bindUIElements(gameView);
        
        console.log('✅ GameView組件設置完成');
    }

    /**
     * 綁定UI元素到GameView組件
     */
    private bindUIElements(gameView: GameView): void {
        // 尋找並綁定UI元素
        gameView.playerScoreLabel = this.findChildComponent('PlayerScoreLabel', Label);
        gameView.dealerScoreLabel = this.findChildComponent('DealerScoreLabel', Label);
        gameView.hitButton = this.findChildNode('HitButton');
        gameView.standButton = this.findChildNode('StandButton');
        gameView.restartButton = this.findChildNode('RestartButton');
        gameView.gameResultLabel = this.findChildComponent('GameResultLabel', Label);
        gameView.connectionStatusLabel = this.findChildComponent('ConnectionStatusLabel', Label);
        
        console.log('🔗 UI元素綁定完成:', {
            playerScoreLabel: !!gameView.playerScoreLabel,
            dealerScoreLabel: !!gameView.dealerScoreLabel,
            hitButton: !!gameView.hitButton,
            standButton: !!gameView.standButton,
            restartButton: !!gameView.restartButton,
            gameResultLabel: !!gameView.gameResultLabel,
            connectionStatusLabel: !!gameView.connectionStatusLabel
        });
    }

    /**
     * 遞歸尋找子節點
     */
    private findChildNode(name: string, root?: Node): Node {
        const searchRoot = root || this.node;
        
        // 廣度優先搜索
        const queue: Node[] = [searchRoot];
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (current.name === name) {
                return current;
            }
            
            for (const child of current.children) {
                queue.push(child);
            }
        }
        
        console.warn(`⚠️ 未找到節點: ${name}`);
        return null;
    }

    /**
     * 尋找子節點上的組件
     */
    private findChildComponent<T extends Component>(name: string, componentClass: any): T {
        const node = this.findChildNode(name);
        if (node) {
            return node.getComponent(componentClass) as T;
        }
        return null;
    }

    /**
     * 獲取遊戲統計信息（用於調試）
     */
    public getGameStats(): any {
        const gameView = this.gameContainer?.getComponent(GameView);
        if (gameView && gameView.getGameStats) {
            return gameView.getGameStats();
        }
        return null;
    }

    /**
     * 手動重連（用於調試）
     */
    public reconnect(): void {
        const gameView = this.gameContainer?.getComponent(GameView);
        if (gameView) {
            console.log('🔄 手動重新連接...');
            // 如果GameView有重連方法，在這裡調用
        }
    }
}
