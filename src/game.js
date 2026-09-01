const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startPanel");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const finalPanel = document.getElementById("finishPanel");
const finalTitle = document.getElementById("finishTitle");
const finalStats = document.getElementById("finishStats");
const lapDisplay = document.getElementById("lap");
const positionDisplay = document.getElementById("position");
const speedDisplay = document.getElementById("speed");
const bestTimeDisplay = document.getElementById("bestTime");
const chargeMeter = document.getElementById("chargeMeter");
const comboMeter = document.getElementById("comboMeter");
const upgradeName = document.getElementById("upgradeName");
const upgradeHint = document.querySelector("#upgradeHud small");

const keys = new Set();
const WORLD = { width: 3200, height: 2350 };
const TRACK_WIDTH = 188;
const ROAD_EDGE = 214;
const LAPS_TO_WIN = 2;
const BEST_TIME_KEY = "scrap-circuit-best-time";

const controlPoints = [
  { x: 1510, y: 1935 },
  { x: 2140, y: 2090 },
  { x: 2825, y: 1830 },
  { x: 2420, y: 1395 },
  { x: 2800, y: 965 },
  { x: 2595, y: 375 },
  { x: 1935, y: 250 },
  { x: 1390, y: 555 },
  { x: 860, y: 255 },
  { x: 270, y: 485 },
  { x: 535, y: 1000 },
  { x: 395, y: 1545 },
  { x: 910, y: 1885 },
];

const upgrades = [
  {
    id: "rocket",
    name: "Rocket Sneeze",
    color: "#ffcb45",
    hint: "SPACE launches a crooked burst of speed.",
    duration: 1.7,
  },
  {
    id: "magnet",
    name: "Junk Magnet",
    color: "#49d5ff",
    hint: "SPACE vacuums crates and drags nearby bots off pace.",
    duration: 6.2,
  },
  {
    id: "phase",
    name: "Phase Drive",
    color: "#b56cff",
    hint: "SPACE lets you ignore grass slowdown for a moment.",
    duration: 5.3,
  },
  {
    id: "banana",
    name: "Banana Printer",
    color: "#7cff6b",
    hint: "SPACE drops slippery scrap behind you.",
    duration: 0.8,
  },
];

let track = [];
let scenery = [];
let crates = [];
let boostPads = [];
let hazards = [];
let sparks = [];
let callouts = [];
let cars = [];
let player;
let state = "menu";
let lastTime = 0;
let startedAt = 0;
let finishedAt = 0;
let camera = { x: 0, y: 0 };
let crateSeed = 0;
let scrapCharge = 0;
let combo = 1;
let bestCombo = 1;
let comboTimer = 0;
let spaceWasDown = false;

function getBestTime() {
  const saved = Number(window.localStorage.getItem(BEST_TIME_KEY));
  return Number.isFinite(saved) && saved > 0 ? saved : null;
}

function saveBestTime(seconds) {
  window.localStorage.setItem(BEST_TIME_KEY, String(seconds));
}

function formatTime(seconds) {
  return seconds == null ? "--.-" : seconds.toFixed(1);
}

