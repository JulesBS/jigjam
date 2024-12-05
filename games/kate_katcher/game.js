// Select the canvas and set up the context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = true;
let score = 0;
let highScore = localStorage.getItem('kateKatcherHighScore') || 0;
let lives = 3;

// Player (Kate) properties
let kateWidth = 80;
let kateHeight = 80;
let kateX = 0;
let kateY = 0;
let kateSpeed = 10;

// Keyboard input
const keys = {};

// Falling items
const items = [];
let itemWidth = 40;
let itemHeight = 40;
// Removed global itemSpeed as each item will have its own speed
const itemTypes = []; // Array to hold item images

// Load images
const kateImage = new Image();
kateImage.src = 'assets/kate.png';

const backgroundImage = new Image();
backgroundImage.src = 'assets/background_kate.png';

// Load item images
for (let i = 1; i <= 15; i++) {
  const img = new Image();
  img.src = `assets/item${i}.png`;
  itemTypes.push(img);
}

// Load sounds
const catchSound = new Audio('assets/catch.mp3');
const missSound = new Audio('assets/miss.mp3');
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

// Disable mouse controls by removing/commenting out the mousemove event listener
// This ensures Kate is only controlled via keyboard
// If you had any other mouse controls, ensure they are removed or commented out
// Example:
// document.addEventListener('mousemove', function (e) {
//   const rect = canvas.getBoundingClientRect();
//   const mouseX = e.clientX - rect.left;
//   kateX = mouseX - kateWidth / 2;
//   // Keep Kate within canvas bounds
//   if (kateX < 0) kateX = 0;
//   if (kateX > canvas.width - kateWidth) kateX = canvas.width - kateWidth;
// });

// Adjust canvas size and game elements when the window is resized
function resizeCanvas() {
  const aspectRatio = 4 / 3;
  const width = window.innerWidth * 0.8;
  const height = width / aspectRatio;
  canvas.width = width;
  canvas.height = height;

  // Adjust Kate's size and position
  kateWidth = 80 * (canvas.width / 800) * 1.5; // Increased by 1.5x
  kateHeight = 80 * (canvas.height / 600) * 1.5;
  kateX = canvas.width / 2 - kateWidth / 2;
  kateY = canvas.height - kateHeight - 10;

  // Adjust item sizes
  itemWidth = 40 * (canvas.width / 800) * 2; // Increased by 2x
  itemHeight = 40 * (canvas.height / 600) * 2;

  // Update line positions if applicable (ensure variables are defined if needed)
  // lineX = kateX + kateWidth / 2;
  // lineY = kateY + kateHeight;
}

window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

// Function to spawn a new item with a randomized speed
function spawnItem() {
  const x = Math.random() * (canvas.width - itemWidth);
  const y = -itemHeight;
  const typeIndex = Math.floor(Math.random() * itemTypes.length);
  const itemValue = typeIndex + 1; // Assign value based on item type

  // Assign a random speed between 2 and 5 pixels per frame
  const speed = Math.random() * 3 + 2; // Random speed between 2 and 5

  items.push({ x, y, image: itemTypes[typeIndex], value: itemValue, speed });
}

function updateItems() {
  items.forEach((item, index) => {
    item.y += item.speed; // Use individual speed

    // Check for collision with Kate
    if (
      kateX < item.x + itemWidth &&
      kateX + kateWidth > item.x &&
      kateY < item.y + itemHeight &&
      kateY + kateHeight > item.y
    ) {
      // Caught the item
      items.splice(index, 1);
      score += 1;
      catchSound.play();
    } else if (item.y > canvas.height) {
      // Missed the item
      items.splice(index, 1);
      lives -= 1;
      missSound.play();
      if (lives <= 0) {
        gameOverSound.play();
        gameRunning = false;
      }
    }
  });
}

function drawItems() {
  items.forEach((item) => {
    if (item.image.complete) {
      ctx.drawImage(item.image, item.x, item.y, itemWidth, itemHeight);
    } else {
      // If the image hasn't loaded, draw a placeholder
      ctx.fillStyle = '#FF0000'; // Red placeholder
      ctx.fillRect(item.x, item.y, itemWidth, itemHeight);
    }
  });
}

function update() {
  // Move Kate with keyboard
  if (keys['ArrowLeft'] && kateX > 0) {
    kateX -= kateSpeed;
  }
  if (keys['ArrowRight'] && kateX < canvas.width - kateWidth) {
    kateX += kateSpeed;
  }

  // Update items
  updateItems();

  // Optional: Increase difficulty by spawning items more frequently or adjusting speed ranges
  // Currently, each item has its own speed, so no need to adjust a global speed

  // Spawn new items at intervals
  if (Math.random() < 0.02) { // Adjust spawn rate as needed
    spawnItem();
  }
}

function draw() {
  // Draw background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (backgroundImage.complete) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw Kate
  if (kateImage.complete) {
    ctx.drawImage(kateImage, kateX, kateY, kateWidth, kateHeight);
  } else {
    ctx.fillStyle = '#0080ff'; // Blue placeholder
    ctx.fillRect(kateX, kateY, kateWidth, kateHeight);
  }

  // Draw items
  drawItems();

  // Draw score and lives
  ctx.fillStyle = '#000000';
  ctx.font = '20px Comic Sans MS';
  ctx.fillText('Score: ' + score, 10, 30);
  ctx.fillText('Lives: ' + lives, 10, 60);
  ctx.fillText('High Score: ' + highScore, 10, 90);
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
      localStorage.setItem('kateKatcherHighScore', highScore);
    }

    // Display Game Over Screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px Comic Sans MS';
    ctx.textAlign = 'center'; // Center-align text for better positioning
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 60);
    ctx.font = '30px Comic Sans MS';
    ctx.fillText('Your Score: ' + score, canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillText('High Score: ' + highScore, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 2 + 60);

    // Listen for Enter key to restart
    function restartGame(e) {
      if (e.code === 'Enter') {
        // Reset game variables
        gameRunning = true;
        score = 0;
        lives = 3;
        items.length = 0; // Clear existing items
        kateX = canvas.width / 2 - kateWidth / 2; // Reset Kate's position
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
