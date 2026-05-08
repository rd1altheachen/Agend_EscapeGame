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
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.insertBefore(renderer.domElement, container.firstChild);

  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 1.6, 0);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  scene1 = buildRoom1();
  scene2 = buildRoom2();
  currentScene = scene1;
  setView('north');

  animate();

  window.addEventListener('resize', () => {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);

  // Arrow buttons
  document.getElementById('arrow-left').addEventListener('click', () => rotateView(-1));
  document.getElementById('arrow-right').addEventListener('click', () => rotateView(1));
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

function mat(color) { return new THREE.MeshStandardMaterial({ color }); }

// ===== ROOM 1: Starry Study =====
function buildRoom1() {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x1a2040);
  s.add(new THREE.AmbientLight(0xffffff, 1.8));
  const dir = new THREE.DirectionalLight(0xffd700, 0.6);
  dir.position.set(2, 5, 2); s.add(dir);

  // Floor
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(8,0.1,8), mat(0x3d2b1f)), {position: new THREE.Vector3(0,-0.05,0)}));

  // 4 walls (always visible as backdrop)
  const wm = mat(0x1a2550);
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(8,5,0.15), wm.clone()), {position: new THREE.Vector3(0,2.5,-4)}));
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.15,5,8), wm.clone()), {position: new THREE.Vector3(-4,2.5,0)}));
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.15,5,8), wm.clone()), {position: new THREE.Vector3(4,2.5,0)}));
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(8,5,0.15), wm.clone()), {position: new THREE.Vector3(0,2.5,4)}));

  // --- NORTH wall group: clock, fireplace ---
  const north = new THREE.Group();
  // Clock
  const clock = new THREE.Group(); clock.userData.action = () => clickClock();
  clock.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.5,0.1,24), mat(0xeeeeee)), {rotation: new THREE.Euler(Math.PI/2,0,0)}));
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
  fp.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(2,1.8,0.6), mat(0x8b4513)), {position: new THREE.Vector3(0,0.9,0)}));
  fp.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1,1,0.4), mat(0x1a0a0a)), {position: new THREE.Vector3(0,0.5,0.15)}));
  // fire glow
  fp.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.3,8,6), mat(0xff4400)), {position: new THREE.Vector3(0,0.3,0.1)}));
  fp.position.set(0, 0, -3.6);
  north.add(fp); interactables1.north.push(fp);
  s.add(north); wallGroups1.north = north;

  // --- WEST wall group: bookshelf, mirror ---
  const west = new THREE.Group();
  // Bookshelf
  const shelf = new THREE.Group(); shelf.userData.action = () => clickBookshelf();
  shelf.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.6,3,2), mat(0x4a3222)), {position: new THREE.Vector3(0,1.5,0)}));
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
  mirror.add(new THREE.Mesh(new THREE.CircleGeometry(0.55,24), new THREE.MeshStandardMaterial({color:0x4444aa,metalness:0.9,roughness:0.1})));
  mirror.rotation.y = Math.PI/2;
  mirror.position.set(-3.8, 2.5, -2);
  west.add(mirror); interactables1.west.push(mirror);
  s.add(west); wallGroups1.west = west;

  // --- EAST wall group: constellation, magic door ---
  const east = new THREE.Group();
  // Constellation
  const con = new THREE.Group(); con.userData.action = () => puzzle1_4();
  con.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.4,0.3,12), mat(0xb8860b)), {position: new THREE.Vector3(0,0.15,0)}));
  con.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1.2,8), mat(0x8b6914)), {position: new THREE.Vector3(0,0.9,0)}));
  con.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.45,16,12), new THREE.MeshStandardMaterial({color:0x1a1a4a,wireframe:true})), {position: new THREE.Vector3(0,1.8,0)}));
  con.position.set(3.3, 0, -1.5);
  east.add(con); interactables1.east.push(con);
  // Door
  const door = new THREE.Group(); door.userData.action = () => puzzle1_3();
  door.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.12,2.8,1.4), mat(0x6a3a8a)), {position: new THREE.Vector3(0,1.4,0)}));
  door.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.08,2.6,1.2), mat(0x2a1a3a)), {position: new THREE.Vector3(0.02,1.4,0)}));
  // Runes
  door.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.06,8,8), mat(0xffd700)), {position: new THREE.Vector3(0.05,1.8,0)}));
  door.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.06,8,8), mat(0xffd700)), {position: new THREE.Vector3(0.05,1.5,0.3)}));
  door.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.06,8,8), mat(0xffd700)), {position: new THREE.Vector3(0.05,1.5,-0.3)}));
  door.position.set(3.85, 0, 1);
  east.add(door); interactables1.east.push(door);
  s.add(east); wallGroups1.east = east;

  // --- SOUTH wall group: desk, flower pot ---
  const south = new THREE.Group();
  // Desk
  const desk = new THREE.Group(); desk.userData.action = () => puzzle1_2();
  desk.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(2,0.12,1), mat(0x5a3d2b)), {position: new THREE.Vector3(0,1,0)}));
  const lg = new THREE.Mesh(new THREE.BoxGeometry(0.1,1,0.1), mat(0x3d2b1f));
  desk.add(Object.assign(lg.clone(), {position: new THREE.Vector3(-0.8,0.5,-0.4)}));
  desk.add(Object.assign(lg.clone(), {position: new THREE.Vector3(0.8,0.5,-0.4)}));
  desk.add(Object.assign(lg.clone(), {position: new THREE.Vector3(-0.8,0.5,0.4)}));
  desk.add(Object.assign(lg.clone(), {position: new THREE.Vector3(0.8,0.5,0.4)}));
  desk.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.5,0.06,0.35), mat(0x8b4513)), {position: new THREE.Vector3(-0.3,1.08,0)}));
  desk.position.set(0, 0, 2.5);
  south.add(desk); interactables1.south.push(desk);
  // Flower pot
  const flower = new THREE.Group(); flower.userData.action = () => puzzle1_6();
  flower.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.15,0.35,12), mat(0x8b4513)), {position: new THREE.Vector3(0,0.18,0)}));
  flower.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.22,8,8), mat(0x2d8a2d)), {position: new THREE.Vector3(0,0.45,0)}));
  flower.position.set(-2, 0, 3);
  south.add(flower); interactables1.south.push(flower);
  // Carpet
  south.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,0.04,24), mat(0x6a1a1a)), {position: new THREE.Vector3(0,0.02,2)}));
  s.add(south); wallGroups1.south = south;

  return s;
}

