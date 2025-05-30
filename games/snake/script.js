const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const scoreValue = document.getElementById('scoreValue');

const gridSize = 20; // Size of each cell (20px by 20px)
const partRadius = 8; // Radius for circular snake parts and food (smaller than half gridSize)
const canvasSize = canvas.width; // 400x400

let snake = [
    { x: 10, y: 10 } // Initial position of the snake head
];
let food = {};
let direction = 'right'; // Initial direction
let changingDirection = false; // Flag to prevent rapid direction changes
let score = 0;
let gameInterval;
let gameSpeed = 150; // Milliseconds per frame (lower is faster)
let gameStarted = false;

// --- Game Initialization and Control ---

function initializeGame() {
    snake = [
        { x: 10, y: 10 }
    ];
    direction = 'right';
    score = 0;
    scoreValue.textContent = score;
    changingDirection = false;
    gameSpeed = 150; // Reset speed
    generateFood();
    if (gameInterval) clearInterval(gameInterval); // Clear any existing interval
    draw(); // Initial draw
}

startButton.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        startButton.textContent = "Restart Game"; // Change button text
        initializeGame();
        startGameLoop();
    } else {
        // If game is already running, just restart
        initializeGame();
        startGameLoop();
    }
});

document.addEventListener('keydown', changeDirection);

function startGameLoop() {
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameTick, gameSpeed);
}

// --- Game Loop ---
function gameTick() {
    if (!gameStarted) return; // Don't run game tick if not started

    changingDirection = false; // Allow direction changes for the next tick

    const head = { x: snake[0].x, y: snake[0].y }; // Get current head position

    // Move the head in the current direction
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }

    // Add new head to the beginning of the snake array
    snake.unshift(head);

    // Check for collision with food
    const didEatFood = head.x === food.x && head.y === food.y;
    if (didEatFood) {
        score += 10;
        scoreValue.textContent = score;
        generateFood();
        // Increase speed slightly with each food eaten
        if (gameSpeed > 50) { // Don't go below 50ms
            gameSpeed -= 5;
            startGameLoop(); // Restart interval with new speed
        }
    } else {
        // Remove the tail if no food was eaten
        snake.pop();
    }

    if (checkCollision()) {
        gameOver();
        return; // Stop further execution
    }

    draw();
}

// --- Drawing Functions ---
function draw() {
    ctx.clearRect(0, 0, canvasSize, canvasSize); // Clear the canvas

    drawFood();
    drawSnake();
}

function drawSnakePart(snakePart) {
    ctx.fillStyle = '#4CAF50'; // Green
    ctx.strokeStyle = '#388E3C'; // Darker green border

    // Calculate center of the grid cell for drawing circle
    const centerX = snakePart.x * gridSize + gridSize / 2;
    const centerY = snakePart.y * gridSize + gridSize / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, partRadius, 0, 2 * Math.PI); // Draw a circle
    ctx.fill();
    ctx.stroke();
}

function drawSnake() {
    snake.forEach(drawSnakePart);
}

function drawFood() {
    ctx.fillStyle = '#FFC107'; // Yellow/Orange
    ctx.strokeStyle = '#FF8F00'; // Darker orange border

    // Calculate center of the grid cell for drawing circle
    const centerX = food.x * gridSize + gridSize / 2;
    const centerY = food.y * gridSize + gridSize / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, partRadius, 0, 2 * Math.PI); // Draw a circle
    ctx.fill();
    ctx.stroke();
}

// --- Game Logic ---
function generateFood() {
    // Generate random coordinates for food within the grid
    let newFoodX = Math.floor(Math.random() * (canvasSize / gridSize));
    let newFoodY = Math.floor(Math.random() * (canvasSize / gridSize));

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

    // Check collision with walls
    const hitLeftWall = head.x < 0;
    const hitRightWall = head.x >= canvasSize / gridSize;
    const hitTopWall = head.y < 0;
    const hitBottomWall = head.y >= canvasSize / gridSize;

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
    clearInterval(gameInterval);
    gameStarted = false; // Reset game started flag
    alert(`Game Over! Your score: ${score}`);
    startButton.textContent = "Start Game"; // Reset button text
}