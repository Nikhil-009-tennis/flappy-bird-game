// Authentication variables
let currentUser = null;
let users = JSON.parse(localStorage.getItem('flappyBirdUsers')) || {};

// Check authentication on page load
function checkAuth() {
    currentUser = localStorage.getItem('flappyBirdCurrentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize user display
function initUserDisplay() {
    const userDisplay = document.getElementById('userDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (currentUser === 'guest') {
        userDisplay.textContent = 'Playing as Guest';
    } else {
        userDisplay.textContent = `Welcome, ${currentUser}!`;
    }
    
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('flappyBirdCurrentUser');
        window.location.href = 'login.html';
    });
}

// Load user-specific data
function loadUserData() {
    if (currentUser && currentUser !== 'guest' && users[currentUser]) {
        const userData = users[currentUser];
        bestScore = userData.bestScore || 0;
        coins = userData.coins || 0;
        if (userData.currentTheme) {
            currentTheme = userData.currentTheme;
            colors = themes[currentTheme];
        }
    }
}

// Save user-specific data
function saveUserData() {
    if (currentUser && currentUser !== 'guest' && users[currentUser]) {
        users[currentUser].bestScore = bestScore;
        users[currentUser].coins = coins;
        users[currentUser].currentTheme = currentTheme;
        localStorage.setItem('flappyBirdUsers', JSON.stringify(users));
    }
}

// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const finalScoreElement = document.getElementById('finalScore');
const gameOverElement = document.getElementById('gameOver');

// Game state
let gameRunning = false;
let gameStarted = false;
let countdownActive = false;
let score = 0;
let bestScore = localStorage.getItem('flappyBirdBestScore') || 0;
let coins = parseInt(localStorage.getItem('flappyBirdCoins') || 0);

// Game objects
const bird = {
    x: 80,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jumpPower: -8,
    rotation: 0
};

const pipes = [];
const pipeWidth = 60;
const pipeGap = 150;
let pipeTimer = 0;
const pipeInterval = 150;

const gameCoins = [];
const coinSize = 15;
let coinTimer = 0;
const coinInterval = 300;

// Store items system
let purchasedItems = JSON.parse(localStorage.getItem('flappyBirdPurchases') || '[]');
let activePowerUps = {
    speedBoost: false,
    shield: false,
    coinMagnet: false
};
let powerUpTimers = {
    speedBoost: 0,
    shield: 0,
    coinMagnet: 0
};
const POWERUP_DURATION = 300; // 5 seconds at 60fps

// Theme system
const themes = {
    classic: {
        name: 'Classic',
        bird: '#FFD700',
        pipe: '#2ECC71',
        background: '#87CEEB',
        ground: '#8B4513',
        cloud: 'rgba(255, 255, 255, 0.7)',
        pipeCap: '#27AE60'
    },
    sunset: {
        name: 'Sunset',
        bird: '#FF6B35',
        pipe: '#FF8C42',
        background: '#FF6B6B',
        ground: '#8B4513',
        cloud: 'rgba(255, 255, 255, 0.8)',
        pipeCap: '#E67E22'
    },
    night: {
        name: 'Night',
        bird: '#F39C12',
        pipe: '#34495E',
        background: '#2C3E50',
        ground: '#2C3E50',
        cloud: 'rgba(255, 255, 255, 0.3)',
        pipeCap: '#2C3E50'
    },
    forest: {
        name: 'Forest',
        bird: '#27AE60',
        pipe: '#8B4513',
        background: '#90EE90',
        ground: '#228B22',
        cloud: 'rgba(255, 255, 255, 0.6)',
        pipeCap: '#654321'
    },
    ocean: {
        name: 'Ocean',
        bird: '#3498DB',
        pipe: '#1ABC9C',
        background: '#5DADE2',
        ground: '#2E86AB',
        cloud: 'rgba(255, 255, 255, 0.7)',
        pipeCap: '#16A085'
    }
};

let currentTheme = 'classic';
let colors = themes[currentTheme];

// Initialize
function init() {
    // Check authentication first
    if (!checkAuth()) {
        return;
    }
    
    // Initialize user display and data
    initUserDisplay();
    loadUserData();
    loadStoreItems();
    
    bestScoreElement.textContent = bestScore;
    updateCoinDisplay();
    createThemeSelector();
    resetGame();
}

