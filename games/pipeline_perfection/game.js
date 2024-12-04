// DOM Elements
const integrityDisplay = document.getElementById('integrity');
const optimizationDisplay = document.getElementById('optimization');
const timeDisplay = document.getElementById('timeRemaining');
const modelsContainer = document.getElementById('modelsContainer');
const reviewContainer = document.getElementById('reviewContainer');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverMessage = document.getElementById('gameOverMessage');
const restartBtn = document.getElementById('restartBtn');

// Game Variables
let integrity = 100;
let optimization = 0;
let timeRemaining = 300; // 5 minutes in seconds
let gameInterval;
let modelIdCounter = 1;
const modelArrivalInterval = 5000; // New model every 5 seconds
const maxQueuePerStation = 3;
const modelIdleTimeLimit = 30; // 30 seconds
const stations = ['polygonReduction', 'pivotPoints', 'materialsTextures'];

// Initialize Game
function initGame() {
  integrity = 100;
  optimization = 0;
  timeRemaining = 300;
  modelIdCounter = 1;

  // Clear Containers
  modelsContainer.innerHTML = '';
  reviewContainer.innerHTML = '';

  // Clear all station queues
  stations.forEach(station => {
    const queue = document.getElementById(`${station}Queue`);
    queue.innerHTML = '';
  });

  // Hide Game Over Screen
  gameOverScreen.classList.add('hidden');

  // Start Timers
  clearInterval(gameInterval);
  clearInterval(modelArrivalTimer);
  gameInterval = setInterval(gameLoop, 1000); // Update every second

  // Start Model Arrival
  modelArrivalTimer = setInterval(generateModel, modelArrivalInterval);

  console.log('Game Initialized');
}

// Game Loop
function gameLoop() {
  timeRemaining--;
  updateTimeDisplay();

  if (timeRemaining <= 0) {
    endGame('Time\'s up! You failed to optimize all models.');
    return;
  }

  // Check for Idle Models
  stations.forEach(station => {
    const queue = document.getElementById(`${station}Queue`);
    queue.childNodes.forEach(modelDiv => {
      const idleTime = parseInt(modelDiv.getAttribute('data-idle-time'));
      if (!modelDiv.classList.contains('processing')) {
        modelDiv.setAttribute('data-idle-time', idleTime + 1);
        console.log(`Model ${modelDiv.getAttribute('data-model-id')} in ${formatStationName(station)} idle for ${idleTime + 1} seconds`);
        if (idleTime + 1 >= modelIdleTimeLimit) {
          endGame(`Model ${modelDiv.getAttribute('data-model-id')} in ${formatStationName(station)} has been idle for too long.`);
        }
      }
    });
  });
}

// Model Arrival Timer
let modelArrivalTimer;

// Generate a New Model
function generateModel() {
  const model = createModel(modelIdCounter++);
  displayModel(model);
  console.log(`Model ${model.id} Generated`);
}

// Create Model Object
function createModel(id) {
  const needs = {
    polygonReduction: Math.random() < 0.5, // 50% chance
    pivotPoints: Math.random() < 0.5,
    materialsTextures: Math.random() < 0.5
  };

  // Ensure at least one need is true to avoid models with no requirements
  if (!needs.polygonReduction && !needs.pivotPoints && !needs.materialsTextures) {
    const randomNeed = getRandomInt(0, 2);
    if (randomNeed === 0) needs.polygonReduction = true;
    else if (randomNeed === 1) needs.pivotPoints = true;
    else needs.materialsTextures = true;
  }

  return { id, needs };
}

// Display Model in Reception Area
function displayModel(model) {
  const modelDiv = document.createElement('div');
  modelDiv.classList.add('model');
  modelDiv.setAttribute('draggable', true);
  modelDiv.setAttribute('data-model-id', model.id);
  modelDiv.setAttribute('data-idle-time', '0');

  // Create Progress Bars
  const progressBarContainer = document.createElement('div');
  progressBarContainer.classList.add('progressBarContainer');

  ['polygonReduction', 'pivotPoints', 'materialsTextures'].forEach(requirement => {
    if (model.needs[requirement]) {
      const progressBar = document.createElement('div');
      progressBar.classList.add('progressBar');

      const fill = document.createElement('div');
      fill.classList.add('fill');
      progressBar.appendChild(fill);

      progressBarContainer.appendChild(progressBar);
    }
  });

  modelDiv.appendChild(progressBarContainer);

  // Display Needs as Title Tooltip
  let needsText = '';
  const needsArray = [];
  if (model.needs.polygonReduction) needsArray.push('Polygon Reduction');
  if (model.needs.pivotPoints) needsArray.push('Pivot Points & Parenting');
  if (model.needs.materialsTextures) needsArray.push('Materials & Textures');
  needsText = needsArray.join(', ');
  modelDiv.title = `Model ${model.id}: ${needsText}`;

  // Add Drag Event Listeners
  modelDiv.addEventListener('dragstart', dragStart);

  modelsContainer.appendChild(modelDiv);
}

