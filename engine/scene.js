// engine/scene.js — Scene rendering and puzzle interactions
import { gameState, setFlag } from './state.js';
import { showDialogue } from './dialogue.js';
import { openPopup, closePopup, getPopupFrame, getOverlay } from './popup.js';
import { addItem, hasItem, getSelectedItem, removeItem, clearSelection } from './inventory.js';

const WALLS = ['north', 'east', 'south', 'west'];
const LABELS = { north: '北牆', east: '東牆', south: '南牆', west: '西牆' };

let roomsData = null;
let puzzlesData = null;
let orrerySlots = [0, 0, 0];

export async function initScene() {
  const [roomsRes, puzzlesRes] = await Promise.all([
    fetch('data/rooms.json'),
    fetch('data/puzzles.json')
  ]);
  roomsData = await roomsRes.json();
  puzzlesData = await puzzlesRes.json();
  render();
}

export function switchRoom(roomId) {
  gameState.currentRoom = roomId;
  gameState.wallIndex = 0;
  render();
  document.getElementById('btn-r1').classList.toggle('active', roomId === 'room1');
  document.getElementById('btn-r2').classList.toggle('active', roomId === 'room2');
}

export function switchWall(direction) {
  gameState.wallIndex = (gameState.wallIndex + direction + 4) % 4;
  render();
}

function render() {
  const el = document.getElementById('scene-content');
  closePopup();
  const room = roomsData[gameState.currentRoom];
  const wallName = WALLS[gameState.wallIndex];
  const wall = room.walls[wallName];

  if (wall.image) {
    let html = `<img class="scene-bg" src="${wall.image}" alt="${LABELS[wallName]}">`;
    wall.hotspots.forEach(h => {
      const b = h.bounds;
      html += `<div class="hotspot" data-action="${h.action}" style="top:${b.top};left:${b.left};width:${b.width};height:${b.height}"></div>`;
    });
    html += `<img class="nav-arrow nav-arrow-l" src="assets/ui/arrow-left.png" data-nav="-1">`;
    html += `<img class="nav-arrow nav-arrow-r" src="assets/ui/arrow-right.png" data-nav="1">`;
    el.innerHTML = html;
  } else {
    el.innerHTML = `<div class="placeholder">${room.name} — ${LABELS[wallName]}</div>
      <img class="nav-arrow nav-arrow-l" src="assets/ui/arrow-left.png" data-nav="-1">
      <img class="nav-arrow nav-arrow-r" src="assets/ui/arrow-right.png" data-nav="1">`;
  }

  // Bind events
  el.querySelectorAll('.nav-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.add('flash');
      const dir = parseInt(btn.dataset.nav);
      setTimeout(() => { btn.classList.remove('flash'); switchWall(dir); }, 300);
    });
  });
  el.querySelectorAll('.hotspot').forEach(spot => {
    spot.addEventListener('click', () => handleAction(spot.dataset.action));
  });
}

function handleAction(action) {
  if (action === 'openOrreryPopup') openOrreryPopup();
  else if (action === 'openDoorPopup') openDoorPopup();
  else if (action === 'openFireplaceDialPopup') openFireplaceDialPopup();
  else if (action === 'openCarpetPopup') openCarpetPopup();
}

// --- Orrery Popup ---
function openOrreryPopup() {
  openPopup(`
    <div class="popup-content" style="top:27px">
      <img src="assets/scene-room1-east.png" style="position:absolute;top:-420px;left:-20px;width:780px;height:1100px;max-width:none">
    </div>
    <div class="orrery-slot" style="top:60px;left:62px" id="os0"></div>
    <div class="orrery-slot" style="top:60px;left:152px" id="os1"></div>
    <div class="orrery-slot" style="top:60px;left:242px" id="os2"></div>
    <button class="popup-back" id="orrery-back">返回</button>`);
  document.getElementById('orrery-back').addEventListener('click', closePopup);
  renderOrrerySlots();
}

function renderOrrerySlots() {
  const puzzle = puzzlesData.orrery;
  for (let i = 0; i < 3; i++) {
    const el = document.getElementById('os' + i);
    if (!el) return;
    const name = puzzle.options[orrerySlots[i]];
    const data = puzzle.optionData[name];
    el.innerHTML = `
      <div class="orrery-btn" data-slot="${i}" data-dir="-1">▲</div>
      <div class="orrery-placeholder" style="background:#fff"><img src="${data.img}" style="width:40px;height:40px;object-fit:contain"></div>
      <div class="orrery-btn" data-slot="${i}" data-dir="1">▼</div>`;
    el.querySelectorAll('.orrery-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        cycleOrrery(parseInt(btn.dataset.slot), parseInt(btn.dataset.dir));
      });
    });
  }
}

function cycleOrrery(slot, dir) {
  const puzzle = puzzlesData.orrery;
  orrerySlots[slot] = (orrerySlots[slot] + dir + puzzle.options.length) % puzzle.options.length;
  renderOrrerySlots();
  checkOrreryAnswer();
}

