// ===== GAME STATE =====
const defaultState = () => ({
  currentRoom: 1,
  doorOpen: false,
  stars: 0,
  solvedPuzzles: [],
  inventory: [],
  selectedItem: null,
  // Puzzle-specific state
  diaryRead: false,
  carpetLifted: false,
  mirrorUsed: false,
  musicBoxPlayed: false,
  bottlesSorted: false,
  potionBrewing: { fire: false, rainbow: false, stardust: false, moonlight: false, stirCount: 0 },
  hasScrollUsed: false
});
let state = defaultState();

// ===== ITEMS DEFINITION =====
const ITEMS = {
  starChart: { name: '星座對照表', icon: '📜', desc: '顏色與星座的對應：紅=獅子座、藍=水瓶座、金=天秤座' },
  recipePage: { name: '藥水配方殘頁', icon: '📄', desc: '配方：火種點燃→彩虹露→星塵粉→月光粉→攪拌3次' },
  crystalKey: { name: '水晶鑰匙', icon: '🔑', desc: '透明的水晶鑰匙，閃著微光' },
  stirrer: { name: '攪拌匙', icon: '🥄', desc: '銀色的魔法攪拌匙' },
  rainbowDew: { name: '彩虹露', icon: '🌈', desc: '七彩的露珠，閃閃發光' },
  starDust: { name: '星塵粉', icon: '✨', desc: '閃亮的星塵粉末' },
  magicWeight: { name: '魔法砝碼', icon: '⚖️', desc: '刻有符文的金色砝碼' },
  moonPowder: { name: '月光粉', icon: '🌙', desc: '銀白色的月光粉末' },
  sunPotion: { name: '陽光藥水', icon: '☀️', desc: '金色的陽光藥水，溫暖而明亮' },
  magicFire: { name: '魔法火種', icon: '🔥', desc: '永不熄滅的小火焰' },
  scroll: { name: '畢業咒語卷軸', icon: '📜', desc: '上面寫著：「Lumina Stella Aperio！」' }
};

// ===== HINTS =====
const HINTS = {
  '1-1': ['試試點擊魔法鏡看看鏡中的世界', '鏡中有一本書在發光，找到現實中對應的位置', '點擊書架第二排中間那本發光的書'],
  '1-2': ['仔細翻閱魔法日記，注意每頁邊角的符號', '日記提到「按照月相順序排列」：新月→半月→滿月 對應 △→☆→○', '在書桌抽屜的符號鎖上按 △☆○ 順序'],
  '1-3': ['地毯下面似乎藏著什麼...試試掀開角落', '需要水晶鑰匙插入中間凹槽，然後找到寫著咒語的書', '用鑰匙插入門的中間孔，再點擊書架上寫著「開啟 Aperio」的書'],
  '1-4': ['星座儀需要對準3個星座，線索在房間2的音樂盒', '音樂盒的顏色順序是紅→藍→金，配合星座對照表', '紅=獅子座、藍=水瓶座、金=天秤座，旋轉星座儀對準這三個'],
  '1-5': ['壁爐暗格需要4位數密碼，線索在房間2', '房間2的彩色瓶子排好後，數各顏色的數量', '紅2、藍4、綠1、紫7 → 密碼是 2417'],
  '1-6': ['小花需要特殊的東西才能綻放', '需要房間2煮出的陽光藥水', '選中陽光藥水後點擊花盆'],
  '2-1': ['轉動音樂盒把手聽旋律，注意按鈕亮起的順序', '底部抽屜需要按節奏按按鈕：長-短-短-長', '按照節奏模式按下按鈕：長按-短按-短按-長按'],
  '2-2': ['貓頭鷹的眼睛可以旋轉，旁邊有張小紙條', '紙條寫著：左眼月亮，右眼星星', '把左眼轉到🌙，右眼轉到⭐'],
  '2-3': ['瓶子需要按正確順序排列，看看配方牆', '配方牆顯示要按彩虹色排列', '按紅橙黃綠藍靛紫的順序拖動排列瓶子'],
  '2-4': ['櫥櫃密碼和房間1的掛鐘有關', '掛鐘停在3:15，日記寫著「時間倒流揭示真相」', '3:15倒轉=9:45，密碼是 945'],
  '2-5': ['需要收集所有材料並按正確順序放入大鍋', '順序：火種點燃→彩虹露→星塵粉→月光粉→攪拌3次', '確保你有火種、彩虹露、星塵粉、月光粉和攪拌匙'],
  '2-6': ['天秤需要放上等重的東西', '需要房間1星座儀裡的魔法砝碼', '選中魔法砝碼後點擊天秤']
};

// ===== CORE FUNCTIONS =====
function saveGame() {
  localStorage.setItem('magicEscape_save', JSON.stringify(state));
  showMessage('遊戲已儲存 💾');
}

function loadGame() {
  const saved = localStorage.getItem('magicEscape_save');
  if (saved) { state = JSON.parse(saved); return true; }
  return false;
}

function hasSave() { return !!localStorage.getItem('magicEscape_save'); }

function showMessage(text, duration = 2000) {
  const box = document.getElementById('message-box');
  box.textContent = text;
  box.classList.remove('hidden');
  clearTimeout(box._timer);
  box._timer = setTimeout(() => box.classList.add('hidden'), duration);
}

function addItem(itemId) {
  if (!state.inventory.includes(itemId)) {
    state.inventory.push(itemId);
    renderInventory();
    showMessage(`獲得：${ITEMS[itemId].name} ${ITEMS[itemId].icon}`);
    createSparkle(window.innerWidth / 2, window.innerHeight - 100);
  }
}

