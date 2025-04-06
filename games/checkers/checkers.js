let gameState = {
    board: [],
    currentPlayer: 1,
    selectedPiece: null,
    validMoves: [],
    gameMode: null,
    player1Name: '',
    player2Name: '',
    player1Score: 0,
    player2Score: 0,
    isGameOver: false
};

function initializeBoard() {
    gameState.board = Array(8).fill().map(() => Array(8).fill(null));
    
    // Menempatkan bidak pemain 1
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                gameState.board[row][col] = { player: 1, isKing: false };
            }
        }
    }
    
    // Menempatkan bidak pemain 2
    for (let row = 5; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if ((row + col) % 2 === 1) {
                gameState.board[row][col] = { player: 2, isKing: false };
            }
        }
    }
}

function showPlayerForm(mode) {
    gameState.gameMode = mode;
    document.getElementById('mode-selection').classList.add('d-none');
    document.getElementById('player-form').classList.remove('d-none');
    
    if (mode === 'friend') {
        document.getElementById('friend-mode-form').classList.remove('d-none');
        document.getElementById('bot-mode-form').classList.add('d-none');
    } else {
        document.getElementById('friend-mode-form').classList.add('d-none');
        document.getElementById('bot-mode-form').classList.remove('d-none');
    }
}

function backToModeSelection() {
    document.getElementById('player-form').classList.add('d-none');
    document.getElementById('mode-selection').classList.remove('d-none');
    document.getElementById('friend-mode-form').classList.remove('d-none');
    document.getElementById('bot-mode-form').classList.add('d-none');
}

function startGame() {
    if (gameState.gameMode === 'friend') {
        gameState.player1Name = document.getElementById('player1Name').value || 'Pemain 1';
        gameState.player2Name = document.getElementById('player2Name').value || 'Pemain 2';
    } else {
        gameState.player1Name = document.getElementById('playerName').value || 'Pemain';
        gameState.player2Name = 'Bot';
    }
    
    document.getElementById('player1Display').textContent = gameState.player1Name;
    document.getElementById('player2Display').textContent = gameState.player2Name;
    document.getElementById('player-form').classList.add('d-none');
    document.getElementById('game-container').classList.remove('d-none');
    
    initializeBoard();
    renderBoard();
    updateGameInfo();
}

function renderBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
            
            if (gameState.validMoves.some(move => move.row === row && move.col === col)) {
                square.classList.add('valid-move');
            }
            
            const piece = gameState.board[row][col];
            if (piece) {
                const pieceDiv = document.createElement('div');
                pieceDiv.className = `piece player${piece.player}${piece.isKing ? ' king' : ''}`;
                if (gameState.selectedPiece && gameState.selectedPiece.row === row && gameState.selectedPiece.col === col) {
                    pieceDiv.classList.add('selected');
                }
                square.appendChild(pieceDiv);
            }
            
            square.addEventListener('click', () => handleSquareClick(row, col));
            board.appendChild(square);
        }
    }
}

function handleSquareClick(row, col) {
    if (gameState.isGameOver) return;
    if (gameState.gameMode === 'bot' && gameState.currentPlayer === 2) return;
    
    const piece = gameState.board[row][col];
    
    if (piece && piece.player === gameState.currentPlayer) {
        gameState.selectedPiece = { row, col };
        gameState.validMoves = getValidMoves(row, col);
        renderBoard();
    } else if (gameState.selectedPiece && gameState.validMoves.some(move => move.row === row && move.col === col)) {
        movePiece(row, col);
        if (gameState.gameMode === 'bot' && !gameState.isGameOver) {
            setTimeout(makeBotMove, 500);
        }
    }
}

