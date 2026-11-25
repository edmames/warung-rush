// Logika dapur: 4 stasiun masak, status matang/gosong, 2 piring rakit, dan tangan juru masak.

import { BURN_TIME, BURN_WARNING_AT, COOK_TIMES } from './config.js';
import {
  INGREDIENTS,
  RECIPE_MAP,
  analyzePlate,
  canAcceptOnStation,
  isPreparedItem,
} from './recipes.js';

export function createPlate(items = []) {
  const list = [...items];
  return {
    items: list,
    analysis: analyzePlate(list),
    popAnim: 0,
  };
}

export function createKitchenState() {
  return {
    selectedStation: 'wajan',
    hand: null, // null | { kind: 'item', id } | { kind: 'dish', recipeId, items } | { kind: 'junk', items }
    stations: {
      wajan: {
        id: 'wajan',
        key: '1',
        name: 'Wajan',
        status: 'idle', // idle | cooking | ready | burnt
        inputId: null,
        outputId: null,
        elapsed: 0,
        cookDuration: 2.8,
        burnElapsed: 0,
        pulse: 0,
      },
      panggangan: {
        id: 'panggangan',
        key: '2',
        name: 'Panggangan',
        status: 'idle',
        inputId: null,
        outputId: null,
        elapsed: 0,
        cookDuration: 3.2,
        burnElapsed: 0,
        pulse: 0,
      },
      talenan: {
        id: 'talenan',
        key: '3',
        name: 'Talenan',
        chopAnim: 0,
        lastCutId: null,
        pulse: 0,
      },
      minuman: {
        id: 'minuman',
        key: '4',
        name: 'Rak Minuman',
        pourAnim: 0,
        pulse: 0,
      },
    },
    plates: [createPlate(), createPlate()],
    trashAnim: 0,
  };
}

export function setPlateItems(kitchen, plateIndex, items) {
  const p = kitchen.plates[plateIndex];
  p.items = [...items];
  p.analysis = analyzePlate(p.items);
  p.popAnim = 1;
}

export function updateKitchen(kitchen, dt) {
  const events = [];

  for (const id of ['wajan', 'panggangan']) {
    const st = kitchen.stations[id];
    if (st.pulse > 0) st.pulse = Math.max(0, st.pulse - dt * 2.5);

    if (st.status === 'cooking') {
      st.elapsed += dt;
      if (st.elapsed >= st.cookDuration) {
        st.status = 'ready';
        st.burnElapsed = 0;
        events.push({ type: 'cooked', stationId: id, outputId: st.outputId });
      }
    } else if (st.status === 'ready') {
      st.burnElapsed += dt;
      if (st.burnElapsed >= BURN_TIME) {
        st.status = 'burnt';
        st.outputId = 'gosong';
        events.push({ type: 'burnt', stationId: id });
      }
    }
  }

  const talenan = kitchen.stations.talenan;
  if (talenan.chopAnim > 0) talenan.chopAnim = Math.max(0, talenan.chopAnim - dt * 3.8);
  if (talenan.pulse > 0) talenan.pulse = Math.max(0, talenan.pulse - dt * 2.5);

  const minuman = kitchen.stations.minuman;
  if (minuman.pourAnim > 0) minuman.pourAnim = Math.max(0, minuman.pourAnim - dt * 3.2);
  if (minuman.pulse > 0) minuman.pulse = Math.max(0, minuman.pulse - dt * 2.5);

  for (const plate of kitchen.plates) {
    if (plate.popAnim > 0) plate.popAnim = Math.max(0, plate.popAnim - dt * 4.5);
  }
  if (kitchen.trashAnim > 0) kitchen.trashAnim = Math.max(0, kitchen.trashAnim - dt * 4.0);

  return events;
}

export function isStationWarning(station) {
  return station.status === 'ready' && station.burnElapsed >= BURN_WARNING_AT;
}

export function pickCounterItem(kitchen, itemId) {
  const ing = INGREDIENTS[itemId];
  if (!ing) return { ok: false };

  // Klik kotak bahan yang sama untuk menaruh kembali bahan mentah
  if (kitchen.hand && kitchen.hand.kind === 'item' && kitchen.hand.id === itemId) {
    kitchen.hand = null;
    return { ok: true, sound: 'click', toast: null };
  }

  if (kitchen.hand !== null) {
    // Ganti langsung jika sedang pegang bahan counter lain agar main terasa luwes
    if (kitchen.hand.kind === 'item' && (INGREDIENTS[kitchen.hand.id]?.raw || !INGREDIENTS[kitchen.hand.id]?.station)) {
      kitchen.hand = { kind: 'item', id: itemId };
      return { ok: true, sound: 'pickup', picked: itemId };
    }
    return {
      ok: false,
      sound: 'error',
      toast: 'Tangan penuh! Taruh di piring atau buang dulu.',
    };
  }

  kitchen.hand = { kind: 'item', id: itemId };
  return { ok: true, sound: 'pickup', picked: itemId };
}