function removeItem(itemId) {
  state.inventory = state.inventory.filter(i => i !== itemId);
  if (state.selectedItem === itemId) state.selectedItem = null;
  renderInventory();
}

function hasItem(itemId) { return state.inventory.includes(itemId); }

function solvePuzzle(id) {
  if (!state.solvedPuzzles.includes(id)) {
    state.solvedPuzzles.push(id);
    state.stars++;
    showMessage(`⭐ 獲得星星！(${state.stars}/6)`);
    updateStarCounter();
    createSparkle(window.innerWidth / 2, 50);
    if (state.stars >= 6 && hasItem('scroll')) checkEndGame();
    saveGame();
  }
}

function isSolved(id) { return state.solvedPuzzles.includes(id); }

function updateStarCounter() {
  const el = document.getElementById('star-counter');
  if (el) el.textContent = `⭐ ${state.stars}/6`;
}

function createSparkle(x, y) {
  for (let i = 0; i < 5; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle-effect';
    s.textContent = '✨';
    s.style.left = (x + (Math.random() - 0.5) * 60) + 'px';
    s.style.top = (y + (Math.random() - 0.5) * 60) + 'px';
    s.style.fontSize = (12 + Math.random() * 12) + 'px';
    document.getElementById('scene-area').appendChild(s);
    setTimeout(() => s.remove(), 800);
  }
}

// ===== MODAL =====
function showModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('overlay').classList.add('hidden');
}

// ===== INVENTORY RENDER =====
function renderInventory() {
  const slots = document.getElementById('inventory-slots');
  slots.innerHTML = '';
  state.inventory.forEach(itemId => {
    const item = ITEMS[itemId];
    const el = document.createElement('div');
    el.className = 'inv-item' + (state.selectedItem === itemId ? ' selected' : '');
    el.textContent = item.icon;
    el.title = item.name;
    el.onclick = (e) => { e.stopPropagation(); selectItem(itemId); };
    el.ondblclick = (e) => { e.stopPropagation(); showModal(`<h3>${item.name}</h3><p>${item.desc}</p>`); };
    slots.appendChild(el);
  });
}

function selectItem(itemId) {
  state.selectedItem = state.selectedItem === itemId ? null : itemId;
  renderInventory();
  if (state.selectedItem) showMessage(`已選中：${ITEMS[itemId].name}`);
}

// ===== SCENE SWITCHING =====
function switchRoom(roomNum) {
  if (roomNum === 2 && !state.doorOpen) { showMessage('魔法門還鎖著...需要先解開前面的謎題'); return; }
  state.currentRoom = roomNum;
  document.getElementById('room1').classList.toggle('hidden', roomNum !== 1);
  document.getElementById('room2').classList.toggle('hidden', roomNum !== 2);
  document.getElementById('btn-room1').classList.toggle('active', roomNum === 1);
  document.getElementById('btn-room2').classList.toggle('active', roomNum === 2);
  saveGame();
}

// ===== HINT SYSTEM =====
function showHint() {
  const available = getCurrentPuzzles();
  if (available.length === 0) { showMessage('目前沒有可用的提示'); return; }
  let html = '<h3>💡 提示</h3>';
  available.forEach(pid => {
    const hints = HINTS[pid];
    const hintLevel = Math.min((state['hint_' + pid] || 0), 2);
    html += `<div style="margin:12px 0;padding:10px;background:rgba(255,165,0,0.1);border-radius:8px;">`;
    html += `<strong>謎題 ${pid}</strong><br>`;
    html += `<p style="color:#ffd700;">${hints[hintLevel]}</p>`;
    if (hintLevel < 2) html += `<button onclick="revealMoreHint('${pid}')">更多提示 (${hintLevel + 1}/3)</button>`;
    html += `</div>`;
  });
  showModal(html);
}

function revealMoreHint(pid) {
  state['hint_' + pid] = (state['hint_' + pid] || 0) + 1;
  showHint();
}

function getCurrentPuzzles() {
  const unsolved = [];
  const r1 = ['1-1', '1-2', '1-3'];
  const r2first = ['2-1', '2-2', '2-3'];
  const r1later = ['1-4', '1-5', '1-6'];
  const r2later = ['2-4', '2-5', '2-6'];
  r1.forEach(p => { if (!isSolved(p)) unsolved.push(p); });
  if (state.doorOpen) {
    r2first.forEach(p => { if (!isSolved(p)) unsolved.push(p); });
    r1later.forEach(p => { if (!isSolved(p)) unsolved.push(p); });
    r2later.forEach(p => { if (!isSolved(p)) unsolved.push(p); });
  }
  return unsolved;
}

function checkEndGame() {
  if (state.stars >= 6 && hasItem('scroll')) {
    showModal(`<h3>🌟 集齊六顆星星！</h3>
      <p>你已經集齊了所有魔法星星，手中還有畢業咒語卷軸。</p>
      <p>對著大門念出咒語吧！</p>
      <button onclick="useScroll()">念出咒語：Lumina Stella Aperio！✨</button>`);
  }
}

function useScroll() {
  state.hasScrollUsed = true;
  closeModal();
  localStorage.removeItem('magicEscape_save');
  document.getElementById('end-screen').classList.remove('hidden');
}

