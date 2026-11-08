import test from 'node:test';
import assert from 'node:assert/strict';
import {level} from '../src/level.js';
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
test('all track endpoints and widths are valid',()=>{
 for(const [i,t] of level.tracks.entries()){
  assert.equal(t.from.length,3,`track ${i} start`);
  assert.equal(t.to.length,3,`track ${i} end`);
  assert.ok(t.from.concat(t.to).every(Number.isFinite));
  assert.ok(t.width>=.4);
  assert.ok(distance(t.from,t.to)>.001);
 }
});
test('track segments form a continuous ordered route',()=>{
 for(let i=1;i<level.tracks.length;i++)assert.ok(distance(level.tracks[i-1].to,level.tracks[i].from)<.001,`gap before track ${i}`);
});
test('start and finish project onto a track',()=>{
 function segmentDistance(p,a,b){const v=b.map((x,i)=>x-a[i]);const w=p.map((x,i)=>x-a[i]);const t=Math.max(0,Math.min(1,w.reduce((s,x,i)=>s+x*v[i],0)/v.reduce((s,x)=>s+x*x,0)));return distance(p,a.map((x,i)=>x+t*v[i]));}
 for(const point of [level.start,level.finish,...level.checkpoints]){
  assert.ok(level.tracks.some(t=>segmentDistance(point,t.from,t.to)<.5),`unreachable marker ${point}`);
 }
});
