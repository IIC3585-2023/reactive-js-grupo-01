import { Subject } from "rxjs";

const FOOD_ID = 2;
const WALL_ID = 1;

const transformDirections = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
}

const numberToDirection = { 0: "left", 1: "up", 2: "right", 3: "down" }

const getPositions = (map, type) => 
  map.array.flatMap((row, rowIndex) => 
    row.map((cell, cellIndex) => cell === type ? { x: cellIndex, y: rowIndex, active: true } : null)
  )
    .filter(Boolean)

const checkCollision = (player, instances) => {
  const { x: dx, y: dy } = transformDirections[player.direction];
  const newY = player.position.y + dy;
  const newX = player.position.x + dx;
  const instanceIndex = instances.findIndex(({ x, y }) => x === newX && y === newY);
  return instances[instanceIndex]?.active ? instanceIndex : -1;
}

const calculateDistance = ({ x: playerX, y: playerY }, { x: ghostX, y: ghostY }) => {
  const x = Math.abs(playerX - ghostX);
  const y = Math.abs(playerY - ghostY);
  return Math.sqrt(x * x + y * y);
}

const getClosestDirection = (players, ghost, wallInstances) => {
  const directions = ["left", "right", "up", "down"];

  if (players.every(({alive}) => !alive)) {
    return directions[Math.floor(Math.random() * directions.length)];
  }

  // Choose valid direction closest to a player
  const closestPlayer = players
    .filter(player => player.alive)
    .reduce((closest, player) => {
      const distance = calculateDistance(player.position, ghost.position);
      if (distance < closest.distance) {
        return { distance, player };
      }
      return closest;
    }, { distance: Infinity, player: null });

  const directionToPlayer = directions.reduce((closest, direction) => {
    const { x: dx, y: dy } = transformDirections[direction];
    const distance = calculateDistance(
      closestPlayer.player.position, 
      { x: ghost.position.x + dx, y: ghost.position.y + dy }
    );
    // Check if the direction is valid
    if (checkCollision({ position: ghost.position, direction }, wallInstances) !== -1) {
      return closest;
    }
    // Check if the direction is closer to the player
    if (distance < closest.distance) {
      return { distance, direction };
    }
    return closest;
  }, { distance: Infinity, direction: null });

  return directionToPlayer.direction;
}

const cellClassByType = { 1: "wall", 2: "food", [-1]: "black" }
const renderMap = (map) => {

  const mapElement = document.querySelector(".map");
  mapElement.innerHTML = "";

  return map.map((row) => {
    const rowEl = document.createElement("div");
    rowEl.classList.add("row");
    const cellsRow = row.map((cell) => {
      const cellEl = document.createElement("div");
      cellEl.classList.add("cell");
      cellEl.classList.add(cellClassByType[cell]);
      rowEl.appendChild(cellEl);
      return cellEl;
    });

    mapElement.appendChild(rowEl);
    return cellsRow;
  });
}


export function initGameState(map) {
  const mapCells = renderMap(map.array);
  return {
    players: [
      {
        position: { ...map.pos_x },
        direction: "right",
        score: 0,
        alive: true,
      },
      {
        position: { ...map.pos_y },
        direction: "left",
        score: 0,
        alive: true,
      }
    ],
    ghosts: [
      {
        position: { ...map.pos_ghost },
        direction: "left",
        active: true,
      },
      {
        position: { ...map.pos_ghost2 },
        direction: "left",
        active: true,
      },
      {
        position: { ...map.pos_ghost3 },
        direction: "left",
        active: true,
      },
    ],
    foodPositions: getPositions(map, FOOD_ID).filter(({ x, y }) => !(x === map.pos_x.x && y === map.pos_x.y)),
    mapCells,
    finished: false,
  }
}


const gameEnded = (state) => state.players.every(({ alive }) => !alive) || state.foodPositions.every(({ active }) => !active)

