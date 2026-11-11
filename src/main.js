import * as THREE from 'three';
import './style.css';

const mount = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9d8d1');
scene.fog = new THREE.FogExp2('#a9d8d1', 0.0075);
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 180);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
mount.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight('#e7ffed', '#376b67', 2.25));
const sun = new THREE.DirectionalLight('#fff0c8', 3.2);
sun.position.set(-22, 32, 18); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -34; sun.shadow.camera.right = 34; sun.shadow.camera.top = 34; sun.shadow.camera.bottom = -34;
scene.add(sun);
const fill = new THREE.DirectionalLight('#a3e4f2', 1.1); fill.position.set(24, 12, -30); scene.add(fill);

const mat = (color, roughness = 0.9) => new THREE.MeshStandardMaterial({ color, roughness });
const sand = mat('#dec896'), grass = mat('#508c68'), grassLight = mat('#73a968'), darkLeaf = mat('#286858'), leaf = mat('#4e9868'), trunk = mat('#80664b'), rockMat = mat('#688b81'), waterMat = new THREE.MeshStandardMaterial({ color: '#58b6b0', roughness: 0.25, metalness: 0.08, transparent: true, opacity: 0.82 });
const ground = new THREE.Mesh(new THREE.CircleGeometry(90, 72), waterMat); ground.rotation.x = -Math.PI / 2; ground.position.y = -1.6; ground.receiveShadow = true; scene.add(ground);
const island = new THREE.Group(); scene.add(island);
const land = new THREE.Mesh(new THREE.CylinderGeometry(21, 24, 3.5, 64, 1), sand); land.position.y = -0.5; land.receiveShadow = true; land.castShadow = true; island.add(land);
const turf = new THREE.Mesh(new THREE.CylinderGeometry(20.8, 23.8, 2.1, 64, 1), grass); turf.position.y = 0.12; turf.receiveShadow = true; island.add(turf);
const center = new THREE.Mesh(new THREE.CylinderGeometry(11, 12, 1.1, 48), grassLight); center.position.y = 0.72; center.receiveShadow = true; island.add(center);
const meadow = new THREE.Mesh(new THREE.CircleGeometry(10.95,48),grassLight); meadow.rotation.x=-Math.PI/2; meadow.position.y=1.28; island.add(meadow);
const surfaceY = (x,z) => Math.hypot(x,z) < 11 ? 1.28 : 1.18;

// Soft shallows around the island and curved sand coves.
for (let i = 0; i < 10; i++) {
  const a = i / 10 * Math.PI * 2;
  const reef = new THREE.Mesh(new THREE.SphereGeometry(3.1 + (i % 3), 14, 9), mat(i % 2 ? '#6bc5b7' : '#89cdb4'));
  reef.scale.set(1.7, 0.12, 0.8); reef.position.set(Math.cos(a) * 24, -1.18, Math.sin(a) * 20); reef.rotation.y = -a; scene.add(reef);
}

