// Select the canvas and set up the context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

// Game variables
let gameRunning = true;
let startTime;
let elapsedTime = 0; // Time in milliseconds
let highScore = localStorage.getItem('designDeliveryHighScore') || null;

// Designer properties
const designerWidth = 50;
const designerHeight = 50;
let designerX = canvas.width / 2 - designerWidth / 2;
let designerY = canvas.height - designerHeight - 10; // Start near the bottom
const designerSpeed = 5;

// Numa properties
const numaWidth = 50;
const numaHeight = 50;
let numaX;
let numaY;
let numaSpeed = 2.5;
let numaDirection = { x: 1, y: 1 };

// Sam properties
const samWidth = 50;
const samHeight = 50;
let samX;
let samY;
let samSpeed = 2.5;
let samDirection = { x: -1, y: 1 };

// Design asset properties
const assetWidth = 30;
const assetHeight = 30;
let carryingAsset = false;
let assetsDelivered = 0;
const totalAssets = 3;

// Production server properties
const serverWidth = 70;
const serverHeight = 70;
const serverX = canvas.width / 2 - serverWidth / 2;
const serverY = 10; // Server is at the top

// Obstacles
const obstacles = [];
const obstacleCount = 5; // Number of obstacles

// Keyboard input
const keys = {};

// Load images
const designerImage = new Image();
designerImage.src = 'assets/designer.png';

const numaImage = new Image();
numaImage.src = 'assets/numa.png';

const samImage = new Image();
samImage.src = 'assets/sam.png';

const assetImage = new Image();
assetImage.src = 'assets/design_asset.png';

const serverImage = new Image();
serverImage.src = 'assets/production_server.png';

const backgroundImage = new Image();
backgroundImage.src = 'assets/background.png';

const obstacleImage = new Image();
obstacleImage.src = 'assets/obstacle.png'; // Placeholder image for obstacles

// Load sounds (optional)
const pickupSound = new Audio('assets/pickup.mp3');
const deliverSound = new Audio('assets/deliver.mp3');
const caughtSound = new Audio('assets/caught.mp3');
const gameOverSound = new Audio('assets/game_over.mp3');

// Event listeners for keyboard input
document.addEventListener('keydown', function (e) {
  keys[e.code] = true;
});

document.addEventListener('keyup', function (e) {
  keys[e.code] = false;
});

// Adjust canvas size and game elements when the window is resized
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.8;
  canvas.height = window.innerHeight * 0.8;

  // Adjust positions based on new canvas size
  resetPositions();
}

window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// Helper function to reset positions
function resetPositions() {
  // Reset Designer position
  designerX = canvas.width / 2 - designerWidth / 2;
  designerY = canvas.height - designerHeight - 10;

  // Reset Numa and Sam positions
  numaX = 10;
  numaY = 10;
  numaDirection = { x: 1, y: 1 };

  samX = canvas.width - samWidth - 10;
  samY = 10;
  samDirection = { x: -1, y: 1 };

  // Reset obstacles
  obstacles.length = 0;
  for (let i = 0; i < obstacleCount; i++) {
    const obstacleWidth = 60;
    const obstacleHeight = 60;
    const obstacleX = Math.random() * (canvas.width - obstacleWidth);
    const obstacleY = Math.random() * (canvas.height - obstacleHeight - 100) + 100;
    obstacles.push({ x: obstacleX, y: obstacleY, width: obstacleWidth, height: obstacleHeight });
  }
}

