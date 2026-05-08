// ===== THREE.JS 3D SCENE =====
let renderer, camera, scene1, scene2, currentScene;
let raycaster, mouse;
let interactables1 = [], interactables2 = [];

function initThree() {
  const container = document.getElementById('scene-area');
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.insertBefore(renderer.domElement, container.firstChild);

  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 2.5, 8);
  camera.lookAt(0, 2, 0);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  scene1 = buildRoom1();
  scene2 = buildRoom2();
  currentScene = scene1;

  animate();

  // Resize
  window.addEventListener('resize', () => {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });

  // Click/touch
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.style.cursor = 'default';
  renderer.domElement.addEventListener('pointermove', onPointerMove);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(currentScene, camera);
}

function onPointerMove(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const list = currentScene === scene1 ? interactables1 : interactables2;
  const hits = raycaster.intersectObjects(list, true);
  renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'default';
}

function onPointerDown(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const list = currentScene === scene1 ? interactables1 : interactables2;
  const hits = raycaster.intersectObjects(list, true);
  if (hits.length > 0) {
    let obj = hits[0].object;
    while (obj && !obj.userData.action) obj = obj.parent;
    if (obj && obj.userData.action) obj.userData.action();
  } else {
    if (state.selectedItem) { state.selectedItem = null; renderInventory(); }
  }
}

function switchScene(roomNum) {
  currentScene = roomNum === 1 ? scene1 : scene2;
}

// ===== MATERIALS =====
function mat(color) { return new THREE.MeshStandardMaterial({ color }); }

