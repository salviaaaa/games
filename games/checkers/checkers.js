// Theme Toggle Functionality
const toggleSwitch = document.querySelector('#checkbox');
const currentTheme = localStorage.getItem('theme');

// Check for saved theme preference
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (toggleSwitch) toggleSwitch.checked = true;
    }
}

// Handle theme switch
if (toggleSwitch) {
    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });
}

// Game variables
let gameMode = '';
let board = [];
let selectedPiece = null;
let validMoves = [];
let currentPlayer = 'player1';
let player1Name = 'Player 1';
let player2Name = 'Player 2';
let player1Score = 0;
let player2Score = 0;
let botLevel = 1;

// Game sections
const gameCover = document.getElementById('game-cover');
const modeSelection = document.getElementById('mode-selection');
const playerForm = document.getElementById('player-form');
const friendModeForm = document.getElementById('friend-mode-form');
const botModeForm = document.getElementById('bot-mode-form');
const gameContainer = document.getElementById('game-container');

// Show mode selection screen
function showModeSelection() {
    gameCover.classList.add('d-none');
    modeSelection.classList.remove('d-none');
}

// Show player form based on selected mode
function showPlayerForm(mode) {
    gameMode = mode;
    modeSelection.classList.add('d-none');
    playerForm.classList.remove('d-none');
    
    if (mode === 'friend') {
        friendModeForm.classList.remove('d-none');
        botModeForm.classList.add('d-none');
    } else {
        friendModeForm.classList.add('d-none');
        botModeForm.classList.remove('d-none');
    }
}

// Go back to mode selection
function backToModeSelection() {
    playerForm.classList.add('d-none');
    modeSelection.classList.remove('d-none');
}

// Start the game
function startGame() {
    if (gameMode === 'friend') {
        player1Name = document.getElementById('player1Name').value || 'Player 1';
        player2Name = document.getElementById('player2Name').value || 'Player 2';
    } else {
        player1Name = document.getElementById('playerName').value || 'Player';
        player2Name = 'Bot';
    }
    
    playerForm.classList.add('d-none');
    gameContainer.classList.remove('d-none');
    
    // Update player names in the display
    document.getElementById('player1Display').textContent = player1Name;
    document.getElementById('player2Display').textContent = player2Name;
    updateTurnInfo();
    
    // Initialize the game board
    createBoard();
}

// Create the game board
function createBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    board = [];
    
    for (let row = 0; row < 8; row++) {
        const rowArray = [];
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            square.addEventListener('click', () => handleSquareClick(row, col));
            
            let piece = null;
            
            // Place initial pieces
            if ((row + col) % 2 !== 0) {
                if (row < 3) {
                    piece = { player: 'player2', king: false };
                    createPieceElement(square, 'player2');
                } else if (row > 4) {
                    piece = { player: 'player1', king: false };
                    createPieceElement(square, 'player1');
                }
            }
            
            rowArray.push(piece);
            boardElement.appendChild(square);
        }
        board.push(rowArray);
    }
}

// Create a piece element
function createPieceElement(square, player) {
    const piece = document.createElement('div');
    piece.className = `piece ${player}`;
    square.appendChild(piece);
}

// Handle square click
function handleSquareClick(row, col) {
    const clickedSquare = board[row][col];
    
    // If a piece is already selected and player clicks on a valid move
    if (selectedPiece && validMoves.some(move => move.row === row && move.col === col)) {
        makeMove(row, col);
        return;
    }
    
    // Clear previous selection
    clearSelection();
    
    // If player clicks on their own piece
    if (clickedSquare && clickedSquare.player === currentPlayer) {
        const pieceElement = document.querySelector(`.square[data-row="${row}"][data-col="${col}"] .piece`);
        if (pieceElement) {
            pieceElement.classList.add('selected');
            selectedPiece = { row, col };
            validMoves = getValidMoves(row, col);
            highlightValidMoves();
        }
    }
}