function getValidMoves(row, col) {
    const piece = gameState.board[row][col];
    const moves = [];
    
    if (!piece) return moves;
    
    const directions = piece.isKing ? [-1, 1] : piece.player === 1 ? [1] : [-1];
    
    for (const rowDir of directions) {
        for (const colDir of [-1, 1]) {
            // Gerakan normal
            const newRow = row + rowDir;
            const newCol = col + colDir;
            
            if (isValidPosition(newRow, newCol) && !gameState.board[newRow][newCol]) {
                moves.push({ row: newRow, col: newCol });
            }
            
            // Gerakan lompat
            const jumpRow = row + rowDir * 2;
            const jumpCol = col + colDir * 2;
            
            if (isValidPosition(jumpRow, jumpCol) && 
                !gameState.board[jumpRow][jumpCol] && 
                gameState.board[newRow][newCol] && 
                gameState.board[newRow][newCol].player !== piece.player) {
                moves.push({ row: jumpRow, col: jumpCol, isJump: true });
            }
        }
    }
    
    return moves;
}

function isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function movePiece(newRow, newCol) {
    const { row: oldRow, col: oldCol } = gameState.selectedPiece;
    const piece = gameState.board[oldRow][oldCol];
    
    // Pindahkan bidak
    gameState.board[newRow][newCol] = piece;
    gameState.board[oldRow][oldCol] = null;
    
    // Cek apakah ada bidak yang dilompati
    if (Math.abs(newRow - oldRow) === 2) {
        const jumpedRow = (newRow + oldRow) / 2;
        const jumpedCol = (newCol + oldCol) / 2;
        gameState.board[jumpedRow][jumpedCol] = null;
        
        // Tambah poin
        if (gameState.currentPlayer === 1) {
            gameState.player1Score++;
        } else {
            gameState.player2Score++;
        }
    }
    
    // Cek raja
    if ((piece.player === 1 && newRow === 7) || (piece.player === 2 && newRow === 0)) {
        piece.isKing = true;
    }
    
    // Ganti giliran
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    gameState.selectedPiece = null;
    gameState.validMoves = [];
    
    checkGameOver();
    updateGameInfo();
    renderBoard();
}

function updateGameInfo() {
    document.getElementById('currentPlayer').textContent = 
        gameState.currentPlayer === 1 ? gameState.player1Name : gameState.player2Name;
    document.getElementById('player1Score').textContent = gameState.player1Score;
    document.getElementById('player2Score').textContent = gameState.player2Score;
}

function checkGameOver() {
    let player1Pieces = 0;
    let player2Pieces = 0;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameState.board[row][col];
            if (piece) {
                if (piece.player === 1) player1Pieces++;
                else player2Pieces++;
            }
        }
    }
    
    if (player1Pieces === 0 || player2Pieces === 0) {
        gameState.isGameOver = true;
        const winner = player1Pieces > 0 ? gameState.player1Name : gameState.player2Name;
        alert(`Game Over! ${winner} menang!`);
    }
}

function makeBotMove() {
    let bestMove = null;
    let bestPiece = null;
    let maxScore = -Infinity;
    
    // Cari semua bidak bot
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameState.board[row][col];
            if (piece && piece.player === 2) {
                const moves = getValidMoves(row, col);
                for (const move of moves) {
                    let score = Math.random() * 10; // Faktor random untuk variasi
                    
                    // Prioritaskan gerakan lompat
                    if (move.isJump) score += 20;
                    
                    // Prioritaskan menjadi raja
                    if (move.row === 0) score += 15;
                    
                    if (score > maxScore) {
                        maxScore = score;
                        bestMove = move;
                        bestPiece = { row, col };
                    }
                }
            }
        }
    }
    
    if (bestMove && bestPiece) {
        gameState.selectedPiece = bestPiece;
        gameState.validMoves = getValidMoves(bestPiece.row, bestPiece.col);
        renderBoard();
        setTimeout(() => movePiece(bestMove.row, bestMove.col), 500);
    }
}

function resetGame() {
    gameState = {
        ...gameState,
        board: [],
        currentPlayer: 1,
        selectedPiece: null,
        validMoves: [],
        player1Score: 0,
        player2Score: 0,
        isGameOver: false
    };
    
    initializeBoard();
    renderBoard();
    updateGameInfo();
}