// ===== GAME STATE =====
const defaultState = () => ({
  currentRoom: 1,
  doorOpen: false,
  stars: 0,
  solvedPuzzles: [],
  inventory: [],
  selectedItem: null,
  carpetLifted: false, // unused legacy
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
  starChart: { name: '星座對照表', icon: '📜' },
  recipePage: { name: '藥水配方殘頁', icon: '📄' },
  crystalKey: { name: '水晶鑰匙', icon: '🔑' },
  spellBook: { name: '咒語書', icon: '📕' },
  stirrer: { name: '攪拌匙', icon: '🥄' },
  rainbowDew: { name: '彩虹露', icon: '🌈' },
  starDust: { name: '星塵粉', icon: '✨' },
  magicWeight: { name: '魔法砝碼', icon: '⚖️' },
  moonPowder: { name: '月光粉', icon: '🌙' },
  sunPotion: { name: '陽光藥水', icon: '☀️' },
  magicFire: { name: '魔法火種', icon: '🔥' },
  scroll: { name: '畢業咒語卷軸', icon: '📜' }
};

// Visual item views
function showItemVisual(itemId) {
  const visuals = {
    starChart: `<div style="background:#f5e6c8;padding:20px;border-radius:8px;color:#333;">
      <table style="margin:auto;border-collapse:collapse;"><tr><td style="padding:8px;"><span style="display:inline-block;width:20px;height:20px;background:#e74c3c;border-radius:50%;"></span></td><td style="padding:8px;font-size:24px;">♌</td></tr>
      <tr><td style="padding:8px;"><span style="display:inline-block;width:20px;height:20px;background:#2980b9;border-radius:50%;"></span></td><td style="padding:8px;font-size:24px;">♒</td></tr>
      <tr><td style="padding:8px;"><span style="display:inline-block;width:20px;height:20px;background:#f1c40f;border-radius:50%;"></span></td><td style="padding:8px;font-size:24px;">♎</td></tr></table></div>`,
    recipePage: `<div style="background:#f5e6c8;padding:20px;border-radius:8px;color:#333;text-align:center;">
      <p style="font-size:24px;">🔥 → 🌈 → ✨ → 🌙 → 🥄×3</p></div>`,
    crystalKey: `<div style="text-align:center;font-size:64px;text-shadow:0 0 20px rgba(100,200,255,0.8);">🔑</div>`,
    spellBook: `<div style="background:#8b4513;padding:20px;border-radius:8px;color:#f5e6c8;text-align:center;">
      <p style="margin-bottom:10px;">📖 內頁：</p>
      <p>🔑 → ⬜⬛⬜</p>
      <p style="margin-top:8px;font-size:12px;">（鑰匙插中間孔）</p>
      <hr style="border-color:#a0522d;margin:10px 0;">
      <p style="font-style:italic;">✦ Aperio ✦</p></div>`,
    scroll: `<div style="background:#f5e6c8;padding:20px;border-radius:8px;color:#333;text-align:center;">
      <p style="font-size:11px;color:#888;">~卷軸~</p>
      <p style="font-size:18px;font-style:italic;margin:10px 0;">「Lumina Stella Aperio」</p></div>`,
  };
  const v = visuals[itemId];
  if (v) showModal(`<h3>${ITEMS[itemId].name}</h3>${v}`);
  else showModal(`<div style="text-align:center;font-size:64px;">${ITEMS[itemId].icon}</div><p style="text-align:center;">${ITEMS[itemId].name}</p>`);
}

// ===== HINTS (vague → slightly specific → clear but no direct answer) =====
const HINTS = {
  '1-1': ['這個房間裡有面鏡子...', '鏡中的世界和現實有什麼不同？', '仔細比對鏡中書架和現實書架的差異'],
  '1-2': ['書桌上有本日記，翻翻看', '日記裡的插圖和符號之間有什麼關聯？注意月亮的變化', '月亮從缺到圓的順序...對應的符號是什麼？'],
  '1-3': ['門上有凹槽，書架上也許還有東西沒拿', '你需要一把鑰匙和一本特別的書', '先用鑰匙點門，再用書點門'],
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
    slots.appendChild(el);
  });
}
function selectItem(itemId) {
  if (state.selectedItem === itemId) { showItemVisual(itemId); return; }
  state.selectedItem = itemId;
  renderInventory();
  showMessage(ITEMS[itemId].name);
}