function resizeCanvas() {
  canvas.width = Math.floor(window.innerWidth * window.devicePixelRatio);
  canvas.height = Math.floor(window.innerHeight * window.devicePixelRatio);
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

function buildTrack() {
  track = [];
  for (let i = 0; i < controlPoints.length; i += 1) {
    const p0 = controlPoints[(i - 1 + controlPoints.length) % controlPoints.length];
    const p1 = controlPoints[i];
    const p2 = controlPoints[(i + 1) % controlPoints.length];
    const p3 = controlPoints[(i + 2) % controlPoints.length];
    for (let step = 0; step < 36; step += 1) {
      track.push(catmull(p0, p1, p2, p3, step / 36));
    }
  }
}

function nearestTrackDistance(x, y) {
  let best = Infinity;
  for (const point of track) {
    const distance = Math.hypot(x - point.x, y - point.y);
    if (distance < best) best = distance;
  }
  return best;
}

function directionAt(index) {
  const a = track[index % track.length];
  const b = track[(index + 7) % track.length];
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function offsetPoint(index, lane = 0) {
  const point = track[index % track.length];
  const angle = directionAt(index);
  return {
    x: point.x + Math.cos(angle + Math.PI / 2) * lane,
    y: point.y + Math.sin(angle + Math.PI / 2) * lane,
  };
}

function seededNoise(seed) {
  const x = Math.sin(seed * 999.7) * 10000;
  return x - Math.floor(x);
}

function buildScenery() {
  scenery = [];
  for (let i = 0; i < 190; i += 1) {
    const x = 110 + seededNoise(i + 4) * (WORLD.width - 220);
    const y = 110 + seededNoise(i + 300) * (WORLD.height - 220);
    if (nearestTrackDistance(x, y) < ROAD_EDGE + 80) continue;
    scenery.push({
      x,
      y,
      radius: 7 + seededNoise(i + 700) * 16,
      color: seededNoise(i + 900) > 0.35 ? "#2a9d59" : "#536b46",
      rock: seededNoise(i + 1200) > 0.82,
    });
  }
}

function spawnCrates() {
  crates = [];
  crateSeed += 1;
  let crateNumber = 0;
  for (let i = 34; i < track.length; i += 42) {
    const lane = seededNoise(i + crateSeed * 9) > 0.5 ? -42 : 42;
    const pos = offsetPoint(i, lane);
    const upgradeIndex = (crateNumber + crateSeed - 1) % upgrades.length;
    crates.push({
      x: pos.x,
      y: pos.y,
      type: upgrades[upgradeIndex],
      taken: false,
      bob: seededNoise(i + 50) * Math.PI * 2,
    });
    crateNumber += 1;
  }
}

function buildBoostPads() {
  boostPads = [];
  for (let i = 58; i < track.length; i += 78) {
    const lane = seededNoise(i + 1400) > 0.5 ? -48 : 48;
    const pos = offsetPoint(i, lane);
    boostPads.push({
      x: pos.x,
      y: pos.y,
      angle: directionAt(i),
      cooldown: 0,
    });
  }
}

function createCar(name, color, lane, index, controlled = false) {
  const angle = directionAt(0);
  const pos = offsetPoint(0, lane);
  return {
    name,
    color,
    x: pos.x - Math.cos(angle) * index * 48,
    y: pos.y - Math.sin(angle) * index * 48,
    angle,
    speed: 0,
    maxSpeed: controlled ? 470 : 420 + index * 12,
    acceleration: controlled ? 390 : 310,
    handling: controlled ? 3.4 : 2.45,
    lane,
    node: 0,
    lap: 1,
    controlled,
    activeUpgrade: null,
    upgradeTimer: 0,
    chargeBoostTimer: 0,
    upgradeReady: null,
    cooldown: 0,
    aiWobble: index * 1.7,
    finished: false,
    finishTime: 0,
  };
}

function resetGame() {
  hazards = [];
  sparks = [];
  callouts = [];
  for (const pad of boostPads) pad.cooldown = 0;
  spawnCrates();
  cars = [
    createCar("You", "#ff5151", -35, 0, true),
    createCar("Bolt", "#42d0ff", 18, 1),
    createCar("Miso", "#ffe057", 52, 2),
    createCar("Vera", "#8aff8a", -70, 3),
  ];
  player = cars[0];
  camera = { x: player.x, y: player.y };
  startedAt = performance.now();
  finishedAt = 0;
  scrapCharge = 0;
  combo = 1;
  bestCombo = 1;
  comboTimer = 0;
  spaceWasDown = false;
  state = "running";
  finalPanel.classList.add("hidden");
  startScreen.classList.add("hidden");
  updateHud();
}

function addCharge(amount) {
  scrapCharge = Math.max(0, Math.min(100, scrapCharge + amount * combo));
}

function addCombo(label, color, x = player.x, y = player.y - 55) {
  combo = Math.min(8, combo + 1);
  bestCombo = Math.max(bestCombo, combo);
  comboTimer = 3.2;
  callouts.push({ x, y, text: `${label} x${combo}`, color, life: 0.95 });
}

function useChargeBoost() {
  if (scrapCharge < 35 || player.finished) return;
  scrapCharge -= 35;
  player.speed += 360;
  player.chargeBoostTimer = 1.25;
  burst(player.x, player.y, "#f4df63", 28, 210);
  addCombo("CHARGE BOOST", "#f4df63");
}

function activateUpgrade(car) {
  if (!car.upgradeReady || car.cooldown > 0 || car.finished) return;
  const upgrade = car.upgradeReady;
  car.activeUpgrade = upgrade;
  car.upgradeTimer = upgrade.duration;
  car.cooldown = 0.35;
  car.upgradeReady = null;
  burst(car.x, car.y, upgrade.color, 34, 220);
  callouts.push({ x: car.x, y: car.y - 48, text: upgrade.name, color: upgrade.color, life: 1.2 });
  if (upgrade.id === "rocket") {
    car.speed += 560;
    car.angle += (seededNoise(performance.now()) - 0.5) * 0.2;
    camera.x -= Math.cos(car.angle) * 52;
    camera.y -= Math.sin(car.angle) * 52;
  }
  if (upgrade.id === "phase") {
    car.speed += 110;
  }
  if (upgrade.id === "magnet") {
    car.speed += 80;
  }
  if (upgrade.id === "banana") {
    for (let i = 1; i <= 3; i += 1) {
      hazards.push({
        x: car.x - Math.cos(car.angle) * (38 + i * 32),
        y: car.y - Math.sin(car.angle) * (38 + i * 32),
        radius: 38 + i * 4,
        life: 11,
      });
    }
  }
}

function burst(x, y, color, count, force = 120) {
  for (let i = 0; i < count; i += 1) {
    const angle = seededNoise(performance.now() + i * 13) * Math.PI * 2;
    const speed = force * (0.3 + seededNoise(performance.now() + i * 31));
    sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      life: 0.45 + seededNoise(i + force) * 0.5,
    });
  }
}

