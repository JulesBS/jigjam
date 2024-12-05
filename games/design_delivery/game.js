// Select the canvas and set up the context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

// Game variables
let gameRunning = true;
let gameWon = false;
let startTime;
let elapsedTime = 0; // Time in milliseconds

// Parse highScore from localStorage
let highScore = localStorage.getItem('designDeliveryHighScore');
if (highScore !== null) {
  highScore = parseFloat(highScore);
} else {
  highScore = null;
}

// Designer properties
const designerWidth = 50;
const designerHeight = 50;
let designerX;
let designerY;
const designerSpeed = 5;

// Numa properties
const numaWidth = 100; // Doubled size
const numaHeight = 100;
let numaX;
let numaY;
const numaSpeed = 3; // Adjusted speed

// Sam properties
const samWidth = 100; // Doubled size
const samHeight = 100;
let samX;
let samY;
const samSpeed = 2; // Adjusted speed

// Design asset properties
const assetWidth = 60; // Doubled size
const assetHeight = 60;
let carryingAsset = false;
let assetsDelivered = 0;
const totalAssets = 3;
const designAssets = []; // Array to hold the assets

// Production server properties
const serverWidth = 70;
const serverHeight = 70;
let serverX;
let serverY;

// Obstacles
const obstacles = [];
const obstacleCount = 5; // Number of obstacles

// Keyboard input
const keys = {};

// Load images
const designerImage = new Image();
designerImage.src = 'assets/designer.png';

const designerCarryingImage = new Image();
designerCarryingImage.src = 'assets/designer_carrying.png';

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
  // Reset Designer position (start near assets)
  designerX = 100; // Start just to the right of the assets
  designerY = canvas.height / 2 - designerHeight / 2;

  // Reset Numa and Sam positions
  numaX = canvas.width / 2;
  numaY = 10;

  samX = canvas.width / 2;
  samY = canvas.height - samHeight - 10;

  // Set Production server position (right side)
  serverX = canvas.width - serverWidth - 10;
  serverY = canvas.height / 2 - serverHeight / 2;

  // Reset assets
  designAssets.length = 0;

  // Calculate starting y-coordinate to center the assets vertically
  const totalAssetHeight = totalAssets * assetHeight + (totalAssets - 1) * 20;
  const startY = canvas.height / 2 - totalAssetHeight / 2;

  for (let i = 0; i < totalAssets; i++) {
    designAssets.push({
      x: 30, // Adjust x to position assets near the center-left
      y: startY + i * (assetHeight + 20),
      collected: false,
    });
  }

  // Reset obstacles
  obstacles.length = 0;
  for (let i = 0; i < obstacleCount; i++) {
    const obstacleWidth = 60;
    const obstacleHeight = 60;
    const obstacleX = Math.random() * (canvas.width - obstacleWidth - 200) + 100;
    const obstacleY = Math.random() * (canvas.height - obstacleHeight - 100) + 50;
    obstacles.push({ x: obstacleX, y: obstacleY, width: obstacleWidth, height: obstacleHeight });
  }
}

