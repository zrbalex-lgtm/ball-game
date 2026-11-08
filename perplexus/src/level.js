// Declarative local-space track network. Curves are represented by short connected chords.
// Future rotation-gated levels can extend this schema without changing the renderer.
const tracks=[];
function line(a,b,width,color){tracks.push({from:a,to:b,width,color});}
function curve(center,r,start,end,steps,width,color){
 let previous=[center[0]+r*Math.cos(start),center[1],center[2]+r*Math.sin(start)];
 for(let i=1;i<=steps;i++){const angle=start+(end-start)*i/steps;const next=[center[0]+r*Math.cos(angle),center[1],center[2]+r*Math.sin(angle)];line(previous,next,width,color);previous=next;}
}
line([-4,0,0],[-2.2,0,0],.8,0x31b7c8);
line([-2.2,0,0],[-.9,0,0],.43,0xf5b84d);
line([-.9,0,0],[0,0,0],.75,0x31b7c8);
curve([0,0,1],1,-Math.PI/2,0,8,.72,0x78d6a4);
line([1,0,1],[1,0,1.5],.72,0x78d6a4);
line([1,0,1.5],[2.2,.35,1.5],.78,0xf07f75);
line([2.2,.35,1.5],[3.5,.35,1.5],.8,0x31b7c8);
export const level={start:[-3.5,.3,0],finish:[3.3,.65,1.5],checkpoints:[[.3,.3,.04]],tracks};
