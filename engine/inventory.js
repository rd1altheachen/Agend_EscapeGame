// engine/inventory.js — Inventory system with use/view item types
import { gameState, setFlag } from './state.js';
import { showDialogue } from './dialogue.js';

const SLOT_COUNT = 6;
let selectedItemId = null;

// Item definitions
const ITEM_DEFS = {
  crystal_key: {
    name: '水晶鑰匙',
    type: 'use',
    icon: '🔑',
    color: '#2980b9',
  },
  star_chart: {
    name: '星座對照表',
    type: 'view',
    icon: '📖',
    color: '#f1c40f',
    viewText: '紅＝獅子座\n藍＝水瓶座\n金＝天秤座',
    flagOnRead: 'hasStarChart',
  },
  magic_weight: {
    name: '魔法砝碼',
    type: 'use',
    icon: '⚖️',
    color: '#9b59b6',
  },
};

export function getItemDef(itemId) {
  return ITEM_DEFS[itemId];
}

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
    if (selectedItemId === itemId) selectedItemId = null;
    renderInventory();
  }
}

export function hasItem(itemId) {
  return gameState.inventory.includes(itemId);
}

export function getSelectedItem() {
  return selectedItemId;
}

export function clearSelection() {
  selectedItemId = null;
  renderInventory();
}

function onSlotClick(itemId) {
  const def = ITEM_DEFS[itemId];
  if (!def) return;

  // Toggle selection (only one at a time)
  selectedItemId = selectedItemId === itemId ? null : itemId;
  renderInventory();

  // View type also shows content
  if (def.type === 'view' && selectedItemId === itemId) {
    showDialogue(def.viewText);
    if (def.flagOnRead) setFlag(def.flagOnRead, true);
    if (!gameState.readItems) gameState.readItems = [];
    if (!gameState.readItems.includes(itemId)) gameState.readItems.push(itemId);
  }
}

export function renderInventory() {
  const container = document.getElementById('inventory');
  container.innerHTML = '';
  for (let i = 0; i < SLOT_COUNT; i++) {
    const slot = document.createElement('div');
    slot.className = 'inv-slot';
    const itemId = gameState.inventory[i];
    if (itemId) {
      const def = ITEM_DEFS[itemId];
      if (def) {
        slot.innerHTML = `<span class="inv-icon" style="background:${def.color}">${def.icon}</span><span class="inv-name">${def.name}</span>`;
        slot.classList.add('inv-filled');
        if (selectedItemId === itemId) slot.classList.add('inv-selected');
        slot.addEventListener('click', () => onSlotClick(itemId));
      }
    }
    container.appendChild(slot);
  }
}

// Deselect when clicking scene empty space
export function initInventorySceneListener() {
  document.getElementById('scene-content').addEventListener('click', (e) => {
    if (e.target.id === 'scene-content' || e.target.tagName === 'IMG') {
      if (selectedItemId) { clearSelection(); }
    }
  });
}
