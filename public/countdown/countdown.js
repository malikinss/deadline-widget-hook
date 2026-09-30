// ./public/countdown/countdown.js

/**
 * Countdown widget page: reads the deadline from the `to` query parameter,
 * shows the time left (or the time overdue) on flip tiles
 * and colors the widget by urgency.
 */

import { fitToWidth } from "../shared/fit.js";
import { countdownState, pad2 } from "../shared/time.js";
import { createTiles } from "../shared/tile.js";
import { parseDeadline, pickInk } from "./urgency.js";

const LABEL_ACTIVE = "Deadline";
const LABEL_OVERDUE = "Overdue";
// The label may not be taller than this share of a tile's height.
const LABEL_MAX_TILE_RATIO = 0.6;

/**
 * Sets the urgency color, or restores the default color from CSS.
 * @param {string | null} ink - Hex color without `#`, or null for the default.
 */
function applyInk(ink) {
  const style = document.documentElement.style;
  if (ink) {
    style.setProperty("--accent", `#${ink}`);
  } else {
    style.removeProperty("--accent");
  }
}

function main() {
  const deadline = parseDeadline(new URL(location.href));
  if (deadline === null) {
    document.body.textContent = "Invalid deadline";
    return;
  }

  const label = document.querySelector(".countdown__label");
  const text = document.querySelector(".countdown__label-text");
  const tilesRow = document.querySelector(".countdown__tiles");
  const tiles = createTiles(document.getElementById("tile-template"));

  const firstTile = tilesRow.querySelector(".tile");
  const fitLabel = () =>
    fitToWidth(label, text, tilesRow, firstTile.getBoundingClientRect().height * LABEL_MAX_TILE_RATIO);

  const render = () => {
    const now = Date.now();
    const { overdue, parts } = countdownState(deadline, now);

    const labelText = overdue ? LABEL_OVERDUE : LABEL_ACTIVE;
    if (text.textContent !== labelText) {
      text.textContent = labelText;
      fitLabel();
    }

    applyInk(pickInk(deadline - now));

    tiles.days.set(pad2(parts.days));
    tiles.hours.set(pad2(parts.hours));
    tiles.minutes.set(pad2(parts.minutes));
    tiles.seconds.set(pad2(parts.seconds));
  };

  const tick = () => {
    render();
    setTimeout(tick, 1000 - (Date.now() % 1000));
  };

  fitLabel();
  new ResizeObserver(fitLabel).observe(document.body);
  tick();

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) render();
  });
}

main();