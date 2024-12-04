// Select the canvas and set up the context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

// Game variables
let gameRunning = true;
let score = 0;
let highScore = localStorage.getItem('designDeliveryHighScore') || 0;
let lives = 3;

// Designer properties
const designerWidth = 50;
const designerHeight = 50;
let designerX = canvas.width / 2 - designerWidth / 2;
let designerY = canvas.height - designerHeight - 10; // Start near the bottom

// Numa properties
const numaWidth = 50;
const numaHeight = 50;
let numaX = canvas.width / 2 - numaWidth / 2 - 100; // Start near the top-left
let numaY = 10;

// Sam properties
const samWidth = 50;
const samHeight = 50;
let samX = canvas.width / 2 - samWidth / 2 + 100; // Start near the top-right
let samY = 10;

// Design asset properties
const assetWidth = 30;
const assetHeight = 30;
let carryingAsset = false;

// Production server properties
const serverWidth = 70;
const serverHeight = 70;
const serverX = canvas.width / 2 - serverWidth / 2;
const serverY = 10; // Server is at the top

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
  numaX = canvas.width / 2 - numaWidth / 2 - 100;
  numaY = 10;

  samX = canvas.width / 2 - samWidth / 2 + 100;
  samY = 10;
}

// Game update function
function update() {
  // Move Designer
  if (keys['ArrowLeft'] && designerX > 0) {
    designerX -= 5;
  }
  if (keys['ArrowRight'] && designerX < canvas.width - designerWidth) {
    designerX += 5;
  }
  if (keys['ArrowUp'] && designerY > 0) {
    designerY -= 5;
  }
  if (keys['ArrowDown'] && designerY < canvas.height - designerHeight) {
    designerY += 5;
  }

  // Move Numa (simple AI)
  if (designerX < numaX) {
    numaX -= 3;
  } else if (designerX > numaX) {
    numaX += 3;
  }

  if (designerY < numaY) {
    numaY -= 3;
  } else if (designerY > numaY) {
    numaY += 3;
  }

  // Move Sam (simple AI)
  if (designerX < samX) {
    samX -= 2.5;
  } else if (designerX > samX) {
    samX += 2.5;
  }

  if (designerY < samY) {
    samY -= 2.5;
  } else if (designerY > samY) {
    samY += 2.5;
  }

  // Collision detection with Numa
  if (
    designerX < numaX + numaWidth &&
    designerX + designerWidth > numaX &&
    designerY < numaY + numaHeight &&
    designerY + designerHeight > numaY
  ) {
    // Caught by Numa
    lives -= 1;
    try {
      caughtSound.play();
    } catch (e) {
      console.error('Error playing sound:', e);
    }
    carryingAsset = false;
    resetPositions();
    if (lives <= 0) {
      try {
        gameOverSound.play();
      } catch (e) {
        console.error('Error playing sound:', e);
      }
      gameRunning = false;
    }
  }

  // Collision detection with Sam
  if (
    designerX < samX + samWidth &&
    designerX + designerWidth > samX &&
    designerY < samY + samHeight &&
    designerY + designerHeight > samY
  ) {
    // Caught by Sam
    lives -= 1;
    try {
      caughtSound.play();
    } catch (e) {
      console.error('Error playing sound:', e);
    }
    carryingAsset = false;
    resetPositions();
    if (lives <= 0) {
      try {
        gameOverSound.play();
      } catch (e) {
        console.error('Error playing sound:', e);
      }
      gameRunning = false;
    }
  }

  // Picking up the design asset
  if (!carryingAsset) {
    if (
      designerX < canvas.width / 2 + assetWidth / 2 &&
      designerX + designerWidth > canvas.width / 2 - assetWidth / 2 &&
      designerY < canvas.height - assetHeight - 10 + assetHeight &&
      designerY + designerHeight > canvas.height - assetHeight - 10
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
      score += 1;
      try {
        deliverSound.play();
      } catch (e) {
        console.error('Error playing sound:', e);
      }
      resetPositions();
    }
  }
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

  // Draw production server
  if (serverImage.complete) {
    ctx.drawImage(serverImage, serverX, serverY, serverWidth, serverHeight);
  }

  // Draw design asset (if not picked up)
  if (!carryingAsset) {
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

  // Draw score and lives
  ctx.fillStyle = '#000000';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 30);
  ctx.fillText('Lives: ' + lives, 10, 60);
  ctx.fillText('High Score: ' + highScore, 10, 90);
}

// Game loop function
function gameLoop() {
  if (gameRunning) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  } else {
    // Game over
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('designDeliveryHighScore', highScore);
    }

    // Display Game Over Screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2 - 60);
    ctx.font = '30px Arial';
    ctx.fillText('Your Score: ' + score, canvas.width / 2 - 90, canvas.height / 2 - 20);
    ctx.fillText('High Score: ' + highScore, canvas.width / 2 - 100, canvas.height / 2 + 20);
    ctx.fillText('Press Enter to Restart', canvas.width / 2 - 130, canvas.height / 2 + 60);

    // Listen for Enter key to restart
    function restartGame(e) {
      if (e.code === 'Enter') {
        // Reset game variables
        gameRunning = true;
        score = 0;
        lives = 3;
        carryingAsset = false;
        resetPositions();
        // Remove the event listener to prevent multiple triggers
        document.removeEventListener('keydown', restartGame);
        // Restart the game loop
        gameLoop();
      }
    }
    document.addEventListener('keydown', restartGame);
  }
}

// Start the game
function startGame() {
  resetPositions();
  gameLoop();
}

startGame();
