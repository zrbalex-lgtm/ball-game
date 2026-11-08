// Small pure helpers for deterministic simulation checks.
export const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
export function rotateQuarterTurn(point,axis,sign=1){
 const [x,y,z]=point;
 if(axis==='x')return [x,-sign*z,sign*y];
 if(axis==='z')return [-sign*y,sign*x,z];
 throw new Error('Unsupported rotation axis: '+axis);
}
export function localToWorld(point,turns){
 return turns.reduce((p,t)=>rotateQuarterTurn(p,t.axis,t.sign),point);
}
export function checkpointReached(point,checkpoint,radius=.4){
 return distance(point,checkpoint)<radius;
}
export function shouldRespawn(point){
 return point[1]<-6||Math.hypot(point[0],point[2])>8;
}