// ===== SCENE SWITCHING =====
function switchRoom(roomNum) {
  if (roomNum === 2 && !state.doorOpen) { showMessage('門鎖著...'); return; }
  state.currentRoom = roomNum;
  switchScene(roomNum);
  document.getElementById('btn-room1').classList.toggle('active', roomNum === 1);
  document.getElementById('btn-room2').classList.toggle('active', roomNum === 2);
  saveGame();
}

function renderRoom1() { updateStarCounter(); }
function renderRoom2() { updateStarCounter(); }

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

// ===== ROOM 1 PUZZLE HANDLERS =====

function puzzle1_1() {
  if (isSolved('1-1')) return;
  if (!state.mirrorUsed) {
    state.mirrorUsed = true;
    showModal(`<div style="text-align:center;">
      <div style="width:100px;height:140px;margin:10px auto;border-radius:50%;border:4px solid #b8860b;background:radial-gradient(ellipse,#1a1a4a,#2a2a6a);display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(100,100,200,0.3);">
        <div style="display:flex;gap:2px;justify-content:center;flex-wrap:wrap;padding:8px;">
          <span style="display:inline-block;width:7px;height:18px;background:#8b4513;border-radius:1px;"></span>
          <span style="display:inline-block;width:7px;height:16px;background:#2e8b57;border-radius:1px;"></span>
          <span style="display:inline-block;width:7px;height:20px;background:#4169e1;border-radius:1px;"></span>
          <span style="display:inline-block;width:7px;height:17px;background:#ffd700;border-radius:1px;box-shadow:0 0 8px #ffd700;"></span>
          <span style="display:inline-block;width:7px;height:19px;background:#8b0000;border-radius:1px;"></span>
          <span style="display:inline-block;width:7px;height:15px;background:#4b0082;border-radius:1px;"></span>
        </div>
      </div></div>`);
  } else {
    showModal(`<div style="text-align:center;">
      <div style="width:100px;height:140px;margin:10px auto;border-radius:50%;border:4px solid #b8860b;background:radial-gradient(ellipse,#1a1a4a,#2a2a6a);display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px rgba(100,100,200,0.3);">
        <div style="display:flex;gap:2px;justify-content:center;flex-wrap:wrap;padding:8px;">
          <span style="display:inline-block;width:7px;height:18px;background:#8b4513;border-radius:1px;"></span>
          <span style="display:inline-block;width:7px;height:16px;background:#2e8b57;border-radius:1px;"></span>
          <span style="display:inline-block;width:7px;height:20px;background:#4169e1;border-radius:1px;"></span>
          <span style="display:inline-block;width:7px;height:17px;background:#ffd700;border-radius:1px;box-shadow:0 0 8px #ffd700;"></span>
          <span style="display:inline-block;width:7px;height:19px;background:#8b0000;border-radius:1px;"></span>
          <span style="display:inline-block;width:7px;height:15px;background:#4b0082;border-radius:1px;"></span>
        </div>
      </div></div>`);
  }
}

function clickBookshelf() {
  if (!state.mirrorUsed) { showModal('<h3>書架</h3><p>書架上擺滿了各種魔法書。書脊上有各種符號和文字。</p>'); return; }
  if (!isSolved('1-1')) {
    solvePuzzle('1-1'); addItem('starChart');
    showModal(`<h3>發現了！</h3><p>你找到了那本在鏡中發光的書。翻開後發現裡面夾著一張對照表。</p>`);
    renderRoom1(); return;
  }
  if (!hasItem('spellBook') && !isSolved('1-3') && isSolved('1-1')) {
    showModal('<h3>書架</h3><p>書架上有一本書散發著微弱的光芒...</p><button onclick="takeSpellBook()">取下那本書</button>');
    return;
  }
  showModal('<h3>書架</h3><p>書架上擺滿了各種魔法書。</p>');
}

function takeSpellBook() { addItem('spellBook'); closeModal(); }

