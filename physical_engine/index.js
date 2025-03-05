const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let cannonSfx = new Audio(
  "https://ia601404.us.archive.org/24/items/metal-block/Anti%20Aircraft%20Cannon-18363-Free-Loops.com.mp3"
);

let cannonTop = new Image();
cannonTop.src =
  "https://ia801504.us.archive.org/32/items/cannon_202104/cannon.png";
cannonTop.onload = renderImages;

let mousePos = null;
let angle = null;
let canShoot = true;

function drawBorder() {
  ctx.fillStyle = "#666666";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(20, 20, 560, 560);
}

function sortBallPos(x, y) {
  let rotatedAngle = angle;
  let dx = x - (cannon.x + 15);
  let dy = y - (cannon.y - 50);
  let distance = Math.sqrt(dx * dx + dy * dy);
  let originalAngle = Math.atan2(dy, dx);
  let newX = cannon.x + 15 + distance * Math.cos(originalAngle + rotatedAngle);
  let newY = cannon.y - 50 + distance * Math.sin(originalAngle + rotatedAngle);

  return {
    x: newX,
    y: newY,
  };
}

class Cannon {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.topX = x - 20;
    this.topY = y - 95;
  }

  stand() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + 15, this.y - 50);
    ctx.lineTo(this.x + 30, this.y);
    ctx.stroke();
  }

  rotateTop() {
    if (mousePos) {
      angle = Math.atan2(
        mousePos.y - (this.y - 50),
        mousePos.x - (this.x + 15)
      );
      ctx.translate(this.x + 15, this.y - 50);
      ctx.rotate(angle);
      ctx.translate(-(this.x + 15), -(this.y - 50));
    }
  }

  draw() {
    this.stand();
    ctx.save();
    this.rotateTop();
    ctx.drawImage(cannonTop, this.topX, this.topY, 100, 50);
  }
}

let cannon = new Cannon(80, 580);

class CannonBall {
  constructor(angle, x, y) {
    this.radius = 15;
    this.mass = this.radius;
    this.angle = angle;
    this.x = x;
    this.y = y;
    this.dx = Math.cos(angle) * 7;
    this.dy = Math.sin(angle) * 7;
    this.gravity = 0.05;
    this.elasticity = 0.5;
    this.friction = 0.008;
    this.collAudio = new Audio(
      "https://archive.org/download/metal-block_202104/metal-block.wav"
    );
    this.collAudio.volume = 0.7;
    this.shouldAudio = true;
    this.timeDiff1 = null;
    this.timeDiff2 = new Date();
  }

  move() {
    if (this.y + this.radius < 580) {
      this.dy += this.gravity;
    }

    this.dx = this.dx - this.dx * this.friction;

    this.x += this.dx;
    this.y += this.dy;
  }

  draw() {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

let cannonBalls = [];

function ballHitWall(ball) {
  if (
    ball.x + ball.radius > 580 ||
    ball.x - ball.radius < 20 ||
    ball.y + ball.radius > 580 ||
    ball.y - ball.radius < 20
  ) {
    if (ball.timeDiff1) {
      ball.timeDiff2 = new Date() - ball.timeDiff1;
      ball.timeDiff2 < 200 ? (ball.shouldAudio = false) : null;
    }
    if (ball.shouldAudio) ball.collAudio.play();

    ball.dy = ball.dy * ball.elasticity;

    if (ball.x + ball.radius > 580) {
      ball.x = 580 - ball.radius;
      ball.dx *= -1;
    } else if (ball.x - ball.radius < 20) {
      ball.x = 20 + ball.radius;
      ball.dx *= -1;
    } else if (ball.y + ball.radius > 580) {
      ball.y = 580 - ball.radius;
      ball.dy *= -1;
    } else if (ball.y - ball.radius < 20) {
      ball.y = 20 + ball.radius;
      ball.dy *= -1;
    }

    ball.timeDiff1 = new Date();
  }
}

function ballHitBall(ball1, ball2) {
  let collision = false;
  let dx = ball1.x - ball2.x;
  let dy = ball1.y - ball2.y;
  let distance = dx * dx + dy * dy;
  if (
    distance <=
    (ball1.radius + ball2.radius) * (ball1.radius + ball2.radius)
  ) {
    collision = true;
  }
  return collision;
}

function collideBalls(ball1, ball2) {
  let dx = ball2.x - ball1.x;
  let dy = ball2.y - ball1.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  let vCollisionNorm = { x: dx / distance, y: dy / distance };
  let vRelativeVelocity = { x: ball1.dx - ball2.dx, y: ball1.dy - ball2.dy };
  let speed =
    vRelativeVelocity.x * vCollisionNorm.x +
    vRelativeVelocity.y * vCollisionNorm.y;
  if (speed < 0) return;
  let impulse = (2 * speed) / (ball1.mass + ball2.mass);
  ball1.dx -= impulse * ball2.mass * vCollisionNorm.x;
  ball1.dy -= impulse * ball2.mass * vCollisionNorm.y;
  ball2.dx += impulse * ball1.mass * vCollisionNorm.x;
  ball2.dy += impulse * ball1.mass * vCollisionNorm.y;
  ball1.dy = ball1.dy * ball1.elasticity;
  ball2.dy = ball2.dy * ball2.elasticity;
}

function collide(index) {
  let ball = cannonBalls[index];
  for (let j = index + 1; j < cannonBalls.length; j++) {
    let testBall = cannonBalls[j];
    if (ballHitBall(ball, testBall)) {
      collideBalls(ball, testBall);
    }
  }
}

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBorder();
  cannon.draw();
  ctx.restore();
  cannonBalls.forEach((ball, index) => {
    ball.move();
    ballHitWall(ball);
    collide(index);
    ball.draw();
  });
}

let imgCount = 1;

function renderImages() {
  if (--imgCount > 0) {
    return;
  }
  animate();
}

canvas.addEventListener("mousemove", (e) => {
  mousePos = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop,
  };
});

canvas.addEventListener("click", (e) => {
  if (angle < -2 || angle > 0.5) return;

  if (!canShoot) return;
  canShoot = false;

  let ballPos = sortBallPos(cannon.topX + 100, cannon.topY + 30);

  cannonBalls.push(new CannonBall(angle, ballPos.x, ballPos.y));

  cannonSfx.currentTime = 0.2;
  cannonSfx.play();

  setTimeout(() => {
    canShoot = true;
  }, 1000);
});