export function interactStation(kitchen, stationId) {
  kitchen.selectedStation = stationId;
  const st = kitchen.stations[stationId];

  // Stasiun berdurasi: Wajan & Panggangan
  if (stationId === 'wajan' || stationId === 'panggangan') {
    if (st.status === 'idle') {
      if (!kitchen.hand || kitchen.hand.kind !== 'item') {
        return { ok: false, sound: 'click', toast: stationId === 'wajan' ? 'Ambil Nasi atau Mie dulu' : 'Ambil Sate dulu' };
      }
      if (!canAcceptOnStation(stationId, kitchen.hand.id)) {
        const ing = INGREDIENTS[kitchen.hand.id];
        if (ing?.station && kitchen.stations[ing.station]) {
          kitchen.stations[ing.station].pulse = 1;
        }
        return {
          ok: false,
          sound: 'error',
          toast: ing?.hint || 'Bahan ini bukan untuk stasiun ini!',
        };
      }
      const inputId = kitchen.hand.id;
      const ing = INGREDIENTS[inputId];
      st.status = 'cooking';
      st.inputId = inputId;
      st.outputId = ing.output;
      st.elapsed = 0;
      st.cookDuration = COOK_TIMES[inputId] || 2.8;
      st.burnElapsed = 0;
      kitchen.hand = null;
      return {
        ok: true,
        sound: stationId === 'wajan' ? 'sizzle' : 'grill',
        effect: stationId === 'wajan' ? 'sizzle' : 'ember',
        stationId,
      };
    }

    if (st.status === 'cooking') {
      return { ok: false, sound: 'click', toast: 'Sedang dimasak...' };
    }

    if (st.status === 'ready' || st.status === 'burnt') {
      if (kitchen.hand !== null) {
        return { ok: false, sound: 'error', toast: 'Kosongkan tangan untuk mengambil!' };
      }
      const grabbed = st.outputId;
      const wasBurnt = st.status === 'burnt';
      st.status = 'idle';
      st.inputId = null;
      st.outputId = null;
      st.elapsed = 0;
      st.burnElapsed = 0;
      kitchen.hand = { kind: 'item', id: grabbed };
      return {
        ok: true,
        sound: wasBurnt ? 'error' : 'pickup',
        toast: wasBurnt ? 'Gosong! Buang ke Tempat Sampah' : null,
        grabbed,
      };
    }
  }

  // Stasiun potong instan: Talenan
  if (stationId === 'talenan') {
    if (!kitchen.hand || kitchen.hand.kind !== 'item') {
      return { ok: false, sound: 'click', toast: 'Bawa Ayam atau Sayur untuk dipotong' };
    }
    if (!canAcceptOnStation('talenan', kitchen.hand.id)) {
      const ing = INGREDIENTS[kitchen.hand.id];
      if (ing?.station && kitchen.stations[ing.station]) {
        kitchen.stations[ing.station].pulse = 1;
      }
      return {
        ok: false,
        sound: 'error',
        toast: ing?.hint || 'Tidak perlu dipotong!',
      };
    }
    const ing = INGREDIENTS[kitchen.hand.id];
    st.chopAnim = 1;
    st.lastCutId = ing.output;
    kitchen.hand = { kind: 'item', id: ing.output };
    return {
      ok: true,
      sound: 'chop',
      effect: 'chop',
      stationId: 'talenan',
      outputId: ing.output,
    };
  }

  // Stasiun minuman instan: Rak Minuman
  if (stationId === 'minuman') {
    if (kitchen.hand === null) {
      st.pourAnim = 1;
      kitchen.hand = { kind: 'item', id: 'teh_manis' };
      return {
        ok: true,
        sound: 'pour',
        effect: 'pour',
        stationId: 'minuman',
        outputId: 'teh_manis',
      };
    }
    // Bawa Es Batu langsung ke Rak Minuman -> jadi Es Teh siap saji!
    if (kitchen.hand.kind === 'item' && kitchen.hand.id === 'es') {
      st.pourAnim = 1;
      kitchen.hand = {
        kind: 'dish',
        recipeId: 'es_teh',
        items: ['teh_manis', 'es'],
      };
      return {
        ok: true,
        sound: 'ready',
        effect: 'pour',
        stationId: 'minuman',
        toast: 'Es Teh siap saji!',
      };
    }
    return { ok: false, sound: 'error', toast: 'Kosongkan tangan atau bawa Es Batu!' };
  }

  return { ok: false };
}

