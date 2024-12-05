// Game Variables
let score = 0;
let highScore = localStorage.getItem('ratAttackHighScore') || 0;
let timeLeft; // Initialize in startGame()
let gameInterval;
let countdownInterval;
const devHeads = [];
let gameOver = false;

// Sound Variables
const whackSounds = [
  new Audio('assets/whack1.mp3'),
  new Audio('assets/whack2.mp3'),
  new Audio('assets/whack3.mp3'),
  new Audio('assets/whack4.mp3'),
];

const startSound = new Audio('assets/start.mp3');
const endSound = new Audio('assets/end.mp3');

// Dev Head Images
const devHeadImages = [
  'assets/dev1.png',
  'assets/dev2.png',
  'assets/dev3.png',
  'assets/dev4.png',
  'assets/dev5.png',
  'assets/dev6.png',
  'assets/dev7.png',
];

const whackedImage = 'assets/dev-head-whacked.png';

// Initialize High Score Display
document.getElementById('high-score').innerText = highScore;

/**
 * Initializes the game by creating pipes and dev heads.
 */
function initializeGame() {
  // Clear existing pipes and dev heads if any
  const gameElements = document.getElementById('game-elements');
  gameElements.innerHTML = '';

  // Reset devHeads array
  devHeads.length = 0;

  // Create pipes and developer heads
  for (let i = 0; i < 4; i++) { // Number of pipes
    // Create pipe element
    const pipe = document.createElement('div');
    pipe.classList.add('pipe');

    // Position the pipe
    pipe.style.left = (50 + i * 200) + 'px'; // Adjust spacing as needed

    // Create pipe-back element
    const pipeBack = document.createElement('div');
    pipeBack.classList.add('pipe-back');

    // Create developer head element
    const devHead = document.createElement('div');
    devHead.classList.add('dev-head', 'hidden');

    // Create pipe-front element
    const pipeFront = document.createElement('div');
    pipeFront.classList.add('pipe-front');

    // Append elements to the pipe
    pipe.appendChild(pipeBack);
    pipe.appendChild(devHead);
    pipe.appendChild(pipeFront);

    // Add click event to pipe
    pipe.addEventListener('click', function(event) {
      whackDev(event, devHead);
    });

    // Append pipe to game elements
    gameElements.appendChild(pipe);

    // Store the dev head for later use
    devHeads.push(devHead);
  }

  // Start the game
  startGame();
}

/**
 * Sets up the miss click event listener.
 */
function setupMissClickListener() {
  const gameElements = document.getElementById('game-elements');
  gameElements.addEventListener('click', function(event) {
    // Check if click was on a pipe
    if (!event.target.closest('.pipe')) {
      missClick(event);
    }
  });
}

/**
 * Starts the game by resetting variables and starting intervals.
 */
function startGame() {
  score = 0;
  timeLeft = 45; // Game duration in seconds
  gameOver = false;
  document.getElementById('score').innerText = score;
  document.getElementById('time-left').innerText = timeLeft;

  // Play start sound
  startSound.play();

  // Start the countdown timer
  countdownInterval = setInterval(updateTimer, 1000);

  // Start the game loop
  gameInterval = setInterval(showDevHead, 1000); // Adjust the interval as needed
}

/**
 * Updates the countdown timer.
 */
function updateTimer() {
  timeLeft--;
  document.getElementById('time-left').innerText = timeLeft;

  if (timeLeft <= 0) {
    endGame();
  }
}

/**
 * Randomly shows a developer head popping up.
 */
function showDevHead() {
  // Randomly select a dev head to show
  const index = Math.floor(Math.random() * devHeads.length);
  const devHead = devHeads[index];

  // If the dev head is already visible, do nothing
  if (!devHead.classList.contains('hidden')) {
    return;
  }

  // Randomly select a dev head image
  const devImage = devHeadImages[Math.floor(Math.random() * devHeadImages.length)];
  devHead.style.backgroundImage = `url('${devImage}')`;

  // Show the dev head
  devHead.classList.remove('hidden');

  // Force reflow to ensure transition triggers
  void devHead.offsetWidth;

  // Add pop-up class to trigger the animation
  devHead.classList.add('pop-up');

  // Hide the dev head after a short time
  setTimeout(() => {
    devHead.classList.remove('pop-up');
    // Hide after the pop-down animation completes
    setTimeout(() => {
      devHead.classList.add('hidden');
    }, 200); // Should match the transition duration
  }, 800); // Duration dev head stays up
}

/**
 * Handles clicking on a developer head (successful whack).
 */
function whackDev(event, devHead) {
  // Prevent event from propagating to missClick
  event.stopPropagation();

  // Check if the dev head is visible
  if (devHead.classList.contains('hidden')) {
    // Missed click on the pipe when dev head is not visible
    missClick(event);
    return;
  }

  // Whack was successful
  // Increment the score
  score++;
  document.getElementById('score').innerText = score;

  // Add a 'whacked' class for feedback
  devHead.classList.add('whacked');

  // Change the image to the whacked image
  devHead.style.backgroundImage = `url('${whackedImage}')`;

  // Play a random whack sound
  const randomWhackSound = whackSounds[Math.floor(Math.random() * whackSounds.length)];
  randomWhackSound.play();

  // Remove 'whacked' class after effect
  setTimeout(() => {
    devHead.classList.remove('whacked');
    // Restore the dev head image
    devHead.style.backgroundImage = '';
  }, 200); // Adjust as needed

  // Hide the dev head
  devHead.classList.remove('pop-up');
  // Hide after the pop-down animation completes
  setTimeout(() => {
    devHead.classList.add('hidden');
  }, 200); // Should match the transition duration
}

/**
 * Handles missed clicks (clicks not on pipes).
 */
function missClick(event) {
  // Decrement the score
  score = Math.max(0, score - 1); // Ensure score doesn't go below zero
  document.getElementById('score').innerText = score;
}

/**
 * Ends the game and shows the game over overlay.
 */
function endGame() {
  gameOver = true;
  clearInterval(gameInterval);
  clearInterval(countdownInterval);

  // Play end sound
  endSound.play();

  // Update high score if necessary
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('ratAttackHighScore', highScore);
  }

  // Show game over overlay
  const overlay = document.getElementById('game-over-overlay');
  overlay.classList.remove('hidden');

  // Display final score and high score
  document.getElementById('final-score').innerText = score;
  document.getElementById('final-high-score').innerText = highScore;
}

/**
 * Restarts the game when the player presses Enter after game over.
 */
function restartGame(event) {
  if (gameOver && event.key === 'Enter') {
    // Hide game over overlay
    const overlay = document.getElementById('game-over-overlay');
    overlay.classList.add('hidden');

    // Reset game state
    initializeGame();
  }
}

// Listen for key presses to restart the game
document.addEventListener('keydown', restartGame);

// Start the game on page load
window.onload = function() {
  initializeGame();
  setupMissClickListener();
};
