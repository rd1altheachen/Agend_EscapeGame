// ===== THREE.JS 3D SCENE - Wall-facing camera system =====
let renderer, camera, scene1, scene2, currentScene;
let raycaster, mouse;
let interactables1 = {north:[],east:[],south:[],west:[]};
let interactables2 = {north:[],east:[],south:[],west:[]};
let currentView = 'north'; // north, east, south, west
const VIEWS = ['north','east','south','west'];
let wallGroups1 = {}, wallGroups2 = {};

// Camera targets for each view direction (looking at wall from center)
const CAM_TARGETS = {
  north: { x:0, y:1.6, z:-3.5 },
  east:  { x:3.5, y:1.6, z:0 },
  south: { x:0, y:1.6, z:3.5 },
  west:  { x:-3.5, y:1.6, z:0 }
};

function initThree() {
  const container = document.getElementById('scene-area');
  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.insertBefore(renderer.domElement, container.firstChild);

  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.5, 100);
  camera.position.set(0, 1.6, 0);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  scene1 = buildRoom1();
  scene2 = buildRoom2();
  // Disable frustum culling for iOS compatibility (camera inside room)
  [scene1, scene2].forEach(s => s.traverse(child => { if(child.isMesh) child.frustumCulled = false; }));
  currentScene = scene1;
  setView('north');

  animate();

  window.addEventListener('resize', onResize);
  setTimeout(onResize, 100);

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);

  // Arrow buttons
  document.getElementById('arrow-left').addEventListener('click', () => rotateView(-1));
  document.getElementById('arrow-right').addEventListener('click', () => rotateView(1));
}

function onResize() {
  const container = document.getElementById('scene-area');
  const w = container.clientWidth, h = container.clientHeight;
  if (w === 0 || h === 0) return;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(currentScene, camera);
}

function setView(dir) {
  currentView = dir;
  const t = CAM_TARGETS[dir];
  camera.position.set(0, 1.6, 0);
  camera.lookAt(t.x, t.y, t.z);
  // Show/hide wall groups
  const groups = currentScene === scene1 ? wallGroups1 : wallGroups2;
  VIEWS.forEach(v => { if (groups[v]) groups[v].visible = (v === dir); });
}

function rotateView(direction) {
  const idx = VIEWS.indexOf(currentView);
  const next = VIEWS[(idx + direction + 4) % 4];
  setView(next);
}

function switchScene(roomNum) {
  currentScene = roomNum === 1 ? scene1 : scene2;
  setView('north');
}

function onPointerMove(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const list = currentScene === scene1 ? interactables1[currentView] : interactables2[currentView];
  const hits = raycaster.intersectObjects(list, true);
  renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'default';
}

function onPointerDown(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const list = currentScene === scene1 ? interactables1[currentView] : interactables2[currentView];
  const hits = raycaster.intersectObjects(list, true);
  if (hits.length > 0) {
    let obj = hits[0].object;
    while (obj && !obj.userData.action) obj = obj.parent;
    if (obj && obj.userData.action) obj.userData.action();
  } else {
    if (state.selectedItem) { state.selectedItem = null; renderInventory(); }
  }
}

function mat(color) { return new THREE.MeshBasicMaterial({ color }); }


