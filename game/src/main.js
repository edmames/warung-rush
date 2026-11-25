// Game loop utama, state shift Warung Rush, efek visual, dan kontrol cepat.

import { sound } from './audio.js';
import {
  COMBO_MAX_MULTIPLIER,
  HEIGHT,
  LAYOUT,
  MAX_REPUTATION,
  PALETTE,
  SHIFT_DURATION,
  SPEED_BONUS_THRESHOLD,
  WIDTH,
} from './config.js';
import { attachInput } from './input.js';
import {
  createKitchenState,
  findBestPlateForItem,
  findReadyPlateForRecipe,
  getDishName,
  interactPlate,
  interactStation,
  interactTrash,
  isStationWarning,
  pickCounterItem,
  setPlateItems,
  updateKitchen,
} from './kitchen.js';
import {
  createOrdersState,
  findUrgentMatchingOrder,
  getPhase,
  removeOrderAt,
  spawnOrder,
  updateOrders,
} from './orders.js';
import { INGREDIENTS, isPreparedItem } from './recipes.js';
import { renderGame } from './render.js';
import { applyShotStaging, readShotParams } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function createGameState(seed = 42) {
  return {
    mode: 'start', // start | playing | ended
    endReason: null,
    shotMode: null,
    seed,
    time: 0,
    elapsed: 0,
    remaining: SHIFT_DURATION,
    lastPhaseIndex: 0,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    served: 0,
    missed: 0,
    reputation: MAX_REPUTATION,
    muted: false,
    orders: createOrdersState(seed),
    kitchen: createKitchenState(),
    particles: [],
    flyingDishes: [],
    popups: [],
    toast: null,
    pointer: { x: WIDTH / 2, y: HEIGHT / 2, hover: null },
  };
}

const shotParams = readShotParams();
const state = createGameState(shotParams.seed);

function showToast(text, duration = 1.9) {
  if (!text) return;
  state.toast = { text, life: duration };
}

function addPopup(x, y, text, color = PALETTE.turmericBright) {
  state.popups.push({ x, y, text, color, life: 1.25, maxLife: 1.25 });
}

function spawnParticles(x, y, kind, count = 6, color = null) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = kind === 'steam' || kind === 'smoke' ? 14 + Math.random() * 18 : 45 + Math.random() * 75;
    state.particles.push({
      x: x + (Math.random() - 0.5) * 28,
      y: y + (Math.random() - 0.5) * 14,
      vx: kind === 'steam' || kind === 'smoke' ? (Math.random() - 0.5) * 16 : Math.cos(angle) * speed,
      vy: kind === 'steam' || kind === 'smoke' ? -speed : Math.sin(angle) * speed - 25,
      life: kind === 'steam' || kind === 'smoke' ? 0.7 + Math.random() * 0.45 : 0.35 + Math.random() * 0.25,
      maxLife: 1.0,
      size: kind === 'steam' || kind === 'smoke' ? 7 + Math.random() * 6 : 4 + Math.random() * 3,
      kind,
      color,
    });
  }
}

function startNewShift(seed = state.seed) {
  const nextSeed = state.shotMode ? seed : Math.floor(Date.now() % 100000);
  state.mode = 'playing';
  state.endReason = null;
  state.shotMode = null;
  state.seed = nextSeed;
  state.elapsed = 0;
  state.remaining = SHIFT_DURATION;
  state.lastPhaseIndex = 0;
  state.score = 0;
  state.coins = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.served = 0;
  state.missed = 0;
  state.reputation = MAX_REPUTATION;
  state.orders = createOrdersState(nextSeed);
  state.kitchen = createKitchenState();
  state.particles = [];
  state.flyingDishes = [];
  state.popups = [];
  state.toast = null;

  // Langsung munculkan 2 pesanan awal agar shift segera hidup
  spawnOrder(state.orders, 0, { slot: 0 });
  spawnOrder(state.orders, 0, { slot: 1 });
  state.orders.spawnTimer = 5.0;

  sound.play('cooked');
  showToast('Shift dimulai! Klik bahan -> olah di stasiun -> rakit di piring!', 2.6);
}

