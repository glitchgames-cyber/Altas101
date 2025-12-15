// =============== GLOBAL CONFIG =============== //
let playerSpeed = 10;      // movement base speed
let sprintMultiplier = 1.7;

// Selected hotbar index
let selectedSlot = 1;

// Inventory and tools
const inventory = {
 grass:200, dirt:200, farmland:0, seed:30
};

let currentTool = "place";   // place/hoe/remove
let selectedBlock = "grass"; // block to place
let xp = 0;

// Update hotbar visual
function highlightHotbar(){
 document.querySelectorAll(".slot").forEach((s,i)=>{
   s.classList.toggle("selected", i+1===selectedSlot);
 });
}
highlightHotbar();

// Hotbar tool mapping
function setHotbar(n){
 selectedSlot=n;highlightHotbar();
 switch(n){
  case 1:currentTool="place";selectedBlock="grass";break;
  case 2:currentTool="place";selectedBlock="dirt";break;
  case 3:currentTool="place";selectedBlock="farmland";break;
  case 4:currentTool="place";selectedBlock="seed";break;
  case 5:currentTool="hoe";break;
  case 6:currentTool="remove";break;
 }
 updateInv();
}

// Key events for hotbar
window.addEventListener("keydown",e=>{
 const k=parseInt(e.key);
 if(k>=1 && k<=6) setHotbar(k);
});

// ============== CANVAS & WEBGL INIT ============== //
const canvas = document.getElementById("glcanvas");
canvas.width = innerWidth;
canvas.height = innerHeight;

const gl = canvas.getContext("webgl", {antialias:true});
gl.enable(gl.DEPTH_TEST);

// ========== SHADERS ========== //
const vs = `
attribute vec3 aPos;
uniform mat4 uMVP;
void main(){
 gl_Position = uMVP * vec4(aPos,1.0);
}
`;
const fs = `
precision mediump float;
uniform vec3 uColor;
void main(){
 gl_FragColor = vec4(uColor,1.0);
}
`;

function shader(type,src){let s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
const pr=gl.createProgram();
gl.attachShader(pr,shader(gl.VERTEX_SHADER,vs));
gl.attachShader(pr,shader(gl.FRAGMENT_SHADER,fs));
gl.linkProgram(pr);
gl.useProgram(pr);

// ========== BLOCK MODEL (CUBE) ========== //
const cube = new Float32Array([
 // 12 triangles (2 per face)
 -0.5,-0.5, 0.5,  0.5,-0.5,0.5,   0.5,0.5,0.5,
 -0.5,-0.5, 0.5,  0.5,0.5,0.5,   -0.5,0.5,0.5,
 // back
 -0.5,-0.5,-0.5, -0.5,0.5,-0.5,  0.5,0.5,-0.5,
 -0.5,-0.5,-0.5, 0.5,0.5,-0.5,   0.5,-0.5,-0.5,
 // left
 -0.5,-0.5,0.5, -0.5,0.5,0.5, -0.5,0.5,-0.5,
 -0.5,-0.5,0.5, -0.5,0.5,-0.5, -0.5,-0.5,-0.5,
 // right
 0.5,-0.5,0.5, 0.5,-0.5,-0.5, 0.5,0.5,-0.5,
 0.5,-0.5,0.5, 0.5,0.5,-0.5, 0.5,0.5,0.5,
 // top
 -0.5,0.5,0.5,  0.5,0.5,0.5,  0.5,0.5,-0.5,
 -0.5,0.5,0.5,  0.5,0.5,-0.5,-0.5,0.5,-0.5,
 // bottom
 -0.5,-0.5,0.5, -0.5,-0.5,-0.5, 0.5,-0.5,-0.5,
 -0.5,-0.5,0.5, 0.5,-0.5,-0.5, 0.5,-0.5,0.5,
]);

const vb=gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,vb);
gl.bufferData(gl.ARRAY_BUFFER,cube,gl.STATIC_DRAW);

const aPos=gl.getAttribLocation(pr,"aPos");
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,0,0);

const uMVP=gl.getUniformLocation(pr,"uMVP");
const uColor=gl.getUniformLocation(pr,"uColor");

