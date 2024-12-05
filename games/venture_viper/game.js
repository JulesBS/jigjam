// Image Variables
const headImg = new Image();
headImg.src = 'assets/head.png'; // Ensure the path is correct

const foodImg = new Image();
foodImg.src = 'assets/food.png'; // Ensure the path is correct

const tailImg = new Image();
tailImg.src = 'assets/tail.png'; // Ensure the path is correct

const backgroundImg = new Image();
backgroundImg.src = 'assets/background.png'; // Ensure the path is correct

// Sound Variables
const startSound = new Audio('assets/start.mp3'); // Ensure the path is correct
const eatSound = new Audio('assets/eat.mp3');     // Ensure the path is correct
const gameOverSound = new Audio('assets/gameover.mp3'); // Ensure the path is correct

// Variables
let canvas;
let ctx;

// Grid Configuration
const gridX = 21; // Number of cells horizontally
const gridY = 14; // Number of cells vertically

// Game Variables
let gridSize; // Will be calculated based on canvas dimensions
let snake;
let direction;
let nextDirection;
let food = null; // Will be set after images are loaded
let score;
let gameOver = false; // Variable to track game over state

// High Score Initialization
let highScore = localStorage.getItem('ventureViperHighScore') || 0;

// Speed Variables
let snakeSpeed = 200; // Initial snake speed in ms
let foodSpeedFactor = 0.3; // Food moves at 30% of snake speed
let foodSpeed; // Will be calculated based on snakeSpeed and foodSpeedFactor
const speedIncreaseInterval = 10000; // Increase speed every 10 seconds
let lastSpeedIncreaseTime = 0;

let lastSnakeUpdateTime = 0;
let lastFoodUpdateTime = 0;

// Key Press Listener
document.addEventListener('keydown', changeDirection);

/**
 * Resizes the canvas and recalculates grid size.
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
 * Starts the game.
 */
function startGame() {
  gameOver = false;
  snakeSpeed = 200; // Reset snake speed
  foodSpeedFactor = 0.4; // Food moves at 30% of snake speed
  foodSpeed = snakeSpeed / foodSpeedFactor; // Food speed is slower than snake
  lastSpeedIncreaseTime = performance.now();
  lastSnakeUpdateTime = 0;
  lastFoodUpdateTime = 0;

  // Play start sound
  startSound.play();

  // Start the game loop
  requestAnimationFrame(gameLoop);
}

/**
 * The main game loop.
 */
function gameLoop(currentTime) {
  if (!gameOver) {
    if (!lastSnakeUpdateTime) lastSnakeUpdateTime = currentTime;
    if (!lastFoodUpdateTime) lastFoodUpdateTime = currentTime;

    const snakeDelta = currentTime - lastSnakeUpdateTime;
    const foodDelta = currentTime - lastFoodUpdateTime;
    const speedDelta = currentTime - lastSpeedIncreaseTime;

    // Update snake position based on snakeSpeed
    if (snakeDelta >= snakeSpeed) {
      updateSnake();
      lastSnakeUpdateTime = currentTime;
    }

    // Update food position based on foodSpeed
    if (foodDelta >= foodSpeed) {
      updateFood();
      lastFoodUpdateTime = currentTime;
    }

    // Increase speed over time
    if (speedDelta >= speedIncreaseInterval) {
      increaseSpeed();
      lastSpeedIncreaseTime = currentTime;
    }
  }

  draw();
  requestAnimationFrame(gameLoop);
}

/**
 * Updates the snake's position.
 */
function updateSnake() {
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

    // Play eat sound
    eatSound.play();
  } else {
    // Remove the tail segment if no food is eaten
    snake.pop();
  }
}

/**
 * Updates the food's position to move away from the snake.
 */