// ===== ROOM 1 OBJECTS =====
function renderRoom1() {
  const room = document.getElementById('room1');
  room.innerHTML = `<div id="star-counter">⭐ ${state.stars}/6</div>`;
  const objects = [
    { id: 'mirror', emoji: '🪞', label: '魔法鏡', x: 10, y: 15, w: 14, h: 22 },
    { id: 'bookshelf', emoji: '📚', label: '書架', x: 30, y: 10, w: 20, h: 35 },
    { id: 'desk', emoji: '🪑', label: '書桌', x: 55, y: 45, w: 22, h: 20 },
    { id: 'constellation', emoji: '🔭', label: '星座儀', x: 78, y: 15, w: 14, h: 20 },
    { id: 'clock', emoji: '🕐', label: '掛鐘', x: 52, y: 5, w: 10, h: 12 },
    { id: 'door', emoji: '🚪', label: '魔法門', x: 82, y: 40, w: 14, h: 35 },
    { id: 'flower', emoji: '🌸', label: '小花盆', x: 5, y: 50, w: 12, h: 15 },
    { id: 'starframe', emoji: '⭐', label: '星星框', x: 25, y: 50, w: 12, h: 12 },
    { id: 'carpet', emoji: '🟫', label: '地毯', x: 35, y: 70, w: 30, h: 15 },
    { id: 'fireplace', emoji: '🧱', label: '壁爐', x: 65, y: 70, w: 18, h: 18 }
  ];
  objects.forEach(obj => {
    const el = document.createElement('div');
    el.className = 'game-obj' + (shouldGlow1(obj.id) ? ' glow' : '');
    el.style.cssText = `left:${obj.x}%;top:${obj.y}%;width:${obj.w}%;height:${obj.h}%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:clamp(24px,5vw,40px);`;
    el.innerHTML = `<span>${obj.emoji}</span><span style="font-size:11px;color:#ccc;margin-top:2px;">${obj.label}</span>`;
    el.onclick = () => handleRoom1Click(obj.id);
    room.appendChild(el);
  });
}

function shouldGlow1(id) {
  if (id === 'mirror' && !isSolved('1-1')) return true;
  if (id === 'desk' && !isSolved('1-2') && isSolved('1-1')) return true;
  if (id === 'door' && !isSolved('1-3') && isSolved('1-2')) return true;
  if (id === 'constellation' && !isSolved('1-4') && state.doorOpen && state.musicBoxPlayed) return true;
  if (id === 'fireplace' && !isSolved('1-5') && state.doorOpen && state.bottlesSorted) return true;
  if (id === 'flower' && !isSolved('1-6') && hasItem('sunPotion')) return true;
  return false;
}

function handleRoom1Click(id) {
  switch(id) {
    case 'mirror': puzzle1_1(); break;
    case 'bookshelf': clickBookshelf(); break;
    case 'desk': puzzle1_2(); break;
    case 'constellation': puzzle1_4(); break;
    case 'clock': showModal('<h3>🕐 掛鐘</h3><p>時鐘的指針停在了 <strong>3:15</strong>。</p><p style="color:#aaa;font-style:italic;">日記裡好像提到過「時間倒流揭示真相」...</p>'); break;
    case 'door': puzzle1_3(); break;
    case 'flower': puzzle1_6(); break;
    case 'starframe': showModal(`<h3>⭐ 星星拼圖框</h3><p>框上有6個星星凹槽。</p><p>已收集：${'⭐'.repeat(state.stars)}${'☆'.repeat(6-state.stars)}</p>`); break;
    case 'carpet': clickCarpet(); break;
    case 'fireplace': puzzle1_5(); break;
  }
}

// Puzzle 1-1: Magic Mirror
function puzzle1_1() {
  if (isSolved('1-1')) { showMessage('魔法鏡中的秘密已經被發現了'); return; }
  if (!state.mirrorUsed) {
    state.mirrorUsed = true;
    showModal(`<h3>🪞 魔法鏡</h3>
      <p>你凝視魔法鏡...鏡中映出書房的景象。</p>
      <p>等等！鏡中的書架上，<strong>第二排中間有一本書在發光</strong>！但現實中看不到任何光芒。</p>
      <p style="color:#ffd700;">試試去書架找找那本書吧...</p>`);
  } else {
    showModal(`<h3>🪞 魔法鏡</h3><p>鏡中書架第二排中間的書仍在發光。去書架點擊那本書吧！</p>`);
  }
}

function clickBookshelf() {
  if (!state.mirrorUsed) {
    showModal('<h3>📚 書架</h3><p>書架上擺滿了各種魔法書。書脊上有各種符號和文字。</p><p>其中一本書脊寫著「開啟 Aperio」。</p>');
    return;
  }
  if (!isSolved('1-1')) {
    solvePuzzle('1-1');
    addItem('starChart');
    showModal(`<h3>📚 發現秘密！</h3>
      <p>你找到了鏡中發光的那本書！翻開後發現裡面夾著一張「星座對照表」。</p>
      <p style="color:#ffd700;">紅色 = 獅子座 ♌<br>藍色 = 水瓶座 ♒<br>金色 = 天秤座 ♎</p>`);
    renderRoom1();
    return;
  }
  // After solved, bookshelf for puzzle 1-3
  if (!isSolved('1-3') && hasItem('crystalKey') && state.carpetLifted) {
    showModal('<h3>📚 書架</h3><p>書架上有一本書脊寫著「開啟 Aperio」。</p><button onclick="solveAperio()">取下「開啟 Aperio」</button>');
  } else {
    showModal('<h3>📚 書架</h3><p>書架上擺滿了各種魔法書。其中一本書脊寫著「開啟 Aperio」。</p>');
  }
}

function solveAperio() {
  if (state._keyInserted) {
    solvePuzzle('1-3');
    state.doorOpen = true;
    document.getElementById('btn-room2').disabled = false;
    closeModal();
    showMessage('🚪 魔法門開啟了！可以前往藥水廚房！');
    renderRoom1();
  }
}