function puzzle1_3() {
  if (state.doorOpen) { switchRoom(2); return; }
  if (state.selectedItem === 'spellBook' && state._keyInserted) {
    solvePuzzle('1-3'); state.doorOpen = true; removeItem('spellBook');
    document.getElementById('btn-room2').disabled = false; closeModal();
    showMessage('🚪 魔法門開啟了！'); renderRoom1(); return;
  }
  if (state.selectedItem === 'crystalKey') {
    state._keyInserted = true; removeItem('crystalKey'); closeModal();
    showModal('<h3>魔法門</h3><p>鑰匙插入了中間的凹槽。門上的符文微微亮起...</p>');
    renderRoom1(); return;
  }
  if (state._keyInserted) { showModal('<h3>魔法門</h3><p>鑰匙已插入中間凹槽，符文在等待什麼...</p>'); }
  else { showModal('<h3>魔法門</h3><p>門上有三個凹槽。門牢牢鎖著。</p>'); }
}

function puzzle1_2() {
  if (isSolved('1-2')) { showModal('<h3>書桌</h3><p>抽屜已經打開了。</p>'); return; }
  showModal(`<div class="diary-page" style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-around;padding:10px;">
        <div style="text-align:center;"><span style="font-size:30px;">🌕</span><br><span style="color:#666;">○</span></div>
        <div style="text-align:center;"><span style="font-size:30px;">🌑</span><br><span style="color:#666;">△</span></div>
        <div style="text-align:center;"><span style="font-size:30px;">🌓</span><br><span style="color:#666;">☆</span></div>
      </div>
    </div>
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

function clickClock() { showModal(`<div style="text-align:center;">
  <div style="width:80px;height:80px;margin:10px auto;border-radius:50%;border:3px solid #b8860b;background:#1a1a2a;position:relative;">
    <div style="position:absolute;top:50%;left:50%;width:2px;height:20px;background:#ffd700;transform-origin:bottom center;transform:translate(-50%,-100%) rotate(-90deg);"></div>
    <div style="position:absolute;top:50%;left:50%;width:1.5px;height:28px;background:#ffd700;transform-origin:bottom center;transform:translate(-50%,-100%) rotate(90deg);"></div>
    <div style="position:absolute;top:50%;left:50%;width:5px;height:5px;background:#ffd700;border-radius:50%;transform:translate(-50%,-50%);"></div>
  </div></div>`); }

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
    markSolved('1-4'); addItem('magicWeight'); closeModal(); renderRoom1();
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
  if (code==='2417') { markSolved('1-5'); addItem('moonPowder'); closeModal(); renderRoom1(); }
  else { showMessage('不對...'); }
}

function puzzle1_6() {
  if (isSolved('1-6')) return;
  if (state.selectedItem==='sunPotion') {
    markSolved('1-6'); removeItem('sunPotion'); closeModal();
    showModal('<h3>花朵綻放了！</h3>');
    renderRoom1(); setTimeout(()=>checkEndGame(),1500);
  } else { showModal('<h3>小花盆</h3><p>窗台上的小花緊閉著花瓣。</p>'); }
}

// ===== ROOM 2 PUZZLE HANDLERS =====

function clickCrystalBall() { showModal(`<div style="text-align:center;"><div style="width:70px;height:70px;margin:10px auto;border-radius:50%;background:radial-gradient(circle,rgba(150,100,255,0.2),rgba(50,0,100,0.4));border:2px solid #9966cc;box-shadow:0 0 12px rgba(150,100,255,0.3);display:flex;align-items:center;justify-content:center;"><div style="width:35px;height:35px;border-radius:50%;border:2px solid rgba(184,134,11,0.5);background:rgba(0,0,0,0.3);position:relative;"><div style="position:absolute;top:50%;left:50%;width:1.5px;height:10px;background:rgba(255,215,0,0.6);transform-origin:bottom center;transform:translate(-50%,-100%) rotate(-90deg);"></div><div style="position:absolute;top:50%;left:50%;width:1px;height:14px;background:rgba(255,215,0,0.6);transform-origin:bottom center;transform:translate(-50%,-100%) rotate(90deg);"></div></div></div></div>`); }
function clickIngredients() { showModal('<h3>食材架</h3>'); }
function showRecipeWall() {
  const has = hasItem('recipePage');
  showModal(`<div style="background:#f5e6c8;padding:15px;border-radius:4px;max-width:220px;margin:0 auto;text-align:center;">
    <div style="font-size:20px;border-bottom:1px solid #d4c4a0;padding-bottom:8px;margin-bottom:10px;">☀️</div>
    <div style="font-size:16px;line-height:2.2;color:#5a3d2b;">
      ${has?'🔥→🫕<br>🌈→<br>✨→<br>🌙→<br>🥄 ×3':'❓→🫕<br>❓→<br>❓→<br>❓→<br>❓ ×?'}
    </div></div>`);
}

function puzzle2_1() {
  if (isSolved('2-1')) return;
  showModal(`<h3>音樂盒</h3>
    <p style="text-align:center;font-size:20px;"><span style="color:#ff4444;">●</span> → <span style="color:#4444ff;">●</span> → <span style="color:#ffd700;">●</span></p>
    <div id="rhythm-btns" style="display:flex;gap:10px;justify-content:center;margin:15px 0;">
      <button class="symbol-btn" onclick="rhythmPress(0)" id="rb0">♪</button>
      <button class="symbol-btn" onclick="rhythmPress(1)" id="rb1">♪</button>
      <button class="symbol-btn" onclick="rhythmPress(2)" id="rb2">♪</button>
      <button class="symbol-btn" onclick="rhythmPress(3)" id="rb3">♪</button>
    </div><p style="font-size:11px;color:#888;">♪短 / ♩長</p>
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
  owlLeft=0; owlRight=0;
  showModal(`<h3>貓頭鷹掛畫</h3>
    <p style="color:#aaa;font-size:12px;font-style:italic;">「左眼月亮，右眼星星」</p>
    <div style="display:flex;gap:20px;justify-content:center;margin:15px 0;">
      <div><p>左</p><button class="symbol-btn" id="owl-left" onclick="rotateOwlEye('left')">☀️</button></div>
      <div><p>右</p><button class="symbol-btn" id="owl-right" onclick="rotateOwlEye('right')">☀️</button></div>
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
  showModal(`<h3>彩色瓶子</h3>
    <div class="bottle-rack" id="bottle-rack"></div><p style="font-size:11px;color:#888;">點擊交換</p>
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
  showModal(`<h3>櫥櫃</h3>
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
  if(!allIn&&next){if(state.selectedItem===next.item)html+=`<button onclick="addToCauldron('${next.key}','${next.item}')">放入</button>`;else html+=``;}
  else if(allIn){html+=`<p>${pb.stirCount}/3</p>`;if(state.selectedItem==='stirrer')html+=`<button onclick="stirCauldron()">攪拌</button>`;else html+=``;}
  showModal(html);
}
function addToCauldron(key,itemId){state.potionBrewing[key]=true;removeItem(itemId);closeModal();saveGame();puzzle2_5();}
function stirCauldron(){state.potionBrewing.stirCount++;if(state.potionBrewing.stirCount>=3){markSolved('2-5');addItem('sunPotion');removeItem('stirrer');closeModal();showModal('<h3>藥水完成！</h3><p>大鍋中冒出金色光芒...</p>');renderRoom2();}else{closeModal();showMessage(`攪拌 ${state.potionBrewing.stirCount}/3`);puzzle2_5();}}

function puzzle2_6() {
  if (isSolved('2-6')) return;
  if (state.selectedItem==='magicWeight'){markSolved('2-6');removeItem('magicWeight');addItem('scroll');closeModal();showModal('<h3>天秤平衡了！</h3><p>底座打開，裡面有一卷古老的卷軸。</p>');renderRoom2();saveGame();setTimeout(()=>checkEndGame(),1500);}
  else{showModal('<h3>天秤</h3>');}
}

// ===== INITIALIZATION =====
function initGame(){initThree();renderInventory();updateStarCounter();if(state.doorOpen)document.getElementById('btn-room2').disabled=false;switchScene(state.currentRoom);document.getElementById('btn-room1').classList.toggle('active',state.currentRoom===1);document.getElementById('btn-room2').classList.toggle('active',state.currentRoom===2);}
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
  document.getElementById('scene-area').addEventListener('click',(e)=>{if(e.target.tagName==='CANVAS'){/* handled by Three.js raycaster */}});
});
