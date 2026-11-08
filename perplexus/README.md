# Perplexus 3D - experimental foundation

This prototype lives in its own Vite application. The original root `index.html` is untouched.

## Run

```bash
cd perplexus
npm install
npm run dev
npm run build
```

Use a desktop browser with WASD / arrow keys. For iOS sensors, serve over HTTPS and press Start to request permission. Calibrate while holding the device comfortably.

## Repository audit

The existing game is a monolithic root `index.html` using Three.js via CDN import map, device orientation input, custom movement physics, keyboard fallback, procedural maze features, and PeerJS networking. These ideas can inform input UX, but its movement and level architecture are not suitable as the 3D rigid-body simulation for Perplexus. The original implementation remains intact.

## Architecture

- `src/input.js`: permission, calibration, orientation normalization, filtering and keyboard fallback.
- `src/level.js`: declarative test track data.
- `src/main.js`: initial rendering, Rapier bodies, rotation and camera orchestration. Further modularization is required.
- `src/style.css`: touch-oriented UI.

## Validation status and known limitations

**This is an unvalidated experimental prototype, NOT a completed MVP.** Build, automated tests, physical iPad tests and playthrough have not been run in this environment. Do not merge or deploy without verification.

The test track is straight rather than a complete Perplexus level. Curves, ramps, genuinely traversable two-axis orientation transitions, finish accessibility tests, robust supported-contact gating for rotations, camera occlusion handling, deterministic tests, full geometry validation and mobile performance profiling remain to be implemented. The current scripted rotation holds the marble in maze-local space even if unsupported. Device tilt is currently modeled as a force on the ball rather than physically tilting gravity, and its orientation mapping needs real-device verification. These are intentional prototype limitations, not claims of completion.

## Manual iPad checklist

1. Open an HTTPS preview in Safari, tap Start and grant motion permission.
2. Calibrate in a comfortable landscape position; verify neutral remains still.
3. Tilt in four directions and check mapping, smoothness and sensitivity.
4. Try X and Z rotations; inspect whether the ball stays aligned with tracks.
5. Switch Overview, Follow and Free inspection; verify orbit does not move the ball.
6. Fall off a track, test respawn and checkpoint, then reach finish.
7. Rotate the device into portrait and back; check input remapping and safe areas.
8. Check frame rate, touch targets, and behavior after denying motion permission.

## Next iteration

Implement actual curved and vertical track primitives, design a physically traversable rotation-dependent level, separate physics/rotation/camera modules, add test harnesses, validate a full playthrough and only then label it MVP.
