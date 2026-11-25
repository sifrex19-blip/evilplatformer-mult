# Evil Platformer — idea vault

A working list of things that would make the game more evil, more funny, or more replayable.
Nothing here is promised; it is a menu to pick from.

Legend: **S** = small change, **M** = medium, **L** = large / new system.

---

## 1. Mutations (the current system)

Mutations are per-run modifiers. The registry already exists (`MUT_DEFS`), the menu has a picker, and the host's choices are sent to the lobby. Add one entry + one gameplay hook per idea.

### Movement mutations
- **Moon Boots** (S) — gravity ×0.35, jump ×0.75. Everything feels floaty and wrong.
- **Heavy Metal** (S) — gravity ×1.6, jump ×1.15, but landing crumbles the platform under you.
- **Ice Rink** (S) — acceleration/friction instead of instant velocity; no air control.
- **Greased Legs** (S) — every landing slides you 40px in the direction you were moving.
- **Double Jump** (S) — one extra air jump. Evil twist: the second jump spawns a spike below you.
- **Triple Jump, No Landing** (M) — you get 3 jumps but the floor is lava for 2 seconds after each.
- **Reverse Controls** (S) — left/right swapped. Chat still works.
- **Tiny Mode** (S) — player scale 0.6; gaps feel huge, spikes feel bigger.
- **Giant Mode** (S) — player scale 1.6; ceilings become weapons.
- **Low Gravity + High Jump** (S) — slow, floaty, and you cannot stop mid-air.
- **Slippery Walls** (S) — wall collision pushes you along the wall instead of stopping you.
- **Sticky Floor** (S) — you cannot jump for 150ms after landing.
- **No Coyote** (S) — coyote time and jump buffering disabled. Pure evil.
- **Bouncy World** (M) — every platform acts like a trampoline; landing launches you.
- **Trampoline Spikes** (M) — bounce is stronger, but spikes are placed at the apex.

### Combat / fireball mutations
- **Infinite Fireballs** (implemented) — hold to spray forever.
- **Bouncy Fireballs** (M) — fireballs bounce off walls/ceilings 3 times.
- **Homing Fireballs** (M) — fireballs slowly curve toward the nearest demon or player.
- **Shotgun** (M) — 5 fireballs in a cone, 1.5s cooldown.
- **Friendly Fire** (S) — your own fireballs can kill you after 1 bounce.
- **Fireball Rain** (M) — every 5 seconds, fireballs fall from the ceiling.
- **Fireproof Demons** (M) — demons ignore fireballs and speed up when hit.
- **Fireball Golf** (M) — fireballs push you backward (recoil), enabling rocket jumps.
- **Cold Fire** (S) — fireballs freeze enemies instead of killing them; frozen enemies become platforms.
- **Molotov** (M) — fireballs leave a burning puddle for 3 seconds.
- **One Bullet** (S) — you get one fireball per level, but it is huge and pierces everything.
- **Mines** (M) — `E` drops a mine instead of firing. Mines stick to walls.

### World mutations
- **The Floor Is Lava** (M) — all ground tiles deal damage after a 3-second grace period at level start.
- **Everything Is A Spike** (M) — platform edges grow spikes; the middle is safe.
- **Invisible Hazards** (M) — spikes are drawn only when you are within 80px.
- **Darkness** (M) — flashlight cone; hazards are visible only inside it.
- **Mirror World** (S) — level is rendered flipped; controls unchanged (or flipped too).
- **Upside Down** (M) — gravity reversed; the ceiling is the floor.
- **Sideways Gravity** (L) — gravity pulls right; the level becomes a climb.
- **Wind** (M) — constant wind pushes you; sign changes per level section.
- **Earthquake** (M) — camera and player jitter; platforms randomly crumble.
- **Rising Water** (M) — water rises from the bottom; touching it kills.
- **Rising Ceiling** (M) — the ceiling slowly descends; keep moving.
- **Shrinking World** (L) — the camera zoom slowly increases; less runway.
- **Random Teleport** (M) — every 8 seconds you swap to a random safe tile.
- **Mutation Roulette** (M) — every 20 seconds, enable a random mutation for 10 seconds.
- **No Signs** (S) — all troll signs are blank. Somehow worse.
- **Signs Only** (S) — every hazard is replaced by a sign that says "safe".
- **Permadeath** (S) — one death resets the whole run, not the level.
- **Checkpoint Tax** (S) — respawning costs 1 of your 5 lives; game over at 0.
- **Friendly Platforms** (M) — platforms try to move away from you.
- **Jealous Platforms** (M) — platforms crumble if you stand still for 1 second.

