export class TiltInput {
  constructor() { this.keys = new Set(); this.raw = {x:0,z:0}; this.zero={x:0,z:0}; this.filtered={x:0,z:0}; this.available=false; this.sensitivity=1; this.deadzone=0.04;
    window.addEventListener('keydown',e=>{if(['INPUT','SELECT'].includes(e.target?.tagName))return;this.keys.add(e.code);if(e.code.startsWith('Arrow'))e.preventDefault();});
    window.addEventListener('keyup',e=>this.keys.delete(e.code));window.addEventListener('blur',()=>this.keys.clear());
    window.addEventListener('deviceorientation',e=>{if(e.beta==null||e.gamma==null)return;this.available=true;const a=screen.orientation?.angle??window.orientation??0;const rad=a*Math.PI/180;const x=e.gamma/35,z=e.beta/35;this.raw.x=x*Math.cos(rad)-z*Math.sin(rad);this.raw.z=x*Math.sin(rad)+z*Math.cos(rad);});
  }
  async permission(){const api=window.DeviceOrientationEvent;if(typeof api?.requestPermission==='function'){try{return (await api.requestPermission())==='granted'}catch{return false}}return !!api}
  calibrate(){this.zero={...this.raw};this.filtered={x:0,z:0}}
  read(dt){const keyX=Number(this.keys.has('KeyD')||this.keys.has('ArrowRight'))-Number(this.keys.has('KeyA')||this.keys.has('ArrowLeft'));const keyZ=Number(this.keys.has('KeyS')||this.keys.has('ArrowDown'))-Number(this.keys.has('KeyW')||this.keys.has('ArrowUp'));const shape=v=>Math.abs(v)<this.deadzone?0:Math.sign(v)*Math.min(1,(Math.abs(v)-this.deadzone)/(1-this.deadzone));const x=keyX||shape((this.raw.x-this.zero.x)*this.sensitivity),z=keyZ||shape((this.raw.z-this.zero.z)*this.sensitivity);const alpha=1-Math.exp(-dt*10);this.filtered.x+=(x-this.filtered.x)*alpha;this.filtered.z+=(z-this.filtered.z)*alpha;return this.filtered}
}
