/**
 * SinglePlayerTestScene.ts
 * 
 * 這是一個測試場景創建器，用於快速創建和配置單人遊戲測試場景
 */

import { _decorator, Component, Node, director, instantiate, Label, Button, Prefab, UITransform, Layout, Vec3, Color, EditBox } from 'cc';
import { SinglePlayerGameView } from './SinglePlayerGameView';

const { ccclass, property } = _decorator;

/**
 * 單人遊戲測試場景創建器
 */
@ccclass('SinglePlayerTestScene')
export class SinglePlayerTestScene extends Component {
    @property({
        tooltip: '是否在啟動時自動創建場景'
    })
    autoCreate: boolean = true;

    @property({
        tooltip: '是否自動連接到伺服器'
    })
    autoConnect: boolean = true;

    @property({
        tooltip: '自定義伺服器URL'
    })
    serverUrl: string = 'ws://localhost:3000';

    @property({
        tooltip: '調試模式'
    })
    debugMode: boolean = false;

    @property({
        tooltip: '測試玩家姓名'
    })
    testPlayerName: string = '測試玩家';

    @property({
        tooltip: '冷卻時間（分鐘）'
    })
    cooldownMinutes: number = 5;

    start() {
        if (this.autoCreate) {
            this.createTestScene();
        }
    }