export function interactPlate(kitchen, plateIndex) {
  const plate = kitchen.plates[plateIndex];
  if (!plate) return { ok: false };

  // Jika tangan kosong: angkat hidangan siap saji atau rakitan salah untuk dibuang
  if (kitchen.hand === null) {
    if (plate.analysis.status === 'ready') {
      kitchen.hand = {
        kind: 'dish',
        recipeId: plate.analysis.recipe.id,
        items: [...plate.items],
      };
      setPlateItems(kitchen, plateIndex, []);
      return { ok: true, sound: 'plate', pickedDish: kitchen.hand.recipeId };
    }
    if (plate.analysis.status === 'invalid') {
      kitchen.hand = { kind: 'junk', items: [...plate.items] };
      setPlateItems(kitchen, plateIndex, []);
      return { ok: true, sound: 'click', toast: 'Buang ke Tempat Sampah' };
    }
    if (plate.analysis.status === 'building') {
      return {
        ok: false,
        sound: 'click',
        toast: `Kurang: ${plate.analysis.missing.map((m) => INGREDIENTS[m].short).join(', ')}`,
      };
    }
    return { ok: false, sound: 'click', toast: 'Piring kosong — taruh bahan olahan' };
  }

  // Menaruh kembali hidangan jadi ke piring kosong
  if (kitchen.hand.kind === 'dish') {
    if (plate.items.length === 0) {
      setPlateItems(kitchen, plateIndex, kitchen.hand.items);
      kitchen.hand = null;
      return { ok: true, sound: 'plate' };
    }
    return { ok: false, sound: 'error', toast: 'Piring sudah terisi!' };
  }

  if (kitchen.hand.kind === 'junk') {
    return { ok: false, sound: 'error', toast: 'Buang ke Tempat Sampah!' };
  }

  // Memegang bahan item
  const itemId = kitchen.hand.id;
  const ing = INGREDIENTS[itemId];

  if (ing?.burnt) {
    return { ok: false, sound: 'error', toast: 'Masakan gosong — buang ke sampah!' };
  }
  if (!isPreparedItem(itemId)) {
    if (ing?.station && kitchen.stations[ing.station]) {
      kitchen.stations[ing.station].pulse = 1;
    }
    return {
      ok: false,
      sound: 'error',
      toast: ing?.hint || 'Olah bahan di stasiun dulu!',
    };
  }
  if (plate.analysis.status === 'ready') {
    return { ok: false, sound: 'error', toast: 'Piring sudah siap saji!' };
  }
  if (plate.items.includes(itemId)) {
    return { ok: false, sound: 'error', toast: `${ing.short} sudah ada di piring ini` };
  }
  if (plate.items.length >= 4) {
    return { ok: false, sound: 'error', toast: 'Piring penuh — buang jika salah rakit' };
  }

  const nextItems = [...plate.items, itemId];
  setPlateItems(kitchen, plateIndex, nextItems);
  kitchen.hand = null;

  const isNowReady = plate.analysis.status === 'ready';
  const isNowInvalid = plate.analysis.status === 'invalid';
  return {
    ok: true,
    sound: isNowReady ? 'ready' : isNowInvalid ? 'error' : 'plate',
    effect: isNowReady ? 'plate_ready' : 'plate_add',
    plateIndex,
    toast: isNowReady
      ? `${plate.analysis.recipe.name} siap saji!`
      : isNowInvalid
      ? 'Salah rakit! Klik piring lalu buang ke sampah.'
      : null,
  };
}

export function interactTrash(kitchen) {
  if (kitchen.hand !== null) {
    kitchen.hand = null;
    kitchen.trashAnim = 1;
    return { ok: true, sound: 'trash', toast: 'Dibuang ke sampah' };
  }
  // Jika tangan kosong tapi ada piring salah rakit, bersihkan langsung biar praktis!
  for (let i = 0; i < kitchen.plates.length; i++) {
    if (kitchen.plates[i].analysis.status === 'invalid') {
      setPlateItems(kitchen, i, []);
      kitchen.trashAnim = 1;
      return { ok: true, sound: 'trash', toast: 'Piring salah rakit dibuang' };
    }
  }
  return { ok: false, sound: 'click', toast: 'Tempat sampah' };
}

/**
 * Mencari piring terbaik saat pemain menekan Spasi untuk menaruh cepat.
 */
export function findBestPlateForItem(kitchen, itemId) {
  // Prioritas 1: piring yang sedang dirakit dan butuh item ini
  for (let i = 0; i < kitchen.plates.length; i++) {
    const p = kitchen.plates[i];
    if (
      p.analysis.status === 'building' &&
      !p.items.includes(itemId) &&
      p.analysis.candidates.some((r) => r.ingredients.includes(itemId))
    ) {
      return i;
    }
  }
  // Prioritas 2: piring kosong
  for (let i = 0; i < kitchen.plates.length; i++) {
    if (kitchen.plates[i].items.length === 0) return i;
  }
  return -1;
}

export function findReadyPlateForRecipe(kitchen, recipeId) {
  for (let i = 0; i < kitchen.plates.length; i++) {
    const p = kitchen.plates[i];
    if (p.analysis.status === 'ready' && p.analysis.recipe.id === recipeId) {
      return i;
    }
  }
  return -1;
}

export function getDishName(recipeId) {
  return RECIPE_MAP[recipeId]?.name || recipeId;
}
