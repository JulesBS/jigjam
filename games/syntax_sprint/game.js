// Get DOM elements
const menu = document.getElementById('menu');
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverMessage = document.getElementById('gameOverMessage');
const restartBtn = document.getElementById('restartBtn');

// Difficulty images
const easyImg = document.getElementById('easyImg');
const mediumImg = document.getElementById('mediumImg');
const hardImg = document.getElementById('hardImg');

// Game variables
let words = [];
let currentWordList = [];
let gameInterval;
let wordSpawnInterval;
let wordSpeed = 1;
let wordFrequency = 2000; // Time in milliseconds between new words
let isGameOver = false;
let score = 0;
let highScore = parseInt(localStorage.getItem('syntaxSprintHighScore')) || 0;

let effects = []; // Array to hold visual effects

// Resize canvas to fit 80% of window width
function resizeCanvas() {
  gameCanvas.width = window.innerWidth * 0.8;
  if (gameCanvas.width > 800) {
    gameCanvas.width = 800;
  }
  gameCanvas.height = 600;
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);

// Wrap text into lines
function wrapText(text, maxWidth) {
  const wordsArray = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < wordsArray.length; i++) {
    let testLine = currentLine + wordsArray[i] + ' ';
    ctx.font = '24px "Comic Sans MS"';
    let metrics = ctx.measureText(testLine);
    let testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      lines.push(currentLine.trim());
      currentLine = wordsArray[i] + ' ';
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine.trim());
  return lines;
}

// Word lists based on difficulty
const easyWords = ['Yes', 'No', 'Hello', 'Task 263', 'Thanks', 'No blocker'];
const mediumWords = [
  'Good meeting, everyone',
  "That's sick",
  'Love all this',
  'Follow the rat',
  'ARR looking good!',
  'Jig lunch today!',
];
const hardWords = [
  'We need to increase our MRR by optimizing the sales funnel',
  "Let's schedule a meeting to discuss agile sprint planning and KPIs",
  'Our Q3 OKRs focus on customer retention and upselling strategies',
  'Cross-functional synergy is essential for maximizing ROI in our projects',
  'Leveraging data analytics will drive better decision-making processes',
  'Implementing AI solutions can streamline our operational workflows significantly',
];

// Event listeners for difficulty selection
easyImg.addEventListener('click', () => startGame('easy'));
mediumImg.addEventListener('click', () => startGame('medium'));
hardImg.addEventListener('click', () => startGame('hard'));

// Event listener for restart button
restartBtn.addEventListener('click', () => {
  gameOverScreen.style.display = 'none';
  menu.style.display = 'block';
});

// Event listener for typing input
document.addEventListener('keydown', handleKeyDown);

// Function to start the game
function startGame(difficulty) {
  menu.style.display = 'none';
  gameCanvas.style.display = 'block';
  words = [];
  score = 0;
  isGameOver = false;
  wordSpeed = 1; // Reset word speed at the start of each game
  effects = []; // Reset effects

  // Set difficulty parameters
  switch (difficulty) {
    case 'easy':
      wordFrequency = 3000;
      currentWordList = easyWords;
      break;
    case 'medium':
      wordFrequency = 2500;
      currentWordList = mediumWords;
      break;
    case 'hard':
      wordFrequency = 2000;
      currentWordList = hardWords;
      break;
  }

  // Start spawning words
  gameInterval = setInterval(gameLoop, 30);
  spawnWord();
  wordSpawnInterval = setInterval(spawnWord, wordFrequency);
}

// Function to spawn a new word
function spawnWord() {
  const text = currentWordList[Math.floor(Math.random() * currentWordList.length)];

  // Wrap text into lines
  const maxLineWidth = 250; // Adjust as needed
  const lines = wrapText(text, maxLineWidth);

  const word = {
    text: text,
    lines: lines,
    x: Math.random() * (gameCanvas.width - maxLineWidth - 100) + 50, // Adjusted to fit canvas
    y: -50,
    progress: 0, // Track number of correctly typed characters
    angle: (Math.random() * 10 - 5) * (Math.PI / 180), // Random angle between -5 and +5 degrees in radians
  };
  words.push(word);
}

// Game loop
function gameLoop() {
  update();
  draw();
}

