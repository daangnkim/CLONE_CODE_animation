const cv = document.querySelector("canvas");
cv.width = innerWidth;
cv.height = innerHeight;

const c = cv.getContext("2d");
const dots = [];

const arrayColors = Array.from({
  length: 8,
})
  .fill(0)
  .map(() => {
    return `hsl(${Math.random() * 360}, 50%, 50%)`;
  });

for (let i = 0; i < 50; i++) {
  dots.push({
    x: Math.floor(Math.random() * cv.width),
    y: Math.floor(Math.random() * cv.height),
    size: Math.random() * 3 + 5,
    color: arrayColors[Math.floor(Math.random() * 8)],
  });
}

const drawDots = () => {
  dots.forEach((dot) => {
    c.fillStyle = dot.color;
    c.beginPath();
    c.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
    c.fill();
  });
};

drawDots();

addEventListener("mousemove", (event) => {
  c.clearRect(0, 0, cv.width, cv.height);
  drawDots();

  let mouse = {
    x: event.clientX,
    y: event.clientY,
  };

  console.log(mouse);

  dots.forEach((dot) => {
    const dist = Math.hypot(dot.x - mouse.x, dot.y - mouse.y);

    if (dist < 300) {
      c.beginPath();
      c.moveTo(dot.x, dot.y);
      c.lineTo(mouse.x, mouse.y);
      c.strokeStyle = dot.color;
      c.lineWidth = 1;
      c.stroke();
    }
  });
});

addEventListener("mouseout", () => {
  c.clearRect(0, 0, cv.width, cv.height);
  drawDots();
});
