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
    // Overlay book items on west wall (disappear when taken)
    if (gameState.currentRoom === 'room1' && wallName === 'west') {
      if (!gameState.goldBookTaken) html += `<img class="scene-obj" src="assets/items/book-gold-star.png" style="position:absolute;top:39%;left:27%;height:11.6%">`;
      if (!gameState.blueBookTaken) html += `<img class="scene-obj" src="assets/items/book-blue-key.png" style="position:absolute;top:70.2%;left:14%;height:11.5%">`;
    }
    // Engraved text on east wall
    if (gameState.currentRoom === 'room1' && wallName === 'east') {
      html += `<div class="wall-engraving" style="position:absolute;top:12%;left:8%;width:30%">月亮追逐星星<br>星星追逐太陽</div>`;
    }
    // Owl eyes on room2 north wall (decorative only)
    if (gameState.currentRoom === 'room2' && wallName === 'north' && !gameState.owlSolved) {
      html += `<div style="position:absolute;top:31%;left:42%;width:3%;aspect-ratio:1;background:#000;border-radius:50%;pointer-events:none;z-index:6"></div>`;
      html += `<div style="position:absolute;top:31%;left:47%;width:3%;aspect-ratio:1;background:#000;border-radius:50%;pointer-events:none;z-index:6"></div>`;
    }
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
  else if (action === 'clickMirror') clickMirror();
  else if (action === 'clickGoldBook') clickGoldBook();
  else if (action === 'clickBlueBook') clickBlueBook();
  else if (action === 'clickDiary') clickDiary();
  else if (action === 'clickDrawerLock') clickDrawerLock();
  else if (action === 'clickFlowerpot') clickFlowerpot();
  else if (action === 'clickClock') clickClock();
  else if (action === 'clickOwlPainting') clickOwlPainting();
  else if (action === 'clickOwlNote') clickOwlNote();
  else if (action === 'clickCauldron') clickCauldron();
  else if (action === 'clickRecipeWall') clickRecipeWall();
  else if (action === 'clickRecipeNote') clickRecipeNote();
  else if (action === 'clickRoom2Door') clickRoom2Door();
  else if (action === 'clickCabinet') clickCabinet();
  else if (action === 'clickMusicBox') clickMusicBox();
  else if (action === 'clickCrystalBall') clickCrystalBall();
  else if (action === 'clickTubeRack') clickTubeRack();
  else if (action === 'clickBalance') clickBalance();
}

