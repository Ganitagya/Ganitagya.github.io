const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreValue = document.getElementById('scoreValue');
const activePowerUps = document.querySelector('.active-power-ups');

// Mobile control buttons
const upButton = document.getElementById('upButton');
const downButton = document.getElementById('downButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');

const gridSize = 20; // Size of each cell (20px by 20px)
const partRadius = 8; // Radius for circular snake parts and food (smaller than half gridSize)
let canvasSize = 400; // Will be updated based on screen size

let snake = [
    { x: 10, y: 10 } // Initial position of the snake head
];
let food = {};
let specialFood = null;
let direction = 'right'; // Initial direction
let changingDirection = false; // Flag to prevent rapid direction changes
let score = 0;
let gameInterval;
let gameSpeed = 150; // Milliseconds per frame (lower is faster)
let gameStarted = false;
let lives = 1;
let activeEffects = new Set();
let specialFoodTimer = null;
let lastPowerUpType = null;
let consecutiveSameType = 0;

// Sound effects
let audioContext;
let backgroundMusic = null;
let isMusicPlaying = false;

function startBackgroundMusic() {
    try {
        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }

        backgroundMusic = new Audio('warm-chords.mp3');
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.3; // Set to 30% volume
        backgroundMusic.play().catch(e => {
            console.error('Error playing background music:', e);
            // Try to play again after user interaction
            document.addEventListener('click', () => {
                backgroundMusic.play().catch(e => console.error('Failed to play background music:', e));
            }, { once: true });
        });
        
        isMusicPlaying = true;
    } catch (e) {
        console.error('Error starting background music:', e);
    }
}

function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        isMusicPlaying = false;
    }
}

function playEatSound() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.error('Error playing eat sound:', e);
    }
}

function playDeathSound() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
        
        const modulator = audioContext.createOscillator();
        const modGain = audioContext.createGain();
        modulator.connect(modGain);
        modGain.connect(oscillator.frequency);
        modulator.frequency.setValueAtTime(8, audioContext.currentTime);
        modGain.gain.setValueAtTime(50, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start();
        modulator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
        modulator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.error('Error playing death sound:', e);
    }
}

function vibrate() {
    if ('vibrate' in navigator) {
        navigator.vibrate(20);
    }
}

const POWER_UPS = {
    SHRINK: {
        type: 'shrink',
        color: '#FF9800',
        duration: 3000, // 3 seconds
        effect: () => {
            const newLength = Math.ceil(snake.length / 2);
            snake = snake.slice(0, newLength);
        },
        // Higher chance when snake is long
        getChance: () => {
            const lengthFactor = Math.min(snake.length / 10, 1); // Max 100% chance
            return 0.3 + (lengthFactor * 0.4); // 30% to 70% chance based on length
        }
    },
    EXTRA_LIFE: {
        type: 'extra-life',
        color: '#F44336',
        duration: 0, // Permanent
        effect: () => {
            lives++;
        },
        // Higher chance when snake is short and score is high
        getChance: () => {
            const lengthFactor = Math.max(1 - (snake.length / 10), 0); // Inverse of length
            const scoreFactor = Math.min(score / 100, 1); // Score up to 100
            return 0.2 + (lengthFactor * 0.3) + (scoreFactor * 0.2); // 20% to 70% chance
        }
    }
};

// Make canvas responsive
function resizeCanvas() {
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Use the full container size, up to 400px
    const size = Math.min(Math.min(containerWidth, containerHeight), 400);
    
    // Calculate the number of complete grid cells that can fit
    const gridCells = Math.floor(size / gridSize);
    // Set canvas size to match exact grid cells
    const exactSize = gridCells * gridSize;
    
    // Set both the canvas element and its style dimensions
    canvas.width = exactSize;
    canvas.height = exactSize;
    canvas.style.width = exactSize + 'px';
    canvas.style.height = exactSize + 'px';
    canvasSize = exactSize;
    
    // Redraw the game if it's running
    if (gameStarted) {
        draw();
    }
}

// Make sure to call resizeCanvas when the window loads
window.addEventListener('load', () => {
    resizeCanvas();
    // Initial draw of empty canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
});

// Update the resize event listener
window.addEventListener('resize', () => {
    resizeCanvas();
    // Redraw the current game state if game is running
    if (gameStarted) {
        draw();
    } else {
        // Clear canvas if game is not running
        ctx.clearRect(0, 0, canvasSize, canvasSize);
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvasSize, canvasSize);
    }
});

// --- Game Initialization and Control ---

function initializeGame() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    score = 0;
    lives = 1;
    scoreValue.textContent = score;
    changingDirection = false;
    gameSpeed = 150;
    activeEffects.clear();
    updatePowerUpDisplay();
    if (specialFoodTimer) {
        clearTimeout(specialFoodTimer);
        specialFoodTimer = null;
    }
    specialFood = null;
    lastPowerUpType = null;
    consecutiveSameType = 0;
    generateFood();
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    draw();
}

