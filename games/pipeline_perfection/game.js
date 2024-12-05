// DOM Elements
const successCountDisplay = document.getElementById('successCount');
const modelsContainer = document.getElementById('modelsContainer');
const reviewContainer = document.getElementById('reviewContainer');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverMessage = document.querySelector('.gameOverContent p');
const restartBtn = document.getElementById('restartBtn');

// Model Arrival Timer
let modelArrivalTimer;

// Game Variables
let successCount = 0;
let modelIdCounter = 1;
const modelArrivalInterval = 5000; // New model every 5 seconds
const maxQueuePerStation = 3;
const stations = ['polygonReduction', 'pivotPoints', 'materialsTextures'];

// Initialize Game
function initGame() {
  console.log('Initializing game...');
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
  gameOverScreen.style.display = "none";

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
  console.log('Generating a new model...');
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
  console.log(`Displaying Model ${model.id} in Incoming Models`);
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

  // Create Progress Bars
  const progressBarContainer = document.createElement('div');
  progressBarContainer.classList.add('progressBarContainer');

  ['polygonReduction', 'pivotPoints', 'materialsTextures'].forEach(requirement => {
    const progressBar = document.createElement('div');
    progressBar.classList.add('progressBar');

    const fill = document.createElement('div');
    fill.classList.add('fill');
    fill.style.width = `${model.initialCompletion[requirement]}%`;
    fill.style.backgroundColor = model.initialCompletion[requirement] >= 100 ? 'green' : '#000';

    progressBar.appendChild(fill);
    progressBarContainer.appendChild(progressBar);
  });

  modelDiv.appendChild(progressBarContainer);

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
  const modelId = e.target.getAttribute('data-model-id');
  console.log(`Dragging Model ${modelId}`);
  e.dataTransfer.setData('text/plain', modelId);

  // Pause the model's timer when being dragged
  const modelDiv = getModelById(modelId);
  if (modelDiv) {
    pauseModelTimer(modelDiv);
  }
}

// Allow Drop on Stations (Including all three)
stations.forEach(station => {
  const queue = document.getElementById(`${station}Queue`);
  const stationDiv = document.getElementById(station);

  if (!queue) {
    console.error(`Element with ID "${station}Queue" not found.`);
    return; // Skip if the queue element doesn't exist
  }

  // Prevent default drag over behavior
  queue.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  // Handle Drag Enter and Leave for visual feedback
  queue.addEventListener('dragenter', () => {
    stationDiv.classList.add('dragover');
  });

  queue.addEventListener('dragleave', () => {
    stationDiv.classList.remove('dragover');
  });

  // Handle Drop
  queue.addEventListener('drop', (e) => {
    e.preventDefault();
    stationDiv.classList.remove('dragover');
    const modelId = e.dataTransfer.getData('text/plain');
    console.log(`Dropping Model ${modelId} into ${formatStationName(station)}`);
    assignModelToStation(modelId, station);
  });
});

// Assign Model to Station
function assignModelToStation(modelId, station) {
  const modelDiv = getModelById(modelId);
  if (modelDiv) {
    const queue = document.getElementById(`${station}Queue`);

    // Check if the station has an Active model
    const activeModel = queue.querySelector('.model.processing');
    
    if (activeModel) {
      // Station already has an Active model, add to queue
      const currentQueue = queue.querySelectorAll('.model:not(.processing)');
      if (currentQueue.length >= maxQueuePerStation) {
        alert(`Cannot assign Model ${modelId} to ${formatStationName(station)}. Queue is full.`);
        console.log(`Queue for ${station} is full. Cannot assign Model ${modelId}.`);
        return;
      }
      queue.appendChild(modelDiv);
      console.log(`Model ${modelId} added to queue of ${formatStationName(station)}`);
    } else {
      // No Active model, set this model as Active
      if (queue.childNodes.length >= maxQueuePerStation + 1) { // +1 for Active model
        alert(`Cannot assign Model ${modelId} to ${formatStationName(station)}. Queue is full.`);
        console.log(`Queue for ${station} is full. Cannot assign Model ${modelId}.`);
        return;
      }
      queue.appendChild(modelDiv);
      modelsContainer.removeChild(modelDiv);
      modelDiv.setAttribute('data-idle-time', '0');
      // Set as Active
      startProcessing(modelDiv, station);
      console.log(`Model ${modelId} assigned as Active to ${formatStationName(station)}`);
    }
  } else {
    console.log(`Model ${modelId} not found.`);
  }
}