// --- Orrery Popup ---
function openOrreryPopup() {
  openPopup(`
    <div class="popup-content">
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
function isKeyLocked() {
  return gameState._keyInHole === 'middle' && gameState.carpetViewed;
}

function openDoorPopup() {
  if (gameState.doorOpen) { switchRoom('room2'); return; }
  // Rule 2: key locked + no popup, react directly on scene
  if (isKeyLocked()) {
    if (gameState.spellBookRead) {
      showDialogue('✦ Lumina Stella Aperio ✦');
      setTimeout(() => { setFlag('doorOpen', true); removeItem('spell_book'); switchRoom('room2'); }, 1500);
    } else {
      showDialogue('似乎還缺少什麼咒語...');
    }
    return;
  }
  openPopup(`
    <div class="popup-content">
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
  if (gameState._keyInHole) showKeyImage(gameState._keyInHole);
}

function clickKeyhole(pos) {
  // If key is in this hole → try to pull out
  if (gameState._keyInHole === pos) {
    // Rule 1: can't remove if locked
    if (isKeyLocked()) {
      if (gameState.spellBookRead) {
        showDialogue('✦ Lumina Stella Aperio ✦');
        setTimeout(() => { setFlag('doorOpen', true); removeItem('spell_book'); closePopup(); switchRoom('room2'); }, 1500);
      } else {
        showDialogue('符文微微亮起...似乎還少了什麼');
      }
      return;
    }
    removeKeyImage();
    setFlag('_keyInHole', null);
    addItem('crystal_key');
    return;
  }
  if (gameState._keyInHole) return;
  // Insert key
  const selected = getSelectedItem();
  if (selected !== 'crystal_key') return;
  removeItem('crystal_key');
  clearSelection();
  setFlag('_keyInHole', pos);
  showKeyImage(pos);
  // Check if locked after insertion
  if (isKeyLocked()) {
    if (gameState.spellBookRead) {
      // Rule 3: fast path — all conditions met
      showDialogue('✦ Lumina Stella Aperio ✦');
      setTimeout(() => { setFlag('doorOpen', true); removeItem('spell_book'); closePopup(); switchRoom('room2'); }, 1500);
    } else {
      showDialogue('符文微微亮起...似乎還少了什麼');
    }
  }
}

function showKeyImage(pos) {
  const positions = { left: '72px', middle: '157px', right: '239px' };
  const kh = document.querySelector(`.keyhole[data-hole="${pos}"]`);
  if (!kh) return;
  const img = document.createElement('img');
  img.src = 'assets/items/key-in-lock.png';
  img.className = 'key-in-lock';
  img.style.cssText = `position:absolute;top:82px;left:${positions[pos]};width:52px;height:73px;z-index:5;pointer-events:none`;
  kh.parentElement.appendChild(img);
}

function removeKeyImage() {
  const img = document.querySelector('.key-in-lock');
  if (img) img.remove();
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
    <div class="popup-content">
      <img src="assets/ui/password-dial-bg.png" style="position:absolute;top:35px;left:15px;width:280px;height:100px">
      <div class="dial-overlay" id="dial-container"></div>
    </div>
    <button class="popup-back" id="dial-back">返回</button>`);
  document.getElementById('dial-back').addEventListener('click', closePopup);
  renderDial();
}

function renderDial() {
  const container = document.getElementById('dial-container');
  if (!container) return;
  const positions = [73, 117, 163, 207];
  container.innerHTML = positions.map((x, i) => `
    <div class="dial-slot" style="left:${x + 15}px">
      <div class="dial-btn" data-slot="${i}" data-dir="-1">▲</div>
      <div class="dial-num">${dialValues[i]}</div>
      <div class="dial-btn" data-slot="${i}" data-dir="1">▼</div>
    </div>`).join('');
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
  if (dialValues[0] === 2 && dialValues[1] === 4 && dialValues[2] === 1 && dialValues[3] === 7) {
    showDialogue('壁爐發出一陣輕響…你獲得了月光粉！');
    addItem('moonlight_powder');
    setTimeout(() => closePopup(), 1500);
  }
}

// --- West Wall: Mirror ---
function clickMirror() {
  if (gameState.goldBookTaken) return;
  const el = document.getElementById('scene-content');
  const img = document.createElement('img');
  img.src = 'assets/items/book-gold-star.png';
  img.style.cssText = 'position:absolute;top:23%;left:80%;height:14%;opacity:0;z-index:6;pointer-events:none';
  el.appendChild(img);
  let count = 0;
  const flash = () => {
    if (count >= 4) { img.remove(); setFlag('mirrorUsed', true); return; }
    img.style.opacity = count % 2 === 0 ? '1' : '0';
    count++;
    setTimeout(flash, 500);
  };
  flash();
}

// --- West Wall: Gold Star Book (puzzle 1-1) ---
function clickGoldBook() {
  if (gameState.goldBookTaken) return;
  if (!gameState.mirrorUsed) return;
  setFlag('goldBookTaken', true);
  addItem('star_chart');
  const img = document.querySelector('.scene-obj[src*="book-gold-star"]');
  if (img) { img.style.visibility = 'hidden'; requestAnimationFrame(() => img.remove()); }
}

// --- West Wall: Blue Key Book ---
function clickBlueBook() {
  if (gameState.blueBookTaken) return;
  if (!gameState.carpetViewed) return;
  setFlag('blueBookTaken', true);
  addItem('spell_book');
  const img = document.querySelector('.scene-obj[src*="book-blue-key"]');
  if (img) { img.style.visibility = 'hidden'; requestAnimationFrame(() => img.remove()); }
}

// --- South Wall: Diary ---
const diaryPages = [
  '<p style="font-size:13px;color:#d4a574;line-height:1.8;text-align:left">今天學了新的符號魔法...<br>老師說每個符號都有對應的月相力量。<br><br><span style="position:absolute;bottom:20px;right:30px;font-size:20px;opacity:.6">△</span></p>',
  '<p style="font-size:13px;color:#d4a574;line-height:1.8;text-align:left">月相的力量不容小覷</p><div style="display:flex;justify-content:center;gap:24px;margin-top:12px"><div style="text-align:center"><div style="font-size:22px">🌑</div><div style="color:#ffd700;font-size:14px;margin-top:4px">1</div></div><div style="text-align:center;font-size:16px;color:#999;align-self:center">→</div><div style="text-align:center"><div style="font-size:22px">🌓</div><div style="color:#ffd700;font-size:14px;margin-top:4px">3</div></div><div style="text-align:center;font-size:16px;color:#999;align-self:center">→</div><div style="text-align:center"><div style="font-size:22px">🌕</div><div style="color:#ffd700;font-size:14px;margin-top:4px">2</div></div></div><span style="position:absolute;bottom:20px;right:30px;font-size:20px;color:#d4a574;opacity:.6">○</span>',
  '<p style="font-size:13px;color:#d4a574;line-height:1.8;text-align:left">鏡子裡的時間總是反著走的……<br><br><span style="font-size:28px">🕐</span><br><br><span style="position:absolute;bottom:20px;left:30px;font-size:20px;opacity:.6">☆</span></p>',
];
let diaryPage = 0;

function clickDiary() {
  diaryPage = 0;
  setFlag('diaryRead', true);
  openPopup(`
    <div class="popup-content" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px">
      <div id="diary-content">${diaryPages[0]}</div>
      <div style="position:absolute;bottom:8px;display:flex;gap:40px;z-index:4">
        <span id="diary-prev" style="cursor:pointer;color:#ffd700;font-size:18px;opacity:.3">◀</span>
        <span id="diary-page-num" style="color:#999;font-size:11px">1/3</span>
        <span id="diary-next" style="cursor:pointer;color:#ffd700;font-size:18px">▶</span>
      </div>
    </div>
    <button class="popup-back" id="diary-back">返回</button>`);
  document.getElementById('diary-back').addEventListener('click', closePopup);
  document.getElementById('diary-prev').addEventListener('click', () => turnDiary(-1));
  document.getElementById('diary-next').addEventListener('click', () => turnDiary(1));
}

function turnDiary(dir) {
  diaryPage = Math.max(0, Math.min(2, diaryPage + dir));
  document.getElementById('diary-content').innerHTML = diaryPages[diaryPage];
  document.getElementById('diary-page-num').textContent = `${diaryPage + 1}/3`;
  document.getElementById('diary-prev').style.opacity = diaryPage === 0 ? '.3' : '1';
  document.getElementById('diary-next').style.opacity = diaryPage === 2 ? '.3' : '1';
  if (diaryPage === 2) setFlag('diaryTimeReverseRead', true);
}

// --- South Wall: Drawer Symbol Lock (puzzle 1-2) ---
let drawerSymbols = [0, 0, 0];
const SYMBOLS = ['△', '☆', '○'];

function clickDrawerLock() {
  if (gameState.drawerSolved) { showDialogue('抽屜已經空了。'); return; }
  drawerSymbols = [0, 0, 0];
  openPopup(`
    <div class="popup-content" style="display:flex;align-items:center;justify-content:center;gap:20px">
      <div class="symbol-slot" id="ss0">△</div>
      <div class="symbol-slot" id="ss1">△</div>
      <div class="symbol-slot" id="ss2">△</div>
    </div>
    <button class="popup-back" id="drawer-back">返回</button>`);
  document.getElementById('drawer-back').addEventListener('click', closePopup);
  for (let i = 0; i < 3; i++) {
    document.getElementById('ss' + i).addEventListener('click', () => {
      drawerSymbols[i] = (drawerSymbols[i] + 1) % 3;
      document.getElementById('ss' + i).textContent = SYMBOLS[drawerSymbols[i]];
      checkDrawerAnswer();
    });
  }
}

function checkDrawerAnswer() {
  if (!gameState.diaryRead) return;
  if (drawerSymbols[0] === 0 && drawerSymbols[1] === 1 && drawerSymbols[2] === 2) {
    setFlag('drawerSolved', true);
    addItem('potion_recipe');
    addItem('crystal_key');
    showDialogue('抽屜打開了！裡面有一張殘頁和一把水晶鑰匙。');
    setTimeout(() => closePopup(), 1500);
  }
}

// --- South Wall: Flowerpot (puzzle 1-6) ---
function clickFlowerpot() {
  const selected = getSelectedItem();
  if (selected === 'sunlight_potion') {
    removeItem('sunlight_potion');
    clearSelection();
    setFlag('flowerpotSolved', true);
    showDialogue('花朵綻放了！花心裡有一顆魔法星星！');
  } else {
    showDialogue('花苞緊閉著，似乎需要什麼才會綻放...');
  }
}

// --- Carpet Popup ---
function openCarpetPopup() {
  openPopup(`
    <div class="popup-content">
      <img src="assets/carpet-clue.png" style="max-width:100%;max-height:100%;object-fit:contain;">
    </div>
    <button class="popup-back" id="carpet-back">返回</button>`);
  document.getElementById('carpet-back').addEventListener('click', closePopup);
  setFlag('hasCarpetClue', true);
  setFlag('hasSpellClue', true);
  setFlag('carpetViewed', true);
}

// --- Room1 Clock ---
function clickClock() {
  openPopup(`<div class="popup-content" style="display:flex;align-items:center;justify-content:center"><div style="text-align:center;color:#ffd700;font-size:14px"><div style="font-size:40px;font-family:serif">🕐</div><p style="margin-top:8px">時鐘停在 <strong style="font-family:serif;font-size:18px">3:25</strong></p></div></div><button class="popup-back" id="clock-back">返回</button>`);
  document.getElementById('clock-back').addEventListener('click', closePopup);
  setFlag('clockExamined', true);
}

// === ROOM 2 PUZZLES ===

// --- 2-1: Music Box (South) ---
const MUSIC_OUTER = ['🌙','☁️','⚡','❄️','🌈','💨'];
const MUSIC_MIDDLE = ['⭐','🌠','🪐','☄️','🌌','🕳️'];
const MUSIC_INNER = ['☀️','🌑','🌅','🌇','💫','🔥'];
let musicRings = [0, 0, 0];

function clickMusicBox() {
  if (gameState.musicBoxSolved) { showDialogue('音樂盒輕輕演奏著...紅→藍→金'); return; }
  musicRings = [0, 0, 0];
  openPopup(`<div class="popup-content" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px"><div style="color:#ccc;font-size:11px;margin-bottom:4px">點擊旋轉轉盤（對齊到頂部）</div><div id="music-rings"></div></div><button class="popup-back" id="mb-back">返回</button>`);
  document.getElementById('mb-back').addEventListener('click', closePopup);
  renderMusicRings();
}

function renderMusicRings() {
  const el = document.getElementById('music-rings');
  if (!el) return;
  el.innerHTML = `<div style="display:flex;gap:12px;align-items:center"><div class="ring-slot" id="mr0" style="cursor:pointer;font-size:28px;width:60px;height:60px;border:2px solid #ffd700;border-radius:50%;display:flex;align-items:center;justify-content:center">${MUSIC_OUTER[musicRings[0]]}</div><div class="ring-slot" id="mr1" style="cursor:pointer;font-size:28px;width:60px;height:60px;border:2px solid #c0c0c0;border-radius:50%;display:flex;align-items:center;justify-content:center">${MUSIC_MIDDLE[musicRings[1]]}</div><div class="ring-slot" id="mr2" style="cursor:pointer;font-size:28px;width:60px;height:60px;border:2px solid #cd7f32;border-radius:50%;display:flex;align-items:center;justify-content:center">${MUSIC_INNER[musicRings[2]]}</div></div><div style="color:#999;font-size:10px;margin-top:6px">外圈 ─ 中圈 ─ 內圈</div>`;
  for (let i = 0; i < 3; i++) {
    document.getElementById('mr' + i).addEventListener('click', () => { musicRings[i] = (musicRings[i] + 1) % 6; renderMusicRings(); checkMusicBox(); });
  }
}

function checkMusicBox() {
  if (musicRings[0] === 0 && musicRings[1] === 0 && musicRings[2] === 0) {
    setFlag('musicBoxSolved', true);
    setFlag('hasMusicBoxClue', true);
    addItem('stirrer');
    showDialogue('音樂盒打開了！寶石閃爍：🔴→🔵→🟡 你獲得了攪拌匙！');
    setTimeout(() => closePopup(), 1500);
  }
}

// --- 2-2: Owl Painting (North) ---
let owlEyes = [0, 0];
const OWL_SYMBOLS = ['🌙','⭐','☀️','🔮'];

function rotateOwlEye(idx) {
  owlEyes[idx] = (owlEyes[idx] + 1) % 4;
  const el = document.querySelectorAll('.owl-eye')[idx];
  if (el) { el.textContent = OWL_SYMBOLS[owlEyes[idx]]; el.style.background = 'none'; el.style.fontSize = '14px'; el.style.display = 'flex'; el.style.alignItems = 'center'; el.style.justifyContent = 'center'; }
  if (gameState.owlNoteFound && owlEyes[0] === 0 && owlEyes[1] === 1) {
    setFlag('owlSolved', true);
    addItem('rainbow_dew');
    showDialogue('貓頭鷹的嘴巴打開了！你獲得了彩虹露！');
  }
}

function clickOwlNote() {
  if (gameState.owlNoteFound) { openPopup(`<div class="popup-content" style="display:flex;align-items:center;justify-content:center"><div style="width:120px;height:120px;background:url('assets/ui/parchment-bg.png') center/cover;border-radius:8px;display:flex;align-items:center;justify-content:center"><span style="font-size:48px">🌙</span></div></div><button class="popup-back" id="on-back">返回</button>`); document.getElementById('on-back').addEventListener('click', closePopup); return; }
  setFlag('owlNoteFound', true);
  openPopup(`<div class="popup-content" style="display:flex;align-items:center;justify-content:center"><div style="width:120px;height:120px;background:url('assets/ui/parchment-bg.png') center/cover;border-radius:8px;display:flex;align-items:center;justify-content:center"><span style="font-size:48px">🌙</span></div></div><button class="popup-back" id="on-back">返回</button>`);
  document.getElementById('on-back').addEventListener('click', closePopup);
}

function clickOwlPainting() {
  if (gameState.owlSolved) { showDialogue('貓頭鷹微笑著看著你。'); return; }
  owlEyes = [0, 0];
  openPopup(`<div class="popup-content" style="display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="font-size:13px;color:#ccc;margin-bottom:8px">點擊眼睛旋轉符號</div><div id="owl-eyes" style="display:flex;gap:40px"></div></div><button class="popup-back" id="owl-back">返回</button>`);
  document.getElementById('owl-back').addEventListener('click', closePopup);
  renderOwlEyes();
}

function renderOwlEyes() {
  const el = document.getElementById('owl-eyes');
  if (!el) return;
  el.innerHTML = `<div id="oe0" style="cursor:pointer;font-size:32px;width:50px;height:50px;border-radius:50%;background:#2c2c2c;display:flex;align-items:center;justify-content:center">${OWL_SYMBOLS[owlEyes[0]]}</div><div id="oe1" style="cursor:pointer;font-size:32px;width:50px;height:50px;border-radius:50%;background:#2c2c2c;display:flex;align-items:center;justify-content:center">${OWL_SYMBOLS[owlEyes[1]]}</div>`;
  document.getElementById('oe0').addEventListener('click', () => { owlEyes[0] = (owlEyes[0] + 1) % 4; renderOwlEyes(); checkOwl(); });
  document.getElementById('oe1').addEventListener('click', () => { owlEyes[1] = (owlEyes[1] + 1) % 4; renderOwlEyes(); checkOwl(); });
}

function checkOwl() {
  if (!gameState.owlNoteFound) return;
  if (owlEyes[0] === 0 && owlEyes[1] === 1) {
    setFlag('owlSolved', true);
    addItem('rainbow_dew');
    showDialogue('貓頭鷹的嘴巴打開了！你獲得了彩虹露！');
    setTimeout(() => closePopup(), 1500);
  }
}

// --- 2-3: Tube Rack (West) ---
const TUBE_COLORS = ['red','orange','yellow','green','blue','indigo','purple'];
const TUBE_LABELS = ['紅','橙','黃','綠','藍','靛','紫'];
let tubeOrder = [];
let tubeSelected = null;

function clickTubeRack() {
  if (gameState.tubesSorted) { showDialogue('試管已經排列整齊了。'); return; }
  tubeOrder = [...TUBE_COLORS].sort(() => Math.random() - 0.5);
  tubeSelected = null;
  openPopup(`<div class="popup-content" style="display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="color:#ccc;font-size:11px;margin-bottom:8px">點擊兩支試管交換位置</div><div id="tube-rack" style="display:flex;gap:4px"></div></div><button class="popup-back" id="tube-back">返回</button>`);
  document.getElementById('tube-back').addEventListener('click', closePopup);
  renderTubes();
}

function renderTubes() {
  const el = document.getElementById('tube-rack');
  if (!el) return;
  el.innerHTML = tubeOrder.map((c, i) => `<div class="tube-slot" data-idx="${i}" style="cursor:pointer;width:30px;height:70px;border-radius:0 0 12px 12px;background:${c};border:2px solid ${tubeSelected === i ? '#ffd700' : 'rgba(255,255,255,.3)'};display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px"><span style="font-size:9px;color:#fff">${TUBE_LABELS[TUBE_COLORS.indexOf(c)]}</span></div>`).join('');
  el.querySelectorAll('.tube-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      const idx = parseInt(slot.dataset.idx);
      if (tubeSelected === null) { tubeSelected = idx; renderTubes(); }
      else { [tubeOrder[tubeSelected], tubeOrder[idx]] = [tubeOrder[idx], tubeOrder[tubeSelected]]; tubeSelected = null; renderTubes(); checkTubes(); }
    });
  });
}