// Update game state
function update() {
  // Move words down
  words.forEach((word) => {
    word.y += wordSpeed;
    // Check if word has reached the bottom
    if (word.y > gameCanvas.height) {
      gameOver();
    }
  });

  // Remove completed words and update score
  words = words.filter((word) => {
    const totalTextLength = word.lines.join('').length;
    if (word.progress >= totalTextLength) {
      score += totalTextLength * 10;

      // Increase word speed after each successfully typed sentence
      wordSpeed += 0.2; // Adjust the increment value as needed
      if (wordSpeed > 10) wordSpeed = 10; // Optional: Cap the maximum speed

      // Create particle effect
      createParticleEffect(word);

      return false; // Remove word from array
    }
    return true;
  });

  // Update effects
  effects = effects.filter((effect) => {
    effect.update();
    return effect.alpha > 0; // Remove effect when transparent
  });
}

// Draw game elements
function draw() {
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Draw words
  words.forEach((word) => {
    ctx.save();

    // Apply rotation
    ctx.translate(word.x, word.y);
    ctx.rotate(word.angle);

    let totalProgress = 0; // Track total progress across lines
    let lineHeight = 30; // Adjust line height as needed

    for (let i = 0; i < word.lines.length; i++) {
      const line = word.lines[i];

      // Split line into typed and remaining parts
      const remainingChars = word.progress - totalProgress;
      const typedText = line.substring(0, remainingChars);
      const remainingText = line.substring(remainingChars);

      // Measure width of typed text
      ctx.font = '24px "Comic Sans MS"';
      const typedWidth = ctx.measureText(typedText).width;

      // Draw remaining text in grey
      ctx.fillStyle = '#888888'; // Grey color
      ctx.font = '24px "Comic Sans MS"';
      ctx.fillText(remainingText, typedWidth, i * lineHeight);

      // Draw typed text in black
      ctx.fillStyle = '#000000'; // Black color
      ctx.font = 'bold 24px "Comic Sans MS"';
      ctx.fillText(typedText, 0, i * lineHeight);

      totalProgress += line.length;
    }

    ctx.restore();
  });

  // Draw effects
  effects.forEach((effect) => {
    effect.draw();
  });

  // Draw score and high score
  ctx.fillStyle = '#000';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 30);
  ctx.fillText('High Score: ' + highScore, gameCanvas.width - 150, 30);
}

// Particle class for effects
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 5 + 2;
    this.color = 'rgba(255, 165, 0, 1)'; // Orange color
    this.speedX = Math.random() * 4 - 2;
    this.speedY = Math.random() * -4 - 1;
    this.gravity = 0.1;
    this.alpha = 1;
  }

  update() {
    this.speedY += this.gravity;
    this.x += this.speedX;
    this.y += this.speedY;
    this.alpha -= 0.02;
    if (this.alpha < 0) this.alpha = 0;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Function to create particle effect
function createParticleEffect(word) {
  const particlesCount = 30; // Adjust the number of particles
  const wordX = word.x;
  const wordY = word.y;

  for (let i = 0; i < particlesCount; i++) {
    const particle = new Particle(wordX, wordY);
    effects.push(particle);
  }
}

// Handle game over
function gameOver() {
  clearInterval(gameInterval);
  clearInterval(wordSpawnInterval);
  isGameOver = true;
  gameCanvas.style.display = 'none';
  gameOverScreen.style.display = 'block';
  gameOverMessage.textContent = 'Game Over! Your score: ' + score;

  // Update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('syntaxSprintHighScore', highScore);
    gameOverMessage.textContent += ' New High Score!';
  }
}

// Handle key presses
function handleKeyDown(e) {
  if (isGameOver) return;

  const typedChar = e.key;

  // If Enter is pressed, reset progress
  if (e.key === 'Enter') {
    // Reset progress for all words
    words.forEach((word) => {
      word.progress = 0;
    });
    return;
  }

  // Ignore non-character keys
  if (typedChar.length !== 1) return;

  // Convert typed character to lowercase for case-insensitive comparison
  const lowerTypedChar = typedChar.toLowerCase();

  // Sort words by their y position (descending) to prioritize words closer to the bottom
  const sortedWords = words.slice().sort((a, b) => b.y - a.y);

  // Check each word for a matching next character
  for (let word of sortedWords) {
    const totalText = word.lines.join('');
    const nextChar = totalText.charAt(word.progress);

    if (nextChar && nextChar.toLowerCase() === lowerTypedChar) {
      word.progress++;
      break; // Only advance one word per key press
    }
  }
}