// Puzzle 1-2: Diary
function puzzle1_2() {
  if (isSolved('1-2')) { showModal('<h3>📖 書桌</h3><p>抽屜已經打開了，裡面空空的。</p>'); return; }
  showModal(`<h3>📖 魔法日記 & 書桌抽屜</h3>
    <div class="diary-page">
      <p>📅 第一頁：畫著新月🌑，邊角有小符號 <strong>△</strong></p>
      <p>📅 第二頁：畫著滿月🌕，邊角有小符號 <strong>○</strong></p>
      <p>📅 第三頁：畫著半月🌓，邊角有小符號 <strong>☆</strong></p>
      <p style="color:#ffd700;">日記寫著：「按照月相順序排列符號」</p>
      <p style="color:#aaa;">月相順序：新月→半月→滿月</p>
    </div>
    <p>抽屜上有符號鎖，請輸入正確順序：</p>
    <div class="puzzle-input" id="symbol-input">
      <button class="symbol-btn" onclick="toggleSymbol(this,0)">？</button>
      <button class="symbol-btn" onclick="toggleSymbol(this,1)">？</button>
      <button class="symbol-btn" onclick="toggleSymbol(this,2)">？</button>
    </div>
    <p style="font-size:12px;color:#aaa;">點擊切換符號：△ ☆ ○</p>
    <button onclick="checkDiary()">確認</button>`);
}

const symbolCycle = ['？', '△', '☆', '○'];
let symbolState = [0, 0, 0];

function toggleSymbol(btn, idx) {
  symbolState[idx] = (symbolState[idx] + 1) % 4;
  btn.textContent = symbolCycle[symbolState[idx]];
}

function checkDiary() {
  // Correct: △☆○ (new moon=△, half moon=☆, full moon=○)
  if (symbolState[0] === 1 && symbolState[1] === 2 && symbolState[2] === 3) {
    solvePuzzle('1-2');
    addItem('recipePage');
    addItem('crystalKey');
    closeModal();
    showModal('<h3>✨ 抽屜打開了！</h3><p>裡面有「藥水配方殘頁」和「水晶鑰匙」！</p>');
    renderRoom1();
  } else {
    showMessage('符號順序不對...再想想月相的順序');
  }
}

// Puzzle 1-3: Open Door
function puzzle1_3() {
  if (state.doorOpen) { switchRoom(2); return; }
  if (!hasItem('crystalKey')) { showModal('<h3>🚪 魔法門</h3><p>門上有三個鑰匙孔形狀的凹槽。門牢牢鎖著。</p><p style="color:#aaa;">似乎需要鑰匙和咒語...</p>'); return; }
  if (!state.carpetLifted) { showModal('<h3>🚪 魔法門</h3><p>門上有三個凹槽。你有水晶鑰匙，但不確定該插哪個孔...</p><p style="color:#aaa;">也許房間裡還有其他線索？</p>'); return; }
  showModal(`<h3>🚪 魔法門</h3>
    <p>門上有三個凹槽（左、中、右）。</p>
    <p>地毯上的圖案顯示：鑰匙插中間 + 念出書架上的咒語</p>
    <button onclick="insertKey()">將水晶鑰匙插入中間凹槽</button>`);
}

function insertKey() {
  state._keyInserted = true;
  removeItem('crystalKey');
  closeModal();
  showMessage('鑰匙插入了中間凹槽...現在需要咒語！去書架找「開啟 Aperio」');
  renderRoom1();
}

function clickCarpet() {
  if (!state.carpetLifted) {
    state.carpetLifted = true;
    showModal('<h3>🟫 地毯</h3><p>你掀開地毯角落，發現下面有隱藏圖案！</p><p style="color:#ffd700;">圖案顯示：鑰匙插入中間孔 + 對著門念出書架上某本書的文字</p>');
  } else {
    showModal('<h3>🟫 地毯</h3><p>地毯下的圖案：鑰匙插中間孔 + 書架上的咒語</p>');
  }
}

// Puzzle 1-4: Constellation
function puzzle1_4() {
  if (isSolved('1-4')) { showMessage('星座儀已經打開了'); return; }
  if (!state.doorOpen) { showModal('<h3>🔭 星座儀</h3><p>天球可以旋轉，需要對準3個正確的星座。</p><p style="color:#aaa;">但你不知道該對準哪些...也許其他地方有線索？</p>'); return; }
  if (!state.musicBoxPlayed) { showModal('<h3>🔭 星座儀</h3><p>天球可以旋轉，需要對準3個正確的星座。</p><p style="color:#aaa;">但你不知道該對準哪些...也許其他地方有線索？</p>'); return; }
  if (!hasItem('starChart')) { showModal('<h3>🔭 星座儀</h3><p>你記得音樂盒的顏色順序是紅→藍→金，但需要知道顏色對應什麼星座...</p>'); return; }
  showModal(`<h3>🔭 星座儀</h3>
    <p>音樂盒顏色：紅→藍→金</p>
    <p>星座對照表：紅=獅子座、藍=水瓶座、金=天秤座</p>
    <p>旋轉天球對準正確的星座：</p>
    <div class="puzzle-input">
      <select id="c1"><option value="">第1個</option><option value="leo">♌ 獅子座</option><option value="aqua">♒ 水瓶座</option><option value="libra">♎ 天秤座</option><option value="aries">♈ 白羊座</option></select>
      <select id="c2"><option value="">第2個</option><option value="leo">♌ 獅子座</option><option value="aqua">♒ 水瓶座</option><option value="libra">♎ 天秤座</option><option value="aries">♈ 白羊座</option></select>
      <select id="c3"><option value="">第3個</option><option value="leo">♌ 獅子座</option><option value="aqua">♒ 水瓶座</option><option value="libra">♎ 天秤座</option><option value="aries">♈ 白羊座</option></select>
    </div>
    <button onclick="checkConstellation()">對準星座</button>`);
}