// ========== MATRIX MATH ========== //
function perspective(fov,asp,near,far){
 const f=1/Math.tan(fov/2);
 return new Float32Array([
  f/asp,0,0,0,
  0,f,0,0,
  0,0,(far+near)/(near-far),-1,
  0,0,(2*far*near)/(near-far),0
 ]);
}
function mul(a,b){
 const r=new Float32Array(16);
 for(let i=0;i<4;i++){
  for(let j=0;j<4;j++){
   r[i*4+j]=a[i*4+0]*b[j+0]+a[i*4+1]*b[j+4]+a[i*4+2]*b[j+8]+a[i*4+3]*b[j+12];
  }
 }
 return r;
}
function identity(){const m=new Float32Array(16);m[0]=m[5]=m[10]=m[15]=1;return m;}
function translate(x,y,z){let m=identity();m[12]=x;m[13]=y;m[14]=z;return m;}
function rotateY(a){
 let c=Math.cos(a),s=Math.sin(a);
 return new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]);
}
function rotateX(a){
 let c=Math.cos(a),s=Math.sin(a);
 return new Float32Array([1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]);
}

// ========== CAMERA ========== //
const cam={
 x:0,y:3,z:0,
 yaw:0,pitch:0,
 vy:0,
 grounded:false
};

window.addEventListener("mousemove",e=>{
 if(document.pointerLockElement===canvas){
  cam.yaw -= e.movementX*0.002;
  cam.pitch -= e.movementY*0.002;
  cam.pitch=Math.max(-1.2,Math.min(1.2,cam.pitch));
 }
});

canvas.addEventListener("click",()=>canvas.requestPointerLock());

const keys={};
window.addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;});
window.addEventListener("keyup",e=>{keys[e.key.toLowerCase()]=false;});

// ========== WORLD STORAGE ========== //
const blocks=new Map();
const crops=new Map();

// Create flat world layer
const WORLD_SIZE=180;
for(let x=-WORLD_SIZE;x<=WORLD_SIZE;x++){
 for(let z=-WORLD_SIZE;z<=WORLD_SIZE;z++){
   blocks.set(`${x},${z}`,"grass");
 }
}

// Crop types
const CROP={
 wheat:{
  stages:3,
  duration:[5,6,8],
  yield:3,
  xp:4
 }
};

// Raycast
function rayTarget(){
 const dir=[Math.sin(cam.yaw)*Math.cos(cam.pitch), -Math.sin(cam.pitch), Math.cos(cam.yaw)*Math.cos(cam.pitch)];
 let x=cam.x,y=cam.y,z=cam.z;
 for(let i=0;i<12;i+=0.1){
  x+=dir[0]*0.1; y+=dir[1]*0.1; z+=dir[2]*0.1;
  const gx=Math.floor(x), gz=Math.floor(z);
  const k=`${gx},${gz}`;
  if(blocks.has(k)||crops.has(k))return{gx,gz};
 }
 return null;
}

// Click actions
canvas.addEventListener("mousedown",()=>{
 const t=rayTarget();
 if(!t)return;
 const k=`${t.gx},${t.gz}`;
 const b=blocks.get(k);

 // Hoe to farmland
 if(currentTool==="hoe"){
  if(b==="grass"||b==="dirt"){
   blocks.set(k,"farmland");
   inventory.farmland++;inventory[b]--;
   updateInv();
  }
  return;
 }

 // Remove
 if(currentTool==="remove"){
  if(crops.has(k)){
   const c=crops.get(k);
   if(c.stage>=CROP.wheat.stages){
    inventory.seed+=CROP.wheat.yield;
    xp+=CROP.wheat.xp;
    crops.delete(k);
   }
  }
  blocks.set(k,"dirt");
  updateInv();
  return;
 }

 // Plant seed OR place block
 if(currentTool==="place"){
  if(selectedBlock==="seed"){
   if(b==="farmland"&&!crops.has(k)&&inventory.seed>0){
    crops.set(k,{type:"wheat",planted:performance.now()/1000,stage:0});
    inventory.seed--;updateInv();
   }
   return;
  }
  if(inventory[selectedBlock]>0){
   blocks.set(k,selectedBlock);
   inventory[selectedBlock]--;
   updateInv();
  }
 }
});

// =================== UPDATE UI =================== //
const invEl=document.getElementById("invData");
function updateInv(){
 invEl.innerHTML = `
 <b>Inventory</b><br>
 Grass: ${inventory.grass} |
 Dirt: ${inventory.dirt} |
 Farmland: ${inventory.farmland} |
 Seeds: ${inventory.seed}<br>
 Tool: ${currentTool} | Block: ${selectedBlock}<br>
 XP: ${xp}
 `;
 const p = Math.min(100,xp/100*100);
 document.getElementById("xpFill").style.width = p+"%";
}
updateInv();

// =================== BLOCK COLORS =================== //
function blockColor(type){
 switch(type){
  case "grass": return [0.15,0.65,0.25];
  case "dirt": return [0.45,0.26,0.05];
  case "farmland": return [0.33,0.20,0.07];
  default: return [1,1,1];
 }
}

