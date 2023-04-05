import { pipe } from "rxjs";
import { map, withLatestFrom } from "rxjs/operators";

import { mod } from "./utils.js";

/** @typedef {{user: number, direction: -1 | 1}} UserAndDirection */
/** @typedef {{[key: number]: {selected: number}}} SelectedState */

const keys = [
  ["ArrowLeft", "ArrowRight"],
  ["KeyA", "KeyD"],
];

/** @type {(event: KeyboardEvent) => boolean} */
export const onlyArrowKeys = (event) => keys.flat().includes(event.code);

/** @type {(event: KeyboardEvent) => UserAndDirection} */
export const asUserAndDirection = (event) => {
  for (const [user, [left, right]] of keys.entries()) {
    if (event.code === left) {
      return { user, direction: -1 };
    }
    if (event.code === right) {
      return { user, direction: 1 };
    }
  }
};

/** @type {(params: { amountOfCards: number }) => (state: SelectedState, event: UserAndDirection) => SelectedState} */
export const updateGameState =
  ({ amountOfCards }) =>
  (state, event) => ({
    ...state,
    [event.user]: { selected: mod(state[event.user].selected + event.direction, amountOfCards) },
  });

/** @type {(params: { amountOfPlayers: number }) => SelectedState} */
export const initialStateFor = ({ amountOfPlayers }) =>
  Object.fromEntries(Array.from({ length: amountOfPlayers }, (_, i) => [i, { selected: 0 }]));

/** @type {import("rxjs").OperatorFunction<SelectedState, UserAndDirection>} */
export const takeCurrentState = (observable) =>
  pipe(
    withLatestFrom(observable),
    map(([_, state]) => state)
  );