// Game update function
function update() {
  // Update elapsed time
  elapsedTime = performance.now() - startTime;

  // Move Designer
  if (keys['ArrowLeft'] && designerX > 0) {
    designerX -= designerSpeed;
    if (checkCollisionWithObstacles(designerX, designerY, designerWidth, designerHeight)) {
      designerX += designerSpeed;
    }
  }
  if (keys['ArrowRight'] && designerX < canvas.width - designerWidth) {
    designerX += designerSpeed;
    if (checkCollisionWithObstacles(designerX, designerY, designerWidth, designerHeight)) {
      designerX -= designerSpeed;
    }
  }
  if (keys['ArrowUp'] && designerY > 0) {
    designerY -= designerSpeed;
    if (checkCollisionWithObstacles(designerX, designerY, designerWidth, designerHeight)) {
      designerY += designerSpeed;
    }
  }
  if (keys['ArrowDown'] && designerY < canvas.height - designerHeight) {
    designerY += designerSpeed;
    if (checkCollisionWithObstacles(designerX, designerY, designerWidth, designerHeight)) {
      designerY -= designerSpeed;
    }
  }

  // Move Numa
  moveEnemy('numa');

  // Move Sam
  moveEnemy('sam');

  // Collision detection with Numa
  if (
    designerX < numaX + numaWidth &&
    designerX + designerWidth > numaX &&
    designerY < numaY + numaHeight &&
    designerY + designerHeight > numaY
  ) {
    // Caught by Numa
    try {
      caughtSound.play();
    } catch (e) {
      console.error('Error playing sound:', e);
    }
    gameOver(false);
  }

  // Collision detection with Sam
  if (
    designerX < samX + samWidth &&
    designerX + designerWidth > samX &&
    designerY < samY + samHeight &&
    designerY + designerHeight > samY
  ) {
    // Caught by Sam
    try {
      caughtSound.play();
    } catch (e) {
      console.error('Error playing sound:', e);
    }
    gameOver(false);
  }

  // Picking up the design asset
  if (!carryingAsset && assetsDelivered < totalAssets) {
    const assetX = canvas.width / 2 - assetWidth / 2;
    const assetY = canvas.height - assetHeight - 10;
    if (
      designerX < assetX + assetWidth &&
      designerX + designerWidth > assetX &&
      designerY < assetY + assetHeight &&
      designerY + designerHeight > assetY
    ) {
      carryingAsset = true;
      try {
        pickupSound.play();
      } catch (e) {
        console.error('Error playing sound:', e);
      }
    }
  }

  // Delivering the design asset
  if (carryingAsset) {
    if (
      designerX < serverX + serverWidth &&
      designerX + designerWidth > serverX &&
      designerY < serverY + serverHeight &&
      designerY + designerHeight > serverY
    ) {
      carryingAsset = false;
      assetsDelivered += 1;
      try {
        deliverSound.play();
      } catch (e) {
        console.error('Error playing sound:', e);
      }
      resetPositions();
      if (assetsDelivered >= totalAssets) {
        // All assets delivered, game over
        gameOver(true);
      }
    }
  }
}

// Function to move enemies with obstacle avoidance and random behavior
function moveEnemy(enemy) {
  let enemyX, enemyY, enemyWidth, enemyHeight, enemySpeed, enemyDirection;

  if (enemy === 'numa') {
    enemyX = numaX;
    enemyY = numaY;
    enemyWidth = numaWidth;
    enemyHeight = numaHeight;
    enemySpeed = numaSpeed;
    enemyDirection = numaDirection;
  } else if (enemy === 'sam') {
    enemyX = samX;
    enemyY = samY;
    enemyWidth = samWidth;
    enemyHeight = samHeight;
    enemySpeed = samSpeed;
    enemyDirection = samDirection;
  }

  // Randomly change direction
  if (Math.random() < 0.02) {
    enemyDirection.x = Math.random() < 0.5 ? -1 : 1;
    enemyDirection.y = Math.random() < 0.5 ? -1 : 1;
  }

  // Move enemy
  enemyX += enemyDirection.x * enemySpeed;
  enemyY += enemyDirection.y * enemySpeed;

  // Check for collisions with obstacles
  if (checkCollisionWithObstacles(enemyX, enemyY, enemyWidth, enemyHeight)) {
    // Reverse direction on collision
    enemyDirection.x *= -1;
    enemyDirection.y *= -1;
    enemyX += enemyDirection.x * enemySpeed * 2;
    enemyY += enemyDirection.y * enemySpeed * 2;
  }

  // Keep enemy within bounds
  if (enemyX <= 0 || enemyX >= canvas.width - enemyWidth) {
    enemyDirection.x *= -1;
    enemyX += enemyDirection.x * enemySpeed * 2;
  }
  if (enemyY <= 0 || enemyY >= canvas.height - enemyHeight) {
    enemyDirection.y *= -1;
    enemyY += enemyDirection.y * enemySpeed * 2;
  }

  // Update enemy positions
  if (enemy === 'numa') {
    numaX = enemyX;
    numaY = enemyY;
    numaDirection = enemyDirection;
  } else if (enemy === 'sam') {
    samX = enemyX;
    samY = enemyY;
    samDirection = enemyDirection;
  }
}

