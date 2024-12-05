// Select the canvas and set up the context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = true;
let score = 0;
let highScore = localStorage.getItem('salesFishHighScore') || 0;
let lives = 3;

// Boat properties (doubled in size)
const boatWidth = 400;
const boatHeight = 200;
let boatX = 0;
const boatY = 0; // Boat is at the top

// Fishing line properties
let lineX = 0;
let lineY = 0;
const lineWidth = 5;
let lineLength = 0; // Lengthens when casting
let isCasting = false;
let maxLineLength = 0;

// Keyboard input
const keys = {};

// Underwater clients (doubled in size)
const goodClients = [];
const badClients = [];
const clientWidth = 100;
const clientHeight = 100;
let clientSpeed = 2; // Speed at which clients move horizontally

// Load images
const boatImage = new Image();
boatImage.src = 'assets/boat.png';

const backgroundUnderwaterImage = new Image();
backgroundUnderwaterImage.src = 'assets/background_underwater.png';

// Load hook image
const hookImage = new Image();
hookImage.src = 'assets/hook.png';

// Load client images for different directions
const goodClientImagesRL = []; // Right to Left
const goodClientImagesLR = []; // Left to Right

for (let i = 1; i <= 5; i++) {
  const imgRL = new Image();
  imgRL.src = `assets/good_client_rl${i}.png`;
  goodClientImagesRL.push(imgRL);

  const imgLR = new Image();
  imgLR.src = `assets/good_client_lr${i}.png`;
  goodClientImagesLR.push(imgLR);
}

const badClientImagesRL = [];
const badClientImagesLR = [];

for (let i = 1; i <= 5; i++) {
  const imgRL = new Image();
  imgRL.src = `assets/bad_client_rl${i}.png`;
  badClientImagesRL.push(imgRL);

  const imgLR = new Image();
  imgLR.src = `assets/bad_client_lr${i}.png`;
  badClientImagesLR.push(imgLR);
}

// Load sounds
const catchGoodSound = new Audio('assets/catch_good.mp3');
const catchBadSound = new Audio('assets/catch_bad.mp3');
const gameOverSound = new Audio('assets/game_over.mp3');

// Event listeners for keyboard input
document.addEventListener('keydown', function (e) {
  keys[e.code] = true;

  // Start casting the line when Space is pressed
  if (e.code === 'Space' && !isCasting && lineLength === 0) {
    isCasting = true;
  }
});

document.addEventListener('keyup', function (e) {
  keys[e.code] = false;
});

// Adjust canvas size and game elements when the window is resized
function resizeCanvas() {
  const aspectRatio = 4 / 3;
  const width = window.innerWidth * 0.8;
  const height = width / aspectRatio;
  canvas.width = width;
  canvas.height = height;

  // Update max line length
  maxLineLength = canvas.height - boatHeight;

  // Adjust boat position
  boatX = canvas.width / 2 - boatWidth / 2;

  // Update line positions
  lineX = boatX + boatWidth / 2;
  lineY = boatY + boatHeight;
}

window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// Functions to manage clients
function spawnClients() {
  // Randomly decide to spawn good or bad client
  const isGoodClient = Math.random() < 0.6; // 60% chance to spawn good client
  const direction = Math.random() < 0.5 ? -1 : 1; // Random direction
  const x = direction === 1 ? -clientWidth : canvas.width;
  const minY = boatY + boatHeight + 50; // Start spawning below the boat
  const maxY = canvas.height - clientHeight - 50; // Avoid spawning off-screen
  const y = Math.random() * (maxY - minY) + minY;

  let image;
  if (isGoodClient) {
    if (direction === -1) {
      image = goodClientImagesRL[Math.floor(Math.random() * goodClientImagesRL.length)];
    } else {
      image = goodClientImagesLR[Math.floor(Math.random() * goodClientImagesLR.length)];
    }
    goodClients.push({ x, y, image, direction });
  } else {
    if (direction === -1) {
      image = badClientImagesRL[Math.floor(Math.random() * badClientImagesRL.length)];
    } else {
      image = badClientImagesLR[Math.floor(Math.random() * badClientImagesLR.length)];
    }
    badClients.push({ x, y, image, direction });
  }
}

