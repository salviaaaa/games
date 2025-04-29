let currentPlayer = 'X';
let gameMode = null;
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = false;
let player1Name = "Player 1";
let player2Name = "Player 2";

// Function to show game mode selection from cover
function showGameModeSelection() {
    document.getElementById('game-cover').classList.add('d-none');
    document.getElementById('mode-selection').classList.remove('d-none');
}

// Winning combinations
const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Start game with player names
function startGameWithNames(mode) {
    player1Name = document.getElementById('player1Name').value || "Player 1";
    player2Name = document.getElementById('player2Name').value || "Player 2";
    
    document.getElementById('player1').textContent = `${player1Name}: X`;
    
    if (mode === 'bot') {
        document.getElementById('player2').textContent = 'Bot: O';
    } else {
        document.getElementById('player2').textContent = `${player2Name}: O`;
    }
    
    startGame(mode);
}

function startGame(mode) {
    gameMode = mode;
    gameActive = true;
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    document.getElementById('mode-selection').classList.add('d-none');
    document.getElementById('game-board').classList.remove('d-none');
    document.getElementById('game-board').classList.remove('game-over');
    document.getElementById('status').textContent = `Turn: ${currentPlayer === 'X' ? player1Name : (gameMode === 'bot' ? 'Bot' : player2Name)}`;
    
    // Reset all cells
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });
}

function handleCellClick(index) {
    const cell = document.querySelector(`[data-index="${index}"]`);
    
    if (cell.textContent || !gameActive) return;
    
    makeMove(index);
    
    if (gameMode === 'bot' && gameActive && currentPlayer === 'O') {
        setTimeout(makeBotMove, 500);
    }
}

function makeMove(index) {
    gameBoard[index] = currentPlayer;
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    
    if (checkWin()) {
        const winner = currentPlayer === 'X' ? player1Name : (gameMode === 'bot' ? 'Bot' : player2Name);
        endGame(`${winner} Wins!`);
        return;
    }
    
    if (gameBoard.every(cell => cell !== '')) {
        endGame('Game Draw!');
        return;
    }
    
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    const nextPlayer = currentPlayer === 'X' ? player1Name : (gameMode === 'bot' ? 'Bot' : player2Name);
    document.getElementById('status').textContent = `Turn: ${nextPlayer}`;
}

function makeBotMove() {
    // Simple bot AI: First try to win, then block player, then random move
    let move = findWinningMove('O') || findWinningMove('X') || findRandomMove();
    if (move !== null) {
        makeMove(move);
    }
}

function findWinningMove(player) {
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = player;
            if (checkWin()) {
                gameBoard[i] = '';
                return i;
            }
            gameBoard[i] = '';
        }
    }
    return null;
}

function findRandomMove() {
    const emptyCells = gameBoard
        .map((cell, index) => cell === '' ? index : null)
        .filter(index => index !== null);
    
    return emptyCells.length > 0 ? 
        emptyCells[Math.floor(Math.random() * emptyCells.length)] : 
        null;
}

function checkWin() {
    return winningCombos.some(combo => {
        if (
            gameBoard[combo[0]] &&
            gameBoard[combo[0]] === gameBoard[combo[1]] &&
            gameBoard[combo[0]] === gameBoard[combo[2]]
        ) {
            // Highlight winning cells
            combo.forEach(index => {
                document.querySelector(`[data-index="${index}"]`)
                    .classList.add('winning-cell');
            });
            return true;
        }
        return false;
    });
}

function endGame(message) {
    gameActive = false;
    document.getElementById('status').textContent = message;
    document.getElementById('game-board').classList.add('game-over');
}

function resetGame() {
    startGame(gameMode);
}

function changeMode() {
    document.getElementById('game-board').classList.add('d-none');
    document.getElementById('mode-selection').classList.remove('d-none');
}

// Add click event listeners to all cells
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.cell').forEach((cell, index) => {
        cell.addEventListener('click', () => handleCellClick(index));
    });
});