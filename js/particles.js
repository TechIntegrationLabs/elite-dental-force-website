/**
 * EDF Particle Engine v7 — Cinematic Scroll Experience
 * GSAP ScrollTrigger driven. 4 centered text formations. Lenis smooth scroll.
 * Brand: #00D4FF cyan on #071325 dark navy.
 */
(function(){
  if(window.innerWidth<768||window.matchMedia('(prefers-reduced-motion:reduce)').matches)return;

  // ── CDN Imports via importmap ──
  var im=document.createElement('script');
  im.type='importmap';
  im.textContent=JSON.stringify({imports:{
    three:'https://unpkg.com/three@0.160.0/build/three.module.js',
    'three/addons/':'https://unpkg.com/three@0.160.0/examples/jsm/'
  }});
  document.head.appendChild(im);

  var ms=document.createElement('script');
  ms.type='module';
  ms.textContent=`
import*as THREE from'three';
import{EffectComposer}from'three/addons/postprocessing/EffectComposer.js';
import{RenderPass}from'three/addons/postprocessing/RenderPass.js';
import{UnrealBloomPass}from'three/addons/postprocessing/UnrealBloomPass.js';

(function(){
const COUNT=14000;
const COL=[0.0,0.831,1.0]; // #00D4FF only
const DIM=[0.02,0.18,0.35];

// 4 text formations — centered, large, unmistakable
const TEXTS=[
  {text:"EDF",         fs:180},  // 0: Hero
  {text:"97%",         fs:200},  // 1: Proof
  {text:"EDiFi",       fs:140},  // 2: Platform
  {text:"DMAIC",       fs:120},  // 3: Process
];

// ── High-fidelity text sampling ──
function sample(text,fontSize,count){
  const c=document.createElement('canvas'),x=c.getContext('2d');
  c.width=900;c.height=500;
  x.fillStyle='#fff';
  x.font='900 '+fontSize+'px Manrope,Impact,Arial Black,sans-serif';
  x.textAlign='center';x.textBaseline='middle';
  x.fillText(text,c.width/2,c.height/2);

  const d=x.getImageData(0,0,c.width,c.height).data;
  const pts=[];
  // Dense sampling for crisp text
  for(let y=0;y<c.height;y+=2)
    for(let xi=0;xi<c.width;xi+=2)
      if(d[(y*c.width+xi)*4+3]>80)
        pts.push((xi/c.width-0.5)*48,-(y/c.height-0.5)*28,(Math.random()-0.5)*0.5);

  const out=new Float32Array(count*3);
  const sn=pts.length/3;
  if(sn===0){// fallback if font not loaded
    for(let i=0;i<count;i++){out[i*3]=(Math.random()-0.5)*20;out[i*3+1]=(Math.random()-0.5)*15;out[i*3+2]=0;}
    return out;
  }
  for(let i=0;i<count;i++){
    const si=(i%sn)*3;
    const j=i>=sn?0.2:0;
    out[i*3]=pts[si]+(Math.random()-0.5)*j;
    out[i*3+1]=pts[si+1]+(Math.random()-0.5)*j;
    out[i*3+2]=pts[si+2]+(Math.random()-0.5)*j*2;
  }
  return out;
}

function scattered(n){
  const o=new Float32Array(n*3);
  for(let i=0;i<n;i++){
    const a=Math.random()*6.283,r=10+Math.random()*45;
    o[i*3]=Math.cos(a)*r*(0.3+Math.random()*0.7);
    o[i*3+1]=(Math.random()-0.5)*40;
    o[i*3+2]=Math.sin(a)*r*0.2;
  }
  return o;
}

// Wait for fonts
document.fonts.ready.then(go);

function go(){
  const scatterPos=scattered(COUNT);
  const formations=TEXTS.map(t=>sample(t.text,t.fs,COUNT));

  // ── Renderer ──
  const cv=document.getElementById('edf-particles');
  if(!cv)return;
  const R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:'high-performance'});
  R.setSize(innerWidth,innerHeight);
  R.setPixelRatio(Math.min(devicePixelRatio,1.5));
  R.setClearColor(0,0);

  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,0.1,2000);
  cam.position.set(0,0,55);

  const comp=new EffectComposer(R);
  comp.addPass(new RenderPass(scene,cam));
  const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),1.5,0.4,0.85);
  bloom.strength=0.8;bloom.radius=0.5;bloom.threshold=0.1;
  comp.addPass(bloom);

  const geo=new THREE.SphereGeometry(0.065,4,4);
  const mat=new THREE.MeshBasicMaterial({toneMapped:false});
  const mesh=new THREE.InstancedMesh(geo,mat,COUNT);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

  const dum=new THREE.Object3D(),col=new THREE.Color();
  const pos=new Float32Array(COUNT*3);
  pos.set(formations[0]); // start at "EDF"
  for(let i=0;i<COUNT;i++)mesh.setColorAt(i,col.setRGB(COL[0],COL[1],COL[2]));
  mesh.instanceColor.needsUpdate=true;

  addEventListener('resize',()=>{
    cam.aspect=innerWidth/innerHeight;
    cam.updateProjectionMatrix();
    R.setSize(innerWidth,innerHeight);
    comp.setSize(innerWidth,innerHeight);
  });

  // ── Scroll State (driven by GSAP from outside) ──
  // scrollProgress: 0 = top of page, 1 = bottom
  // We map this to formation index + blend
  window.__edfScroll=0;

  const clk=new THREE.Clock();

  function tick(){
    requestAnimationFrame(tick);
    const time=clk.getElapsedTime();
    const dt=Math.min(clk.getDelta(),0.05)||0.016;
    const scroll=window.__edfScroll||0;

    // Map scroll to formation pairs
    // 6 sections: hero(0-16.6%), proof(16.6-33.3%), platform(33.3-50%), process(50-66.6%), scale(66.6-83.3%), cta(83.3-100%)
    // Formations: 0=EDF, 1=97%, 2=EDiFi, 3=DMAIC, then scattered
    // Section 0 (0-0.167): hold formation 0
    // Section 1 (0.167-0.333): transition 0→1 in first 30%, hold 1
    // Section 2 (0.333-0.5): transition 1→2 in first 30%, hold 2
    // Section 3 (0.5-0.667): transition 2→3 in first 30%, hold 3
    // Section 4 (0.667-0.833): transition 3→scattered in first 50%
    // Section 5 (0.833-1.0): hold scattered

    let fromIdx,toIdx,blend;
    const s=scroll;

    if(s<0.167){
      // Hero: hold EDF
      fromIdx=0;toIdx=0;blend=1;
    }else if(s<0.333){
      // Proof: transition to 97%
      const local=(s-0.167)/0.167;
      const t=Math.min(1,local/0.35); // transition in first 35% of section
      fromIdx=0;toIdx=1;blend=t;
    }else if(s<0.5){
      // Platform: transition to EDiFi
      const local=(s-0.333)/0.167;
      const t=Math.min(1,local/0.35);
      fromIdx=1;toIdx=2;blend=t;
    }else if(s<0.667){
      // Process: transition to DMAIC
      const local=(s-0.5)/0.167;
      const t=Math.min(1,local/0.35);
      fromIdx=2;toIdx=3;blend=t;
    }else if(s<0.833){
      // Scale: transition to scattered
      const local=(s-0.667)/0.167;
      const t=Math.min(1,local/0.5);
      fromIdx=3;toIdx=-1;blend=t;
    }else{
      // CTA: hold scattered
      fromIdx=-1;toIdx=-1;blend=1;
    }

    // Smoothstep the blend
    const e=blend*blend*(3-2*blend);

    const fp=fromIdx>=0?formations[fromIdx]:scatterPos;
    const tp=toIdx>=0?formations[toIdx]:scatterPos;

    const transitioning=blend>0.01&&blend<0.99&&fromIdx!==toIdx;
    // Hold: nearly frozen. Transition: smooth and fast.
    const spd=transitioning?0.08:0.005;

    for(let i=0;i<COUNT;i++){
      const i3=i*3;
      const tx=fp[i3]+(tp[i3]-fp[i3])*e;
      const ty=fp[i3+1]+(tp[i3+1]-fp[i3+1])*e;
      const tz=fp[i3+2]+(tp[i3+2]-fp[i3+2])*e;

      // Hold: imperceptible drift. Transition: gentle swirl.
      const breath=transitioning?0:Math.sin(time*0.15+i*0.0008)*0.01;
      const swX=transitioning?Math.sin(time*3+i*0.018)*(1-e)*2.5:0;
      const swY=transitioning?Math.cos(time*2.5+i*0.013)*(1-e)*1.8:0;

      pos[i3]+=(tx+swX-pos[i3])*spd;
      pos[i3+1]+=(ty+breath+swY-pos[i3+1])*spd;
      pos[i3+2]+=(tz-pos[i3+2])*spd;

      dum.position.set(pos[i3],pos[i3+1],pos[i3+2]);
      dum.updateMatrix();
      mesh.setMatrixAt(i,dum.matrix);

      // Cyan with subtle brightness variation
      const bright=transitioning?0.85+e*0.25:1.0+Math.sin(time*0.1+i*0.0005)*0.05;
      col.setRGB(COL[0]*bright,COL[1]*bright,COL[2]*bright);
      mesh.setColorAt(i,col);
    }

    mesh.instanceMatrix.needsUpdate=true;
    if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
    comp.render();
  }
  tick();
}
})();
`;
  document.head.appendChild(ms);
})();