// ===== ROOM 1: Starry Study =====
function buildRoom1() {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x0a1030);
  s.add(new THREE.AmbientLight(0xffffff, 2.2));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(2, 5, 2); s.add(dir);

  // Floor
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(8,0.1,8), mat(0x5a4030));_m.position.set(0,-0.05,0);return _m;})());

  // 4 walls (always visible as backdrop)
  const wm = mat(0x2a3a6a);
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(8,5,0.15), wm.clone());_m.position.set(0,2.5,-4);return _m;})());
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.15,5,8), wm.clone());_m.position.set(-4,2.5,0);return _m;})());
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.15,5,8), wm.clone());_m.position.set(4,2.5,0);return _m;})());
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(8,5,0.15), wm.clone());_m.position.set(0,2.5,4);return _m;})());

  // --- NORTH wall group: clock, fireplace ---
  const north = new THREE.Group();
  // Clock
  const clock = new THREE.Group(); clock.userData.action = () => clickClock();
  clock.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.1,24), mat(0xeeeeee));_m.rotation.set(Math.PI/2,0,0);return _m;})());
  clock.add(new THREE.Mesh(new THREE.TorusGeometry(0.5,0.06,8,24), mat(0xb8860b)));
  // hands
  const h1 = new THREE.Mesh(new THREE.BoxGeometry(0.03,0.3,0.03), mat(0x333333));
  h1.position.set(0,0.1,0.06); clock.add(h1);
  const h2 = new THREE.Mesh(new THREE.BoxGeometry(0.02,0.4,0.02), mat(0x333333));
  h2.position.set(0.05,-0.1,0.06); h2.rotation.z = -Math.PI/6; clock.add(h2);
  clock.position.set(0, 3, -3.8);
  north.add(clock); interactables1.north.push(clock);
  // Fireplace
  const fp = new THREE.Group(); fp.userData.action = () => puzzle1_5();
  fp.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(2,1.8,0.6), mat(0x8b4513));_m.position.set(0,0.9,0);return _m;})());
  fp.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(1,1,0.4), mat(0x1a0a0a));_m.position.set(0,0.5,0.15);return _m;})());
  // fire glow
  fp.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.3,8,6), mat(0xff4400));_m.position.set(0,0.3,0.1);return _m;})());
  fp.position.set(0, 0, -3.6);
  north.add(fp); interactables1.north.push(fp);
  s.add(north); wallGroups1.north = north;

  // --- WEST wall group: bookshelf, mirror ---
  const west = new THREE.Group();
  // Bookshelf
  const shelf = new THREE.Group(); shelf.userData.action = () => clickBookshelf();
  shelf.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.6,3,2), mat(0x4a3222));_m.position.set(0,1.5,0);return _m;})());
  const bookColors = [0xc0392b,0x2980b9,0x27ae60,0x8e44ad,0xd4ac0d,0x1a5276,0x6c3483,0x148f77,0x922b21,0xb7950b];
  for(let row=0;row<3;row++){
    for(let i=0;i<5;i++){
      const bk = new THREE.Mesh(new THREE.BoxGeometry(0.4,0.12+Math.random()*0.15,0.35), mat(bookColors[(row*5+i)%10]));
      bk.position.set(0.08, 0.5+row*0.9, -0.7+i*0.35);
      shelf.add(bk);
    }
  }
  shelf.position.set(-3.6, 0, 0);
  west.add(shelf); interactables1.west.push(shelf);
  // Mirror
  const mirror = new THREE.Group(); mirror.userData.action = () => puzzle1_1();
  mirror.add(new THREE.Mesh(new THREE.TorusGeometry(0.55,0.08,8,24), mat(0xb8860b)));
  mirror.add(new THREE.Mesh(new THREE.CircleGeometry(0.55,24), new THREE.MeshBasicMaterial({color:0x4444aa})));
  mirror.rotation.y = Math.PI/2;
  mirror.position.set(-3.8, 2.5, -2);
  west.add(mirror); interactables1.west.push(mirror);
  s.add(west); wallGroups1.west = west;

  // --- EAST wall group: constellation, magic door ---
  const east = new THREE.Group();
  // Constellation
  const con = new THREE.Group(); con.userData.action = () => puzzle1_4();
  con.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.4,0.3,12), mat(0xb8860b));_m.position.set(0,0.15,0);return _m;})());
  con.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1.2,8), mat(0x8b6914));_m.position.set(0,0.9,0);return _m;})());
  con.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.45,16,12), new THREE.MeshBasicMaterial({color:0x1a1a4a,wireframe:true}));_m.position.set(0,1.8,0);return _m;})());
  con.position.set(3.3, 0, -1.5);
  east.add(con); interactables1.east.push(con);
  // Door
  const door = new THREE.Group(); door.userData.action = () => puzzle1_3();
  door.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.12,2.8,1.4), mat(0x6a3a8a));_m.position.set(0,1.4,0);return _m;})());
  door.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.08,2.6,1.2), mat(0x2a1a3a));_m.position.set(0.02,1.4,0);return _m;})());
  // Runes
  door.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,8), mat(0xffd700));_m.position.set(0.05,1.8,0);return _m;})());
  door.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,8), mat(0xffd700));_m.position.set(0.05,1.5,0.3);return _m;})());
  door.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,8), mat(0xffd700));_m.position.set(0.05,1.5,-0.3);return _m;})());
  door.position.set(3.85, 0, 1);
  east.add(door); interactables1.east.push(door);
  s.add(east); wallGroups1.east = east;

  // --- SOUTH wall group: desk, flower pot ---
  const south = new THREE.Group();
  // Desk
  const desk = new THREE.Group(); desk.userData.action = () => puzzle1_2();
  desk.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(2,0.12,1), mat(0x5a3d2b));_m.position.set(0,1,0);return _m;})());
  const lg = new THREE.Mesh(new THREE.BoxGeometry(0.1,1,0.1), mat(0x3d2b1f));
  desk.add((function(){const _m=lg.clone();_m.position.set(-0.8,0.5,-0.4);return _m;})());
  desk.add((function(){const _m=lg.clone();_m.position.set(0.8,0.5,-0.4);return _m;})());
  desk.add((function(){const _m=lg.clone();_m.position.set(-0.8,0.5,0.4);return _m;})());
  desk.add((function(){const _m=lg.clone();_m.position.set(0.8,0.5,0.4);return _m;})());
  desk.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.06,0.35), mat(0x8b4513));_m.position.set(-0.3,1.08,0);return _m;})());
  desk.position.set(0, 0, 2.5);
  south.add(desk); interactables1.south.push(desk);
  // Flower pot
  const flower = new THREE.Group(); flower.userData.action = () => puzzle1_6();
  flower.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.15,0.35,12), mat(0x8b4513));_m.position.set(0,0.18,0);return _m;})());
  flower.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.22,8,8), mat(0x2d8a2d));_m.position.set(0,0.45,0);return _m;})());
  flower.position.set(-2, 0, 3);
  south.add(flower); interactables1.south.push(flower);
  // Carpet
  south.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,0.04,24), mat(0x6a1a1a));_m.position.set(0,0.02,2);return _m;})());
  s.add(south); wallGroups1.south = south;

  return s;
}

