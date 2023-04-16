import "./styles.css";

import { fromEvent, interval } from "rxjs";
import { filter, tap, map, scan, startWith } from "rxjs/operators";

import { preventDefault } from "./events";
import { asUserAndDirection, initialDirectionFor, onlyArrowKeys, takeCurrentState, updateDirection } from "./selected";
import { defaultMap } from "./map";
import { initGameState, updateGameState, renderToDom } from "./game.js"

function start({ amountOfPlayers = 2 }) {
  const directionsObservable = fromEvent(window, "keydown").pipe(
    filter(onlyArrowKeys),
    tap(preventDefault),
    map(asUserAndDirection),
    startWith(initialDirectionFor({ amountOfPlayers })),
    scan(updateDirection)
  );

  interval(350)
    .pipe(
      takeCurrentState(directionsObservable),
      startWith(initGameState(defaultMap)),
      scan(updateGameState(defaultMap))
    ).subscribe(renderToDom({ map: defaultMap }))
}

fromEvent(window, "DOMContentLoaded").subscribe(start);
