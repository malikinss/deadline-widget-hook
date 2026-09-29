// ./public/fit.js

/**
 * Sets the font size of a label so that its text is exactly as wide as a target element.
 * Works for single-line text; `em`-based letter-spacing scales together with the font.
 * The trailing letter-spacing after the last character is not counted as text width.
 * @param {HTMLElement} label - Element that receives the font size.
 * @param {HTMLElement} text - Inline element with the text inside `label`.
 * @param {HTMLElement} target - Element whose width the text should match.
 */
export function fitToWidth(label, text, target) {
  const REFERENCE_PX = 100;
  label.style.fontSize = `${REFERENCE_PX}px`;

  const trailingSpace = parseFloat(getComputedStyle(label).letterSpacing) || 0;
  const textWidth = text.getBoundingClientRect().width - trailingSpace;
  const targetWidth = target.getBoundingClientRect().width;

  if (textWidth > 0) {
    label.style.fontSize = `${(REFERENCE_PX * targetWidth) / textWidth}px`;
  }
}