function checkConstellation() {
  const c1 = document.getElementById('c1').value;
  const c2 = document.getElementById('c2').value;
  const c3 = document.getElementById('c3').value;
  if (c1 === 'leo' && c2 === 'aqua' && c3 === 'libra') {
    if (!state.solvedPuzzles.includes('1-4')) state.solvedPuzzles.push('1-4');
    addItem('magicWeight');
    closeModal();
    showMessage('星座儀打開了！獲得魔法砝碼 ⚖️');
    renderRoom1();
    saveGame();
  } else {
    showMessage('星座組合不對...再想想顏色的對應');
  }
}

// Puzzle 1-5: Fireplace
function puzzle1_5() {
  if (isSolved('1-5')) { showMessage('壁爐暗格已經打開了'); return; }
  showModal(`<h3>🧱 壁爐暗格</h3>
    <p>壁爐裡有個暗格，需要輸入4位數字密碼。</p>
    ${state.bottlesSorted ? '<p style="color:#aaa;">提示：房間2瓶子的數量...紅?、藍?、綠?、紫?</p>' : '<p style="color:#aaa;">密碼的線索似乎不在這個房間...</p>'}
    <div class="puzzle-input">
      <input type="text" maxlength="1" id="fp1" inputmode="numeric">
      <input type="text" maxlength="1" id="fp2" inputmode="numeric">
      <input type="text" maxlength="1" id="fp3" inputmode="numeric">
      <input type="text" maxlength="1" id="fp4" inputmode="numeric">
    </div>
    <button onclick="checkFireplace()">確認密碼</button>`);
}

function checkFireplace() {
  const code = ['fp1','fp2','fp3','fp4'].map(id => document.getElementById(id).value).join('');
  if (code === '2417') {
    if (!state.solvedPuzzles.includes('1-5')) state.solvedPuzzles.push('1-5');
    addItem('moonPowder');
    closeModal();
    showMessage('壁爐暗格打開了！獲得月光粉 🌙');
    renderRoom1();
    saveGame();
  } else {
    showMessage('密碼不正確...');
  }
}

// Puzzle 1-6: Flower
function puzzle1_6() {
  if (isSolved('1-6')) { showMessage('花已經綻放了 🌸'); return; }
  if (state.selectedItem === 'sunPotion') {
    if (!state.solvedPuzzles.includes('1-6')) state.solvedPuzzles.push('1-6');
    removeItem('sunPotion');
    closeModal();
    showModal('<h3>🌸 花朵綻放！</h3><p>陽光藥水灑在花盆上，小花緩緩綻放...</p><p>所有謎題都解開了！快去對大門念出咒語吧！</p>');
    renderRoom1();
    saveGame();
    setTimeout(() => checkEndGame(), 1500);
  } else {
    showModal('<h3>🌸 小花盆</h3><p>窗台上的小花緊閉著花瓣，似乎需要特殊的東西才能綻放...</p>');
  }
}

// ===== ROOM 2 OBJECTS =====
function renderRoom2() {
  const room = document.getElementById('room2');
  room.innerHTML = `<div id="star-counter">⭐ ${state.stars}/6</div>`;
  const objects = [
    { id: 'cauldron', emoji: '🫕', label: '大鍋', x: 35, y: 45, w: 20, h: 25 },
    { id: 'ingredients', emoji: '🧂', label: '食材架', x: 5, y: 15, w: 15, h: 25 },
    { id: 'recipe_wall', emoji: '📋', label: '配方牆', x: 22, y: 8, w: 15, h: 20 },
    { id: 'musicbox', emoji: '🎵', label: '音樂盒', x: 60, y: 10, w: 14, h: 18 },
    { id: 'cabinet', emoji: '🗄️', label: '櫥櫃', x: 78, y: 10, w: 14, h: 25 },
    { id: 'owl_painting', emoji: '🦉', label: '貓頭鷹掛畫', x: 42, y: 5, w: 14, h: 18 },
    { id: 'bottles', emoji: '🧪', label: '彩色瓶子', x: 5, y: 50, w: 18, h: 20 },
    { id: 'scale', emoji: '⚖️', label: '天秤', x: 75, y: 50, w: 16, h: 20 },
    { id: 'crystal_ball', emoji: '🔮', label: '水晶球', x: 60, y: 55, w: 12, h: 15 },
    { id: 'door2', emoji: '🚪', label: '魔法門', x: 85, y: 70, w: 12, h: 20 }
  ];
  objects.forEach(obj => {
    const el = document.createElement('div');
    el.className = 'game-obj' + (shouldGlow2(obj.id) ? ' glow' : '');
    el.style.cssText = `left:${obj.x}%;top:${obj.y}%;width:${obj.w}%;height:${obj.h}%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:clamp(24px,5vw,40px);`;
    el.innerHTML = `<span>${obj.emoji}</span><span style="font-size:11px;color:#ccc;margin-top:2px;">${obj.label}</span>`;
    el.onclick = () => handleRoom2Click(obj.id);
    room.appendChild(el);
  });
}

