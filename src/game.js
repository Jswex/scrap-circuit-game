"use strict";

const canvas = document.querySelector("#gameCanvas");
const ctx = canvas.getContext("2d");
const ui = {
  position: document.querySelector("#position"), lap: document.querySelector("#lap"), speed: document.querySelector("#speed"),
  upgradeHud: document.querySelector("#upgradeHud"), upgradeIcon: document.querySelector("#upgradeIcon"), upgradeName: document.querySelector("#upgradeName"),
  countdown: document.querySelector("#countdown"), toast: document.querySelector("#toast"), startPanel: document.querySelector("#startPanel"),
  finishPanel: document.querySelector("#finishPanel"), finishTitle: document.querySelector("#finishTitle"), finishStats: document.querySelector("#finishStats"), credits: document.querySelector("#credits"), upgradePanel: document.querySelector("#upgradePanel"), difficulty: document.querySelector("#difficulty")
};

const TRACK = {
  width: 142,
  points: [
    { x: 260, y: 850 }, { x: 300, y: 470 }, { x: 540, y: 220 }, { x: 960, y: 180 },
    { x: 1320, y: 330 }, { x: 1510, y: 650 }, { x: 1770, y: 570 }, { x: 2150, y: 320 },
    { x: 2390, y: 500 }, { x: 2280, y: 900 }, { x: 1950, y: 1110 }, { x: 1540, y: 1010 },
    { x: 1220, y: 1260 }, { x: 760, y: 1190 }, { x: 430, y: 1030 }
  ]
};
const TRACK_SEGMENTS = TRACK.points.map((point, i) => {
  const next = TRACK.points[(i + 1) % TRACK.points.length];
  return Math.hypot(next.x - point.x, next.y - point.y);
});
const TRACK_LENGTH = TRACK_SEGMENTS.reduce((total, length) => total + length, 0);
const LAPS = 2;
const keys = new Set();
const colors = ["#ffce3a", "#e85d38", "#50c6d7", "#d970e8"];
const names = ["YOU", "RIVET", "BYTE", "MAYHEM"];
const difficultyPaces = { easy: .82, normal: 1, hard: 1.15 };
const upgrades = [
  { name: "ROCKET SNEEZE", icon: "➤", color: "#ff5c45", help: "A violent three-second boost", use(car) { car.boost = 3; } },
  { name: "JUNK MAGNET", icon: "⊕", color: "#54d6dd", help: "Pull nearby crates toward you", use(car) { car.magnet = 7; } },
  { name: "PHASE DRIVE", icon: "◈", color: "#d970e8", help: "Keep your grip through five seconds of chaos", use(car) { car.phase = 5; } },
  { name: "BANANA PRINTER", icon: "⌁", color: "#ffe25c", help: "Print slippery hazards behind you", use(car) { car.banana = 4; } }
];

let cars = [], crates = [], bananas = [], particles = [], state = "menu", last = 0, elapsed = 0, countdown = 0, nextOffer = 0, finished = [], credits = 1000;
const camera = { x: TRACK.points[0].x, y: TRACK.points[0].y };

function pointOnTrack(t, lane = 0) {
  const wrapped = ((t % 1) + 1) % 1;
  let distance = wrapped * TRACK_LENGTH;
  let segment = 0;
  while (distance > TRACK_SEGMENTS[segment]) distance -= TRACK_SEGMENTS[segment++];
  const start = TRACK.points[segment];
  const end = TRACK.points[(segment + 1) % TRACK.points.length];
  const ratio = distance / TRACK_SEGMENTS[segment];
  const x = start.x + (end.x - start.x) * ratio;
  const y = start.y + (end.y - start.y) * ratio;
  const length = TRACK_SEGMENTS[segment];
  const normalX = -(end.y - start.y) / length;
  const normalY = (end.x - start.x) / length;
  return { x: x + normalX * lane, y: y + normalY * lane };
}

function trackTangent(t) {
  const ahead = pointOnTrack(t + .001);
  const behind = pointOnTrack(t - .001);
  return Math.atan2(ahead.y - behind.y, ahead.x - behind.x);
}

