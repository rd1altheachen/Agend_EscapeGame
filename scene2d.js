// ===== 2D DOM-BASED SCENE RENDERER =====
let currentView = 'north';
const VIEWS = ['north', 'east', 'south', 'west'];

const ROOM_CONFIG = {
  1: {
    bg: '#1a2040',
    walls: {
      north: [
        { id: 'clock', label: '掛鐘', asset: 'assets/placeholder_128.png', pos: { top: '12%', left: '50%' }, size: 80, action: 'clickClock' },
        { id: 'fireplace', label: '壁爐', asset: 'assets/cozy-library/overlay.png', sprite: { x: 0, y: 64, w: 48, h: 48 }, pos: { top: '55%', left: '50%' }, size: 128, action: 'puzzle1_5' }
      ],
      west: [
        { id: 'bookshelf', label: '書架', asset: 'assets/cozy-library/filledbookshelves.png', pos: { top: '35%', left: '35%' }, size: 150, action: 'clickBookshelf' },
        { id: 'mirror', label: '魔法鏡', asset: 'assets/placeholder_128.png', pos: { top: '35%', left: '72%' }, size: 110, action: 'puzzle1_1' }
      ],
      east: [
        { id: 'constellation', label: '星座儀', asset: 'assets/placeholder_128.png', pos: { top: '35%', left: '35%' }, size: 110, action: 'puzzle1_4' },
        { id: 'door1', label: '魔法門', asset: 'assets/placeholder_128.png', pos: { top: '40%', left: '70%' }, size: 140, action: 'puzzle1_3' }
      ],
      south: [
        { id: 'desk', label: '書桌', asset: 'assets/cozy-library/furniture.png', sprite: { x: 0, y: 80, w: 48, h: 32 }, pos: { top: '55%', left: '40%' }, size: 140, action: 'puzzle1_2' },
        { id: 'flowerpot', label: '花盆', asset: 'assets/placeholder_128.png', pos: { top: '50%', left: '75%' }, size: 80, action: 'puzzle1_6' }
      ]
    }
  },
  2: {
    bg: '#4a3020',
    walls: {
      north: [
        { id: 'owl', label: '貓頭鷹掛畫', asset: 'assets/placeholder_128.png', pos: { top: '20%', left: '35%' }, size: 110, action: 'puzzle2_2' },
        { id: 'recipe', label: '配方牆', asset: 'assets/placeholder_128.png', pos: { top: '20%', left: '68%' }, size: 110, action: 'showRecipeWall' }
      ],
      west: [
        { id: 'potions', label: '彩色瓶子架', asset: 'assets/cauldrons-brew/Potions-export.png', sprite: { x: 0, y: 0, w: 80, h: 64 }, pos: { top: '25%', left: '30%' }, size: 130, action: 'puzzle2_3' },
        { id: 'crystal', label: '水晶球', asset: 'assets/fantasy-rpg-items/Fantasy_RPG_items icon_48x48.png', sprite: { x: 192, y: 48, w: 48, h: 48 }, pos: { top: '60%', left: '25%' }, size: 80, action: 'clickCrystalBall' },
        { id: 'door2', label: '魔法門', asset: 'assets/placeholder_128.png', pos: { top: '40%', left: '72%' }, size: 130, action: 'switchRoom(1)' }
      ],
      east: [
        { id: 'musicbox', label: '音樂盒', asset: 'assets/placeholder_128.png', pos: { top: '35%', left: '35%' }, size: 100, action: 'puzzle2_1' },
        { id: 'cabinet', label: '櫥櫃', asset: 'assets/cozy-library/furniture.png', sprite: { x: 48, y: 80, w: 32, h: 48 }, pos: { top: '40%', left: '70%' }, size: 120, action: 'puzzle2_4' }
      ],
      south: [
        { id: 'cauldron', label: '大鍋', asset: 'assets/cauldrons-brew/Cauldron and Powder.png', sprite: { x: 0, y: 0, w: 64, h: 64 }, pos: { top: '40%', left: '35%' }, size: 140, action: 'puzzle2_5' },
        { id: 'scale', label: '天秤', asset: 'assets/herbs-alchemy/herbs-alchemy-sheet.png', sprite: { x: 0, y: 64, w: 48, h: 48 }, pos: { top: '45%', left: '70%' }, size: 110, action: 'puzzle2_6' }
      ]
    }
  }
};

let sceneContainer = null;

function initScene2D() {
  sceneContainer = document.getElementById('scene-objects');
  document.getElementById('arrow-left').addEventListener('click', () => rotateView(-1));
  document.getElementById('arrow-right').addEventListener('click', () => rotateView(1));
  sceneContainer.addEventListener('click', (e) => {
    if (e.target === sceneContainer && state.selectedItem) {
      state.selectedItem = null;
      renderInventory();
    }
  });
}

function rotateView(d) {
  const i = VIEWS.indexOf(currentView);
  currentView = VIEWS[(i + d + 4) % 4];
  renderScene();
}

function switchScene(roomNum) {
  currentView = 'north';
  document.getElementById('scene-area').style.backgroundColor = ROOM_CONFIG[roomNum].bg;
  renderScene();
}

function renderScene() {
  if (!sceneContainer) return;
  sceneContainer.innerHTML = '';
  const cfg = ROOM_CONFIG[state.currentRoom];
  const objects = cfg.walls[currentView] || [];

  const label = document.createElement('div');
  label.className = 'wall-label';
  label.textContent = { north: '北牆', east: '東牆', south: '南牆', west: '西牆' }[currentView];
  sceneContainer.appendChild(label);

  objects.forEach(obj => {
    const el = document.createElement('div');
    el.className = 'scene-object';
    el.style.top = obj.pos.top;
    el.style.left = obj.pos.left;
    el.style.width = obj.size + 'px';
    el.style.height = obj.size + 'px';
    el.title = obj.label;

    if (obj.sprite) {
      // Spritesheet: use clip approach with scaled inner div
      const scale = obj.size / obj.sprite.w;
      const inner = document.createElement('div');
      inner.style.width = obj.sprite.w + 'px';
      inner.style.height = obj.sprite.h + 'px';
      inner.style.backgroundImage = `url('${obj.asset}')`;
      inner.style.backgroundPosition = `-${obj.sprite.x}px -${obj.sprite.y}px`;
      inner.style.transform = `scale(${scale})`;
      inner.style.transformOrigin = 'top left';
      inner.style.imageRendering = 'pixelated';
      el.style.overflow = 'hidden';
      el.appendChild(inner);
    } else {
      const img = document.createElement('img');
      img.src = obj.asset;
      img.alt = obj.label;
      img.draggable = false;
      el.appendChild(img);
    }

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (obj.action.includes('(')) { eval(obj.action); }
      else { window[obj.action](); }
    });

    sceneContainer.appendChild(el);
  });
}