const rand = (seed) => { let x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function makePalm(x, z, scale = 1, hue = 0) {
  const g = new THREE.Group(); g.position.set(x, surfaceY(x,z), z); g.scale.setScalar(scale); island.add(g);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.13, .22, 3, 7), trunk); stem.position.y = 1.45; stem.rotation.z = -.12; stem.castShadow = true; g.add(stem);
  for (let i = 0; i < 7; i++) {
    const angle = i / 7 * Math.PI * 2;
    const frond = new THREE.Mesh(new THREE.ConeGeometry(.38, 3.1, 5), hue ? darkLeaf : leaf);
    frond.position.set(Math.cos(angle) * .96, 3, Math.sin(angle) * .96); frond.rotation.z = -Math.cos(angle) * .7; frond.rotation.x = Math.sin(angle) * .7; frond.castShadow = true; g.add(frond);
  }
  const crown = new THREE.Mesh(new THREE.SphereGeometry(.4, 8, 7), mat('#dfb55f')); crown.position.y = 3.05; g.add(crown);
}
function makeTree(x, z, scale = 1) {
  const g = new THREE.Group(); g.position.set(x, surfaceY(x,z), z); g.scale.setScalar(scale); island.add(g);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.18, .28, 2.5, 7), trunk); stem.position.y = 1.25; stem.castShadow = true; g.add(stem);
  for (let i = 0; i < 3; i++) { const crown = new THREE.Mesh(new THREE.SphereGeometry(1.35 - i * .12, 9, 7), i === 1 ? darkLeaf : leaf); crown.position.set((i - 1) * .58, 2.55 + (i === 1 ? .55 : 0), (i % 2) * .45); crown.castShadow = true; g.add(crown); }
}
for (let i = 0; i < 55; i++) {
  const a = rand(i + 1) * Math.PI * 2, r = 9.5 + rand(i + 92) * 9.2;
  if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < .6 && r < 15) continue;
  if (rand(i + 25) > .42) makePalm(Math.cos(a) * r, Math.sin(a) * r, .62 + rand(i + 52) * .55, rand(i + 69) > .5);
  else makeTree(Math.cos(a) * r, Math.sin(a) * r, .65 + rand(i + 82) * .48);
}
for (let i = 0; i < 32; i++) {
  const a = rand(i + 170) * Math.PI * 2, r = 5 + rand(i + 190) * 16;
  const x = Math.cos(a) * r, z = Math.sin(a) * r, size = .42 + rand(i + 215) * .45;
  const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), i % 2 ? darkLeaf : leaf);
  bush.position.set(x, surfaceY(x,z) + size * .5, z); bush.scale.y = .55; bush.castShadow = true; island.add(bush);
}
// Tiny islands rise from the lagoon in the distance.
for (let i = 0; i < 8; i++) {
  const a = i * Math.PI * 2 / 8 + .2, r = 39 + rand(i + 308) * 7;
  const islet = new THREE.Group(); islet.position.set(Math.cos(a) * r, -1.2, Math.sin(a) * r); scene.add(islet);
  const mound = new THREE.Mesh(new THREE.ConeGeometry(5 + rand(i + 310) * 3, 10 + rand(i + 330) * 5, 9), i % 2 ? mat('#4b8874') : mat('#568c73')); mound.position.y = 3.2; mound.scale.z = .78; mound.castShadow = true; islet.add(mound);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(4.4, 10, 7), mat('#6fa777')); cap.scale.set(1, .34, .76); cap.position.y = 7.6; islet.add(cap);
}
// A winding wooden boardwalk, with rounded planks and posts.
const boardwalk = new THREE.Group(); boardwalk.position.set(-5, 1.2, 5); boardwalk.rotation.y = -.52; island.add(boardwalk);
for (let i = 0; i < 22; i++) {
  const plank = new THREE.Mesh(new THREE.BoxGeometry(1.65, .16, .67), mat(i % 2 ? '#a98156' : '#bc9567')); plank.position.set(0, 0, i * .72); plank.castShadow = true; boardwalk.add(plank);
  if (i % 2 === 0) { const post = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, 1.05, 6), trunk); post.position.set(.9, -.42, i * .72); boardwalk.add(post); const rail = new THREE.Mesh(new THREE.BoxGeometry(.12, .12, 1.4), trunk); rail.position.set(.9, .06, i * .72 + .35); boardwalk.add(rail); }
}

// A bright little village marker, sailboat, and distant birds give the island scale.
const hut = new THREE.Group(); hut.position.set(7, surfaceY(7,-8), -8); island.add(hut);
const hutBase = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.4, 1.4, 7), mat('#c68f5b')); hutBase.position.y = .7; hut.add(hutBase);
const roof = new THREE.Mesh(new THREE.ConeGeometry(1.7, 1.5, 7), mat('#b76848')); roof.position.y = 2.05; roof.add(new THREE.Mesh(new THREE.ConeGeometry(1.72, .12, 7), mat('#e0b067'))); hut.add(roof);
const boat = new THREE.Group(); boat.position.set(13, -1.15, 11); scene.add(boat);
const hull = new THREE.Mesh(new THREE.ConeGeometry(.75, 4.5, 5), mat('#8b644a')); hull.rotation.z = Math.PI / 2; hull.rotation.y = Math.PI / 2; hull.scale.set(1, .32, .48); boat.add(hull);
const mast = new THREE.Mesh(new THREE.CylinderGeometry(.045, .055, 2.9, 6), trunk); mast.position.y = 1.4; boat.add(mast);
const sail = new THREE.Mesh(new THREE.BufferGeometry(), mat('#f4eee0')); sail.geometry.setAttribute('position', new THREE.Float32BufferAttribute([0,2.7,0, 0,.3,0, 1.35,.8,0],3)); sail.geometry.setIndex([0,1,2]); sail.geometry.computeVertexNormals(); boat.add(sail);

