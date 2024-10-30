const currentScoreElement = document.getElementById("currentScore");
const currentSpeedElement = document.getElementById("currentSpeed");
const highScoreElement = document.getElementById("highScore");
const startScreen = document.querySelector(".startScreen");
const gameArea = document.querySelector(".gameArea");

let player = { speed: 0, score: 0, isPaused: false, start: false };
let highScore = localStorage.getItem("highScore") || 0;
let speedTimer = 0;
const speedMultiplier = 15; // Adjust multiplier for realistic km/h display
let keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

// Event listeners for keyboard controls
document.addEventListener("keydown", handleKeyPress);
document.addEventListener("keyup", keyUp);
startScreen.addEventListener("click", initializeGame);

// Touch Controls for Mobile
const upBtn = document.getElementById("up");
const downBtn = document.getElementById("down");
const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");

upBtn.addEventListener("touchstart", () => handleTouchStart("ArrowUp"));
upBtn.addEventListener("touchend", () => handleTouchEnd("ArrowUp"));
downBtn.addEventListener("touchstart", () => handleTouchStart("ArrowDown"));
downBtn.addEventListener("touchend", () => handleTouchEnd("ArrowDown"));
leftBtn.addEventListener("touchstart", () => handleTouchStart("ArrowLeft"));
leftBtn.addEventListener("touchend", () => handleTouchEnd("ArrowLeft"));
rightBtn.addEventListener("touchstart", () => handleTouchStart("ArrowRight"));
rightBtn.addEventListener("touchend", () => handleTouchEnd("ArrowRight"));

// Functions for handling key and touch events
function handleKeyPress(e) {
  if (e.key === "Escape") {
    togglePause();
  } else {
    keys[e.key] = true;
  }
}

function keyUp(e) {
  keys[e.key] = false;
}

function handleTouchStart(direction) {
  keys[direction] = true;
}

function handleTouchEnd(direction) {
  keys[direction] = false;
}

function togglePause() {
  if (player.start) {
    player.isPaused = !player.isPaused;
    if (player.isPaused) {
      startScreen.innerHTML = "Game Paused <br> Press Escape to Resume";
      startScreen.classList.remove("hide");
    } else {
      startScreen.classList.add("hide");
      window.requestAnimationFrame(runGame);
    }
  }
}

function isCollide(a, b) {
  const aRect = a.getBoundingClientRect();
  const bRect = b.getBoundingClientRect();
  return !(
    aRect.bottom < bRect.top ||
    aRect.top > bRect.bottom ||
    aRect.right < bRect.left ||
    aRect.left > bRect.right
  );
}

function moveLines() {
  let lines = document.querySelectorAll(".lines");
  lines.forEach(function (item) {
    if (item.y >= 700) {
      item.y -= 750;
    }
    item.y += player.speed;
    item.style.top = item.y + "px";
  });
}

function endGame() {
  player.start = false;
  clearInterval(speedTimer);

  if (player.score > highScore) {
    highScore = player.score;
    localStorage.setItem("highScore", highScore);
    startScreen.innerHTML = `Congratulations! New High Score: ${highScore}<br>Press here to play again.`;
  } else {
    startScreen.innerHTML = `Game over <br> Your final score is ${player.score} <br> High Score: ${highScore}<br> Press here to play again.`;
  }

  startScreen.classList.remove("hide");
  highScoreElement.innerText = highScore;
}

function moveEnemy(myCar) {
  let enemyCarList = document.querySelectorAll(".enemyCar");
  enemyCarList.forEach(function (enemyCar) {
    if (isCollide(myCar, enemyCar)) {
      endGame();
    }
    if (enemyCar.y >= 750) {
      enemyCar.y = -300;

      // Set left position to a value within game area boundaries
      const maxLeftPosition = gameArea.offsetWidth - enemyCar.offsetWidth;
      enemyCar.style.left = Math.floor(Math.random() * maxLeftPosition) + "px";
    }
    enemyCar.y += player.speed;
    enemyCar.style.top = enemyCar.y + "px";
  });
}

function runGame() {
  if (player.isPaused) return;

  let car = document.querySelector(".myCar");
  let road = gameArea.getBoundingClientRect();

  if (player.start) {
    moveLines();
    moveEnemy(car);
    if (keys.ArrowUp && player.y > road.top + 150) {
      player.y -= player.speed;
    }
    if (keys.ArrowDown && player.y < road.bottom - 85) {
      player.y += player.speed;
    }
    if (keys.ArrowLeft && player.x > 0) {
      player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < road.width - car.offsetWidth) { // Ensure car doesn't cross right boundary
      player.x += player.speed;
    }

    car.style.top = player.y + "px";
    car.style.left = player.x + "px";
    window.requestAnimationFrame(runGame);

    currentScoreElement.innerText = player.score;
    currentSpeedElement.innerText = Math.floor(player.speed * speedMultiplier) + " km/h";
  }
}

function initializeGame() {
  startScreen.classList.add("hide");
  gameArea.innerHTML = "";
  player.start = true;
  player.speed = 1; // Start speed at 1 for smooth acceleration
  player.score = 0;
  player.isPaused = false;

  window.requestAnimationFrame(runGame);
  highScoreElement.innerText = highScore;

  for (let x = 0; x < 5; x++) {
    let roadLine = document.createElement("div");
    roadLine.setAttribute("class", "lines");
    roadLine.y = x * 150;
    roadLine.style.top = roadLine.y + "px";
    gameArea.appendChild(roadLine);
  }

  let car = document.createElement("div");
  car.setAttribute("class", "myCar");
  gameArea.appendChild(car);
  player.x = car.offsetLeft;
  player.y = car.offsetTop;

  for (let x = 0; x < 3; x++) {
    let enemyCar = document.createElement("div");
    enemyCar.setAttribute("class", "enemyCar");
    enemyCar.y = (x + 1) * 350 * -1;
    enemyCar.style.top = enemyCar.y + "px";
    
    // Set left position to a random value within game area boundaries
    const maxLeftPosition = gameArea.offsetWidth - enemyCar.offsetWidth;
    enemyCar.style.left = Math.floor(Math.random() * maxLeftPosition) + "px";
    gameArea.appendChild(enemyCar);
  }

  speedTimer = setInterval(increaseSpeed, 5000);
}

function increaseSpeed() {
  player.speed += 1;
}
