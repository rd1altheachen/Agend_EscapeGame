// engine/inventory.js — Inventory system
import { gameState } from './state.js';

const SLOT_COUNT = 6;

export function addItem(itemId) {
  if (!gameState.inventory.includes(itemId)) {
    gameState.inventory.push(itemId);
    renderInventory();
  }
}

export function removeItem(itemId) {
  const idx = gameState.inventory.indexOf(itemId);
  if (idx !== -1) {
    gameState.inventory.splice(idx, 1);
    renderInventory();
  }
}

export function hasItem(itemId) {
  return gameState.inventory.includes(itemId);
}

export function renderInventory() {
  const container = document.getElementById('inventory');
  container.innerHTML = '';
  for (let i = 0; i < SLOT_COUNT; i++) {
    const slot = document.createElement('div');
    slot.className = 'inv-slot';
    if (gameState.inventory[i]) {
      slot.textContent = gameState.inventory[i] === 'crystal_key' ? '🔑' : '⚖️';
      slot.style.cssText = 'display:flex;align-items:center;justify-content:center;font-size:20px;border-style:solid';
    }
    container.appendChild(slot);
  }
}