function update() {
  // Move boat left and right
  if (keys['ArrowLeft'] && boatX > 0) {
    boatX -= 5;
  }
  if (keys['ArrowRight'] && boatX < canvas.width - boatWidth) {
    boatX += 5;
  }

  // Update lineX and lineY based on boat's position
  lineX = boatX + boatWidth / 2;
  lineY = boatY + boatHeight;

  // Update fishing line
  if (isCasting) {
    lineLength += 10; // Adjust speed of line extension
    if (lineLength >= maxLineLength) {
      isCasting = false;
    }
  } else if (lineLength > 0) {
    lineLength -= 10; // Retract the line
  }

  // Move good clients
  for (let i = goodClients.length - 1; i >= 0; i--) {
    const client = goodClients[i];
    client.x += client.direction * clientSpeed;

    // Remove client if off-screen
    if (client.direction === -1 && client.x + clientWidth < 0) {
      goodClients.splice(i, 1);
    } else if (client.direction === 1 && client.x > canvas.width) {
      goodClients.splice(i, 1);
    }
  }

  // Move bad clients
  for (let i = badClients.length - 1; i >= 0; i--) {
    const client = badClients[i];
    client.x += client.direction * clientSpeed;

    // Remove client if off-screen
    if (client.direction === -1 && client.x + clientWidth < 0) {
      badClients.splice(i, 1);
    } else if (client.direction === 1 && client.x > canvas.width) {
      badClients.splice(i, 1);
    }
  }

  // Check for collisions
  checkCollisions();

  // Spawn new clients at intervals
  if (Math.random() < 0.02) {
    spawnClients();
  }
}

function draw() {
  // Draw background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (backgroundUnderwaterImage.complete) {
    ctx.drawImage(backgroundUnderwaterImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#87CEEB'; // Sky blue placeholder
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw boat
  if (boatImage.complete) {
    ctx.drawImage(boatImage, boatX, boatY, boatWidth, boatHeight);
  } else {
    ctx.fillStyle = '#654321'; // Brown color as a placeholder
    ctx.fillRect(boatX, boatY, boatWidth, boatHeight);
  }

  // Draw fishing line
  if (lineLength > 0) {
    ctx.beginPath();
    ctx.moveTo(lineX, lineY);
    ctx.lineTo(lineX, lineY + lineLength);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    // Draw hook image at the end of the line
    if (hookImage.complete) {
      ctx.drawImage(hookImage, lineX - 15, lineY + lineLength - 15, 30, 30);
    }
  }

  // Draw good clients
  goodClients.forEach((client) => {
    if (client.image.complete) {
      ctx.drawImage(client.image, client.x, client.y, clientWidth, clientHeight);
    }
  });

  // Draw bad clients
  badClients.forEach((client) => {
    if (client.image.complete) {
      ctx.drawImage(client.image, client.x, client.y, clientWidth, clientHeight);
    }
  });

  // Draw score and lives
  ctx.fillStyle = '#000000';
  ctx.font = '24px Comic Sans MS';

  ctx.fillText('Score: ' + score, 10, 30);
  ctx.fillText('Lives: ' + lives, 10, 60);
  ctx.fillText('High Score: ' + highScore, 10, 90);
}

function checkCollisions() {
  // Only check for collisions if the line is extended
  if (lineLength > 0) {
    const hookX = lineX;
    const hookY = lineY + lineLength;

    // Check good clients
    for (let i = goodClients.length - 1; i >= 0; i--) {
      const client = goodClients[i];
      if (
        hookX < client.x + clientWidth &&
        hookX > client.x &&
        hookY > client.y &&
        hookY < client.y + clientHeight
      ) {
        // Caught a good client
        goodClients.splice(i, 1);
        score += 1;
        try {
          catchGoodSound.play();
        } catch (e) {
          console.error('Error playing sound:', e);
        }
        isCasting = false;
        lineLength = 0; // Retract the line
        break; // Only catch one client at a time
      }
    }

    // Check bad clients
    for (let i = badClients.length - 1; i >= 0; i--) {
      const client = badClients[i];
      if (
        hookX < client.x + clientWidth &&
        hookX > client.x &&
        hookY > client.y &&
        hookY < client.y + clientHeight
      ) {
        // Caught a bad client
        badClients.splice(i, 1);
        lives -= 1;
        try {
          catchBadSound.play();
        } catch (e) {
          console.error('Error playing sound:', e);
        }
        isCasting = false;
        lineLength = 0; // Retract the line
        if (lives <= 0) {
          try {
            gameOverSound.play();
          } catch (e) {
            console.error('Error playing sound:', e);
          }
          gameRunning = false;
        }
        break; // Only catch one client at a time
      }
    }
  }
}

function gameLoop() {
  if (gameRunning) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  } else {
    // Game over
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('salesFishHighScore', highScore);
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
        goodClients.length = 0;
        badClients.length = 0;
        lineLength = 0;
        isCasting = false;
        clientSpeed = 2;
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
  resizeCanvas();
  gameLoop();
}

startGame();
