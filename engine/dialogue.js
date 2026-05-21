// engine/dialogue.js — Dialogue box system
const el = document.getElementById('dialogue');
el.addEventListener('click', hideDialogue);

export function showDialogue(text) {
  el.textContent = text;
  el.style.display = 'block';
}

export function hideDialogue() {
  el.style.display = 'none';
}
