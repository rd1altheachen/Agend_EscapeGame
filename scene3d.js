// ===== THREE.JS 3D SCENE - Wall-facing camera system =====
let renderer, camera, scene1, scene2, currentScene;
let raycaster, mouse;
let interactables1 = {north:[],east:[],south:[],west:[]};
let interactables2 = {north:[],east:[],south:[],west:[]};
let currentView = 'north';
const VIEWS = ['north','east','south','west'];
let wallGroups1 = {}, wallGroups2 = {};

const CAM_TARGETS = {
  north: {x:0,y:1.6,z:-3.5}, east: {x:3.5,y:1.6,z:0},
  south: {x:0,y:1.6,z:3.5}, west: {x:-3.5,y:1.6,z:0}
};

function initThree() {
  const container = document.getElementById('scene-area');
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  container.insertBefore(renderer.domElement, container.firstChild);
  camera = new THREE.PerspectiveCamera(60, container.clientWidth/container.clientHeight, 0.1, 100);
  camera.position.set(0,1.6,0);
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  scene1 = buildRoom1();
  scene2 = buildRoom2();
  currentScene = scene1;
  setView('north');
  animate();
  window.addEventListener('resize',()=>{const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();});
  renderer.domElement.addEventListener('pointerdown',onPointerDown);
  renderer.domElement.addEventListener('pointermove',onPointerMove);
  document.getElementById('arrow-left').addEventListener('click',()=>rotateView(-1));
  document.getElementById('arrow-right').addEventListener('click',()=>rotateView(1));
}
function animate(){requestAnimationFrame(animate);renderer.render(currentScene,camera);}
function setView(dir){currentView=dir;const t=CAM_TARGETS[dir];camera.position.set(0,1.6,0);camera.lookAt(t.x,t.y,t.z);const groups=currentScene===scene1?wallGroups1:wallGroups2;VIEWS.forEach(v=>{if(groups[v])groups[v].visible=(v===dir);});}
function rotateView(d){const i=VIEWS.indexOf(currentView);setView(VIEWS[(i+d+4)%4]);}
function switchScene(roomNum){currentScene=roomNum===1?scene1:scene2;setView('north');}
function onPointerMove(e){const r=renderer.domElement.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width)*2-1;mouse.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(mouse,camera);const l=currentScene===scene1?interactables1[currentView]:interactables2[currentView];renderer.domElement.style.cursor=raycaster.intersectObjects(l,true).length>0?'pointer':'default';}
function onPointerDown(e){const r=renderer.domElement.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width)*2-1;mouse.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(mouse,camera);const l=currentScene===scene1?interactables1[currentView]:interactables2[currentView];const hits=raycaster.intersectObjects(l,true);if(hits.length>0){let o=hits[0].object;while(o&&!o.userData.action)o=o.parent;if(o&&o.userData.action)o.userData.action();}else{if(state.selectedItem){state.selectedItem=null;renderInventory();}}}
function mat(c){return new THREE.MeshStandardMaterial({color:c});}

