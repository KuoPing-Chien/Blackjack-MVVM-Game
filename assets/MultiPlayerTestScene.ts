/**
 * MultiPlayerTestScene.ts
 * 
 * 這是一個測試場景創建器，用於快速創建和配置多人遊戲測試場景
 * 以展示玩家手牌和遊戲狀態
 */

import { _decorator, Component, Node, UITransform, Label, Button, EditBox, Vec3, Color, Prefab, instantiate } from 'cc';
import { MultiPlayerGameView } from './MultiPlayerGameView';

const { ccclass, property } = _decorator;

/**
 * 多人遊戲測試場景
 */
@ccclass('MultiPlayerTestScene')
export class MultiPlayerTestScene extends Component {
    
    @property({
        tooltip: '是否在啟動時自動創建場景'
    })
    autoCreate: boolean = true;

    @property({
        tooltip: '調試模式'
    })
    debugMode: boolean = false;

    @property({
        tooltip: '伺服器URL'
    })
    serverUrl: string = 'ws://localhost:3000';

    @property({
        tooltip: '卡牌顯示區域高度'
    })
    cardsAreaHeight: number = 150;

    start() {
        if (this.autoCreate) {
            this.createMultiPlayerScene();
        }
    }

    /**
     * 創建多人遊戲測試場景
     */
    public createMultiPlayerScene(): void {
        console.log('📝 正在創建多人遊戲測試場景...');
        
        // 1. 創建主UI容器
        const mainContainer = this.createContainer('MainContainer', 0, 0, 900, 650);
        this.node.addChild(mainContainer);
        
        // 2. 創建頂部狀態區域
        const topArea = this.createContainer('TopArea', 0, 250, 850, 50);
        mainContainer.addChild(topArea);
        
        const titleLabel = this.createLabel('TitleLabel', '21點多人遊戲', 36);
        titleLabel.position = new Vec3(-300, 0, 0);
        topArea.addChild(titleLabel);
        
        const connectionLabel = this.createLabel('ConnectionStatus', '未連接', 24);
        connectionLabel.position = new Vec3(0, 0, 0);
        connectionLabel.getComponent(Label).color = new Color(255, 100, 100, 255);
        topArea.addChild(connectionLabel);
        
        const gameStatusLabel = this.createLabel('GameStatus', '等待玩家加入...', 24);
        gameStatusLabel.position = new Vec3(300, 0, 0);
        topArea.addChild(gameStatusLabel);
        
        // 3. 創建玩家信息區域
        const playerInfoArea = this.createContainer('PlayerInfoArea', 0, 180, 850, 60);
        mainContainer.addChild(playerInfoArea);
        
        const player1InfoLabel = this.createLabel('Player1Info', '玩家1: 等待中', 24);
        player1InfoLabel.position = new Vec3(-300, 0, 0);
        playerInfoArea.addChild(player1InfoLabel);
        
        const player2InfoLabel = this.createLabel('Player2Info', '玩家2: 等待中', 24);
        player2InfoLabel.position = new Vec3(0, 0, 0);
        playerInfoArea.addChild(player2InfoLabel);
        
        const dealerInfoLabel = this.createLabel('DealerInfo', '莊家: 0分', 24);
        dealerInfoLabel.position = new Vec3(300, 0, 0);
        playerInfoArea.addChild(dealerInfoLabel);
        
        // 4. 創建當前玩家指示區域
        const currentPlayerArea = this.createContainer('CurrentPlayerArea', 0, 140, 850, 40);
        mainContainer.addChild(currentPlayerArea);
        
        const currentPlayerLabel = this.createLabel('CurrentPlayerLabel', '等待遊戲開始...', 26);
        currentPlayerLabel.getComponent(Label).color = new Color(255, 180, 0, 255);
        currentPlayerArea.addChild(currentPlayerLabel);
        
        // 5. 創建手牌區域
        
        // 5.1 我的手牌區域
        const myCardsArea = this.createContainer('MyCardsArea', 0, 70, 850, this.cardsAreaHeight);
        mainContainer.addChild(myCardsArea);
        
        const myCardsLabel = this.createLabel('MyCards', '我的牌: 尚未發牌', 22);
        myCardsLabel.getComponent(Label).color = new Color(120, 200, 120, 255);
        myCardsArea.addChild(myCardsLabel);
        
        // 5.2 玩家1手牌區域
        const player1CardsArea = this.createContainer('Player1CardsArea', -300, -20, 260, this.cardsAreaHeight);
        mainContainer.addChild(player1CardsArea);
        
        const player1CardsLabel = this.createLabel('Player1Cards', '玩家1的牌: 尚未發牌', 20);
        player1CardsArea.addChild(player1CardsLabel);
        
        // 5.3 玩家2手牌區域
        const player2CardsArea = this.createContainer('Player2CardsArea', 0, -20, 260, this.cardsAreaHeight);
        mainContainer.addChild(player2CardsArea);
        
        const player2CardsLabel = this.createLabel('Player2Cards', '玩家2的牌: 尚未發牌', 20);
        player2CardsArea.addChild(player2CardsLabel);
        
        // 5.4 莊家手牌區域
        const dealerCardsArea = this.createContainer('DealerCardsArea', 300, -20, 260, this.cardsAreaHeight);
        mainContainer.addChild(dealerCardsArea);
        
        const dealerCardsLabel = this.createLabel('DealerCards', '莊家的牌: 尚未發牌', 20);
        dealerCardsArea.addChild(dealerCardsLabel);
        
        // 6. 創建遊戲控制區域
        
        // 6.1 加入遊戲區域
        const joinGameArea = this.createContainer('JoinGameArea', 0, -120, 850, 60);
        mainContainer.addChild(joinGameArea);
        
        const nameInput = this.createEditBox('NameInput', '請輸入玩家姓名', 24);
        nameInput.position = new Vec3(-150, 0, 0);
        joinGameArea.addChild(nameInput);
        
        const joinButton = this.createButton('JoinButton', '加入遊戲', 24);
        joinButton.position = new Vec3(150, 0, 0);
        joinGameArea.addChild(joinButton);
        
        // 6.2 遊戲操作區域
        const gameControlArea = this.createContainer('GameControlArea', 0, -180, 850, 60);
        mainContainer.addChild(gameControlArea);
        
        const hitButton = this.createButton('HitButton', '要牌', 24);
        hitButton.position = new Vec3(-200, 0, 0);
        gameControlArea.addChild(hitButton);
        
        const standButton = this.createButton('StandButton', '停牌', 24);
        standButton.position = new Vec3(0, 0, 0);
        gameControlArea.addChild(standButton);
        
        const startButton = this.createButton('StartButton', '開始遊戲', 24);
        startButton.position = new Vec3(200, 0, 0);
        gameControlArea.addChild(startButton);
        
        // 7. 創建結果區域
        const resultArea = this.createContainer('ResultArea', 0, -250, 850, 60);
        mainContainer.addChild(resultArea);
        
        const resultLabel = this.createLabel('GameResult', '', 26);
        resultLabel.getComponent(Label).color = new Color(50, 200, 50, 255);
        resultArea.addChild(resultLabel);
        
        // 8. 添加遊戲控制組件
        const gameView = mainContainer.addComponent(MultiPlayerGameView);
        
        // 9. 設置組件引用
        gameView.playerNameInput = nameInput.getComponent(EditBox);
        gameView.joinGameButton = joinButton;
        gameView.startGameButton = startButton;
        gameView.hitButton = hitButton;
        gameView.standButton = standButton;
        gameView.player1InfoLabel = player1InfoLabel.getComponent(Label);
        gameView.player2InfoLabel = player2InfoLabel.getComponent(Label);
        gameView.dealerInfoLabel = dealerInfoLabel.getComponent(Label);
        gameView.currentPlayerLabel = currentPlayerLabel.getComponent(Label);
        gameView.gameResultLabel = resultLabel.getComponent(Label);
        gameView.connectionStatusLabel = connectionLabel.getComponent(Label);
        gameView.gameStatusLabel = gameStatusLabel.getComponent(Label);
        
        // 設置手牌顯示區域和標籤
        gameView.myCardsArea = myCardsArea;
        gameView.myCardsLabel = myCardsLabel.getComponent(Label);
        gameView.otherPlayersCardsArea = player1CardsArea;
        gameView.player1CardsLabel = player1CardsLabel.getComponent(Label);
        gameView.player2CardsLabel = player2CardsLabel.getComponent(Label);
        gameView.dealerCardsLabel = dealerCardsLabel.getComponent(Label);
        
        console.log('✅ 多人遊戲測試場景創建成功！');
        
        if (this.debugMode) {
            this.printDebugInfo(gameView);
        }
    }
    
