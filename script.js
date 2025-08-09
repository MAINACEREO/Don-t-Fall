/* ---------------------------
   Game constants & elements
   --------------------------- */
const gameEl = document.getElementById('game');
const playerEl = document.getElementById('player');
const platformsEl = document.getElementById('platforms');
const coinsEl = document.getElementById('coins');

const scoreEl = document.getElementById('score');
const highEl = document.getElementById('highscore');
const menuHighEl = document.getElementById('menuHigh');

const mainMenu = document.getElementById('mainMenu');
const settingsMenu = document.getElementById('settingsMenu');
const pauseMenu = document.getElementById('pauseMenu');
const gameOverMenu = document.getElementById('gameOverMenu');

const startBtn = document.getElementById('startBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsBack = document.getElementById('settingsBack');
const musicToggle = document.getElementById('musicToggle');
const sfxToggle = document.getElementById('sfxToggle');

const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');
const restartBtn = document.getElementById('restartBtn');
const toMenuBtn = document.getElementById('toMenuBtn');

const finalScoreEl = document.getElementById('finalScore');
const finalHighEl = document.getElementById('finalHighScore');
const goMenuBtn = document.getElementById('goMenuBtn');
const againBtn = document.getElementById('againBtn');

const leftControl = document.getElementById('leftControl');
const rightControl = document.getElementById('rightControl');

const bgMusic = document.getElementById('bgMusic');
const jumpSfx = document.getElementById('jumpSfx');
const coinSfx = document.getElementById('coinSfx');
const gameOverSfx = document.getElementById('gameOverSfx');

/* ---------------------------
   Game state
   --------------------------- */
let gameWidth = 360;
let gameHeight = 530;

let x = (gameWidth/2) - 20; // player left
let y = 150;                // player bottom from container bottom
let velocityY = 0;
let isJumping = false;

let platforms = [];
let coins = [];
let score = 0;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;

let gameOver = false;
let started = false;
let gamePaused = false;

let moveLeftHold = false;
let moveRightHold = false;
const HSTEP = 55; // left/right step per tick when using keyboard/buttons

highEl.innerText = highScore;
menuHighEl.innerText = highScore;
scoreEl.innerText = score;

/* ---------------------------
   Responsive scaling
   --------------------------- */
function scaleGame() {
  // scale gameEl to fit viewport while preserving aspect ratio
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / gameWidth, vh / gameHeight);
  gameEl.style.transform = `scale(${scale})`;
  // center wrapper by adjusting transform origin handled in CSS (top-left)
}
window.addEventListener('resize', scaleGame);
scaleGame();

/* ---------------------------
   Create platform & coin DOM
   --------------------------- */
function createPlatform(xPos, yPos) {
  const el = document.createElement('div');
  el.className = 'platform';
  el.style.left = xPos + 'px';
  el.style.bottom = yPos + 'px';
  platformsEl.appendChild(el);
  platforms.push({ el, x: xPos, y: yPos, w: 120, h: 20 });

  // 50% chance coin on platform
  if (Math.random() < 0.5) {
    const c = document.createElement('div');
    c.className = 'coin';
    const cx = xPos + 50;
    const cy = yPos + 25;
    c.style.left = cx + 'px';
    c.style.bottom = cy + 'px';
    coinsEl.appendChild(c);
    coins.push({ el: c, x: cx, y: cy, w: 20, h: 20 });
  }
}

/* ---------------------------
   Init / Reset
   --------------------------- */
function resetGameState() {
  // remove DOM platform/coin nodes
  platforms.forEach(p => { if (p.el.parentNode) p.el.parentNode.removeChild(p.el); });
  coins.forEach(c => { if (c.el.parentNode) c.el.parentNode.removeChild(c.el); });
  platforms = [];
  coins = [];

  // reset player
  x = (gameWidth/2) - 20;
  y = 150;
  velocityY = 0;
  isJumping = false;
  score = 0;
  scoreEl.innerText = score;
  gameOver = false;
  started = false;
  gamePaused = false;

  // guaranteed starting platform under player
  createPlatform(gameWidth/2 - 60, 100);

  // create initial platforms above
  for (let i = 1; i < 6; i++) {
    createPlatform(Math.random() * (gameWidth - 120), i * 90 + 100);
  }

  // draw initial positions
  renderAll();
}