const SHORTCUTS = [.27, .55, .78].map((from, i) => ({ start: pointOnTrack(from), end: pointOnTrack(from + [.055, .07, .085][i]), width: 96 }));
const LANDMARKS = [
  { t: .13, label: "CRANE YARD", color: "#e85d38" },
  { t: .43, label: "TIRE MOUNTAIN", color: "#50c6d7" },
  { t: .69, label: "PRESSED CARS", color: "#d970e8" },
  { t: .92, label: "REPAIR BAY", color: "#ffce3a" }
];
const TRACK_OBJECTS = [
  { t: .37, type: "oil", label: "OIL SLICK" },
  { t: .62, type: "oil", label: "OIL SLICK" },
  { t: .91, type: "repair", label: "REPAIR BAY" },
  { t: .48, type: "ramp", label: "JUNK RAMP" }
].map(object => ({ ...object, ...pointOnTrack(object.t, object.type === "repair" ? -20 : 0), cooldown: 0 }));

function makeCar(i) {
  const t = .205 + i * .012;
  const p = pointOnTrack(t, (i % 2) * 24 - 12);
  return { i, name: names[i], color: colors[i], x: p.x, y: p.y, angle: trackTangent(t) + Math.PI, speed: 0, t, progress: 1 - t, lap: 0, distanceTravelled: 0, lane: (i % 2) * 24 - 12, upgrade: null, boost: 0, magnet: 0, phase: 0, banana: 0, spin: 0, hazardCooldown: 0, finished: false, nextDrop: 0, onShortcut: false };
}

function reset() {
  cars = names.map((_, i) => makeCar(i));
  crates = Array.from({ length: 12 }, (_, i) => ({ ...pointOnTrack(i / 12, i % 2 ? 18 : -18), active: true, respawn: 0, spin: i }));
  bananas = []; particles = []; finished = []; elapsed = 0; countdown = 1.6; nextOffer = 8; state = "countdown";
  TRACK_OBJECTS.forEach(object => { object.cooldown = 0; });
  camera.x = cars[0].x; camera.y = cars[0].y;
  ui.finishPanel.classList.add("hidden"); ui.upgradePanel.classList.add("hidden"); ui.startPanel.classList.add("hidden");
}

function normalizeAngle(a) { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; }
function ordinal(n) { return n + ({ 1: "st", 2: "nd", 3: "rd" }[n] || "th"); }
function raceScore(car) { return car.lap * Math.PI * 2 + car.progress; }

function updatePlayer(car, dt) {
  if (car.spin > 0) { car.spin -= dt; car.angle += dt * 4; car.speed *= .98; return; }
  const accelerate = keys.has("KeyW") || keys.has("ArrowUp");
  const brake = keys.has("KeyS") || keys.has("ArrowDown");
  const turn = (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) - (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0);
  car.speed += (accelerate ? 480 : -105) * dt;
  if (brake) car.speed -= 320 * dt;
  const max = car.boost > 0 ? 620 : 450;
  car.speed = Math.max(-70, Math.min(max, car.speed));
  car.angle += turn * dt * 2.45 * Math.min(1, Math.abs(car.speed) / 80) * (car.speed < 0 ? -1 : 1);
  car.x += Math.cos(car.angle) * car.speed * dt;
  car.y += Math.sin(car.angle) * car.speed * dt;
}

function updateBot(car, dt) {
  if (car.spin > 0) { car.spin -= dt; car.angle += dt * 4; car.speed *= .98; return; }
  const targetT = car.t - .018;
  const target = pointOnTrack(targetT, car.lane);
  const desired = Math.atan2(target.y - car.y, target.x - car.x);
  car.angle += normalizeAngle(desired - car.angle) * dt * 4;
  const pace = (360 + car.i * 8 + Math.sin(elapsed * .6 + car.i) * 18 + (car.boost > 0 ? 160 : 0)) * difficultyPaces[ui.difficulty.value];
  car.speed += (pace - car.speed) * dt * 2.2;
  car.x += Math.cos(car.angle) * car.speed * dt;
  car.y += Math.sin(car.angle) * car.speed * dt;
  if (car.upgrade && Math.random() < dt * .18) useUpgrade(car);
}

