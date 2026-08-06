//core gameplay constants and global timers
const gravity = 0.5;
let jumpForce = -12;
const moveSpeed = 2.5;
const enemySpeed = 1;
const VIEWPORT_WIDTH = 1200;
let rocketInterval;
let fireballInterval;

//stores the current game session state
let gameState = {
  score: 0,
  level: 1,
  lives: 3,
  gameRunning: true,
  keys: {},
};

let camera = { x: 0 };

//game objects array
let gameObjects = {
  platforms: [],
  enemies: [],
  rockets: [],
  rocketLaunchers: [],
  fireballs: [],
  fireballLaunchers: [],
  coins: [],
  surpriseBlocks: [],
  pipes: [],
};

//input handling
document.addEventListener("keydown", (e) => {
  gameState.keys[e.code] = true;
  if (e.code === "Space") {
    e.preventDefault();
  }
});
document.addEventListener("keyup", (e) => {
  gameState.keys[e.code] = false;
});

//initialize the game and start the main loop
function initGame() {
  loadLevel(gameState.level - 1);
  gameLoop();
}

//load and build all entities for the selected level
function loadLevel(levelIndex) {
  if (levelIndex >= levels.length) {
    clearInterval(rocketInterval);
    showGameOver(true);
    return;
  }
  //clearing existing objects
  clearLevel();

  //setInterval for rockets
  clearInterval(rocketInterval);
  rocketInterval = setInterval(spawnRocket, 7000);

  //setInterval for fireballs
  fireballInterval = setInterval(spawnFireball, 300);

  const level = levels[levelIndex];
  const gameWorld = document.getElementById("gameWorld");
  gameWorld.style.width = level.width + "px";

  //reset player
  resetPlayer();
  camera.x = 0;
  updateElementPosition(player.element, player.x, player.y);

  //create platforms
  level.platforms.forEach((platformData, index) => {
    const platform = createElement("div", `platform ${platformData.type}`, {
      left: platformData.x + "px",
      top: platformData.y + "px",
      width: platformData.width + "px",
      height: platformData.height + "px",
    });
    gameWorld.appendChild(platform);
    gameObjects.platforms.push({
      element: platform,
      ...platformData,
    });
  });

  //create standard enemies
  level.enemies.forEach((enemyData, index) => {
    const enemy = createElement("div", `enemy ${enemyData.type}`, {
      left: enemyData.x + "px",
      top: enemyData.y + "px",
    });
    gameWorld.appendChild(enemy);
    gameObjects.enemies.push({
      element: enemy,
      x: enemyData.x,
      y: enemyData.y,
      width: 20,
      height: 20,
      direction: -1,
      speed: enemySpeed,
      alive: true,
    });
  });

  //spawn collectible coins
  level.coins.forEach((coinData, index) => {
    const coin = createElement("div", "coin", {
      left: coinData.x + "px",
      top: coinData.y + "px",
    });
    gameWorld.appendChild(coin);
    gameObjects.coins.push({
      element: coin,
      x: coinData.x,
      y: coinData.y,
      width: 20,
      height: 20,
      collected: false,
    });
  });

  //create surprise blocks
  level.surpriseBlocks.forEach((blockData, index) => {
    const block = createElement("div", "surpriseBlock", {
      left: blockData.x + "px",
      top: blockData.y + "px",
    });
    gameWorld.appendChild(block);
    gameObjects.surpriseBlocks.push({
      element: block,
      x: blockData.x,
      y: blockData.y,
      width: 20,
      height: 20,
      type: blockData.type,
      hit: false,
    });
  });

  //create pipes
  level.pipes.forEach((pipeData, index) => {
    const pipe = createElement("div", "pipe", {
      left: pipeData.x + "px",
      top: pipeData.y + "px",
    });
    const pipeTopLeft = createElement("div", "pipeTop");
    const pipeTopRight = createElement("div", "pipeTopRight");
    const pipeBottomLeft = createElement("div", "pipeBottom");
    const pipeBottomRight = createElement("div", "pipeBottomRight");

    pipe.append(pipeTopLeft, pipeTopRight, pipeBottomLeft, pipeBottomRight);
    gameWorld.appendChild(pipe);
    gameObjects.pipes.push({
      element: pipe,
      x: pipeData.x,
      y: pipeData.y,
      width: 40,
      height: 40,
    });
  });

  //create rockets
  level.rocketLaunchers.forEach((launcher) => {
    gameObjects.rocketLaunchers.push({
      x: launcher.x,
      y: launcher.y,
      direction: launcher.direction,
    });
    const cannon = createElement("div", "rocketLauncher", {
      left: launcher.x + "px",
      top: launcher.y + "px",
    });
    gameWorld.appendChild(cannon);
  });

  //create fireballs
  level.fireballLaunchers.forEach((launcher) => {
    gameObjects.fireballLaunchers.push({
      x: launcher.x,
      y: launcher.y,
    });
  });
}