### Multiplayer mutations
- **One Shared Health Pool** (M) — everyone shares 5 deaths. Griefing is inevitable.
- **Hot Potato** (M) — a bomb passes between players on contact; holder dies in 10s.
- **Everyone Is Invisible** (M) — only your own sprite renders (name tags remain).
- **Swap Positions** (M) — every 15 seconds, all players swap positions.
- **Friendly Fire Always** (S) — fireballs hurt everyone, including the shooter.
- **Shared Fireballs** (M) — all fireballs are hostile to all players.
- **Ghost Mode** (M) — dead players become ghosts that can push living players.
- **Copycat** (M) — your inputs are mirrored by the player to your right.
- **Race Rubber Band** (M) — the last-place player moves 25% faster.
- **No Names** (S) — all name tags become "Player". Chaos.

---

## 2. Traps and level gimmicks

The level format already has solids (`S`) and hazards (`Hz` with `pop`, `fall`, `charge`). Most of these fit that shape.

### Platform traps
- **Fake platform** — looks solid, is a hologram; you fall through.
- **Ghost platform** — solid only while you are not looking at it (facing away).
- **Phantom tile** — solid for 1 second, gone for 2; visual pulse.
- **Once-platform** — disappears after one landing, even if you jump off.
- **Elevator** — moves vertically between two points; crush hazard at the top.
- **Conveyor** — pushes you left/right while standing.
- **Tilt platform** — starts flat, tilts and dumps you after 1 second.
- **Trapdoor** — opens when you step on the center.
- **Magnet platform** — pulls you toward it, then launches you.
- **Sticky platform** — you stick on landing; jump requires mashing.
- **Springboard** — launches you into a spike ceiling.
- **Collapsing bridge** — tiles crumble from the far end backward.
- **Rotating platform** — a bar that rotates around a pivot; collision is AABB at the moment.
- **Piston** — slams down on a timer. Safe only in the gap.
- **Crusher** — ceiling block falls when you pass under.
- **Pendulum** — swinging spiked ball on a chain.
- **Moving wall** — pushes you into a spike pit.
- **Gate** — closes behind you after crossing a line.
- **Zipper** — two walls close in from both sides.
- **Minecart** — a platform that only moves while you are on it.

### Hazard traps
- **Pop-up spikes** (exists) — add directional variants.
- **Falling spikes** (exists) — add shadow warning.
- **Charging demon** (exists) — add feint: it charges, stops, then charges again.
- **Turret** — fires slow projectiles on a fixed line.
- **Homing turret** — one slow homing shot per 3 seconds.
- **Laser grid** — sweeps across the screen; safe gaps move.
- **Crushing ceiling** — entire ceiling descends for 2 seconds.
- **Rising lava** — one-way; level becomes a climb.
- **Spike wall** — advances from behind; must keep moving.
- **Sawblade** — rolls along the ground and reverses at walls.
- **Boulder** — rolls down a slope; crushes platforms.
- **Electric floor** — toggles on/off on a beat.
- **Poison gas** — fills low areas; jump to survive.
- **Quicksand** — slows and pulls down; jump to escape.
- **Black hole** — pulls you in; fireballs orbit it.
- **Wind gust** — telegraphed push for 0.5s.
- **Ice spikes** — slide you into a pit when touched.
- **Mimic spike** — looks like a platform until you land.
- **Spike that follows the floor** — a wave you must jump over.
- **Fake safe zone** — the sign says SAFE, the zone is a kill box.
- **Delayed spike** — triggers 0.4s after you leave the tile.
- **Reverse spike** — only dangerous while you are jumping.
- **Ceiling spike that drops only when you jump**.
- **Laser that tracks your last position** — dodging requires moving.
- **Enemy that copies your movement 2 seconds late** — you fight your own ghost.

