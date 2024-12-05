// Get DOM elements
const gameBoard = document.getElementById('gameBoard');
const movesCounter = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const highScoreDisplay = document.getElementById('highScore');
const restartBtn = document.getElementById('restartBtn');

// Sound Variables
const startSound = new Audio('assets/start.mp3');     // Plays when the game starts/restarts
const endSound = new Audio('assets/end.mp3');         // Plays when the game ends
const mmhSound = new Audio('assets/mmh.mp3');         // Plays every 20 seconds during the game

let mmhInterval; // Interval ID for the mmh sound

// Game variables
let cardArray = [];
let firstCard, secondCard;
let hasFlippedCard = false;
let lockBoard = false;
let moves = 0;
let timer;
let timeElapsed = 0;
let matchedPairs = 0;
let totalPairs = 8;
let highScore = parseInt(localStorage.getItem('invoiceInvestigationHighScore')) || 0;

// Images array (Place your image paths here)
const images = [
  'assets/invoice1.png',
  'assets/invoice2.png',
  'assets/invoice3.png',
  'assets/invoice4.png',
  'assets/invoice5.png',
  'assets/invoice6.png',
  'assets/invoice7.png',
  'assets/invoice8.png'
];

// Initialize game
function initGame() {
  moves = 0;
  timeElapsed = 0;
  matchedPairs = 0;
  movesCounter.textContent = 'Moves: 0';
  timerDisplay.textContent = 'Time: 0s';
  gameOverScreen.style.display = 'none';
  gameBoard.innerHTML = '';
  resetBoard();
  createCards();
  startTimer();

  // Play start sound
  startSound.play();

  // Start mmh sound interval
  mmhInterval = setInterval(() => {
    mmhSound.play();
  }, 20000); // Play every 20 seconds
}

// Create card elements
function createCards() {
  // Duplicate images array to create pairs
  const gameImages = images.concat(images);
  shuffle(gameImages);

  gameImages.forEach((imgSrc) => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.image = imgSrc;

    const frontFace = document.createElement('div');
    frontFace.classList.add('front');

    const backFace = document.createElement('div');
    backFace.classList.add('back');
    const img = document.createElement('img');
    img.src = imgSrc;
    backFace.appendChild(img);

    card.appendChild(frontFace);
    card.appendChild(backFace);

    card.addEventListener('click', flipCard);

    gameBoard.appendChild(card);
  });
}

// Shuffle function
function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

// Flip card
function flipCard() {
  if (lockBoard || this === firstCard) return;

  this.classList.add('flipped');

  if (!hasFlippedCard) {
    // First click
    hasFlippedCard = true;
    firstCard = this;
  } else {
    // Second click
    hasFlippedCard = false;
    secondCard = this;
    moves++;
    movesCounter.textContent = `Moves: ${moves}`;
    checkForMatch();
  }
}

// Check for match
function checkForMatch() {
  let isMatch = firstCard.dataset.image === secondCard.dataset.image;

  if (isMatch) {
    disableCards();
    matchedPairs++;
    if (matchedPairs === totalPairs) {
      setTimeout(endGame, 1000);
    }
  } else {
    unflipCards();
  }
}

// Disable cards on match
function disableCards() {
  // Remove event listeners to make them non-clickable
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);

  // Change images to approved.png
  const firstBackImg = firstCard.querySelector('.back img');
  const secondBackImg = secondCard.querySelector('.back img');
  firstBackImg.src = 'assets/approved.png';
  secondBackImg.src = 'assets/approved.png';

  // Add matched class to prevent pointer events
  firstCard.classList.add('matched');
  secondCard.classList.add('matched');

  resetBoard();
}

// Unflip cards on mismatch
function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetBoard();
  }, 1000);
}

// Reset board variables
function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

// Timer function
function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeElapsed++;
    timerDisplay.textContent = `Time: ${timeElapsed}s`;
  }, 1000);
}

// End game
function endGame() {
  clearInterval(timer);
  clearInterval(mmhInterval); // Stop the mmh sound interval

  // Play end sound
  endSound.play();

  let finalScore = Math.max(1000 - moves * 10 - timeElapsed * 2, 0);
  finalScoreDisplay.textContent = finalScore;
  highScoreDisplay.textContent = highScore;

  // Update high score
  if (finalScore > highScore) {
    highScore = finalScore;
    localStorage.setItem('invoiceInvestigationHighScore', highScore);
    highScoreDisplay.textContent = highScore;
  }

  gameOverScreen.style.display = 'flex';
}

// Event listener for restart button
restartBtn.addEventListener('click', () => {
  initGame();
});

// Start the game
initGame();