//main game loop executed every frame
function gameLoop() {
  if (!gameState.gameRunning) return;
  update();
  requestAnimationFrame(gameLoop);
}

//update all gameplay logic
function update() {
  //handles horizontal player movement
  if (gameState.keys["ArrowLeft"] || gameState.keys["KeyA"]) {
    player.velocityX = -moveSpeed;
  } else if (gameState.keys["ArrowRight"] || gameState.keys["KeyD"]) {
    player.velocityX = moveSpeed;
  } else {
    player.velocityX *= 0.8;
  }

  //handles jumping
  if (gameState.keys["Space"] && player.grounded) {
    player.velocityY = jumpForce;
    player.grounded = false;
  }

  //apply gravity
  if (!player.grounded) {
    player.velocityY += gravity;
  }

  //update player position
  player.x += player.velocityX;
  player.y += player.velocityY;

  //platform collision
  player.grounded = false;
  for (let platform of gameObjects.platforms) {
    resolveCollision(player, platform);
  }

  //pipe collision
  for (let pipe of gameObjects.pipes) {
    resolveCollision(player, pipe);
  }

  //update enemy behavior and handle player interactions
  for (let enemy of gameObjects.enemies) {
    if (!enemy.alive) continue;

    enemy.x += enemy.speed * enemy.direction;

    //enemy and pipe collision
    for (let pipe of gameObjects.pipes) {
      if (checkCollision(enemy, pipe)) {
        if (enemy.direction > 0) {
          enemy.x = pipe.x - enemy.width;
        } else {
          enemy.x = pipe.x + pipe.width;
        }
        enemy.direction *= -1;
      }
    }

    let onPlatform = false;
    //reverse enemy direction when approaching an edge
    for (let platform of gameObjects.platforms) {
      if (
        enemy.x + enemy.width > platform.x &&
        enemy.x < platform.x + platform.width &&
        enemy.y + enemy.height >= platform.y - 5 &&
        enemy.y + enemy.height <= platform.y + 5
      ) {
        onPlatform = true;
        break;
      }
    }
    const frontX =
      enemy.direction > 0 ? enemy.x + enemy.width + 2 : enemy.x - 2;

    const groundAhead = gameObjects.platforms.some((platform) => {
      return (
        frontX >= platform.x &&
        frontX <= platform.x + platform.width &&
        enemy.y + enemy.height == platform.y
      );
    });
    if (!groundAhead) {
      enemy.direction *= -1;
    }
    updateElementPosition(enemy.element, enemy.x, enemy.y);

    //check enemy and player interaction
    if (checkCollision(player, enemy)) {
      if (player.velocityY > 0 && player.y < enemy.y) {
        //defeat enemy when jumped from above
        enemy.alive = false;
        enemy.element.remove();
        player.velocityY = jumpForce * 0.7;
        gameState.score += 100;
      } else {
        //apply damage when the player collides the enemy
        damagePlayer();
      }
    }
  }

  //update camera position to follow the player
  const gameWorld = document.getElementById("gameWorld");
  camera.x = Math.max(
    0,
    Math.min(
      player.x - VIEWPORT_WIDTH / 2,
      levels[gameState.level - 1].width - VIEWPORT_WIDTH,
    ),
  );
  gameWorld.style.transform = `translateX(${-camera.x}px)`;

  //coin collection
  for (let coin of gameObjects.coins) {
    if (!coin.collected && checkCollision(player, coin)) {
      coin.collected = true;
      coin.element.remove();
      gameState.score += 50;
    }
  }
  //surprise blocks
  for (let block of gameObjects.surpriseBlocks) {
    const collision = resolveCollision(player, block, {
      onBottomHit: (block) => {
        if (!block.hit) {
          block.hit = true;
          block.element.classList.add("hit");

          spawnItemOnBox(block, block.type);

          if (block.type === "coin") {
            gameState.score += 100;
          } else if (block.type === "mushroom") {
            player.big = true;
            player.bigTimer = 700;
            player.element.classList.add("big");
            player.width = 30;
            player.height = 30;
            gameState.score += 150;
            jumpForce = -14;
          }
        }
      },
    });
  }
  // mushroom power-up expiration
  if (player.big) {
    player.bigTimer--;
    if (player.bigTimer <= 0) {
      player.big = false;
      player.element.classList.remove("big");
      player.width = 20;
      player.height = 20;
      jumpForce = -12;
    }
  }
  //allow level transitions through pipes
  for (let pipe of gameObjects.pipes) {
    if (
      player.grounded &&
      player.x + player.width > pipe.x &&
      player.x < pipe.x + pipe.width &&
      Math.abs(player.y + player.height - pipe.y) < 5 &&
      gameState.keys["ArrowDown"]
    ) {
      nextLevel();
    }
  }
  //fall death if the player falls out of bounds
  if (player.y > 440) {
    loseLife();
  }
  updateElementPosition(player.element, player.x, player.y);

  document.getElementById("score").textContent = gameState.score;
  document.getElementById("level").textContent = gameState.level;
  document.getElementById("lives").textContent = gameState.lives;

  //update rockets movement and collision detection
  for (let rocket of gameObjects.rockets) {
    rocket.x += rocket.speed * rocket.direction;
    updateElementPosition(rocket.element, rocket.x, rocket.y);
    //mario and rocket collision
    resolveCollision(player, rocket, {
      onTopHit: () => {
        rocket.remove = true;
        rocket.element.remove();
        player.grounded = false;
        player.velocityY = jumpForce * 0.7;
        gameState.score += 200;
      },
      onLeftHit: damagePlayer,
      onRightHit: damagePlayer,
      onBottomHit: damagePlayer,
    });
  }
  //remove rockets outside of game areea
  gameObjects.rockets = gameObjects.rockets.filter((rocket) => {
    if (rocket.x < -100 || rocket.x > levels[gameState.level - 1].width + 100) {
      rocket.element.remove();
      return false;
    }
    return true;
  });

  //update fireballs projectiles
  for (let fireball of gameObjects.fireballs) {
    fireball.y -= fireball.speed;
    updateElementPosition(fireball.element, fireball.x, fireball.y);
    if (checkCollision(player, fireball)) {
      damagePlayer();
    }
  }

  //remove fireballs outside of game areea
  gameObjects.fireballs = gameObjects.fireballs.filter((fireball) => {
    if (fireball.y < -50) {
      fireball.element.remove();
      return false;
    }
    return true;
  });
}

