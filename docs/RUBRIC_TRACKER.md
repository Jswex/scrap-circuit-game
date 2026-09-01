# BUSFIN 4215 Game Rubric Tracker

Source rubric: `../BUSFIN 4215 - Assessment Rubrics.pdf`, "Ship a Game".

This tracker is evidence, not a grade guarantee. The repo can support a strong submission, but the final score depends on public access, a real unfamiliar-user test, the in-class demo, and the instructor's judgment.

## Evidence To Submit

- [x] Public repository URL: https://github.com/Jswex/scrap-circuit-game
- [x] Public play URL listed in README: https://jswex.github.io/scrap-circuit-game/
- [x] Source folder included in repo.
- [x] Concise build log: `docs/BUILD_LOG.md`
- [x] User-test note template: `docs/PLAYTEST.md`
- [x] Public play URL returned HTTP 200 from an unauthenticated request.
- [ ] Signed-out play URL check in a normal browser where you are not logged into GitHub.
- [ ] Second-device play URL check.
- [ ] Real silent unfamiliar-user test notes.
- [ ] Revision after that test.
- [ ] Verified second attempt after the revision.
- [ ] In-class live demo and reflection.

## Criterion 1: Working Deployment And Playable Loop

Rubric weight: 30%.

Current evidence:
- Public GitHub metadata reports repository visibility as public.
- README points to a GitHub Pages URL, and the URL returned HTTP 200 from an unauthenticated request.
- The game has a start screen, race loop, bot opponents, upgrades, lap tracking, finish screen, and restart.
- Latest build changes the track into a large camera-followed course so the player cannot see the full route at once.

Still needed:
- Open the play URL signed out and confirm it works.
- Open the play URL on a second device and confirm it works.
- Complete one full three-lap race after the latest revision.

## Criterion 2: Product Clarity And Restraint

Rubric weight: 15%.

Current evidence:
- First screen states the objective, lap count, direction, controls, and upgrade rule.
- Track arrows show the counterclockwise route.
- HUD shows position, lap, speed, and held upgrade without requiring narration.

Still needed:
- Watch whether a first-time player understands acceleration, route direction, and the upgrade key without explanation.

## Criterion 3: Unfamiliar-User Test And Revision

Rubric weight: 20%.

Current evidence:
- `docs/PLAYTEST.md` gives the note structure.
- Build log records revisions made from observed/product friction so far.

Still needed:
- Run a silent test with someone who has not seen the game.
- Record what they actually did, especially hesitation and misunderstanding.
- Make one meaningful revision based on the biggest friction.
- Verify the revision with a second attempt.

Do not invent this section. A thinner true test is better evidence than polished fake notes.

## Criterion 4: Agent Workflow And Ownership

Rubric weight: 20%.

Current evidence:
- `docs/BUILD_LOG.md` records prompts, diagnosis, changes, verification, and limitations.
- `docs/AGENT_GUIDE.md` explains how agents/workspaces are being used.
- This tracker names remaining rubric evidence plainly.

Still needed:
- Be ready to explain why the project uses a simple browser canvas game: fast access, easy public playtesting, and a small enough scope for real iteration.
- Be ready to explain one major implementation choice, such as the follow camera or the upgrade loop.

## Criterion 5: Demonstration And Learning Reflection

Rubric weight: 15%.

Use this structure for the live demo:

1. Start the public URL.
2. Explain the objective in one sentence.
3. Drive until you collect and use an upgrade.
4. Show the finish/restart loop if time allows.
5. Name one failure: the early circular track was too predictable and visible all at once.
6. Name the diagnosis: the game needed discovery, route reading, and more meaningful steering.
7. Name the change: a larger winding counterclockwise course with camera follow and route arrows.
8. Name the transferable lesson: scope the game small enough that user friction can be observed and fixed quickly.