function handleFeedback(res, originX, originY) {
  if (!res) return;
  if (res.sound) sound.play(res.sound);
  if (res.toast) showToast(res.toast);

  if (res.effect === 'chop') {
    const r = LAYOUT.stations.talenan;
    spawnParticles(r.x + r.w / 2, r.y + 100, 'spark', 8, PALETTE.leafBright);
  } else if (res.effect === 'sizzle') {
    const r = LAYOUT.stations.wajan;
    spawnParticles(r.x + r.w / 2, r.y + 92, 'steam', 6);
  } else if (res.effect === 'ember') {
    const r = LAYOUT.stations.panggangan;
    spawnParticles(r.x + r.w / 2, r.y + 95, 'spark', 7, PALETTE.ember);
  } else if (res.effect === 'pour') {
    const r = LAYOUT.stations.minuman;
    spawnParticles(r.x + r.w / 2 + 34, r.y + 110, 'spark', 6, '#d6822d');
  } else if (res.effect === 'plate_ready' && typeof res.plateIndex === 'number') {
    const r = LAYOUT.plates[res.plateIndex];
    spawnParticles(r.x + 86, r.y + 72, 'spark', 10, PALETTE.turmericBright);
  } else if (res.effect === 'plate_add' && typeof originX === 'number') {
    spawnParticles(originX, originY, 'spark', 5, PALETTE.cream);
  }
}

function serveToOrderSlot(slotIndex, fromX, fromY) {
  const order = state.orders.slots[slotIndex];
  if (!order) return false;

  let recipeId = null;
  let sourceFromHand = false;
  let sourcePlateIndex = -1;

  if (state.kitchen.hand && state.kitchen.hand.kind === 'dish') {
    recipeId = state.kitchen.hand.recipeId;
    sourceFromHand = true;
  } else if (state.kitchen.hand === null) {
    // Kemudahan: jika tangan kosong & piring siap saji cocok ada di meja, langsung sajikan!
    sourcePlateIndex = findReadyPlateForRecipe(state.kitchen, order.recipeId);
    if (sourcePlateIndex >= 0) {
      recipeId = order.recipeId;
      const pr = LAYOUT.plates[sourcePlateIndex];
      fromX = pr.x + 86;
      fromY = pr.y + 72;
    }
  }

  if (!recipeId) {
    sound.play('click');
    showToast(`Pelanggan memesan ${order.recipe.name}!`);
    return false;
  }

  if (recipeId !== order.recipeId) {
    sound.play('error');
    showToast(`Pesanan ini ${order.recipe.name}, bukan ${getDishName(recipeId)}!`);
    return false;
  }

  if (sourceFromHand) {
    state.kitchen.hand = null;
  } else if (sourcePlateIndex >= 0) {
    setPlateItems(state.kitchen, sourcePlateIndex, []);
  }

  const servedOrder = removeOrderAt(state.orders, slotIndex);
  const ratio = Math.max(0, servedOrder.patience / servedOrder.maxPatience);
  const phase = getPhase(state.elapsed);

  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.served += 1;

  const comboMult = Math.min(COMBO_MAX_MULTIPLIER, state.combo);
  const speedBonus = ratio >= SPEED_BONUS_THRESHOLD ? Math.round(servedOrder.recipe.coins * 0.4) : 0;
  const gainedCoins = Math.round((servedOrder.recipe.coins + speedBonus) * phase.tipBonus);
  const gainedScore = Math.round(
    (servedOrder.recipe.score + speedBonus * 10) * (1 + (comboMult - 1) * 0.2) * phase.tipBonus
  );

  state.coins += gainedCoins;
  state.score += gainedScore;

  const targetRect = LAYOUT.orders[slotIndex];
  const tx = targetRect.x + targetRect.w / 2;
  const ty = targetRect.y + targetRect.h / 2;

  state.flyingDishes.push({
    recipeId,
    fromX: fromX ?? WIDTH / 2,
    fromY: fromY ?? 480,
    toX: tx,
    toY: ty,
    t: 0,
    duration: 0.32,
  });

  spawnParticles(tx, ty, 'spark', 12, PALETTE.turmericBright);
  const bonusLabel = state.combo >= 2 ? `  KOMBO x${state.combo}!` : speedBonus > 0 ? '  CEPAT!' : '';
  addPopup(tx, ty - 6, `+${gainedCoins} koin${bonusLabel}`, PALETTE.turmericBright);
  sound.play('serve');
  return true;
}