// Interactables: ocean litter, young mangroves, and a turtle hatchling.
const items = [];
function marker(x, z, color = '#d7bd66') {
  const ground = surfaceY(x,z);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(.7, .045, 6, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .8 })); halo.rotation.x = -Math.PI / 2; halo.position.set(x, ground + .11, z); island.add(halo);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(.015, .18, 1.3, 10, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .18, side: THREE.DoubleSide })); beam.position.set(x, ground + .68, z); island.add(beam);
  return { halo, beam };
}
function makePlastic(x, z, type) {
  const group = new THREE.Group(); group.position.set(x, surfaceY(x,z) + .02, z); island.add(group);
  if (type === 0) { const bottle = new THREE.Mesh(new THREE.CylinderGeometry(.13, .16, .56, 9), mat('#65c8c0', .32)); bottle.rotation.z = .55; group.add(bottle); const cap = new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.09,8), mat('#f2cf76')); cap.position.set(.16,.18,0); group.add(cap); }
  if (type === 1) { const cup = new THREE.Mesh(new THREE.CylinderGeometry(.17,.12,.34,8), mat('#f0eee0')); cup.rotation.z = -.42; group.add(cup); }
  if (type === 2) { const bag = new THREE.Mesh(new THREE.SphereGeometry(.3,8,7), mat('#df7760', .7)); bag.scale.set(1,.13,.8); group.add(bag); }
  group.traverse(o => { if (o.isMesh) o.castShadow = true; }); const m = marker(x,z,'#ecad61'); items.push({ type: 'trash', group, marker: m, active:true });
}
[[6.5,5],[2.5,9],[-8,-5],[-13,4],[12,-1]].forEach((p,i)=>makePlastic(p[0],p[1],i%3));
const plantSpots = [[-3,-8],[9,7],[-12,-2],[3,12],[-7,8]];
plantSpots.forEach(([x,z])=> { const m=marker(x,z,'#9bdb8f'); items.push({type:'plant',x,z,marker:m,active:true}); });

function makeTurtle(x,z) {
  const g=new THREE.Group(); g.position.set(x,surfaceY(x,z)+.02,z); island.add(g);
  const shell=new THREE.Mesh(new THREE.SphereGeometry(.52,12,8),mat('#4b7359')); shell.scale.set(1,.43,1.22); shell.castShadow=true; g.add(shell);
  const body=new THREE.Mesh(new THREE.SphereGeometry(.34,10,7),mat('#85a779')); body.scale.set(1,.52,1.4); g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),mat('#a3bd81')); head.position.z=-.66; head.position.y=.03; g.add(head);
  for(let i=0;i<4;i++){const leg=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),mat('#a3bd81'));leg.scale.set(1,.45,1.2);leg.position.set(i%2?-.4:.4,-.08,i<2?-.34:.38);g.add(leg);}
  const m=marker(x,z,'#f4df89'); return {type:'turtle',group:g,marker:m,active:true};
}
const turtle=makeTurtle(3,-1); items.push(turtle);