function checkTubes() {
  if (tubeOrder.every((c, i) => c === TUBE_COLORS[i])) {
    setFlag('tubesSorted', true);
    addItem('stardust');
    showDialogue('試管排列正確！架子底部彈出了星塵粉！');
    setTimeout(() => closePopup(), 1500);
  }
}

// --- 2-4: Cabinet (East) ---
let cabinetDials = [0, 0, 0];
let cabinetLocked = false;

function clickCabinet() {
  if (gameState.cabinetSolved) { showDialogue('櫥櫃已經空了。'); return; }
  if (!gameState.clockExamined && !gameState.diaryTimeReverseRead) { showDialogue('完全沒有頭緒…也許房間裡有什麼提示？'); return; }
  if (gameState.clockExamined && !gameState.diaryTimeReverseRead) { showDialogue('3:25…好像很重要，但還缺少什麼資訊。'); return; }
  if (!gameState.clockExamined && gameState.diaryTimeReverseRead) { showDialogue('時間倒流…但倒流什麼時間呢？'); return; }
  cabinetDials = [0, 0, 0];
  cabinetLocked = false;
  openPopup(`<div class="popup-content" style="display:flex;align-items:center;justify-content:center;gap:8px"><div id="cab-dials" style="display:flex;gap:8px"></div></div><button class="popup-back" id="cab-back">返回</button>`);
  document.getElementById('cab-back').addEventListener('click', closePopup);
  renderCabinetDials();
}

