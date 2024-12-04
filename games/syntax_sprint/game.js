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
  const word = {
    text: text,
    x: Math.random() * (gameCanvas.width - 300) + 50, // Adjusted to fit canvas
    y: -50,
    progress: 0, // Track number of correctly typed characters
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
    if (word.progress >= word.text.length) {
      score += word.text.length * 10;

      // Increase word speed after each successfully typed sentence
      wordSpeed += 0.2; // Adjust the increment value as needed
      if (wordSpeed > 10) wordSpeed = 10; // Optional: Cap the maximum speed

      return false; // Remove word from array
    }
    return true;
  });
}

// Draw game elements
function draw() {
  ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  // Draw words
  words.forEach((word) => {
    // Split the word into typed and remaining parts
    const typedText = word.text.substring(0, word.progress);
    const remainingText = word.text.substring(word.progress);

    // Measure the width of the typed text
    ctx.font = '24px "Comic Sans MS"';
    const typedWidth = ctx.measureText(typedText).width;

    // Draw remaining text in grey
    ctx.fillStyle = '#888888'; // Grey color
    ctx.font = '24px "Comic Sans MS"';
    ctx.fillText(remainingText, word.x + typedWidth, word.y);

    // Draw typed text in black
    ctx.fillStyle = '#000000'; // Black color
    ctx.font = 'bold 24px "Comic Sans MS"';
    ctx.fillText(typedText, word.x, word.y);
  });

  // Draw score and high score
  ctx.fillStyle = '#000';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 30);
  ctx.fillText('High Score: ' + highScore, gameCanvas.width - 150, 30);
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

  let foundMatch = false;

  // Sort words by their y position (descending) to prioritize words closer to the bottom
  const sortedWords = words.slice().sort((a, b) => b.y - a.y);

  // Check each word for a matching next character
  for (let word of sortedWords) {
    const nextChar = word.text.charAt(word.progress);

    if (nextChar && nextChar.toLowerCase() === lowerTypedChar) {
      word.progress++;
      foundMatch = true;
      break; // Only advance one word per key press
    }
  }

  // If no word was advanced, do nothing (incorrect character)
}
