// ./public/tile.js

/**
 * Flip tile: shows a value and animates its changes like a split-flap display.
 */
export class FlipTile {
  /**
   * @param {HTMLElement} root - Tile element cloned from `#tile-template`.
   */
  constructor(root) {
    this.root = root;
    this.value = null;
    this.parts = {
      top: root.querySelector('[data-part="top"] .tile__value'),
      bottom: root.querySelector('[data-part="bottom"] .tile__value'),
      flapTop: root.querySelector('[data-part="flap-top"] .tile__value'),
      flapBottom: root.querySelector('[data-part="flap-bottom"] .tile__value'),
    };

    root.addEventListener("animationend", (event) => {
      if (event.target.dataset.part === "flap-bottom") this.finishFlip();
    });
  }

  /**
   * Shows a new value, flipping from the previous one.
   * @param {string} value - Text to show, for example `"07"`.
   */
  set(value) {
    if (value === this.value) return;

    const previous = this.value;
    this.value = value;

    if (previous === null) {
      this.showStatic(value);
      return;
    }

    this.parts.top.textContent = value;
    this.parts.bottom.textContent = previous;
    this.parts.flapTop.textContent = previous;
    this.parts.flapBottom.textContent = value;

    this.root.classList.remove("is-flipping");
    void this.root.offsetWidth;
    this.root.classList.add("is-flipping");
  }

  /**
   * Completes a flip: the static bottom half catches up with the new value.
   */
  finishFlip() {
    this.parts.bottom.textContent = this.value;
    this.root.classList.remove("is-flipping");
  }

  /**
   * Shows a value on all layers without animation.
   * @param {string} value - Text to show.
   */
  showStatic(value) {
    for (const part of Object.values(this.parts)) part.textContent = value;
  }
}

/**
 * Replaces every `[data-tile]` placeholder with a flip tile cloned from a template.
 * @param {HTMLTemplateElement} template - Template with the tile markup.
 * @returns {Record<string, FlipTile>} Tiles by their `data-tile` name.
 */
export function createTiles(template) {
  const tiles = {};

  for (const slot of document.querySelectorAll("[data-tile]")) {
    const root = template.content.firstElementChild.cloneNode(true);
    slot.replaceWith(root);
    tiles[slot.dataset.tile] = new FlipTile(root);
  }

  return tiles;
}