function nearestTrackPoint(x, y) {
  let nearest = { distance: Infinity, t: 0, x: TRACK.points[0].x, y: TRACK.points[0].y };
  TRACK.points.forEach((point, i) => {
    const next = TRACK.points[(i + 1) % TRACK.points.length];
    const dx = next.x - point.x, dy = next.y - point.y;
    const lengthSquared = dx * dx + dy * dy;
    const ratio = Math.max(0, Math.min(1, ((x - point.x) * dx + (y - point.y) * dy) / lengthSquared));
    const closestX = point.x + dx * ratio, closestY = point.y + dy * ratio;
    const distance = Math.hypot(x - closestX, y - closestY);
    if (distance < nearest.distance) nearest = { distance, t: (i + ratio) / TRACK.points.length, x: closestX, y: closestY };
  });
  return nearest;
}

function checkLandmark(car) {
  LANDMARKS.forEach(landmark => {
    const distance = Math.hypot(car.x - landmark.pos.x, car.y - landmark.pos.y);
    if (distance < 120 && !landmark.seen) { landmark.seen = true; if (car.i === 0) toast(landmark.label); }
  });
}

function checkHazard(car, dt) {
  if (car.hazardCooldown > 0) return;
  TRACK_OBJECTS.forEach(object => {
    const distance = Math.hypot(car.x - object.x, car.y - object.y);
    if (distance < 48) {
      if (object.type === "oil" && car.phase <= 0) { car.speed *= .65; car.hazardCooldown = 2; if (car.i === 0) { toast("HIT " + object.label); burst(car.x, car.y, "#444a50", 12); } }
      if (object.type === "ramp") { car.speed += 180; car.hazardCooldown = 1.5; if (car.i === 0) toast("RAMP BOOST"); }
      if (object.type === "repair" && car.i === 0) { credits += 50; car.hazardCooldown = 3; toast("REPAIR BAY +50"); refreshCredits(); }
    }
  });
}

function updateProgress(car) {
  const nearest = nearestTrackPoint(car.x, car.y);
  const previous = car.t;
  const t = nearest.t;
  if (previous < .25 && t > .75 && car.speed > 0 && car.distanceTravelled > TRACK_LENGTH * .75) { car.lap++; if (car.i === 0) toast("LAP " + car.lap + " COMPLETE"); }
  car.t = t; car.progress = 1 - t;
  checkLandmark(car);
  if (car.lap >= LAPS && !car.finished) finishCar(car);
}

function trackDistance(x, y) {
  return nearestTrackPoint(x, y).distance;
}

function nearestRoadPoint(x, y) {
  let nearest = nearestTrackPoint(x, y);
  SHORTCUTS.forEach(shortcut => {
    const dx = shortcut.end.x - shortcut.start.x, dy = shortcut.end.y - shortcut.start.y;
    const ratio = Math.max(0, Math.min(1, ((x - shortcut.start.x) * dx + (y - shortcut.start.y) * dy) / (dx * dx + dy * dy)));
    const closestX = shortcut.start.x + dx * ratio, closestY = shortcut.start.y + dy * ratio;
    const distance = Math.hypot(x - closestX, y - closestY);
    if (distance < nearest.distance) nearest = { distance, x: closestX, y: closestY };
  });
  return nearest;
}

function keepOnTrack(car) {
  const nearest = nearestRoadPoint(car.x, car.y);
  const limit = TRACK.width / 2 - 12;
  if (nearest.distance <= limit) return;
  const distance = Math.max(nearest.distance, 1);
  const allowed = Math.min(limit, nearest.distance);
  car.x = nearest.x + (car.x - nearest.x) / distance * allowed;
  car.y = nearest.y + (car.y - nearest.y) / distance * allowed;
  car.speed *= .88;
}