// Check collision with obstacles
function checkCollisionWithObstacles(x, y, width, height) {
  for (let obstacle of obstacles) {
    if (
      x < obstacle.x + obstacle.width &&
      x + width > obstacle.x &&
      y < obstacle.y + obstacle.height &&
      y + height > obstacle.y
    ) {
      return true;
    }
  }
  return false;
}

// Game draw function
function draw() {
  // Draw background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (backgroundImage.complete) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#f0f0f0'; // Light gray placeholder
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw obstacles
  for (let obstacle of obstacles) {
    if (obstacleImage.complete) {
      ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    } else {
      ctx.fillStyle = '#8B4513'; // Brown color placeholder
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
  }

  // Draw production server
  if (serverImage.complete) {
    ctx.drawImage(serverImage, serverX, serverY, serverWidth, serverHeight);
  }

  // Draw design asset (if not picked up and assets remain)
  if (!carryingAsset && assetsDelivered < totalAssets) {
    if (assetImage.complete) {
      ctx.drawImage(
        assetImage,
        canvas.width / 2 - assetWidth / 2,
        canvas.height - assetHeight - 10,
        assetWidth,
        assetHeight
      );
    }
  }

  // Draw Designer
  if (designerImage.complete) {
    ctx.drawImage(designerImage, designerX, designerY, designerWidth, designerHeight);
  }

  // Draw Numa
  if (numaImage.complete) {
    ctx.drawImage(numaImage, numaX, numaY, numaWidth, numaHeight);
  }

  // Draw Sam
  if (samImage.complete) {
    ctx.drawImage(samImage, samX, samY, samWidth, samHeight);
  }

  // Draw timer
  ctx.fillStyle = '#000000';
  ctx.font = '20px Arial';
  ctx.fillText('Time: ' + (elapsedTime / 1000).toFixed(2) + 's', 10, 30);
  ctx.fillText('Assets Delivered: ' + assetsDelivered + '/' + totalAssets, 10, 60);

  // Draw high score if exists
  if (highScore !== null) {
    ctx.fillText('Best Time: ' + (highScore / 1000).toFixed(2) + 's', 10, 90);
  }
}

// Game over function
function gameOver(won) {
  gameRunning = false;

  if (won) {
    // Update high score if it's a new best time
    if (highScore === null || elapsedTime < highScore) {
      highScore = elapsedTime;
      localStorage.setItem('designDeliveryHighScore', highScore);
    }
  }

  // Display Game Over Screen
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.font = '40px Arial';
  if (won) {
    ctx.fillText('You Win!', canvas.width / 2 - 80, canvas.height / 2 - 60);
    ctx.font = '30px Arial';
    ctx.fillText('Your Time: ' + (elapsedTime / 1000).toFixed(2) + 's', canvas.width / 2 - 100, canvas.height / 2 - 20);
    ctx.fillText('Best Time: ' + (highScore / 1000).toFixed(2) + 's', canvas.width / 2 - 100, canvas.height / 2 + 20);
  } else {
    ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2 - 60);
    ctx.font = '30px Arial';
    ctx.fillText('You were caught!', canvas.width / 2 - 90, canvas.height / 2 - 20);
  }
  ctx.fillText('Press Enter to Restart', canvas.width / 2 - 130, canvas.height / 2 + 60);

  // Listen for Enter key to restart
  function restartGame(e) {
    if (e.code === 'Enter') {
      // Reset game variables
      gameRunning = true;
      elapsedTime = 0;
      carryingAsset = false;
      assetsDelivered = 0;
      resetPositions();
      startTime = performance.now();
      // Remove the event listener to prevent multiple triggers
      document.removeEventListener('keydown', restartGame);
      // Restart the game loop
      gameLoop();
    }
  }
  document.addEventListener('keydown', restartGame);
}

// Game loop function
function gameLoop() {
  if (gameRunning) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
}

// Start the game
function startGame() {
  resetPositions();
  startTime = performance.now();
  gameLoop();
}

startGame();
