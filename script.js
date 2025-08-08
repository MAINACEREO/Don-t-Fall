let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth > 768 ? 800 : window.innerWidth;
canvas.height = window.innerHeight > 768 ? 600 : window.innerHeight;

let gameRunning = false;
let gamePaused = false;
let musicEnabled = true;
let soundEnabled = true;

let bgMusic = document.getElementById("bgMusic");

function startGame() {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("pauseBtn").style.display = "block";
    gameRunning = true;
    gameLoop();
    if (musicEnabled) bgMusic.play();
}

function pauseGame() {
    gamePaused = true;
    document.getElementById("pauseMenu").style.display = "block";
}

function resumeGame() {
    gamePaused = false;
    document.getElementById("pauseMenu").style.display = "none";
    gameLoop();
}

function backToMenu() {
    location.reload();
}

function openSettings() {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("settingsMenu").style.display = "block";
}

function toggleMusic() {
    musicEnabled = !musicEnabled;
    if (!musicEnabled) {
        bgMusic.pause();
    } else if (gameRunning) {
        bgMusic.play();
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
}

function gameLoop() {
    if (!gameRunning || gamePaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Game Logic (Player, Obstacles, etc.)
    ctx.fillStyle = "white";
    ctx.fillText("Game Running...", canvas.width / 2 - 50, canvas.height / 2);

    requestAnimationFrame(gameLoop);
}