// ===== ROOM 2: Potion Kitchen =====
function buildRoom2() {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x2a1a10);
  s.add(new THREE.AmbientLight(0xffffff, 2.2));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(-2,5,2); s.add(dir);
  s.add((function(){const l=new THREE.PointLight(0xff8800,0.6,10);l.position.set(0,1,0);return l;})());

  // Floor
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(8,0.1,8), mat(0x666666));_m.position.set(0,-0.05,0);return _m;})());

  // 4 walls
  const wm = mat(0x8b5a30);
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(8,5,0.15), wm.clone());_m.position.set(0,2.5,-4);return _m;})());
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.15,5,8), wm.clone());_m.position.set(-4,2.5,0);return _m;})());
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.15,5,8), wm.clone());_m.position.set(4,2.5,0);return _m;})());
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(8,5,0.15), wm.clone());_m.position.set(0,2.5,4);return _m;})());

  // --- NORTH: owl painting, recipe wall ---
  const north = new THREE.Group();
  // Owl painting
  const owl = new THREE.Group(); owl.userData.action = () => puzzle2_2();
  owl.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(1,1.2,0.08), mat(0xb8860b));_m.position.set(0,0,0);return _m;})());
  owl.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.8,1,0.06), mat(0x2a2a1a));_m.position.set(0,0,0.02);return _m;})());
  owl.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8), mat(0xffd700));_m.position.set(-0.15,0.15,0.05);return _m;})());
  owl.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8), mat(0xffd700));_m.position.set(0.15,0.15,0.05);return _m;})());
  owl.position.set(-1, 2.8, -3.8);
  north.add(owl); interactables2.north.push(owl);
  // Recipe papers
  const recipe = new THREE.Group(); recipe.userData.action = () => showRecipeWall();
  recipe.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.9,0.02), mat(0xf5e6c8));_m.position.set(0,0,0);return _m;})());
  recipe.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.7,0.02), mat(0xf5e6c8));_m.position.set(0.8,0.1,0);return _m;})());
  recipe.position.set(1.5, 2.2, -3.85);
  north.add(recipe); interactables2.north.push(recipe);
  s.add(north); wallGroups2.north = north;

  // --- WEST: bottles, crystal ball, door ---
  const west = new THREE.Group();
  // Bottles rack
  const bottles = new THREE.Group(); bottles.userData.action = () => puzzle2_3();
  bottles.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.12,2,2), mat(0x4a3222));_m.position.set(0,1,0);return _m;})());
  const bColors = [0xe74c3c,0xe67e22,0xf1c40f,0x27ae60,0x2980b9,0x34495e,0x9b59b6];
  bColors.forEach((c,i) => {
    const b=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.35,8), mat(c));b.position.set(0.1,1.3,-0.75+i*0.25);bottles.add(b);
  });
  bottles.position.set(-3.7, 0, 1);
  west.add(bottles); interactables2.west.push(bottles);
  // Crystal ball
  const crystal = new THREE.Group(); crystal.userData.action = () => clickCrystalBall();
  crystal.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.08,0.5), mat(0x4a3222));_m.position.set(0,0.9,0);return _m;})());
  crystal.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.9,0.06), mat(0x3d2b1f));_m.position.set(-0.3,0.45,0);return _m;})());
  crystal.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.9,0.06), mat(0x3d2b1f));_m.position.set(0.3,0.45,0);return _m;})());
  crystal.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.12,0.12,8), mat(0x4a3222));_m.position.set(0,1.0,0);return _m;})());
  crystal.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.25,16,12), new THREE.MeshBasicMaterial({color:0x9966ff,transparent:true,opacity:0.6}));_m.position.set(0,1.25,0);return _m;})());
  crystal.position.set(-3, 0, -1.5);
  west.add(crystal); interactables2.west.push(crystal);
  // Door
  const door = new THREE.Group(); door.userData.action = () => switchRoom(1);
  door.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.12,2.6,1.3), mat(0x6a3a8a));_m.position.set(0,1.3,0);return _m;})());
  door.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.08,2.4,1.1), mat(0x2a1a3a));_m.position.set(0.02,1.3,0);return _m;})());
  door.position.set(-3.85, 0, -0.5);
  west.add(door); interactables2.west.push(door);
  s.add(west); wallGroups2.west = west;

  // --- EAST: music box, cabinet ---
  const east = new THREE.Group();
  // Music box
  const mbox = new THREE.Group(); mbox.userData.action = () => puzzle2_1();
  mbox.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.08,0.5), mat(0x4a3222));_m.position.set(0,1.5,0);return _m;})());
  mbox.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.3,0.3), mat(0x6b3a1a));_m.position.set(0,1.72,0);return _m;})());
  const handle=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.2,6), mat(0xb8860b));handle.position.set(0.25,1.72,0);handle.rotation.set(0,0,Math.PI/2);mbox.add(handle);
  mbox.position.set(3.3, 0, -1.5);
  east.add(mbox); interactables2.east.push(mbox);
  // Cabinet
  const cab = new THREE.Group(); cab.userData.action = () => puzzle2_4();
  cab.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.7,2.8,1.4), mat(0x5a3d2b));_m.position.set(0,1.4,0);return _m;})());
  cab.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.08,0.08), mat(0xb8860b));_m.position.set(0.36,1.4,0);return _m;})());
  cab.position.set(3.3, 0, 1);
  east.add(cab); interactables2.east.push(cab);
  s.add(east); wallGroups2.east = east;

  // --- SOUTH: cauldron, scale ---
  const south = new THREE.Group();
  // Cauldron
  const cauldron = new THREE.Group(); cauldron.userData.action = () => puzzle2_5();
  const bowl=new THREE.Mesh(new THREE.SphereGeometry(0.7,16,12,0,Math.PI*2,0,Math.PI/2), mat(0x1a1a1a));bowl.position.set(0,0.9,0);bowl.rotation.set(Math.PI,0,0);cauldron.add(bowl);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(0.7,0.06,8,24), mat(0x333333));rim.position.set(0,0.9,0);rim.rotation.set(Math.PI/2,0,0);cauldron.add(rim);
  for(let i=0;i<3;i++){const a=(i/3)*Math.PI*2;const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.6,6), mat(0x333333));leg.position.set(Math.cos(a)*0.5,0.3,Math.sin(a)*0.5);cauldron.add(leg);}
  // Fire under
  cauldron.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.25,8,6), mat(0xff6600));_m.position.set(0,0.15,0);return _m;})());
  cauldron.position.set(0, 0, 2.5);
  south.add(cauldron); interactables2.south.push(cauldron);
  // Scale
  const scale = new THREE.Group(); scale.userData.action = () => puzzle2_6();
  scale.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.35,0.12,12), mat(0xb8860b));_m.position.set(0,0.06,0);return _m;})());
  scale.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,1.1,8), mat(0x8b6914));_m.position.set(0,0.6,0);return _m;})());
  scale.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.05,0.05), mat(0xb8860b));_m.position.set(0,1.15,0);return _m;})());
  // Pans
  scale.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.04,12), mat(0x8b6914));_m.position.set(-0.5,1.0,0);return _m;})());
  scale.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.04,12), mat(0x8b6914));_m.position.set(0.5,1.0,0);return _m;})());
  scale.position.set(2, 0, 2.5);
  south.add(scale); interactables2.south.push(scale);
  s.add(south); wallGroups2.south = south;

  return s;
}
