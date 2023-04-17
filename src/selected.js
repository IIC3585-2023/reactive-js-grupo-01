import { pipe } from "rxjs";
import { map, withLatestFrom } from "rxjs/operators";


const keys = [
  ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"],
  ["KeyA", "KeyD", "KeyW", "KeyS"],
];

const directions = ["left", "right", "up", "down"];

/** @type {(event: KeyboardEvent) => boolean} */
export const onlyArrowKeys = (event) => keys.flat().includes(event.code);

export const asUserAndDirection = (event) => {
  for (const [userIndex, userKeys] of keys.entries()) {
    const i = userKeys.indexOf(event.code);
    if (i !== -1) return { userIndex, direction: directions[i] };
  }
};

export const updateDirection = (oldState, { userIndex, direction }) => {
  oldState[userIndex] = direction;
  return oldState;
};

export const initialDirections = ["left", "right"];

/** @type {import("rxjs").OperatorFunction<SelectedState, UserAndDirection>} */
export const takeCurrentState = (observable) => pipe(withLatestFrom(observable), map(([_, state]) => state));
