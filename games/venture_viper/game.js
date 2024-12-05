// Image Variables
const headImg = new Image();
headImg.src = 'assets/head.png'; // Ensure the path is correct

// Variables
let canvas;
let ctx;

// Grid Configuration
const gridX = 30; // Number of cells horizontally
const gridY = 20; // Number of cells vertically

// Game Variables
let gridSize; // Will be calculated based on canvas dimensions
let snake;
let direction;
let nextDirection;
let food = null; // Will be set after images are loaded
let score;
let gameInterval;
let gameOver = false; // Variable to track game over state

// High Score Initialization
let highScore = localStorage.getItem('ventureViperHighScore') || 0;

// Key Press Listener
document.addEventListener('keydown', changeDirection);

/**
 * Resizes the canvas and recalculates grid size.
 * Should be called before the game starts and optionally on window resize.
 */
function resizeCanvas() {
  // Set canvas width to 80% of viewport width
  const newWidth = window.innerWidth * 0.8;
  const newHeight = (newWidth / gridX) * gridY;

  canvas.width = newWidth;
  canvas.height = newHeight;

  // Calculate grid size based on canvas dimensions
  gridSize = canvas.width / gridX;

  // Redraw the current game state if food is set
  if (food) {
    draw();
  }
}

/**
 * Starts the game loop.
 */
function startGame() {
  gameOver = false;
  gameInterval = setInterval(gameLoop, 200); // Game updates every 200ms
}

/**
 * The main game loop.
 */
function gameLoop() {
  if (!gameOver) {
    update();
  }
  draw();
}

/**
 * Updates the game state.
 */
function update() {
  // Update direction
  direction = nextDirection;

  // Calculate new head position (in grid coordinates)
  const head = { ...snake[0] };
  switch (direction) {
    case 'LEFT':
      head.x -= 1;
      break;
    case 'UP':
      head.y -= 1;
      break;
    case 'RIGHT':
      head.x += 1;
      break;
    case 'DOWN':
      head.y += 1;
      break;
  }

  // Check for wall collision
  if (head.x < 0 || head.x >= gridX || head.y < 0 || head.y >= gridY) {
    endGame();
    return;
  }

  // Check for self-collision
  for (let segment of snake) {
    if (head.x === segment.x && head.y === segment.y) {
      endGame();
      return;
    }
  }

  // Add new head to the snake
  snake.unshift(head);

  // Check for food collision
  if (head.x === food.x && head.y === food.y) {
    score += 1;
    updateScoreDisplay();
    food = generateFood();
  } else {
    // Remove the tail segment if no food is eaten
    snake.pop();
  }
}

/**
 * Draws the game elements on the canvas.
 */
function draw() {
  // Clear Canvas
  ctx.fillStyle = '#34495e'; // Background color
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Snake
  snake.forEach((segment, index) => {
    const posX = segment.x * gridSize;
    const posY = segment.y * gridSize;

    if (index === 0) {
      // Draw head image
      ctx.drawImage(headImg, posX, posY, gridSize, gridSize);
    } else {
      // Draw tail segments as green squares
      ctx.fillStyle = 'green';
      ctx.fillRect(posX, posY, gridSize, gridSize);
    }
  });

  // Draw Food as red square
  if (food) {
    const foodPosX = food.x * gridSize;
    const foodPosY = food.y * gridSize;
    ctx.fillStyle = 'red';
    ctx.fillRect(foodPosX, foodPosY, gridSize, gridSize);
  }

  // Draw Game Over Overlay
  if (gameOver) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = `${gridSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - gridSize * 2);
    ctx.fillText(`Your Score: ${score}`, canvas.width / 2, canvas.height / 2 - gridSize);
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 2 + gridSize * 2);
  }
}

/**
 * Changes the direction of the snake based on user input.
 * Prevents the snake from reversing directly.
 */
function changeDirection(event) {
  const keyPressed = event.key;

  if (gameOver && keyPressed === 'Enter') {
    resetGame();
    return;
  }

  switch (keyPressed) {
    case 'ArrowUp':
      if (direction !== 'DOWN') {
        nextDirection = 'UP';
      }
      break;
    case 'ArrowDown':
      if (direction !== 'UP') {
        nextDirection = 'DOWN';
      }
      break;
    case 'ArrowLeft':
      if (direction !== 'RIGHT') {
        nextDirection = 'LEFT';
      }
      break;
    case 'ArrowRight':
      if (direction !== 'LEFT') {
        nextDirection = 'RIGHT';
      }
      break;
  }
}

/**
 * Generates a new food position ensuring it doesn't overlap with the snake.
 * @returns {Object} The new food's position.
 */
function generateFood() {
  let newFood;
  let collision = true;

  while (collision) {
    newFood = {
      x: Math.floor(Math.random() * gridX),
      y: Math.floor(Math.random() * gridY),
    };

    // Check for collision with the snake
    collision = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
  }

  return newFood;
}

/**
 * Updates the score and high score display.
 */
function updateScoreDisplay() {
  const scoreBoard = document.getElementById('scoreBoard');
  scoreBoard.innerText = `Score: ${score} | High Score: ${highScore}`;
}

/**
 * Ends the game and handles game over logic.
 */
function endGame() {
  clearInterval(gameInterval);
  gameOver = true;

  // Update high score if necessary
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('ventureViperHighScore', highScore);
  }

  draw(); // Draw the game over overlay
}

/**
 * Resets the game state to initial values.
 */
function resetGame() {
  clearInterval(gameInterval); // Clear any existing game intervals
  gameOver = false;
  snake = [
    { x: Math.floor(gridX / 2), y: Math.floor(gridY / 2) },
  ];
  direction = 'RIGHT';
  nextDirection = 'RIGHT';
  score = 0;
  updateScoreDisplay();
  food = generateFood();
  draw(); // Initial draw after resetting
  startGame();
}

/**
 * Initializes the game by setting up the canvas.
 */
function initializeGame() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');

  resizeCanvas(); // Initial canvas setup

  // Wait for the head image to load before starting the game
  headImg.onload = () => {
    resetGame(); // Start the game after images are loaded
  };

  headImg.onerror = () => {
    console.error('Failed to load head.png');
    alert('Failed to load head.png. Please check the console for more details.');
  };

  // If the image is already loaded (from cache), start the game immediately
  if (headImg.complete) {
    headImg.onload();
  }
}

// Start initialization after the DOM is fully loaded
window.onload = initializeGame;

// Handle window resize
window.addEventListener('resize', () => {
  resizeCanvas();
});
