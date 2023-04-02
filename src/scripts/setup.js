// Remove scrolling by arrow keys
const preventArrowKeyScrolling = (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
    event.preventDefault();
  }
}

window.addEventListener("keydown", preventArrowKeyScrolling);
