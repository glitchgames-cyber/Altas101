const puzzleGrid = document.getElementById('puzzle-grid');
const resetBtn = document.getElementById('puzzle-reset');
const hintBtn = document.getElementById('puzzle-hint');
const checkBtn = document.getElementById('puzzle-check');
const feedbackEl = document.getElementById('puzzle-feedback');
const levelEl = document.getElementById('puzzle-level');
const movesEl = document.getElementById('puzzle-moves');
const hintsEl = document.getElementById('puzzle-hints');

let level = 1;
let moves = 0;
let hints = 2; // Reduced from 3
let grid = [];
let solution = [];
let gridSize = 5;
let maxLevel = 50; // Increased max levels
let timeLimit = null; // Time limit per level (null = no limit initially)
let timeLeft = null;

function generatePuzzle() {
  grid = [];
  solution = [];
  
  // Start timer if needed
  startTimer();
  
  // Create grid
  for (let i = 0; i < gridSize * gridSize; i++) {
    grid.push(false);
  }
  
  // Generate solution path (always from top-left to bottom-right)
  let path = findPath(0, gridSize * gridSize - 1);
  
  // Ensure we have a valid path
  if (!path || path.length < 2) {
    // Fallback: create a simple path
    path = [0];
    for (let i = 1; i < gridSize; i++) {
      path.push(i);
    }
    for (let i = gridSize * 2 - 1; i < gridSize * gridSize; i += gridSize) {
      if (!path.includes(i)) path.push(i);
    }
    path.push(gridSize * gridSize - 1);
  }
  
  solution = [...path];
  
  // Mark solution cells
  solution.forEach(index => {
    if (index >= 0 && index < grid.length) {
      grid[index] = true;
    }
  });
  
  // Shuffle - clear more cells to make it harder (but keep start and end)
  // Difficulty increases with level
  const clearRatio = Math.min(0.7, 0.4 + (level * 0.01)); // Up to 70% cleared at high levels
  const cellsToClear = Math.max(2, Math.floor(solution.length * clearRatio));
  const clearableCells = solution.filter(idx => idx !== 0 && idx !== gridSize * gridSize - 1);
  
  for (let i = 0; i < Math.min(cellsToClear, clearableCells.length); i++) {
    const randomIndex = clearableCells[Math.floor(Math.random() * clearableCells.length)];
    grid[randomIndex] = false;
    // Remove from clearableCells to avoid clearing same cell twice
    const idx = clearableCells.indexOf(randomIndex);
    if (idx > -1) clearableCells.splice(idx, 1);
  }
  
  renderGrid();
}

function findPath(start, end) {
  const path = [start];
  const visited = new Set([start]);
  const rows = gridSize;
  const cols = gridSize;
  let iterations = 0;
  const maxIterations = rows * cols * 2; // Prevent infinite loops
  
  let current = start;
  
  while (current !== end && iterations < maxIterations) {
    iterations++;
    const neighbors = getNeighbors(current, rows, cols);
    const unvisitedNeighbors = neighbors.filter(n => !visited.has(n));
    
    if (unvisitedNeighbors.length === 0) {
      // Backtrack
      path.pop();
      if (path.length === 0) break;
      current = path[path.length - 1];
      continue;
    }
    
    // Prefer moving towards end
    const endRow = Math.floor(end / cols);
    const endCol = end % cols;
    const currentRow = Math.floor(current / cols);
    const currentCol = current % cols;
    
    unvisitedNeighbors.sort((a, b) => {
      const aRow = Math.floor(a / cols);
      const aCol = a % cols;
      const bRow = Math.floor(b / cols);
      const bCol = b % cols;
      
      const distA = Math.abs(aRow - endRow) + Math.abs(aCol - endCol);
      const distB = Math.abs(bRow - endRow) + Math.abs(bCol - endCol);
      
      return distA - distB;
    });
    
    const next = unvisitedNeighbors[0];
    path.push(next);
    visited.add(next);
    current = next;
  }
  
  // If we didn't reach the end, create a simple fallback path
  if (current !== end) {
    return null;
  }
  
  return path;
}

function getNeighbors(index, rows, cols) {
  const neighbors = [];
  const row = Math.floor(index / cols);
  const col = index % cols;
  
  if (row > 0) neighbors.push(index - cols); // Up
  if (row < rows - 1) neighbors.push(index + cols); // Down
  if (col > 0) neighbors.push(index - 1); // Left
  if (col < cols - 1) neighbors.push(index + 1); // Right
  
  return neighbors;
}

function renderGrid() {
  puzzleGrid.innerHTML = '';
  puzzleGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  
  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement('div');
    cell.className = 'puzzle-cell';
    
    if (i === 0) {
      cell.textContent = '⚡';
      cell.classList.add('locked');
      cell.style.background = '#4dd0e1';
    } else if (i === gridSize * gridSize - 1) {
      cell.textContent = '🎯';
      cell.classList.add('locked');
      cell.style.background = '#ff7a18';
    } else if (grid[i]) {
      cell.classList.add('active');
    }
    
    cell.addEventListener('click', () => handleCellClick(i, cell));
    puzzleGrid.appendChild(cell);
  }
  
  updateStats();
}

