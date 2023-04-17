import "./styles.css";


import { fromEvent, interval } from "rxjs";
import { filter, tap, map, scan, startWith, takeWhile } from "rxjs/operators";

import { preventDefault } from "./events";
import { asUserAndDirection, initialDirections, onlyArrowKeys, takeCurrentState, updateDirection } from "./selected";
import { defaultMap } from "./map";
import { initGameState, updateGameState, renderToDom } from "./game.js"

const btn = document.getElementById("game-button");

fromEvent(btn, "click").subscribe(() => {
  btn.style.display = "none";

  const directionsObservable = fromEvent(window, "keydown").pipe(
    filter(onlyArrowKeys),
    tap(preventDefault),
    map(asUserAndDirection),
    startWith(initialDirections),
    scan(updateDirection)
  );

  interval(350)
    .pipe(
      takeCurrentState(directionsObservable),
      startWith(initGameState(defaultMap)),
      scan(updateGameState(defaultMap)),
      takeWhile(gameState => !gameState.finished, true),
    ).subscribe({
      next: renderToDom({ map: defaultMap }),
      complete: () => {
        btn.style.display = "block";
        btn.textContent = "Press To Restart!";
      }
    })
});
