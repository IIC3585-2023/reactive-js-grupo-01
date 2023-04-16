const FOOD_ID = 2;
const WALL_ID = 1;

const transformDirections = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
}

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

const renderMap = (map) => {
  const mapElement = document.querySelector(".map");
  mapElement.innerHTML = "";
  const mapCells = [];
  map.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.classList.add("row");
    const cellsRow = [];
    row.forEach((cell) => {
      const cellEl = document.createElement("div");
      cellEl.classList.add("cell");
      if (cell === 1) {
        cellEl.classList.add("wall");
      } else if (cell === 2) {
        cellEl.classList.add("food");
      } else if (cell === -1) {
        cellEl.classList.add("black");
      }
      rowEl.appendChild(cellEl);
      cellsRow.push(cellEl)
    });
    mapCells.push(cellsRow);
    mapElement.appendChild(rowEl);
  });
  return mapCells;
}


export function initGameState(map) {
  const mapCells = renderMap(map.array);
  return {
    players: [
      {
        position: map.pos_x,
        direction: "right",
        score: 0,
      },
      {
        position: map.pos_y,
        direction: "left",
        score: 0,
      }
    ],
    foodPositions: getPositions(map, FOOD_ID),
    mapCells
  }
}

export function updateGameState(map) {
  return function (oldState, playersDirections) {

    const wallInstances = getPositions(map, WALL_ID);

    oldState.players.forEach((player, index) => {
      player.direction = playersDirections[index]

      if (checkCollision(player, wallInstances) !== -1) {
        return;
      }

      const foodCoordinates = checkCollision(player, oldState.foodPositions)
      if (foodCoordinates !== -1) {
        oldState.foodPositions[foodCoordinates].active = false;
        player.score += 1;
      }

      player.position.y += transformDirections[player.direction].y;
      player.position.x += transformDirections[player.direction].x;

      const scoreValue = document.querySelector(`#score-p${index}`);
      scoreValue.innerHTML = oldState.players[index].score;
    })

    return oldState // newState
  }
}

const transformRotations = { left: 0, right: 2, up: 1, down: 3 }
const playerTransform = ({ x, y }, r) => `translate(${x * 33}px, ${y * 33}px)`

export function renderToDom({ players = 2 } = {}) {
  const mapElement = document.querySelector(".map");

  const playersPacs = Array.from({ length: players }, (_, index) => {
    const playerPac = document.createElement("div")
    playerPac.classList.add("pacman")
    playerPac.classList.add(`pacman-${index}`) // todo
    mapElement.appendChild(playerPac)
    return playerPac
  })

  // Actualizar el estado 
  return function (gameState) {

    // fin de lo que estaba antes

    gameState.players.forEach((player, index) => {
      const { x, y } = player.position
      // playersPacs[index].style.transform  += "transform 0.5s"
      playersPacs[index].style.transform = playerTransform({ x, y }, player.direction);
      // playersPacs[index].style.rotate = `rotate(${}deg)`
      // const rotation = transformRotations[player.direction] * 90;
      // console.log(rotation);
      // playersPacs[index].style.transform += ` rotate(${rotation}deg)`;
      setTimeout(() => gameState.mapCells[y][x].classList.remove("food"), 150);
    });
  }
}