function shouldGlow2(id) {
  if (id === 'musicbox' && !isSolved('2-1')) return true;
  if (id === 'owl_painting' && !isSolved('2-2') && isSolved('2-1')) return true;
  if (id === 'bottles' && !isSolved('2-3') && isSolved('2-2')) return true;
  if (id === 'cabinet' && !isSolved('2-4') && state.doorOpen) return true;
  if (id === 'cauldron' && !isSolved('2-5') && hasItem('magicFire')) return true;
  if (id === 'scale' && !isSolved('2-6') && hasItem('magicWeight')) return true;
  return false;
}

function handleRoom2Click(id) {
  switch(id) {
    case 'cauldron': puzzle2_5(); break;
    case 'ingredients': showModal('<h3>🧂 食材架</h3><p>各種魔法材料整齊排列著。大部分你都不認識。</p>'); break;
    case 'recipe_wall': showRecipeWall(); break;
    case 'musicbox': puzzle2_1(); break;
    case 'cabinet': puzzle2_4(); break;
    case 'owl_painting': puzzle2_2(); break;
    case 'bottles': puzzle2_3(); break;
    case 'scale': puzzle2_6(); break;
    case 'crystal_ball': showModal('<h3>🔮 水晶球</h3><p>透過水晶球，你隱約看到房間1的掛鐘...指針停在 3:15。</p><p style="color:#aaa;">日記裡寫著「時間倒流揭示真相」...</p>'); break;
    case 'door2': switchRoom(1); break;
  }
}

function showRecipeWall() {
  const hasRecipe = hasItem('recipePage');
  showModal(`<h3>📋 配方牆</h3>
    <p>牆上貼著藥水配方，但部分文字模糊不清：</p>
    <div class="diary-page">
      <p>☀️ 陽光藥水配方：</p>
      <p>1. ${hasRecipe ? '🔥 魔法火種點燃大鍋' : '??? 點燃大鍋'}</p>
      <p>2. ${hasRecipe ? '🌈 加入彩虹露' : '??? 加入 ???'}</p>
      <p>3. ${hasRecipe ? '✨ 加入星塵粉' : '加入 ???粉'}</p>
      <p>4. ${hasRecipe ? '🌙 加入月光粉' : '加入 ???粉'}</p>
      <p>5. ${hasRecipe ? '🥄 用攪拌匙攪拌3次' : '用 ??? 攪拌?次'}</p>
    </div>
    ${!hasRecipe ? '<p style="color:#aaa;">配方不完整...也許其他地方有殘頁？</p>' : '<p style="color:#ffd700;">配方殘頁補全了所有內容！</p>'}`);
}

// Puzzle 2-1: Music Box
function puzzle2_1() {
  if (isSolved('2-1')) { showMessage('音樂盒已經打開了'); return; }
  showModal(`<h3>🎵 音樂盒</h3>
    <p>你轉動音樂盒把手，美妙的旋律響起...</p>
    <p>彩色按鈕依序亮起：<strong style="color:#ff4444;">紅</strong> → <strong style="color:#4444ff;">藍</strong> → <strong style="color:#ffd700;">金</strong></p>
    <p style="color:#aaa;">（記住這個顏色順序，可能在其他地方有用）</p>
    <hr style="border-color:#333;margin:15px 0;">
    <p>音樂盒底部有個小抽屜，需要按照旋律節奏按按鈕。</p>
    <p>旋律節奏：<strong>長-短-短-長</strong></p>
    <div id="rhythm-btns" style="display:flex;gap:10px;justify-content:center;margin:15px 0;">
      <button class="symbol-btn" onclick="rhythmPress(0)" id="rb0">♪</button>
      <button class="symbol-btn" onclick="rhythmPress(1)" id="rb1">♪</button>
      <button class="symbol-btn" onclick="rhythmPress(2)" id="rb2">♪</button>
      <button class="symbol-btn" onclick="rhythmPress(3)" id="rb3">♪</button>
    </div>
    <p style="font-size:12px;color:#aaa;">點擊切換：短按(♪) / 長按(♩)</p>
    <button onclick="checkRhythm()">確認節奏</button>`);
}

let rhythmState = [0, 0, 0, 0]; // 0=short, 1=long
function rhythmPress(idx) {
  rhythmState[idx] = 1 - rhythmState[idx];
  document.getElementById('rb' + idx).textContent = rhythmState[idx] ? '♩' : '♪';
  document.getElementById('rb' + idx).classList.toggle('active', rhythmState[idx]);
}

function checkRhythm() {
  // long-short-short-long = 1,0,0,1
  if (rhythmState[0] === 1 && rhythmState[1] === 0 && rhythmState[2] === 0 && rhythmState[3] === 1) {
    state.musicBoxPlayed = true;
    solvePuzzle('2-1');
    addItem('stirrer');
    closeModal();
    renderRoom2();
  } else {
    showMessage('節奏不對...是「長-短-短-長」');
    rhythmState = [0, 0, 0, 0];
  }
}

// Puzzle 2-2: Owl Painting
function puzzle2_2() {
  if (isSolved('2-2')) { showMessage('貓頭鷹已經張開嘴了'); return; }
  showModal(`<h3>🦉 貓頭鷹掛畫</h3>
    <p>貓頭鷹的兩隻眼睛可以旋轉！</p>
    <p style="color:#ffd700;">旁邊小紙條：「貓頭鷹看見的是：左眼月亮，右眼星星」</p>
    <div style="display:flex;gap:20px;justify-content:center;margin:15px 0;">
      <div>
        <p>左眼：</p>
        <button class="symbol-btn" id="owl-left" onclick="rotateOwlEye('left')">☀️</button>
      </div>
      <div>
        <p>右眼：</p>
        <button class="symbol-btn" id="owl-right" onclick="rotateOwlEye('right')">☀️</button>
      </div>
    </div>
    <p style="font-size:12px;color:#aaa;">點擊旋轉眼睛圖案</p>
    <button onclick="checkOwl()">確認</button>`);
}