function updateFood() {
  const head = snake[0];
  let dx = food.x - head.x;
  let dy = food.y - head.y;

  // Determine the direction away from the snake's head
  let moveX = 0;
  let moveY = 0;

  if (dx < 0) {
    moveX = -1; // Move further left to move away from the snake
  } else if (dx > 0) {
    moveX = 1;  // Move further right to move away from the snake
  } else {
    moveX = Math.random() < 0.5 ? -1 : 1; // Random direction if aligned
  }

  if (dy < 0) {
    moveY = -1; // Move further up to move away from the snake
  } else if (dy > 0) {
    moveY = 1;  // Move further down to move away from the snake
  } else {
    moveY = Math.random() < 0.5 ? -1 : 1; // Random direction if aligned
  }

  // Randomly choose to move in x or y direction
  if (Math.abs(dx) > Math.abs(dy)) {
    food.x += moveX;
  } else if (Math.abs(dx) < Math.abs(dy)) {
    food.y += moveY;
  } else {
    // If distances are equal, randomly choose
    if (Math.random() < 0.5) {
      food.x += moveX;
    } else {
      food.y += moveY;
    }
  }

  // Ensure food stays within bounds
  if (food.x < 0) food.x = 0;
  if (food.x >= gridX) food.x = gridX - 1;
  if (food.y < 0) food.y = 0;
  if (food.y >= gridY) food.y = gridY - 1;

  // Avoid moving onto the snake's position
  if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
    // If collision with snake, try moving in the other direction
    if (Math.abs(dx) > Math.abs(dy)) {
      food.x -= moveX;
    } else if (Math.abs(dx) < Math.abs(dy)) {
      food.y -= moveY;
    } else {
      if (Math.random() < 0.5) {
        food.x -= moveX;
      } else {
        food.y -= moveY;
      }
    }

    // Check bounds again
    if (food.x < 0) food.x = 0;
    if (food.x >= gridX) food.x = gridX - 1;
    if (food.y < 0) food.y = 0;
    if (food.y >= gridY) food.y = gridY - 1;
  }
}

/**
 * Increases the speed of the snake and the food.
 */
function increaseSpeed() {
  // Decrease the interval to increase speed
  snakeSpeed = Math.max(snakeSpeed - 10, 50); // Minimum speed interval of 50ms
  foodSpeed = snakeSpeed / foodSpeedFactor; // Recalculate food speed
}

/**
 * Draws the game elements on the canvas.
 */
function draw() {
  // Draw Background Image
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

  // Draw Snake
  snake.forEach((segment, index) => {
    const posX = segment.x * gridSize;
    const posY = segment.y * gridSize;

    if (index === 0) {
      // Draw head image
      ctx.drawImage(headImg, posX, posY, gridSize, gridSize);
    } else {
      // Draw tail image
      ctx.drawImage(tailImg, posX, posY, gridSize, gridSize);
    }
  });

  // Draw Food as image
  if (food) {
    const foodPosX = food.x * gridSize;
    const foodPosY = food.y * gridSize;
    ctx.drawImage(foodImg, foodPosX, foodPosY, gridSize, gridSize);
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
  gameOver = true;

  // Update high score if necessary
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('ventureViperHighScore', highScore);
  }

  // Play game over sound
  gameOverSound.play();

  draw(); // Draw the game over overlay
}

/**
 * Resets the game state to initial values.
 */
function resetGame() {
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
 * Initializes the game by setting up the canvas and loading assets.
 */
function initializeGame() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');

  resizeCanvas(); // Initial canvas setup

  let assetsLoaded = 0;
  const totalAssets = 4; // headImg, foodImg, tailImg, backgroundImg

  // Image loading callbacks
  headImg.onload = checkAllAssetsLoaded;
  headImg.onerror = () => {
    console.error('Failed to load head.png');
    alert('Failed to load head.png. Please check the console for more details.');
  };

  foodImg.onload = checkAllAssetsLoaded;
  foodImg.onerror = () => {
    console.error('Failed to load food.png');
    alert('Failed to load food.png. Please check the console for more details.');
  };

  tailImg.onload = checkAllAssetsLoaded;
  tailImg.onerror = () => {
    console.error('Failed to load tail.png');
    alert('Failed to load tail.png. Please check the console for more details.');
  };

  backgroundImg.onload = checkAllAssetsLoaded;
  backgroundImg.onerror = () => {
    console.error('Failed to load background.png');
    alert('Failed to load background.png. Please check the console for more details.');
  };

  // Check if images are already loaded (from cache)
  if (headImg.complete) assetsLoaded++;
  if (foodImg.complete) assetsLoaded++;
  if (tailImg.complete) assetsLoaded++;
  if (backgroundImg.complete) assetsLoaded++;

  function checkAllAssetsLoaded() {
    assetsLoaded++;
    if (assetsLoaded === totalAssets) {
      resetGame(); // Start the game after images are loaded
    }
  }

  // If all images are already loaded, start the game
  if (assetsLoaded === totalAssets) {
    resetGame();
  }
}

// Start initialization after the DOM is fully loaded
window.onload = initializeGame;

// Handle window resize
window.addEventListener('resize', () => {
  resizeCanvas();
});
