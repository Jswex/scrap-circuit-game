# Agent Guide

## What an agent is

An agent is an AI collaborator that can inspect the files in this workspace, edit them, run available checks, and report what it changed. It follows your request plus the project-specific rules in `AGENTS.md`.

The agent is not a separate copy of the game. The game is the collection of files in this folder. Different agent conversations can work on the same files as long as they open this workspace.

## What happened so far

1. A new project folder and project-specific agent instructions were created.
2. Your racing-game idea was turned into a small playable prototype.
3. The source files, project brief, and this permanent build history were added to the workspace.

## Where things live

- `index.html` starts the game.
- `src/game.js` contains race rules, bots, upgrades, and drawing code.
- `src/styles.css` controls the interface and responsive layout.
- `docs/BUILD_LOG.md` records the project history.
- `docs/prototype-brief.md` records what the prototype is trying to learn.
- `AGENTS.md` tells future agents how to work on the project.

## How to ask for changes

Describe the result you want in ordinary language. Examples:

- "Make steering feel less slippery and update the build log."
- "Add two upgrade ideas, but do not code them yet."
- "Test the lap counter and fix it if it is broken."
- "Show me what changed since the last version."

You can also set boundaries such as "plan only," "do not change files," or "ask me before choosing an engine."

## Important distinction

The build log is a readable class record. Git is the technical version history. The files are currently tracked by a Git repository, but the initial snapshot has not yet been committed. A commit should be made once you are ready to preserve this version as an official checkpoint.
