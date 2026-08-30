# Scrap Circuit

**A fast arcade-style racing game where disruptive upgrades create memorable moments.**

## Play Now

🏁 **[jswex.github.io/scrap-circuit-game](https://jswex.github.io/scrap-circuit-game/)**

No installation required. Playable on desktop and mobile.

## Game Overview

Race two laps on a winding junkyard track. Collect crates to unlock upgrades mid-race. Master shortcuts, avoid hazards, and beat three bot opponents. Three difficulty levels for different skill thresholds.

**Controls:**
- **WASD** or **Arrow Keys**: Steer & accelerate
- **SPACE**: Use active upgrade
- **Mouse/Touch**: Tap buttons on mobile

## Features

✨ **Winding Track** — Dynamic 15-point path with camera follow
✨ **Shortcuts** — Three risky alternate routes
✨ **Hazards** — Oil slicks, ramps, repair bays with strategic effects
✨ **Landmarks** — Four named junkyard locations
✨ **Four Upgrades** — ROCKET SNEEZE, JUNK MAGNET, PHASE DRIVE, BANANA PRINTER
✨ **Mid-Race Upgrade Pause** — Choose your power at strategic moments
✨ **Difficulty Selection** — Easy, Normal, Hard
✨ **Credits & Rewards** — Earn points for placement and repairs
✨ **Mobile Support** — Full touch controls

## Playtest Guide

This game is built to test a hypothesis: **Can disruptive upgrades make a short game engaging for unfamiliar players?**

To help validate this, playtest with someone who hasn't seen the game before. Use the template in [`docs/PLAYTEST.md`](docs/PLAYTEST.md) to record friction points and player feedback. Look for:
- When did they understand the objective?
- What made them smile or groan?
- Where did they get confused?
- Did they want to play again?

For project history, read [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md). If this is your first time working with coding agents, start with [`docs/AGENT_GUIDE.md`](docs/AGENT_GUIDE.md).

## First Session Checklist

- Define the target customer or player.
- Write the problem statement and riskiest business assumption.
- Choose one measurable learning goal for the first playtest.
- Sketch the smallest playable vertical slice.
- Compare suitable engines or libraries against the slice's needs.
- Record decisions and class requirements in `docs/`.

## Project Layout

- `docs/`: hypotheses, research, playtest notes, decisions, and class deliverables
- `src/`: game source code
- `assets/`: project-owned visual, audio, and data assets
- `tests/`: automated tests and test fixtures
