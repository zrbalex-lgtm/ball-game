import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { TiltInput } from './input.js';
import { level } from './level.js';
import './style.css';

await RAPIER.init();
const app=document.querySelector('#app');
app.innerHTML=`<div id="hud"><strong>PERPLEXUS <small>3D marble maze · early access</small></strong><span id="status">Ready</span><button id="start">Start / Restart</button><button id="calibrate">Calibrate</button><button id="pause">Pause</button><select id="camera"><option value="overview">Overview</option><option value="follow">Follow</option><option value="free">Free inspection</option></select><button id="resetCamera">Reset camera</button><label>Sensitivity <input id="sensitivity" type="range" min=".3" max="2" step=".1" value="1"></label></div><div id="rotations"><button data-axis="x" data-sign="1">X +90°</button><button data-axis="x" data-sign="-1">X -90°</button><button data-axis="z" data-sign="1">Z +90°</button><button data-axis="z" data-sign="-1">Z -90°</button></div><div id="help">Tilt device or use WASD / arrows. Drag to orbit. R to respawn. Rotate only while the marble is supported.</div><div id="joystick" aria-label="Touch steering pad"><div id="joystick-knob"></div></div>`;
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);app.prepend(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#101827');
scene.add(new THREE.HemisphereLight(0xffffff,0x455677,2.1));
const light=new THREE.DirectionalLight(0xffffff,2.4);light.position.set(5,10,7);scene.add(light);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.05,100);
const maze=new THREE.Group();scene.add(maze);
const starfield=new THREE.Group();scene.add(starfield);
for(let i=0;i<150;i++){const a=i*2.399963,b=Math.acos(1-2*(i+.5)/150),r=22;const dot=new THREE.Mesh(new THREE.SphereGeometry(.018,4,4),new THREE.MeshBasicMaterial({color:0x8199c0}));dot.position.set(r*Math.sin(b)*Math.cos(a),r*Math.cos(b),r*Math.sin(b)*Math.sin(a));starfield.add(dot);}
const shell=new THREE.Mesh(new THREE.SphereGeometry(5.2,32,20),new THREE.MeshPhysicalMaterial({color:0x90b8df,transparent:true,opacity:.085,side:THREE.BackSide,depthWrite:false}));maze.add(shell);
const shellRim=new THREE.Mesh(new THREE.SphereGeometry(5.2,48,32),new THREE.MeshBasicMaterial({color:0x6c9fca,wireframe:true,transparent:true,opacity:.045,depthWrite:false}));maze.add(shellRim);
const equator=new THREE.Mesh(new THREE.TorusGeometry(5.19,.025,6,100),new THREE.MeshBasicMaterial({color:0x679abf,transparent:true,opacity:.28}));equator.rotation.x=Math.PI/2;maze.add(equator);
const world=new RAPIER.World({x:0,y:-9.81,z:0});
const tracks=[];
const qtmp=new THREE.Quaternion(),vtmp=new THREE.Vector3(),center=new THREE.Vector3();
for(const t of level.tracks){
 const a=new THREE.Vector3(...t.from),b=new THREE.Vector3(...t.to);const delta=b.clone().sub(a),length=delta.length();
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(length,.18,t.width),new THREE.MeshStandardMaterial({color:t.color,roughness:.45}));
 mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),delta.normalize());maze.add(mesh);
 // Narrow edge rails are visual guides; open gaps remain dangerous.
 const railMaterial=new THREE.MeshStandardMaterial({color:0xe8f1f9,metalness:.3,roughness:.38,transparent:true,opacity:.8});
 for(const side of [-1,1]){
  const rail=new THREE.Mesh(new THREE.BoxGeometry(length,.14,.045),railMaterial);
  rail.position.set(0,.16,side*(t.width/2-.025));mesh.add(rail);
 }
 const body=world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(mesh.position.x,mesh.position.y,mesh.position.z).setRotation(mesh.quaternion));
 world.createCollider(RAPIER.ColliderDesc.cuboid(length/2,.09,t.width/2).setFriction(1.2),body);
 tracks.push({mesh,body,localPos:mesh.position.clone(),localQ:mesh.quaternion.clone()});
}
const radius=.19;
const marbleMesh=new THREE.Mesh(new THREE.SphereGeometry(radius,24,16),new THREE.MeshStandardMaterial({color:0xe7edf6,metalness:.85,roughness:.19}));scene.add(marbleMesh);
const ball=world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(...level.start).setCcdEnabled(true).setLinearDamping(.35).setAngularDamping(.3));
world.createCollider(RAPIER.ColliderDesc.ball(radius).setFriction(1.4).setRestitution(0),ball);
const markers=[];
const originMarker=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.04,24),new THREE.MeshStandardMaterial({color:0x4b9ded,emissive:0x123a6e}));originMarker.position.set(level.start[0],level.start[1]-.2,level.start[2]);maze.add(originMarker);
for(const [i,p] of [...level.checkpoints,level.finish].entries()){
 const m=new THREE.Mesh(new THREE.TorusGeometry(.27,.045,8,20),new THREE.MeshBasicMaterial({color:i===level.checkpoints.length?0x66f6a2:0xffd064}));m.position.set(...p);m.rotation.x=Math.PI/2;maze.add(m);markers.push(m);
}
const input=new TiltInput();
const joystick=document.querySelector('#joystick'),knob=document.querySelector('#joystick-knob');
let joystickPointer=null;
function steerTouch(e){const b=joystick.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2,range=b.width*.38;const dx=e.clientX-cx,dy=e.clientY-cy,m=Math.max(1,Math.hypot(dx,dy)/range);const x=dx/range/m,z=dy/range/m;knob.style.transform=`translate(${x*range}px,${z*range}px)`;input.setTouch(x,z)}
joystick.addEventListener('pointerdown',e=>{e.preventDefault();joystickPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);steerTouch(e)});
joystick.addEventListener('pointermove',e=>{if(e.pointerId===joystickPointer)steerTouch(e)});
function releaseTouch(e){if(e.pointerId!==joystickPointer)return;joystickPointer=null;input.clearTouch();knob.style.transform='translate(0,0)'}
joystick.addEventListener('pointerup',releaseTouch);joystick.addEventListener('pointercancel',releaseTouch);let started=false,paused=false,checkpoint=null,rotation=null,mazeQ=new THREE.Quaternion(),cameraMode='overview',yaw=.6,pitch=.45,previousMode='overview',pointer=null,elapsed=0;
const status=document.querySelector('#status');
function respawn(){const p=new THREE.Vector3(...(checkpoint??level.start)).applyQuaternion(mazeQ);ball.setTranslation({x:p.x,y:p.y,z:p.z},true);ball.setLinvel({x:0,y:0,z:0},true);ball.setAngvel({x:0,y:0,z:0},true)}
function reset(){checkpoint=null;mazeQ.identity();maze.quaternion.identity();rotation=null;elapsed=0;respawn();started=true;paused=false;status.textContent='Playing'}
document.querySelector('#start').onclick=async()=>{const allowed=await input.permission();reset();if(!allowed)status.textContent='Keyboard mode (sensor unavailable)'};
document.querySelector('#calibrate').onclick=()=>input.calibrate();
document.querySelector('#pause').onclick=()=>{paused=!paused;status.textContent=paused?'Paused':'Playing'};
document.querySelector('#sensitivity').oninput=e=>input.sensitivity=Number(e.target.value);
document.querySelector('#camera').onchange=e=>{if(e.target.value==='free'&&cameraMode!=='free')previousMode=cameraMode;cameraMode=e.target.value};
document.querySelector('#resetCamera').onclick=()=>{yaw=.6;pitch=.45;cameraMode=previousMode==='free'?'overview':previousMode;document.querySelector('#camera').value=cameraMode};
document.querySelectorAll('[data-axis]').forEach(btn=>btn.onclick=()=>{
 if(!started||paused||rotation)return;
 const axis=new THREE.Vector3(btn.dataset.axis==='x'?1:0,0,btn.dataset.axis==='z'?1:0);
 const turn=new THREE.Quaternion().setFromAxisAngle(axis,Number(btn.dataset.sign)*Math.PI/2);
 const target=turn.multiply(mazeQ.clone());
 // Hold the marble's maze-local pose during a scripted rotation, then restore dynamics.
 const p=ball.translation(),r=ball.rotation();
 const local=new THREE.Vector3(p.x,p.y,p.z).applyQuaternion(mazeQ.clone().invert());
 const localQ=new THREE.Quaternion(r.x,r.y,r.z,r.w).premultiply(mazeQ.clone().invert());
 rotation={from:mazeQ.clone(),to:target,local,localQ,progress:0};
 ball.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased,true);
});
window.addEventListener('keydown',e=>{if(e.code==='KeyR')respawn()});
renderer.domElement.addEventListener('pointerdown',e=>{pointer={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(!pointer)return;yaw-=(e.clientX-pointer.x)*.007;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-pointer.y)*.007,-1.2,1.2);pointer={x:e.clientX,y:e.clientY}});
renderer.domElement.addEventListener('pointerup',()=>pointer=null);
function syncTracks(){maze.quaternion.copy(mazeQ);for(const t of tracks){vtmp.copy(t.localPos).applyQuaternion(mazeQ);qtmp.copy(mazeQ).multiply(t.localQ);t.body.setNextKinematicTranslation({x:vtmp.x,y:vtmp.y,z:vtmp.z});t.body.setNextKinematicRotation({x:qtmp.x,y:qtmp.y,z:qtmp.z,w:qtmp.w})}}
function step(dt){
 if(rotation){rotation.progress=Math.min(1,rotation.progress+dt/0.55);const eased=rotation.progress*rotation.progress*(3-2*rotation.progress);mazeQ.slerpQuaternions(rotation.from,rotation.to,eased);syncTracks();vtmp.copy(rotation.local).applyQuaternion(mazeQ);qtmp.copy(mazeQ).multiply(rotation.localQ);ball.setNextKinematicTranslation({x:vtmp.x,y:vtmp.y,z:vtmp.z});ball.setNextKinematicRotation({x:qtmp.x,y:qtmp.y,z:qtmp.z,w:qtmp.w});world.step();if(rotation.progress===1){rotation=null;ball.setBodyType(RAPIER.RigidBodyType.Dynamic,true);ball.setLinvel({x:0,y:0,z:0},true);ball.setAngvel({x:0,y:0,z:0},true)}return}
 syncTracks();
 const move=input.read(dt); // Gravity stays world-down; input applies a modest world-space planar force.
 ball.addForce({x:move.x*5,y:0,z:move.z*5},true);
 world.step();elapsed+=dt;
 const p=ball.translation();const local=new THREE.Vector3(p.x,p.y,p.z).applyQuaternion(mazeQ.clone().invert());
 for(const cp of level.checkpoints){if(local.distanceTo(new THREE.Vector3(...cp))<.4&&!checkpoint){checkpoint=cp;status.textContent='Checkpoint reached'}}
 if(local.distanceTo(new THREE.Vector3(...level.finish))<.36){started=false;status.textContent='Finish! '+Math.round(elapsed)+'s'}
 if(p.y < -6 || Math.hypot(p.x,p.z)>8)respawn();
}
function draw(){const p=ball.translation(),r=ball.rotation();marbleMesh.position.set(p.x,p.y,p.z);marbleMesh.quaternion.set(r.x,r.y,r.z,r.w);
 const target=cameraMode==='follow'?marbleMesh.position:center;const distance=cameraMode==='follow'?3.3:12;
 const dest=new THREE.Vector3(target.x+distance*Math.sin(yaw)*Math.cos(pitch),target.y+distance*Math.sin(pitch),target.z+distance*Math.cos(yaw)*Math.cos(pitch));
 camera.position.lerp(dest,.085);camera.lookAt(target);renderer.render(scene,camera)}
let accumulator=0,last=performance.now();
function loop(now){requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.05);last=now;if(started&&!paused){accumulator+=dt;let n=0;while(accumulator>=1/60&&n++<4){step(1/60);accumulator-=1/60}}draw()}
requestAnimationFrame(loop);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
