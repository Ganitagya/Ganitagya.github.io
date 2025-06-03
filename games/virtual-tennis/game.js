// Game variables
var canvas;
var canvasContext;
var ballX = 50;
var ballY = 50;
var ballSpeedX = 10;
var ballSpeedY = 4;

var player1Score = 0;
var player2Score = 0;
var player1Sets = 0;
var player2Sets = 0;
var currentSet = 1;
const WINNING_SCORE = 3;
const MAX_SETS = 3;

var showingWinScreen = false;
var gameStarted = false;
var gameInterval;
var playerName = "";

var paddle1Y = 250;
var paddle2Y = 250;
var isTouching = false;

const PADDLE_HEIGHT = 100;
const PADDLE_THICKNESS = 10;

function updateScoreCard() {
    document.getElementById('player1Score').textContent = player1Score;
    document.getElementById('player2Score').textContent = player2Score;
    document.getElementById('setsScore').textContent = `${player1Sets} - ${player2Sets}`;
    document.getElementById('currentSet').textContent = `Set ${currentSet}`;
    console.log(`Current Set: ${currentSet}, Player Sets: ${player1Sets} - ${player2Sets}`);
}

function calculateMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;
    var mouseX = evt.clientX - rect.left - root.scrollLeft;
    var mouseY = evt.clientY - rect.top - root.scrollTop;
    return {
        x: mouseX,
        y: mouseY
    };
}

function handleMouseClick(_evt) {
    if (showingWinScreen) {
        if (currentSet > MAX_SETS) {
            // Reset everything for a new match
            player1Score = 0;
            player2Score = 0;
            player1Sets = 0;
            player2Sets = 0;
            currentSet = 1;
            updateScoreCard();
            showingWinScreen = false;
            
            // Show the player form again with the remembered name
            document.getElementById('playerForm').style.display = 'block';
            document.getElementById('gameContainer').style.display = 'none';
            document.getElementById('playerName').value = playerName; // Pre-fill the name
            gameStarted = false;
            document.getElementById('startButton').textContent = 'Start Game';
        } else {
            // Start a new set
            player1Score = 0;
            player2Score = 0;
            currentSet++;
            updateScoreCard();
            showingWinScreen = false;
            startGame();
        }
    }
}

function startGame() {
    const nameInput = document.getElementById('playerName');
    const playerForm = document.getElementById('playerForm');
    const gameContainer = document.getElementById('gameContainer');

    if (!gameStarted) {
        // Get player name
        playerName = nameInput.value.trim();
        if (!playerName) {
            alert('Please enter your name to start the game!');
            return;
        }

        // Update player name in score card
        document.getElementById('player1Name').textContent = playerName;

        // Hide form and show game
        playerForm.style.display = 'none';
        gameContainer.style.display = 'flex';

        gameStarted = true;
        document.getElementById('startButton').textContent = 'Stop Game';
        gameInterval = setInterval(function() {
            moveEverything();
            drawEverything();
        }, 1000 / 30);
    } else {
        stopGame();
    }
}

function stopGame() {
    gameStarted = false;
    clearInterval(gameInterval);
    document.getElementById('startButton').textContent = 'Start Game';
    // Draw paused state
    drawPausedScreen();
}

function drawPausedScreen() {
    colorRect(0, 0, canvas.width, canvas.height, 'black');
    canvasContext.fillStyle = 'white';
    canvasContext.textAlign = 'center';
    
    if (showingWinScreen) {
        // Show winner announcement
        const winner = player1Sets >= MAX_SETS ? playerName : 'COMPUTER';
        canvasContext.fillStyle = '#4CAF50';
        canvasContext.font = 'bold 40px Poppins';
        canvasContext.fillText(winner, canvas.width/2, canvas.height/2 - 20);
        canvasContext.fillStyle = 'white';
        canvasContext.font = '30px Poppins';
        canvasContext.fillText('WINS THE MATCH!', canvas.width/2, canvas.height/2 + 30);
        canvasContext.font = '20px Poppins';
        canvasContext.fillText('Click to play again', canvas.width/2, canvas.height/2 + 70);
    } else {
        // Show pause message
        canvasContext.fillText('Game Paused', canvas.width/2, canvas.height/2);
        canvasContext.font = '20px Poppins';
        canvasContext.fillText('Click Start Game to continue', canvas.width/2, canvas.height/2 + 40);
    }
}

function callBoth() {
    moveEverything();
    drawEverything();
}

function ballReset() {
    if (player1Score >= WINNING_SCORE || player2Score >= WINNING_SCORE) {
        // Update set scores
        if (player1Score >= WINNING_SCORE) {
            player1Sets++;
            console.log(`Player 1 won set ${currentSet}`);
        } else {
            player2Sets++;
            console.log(`Computer won set ${currentSet}`);
        }
        updateScoreCard();
        
        // Check if match is over (when total sets played equals MAX_SETS)
        if (currentSet >= MAX_SETS) {
            console.log(`Match over! Final score: ${player1Sets} - ${player2Sets}`);
            showingWinScreen = true;
            stopGame();
        } else {
            // Reset scores for new set
            player1Score = 0;
            player2Score = 0;
            currentSet++;
            console.log(`Starting set ${currentSet}`);
            updateScoreCard();
        }
    }

    ballSpeedX = -ballSpeedX;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
}