function cropColor(stage){
 return [
   1.0,
   1.0-stage*0.25,
   0.4
 ];
}

// =================== DRAW WORLD =================== //
function draw(){
 gl.clearColor(0.07,0.1,0.15,1);
 gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

 const p = perspective(1.1, canvas.width/canvas.height, 0.1, 500);
 let view = identity();
 view = mul(rotateX(cam.pitch),mul(rotateY(cam.yaw),view));
 view[12] -= cam.x;
 view[13] -= cam.y;
 view[14] -= cam.z;

 for(const [k,v] of blocks){
  const [x,z]=k.split(",").map(Number);
  const m = translate(x,0,z);
  const mvp = mul(p,mul(view,m));
  gl.uniformMatrix4fv(uMVP,false,mvp);
  gl.uniform3f(uColor,...blockColor(v));
  gl.drawArrays(gl.TRIANGLES,0,36);
 }

 for(const [k,c] of crops){
  const [x,z]=k.split(",").map(Number);
  const grow = cropColor(c.stage);
  const m = translate(x,1,z);
  const mvp = mul(p,mul(view,m));
  gl.uniformMatrix4fv(uMVP,false,mvp);
  gl.uniform3f(uColor,...grow);
  gl.drawArrays(gl.TRIANGLES,0,36);
 }
}

// =================== UPDATE CROPS =================== //
function updateCrops(dt){
 const now=performance.now()/1000;
 for(const [k,c] of crops){
  let elapsed = now-c.planted;
  const t=CROP[c.type];
  let time=0;
  let stage=0;
  for(let i=0;i<t.stages;i++){
    time+=t.duration[i];
    if(elapsed>=time)stage=i+1;
  }
  c.stage=stage;
 }
}

// =================== CAMERA PHYSICS =================== //
function updateMovement(dt){
 let sp=playerSpeed*(keys["shift"]?sprintMultiplier:1);
 let forward=[Math.sin(cam.yaw),0,Math.cos(cam.yaw)];
 let right=[Math.cos(cam.yaw),0,-Math.sin(cam.yaw)];

 if(keys["w"]){cam.x+=forward[0]*sp*dt; cam.z+=forward[2]*sp*dt;}
 if(keys["s"]){cam.x-=forward[0]*sp*dt; cam.z-=forward[2]*sp*dt;}
 if(keys["a"]){cam.x-=right[0]*sp*dt; cam.z-=right[2]*sp*dt;}
 if(keys["d"]){cam.x+=right[0]*sp*dt; cam.z+=right[2]*sp*dt;}

 cam.vy-=20*dt;
 cam.y+=cam.vy*dt;
 if(cam.y<1.5){cam.y=1.5;cam.vy=0;cam.grounded=true;}

 if(keys[" "] && cam.grounded){
  cam.vy=9;cam.grounded=false;
 }
}

// =================== CROP HUD =================== //
function updateCropHUD(){
 const t = rayTarget();
 const hud=document.getElementById("cropHUD");
 const fill=document.getElementById("cropFill");
 if(!t){hud.style.display="none";return;}
 const k=`${t.gx},${t.gz}`;
 if(!crops.has(k)){hud.style.display="none";return;}
 const c=crops.get(k);
 const type=CROP[c.type];
 const now=performance.now()/1000;
 let elapsed=now-c.planted;
 let need=type.duration[c.stage];
 let before=0;
 for(let i=0;i<c.stage;i++)before+=type.duration[i];
 let pct=Math.min(1,(elapsed-before)/need);

 fill.style.width=(pct*100)+"%";
 hud.style.display="block";
}

// =================== HIGHLIGHT BLOCK =================== //
function highlightBlock(){
 const hit=rayTarget();
 if(!hit)return;
 gl.uniform3f(uColor,1,1,0); // gold
 const p=perspective(1.1,canvas.width/canvas.height,0.1,500);
 let v=identity();
 v=mul(rotateX(cam.pitch),mul(rotateY(cam.yaw),v));
 v[12]-=cam.x;v[13]-=cam.y;v[14]-=cam.z;

 const m=translate(hit.gx,0.01,hit.gz);
 const mvp=mul(p,mul(v,m));
 gl.uniformMatrix4fv(uMVP,false,mvp);
 gl.drawArrays(gl.TRIANGLES,0,36);
}

// =================== MAIN LOOP =================== //
let last=performance.now();
function loop(){
 const now=performance.now();
 const dt=(now-last)/1000;
 last=now;

 updateMovement(dt);
 updateCrops(dt);
 updateCropHUD();

 draw();
 highlightBlock();

 requestAnimationFrame(loop);
}
loop();

