import { pipe } from "rxjs";
import { map, withLatestFrom } from "rxjs/operators";

/** @typedef {{user: number, direction: string}} UserAndDirection */
/** @typedef {{[key: number]: {selected: number}}} SelectedState */

const keys = [
  ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"],
  ["KeyA", "KeyD", "KeyW", "KeyS"],
];

/** @type {(event: KeyboardEvent) => boolean} */
export const onlyArrowKeys = (event) => keys.flat().includes(event.code);

export const asUserAndDirection = (event) => {
  for (const [userIndex, [left, right, up, down]] of keys.entries()) {
    if (event.code === left) {
      return { userIndex, direction: 'left' };
    }
    if (event.code === right) {
      return { userIndex, direction: 'right' };
    }
    if (event.code === up) {
      return { userIndex, direction: 'up' };
    }
    if (event.code === down) {
      return { userIndex, direction: 'down' };
    }
  }
};

export const updateDirection = (oldState, { userIndex, direction }) => {
  oldState[userIndex] = direction;
  return oldState
};

/** @type {(params: { amountOfPlayers: number }) => SelectedState} */
export const initialDirectionFor = ({ amountOfPlayers }) => Array.from({ length: amountOfPlayers }, (_, i) => 'left');

/** @type {import("rxjs").OperatorFunction<SelectedState, UserAndDirection>} */
export const takeCurrentState = (observable) =>
  pipe(
    withLatestFrom(observable),
    map(([_, state]) => state)
  );
