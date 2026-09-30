// ./public/clock/clock.js

/**
 * Clock widget page: shows local time on flip tiles
 * and the weekday with the date on the hours tile.
 */

import { clockParts, dateLabel } from "./clock-format.js";
import { createTiles } from "../shared/tile.js";

function main() {
  const tiles = createTiles(document.getElementById("tile-template"));
  const date = document.querySelector(".clock__date");

  const render = () => {
    const now = new Date();
    const parts = clockParts(now);

    tiles.hours.set(parts.hours);
    tiles.minutes.set(parts.minutes);
    tiles.seconds.set(parts.seconds);

    const label = dateLabel(now);
    if (date.textContent !== label) date.textContent = label;
  };

  const tick = () => {
    render();
    setTimeout(tick, 1000 - (Date.now() % 1000));
  };

  tick();

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) render();
  });
}

main();