// Players are cheerful, readable little explorers with backpack and animated idle bob.
function makePlayer(color, accent, name) {
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.36,.65,4,8),mat(color)); body.position.y=1.05; body.castShadow=true; g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.31,12,10),mat('#c98761')); head.position.y=1.72; head.castShadow=true; g.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.32,10,7,0,Math.PI*2,0,Math.PI*.57),mat('#263f3d')); hair.position.y=1.86; g.add(hair);
  const pack=new THREE.Mesh(new THREE.BoxGeometry(.36,.48,.2),mat(accent)); pack.position.set(0,1.12,.36); g.add(pack);
  const hat=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.09,12),mat('#e7bd72')); hat.position.y=2.03; g.add(hat);
  const brim=new THREE.Mesh(new THREE.CylinderGeometry(.23,.3,.22,10),mat('#d6a957')); brim.position.y=1.98; g.add(brim);
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.55,16),new THREE.MeshBasicMaterial({color:'#1e4d48',transparent:true,opacity:.22})); shadow.rotation.x=-Math.PI/2; shadow.position.y=.02; g.add(shadow);
  const tag=new THREE.Sprite(new THREE.SpriteMaterial({map:makeLabel(name),transparent:true,depthTest:false})); tag.position.y=2.65; tag.scale.set(1.15,.33,1); g.add(tag);
  scene.add(g); return {group:g, speed:0, facing:0, baseY:1.28};
}
function makeLabel(text){const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.fillStyle='rgba(12,54,49,.78)';x.beginPath();x.roundRect(24,8,208,48,22);x.fill();x.fillStyle='#fff5dc';x.font='bold 22px system-ui';x.textAlign='center';x.fillText(text,128,40);const tex=new THREE.CanvasTexture(c);return tex;}
const player1=makePlayer('#e0a35f','#e27755','YOU · P1'); player1.group.position.set(-1,player1.baseY,2);
let player2=null;
const keyState={};
const cameraTarget=new THREE.Vector3();
let started=false, soundOn=false, toastTimer=0;
const stats={trash:0,plants:0,turtle:false,health:64};
const ui={recovery:document.querySelector('#recovery'),recoveryBar:document.querySelector('#recoveryBar'),healthScore:document.querySelector('#healthScore'),healthBar:document.querySelector('#healthBar')};
const toast=(text)=>{document.querySelector('#toastText').textContent=text;document.querySelector('#toast').classList.add('show');toastTimer=2.2;};
function refreshUI(){
  document.querySelector('#trashCount').textContent=`${stats.trash}/3`; document.querySelector('#plantCount').textContent=`${stats.plants}/3`; document.querySelector('#turtleState').textContent=stats.turtle?'✓':'—';
  document.querySelector('#obj-trash').classList.toggle('done',stats.trash>=3); document.querySelector('#obj-plant').classList.toggle('done',stats.plants>=3); document.querySelector('#obj-turtle').classList.toggle('done',stats.turtle);
  stats.health=Math.min(100,64+stats.trash*3+stats.plants*4+(stats.turtle?5:0)); const pct=12+Math.round((stats.trash+stats.plants+(stats.turtle?1:0))/7*88);
  ui.healthScore.textContent=stats.health;ui.healthBar.style.width=`${stats.health}%`;ui.recovery.textContent=`${pct}%`;ui.recoveryBar.style.width=`${pct}%`;
  if(stats.trash>=3&&stats.plants>=3&&stats.turtle) {document.querySelector('#finalTrash').textContent=stats.trash;document.querySelector('#finalPlants').textContent=stats.plants;setTimeout(()=>document.querySelector('#completeScreen').classList.add('show'),900);}
}
function toggleCoop(on){
  if(on&&!player2){player2=makePlayer('#7bb9c7','#478f9a','FRIEND · P2');player2.group.position.copy(player1.group.position).add(new THREE.Vector3(1,0,1));}
  if(!on&&player2){scene.remove(player2.group);player2=null;}
  document.querySelector('#partyLabel').textContent=player2?'2 / 2 explorers':'1 / 2 explorers';document.querySelector('#partyHint').innerHTML=player2?'Local co-op · shared island':'Press <kbd>2</kbd> to join together';document.querySelector('#joinButton').classList.toggle('hidden',!started||!!player2);toast(player2?'A friend joined the expedition!':'Playing solo');
}
function nearestAction(){
  const candidates=[player1,...(player2?[player2]:[])];let best=null,dist=2.5,actor=null;
  for(const p of candidates) for(const it of items){if(!it.active)continue;const d=p.group.position.distanceTo(new THREE.Vector3(it.group?.position.x??it.x,0,it.group?.position.z??it.z));if(d<dist){dist=d;best=it;actor=p;}}
  const box=document.querySelector('#interaction'); if(best){box.classList.add('visible');document.querySelector('#interactionText').textContent=best.type==='trash'?'Collect ocean plastic':best.type==='plant'?'Plant a mangrove':'Help the hatchling';box.dataset.item=items.indexOf(best);box.dataset.actor=actor===player1?'1':'2';}else box.classList.remove('visible');
}
function interact(){const box=document.querySelector('#interaction');if(!box.classList.contains('visible'))return;const item=items[Number(box.dataset.item)];if(!item?.active)return;
  item.active=false;item.marker.halo.visible=false;item.marker.beam.visible=false;
  if(item.type==='trash'){island.remove(item.group);stats.trash++;toast('Shoreline cleared · the sea says thanks!');}
  if(item.type==='plant'){const sapling=new THREE.Group();sapling.position.set(item.x,surfaceY(item.x,item.z),item.z);island.add(sapling);const stem=new THREE.Mesh(new THREE.CylinderGeometry(.055,.08,.72,6),trunk);stem.position.y=.38;sapling.add(stem);for(let j=0;j<5;j++){const l=new THREE.Mesh(new THREE.SphereGeometry(.22,7,6),leaf);l.scale.set(.7,.36,1.15);l.position.set(Math.cos(j*1.25)*.21,.65+Math.sin(j)*.08,Math.sin(j*1.25)*.2);sapling.add(l);}stats.plants++;toast('A new mangrove takes root!');}
  if(item.type==='turtle'){stats.turtle=true;island.remove(item.group);toast('The hatchling found its way home!');}
  refreshUI();nearestAction();
}
window.addEventListener('keydown',e=>{keyState[e.key.toLowerCase()]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key.toLowerCase()==='e'||e.key===' '){if(!started){startGame(false);return;}interact();}if(e.key==='2'&&started)toggleCoop(!player2);if(e.key.toLowerCase()==='h')document.querySelector('#helpModal').classList.add('show');});
window.addEventListener('keyup',e=>keyState[e.key.toLowerCase()]=false);
function startGame(coop){started=true;document.querySelector('#startScreen').classList.add('hide');document.querySelector('#joinButton').classList.toggle('hidden',coop);if(coop)toggleCoop(true);toast('Welcome to Piaynemo. Let’s help this island bloom!');}
document.querySelector('#startButton').addEventListener('click',()=>startGame(false));document.querySelector('#startCoop').addEventListener('click',()=>startGame(true));document.querySelector('#joinButton').addEventListener('click',()=>toggleCoop(true));
document.querySelector('#helpBtn').addEventListener('click',()=>document.querySelector('#helpModal').classList.add('show'));document.querySelector('#closeHelp').addEventListener('click',()=>document.querySelector('#helpModal').classList.remove('show'));
document.querySelector('#soundBtn').addEventListener('click',e=>{soundOn=!soundOn;e.currentTarget.classList.toggle('active',soundOn);e.currentTarget.textContent=soundOn?'♫':'♩';toast(soundOn?'Island ambience on':'Island ambience off');});
document.querySelector('#playAgain').addEventListener('click',()=>location.reload());document.querySelector('#mobileAction').addEventListener('pointerdown',e=>{e.preventDefault();interact();});
for(const button of document.querySelectorAll('.dpad button')){const moveKey={up:'w',down:'s',left:'a',right:'d'}[button.dataset.dir];button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);keyState[moveKey]=true;});for(const ev of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(ev,()=>keyState[moveKey]=false);}