// Start Processing a Model in Station
function startProcessing(modelDiv, station) {
  const modelId = modelDiv.getAttribute('data-model-id');
  modelDiv.classList.add('processing');
  console.log(`Model ${modelId} started processing at ${formatStationName(station)}`);

  // Identify which progress bar to update based on station
  const stationIndex = stations.indexOf(station); // 0: polygonReduction, 1: pivotPoints, 2: materialsTextures
  if (stationIndex === -1) {
    console.error(`Invalid station: ${station}`);
    return;
  }

  const fillDiv = modelDiv.querySelectorAll('.progressBar .fill')[stationIndex];
  if (!fillDiv) {
    console.error(`Progress bar not found for station: ${station}`);
    return;
  }

  // Initialize progress
  let progress = parseInt(fillDiv.style.width) || 0;

  // Start progress bar increment
  const progressInterval = setInterval(() => {
    if (progress < 100) {
      progress += 10; // 10% per second
      fillDiv.style.width = `${progress}%`;
      fillDiv.style.backgroundColor = progress >= 100 ? 'green' : '#000';
    } else {
      clearInterval(progressInterval);
    }
  }, 1000); // Every second

  // Store Interval ID on the modelDiv for future reference
  modelDiv.progressInterval = progressInterval;

  // Simulate Processing Time
  const processingTime = 10000; // 10 seconds
  setTimeout(() => {
    modelDiv.classList.remove('processing');
    clearInterval(progressInterval);
    console.log(`Model ${modelId} completed processing at ${formatStationName(station)}`);
    completeProcessing(modelDiv, station);
  }, processingTime);
}

// Complete Processing a Model
function completeProcessing(modelDiv, station) {
  const modelId = modelDiv.getAttribute('data-model-id');
  const stationIndex = stations.indexOf(station);
  const isLastStation = stationIndex === stations.length - 1;

  if (!isLastStation) {
    // Move to Next Station
    const nextStation = stations[stationIndex + 1];
    const nextQueue = document.getElementById(`${nextStation}Queue`);

    if (nextQueue.childNodes.length >= maxQueuePerStation + 1) { // +1 for Active
      alert(`Cannot send Model ${modelId} to ${formatStationName(nextStation)}. Queue is full.`);
      console.log(`Queue for ${nextStation} is full. Cannot move Model ${modelId}.`);
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

    // Promote Next Model in Station
    promoteNextModelInStation(station);
  }
}

// Promote Next Model in Station
function promoteNextModelInStation(station) {
  const queue = document.getElementById(`${station}Queue`);
  const nextModel = queue.querySelector('.model:not(.processing)');
  if (nextModel) {
    startProcessing(nextModel, station);
    console.log(`Model ${nextModel.getAttribute('data-model-id')} is now Active at ${formatStationName(station)}`);
  }
}

// Start Individual Model Timer
function startModelTimer(modelDiv) {
  let remainingTime = 60; // 60 seconds
  const timerDiv = modelDiv.querySelector('.circularTimer');
  timerDiv.textContent = remainingTime;
  console.log(`Starting timer for Model ${modelDiv.getAttribute('data-model-id')} with 60 seconds`);

  // Initialize Timer Interval
  const timerInterval = setInterval(() => {
    // If model is being processed, do not decrement
    if (!modelDiv.classList.contains('processing')) {
      remainingTime--;
      console.log(`Model ${modelDiv.getAttribute('data-model-id')} remaining time: ${remainingTime}`);
      console.log(`TIMER:: ${remainingTime}`);
      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        endGame(`Model ${modelDiv.getAttribute('data-model-id')} has been idle for too long.`);
      } else {
        // Update Circular Timer
        const percentage = (remainingTime / 60) * 100;
        timerDiv.style.background = `conic-gradient(#ff0000 ${percentage}%, #ccc ${percentage}% 100%)`;
        timerDiv.textContent = remainingTime;

        // Update Progress Bars
        updateProgressBars(modelDiv, remainingTime);
      }
    }
  }, 1000); // Every second

  // Store Interval ID on the modelDiv for future reference
  modelDiv.timerInterval = timerInterval;
}