function handleSpaceAction() {
  if (state.mode === 'start' || state.mode === 'ended') {
    startNewShift();
    return;
  }

  const { hand, selectedStation } = state.kitchen;

  // 1. Jika pegang hidangan jadi -> langsung sajikan ke pelanggan paling mendesak!
  if (hand && hand.kind === 'dish') {
    const match = findUrgentMatchingOrder(state.orders, hand.recipeId);
    if (match) {
      serveToOrderSlot(match.slot, state.pointer.x, state.pointer.y);
      return;
    }
    showToast('Belum ada pelanggan yang memesan hidangan ini');
    sound.play('error');
    return;
  }

  // 2. Jika pegang bahan gosong / salah rakit -> langsung buang ke sampah!
  if (hand && (hand.kind === 'junk' || (hand.kind === 'item' && INGREDIENTS[hand.id]?.burnt))) {
    handleFeedback(interactTrash(state.kitchen));
    return;
  }

  // 3. Jika pegang bahan siap rakit (kecuali es batu saat Rak Minuman dipilih) -> taruh di piring terbaik
  if (hand && hand.kind === 'item' && isPreparedItem(hand.id)) {
    if (!(hand.id === 'es' && selectedStation === 'minuman')) {
      const pIdx = findBestPlateForItem(state.kitchen, hand.id);
      if (pIdx >= 0) {
        const pr = LAYOUT.plates[pIdx];
        handleFeedback(interactPlate(state.kitchen, pIdx), pr.x + 86, pr.y + 72);
        return;
      }
    }
  }

  // 4. Selain itu -> interaksi cepat dengan stasiun terpilih (1-4)
  const stRect = LAYOUT.stations[selectedStation];
  handleFeedback(interactStation(state.kitchen, selectedStation), stRect.x + stRect.w / 2, stRect.y + 90);
}

const pointer = attachInput(canvas, {
  getMode: () => state.mode,
  onHit(hit, pt) {
    if (hit.type === 'mute') {
      state.muted = sound.toggleMute();
      return;
    }
    if (hit.type === 'start_btn' || hit.type === 'replay_btn') {
      startNewShift();
      return;
    }
    if (state.mode !== 'playing') return;

    if (hit.type === 'counter') {
      handleFeedback(pickCounterItem(state.kitchen, hit.itemId), pt.x, pt.y);
    } else if (hit.type === 'station') {
      handleFeedback(interactStation(state.kitchen, hit.id), pt.x, pt.y);
    } else if (hit.type === 'plate') {
      handleFeedback(interactPlate(state.kitchen, hit.index), pt.x, pt.y);
    } else if (hit.type === 'trash') {
      handleFeedback(interactTrash(state.kitchen), pt.x, pt.y);
    } else if (hit.type === 'order') {
      serveToOrderSlot(hit.index, pt.x, pt.y);
    }
  },
  onStationKey(stationId) {
    if (state.mode !== 'playing') return;
    state.kitchen.selectedStation = stationId;
    sound.play('click');
  },
  onSpaceKey() {
    handleSpaceAction();
  },
  onEnterKey() {
    if (state.mode === 'start' || state.mode === 'ended') {
      startNewShift();
    }
  },
  onMuteKey() {
    state.muted = sound.toggleMute();
  },
});

state.pointer = pointer;

// Terapkan mode screenshot staging jika query ?shot= ada
const isStaged = applyShotStaging(state, shotParams.shot, shotParams.seed);

let steamTimer = 0;