// Drag Functions
function dragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.getAttribute('data-model-id'));
}

// Allow Drop on Stations
stations.forEach(station => {
  const queue = document.getElementById(`${station}Queue`);

  // Prevent default drag over behavior
  queue.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  // Handle Drop
  queue.addEventListener('drop', (e) => {
    e.preventDefault();
    const modelId = e.dataTransfer.getData('text/plain');
    assignModelToStation(modelId, station);
  });
});

// Assign Model to Station
function assignModelToStation(modelId, station) {
  const modelDiv = modelsContainer.querySelector(`.model[data-model-id='${modelId}']`);
  if (modelDiv) {
    const queue = document.getElementById(`${station}Queue`);

    // Check if Queue is Full
    if (queue.childNodes.length >= maxQueuePerStation) {
      alert(`Cannot assign Model ${modelId} to ${formatStationName(station)}. Queue is full.`);
      return;
    }

    // Move Model to Station Queue
    queue.appendChild(modelDiv);
    modelsContainer.removeChild(modelDiv);

    // Reset Idle Time
    modelDiv.setAttribute('data-idle-time', '0');

    // Start Processing
    startProcessing(modelDiv, station);
    console.log(`Model ${modelId} assigned to ${formatStationName(station)}`);
  }
}

// Start Processing a Model in Station
function startProcessing(modelDiv, station) {
  modelDiv.classList.add('processing');
  console.log(`Model ${modelDiv.getAttribute('data-model-id')} started processing at ${formatStationName(station)}`);

  // Initialize Progress Bars
  const progressBars = modelDiv.querySelectorAll('.progressBar .fill');
  progressBars.forEach(fill => {
    fill.style.width = '0%';
    fill.style.backgroundColor = '#000';
  });

  const processingTime = 10; // Processing time in seconds

  let currentSecond = 0;
  const progressInterval = setInterval(() => {
    currentSecond++;
    const progressPercentage = (currentSecond / processingTime) * 100;

    progressBars.forEach(fill => {
      if (progressPercentage >= 100) {
        fill.style.width = '100%';
        fill.style.backgroundColor = 'green';
      } else {
        fill.style.width = `${progressPercentage}%`;
      }
    });

    if (currentSecond >= processingTime) {
      clearInterval(progressInterval);
      modelDiv.classList.remove('processing');
      console.log(`Model ${modelDiv.getAttribute('data-model-id')} completed processing at ${formatStationName(station)}`);
      completeProcessing(modelDiv, station);
    }
  }, 1000); // Update every second
}

// Complete Processing a Model
function completeProcessing(modelDiv, station) {
  const modelId = modelDiv.getAttribute('data-model-id');

  // Determine Next Step
  const stationIndex = stations.indexOf(station);
  const isLastStation = stationIndex === stations.length - 1;

  if (!isLastStation) {
    // Move to Next Station
    const nextStation = stations[stationIndex + 1];
    const nextQueue = document.getElementById(`${nextStation}Queue`);

    if (nextQueue.childNodes.length >= maxQueuePerStation) {
      alert(`Cannot send Model ${modelId} to ${formatStationName(nextStation)}. Queue is full.`);
      return;
    }

    nextQueue.appendChild(modelDiv);
    modelDiv.setAttribute('data-idle-time', '0');

    // Start Processing at Next Station
    startProcessing(modelDiv, nextStation);
    console.log(`Model ${modelId} moved to ${formatStationName(nextStation)}`);
  } else {
    // Send to Client Review
    reviewContainer.appendChild(modelDiv);

    // Update Scores
    optimization += 10; // Arbitrary points per model
    updateStatusBar();
    console.log(`Model ${modelId} sent to Client Review. Optimization Points: ${optimization}`);

    // Remove Model from Station Queue
    const queue = document.getElementById(`${station}Queue`);
    queue.removeChild(modelDiv);

    // Optionally, check for win condition here
    // For example, after processing a certain number of models
  }
}

// Update Time Display
function updateTimeDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

// Format Station Name
function formatStationName(station) {
  switch (station) {
    case 'polygonReduction':
      return 'Polygon Reduction';
    case 'pivotPoints':
      return 'Pivot Points & Parenting';
    case 'materialsTextures':
      return 'Materials & Textures';
    default:
      return station;
  }
}

// Update Status Bar
function updateStatusBar() {
  integrityDisplay.textContent = integrity + '%';
  optimizationDisplay.textContent = optimization;
}

// End Game
function endGame(message) {
  clearInterval(gameInterval);
  clearInterval(modelArrivalTimer);
  gameOverMessage.textContent = message;
  gameOverScreen.classList.remove('hidden');
  console.log('Game Over:', message);
}

// Restart Game
restartBtn.addEventListener('click', initGame);

// Define getRandomInt Function
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; // Inclusive of min and max
}

// Start the Game on Page Load
window.onload = initGame;