// ===== ROOM 1: Starry Study =====
function buildRoom1() {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x0a0e2a);
  // Lighting
  const amb = new THREE.AmbientLight(0x8899bb, 1.2);
  s.add(amb);
  const dir = new THREE.DirectionalLight(0xffd700, 0.8);
  dir.position.set(3, 8, 4);
  s.add(dir);
  const point = new THREE.PointLight(0x8888ff, 0.6, 15);
  point.position.set(0, 4, 0);
  s.add(point);

  // Floor
  const floor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 8), mat(0x3d2b1f));
  floor.position.y = -0.1;
  s.add(floor);

  // Walls (back, left, right)
  const wallMat = mat(0x121a40);
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 0.2), wallMat);
  backWall.position.set(0, 2.5, -4);
  s.add(backWall);
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 8), wallMat);
  leftWall.position.set(-4, 2.5, 0);
  s.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 8), wallMat);
  rightWall.position.set(4, 2.5, 0);
  s.add(rightWall);

  // Bookshelf (left wall)
  const shelf = new THREE.Group();
  shelf.userData.action = () => clickBookshelf();
  const shelfBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3, 0.6), mat(0x4a3222));
  shelfBody.position.y = 1.5;
  shelf.add(shelfBody);
  // Books
  const bookColors = [0xc0392b, 0x2980b9, 0x27ae60, 0x8e44ad, 0xd4ac0d, 0x1a5276, 0x6c3483, 0x148f77];
  for (let i = 0; i < 8; i++) {
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4 + Math.random() * 0.3, 0.4), mat(bookColors[i]));
    book.position.set(-0.4 + i * 0.12, 2.6, 0);
    shelf.add(book);
  }
  for (let i = 0; i < 6; i++) {
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.35 + Math.random() * 0.25, 0.4), mat(bookColors[i + 2]));
    book.position.set(-0.3 + i * 0.13, 1.8, 0);
    shelf.add(book);
  }
  shelf.position.set(-3.3, 0, -1);
  s.add(shelf);
  interactables1.push(shelf);

  // Mirror (left wall, above)
  const mirror = new THREE.Group();
  mirror.userData.action = () => puzzle1_1();
  const frame = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.08, 8, 24), mat(0xb8860b));
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), new THREE.MeshStandardMaterial({ color: 0x2a2a6a, metalness: 0.8, roughness: 0.2 }));
  mirror.add(frame); mirror.add(glass);
  mirror.rotation.y = Math.PI / 2;
  mirror.position.set(-3.85, 3.2, -2.5);
  s.add(mirror);
  interactables1.push(mirror);

  // Desk (center-right)
  const desk = new THREE.Group();
  desk.userData.action = () => puzzle1_2();
  const top = new THREE.Mesh(new THREE.BoxGeometry(2, 0.12, 1), mat(0x5a3d2b));
  top.position.y = 1;
  desk.add(top);
  const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.1), mat(0x3d2b1f));
  leg1.position.set(-0.8, 0.5, -0.4); desk.add(leg1);
  const leg2 = leg1.clone(); leg2.position.set(0.8, 0.5, -0.4); desk.add(leg2);
  const leg3 = leg1.clone(); leg3.position.set(-0.8, 0.5, 0.4); desk.add(leg3);
  const leg4 = leg1.clone(); leg4.position.set(0.8, 0.5, 0.4); desk.add(leg4);
  // Diary on desk
  const diary = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.3), mat(0x8b4513));
  diary.position.set(-0.3, 1.08, 0); desk.add(diary);
  desk.position.set(1, 0, 1);
  s.add(desk);
  interactables1.push(desk);

  // Constellation device (right wall)
  const constellation = new THREE.Group();
  constellation.userData.action = () => puzzle1_4();
  const cBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.3, 12), mat(0xb8860b));
  cBase.position.y = 0.15;
  constellation.add(cBase);
  const cPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8), mat(0x8b6914));
  cPole.position.y = 0.9;
  constellation.add(cPole);
  const cSphere = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 12), new THREE.MeshStandardMaterial({ color: 0x000033, wireframe: true }));
  cSphere.position.y = 1.7;
  constellation.add(cSphere);
  constellation.position.set(3.3, 0, -1.5);
  s.add(constellation);
  interactables1.push(constellation);

  // Clock (back wall)
  const clock = new THREE.Group();
  clock.userData.action = () => clickClock();
  const clockFace = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 24), mat(0x2a2a2a));
  clockFace.rotation.x = Math.PI / 2;
  clock.add(clockFace);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 8, 24), mat(0xb8860b));
  clock.add(rim);
  clock.position.set(0, 3.8, -3.85);
  s.add(clock);
  interactables1.push(clock);

  // Magic Door (right wall)
  const door = new THREE.Group();
  door.userData.action = () => puzzle1_3();
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.8, 1.4), mat(0x6a3a8a));
  doorFrame.position.y = 1.4;
  door.add(doorFrame);
  const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.6, 1.2), mat(0x2a1a3a));
  doorPanel.position.set(0.03, 1.4, 0);
  door.add(doorPanel);
  door.position.set(3.9, 0, 1);
  door.rotation.y = -Math.PI / 2;
  s.add(door);
  interactables1.push(door);

  // Flower pot (left front)
  const flower = new THREE.Group();
  flower.userData.action = () => puzzle1_6();
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.3, 12), mat(0x8b4513));
  pot.position.y = 0.15;
  flower.add(pot);
  const plant = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), mat(0x2d5a2d));
  plant.position.y = 0.4;
  flower.add(plant);
  flower.position.set(-2.5, 0, 2.5);
  s.add(flower);
  interactables1.push(flower);

  // Fireplace (back wall, bottom)
  const fireplace = new THREE.Group();
  fireplace.userData.action = () => puzzle1_5();
  const fpBody = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 0.5), mat(0x5a2a1a));
  fpBody.position.y = 0.75;
  fireplace.add(fpBody);
  const fpOpening = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.3), mat(0x1a0a0a));
  fpOpening.position.set(0, 0.5, 0.15);
  fireplace.add(fpOpening);
  fireplace.position.set(2, 0, -3.7);
  s.add(fireplace);
  interactables1.push(fireplace);

  // Carpet (floor center)
  const carpet = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.05, 24), mat(0x6a1a1a));
  carpet.position.set(0, 0.03, 0.5);
  s.add(carpet);

  return s;
}

