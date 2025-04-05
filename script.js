const board = document.getElementById("board");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const difficultySelect = document.getElementById("difficulty");
const winLine = document.querySelector("line");

let currentPlayer = "X";
let gameActive = true;
let gameState = Array(9).fill("");
let difficulty = "easy";

const winningCombos = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

function renderBoard() {
  board.innerHTML = "";
  gameState.forEach((val, index) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = index;
    cell.textContent = val;
    if (val === "X") cell.classList.add("x");
    else if (val === "O") cell.classList.add("o");
    cell.addEventListener("click", handleClick);
    board.appendChild(cell);
  });
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || gameState[index]) return;

  makeMove(index, currentPlayer);
  checkResult();

  if (gameActive && currentPlayer === "O") {
    setTimeout(botMove, 400);
  }
}

function makeMove(index, player) {
  gameState[index] = player;
  renderBoard();
  currentPlayer = player === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s Turn`;
}

function checkResult() {
  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    if (gameState[a] && gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
      gameActive = false;
      statusText.textContent = `Player ${gameState[a]} Wins!`;
      drawWinLine(combo);
      return;
    }
  }

  if (!gameState.includes("")) {
    statusText.textContent = "It's a Draw!";
    gameActive = false;
  }
}

function drawWinLine(combo) {
  const positions = [
    [50, 50], [160, 50], [270, 50],
    [50, 160], [160, 160], [270, 160],
    [50, 270], [160, 270], [270, 270]
  ];

  const [start, end] = [positions[combo[0]], positions[combo[2]]];
  winLine.setAttribute("x1", start[0]);
  winLine.setAttribute("y1", start[1]);
  winLine.setAttribute("x2", end[0]);
  winLine.setAttribute("y2", end[1]);
}

function botMove() {
  let move;
  if (difficulty === "easy") {
    const empty = gameState.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    move = empty[Math.floor(Math.random() * empty.length)];
  } else if (difficulty === "medium") {
    move = getMediumMove();
  } else {
    move = getBestMove("O");
  }

  if (move !== undefined) {
    makeMove(move, "O");
    checkResult();
  }
}

function getMediumMove() {
  // Block X if about to win
  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    const values = [gameState[a], gameState[b], gameState[c]];
    if (values.filter(v => v === "X").length === 2 && values.includes("")) {
      return combo[values.indexOf("")];
    }
  }
  return getRandomMove();
}

function getRandomMove() {
  const empty = gameState.map((v, i) => v === "" ? i : null).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

// Minimax algorithm
function getBestMove(player) {
  const opponent = player === "X" ? "O" : "X";

  function minimax(board, isMaximizing) {
    const winner = evaluate(board);
    if (winner !== null) return score(winner);

    const moves = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let move of moves) {
        board[move] = player;
        let value = minimax(board, false);
        board[move] = "";
        bestScore = Math.max(bestScore, value);
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let move of moves) {
        board[move] = opponent;
        let value = minimax(board, true);
        board[move] = "";
        bestScore = Math.min(bestScore, value);
      }
      return bestScore;
    }
  }

  function evaluate(board) {
    for (let combo of winningCombos) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[b] === board[c]) return board[a];
    }
    return board.includes("") ? null : "draw";
  }

  function score(result) {
    if (result === player) return 1;
    else if (result === "draw") return 0;
    else return -1;
  }

  let bestMove;
  let bestScore = -Infinity;
  gameState.forEach((val, i) => {
    if (val === "") {
      gameState[i] = player;
      let moveScore = minimax(gameState, false);
      gameState[i] = "";
      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMove = i;
      }
    }
  });
  return bestMove;
}

resetBtn.addEventListener("click", () => {
  currentPlayer = "X";
  gameState = Array(9).fill("");
  gameActive = true;
  statusText.textContent = `Player ${currentPlayer}'s Turn`;
  winLine.setAttribute("x1", 0);
  winLine.setAttribute("y1", 0);
  winLine.setAttribute("x2", 0);
  winLine.setAttribute("y2", 0);
  renderBoard();
});

difficultySelect.addEventListener("change", () => {
  difficulty = difficultySelect.value;
});

renderBoard();