// ===== ROOM 1: Starry Study =====
function buildRoom1(){
  const s=new THREE.Scene();
  s.background=new THREE.Color(0x1a2040);
  s.add(new THREE.AmbientLight(0xffffff,2.0));
  s.add(Object.assign(new THREE.DirectionalLight(0xffd700,0.5),{position:new THREE.Vector3(2,5,2)}));

  // Floor + 4 walls
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(8,0.1,8),mat(0x3d2b1f)),{position:new THREE.Vector3(0,-0.05,0)}));
  const wm=mat(0x1a2550);
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(8,5,0.15),wm.clone()),{position:new THREE.Vector3(0,2.5,-4)}));
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.15,5,8),wm.clone()),{position:new THREE.Vector3(-4,2.5,0)}));
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.15,5,8),wm.clone()),{position:new THREE.Vector3(4,2.5,0)}));
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(8,5,0.15),wm.clone()),{position:new THREE.Vector3(0,2.5,4)}));

  // --- NORTH (camera looks -Z): objects at z≈-3.8, x within ±1.5 ---
  const north=new THREE.Group();
  // Clock (upper center)
  const clock=new THREE.Group();clock.userData.action=()=>clickClock();
  clock.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.45,0.08,24),mat(0xeeeeee)),{rotation:new THREE.Euler(Math.PI/2,0,0)}));
  clock.add(new THREE.Mesh(new THREE.TorusGeometry(0.45,0.05,8,24),mat(0xb8860b)));
  const hand1=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.28,0.03),mat(0x222222));
  hand1.position.set(0,0.08,0.05);clock.add(hand1);
  const hand2=new THREE.Mesh(new THREE.BoxGeometry(0.025,0.35,0.025),mat(0x222222));
  hand2.position.set(0.04,-0.12,0.05);hand2.rotation.z=-Math.PI/6;clock.add(hand2);
  clock.position.set(0,3,-3.8);
  north.add(clock);interactables1.north.push(clock);
  // Fireplace (lower center)
  const fp=new THREE.Group();fp.userData.action=()=>puzzle1_5();
  fp.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1.8,1.6,0.5),mat(0x7a3a1a)),{position:new THREE.Vector3(0,0.8,0)}));
  fp.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1.6,0.15,0.3),mat(0x9a5a3a)),{position:new THREE.Vector3(0,1.65,0.1)}));// mantle
  fp.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.9,0.9,0.35),mat(0x0a0a0a)),{position:new THREE.Vector3(0,0.45,0.1)}));// opening
  fp.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.2,8,6),mat(0xff4400)),{position:new THREE.Vector3(-0.1,0.25,0.15)}));
  fp.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.15,8,6),mat(0xff6600)),{position:new THREE.Vector3(0.12,0.2,0.15)}));
  fp.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6),mat(0xffaa00)),{position:new THREE.Vector3(0,0.35,0.15)}));
  fp.position.set(0,0,-3.6);
  north.add(fp);interactables1.north.push(fp);
  s.add(north);wallGroups1.north=north;

  // --- WEST (camera looks -X): objects at x≈-3.8, z within ±1.5 ---
  const west=new THREE.Group();
  // Bookshelf (center, floor to ~3m)
  const shelf=new THREE.Group();shelf.userData.action=()=>clickBookshelf();
  shelf.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.5,2.8,1.8),mat(0x4a3222)),{position:new THREE.Vector3(0,1.4,0)}));
  // Shelf boards
  for(let y of [0.6,1.2,1.8,2.4]){shelf.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.52,0.04,1.8),mat(0x5a4232)),{position:new THREE.Vector3(0,y,0)}));}
  // Books on shelves
  const bc=[0xc0392b,0x2980b9,0x27ae60,0x8e44ad,0xd4ac0d,0x1a5276,0x6c3483,0x148f77,0x922b21,0xb7950b,0xe74c3c,0x2ecc71];
  let bi=0;
  for(let row=0;row<3;row++){
    for(let i=0;i<5;i++){
      const h=0.25+Math.random()*0.2;
      const bk=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.1+Math.random()*0.06,h),mat(bc[bi%12]));
      bk.position.set(0.08,0.7+row*0.6,-0.65+i*0.32);
      shelf.add(bk);bi++;
    }
  }
  shelf.position.set(-3.7,0,0.3);
  west.add(shelf);interactables1.west.push(shelf);
  // Mirror (upper, offset from shelf)
  const mirror=new THREE.Group();mirror.userData.action=()=>puzzle1_1();
  mirror.add(new THREE.Mesh(new THREE.TorusGeometry(0.5,0.07,8,24),mat(0xb8860b)));
  mirror.add(new THREE.Mesh(new THREE.CircleGeometry(0.5,24),new THREE.MeshStandardMaterial({color:0x4444aa,metalness:0.9,roughness:0.1})));
  mirror.rotation.y=Math.PI/2;
  mirror.position.set(-3.8,2.8,-0.8);
  west.add(mirror);interactables1.west.push(mirror);
  s.add(west);wallGroups1.west=west;

  // --- EAST (camera looks +X): objects at x≈+3.8, z within ±1.5 ---
  const east=new THREE.Group();
  // Constellation (left side when facing east wall, z<0)
  const con=new THREE.Group();con.userData.action=()=>puzzle1_4();
  con.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.35,0.25,12),mat(0xb8860b)),{position:new THREE.Vector3(0,0.13,0)}));
  con.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,1.0,8),mat(0x8b6914)),{position:new THREE.Vector3(0,0.75,0)}));
  con.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.4,16,12),new THREE.MeshStandardMaterial({color:0x1a1a4a,wireframe:true})),{position:new THREE.Vector3(0,1.5,0)}));
  // Gold ring
  con.add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(0.35,0.02,8,24),mat(0xdaa520)),{position:new THREE.Vector3(0,1.5,0),rotation:new THREE.Euler(Math.PI/3,0,0)}));
  con.position.set(3.3,0,0);
  east.add(con);interactables1.east.push(con);
  // Magic Door (right side, z>0)
  const door=new THREE.Group();door.userData.action=()=>puzzle1_3();
  // Frame
  door.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.12,2.6,1.3),mat(0x6a3a8a)),{position:new THREE.Vector3(0,1.3,0)}));
  // Panel
  door.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.08,2.4,1.1),mat(0x2a1a3a)),{position:new THREE.Vector3(-0.02,1.3,0)}));
  // 3 keyhole slots
  door.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.04,12),mat(0x333333)),{position:new THREE.Vector3(-0.05,1.5,-0.3),rotation:new THREE.Euler(0,0,Math.PI/2)}));
  door.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.04,12),mat(0xffd700)),{position:new THREE.Vector3(-0.05,1.5,0),rotation:new THREE.Euler(0,0,Math.PI/2)}));
  door.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.04,12),mat(0x333333)),{position:new THREE.Vector3(-0.05,1.5,0.3),rotation:new THREE.Euler(0,0,Math.PI/2)}));
  // Door knob
  door.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.06,8,8),mat(0xb8860b)),{position:new THREE.Vector3(-0.06,1.1,0.35)}));
  door.position.set(3.85,0,0.8);
  east.add(door);interactables1.east.push(door);
  s.add(east);wallGroups1.east=east;

  // --- SOUTH (camera looks +Z): objects at z≈+3.5, x within ±1.5 ---
  const south=new THREE.Group();
  // Desk (center)
  const desk=new THREE.Group();desk.userData.action=()=>puzzle1_2();
  desk.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1.8,0.1,0.9),mat(0x5a3d2b)),{position:new THREE.Vector3(0,0.9,0)}));
  const lg=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.9,0.08),mat(0x3d2b1f));
  desk.add(Object.assign(lg.clone(),{position:new THREE.Vector3(-0.75,0.45,-0.35)}));
  desk.add(Object.assign(lg.clone(),{position:new THREE.Vector3(0.75,0.45,-0.35)}));
  desk.add(Object.assign(lg.clone(),{position:new THREE.Vector3(-0.75,0.45,0.35)}));
  desk.add(Object.assign(lg.clone(),{position:new THREE.Vector3(0.75,0.45,0.35)}));
  // Diary (orange book on desk)
  desk.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.4,0.05,0.3),mat(0xcc6600)),{position:new THREE.Vector3(-0.2,0.98,0)}));
  // Quill
  desk.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.01,0.3,6),mat(0xffffff)),{position:new THREE.Vector3(0.4,1.05,0.1),rotation:new THREE.Euler(0,0,0.3)}));
  desk.position.set(0.3,0,3);
  south.add(desk);interactables1.south.push(desk);
  // Flower pot (left of desk)
  const flower=new THREE.Group();flower.userData.action=()=>puzzle1_6();
  flower.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.13,0.3,12),mat(0x8b4513)),{position:new THREE.Vector3(0,0.15,0)}));
  flower.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.2,8,8),mat(0x2d8a2d)),{position:new THREE.Vector3(0,0.4,0)}));
  // Small flower
  flower.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.06,6,6),mat(0xff69b4)),{position:new THREE.Vector3(0,0.55,0)}));
  flower.position.set(-0.6,0,3.2);
  south.add(flower);interactables1.south.push(flower);
  s.add(south);wallGroups1.south=south;

  return s;
}

