# Evil Platformer

A single-file troll platformer with 56 mutations, 12 handcrafted levels, endless generation, a level editor, and P2P / LAN multiplayer.

The whole game is `Evil Platformer.html`. No build step, no framework, and no runtime dependencies. Optional PWA files (`manifest.webmanifest`, `icon-*`) live beside it.

## Play

**Solo** — open `Evil Platformer.html` in a browser.

**Online on your Wi-Fi** — from this folder:

```bash
node server.js          # or: PORT=8080 node server.js
```

Then open <http://localhost:3000>. Friends on the same network can use the address printed in the console (also available at `/ip`). The server is dependency-free and has WebSocket multiplayer built in. `GET /rooms` lists open rooms for the in-game room browser.

**GitHub Pages (optional)** — `index.html` redirects to the game, so the repo can be published statically. In **Settings → Pages**, deploy `main` from the repo root; the game will then be at `https://<your-user>.github.io/evilplatformer-mult/`. PeerJS lobbies work there; the WebSocket `server.js` does not run on Pages.

**Direct P2P** — leave the server field empty and create a lobby; PeerJS is lazy-loaded from jsDelivr only when you actually join a P2P room. If that is blocked, host `server.js` and put its address in the server field.

**Invite links** — the lobby has a *Copy invite link* button. Opening a link with `?room=ABCD` fills in and joins that room.

## Controls

| Action | Keys |
| --- | --- |
| Move | `A` / `D` (also `←` / `→` while defaults are bound) |
| Jump | `↑` (also `W` / `Space` while the default is bound) |
| Fireball / mine | `E` or the 🔥 button |
| Chat | `T`, `Enter` to send, `Esc` to cancel |
| Dance | `1` – `4` |
| Retry level | `R` |
| Photo mode | `P`; `S` saves a PNG while in photo mode |
| Settings / pause | `Esc` |
| Fullscreen | `F` |

All controls can be rebound in Settings. Touch controls appear automatically on phones. Gamepads work when enabled (left stick / d-pad, jump, fire, pause).

## What is in the game

### Mutations

56 chaotic modifiers in four categories: **Movement**, **Combat**, **World**, and **Multiplayer**. The picker scrolls, groups by category, and has *Clear all* and *Random 3*. The host's picks apply to the whole lobby.

A few examples:

- **Infinite Fireballs** — hold `E` to fire forever.
- **Moon Boots / Heavy Metal / Ice Rink** — rewrite gravity and momentum.
- **Tiny / Giant / Reverse Controls** — rewrite you.
- **The Floor Is Lava / Rising Water / Rising Ceiling** — rewrite the level.
- **Mutation Roulette** — enables a random mutation every 20 seconds.
- **Permadeath / Checkpoint Tax / One Shared Health Pool** — rewrite the consequences.
- **Hot Potato / Swap Positions / Copycat / Ghost Mode** — rewrite your friends.

The registry is `MUT_DEFS` in the game script. Some mutations add temporary effects at runtime; *Roulette* also uses the same catalog. The **skip token** is intentionally not included.

### Levels and traps

- 12 handcrafted themed levels, a boss fight, and a fake-win troll.
- Seeded **endless / random** generation with difficulty ramping forever.
- Daily and weekly challenge seeds.
- Intro cards with lying subtitles, checkpoints that explode after one use, optional coins, cursed coins, and secret exits.
- Dynamic solids: elevators, conveyors, springs, sticky floors, trapdoors, phantom tiles, fake platforms, and crushers.
- Hazards: saws, turrets, lasers, pendulums, poison gas, quicksand, black holes, tracking lasers, boulders, spike waves, charging demons, pop-up spikes, falling spikes, and fake safe zones.
- Boss level: the flag fights back.

### Modes

Eight modes: **Normal**, **Race**, **Deathmatch**, **King of the Hill**, **Tag**, **Infection**, **Hot Potato**, and **Shared Health**. Mode state (scores, IT, infection, bomb, shared deaths) is reset per run and synced over the room where applicable.

### Editor and progression

- **Level editor** with ground/platform/hazard tools, scrolling, playtest, saved custom levels, and base64 seed export/import.
- **Death shop** for cosmetics and extra lives; souls are earned from deaths and clears.
- **Achievements, stats, best runs, medals, and death ranks** stored in `localStorage`.
- **Run save/resume**, level select, practice mode, New Game+ variants, ghost replay, and a speedrun timer.
- **Audio**: WebAudio SFX and a tiny chiptune loop; toggle SFX/music independently.
- **QoL**: pause, retry, spawn invulnerability, photo mode, reduce-motion, performance mode, hazard outlines, name-tag toggle, tutorial hints, and invite links.

## Multiplayer

- Create a lobby, share the 4-letter code or invite link.
- Host picks the mode and mutations; clients receive them on start.
- Chat, dances, avatars, fireballs, tags, infections, potato passes, and scores sync over the room.
- Up to 12 players per room on `server.js`.
- PeerJS is lazy-loaded for P2P; LAN WebSocket play uses `server.js` and needs no CDN.

## Files

```
Evil Platformer.html   the entire game
index.html             redirect for GitHub Pages
server.js              zero-dependency HTTP + WebSocket host (/ip, /rooms)
manifest.webmanifest   PWA manifest
icon.svg               source icon
icon-192.png           PWA icon
icon-512.png           PWA icon
test/physics.test.js   physics, systems, editor, mode, and hazard harness
IDEAS.md               feature and mutation brainstorm
```

## Test

```bash
npm test
```

The harness runs the real game script inside a stub DOM and checks:

- landing, walking, jumping, coyote time, walls, ceilings, corner correction, and a randomized collision fuzz pass
- fireball cooldown, infinite fire, shotgun, one-bullet, mines, and bouncy fireballs
- the full mutation catalog and mutation-menu toggles
- every mutation enabled at once, every level, every mode, and the boss
- editor encode/decode round-trips (including Unicode) and playtest
- pause/retry, run saves, achievements, shop purchases, and meta screens
- 500 frames of hazard fuzz with dynamic solids

A healthy run ends with `ALL TESTS PASSED` and `FAILURES: 0`.

## Notes

- Progress and settings (name, colour, binds, avatar, mutation choice) are stored in `localStorage`.
- The game works offline in solo mode. Multiplayer needs either the public PeerJS broker or `server.js`.
- The PWA manifest is optional; opening the HTML directly still works.
