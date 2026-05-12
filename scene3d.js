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
  s.add((function(){const _m=new THREE.DirectionalLight(0xffd700,0.5);_m.position.set(2,5,2);return _m;})());

  // Floor + 4 walls
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(8,0.1,8),mat(0x3d2b1f));_m.position.set(0,-0.05,0);return _m;})());
  const wm=mat(0x1a2550);
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(8,5,0.15),wm.clone());_m.position.set(0,2.5,-4);return _m;})());
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.15,5,8),wm.clone());_m.position.set(-4,2.5,0);return _m;})());
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.15,5,8),wm.clone());_m.position.set(4,2.5,0);return _m;})());
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(8,5,0.15),wm.clone());_m.position.set(0,2.5,4);return _m;})());

  // --- NORTH (camera looks -Z): objects at z≈-3.8, x within ±1.5 ---
  const north=new THREE.Group();
  // Clock (upper center)
  const clock=new THREE.Group();clock.userData.action=()=>clickClock();
  const clockFace=new THREE.Mesh(new THREE.CylinderGeometry(0.45,0.45,0.08,24),mat(0xeeeeee));clockFace.rotation.set(Math.PI/2,0,0);clock.add(clockFace);
  clock.add(new THREE.Mesh(new THREE.TorusGeometry(0.45,0.05,8,24),mat(0xb8860b)));
  // Hour hand (short, pointing to 3 = right, slightly past due to :15)
  const hand1=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.22,0.02),mat(0x222222));
  hand1.position.set(0.09,0.02,0.05);hand1.rotation.z=-Math.PI/2-Math.PI/24;clock.add(hand1);
  // Minute hand (long, pointing to 3 = 15 min = right)
  const hand2=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.32,0.02),mat(0x222222));
  hand2.position.set(0.14,0,0.05);hand2.rotation.z=-Math.PI/2;clock.add(hand2);
  clock.position.set(0,3,-3.8);
  north.add(clock);interactables1.north.push(clock);
  // Fireplace (lower center)
  const fp=new THREE.Group();fp.userData.action=()=>puzzle1_5();
  fp.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.6,0.5),mat(0x7a3a1a));_m.position.set(0,0.8,0);return _m;})());
  fp.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.15,0.3),mat(0x9a5a3a));_m.position.set(0,1.65,0.1);return _m;})());// mantle
  fp.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.9,0.35),mat(0x0a0a0a));_m.position.set(0,0.45,0.1);return _m;})());// opening
  fp.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.2,8,6),mat(0xff4400));_m.position.set(-0.1,0.25,0.15);return _m;})());
  fp.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.15,8,6),mat(0xff6600));_m.position.set(0.12,0.2,0.15);return _m;})());
  fp.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.12,8,6),mat(0xffaa00));_m.position.set(0,0.35,0.15);return _m;})());
  fp.position.set(0,0,-3.6);
  north.add(fp);interactables1.north.push(fp);
  s.add(north);wallGroups1.north=north;

  // --- WEST (camera looks -X): objects at x≈-3.8, z within ±1.5 ---
  const west=new THREE.Group();
  // Bookshelf (center, floor to ~3m)
  const shelf=new THREE.Group();shelf.userData.action=()=>clickBookshelf();
  shelf.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.5,2.8,1.8),mat(0x4a3222));_m.position.set(0,1.4,0);return _m;})());
  // Shelf boards
  for(let y of [0.6,1.2,1.8,2.4]){const sh=new THREE.Mesh(new THREE.BoxGeometry(0.52,0.04,1.8),mat(0x5a4232));sh.position.set(0,y,0);shelf.add(sh);}
  // Books on shelves (standing upright, positioned on front face)
  const bc=[0xc0392b,0x2980b9,0x27ae60,0x8e44ad,0xd4ac0d,0x1a5276,0x6c3483,0x148f77,0x922b21,0xb7950b,0xe74c3c,0x2ecc71];
  let bi=0;
  for(let row=0;row<3;row++){
    for(let i=0;i<5;i++){
      const h=0.3+Math.random()*0.15;
      const color=(row===1&&i===2)?0xffd700:bc[bi%12];
      const bk=new THREE.Mesh(new THREE.BoxGeometry(0.06+Math.random()*0.03,h,0.25),mat(color));
      bk.position.set(0.2,0.65+row*0.6+h/2,-0.55+i*0.28);
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
  con.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.35,0.25,12),mat(0xb8860b));_m.position.set(0,0.13,0);return _m;})());
  con.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,1.0,8),mat(0x8b6914));_m.position.set(0,0.75,0);return _m;})());
  con.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.4,16,12),new THREE.MeshStandardMaterial({color:0x1a1a4a,wireframe:true}));_m.position.set(0,1.5,0);return _m;})());
  // Gold ring
  con.add((function(){const _m=new THREE.Mesh(new THREE.TorusGeometry(0.35,0.02,8,24),mat(0xdaa520));_m.position.set(0,1.5,0);_m.rotation.set(Math.PI/3,0,0);return _m;})());
  con.position.set(3.3,0,0);
  east.add(con);interactables1.east.push(con);
  // Magic Door (right side, z>0)
  const door=new THREE.Group();door.userData.action=()=>puzzle1_3();
  // Frame
  door.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.12,2.6,1.3),mat(0x6a3a8a));_m.position.set(0,1.3,0);return _m;})());
  // Panel
  door.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.08,2.4,1.1),mat(0x2a1a3a));_m.position.set(-0.02,1.3,0);return _m;})());
  // 3 keyhole slots
  door.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.04,12),mat(0x333333));_m.position.set(-0.05,1.5,-0.3);_m.rotation.set(0,0,Math.PI/2);return _m;})());
  door.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.04,12),mat(0xffd700));_m.position.set(-0.05,1.5,0);_m.rotation.set(0,0,Math.PI/2);return _m;})());
  door.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.04,12),mat(0x333333));_m.position.set(-0.05,1.5,0.3);_m.rotation.set(0,0,Math.PI/2);return _m;})());
  // Door knob
  door.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,8),mat(0xb8860b));_m.position.set(-0.06,1.1,0.35);return _m;})());
  door.position.set(3.85,0,0.8);
  east.add(door);interactables1.east.push(door);
  s.add(east);wallGroups1.east=east;

  // --- SOUTH (camera looks +Z): objects at z≈+3.5, x within ±1.5 ---
  const south=new THREE.Group();
  // Desk (center)
  const desk=new THREE.Group();desk.userData.action=()=>puzzle1_2();
  desk.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.1,0.9),mat(0x5a3d2b));_m.position.set(0,0.9,0);return _m;})());
  const lg=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.9,0.08),mat(0x3d2b1f));
  desk.add((function(){const _m=lg.clone();_m.position.set(-0.75,0.45,-0.35);return _m;})());
  desk.add((function(){const _m=lg.clone();_m.position.set(0.75,0.45,-0.35);return _m;})());
  desk.add((function(){const _m=lg.clone();_m.position.set(-0.75,0.45,0.35);return _m;})());
  desk.add((function(){const _m=lg.clone();_m.position.set(0.75,0.45,0.35);return _m;})());
  // Diary (orange book on desk)
  desk.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.05,0.3),mat(0xcc6600));_m.position.set(-0.2,0.98,0);return _m;})());
  // Quill
  desk.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.01,0.01,0.3,6),mat(0xffffff));_m.position.set(0.4,1.05,0.1);_m.rotation.set(0,0,0.3);return _m;})());
  desk.position.set(0.3,0,3);
  south.add(desk);interactables1.south.push(desk);
  // Flower pot (left of desk)
  const flower=new THREE.Group();flower.userData.action=()=>puzzle1_6();
  flower.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.13,0.3,12),mat(0x8b4513));_m.position.set(0,0.15,0);return _m;})());
  flower.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.2,8,8),mat(0x2d8a2d));_m.position.set(0,0.4,0);return _m;})());
  // Small flower
  flower.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.06,6,6),mat(0xff69b4));_m.position.set(0,0.55,0);return _m;})());
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
  s.add((function(){const _m=new THREE.DirectionalLight(0xffcc66,0.5);_m.position.set(-2,5,2);return _m;})());
  s.add((function(){const _m=new THREE.PointLight(0xff8800,0.3,8);_m.position.set(0,1,0);return _m;})());

  // Floor + 4 walls
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(8,0.1,8),mat(0x555555));_m.position.set(0,-0.05,0);return _m;})());
  const wm=mat(0x6b4020);
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(8,5,0.15),wm.clone());_m.position.set(0,2.5,-4);return _m;})());
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.15,5,8),wm.clone());_m.position.set(-4,2.5,0);return _m;})());
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.15,5,8),wm.clone());_m.position.set(4,2.5,0);return _m;})());
  s.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(8,5,0.15),wm.clone());_m.position.set(0,2.5,4);return _m;})());

  // --- NORTH (look -Z): owl painting + recipe, x within ±1.5 ---
  const north=new THREE.Group();
  // Owl painting (left of center)
  const owl=new THREE.Group();owl.userData.action=()=>puzzle2_2();
  owl.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.9,1.1,0.06),mat(0xb8860b));_m.position.set(0,0,0);return _m;})());
  owl.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.9,0.04),mat(0x2a2a1a));_m.position.set(0,0,0.02);return _m;})());
  // Owl body
  owl.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.2,8,8),mat(0x5a4a3a));_m.position.set(0,-0.1,0.04);return _m;})());
  // Eyes (prominent)
  owl.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.09,8,8),mat(0xffd700));_m.position.set(-0.12,0.1,0.05);return _m;})());
  owl.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.09,8,8),mat(0xffd700));_m.position.set(0.12,0.1,0.05);return _m;})());
  // Pupils
  owl.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.04,6,6),mat(0x111111));_m.position.set(-0.12,0.1,0.1);return _m;})());
  owl.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.04,6,6),mat(0x111111));_m.position.set(0.12,0.1,0.1);return _m;})());
  owl.position.set(-0.7,2.5,-3.8);
  north.add(owl);interactables2.north.push(owl);
  // Recipe papers (right of center)
  const recipe=new THREE.Group();recipe.userData.action=()=>showRecipeWall();
  recipe.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.8,0.02),mat(0xf5e6c8));_m.position.set(0,0,0);return _m;})());
  recipe.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.45,0.6,0.02),mat(0xf0ddb8));_m.position.set(0.55,0.05,0);return _m;})());
  // Lines on paper
  recipe.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.02,0.01),mat(0x888888));_m.position.set(0,0.2,0.01);return _m;})());
  recipe.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.02,0.01),mat(0x888888));_m.position.set(0,0.05,0.01);return _m;})());
  recipe.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.02,0.01),mat(0x888888));_m.position.set(0,-0.1,0.01);return _m;})());
  recipe.position.set(0.8,2.2,-3.85);
  north.add(recipe);interactables2.north.push(recipe);
  s.add(north);wallGroups2.north=north;

  // --- WEST (look -X): bottles + crystal + door, z within ±1.5 ---
  const west=new THREE.Group();
  // Bottles rack (upper area)
  const bottles=new THREE.Group();bottles.userData.action=()=>puzzle2_3();
  bottles.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.1,1.2,1.6),mat(0x4a3222));_m.position.set(0,1.2,0);return _m;})());
  // Shelf boards
  bottles.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.03,1.6),mat(0x5a4232));_m.position.set(0,1.0,0);return _m;})());
  bottles.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.03,1.6),mat(0x5a4232));_m.position.set(0,1.5,0);return _m;})());
  // Colorful bottles
  const bColors=[0xe74c3c,0xe67e22,0xf1c40f,0x27ae60,0x2980b9,0x34495e,0x9b59b6];
  bColors.forEach((c,i)=>{
    const bt=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.3,8),mat(c));
    bt.position.set(0.08,1.2,-0.6+i*0.2);
    bottles.add(bt);
    // Bottle cap
    bottles.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.05,6),mat(0x8b4513));_m.position.set(0.08,1.36,-0.6+i*0.2);return _m;})());
  });
  bottles.position.set(-3.75,0,0.5);
  west.add(bottles);interactables2.west.push(bottles);
  // Crystal ball (lower, on small table)
  const crystal=new THREE.Group();crystal.userData.action=()=>clickCrystalBall();
  crystal.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.06,0.4),mat(0x4a3222));_m.position.set(0,0.8,0);return _m;})());
  crystal.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.8,0.05),mat(0x3d2b1f));_m.position.set(-0.2,0.4,0);return _m;})());
  crystal.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.8,0.05),mat(0x3d2b1f));_m.position.set(0.2,0.4,0);return _m;})());
  crystal.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,0.1,8),mat(0x4a3222));_m.position.set(0,0.88,0);return _m;})());
  crystal.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.22,16,12),new THREE.MeshStandardMaterial({color:0x9966ff,transparent:true,opacity:0.6,metalness:0.3,roughness:0.1}));_m.position.set(0,1.1,0);return _m;})());
  crystal.position.set(-3.3,0,-0.8);
  west.add(crystal);interactables2.west.push(crystal);
  // Door (back area)
  const door=new THREE.Group();door.userData.action=()=>switchRoom(1);
  door.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.1,2.4,1.1),mat(0x6a3a8a));_m.position.set(0,1.2,0);return _m;})());
  door.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.06,2.2,0.9),mat(0x2a1a3a));_m.position.set(0.02,1.2,0);return _m;})());
  door.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,8),mat(0xb8860b));_m.position.set(0.04,1.1,0.3);return _m;})());
  door.position.set(-3.85,0,-0.2);
  west.add(door);interactables2.west.push(door);
  s.add(west);wallGroups2.west=west;

  // --- EAST (look +X): music box + cabinet, z within ±1.5 ---
  const east=new THREE.Group();
  // Music box (on shelf, upper left)
  const mbox=new THREE.Group();mbox.userData.action=()=>puzzle2_1();
  // Shelf
  mbox.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.06,0.4),mat(0x4a3222));_m.position.set(0,1.4,0);return _m;})());
  // Box body
  mbox.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.25,0.25),mat(0x6b3a1a));_m.position.set(0,1.58,0);return _m;})());
  // Lid
  mbox.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.04,0.26),mat(0x7a4a2a));_m.position.set(0,1.72,0);return _m;})());
  // Handle (crank)
  mbox.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.15,6),mat(0xb8860b));_m.position.set(-0.22,1.58,0);_m.rotation.set(0,0,Math.PI/2);return _m;})());
  mbox.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.03,6,6),mat(0xb8860b));_m.position.set(-0.3,1.58,0);return _m;})());
  mbox.position.set(3.4,0,-0.7);
  east.add(mbox);interactables2.east.push(mbox);
  // Cabinet (large, right side)
  const cab=new THREE.Group();cab.userData.action=()=>puzzle2_4();
  cab.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.6,2.5,1.2),mat(0x5a3d2b));_m.position.set(0,1.25,0);return _m;})());
  // Door lines
  cab.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.02,2.2,0.01),mat(0x3d2b1f));_m.position.set(-0.31,1.25,0);return _m;})());
  // Lock (prominent gold)
  cab.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.1,0.08),mat(0xffd700));_m.position.set(-0.32,1.3,0);return _m;})());
  // Handles
  cab.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.03,6,6),mat(0xb8860b));_m.position.set(-0.32,1.5,0.2);return _m;})());
  cab.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.03,6,6),mat(0xb8860b));_m.position.set(-0.32,1.5,-0.2);return _m;})());
  cab.position.set(3.4,0,0.7);
  east.add(cab);interactables2.east.push(cab);
  s.add(east);wallGroups2.east=east;

  // --- SOUTH (look +Z): cauldron + scale, x within ±1.5 ---
  const south=new THREE.Group();
  // Cauldron (center)
  const cauldron=new THREE.Group();cauldron.userData.action=()=>puzzle2_5();
  // Pot body (half sphere)
  cauldron.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.6,16,12,0,Math.PI*2,0,Math.PI/2),mat(0x1a1a1a));_m.position.set(0,0.8,0);_m.rotation.set(Math.PI,0,0);return _m;})());
  // Rim
  cauldron.add((function(){const _m=new THREE.Mesh(new THREE.TorusGeometry(0.6,0.05,8,24),mat(0x333333));_m.position.set(0,0.8,0);_m.rotation.set(Math.PI/2,0,0);return _m;})());
  // 3 legs
  for(let i=0;i<3;i++){const a=(i/3)*Math.PI*2;cauldron.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.5,6),mat(0x444444));_m.position.set(Math.cos(a)*0.4,0.25,Math.sin(a)*0.4);return _m;})());}
  // Fire underneath
  cauldron.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.18,8,6),mat(0xff4400));_m.position.set(-0.08,0.12,0);return _m;})());
  cauldron.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.14,8,6),mat(0xff6600));_m.position.set(0.1,0.1,0.05);return _m;})());
  cauldron.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.1,6,6),mat(0xffaa00));_m.position.set(0,0.18,0);return _m;})());
  cauldron.position.set(-0.3,0,3);
  south.add(cauldron);interactables2.south.push(cauldron);
  // Scale (right of cauldron)
  const scale=new THREE.Group();scale.userData.action=()=>puzzle2_6();
  scale.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.3,0.1,12),mat(0xb8860b));_m.position.set(0,0.05,0);return _m;})());
  scale.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,1.0,8),mat(0x8b6914));_m.position.set(0,0.55,0);return _m;})());
  scale.add((function(){const _m=new THREE.Mesh(new THREE.BoxGeometry(1.0,0.04,0.04),mat(0xb8860b));_m.position.set(0,1.05,0);return _m;})());
  // Pans (visible discs)
  scale.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.03,12),mat(0x8b6914));_m.position.set(-0.42,0.95,0);return _m;})());
  scale.add((function(){const _m=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.03,12),mat(0x8b6914));_m.position.set(0.42,0.95,0);return _m;})());
  // Gem on one pan
  scale.add((function(){const _m=new THREE.Mesh(new THREE.SphereGeometry(0.08,8,8),mat(0x9900ff));_m.position.set(-0.42,1.0,0);return _m;})());
  scale.position.set(0.4,0,3);
  south.add(scale);interactables2.south.push(scale);
  s.add(south);wallGroups2.south=south;

  return s;
}
