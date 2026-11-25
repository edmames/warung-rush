// Mode staging screenshot deterministik melalui query ?shot= dan ?seed=.

import { SHIFT_DURATION } from './config.js';
import { setPlateItems } from './kitchen.js';
import { createOrdersState, spawnOrder } from './orders.js';

export function readShotParams() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const seedRaw = params.get('seed');
  const seed = seedRaw !== null && !Number.isNaN(Number(seedRaw)) ? Number(seedRaw) : 42;
  return { shot, seed };
}

/**
 * Mengatur state permainan secara deterministik untuk tangkapan layar juri.
 * Mengembalikan true jika berjalan dalam mode staging statis/terkendali.
 */
export function applyShotStaging(state, shot, seed) {
  if (!shot) return false;

  state.seed = seed;
  state.shotMode = shot;
  state.time = 12.4;

  if (shot === 'start') {
    state.mode = 'start';
    state.elapsed = 0;
    state.remaining = SHIFT_DURATION;
    state.score = 0;
    state.coins = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.served = 0;
    state.reputation = 5;
    state.orders = createOrdersState(seed);
    state.kitchen.selectedStation = 'wajan';
    state.kitchen.hand = null;
    setPlateItems(state.kitchen, 0, []);
    setPlateItems(state.kitchen, 1, []);
    return true;
  }

  if (shot === 'play') {
    // Tengah Rush Hour: papan pesanan penuh (4 slot), 1 hidangan setengah dirakit,
    // timer jelas, 1 piring siap saji, wajan & panggangan aktif.
    state.mode = 'playing';
    state.elapsed = 138; // sisa 00:42 -> puncak RUSH HOUR!
    state.remaining = SHIFT_DURATION - state.elapsed;
    state.score = 1680;
    state.coins = 156;
    state.combo = 3;
    state.bestCombo = 4;
    state.served = 6;
    state.reputation = 4;
    state.orders = createOrdersState(seed);

    spawnOrder(state.orders, state.elapsed, {
      slot: 0,
      recipeId: 'sate_ayam',
      profileIndex: 0,
      patienceRatio: 0.24,
      instant: true,
    });
    spawnOrder(state.orders, state.elapsed, {
      slot: 1,
      recipeId: 'nasi_goreng',
      profileIndex: 1,
      patienceRatio: 0.56,
      instant: true,
    });
    spawnOrder(state.orders, state.elapsed, {
      slot: 2,
      recipeId: 'mie_ayam',
      profileIndex: 2,
      patienceRatio: 0.78,
      instant: true,
    });
    spawnOrder(state.orders, state.elapsed, {
      slot: 3,
      recipeId: 'es_teh',
      profileIndex: 5,
      patienceRatio: 0.42,
      instant: true,
    });

    // Wajan sedang memasak Mie (74% selesai), Panggangan ada Sate matang!
    const wajan = state.kitchen.stations.wajan;
    wajan.status = 'cooking';
    wajan.inputId = 'mie';
    wajan.outputId = 'mie_matang';
    wajan.cookDuration = 2.6;
    wajan.elapsed = 1.92;
    wajan.burnElapsed = 0;

    const grill = state.kitchen.stations.panggangan;
    grill.status = 'ready';
    grill.inputId = 'sate';
    grill.outputId = 'sate_bakar';
    grill.cookDuration = 3.2;
    grill.elapsed = 3.2;
    grill.burnElapsed = 1.1;

    state.kitchen.stations.talenan.chopAnim = 0.25;
    state.kitchen.stations.talenan.lastCutId = 'sayur_iris';
    state.kitchen.selectedStation = 'wajan';

    // Piring 1: Nasi Goreng sedang dirakit (2/3: Nasi Goreng + Irisan Sayur, kurang Kerupuk)
    setPlateItems(state.kitchen, 0, ['nasi_matang', 'sayur_iris']);
    state.kitchen.plates[0].popAnim = 0;

    // Piring 2: Sate Ayam SIAP SAJI!
    setPlateItems(state.kitchen, 1, ['sate_bakar', 'sambal', 'kerupuk']);
    state.kitchen.plates[1].popAnim = 0;

    // Tangan juru masak memegang Kerupuk untuk menyelesaikan Nasi Goreng
    state.kitchen.hand = { kind: 'item', id: 'kerupuk' };
    state.pointer.x = 368;
    state.pointer.y = 512;

    state.particles = [
      { x: 158, y: 286, vx: 6, vy: -22, life: 0.65, maxLife: 1.0, size: 9, kind: 'steam' },
      { x: 176, y: 274, vx: -5, vy: -26, life: 0.48, maxLife: 1.0, size: 10, kind: 'steam' },
      { x: 452, y: 288, vx: 8, vy: -24, life: 0.7, maxLife: 1.0, size: 10, kind: 'steam' },
      { x: 472, y: 276, vx: -4, vy: -20, life: 0.5, maxLife: 1.0, size: 11, kind: 'steam' },
      { x: 540, y: 446, vx: 3, vy: -18, life: 0.72, maxLife: 1.0, size: 8, kind: 'steam' },
    ];
    return true;
  }

  if (shot === 'rush') {
    // Tangkapan layar aksi penyajian: piring meluncur ke pelanggan + bonus kombo!
    state.mode = 'playing';
    state.elapsed = 152; // sisa 00:28 -> Rush Hour panas
    state.remaining = SHIFT_DURATION - state.elapsed;
    state.score = 2940;
    state.coins = 264;
    state.combo = 4;
    state.bestCombo = 5;
    state.served = 11;
    state.reputation = 4;
    state.orders = createOrdersState(seed + 7);

    spawnOrder(state.orders, state.elapsed, {
      slot: 0,
      recipeId: 'mie_ayam',
      profileIndex: 3,
      patienceRatio: 0.62,
      instant: true,
    });
    spawnOrder(state.orders, state.elapsed, {
      slot: 1,
      recipeId: 'es_teh',
      profileIndex: 4,
      patienceRatio: 0.35,
      instant: true,
    });
    spawnOrder(state.orders, state.elapsed, {
      slot: 2,
      recipeId: 'nasi_goreng',
      profileIndex: 6,
      patienceRatio: 0.82,
      instant: true,
    });
    spawnOrder(state.orders, state.elapsed, {
      slot: 3,
      recipeId: 'sate_ayam',
      profileIndex: 7,
      patienceRatio: 0.22,
      instant: true,
    });

    const wajan = state.kitchen.stations.wajan;
    wajan.status = 'ready';
    wajan.inputId = 'nasi';
    wajan.outputId = 'nasi_matang';
    wajan.cookDuration = 2.8;
    wajan.elapsed = 2.8;
    wajan.burnElapsed = 3.6; // Hampir gosong (peringatan kuning-merah!)

    const grill = state.kitchen.stations.panggangan;
    grill.status = 'cooking';
    grill.inputId = 'sate';
    grill.outputId = 'sate_bakar';
    grill.cookDuration = 3.2;
    grill.elapsed = 2.1;

    state.kitchen.stations.minuman.pourAnim = 0.65;
    state.kitchen.selectedStation = 'minuman';

    setPlateItems(state.kitchen, 0, ['mie_matang', 'ayam_iris', 'sayur_iris']);
    state.kitchen.plates[0].popAnim = 0;
    setPlateItems(state.kitchen, 1, ['teh_manis', 'es']);
    state.kitchen.plates[1].popAnim = 0;
    state.kitchen.hand = null;

    // Piring Nasi Goreng sedang meluncur menuju papan pesanan
    state.flyingDishes = [
      {
        recipeId: 'nasi_goreng',
        fromX: 460,
        fromY: 468,
        toX: 796,
        toY: 165,
        t: 0.18,
        duration: 0.36,
      },
    ];
    state.popups = [
      { x: 484, y: 218, text: '+36 koin  KOMBO x4!', color: '#f6c853', life: 0.85, maxLife: 1.2 },
    ];
    return true;
  }

  if (shot === 'end') {
    state.mode = 'ended';
    state.endReason = 'shift_complete';
    state.elapsed = SHIFT_DURATION;
    state.remaining = 0;
    state.score = 4280;
    state.coins = 384;
    state.combo = 5;
    state.bestCombo = 6;
    state.served = 15;
    state.missed = 1;
    state.reputation = 4;
    state.orders = createOrdersState(seed);
    setPlateItems(state.kitchen, 0, ['nasi_matang', 'sayur_iris', 'kerupuk']);
    setPlateItems(state.kitchen, 1, ['teh_manis', 'es']);
    return true;
  }

  return false;
}