/* ---------------------------
   Rendering
   --------------------------- */
function renderAll() {
  // update player DOM
  playerEl.style.left = x + 'px';
  playerEl.style.bottom = y + 'px';

  // If platform elements updated their styles in create/remove, they already reflect
}

/* ---------------------------
   Game update loop
   --------------------------- */
function update() {
  if (gamePaused || gameOver) return;

  // Horizontal movement (continuous while holding buttons)
  if (moveLeftHold) x -= 6; // small per-frame movement for smoothness
  if (moveRightHold) x += 6;

  // keep within bounds
  if (x < 0) x = 0;
  if (x + 40 > gameWidth) x = gameWidth - 40;

  // gravity & vertical movement
  velocityY -= 0.5; // gravity (note: positive up)
  y += velocityY;

  // platform collision
  for (let p of platforms) {
    if (
      x + 40 > p.x &&
      x < p.x + p.w &&
      y - 5 < p.y + p.h &&
      y - 5 > p.y &&
      velocityY <= 0
    ) {
      // landed on platform -> auto-jump
      y = p.y + p.h;
      velocityY = 12;
      isJumping = true;
      // mark started when first auto-jump occurs
      if (!started) started = true;
      // play jump sound if allowed
      if (sfxToggle.checked) { try { jumpSfx.currentTime = 0; jumpSfx.play(); } catch(e){} }
    }
  }

  // coin collection
  for (let i = coins.length - 1; i >= 0; i--) {
    const c = coins[i];
    if (
      x + 40 > c.x &&
      x < c.x + c.w &&
      y + 40 > c.y &&
      y < c.y + c.h
    ) {
      // collect
      if (c.el.parentNode) c.el.parentNode.removeChild(c.el);
      coins.splice(i,1);
      score += 10;
      scoreEl.innerText = score;
      if (sfxToggle.checked) { try { coinSfx.currentTime = 0; coinSfx.play(); } catch(e){} }
    }
  }

  // scroll the world when player climbs above threshold
  if (y > 300) {
    const offset = y - 300;
    y = 300;
    // move platforms & coins down
    for (let p of platforms) {
      p.y -= offset;
      p.el.style.bottom = p.y + 'px';
    }
    for (let c of coins) {
      c.y -= offset;
      c.el.style.bottom = c.y + 'px';
    }

    // remove off-screen
    platforms = platforms.filter(p => {
      if (p.y < 0) { if (p.el.parentNode) p.el.parentNode.removeChild(p.el); return false; }
      return true;
    });
    coins = coins.filter(c => {
      if (c.y < 0) { if (c.el.parentNode) c.el.parentNode.removeChild(c.el); return false; }
      return true;
    });

    // spawn new platforms until have 6
    while (platforms.length < 6) {
      const lastY = platforms[platforms.length - 1].y;
      const newY = lastY + 80 + Math.random()*20;
      createPlatform(Math.random() * (gameWidth - 120), newY);
    }

    // score for climbing
    score += 1;
    scoreEl.innerText = score;
  }

  // Game over condition (only after game has started)
  if (started && y < 0) {
    // stop music maybe
    if (musicToggle.checked) {
      try { bgMusic.pause(); } catch(e){}
    }
    // high score update
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('highScore', highScore);
    }
    // show Game Over menu
    finalScoreEl.innerText = score;
    finalHighEl.innerText = highScore;
    document.getElementById('menuHigh').innerText = highScore;
    scoreEl.innerText = score;
    document.getElementById('gameOverMenu').classList.remove('hidden');
    gameOver = true;
    if (sfxToggle.checked) { try { gameOverSfx.currentTime = 0; gameOverSfx.play(); } catch(e){} }
    return;
  }

  // update player element
  renderAll();
}

