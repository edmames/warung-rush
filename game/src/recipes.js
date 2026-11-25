// Daftar bahan baku, bahan olahan, dan 4 resep khas Warung Bu Sari.

export const COUNTER_ITEMS = [
  'nasi',
  'mie',
  'sate',
  'ayam',
  'sayur',
  'kerupuk',
  'sambal',
  'es',
];

export const INGREDIENTS = {
  // Bahan mentah / langsung di meja counter
  nasi: {
    id: 'nasi',
    label: 'Nasi',
    short: 'Nasi',
    raw: true,
    station: 'wajan',
    output: 'nasi_matang',
    hint: 'Masak di Wajan',
  },
  mie: {
    id: 'mie',
    label: 'Mie',
    short: 'Mie',
    raw: true,
    station: 'wajan',
    output: 'mie_matang',
    hint: 'Masak di Wajan',
  },
  sate: {
    id: 'sate',
    label: 'Sate',
    short: 'Sate',
    raw: true,
    station: 'panggangan',
    output: 'sate_bakar',
    hint: 'Bakar di Panggangan',
  },
  ayam: {
    id: 'ayam',
    label: 'Ayam',
    short: 'Ayam',
    raw: true,
    station: 'talenan',
    output: 'ayam_iris',
    hint: 'Potong di Talenan',
  },
  sayur: {
    id: 'sayur',
    label: 'Sayur',
    short: 'Sayur',
    raw: true,
    station: 'talenan',
    output: 'sayur_iris',
    hint: 'Potong di Talenan',
  },
  kerupuk: {
    id: 'kerupuk',
    label: 'Kerupuk',
    short: 'Kerupuk',
    raw: false,
    station: null,
    output: null,
    hint: 'Langsung ke Piring',
  },
  sambal: {
    id: 'sambal',
    label: 'Sambal',
    short: 'Sambal',
    raw: false,
    station: null,
    output: null,
    hint: 'Langsung ke Piring',
  },
  es: {
    id: 'es',
    label: 'Es Batu',
    short: 'Es',
    raw: false,
    station: null,
    output: null,
    hint: 'Langsung ke Gelas',
  },

  // Bahan hasil olahan stasiun
  nasi_matang: {
    id: 'nasi_matang',
    label: 'Nasi Goreng',
    short: 'Nasi Grg',
    raw: false,
    from: 'nasi',
    station: 'wajan',
  },
  mie_matang: {
    id: 'mie_matang',
    label: 'Mie Matang',
    short: 'Mie Mtg',
    raw: false,
    from: 'mie',
    station: 'wajan',
  },
  sate_bakar: {
    id: 'sate_bakar',
    label: 'Sate Bakar',
    short: 'Sate Bkr',
    raw: false,
    from: 'sate',
    station: 'panggangan',
  },
  ayam_iris: {
    id: 'ayam_iris',
    label: 'Irisan Ayam',
    short: 'Ayam Iris',
    raw: false,
    from: 'ayam',
    station: 'talenan',
  },
  sayur_iris: {
    id: 'sayur_iris',
    label: 'Irisan Sayur',
    short: 'Sayur Iris',
    raw: false,
    from: 'sayur',
    station: 'talenan',
  },
  teh_manis: {
    id: 'teh_manis',
    label: 'Teh Manis',
    short: 'Teh',
    raw: false,
    from: null,
    station: 'minuman',
  },

  // Hasil gosong
  gosong: {
    id: 'gosong',
    label: 'Gosong!',
    short: 'Gosong',
    raw: false,
    burnt: true,
    station: null,
  },
};

export const RECIPES = [
  {
    id: 'nasi_goreng',
    name: 'Nasi Goreng',
    short: 'Nasgor',
    ingredients: ['nasi_matang', 'sayur_iris', 'kerupuk'],
    coins: 24,
    score: 260,
    patience: 36,
    accent: '#d97b29',
  },
  {
    id: 'mie_ayam',
    name: 'Mie Ayam',
    short: 'Mie Ayam',
    ingredients: ['mie_matang', 'ayam_iris', 'sayur_iris', 'sambal'],
    coins: 32,
    score: 340,
    patience: 42,
    accent: '#e0a526',
  },
  {
    id: 'sate_ayam',
    name: 'Sate Ayam',
    short: 'Sate',
    ingredients: ['sate_bakar', 'sambal', 'kerupuk'],
    coins: 28,
    score: 300,
    patience: 38,
    accent: '#b84a2a',
  },
  {
    id: 'es_teh',
    name: 'Es Teh',
    short: 'Es Teh',
    ingredients: ['teh_manis', 'es'],
    coins: 12,
    score: 150,
    patience: 26,
    accent: '#4a8c57',
  },
];

export const RECIPE_MAP = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

export function isPreparedItem(itemId) {
  const ing = INGREDIENTS[itemId];
  return Boolean(ing && !ing.raw && !ing.burnt);
}

/**
 * Menganalisis isi piring: kosong, sedang dirakit, siap saji, atau salah rakit.
 */
export function analyzePlate(items) {
  if (!items || items.length === 0) {
    return { status: 'empty', recipe: null, candidates: [], missing: [] };
  }

  for (const recipe of RECIPES) {
    if (
      recipe.ingredients.length === items.length &&
      recipe.ingredients.every((req) => items.includes(req))
    ) {
      return { status: 'ready', recipe, candidates: [recipe], missing: [] };
    }
  }

  const candidates = RECIPES.filter((recipe) =>
    items.every((it) => recipe.ingredients.includes(it))
  );

  if (candidates.length > 0) {
    // Pilih kandidat utama (yang paling dekat selesai)
    candidates.sort(
      (a, b) =>
        (a.ingredients.length - items.length) -
        (b.ingredients.length - items.length)
    );
    const primary = candidates[0];
    const missing = primary.ingredients.filter((req) => !items.includes(req));
    return { status: 'building', recipe: primary, candidates, missing };
  }

  return { status: 'invalid', recipe: null, candidates: [], missing: [] };
}

export function canAcceptOnStation(stationId, itemId) {
  const ing = INGREDIENTS[itemId];
  if (!ing) return false;
  if (stationId === 'minuman' && itemId === 'es') return true;
  return ing.raw && ing.station === stationId;
}
