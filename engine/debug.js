// engine/debug.js — Debug panel
import { gameState } from './state.js';
import { renderInventory } from './inventory.js';

const panel = document.getElementById('debug-panel');

export function initDebug() {
  document.getElementById('btn-debug').addEventListener('click', toggleDebug);
  renderDebug();
}

function toggleDebug() {
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  renderDebug();
}

function renderDebug() {
  const flags = ['hasStarChart', 'hasMusicBoxClue', 'hasCarpetClue', 'hasSpellClue', 'doorOpen'];
  const flagsEl = document.getElementById('debug-flags');
  flagsEl.innerHTML = flags.map(f =>
    `<label><input type="checkbox" data-flag="${f}" ${gameState[f] ? 'checked' : ''}>${f}</label>`
  ).join('') + `<p style="margin-top:8px;color:#aaa">inventory: ${JSON.stringify(gameState.inventory)}</p>`;

  flagsEl.querySelectorAll('input[data-flag]').forEach(cb => {
    cb.addEventListener('change', () => { gameState[cb.dataset.flag] = cb.checked; });
  });
}

export function setupDebugPanel() {
  document.getElementById('debug-hitbox').addEventListener('change', function () {
    document.getElementById('scene-wrap').classList.toggle('show-hitbox', this.checked);
  });
  document.getElementById('debug-add-key').addEventListener('click', () => {
    gameState.inventory.push('crystal_key');
    renderInventory();
    renderDebug();
  });
  document.getElementById('debug-add-weight').addEventListener('click', () => {
    gameState.inventory.push('magic_weight');
    renderInventory();
    renderDebug();
  });
}
