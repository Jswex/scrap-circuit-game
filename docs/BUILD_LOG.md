# Build Log

This is the chronological record of the project. New work should be added at the top of the log under a dated heading.

## 2026-09-01 - Explicit GitHub Pages Branch

### What changed

- Diagnosed that the repository is public, but the GitHub Pages configuration endpoint returned `404`.
- Published the same static site files to a dedicated `gh-pages` branch.

### Why

Some devices were seeing GitHub's "There isn't a GitHub Pages site here" message. A dedicated `gh-pages` branch gives GitHub Pages a conventional publishing source for the project site instead of depending on ambiguous repository settings.

### Verification

- Public repository API reported `private: false` and `visibility: public`.
- Public repository page returned HTTP 200 without authentication.
- Public game URL returned HTTP 200 and contained the `Scrap Circuit` HTML.

### Known limitations

- GitHub Pages can take a few minutes to rebuild after a branch is pushed.
- The exact public URL is case-sensitive: `https://jswex.github.io/scrap-circuit-game/`.

## 2026-09-01 - Public Pages Access Fix

### What changed

- Added `.nojekyll` so GitHub Pages serves the static files directly without Jekyll processing.
- Added `404.html` that redirects back to `/scrap-circuit-game/` if someone lands on a bad path inside the project site.

### Why

The game loaded from the exact public URL during an unauthenticated check, but a different device reported a GitHub Pages 404. The fallback page gives the project a better recovery path and the `.nojekyll` file removes one common source of static-site publishing friction.

### Verification

- Confirmed `https://jswex.github.io/scrap-circuit-game/` returned the live `Scrap Circuit` HTML before this fix.

### Known limitations

- This cannot fix a completely different URL, capitalization error, or a typo outside `/scrap-circuit-game/`.
- A signed-out browser and second-device check still need to be repeated after GitHub Pages finishes redeploying.

## 2026-09-01 - Wrecker's Pass And Rubric Evidence

### What changed

- Rebuilt the race around a much larger winding world-space course.
- Added a smooth follow camera so the full track is no longer visible at once.
- Set the race direction to counterclockwise and added yellow route arrows on the road.
- Kept the core loop: start, race bots, collect creative upgrades, complete three laps, finish, and restart.
- Updated the start screen copy so first-time players see the objective, lap count, direction, controls, and upgrade rule immediately.
- Confirmed the GitHub repository reports `visibility: public`.
- Added `docs/RUBRIC_TRACKER.md` to map the project evidence against the BUSFIN 4215 "Ship a Game" rubric.
- Tightened `docs/PLAYTEST.md` into a silent unfamiliar-user test template with revision and verification fields.
- Rewrote `README.md` with the public play URL, public repo URL, current feature list, and evidence links.
- Removed stale UI markup/styles from older credits, countdown, difficulty, and upgrade-choice experiments.
- Restored mobile touch control bindings for the new driving system.

### Why

The circular/oval version was too predictable because players could see and understand the whole route immediately. A larger changing course makes route reading, camera framing, upgrades, and steering matter more. The rubric evidence files were added because Level 4 depends on more than working code: the submission also needs public access, a real user test, a meaningful revision, and a student explanation of the work.

### Verification

- GitHub repository metadata confirmed `Jswex/scrap-circuit-game` is public.
- GitHub Pages URL `https://jswex.github.io/scrap-circuit-game/` returned HTTP 200 from an unauthenticated web request.
- Local files were patched to match the current HTML structure and assignment evidence requirements.

### Known limitations

- The public GitHub Pages URL still needs to be opened in a normal signed-out browser and on a second device.
- A full three-lap race through the newest course still needs live browser verification.
- The unfamiliar-user test must be real and cannot be filled in until someone else plays silently.

## 2026-08-27 - Shortcuts and Mid-Race Choices

### What changed

- Added three marked shortcut roads that legally cut across corners while preserving the hard no-off-track boundary.
- Added a timed mid-race upgrade drop that freezes the action and offers all four upgrades as selectable choices.
- Reduced banana impact to a brief 0.35-second wobble with most momentum preserved.

### Why

Shortcuts add route decisions and replay variety. The paused choice screen gives players meaningful control over their build without requiring them to understand a random upgrade immediately, while the softer banana effect keeps interference interesting instead of frustrating.

### Verification

- Workspace diagnostics passed for HTML, CSS, and JavaScript.
- Live browser test confirmed the popup appears during a race, shows four choices, freezes the race state, and resumes with the selected upgrade equipped.

## 2026-08-27 - Up-Left Starting Grid

### What changed

- Moved the starting grid to a route segment where the established reverse direction points upward and left.
- Centered the camera on the new grid when a race begins.

### Verification

- Workspace diagnostics passed after the starting-direction change.

## 2026-08-27 - Faster, Friendlier Racing

### What changed

