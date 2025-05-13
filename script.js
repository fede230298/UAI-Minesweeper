var faceEl = document.getElementById('face');
var difficulty = "easy";
var size = "medium";

// Handle difficulty
document.querySelectorAll('[data-difficulty]').forEach(option => {
  option.addEventListener('click', function () {
    // Remove .selected from all difficulty options
    document.querySelectorAll('[data-difficulty]').forEach(o => o.classList.remove('selected'));

    // Add .selected to this one
    this.classList.add('selected');

    // Update difficulty
    difficulty = this.getAttribute('data-difficulty');
    console.log('Selected difficulty:', difficulty);
  });
});

// Handle size
document.querySelectorAll('[data-size]').forEach(option => {
  option.addEventListener('click', function () {
    // Remove .selected from all size options
    document.querySelectorAll('[data-size]').forEach(o => o.classList.remove('selected'));

    // Add .selected to this one
    this.classList.add('selected');

    // Update size
    size = this.getAttribute('data-size');
    console.log('Selected grid size:', size);
  });
});

// Handle new game button
document.querySelector('[data-action="new"]').addEventListener('click', function () {
  console.log('Restarting game...');
  game();
});

function game() {
  var rows = 10;
  var cols = 10;
  var mineCount = 10;
  var board = [];
  var gameContainer = document.getElementById('game');
  var revealedCount = 0;
  var gameOver = false;

  var flagCount = 0;
  var timer = 0;
  var timerInterval = null;
  var mineCounterEl = document.getElementById('mine-counter');
  var timerEl = document.getElementById('timer');

  function createBoard() {
    var i, j;
    console.log('Creating board with difficulty:', difficulty);
    console.log('Creating board with size:', size);
    var gameDifficulty = difficulty;
    switch (gameDifficulty) {
      case 'easy':
        mineCount = 10;
        break;
      case 'medium':
        mineCount = 20;
        break;
      case 'hard':
        mineCount = 30;
        break;
      case 'expert':
        mineCount = 50;
        break;
      default:
        mineCount = 10;
    }
    var gameSize = size;
    switch (gameSize) {
      case 'small':
        rows = 8;
        cols = 8;
        break;
      case 'medium':
        rows = 10;
        cols = 10;
        break;
      case 'large':
        rows = 16;
        cols = 16;
        break;
      case 'huge':
        rows = 20;
        cols = 20;
        break;
      default:
        rows = 10;
        cols = 10;
    }
    var enoughGrids = rows * cols > mineCount;
    if (!enoughGrids) {
      alert("Too many mines for the board size!");
      return;
    }
    while (gameContainer.firstChild) {
      gameContainer.removeChild(gameContainer.firstChild);
    }
    for (i = 0; i < rows; i++) {
      board[i] = [];
      var rowDiv = document.createElement('div');
      rowDiv.className = 'row';
      for (j = 0; j < cols; j++) {
        var cell = {
          element: document.createElement('div'),
          mine: false,
          revealed: false,
          flagged: false,
          adjacent: 0,
          x: i,
          y: j
        };
        cell.element.className = 'cell';
        cell.element.oncontextmenu = function () { return false; };
        attachEvents(cell);
        rowDiv.appendChild(cell.element);
        board[i][j] = cell;
      }
      gameContainer.appendChild(rowDiv);
    }
    placeMines();
    calculateAdjacents();
  }

  function attachEvents(cell) {
    cell.element.onclick = function () {
      if (!gameOver) reveal(cell);
    };
    cell.element.oncontextmenu = function (e) {
      e.preventDefault();
      if (!gameOver) toggleFlag(cell);
    };
  }

  function placeMines() {
    var placed = 0;
    while (placed < mineCount) {
      var x = Math.floor(Math.random() * rows);
      var y = Math.floor(Math.random() * cols);
      if (!board[x][y].mine) {
        board[x][y].mine = true;
        placed++;
      }
    }
  }

  function calculateAdjacents() {
    var dx = [-1, -1, -1, 0, 0, 1, 1, 1];
    var dy = [-1, 0, 1, -1, 1, -1, 0, 1];
    var i, j, k;
    for (i = 0; i < rows; i++) {
      for (j = 0; j < cols; j++) {
        var count = 0;
        for (k = 0; k < 8; k++) {
          var nx = i + dx[k], ny = j + dy[k];
          if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && board[nx][ny].mine) {
            count++;
          }
        }
        board[i][j].adjacent = count;
      }
    }
  }

  function reveal(cell) {
    if (!timerInterval) {
      timerInterval = setInterval(function () {
        timer++;
        updateTimer();
      }, 1000);
    }
    if (cell.revealed || cell.flagged) return;
    cell.revealed = true;
    cell.element.className += ' revealed';
    if (cell.mine) {
      cell.element.className += ' mine';
      cell.element.innerHTML = '💣';
      endGame(false);
    } else {
      revealedCount++;
      if (cell.adjacent > 0) {
        cell.element.innerHTML = cell.adjacent;
        cell.element.className += ' n' + cell.adjacent;
      } else {
        revealAdjacent(cell);
      }
      checkWin();
    }
  }

  function revealAdjacent(cell) {
    var dx = [-1, -1, -1, 0, 0, 1, 1, 1];
    var dy = [-1, 0, 1, -1, 1, -1, 0, 1];
    var i;
    for (i = 0; i < 8; i++) {
      var nx = cell.x + dx[i], ny = cell.y + dy[i];
      if (nx >= 0 && nx < rows && ny >= 0 && ny < cols) {
        reveal(board[nx][ny]);
      }
    }
  }

  function toggleFlag(cell) {
    if (cell.revealed) return;
    cell.flagged = !cell.flagged;
    cell.element.className = cell.flagged ? 'cell flagged' : 'cell';
    cell.element.innerHTML = cell.flagged ? '🚩' : '';
  }

  function endGame(won) {
    gameOver = true;
    var i, j;
    for (i = 0; i < rows; i++) {
      for (j = 0; j < cols; j++) {
        var c = board[i][j];
        if (c.mine && !c.revealed) {
          c.element.className += ' revealed mine';
          c.element.innerHTML = '💣';
        }
      }
    }
    faceEl.innerText = '😵';
    clearInterval(timerInterval);

  }

  function checkWin() {
    if (revealedCount === rows * cols - mineCount) {
      endGame(true);
    }
  }

  function updateMineCounter() {
    var remaining = mineCount - flagCount;
    mineCounterEl.innerText = pad(remaining);
  }

  function updateTimer() {
    timerEl.innerText = pad(timer);
  }

  function pad(n) {
    n = Math.max(0, Math.min(999, n)); // Clamp between 0–999
    return ('000' + n).slice(-3);
  }

  function resetGame() {
    // Reset everything
    clearInterval(timerInterval);
    timer = 0;
    flagCount = 0;
    faceEl.innerText = '🙂';
    updateMineCounter();
    updateTimer();
    // ...then regenerate board
    game(); // or whatever your setup function is
  }

  faceEl.onclick = function () {
    resetGame();
  };

  function toggleFlag(cell) {
    if (cell.revealed) return;
    if (cell.flagged) {
      cell.flagged = false;
      cell.element.innerText = '';
      flagCount--;
    } else {
      cell.flagged = true;
      cell.element.innerText = '🚩';
      flagCount++;
    }
    updateMineCounter();
  }

  createBoard();
}

document.addEventListener('DOMContentLoaded', function () {
  var startButton = document.getElementById('start');
  startButton.onclick = game;
});

faceEl.onclick = function () {
  var gameContainer = document.getElementById('game');
  while (gameContainer.firstChild) {
    gameContainer.removeChild(gameContainer.firstChild);
  }
  game();
}
