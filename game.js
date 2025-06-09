const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");
const difficultySelect = document.getElementById("difficulty");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Paddle settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const PADDLE_MARGIN = 16;
const PADDLE_SPEED = 5;

// Ball settings
const BALL_SIZE = 14;
const BALL_SPEED = 5;

// Score
let scoreLeft = 0;
let scoreRight = 0;

// Difficulty settings
const difficulties = {
    easy: 0.05,
    medium: 0.15,
    hard: 1.0,
};
let aiReactionSpeed = difficulties[difficultySelect.value];

// Player paddle (left)
const leftPaddle = {
    x: PADDLE_MARGIN,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
};

// AI paddle (right)
const rightPaddle = {
    x: WIDTH - PADDLE_WIDTH - PADDLE_MARGIN,
    y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
};

// Ball
const ball = {
    x: WIDTH / 2 - BALL_SIZE / 2,
    y: HEIGHT / 2 - BALL_SIZE / 2,
    size: BALL_SIZE,
    speed: BALL_SPEED,
    vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    vy: BALL_SPEED * (Math.random() * 2 - 1),
};

// Listen for difficulty changes
difficultySelect.addEventListener("change", () => {
    aiReactionSpeed = difficulties[difficultySelect.value];
});

// Mouse control for left paddle
canvas.addEventListener("mousemove", function (e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    leftPaddle.y = mouseY - leftPaddle.height / 2;
    if (leftPaddle.y < 0) leftPaddle.y = 0;
    if (leftPaddle.y + leftPaddle.height > HEIGHT) leftPaddle.y = HEIGHT - leftPaddle.height;
});

// Draw everything
function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = "#fff";
    for (let y = 0; y < HEIGHT; y += 28) {
        ctx.fillRect(WIDTH / 2 - 2, y, 4, 16);
    }

    ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
    ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
}

// Collision helper
function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.size > b.x &&
        a.y < b.y + b.height &&
        a.y + a.size > b.y
    );
}

// Reset ball
function resetBall(direction) {
    ball.x = WIDTH / 2 - BALL_SIZE / 2;
    ball.y = HEIGHT / 2 - BALL_SIZE / 2;
    ball.vx = BALL_SPEED * (direction > 0 ? 1 : -1);
    ball.vy = BALL_SPEED * (Math.random() * 2 - 1);
}

// Update game logic
function update() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y <= 0 || ball.y + ball.size >= HEIGHT) {
        ball.vy *= -1;
        ball.y = Math.max(0, Math.min(ball.y, HEIGHT - ball.size));
    }

    // Left paddle collision
    if (isColliding(
        { x: ball.x, y: ball.y, size: ball.size },
        { x: leftPaddle.x, y: leftPaddle.y, width: leftPaddle.width, height: leftPaddle.height }
    )) {
        ball.vx = Math.abs(ball.vx);
        let collidePoint = (ball.y + ball.size / 2) - (leftPaddle.y + leftPaddle.height / 2);
        collidePoint /= (leftPaddle.height / 2);
        ball.vy = BALL_SPEED * collidePoint;
    }

    // Right paddle collision
    if (isColliding(
        { x: ball.x, y: ball.y, size: ball.size },
        { x: rightPaddle.x, y: rightPaddle.y, width: rightPaddle.width, height: rightPaddle.height }
    )) {
        ball.vx = -Math.abs(ball.vx);
        let collidePoint = (ball.y + ball.size / 2) - (rightPaddle.y + rightPaddle.height / 2);
        collidePoint /= (rightPaddle.height / 2);
        ball.vy = BALL_SPEED * collidePoint;
    }

    // Score conditions
    if (ball.x <= 0) {
        scoreRight++;
        document.getElementById("score-right").textContent = scoreRight;
        resetBall(1);
    }
    if (ball.x + ball.size >= WIDTH) {
        scoreLeft++;
        document.getElementById("score-left").textContent = scoreLeft;
        resetBall(-1);
    }

    // Advanced AI movement
    const targetY = ball.y + ball.size / 2;
    const centerY = rightPaddle.y + rightPaddle.height / 2;
    rightPaddle.y += (targetY - centerY) * aiReactionSpeed;

    // Clamp
    if (rightPaddle.y < 0) rightPaddle.y = 0;
    if (rightPaddle.y + rightPaddle.height > HEIGHT) rightPaddle.y = HEIGHT - rightPaddle.height;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