// Create theme selector
function createThemeSelector() {
    const themeContainer = document.createElement('div');
    themeContainer.className = 'theme-selector';
    themeContainer.innerHTML = `
        <h3>Choose Theme:</h3>
        <div class="theme-buttons">
            ${Object.keys(themes).map(themeKey => `
                <button class="theme-btn ${themeKey === currentTheme ? 'active' : ''}" 
                        data-theme="${themeKey}" 
                        style="background: ${themes[themeKey].background}; 
                               border: 2px solid ${themes[themeKey].pipe};">
                    ${themes[themeKey].name}
                </button>
            `).join('')}
        </div>
    `;
    
    document.querySelector('.game-container').insertBefore(themeContainer, document.querySelector('.game-header'));
    
    // Add event listeners to theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const newTheme = btn.dataset.theme;
            changeTheme(newTheme);
            
            // Update active button
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Load store items
function loadStoreItems() {
    purchasedItems = JSON.parse(localStorage.getItem('flappyBirdPurchases') || '[]');
}

// Change theme
function changeTheme(themeName) {
    currentTheme = themeName;
    colors = themes[currentTheme];
    
    // Update theme buttons styling
    document.querySelectorAll('.theme-btn').forEach(btn => {
        const themeKey = btn.dataset.theme;
        btn.style.background = themes[themeKey].background;
        btn.style.borderColor = themes[themeKey].pipe;
    });
    
    // Save user theme preference
    saveUserData();
}

// Update coin display
function updateCoinDisplay() {
    const coinElement = document.getElementById('coins');
    if (coinElement) {
        coinElement.textContent = coins;
    }
}

// Reset game state
function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.rotation = 0;
    pipes.length = 0;
    gameCoins.length = 0;
    score = 0;
    scoreElement.textContent = score;
    pipeTimer = 0;
    coinTimer = 0;
    gameRunning = false;
    gameStarted = false;
    countdownActive = false;
    
    // Reset power-ups
    for (const powerUp in activePowerUps) {
        activePowerUps[powerUp] = false;
        powerUpTimers[powerUp] = 0;
    }
    
    startBtn.style.display = 'inline-block';
    restartBtn.style.display = 'none';
    gameOverElement.style.display = 'none';
}

// Start game
function startGame() {
    gameStarted = true;
    startBtn.style.display = 'none';
    restartBtn.style.display = 'inline-block';
    
    // Start countdown
    startCountdown();
}

// Countdown function
function startCountdown() {
    let countdown = 3;
    countdownActive = true;
    
    const countdownInterval = setInterval(() => {
        if (countdown > 0) {
            // Show countdown on canvas
            showCountdown(countdown);
            countdown--;
        } else {
            // Start the game after countdown
            clearInterval(countdownInterval);
            countdownActive = false;
            gameRunning = true;
            gameLoop();
        }
    }, 1000);
}

// Show countdown on canvas
function showCountdown(number) {
    // Clear canvas and draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background elements
    drawBackground();
    drawGround();
    
    // Draw countdown overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw countdown number
    ctx.fillStyle = 'white';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillText(number.toString(), canvas.width / 2, canvas.height / 2);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw "Get Ready!" text
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Get Ready!', canvas.width / 2, canvas.height / 2 + 60);
}



// Restart game
function restartGame() {
    resetGame();
    startGame();
}

// Bird physics
function updateBird() {
    if (!gameRunning) return;
    
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    // Rotation based on velocity
    bird.rotation = Math.min(Math.PI / 2, Math.max(-Math.PI / 4, bird.velocity * 0.1));
    
    // Ground collision
    if (bird.y + bird.height >= canvas.height - 20) {
        gameOver();
    }
    
    // Ceiling collision
    if (bird.y <= 0) {
        bird.y = 0;
        bird.velocity = 0;
    }
}

// Make bird jump
function jump() {
    if (!gameStarted) {
        startGame();
        return;
    }
    
    if (gameRunning) {
        bird.velocity = bird.jumpPower;
    }
}