function updateHazards(dt) {
  TRACK_OBJECTS.forEach(o => { o.cooldown = Math.max(0, o.cooldown - dt); });
  cars.forEach(car => { car.hazardCooldown = Math.max(0, car.hazardCooldown - dt); });
}

function useUpgrade(car) {
  if (!car || !car.upgrade || state !== "racing") return;
  const up = car.upgrade; car.upgrade = null; up.use(car);
  burst(car.x, car.y, up.color, 18);
  if (car.i === 0) { toast(up.name + " ACTIVATED"); refreshUpgrade(); }
}

function openUpgradePanel() {
  state = "upgrade";
  ui.upgradePanel.classList.remove("hidden");
}

function chooseUpgrade(index) {
  if (state !== "upgrade") return;
  cars[0].upgrade = upgrades[index];
  ui.upgradePanel.classList.add("hidden");
  nextOffer = elapsed + 12;
  state = "racing";
  refreshUpgrade();
  toast(upgrades[index].name + " SELECTED");
}

function update(dt) {
  particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
  particles = particles.filter(p => p.life > 0);
  crates.forEach(c => { c.spin += dt * 2.8; if (!c.active && (c.respawn -= dt) <= 0) c.active = true; });
  updateHazards(dt);
  if (state === "countdown") {
    countdown -= dt; ui.countdown.textContent = countdown > 1 ? Math.ceil(countdown) : countdown > 0 ? "GO!" : "";
    if (countdown <= -.35) state = "racing";
    return;
  }
  if (state !== "racing") return;
  elapsed += dt;
  if (elapsed >= nextOffer) { openUpgradePanel(); return; }
  cars.forEach((car, i) => {
    if (car.finished) return;
    if (i === 0) updatePlayer(car, dt); else updateBot(car, dt);
    ["boost", "magnet", "phase", "banana"].forEach(k => car[k] = Math.max(0, car[k] - dt));
    checkHazard(car, dt);
    if (car.banana > 0 && elapsed > car.nextDrop) { bananas.push({ x: car.x, y: car.y, life: 10, owner: car.i }); car.nextDrop = elapsed + .32; }
    keepOnTrack(car);
    car.distanceTravelled += Math.max(0, car.speed) * dt;
    if (car.magnet > 0) crates.forEach(c => { if (c.active && Math.hypot(c.x-car.x,c.y-car.y)<180) { c.x += (car.x-c.x)*dt*2.4; c.y += (car.y-c.y)*dt*2.4; } });
    crates.forEach(c => { if (c.active && !car.upgrade && Math.hypot(c.x-car.x,c.y-car.y)<27) collectCrate(car,c); });
    bananas.forEach(b => { if (b.owner !== car.i && Math.hypot(b.x-car.x,b.y-car.y)<24) { car.spin=.35; b.life=0; burst(b.x,b.y,"#ffe25c",10); } });
    updateProgress(car);
  });
  bananas.forEach(b => b.life -= dt); bananas = bananas.filter(b => b.life > 0);
  updateHud();
}

function collectCrate(car, crate) {
  crate.active = false; crate.respawn = 5; car.upgrade = upgrades[Math.floor(Math.random()*upgrades.length)];
  if (car.i === 0) { credits += 25; refreshCredits(); }
  burst(crate.x, crate.y, car.upgrade.color, 16);
  if (car.i === 0) { toast(car.upgrade.name + " ACQUIRED"); refreshUpgrade(); }
}

function finishCar(car) {
  car.finished = true; finished.push(car); car.place = finished.length;
  if (car.i === 0) {
    const finishBonus = Math.max(100, 500 - (car.place - 1) * 100);
    credits += finishBonus;
    refreshCredits();
    state = "finished";
    ui.finishTitle.textContent = "YOU FINISHED " + ordinal(car.place).toUpperCase();
    ui.finishStats.textContent = `Time ${elapsed.toFixed(1)}s · ${car.place === 1 ? "Junkyard royalty." : "The circuit demands another run."}`;
    setTimeout(() => ui.finishPanel.classList.remove("hidden"), 700);
  }
}