    /**
     * 輸出調試信息
     */
    private printDebugInfo(gameView: MultiPlayerGameView): void {
        console.log('🔍 調試信息:');
        console.log('- 伺服器URL:', this.serverUrl);
        console.log('- UI元素引用狀態:');
        console.log('  - 玩家信息標籤:', !!gameView.player1InfoLabel, !!gameView.player2InfoLabel);
        console.log('  - 手牌顯示標籤:', !!gameView.myCardsLabel, !!gameView.player1CardsLabel, !!gameView.player2CardsLabel);
        console.log('  - 按鈕狀態:', !!gameView.hitButton, !!gameView.standButton, !!gameView.startGameButton, !!gameView.joinGameButton);
    }
    
    /**
     * 創建容器節點
     */
    private createContainer(name: string, x: number, y: number, width: number, height: number): Node {
        const container = new Node(name);
        const transform = container.addComponent(UITransform);
        transform.setContentSize(width, height);
        container.position = new Vec3(x, y, 0);
        return container;
    }
    
    /**
     * 創建標籤
     */
    private createLabel(name: string, text: string, size: number): Node {
        const labelNode = new Node(name);
        const label = labelNode.addComponent(Label);
        label.string = text;
        label.fontSize = size;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        
        const transform = labelNode.getComponent(UITransform) || labelNode.addComponent(UITransform);
        transform.setContentSize(240, 40);
        
        return labelNode;
    }
    
    /**
     * 創建按鈕
     */
    private createButton(name: string, text: string, size: number): Node {
        const buttonNode = new Node(name);
        const button = buttonNode.addComponent(Button);
        
        // 設置按鈕背景
        const background = new Node('Background');
        const bgTransform = background.addComponent(UITransform);
        bgTransform.setContentSize(150, 50);
        background.addComponent(Label).string = text;
        background.getComponent(Label).fontSize = size;
        buttonNode.addChild(background);
        
        return buttonNode;
    }
    
    /**
     * 創建編輯框
     */
    private createEditBox(name: string, placeholder: string, size: number): Node {
        const editBoxNode = new Node(name);
        const editBox = editBoxNode.addComponent(EditBox);
        
        editBox.placeholder = placeholder;
        
        // 使用索引訪問方式設置字體大小
        try {
            if (editBox['fontSize'] !== undefined) {
                editBox['fontSize'] = size;
            }
        } catch (e) {
            console.warn('設置EditBox字體大小失敗:', e);
        }
        
        const transform = editBoxNode.getComponent(UITransform) || editBoxNode.addComponent(UITransform);
        transform.setContentSize(260, 40);
        
        return editBoxNode;
    }
}