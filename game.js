// ===== GAME STATE =====
const defaultState = () => ({
  currentRoom: 1,
  doorOpen: false,
  stars: 0,
  solvedPuzzles: [],
  inventory: [],
  selectedItem: null,
  carpetLifted: false,
  mirrorUsed: false,
  musicBoxPlayed: false,
  bottlesSorted: false,
  potionBrewing: { fire: false, rainbow: false, stardust: false, moonlight: false, stirCount: 0 },
  hasScrollUsed: false,
  _keyInserted: false,
  _bottleOrder: null
});
let state = defaultState();

// ===== ITEMS =====
const ITEMS = {
  starChart: { name: '星座對照表', icon: '📜', desc: '顏色與星座的對應：紅=獅子座、藍=水瓶座、金=天秤座' },
  recipePage: { name: '藥水配方殘頁', icon: '📄', desc: '殘頁上寫著配方的完整步驟' },
  crystalKey: { name: '水晶鑰匙', icon: '🔑', desc: '透明的水晶鑰匙，閃著微光' },
  stirrer: { name: '攪拌匙', icon: '🥄', desc: '銀色的魔法攪拌匙' },
  rainbowDew: { name: '彩虹露', icon: '🌈', desc: '七彩的露珠，閃閃發光' },
  starDust: { name: '星塵粉', icon: '✨', desc: '閃亮的星塵粉末' },
  magicWeight: { name: '魔法砝碼', icon: '⚖️', desc: '刻有符文的金色砝碼' },
  moonPowder: { name: '月光粉', icon: '🌙', desc: '銀白色的月光粉末' },
  sunPotion: { name: '陽光藥水', icon: '☀️', desc: '金色的陽光藥水，溫暖而明亮' },
  magicFire: { name: '魔法火種', icon: '🔥', desc: '永不熄滅的小火焰' },
  scroll: { name: '畢業咒語卷軸', icon: '📜', desc: '上面寫著一段古老的咒語...' }
};

// ===== HINTS (vague → slightly specific → clear but no direct answer) =====
const HINTS = {
  '1-1': ['這個房間裡有面鏡子...', '鏡中的世界和現實有什麼不同？', '仔細比對鏡中書架和現實書架的差異'],
  '1-2': ['書桌上有本日記，翻翻看', '日記裡的插圖和符號之間有什麼關聯？注意月亮的變化', '月亮從缺到圓的順序...對應的符號是什麼？'],
  '1-3': ['門上有凹槽，地板上也許藏著線索', '你需要一把鑰匙和一句咒語', '鑰匙該插哪個孔？書架上有本書名字很特別...'],
  '1-4': ['星座儀需要對準正確的星座，但線索不在這個房間', '另一個房間有個會發出顏色的東西...', '把顏色和你手上的某張表對照看看'],
  '1-5': ['壁爐裡有個需要密碼的暗格', '密碼和另一個房間裡某些東西的數量有關', '數一數那些排好的瓶子，每種顏色各有幾個？'],
  '1-6': ['窗台的花似乎需要什麼才能綻放', '也許某種藥水能讓它開花？', '你需要從另一個房間帶回某種金色的液體'],
  '2-1': ['音樂盒可以轉動，注意聽旋律', '旋律有節奏感...有長有短', '底部的抽屜需要你重現旋律的節奏模式'],
  '2-2': ['掛畫上的貓頭鷹眼睛似乎可以動', '旁邊牆上有張小紙條...', '紙條上寫的東西就是眼睛該顯示的圖案'],
  '2-3': ['架子上的瓶子被打亂了', '牆上有張褪色的圖，暗示了正確順序', '想想自然界中顏色的排列規律...'],
  '2-4': ['櫥櫃上了鎖，需要3位數密碼', '另一個房間有個停住的鐘...', '如果時間倒流，那個時刻會變成什麼？'],
  '2-5': ['大鍋需要材料和正確的步驟', '你有配方殘頁嗎？它能補全牆上的配方', '按照完整配方的順序依次放入材料，最後別忘了攪拌'],
  '2-6': ['天秤需要平衡', '另一邊需要放上等重的東西', '你在另一個房間的某個裝置裡找到過砝碼嗎？']
};