// ===== ROOM 2: Potion Kitchen =====
function buildRoom2(){
  const s=new THREE.Scene();
  s.background=new THREE.Color(0x4a3020);
  s.add(new THREE.AmbientLight(0xffffff,2.0));
  s.add(Object.assign(new THREE.DirectionalLight(0xffcc66,0.5),{position:new THREE.Vector3(-2,5,2)}));
  s.add(Object.assign(new THREE.PointLight(0xff8800,0.3,8),{position:new THREE.Vector3(0,1,0)}));

  // Floor + 4 walls
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(8,0.1,8),mat(0x555555)),{position:new THREE.Vector3(0,-0.05,0)}));
  const wm=mat(0x6b4020);
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(8,5,0.15),wm.clone()),{position:new THREE.Vector3(0,2.5,-4)}));
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.15,5,8),wm.clone()),{position:new THREE.Vector3(-4,2.5,0)}));
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.15,5,8),wm.clone()),{position:new THREE.Vector3(4,2.5,0)}));
  s.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(8,5,0.15),wm.clone()),{position:new THREE.Vector3(0,2.5,4)}));

  // --- NORTH (look -Z): owl painting + recipe, x within ±1.5 ---
  const north=new THREE.Group();
  // Owl painting (left of center)
  const owl=new THREE.Group();owl.userData.action=()=>puzzle2_2();
  owl.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.9,1.1,0.06),mat(0xb8860b)),{position:new THREE.Vector3(0,0,0)}));
  owl.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.7,0.9,0.04),mat(0x2a2a1a)),{position:new THREE.Vector3(0,0,0.02)}));
  // Owl body
  owl.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.2,8,8),mat(0x5a4a3a)),{position:new THREE.Vector3(0,-0.1,0.04)}));
  // Eyes (prominent)
  owl.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.09,8,8),mat(0xffd700)),{position:new THREE.Vector3(-0.12,0.1,0.05)}));
  owl.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.09,8,8),mat(0xffd700)),{position:new THREE.Vector3(0.12,0.1,0.05)}));
  // Pupils
  owl.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.04,6,6),mat(0x111111)),{position:new THREE.Vector3(-0.12,0.1,0.1)}));
  owl.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.04,6,6),mat(0x111111)),{position:new THREE.Vector3(0.12,0.1,0.1)}));
  owl.position.set(-0.7,2.5,-3.8);
  north.add(owl);interactables2.north.push(owl);
  // Recipe papers (right of center)
  const recipe=new THREE.Group();recipe.userData.action=()=>showRecipeWall();
  recipe.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.6,0.8,0.02),mat(0xf5e6c8)),{position:new THREE.Vector3(0,0,0)}));
  recipe.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.45,0.6,0.02),mat(0xf0ddb8)),{position:new THREE.Vector3(0.55,0.05,0)}));
  // Lines on paper
  recipe.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.4,0.02,0.01),mat(0x888888)),{position:new THREE.Vector3(0,0.2,0.01)}));
  recipe.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.4,0.02,0.01),mat(0x888888)),{position:new THREE.Vector3(0,0.05,0.01)}));
  recipe.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.4,0.02,0.01),mat(0x888888)),{position:new THREE.Vector3(0,-0.1,0.01)}));
  recipe.position.set(0.8,2.2,-3.85);
  north.add(recipe);interactables2.north.push(recipe);
  s.add(north);wallGroups2.north=north;

  // --- WEST (look -X): bottles + crystal + door, z within ±1.5 ---
  const west=new THREE.Group();
  // Bottles rack (upper area)
  const bottles=new THREE.Group();bottles.userData.action=()=>puzzle2_3();
  bottles.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.1,1.2,1.6),mat(0x4a3222)),{position:new THREE.Vector3(0,1.2,0)}));
  // Shelf boards
  bottles.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.12,0.03,1.6),mat(0x5a4232)),{position:new THREE.Vector3(0,1.0,0)}));
  bottles.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.12,0.03,1.6),mat(0x5a4232)),{position:new THREE.Vector3(0,1.5,0)}));
  // Colorful bottles
  const bColors=[0xe74c3c,0xe67e22,0xf1c40f,0x27ae60,0x2980b9,0x34495e,0x9b59b6];
  bColors.forEach((c,i)=>{
    const bt=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.3,8),mat(c));
    bt.position.set(0.08,1.2,-0.6+i*0.2);
    bottles.add(bt);
    // Bottle cap
    bottles.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.05,6),mat(0x8b4513)),{position:new THREE.Vector3(0.08,1.36,-0.6+i*0.2)}));
  });
  bottles.position.set(-3.75,0,0.5);
  west.add(bottles);interactables2.west.push(bottles);
  // Crystal ball (lower, on small table)
  const crystal=new THREE.Group();crystal.userData.action=()=>clickCrystalBall();
  crystal.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.5,0.06,0.4),mat(0x4a3222)),{position:new THREE.Vector3(0,0.8,0)}));
  crystal.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.05,0.8,0.05),mat(0x3d2b1f)),{position:new THREE.Vector3(-0.2,0.4,0)}));
  crystal.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.05,0.8,0.05),mat(0x3d2b1f)),{position:new THREE.Vector3(0.2,0.4,0)}));
  crystal.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,0.1,8),mat(0x4a3222)),{position:new THREE.Vector3(0,0.88,0)}));
  crystal.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.22,16,12),new THREE.MeshStandardMaterial({color:0x9966ff,transparent:true,opacity:0.6,metalness:0.3,roughness:0.1})),{position:new THREE.Vector3(0,1.1,0)}));
  crystal.position.set(-3.3,0,-0.8);
  west.add(crystal);interactables2.west.push(crystal);
  // Door (back area)
  const door=new THREE.Group();door.userData.action=()=>switchRoom(1);
  door.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.1,2.4,1.1),mat(0x6a3a8a)),{position:new THREE.Vector3(0,1.2,0)}));
  door.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.06,2.2,0.9),mat(0x2a1a3a)),{position:new THREE.Vector3(0.02,1.2,0)}));
  door.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.05,8,8),mat(0xb8860b)),{position:new THREE.Vector3(0.04,1.1,0.3)}));
  door.position.set(-3.85,0,-0.2);
  west.add(door);interactables2.west.push(door);
  s.add(west);wallGroups2.west=west;

  // --- EAST (look +X): music box + cabinet, z within ±1.5 ---
  const east=new THREE.Group();
  // Music box (on shelf, upper left)
  const mbox=new THREE.Group();mbox.userData.action=()=>puzzle2_1();
  // Shelf
  mbox.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.5,0.06,0.4),mat(0x4a3222)),{position:new THREE.Vector3(0,1.4,0)}));
  // Box body
  mbox.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.35,0.25,0.25),mat(0x6b3a1a)),{position:new THREE.Vector3(0,1.58,0)}));
  // Lid
  mbox.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.36,0.04,0.26),mat(0x7a4a2a)),{position:new THREE.Vector3(0,1.72,0)}));
  // Handle (crank)
  mbox.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.15,6),mat(0xb8860b)),{position:new THREE.Vector3(-0.22,1.58,0),rotation:new THREE.Euler(0,0,Math.PI/2)}));
  mbox.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.03,6,6),mat(0xb8860b)),{position:new THREE.Vector3(-0.3,1.58,0)}));
  mbox.position.set(3.4,0,-0.7);
  east.add(mbox);interactables2.east.push(mbox);
  // Cabinet (large, right side)
  const cab=new THREE.Group();cab.userData.action=()=>puzzle2_4();
  cab.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.6,2.5,1.2),mat(0x5a3d2b)),{position:new THREE.Vector3(0,1.25,0)}));
  // Door lines
  cab.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.02,2.2,0.01),mat(0x3d2b1f)),{position:new THREE.Vector3(-0.31,1.25,0)}));
  // Lock (prominent gold)
  cab.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.08,0.1,0.08),mat(0xffd700)),{position:new THREE.Vector3(-0.32,1.3,0)}));
  // Handles
  cab.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.03,6,6),mat(0xb8860b)),{position:new THREE.Vector3(-0.32,1.5,0.2)}));
  cab.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.03,6,6),mat(0xb8860b)),{position:new THREE.Vector3(-0.32,1.5,-0.2)}));
  cab.position.set(3.4,0,0.7);
  east.add(cab);interactables2.east.push(cab);
  s.add(east);wallGroups2.east=east;

  // --- SOUTH (look +Z): cauldron + scale, x within ±1.5 ---
  const south=new THREE.Group();
  // Cauldron (center)
  const cauldron=new THREE.Group();cauldron.userData.action=()=>puzzle2_5();
  // Pot body (half sphere)
  cauldron.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.6,16,12,0,Math.PI*2,0,Math.PI/2),mat(0x1a1a1a)),{position:new THREE.Vector3(0,0.8,0),rotation:new THREE.Euler(Math.PI,0,0)}));
  // Rim
  cauldron.add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(0.6,0.05,8,24),mat(0x333333)),{position:new THREE.Vector3(0,0.8,0),rotation:new THREE.Euler(Math.PI/2,0,0)}));
  // 3 legs
  for(let i=0;i<3;i++){const a=(i/3)*Math.PI*2;cauldron.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.5,6),mat(0x444444)),{position:new THREE.Vector3(Math.cos(a)*0.4,0.25,Math.sin(a)*0.4)}));}
  // Fire underneath
  cauldron.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.18,8,6),mat(0xff4400)),{position:new THREE.Vector3(-0.08,0.12,0)}));
  cauldron.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.14,8,6),mat(0xff6600)),{position:new THREE.Vector3(0.1,0.1,0.05)}));
  cauldron.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.1,6,6),mat(0xffaa00)),{position:new THREE.Vector3(0,0.18,0)}));
  cauldron.position.set(-0.3,0,3);
  south.add(cauldron);interactables2.south.push(cauldron);
  // Scale (right of cauldron)
  const scale=new THREE.Group();scale.userData.action=()=>puzzle2_6();
  scale.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.3,0.1,12),mat(0xb8860b)),{position:new THREE.Vector3(0,0.05,0)}));
  scale.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,1.0,8),mat(0x8b6914)),{position:new THREE.Vector3(0,0.55,0)}));
  scale.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1.0,0.04,0.04),mat(0xb8860b)),{position:new THREE.Vector3(0,1.05,0)}));
  // Pans (visible discs)
  scale.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.03,12),mat(0x8b6914)),{position:new THREE.Vector3(-0.42,0.95,0)}));
  scale.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.03,12),mat(0x8b6914)),{position:new THREE.Vector3(0.42,0.95,0)}));
  // Gem on one pan
  scale.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.08,8,8),mat(0x9900ff)),{position:new THREE.Vector3(-0.42,1.0,0)}));
  scale.position.set(0.4,0,3);
  south.add(scale);interactables2.south.push(scale);
  s.add(south);wallGroups2.south=south;

  return s;
}