    /**
     * 創建測試場景
     */
    public createTestScene(): void {
        console.log('📝 正在創建單人遊戲測試場景...');
        
        // 1. 創建主UI容器
        const mainContainer = this.createContainer('MainContainer', 0, 0, 800, 600);
        this.node.addChild(mainContainer);
        
        // 2. 創建頂部區域 (標題和連接狀態)
        const topArea = this.createContainer('TopArea', 0, 200, 700, 100);
        mainContainer.addChild(topArea);
        
        const titleLabel = this.createLabel('TitleLabel', '21點單人遊戲', 40);
        titleLabel.position = new Vec3(-150, 0, 0);
        topArea.addChild(titleLabel);
        
        const connectionLabel = this.createLabel('ConnectionLabel', '未連接', 24);
        connectionLabel.position = new Vec3(200, 0, 0);
        connectionLabel.getComponent(Label).color = new Color(255, 100, 100, 255);
        topArea.addChild(connectionLabel);
        
        // 3. 創建分數區域
        const scoreArea = this.createContainer('ScoreArea', 0, 100, 700, 80);
        mainContainer.addChild(scoreArea);
        
        const playerScoreLabel = this.createLabel('PlayerScore', '玩家: 0', 30);
        playerScoreLabel.position = new Vec3(-150, 0, 0);
        scoreArea.addChild(playerScoreLabel);
        
        const dealerScoreLabel = this.createLabel('DealerScore', '莊家: 0', 30);
        dealerScoreLabel.position = new Vec3(150, 0, 0);
        scoreArea.addChild(dealerScoreLabel);
        
        // 4. 創建姓名區域
        const nameArea = this.createContainer('NameArea', 0, 0, 700, 100);
        mainContainer.addChild(nameArea);
        
        const playerNameLabel = this.createLabel('PlayerNameLabel', this.testPlayerName, 28);
        playerNameLabel.position = new Vec3(-200, 25, 0);
        nameArea.addChild(playerNameLabel);
        
        const nameInput = this.createEditBox('NameInput', '輸入新的姓名', 28);
        nameInput.position = new Vec3(0, 25, 0);
        nameArea.addChild(nameInput);
        
        const updateNameButton = this.createButton('UpdateNameButton', '更新姓名', 24);
        updateNameButton.position = new Vec3(200, 25, 0);
        nameArea.addChild(updateNameButton);
        
        const cooldownLabel = this.createLabel('CooldownLabel', '冷卻結束', 20);
        cooldownLabel.position = new Vec3(0, -20, 0);
        cooldownLabel.getComponent(Label).color = new Color(100, 100, 255, 255);
        nameArea.addChild(cooldownLabel);
        
        // 5. 創建按鈕區域
        const buttonArea = this.createContainer('ButtonArea', 0, -100, 700, 100);
        mainContainer.addChild(buttonArea);
        
        const hitButton = this.createButton('HitButton', '要牌', 28);
        hitButton.position = new Vec3(-150, 0, 0);
        buttonArea.addChild(hitButton);
        
        const standButton = this.createButton('StandButton', '停牌', 28);
        standButton.position = new Vec3(0, 0, 0);
        buttonArea.addChild(standButton);
        
        const restartButton = this.createButton('RestartButton', '重新開始', 28);
        restartButton.position = new Vec3(150, 0, 0);
        buttonArea.addChild(restartButton);
        
        // 6. 創建結果區域
        const resultArea = this.createContainer('ResultArea', 0, -200, 700, 80);
        mainContainer.addChild(resultArea);
        
        const gameResultLabel = this.createLabel('GameResultLabel', '', 32);
        gameResultLabel.getComponent(Label).color = new Color(50, 200, 50, 255);
        resultArea.addChild(gameResultLabel);
        
        // 7. 添加SinglePlayerGameView組件
        const gameView = mainContainer.addComponent(SinglePlayerGameView);
        
        // 8. 設置組件引用
        gameView.playerScoreLabel = playerScoreLabel.getComponent(Label);
        gameView.dealerScoreLabel = dealerScoreLabel.getComponent(Label);
        gameView.playerNameLabel = playerNameLabel.getComponent(Label);
        gameView.cooldownLabel = cooldownLabel.getComponent(Label);
        gameView.connectionStatusLabel = connectionLabel.getComponent(Label);
        gameView.gameResultLabel = gameResultLabel.getComponent(Label);
        
        gameView.hitButton = hitButton;
        gameView.standButton = standButton;
        gameView.restartButton = restartButton;
        gameView.nameInputField = nameInput;
        gameView.updateNameButton = updateNameButton;
        gameView.nameInputArea = nameArea;
        
        // 9. 設置冷卻時間
        gameView.nameUpdateCooldownMinutes = this.cooldownMinutes;
        
        console.log('✅ 單人遊戲測試場景創建成功！');
        
        // 輸出調試信息
        if (this.debugMode) {
            this.logDebugInfo(gameView);
        }
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
     * 創建標籤節點
     */
    private createLabel(name: string, text: string, size: number): Node {
        const labelNode = new Node(name);
        const label = labelNode.addComponent(Label);
        label.string = text;
        label.fontSize = size;
        const transform = labelNode.getComponent(UITransform) || labelNode.addComponent(UITransform);
        transform.setContentSize(200, 50);
        return labelNode;
    }
    
    /**
     * 創建按鈕節點
     */
    private createButton(name: string, text: string, size: number): Node {
        const buttonNode = new Node(name);
        const button = buttonNode.addComponent(Button);
        const label = this.createLabel(`${name}Label`, text, size);
        label.position = Vec3.ZERO;
        buttonNode.addChild(label);
        const transform = buttonNode.getComponent(UITransform) || buttonNode.addComponent(UITransform);
        transform.setContentSize(120, 60);
        return buttonNode;
    }
    
    /**
     * 創建輸入框節點
     */
    private createEditBox(name: string, placeholder: string, size: number): Node {
        const editBoxNode = new Node(name);
        const editBox = editBoxNode.addComponent(EditBox);
        editBox.placeholder = placeholder;
        // 使用間接方式設置字體大小（EditBox API可能在不同版本中有所不同）
        if (editBox['fontSize'] !== undefined) {
            editBox['fontSize'] = size;
        } else if (editBox['textLabel'] && editBox['textLabel']['fontSize'] !== undefined) {
            editBox['textLabel']['fontSize'] = size;
        }
        const transform = editBoxNode.getComponent(UITransform) || editBoxNode.addComponent(UITransform);
        transform.setContentSize(200, 40);
        return editBoxNode;
    }
    
    /**
     * 輸出調試信息
     */
    private logDebugInfo(gameView: SinglePlayerGameView): void {
        console.log('🔍 調試信息:');
        console.log('- 冷卻時間設置: ' + this.cooldownMinutes + '分鐘');
        console.log('- 自動連接伺服器: ' + this.autoConnect);
        console.log('- 伺服器URL: ' + this.serverUrl);
        console.log('- 組件引用: ', {
            playerScoreLabel: !!gameView.playerScoreLabel,
            dealerScoreLabel: !!gameView.dealerScoreLabel,
            playerNameLabel: !!gameView.playerNameLabel,
            cooldownLabel: !!gameView.cooldownLabel,
            hitButton: !!gameView.hitButton,
            standButton: !!gameView.standButton,
            restartButton: !!gameView.restartButton,
            nameInputField: !!gameView.nameInputField,
            updateNameButton: !!gameView.updateNameButton
        });
    }
}