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
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameStarted = false;
let gameOver = false;
let playerName = "Player";

// Bird image
const birdImg = new Image();
birdImg.src = '../../assets/images/game/flappybird.gif';

// Pipe image
const pipeImg = new Image();
pipeImg.src = '../../assets/images/greenpipes.png';

// Function to start game from cover screen
function startFlappyBirdGame() {
    playerName = document.getElementById('playerName').value || "Player";
    document.getElementById('currentPlayerName').textContent = playerName;
    document.getElementById('game-cover').classList.add('d-none');
    document.getElementById('game-content').classList.remove('d-none');
}

// Bird properties
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 34,
    height: 24,
    gravity: 0.5,
    velocity: 0,
    jump: -8
};

// Pipe properties
const pipeWidth = 50;
const pipeGap = 150;
const pipes = [];
let pipeSpawnTimer = 0;
const pipeSpawnInterval = 90;

// Score
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;

// Game controls
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const gameOverScreen = document.getElementById('gameOver');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameStarted && !gameOver) {
        bird.velocity = bird.jump;
    }
});
canvas.addEventListener('click', () => {
    if (gameStarted && !gameOver) {
        bird.velocity = bird.jump;
    }
});

// Game functions
function startGame() {
    gameStarted = true;
    gameOver = false;
    startButton.style.display = 'none';
    gameOverScreen.classList.add('d-none');
    resetGame();
    animate();
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
}

function restartGame() {
    startGame();
}

function createPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    pipes.push({
        x: canvas.width,
        y: 0,
        width: pipeWidth,
        height: height,
        passed: false
    });

    pipes.push({
        x: canvas.width,
        y: height + pipeGap,
        width: pipeWidth,
        height: canvas.height - height - pipeGap
    });
}

function animate() {
    if (!gameStarted || gameOver) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Draw bird
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Update and draw pipes
    pipeSpawnTimer++;
    if (pipeSpawnTimer >= pipeSpawnInterval) {
        createPipe();
        pipeSpawnTimer = 0;
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= 2;

        // Draw pipe using image
        if (i % 2 === 0) {
            // Top pipe (flipped)
            ctx.save();
            ctx.scale(1, -1);
            ctx.drawImage(pipeImg, pipe.x, -pipe.y - pipe.height, pipe.width, pipe.height);
            ctx.restore();
        } else {
            // Bottom pipe
            ctx.drawImage(pipeImg, pipe.x, pipe.y, pipe.width, pipe.height);
        }

        // Check collision
        if (
            bird.x < pipe.x + pipe.width &&
            bird.x + bird.width > pipe.x &&
            bird.y < pipe.y + pipe.height &&
            bird.y + bird.height > pipe.y
        ) {
            gameOver = true;
        }

        // Update score
        if (pipe.x + pipe.width < bird.x && !pipe.passed && i % 2 === 0) {
            pipe.passed = true;
            score++;
            scoreElement.textContent = score;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('flappyHighScore', highScore);
                highScoreElement.textContent = highScore;
            }
        }

        // Remove pipes that are off screen
        if (pipe.x + pipe.width <= 0) {
            pipes.splice(i, 1);
        }
    }

    // Check boundaries
    if (bird.y <= 0 || bird.y + bird.height >= canvas.height) {
        gameOver = true;
    }

    // Game over
    if (gameOver) {
        gameOverScreen.classList.remove('d-none');
        return;
    }

    requestAnimationFrame(animate);
}

// Initialize high score
highScoreElement.textContent = highScore;