function updatePowerUpDisplay() {
    activePowerUps.innerHTML = '';
    
    const effectsByType = new Map();
    activeEffects.forEach(effect => {
        if (!effectsByType.has(effect.type)) {
            effectsByType.set(effect.type, 0);
        }
        effectsByType.set(effect.type, effectsByType.get(effect.type) + 1);
    });

    if (lives > 1) {
        const powerUp = document.createElement('div');
        powerUp.className = 'power-up extra-life';
        powerUp.textContent = `Extra Lives: ${lives - 1}`;
        activePowerUps.appendChild(powerUp);
    }

    effectsByType.forEach((_, type) => {
        if (type !== 'extra-life') {
            const powerUp = document.createElement('div');
            powerUp.className = `power-up ${type}`;
            powerUp.textContent = type === 'shrink' ? 'Small Snake' : type;
            activePowerUps.appendChild(powerUp);
            
            if (type === 'shrink') {
                setTimeout(() => {
                    powerUp.remove();
                }, 5000);
            }
        }
    });
}

function spawnSpecialFood() {
    if (specialFood) return;
    
    const powerUpTypes = Object.values(POWER_UPS);
    let selectedPowerUp;

    // Calculate chances for each power-up
    const chances = powerUpTypes.map(powerUp => ({
        type: powerUp,
        chance: powerUp.getChance()
    }));

    // Adjust chances based on last power-up
    if (lastPowerUpType) {
        chances.forEach(chance => {
            if (chance.type.type === lastPowerUpType) {
                chance.chance *= Math.pow(0.5, consecutiveSameType);
            }
        });
    }

    // Normalize chances
    const totalChance = chances.reduce((sum, chance) => sum + chance.chance, 0);
    chances.forEach(chance => chance.chance /= totalChance);

    // Select power-up based on chances
    const random = Math.random();
    let cumulativeChance = 0;
    for (const chance of chances) {
        cumulativeChance += chance.chance;
        if (random <= cumulativeChance) {
            selectedPowerUp = chance.type;
            break;
        }
    }

    // Update consecutive type tracking
    if (selectedPowerUp.type === lastPowerUpType) {
        consecutiveSameType++;
    } else {
        consecutiveSameType = 0;
        lastPowerUpType = selectedPowerUp.type;
    }
    
    const maxGrid = canvasSize / gridSize;
    let newFoodX, newFoodY;
    do {
        newFoodX = Math.floor(Math.random() * maxGrid);
        newFoodY = Math.floor(Math.random() * maxGrid);
    } while (
        snake.some(part => part.x === newFoodX && part.y === newFoodY) ||
        (food.x === newFoodX && food.y === newFoodY)
    );

    specialFood = {
        x: newFoodX,
        y: newFoodY,
        ...selectedPowerUp
    };

    // Remove special food after 5 seconds
    specialFoodTimer = setTimeout(() => {
        specialFood = null;
        draw();
    }, 5000);
}

startButton.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        startButton.textContent = "Restart Game";
        initializeGame();
        startGameLoop();
        startBackgroundMusic();
        // Start spawning special food
        setInterval(spawnSpecialFood, 15000); // Every 15 seconds
    } else {
        // If game is already running, just restart
        initializeGame();
        startGameLoop();
        if (!isMusicPlaying) {
            startBackgroundMusic();
        }
    }
});

// Touch controls
upButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (direction !== 'down') {
        direction = 'up';
        vibrate();
    }
});

downButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (direction !== 'up') {
        direction = 'down';
        vibrate();
    }
});

leftButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (direction !== 'right') {
        direction = 'left';
        vibrate();
    }
});

rightButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (direction !== 'left') {
        direction = 'right';
        vibrate();
    }
});

// Keyboard controls
document.addEventListener('keydown', changeDirection);

function startGameLoop() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    gameInterval = setInterval(gameTick, gameSpeed);
}

// --- Game Loop ---
function gameTick() {
    if (!gameStarted) return;

    changingDirection = false;
    const head = { x: snake[0].x, y: snake[0].y };

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    snake.unshift(head);

    if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
        specialFood.effect();
        if (specialFood.type !== 'extra-life') {
            activeEffects.add(specialFood);
        }
        updatePowerUpDisplay();
        if (specialFood.duration > 0) {
            setTimeout(() => {
                activeEffects.delete(specialFood);
                updatePowerUpDisplay();
            }, specialFood.duration);
        }
        specialFood = null;
        if (specialFoodTimer) {
            clearTimeout(specialFoodTimer);
            specialFoodTimer = null;
        }
        draw();
        playEatSound();
        return;
    }
    else if (head.x === food.x && head.y === food.y) {
        playEatSound();
        score += 10;
        scoreValue.textContent = score;
        generateFood();
        if (gameSpeed > 50) {
            gameSpeed -= 5;
            startGameLoop();
        }
    } else {
        snake.pop();
    }

    const hasCollision = checkCollision();
    if (hasCollision) {
        if (lives > 1) {
            lives--;
            const currentSnake = [...snake];
            const lastDirection = direction;
            switch (lastDirection) {
                case 'up': currentSnake[0].y++; break;
                case 'down': currentSnake[0].y--; break;
                case 'left': currentSnake[0].x++; break;
                case 'right': currentSnake[0].x--; break;
            }
            snake = currentSnake;
            updatePowerUpDisplay();
            draw();
            playDeathSound();
            return;
        } else {
            gameOver();
            return;
        }
    }

    draw();
}

