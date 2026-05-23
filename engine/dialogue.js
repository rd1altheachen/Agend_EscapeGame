// engine/dialogue.js — Dialogue box system
const el = document.getElementById('dialogue');
let dismissTimer = null;
el.addEventListener('click', hideDialogue);

export function showDialogue(text) {
  el.innerHTML = `<div class="dialogue-bar">${text}</div>`;
  el.style.display = 'flex';
  if (dismissTimer) clearTimeout(dismissTimer);
  dismissTimer = setTimeout(hideDialogue, 1500);
}

export function hideDialogue() {
  el.style.display = 'none';
  el.innerHTML = '';
  if (dismissTimer) { clearTimeout(dismissTimer); dismissTimer = null; }
}
