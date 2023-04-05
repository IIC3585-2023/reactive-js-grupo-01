import "./styles.css";

import { fromEvent, interval } from "rxjs";
import { filter, tap, map, scan, startWith } from "rxjs/operators";

import { preventDefault } from "./events";
import { asUserAndDirection, initialStateFor, onlyArrowKeys, takeCurrentState, updateGameState } from "./selected";

function start({ amountOfPlayers = 2, amountOfCards = 5 }) {
  const selectedObservable = fromEvent(window, "keydown").pipe(
    filter(onlyArrowKeys),
    tap(preventDefault),
    map(asUserAndDirection),
    startWith(initialStateFor({ amountOfPlayers })),
    scan(updateGameState({ amountOfCards }))
  );

  selectedObservable.subscribe((selectedState) => {
    // Aquí se actualiza el DOM de lo seleccionado
    const decks = document.querySelector(".decks");
    decks.innerHTML = "";
    for (const [userIndex, { selected }] of Object.entries(selectedState)) {
      console.log(userIndex, selected);
      const deck = document.createElement("div");
      deck.classList.add("deck");

      const userEl = document.createElement("div");
      userEl.classList.add("user");
      userEl.innerText = userIndex;
      deck.appendChild(userEl);

      const deckCardsEl = document.createElement("ul");
      deckCardsEl.classList.add("deck-cards");
      for (let i = 0; i < amountOfCards; i++) {
        const cardEl = document.createElement("li");
        cardEl.classList.add("card");
        cardEl.innerText = `Carta ${i}`;
        if (i === selected) {
          cardEl.classList.add("selected");
        }
        deckCardsEl.appendChild(cardEl);
      }
      deck.appendChild(deckCardsEl);

      decks.appendChild(deck);
    }
  });

  interval(1000)
    .pipe(takeCurrentState(selectedObservable))
    .subscribe((selectedState) => {
      // Aquí va la lógica del juego
      console.log(JSON.stringify(selectedState));
    });
}

fromEvent(window, "DOMContentLoaded").subscribe(start);