function burst(x,y,color,count) { for(let i=0;i<count;i++){ const a=Math.random()*Math.PI*2,s=40+Math.random()*110; particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.35+Math.random()*.5,color}); } }
function toast(message) { ui.toast.textContent=message; ui.toast.classList.add("show"); clearTimeout(toast.timer); toast.timer=setTimeout(()=>ui.toast.classList.remove("show"),1400); }
function refreshUpgrade(){ const up=cars[0]?.upgrade; ui.upgradeHud.classList.toggle("empty",!up); ui.upgradeIcon.textContent=up?.icon||"?"; ui.upgradeIcon.style.background=up?.color||"#ffce3a"; ui.upgradeName.textContent=up?.name||"Drive through a crate"; }
function refreshCredits(){ ui.credits.textContent = credits.toLocaleString("en-US"); }

function updateHud() {
  const player=cars[0], order=[...cars].sort((a,b)=>raceScore(b)-raceScore(a)), place=order.indexOf(player)+1;
  ui.position.innerHTML=`${place}<sup>${ordinal(place).slice(-2)}</sup>`; ui.lap.textContent=`LAP ${Math.min(LAPS,player.lap+1)} / ${LAPS}`; ui.speed.textContent=String(Math.round(Math.abs(player.speed))).padStart(3,"0");
}