// Update Progress Bars Based on Remaining Time
function updateProgressBars(modelDiv, remainingTime) {
  const requirements = ['polygonReduction', 'pivotPoints', 'materialsTextures'];
  const stationIndex = getCurrentStationIndex(modelDiv);
  if (stationIndex === -1) return; // Model not in any station

  const fillDivs = modelDiv.querySelectorAll('.progressBar .fill');
  fillDivs.forEach((fillDiv, index) => {
    if (index === stationIndex) {
      // Calculate new width based on remaining time
      const percentage = ((60 - remainingTime) / 60) * 100;
      fillDiv.style.width = `${percentage}%`;
      fillDiv.style.backgroundColor = percentage >= 100 ? 'green' : '#000';
    }
  });
}

// Get Current Station Index for a Model
function getCurrentStationIndex(modelDiv) {
  for (let i = 0; i < stations.length; i++) {
    const queue = document.getElementById(`${stations[i]}Queue`);
    if (queue.contains(modelDiv)) {
      return i;
    }
  }
  return -1; // Not found in any station
}

// Pause Model Timer
function pauseModelTimer(modelDiv) {
  clearInterval(modelDiv.timerInterval);
  const timerDiv = modelDiv.querySelector('.circularTimer');
  timerDiv.classList.add('paused');
  console.log(`Paused timer for Model ${modelDiv.getAttribute('data-model-id')}`);
}

// Resume Model Timer
function resumeModelTimer(modelDiv) {
  const timerDiv = modelDiv.querySelector('.circularTimer');
  timerDiv.classList.remove('paused');
  console.log(`Resuming timer for Model ${modelDiv.getAttribute('data-model-id')}`);

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
      console.log(`Model ${modelDiv.getAttribute('data-model-id')} remaining time: ${remainingTime}`);

      if (remainingTime <= 0) {
        clearInterval(timerInterval);
        endGame(`Model ${modelDiv.getAttribute('data-model-id')} has been idle for too long.`);
      } else {
        // Update Circular Timer
        const percentage = (remainingTime / 60) * 100;
        timerDiv.style.background = `conic-gradient(#ff0000 ${percentage}%, #ccc ${percentage}% 100%)`;
        timerDiv.textContent = remainingTime;

        // Update Progress Bars
        updateProgressBars(modelDiv, remainingTime);
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
  console.log(`Stopped timer for Model ${modelDiv.getAttribute('data-model-id')}`);
}

// End Game
function endGame(message) {
  console.log('Ending game:', message);
  clearInterval(modelArrivalTimer);
  // Stop all model timers
  document.querySelectorAll('.model').forEach(modelDiv => {
    clearInterval(modelDiv.timerInterval);
  });
  gameOverMessage.textContent = message;
  gameOverScreen.style.display = "flex";

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

// Define formatStationName Function
function formatStationName(stationId) {
  switch (stationId) {
    case 'polygonReduction':
      return 'Polygon Reduction';
    case 'pivotPoints':
      return 'Pivot Points & Parenting';
    case 'materialsTextures':
      return 'Materials & Textures';
    default:
      return stationId;
  }
}

// Helper Function to Get Model by ID
function getModelById(modelId) {
  return document.querySelector(`.model[data-model-id='${modelId}']`);
}

// Allow Drop on Client Review
const clientReview = document.getElementById('clientReview');

clientReview.addEventListener('dragover', (e) => {
  e.preventDefault();
});

clientReview.addEventListener('drop', (e) => {
  e.preventDefault();
  const modelId = e.dataTransfer.getData('text/plain');
  const modelDiv = getModelById(modelId);

  if (modelDiv) {
    // Check if all progress bars are at 100%
    const fillDivs = modelDiv.querySelectorAll('.progressBar .fill');
    const allComplete = Array.from(fillDivs).every(fill => parseInt(fill.style.width) >= 100);

    if (allComplete) {
      // Move to Client Review
      reviewContainer.appendChild(modelDiv);
      // Stop timer
      stopModelTimer(modelDiv);
      // Increment Success Count
      successCount++;
      successCountDisplay.textContent = successCount;
      console.log(`Model ${modelId} sent to Client Review. Success Count: ${successCount}`);
      // Remove from station's queue
      const station = getCurrentStation(modelDiv);
      if (station) {
        removeModelFromStation(modelDiv, station);
      }
    } else {
      alert(`Cannot send Model ${modelId} to Client Review. All progress bars must be at 100%.`);
      console.log(`Model ${modelId} cannot be sent to Client Review. Progress bars incomplete.`);
    }
  } else {
    console.log(`Model ${modelId} not found for Client Review.`);
  }
});
