// Antrean pesanan pelanggan, pembangkit deterministik (seed), dan ritme kesabaran.

import { MAX_ORDERS, PHASE_INTERVAL, PHASES } from './config.js';
import { RECIPES, RECIPE_MAP } from './recipes.js';

export const CUSTOMER_PROFILES = [
  { name: 'Pak Budi', skin: '#c88c60', hair: '#2c231e', shirt: '#3f7d45', hat: 'peci' },
  { name: 'Mbak Rina', skin: '#dca47b', hair: '#2a1d17', shirt: '#c84b31', hat: 'hijab', hatColor: '#e6a324' },
  { name: 'Mas Doni', skin: '#be8055', hair: '#241c17', shirt: '#3b6a7c', hat: 'cap', hatColor: '#c84b31' },
  { name: 'Bu Wati', skin: '#d59a70', hair: '#3a2c24', shirt: '#9c4b39', hat: 'bun' },
  { name: 'Kang Asep', skin: '#b97b50', hair: '#231b16', shirt: '#b87b22', hat: 'bandana', hatColor: '#3f7d45' },
  { name: 'Teh Sari', skin: '#e0ab82', hair: '#2b2019', shirt: '#5a7f46', hat: 'hijab', hatColor: '#c84b31' },
  { name: 'Bang Jaka', skin: '#ae7248', hair: '#1f1814', shirt: '#7a4d26', hat: 'none' },
  { name: 'Dek Maya', skin: '#d89d74', hair: '#2a1e18', shirt: '#d48917', hat: 'ponytail' },
];

export function createRng(seed = 1337) {
  let a = (seed >>> 0) || 1337;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getPhase(elapsed) {
  const idx = Math.min(PHASES.length - 1, Math.floor(Math.max(0, elapsed) / PHASE_INTERVAL));
  return PHASES[idx];
}

export function createOrdersState(seed = 42) {
  return {
    rng: createRng(seed),
    nextId: 1,
    slots: new Array(MAX_ORDERS).fill(null),
    spawnTimer: 0.6,
    lastRecipeId: null,
  };
}

export function countActiveOrders(ordersState) {
  let n = 0;
  for (const s of ordersState.slots) {
    if (s) n++;
  }
  return n;
}

export function pickRecipe(ordersState) {
  const activeCounts = {};
  for (const slot of ordersState.slots) {
    if (slot) activeCounts[slot.recipeId] = (activeCounts[slot.recipeId] || 0) + 1;
  }

  // Beri bobot sedikit lebih rendah untuk resep yang sudah muncul 2x agar variatif
  const weights = RECIPES.map((r) => {
    let w = r.id === 'es_teh' ? 0.85 : 1.0;
    if ((activeCounts[r.id] || 0) >= 2) w *= 0.25;
    if (ordersState.lastRecipeId === r.id) w *= 0.55;
    return w;
  });

  const total = weights.reduce((a, b) => a + b, 0);
  let roll = ordersState.rng() * total;
  for (let i = 0; i < RECIPES.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return RECIPES[i];
  }
  return RECIPES[0];
}

export function spawnOrder(ordersState, elapsed, opts = {}) {
  const slotIndex =
    typeof opts.slot === 'number'
      ? opts.slot
      : ordersState.slots.findIndex((s) => s === null);
  if (slotIndex < 0 || slotIndex >= MAX_ORDERS) return null;

  const phase = getPhase(elapsed);
  const recipe = opts.recipeId ? RECIPE_MAP[opts.recipeId] : pickRecipe(ordersState);
  const profileIndex =
    typeof opts.profileIndex === 'number'
      ? opts.profileIndex % CUSTOMER_PROFILES.length
      : Math.floor(ordersState.rng() * CUSTOMER_PROFILES.length);
  const profile = CUSTOMER_PROFILES[profileIndex];

  const maxPatience = Math.round(recipe.patience * phase.patienceScale * 10) / 10;
  const patience =
    typeof opts.patienceRatio === 'number'
      ? maxPatience * opts.patienceRatio
      : maxPatience;

  const order = {
    id: ordersState.nextId++,
    slot: slotIndex,
    recipeId: recipe.id,
    recipe,
    profile,
    maxPatience,
    patience,
    enterAnim: opts.instant ? 0 : 1,
    urgentPulse: 0,
  };

  ordersState.slots[slotIndex] = order;
  ordersState.lastRecipeId = recipe.id;
  return order;
}

export function updateOrders(ordersState, dt, elapsed) {
  const phase = getPhase(elapsed);
  const expired = [];
  const spawned = [];

  for (let i = 0; i < ordersState.slots.length; i++) {
    const order = ordersState.slots[i];
    if (!order) continue;
    order.patience -= dt;
    if (order.enterAnim > 0) {
      order.enterAnim = Math.max(0, order.enterAnim - dt * 4.5);
    }
    if (order.patience / order.maxPatience < 0.3) {
      order.urgentPulse += dt * 7;
    }
    if (order.patience <= 0) {
      ordersState.slots[i] = null;
      expired.push({ slot: i, order });
    }
  }

  const active = countActiveOrders(ordersState);
  if (active < phase.maxActive) {
    ordersState.spawnTimer -= dt;
    // Jangan biarkan papan kosong terlalu lama
    if (active === 0 && ordersState.spawnTimer > 1.1) {
      ordersState.spawnTimer = 1.1;
    }
    if (ordersState.spawnTimer <= 0) {
      const created = spawnOrder(ordersState, elapsed);
      if (created) spawned.push(created);
      const jitter = 0.85 + ordersState.rng() * 0.3;
      ordersState.spawnTimer = phase.spawnInterval * jitter;
    }
  } else {
    ordersState.spawnTimer = Math.min(ordersState.spawnTimer, 1.4);
  }

  return { expired, spawned, phase };
}

export function findUrgentMatchingOrder(ordersState, recipeId) {
  let best = null;
  let bestRatio = Infinity;
  for (let i = 0; i < ordersState.slots.length; i++) {
    const order = ordersState.slots[i];
    if (!order || order.recipeId !== recipeId) continue;
    const ratio = order.patience / order.maxPatience;
    if (ratio < bestRatio) {
      bestRatio = ratio;
      best = order;
    }
  }
  return best;
}

export function removeOrderAt(ordersState, slotIndex) {
  const order = ordersState.slots[slotIndex];
  ordersState.slots[slotIndex] = null;
  return order;
}