function drawTrack() {
  ctx.fillStyle="#26352e"; ctx.fillRect(-10000,-10000,20000,20000);
  for(let i=0;i<260;i++){ const x=(i*149)%2700,y=(i*83)%1500; ctx.fillStyle=i%3?"#304139":"#3a493d"; ctx.fillRect(x,y,3,3); }
  ctx.lineCap="round"; ctx.lineJoin="round";
  ctx.beginPath(); TRACK.points.forEach((point, i) => i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.closePath();
  ctx.strokeStyle="#15191d"; ctx.lineWidth=TRACK.width+22; ctx.stroke();
  ctx.strokeStyle="#444a50"; ctx.lineWidth=TRACK.width; ctx.stroke();
  ctx.setLineDash([22,25]); ctx.strokeStyle="#777c80"; ctx.lineWidth=3; ctx.stroke(); ctx.setLineDash([]);
  const start = pointOnTrack(0), finish = pointOnTrack(0, TRACK.width / 2);
  ctx.strokeStyle="#e8e2d4"; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(start.x - 45, start.y - 45); ctx.lineTo(finish.x + 45, finish.y + 45); ctx.stroke();
  ctx.fillStyle="#e85d38"; for(let i=0;i<28;i++){ const p=pointOnTrack(i/28, TRACK.width/2+18); ctx.save();ctx.translate(p.x,p.y);ctx.rotate(trackTangent(i/28));ctx.fillRect(-8,-8,16,16);ctx.restore(); }
  SHORTCUTS.forEach(shortcut => { ctx.lineCap="round"; ctx.strokeStyle="#15191d"; ctx.lineWidth=TRACK.width+22; ctx.beginPath(); ctx.moveTo(shortcut.start.x,shortcut.start.y); ctx.lineTo(shortcut.end.x,shortcut.end.y); ctx.stroke(); ctx.strokeStyle="#59636a"; ctx.lineWidth=TRACK.width; ctx.stroke(); ctx.setLineDash([18,20]); ctx.strokeStyle="#8c9496"; ctx.lineWidth=3; ctx.stroke(); ctx.setLineDash([]); });
  LANDMARKS.forEach(landmark => { ctx.fillStyle = landmark.color + "44"; ctx.beginPath(); ctx.arc(landmark.pos.x, landmark.pos.y, 90, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = landmark.color; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = landmark.color; ctx.font = "700 9px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(landmark.label, landmark.pos.x, landmark.pos.y); });
  TRACK_OBJECTS.forEach(object => { const icon = object.type === "oil" ? "☷" : object.type === "ramp" ? "▲" : "⚙"; ctx.fillStyle = object.type === "oil" ? "#444a50" : object.type === "ramp" ? "#e85d38" : "#ffce3a"; ctx.beginPath(); ctx.arc(object.x, object.y, 18, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#101319"; ctx.font = "900 16px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(icon, object.x, object.y); });
}

function drawCrate(c){ if(!c.active)return; ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.spin);ctx.fillStyle="#ffce3a";ctx.fillRect(-14,-14,28,28);ctx.strokeStyle="#12161a";ctx.lineWidth=4;ctx.strokeRect(-14,-14,28,28);ctx.fillStyle="#12161a";ctx.font="900 18px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("?",0,1);ctx.restore(); }
function drawCar(car){ ctx.save();ctx.translate(car.x,car.y);ctx.rotate(car.angle); if(car.phase>0){ctx.globalAlpha=.42+Math.sin(elapsed*12)*.2;} ctx.fillStyle="#101319";ctx.fillRect(-17,-13,34,5);ctx.fillRect(-17,8,34,5);ctx.fillStyle=car.color;ctx.fillRect(-18,-10,36,20);ctx.fillStyle="#e8edf2";ctx.fillRect(3,-7,9,14);ctx.fillStyle="#171b20";ctx.fillRect(-6,-7,8,14);ctx.fillStyle=car.boost>0?"#62e6ff":"#e85d38";ctx.beginPath();ctx.moveTo(-18,-6);ctx.lineTo(-18-Math.random()*15,-1);ctx.lineTo(-18,5);ctx.fill();ctx.restore(); ctx.fillStyle="#f4f1e8";ctx.font="800 9px sans-serif";ctx.textAlign="center";ctx.fillText(car.name,car.x,car.y-19); }

function draw() {
  const targetWidth=Math.max(640,Math.round(canvas.clientWidth*devicePixelRatio)), targetHeight=Math.max(360,Math.round(canvas.clientHeight*devicePixelRatio));
  if(canvas.width!==targetWidth||canvas.height!==targetHeight){ canvas.width=targetWidth;canvas.height=targetHeight; }
  const player = cars[0];
  const target = player || TRACK.points[0];
  camera.x += (target.x - camera.x) * .08;
  camera.y += (target.y - camera.y) * .08;
  const scale=Math.min(canvas.width/1280,canvas.height/720) * 1.08;
  ctx.setTransform(scale,0,0,scale,canvas.width/2-camera.x*scale,canvas.height/2-camera.y*scale); drawTrack();
  bananas.forEach(b=>{ctx.fillStyle="#ffe25c";ctx.beginPath();ctx.arc(b.x,b.y,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#171b20";ctx.lineWidth=3;ctx.stroke();});
  crates.forEach(drawCrate); cars.forEach(drawCar); particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(p.x-3,p.y-3,6,6);ctx.globalAlpha=1;});
}

function loop(now){ const dt=Math.min(.033,(now-last)/1000||0);last=now;update(dt);draw();requestAnimationFrame(loop); }
LANDMARKS.forEach(landmark => { landmark.pos = pointOnTrack(landmark.t); landmark.seen = false; });
document.querySelector("#startButton").addEventListener("click",reset); document.querySelector("#restartButton").addEventListener("click",reset);
document.querySelectorAll(".upgrade-choice").forEach(button => button.addEventListener("click", () => chooseUpgrade(Number(button.dataset.upgrade))));
document.addEventListener("keydown",e=>{keys.add(e.code);if(e.code==="Space"){e.preventDefault();useUpgrade(cars[0]);}}); document.addEventListener("keyup",e=>keys.delete(e.code));
document.querySelectorAll(".mobile-controls button").forEach(b=>{ const code=b.dataset.key;b.addEventListener("pointerdown",e=>{e.preventDefault();keys.add(code);if(code==="Space")useUpgrade(cars[0]);});["pointerup","pointercancel","pointerleave"].forEach(ev=>b.addEventListener(ev,()=>keys.delete(code))); });
requestAnimationFrame(loop);
