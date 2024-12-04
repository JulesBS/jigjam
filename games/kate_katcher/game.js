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
let kateSpeed = 7;

// Keyboard input
const keys = {};

// Falling items
const items = [];
let itemWidth = 40;
let itemHeight = 40;
let itemSpeed = 9;
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

// Event listeners for keyboard input and mouse movement
document.addEventListener('keydown', function (e) {
  keys[e.code] = true;
});

document.addEventListener('keyup', function (e) {
  keys[e.code] = false;
});

document.addEventListener('mousemove', function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  kateX = mouseX - kateWidth / 2;
  // Keep Kate within canvas bounds
  if (kateX < 0) kateX = 0;
  if (kateX > canvas.width - kateWidth) kateX = canvas.width - kateWidth;
});

// Resize canvas and adjust game elements
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
}

window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

function spawnItem() {
  const x = Math.random() * (canvas.width - itemWidth);
  const y = -itemHeight;
  const typeIndex = Math.floor(Math.random() * itemTypes.length);
  const itemValue = typeIndex + 1; // Assign value based on item type
  items.push({ x, y, image: itemTypes[typeIndex], value: itemValue });
}

function updateItems() {
  items.forEach((item, index) => {
    item.y += itemSpeed;

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
    ctx.drawImage(item.image, item.x, item.y, itemWidth, itemHeight);
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

  // Increase difficulty over time
  itemSpeed += 0.001; // Adjust the increment as needed

  // Spawn new items at intervals
  if (Math.random() < 0.02) {
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
    ctx.fillStyle = '#0080ff';
    ctx.fillRect(kateX, kateY, kateWidth, kateHeight);
  }

  // Draw items
  drawItems();

  // Draw score and lives
  ctx.fillStyle = '#000000';
  ctx.font = '20px Arial';
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
        itemSpeed = 2;
        items.length = 0; // Clear items
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
