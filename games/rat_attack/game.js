// Game Variables
let score = 0;
let highScore = localStorage.getItem('ratAttackHighScore') || 0;
let timeLeft = 60; // Game duration in seconds
let gameInterval;
let countdownInterval;
const devHeads = [];
let gameOver = false;

// Initialize High Score Display
document.getElementById('high-score').innerText = highScore;

/**
 * Initializes the game by creating pipes and dev heads.
 */
function initializeGame() {
  // Create pipes and developer heads
  const gameContainer = document.getElementById('game-container');
  for (let i = 0; i < 4; i++) { // Number of pipes
    // Create pipe element
    const pipe = document.createElement('div');
    pipe.classList.add('pipe');
    
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
    
    // Append pipe to game container
    gameContainer.appendChild(pipe);
    
    // Store the dev head for later use
    devHeads.push(devHead);
  }
  
  // Add click event to game container to detect clicks outside pipes
  gameContainer.addEventListener('click', missClick);
  
  // Start the game
  startGame();
}

/**
 * Starts the game by resetting variables and starting intervals.
 */
function startGame() {
  score = 0;
  timeLeft = 60;
  gameOver = false;
  document.getElementById('score').innerText = score;
  document.getElementById('time-left').innerText = timeLeft;
  
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
  event.stopPropagation(); // Prevent missClick event

  // Check if the dev head is visible
  if (devHead.classList.contains('hidden')) {
    return; // Do nothing if dev head is not visible
  }

  // Increment the score
  score++;
  document.getElementById('score').innerText = score;

  // Add a 'whacked' class for feedback
  devHead.classList.add('whacked');

  // Remove 'whacked' class after effect
  setTimeout(() => {
    devHead.classList.remove('whacked');
  }, 200); // Adjust as needed

  // Hide the dev head
  devHead.classList.remove('pop-up');
  // Hide after the pop-down animation completes
  setTimeout(() => {
    devHead.classList.add('hidden');
  }, 200); // Should match the transition duration
}

/**
 * Handles clicks outside of developer heads (missed click).
 */
function missClick(event) {
  // Check if click is on a pipe or its children
  const pipe = event.target.closest('.pipe');
  if (pipe) {
    const devHead = pipe.querySelector('.dev-head');

    // If dev head is visible, we consider it a successful whack in whackDev
    if (!devHead.classList.contains('hidden')) {
      return; // Do nothing, as click should have been handled by whackDev
    }

    // Dev head is not visible, so it's a miss
  }

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
    startGame();
  }
}

// Listen for key presses to restart the game
document.addEventListener('keydown', restartGame);

// Start the game on page load
window.onload = initializeGame;