// ===== ROOM 2: Potion Kitchen =====
function buildRoom2() {
  const s = new THREE.Scene();
  s.background = new THREE.Color(0x3d2010);
  // Lighting
  s.add(new THREE.AmbientLight(0xbb8866, 1.2));
  const dir = new THREE.DirectionalLight(0xffcc66, 0.8);
  dir.position.set(-2, 7, 3);
  s.add(dir);
  const fire = new THREE.PointLight(0xff6600, 0.8, 10);
  fire.position.set(0, 0.5, 0);
  s.add(fire);

  // Floor
  const floor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 8), mat(0x4a4a4a));
  floor.position.y = -0.1;
  s.add(floor);

  // Walls
  const wallMat = mat(0x5a3520);
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 0.2), wallMat);
  backWall.position.set(0, 2.5, -4);
  s.add(backWall);
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 8), wallMat);
  leftWall.position.set(-4, 2.5, 0);
  s.add(leftWall);
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 8), wallMat);
  rightWall.position.set(4, 2.5, 0);
  s.add(rightWall);

  // Cauldron (center)
  const cauldron = new THREE.Group();
  cauldron.userData.action = () => puzzle2_5();
  const potBody = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x1a1a1a));
  potBody.position.y = 0.8;
  potBody.rotation.x = Math.PI;
  cauldron.add(potBody);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 8, 24), mat(0x333333));
  rim.position.y = 0.8;
  rim.rotation.x = Math.PI / 2;
  cauldron.add(rim);
  // Legs
  for (let i = 0; i < 3; i++) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), mat(0x333333));
    const angle = (i / 3) * Math.PI * 2;
    leg.position.set(Math.cos(angle) * 0.4, 0.25, Math.sin(angle) * 0.4);
    cauldron.add(leg);
  }
  cauldron.position.set(0, 0, 0);
  s.add(cauldron);
  interactables2.push(cauldron);

  // Recipe wall (back wall)
  const recipe = new THREE.Group();
  recipe.userData.action = () => showRecipeWall();
  const paper1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.02), mat(0xf5e6c8));
  paper1.position.set(-0.4, 2.5, -3.85);
  recipe.add(paper1);
  const paper2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.02), mat(0xf5e6c8));
  paper2.position.set(0.3, 2.7, -3.85);
  recipe.add(paper2);
  s.add(recipe);
  interactables2.push(recipe);

  // Music box (right side, on shelf)
  const musicbox = new THREE.Group();
  musicbox.userData.action = () => puzzle2_1();
  const mShelf = new THREE.Mesh(new THREE.BoxGeometry(1, 0.08, 0.5), mat(0x4a3222));
  mShelf.position.set(0, 1.5, 0);
  musicbox.add(mShelf);
  const mBox = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.3), mat(0x6b3a1a));
  mBox.position.set(0, 1.7, 0);
  musicbox.add(mBox);
  const mHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.15, 6), mat(0xb8860b));
  mHandle.position.set(0.25, 1.7, 0);
  mHandle.rotation.z = Math.PI / 2;
  musicbox.add(mHandle);
  musicbox.position.set(3.3, 0, -2);
  s.add(musicbox);
  interactables2.push(musicbox);

  // Cabinet (right wall)
  const cabinet = new THREE.Group();
  cabinet.userData.action = () => puzzle2_4();
  const cabBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.5, 0.7), mat(0x5a3d2b));
  cabBody.position.y = 1.25;
  cabinet.add(cabBody);
  const cabLock = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.05), mat(0xb8860b));
  cabLock.position.set(0, 1.3, 0.36);
  cabinet.add(cabLock);
  cabinet.position.set(3.2, 0, 1.5);
  s.add(cabinet);
  interactables2.push(cabinet);

  // Owl painting (back wall)
  const owl = new THREE.Group();
  owl.userData.action = () => puzzle2_2();
  const owlFrame = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1, 0.08), mat(0xb8860b));
  owlFrame.position.set(0, 0, 0);
  owl.add(owlFrame);
  const owlCanvas = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 0.05), mat(0x2a2a1a));
  owlCanvas.position.z = 0.02;
  owl.add(owlCanvas);
  // Owl eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), mat(0xffd700));
  eyeL.position.set(-0.12, 0.1, 0.05);
  owl.add(eyeL);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), mat(0xffd700));
  eyeR.position.set(0.12, 0.1, 0.05);
  owl.add(eyeR);
  owl.position.set(-1.5, 3.2, -3.85);
  s.add(owl);
  interactables2.push(owl);

  // Bottles rack (left wall)
  const bottles = new THREE.Group();
  bottles.userData.action = () => puzzle2_3();
  const rackShelf = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 1.8), mat(0x4a3222));
  rackShelf.position.set(0, 0.75, 0);
  bottles.add(rackShelf);
  const bColors = [0xe74c3c, 0xe67e22, 0xf1c40f, 0x27ae60, 0x2980b9, 0x34495e, 0x9b59b6];
  bColors.forEach((c, i) => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8), mat(c));
    b.position.set(0.08, 1.0, -0.7 + i * 0.22);
    bottles.add(b);
  });
  bottles.position.set(-3.8, 0, 0);
  s.add(bottles);
  interactables2.push(bottles);

  // Scale (right front)
  const scale = new THREE.Group();
  scale.userData.action = () => puzzle2_6();
  const sBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.1, 12), mat(0xb8860b));
  sBase.position.y = 0.05;
  scale.add(sBase);
  const sPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 8), mat(0x8b6914));
  sPole.position.y = 0.55;
  scale.add(sPole);
  const sBeam = new THREE.Mesh(new THREE.BoxGeometry(1, 0.04, 0.04), mat(0xb8860b));
  sBeam.position.y = 1.05;
  scale.add(sBeam);
  scale.position.set(2.5, 0, 2.5);
  s.add(scale);
  interactables2.push(scale);

  // Crystal ball
  const crystal = new THREE.Group();
  crystal.userData.action = () => clickCrystalBall();
  const cBall = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12), new THREE.MeshStandardMaterial({ color: 0x9966ff, transparent: true, opacity: 0.6, metalness: 0.3, roughness: 0.1 }));
  cBall.position.y = 1.3;
  crystal.add(cBall);
  const cStand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.15, 8), mat(0x4a3222));
  cStand.position.y = 1.0;
  crystal.add(cStand);
  const cTable = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.5), mat(0x4a3222));
  cTable.position.y = 0.9;
  crystal.add(cTable);
  const cLeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.06), mat(0x3d2b1f));
  cLeg1.position.set(-0.3, 0.45, 0); crystal.add(cLeg1);
  const cLeg2 = cLeg1.clone(); cLeg2.position.set(0.3, 0.45, 0); crystal.add(cLeg2);
  crystal.position.set(-2, 0, 2);
  s.add(crystal);
  interactables2.push(crystal);

  // Door (left wall)
  const door = new THREE.Group();
  door.userData.action = () => switchRoom(1);
  const dFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.5, 0.15), mat(0x6a3a8a));
  dFrame.position.y = 1.25;
  door.add(dFrame);
  const dPanel = new THREE.Mesh(new THREE.BoxGeometry(1, 2.3, 0.1), mat(0x2a1a3a));
  dPanel.position.set(0, 1.25, 0.03);
  door.add(dPanel);
  door.position.set(-3.85, 0, -2);
  door.rotation.y = Math.PI / 2;
  s.add(door);
  interactables2.push(door);

  // Ingredient shelf (left wall upper)
  const ingShelf = new THREE.Group();
  ingShelf.userData.action = () => clickIngredients();
  const iShelf = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 1.2), mat(0x4a3222));
  iShelf.position.set(0, 2, 0);
  ingShelf.add(iShelf);
  ingShelf.position.set(-3.85, 0, 2);
  s.add(ingShelf);
  interactables2.push(ingShelf);

  return s;
}