function computerMovement() {
    var paddle2YCentre = paddle2Y + (PADDLE_HEIGHT / 2);

    if (paddle2YCentre < ballY - 35) {
        paddle2Y += 6;
    } else if (paddle2YCentre > ballY + 35) {
        paddle2Y -= 6;
    }
}

function moveEverything() {
    if (showingWinScreen || !gameStarted) {
        return;
    }

    computerMovement();

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballX < 0) {
        if (ballY > paddle1Y && ballY < (paddle1Y + PADDLE_HEIGHT)) {
            ballSpeedX = -ballSpeedX;
            var deltaY = ballY - (paddle1Y + PADDLE_HEIGHT / 2);
            ballSpeedY = deltaY * 0.35;
        } else {
            player2Score++;
            updateScoreCard();
            ballReset();
        }
    }

    if (ballX > canvas.width) {
        if (ballY > paddle2Y && ballY < (paddle2Y + PADDLE_HEIGHT)) {
            ballSpeedX = -ballSpeedX;
            var deltaY = ballY - (paddle2Y + PADDLE_HEIGHT / 2);
            ballSpeedY = deltaY * 0.35;
        } else {
            player1Score++;
            updateScoreCard();
            ballReset();
        }
    }

    if (ballY > canvas.height || ballY < 0) {
        ballSpeedY = -ballSpeedY;
    }
}

function drawNet() {
    for (var i = 10; i < canvas.height; i += 40) {
        colorRect(canvas.width / 2 - 1, i, 2, 20, 'white');
    }
}

function drawEverything() {
    if (!gameStarted) {
        drawPausedScreen();
        return;
    }

    if (showingWinScreen) {
        drawPausedScreen();
        return;
    }

    // Clear the screen
    colorRect(0, 0, canvas.width, canvas.height, 'black');

    drawNet();

    // Draw paddles
    colorRect(0, paddle1Y, PADDLE_THICKNESS, PADDLE_HEIGHT, 'white');
    colorRect(canvas.width - PADDLE_THICKNESS, paddle2Y, PADDLE_THICKNESS, PADDLE_HEIGHT, 'white');

    // Draw ball
    colorCircle(ballX, ballY, 10, 'white');
}

function colorRect(leftX, topY, width, height, color) {
    canvasContext.fillStyle = color;
    canvasContext.fillRect(leftX, topY, width, height);
}

function colorCircle(centreX, centreY, radius, color) {
    canvasContext.fillStyle = color;
    canvasContext.beginPath();
    canvasContext.arc(centreX, centreY, radius, 0, Math.PI * 2, true);
    canvasContext.fill();
}

function handleTouchMove(evt) {
    if (!gameStarted || showingWinScreen) return;
    
    evt.preventDefault(); // Prevent scrolling while playing
    const touch = evt.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchY = touch.clientY - rect.top;
    
    // Calculate the center of the canvas
    const canvasCenter = canvas.height / 2;
    
    // Calculate the distance from touch to center and apply sensitivity multiplier
    const distanceFromCenter = touchY - canvasCenter;
    const sensitivityMultiplier = 2.5; // Increased sensitivity
    
    // Update paddle position with increased sensitivity
    paddle1Y = canvasCenter + (distanceFromCenter * sensitivityMultiplier) - (PADDLE_HEIGHT / 2);
    
    // Keep paddle within canvas bounds
    if (paddle1Y < 0) {
        paddle1Y = 0;
    } else if (paddle1Y + PADDLE_HEIGHT > canvas.height) {
        paddle1Y = canvas.height - PADDLE_HEIGHT;
    }
}

function handleTouchStart(evt) {
    if (!gameStarted || showingWinScreen) return;
    isTouching = true;
    handleTouchMove(evt);
}

function handleTouchEnd(evt) {
    if (!gameStarted || showingWinScreen) return;
    isTouching = false;
}

// Initialize the game when the window loads
window.onload = function() {
    canvas = document.getElementById("gameCanvas");
    canvasContext = canvas.getContext('2d');

    // Add click event listener to start button
    document.getElementById('startButton').addEventListener('click', startGame);

    // Mouse events
    canvas.addEventListener('mousedown', handleMouseClick);
    canvas.addEventListener('mousemove', function(evt) {
        if (!gameStarted || showingWinScreen) return;
        var mousePos = calculateMousePos(evt);
        paddle1Y = mousePos.y - (PADDLE_HEIGHT / 2);
        
        // Keep paddle within canvas bounds
        if (paddle1Y < 0) {
            paddle1Y = 0;
        } else if (paddle1Y + PADDLE_HEIGHT > canvas.height) {
            paddle1Y = canvas.height - PADDLE_HEIGHT;
        }
    });

    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Initialize score card
    updateScoreCard();
}; 