// ===== CORE FUNCTIONS =====
function saveGame() { localStorage.setItem('magicEscape_save', JSON.stringify(state)); showMessage('遊戲已儲存 💾'); }
function loadGame() { const s = localStorage.getItem('magicEscape_save'); if (s) { state = JSON.parse(s); return true; } return false; }
function hasSave() { return !!localStorage.getItem('magicEscape_save'); }

function showMessage(text, duration = 2000) {
  const box = document.getElementById('message-box');
  box.textContent = text; box.classList.remove('hidden');
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
function removeItem(itemId) { state.inventory = state.inventory.filter(i => i !== itemId); if (state.selectedItem === itemId) state.selectedItem = null; renderInventory(); }
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
function markSolved(id) { if (!state.solvedPuzzles.includes(id)) { state.solvedPuzzles.push(id); saveGame(); } }
function isSolved(id) { return state.solvedPuzzles.includes(id); }
function updateStarCounter() { const el = document.getElementById('star-counter'); if (el) el.textContent = `⭐ ${state.stars}/6`; }

function createSparkle(x, y) {
  for (let i = 0; i < 5; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle-effect'; s.textContent = '✨';
    s.style.left = (x + (Math.random() - 0.5) * 60) + 'px';
    s.style.top = (y + (Math.random() - 0.5) * 60) + 'px';
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

// ===== INVENTORY =====
function renderInventory() {
  const slots = document.getElementById('inventory-slots');
  slots.innerHTML = '';
  if (state.inventory.length === 0) {
    slots.innerHTML = '<span class="inv-empty">— 物品欄 —</span>';
    for (let i = 0; i < 5; i++) { const ph = document.createElement('div'); ph.className = 'inv-placeholder'; slots.appendChild(ph); }
    return;
  }
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
  if (roomNum === 2 && !state.doorOpen) { showMessage('門鎖著...'); return; }
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
    const level = Math.min((state['hint_' + pid] || 0), 2);
    html += `<div style="margin:12px 0;padding:10px;background:rgba(255,165,0,0.1);border-radius:8px;">`;
    html += `<strong>謎題 ${pid}</strong><br><p style="color:#ffd700;">${hints[level]}</p>`;
    if (level < 2) html += `<button onclick="revealMoreHint('${pid}')">再多一點提示</button>`;
    html += `</div>`;
  });
  showModal(html);
}
function revealMoreHint(pid) { state['hint_' + pid] = (state['hint_' + pid] || 0) + 1; showHint(); }
function getCurrentPuzzles() {
  const unsolved = [];
  ['1-1','1-2','1-3'].forEach(p => { if (!isSolved(p)) unsolved.push(p); });
  if (state.doorOpen) {
    ['2-1','2-2','2-3','1-4','1-5','1-6','2-4','2-5','2-6'].forEach(p => { if (!isSolved(p)) unsolved.push(p); });
  }
  return unsolved;
}

function checkEndGame() {
  if (state.stars >= 6 && hasItem('scroll') && !state.hasScrollUsed) {
    showModal(`<h3>🌟 集齊六顆星星！</h3><p>你集齊了所有魔法星星，手中的卷軸微微發光...</p><button onclick="useScroll()">念出咒語 ✨</button>`);
  }
}
function useScroll() { state.hasScrollUsed = true; closeModal(); localStorage.removeItem('magicEscape_save'); document.getElementById('end-screen').classList.remove('hidden'); }

// ===== ROOM 1 RENDERING =====
function renderRoom1() {
  const room = document.getElementById('room1');
  room.innerHTML = `
    <div id="star-counter">⭐ ${state.stars}/6</div>
    <div class="r1-floor"></div>
    <div class="r1-carpet"></div>
    <div class="r1-bookshelf">
      <div class="r1-shelf" style="top:20%"></div>
      <div class="r1-shelf" style="top:45%"></div>
      <div class="r1-shelf" style="top:70%"></div>
      <div class="r1-books" style="top:5%;height:14%"><div class="r1-book" style="height:90%;background:#c0392b"></div><div class="r1-book" style="height:75%;background:#2980b9"></div><div class="r1-book" style="height:85%;background:#27ae60"></div><div class="r1-book" style="height:70%;background:#8e44ad"></div><div class="r1-book" style="height:80%;background:#d4ac0d"></div></div>
      <div class="r1-books" style="top:22%;height:20%"><div class="r1-book" style="height:85%;background:#1a5276"></div><div class="r1-book" style="height:90%;background:#6c3483"></div><div class="r1-book" style="height:75%;background:#c0392b"></div><div class="r1-book" style="height:95%;background:#b7950b"></div><div class="r1-book" style="height:80%;background:#148f77"></div></div>
      <div class="r1-books" style="top:47%;height:20%"><div class="r1-book" style="height:80%;background:#922b21"></div><div class="r1-book" style="height:90%;background:#1b4f72"></div><div class="r1-book" style="height:70%;background:#7d6608"></div><div class="r1-book" style="height:85%;background:#0e6655"></div></div>
    </div>
    <div class="r1-desk"><div class="r1-desk-top"></div><div class="r1-desk-leg" style="left:10%"></div><div class="r1-desk-leg" style="right:10%"></div><div class="r1-diary"></div><div class="r1-quill"></div></div>
    <div class="r1-mirror"><div class="r1-mirror-frame"></div></div>
    <div class="r1-constellation"><div class="r1-const-sphere"><div class="r1-const-ring"></div></div><div class="r1-const-base"></div></div>
    <div class="r1-clock"><div class="r1-clock-hand1"></div><div class="r1-clock-hand2"></div></div>
    <div class="r1-door"><div class="r1-door-rune">✦ ✧ ✦</div><div class="r1-door-knob"></div></div>
    <div class="r1-flowerpot"><div class="r1-pot"></div><div class="r1-flower"></div></div>
    <div class="r1-fireplace"><div class="r1-fire"></div></div>
    <div class="hotspot" style="left:8%;top:8%;width:12%;height:20%" onclick="puzzle1_1()"></div>
    <div class="hotspot" style="left:3%;top:15%;width:22%;height:55%" onclick="clickBookshelf()"></div>
    <div class="hotspot" style="left:35%;top:55%;width:30%;height:20%" onclick="puzzle1_2()"></div>
    <div class="hotspot" style="right:5%;top:18%;width:14%;height:25%" onclick="puzzle1_4()"></div>
    <div class="hotspot" style="left:45%;top:5%;width:8%;height:10%" onclick="clickClock()"></div>
    <div class="hotspot" style="right:3%;top:35%;width:14%;height:40%" onclick="puzzle1_3()"></div>
    <div class="hotspot" style="left:5%;bottom:28%;width:8%;height:15%" onclick="puzzle1_6()"></div>
    <div class="hotspot" style="left:28%;bottom:5%;width:35%;height:12%" onclick="clickCarpet()"></div>
    <div class="hotspot" style="left:55%;bottom:25%;width:20%;height:22%" onclick="puzzle1_5()"></div>
  `;
}

function puzzle1_1() {
  if (isSolved('1-1')) return;
  if (!state.mirrorUsed) {
    state.mirrorUsed = true;
    showModal(`<h3>魔法鏡</h3><p>你凝視魔法鏡...鏡中映出書房的景象。</p><p>但鏡中的書架似乎和現實有些不同。有什麼東西在鏡中微微發光...</p>`);
  } else {
    showModal(`<h3>魔法鏡</h3><p>鏡中的書架和現實的書架...仔細看，有個地方不一樣。</p>`);
  }
}

function clickBookshelf() {
  if (!state.mirrorUsed) { showModal('<h3>書架</h3><p>書架上擺滿了各種魔法書。書脊上有各種符號和文字。</p>'); return; }
  if (!isSolved('1-1')) {
    solvePuzzle('1-1'); addItem('starChart');
    showModal(`<h3>發現了！</h3><p>你找到了那本在鏡中發光的書。翻開後發現裡面夾著一張對照表。</p>`);
    renderRoom1(); return;
  }
  if (!isSolved('1-3') && state._keyInserted) {
    showModal('<h3>書架</h3><p>書架上有很多書...其中一本書脊上的文字似乎是某種咒語。</p><button onclick="solveAperio()">取下那本特別的書</button>');
  } else { showModal('<h3>書架</h3><p>書架上擺滿了各種魔法書。其中一本書脊上寫著奇怪的文字。</p>'); }
}

function solveAperio() { solvePuzzle('1-3'); state.doorOpen = true; document.getElementById('btn-room2').disabled = false; closeModal(); showMessage('🚪 魔法門開啟了！'); renderRoom1(); }

function puzzle1_2() {
  if (isSolved('1-2')) { showModal('<h3>書桌</h3><p>抽屜已經打開了。</p>'); return; }
  showModal(`<h3>書桌</h3>
    <div class="diary-page">
      <p>魔法日記：</p>
      <p>📅 某頁畫著 🌑 ，邊角有符號 △</p>
      <p>📅 某頁畫著 🌕 ，邊角有符號 ○</p>
      <p>📅 某頁畫著 🌓 ，邊角有符號 ☆</p>
      <p style="font-style:italic;color:#aaa;">「按照月相順序排列符號」</p>
    </div>
    <p>抽屜上有符號鎖：</p>
    <div class="puzzle-input" id="symbol-input">
      <button class="symbol-btn" onclick="toggleSymbol(this,0)">？</button>
      <button class="symbol-btn" onclick="toggleSymbol(this,1)">？</button>
      <button class="symbol-btn" onclick="toggleSymbol(this,2)">？</button>
    </div>
    <button onclick="checkDiary()">確認</button>`);
}

const symbolCycle = ['？','△','☆','○'];
let symbolState = [0,0,0];
function toggleSymbol(btn, idx) { symbolState[idx] = (symbolState[idx]+1)%4; btn.textContent = symbolCycle[symbolState[idx]]; }
function checkDiary() {
  if (symbolState[0]===1 && symbolState[1]===2 && symbolState[2]===3) {
    solvePuzzle('1-2'); addItem('recipePage'); addItem('crystalKey'); closeModal(); showMessage('抽屜打開了！'); renderRoom1();
  } else { showMessage('不對...'); }
}

function puzzle1_3() {
  if (state.doorOpen) { switchRoom(2); return; }
  if (!hasItem('crystalKey')) { showModal('<h3>魔法門</h3><p>門上有三個凹槽。門牢牢鎖著。</p>'); return; }
  if (!state.carpetLifted) { showModal('<h3>魔法門</h3><p>門上有三個凹槽（左、中、右）。你有鑰匙，但不確定該怎麼用...</p>'); return; }
  showModal(`<h3>魔法門</h3><p>門上有三個凹槽。</p><button onclick="insertKey()">將鑰匙插入中間凹槽</button>`);
}
function insertKey() { state._keyInserted = true; removeItem('crystalKey'); closeModal(); showMessage('鑰匙插入了...似乎還需要什麼'); renderRoom1(); }

function clickCarpet() {
  if (!state.carpetLifted) { state.carpetLifted = true; showModal('<h3>地毯</h3><p>你掀開地毯角落，發現下面刻著圖案。</p><p>圖案顯示：一把鑰匙指向中間的位置，旁邊畫著一本書和一扇門。</p>'); }
  else { showModal('<h3>地毯</h3><p>地毯下的圖案：鑰匙→中間，書→門。</p>'); }
}
function clickClock() { showModal('<h3>掛鐘</h3><p>時鐘的指針停住了。短針指向3，長針指向3（3:15）。</p>'); }

function puzzle1_4() {
  if (isSolved('1-4')) return;
  if (!state.musicBoxPlayed) { showModal('<h3>星座儀</h3><p>天球可以旋轉，需要對準3個正確的星座。你不知道該對準哪些。</p>'); return; }
  if (!hasItem('starChart')) { showModal('<h3>星座儀</h3><p>你記得某些顏色的順序，但需要知道顏色對應什麼...</p>'); return; }
  showModal(`<h3>星座儀</h3><p>旋轉天球對準三個星座：</p>
    <div class="puzzle-input">
      <select id="c1"><option value="">—</option><option value="leo">♌ 獅子</option><option value="aqua">♒ 水瓶</option><option value="libra">♎ 天秤</option><option value="aries">♈ 白羊</option></select>
      <select id="c2"><option value="">—</option><option value="leo">♌ 獅子</option><option value="aqua">♒ 水瓶</option><option value="libra">♎ 天秤</option><option value="aries">♈ 白羊</option></select>
      <select id="c3"><option value="">—</option><option value="leo">♌ 獅子</option><option value="aqua">♒ 水瓶</option><option value="libra">♎ 天秤</option><option value="aries">♈ 白羊</option></select>
    </div><button onclick="checkConstellation()">對準</button>`);
}
function checkConstellation() {
  if (document.getElementById('c1').value==='leo' && document.getElementById('c2').value==='aqua' && document.getElementById('c3').value==='libra') {
    solvePuzzle('1-4'); addItem('magicWeight'); closeModal(); renderRoom1();
  } else { showMessage('不對...'); }
}

function puzzle1_5() {
  if (isSolved('1-5')) return;
  showModal(`<h3>壁爐暗格</h3><p>壁爐裡有個暗格，上面有4位數密碼鎖。</p>
    <div class="puzzle-input"><input type="text" maxlength="1" id="fp1" inputmode="numeric"><input type="text" maxlength="1" id="fp2" inputmode="numeric"><input type="text" maxlength="1" id="fp3" inputmode="numeric"><input type="text" maxlength="1" id="fp4" inputmode="numeric"></div>
    <button onclick="checkFireplace()">確認</button>`);
}
function checkFireplace() {
  const code = ['fp1','fp2','fp3','fp4'].map(id=>document.getElementById(id).value).join('');
  if (code==='2417') { solvePuzzle('1-5'); addItem('moonPowder'); closeModal(); renderRoom1(); }
  else { showMessage('不對...'); }
}

function puzzle1_6() {
  if (isSolved('1-6')) return;
  if (state.selectedItem==='sunPotion') {
    solvePuzzle('1-6'); removeItem('sunPotion'); closeModal();
    showModal('<h3>花朵綻放了！</h3><p>花心裡藏著最後一顆魔法星星！</p>');
    renderRoom1(); setTimeout(()=>checkEndGame(),1500);
  } else { showModal('<h3>小花盆</h3><p>窗台上的小花緊閉著花瓣。</p>'); }
}

// ===== ROOM 2 RENDERING =====
function renderRoom2() {
  const room = document.getElementById('room2');
  room.innerHTML = `
    <div id="star-counter">⭐ ${state.stars}/6</div>
    <div class="r2-floor"></div>
    <div class="r2-cauldron"><div class="r2-pot-rim"></div><div class="r2-pot"></div><div class="r2-flame"><div class="r2-flame-inner"></div></div><div class="r2-steam"><div class="r2-steam-puff" style="left:20%"></div><div class="r2-steam-puff" style="left:50%;animation-delay:0.7s"></div><div class="r2-steam-puff" style="left:80%;animation-delay:1.4s"></div></div></div>
    <div class="r2-recipe"><div class="r2-paper" style="top:5%;left:5%;transform:rotate(-2deg)"></div><div class="r2-paper" style="top:10%;left:30%;transform:rotate(1deg)"></div></div>
    <div class="r2-musicbox"><div class="r2-box-lid"></div><div class="r2-box"></div><div class="r2-handle"></div></div>
    <div class="r2-cabinet"><div class="r2-cab-door"></div><div class="r2-cab-door2"></div><div class="r2-cab-lock"></div></div>
    <div class="r2-owl"><div class="r2-owl-frame"><div class="r2-owl-body"><div class="r2-owl-eye left"></div><div class="r2-owl-eye right"></div></div></div></div>
    <div class="r2-bottles"><div class="r2-rack"></div><div class="r2-bottle" style="left:5%;height:35%;width:10%;background:#e74c3c;bottom:30%"></div><div class="r2-bottle" style="left:18%;height:30%;width:10%;background:#e67e22;bottom:30%"></div><div class="r2-bottle" style="left:31%;height:33%;width:10%;background:#f1c40f;bottom:30%"></div><div class="r2-bottle" style="left:44%;height:28%;width:10%;background:#27ae60;bottom:30%"></div><div class="r2-bottle" style="left:57%;height:32%;width:10%;background:#2980b9;bottom:30%"></div><div class="r2-bottle" style="left:70%;height:30%;width:10%;background:#34495e;bottom:30%"></div><div class="r2-bottle" style="left:83%;height:34%;width:10%;background:#9b59b6;bottom:30%"></div></div>
    <div class="r2-scale"><div class="r2-scale-pole"></div><div class="r2-scale-beam"></div><div class="r2-scale-pan left"></div><div class="r2-scale-pan right"></div><div class="r2-scale-base"></div></div>
    <div class="r2-crystal"></div>
    <div class="r2-door"></div>
    <div class="r2-shelf"><div class="r2-shelf-row" style="top:30%"></div><div class="r2-shelf-row" style="top:60%"></div></div>
    <div class="hotspot" style="left:35%;top:42%;width:22%;height:30%" onclick="puzzle2_5()"></div>
    <div class="hotspot" style="left:22%;top:5%;width:14%;height:22%" onclick="showRecipeWall()"></div>
    <div class="hotspot" style="right:22%;top:10%;width:12%;height:16%" onclick="puzzle2_1()"></div>
    <div class="hotspot" style="right:3%;top:12%;width:16%;height:45%" onclick="puzzle2_4()"></div>
    <div class="hotspot" style="left:42%;top:3%;width:12%;height:18%" onclick="puzzle2_2()"></div>
    <div class="hotspot" style="left:3%;top:50%;width:18%;height:22%" onclick="puzzle2_3()"></div>
    <div class="hotspot" style="right:8%;top:55%;width:14%;height:22%" onclick="puzzle2_6()"></div>
    <div class="hotspot" style="left:60%;top:58%;width:10%;height:10%" onclick="clickCrystalBall()"></div>
    <div class="hotspot" style="left:2%;top:35%;width:10%;height:38%" onclick="switchRoom(1)"></div>
    <div class="hotspot" style="left:3%;top:10%;width:16%;height:25%" onclick="clickIngredients()"></div>
  `;
}

function clickCrystalBall() { showModal('<h3>水晶球</h3><p>透過水晶球，你隱約看到另一個房間的掛鐘...指針停住了。</p>'); }
function clickIngredients() { showModal('<h3>食材架</h3><p>各種魔法材料整齊排列著。</p>'); }
function showRecipeWall() {
  const has = hasItem('recipePage');
  showModal(`<h3>配方牆</h3><div class="diary-page"><p>☀️ 陽光藥水：</p><p>1. ${has?'火種點燃':'???'}</p><p>2. ${has?'加入彩虹露':'加入 ???'}</p><p>3. ${has?'加入星塵粉':'加入 ???'}</p><p>4. ${has?'加入月光粉':'加入 ???'}</p><p>5. ${has?'攪拌匙攪拌3次':'??? 攪拌?次'}</p></div>`);
}

function puzzle2_1() {
  if (isSolved('2-1')) return;
  showModal(`<h3>音樂盒</h3><p>你轉動把手，旋律響起，彩色按鈕依序亮起：</p>
    <p style="text-align:center;font-size:20px;"><span style="color:#ff4444;">●</span> → <span style="color:#4444ff;">●</span> → <span style="color:#ffd700;">●</span></p>
    <p>底部有個小抽屜，上面有四個按鈕。</p>
    <div id="rhythm-btns" style="display:flex;gap:10px;justify-content:center;margin:15px 0;">
      <button class="symbol-btn" onclick="rhythmPress(0)" id="rb0">♪</button>
      <button class="symbol-btn" onclick="rhythmPress(1)" id="rb1">♪</button>
      <button class="symbol-btn" onclick="rhythmPress(2)" id="rb2">♪</button>
      <button class="symbol-btn" onclick="rhythmPress(3)" id="rb3">♪</button>
    </div><p style="font-size:11px;color:#888;">點擊切換：短(♪)/長(♩)</p>
    <button onclick="checkRhythm()">確認</button>`);
}
let rhythmState=[0,0,0,0];
function rhythmPress(idx){rhythmState[idx]=1-rhythmState[idx];document.getElementById('rb'+idx).textContent=rhythmState[idx]?'♩':'♪';document.getElementById('rb'+idx).classList.toggle('active',rhythmState[idx]);}
function checkRhythm(){
  if(rhythmState[0]===1&&rhythmState[1]===0&&rhythmState[2]===0&&rhythmState[3]===1){state.musicBoxPlayed=true;solvePuzzle('2-1');addItem('stirrer');closeModal();renderRoom2();}
  else{showMessage('不對...');rhythmState=[0,0,0,0];}
}

function puzzle2_2() {
  if (isSolved('2-2')) return;
  showModal(`<h3>貓頭鷹掛畫</h3><p>貓頭鷹的兩隻眼睛可以旋轉。旁邊牆上貼著一張小紙條。</p>
    <p style="color:#aaa;font-size:12px;font-style:italic;">紙條：「左眼月亮，右眼星星」</p>
    <div style="display:flex;gap:20px;justify-content:center;margin:15px 0;">
      <div><p>左眼</p><button class="symbol-btn" id="owl-left" onclick="rotateOwlEye('left')">☀️</button></div>
      <div><p>右眼</p><button class="symbol-btn" id="owl-right" onclick="rotateOwlEye('right')">☀️</button></div>
    </div><button onclick="checkOwl()">確認</button>`);
}
const owlEyes=['☀️','🌙','⭐','💧'];
let owlLeft=0,owlRight=0;
function rotateOwlEye(side){if(side==='left'){owlLeft=(owlLeft+1)%4;document.getElementById('owl-left').textContent=owlEyes[owlLeft];}else{owlRight=(owlRight+1)%4;document.getElementById('owl-right').textContent=owlEyes[owlRight];}}
function checkOwl(){if(owlLeft===1&&owlRight===2){solvePuzzle('2-2');addItem('rainbowDew');closeModal();renderRoom2();}else{showMessage('不對...');}}

function puzzle2_3() {
  if (isSolved('2-3')) return;
  if (!state._bottleOrder) state._bottleOrder=[3,5,6,1,4,0,2];
  const colors=[{name:'紫',color:'#9b59b6'},{name:'綠',color:'#27ae60'},{name:'藍',color:'#2980b9'},{name:'紅',color:'#e74c3c'},{name:'靛',color:'#34495e'},{name:'橙',color:'#e67e22'},{name:'黃',color:'#f1c40f'}];
  showModal(`<h3>彩色瓶子</h3><p>架子上的瓶子被打亂了。牆上有張褪色的圖暗示了正確順序。</p>
    <div class="bottle-rack" id="bottle-rack"></div><p style="font-size:11px;color:#888;">點擊兩個瓶子交換位置</p>
    <button onclick="checkBottles()">確認</button>`);
  renderBottles(colors);
}
let bottleSelected=-1;
function renderBottles(colors){
  const rack=document.getElementById('bottle-rack');if(!rack)return;
  const c=colors||[{name:'紫',color:'#9b59b6'},{name:'綠',color:'#27ae60'},{name:'藍',color:'#2980b9'},{name:'紅',color:'#e74c3c'},{name:'靛',color:'#34495e'},{name:'橙',color:'#e67e22'},{name:'黃',color:'#f1c40f'}];
  rack.innerHTML='';
  state._bottleOrder.forEach((ci,idx)=>{const b=document.createElement('div');b.className='bottle'+(bottleSelected===idx?' sel':'');b.style.background=c[ci].color;b.textContent=c[ci].name;b.onclick=()=>{if(bottleSelected===-1)bottleSelected=idx;else{const t=state._bottleOrder[bottleSelected];state._bottleOrder[bottleSelected]=state._bottleOrder[idx];state._bottleOrder[idx]=t;bottleSelected=-1;}renderBottles(c);};rack.appendChild(b);});
}
function checkBottles(){
  if(JSON.stringify(state._bottleOrder)==='[3,5,6,1,2,4,0]'){state.bottlesSorted=true;solvePuzzle('2-3');addItem('starDust');closeModal();showMessage('排列正確！');renderRoom2();}
  else{showMessage('不對...');bottleSelected=-1;}
}

function puzzle2_4() {
  if (isSolved('2-4')) return;
  showModal(`<h3>櫥櫃</h3><p>櫥櫃上了鎖，有3位數密碼。</p>
    <div class="puzzle-input"><input type="text" maxlength="1" id="cb1" inputmode="numeric"><input type="text" maxlength="1" id="cb2" inputmode="numeric"><input type="text" maxlength="1" id="cb3" inputmode="numeric"></div>
    <button onclick="checkCabinet()">確認</button>`);
}
function checkCabinet(){const code=['cb1','cb2','cb3'].map(id=>document.getElementById(id).value).join('');if(code==='945'){markSolved('2-4');addItem('magicFire');closeModal();showMessage('櫥櫃打開了！');renderRoom2();}else{showMessage('不對...');}}

function puzzle2_5() {
  if (isSolved('2-5')) { showModal('<h3>大鍋</h3><p>鍋裡殘留著金色的光芒。</p>'); return; }
  const pb=state.potionBrewing;
  const steps=[{key:'fire',item:'magicFire',label:'🔥',done:pb.fire},{key:'rainbow',item:'rainbowDew',label:'🌈',done:pb.rainbow},{key:'stardust',item:'starDust',label:'✨',done:pb.stardust},{key:'moonlight',item:'moonPowder',label:'🌙',done:pb.moonlight}];
  const next=steps.find(s=>!s.done);const allIn=steps.every(s=>s.done);
  let html=`<h3>大鍋</h3><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:10px 0;">`;
  steps.forEach(s=>{html+=`<span style="padding:6px 10px;border-radius:6px;background:${s.done?'rgba(255,215,0,0.2)':'rgba(255,255,255,0.05)'};border:1px ${s.done?'solid':'dashed'} ${s.done?'#ffd700':'#555'};font-size:18px;">${s.label}${s.done?' ✓':''}</span>`;});
  html+=`</div>`;
  if(!allIn&&next){if(state.selectedItem===next.item)html+=`<button onclick="addToCauldron('${next.key}','${next.item}')">放入</button>`;else html+=`<p style="color:#888;font-size:13px;">鍋裡似乎還需要什麼...</p>`;}
  else if(allIn){html+=`<p>已攪拌：${pb.stirCount}/3</p>`;if(state.selectedItem==='stirrer')html+=`<button onclick="stirCauldron()">攪拌</button>`;else html+=`<p style="color:#888;font-size:13px;">需要用什麼來攪拌...</p>`;}
  showModal(html);
}
function addToCauldron(key,itemId){state.potionBrewing[key]=true;removeItem(itemId);closeModal();puzzle2_5();}
function stirCauldron(){state.potionBrewing.stirCount++;if(state.potionBrewing.stirCount>=3){markSolved('2-5');addItem('sunPotion');removeItem('stirrer');closeModal();showModal('<h3>藥水完成！</h3><p>大鍋中冒出金色光芒...</p>');renderRoom2();}else{closeModal();showMessage(`攪拌 ${state.potionBrewing.stirCount}/3`);puzzle2_5();}}

function puzzle2_6() {
  if (isSolved('2-6')) return;
  if (state.selectedItem==='magicWeight'){markSolved('2-6');removeItem('magicWeight');addItem('scroll');closeModal();showModal('<h3>天秤平衡了！</h3><p>底座打開，裡面有一卷古老的卷軸。</p>');renderRoom2();saveGame();setTimeout(()=>checkEndGame(),1500);}
  else{showModal('<h3>天秤</h3><p>天秤一邊放著神秘寶石，另一邊空著。需要放上等重的東西。</p>');}
}

// ===== INITIALIZATION =====
function initGame(){renderRoom1();renderRoom2();renderInventory();updateStarCounter();if(state.doorOpen)document.getElementById('btn-room2').disabled=false;switchRoom(state.currentRoom);}
document.addEventListener('DOMContentLoaded',()=>{
  if(hasSave())document.getElementById('btn-load').classList.remove('hidden');
  document.getElementById('btn-start').onclick=()=>{state=defaultState();document.getElementById('start-screen').classList.add('hidden');initGame();};
  document.getElementById('btn-load').onclick=()=>{loadGame();document.getElementById('start-screen').classList.add('hidden');initGame();};
  document.getElementById('btn-restart').onclick=()=>{localStorage.removeItem('magicEscape_save');state=defaultState();document.getElementById('end-screen').classList.add('hidden');document.getElementById('start-screen').classList.remove('hidden');};
  document.getElementById('btn-room1').onclick=()=>switchRoom(1);
  document.getElementById('btn-room2').onclick=()=>switchRoom(2);
  document.getElementById('btn-hint').onclick=showHint;
  document.getElementById('btn-save').onclick=saveGame;
  document.getElementById('modal-close').onclick=closeModal;
  document.getElementById('overlay').onclick=closeModal;
  document.getElementById('scene-area').addEventListener('click',(e)=>{if(e.target.classList.contains('room')){if(state.selectedItem){state.selectedItem=null;renderInventory();}}});
});