export function updateGameState(map) {
  return function (state, playersDirections) {
    const wallInstances = getPositions(map, WALL_ID);

    state.ghosts.forEach(ghost => {
      ghost.direction = getClosestDirection(state.players, ghost, wallInstances);

      // Randomly change direction
      if (Math.random() <= 0.2) ghost.direction = numberToDirection[Math.floor(Math.random() * 4)];
      
      if (checkCollision(ghost, wallInstances) !== -1) return;

      const playerCoordinates = checkCollision(
        ghost, 
        state.players.map(({ position, alive }) => ({ ...position, active: alive }))
      );
    
      if (playerCoordinates !== -1) state.players[playerCoordinates].alive = false;



      ghost.position.y += transformDirections[ghost.direction].y;
      ghost.position.x += transformDirections[ghost.direction].x;
    })

    state.players.forEach((player, index) => {
      player.direction = playersDirections[index];

      if (checkCollision(player, wallInstances) !== -1 || !player.alive) return;

      
      const foodCoordinates = checkCollision(player, state.foodPositions);
      if (foodCoordinates !== -1) {
        state.foodPositions[foodCoordinates].active = false;
        player.score += 1;
      }
      
      const ghostCoordinates = checkCollision(
        player, 
        state.ghosts.map(({ position }) => ({...position, active: true}))
      );
      if (ghostCoordinates !== -1) {
        player.alive = false;
      }
      player.position.y += transformDirections[player.direction].y;
      player.position.x += transformDirections[player.direction].x;
    })

    state.finished = gameEnded(state);
    return state;
  }
}

const entityTransform = ({ x, y }) => `translate(${x * 33}px, ${y * 33}px)`
const directionToRotation = { left: 180, right: 0, up: 270, down: 90 };

// Componente de PacMan
function createPacManComponent(mapElement, index = 0) {
  // Setup
  const pacManSubject = new Subject();

  const pacManElement = document.createElement("div");
    pacManElement.classList.add("pacman");
    pacManElement.classList.add(`pacman-${index}`);

    const pacManImg = document.createElement("div");
    pacManImg.classList.add("pacman-img");
    pacManElement.appendChild(pacManImg);

    mapElement.appendChild(pacManElement);

  const scoreValue = document.querySelector(`#score-p${index}`);

  const pacManSubscription = pacManSubject.subscribe(({ position, direction, alive, score }) => {
    // Update
    const { x, y } = position;
    pacManElement.style.transform = entityTransform({ x, y });
    pacManImg.style.transform = `rotate(${directionToRotation[direction]}deg)`;
    setTimeout(() => scoreValue.innerHTML = score, 150);

    if (!alive) {
      pacManSubscription.unsubscribe();
      setTimeout(() => pacManElement.classList.remove("pacman"), 150);
    }
  });

  return pacManSubject;
}

// Componente de Fantasma
function createGhostComponent(mapElement, index = 0) {
  const ghostSubject = new Subject();

  const ghostElement = document.createElement("div");
  ghostElement.classList.add("ghost");
  ghostElement.classList.add(`ghost-${index}`);

  mapElement.appendChild(ghostElement);
  
  ghostSubject.subscribe(({ position: { x, y }, direction }) => {
    ghostElement.style.transform = entityTransform({ x, y }, direction);
  })

  return ghostSubject;
}

// Componente de ganador
function createWinnerComponent() {
  const winnerSubject = new Subject();
  const winnerMessageEl = document.querySelector(".message");
  winnerMessageEl.innerHTML = "";

  winnerSubject.subscribe((winner) => {
    const playersNames = ["Yellow", "Green"]; 
    winnerMessageEl.innerHTML = `Player ${playersNames[parseInt(winner)]} wins!`;
  })

  return winnerSubject;
}


export function renderToDom({ players = 2, ghostsAmount = 3 } = {}) {
  const mapElement = document.querySelector(".map");

  const playersPacsSubjects = Array.from({ length: players }, (_, i) => createPacManComponent(mapElement, i))
  const ghosts = Array.from({ length: ghostsAmount }, (_, i) => createGhostComponent(mapElement, i))
  const winnerComponent = createWinnerComponent(mapElement);

  // Actualizar el estado 
  return function render(gameState) {

    if (gameState.finished) {
      // Get the player with the highest score
      const winner = gameState.players.reduce((winner, player) => {
        if (player.score > winner.score) return player;
        return winner;
      }, { score: 0 })

      winnerComponent.next(gameState.players.indexOf(winner));
    }

    gameState.ghosts.forEach((ghost, index) => ghosts[index].next(ghost))
    gameState.players.forEach((player, index) => {
      playersPacsSubjects[index].next(player);

      // Removemos la comida arriva del pacman
      const { x, y } = player.position
      setTimeout(() => {
        gameState.mapCells[y][x].classList.remove("food")
      }, 175);
    });
  }
}