- Reduced the race from three laps to two for shorter rounds.
- Increased acceleration, normal top speed, boost speed, and bot pace.
- Reduced banana spin duration from one second to 0.35 seconds and made the spin preserve more momentum.
- Reduced the speed loss from hitting the track boundary while still snapping cars back onto the road.

### Why

The previous pace made each round feel long, while a banana or wall contact could erase too much control. The new balance keeps mistakes readable without turning them into a full stop.

### Verification

- Workspace diagnostics passed after the speed and recovery adjustments.
- Live browser test confirmed the faster start and a stable two-lap HUD.
- Corrected the initial HUD label to `LAP 1 / 2`; a fresh browser test confirmed the briefing, race HUD, canvas, speed increase, and credit reward agree.

## 2026-08-27 - Credits

### What changed

- Added a persistent credits balance starting at 1,000.
- Awarded 25 credits for each player crate collection and a 100-500 credit finish bonus based on placement.
- Added the balance to the top bar.

### Verification

- Verified the JavaScript syntax with `node --check`.

## 2026-08-27 - Winding Track Revision

### What changed

- Replaced the circular oval with a large winding closed route containing long straights, bends, and a narrow return section.
- Reversed race travel direction for the player and bots.
- Added a smooth follow camera so the player sees only the nearby section of the course.

### Why

The original oval made the route predictable and visible at a glance. A larger changing view creates discovery and makes steering, upgrades, and route position matter more.

### Verification

- Workspace diagnostics report no errors in the edited game script.
- Browser smoke test confirmed the new track renders, credits update, and the initial reverse-direction seam no longer counts as a lap.
- Hardened upgrade input so early keyboard or touch events cannot interrupt the menu or countdown.

## 2026-08-27 - Speed, Instructions, and Track Boundaries

### What changed

- Increased player acceleration, top speed, bot pace, crate animation, and crate respawn speed.
- Turned the opening panel into a pre-race instruction screen with objective, controls, upgrade rules, and boundary feedback.
- Added hard track containment so cars are repositioned inside the road when they go wide.

### Why

The faster pace makes the race feel more energetic, while explicit instructions address the rubric requirement that an unfamiliar player understand the objective and available actions without creator narration. Hard containment removes an ambiguous edge state where cars could remain off-road.

### Verification

- Workspace diagnostics report no errors in the edited files.
- Live browser smoke test confirmed the instruction screen, faster start, rendered track, and stable initial lap state.
- Fixed a runtime reference exposed by the hard-boundary test; a fresh browser test reached high speed, collected a crate, and stayed on the first lap during a sustained hard turn.

### Known limitations

- Browser playtesting still needs to confirm camera framing and lap crossing on a real device.

## 2026-08-27 - First Playable Prototype

### What changed

- Chose **Scrap Circuit** as the working prototype name.
- Built a dependency-free browser game using HTML Canvas, CSS, and JavaScript.
- Added a three-lap oval race against three computer-controlled opponents.
- Added acceleration, braking, steering, speed, lap counting, position tracking, a starting countdown, and a finish screen.
- Added collectible mystery crates and four upgrades:
  - **Rocket Sneeze:** temporary high-speed burst.
  - **Junk Magnet:** pulls nearby upgrade crates toward the racer.
  - **Phase Drive:** temporarily allows off-track shortcuts without slowdown.
  - **Banana Printer:** drops hazards that spin opponents.
- Added keyboard controls, touchscreen controls, particles, upgrade notifications, and restart support.
- Added `docs/prototype-brief.md` with the first business hypothesis and playtest questions.

### Why

The first prototype is intended to test whether disruptive, unusual upgrades make a short racing game memorable and replayable. A browser build was selected because it can be opened quickly and tested without installing a game engine.

### Verification

- Reviewed the source and project file structure.
- Ran Git whitespace checks successfully.
- Corrected the starting grid so racers begin near the lap line.
- Corrected canvas resizing behavior for high-density displays.
- Removed an unfinished sound button.

### Known limitations

- Visual and interactive browser testing was not completed because no controllable browser was connected in the development session.
- The local Node and Python command-line launchers were unavailable.
- Bot behavior is intentionally simple and the track is currently one oval.
- There is no sound, online multiplayer, progression, or saved data yet.

### Next likely step

Play the game with the keyboard, record any control or lap-counting problems, and run the five-person playtest described in `prototype-brief.md` before adding major features.

## 2026-08-27 - Workspace Setup

### What changed

- Created the `entrepreneurship-game` workspace.
- Initialized a separate Git repository for project history.
- Added `AGENTS.md` to tell coding agents how to work on this project.
- Added `README.md` and the `assets/`, `docs/`, `src/`, and `tests/` folders.

### Why

The class project needed a dedicated workspace so game code, research, playtest evidence, and class deliverables remain organized together.

### Verification

- Confirmed the expected files and folders exist.
- Confirmed Git recognizes the project files.

### Known limitations

- No initial Git commit has been made yet.
- The target audience and business model still need to be defined.

### Next likely step

Create the first Git commit after reviewing the initial prototype.
