# Scrap Circuit

**A fast arcade-style racing game where disruptive upgrades create memorable moments.**

## Play Now

**[jswex.github.io/scrap-circuit-game](https://jswex.github.io/scrap-circuit-game/)**

No installation required. Playable on desktop and mobile.

Public source repo: **[github.com/Jswex/scrap-circuit-game](https://github.com/Jswex/scrap-circuit-game)**

## Game Overview

Race three counterclockwise laps on a large winding junkyard track that follows the car with a camera. Collect crates to unlock upgrades mid-race, read the route arrows, and beat three bot opponents.

**Controls:**

- **WASD** or **Arrow Keys**: Steer and accelerate
- **SPACE**: Use active upgrade
- **Mouse/Touch**: Tap buttons on mobile

## Features

- **Large winding track** with camera follow, so the full route is not visible at once.
- **Counterclockwise direction** with in-world route arrows.
- **Four upgrades:** Rocket Sneeze, Junk Magnet, Phase Drive, Banana Printer.
- **Bot opponents, lap tracking, finish screen, and restart loop.**
- **Public browser build** designed for quick unfamiliar-user testing.

## Playtest Guide

This game is built to test a hypothesis: **Can disruptive upgrades make a short game engaging for unfamiliar players?**

To help validate this, playtest with someone who has not seen the game before. Use the template in [`docs/PLAYTEST.md`](docs/PLAYTEST.md) to record friction points and player behavior. Look for:

- When did they understand the objective?
- Did they understand the counterclockwise route?
- Did they collect and use an upgrade without help?
- Where did they get confused?
- Did they want to play again?

For project history, read [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md). For the assignment evidence checklist, read [`docs/RUBRIC_TRACKER.md`](docs/RUBRIC_TRACKER.md). If this is your first time working with coding agents, start with [`docs/AGENT_GUIDE.md`](docs/AGENT_GUIDE.md).

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