// Game update function
function update() {
  // Update elapsed time
  elapsedTime = performance.now() - startTime;

  // Move Designer
  let prevDesignerX = designerX;
  let prevDesignerY = designerY;

  if (keys['ArrowLeft'] && designerX > 0) {
    designerX -= designerSpeed;
  }
  if (keys['ArrowRight'] && designerX < canvas.width - designerWidth) {
    designerX += designerSpeed;
  }
  if (keys['ArrowUp'] && designerY > 0) {
    designerY -= designerSpeed;
  }
  if (keys['ArrowDown'] && designerY < canvas.height - designerHeight) {
    designerY += designerSpeed;
  }

  // Check collision with obstacles for Designer
  if (checkCollisionWithObstacles(designerX, designerY, designerWidth, designerHeight)) {
    designerX = prevDesignerX;
    designerY = prevDesignerY;
  }

  // Move Numa towards the player
  moveEnemyTowardsPlayer('numa');

  // Move Sam towards the player
  moveEnemyTowardsPlayer('sam');

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

  // Picking up design assets
  if (!carryingAsset) {
    for (let asset of designAssets) {
      if (
        !asset.collected &&
        designerX < asset.x + assetWidth &&
        designerX + designerWidth > asset.x &&
        designerY < asset.y + assetHeight &&
        designerY + designerHeight > asset.y
      ) {
        carryingAsset = true;
        asset.collected = true;
        try {
          pickupSound.play();
        } catch (e) {
          console.error('Error playing sound:', e);
        }
        break; // Only pick up one asset at a time
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
      if (assetsDelivered >= totalAssets) {
        // All assets delivered, game over
        gameOver(true);
      }
    }
  }
}

// Function to move enemies towards the player (enemies ignore obstacles)
function moveEnemyTowardsPlayer(enemy) {
  let enemyX, enemyY, enemyWidth, enemyHeight, enemySpeed;

  if (enemy === 'numa') {
    enemyX = numaX;
    enemyY = numaY;
    enemyWidth = numaWidth;
    enemyHeight = numaHeight;
    enemySpeed = numaSpeed;
  } else if (enemy === 'sam') {
    enemyX = samX;
    enemyY = samY;
    enemyWidth = samWidth;
    enemyHeight = samHeight;
    enemySpeed = samSpeed;
  }

  // Move enemy towards the player
  if (designerX < enemyX) {
    enemyX -= enemySpeed;
  } else if (designerX > enemyX) {
    enemyX += enemySpeed;
  }

  if (designerY < enemyY) {
    enemyY -= enemySpeed;
  } else if (designerY > enemyY) {
    enemyY += enemySpeed;
  }

  // Enemies can now pass through obstacles (removed collision checks)

  // Update enemy positions
  if (enemy === 'numa') {
    numaX = enemyX;
    numaY = enemyY;
  } else if (enemy === 'sam') {
    samX = enemyX;
    samY = enemyY;
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
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameRunning) {
    // Draw background
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

    // Draw design assets
    for (let asset of designAssets) {
      if (!asset.collected) {
        if (assetImage.complete) {
          ctx.drawImage(assetImage, asset.x, asset.y, assetWidth, assetHeight);
        } else {
          ctx.fillStyle = '#FFD700'; // Gold color placeholder
          ctx.fillRect(asset.x, asset.y, assetWidth, assetHeight);
        }
      }
    }

    // Draw Designer
    if (designerImage.complete) {
      if (carryingAsset) {
        ctx.drawImage(designerCarryingImage, designerX, designerY, designerWidth, designerHeight);
      } else {
        ctx.drawImage(designerImage, designerX, designerY, designerWidth, designerHeight);
      }
    }

    // Draw Numa
    if (numaImage.complete) {
      ctx.drawImage(numaImage, numaX, numaY, numaWidth, numaHeight);
    }

    // Draw Sam
    if (samImage.complete) {
      ctx.drawImage(samImage, samX, samY, samWidth, samHeight);
    }

    // Draw timer and score
    ctx.fillStyle = '#000000';
    ctx.font = '20px Comic Sans MS';
    ctx.fillText('Time: ' + (elapsedTime / 1000).toFixed(2) + 's', 10, 30);
    ctx.fillText('Assets Delivered: ' + assetsDelivered + '/' + totalAssets, 10, 60);

    // Draw high score if exists
    if (highScore !== null) {
      ctx.fillText('Best Time: ' + (highScore / 1000).toFixed(2) + 's', 10, 90);
    }
  } else {
    // Draw game over screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px Comic Sans MS';
    if (gameWon) {
      ctx.fillText('You Win!', canvas.width / 2 - 80, canvas.height / 2 - 60);
      ctx.font = '30px Comic Sans MS';
      ctx.fillText('Your Time: ' + (elapsedTime / 1000).toFixed(2) + 's', canvas.width / 2 - 100, canvas.height / 2 - 20);
      ctx.fillText('Best Time: ' + (highScore / 1000).toFixed(2) + 's', canvas.width / 2 - 100, canvas.height / 2 + 20);
    } else {
      ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2 - 60);
      ctx.font = '30px Comic Sans MS';
      ctx.fillText('You were caught!', canvas.width / 2 - 90, canvas.height / 2 - 20);
    }
    ctx.fillText('Press Enter to Restart', canvas.width / 2 - 130, canvas.height / 2 + 60);
  }
}

// Game over function
function gameOver(won) {
  gameRunning = false;
  gameWon = won;

  if (won) {
    // Update high score if it's a new best time
    if (highScore === null || elapsedTime < highScore) {
      highScore = elapsedTime;
      localStorage.setItem('designDeliveryHighScore', highScore);
    }
  }

  // Play game over sound
  try {
    gameOverSound.play();
  } catch (e) {
    console.error('Error playing sound:', e);
  }

  // Listen for Enter key to restart
  function restartGame(e) {
    if (e.code === 'Enter') {
      // Reset game variables
      gameRunning = true;
      gameWon = false;
      elapsedTime = 0;
      carryingAsset = false;
      assetsDelivered = 0;
      resetPositions();
      startTime = performance.now();
      // Remove the event listener to prevent multiple triggers
      document.removeEventListener('keydown', restartGame);
      // Note: gameLoop continues running, so no need to restart it
    }
  }
  document.addEventListener('keydown', restartGame);
}

// Game loop function
function gameLoop() {
  if (gameRunning) {
    update();
  }
  draw();
  requestAnimationFrame(gameLoop);
}

// Start the game
function startGame() {
  resetPositions();
  startTime = performance.now();
  gameLoop();
}

startGame();