function renderCabinetDials() {
  const el = document.getElementById('cab-dials');
  if (!el) return;
  el.innerHTML = cabinetDials.map((v, i) => `<div style="display:flex;flex-direction:column;align-items:center"><div class="dial-btn" data-i="${i}" data-d="-1" style="cursor:pointer;color:#ffd700;font-size:16px;padding:4px">▲</div><div style="font-size:24px;color:#fff;font-weight:bold;width:36px;height:40px;display:flex;align-items:center;justify-content:center;background:#1a1a2e;border:2px solid #ffd700;border-radius:6px">${v}</div><div class="dial-btn" data-i="${i}" data-d="1" style="cursor:pointer;color:#ffd700;font-size:16px;padding:4px">▼</div></div>`).join('');
  el.querySelectorAll('.dial-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (cabinetLocked) return;
      const i = parseInt(btn.dataset.i), d = parseInt(btn.dataset.d);
      cabinetDials[i] = (cabinetDials[i] + d + 10) % 10;
      renderCabinetDials();
      checkCabinet();
    });
  });
}

function checkCabinet() {
  if (cabinetDials[0] === 5 && cabinetDials[1] === 2 && cabinetDials[2] === 3) {
    setFlag('cabinetSolved', true);
    addItem('magic_fire');
    showDialogue('櫥櫃打開了！你獲得了魔法火種！');
    setTimeout(() => closePopup(), 1500);
  } else {
    const code = cabinetDials.join('');
    if (code.length === 3 && cabinetDials.some(v => v !== 0)) {
      gameState.cabinetErrors++;
      if (gameState.cabinetErrors >= 3 && gameState.cabinetErrors < 5) {
        cabinetLocked = true;
        showDialogue('鎖定 8 秒...');
        setTimeout(() => { cabinetLocked = false; }, 8000);
      } else if (gameState.cabinetErrors >= 5) {
        showDialogue('把時間反過來看看？');
      }
    }
  }
}