### Environmental gimmicks
- **Gravity flip zone** — arrows on the floor; upside-down section.
- **Wind tunnel** — vertical gust; hold a direction to steer.
- **Low gravity bubble** — floaty section.
- **Underwater section** — slow movement, higher jumps, muffled sound.
- **Ice section** — momentum-based movement.
- **Sticky honey** — slow, but jump height doubled.
- **Dark cave** — flashlight only.
- **Mirror room** — the level is not where it seems.
- **Rotating camera** — screen rotates 90°; controls rotate with it.
- **Tiny room** — camera zooms in; spikes are huge.
- **Fake exit** — a door that teleports you back to the start.
- **Loop corridor** — walking right wraps you to the left.
- **One-way mirror** — you can see a dead player's ghost through it.
- **Speed zone** — doubles speed, halves jump.
- **Slow zone** — halves speed, doubles jump.

---

## 3. Level and run structure

- **More handcrafted levels** — 4 is a demo; 20–30 is a game.
- **Themes per world** — castle, volcano, ice, factory, sewer, cloud, glitch, office, hell.
- **Level intro cards** — name + a lying subtitle.
- **Branching path** — a "safe" route and a "fast" route; both are bad.
- **Secret exits** — skip a level, but the next one starts with a curse.
- **Daily challenge** — one seed per day, shared leaderboard.
- **Weekly challenge** — harder seed, cosmetic reward.
- **Endless mode** — generated levels, difficulty ramps forever.
- **Boss levels** — every 10th level is a demon with patterns and phases.
- **Mini-boss** — the flag itself fights back.
- **Reverse levels** — the story level played backward.
- **Remix levels** — story level with a random mutation and doubled hazards.
- **Troll level pack** — community-submitted level seeds.
- **Level editor** — place solids/hazards, test, export a seed string.
- **Seed sharing** — copy/paste a seed, including mutation and mode.
- **Ghost replay** — race your best run as a translucent ghost.
- **Speedrun timer** — splits per level, PB stored locally.
- **Medals** — bronze/silver/gold by deaths and time.
- **Death rank** — "Tourist", "Victim", "Masochist", "Local Legend".
- **Collectibles** — optional coins that make the level harder while held.
- **Cursed coins** — collecting one enables a random mutation for the level.
- **Checkpoints** — real ones, with a twist: they explode after one use.
- **Skip token** — after 10 deaths on a level, offer a skip that costs 25 deaths.
- **Practice mode** — infinite retries on the current level, no progress.
- **Marathon mode** — all levels, one life, no checkpoints.

---

## 4. Multiplayer modes

- **Race** (exists) — first to the flag wins the round.
- **Co-op story** — shared level, shared deaths, revives.
- **Deathmatch** — fireballs only, last player standing.
- **Team deathmatch** — 2v2 / 3v3.
- **King of the Hill** — hold the center platform while dodging.
- **Tag** — the "it" player is a walking hazard.
- **Infection** — one player is a demon; touching converts others.
- **Hot Potato** — pass the bomb; holder explodes.
- **Sabotage** — earn points, spend them to trigger traps on rivals.
- **Betting** — dead players bet on who dies next.
- **Spectator mode** — free camera, slow-mo, chat.
- **Tournament bracket** — auto-run 1v1 races, best of 5.
- **Co-op boss** — shared health bar; one player must distract, the other hits the weak point.
- **Relay** — each player runs one section; the team score is the sum.
- **Random mutations per round** — host picks a pool, game rolls one.
- **Draft** — each player picks one mutation; all apply.
- **Handicap** — first-place player gets a random curse.
- **Late join** — allow joining mid-run as a ghost.
- **Host migration** — promote a new host instead of dropping the room.
- **Reconnect** — rejoin the same lobby after a refresh.
- **Room browser** — list open public rooms by code/name.
- **Matchmaking link** — `?room=ABCD` auto-joins.
- **Ping display** — per-player latency and connection quality.
- **Latency compensation** — rewind fireball hits by ping/2.
- **Replay of the round** — top-down replay after a race.