function update(dt) {
  state.time += dt;

  if (state.mode !== 'playing') return;

  state.elapsed += dt;
  state.remaining = Math.max(0, SHIFT_DURATION - state.elapsed);

  const currentPhase = getPhase(state.elapsed);
  if (currentPhase.index > state.lastPhaseIndex) {
    state.lastPhaseIndex = currentPhase.index;
    if (currentPhase.isRush) {
      sound.play('rush');
      addPopup(WIDTH / 2, 240, 'RUSH HOUR! BONUS KOIN 1.5x!', PALETTE.chili);
    } else {
      addPopup(WIDTH / 2, 240, `${currentPhase.name.toUpperCase()}!`, PALETTE.turmericBright);
    }
  }

  // Update stasiun masak
  const kitchenEvents = updateKitchen(state.kitchen, dt);
  for (const ev of kitchenEvents) {
    const r = LAYOUT.stations[ev.stationId];
    if (ev.type === 'cooked') {
      sound.play('cooked');
      spawnParticles(r.x + r.w / 2, r.y + 84, 'steam', 6);
    } else if (ev.type === 'burnt') {
      sound.play('burn');
      spawnParticles(r.x + r.w / 2, r.y + 84, 'smoke', 10);
      addPopup(r.x + r.w / 2, r.y + 60, 'GOSONG!', PALETTE.chili);
    }
  }

  // Uap & asap berkelanjutan di wajan / panggangan
  steamTimer -= dt;
  if (steamTimer <= 0) {
    steamTimer = 0.24;
    for (const id of ['wajan', 'panggangan']) {
      const st = state.kitchen.stations[id];
      const r = LAYOUT.stations[id];
      if (st.status === 'cooking' || (st.status === 'ready' && !isStationWarning(st))) {
        spawnParticles(r.x + r.w / 2, r.y + 86, 'steam', 1);
      } else if (st.status === 'burnt' || isStationWarning(st)) {
        spawnParticles(r.x + r.w / 2, r.y + 82, 'smoke', 2);
      }
    }
    for (let i = 0; i < state.kitchen.plates.length; i++) {
      const p = state.kitchen.plates[i];
      if (p.analysis.status === 'ready' && p.analysis.recipe.id !== 'es_teh') {
        const pr = LAYOUT.plates[i];
        spawnParticles(pr.x + 86, pr.y + 52, 'steam', 1);
      }
    }
  }

  // Update antrean pesanan
  const orderResult = updateOrders(state.orders, dt, state.elapsed);
  for (const exp of orderResult.expired) {
    const r = LAYOUT.orders[exp.slot];
    state.reputation = Math.max(0, state.reputation - 1);
    state.combo = 0;
    state.missed += 1;
    sound.play('leave');
    addPopup(r.x + r.w / 2, r.y + 70, 'Pelanggan pergi! -1★', PALETTE.chili);
    spawnParticles(r.x + r.w / 2, r.y + 70, 'smoke', 7);
  }

  // Update partikel
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) state.particles.splice(i, 1);
  }

  // Update piring meluncur
  for (let i = state.flyingDishes.length - 1; i >= 0; i--) {
    const f = state.flyingDishes[i];
    f.t += dt / f.duration;
    if (f.t >= 1) state.flyingDishes.splice(i, 1);
  }

  // Update popup skor
  for (let i = state.popups.length - 1; i >= 0; i--) {
    const pop = state.popups[i];
    pop.y -= 26 * dt;
    pop.life -= dt;
    if (pop.life <= 0) state.popups.splice(i, 1);
  }

  if (state.toast) {
    state.toast.life -= dt;
    if (state.toast.life <= 0) state.toast = null;
  }

  // Cek kondisi selesai shift / game over
  if (state.reputation <= 0) {
    state.mode = 'ended';
    state.endReason = 'reputation_empty';
    sound.play('gameover');
  } else if (state.remaining <= 0) {
    state.mode = 'ended';
    state.endReason = 'shift_complete';
    sound.play('win');
  }
}

let lastTs = performance.now();
function loop(ts) {
  const dt = Math.min(0.05, Math.max(0, (ts - lastTs) / 1000));
  lastTs = ts;
  if (!isStaged) {
    update(dt);
  }
  renderGame(ctx, state);
  requestAnimationFrame(loop);
}

// Render instan pertama + mulai animasi
renderGame(ctx, state);
if (!isStaged) {
  requestAnimationFrame(loop);
}