// Clear selected piece and valid moves
function clearSelection() {
    const selected = document.querySelector('.piece.selected');
    if (selected) {
        selected.classList.remove('selected');
    }
    
    const highlights = document.querySelectorAll('.square.valid-move');
    highlights.forEach(square => {
        square.classList.remove('valid-move');
    });
    
    selectedPiece = null;
    validMoves = [];
}

// Highlight valid moves
function highlightValidMoves() {
    validMoves.forEach(move => {
        const square = document.querySelector(`.square[data-row="${move.row}"][data-col="${move.col}"]`);
        if (square) {
            square.classList.add('valid-move');
        }
    });
}

// Get valid moves for a piece
function getValidMoves(row, col) {
    const piece = board[row][col];
    const moves = [];
    
    if (!piece) return moves;
    
    const directions = [];
    if (piece.player === 'player1' || piece.king) {
        // Player 1 or King: Move up-left and up-right
        directions.push({ rowDir: -1, colDir: -1 });
        directions.push({ rowDir: -1, colDir: 1 });
    }
    
    if (piece.player === 'player2' || piece.king) {
        // Player 2 or King: Move down-left and down-right
        directions.push({ rowDir: 1, colDir: -1 });
        directions.push({ rowDir: 1, colDir: 1 });
    }
    
    // Check for jumps first (required in checkers)
    const jumps = [];
    
    for (const dir of directions) {
        const newRow = row + dir.rowDir;
        const newCol = col + dir.colDir;
        
        if (isInBounds(newRow, newCol) && board[newRow][newCol] && 
            board[newRow][newCol].player !== piece.player) {
            const jumpRow = newRow + dir.rowDir;
            const jumpCol = newCol + dir.colDir;
            
            if (isInBounds(jumpRow, jumpCol) && !board[jumpRow][jumpCol]) {
                jumps.push({ row: jumpRow, col: jumpCol, isJump: true, jumpedRow: newRow, jumpedCol: newCol });
            }
        }
    }
    
    // If jumps are available, return only jumps (rules say jumps are required)
    if (jumps.length > 0) {
        return jumps;
    }
    
    // If no jumps, check for regular moves
    for (const dir of directions) {
        const newRow = row + dir.rowDir;
        const newCol = col + dir.colDir;
        
        if (isInBounds(newRow, newCol) && !board[newRow][newCol]) {
            moves.push({ row: newRow, col: newCol, isJump: false });
        }
    }
    
    return moves;
}

