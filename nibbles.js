// Nibbles (Snake Game) - JavaScript version
// Copyright (C) Microsoft Corporation 1990, JS port by Copilot 2025

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreboard = document.getElementById('score');
const livesboard = document.getElementById('lives');

// Game constants
const ROWS = 50;
const COLS = 80;
const CELL_SIZE = 10;
const MAX_SNAKE_LENGTH = 1000;
const INIT_LIVES = 5;
const INIT_SPEED = 80; // Lower is faster

// Colors
const COLORS = {
  snake: '#FFD700',
  wall: '#888',
  bg: '#111',
  number: '#0F0',
  text: '#FFF',
};

// Game state
let snake = {
  body: [{row: 25, col: 40}],
  direction: 'right',
  length: 2,
  lives: INIT_LIVES,
  score: 0,
  alive: true,
};
let number = {row: 0, col: 0, value: 1};
let speed = INIT_SPEED;
let paused = false;
let walls = [];
let gameOver = false;

function drawCell(row, col, color) {
  ctx.fillStyle = color;
  ctx.fillRect((col-1)*CELL_SIZE, (row-1)*CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawArena() {
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, COLS*CELL_SIZE, ROWS*CELL_SIZE);
  // Draw border
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, COLS*CELL_SIZE, CELL_SIZE); // Top
  ctx.fillRect(0, (ROWS-1)*CELL_SIZE, COLS*CELL_SIZE, CELL_SIZE); // Bottom
  ctx.fillRect(0, 0, CELL_SIZE, ROWS*CELL_SIZE); // Left
  ctx.fillRect((COLS-1)*CELL_SIZE, 0, CELL_SIZE, ROWS*CELL_SIZE); // Right
  // Draw walls
  walls.forEach(w => drawCell(w.row, w.col, COLORS.wall));
}

function drawSnake() {
  snake.body.forEach((seg, i) => {
    drawCell(seg.row, seg.col, COLORS.snake);
  });
}

function drawNumber() {
  drawCell(number.row, number.col, COLORS.number);
  ctx.fillStyle = COLORS.text;
  ctx.font = `${CELL_SIZE}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(number.value, (number.col-0.5)*CELL_SIZE, (number.row-0.5)*CELL_SIZE);
}

function updateScoreboard() {
  scoreboard.textContent = snake.score;
  livesboard.textContent = snake.lives;
}

function randomEmptyCell() {
  let row, col, conflict;
  do {
    row = Math.floor(Math.random() * (ROWS-4)) + 3;
    col = Math.floor(Math.random() * (COLS-2)) + 2;
    conflict = snake.body.some(seg => seg.row === row && seg.col === col) ||
      walls.some(w => w.row === row && w.col === col);
  } while (conflict);
  return {row, col};
}

function placeNumber() {
  const pos = randomEmptyCell();
  number.row = pos.row;
  number.col = pos.col;
}

function resetGame() {
  snake = {
    body: [{row: 25, col: 40}],
    direction: 'right',
    length: 2,
    lives: INIT_LIVES,
    score: 0,
    alive: true,
  };
  number = {row: 0, col: 0, value: 1};
  speed = INIT_SPEED;
  paused = false;
  gameOver = false;
  walls = [];
  placeNumber();
  updateScoreboard();
}

function moveSnake() {
  if (!snake.alive || paused || gameOver) return;
  let head = {...snake.body[snake.body.length-1]};
  switch (snake.direction) {
    case 'up': head.row--; break;
    case 'down': head.row++; break;
    case 'left': head.col--; break;
    case 'right': head.col++; break;
  }
  // Collision with wall
  if (head.row <= 1 || head.row >= ROWS || head.col <= 1 || head.col >= COLS ||
      walls.some(w => w.row === head.row && w.col === head.col)) {
    snake.lives--;
    snake.alive = false;
    if (snake.lives > 0) {
      setTimeout(() => { resetGame(); }, 1000);
    } else {
      gameOver = true;
    }
    return;
  }
  // Collision with self
  if (snake.body.some(seg => seg.row === head.row && seg.col === head.col)) {
    snake.lives--;
    snake.alive = false;
    if (snake.lives > 0) {
      setTimeout(() => { resetGame(); }, 1000);
    } else {
      gameOver = true;
    }
    return;
  }
  // Eat number
  if (head.row === number.row && head.col === number.col) {
    snake.length += number.value * 4;
    snake.score += number.value;
    number.value++;
    if (number.value === 10) {
      // Next level: add some walls
      walls = [];
      for (let i = 20; i <= 60; i++) {
        walls.push({row: 25, col: i});
      }
      number.value = 1;
      snake.length = 2;
      snake.body = [{row: 25, col: 40}];
    }
    placeNumber();
  }
  snake.body.push(head);
  while (snake.body.length > snake.length) snake.body.shift();
}

function gameLoop() {
  if (!paused && !gameOver) moveSnake();
  drawArena();
  drawSnake();
  drawNumber();
  updateScoreboard();
  if (gameOver) {
    ctx.fillStyle = COLORS.text;
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width/2, canvas.height/2);
    ctx.font = '20px sans-serif';
    ctx.fillText('Press R to restart', canvas.width/2, canvas.height/2+40);
  }
  requestAnimationFrame(() => setTimeout(gameLoop, speed));
}

window.addEventListener('keydown', e => {
  if (gameOver && e.key.toLowerCase() === 'r') {
    resetGame();
    return;
  }
  if (e.key === 'p' || e.key === 'P') {
    paused = !paused;
    return;
  }
  if (!snake.alive) return;
  switch (e.key) {
    case 'ArrowUp': if (snake.direction !== 'down') snake.direction = 'up'; break;
    case 'ArrowDown': if (snake.direction !== 'up') snake.direction = 'down'; break;
    case 'ArrowLeft': if (snake.direction !== 'right') snake.direction = 'left'; break;
    case 'ArrowRight': if (snake.direction !== 'left') snake.direction = 'right'; break;
  }
});

// Start game
resetGame();
gameLoop();
