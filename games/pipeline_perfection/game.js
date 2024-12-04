// DOM Elements
const successCountDisplay = document.getElementById('successCount');
const modelsContainer = document.getElementById('modelsContainer');
const reviewContainer = document.getElementById('reviewContainer');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverMessage = document.querySelector('.gameOverContent p');
const restartBtn = document.getElementById('restartBtn');

// Game Variables
let successCount = 0;
let modelIdCounter = 1;
let modelArrivalTimer; // Declare at the top
const modelArrivalInterval = 5000; // New model every 5 seconds
const maxQueuePerStation = 3;
const stations = ['polygonReduction', 'pivotPoints', 'materialsTextures'];

// Initialize Game
function initGame() {
  successCount = 0;
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

  // Clear any existing model arrival timers
  clearInterval(modelArrivalTimer);

  // Start Model Arrival
  modelArrivalTimer = setInterval(generateModel, modelArrivalInterval);

  // Update Success Count Display
  successCountDisplay.textContent = successCount;

  console.log('Game Initialized');
}

// Generate a New Model
function generateModel() {
  const model = createModel(modelIdCounter++);
  displayModel(model);
  console.log(`Model ${model.id} Generated`);
}

// Create Model Object
function createModel(id) {
  // Initialize each need with a random completion between 5% and 100%
  const initialCompletion = {
    polygonReduction: getRandomInt(5, 100),
    pivotPoints: getRandomInt(5, 100),
    materialsTextures: getRandomInt(5, 100)
  };

  return { id, initialCompletion };
}

// Display Model in Reception Area
function displayModel(model) {
  const modelDiv = document.createElement('div');
  modelDiv.classList.add('model');
  modelDiv.setAttribute('draggable', true);
  modelDiv.setAttribute('data-model-id', model.id);
  modelDiv.setAttribute('data-idle-time', '0'); // Initialize idle time

  // Create Circular Timer
  const timerDiv = document.createElement('div');
  timerDiv.classList.add('circularTimer');
  timerDiv.textContent = '60'; // Start at 60 seconds
  modelDiv.appendChild(timerDiv);

  // Display Needs as Title Tooltip
  let needsText = 'All Optimization Needs';
  modelDiv.title = `Model ${model.id}: ${needsText}`;

  // Add Drag Event Listeners
  modelDiv.addEventListener('dragstart', dragStart);

  // Start Individual Timer
  startModelTimer(modelDiv);

  modelsContainer.appendChild(modelDiv);
}

// Drag Functions
function dragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.getAttribute('data-model-id'));

  // Pause the model's timer when being dragged
  const modelId = e.target.getAttribute('data-model-id');
  const modelDiv = document.querySelector(`.model[data-model-id='${modelId}']`);
  if (modelDiv) {
    pauseModelTimer(modelDiv);
  }
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

    // Resume Model Timer
    resumeModelTimer(modelDiv);

    // Start Processing
    startProcessing(modelDiv, station);
    console.log(`Model ${modelId} assigned to ${formatStationName(station)}`);
  }
}

// Start Processing a Model in Station
function startProcessing(modelDiv, station) {
  modelDiv.classList.add('processing');
  console.log(`Model ${modelDiv.getAttribute('data-model-id')} started processing at ${formatStationName(station)}`);

  // Simulate Processing Time
  const processingTime = 10000; // 10 seconds in milliseconds
  setTimeout(() => {
    modelDiv.classList.remove('processing');
    console.log(`Model ${modelDiv.getAttribute('data-model-id')} completed processing at ${formatStationName(station)}`);
    completeProcessing(modelDiv, station);
  }, processingTime);
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

    // Resume Model Timer
    resumeModelTimer(modelDiv);

    // Start Processing at Next Station
    startProcessing(modelDiv, nextStation);
    console.log(`Model ${modelId} moved to ${formatStationName(nextStation)}`);
  } else {
    // Send to Client Review
    reviewContainer.appendChild(modelDiv);

    // Increment Success Count
    successCount++;
    successCountDisplay.textContent = successCount;

    console.log(`Model ${modelId} sent to Client Review. Total Success: ${successCount}`);

    // Stop and Remove Model Timer
    stopModelTimer(modelDiv);

    // Remove Model from Station Queue
    const queue = document.getElementById(`${station}Queue`);
    queue.removeChild(modelDiv);
  }
}

// Start Individual Model Timer
function startModelTimer(modelDiv) {
  let remainingTime = 60; // 60 seconds
  const timerDiv = modelDiv.querySelector('.circularTimer');
  timerDiv.textContent = remainingTime;

  // Initialize Timer Interval
  const timerInterval = setInterval(() => {
    // If model is being processed, do not decrement
    if (!modelDiv.classList.contains('processing')) {
      remainingTime--;
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        endGame(`Model ${modelDiv.getAttribute('data-model-id')} has been idle for too long.`);
      } else {
        // Update Circular Timer
        const percentage = (remainingTime / 60) * 100;
        timerDiv.style.background = `conic-gradient(#ff0000 ${percentage}%, #ccc ${percentage}% 100%)`;
        timerDiv.textContent = remainingTime;
      }
    }
  }, 1000); // Every second

  // Store Interval ID on the modelDiv for future reference
  modelDiv.timerInterval = timerInterval;
}

// Pause Model Timer
function pauseModelTimer(modelDiv) {
  clearInterval(modelDiv.timerInterval);
  const timerDiv = modelDiv.querySelector('.circularTimer');
  timerDiv.classList.add('paused');
}

// Resume Model Timer
function resumeModelTimer(modelDiv) {
  const timerDiv = modelDiv.querySelector('.circularTimer');
  timerDiv.classList.remove('paused');

  // Retrieve remaining time
  let remainingTime = parseInt(timerDiv.textContent);
  if (isNaN(remainingTime)) {
    remainingTime = 60;
    timerDiv.textContent = remainingTime;
  }

  // Restart Timer
  const timerInterval = setInterval(() => {
    // If model is being processed, do not decrement
    if (!modelDiv.classList.contains('processing')) {
      remainingTime--;
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        endGame(`Model ${modelDiv.getAttribute('data-model-id')} has been idle for too long.`);
      } else {
        // Update Circular Timer
        const percentage = (remainingTime / 60) * 100;
        timerDiv.style.background = `conic-gradient(#ff0000 ${percentage}%, #ccc ${percentage}% 100%)`;
        timerDiv.textContent = remainingTime;
      }
    }
  }, 1000); // Every second

  // Update the interval ID
  modelDiv.timerInterval = timerInterval;
}

// Stop Model Timer (when sent to Client Review)
function stopModelTimer(modelDiv) {
  clearInterval(modelDiv.timerInterval);
  const timerDiv = modelDiv.querySelector('.circularTimer');
  timerDiv.style.background = `conic-gradient(#00ff00 100%, #ccc 100% 100%)`; // Green full circle
  timerDiv.textContent = '✓'; // Checkmark to indicate success
}

// End Game
function endGame(message) {
  clearInterval(modelArrivalTimer);
  // Stop all model timers
  document.querySelectorAll('.model').forEach(modelDiv => {
    clearInterval(modelDiv.timerInterval);
  });
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
