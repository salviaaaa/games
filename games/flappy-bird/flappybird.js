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
    gravity: 0.30,
    velocity: 0,
    jump: -7.5
};

// Pipe properties
const pipeWidth = 50;
const pipes = [];
let pipeSpawnTimer = 0;
let pipeSpawnInterval = 90; // Interval awal yang lebih cepat agar pipe muncul lebih dekat
let pipeSpeed = 1.0; // Kecepatan awal pipa
let pipeGap = 180; // Gap yang lebih besar untuk memudahkan pemain baru

// Score
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let firstPipeCreated = false; // Untuk mengontrol pembuatan pipa pertama

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
    // Buat pipa pertama lebih dekat saat game dimulai
    pipeSpawnTimer = pipeSpawnInterval - 30;
    // Start animation if not already running
    if (!window.animationFrameId) {
        animate();
    }
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.gravity = 0.30;
    bird.jump = -7.5;
    pipes.length = 0;
    score = 0;
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
    pipeSpawnInterval = 90; // Reset ke interval awal yang lebih cepat
    pipeSpeed = 1.0; // Reset ke kecepatan awal yang lebih lambat
    pipeGap = 180; // Reset ke gap yang lebih besar
    firstPipeCreated = false; // Reset status pipa pertama
}

function restartGame() {
    startGame();
}

function createPipe() {
    const minHeight = 50;
    
    // Menentukan gap berdasarkan skor
    let currentPipeGap = pipeGap;
    if (score <= 100) {
        // Gap lebih besar untuk skor di bawah 100
        currentPipeGap = 180 + (100 - score) * 0.2;
    } else {
        // Gap normal untuk skor di atas 100
        currentPipeGap = 150;
    }
    
    const maxHeight = canvas.height - currentPipeGap - minHeight;
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
        y: height + currentPipeGap,
        width: pipeWidth,
        height: canvas.height - height - currentPipeGap
    });
}

// Initialize the game by drawing the bird
function initGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameStarted && !gameOver) {
        // Update bird position only when game is started
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
    }

    // Always draw bird
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    // Update and draw pipes
    pipeSpawnTimer++;
    if (pipeSpawnTimer >= pipeSpawnInterval) {
        createPipe();
        pipeSpawnTimer = 0;
        
        // Setelah pipa pertama dibuat, atur interval spawn untuk pipa berikutnya
        if (!firstPipeCreated) {
            firstPipeCreated = true;
            pipeSpawnInterval = 120; // Interval lebih lambat setelah pipa pertama (jarak antar pipes lebih renggang)
        }
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= pipeSpeed;

        // Draw pipe using image with enhanced visibility
        if (i % 2 === 0) {
            // Top pipe (flipped)
            ctx.save();
            ctx.scale(1, -1);
            ctx.drawImage(pipeImg, pipe.x, -pipe.y - pipe.height, pipe.width, pipe.height);
            
            // Add outline to make pipes more visible
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#005000';
            ctx.strokeRect(pipe.x, -pipe.y - pipe.height, pipe.width, pipe.height);
            ctx.restore();
        } else {
            // Bottom pipe
            ctx.drawImage(pipeImg, pipe.x, pipe.y, pipe.width, pipe.height);
            
            // Add outline to make pipes more visible
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#005000';
            ctx.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);
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
            
            // Tingkatkan kesulitan seiring bertambahnya skor
            if (score > 100 && score % 10 === 0 && pipeSpawnInterval > 70) {
                pipeSpawnInterval -= 3; // Kurangi interval spawn lebih lambat
                pipeSpeed += 0.05; // Tingkatkan kecepatan pipa lebih lambat
            }
            
            // Sesuaikan gap pipa berdasarkan skor
            if (score <= 100) {
                pipeGap = 180 + (100 - score) * 0.2; // Gap lebih besar untuk skor rendah
            } else {
                pipeGap = 150; // Gap normal untuk skor tinggi
            }
            
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
        document.getElementById('finalScore').textContent = score;
        gameOverScreen.classList.remove('d-none');
        window.animationFrameId = null;
        return;
    }

    window.animationFrameId = requestAnimationFrame(animate);
}

// Initialize high score
highScoreElement.textContent = highScore;

// Initialize the game display when page loads
window.onload = function() {
    initGame();
};