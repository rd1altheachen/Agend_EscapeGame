// engine/dialogue.js — Dialogue box system
const el = document.getElementById('dialogue');
el.addEventListener('click', hideDialogue);

export function showDialogue(text) {
  el.innerHTML = `<div class="dialogue-bar">${text}</div>`;
  el.style.display = 'flex';
}

export function hideDialogue() {
  el.style.display = 'none';
  el.innerHTML = '';
}
