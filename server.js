const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let deck = [];

function initializeDeck() {
    deck = [];
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    for (const suit of suits) {
        for (const value of values) {
            deck.push({ suit, value });
        }
    }
    deck = deck.sort(() => Math.random() - 0.5); // Shuffle deck
}

function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    for (const card of hand) {
        if (['J', 'Q', 'K'].includes(card.value)) {
            score += 10;
        } else if (card.value === 'A') {
            aces += 1;
            score += 11;
        } else {
            score += parseInt(card.value);
        }
    }
    while (score > 21 && aces > 0) {
        score -= 10;
        aces -= 1;
    }
    return score;
}

wss.on('connection', (ws) => {
    console.log('A user connected');
    let playerHand = [];
    let dealerHand = [];

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.action === 'startGame') {
                initializeDeck();
                playerHand = [deck.pop(), deck.pop()];
                dealerHand = [deck.pop(), deck.pop()];

                ws.send(JSON.stringify({
                    action: 'updateGameState',
                    playerHand,
                    dealerHand: [dealerHand[0], { suit: 'Hidden', value: 'Hidden' }],
                    playerScore: calculateScore(playerHand),
                    dealerScore: calculateScore([dealerHand[0]]),
                }));
            }
            
            else if (data.action === 'playerHit') {
                playerHand.push(deck.pop());
                const playerScore = calculateScore(playerHand);

                if (playerScore > 21) {
                    ws.send(JSON.stringify({
                        action: 'gameOver',
                        result: 'Dealer Wins!',
                        playerHand,
                        playerScore
                    }));
                } else {
                    ws.send(JSON.stringify({
                        action: 'updateGameState',
                        playerHand,
                        playerScore
                    }));
                }
            }
            
            else if (data.action === 'playerStand') {
                while (calculateScore(dealerHand) < 17) {
                    dealerHand.push(deck.pop());
                }
                const playerScore = calculateScore(playerHand);
                const dealerScore = calculateScore(dealerHand);

                let result = '';
                if (dealerScore > 21 || playerScore > dealerScore) {
                    result = 'Player Wins!';
                } else {
                    result = 'Dealer Wins!';
                }

                ws.send(JSON.stringify({
                    action: 'gameOver',
                    result,
                    playerHand,
                    dealerHand,
                    playerScore,
                    dealerScore
                }));
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('A user disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
