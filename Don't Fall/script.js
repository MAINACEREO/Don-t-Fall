const player = document.getElementById("player");
const platformsContainer = document.getElementById("platforms");
const coinsContainer = document.getElementById("coinsContainer");
const scoreDisplay = document.getElementById("score");
const highscoreDisplay = document.getElementById("highscore");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");
const finalHighScore = document.getElementById("finalHighScore");

const jumpSound = document.getElementById("jumpSound");
const coinSound = document.getElementById("coinSound");
const gameOverSound = document.getElementById("gameOverSound");

let x = 160;
let y = 150;
let velocityY = 0;
let score = 0;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
let platforms = [];
let coins = [];
let gameOver = false;
let started = false;

highscoreDisplay.innerText = highScore;

function createPlatform(xPos, yPos) {
  const plat = document.createElement("div");
  plat.className = "platform";
  plat.style.left = xPos + "px";
  plat.style.bottom = yPos + "px";
  platformsContainer.appendChild(plat);
  platforms.push({ el: plat, x: xPos, y: yPos });

  if (Math.random() < 0.5) {
    const coin = document.createElement("div");
    coin.className = "coin";
    coin.style.left = (xPos + 50) + "px";
    coin.style.bottom = (yPos + 25) + "px";
    coinsContainer.appendChild(coin);
    coins.push({ el: coin, x: xPos + 50, y: yPos + 25 });
  }
}

createPlatform(120, 100);
for (let i = 1; i < 6; i++) {
  createPlatform(Math.random() * 240, i * 90 + 100);
}

function update() {
  if (gameOver) return;

  velocityY -= 0.5;
  y += velocityY;

  for (let plat of platforms) {
    if (
      x + 40 > plat.x &&
      x < plat.x + 120 &&
      y - 5 < plat.y + 20 &&
      y - 5 > plat.y &&
      velocityY <= 0
    ) {
      y = plat.y + 20;
      velocityY = 12;
      if (!started) started = true;
      jumpSound.currentTime = 0;
      jumpSound.play();
    }
  }

  for (let i = coins.length - 1; i >= 0; i--) {
    const c = coins[i];
    if (
      x + 40 > c.x &&
      x < c.x + 20 &&
      y + 40 > c.y &&
      y < c.y + 20
    ) {
      coinsContainer.removeChild(c.el);
      coins.splice(i, 1);
      score += 10;
      scoreDisplay.innerText = score;
      coinSound.currentTime = 0;
      coinSound.play();
    }
  }

  if (y > 300) {
    const offset = y - 300;
    y = 300;

    platforms.forEach(p => {
      p.y -= offset;
      p.el.style.bottom = p.y + "px";
    });

    coins.forEach(c => {
      c.y -= offset;
      c.el.style.bottom = c.y + "px";
    });

    platforms = platforms.filter(p => {
      if (p.y < 0) {
        platformsContainer.removeChild(p.el);
        return false;
      }
      return true;
    });

    coins = coins.filter(c => {
      if (c.y < 0) {
        coinsContainer.removeChild(c.el);
        return false;
      }
      return true;
    });

    while (platforms.length < 6) {
      const lastY = platforms[platforms.length - 1].y;
      createPlatform(Math.random() * 240, lastY + 80 + Math.random() * 20);
    }

    score += 1;
    scoreDisplay.innerText = score;
  }

  if (started && y < 0) {
    if (score > highScore) {
      localStorage.setItem('highScore', score);
      highScore = score;
    }
    finalScore.innerText = score;
    finalHighScore.innerText = highScore;
    gameOverSound.currentTime = 0;
    gameOverSound.play();
    gameOverScreen.style.display = "block";
    gameOver = true;
  }

  player.style.left = x + "px";
  player.style.bottom = y + "px";

  requestAnimationFrame(update);
}

function moveLeft() {
  x -= 55;
}

function moveRight() {
  x += 55;
}

function restartGame() {
  location.reload();
}

update();