// ===== ROOM 2: Potion Kitchen =====
function buildRoom2() {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x4a3020);
  s.add(new THREE.AmbientLight(0xffffff, 1.8));
  const dir = new THREE.DirectionalLight(0xffcc66, 0.6);
  dir.position.set(-2,5,2); s.add(dir);
  s.add(Object.assign(new THREE.PointLight(0xff8800,0.4,8), {position: new THREE.Vector3(0,1,0)}));

  // Floor
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(8,0.1,8), mat(0x555555)), {position: new THREE.Vector3(0,-0.05,0)}));

  // 4 walls
  const wm = mat(0x6b4020);
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(8,5,0.15), wm.clone()), {position: new THREE.Vector3(0,2.5,-4)}));
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.15,5,8), wm.clone()), {position: new THREE.Vector3(-4,2.5,0)}));
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.15,5,8), wm.clone()), {position: new THREE.Vector3(4,2.5,0)}));
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(8,5,0.15), wm.clone()), {position: new THREE.Vector3(0,2.5,4)}));

  // --- NORTH: owl painting, recipe wall ---
  const north = new THREE.Group();
  // Owl painting
  const owl = new THREE.Group(); owl.userData.action = () => puzzle2_2();
  owl.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1,1.2,0.08), mat(0xb8860b)), {position: new THREE.Vector3(0,0,0)}));
  owl.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.8,1,0.06), mat(0x2a2a1a)), {position: new THREE.Vector3(0,0,0.02)}));
  owl.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8), mat(0xffd700)), {position: new THREE.Vector3(-0.15,0.15,0.05)}));
  owl.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8), mat(0xffd700)), {position: new THREE.Vector3(0.15,0.15,0.05)}));
  owl.position.set(-1, 2.8, -3.8);
  north.add(owl); interactables2.north.push(owl);
  // Recipe papers
  const recipe = new THREE.Group(); recipe.userData.action = () => showRecipeWall();
  recipe.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.7,0.9,0.02), mat(0xf5e6c8)), {position: new THREE.Vector3(0,0,0)}));
  recipe.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.5,0.7,0.02), mat(0xf5e6c8)), {position: new THREE.Vector3(0.8,0.1,0)}));
  recipe.position.set(1.5, 2.2, -3.85);
  north.add(recipe); interactables2.north.push(recipe);
  s.add(north); wallGroups2.north = north;

  // --- WEST: bottles, crystal ball, door ---
  const west = new THREE.Group();
  // Bottles rack
  const bottles = new THREE.Group(); bottles.userData.action = () => puzzle2_3();
  bottles.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.12,2,2), mat(0x4a3222)), {position: new THREE.Vector3(0,1,0)}));
  const bColors = [0xe74c3c,0xe67e22,0xf1c40f,0x27ae60,0x2980b9,0x34495e,0x9b59b6];
  bColors.forEach((c,i) => {
    bottles.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.35,8), mat(c)), {position: new THREE.Vector3(0.1,1.3,-0.75+i*0.25,0)}));
  });
  bottles.position.set(-3.7, 0, 1);
  west.add(bottles); interactables2.west.push(bottles);
  // Crystal ball
  const crystal = new THREE.Group(); crystal.userData.action = () => clickCrystalBall();
  crystal.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.8,0.08,0.5), mat(0x4a3222)), {position: new THREE.Vector3(0,0.9,0)}));
  crystal.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.06,0.9,0.06), mat(0x3d2b1f)), {position: new THREE.Vector3(-0.3,0.45,0)}));
  crystal.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.06,0.9,0.06), mat(0x3d2b1f)), {position: new THREE.Vector3(0.3,0.45,0)}));
  crystal.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.12,0.12,8), mat(0x4a3222)), {position: new THREE.Vector3(0,1.0,0)}));
  crystal.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.25,16,12), new THREE.MeshStandardMaterial({color:0x9966ff,transparent:true,opacity:0.6,metalness:0.3,roughness:0.1})), {position: new THREE.Vector3(0,1.25,0)}));
  crystal.position.set(-3, 0, -1.5);
  west.add(crystal); interactables2.west.push(crystal);
  // Door
  const door = new THREE.Group(); door.userData.action = () => switchRoom(1);
  door.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.12,2.6,1.3), mat(0x6a3a8a)), {position: new THREE.Vector3(0,1.3,0)}));
  door.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.08,2.4,1.1), mat(0x2a1a3a)), {position: new THREE.Vector3(0.02,1.3,0)}));
  door.position.set(-3.85, 0, -0.5);
  west.add(door); interactables2.west.push(door);
  s.add(west); wallGroups2.west = west;

  // --- EAST: music box, cabinet ---
  const east = new THREE.Group();
  // Music box
  const mbox = new THREE.Group(); mbox.userData.action = () => puzzle2_1();
  mbox.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.6,0.08,0.5), mat(0x4a3222)), {position: new THREE.Vector3(0,1.5,0)}));
  mbox.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.4,0.3,0.3), mat(0x6b3a1a)), {position: new THREE.Vector3(0,1.72,0)}));
  mbox.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.2,6), mat(0xb8860b)), {position: new THREE.Vector3(0.25,1.72,0), rotation: new THREE.Euler(0,0,Math.PI/2)}));
  mbox.position.set(3.3, 0, -1.5);
  east.add(mbox); interactables2.east.push(mbox);
  // Cabinet
  const cab = new THREE.Group(); cab.userData.action = () => puzzle2_4();
  cab.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.7,2.8,1.4), mat(0x5a3d2b)), {position: new THREE.Vector3(0,1.4,0)}));
  cab.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.05,0.08,0.08), mat(0xb8860b)), {position: new THREE.Vector3(0.36,1.4,0)}));
  cab.position.set(3.3, 0, 1);
  east.add(cab); interactables2.east.push(cab);
  s.add(east); wallGroups2.east = east;

  // --- SOUTH: cauldron, scale ---
  const south = new THREE.Group();
  // Cauldron
  const cauldron = new THREE.Group(); cauldron.userData.action = () => puzzle2_5();
  cauldron.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.7,16,12,0,Math.PI*2,0,Math.PI/2), mat(0x1a1a1a)), {position: new THREE.Vector3(0,0.9,0), rotation: new THREE.Euler(Math.PI,0,0)}));
  cauldron.add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(0.7,0.06,8,24), mat(0x333333)), {position: new THREE.Vector3(0,0.9,0), rotation: new THREE.Euler(Math.PI/2,0,0)}));
  for(let i=0;i<3;i++){const a=(i/3)*Math.PI*2; cauldron.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.6,6), mat(0x333333)), {position: new THREE.Vector3(Math.cos(a)*0.5,0.3,Math.sin(a)*0.5)}));}
  // Fire under
  cauldron.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.25,8,6), mat(0xff6600)), {position: new THREE.Vector3(0,0.15,0)}));
  cauldron.position.set(0, 0, 2.5);
  south.add(cauldron); interactables2.south.push(cauldron);
  // Scale
  const scale = new THREE.Group(); scale.userData.action = () => puzzle2_6();
  scale.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.35,0.12,12), mat(0xb8860b)), {position: new THREE.Vector3(0,0.06,0)}));
  scale.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,1.1,8), mat(0x8b6914)), {position: new THREE.Vector3(0,0.6,0)}));
  scale.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1.2,0.05,0.05), mat(0xb8860b)), {position: new THREE.Vector3(0,1.15,0)}));
  // Pans
  scale.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.04,12), mat(0x8b6914)), {position: new THREE.Vector3(-0.5,1.0,0)}));
  scale.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.04,12), mat(0x8b6914)), {position: new THREE.Vector3(0.5,1.0,0)}));
  scale.position.set(2, 0, 2.5);
  south.add(scale); interactables2.south.push(scale);
  s.add(south); wallGroups2.south = south;

  return s;
}