// --- 2-5: Cauldron (North) ---
function clickCauldron() {
  if (gameState.potionBrewed) { showDialogue('大鍋裡殘留著金色的光芒。'); return; }
  const step = gameState.potionStep || 0;
  const selected = getSelectedItem();
  if (step === 0) {
    if (selected === 'magic_fire') { removeItem('magic_fire'); clearSelection(); setFlag('potionStep', 1); showDialogue('🔥 魔法火種點燃了大鍋！'); }
    else { showDialogue('大鍋還沒準備好，似乎還缺少什麼材料。'); }
  } else if (step === 1) {
    if (selected === 'rainbow_dew') { removeItem('rainbow_dew'); clearSelection(); setFlag('potionStep', 2); showDialogue('🌈 彩虹露倒入鍋中，液體變成七彩色！'); }
    else { showDialogue('好像不是現在該放這個...'); }
  } else if (step === 2) {
    if (selected === 'stardust') { removeItem('stardust'); clearSelection(); setFlag('potionStep', 3); showDialogue('✨ 星塵粉灑入，鍋中閃爍星光！'); }
    else { showDialogue('好像不是現在該放這個...'); }
  } else if (step === 3) {
    if (selected === 'moonlight_powder') { removeItem('moonlight_powder'); clearSelection(); setFlag('potionStep', 4); showDialogue('🌙 月光粉融入，液體發出柔和銀光！'); }
    else { showDialogue('好像不是現在該放這個...'); }
  } else if (step === 4) {
    if (selected === 'stirrer') { gameState.potionStep = 5; showDialogue('攪拌中... (1/3)'); }
    else { showDialogue('需要用攪拌匙攪拌。'); }
  } else if (step === 5) {
    if (selected === 'stirrer') { gameState.potionStep = 6; showDialogue('攪拌中... (2/3)'); }
    else { showDialogue('繼續攪拌！'); }
  } else if (step === 6) {
    if (selected === 'stirrer') { removeItem('stirrer'); clearSelection(); setFlag('potionStep', 7); setFlag('potionBrewed', true); addItem('sunlight_potion'); showDialogue('☀️ 陽光藥水煮好了！'); }
    else { showDialogue('再攪拌一次！'); }
  }
}