// Check if coordinates are within the board
function isInBounds(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Make a move
function makeMove(targetRow, targetCol) {
    if (!selectedPiece) return;
    
    const { row: startRow, col: startCol } = selectedPiece;
    const piece = board[startRow][startCol];
    const targetSquare = document.querySelector(`.square[data-row="${targetRow}"][data-col="${targetCol}"]`);
    const sourceSquare = document.querySelector(`.square[data-row="${startRow}"][data-col="${startCol}"]`);
    const pieceElement = sourceSquare.querySelector('.piece');
    
    // Move the piece
    board[targetRow][targetCol] = piece;
    board[startRow][startCol] = null;
    
    // Check if piece should become king
    if ((piece.player === 'player1' && targetRow === 0) || 
        (piece.player === 'player2' && targetRow === 7)) {
        piece.king = true;
        pieceElement.classList.add('king');
    }
    
    // Handle jump
    const move = validMoves.find(move => move.row === targetRow && move.col === targetCol);
    if (move && move.isJump) {
        const jumpedPiece = board[move.jumpedRow][move.jumpedCol];
        board[move.jumpedRow][move.jumpedCol] = null;
        
        const jumpedSquare = document.querySelector(`.square[data-row="${move.jumpedRow}"][data-col="${move.jumpedCol}"]`);
        jumpedSquare.innerHTML = '';
        
        // Award points for jump
        if (currentPlayer === 'player1') {
            player1Score++;
            document.getElementById('player1Score').textContent = player1Score;
        } else {
            player2Score++;
            document.getElementById('player2Score').textContent = player2Score;
        }
    }
    
    // Move the DOM element
    if (pieceElement) {
        targetSquare.appendChild(pieceElement);
    }
    
    // Clear selection
    clearSelection();
    
    // Check for win
    if (checkForWin()) {
        const winner = currentPlayer === 'player1' ? player1Name : player2Name;
        setTimeout(() => {
            alert(`${winner} wins!`);
        }, 100);
        return;
    }
    
    // Switch player
    switchPlayer();
    
    // Bot's turn
    if (gameMode === 'bot' && currentPlayer === 'player2') {
        setTimeout(botMove, 1000);
    }
}

// Switch players
function switchPlayer() {
    currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    updateTurnInfo();
}

// Update the turn information display
function updateTurnInfo() {
    const playerName = currentPlayer === 'player1' ? player1Name : player2Name;
    document.getElementById('currentPlayer').textContent = playerName;
}

// Bot move logic
function botMove() {
    // Find all pieces that can move
    const botPieces = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.player === 'player2') {
                const moves = getValidMoves(row, col);
                if (moves.length > 0) {
                    botPieces.push({ row, col, moves });
                }
            }
        }
    }
    
    if (botPieces.length === 0) {
        // Bot has no moves, player wins
        alert(`${player1Name} wins! ${player2Name} has no moves left.`);
        return;
    }
    
    // Find pieces that can jump
    const jumpingPieces = botPieces.filter(p => p.moves.some(m => m.isJump));
    
    // Prioritize jumps
    const piecesToConsider = jumpingPieces.length > 0 ? jumpingPieces : botPieces;
    
    // Choose a random piece and move
    const randomPieceIndex = Math.floor(Math.random() * piecesToConsider.length);
    const chosenPiece = piecesToConsider[randomPieceIndex];
    
    // Choose a move (prioritize king-making moves, then jumps)
    let chosenMove;
    
    // Look for king-making moves
    const kingMoves = chosenPiece.moves.filter(move => move.row === 7);
    if (kingMoves.length > 0) {
        chosenMove = kingMoves[0];
    } 
    // Otherwise, choose a jump if available
    else if (chosenPiece.moves.some(m => m.isJump)) {
        chosenMove = chosenPiece.moves.find(m => m.isJump);
    } 
    // Or just a random move
    else {
        const randomMoveIndex = Math.floor(Math.random() * chosenPiece.moves.length);
        chosenMove = chosenPiece.moves[randomMoveIndex];
    }
    
    // Simulate clicking on the piece and then the target
    const pieceElement = document.querySelector(`.square[data-row="${chosenPiece.row}"][data-col="${chosenPiece.col}"] .piece`);
    if (pieceElement) {
        // Select the piece
        handleSquareClick(chosenPiece.row, chosenPiece.col);
        
        // Make the move
        setTimeout(() => {
            makeMove(chosenMove.row, chosenMove.col);
        }, 500);
    }
}

// Check for win
function checkForWin() {
    let player1Pieces = 0;
    let player2Pieces = 0;
    let player1CanMove = false;
    let player2CanMove = false;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                if (piece.player === 'player1') {
                    player1Pieces++;
                    if (!player1CanMove && getValidMoves(row, col).length > 0) {
                        player1CanMove = true;
                    }
                } else {
                    player2Pieces++;
                    if (!player2CanMove && getValidMoves(row, col).length > 0) {
                        player2CanMove = true;
                    }
                }
            }
        }
    }
    
    // Win by capturing all pieces
    if (player1Pieces === 0) return true;
    if (player2Pieces === 0) return true;
    
    // Win by blocking all moves
    if (currentPlayer === 'player1' && !player1CanMove) return true;
    if (currentPlayer === 'player2' && !player2CanMove) return true;
    
    return false;
}

// Reset game
function resetGame() {
    player1Score = 0;
    player2Score = 0;
    document.getElementById('player1Score').textContent = '0';
    document.getElementById('player2Score').textContent = '0';
    currentPlayer = 'player1';
    updateTurnInfo();
    createBoard();
}