// --- Drawing Functions ---
function draw() {
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // Draw the background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw grid lines (optional, for better visibility)
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    // Draw vertical lines
    for (let x = 0; x <= canvasSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvasSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasSize, y);
        ctx.stroke();
    }

    drawFood();
    if (specialFood) drawSpecialFood();
    drawSnake();
}

function drawSnakePart(snakePart) {
    // Clear the specific area before drawing
    ctx.clearRect(
        snakePart.x * gridSize,
        snakePart.y * gridSize,
        gridSize,
        gridSize
    );
    
    // Draw the background for this cell
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(
        snakePart.x * gridSize,
        snakePart.y * gridSize,
        gridSize,
        gridSize
    );

    // Draw the snake part
    ctx.fillStyle = '#4CAF50';
    ctx.strokeStyle = '#388E3C';

    const centerX = snakePart.x * gridSize + gridSize / 2;
    const centerY = snakePart.y * gridSize + gridSize / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, partRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

function drawSnake() {
    snake.forEach(drawSnakePart);
}

function drawFood() {
    // Clear the specific area before drawing
    ctx.clearRect(
        food.x * gridSize,
        food.y * gridSize,
        gridSize,
        gridSize
    );
    
    // Draw the background for this cell
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(
        food.x * gridSize,
        food.y * gridSize,
        gridSize,
        gridSize
    );

    ctx.fillStyle = '#FFC107';
    ctx.strokeStyle = '#FF8F00';

    const centerX = food.x * gridSize + gridSize / 2;
    const centerY = food.y * gridSize + gridSize / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, partRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

function drawSpecialFood() {
    // Clear the specific area before drawing
    ctx.clearRect(
        specialFood.x * gridSize,
        specialFood.y * gridSize,
        gridSize,
        gridSize
    );
    
    // Draw the background for this cell
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(
        specialFood.x * gridSize,
        specialFood.y * gridSize,
        gridSize,
        gridSize
    );

    ctx.fillStyle = specialFood.color;
    ctx.strokeStyle = '#fff';
    
    const centerX = specialFood.x * gridSize + gridSize / 2;
    const centerY = specialFood.y * gridSize + gridSize / 2;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, partRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Draw pulsing effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, partRadius + 2, 0, 2 * Math.PI);
    ctx.strokeStyle = specialFood.color;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
}

// --- Game Logic ---
function generateFood() {
    const maxGrid = canvasSize / gridSize;
    // Generate random coordinates for food within the grid
    let newFoodX = Math.floor(Math.random() * maxGrid);
    let newFoodY = Math.floor(Math.random() * maxGrid);

    food = { x: newFoodX, y: newFoodY };

    // Check if food spawns on the snake
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === food.x && snake[i].y === food.y) {
            generateFood(); // Regenerate if it spawns on the snake
            return;
        }
    }
}

function changeDirection(event) {
    if (changingDirection || !gameStarted) return; // Prevent rapid changes and changes before start

    changingDirection = true; // Set flag

    const keyPressed = event.keyCode;
    const goingUp = direction === 'up';
    const goingDown = direction === 'down';
    const goingLeft = direction === 'left';
    const goingRight = direction === 'right';

    // Key codes: 37: Left, 38: Up, 39: Right, 40: Down
    if (keyPressed === 37 && !goingRight) {
        direction = 'left';
    } else if (keyPressed === 38 && !goingDown) {
        direction = 'up';
    } else if (keyPressed === 39 && !goingLeft) {
        direction = 'right';
    } else if (keyPressed === 40 && !goingUp) {
        direction = 'down';
    }
}

function checkCollision() {
    const head = snake[0];
    const maxGrid = canvasSize / gridSize;

    // Check collision with walls
    const hitLeftWall = head.x < 0;
    const hitRightWall = head.x >= maxGrid;
    const hitTopWall = head.y < 0;
    const hitBottomWall = head.y >= maxGrid;

    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
        return true;
    }

    // Check collision with self (starting from the 4th segment to avoid immediate self-collision)
    for (let i = 4; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

function gameOver() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    gameStarted = false;
    stopBackgroundMusic();
    playDeathSound();
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    alert(`Game Over! Your score: ${score}`);
    startButton.textContent = "Start Game";
}