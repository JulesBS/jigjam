// Toggle the central logo image on click
document.getElementById('logo-image').addEventListener('click', function() {
  const logo = this;
  if (logo.src.includes('logo.png')) {
    logo.src = 'assets/logo2.png';
  } else {
    logo.src = 'assets/logo.png';
  }
});

// Game data
const games = {
  1: {
    name: 'Prospection Pond',
    image: 'assets/game1_panel.png', // Your panel image for game 1
    url: 'games/sales_fish/index.html'
  },
  2: {
    name: 'Frantic Frontend',
    image: 'assets/game2_panel.png',
    url: 'games/kate_katcher/index.html'
  },
  3: {
    name: 'Design Delivery',
    image: 'assets/game3_panel.png',
    url: 'games/design_delivery/index.html'
  },
  4: {
    name: 'Syntax Sprint',
    image: 'assets/game4_panel.png',
    url: 'games/syntax_sprint/index.html'
  },
  5: {
    name: 'Invoice Investigation',
    image: 'assets/game5_panel.png',
    url: 'games/invoice_investigation/index.html'
  },
  6: {
    name: 'Venture Viper',
    image: 'assets/game6_panel.png',
    url: 'games/venture_viper/index.html'
  },
  7: {
    name: 'Rat Attack',
    image: 'assets/game7_panel.png',
    url: 'games/rat_attack/index.html'
  }
};

// Get modal elements
const modalOverlay = document.getElementById('modal-overlay');
const modalImage = document.getElementById('modal-image');
const playButton = document.getElementById('play-button');

// Add event listeners to game buttons
const gameButtons = document.querySelectorAll('.game-button');
gameButtons.forEach(button => {
  button.addEventListener('click', () => {
    const gameId = button.getAttribute('data-game');
    const game = games[gameId];

    // Update modal content
    modalImage.src = game.image;
    playButton.setAttribute('data-url', game.url);

    // Show modal
    modalOverlay.style.display = 'flex';
  });
});

// Play button event listener
playButton.addEventListener('click', () => {
  const gameUrl = playButton.getAttribute('data-url');
  window.location.href = gameUrl;
});

// Hide modal when clicking outside modal content
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.style.display = 'none';
  }
});