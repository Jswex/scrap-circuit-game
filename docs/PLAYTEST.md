# Playtest Record

Use this for the real unfamiliar-user test required by the game rubric. Let the player try silently first. Do not explain the controls unless they are fully stuck; write down what happened before helping.

## Test Note - Magnet And Track Variety

- Date: 2026-09-01
- Tester relationship to you: Follow-up observation reported by project owner
- Device/browser: Not recorded
- Play URL or local build: Scrap Circuit public build before `PLAYTEST BUILD 05`
- Was the tester signed out of GitHub? Not recorded
- Was this tested on a second device? Not recorded
- Duration: Not recorded

### Most Consequential Friction

- Biggest confusion or slowdown: Junk Magnet still did not feel like a great powerup, and the track needed more ground-based speed opportunities.
- Why it matters for the game: If one upgrade feels clearly worse than the others, players stop being excited by crate randomness. Ground boosts also create more active driving choices between powerup moments.
- Evidence from the test: Project owner asked to add speed boosts on the ground and rework Magnet because it "really isnt that great of a powerup."

### Revision Made

- Change made after the test: Added orange speed pads with cooldowns, then reworked Junk Magnet to pull crates and disrupt nearby bots with visible blue tether lines.
- File(s) changed: `src/game.js`, `index.html`
- Why this change targets the friction: Speed pads give players a frequent visible driving reward, and Magnet now has direct race impact instead of only helping with future crate collection.

### Verification Attempt

- Date: Pending
- Tester: Pending
- Did the original friction improve? Pending
- What new issue appeared, if any? Pending
- Evidence: Needs a race replay after `PLAYTEST BUILD 05` is live.

## Test Note - Powerup Variety

- Date: 2026-09-01
- Tester relationship to you: Follow-up observation reported by project owner
- Device/browser: Not recorded
- Play URL or local build: Scrap Circuit public build before `PLAYTEST BUILD 04`
- Was the tester signed out of GitHub? Not recorded
- Was this tested on a second device? Not recorded
- Duration: Not recorded

### Most Consequential Friction

- Biggest confusion or slowdown: Only Rocket Sneeze and Phase Drive were appearing as powerups.
- Why it matters for the game: The upgrade system is supposed to create variability and surprise. Seeing only two effects makes the race feel repetitive and hides half of the game's creative mechanics.
- Evidence from the test: Project owner reported that only Rocket Sneeze and Phase Drive were popping up.

### Revision Made

- Change made after the test: Changed crate spawning to rotate through all four upgrade types using a crate counter instead of track index math.
- File(s) changed: `src/game.js`, `index.html`
- Why this change targets the friction: The new formula guarantees Rocket Sneeze, Junk Magnet, Phase Drive, and Banana Printer are all assigned across the crate line.

### Verification Attempt

- Date: Pending
- Tester: Pending
- Did the original friction improve? Pending
- What new issue appeared, if any? Pending
- Evidence: Needs a race replay after `PLAYTEST BUILD 04` is live.

## Test Note - Powerup Readability

- Date: 2026-09-01
- Tester relationship to you: User test note reported by project owner
- Device/browser: Not recorded
- Play URL or local build: Scrap Circuit public build before `PLAYTEST BUILD 03`
- Was the tester signed out of GitHub? Not recorded
- Was this tested on a second device? Not recorded
- Duration: Not recorded

### Most Consequential Friction

- Biggest confusion or slowdown: Powerups did not have a noticeable enough effect.
- Why it matters for the game: Creative upgrades are the main hook. If players cannot clearly feel or see them, collecting crates feels less rewarding and the race has fewer memorable moments.
- Evidence from the test: The user-test note specifically said the powerups "dont have that much of a noticiable effect."

### Revision Made

- Change made after the test: Increased powerup duration/strength and added stronger visual feedback: rocket flame/burst, magnet tethers, phase glow, larger banana puddles, sparks, and floating callouts.
- File(s) changed: `src/game.js`, `index.html`
- Why this change targets the friction: The revision makes every powerup produce an immediate visible and mechanical change, so players can connect the crate pickup and SPACE activation to a clear effect.

### Verification Attempt

- Date: Pending
- Tester: Pending
- Did the original friction improve? Pending
- What new issue appeared, if any? Pending
- Evidence: Needs a second playtest after `PLAYTEST BUILD 03` is live.

## Test Setup

- Date:
- Tester relationship to you:
- Device/browser:
- Play URL or local build:
- Was the tester signed out of GitHub? Y/N
- Was this tested on a second device? Y/N
- Duration:

## Silent Observation

- First thing the player clicked or pressed:
- Did they understand the objective without help? Y/N
- Did they understand the route direction without help? Y/N
- Did they use acceleration and steering without help? Y/N
- Did they collect a crate intentionally? Y/N
- Did they use an upgrade intentionally? Y/N
- Did they finish the race? Y/N
- Did they use restart or ask to play again? Y/N

## Specific Behaviors Observed

List moments you actually saw, not general opinions.

1. Moment:
   What happened:
2. Moment:
   What happened:
3. Moment:
   What happened:

## Most Consequential Friction

- Biggest confusion or slowdown:
- Why it matters for the game:
- Evidence from the test:

## Revision Made

- Change made after the test:
- File(s) changed:
- Why this change targets the friction:

## Verification Attempt

After the revision, test again with the same player or a new player.

- Date:
- Tester:
- Did the original friction improve? Y/N
- What new issue appeared, if any?
- Evidence:
