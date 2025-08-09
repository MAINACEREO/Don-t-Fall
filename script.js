// Elements
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
const coinSfx = document.getElementById('coinSfx');
const gameOverSfx = document.getElementById('gameOverSfx');

// Game constants
const GAME_W = 360;
const GAME_H = 530;
let x = (GAME_W/2) - 20; // player left
let y = 150;              // player bottom
let vy = 0;
let started = false;
let gameOver = false;
let paused = false;

let platforms = [];
let coins = [];
let score = 0;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;

let moveLeftHold = false;
let moveRightHold = false;

highEl.innerText = highScore;
menuHighEl.innerText = highScore;
scoreEl.innerText = score;

// Responsive scaling
function scaleGame(){
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const s = Math.min(vw / GAME_W, vh / GAME_H);
  gameEl.style.transform = `scale(${s})`;
}
window.addEventListener('resize', scaleGame);
scaleGame();

// DOM helpers
function createPlatform(px, py){
  const el = document.createElement('div');
  el.className = 'platform';
  el.style.left = px + 'px';
  el.style.bottom = py + 'px';
  platformsEl.appendChild(el);
  platforms.push({el, x: px, y: py, w: 120, h: 20});

  if (Math.random() < 0.5){
    const c = document.createElement('div');
    c.className = 'coin';
    const cx = px + 50;
    const cy = py + 25;
    c.style.left = cx + 'px';
    c.style.bottom = cy + 'px';
    coinsEl.appendChild(c);
    coins.push({el: c, x: cx, y: cy, w: 20, h: 20});
  }
}

function clearEntities(){
  platforms.forEach(p => { if(p.el.parentNode) p.el.parentNode.removeChild(p.el); });
  coins.forEach(c => { if(c.el.parentNode) c.el.parentNode.removeChild(c.el); });
  platforms = [];
  coins = [];
}

// Reset game
function resetGame(){
  clearEntities();
  x = (GAME_W/2) - 20;
  y = 150;
  vy = 0;
  score = 0;
  scoreEl.innerText = score;
  gameOver = false;
  started = false;
  paused = false;

  // starting platform under player
  createPlatform(GAME_W/2 - 60, 100);
  // initial platforms
  for (let i=1;i<6;i++){
    createPlatform(Math.random()*(GAME_W-120), i*90 + 100);
  }
  render();
}

// Render positions
function render(){
  playerEl.style.left = x + 'px';
  playerEl.style.bottom = y + 'px';
}

// Game update
function update(){
  if (paused || gameOver) return;

  // horizontal movement
  if (moveLeftHold) x -= 6;
  if (moveRightHold) x += 6;
  if (x < 0) x = 0;
  if (x + 40 > GAME_W) x = GAME_W - 40;

  // gravity
  vy -= 0.5;
  y += vy;

  // platform collision -> auto-jump
  for (let p of platforms){
    if (x + 40 > p.x && x < p.x + p.w &&
        y - 5 < p.y + p.h && y - 5 > p.y &&
        vy <= 0){
      y = p.y + p.h;
      vy = 12; // auto jump
      if (!started) started = true;
    }
  }

  // coin collect
  for (let i = coins.length - 1; i >= 0; i--){
    const c = coins[i];
    if (x + 40 > c.x && x < c.x + c.w &&
        y + 40 > c.y && y < c.y + c.h){
      if (c.el.parentNode) c.el.parentNode.removeChild(c.el);
      coins.splice(i,1);
      score += 10;
      scoreEl.innerText = score;
      if (sfxToggle.checked){ try{ coinSfx.currentTime = 0; coinSfx.play(); }catch(e){} }
    }
  }

  // scrolling when high
  if (y > 300){
    const dy = y - 300;
    y = 300;
    platforms.forEach(p => { p.y -= dy; p.el.style.bottom = p.y + 'px'; });
    coins.forEach(c => { c.y -= dy; c.el.style.bottom = c.y + 'px'; });

    // remove off-screen
    platforms = platforms.filter(p => {
      if (p.y < 0){ if (p.el.parentNode) p.el.parentNode.removeChild(p.el); return false; }
      return true;
    });
    coins = coins.filter(c => {
      if (c.y < 0){ if (c.el.parentNode) c.el.parentNode.removeChild(c.el); return false; }
      return true;
    });

    while (platforms.length < 6){
      createPlatform(Math.random()*(GAME_W-120), (platforms[platforms.length-1].y || 100) + 80 + Math.random()*20);
    }

    score++;
    scoreEl.innerText = score;
  }

  // game over condition (only if started)
  if (started && y < 0){
    gameOver = true;
    handleGameOver();
    return;
  }

  render();
}