function updatePlayer(dt) {
  const accelerating = keys.has("arrowup") || keys.has("w");
  const braking = keys.has("arrowdown") || keys.has("s");
  const left = keys.has("arrowleft") || keys.has("a");
  const right = keys.has("arrowright") || keys.has("d");
  const turning = left || right;

  if (accelerating) player.speed += player.acceleration * dt;
  if (braking) player.speed -= player.acceleration * 0.65 * dt;
  if (!accelerating && !braking) player.speed *= 1 - 0.45 * dt;

  const steerPower = Math.min(1, Math.abs(player.speed) / 190);
  if (left) player.angle -= player.handling * steerPower * dt;
  if (right) player.angle += player.handling * steerPower * dt;
  if (turning && accelerating && player.speed > 225) {
    addCharge(10 * dt);
    if (seededNoise(performance.now()) > 0.91) {
      sparks.push({
        x: player.x - Math.cos(player.angle) * 26,
        y: player.y - Math.sin(player.angle) * 26,
        vx: (seededNoise(performance.now() + 11) - 0.5) * 90,
        vy: (seededNoise(performance.now() + 23) - 0.5) * 90,
        color: "#f4df63",
        life: 0.35,
      });
    }
  }
}

function updateBot(car, dt) {
  const targetIndex = (car.node + 15) % track.length;
  const wobble = Math.sin(performance.now() / 700 + car.aiWobble) * 18;
  const target = offsetPoint(targetIndex, car.lane + wobble);
  const desiredAngle = Math.atan2(target.y - car.y, target.x - car.x);
  let diff = desiredAngle - car.angle;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  car.angle += Math.max(-car.handling * dt, Math.min(car.handling * dt, diff));

  const offRoad = nearestTrackDistance(car.x, car.y) > TRACK_WIDTH / 2;
  const goalSpeed = offRoad ? car.maxSpeed * 0.72 : car.maxSpeed;
  car.speed += (goalSpeed - car.speed) * Math.min(1, dt * 2.35);
  if (car.upgradeReady && Math.abs(diff) < 0.35) activateUpgrade(car);
}

function updateProgress(car) {
  let bestNode = car.node;
  let bestDist = Infinity;
  for (let look = 1; look <= 28; look += 1) {
    const candidate = (car.node + look) % track.length;
    const point = track[candidate];
    const dist = Math.hypot(car.x - point.x, car.y - point.y);
    if (dist < bestDist) {
      bestDist = dist;
      bestNode = candidate;
    }
  }
  if (bestDist < 122) {
    if (bestNode < car.node && car.node > track.length - 32) {
      car.lap += 1;
      if (car.lap > LAPS_TO_WIN && !car.finished) {
        car.finished = true;
        car.finishTime = performance.now();
      }
    }
    car.node = bestNode;
  }
}