function handleCellClick(index, cell) {
  if (index === 0 || index === gridSize * gridSize - 1) return;
  if (cell.classList.contains('locked')) return;
  
  grid[index] = !grid[index];
  cell.classList.toggle('active');
  moves++;
  updateStats();
}

function checkSolution() {
  // Check if there's a path from start to end
  const start = 0;
  const end = gridSize * gridSize - 1;
  const path = findPathInGrid(start, end);
  
  if (path && path.length > 0) {
    // Solution correct!
    if (feedbackEl) {
      feedbackEl.textContent = `Level ${level} Complete! Moves: ${moves}`;
      feedbackEl.style.color = '#4dd0e1';
    }
    
    setTimeout(() => {
      level++;
      
      // Increase grid size up to 8x8 (was 7x7)
      gridSize = Math.min(8, 5 + Math.floor(level / 2));
      
      // Hints decrease faster, can go to 0 at high levels
      hints = Math.max(0, 3 - Math.floor(level / 2));
      
      // Add time limit starting from level 10
      if (level >= 10) {
        timeLimit = Math.max(30, 120 - (level * 2)); // Decreasing time limit
        timeLeft = timeLimit;
        startTimer();
      }
      
      moves = 0;
      if (feedbackEl) feedbackEl.textContent = `Starting Level ${level}...`;
      setTimeout(() => {
        generatePuzzle();
      }, 1500);
    }, 2000);
  } else {
    if (feedbackEl) {
      feedbackEl.textContent = 'No valid path found. Keep trying!';
      feedbackEl.style.color = '#ff7a18';
    }
    
    // Shake cells
    if (puzzleGrid) {
      puzzleGrid.querySelectorAll('.puzzle-cell').forEach(cell => {
        if (cell.classList.contains('active') && !cell.classList.contains('locked')) {
          cell.classList.add('error');
          setTimeout(() => cell.classList.remove('error'), 300);
        }
      });
    }
  }
}

function findPathInGrid(start, end) {
  const queue = [[start]];
  const visited = new Set([start]);
  const rows = gridSize;
  const cols = gridSize;
  
  // Ensure start is always active
  if (start >= 0 && start < grid.length) {
    grid[start] = true;
  }
  
  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];
    
    if (current === end) {
      return path;
    }
    
    const neighbors = getNeighbors(current, rows, cols);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor) && neighbor >= 0 && neighbor < grid.length) {
        if (grid[neighbor] || neighbor === end) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
  }
  
  return null;
}

function useHint() {
  if (hints <= 0) {
    if (feedbackEl) {
      feedbackEl.textContent = 'No hints remaining!';
      feedbackEl.style.color = '#ff7a18';
    }
    return;
  }
  
  // Find a cell in solution that's not active
  const inactiveSolutionCells = solution.filter(index => 
    index !== 0 && index !== gridSize * gridSize - 1 && index >= 0 && index < grid.length && !grid[index]
  );
  
  if (inactiveSolutionCells.length > 0) {
    const hintIndex = inactiveSolutionCells[Math.floor(Math.random() * inactiveSolutionCells.length)];
    if (hintIndex >= 0 && hintIndex < grid.length) {
      grid[hintIndex] = true;
      
      const cells = puzzleGrid.querySelectorAll('.puzzle-cell');
      if (cells[hintIndex]) {
        cells[hintIndex].classList.add('active');
        cells[hintIndex].style.animation = 'pulse 0.5s';
      }
      
      hints--;
      updateStats();
      if (feedbackEl) {
        feedbackEl.textContent = 'Hint used!';
        feedbackEl.style.color = '#4dd0e1';
      }
    }
  } else {
    if (feedbackEl) {
      feedbackEl.textContent = 'You\'re on the right track!';
      feedbackEl.style.color = '#4dd0e1';
    }
  }
}

function updateStats() {
  levelEl.textContent = level;
  movesEl.textContent = moves;
  hintsEl.textContent = hints;
}

let timerInterval = null;

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  if (!timeLimit) {
    const timerContainer = document.getElementById('timer-container');
    if (timerContainer) timerContainer.style.display = 'none';
    return;
  }
  
  const timerEl = document.getElementById('puzzle-timer');
  const timerContainer = document.getElementById('timer-container');
  if (!timerEl || !timerContainer) return;
  
  timerContainer.style.display = 'block';
  timeLeft = timeLimit;
  timerEl.textContent = `${timeLeft}s`;
  
  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `${timeLeft}s`;
    timerEl.style.color = timeLeft <= 10 ? '#ff7a18' : '#4dd0e1';
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (feedbackEl) {
        feedbackEl.textContent = 'Time\'s up! Level failed.';
        feedbackEl.style.color = '#ff7a18';
      }
      // Reset level
      setTimeout(() => {
        generatePuzzle();
      }, 2000);
    }
  }, 1000);
}

function resetPuzzle() {
  level = 1;
  moves = 0;
  hints = 2; // Reduced from 3
  gridSize = 5;
  timeLimit = null;
  timeLeft = null;
  if (timerInterval) clearInterval(timerInterval);
  feedbackEl.textContent = '';
  generatePuzzle();
}

resetBtn.addEventListener('click', resetPuzzle);
hintBtn.addEventListener('click', useHint);
checkBtn.addEventListener('click', checkSolution);

generatePuzzle();