// Animation loop
let raf = null;
function loop(){
  if (!paused && !gameOver) {
    update();
    raf = requestAnimationFrame(loop);
  } else {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }
}

// Controls events
leftControl.addEventListener('touchstart', e=>{e.preventDefault(); moveLeftHold = true;});
leftControl.addEventListener('touchend', e=>{e.preventDefault(); moveLeftHold = false;});
rightControl.addEventListener('touchstart', e=>{e.preventDefault(); moveRightHold = true;});
rightControl.addEventListener('touchend', e=>{e.preventDefault(); moveRightHold = false;});

leftControl.addEventListener('mousedown', ()=>moveLeftHold = true);
leftControl.addEventListener('mouseup', ()=>moveLeftHold = false);
rightControl.addEventListener('mousedown', ()=>moveRightHold = true);
rightControl.addEventListener('mouseup', ()=>moveRightHold = false);

window.addEventListener('keydown', e=>{
  if (e.code === 'ArrowLeft') moveLeftHold = true;
  if (e.code === 'ArrowRight') moveRightHold = true;
  if (e.code === 'Escape') {
    // toggle pause
    if (!gameOver && started) {
      if (paused) resumeGame(); else pauseGame();
    }
  }
});
window.addEventListener('keyup', e=>{
  if (e.code === 'ArrowLeft') moveLeftHold = false;
  if (e.code === 'ArrowRight') moveRightHold = false;
});

// UI buttons
startBtn.addEventListener('click', ()=>{
  mainMenu.classList.add('hidden');
  startGame();
});
settingsBtn.addEventListener('click', ()=>{
  mainMenu.classList.add('hidden');
  settingsMenu.classList.remove('hidden');
});
settingsBack.addEventListener('click', ()=>{
  settingsMenu.classList.add('hidden');
  mainMenu.classList.remove('hidden');
});
pauseBtn.addEventListener('click', ()=> pauseGame());
resumeBtn.addEventListener('click', ()=> { pauseMenu.classList.add('hidden'); resumeGame(); });
restartBtn.addEventListener('click', ()=> { pauseMenu.classList.add('hidden'); restartGame(); });
toMenuBtn.addEventListener('click', ()=> goToMenu());
goMenuBtn.addEventListener('click', ()=> goToMenu());
againBtn.addEventListener('click', ()=> { gameOverMenu.classList.add('hidden'); restartGame(); });

// music & sfx toggles
musicToggle.addEventListener('change', ()=>{
  if (!musicToggle.checked) try{ bgMusic.pause(); }catch(e){}
  else if (started) try{ bgMusic.play(); }catch(e){}
});

// game control functions
function startGame(){
  resetGame();
  pauseBtn.classList.remove('hidden');
  if (musicToggle.checked) { try{ bgMusic.currentTime = 0; bgMusic.play(); }catch(e){} }
  loop();
}

function pauseGame(){
  paused = true;
  pauseMenu.classList.remove('hidden');
  try{ bgMusic.pause(); }catch(e){}
}
function resumeGame(){
  paused = false;
  if (musicToggle.checked) try{ bgMusic.play(); }catch(e){}
  loop();
}
function restartGame(){
  resetGame();
  gameOverMenu.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
  if (musicToggle.checked) try{ bgMusic.currentTime = 0; bgMusic.play(); }catch(e){}
  loop();
}
function goToMenu(){
  paused = true;
  gameOver = false;
  mainMenu.classList.remove('hidden');
  pauseMenu.classList.add('hidden');
  gameOverMenu.classList.add('hidden');
  settingsMenu.classList.add('hidden');
  try{ bgMusic.pause(); }catch(e){}
}

// handle game over
function handleGameOver(){
  // update highscore
  if (score > highScore){
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }
  finalScoreEl.innerText = score;
  finalHighEl.innerText = highScore;
  document.getElementById('menuHigh').innerText = highScore;
  scoreEl.innerText = score;
  gameOverMenu.classList.remove('hidden');
  try{ if (sfxToggle.checked){ gameOverSfx.currentTime = 0; gameOverSfx.play(); } }catch(e){}
}

// initial reset
resetGame();