function applySurface(car, dt) {
  const offRoad = nearestTrackDistance(car.x, car.y) > TRACK_WIDTH / 2;
  const phase = car.activeUpgrade?.id === "phase";
  if (offRoad && !phase) car.speed *= 1 - 0.92 * dt;
  if (offRoad && phase) car.speed += 210 * dt;
}

function updateCar(car, dt) {
  if (car.finished) {
    car.speed *= 1 - 1.6 * dt;
  } else if (car.controlled) {
    updatePlayer(dt);
  } else {
    updateBot(car, dt);
  }

  applySurface(car, dt);
  car.cooldown = Math.max(0, car.cooldown - dt);
  if (car.activeUpgrade) {
    car.upgradeTimer -= dt;
    if (car.upgradeTimer <= 0) car.activeUpgrade = null;
  }
  car.chargeBoostTimer = Math.max(0, car.chargeBoostTimer - dt);

  const maxBoost = car.activeUpgrade?.id === "rocket" ? 1.58 : car.activeUpgrade?.id === "phase" ? 1.18 : car.chargeBoostTimer > 0 ? 1.36 : 1;
  car.speed = Math.max(-95, Math.min(car.maxSpeed * maxBoost, car.speed));
  car.x += Math.cos(car.angle) * car.speed * dt;
  car.y += Math.sin(car.angle) * car.speed * dt;
  car.x = Math.max(30, Math.min(WORLD.width - 30, car.x));
  car.y = Math.max(30, Math.min(WORLD.height - 30, car.y));
  updateProgress(car);
}

function collectCrates(car, dt) {
  const magnet = car.activeUpgrade?.id === "magnet";
  for (const crate of crates) {
    if (crate.taken) continue;
    const dx = crate.x - car.x;
    const dy = crate.y - car.y;
    const distance = Math.hypot(dx, dy);
    if (magnet && distance < 330) {
      crate.x -= dx * Math.min(1, dt * 8.5);
      crate.y -= dy * Math.min(1, dt * 8.5);
    }
    if (distance < 48) {
      crate.taken = true;
      car.upgradeReady = crate.type;
      car.speed += 75;
      burst(crate.x, crate.y, crate.type.color, 20, 150);
      if (car.controlled) {
        addCharge(9);
        addCombo("CRATE", crate.type.color, crate.x, crate.y - 38);
        callouts.push({ x: crate.x, y: crate.y - 62, text: "UPGRADE READY", color: crate.type.color, life: 0.9 });
      }
    }
  }
}

function useBoostPads(car, dt) {
  for (const pad of boostPads) {
    if (pad.cooldown > 0 || car.finished) continue;
    if (Math.hypot(car.x - pad.x, car.y - pad.y) < 52) {
      car.speed += car.controlled ? 520 : 360;
      pad.cooldown = 1.9;
      burst(pad.x, pad.y, "#ff7a2f", 26, 210);
      if (car.controlled) {
        addCharge(7);
        addCombo("SPEED PAD", "#ff7a2f", pad.x, pad.y - 42);
      }
    }
  }
}

function applyMagnetFields(dt) {
  for (const magnetCar of cars) {
    if (magnetCar.activeUpgrade?.id !== "magnet" || magnetCar.finished) continue;
    for (const target of cars) {
      if (target === magnetCar || target.finished) continue;
      const dx = magnetCar.x - target.x;
      const dy = magnetCar.y - target.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 285 || distance < 1) continue;
      const pull = (1 - distance / 285) * 220;
      target.x += (dx / distance) * pull * dt;
      target.y += (dy / distance) * pull * dt;
      target.speed *= 1 - 1.45 * dt;
      target.angle += Math.sin(performance.now() / 90 + target.aiWobble) * 1.2 * dt;
      if (magnetCar.controlled && seededNoise(performance.now() + target.aiWobble) > 0.965) {
        burst(target.x, target.y, "#49d5ff", 6, 90);
      }
    }
  }
}

function updateBoostPads(dt) {
  for (const pad of boostPads) {
    pad.cooldown = Math.max(0, pad.cooldown - dt);
  }
}