---

## 5. Evil / comedy ideas

- **The flag runs away** when you get close. Chase sequence.
- **The flag is a boss** — it has phases and attacks.
- **Fake win screen** — shows "YOU WIN", then "lol no" and restarts.
- **Fake crash screen** — browser-style error with a deadpan message.
- **Fake patch notes** — "Fixed a bug where players could win."
- **Moving signs** — the sign shuffles its message when you look away.
- **Sign that follows you** — slowly floats behind, always just out of view.
- **Fake player ghost** — a clone runs ahead and dies to warn you; it is lying.
- **The game learns** — place a trap where the player died most.
- **Adaptive evil** — doing well spawns extra hazards; doing badly spawns taunts.
- **Waiting trap** — harmless unless you stand still for 3 seconds.
- **Speed trap** — harmless unless you move faster than X.
- **The floor is a giant enemy** — it blinks and tries to eat you.
- **A level with no hazards** — just extremely unsettling signs.
- **A hallway of signs** — each one is a worse lie than the last.
- **The final level is level 1** — but everything is slightly off.
- **The "reward" at the flag** — a chest that kills you.
- **Post-credits scene** — a single spike, then "Thanks for playing."
- **The safe route is longer and deadlier** — the risky route is also deadlier.
- **Fake ads** — "Download more jumps!" banner that blocks the screen.
- **Fake cursor** — a second mouse cursor that moves toward buttons.
- **Pause menu that lies** — "Quit" teleports you into a trap room.
- **The death counter talks back** — at 10, 50, 100, 500 deaths.
- **A boss that apologizes** — then sucker-punches you.
- **A flag that gives a tutorial** — mid-boss-fight.
- **The level restarts one jump before the flag** — only once.
- **A "skip level" button that does nothing** — but plays a victory sound.
- **A fake multiplayer player** — "Player 2 has joined" (there is no player 2).
- **A fake save icon** — "Saving…" for 30 seconds at the worst moment.
- **A sign that asks for your name** — then uses it to roast you.
- **Developer commentary** — but every line is a lie.
- **The game rates your run** — "0/10, the spikes carried you."

---

## 6. Progression and meta

- **Death shop** — spend deaths on cosmetics, skips, or curses.
- **Unlockable characters** — different avatars with tiny stat differences.
- **Unlockable trails** — fireball and landing effects.
- **Achievements** — "Trusted the sign", "Died to the fake flag 10 times", "Finished without dying" (impossible).
- **Stats screen** — deaths per level, favorite death, time played, fireballs fired.
- **Best run** — fewest deaths / fastest time per level.
- **Leaderboards** — local first, global later via server.
- **Seasonal cosmetics** — hats that do nothing.
- **Daily login taunt** — a different insult each day.
- **Profile card** — name, colour, avatar, rank, rarest death.
- **Ranked mode** — race rating; losing to a spike does not affect it (only other players).
- **Challenge medals** — "no fireballs", "no jumping", "only left".
- **New Game+** — all levels with mutations forced on.
- **New Game++** — hazards invisible.
- **New Game---** — everything is a sign.

---

## 7. Presentation, audio, feel

