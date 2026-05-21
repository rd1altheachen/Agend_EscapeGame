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
    let html = `<img src="${wall.image}" alt="${LABELS[wallName]}">`;
    wall.hotspots.forEach(h => {
      const b = h.bounds;
      html += `<div class="hotspot" data-action="${h.action}" style="top:${b.top};left:${b.left};width:${b.width};height:${b.height}"></div>`;
    });
    const nav = wall.navButtons;
    html += `<div class="nav-circle" data-nav="-1" style="bottom:${nav.left.bottom};left:${nav.left.left}"></div>`;
    html += `<div class="nav-circle" data-nav="1" style="bottom:${nav.right.bottom};right:${nav.right.right}"></div>`;
    el.innerHTML = html;
  } else {
    const nav = wall.navButtons;
    el.innerHTML = `<div class="placeholder">${room.name} — ${LABELS[wallName]}</div>
      <div class="nav-circle" data-nav="-1" style="bottom:${nav.left.bottom};left:${nav.left.left}"></div>
      <div class="nav-circle" data-nav="1" style="bottom:${nav.right.bottom};right:${nav.right.right}"></div>`;
  }

  // Bind events
  el.querySelectorAll('.nav-circle').forEach(btn => {
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
}

// --- Orrery Popup ---
function openOrreryPopup() {
  openPopup(`
    <div class="popup-content" style="top:27px">
      <img src="assets/scene-room1-east.png" style="position:absolute;top:-420px;left:-20px;width:780px;height:1100px;max-width:none">
    </div>
    <div class="orrery-slot" style="top:40px;left:30px" id="os0"></div>
    <div class="orrery-slot" style="top:40px;left:140px" id="os1"></div>
    <div class="orrery-slot" style="top:40px;left:250px" id="os2"></div>
    <button class="popup-back" id="orrery-confirm" style="bottom:38px;right:30px;left:auto;transform:none;background:rgba(255,215,0,.2);border:1px solid #ffd700;border-radius:12px;padding:4px 16px">確認</button>
    <button class="popup-back" id="orrery-back">返回</button>`);
  document.getElementById('orrery-back').addEventListener('click', closePopup);
  document.getElementById('orrery-confirm').addEventListener('click', checkOrreryAnswer);
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
      <div class="orrery-placeholder" style="background:${data.bg}"><img src="${data.img}" style="width:48px;height:48px;object-fit:contain"></div>
      <div class="orrery-label">${name}</div>
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

// Expose switchRoom for toolbar buttons
window.switchRoom = switchRoom;
