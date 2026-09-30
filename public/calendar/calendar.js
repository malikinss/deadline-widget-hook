// ./public/calendar/calendar.js

/**
 * Calendar widget page: shows a month grid with today highlighted
 * and lets the viewer switch months.
 */

import { MONTHS_LONG } from "../shared/date-names.js";
import { monthGrid, shiftMonth } from "./calendar-grid.js";
import { holidaysOn, mainKind } from "./holidays.js";

/**
 * Returns the month that contains the given date.
 * @param {Date} date
 * @returns {{ year: number, month: number }}
 */
function monthOf(date) {
  return { year: date.getFullYear(), month: date.getMonth() };
}

function main() {
  const monthLabel = document.querySelector(".calendar__month");
  const yearLabel = document.querySelector(".calendar__year");
  const days = document.querySelector(".calendar__days");

  let view = monthOf(new Date());

  const render = () => {
    const today = new Date();
    const showsToday = view.year === today.getFullYear() && view.month === today.getMonth();

    monthLabel.textContent = MONTHS_LONG[view.month];
    yearLabel.textContent = String(view.year);

    const cells = monthGrid(view.year, view.month).map((day) => {
      const cell = document.createElement("span");
      cell.className = "calendar__day";
      if (day === null) return cell;

      cell.textContent = String(day);
      if (showsToday && day === today.getDate()) cell.classList.add("is-today");

      const holidays = holidaysOn(new Date(view.year, view.month, day, 12));
      const kind = mainKind(holidays);
      if (kind) {
        cell.classList.add(`is-${kind}`);
        cell.title = holidays.map((holiday) => holiday.name).join(" · ");
      }

      return cell;
    });

    days.replaceChildren(...cells);
  };

  for (const button of document.querySelectorAll("[data-shift]")) {
    button.addEventListener("click", () => {
      view = shiftMonth(view.year, view.month, Number(button.dataset.shift));
      render();
    });
  }

  document.querySelector('[data-action="today"]').addEventListener("click", () => {
    view = monthOf(new Date());
    render();
  });

  const scheduleMidnight = () => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    setTimeout(() => {
      render();
      scheduleMidnight();
    }, midnight - now);
  };

  render();
  scheduleMidnight();

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) render();
  });
}

main();