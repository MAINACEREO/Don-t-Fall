const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player
let player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0
};

// Platforms
let platforms = [
    { x: 200, y: 400, width: 100, height: 20 },
    { x: 400, y: 300, width: 100, height: 20 },
    { x: 100, y: 200, width: 100, height: 20 }
];

// Music
const bgMusic = document.getElementById("bgMusic");
bgMusic.volume = 0.5;
bgMusic.play().catch(err => console.log("Music blocked until user interacts"));

// Movement
function movePlayer() {
    player.x += player.dx;

    // Border limits
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Draw platforms
function drawPlatforms() {
    ctx.fillStyle = "green";
    platforms.forEach(p => {
        ctx.fillRect(p.x, p.y, p.width, p.height);
    });
}

// Update game
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawPlatforms();
    movePlayer();

    requestAnimationFrame(update);
}
update();

// Keyboard Controls
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") player.dx = -player.speed;
    else if (e.key === "ArrowRight") player.dx = player.speed;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") player.dx = 0;
});

// Mobile Controls
document.getElementById("leftBtn").addEventListener("touchstart", () => {
    player.dx = -player.speed;
});
document.getElementById("rightBtn").addEventListener("touchstart", () => {
    player.dx = player.speed;
});
document.getElementById("leftBtn").addEventListener("touchend", () => {
    player.dx = 0;
});
document.getElementById("rightBtn").addEventListener("touchend", () => {
    player.dx = 0;
});
