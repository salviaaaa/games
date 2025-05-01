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

// Tetris Game Logic
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = ['#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];

// Player name
let playerName = "Player";

// Function to start game from cover screen
function startTetrisGame() {
    playerName = document.getElementById('playerName').value || "Player";
    document.getElementById('currentPlayerName').textContent = playerName;
    document.getElementById('game-cover').classList.add('d-none');
    document.getElementById('game-content').classList.remove('d-none');
}

// Tetromino shapes
const SHAPES = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]] // Z
];

class Tetris {
    constructor(canvas, nextCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nextCanvas = nextCanvas;
        this.nextCtx = nextCanvas.getContext('2d');
        this.init();
    }

    init() {
        this.score = 0;
        this.level = 1;
        this.board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        this.gameOver = false;
        this.paused = false;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        this.createPiece();
        this.draw();
    }

    createPiece() {
        const shapeIndex = Math.floor(Math.random() * SHAPES.length);
        this.piece = {
            shape: SHAPES[shapeIndex],
            color: COLORS[shapeIndex],
            x: Math.floor(COLS / 2) - Math.floor(SHAPES[shapeIndex][0].length / 2),
            y: 0
        };

        if (this.checkCollision()) {
            this.gameOver = true;
        }

        // Create next piece
        const nextShapeIndex = Math.floor(Math.random() * SHAPES.length);
        this.nextPiece = {
            shape: SHAPES[nextShapeIndex],
            color: COLORS[nextShapeIndex]
        };
        this.drawNextPiece();
    }

    rotate() {
        const rotated = this.piece.shape[0].map((_, i) =>
            this.piece.shape.map(row => row[row.length - 1 - i])
        );
        const prevShape = this.piece.shape;
        this.piece.shape = rotated;
        if (this.checkCollision()) {
            this.piece.shape = prevShape;
        }
    }

    checkCollision() {
        return this.piece.shape.some((row, dy) =>
            row.some((value, dx) => {
                const x = this.piece.x + dx;
                const y = this.piece.y + dy;
                return value !== 0 &&
                    (x < 0 || x >= COLS || y >= ROWS ||
                        (y >= 0 && this.board[y][x]));
            })
        );
    }

    merge() {
        this.piece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    const y = this.piece.y + dy;
                    const x = this.piece.x + dx;
                    if (y >= 0) this.board[y][x] = this.piece.color;
                }
            });
        });
    }

    clearLines() {
        let linesCleared = 0;
        outer: for (let y = ROWS - 1; y >= 0; y--) {
            for (let x = 0; x < COLS; x++) {
                if (!this.board[y][x]) continue outer;
            }
            const row = this.board.splice(y, 1)[0];
            this.board.unshift(row.fill(0));
            y++;
            linesCleared++;
        }
        if (linesCleared > 0) {
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.score / 1000) + 1;
            this.dropInterval = 1000 - (this.level - 1) * 50;
            document.getElementById('score').textContent = this.score;
            document.getElementById('level').textContent = this.level;
        }
    }

    drop() {
        this.piece.y++;
        if (this.checkCollision()) {
            this.piece.y--;
            this.merge();
            this.clearLines();
            this.createPiece();
        }
    }

    quickDrop() {
        while (!this.checkCollision()) {
            this.piece.y++;
        }
        this.piece.y--;
        this.merge();
        this.clearLines();
        this.createPiece();
    }

    move(dir) {
        this.piece.x += dir;
        if (this.checkCollision()) {
            this.piece.x -= dir;
        }
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw board
        this.board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.ctx.fillStyle = value;
                    this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                }
            });
        });

        // Draw current piece
        this.piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.ctx.fillStyle = this.piece.color;
                    this.ctx.fillRect(
                        (this.piece.x + x) * BLOCK_SIZE,
                        (this.piece.y + y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            });
        });
    }

    drawNextPiece() {
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * BLOCK_SIZE) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * BLOCK_SIZE) / 2;

        this.nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.nextCtx.fillStyle = this.nextPiece.color;
                    this.nextCtx.fillRect(
                        offsetX + x * BLOCK_SIZE,
                        offsetY + y * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            });
        });
    }

    update(time = 0) {
        if (!this.gameOver && !this.paused) {
            const deltaTime = time - this.lastTime;
            this.lastTime = time;
            this.dropCounter += deltaTime;
            if (this.dropCounter > this.dropInterval) {
                this.drop();
                this.dropCounter = 0;
            }
            this.draw();
        }
        requestAnimationFrame(this.update.bind(this));
    }
}

// Game initialization
let game;
const canvas = document.getElementById('gameCanvas');
const nextCanvas = document.getElementById('nextPieceCanvas');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const restartButton = document.getElementById('restartButton');
const gameOverDiv = document.getElementById('gameOver');

function startGame() {
    game = new Tetris(canvas, nextCanvas);
    game.update();
    startButton.classList.add('d-none');
    pauseButton.classList.remove('d-none');
    gameOverDiv.classList.add('d-none');
    document.addEventListener('keydown', handleKeyPress);
}

function pauseGame() {
    game.paused = !game.paused;
    pauseButton.textContent = game.paused ? 'Resume' : 'Pause';
}

function handleKeyPress(event) {
    if (game.gameOver || game.paused) return;

    switch(event.keyCode) {
        case 37: // Left arrow
            game.move(-1);
            break;
        case 39: // Right arrow
            game.move(1);
            break;
        case 40: // Down arrow
            game.drop();
            break;
        case 38: // Up arrow
            game.rotate();
            break;
        case 32: // Space
            game.quickDrop();
            break;
    }
    game.draw();
}

// Event listeners
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', pauseGame);
restartButton.addEventListener('click', startGame);