// --- 2-6: Balance (West) ---
function clickBalance() {
  if (gameState.balanceSolved) { showDialogue('天秤底座已經打開了。'); return; }
  const selected = getSelectedItem();
  if (selected === 'magic_weight') {
    removeItem('magic_weight'); clearSelection();
    setFlag('balanceSolved', true);
    addItem('graduation_scroll');
    openPopup(`<div class="popup-content"><img src="assets/items/balance-even.png" style="width:100%;height:100%;object-fit:contain"></div><button class="popup-back" id="bal-back">返回</button>`);
    document.getElementById('bal-back').addEventListener('click', closePopup);
    showDialogue('天秤平衡了！底座打開，你獲得了畢業咒語卷軸！');
  } else {
    openPopup(`<div class="popup-content"><img src="assets/items/balance-uneven.png" style="width:100%;height:100%;object-fit:contain"></div><button class="popup-back" id="bal-back">返回</button>`);
    document.getElementById('bal-back').addEventListener('click', closePopup);
  }
}

// --- Crystal Ball (South) ---
function clickCrystalBall() {
  openPopup(`<div class="popup-content" style="display:flex;align-items:center;justify-content:center;gap:16px"><div style="width:36px;height:36px;border-radius:50%;background:#e74c3c"></div><div style="width:36px;height:36px;border-radius:50%;background:#3498db"></div><div style="width:36px;height:36px;border-radius:50%;background:#27ae60"></div><div style="width:36px;height:36px;border-radius:50%;background:#9b59b6"></div></div><button class="popup-back" id="cb-back">返回</button>`);
  document.getElementById('cb-back').addEventListener('click', closePopup);
}

// --- Recipe Note (North) ---
function clickRecipeNote() {
  openPopup(`<div class="popup-content" style="display:flex;align-items:center;justify-content:center"><img src="assets/room2/recipe-note-clear.png" style="max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain"></div><button class="popup-back" id="rn-back">返回</button>`);
  document.getElementById('rn-back').addEventListener('click', closePopup);
}

// --- Recipe Wall (North) ---
function clickRecipeWall() {
  openPopup(`<div class="popup-content"><img src="assets/potion-recipe-clue.png" style="max-width:100%;max-height:100%;object-fit:contain"></div><button class="popup-back" id="rw-back">返回</button>`);
  document.getElementById('rw-back').addEventListener('click', closePopup);
}

// --- Room2 Door (North) ---
function clickRoom2Door() {
  gameState.currentRoom = 'room1';
  gameState.wallIndex = 1;
  render();
  document.getElementById('btn-r1').classList.add('active');
  document.getElementById('btn-r2').classList.remove('active');
}

// Expose switchRoom for toolbar buttons
window.switchRoom = switchRoom;