function updateHazards(dt) {
  for (const hazard of hazards) {
    hazard.life -= dt;
    for (const car of cars) {
      if (car.finished) continue;
      if (Math.hypot(car.x - hazard.x, car.y - hazard.y) < (hazard.radius || 38)) {
        car.speed *= 0.18;
        car.angle += 1.55;
        hazard.life = 0;
        burst(hazard.x, hazard.y, "#f4df63", 24, 170);
      }
    }
  }
  hazards = hazards.filter((hazard) => hazard.life > 0);
}

function updateEffects(dt) {
  comboTimer = Math.max(0, comboTimer - dt);
  if (comboTimer === 0) combo = 1;
  for (const spark of sparks) {
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.vx *= 1 - 2.4 * dt;
    spark.vy *= 1 - 2.4 * dt;
    spark.life -= dt;
  }
  sparks = sparks.filter((spark) => spark.life > 0);

  for (const callout of callouts) {
    callout.y -= 32 * dt;
    callout.life -= dt;
  }
  callouts = callouts.filter((callout) => callout.life > 0);
}

function raceScore(car) {
  return (car.lap - 1) * track.length + car.node;
}

function standings() {
  return [...cars].sort((a, b) => {
    if (a.finished && b.finished) return a.finishTime - b.finishTime;
    if (a.finished) return -1;
    if (b.finished) return 1;
    return raceScore(b) - raceScore(a);
  });
}

function updateHud() {
  lapDisplay.textContent = `LAP ${Math.min(player.lap, LAPS_TO_WIN)} / ${LAPS_TO_WIN}`;
  const rank = standings().findIndex((car) => car === player) + 1;
  positionDisplay.innerHTML = `${rank}<sup>${rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th"}</sup>`;
  speedDisplay.textContent = `${Math.round(Math.max(0, player.speed))}`;
  bestTimeDisplay.textContent = formatTime(getBestTime());
  chargeMeter.textContent = `${Math.round(scrapCharge)}%`;
  comboMeter.textContent = `COMBO x${combo}`;
  if (player.upgradeReady) {
    upgradeName.textContent = player.upgradeReady.name;
    upgradeName.style.color = player.upgradeReady.color;
    upgradeHint.textContent = "HELD UPGRADE";
  } else if (player.activeUpgrade) {
    upgradeName.textContent = `${player.activeUpgrade.name} active`;
    upgradeName.style.color = player.activeUpgrade.color;
    upgradeHint.textContent = "ACTIVE UPGRADE";
  } else {
    upgradeName.textContent = "No upgrade";
    upgradeName.style.color = "";
    upgradeHint.textContent = "HELD UPGRADE";
  }
}

function finishRace() {
  if (state !== "running") return;
  state = "finished";
  finishedAt = performance.now();
  const ordered = standings();
  const rank = ordered.findIndex((car) => car === player) + 1;
  const raceTime = (finishedAt - startedAt) / 1000;
  const previousBest = getBestTime();
  const newBest = previousBest == null || raceTime < previousBest;
  if (newBest) saveBestTime(raceTime);
  finalTitle.textContent = rank === 1 ? "You scrapped your way to first." : `Finished ${rank}${rank === 2 ? "nd" : rank === 3 ? "rd" : "th"}.`;
  finalStats.textContent = `Time: ${formatTime(raceTime)}s. Best: ${formatTime(getBestTime())}s${newBest ? " NEW BEST" : ""}. Top combo: x${bestCombo}. Upgrade crates collected: ${crates.filter((crate) => crate.taken).length}.`;
  finalPanel.classList.remove("hidden");
  updateHud();
}

function update(dt) {
  if (state !== "running") return;
  const spaceDown = keys.has(" ");
  if (spaceDown && !spaceWasDown) {
    if (player.upgradeReady) activateUpgrade(player);
    else useChargeBoost();
  }
  spaceWasDown = spaceDown;
  updateEffects(dt);
  updateBoostPads(dt);
  for (const car of cars) {
    updateCar(car, dt);
    collectCrates(car, dt);
    useBoostPads(car, dt);
  }
  applyMagnetFields(dt);
  updateHazards(dt);
  camera.x += (player.x - camera.x) * Math.min(1, dt * 4.8);
  camera.y += (player.y - camera.y) * Math.min(1, dt * 4.8);
  if (player.finished) finishRace();
  updateHud();
}

