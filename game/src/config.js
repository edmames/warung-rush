// Angka tuning, palet warna warung hangat, dan tata letak kanvas 1280x720.

export const WIDTH = 1280;
export const HEIGHT = 720;

export const SHIFT_DURATION = 180; // 3 menit penuh
export const PHASE_INTERVAL = 45;  // Tiap 45 detik tekanan naik
export const MAX_REPUTATION = 5;
export const MAX_ORDERS = 4;

export const PHASES = [
  {
    index: 0,
    name: 'Pagi Santai',
    spawnInterval: 6.8,
    maxActive: 3,
    patienceScale: 1.0,
    tipBonus: 1.0,
    isRush: false,
  },
  {
    index: 1,
    name: 'Mulai Ramai',
    spawnInterval: 5.2,
    maxActive: 4,
    patienceScale: 0.88,
    tipBonus: 1.1,
    isRush: false,
  },
  {
    index: 2,
    name: 'Makan Siang',
    spawnInterval: 4.1,
    maxActive: 4,
    patienceScale: 0.76,
    tipBonus: 1.25,
    isRush: false,
  },
  {
    index: 3,
    name: 'RUSH HOUR!',
    spawnInterval: 3.0,
    maxActive: 4,
    patienceScale: 0.65,
    tipBonus: 1.5,
    isRush: true,
  },
];

export const COOK_TIMES = {
  nasi: 2.8,
  mie: 2.6,
  sate: 3.2,
};

export const BURN_WARNING_AT = 3.0; // detik setelah matang mulai berasap gelap
export const BURN_TIME = 5.8;       // detik setelah matang jadi gosong

export const COMBO_MAX_MULTIPLIER = 5;
export const SPEED_BONUS_THRESHOLD = 0.5; // >50% sabar tersisa dapat bonus cepat

export const PALETTE = {
  // Tenda & aksen terakota
  terracotta: '#c84b31',
  terracottaDark: '#99341e',
  terracottaLight: '#e0694c',

  // Krem hangat & dinding warung
  cream: '#f7efe1',
  creamWarm: '#eedec3',
  creamDeep: '#dfc7a1',
  wallTile: '#f2e5ce',
  wallTileAlt: '#ead8bb',

  // Kayu jati & bambu
  woodLight: '#d3a974',
  woodMid: '#b07b46',
  woodDark: '#7a4d26',
  woodDeep: '#4a2c14',
  woodEdge: '#321c0c',

  // Hijau daun pisang
  leaf: '#3f7d45',
  leafBright: '#5aa154',
  leafDark: '#2a5730',
  leafSoft: '#dcead4',

  // Kuning kunyit & emas
  turmeric: '#e6a324',
  turmericBright: '#f6c853',
  turmericDark: '#b87a10',

  // Merah cabai & api bara
  chili: '#cf3827',
  chiliDark: '#962216',
  ember: '#ef6b2d',
  flame: '#f8b93c',

  // Besi cor & tinta outline
  iron: '#2d241f',
  ironMid: '#463a33',
  ironLight: '#69594f',
  ink: '#2a1d15',
  inkSoft: '#5c4637',

  // Enamel piring warung
  enamel: '#fbf8f1',
  enamelRim: '#3a7a67',
  enamelShadow: '#d8cfc0',
};

export const STATION_ORDER = ['wajan', 'panggangan', 'talenan', 'minuman'];

export const LAYOUT = {
  hudHeight: 62,
  muteBtn: { x: 1226, y: 11, w: 38, h: 38 },

  // 4 slot kartu pesanan di bagian atas
  orders: [
    { x: 24, y: 72, w: 296, h: 138 },
    { x: 336, y: 72, w: 296, h: 138 },
    { x: 648, y: 72, w: 296, h: 138 },
    { x: 960, y: 72, w: 296, h: 138 },
  ],

  // 4 stasiun masak + tempat sampah di meja tengah
  stations: {
    wajan: { x: 26, y: 224, w: 274, h: 178 },
    panggangan: { x: 316, y: 224, w: 274, h: 178 },
    talenan: { x: 606, y: 224, w: 264, h: 178 },
    minuman: { x: 886, y: 224, w: 240, h: 178 },
  },
  trash: { x: 1142, y: 238, w: 112, h: 164 },

  // 2 piring rakit + panel tangan/resep cepat
  plates: [
    { x: 26, y: 416, w: 412, h: 142 },
    { x: 454, y: 416, w: 412, h: 142 },
  ],
  handPanel: { x: 882, y: 416, w: 372, h: 142 },

  // 8 kotak bahan di meja counter bawah
  counterY: 572,
  counterH: 132,
  counterBinW: 142,
  counterGap: 12,
  counterStartX: 30,

  // Tombol layar mulai & layar hasil
  startBtn: { x: 490, y: 500, w: 300, h: 66 },
  replayBtn: { x: 490, y: 540, w: 300, h: 64 },
};

export function getCounterBinRect(index) {
  return {
    x: LAYOUT.counterStartX + index * (LAYOUT.counterBinW + LAYOUT.counterGap),
    y: LAYOUT.counterY,
    w: LAYOUT.counterBinW,
    h: LAYOUT.counterH,
  };
}