//advance to the next level
function nextLevel() {
  gameState.level++;
  if (gameState.level > levels.length) {
    showGameOver(true);
  } else {
    player.element.classList.remove("big");
    player.width = 20;
    player.height = 20;
    loadLevel(gameState.level - 1);
  }
}

//reset all game state and restart the session
function restartGame() {
  gameState = {
    score: 0,
    level: 1,
    lives: 3,
    gameRunning: true,
    keys: {},
  };
  resetPlayer();
  document.getElementById("gameOver").style.display = "none";
  clearInterval(rocketInterval);
  clearInterval(fireballInterval);
  initGame();
}

//surpriseBlocks animation
function spawnItemOnBox(block, type) {
  const gameWorld = document.getElementById("gameWorld");
  const item = document.createElement("div");
  item.classList.add(type);
  item.style.left = block.x + "px";
  item.style.top = block.y - 20 + "px";
  gameWorld.appendChild(item);

  const itemObj = {
    x: block.x,
    y: block.y - 20,
    width: 20,
    height: 20,
    element: item,
    velocityY: 0,
    frames: 0,
  };
  if (type === "mushroom") {
    function fall() {
      itemObj.velocityY += gravity;
      itemObj.y += itemObj.velocityY;

      let onPlatform = false;
      for (let platform of gameObjects.platforms) {
        if (
          itemObj.x < platform.x + platform.width &&
          itemObj.x + itemObj.width > platform.x &&
          itemObj.y + itemObj.height >= platform.y &&
          itemObj.y + itemObj.height <= platform.y + 5
        ) {
          onPlatform = true;
          itemObj.y = platform.y - itemObj.height;
          itemObj.velocityY = 0;
          item.remove();
          break;
        }
      }
      item.style.top = itemObj.y + "px";
      if (!onPlatform) {
        requestAnimationFrame(fall);
      }
    }
    fall();
  } else if (type == "coin") {
    function floatUp() {
      itemObj.y -= 1;
      item.style.top = itemObj.y + "px";
      itemObj.frames++;

      if (itemObj.frames < 180) {
        requestAnimationFrame(floatUp);
      } else {
        item.remove();
      }
    }
    floatUp();
  }
}

//spawn a rocket from a random launcher
function spawnRocket() {
  if (gameObjects.rocketLaunchers.length === 0) return;
  const launcher =
    gameObjects.rocketLaunchers[
      Math.floor(Math.random() * gameObjects.rocketLaunchers.length)
    ];
  const rocket = createElement("div", "rocket");
  const gameWorld = document.getElementById("gameWorld");
  updateElementPosition(rocket, launcher.x, launcher.y);
  gameWorld.appendChild(rocket);
  gameObjects.rockets.push({
    element: rocket,
    x: launcher.x,
    y: launcher.y,
    width: 30,
    height: 20,
    speed: 4,
    direction: launcher.direction,
  });
}

//spawn a fireball projectile
function spawnFireball() {
  if (gameObjects.fireballLaunchers.length === 0) return;
  const launcher =
    gameObjects.fireballLaunchers[
      Math.floor(Math.random() * gameObjects.fireballLaunchers.length)
    ];
  const fireball = createElement("div", "fireball");
  const gameWorld = document.getElementById("gameWorld");
  updateElementPosition(fireball, launcher.x, launcher.y);
  gameWorld.appendChild(fireball);
  gameObjects.fireballs.push({
    element: fireball,
    x: launcher.x,
    y: launcher.y,
    width: 20,
    height: 20,
    speed: 5,
  });
}