function movePlayer(p,keys,delta){let x=0,z=0;if(keyState[keys[0]])z-=1;if(keyState[keys[1]])z+=1;if(keyState[keys[2]])x-=1;if(keyState[keys[3]])x+=1;
  const moving=x!==0||z!==0;if(moving){const length=Math.hypot(x,z);x/=length;z/=length;p.group.position.x+=x*5.2*delta;p.group.position.z+=z*5.2*delta;p.facing=Math.atan2(x,z);p.group.rotation.y=p.facing;p.speed=Math.min(1,p.speed+delta*5);}else p.speed=Math.max(0,p.speed-delta*4);
  const radius=Math.hypot(p.group.position.x,p.group.position.z);if(radius>19.5){p.group.position.x*=19.5/radius;p.group.position.z*=19.5/radius;}
  p.baseY=surfaceY(p.group.position.x,p.group.position.z);
  p.group.position.y=p.baseY+Math.sin(performance.now()*.009+(p===player2?1:0))*.035*p.speed;
}
let last=performance.now();
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.04);last=now;
  if(started){movePlayer(player1,['w','s','a','d'],dt);if(player2)movePlayer(player2,['arrowup','arrowdown','arrowleft','arrowright'],dt);nearestAction();document.querySelector('#mapPlayer').style.left=`${50+player1.group.position.x*1.05}%`;document.querySelector('#mapPlayer').style.top=`${50+player1.group.position.z*1.05}%`;}
  // Sway palms, sparkle of water, and slow camera easing.
  island.children.forEach((obj,i)=>{if(obj.children?.length>5&&obj.position.y===0&&obj.geometry===undefined&&obj!==boardwalk&&obj!==hut){obj.rotation.z=Math.sin(now*.0008+i)*.008;}});
  ground.position.y=-1.6+Math.sin(now*.0007)*.035;
  const follow=player2?player1.group.position.clone().lerp(player2.group.position,.35):player1.group.position;
  cameraTarget.set(follow.x+14,21,follow.z+17);camera.position.lerp(cameraTarget,.045);camera.lookAt(follow.x,1.05,follow.z);
  if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)document.querySelector('#toast').classList.remove('show');}
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));});
