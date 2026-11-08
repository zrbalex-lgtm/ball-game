// All coordinates are in maze-local space. The tracks are continuous and intentionally simple.
export const level = {
  start: [-3.5, 0.3, 0], finish: [3.5, 0.3, 0],
  checkpoints: [[0.3, 0.3, 0]],
  tracks: [
    { from: [-4,0,0], to: [-2,0,0], width: 0.8, color: 0x31b7c8 },
    { from: [-2,0,0], to: [-0.7,0,0], width: 0.42, color: 0xf5b84d },
    { from: [-0.7,0,0], to: [0.8,0,0], width: 0.8, color: 0x31b7c8 },
    { from: [0.8,0,0], to: [2.3,0,0], width: 0.48, color: 0xf07f75 },
    { from: [2.3,0,0], to: [4,0,0], width: 0.8, color: 0x31b7c8 }
  ]
};