- **Chiptune soundtrack** — one loop per world, tempo increases with deaths.
- **SFX** — jump, land, fireball, death, crumble, flag, menu click, demon growl.
- **Dynamic music** — drums enter when a demon charges, stop when it dies.
- **Announcer** — short sarcastic lines on death/win ("Skill issue.").
- **Screen shake** (exists lightly) — add intensity setting.
- **Hit stop** — 60ms freeze on death and boss hits.
- **Slow-mo death** — 0.25× for 0.5s, then respawn.
- **Death replay** — 2-second ghost of your last moments.
- **Particles** (exists) — add blood/ink splats, fireball embers, confetti on win.
- **Parallax background** — hills, clouds, lava falls, factory pipes.
- **Weather** — rain, ash, snow, embers; cosmetic only.
- **Palette per world** — one CSS/JS palette swap is cheap and effective.
- **CRT filter** — optional scanlines and curvature.
- **Glitch effect** — RGB split on fake flags and fake win screens.
- **Torch lighting** — radial gradient around the player in dark levels.
- **Sprite squash/stretch** — on jump and land.
- **Eyes that follow the player** — on demons and signs.
- **Flag animation** — waves in the wind; stops when you get close.
- **Confetti + fireworks** — on a real win.
- **Accessibility** — reduce shake, hazard outlines, colourblind palette, larger text.
- **Photo mode** — hide HUD, free camera, screenshot button.

---

## 8. Quality of life

- **Gamepad support** — standard mapping, hot-plug.
- **Touch joystick** — optional alternative to buttons.
- **Haptics** — short vibration on death/fireball on mobile.
- **Pause** — actually freeze the simulation, not just open a menu.
- **Retry button** — `R` to instantly restart the level.
- **Copy seed button** — in pause and results.
- **Invite link** — `?room=ABCD` (also useful for testing).
- **Room list** — see open public lobbies.
- **Name tags toggle** — for streams.
- **Reduce motion** — disables shake, flashes, and glitch.
- **Keybind presets** — WASD, arrows, gamepad.
- **Save/load run** — resume a story run later.
- **Level select** — replay cleared levels.
- **Tutorial toggle** — skip the first-level hints.
- **Perf mode** — fewer particles, lower canvas resolution.
- **Offline mode** — skip the PeerJS CDN load when not needed.
- **Localization** — even just EN/CS.

---

## 9. Technical / architecture

- **Split the single file** into `game.js`, `levels.js`, `net.js`, `style.css` (keep a build step or ES modules).
- **Fixed-step simulation** (exists) — extract to a testable module.
- **Deterministic seeds** (mostly exists) — make random hazards deterministic per level for replays/races.
- **Server-authoritative rooms** — prevent fireball spam and cheating.
- **Message batching** — send multiple fireballs per tick instead of one message each.
- **Binary protocol** — smaller presence/fire packets.
- **Rollback netcode** — overkill, but great for races.
- **Reconnect tokens** — resume a room after refresh.
- **Unit tests for level generation** — no unreachable flags, no spawn inside hazards.
- **Physics regression harness** (added) — expand to hazards, races, peer collisions.
- **Level validator** — ensures a level is possible with the current movement stats.
- **Benchmark mode** — 1000 fireballs + 12 players, measure frame time.
- **PWA manifest** — installable, offline solo.
- **Replay format** — record inputs + seed, replay deterministically.

---

## 10. Next ten I would actually build

1. **More mutations** — Moon Boots, Reverse Controls, Bouncy World, Friendly Fire (all cheap and funny).
2. **Bouncy fireballs** — one line in the collision loop, huge chaos.
3. **Deathmatch mode** — reuse Race's peer infrastructure; fireballs already sync.
4. **SFX + one chiptune loop** — the single biggest feel upgrade for the effort.
5. **Daily seed + local best** — replay value with almost no backend.
6. **Death replay ghost** — record the last 2 seconds of positions.
7. **Level themes/palettes** — 8 palette swaps and 3 parallax layers.
8. **Moving platform + crusher hazards** — the two biggest missing trap types.
9. **Skip token after 10 deaths** — let frustrated players continue, with shame.
10. **Level editor + seed export** — turns players into content creators.

---

## Smallest possible next patch

If you only want one more session of work:

- Add `bouncy` and `moon` mutations to `MUT_DEFS`.
- Add one new hazard: `crusher` (a ceiling block that falls when you pass under).
- Add a `Retry` key (`R`) and a pause that freezes the simulation.
- Add 250ms of invulnerability after respawn so you do not instantly die to the same trap.
- Add SFX using a tiny WebAudio beep synth (no asset files).
