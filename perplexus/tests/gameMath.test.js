import test from 'node:test';
import assert from 'node:assert/strict';
import {rotateQuarterTurn,localToWorld,checkpointReached,shouldRespawn,distance} from '../src/gameMath.js';
const close=(a,b)=>assert.ok(distance(a,b)<1e-10,`${a} != ${b}`);
test('four 90 degree rotations restore original position',()=>{
 for(const axis of ['x','z']){let p=[1,2,3];for(let i=0;i<4;i++)p=rotateQuarterTurn(p,axis);close(p,[1,2,3]);}
});
test('opposite rotations cancel without changing position',()=>{
 for(const axis of ['x','z'])close(localToWorld([2,-1,4],[{axis,sign:1},{axis,sign:-1}]),[2,-1,4]);
});
test('checkpoint proximity uses distance',()=>{assert.equal(checkpointReached([0,0,0],[.2,0,0]),true);assert.equal(checkpointReached([0,0,0],[1,0,0]),false)});
test('falling outside arena triggers respawn',()=>{assert.equal(shouldRespawn([0,-7,0]),true);assert.equal(shouldRespawn([0,0,9]),true);assert.equal(shouldRespawn([0,0,0]),false)});