function checkOrreryAnswer() {
  const puzzle = puzzlesData.orrery;
  const correct = puzzle.answer.every((a, i) => orrerySlots[i] === a);
  if (!correct) return;
  const missingFlag = puzzle.requiredFlags.some(f => !gameState[f]);
  if (missingFlag) { showDialogue(puzzle.missingFlagMessage); return; }
  showDialogue(puzzle.reward.message);
  addItem(puzzle.reward.item);
  setTimeout(() => closePopup(), 1500);
}

// --- Door Popup ---
function openDoorPopup() {
  openPopup(`
    <div class="popup-content" style="top:35px">
      <img src="assets/scene-room1-east.png" style="position:absolute;top:-321px;left:-331px;width:702px;height:990px;max-width:none">
    </div>
    <div class="keyhole" style="top:100px;left:80px" data-hole="left"></div>
    <div class="keyhole" style="top:100px;left:165px" data-hole="middle"></div>
    <div class="keyhole" style="top:100px;left:247px" data-hole="right"></div>
    <button class="popup-back" id="door-back">返回</button>`);
  document.getElementById('door-back').addEventListener('click', closePopup);
  document.querySelectorAll('.keyhole').forEach(kh => {
    kh.addEventListener('click', () => clickKeyhole(kh.dataset.hole));
  });
}

function clickKeyhole(pos) {
  const puzzle = puzzlesData['magic-door'];
  const selected = getSelectedItem();
  if (selected !== puzzle.requiredItem) {
    showDialogue(selected ? '這個物品不適用於此處' : puzzle.noItemMessage);
    return;
  }
  const missingFlag = puzzle.requiredFlags.some(f => !gameState[f]);
  if (missingFlag) { showDialogue(puzzle.missingFlagMessage); return; }
  if (pos !== puzzle.correctHole) return;
  removeItem(puzzle.requiredItem);
  clearSelection();
  animateDoorOpen();
}

function animateDoorOpen() {
  const frame = getPopupFrame();
  const key = document.createElement('div');
  key.style.cssText = 'position:absolute;top:50%;left:50%;width:30px;height:30px;background:#ffd700;border-radius:4px;z-index:46;animation:flyIn .5s forwards';
  frame.appendChild(key);
  setTimeout(() => {
    frame.style.animation = 'goldGlow .5s';
    setTimeout(() => {
      getOverlay().style.animation = 'fadeOut .5s forwards';
      setTimeout(() => {
        setFlag('doorOpen', true);
        closePopup();
        switchRoom('room2');
      }, 500);
    }, 500);
  }, 500);
}

// --- Fireplace Dial Popup ---
let dialValues = [0, 0, 0, 0];

function openFireplaceDialPopup() {
  openPopup(`
    <div class="popup-content" style="top:27px">
      <img src="assets/ui/password-dial-bg.png" style="width:100%;height:100%;object-fit:contain">
    </div>
    <div class="dial-container" id="dial-container"></div>
    <button class="popup-back" id="dial-back">返回</button>`);
  document.getElementById('dial-back').addEventListener('click', closePopup);
  renderDial();
}

function renderDial() {
  const container = document.getElementById('dial-container');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    container.innerHTML += `
      <div class="dial-slot">
        <div class="dial-btn" data-slot="${i}" data-dir="-1">▲</div>
        <div class="dial-num">${dialValues[i]}</div>
        <div class="dial-btn" data-slot="${i}" data-dir="1">▼</div>
      </div>`;
  }
  container.querySelectorAll('.dial-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const slot = parseInt(btn.dataset.slot);
      const dir = parseInt(btn.dataset.dir);
      dialValues[slot] = (dialValues[slot] + dir + 10) % 10;
      renderDial();
      checkDialAnswer();
    });
  });
}

function checkDialAnswer() {
  // Correct: 0655
  if (dialValues[0] === 0 && dialValues[1] === 6 && dialValues[2] === 5 && dialValues[3] === 5) {
    showDialogue('壁爐發出一陣輕響…你獲得了月光粉！');
    addItem('moonlight_powder');
    setTimeout(() => closePopup(), 1500);
  }
}

// --- Carpet Popup ---
function openCarpetPopup() {
  openPopup(`
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2">
      <div style="width:280px;padding:24px;background:#2c2c2c;border-radius:8px;border:2px solid #8b6914;text-align:center;color:#ffd700;font-size:14px;line-height:1.8">
        <h3 style="margin:0 0 8px">地毯下的圖案</h3>
        <p style="margin:0 0 10px">你掀開地毯的角落，發現地板上刻著古老的圖案...</p>
        <img src="assets/carpet-clue.png" style="max-width:100%;border-radius:8px;">
      </div>
    </div>
    <button class="popup-back" id="carpet-back">返回</button>`);
  document.getElementById('carpet-back').addEventListener('click', closePopup);
  setFlag('hasCarpetClue', true);
  setFlag('hasSpellClue', true);
}

// Expose switchRoom for toolbar buttons
window.switchRoom = switchRoom;