function visibleCircle(x, y, r = 0) {
  const w = canvas.width / window.devicePixelRatio;
  const h = canvas.height / window.devicePixelRatio;
  return x + r > camera.x - w / 2 && x - r < camera.x + w / 2 && y + r > camera.y - h / 2 && y - r < camera.y + h / 2;
}

function drawTrackStroke(width, color, shadow = false) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (shadow) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 12;
  }
  ctx.beginPath();
  ctx.moveTo(track[0].x, track[0].y);
  for (let i = 1; i < track.length; i += 1) ctx.lineTo(track[i].x, track[i].y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawDirectionArrows() {
  ctx.save();
  ctx.fillStyle = "rgba(255, 218, 75, 0.72)";
  for (let i = 18; i < track.length; i += 54) {
    const point = track[i];
    if (!visibleCircle(point.x, point.y, 120)) continue;
    const angle = directionAt(i);
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(34, 0);
    ctx.lineTo(-18, -18);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-18, 18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawCar(car) {
  if (!visibleCircle(car.x, car.y, 80)) return;
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.angle);
  if (car.activeUpgrade?.id === "phase") {
    ctx.strokeStyle = "#b56cff";
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.65 + Math.sin(performance.now() / 80) * 0.25;
    ctx.beginPath();
    ctx.ellipse(0, 0, 42, 28, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (car.activeUpgrade?.id === "magnet") {
    ctx.strokeStyle = "#49d5ff";
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.35 + Math.sin(performance.now() / 120) * 0.15;
    ctx.beginPath();
    ctx.arc(0, 0, 118, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 64, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (car.chargeBoostTimer > 0) {
    ctx.strokeStyle = "#f4df63";
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.45 + Math.sin(performance.now() / 65) * 0.18;
    ctx.beginPath();
    ctx.ellipse(0, 0, 50, 32, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 13, 32, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = car.color;
  roundRect(-27, -15, 54, 30, 7);
  ctx.fill();
  ctx.fillStyle = "#20212a";
  roundRect(0, -11, 18, 22, 5);
  ctx.fill();
  ctx.fillStyle = "#f7fbff";
  ctx.fillRect(19, -7, 7, 5);
  ctx.fillRect(19, 3, 7, 5);
  ctx.fillStyle = "#121318";
  ctx.fillRect(-20, -20, 13, 8);
  ctx.fillRect(8, -20, 13, 8);
  ctx.fillRect(-20, 12, 13, 8);
  ctx.fillRect(8, 12, 13, 8);
  if (car.activeUpgrade?.id === "rocket") {
    ctx.fillStyle = "#ff8b37";
    ctx.beginPath();
    ctx.moveTo(-30, 0);
    ctx.lineTo(-82, -16);
    ctx.lineTo(-60, 0);
    ctx.lineTo(-82, 16);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.fillStyle = "#ffffff";
  ctx.font = "600 12px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(car.name, car.x, car.y - 32);
}

function drawEffects() {
  for (const spark of sparks) {
    if (!visibleCircle(spark.x, spark.y, 30)) continue;
    ctx.globalAlpha = Math.max(0, Math.min(1, spark.life * 2));
    ctx.fillStyle = spark.color;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.font = "900 18px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.lineWidth = 4;
  for (const callout of callouts) {
    if (!visibleCircle(callout.x, callout.y, 120)) continue;
    ctx.globalAlpha = Math.max(0, Math.min(1, callout.life));
    ctx.strokeStyle = "#101319";
    ctx.fillStyle = callout.color;
    ctx.strokeText(callout.text, callout.x, callout.y);
    ctx.fillText(callout.text, callout.x, callout.y);
  }
  ctx.globalAlpha = 1;
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawWorld() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const w = canvas.width / window.devicePixelRatio;
  const h = canvas.height / window.devicePixelRatio;
  ctx.save();
  ctx.translate(w / 2 - camera.x, h / 2 - camera.y);

  ctx.fillStyle = "#32573a";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
  for (let x = 0; x < WORLD.width; x += 160) ctx.fillRect(x, 0, 2, WORLD.height);
  for (let y = 0; y < WORLD.height; y += 160) ctx.fillRect(0, y, WORLD.width, 2);

  for (const item of scenery) {
    if (!visibleCircle(item.x, item.y, item.radius + 20)) continue;
    ctx.fillStyle = item.rock ? "#8d9189" : item.color;
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
    ctx.fill();
    if (!item.rock) {
      ctx.fillStyle = "#5d3c28";
      ctx.fillRect(item.x - 3, item.y + item.radius - 3, 6, 13);
    }
  }

  drawTrackStroke(ROAD_EDGE, "#24402c", true);
  drawTrackStroke(TRACK_WIDTH, "#5f6771");
  drawTrackStroke(8, "rgba(255, 255, 255, 0.25)");
  drawDirectionArrows();

  for (const pad of boostPads) {
    if (!visibleCircle(pad.x, pad.y, 80)) continue;
    ctx.save();
    ctx.translate(pad.x, pad.y);
    ctx.rotate(pad.angle);
    ctx.globalAlpha = pad.cooldown > 0 ? 0.34 : 1;
    ctx.fillStyle = "#ff7a2f";
    ctx.shadowColor = "#ff7a2f";
    ctx.shadowBlur = pad.cooldown > 0 ? 0 : 18;
    roundRect(-34, -21, 68, 42, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffd45c";
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(-8, -12);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-8, 12);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  const start = offsetPoint(0, 0);
  const startAngle = directionAt(0) + Math.PI / 2;
  ctx.save();
  ctx.translate(start.x, start.y);
  ctx.rotate(startAngle);
  for (let row = -3; row < 4; row += 1) {
    for (let col = -1; col < 1; col += 1) {
      ctx.fillStyle = (row + col) % 2 === 0 ? "#f8f8f8" : "#1b1d24";
      ctx.fillRect(col * 18, row * 18, 18, 18);
    }
  }
  ctx.restore();

  for (const crate of crates) {
    if (crate.taken || !visibleCircle(crate.x, crate.y, 70)) continue;
    const lift = Math.sin(performance.now() / 250 + crate.bob) * 4;
    if (player?.activeUpgrade?.id === "magnet" && Math.hypot(crate.x - player.x, crate.y - player.y) < 330) {
      ctx.save();
      ctx.strokeStyle = "rgba(73, 213, 255, 0.58)";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(crate.x, crate.y);
      ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(crate.x, crate.y + lift);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = crate.type.color;
    ctx.shadowColor = crate.type.color;
    ctx.shadowBlur = 18;
    ctx.fillRect(-15, -15, 30, 30);
    ctx.restore();
  }

  ctx.fillStyle = "#f4df63";
  for (const hazard of hazards) {
    if (!visibleCircle(hazard.x, hazard.y, 50)) continue;
    const radius = hazard.radius || 38;
    ctx.beginPath();
    ctx.ellipse(hazard.x, hazard.y, radius, radius * 0.46, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#16191d";
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  if (player?.activeUpgrade?.id === "magnet") {
    ctx.save();
    ctx.strokeStyle = "rgba(73, 213, 255, 0.68)";
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 9]);
    for (const car of cars) {
      if (car === player || car.finished || Math.hypot(car.x - player.x, car.y - player.y) > 285) continue;
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(car.x, car.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  for (const car of cars) drawCar(car);
  drawEffects();
  ctx.restore();
}

function loop(time) {
  const dt = Math.min(0.035, (time - lastTime) / 1000 || 0);
  lastTime = time;
  update(dt);
  drawWorld();
  requestAnimationFrame(loop);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("keydown", (event) => {
  keys.add(event.key.toLowerCase());
  if (event.code === "Space") event.preventDefault();
});
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
startButton.addEventListener("click", resetGame);
restartButton.addEventListener("click", resetGame);
for (const button of document.querySelectorAll(".mobile-controls button")) {
  const key = button.dataset.key;
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    keys.add(key);
  });
  button.addEventListener("pointerup", () => keys.delete(key));
  button.addEventListener("pointerleave", () => keys.delete(key));
  button.addEventListener("pointercancel", () => keys.delete(key));
}

buildTrack();
buildScenery();
buildBoostPads();
spawnCrates();
resizeCanvas();
bestTimeDisplay.textContent = formatTime(getBestTime());
camera = { ...track[0] };
drawWorld();
requestAnimationFrame(loop);