// Activate power-ups
function activatePowerUp(powerUpType) {
    if (purchasedItems.includes(powerUpType)) {
        activePowerUps[powerUpType] = true;
        powerUpTimers[powerUpType] = POWERUP_DURATION;
        
        // Show power-up activation message
        showPowerUpMessage(powerUpType);
    }
}

// Show power-up message
function showPowerUpMessage(powerUpType) {
    const messages = {
        'speed-boost': '🚀 Speed Boost Activated!',
        'shield': '🛡️ Shield Activated!',
        'coin-magnet': '🎯 Coin Magnet Activated!',
        'shield-deactivated': '🛡️ Shield Deactivated!'
    };
    
    // Create temporary message element
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #27AE60;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-size: 18px;
        font-weight: bold;
        z-index: 1000;
        animation: fadeInOut 2s ease-in-out;
    `;
    messageEl.textContent = messages[powerUpType] || 'Power-up Activated!';
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(messageEl);
    
    // Remove message after animation
    setTimeout(() => {
        document.body.removeChild(messageEl);
        document.head.removeChild(style);
    }, 2000);
}

// Generate pipes
function generatePipes() {
    if (!gameRunning) return;
    
    // Speed boost affects pipe generation
    const currentPipeInterval = activePowerUps.speedBoost ? pipeInterval * 0.7 : pipeInterval;
    
    pipeTimer++;
    if (pipeTimer >= currentPipeInterval) {
        const gapY = Math.random() * (canvas.height - pipeGap - 100) + 50;
        
        pipes.push({
            x: canvas.width,
            gapY: gapY,
            passed: false
        });
        
        pipeTimer = 0;
    }
}

// Generate coins
function generateCoins() {
    if (!gameRunning) return;
    
    coinTimer++;
    if (coinTimer >= coinInterval) {
        // Find a pipe to spawn coin in its gap
        const availablePipes = pipes.filter(pipe => pipe.x > canvas.width - 200 && pipe.x < canvas.width + 100);
        
        if (availablePipes.length > 0) {
            // Choose a random pipe from available ones
            const selectedPipe = availablePipes[Math.floor(Math.random() * availablePipes.length)];
            
            // Calculate safe area within the pipe gap
            const pipeGapTop = selectedPipe.gapY;
            const pipeGapBottom = selectedPipe.gapY + pipeGap;
            const gapCenter = pipeGapTop + (pipeGap / 2);
            
            // Spawn coin in the middle of the gap with some random variation
            const coinY = gapCenter + (Math.random() - 0.5) * (pipeGap - coinSize - 20);
            
            // Ensure coin stays within the gap bounds
            const finalCoinY = Math.max(pipeGapTop + 10, Math.min(pipeGapBottom - coinSize - 10, coinY));
            
            gameCoins.push({
                x: selectedPipe.x + pipeWidth + 30, // Spawn coin after the pipe
                y: finalCoinY,
                collected: false
            });
        }
        
        coinTimer = 0;
    }
}

// Update pipes
function updatePipes() {
    // Speed boost affects pipe movement
    const pipeSpeed = activePowerUps.speedBoost ? 3 : 2;
    
    for (let i = pipes.length - 1; i >= 0; i--) {
        const pipe = pipes[i];
        pipe.x -= pipeSpeed;
        
        // Remove pipes that are off screen
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(i, 1);
            continue;
        }
        
        // Check if bird passed the pipe
        if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
            pipe.passed = true;
            score++;
            scoreElement.textContent = score;
        }
    }
}

// Update coins
function updateCoins() {
    // Speed boost affects coin movement
    const coinSpeed = activePowerUps.speedBoost ? 3 : 2;
    
    for (let i = gameCoins.length - 1; i >= 0; i--) {
        const coin = gameCoins[i];
        coin.x -= coinSpeed;
        
        // Remove coins that are off screen
        if (coin.x + coinSize < 0) {
            gameCoins.splice(i, 1);
            continue;
        }
        
        // Check if bird collected the coin (with coin magnet effect)
        let coinCollected = false;
        
        if (!coin.collected) {
            if (activePowerUps.coinMagnet) {
                // Coin magnet: larger collection radius
                const magnetRadius = 80;
                const distance = Math.sqrt(
                    Math.pow(bird.x + bird.width/2 - (coin.x + coinSize/2), 2) +
                    Math.pow(bird.y + bird.height/2 - (coin.y + coinSize/2), 2)
                );
                
                if (distance < magnetRadius) {
                    coinCollected = true;
                    // Animate coin moving toward bird
                    const dx = (bird.x + bird.width/2) - (coin.x + coinSize/2);
                    const dy = (bird.y + bird.height/2) - (coin.y + coinSize/2);
                    coin.x += dx * 0.1;
                    coin.y += dy * 0.1;
                }
            } else {
                // Normal collision detection
                if (bird.x < coin.x + coinSize &&
                    bird.x + bird.width > coin.x &&
                    bird.y < coin.y + coinSize &&
                    bird.y + bird.height > coin.y) {
                    coinCollected = true;
                }
            }
            
            if (coinCollected) {
                coin.collected = true;
                coins++;
                updateCoinDisplay();
                saveUserData();
            }
        }
    }
}

// Collision detection
function checkCollision() {
    // Shield power-up prevents collision
    if (activePowerUps.shield) {
        return false;
    }
    
    for (const pipe of pipes) {
        // Bird rectangle
        const birdRect = {
            x: bird.x,
            y: bird.y,
            width: bird.width,
            height: bird.height
        };
        
        // Top pipe
        const topPipe = {
            x: pipe.x,
            y: 0,
            width: pipeWidth,
            height: pipe.gapY
        };
        
        // Bottom pipe
        const bottomPipe = {
            x: pipe.x,
            y: pipe.gapY + pipeGap,
            width: pipeWidth,
            height: canvas.height - (pipe.gapY + pipeGap)
        };
        
        if (rectCollision(birdRect, topPipe) || rectCollision(birdRect, bottomPipe)) {
            return true;
        }
    }
    return false;
}

// Rectangle collision detection
function rectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Game over
function gameOver() {
    gameRunning = false;
    
    // Update best score
    if (score > bestScore) {
        bestScore = score;
        bestScoreElement.textContent = bestScore;
    }
    
    // Save user data
    saveUserData();
    
    finalScoreElement.textContent = score;
    gameOverElement.style.display = 'block';
}

// Draw bird
function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.rotation);
    
    // Determine bird skin based on purchased items
    let birdColor = colors.bird;
    let wingColor = '#FFA500';
    let hasGoldenWings = purchasedItems.includes('golden-wings');
    let hasDiamondBird = purchasedItems.includes('diamond-bird');
    let hasRainbowBird = purchasedItems.includes('rainbow-bird');
    
    // Apply skin effects
    if (hasDiamondBird) {
        birdColor = '#B9F2FF'; // Diamond blue
        // Add diamond sparkle effect
        ctx.shadowColor = '#B9F2FF';
        ctx.shadowBlur = 15;
    } else if (hasRainbowBird) {
        // Rainbow effect - cycle through colors
        const time = Date.now() * 0.005;
        const hue = (time % 360);
        birdColor = `hsl(${hue}, 70%, 60%)`;
    }
    
    if (hasGoldenWings) {
        wingColor = '#FFD700';
        // Add golden glow effect
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;
    }
    
    // Bird body
    ctx.fillStyle = birdColor;
    ctx.fillRect(-bird.width / 2, -bird.height / 2, bird.width, bird.height);
    
    // Bird eye
    ctx.fillStyle = '#000';
    ctx.fillRect(bird.width / 4, -bird.height / 4, 4, 4);
    
    // Bird wing
    ctx.fillStyle = wingColor;
    ctx.fillRect(-bird.width / 3, -bird.height / 3, 8, 6);
    
    // Reset shadow effects
    ctx.shadowBlur = 0;
    
    ctx.restore();
}

// Draw pipes
function drawPipes() {
    ctx.fillStyle = colors.pipe;
    
    for (const pipe of pipes) {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapY);
        
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.gapY + pipeGap, pipeWidth, canvas.height - (pipe.gapY + pipeGap));
        
        // Pipe caps
        ctx.fillStyle = colors.pipeCap;
        ctx.fillRect(pipe.x - 5, pipe.gapY - 20, pipeWidth + 10, 20);
        ctx.fillRect(pipe.x - 5, pipe.gapY + pipeGap, pipeWidth + 10, 20);
        ctx.fillStyle = colors.pipe;
    }
}

// Draw coins
function drawCoins() {
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    
    for (const coin of gameCoins) {
        if (!coin.collected) {
            // Coin body
            ctx.beginPath();
            ctx.arc(coin.x + coinSize/2, coin.y + coinSize/2, coinSize/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Coin shine
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(coin.x + coinSize/3, coin.y + coinSize/3, coinSize/6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFD700';
        }
    }
}

// Draw ground
function drawGround() {
    ctx.fillStyle = colors.ground;
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
}

// Draw background
function drawBackground() {
    // Sky gradient based on theme
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, colors.background);
    gradient.addColorStop(1, colors.background);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clouds
    ctx.fillStyle = colors.cloud;
    for (let i = 0; i < 3; i++) {
        const x = (Date.now() * 0.01 + i * 200) % (canvas.width + 100) - 50;
        const y = 50 + i * 30;
        drawCloud(x, y);
    }
}

// Draw cloud
function drawCloud(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 15, 20, 0, Math.PI * 2);
    ctx.fill();
}

// Draw power-up indicators
function drawPowerUpIndicators() {
    if (!gameRunning) return;
    
    let indicatorY = 10;
    const indicatorHeight = 25;
    
    // Speed Boost indicator
    if (activePowerUps.speedBoost) {
        ctx.fillStyle = 'rgba(255, 107, 53, 0.8)';
        ctx.fillRect(10, indicatorY, 120, indicatorHeight);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('🚀 Speed Boost', 15, indicatorY + 18);
        indicatorY += indicatorHeight + 5;
    }
    
    // Shield indicator
    if (activePowerUps.shield) {
        ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
        ctx.fillRect(10, indicatorY, 100, indicatorHeight);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('🛡️ Shield', 15, indicatorY + 18);
        indicatorY += indicatorHeight + 5;
    }
    
    // Coin Magnet indicator
    if (activePowerUps.coinMagnet) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.fillRect(10, indicatorY, 110, indicatorHeight);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('🎯 Coin Magnet', 15, indicatorY + 18);
    }
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    // Draw pipes
    drawPipes();
    
    // Draw coins
    drawCoins();
    
    // Draw ground
    drawGround();
    
    // Draw bird
    drawBird();
    
    // Draw instructions if game hasn't started
    if (!gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click or press SPACE to start!', canvas.width / 2, canvas.height / 2);
        
        // Show power-up instructions if player has purchased items
        if (purchasedItems.length > 0) {
            ctx.font = '16px Arial';
            ctx.fillText('Power-ups: S = Speed, H = Shield, M = Magnet', canvas.width / 2, canvas.height / 2);
        }
    }
    
    // Don't draw game elements during countdown
    if (countdownActive) {
        return;
    }
    
    // Draw active power-up indicators
    drawPowerUpIndicators();
}

// Update power-ups
function updatePowerUps() {
    for (const powerUp in powerUpTimers) {
        if (powerUpTimers[powerUp] > 0) {
            powerUpTimers[powerUp]--;
            if (powerUpTimers[powerUp] <= 0) {
                activePowerUps[powerUp] = false;
                // Show power-up deactivation message
                if (powerUp === 'shield') {
                    showPowerUpMessage('shield-deactivated');
                }
            }
        }
    }
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    updateBird();
    generatePipes();
    generateCoins();
    updatePipes();
    updateCoins();
    updatePowerUps();
    
    if (checkCollision()) {
        gameOver();
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
playAgainBtn.addEventListener('click', () => {
    gameOverElement.style.display = 'none';
    restartGame();
});

// Store button
const storeBtn = document.getElementById('storeBtn');
storeBtn.addEventListener('click', () => {
    window.location.href = 'store.html';
});

canvas.addEventListener('click', jump);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        jump();
    }
    
    // Power-up shortcuts
    if (e.code === 'KeyS') {
        e.preventDefault();
        activatePowerUp('speed-boost');
    } else if (e.code === 'KeyH') {
        e.preventDefault();
        activatePowerUp('shield');
    } else if (e.code === 'KeyM') {
        e.preventDefault();
        activatePowerUp('coin-magnet');
    }
});

// Initialize the game
init(); 