const owlEyes = ['☀️', '🌙', '⭐', '💧'];
let owlLeft = 0, owlRight = 0;
function rotateOwlEye(side) {
  if (side === 'left') { owlLeft = (owlLeft + 1) % 4; document.getElementById('owl-left').textContent = owlEyes[owlLeft]; }
  else { owlRight = (owlRight + 1) % 4; document.getElementById('owl-right').textContent = owlEyes[owlRight]; }
}

function checkOwl() {
  if (owlLeft === 1 && owlRight === 2) { // moon, star
    solvePuzzle('2-2');
    addItem('rainbowDew');
    closeModal();
    renderRoom2();
  } else {
    showMessage('圖案不對...紙條說了什麼？');
  }
}

// Puzzle 2-3: Bottle Sorting
function puzzle2_3() {
  if (isSolved('2-3')) { showMessage('瓶子已經排好了'); return; }
  const colors = [
    { name: '紫', color: '#9b59b6' }, { name: '綠', color: '#27ae60' },
    { name: '藍', color: '#2980b9' }, { name: '紅', color: '#e74c3c' },
    { name: '靛', color: '#34495e' }, { name: '橙', color: '#e67e22' },
    { name: '黃', color: '#f1c40f' }
  ];
  // Shuffled order for display
  if (!state._bottleOrder) state._bottleOrder = [3, 5, 6, 1, 4, 0, 2]; // scrambled
  showModal(`<h3>🧪 彩色瓶子排列</h3>
    <p>瓶子被打亂了！配方牆上的褪色圖顯示要按<strong>彩虹順序</strong>排列。</p>
    <p style="color:#aaa;">彩虹：紅、橙、黃、綠、藍、靛、紫</p>
    <div class="bottle-rack" id="bottle-rack"></div>
    <p style="font-size:12px;color:#aaa;">點擊兩個瓶子交換位置</p>
    <button onclick="checkBottles()">確認排列</button>`);
  renderBottles(colors);
}

let bottleSelected = -1;
function renderBottles(colors) {
  const rack = document.getElementById('bottle-rack');
  if (!rack) return;
  rack.innerHTML = '';
  const order = state._bottleOrder;
  order.forEach((ci, idx) => {
    const c = colors || [
      { name: '紫', color: '#9b59b6' }, { name: '綠', color: '#27ae60' },
      { name: '藍', color: '#2980b9' }, { name: '紅', color: '#e74c3c' },
      { name: '靛', color: '#34495e' }, { name: '橙', color: '#e67e22' },
      { name: '黃', color: '#f1c40f' }
    ];
    const bottle = document.createElement('div');
    bottle.className = 'bottle';
    bottle.style.background = c[ci].color;
    bottle.textContent = c[ci].name;
    bottle.style.border = bottleSelected === idx ? '3px solid #ffd700' : '2px solid rgba(255,255,255,0.3)';
    bottle.onclick = () => {
      if (bottleSelected === -1) { bottleSelected = idx; }
      else { 
        const temp = state._bottleOrder[bottleSelected];
        state._bottleOrder[bottleSelected] = state._bottleOrder[idx];
        state._bottleOrder[idx] = temp;
        bottleSelected = -1;
      }
      renderBottles();
    };
    rack.appendChild(bottle);
  });
}

function checkBottles() {
  // Correct order: 紅(3)、橙(5)、黃(6)、綠(1)、藍(2)、靛(4)、紫(0)
  const correct = [3, 5, 6, 1, 2, 4, 0];
  if (JSON.stringify(state._bottleOrder) === JSON.stringify(correct)) {
    state.bottlesSorted = true;
    solvePuzzle('2-3');
    addItem('starDust');
    closeModal();
    showModal('<h3>✨ 排列正確！</h3><p>食材架底部彈出了「星塵粉」！</p><p style="color:#aaa;">你注意到瓶子數量：紅2、藍4、綠1、紫7...也許這在別處有用？</p>');
    renderRoom2();
  } else {
    showMessage('順序不對...記住彩虹的顏色順序');
    bottleSelected = -1;
  }
}

// Puzzle 2-4: Cabinet
function puzzle2_4() {
  if (isSolved('2-4')) { showMessage('櫥櫃已經打開了'); return; }
  showModal(`<h3>🗄️ 櫥櫃密碼鎖</h3>
    <p>櫥櫃有3位數密碼鎖。</p>
    <p style="color:#aaa;">水晶球裡看到房間1的掛鐘停在3:15...</p>
    <div class="puzzle-input">
      <input type="text" maxlength="1" id="cb1" inputmode="numeric">
      <input type="text" maxlength="1" id="cb2" inputmode="numeric">
      <input type="text" maxlength="1" id="cb3" inputmode="numeric">
    </div>
    <button onclick="checkCabinet()">確認密碼</button>`);
}

function checkCabinet() {
  const code = ['cb1','cb2','cb3'].map(id => document.getElementById(id).value).join('');
  if (code === '945') {
    if (!state.solvedPuzzles.includes('2-4')) state.solvedPuzzles.push('2-4');
    addItem('magicFire');
    closeModal();
    showMessage('櫥櫃打開了！獲得魔法火種 🔥');
    renderRoom2();
    saveGame();
  } else {
    showMessage('密碼不正確...時間倒流是什麼意思？');
  }
}