/* animation frame loop */
let animId = null;
function loop() {
  if (!gamePaused && !gameOver) {
    update();
    animId = requestAnimationFrame(loop);
  } else {
    if (animId) cancelAnimationFrame(animId);
    animId = null;
  }
}

/* ---------------------------
   Input handling
   --------------------------- */
/* Mobile button continuous movement */
leftControl.addEventListener('touchstart', e => { e.preventDefault(); moveLeftHold = true; });
leftControl.addEventListener('touchend', e => { e.preventDefault(); moveLeftHold = false; });
rightControl.addEventListener('touchstart', e => { e.preventDefault(); moveRightHold = true; });
rightControl.addEventListener('touchend', e => { e.preventDefault(); moveRightHold = false; });

/* Desktop mouse for ease */
leftControl.addEventListener('mousedown', () => moveLeftHold = true);
leftControl.addEventListener('mouseup',   () => moveLeftHold = false);
rightControl.addEventListener('mousedown', () => moveRightHold = true);
rightControl.addEventListener('mouseup',   () => moveRightHold = false);

/* Keyboard support */
window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowLeft') moveLeftHold = true;
  if (e.code === 'ArrowRight') moveRightHold = true;
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft') moveLeftHold = false;
  if (e.code === 'ArrowRight') moveRightHold = false;
});

/* Pause button */
pauseBtn.addEventListener('click', () => {
  pauseGame();
});

/* UI button bindings */
startBtn.addEventListener('click', () => { mainMenu.classList.add('hidden'); startGame(); });
settingsBtn.addEventListener('click', () => { mainMenu.classList.add('hidden'); settingsMenu.classList.remove('hidden'); });
settingsBack.addEventListener('click', () => { settingsMenu.classList.add('hidden'); mainMenu.classList.remove('hidden'); });

resumeBtn.addEventListener('click', () => { pauseMenu.classList.add('hidden'); resumeGame(); });
restartBtn.addEventListener('click', () => { pauseMenu.classList.add('hidden'); restartGame(); });
toMenuBtn.addEventListener('click', () => { pauseMenu.classList.add('hidden'); goToMainMenu(); });

goMenuBtn.addEventListener('click', () => goToMainMenu());
againBtn.addEventListener('click', () => {
  document.getElementById('gameOverMenu').classList.add('hidden');
  restartGame();
});

/* Music & SFX toggles */
musicToggle.addEventListener('change', () => {
  if (!musicToggle.checked) { try { bgMusic.pause(); } catch(e){} }
  else if (started) { try { bgMusic.play(); } catch(e){} }
});
sfxToggle.addEventListener('change', () => { /* no immediate action */ });

/* ---------------------------
   Game control functions
   --------------------------- */
function startGame() {
  resetGameState();
  // show pause button
  document.getElementById('pauseBtn').classList.remove('hidden');
  // play music only after user triggered start (unblock)
  if (musicToggle.checked) { try { bgMusic.currentTime = 0; bgMusic.play(); } catch(e){} }
  loop();
}

function pauseGame() {
  gamePaused = true;
  pauseMenu.classList.remove('hidden');
}

function resumeGame() {
  if (gameOver) return;
  pauseMenu.classList.add('hidden');
  gamePaused = false;
  loop();
}

function restartGame() {
  resetGameState();
  document.getElementById('pauseBtn').classList.remove('hidden');
  document.getElementById('gameOverMenu').classList.add('hidden');
  if (musicToggle.checked) { try { bgMusic.currentTime = 0; bgMusic.play(); } catch(e){} }
  loop();
}

function goToMainMenu() {
  // hide overlays and show main menu
  pauseMenu.classList.add('hidden');
  gameOverMenu.classList.add('hidden');
  settingsMenu.classList.add('hidden');
  document.getElementById('mainMenu').classList.remove('hidden');
  // stop animations & music
  gamePaused = true;
  gameOver = false;
  try { bgMusic.pause(); } catch(e){}
}

/* ---------------------------
   Initial setup
   --------------------------- */
resetGameState();
scaleGame();

/* set UI high score display */
highEl.innerText = highScore;
menuHighEl.innerText = highScore;
