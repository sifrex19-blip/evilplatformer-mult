# Evil Platformer

A single-file troll platformer with seeded random levels, mutations, and P2P / LAN multiplayer.

The whole game is `Evil Platformer.html`. No build step, no framework, no assets.

## Play

**Solo** — open `Evil Platformer.html` in a browser.

**Online on your Wi-Fi** — from this folder:

```bash
node server.js          # or: PORT=8080 node server.js
```

Then open <http://localhost:3000>. Friends on the same network can use the address printed in the console (also available at `/ip`). The server is dependency-free and has WebSocket multiplayer built in.

**GitHub Pages (optional)** — `index.html` redirects to the game, so the repo can be published statically. In **Settings → Pages**, deploy `main` from the repo root; the game will then be at `https://<your-user>.github.io/evilplatformer-mult/`. PeerJS lobbies work there; the WebSocket `server.js` does not run on Pages.

**Direct P2P** — leave the server field empty and create a lobby; it uses the public PeerJS broker. If that is blocked, host `server.js` and put its address in the server field.

## Controls

| Action | Keys |
| --- | --- |
| Move | `A` / `D` (also `←` / `→` while defaults are bound) |
| Jump | `↑` (also `W` / `Space` while the default is bound) |
| Fireball | `E` or the 🔥 button |
| Chat | `T`, `Enter` to send, `Esc` to cancel |
| Dance | `1` – `4` |
| Settings / pause | `Esc` |
| Fullscreen | `F` |

All controls can be rebound in Settings. Touch controls appear automatically on phones.

## Mutations

Mutations are chaos modifiers chosen before a run. The host's picks apply to the whole lobby.

Currently there is one:

- **Infinite Fireballs** — hold `E` or the 🔥 button to fire forever. No cooldown, no ammo.

The system is a registry (`MUT_DEFS` in the game script), so adding more is a single entry plus its gameplay hook. A big list of candidates lives in [IDEAS.md](IDEAS.md).

## Collision improvements in this build

- Swept, sub-stepped X/Y movement (no tunneling at high fall/fireball speeds)
- Edge-based snapping instead of "if overlapping, teleport"
- No more being teleported onto a platform top when clipping its side
- Head-bump corner correction (clips the corner of a ceiling and slides around it)
- Coyote time + jump buffering for forgiving jumps
- Landing dust, jump dust, fireball impact sparks
- Safe un-stick pass if a player ends up inside geometry (spawns / peer shoves)
- Improved player-player collision and riding
- Fireballs are sub-stepped against platforms and demons
- 1.5s base fireball cooldown; the mutation removes it entirely
- `Space` / `W` jump aliases and `←` / `→` movement aliases on default binds

## Multiplayer

- Create a lobby, share the 4-letter code.
- Modes: **Normal** (co-op/story) and **Race** (first to the flag wins the round).
- Host picks the mode and mutations; clients receive them on start.
- Chat, dances, avatars, and fireballs sync over the room.
- Up to 12 players per room on `server.js`.

## Files

```
Evil Platformer.html   the entire game
index.html             redirect for GitHub Pages
server.js              zero-dependency HTTP + WebSocket host
test/physics.test.js   collision/physics regression harness
IDEAS.md               feature and mutation brainstorm
```

## Test

```bash
npm test
```

This runs the real game script inside a stub DOM and checks landing, walking, walls, ceilings, corner correction, coyote jumps, infinite-fireball behavior, and a randomized collision fuzz pass.

## Notes

- The game loads PeerJS from jsDelivr for P2P lobbies. Solo works offline; LAN multiplayer through `server.js` does not need the CDN.
- Progress and settings (name, colour, binds, avatar, mutation choice) are stored in `localStorage`.