// Puzzle 2-5: Brew Potion
function puzzle2_5() {
  if (isSolved('2-5')) { showMessage('藥水已經煮好了'); return; }
  const pb = state.potionBrewing;
  const steps = [
    { key: 'fire', item: 'magicFire', label: '🔥 魔法火種', done: pb.fire },
    { key: 'rainbow', item: 'rainbowDew', label: '🌈 彩虹露', done: pb.rainbow },
    { key: 'stardust', item: 'starDust', label: '✨ 星塵粉', done: pb.stardust },
    { key: 'moonlight', item: 'moonPowder', label: '🌙 月光粉', done: pb.moonlight }
  ];
  const nextStep = steps.find(s => !s.done);
  const allIn = steps.every(s => s.done);
  
  let html = `<h3>🫕 大鍋</h3><div class="cauldron-area">`;
  html += `<div class="ingredient-slots">`;
  steps.forEach(s => { html += `<div class="ingredient-slot ${s.done ? 'filled' : ''}">${s.label} ${s.done ? '✓' : ''}</div>`; });
  html += `</div>`;
  
  if (!allIn && nextStep) {
    if (state.selectedItem === nextStep.item) {
      html += `<button onclick="addToCauldron('${nextStep.key}','${nextStep.item}')">放入 ${nextStep.label}</button>`;
    } else if (hasItem(nextStep.item)) {
      html += `<p>下一步需要：${nextStep.label}</p><p style="color:#aaa;">先從物品欄選中它再點大鍋</p>`;
    } else {
      html += `<p>下一步需要：${nextStep.label}</p><p style="color:#aaa;">你還沒有這個材料...</p>`;
    }
  } else if (allIn) {
    html += `<p>所有材料已放入！需要用攪拌匙攪拌3次。</p>`;
    html += `<p>已攪拌：${pb.stirCount}/3 次</p>`;
    if (state.selectedItem === 'stirrer') {
      html += `<button onclick="stirCauldron()">攪拌 🥄</button>`;
    } else if (hasItem('stirrer')) {
      html += `<p style="color:#aaa;">選中攪拌匙再點大鍋</p>`;
    } else {
      html += `<p style="color:#aaa;">你需要攪拌匙...</p>`;
    }
  }
  html += `</div>`;
  showModal(html);
}

function addToCauldron(key, itemId) {
  state.potionBrewing[key] = true;
  removeItem(itemId);
  closeModal();
  showMessage(`放入材料！`);
  puzzle2_5();
}

function stirCauldron() {
  state.potionBrewing.stirCount++;
  if (state.potionBrewing.stirCount >= 3) {
    if (!state.solvedPuzzles.includes('2-5')) state.solvedPuzzles.push('2-5');
    addItem('sunPotion');
    removeItem('stirrer');
    closeModal();
    showModal('<h3>☀️ 藥水完成！</h3><p>大鍋中冒出金色光芒...陽光藥水煮好了！</p><p style="color:#ffd700;">帶回房間1試試那朵小花吧。</p>');
    renderRoom2();
  } else {
    closeModal();
    showMessage(`攪拌 ${state.potionBrewing.stirCount}/3 次...`);
    puzzle2_5();
  }
}

// Puzzle 2-6: Scale
function puzzle2_6() {
  if (isSolved('2-6')) { showMessage('天秤已經平衡了'); return; }
  if (state.selectedItem === 'magicWeight') {
    if (!state.solvedPuzzles.includes('2-6')) state.solvedPuzzles.push('2-6');
    removeItem('magicWeight');
    addItem('scroll');
    closeModal();
    showModal('<h3>⚖️ 天秤平衡了！</h3><p>魔法砝碼放上天秤，完美平衡！</p><p>底座打開，裡面有「畢業咒語卷軸」！📜</p>');
    renderRoom2();
    saveGame();
    setTimeout(() => checkEndGame(), 1500);
  } else {
    showModal('<h3>⚖️ 天秤</h3><p>天秤一邊放著神秘寶石，另一邊空著。</p><p>需要放上等重的東西才能觸發機關。</p>' +
      (hasItem('magicWeight') ? '<p style="color:#aaa;">選中魔法砝碼再點天秤試試</p>' : '<p style="color:#aaa;">你需要找到合適的砝碼...</p>'));
  }
}

// ===== INITIALIZATION =====
function initGame() {
  renderRoom1();
  renderRoom2();
  renderInventory();
  updateStarCounter();
  if (state.doorOpen) document.getElementById('btn-room2').disabled = false;
  switchRoom(state.currentRoom);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Start screen
  if (hasSave()) document.getElementById('btn-load').classList.remove('hidden');
  
  document.getElementById('btn-start').onclick = () => {
    state = defaultState();
    document.getElementById('start-screen').classList.add('hidden');
    initGame();
  };
  
  document.getElementById('btn-load').onclick = () => {
    loadGame();
    document.getElementById('start-screen').classList.add('hidden');
    initGame();
  };
  
  document.getElementById('btn-restart').onclick = () => {
    localStorage.removeItem('magicEscape_save');
    state = defaultState();
    document.getElementById('end-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
  };
  
  // Navigation
  document.getElementById('btn-room1').onclick = () => switchRoom(1);
  document.getElementById('btn-room2').onclick = () => switchRoom(2);
  document.getElementById('btn-hint').onclick = showHint;
  document.getElementById('btn-save').onclick = saveGame;
  
  // Modal close
  document.getElementById('modal-close').onclick = closeModal;
  document.getElementById('overlay').onclick = closeModal;
  
  // Deselect item when clicking empty scene area
  document.getElementById('scene-area').addEventListener('click', (e) => {
    if (e.target === document.getElementById('room1') || e.target === document.getElementById('room2')) {
      if (state.selectedItem) { state.selectedItem = null; renderInventory(); }
    }
  });
});
