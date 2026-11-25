// Semua gambar kanvas prosedural untuk Warung Rush — Warung Bu Sari.
// Tanpa file gambar eksternal, tanpa gradien ungu-biru, tanpa glow neon.

import {
  BURN_TIME,
  HEIGHT,
  LAYOUT,
  MAX_REPUTATION,
  PALETTE,
  STATION_ORDER,
  WIDTH,
  getCounterBinRect,
} from './config.js';
import { isStationWarning } from './kitchen.js';
import { getPhase } from './orders.js';
import { COUNTER_ITEMS, INGREDIENTS, RECIPES, RECIPE_MAP } from './recipes.js';

const FONT_UI = '"Trebuchet MS", "Segoe UI", system-ui, sans-serif';

function roundRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function fillStrokeRoundRect(ctx, x, y, w, h, r, fill, stroke, lineWidth = 2) {
  roundRect(ctx, x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function formatClock(sec) {
  const s = Math.max(0, Math.ceil(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function formatNumber(n) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// =========================================================================
// IKON BAHAN & HIDANGAN PROSEDURAL
// =========================================================================

export function drawIngredientIcon(ctx, itemId, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);

  switch (itemId) {
    case 'nasi': {
      // Mangkuk nasi putih hangat
      ctx.fillStyle = '#3a7a67';
      ctx.beginPath();
      ctx.arc(0, r * 0.14, r * 0.82, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = Math.max(1.5, r * 0.08);
      ctx.stroke();

      ctx.fillStyle = '#fffdf8';
      ctx.beginPath();
      ctx.arc(0, r * 0.12, r * 0.72, Math.PI, 0);
      ctx.quadraticCurveTo(0, r * 0.25, -r * 0.72, r * 0.12);
      ctx.fill();
      ctx.stroke();

      // Tekstur butir nasi
      ctx.fillStyle = '#e5dccb';
      for (const [dx, dy] of [[-0.28, -0.15], [0.1, -0.28], [0.3, -0.05], [-0.08, -0.04]]) {
        ctx.beginPath();
        ctx.ellipse(dx * r, dy * r, r * 0.11, r * 0.06, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'nasi_matang': {
      // Gundukan nasi goreng kecap keemasan + taburan bawang & telur
      ctx.fillStyle = '#c86f28';
      ctx.beginPath();
      ctx.ellipse(0, r * 0.15, r * 0.84, r * 0.56, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = Math.max(1.5, r * 0.08);
      ctx.stroke();

      ctx.fillStyle = '#df8d3a';
      ctx.beginPath();
      ctx.ellipse(-r * 0.06, 0, r * 0.66, r * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();

      // Potongan telur orak-arik & daun bawang
      ctx.fillStyle = '#f6d25b';
      ctx.beginPath();
      ctx.arc(-r * 0.26, -r * 0.06, r * 0.16, 0, Math.PI * 2);
      ctx.arc(r * 0.22, r * 0.08, r * 0.14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3f8a42';
      for (const [dx, dy] of [[-0.05, -0.18], [0.28, -0.12], [-0.3, 0.18], [0.05, 0.2]]) {
        ctx.fillRect(dx * r, dy * r, r * 0.14, r * 0.09);
      }
      ctx.fillStyle = '#c93827';
      ctx.beginPath();
      ctx.arc(r * 0.06, -r * 0.04, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'mie': {
      // Gulungan mie kuning mentah
      ctx.fillStyle = '#f2c94c';
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = Math.max(1.5, r * 0.08);
      ctx.beginPath();
      ctx.ellipse(0, r * 0.06, r * 0.8, r * 0.58, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#c98e18';
      ctx.lineWidth = Math.max(1.4, r * 0.09);
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        const yy = i * r * 0.18;
        ctx.moveTo(-r * 0.56, yy);
        ctx.bezierCurveTo(-r * 0.2, yy - r * 0.16, r * 0.2, yy + r * 0.16, r * 0.56, yy);
        ctx.stroke();
      }
      break;
    }

    case 'mie_matang': {
      // Mie ayam mengilap hangat dalam tumpukan
      ctx.fillStyle = '#e6aa2d';
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = Math.max(1.5, r * 0.08);
      ctx.beginPath();
      ctx.ellipse(0, r * 0.1, r * 0.84, r * 0.56, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#9e5d10';
      ctx.lineWidth = Math.max(1.5, r * 0.09);
      for (let i = -2; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(0, r * 0.12 + i * r * 0.15, r * 0.52, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      }
      ctx.fillStyle = '#fff5cf';
      ctx.beginPath();
      ctx.ellipse(-r * 0.25, -r * 0.12, r * 0.18, r * 0.07, -0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'sate': {
      // 3 tusuk sate ayam mentah
      ctx.rotate(-0.55);
      for (const offset of [-0.34, 0, 0.34]) {
        const oy = offset * r;
        ctx.strokeStyle = '#c99d66';
        ctx.lineWidth = Math.max(1.6, r * 0.1);
        ctx.beginPath();
        ctx.moveTo(-r * 0.85, oy);
        ctx.lineTo(r * 0.82, oy);
        ctx.stroke();

        ctx.fillStyle = '#e7a98d';
        ctx.strokeStyle = PALETTE.ink;
        ctx.lineWidth = Math.max(1.2, r * 0.06);
        for (const px of [-0.36, 0.04, 0.44]) {
          roundRect(ctx, px * r - r * 0.16, oy - r * 0.14, r * 0.32, r * 0.28, r * 0.08);
          ctx.fill();
          ctx.stroke();
        }
      }
      break;
    }

    case 'sate_bakar': {
      // 3 tusuk sate bakar cokelat karamel dengan garis panggangan
      ctx.rotate(-0.55);
      for (const offset of [-0.34, 0, 0.34]) {
        const oy = offset * r;
        ctx.strokeStyle = '#b9874c';
        ctx.lineWidth = Math.max(1.6, r * 0.1);
        ctx.beginPath();
        ctx.moveTo(-r * 0.88, oy);
        ctx.lineTo(r * 0.82, oy);
        ctx.stroke();

        for (const px of [-0.34, 0.06, 0.44]) {
          ctx.fillStyle = '#8b3e1b';
          ctx.strokeStyle = PALETTE.ink;
          ctx.lineWidth = Math.max(1.2, r * 0.06);
          roundRect(ctx, px * r - r * 0.17, oy - r * 0.15, r * 0.34, r * 0.3, r * 0.09);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#471e0c';
          ctx.fillRect(px * r - r * 0.05, oy - r * 0.11, r * 0.1, r * 0.22);
        }
      }
      break;
    }

    case 'ayam': {
      // Potongan daging ayam utuh
      ctx.fillStyle = '#e39e7a';
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = Math.max(1.5, r * 0.08);
      ctx.beginPath();
      ctx.ellipse(-r * 0.12, 0, r * 0.56, r * 0.42, -0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Tulang paha kecil
      ctx.fillStyle = '#f8f2e4';
      ctx.beginPath();
      ctx.roundRect(r * 0.28, -r * 0.1, r * 0.42, r * 0.2, r * 0.08);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(r * 0.72, -r * 0.09, r * 0.12, 0, Math.PI * 2);
      ctx.arc(r * 0.72, r * 0.09, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'ayam_iris': {
      // Dadu ayam kecap siap tabur
      const cubes = [
        [-0.36, -0.24],
        [0.08, -0.32],
        [-0.14, 0.08],
        [0.32, 0.02],
        [-0.42, 0.22],
        [0.08, 0.3],
      ];
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = Math.max(1.2, r * 0.07);
      for (const [dx, dy] of cubes) {
        ctx.fillStyle = '#a85d2d';
        roundRect(ctx, dx * r - r * 0.18, dy * r - r * 0.14, r * 0.36, r * 0.28, r * 0.08);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#d38a4e';
        ctx.fillRect(dx * r - r * 0.1, dy * r - r * 0.08, r * 0.14, r * 0.08);
      }
      break;
    }

    case 'sayur': {
      // Ikat sawi & timun hijau segar
      ctx.fillStyle = '#3f7d45';
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = Math.max(1.5, r * 0.08);
      for (const ang of [-0.45, 0, 0.45]) {
        ctx.save();
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.18, r * 0.28, r * 0.56, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = '#dcead4';
      roundRect(ctx, -r * 0.22, r * 0.24, r * 0.44, r * 0.42, r * 0.1);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'sayur_iris': {
      // Irisan sawi hijau + acar timun segar
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = Math.max(1.2, r * 0.07);
      // Irisan timun
      for (const [dx, dy] of [[-0.32, 0.14], [0.28, 0.16], [0, -0.22]]) {
        ctx.fillStyle = '#4e964b';
        ctx.beginPath();
        ctx.arc(dx * r, dy * r, r * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#cfe7be';
        ctx.beginPath();
        ctx.arc(dx * r, dy * r, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
      }
      // Potongan daun sawi
      ctx.fillStyle = '#2f6d37';
      roundRect(ctx, -r * 0.44, -r * 0.26, r * 0.36, r * 0.2, r * 0.06);
      ctx.fill();
      ctx.stroke();
      roundRect(ctx, r * 0.08, -r * 0.04, r * 0.38, r * 0.2, r * 0.06);
      ctx.fill();
      ctx.stroke();
      break;
    }

    case 'kerupuk': {
      // Kerupuk kampung bundar bergelombang khas warung
      ctx.fillStyle = '#f8ecd4';
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = Math.max(1.5, r * 0.08);
      ctx.beginPath();
      const bumps = 10;
      for (let i = 0; i <= bumps * 2; i++) {
        const a = (i / (bumps * 2)) * Math.PI * 2;
        const rad = i % 2 === 0 ? r * 0.78 : r * 0.62;
        const px = Math.cos(a) * rad;
        const py = Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Lubang-lubang renyah kerupuk
      ctx.fillStyle = '#dfc396';
      for (const [dx, dy, sr] of [[-0.22, -0.18, 0.11], [0.22, -0.1, 0.1], [0.02, 0.22, 0.12], [-0.18, 0.18, 0.08]]) {
        ctx.beginPath();
        ctx.arc(dx * r, dy * r, sr * r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'sambal': {
      // Cobek kecil berisi sambal / bumbu merah pedas
      ctx.fillStyle = '#5c4b42';
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = Math.max(1.5, r * 0.08);
      ctx.beginPath();
      ctx.ellipse(0, r * 0.16, r * 0.78, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#c83422';
      ctx.beginPath();
      ctx.ellipse(0, r * 0.06, r * 0.6, r * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();

      // Biji cabai
      ctx.fillStyle = '#f6c853';
      for (const [dx, dy] of [[-0.22, 0.02], [0.16, -0.05], [0.02, 0.14], [0.28, 0.1]]) {
        ctx.beginPath();
        ctx.arc(dx * r, dy * r, r * 0.065, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'es': {
      // 3 kubus es batu jernih
      ctx.strokeStyle = '#3f6e78';
      ctx.lineWidth = Math.max(1.4, r * 0.08);
      const cubes = [
        [-0.36, -0.1, -0.12],
        [0.14, -0.26, 0.18],
        [-0.04, 0.24, 0.08],
      ];
      for (const [dx, dy, rot] of cubes) {
        ctx.save();
        ctx.translate(dx * r, dy * r);
        ctx.rotate(rot);
        ctx.fillStyle = '#d9f0f4';
        roundRect(ctx, -r * 0.26, -r * 0.26, r * 0.52, r * 0.52, r * 0.1);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-r * 0.16, -r * 0.16, r * 0.18, r * 0.1);
        ctx.restore();
      }
      break;
    }

    case 'teh_manis': {
      // Gelas warung berisi teh manis cokelat keemasan
      ctx.fillStyle = '#f2f6f5';
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = Math.max(1.5, r * 0.08);
      ctx.beginPath();
      ctx.moveTo(-r * 0.48, -r * 0.66);
      ctx.lineTo(r * 0.48, -r * 0.66);
      ctx.lineTo(r * 0.36, r * 0.72);
      ctx.lineTo(-r * 0.36, r * 0.72);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#b95f1c';
      ctx.beginPath();
      ctx.moveTo(-r * 0.41, -r * 0.36);
      ctx.lineTo(r * 0.41, -r * 0.36);
      ctx.lineTo(r * 0.32, r * 0.65);
      ctx.lineTo(-r * 0.32, r * 0.65);
      ctx.closePath();
      ctx.fill();

      // Gagang gelas
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = Math.max(1.6, r * 0.1);
      ctx.beginPath();
      ctx.arc(r * 0.44, 0, r * 0.24, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();
      break;
    }

    case 'gosong': {
      // Gumpalan hitam gosong
      ctx.fillStyle = '#2a2422';
      ctx.strokeStyle = '#110d0c';
      ctx.lineWidth = Math.max(1.5, r * 0.08);
      ctx.beginPath();
      ctx.arc(-r * 0.22, r * 0.08, r * 0.42, 0, Math.PI * 2);
      ctx.arc(r * 0.22, r * 0.1, r * 0.38, 0, Math.PI * 2);
      ctx.arc(0, -r * 0.18, r * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#c84b31';
      ctx.lineWidth = Math.max(1.5, r * 0.09);
      ctx.beginPath();
      ctx.moveTo(-r * 0.22, -r * 0.18);
      ctx.lineTo(r * 0.22, r * 0.22);
      ctx.moveTo(r * 0.22, -r * 0.18);
      ctx.lineTo(-r * 0.22, r * 0.22);
      ctx.stroke();
      break;
    }

    default:
      break;
  }

  ctx.restore();
}

export function drawFinishedDish(ctx, recipeId, cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);

  if (recipeId === 'es_teh') {
    // Tatakan kayu + gelas tinggi Es Teh segar dengan es batu & daun teh
    ctx.fillStyle = '#a16f3d';
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = Math.max(1.6, r * 0.06);
    ctx.beginPath();
    ctx.ellipse(0, r * 0.62, r * 0.72, r * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Gelas
    ctx.fillStyle = '#edf5f5';
    ctx.beginPath();
    ctx.moveTo(-r * 0.44, -r * 0.68);
    ctx.lineTo(r * 0.44, -r * 0.68);
    ctx.lineTo(r * 0.32, r * 0.6);
    ctx.lineTo(-r * 0.32, r * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Isi teh amber
    ctx.fillStyle = '#c6681d';
    ctx.beginPath();
    ctx.moveTo(-r * 0.39, -r * 0.4);
    ctx.lineTo(r * 0.39, -r * 0.4);
    ctx.lineTo(r * 0.28, r * 0.54);
    ctx.lineTo(-r * 0.28, r * 0.54);
    ctx.closePath();
    ctx.fill();

    // Es batu mengapung
    ctx.fillStyle = '#dff5f8';
    ctx.strokeStyle = '#53828d';
    ctx.lineWidth = Math.max(1.2, r * 0.045);
    roundRect(ctx, -r * 0.26, -r * 0.34, r * 0.24, r * 0.22, r * 0.05);
    ctx.fill();
    ctx.stroke();
    roundRect(ctx, r * 0.02, -r * 0.28, r * 0.24, r * 0.22, r * 0.05);
    ctx.fill();
    ctx.stroke();

    // Sedotan hijau daun
    ctx.strokeStyle = '#3f7d45';
    ctx.lineWidth = Math.max(2.2, r * 0.1);
    ctx.beginPath();
    ctx.moveTo(r * 0.14, r * 0.28);
    ctx.lineTo(r * 0.34, -r * 0.88);
    ctx.stroke();

    ctx.restore();
    return;
  }

  // Piring enamel warung (putih krem + pinggiran hijau toska)
  ctx.fillStyle = PALETTE.enamel;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = Math.max(1.8, r * 0.06);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = PALETTE.enamelRim;
  ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
  ctx.stroke();

  if (recipeId === 'nasi_goreng') {
    // Nasi goreng + kerupuk + acar timun + telur mata sapi kecil
    drawIngredientIcon(ctx, 'nasi_matang', -r * 0.08, r * 0.06, r * 0.62);
    drawIngredientIcon(ctx, 'kerupuk', r * 0.38, -r * 0.28, r * 0.36);
    drawIngredientIcon(ctx, 'sayur_iris', -r * 0.36, -r * 0.24, r * 0.34);
  } else if (recipeId === 'mie_ayam') {
    // Mie ayam + potongan ayam kecap + sawi + sambal
    drawIngredientIcon(ctx, 'mie_matang', 0, r * 0.06, r * 0.64);
    drawIngredientIcon(ctx, 'ayam_iris', -r * 0.24, -r * 0.16, r * 0.38);
    drawIngredientIcon(ctx, 'sayur_iris', r * 0.3, -r * 0.18, r * 0.34);
    drawIngredientIcon(ctx, 'sambal', r * 0.26, r * 0.28, r * 0.28);
  } else if (recipeId === 'sate_ayam') {
    // Alas daun pisang + sate bakar + sambal kacang + kerupuk
    ctx.fillStyle = '#478b4a';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.66, r * 0.56, -0.2, 0, Math.PI * 2);
    ctx.fill();
    drawIngredientIcon(ctx, 'sate_bakar', -r * 0.12, -r * 0.04, r * 0.58);
    drawIngredientIcon(ctx, 'sambal', r * 0.32, r * 0.24, r * 0.3);
    drawIngredientIcon(ctx, 'kerupuk', r * 0.36, -r * 0.32, r * 0.32);
  }

  ctx.restore();
}

// =========================================================================
// POTRET PELANGGAN INDONESIA
// =========================================================================

function drawCustomerAvatar(ctx, profile, cx, cy, r, patienceRatio) {
  ctx.save();
  ctx.translate(cx, cy);

  // Lingkaran latar
  ctx.fillStyle = patienceRatio < 0.3 ? '#f8d2c6' : '#f4e6cf';
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r - 1.5, 0, Math.PI * 2);
  ctx.clip();

  // Bahu / baju
  ctx.fillStyle = profile.shirt;
  ctx.beginPath();
  ctx.ellipse(0, r * 0.92, r * 0.78, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hijab bagian luar
  if (profile.hat === 'hijab') {
    ctx.fillStyle = profile.hatColor || PALETTE.terracotta;
    ctx.beginPath();
    ctx.arc(0, -r * 0.04, r * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-r * 0.52, 0, r * 1.04, r * 0.75);
  }

  // Wajah
  ctx.fillStyle = profile.skin;
  ctx.beginPath();
  ctx.arc(0, -r * 0.05, r * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Rambut / penutup kepala
  if (profile.hat === 'peci') {
    ctx.fillStyle = '#231d1a';
    roundRect(ctx, -r * 0.46, -r * 0.64, r * 0.92, r * 0.36, r * 0.08);
    ctx.fill();
  } else if (profile.hat === 'cap') {
    ctx.fillStyle = profile.hatColor || PALETTE.terracotta;
    ctx.beginPath();
    ctx.arc(0, -r * 0.24, r * 0.48, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-r * 0.48, -r * 0.3, r * 1.1, r * 0.14);
  } else if (profile.hat === 'bandana') {
    ctx.fillStyle = profile.hair;
    ctx.beginPath();
    ctx.arc(0, -r * 0.16, r * 0.47, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = profile.hatColor || PALETTE.leaf;
    ctx.fillRect(-r * 0.46, -r * 0.34, r * 0.92, r * 0.16);
  } else if (profile.hat === 'bun') {
    ctx.fillStyle = profile.hair;
    ctx.beginPath();
    ctx.arc(0, -r * 0.56, r * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -r * 0.16, r * 0.47, Math.PI, 0);
    ctx.fill();
  } else if (profile.hat !== 'hijab') {
    ctx.fillStyle = profile.hair;
    ctx.beginPath();
    ctx.arc(0, -r * 0.18, r * 0.47, Math.PI, 0);
    ctx.fill();
  }

  // Mata & ekspresi berdasarkan sisa kesabaran
  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath();
  ctx.arc(-r * 0.15, -r * 0.06, r * 0.06, 0, Math.PI * 2);
  ctx.arc(r * 0.15, -r * 0.06, r * 0.06, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  if (patienceRatio > 0.45) {
    // Senyum
    ctx.beginPath();
    ctx.arc(0, r * 0.05, r * 0.16, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  } else if (patienceRatio > 0.25) {
    // Datar / mulai menunggu
    ctx.beginPath();
    ctx.moveTo(-r * 0.14, r * 0.15);
    ctx.lineTo(r * 0.14, r * 0.15);
    ctx.stroke();
  } else {
    // Cemberut + alis miring
    ctx.beginPath();
    ctx.arc(0, r * 0.24, r * 0.15, 1.15 * Math.PI, 1.85 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.24, -r * 0.2);
    ctx.lineTo(-r * 0.07, -r * 0.14);
    ctx.moveTo(r * 0.24, -r * 0.2);
    ctx.lineTo(r * 0.07, -r * 0.14);
    ctx.stroke();
  }

  ctx.restore();
  ctx.restore();
}

// =========================================================================
// LATAR DAPUR WARUNG & TENDA GARIS-GARIS
// =========================================================================

function drawBackground(ctx, state) {
  // Dinding keramik krem hangat dapur warung
  ctx.fillStyle = PALETTE.wallTile;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Pola ubin dinding hangat di zona atas & tengah
  const tileSize = 44;
  ctx.strokeStyle = PALETTE.wallTileAlt;
  ctx.lineWidth = 1.2;
  for (let y = 62; y < 420; y += tileSize) {
    for (let x = 0; x < WIDTH; x += tileSize) {
      ctx.strokeRect(x, y, tileSize, tileSize);
    }
  }

  // Papan rel kayu untuk gantung kartu pesanan
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(0, 62, WIDTH, 156);
  ctx.fillStyle = '#683f1d';
  ctx.fillRect(0, 210, WIDTH, 8);
  // Garis serat kayu halus
  ctx.strokeStyle = 'rgba(42, 24, 12, 0.28)';
  ctx.lineWidth = 2;
  for (let y = 80; y < 210; y += 26) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }

  // Papan pesanan berkedip saat Rush Hour!
  const phase = getPhase(state.elapsed);
  if (state.mode === 'playing' && phase.isRush) {
    const blink = 0.5 + 0.5 * Math.sin(state.time * 7.5);
    ctx.strokeStyle = `rgba(246, 200, 83, ${0.35 + blink * 0.6})`;
    ctx.lineWidth = 5;
    ctx.strokeRect(10, 66, WIDTH - 20, 148);
  }

  // Meja dapur kayu jati utama (zona stasiun + zona piring)
  ctx.fillStyle = PALETTE.woodLight;
  ctx.fillRect(0, 218, WIDTH, 348);
  ctx.fillStyle = '#c4965f';
  ctx.fillRect(0, 408, WIDTH, 158);
  // Bibir meja kayu
  ctx.fillStyle = PALETTE.woodMid;
  ctx.fillRect(0, 406, WIDTH, 8);
  ctx.fillStyle = PALETTE.woodDark;
  ctx.fillRect(0, 560, WIDTH, 10);

  // Meja counter bahan di bagian bawah
  ctx.fillStyle = PALETTE.woodDeep;
  ctx.fillRect(0, 566, WIDTH, HEIGHT - 566);
  ctx.fillStyle = PALETTE.woodMid;
  ctx.fillRect(0, 566, WIDTH, 5);
}

function drawAwningAndHud(ctx, state) {
  const phase = getPhase(state.elapsed);
  const stripeW = 40;
  const awningH = 54;

  // Tenda garis-garis terakota & krem dengan tepi bergelombang
  for (let x = 0, idx = 0; x < WIDTH + stripeW; x += stripeW, idx++) {
    const isTerra = idx % 2 === 0;
    ctx.fillStyle = isTerra ? PALETTE.terracotta : PALETTE.cream;
    ctx.fillRect(x, 0, stripeW, awningH);

    // Scallop bawah tenda
    ctx.beginPath();
    ctx.arc(x + stripeW / 2, awningH, stripeW / 2, 0, Math.PI);
    ctx.fill();

    // Bayangan lipatan bawah tenda
    ctx.strokeStyle = isTerra ? PALETTE.terracottaDark : PALETTE.creamDeep;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + stripeW / 2, awningH, stripeW / 2 - 1, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }

  // Papan nama kayu "WARUNG BU SARI" di tengah
  fillStrokeRoundRect(ctx, 480, 6, 320, 48, 12, PALETTE.woodDeep, PALETTE.turmericBright, 3);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = `900 24px ${FONT_UI}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WARUNG BU SARI', 640, 31);

  // KIRI: Timer Shift + Fase
  const isUrgentTime = state.mode === 'playing' && state.remaining <= 45;
  const timerBg = isUrgentTime ? PALETTE.chili : PALETTE.woodDeep;
  fillStrokeRoundRect(ctx, 18, 7, 134, 46, 10, timerBg, PALETTE.cream, 2.5);
  // Ikon jam kecil
  ctx.strokeStyle = PALETTE.turmericBright;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(44, 30, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(44, 30);
  ctx.lineTo(44, 22);
  ctx.moveTo(44, 30);
  ctx.lineTo(50, 32);
  ctx.stroke();

  ctx.fillStyle = PALETTE.cream;
  ctx.font = `900 24px ${FONT_UI}`;
  ctx.textAlign = 'left';
  ctx.fillText(formatClock(state.remaining), 64, 31);

  // Lencana fase / RUSH HOUR
  const phaseBg = phase.isRush
    ? (Math.sin(state.time * 8) > 0 ? PALETTE.chili : PALETTE.turmericDark)
    : PALETTE.leafDark;
  fillStrokeRoundRect(ctx, 162, 11, 168, 38, 10, phaseBg, PALETTE.cream, 2);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = `800 15px ${FONT_UI}`;
  ctx.textAlign = 'center';
  ctx.fillText(phase.name.toUpperCase(), 246, 31);

  // Lencana Kombo jika aktif >= 2
  if (state.combo >= 2) {
    fillStrokeRoundRect(ctx, 340, 11, 126, 38, 10, PALETTE.turmeric, PALETTE.woodDeep, 2.5);
    ctx.fillStyle = PALETTE.woodDeep;
    ctx.font = `900 16px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.fillText(`KOMBO x${state.combo}`, 403, 31);
  }

  // KANAN: Skor, Koin, Reputasi (5 bintang), Tombol Suara
  fillStrokeRoundRect(ctx, 816, 8, 138, 44, 10, PALETTE.woodDeep, PALETTE.cream, 2);
  ctx.fillStyle = PALETTE.creamWarm;
  ctx.font = `700 11px ${FONT_UI}`;
  ctx.textAlign = 'left';
  ctx.fillText('SKOR', 828, 21);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = `900 20px ${FONT_UI}`;
  ctx.fillText(formatNumber(state.score), 828, 39);

  fillStrokeRoundRect(ctx, 962, 8, 108, 44, 10, PALETTE.woodDeep, PALETTE.turmericBright, 2);
  // Ikon koin emas
  ctx.fillStyle = PALETTE.turmericBright;
  ctx.beginPath();
  ctx.arc(984, 30, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.turmericDark;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = PALETTE.woodDeep;
  ctx.font = `900 12px ${FONT_UI}`;
  ctx.textAlign = 'center';
  ctx.fillText('Rp', 984, 31);

  ctx.fillStyle = PALETTE.turmericBright;
  ctx.font = `900 20px ${FONT_UI}`;
  ctx.textAlign = 'left';
  ctx.fillText(String(state.coins), 1002, 31);

  // Reputasi bintang (5 bintang)
  fillStrokeRoundRect(ctx, 1078, 8, 140, 44, 10, PALETTE.woodDeep, PALETTE.cream, 2);
  for (let i = 0; i < MAX_REPUTATION; i++) {
    drawStar(
      ctx,
      1097 + i * 25.5,
      30,
      10,
      i < state.reputation ? PALETTE.turmericBright : '#5b4436',
      PALETTE.ink
    );
  }

  // Tombol Mute suara
  const mb = LAYOUT.muteBtn;
  const muted = state.muted;
  fillStrokeRoundRect(ctx, mb.x, mb.y, mb.w, mb.h, 9, muted ? PALETTE.ironMid : PALETTE.leafDark, PALETTE.cream, 2);
  ctx.fillStyle = PALETTE.cream;
  ctx.beginPath();
  ctx.moveTo(mb.x + 10, mb.y + 15);
  ctx.lineTo(mb.x + 16, mb.y + 15);
  ctx.lineTo(mb.x + 22, mb.y + 10);
  ctx.lineTo(mb.x + 22, mb.y + 28);
  ctx.lineTo(mb.x + 16, mb.y + 23);
  ctx.lineTo(mb.x + 10, mb.y + 23);
  ctx.closePath();
  ctx.fill();
  if (muted) {
    ctx.strokeStyle = PALETTE.chili;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(mb.x + 25, mb.y + 13);
    ctx.lineTo(mb.x + 33, mb.y + 25);
    ctx.moveTo(mb.x + 33, mb.y + 13);
    ctx.lineTo(mb.x + 25, mb.y + 25);
    ctx.stroke();
  } else {
    ctx.strokeStyle = PALETTE.cream;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mb.x + 23, mb.y + 19, 6, -0.7, 0.7);
    ctx.stroke();
  }
}

function drawStar(ctx, cx, cy, r, fill, stroke) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? r : r * 0.45;
    if (i === 0) ctx.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
    else ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
}

// =========================================================================
// PAPAN PESANAN (4 SLOT DI ATAS)
// =========================================================================

function drawOrdersBoard(ctx, state) {
  const holdingDish = state.kitchen.hand?.kind === 'dish' ? state.kitchen.hand.recipeId : null;
  const readyOnCounter = new Set(
    state.kitchen.plates
      .filter((p) => p.analysis.status === 'ready')
      .map((p) => p.analysis.recipe.id)
  );

  for (let i = 0; i < LAYOUT.orders.length; i++) {
    const rect = LAYOUT.orders[i];
    const order = state.orders.slots[i];

    if (!order) {
      // Slot kosong kayu halus
      fillStrokeRoundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12, 'rgba(54, 30, 14, 0.36)', 'rgba(247, 239, 225, 0.22)', 2);
      ctx.fillStyle = 'rgba(247, 239, 225, 0.45)';
      ctx.font = `700 14px ${FONT_UI}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Menunggu pelanggan...', rect.x + rect.w / 2, rect.y + rect.h / 2);
      continue;
    }

    const ratio = Math.max(0, Math.min(1, order.patience / order.maxPatience));
    const isUrgent = ratio < 0.3;
    const isMatch = holdingDish === order.recipeId || (!state.kitchen.hand && readyOnCounter.has(order.recipeId));
    const isHovered = state.pointer.hover?.type === 'order' && state.pointer.hover.index === i;

    ctx.save();
    const slideY = -order.enterAnim * 36;
    const shakeX = isUrgent ? Math.sin(state.time * 22 + i) * 2.2 : 0;
    ctx.translate(shakeX, slideY);

    // Kartu pesanan krem hangat
    const borderColor = isMatch
      ? PALETTE.leafBright
      : isUrgent
      ? PALETTE.chili
      : isHovered
      ? PALETTE.turmeric
      : PALETTE.woodDeep;
    const borderW = isMatch || isUrgent ? 3.5 : 2.2;

    fillStrokeRoundRect(ctx, rect.x, rect.y, rect.w, rect.h, 12, PALETTE.cream, borderColor, borderW);

    // Klip kayu kecil di atas kartu
    fillStrokeRoundRect(ctx, rect.x + rect.w / 2 - 22, rect.y - 6, 44, 12, 4, PALETTE.woodMid, PALETTE.woodDeep, 1.5);

    // Potret pelanggan + nama singkat
    drawCustomerAvatar(ctx, order.profile, rect.x + 36, rect.y + 42, 24, ratio);
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.font = `700 11px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(order.profile.name, rect.x + 36, rect.y + 76);

    // Nama hidangan + koin
    ctx.fillStyle = PALETTE.ink;
    ctx.font = `900 18px ${FONT_UI}`;
    ctx.textAlign = 'left';
    ctx.fillText(order.recipe.name, rect.x + 70, rect.y + 26);

    // Lencana harga koin di kanan atas
    fillStrokeRoundRect(ctx, rect.x + rect.w - 58, rect.y + 12, 48, 24, 8, PALETTE.turmericBright, PALETTE.turmericDark, 1.5);
    ctx.fillStyle = PALETTE.woodDeep;
    ctx.font = `900 13px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.fillText(`+${order.recipe.coins}`, rect.x + rect.w - 34, rect.y + 25);

    // Ikon hidangan utama di kanan tengah
    drawFinishedDish(ctx, order.recipeId, rect.x + rect.w - 38, rect.y + 72, 27);

    // Baris ikon bahan resep (tanpa teks panjang!)
    const ings = order.recipe.ingredients;
    const chipStartX = rect.x + 70;
    const chipY = rect.y + 66;
    const chipR = ings.length >= 4 ? 15.5 : 17;
    const chipGap = ings.length >= 4 ? 34 : 39;
    for (let k = 0; k < ings.length; k++) {
      const cx = chipStartX + k * chipGap + chipR;
      ctx.fillStyle = PALETTE.creamWarm;
      ctx.strokeStyle = PALETTE.woodMid;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, chipY, chipR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      drawIngredientIcon(ctx, ings[k], cx, chipY, chipR - 3.5);
    }

    // Lencana "KLIK SAJIKAN!" jika piring cocok siap
    if (isMatch) {
      fillStrokeRoundRect(ctx, rect.x + 70, rect.y + 88, 126, 20, 6, PALETTE.leaf, PALETTE.leafDark, 1.5);
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 11px ${FONT_UI}`;
      ctx.textAlign = 'center';
      ctx.fillText('SAJIKAN SEKARANG!', rect.x + 133, rect.y + 99);
    }

    // Bar kesabaran tebal di bagian bawah kartu
    const barX = rect.x + 12;
    const barY = rect.y + rect.h - 22;
    const barW = rect.w - 24;
    const barH = 13;
    fillStrokeRoundRect(ctx, barX, barY, barW, barH, 6, '#d9cbb3', PALETTE.woodDark, 1.5);

    const barColor =
      ratio > 0.5 ? PALETTE.leafBright : ratio > 0.25 ? PALETTE.turmeric : PALETTE.chili;
    const fillW = Math.max(8, (barW - 3) * ratio);
    if (ratio > 0.01) {
      roundRect(ctx, barX + 1.5, barY + 1.5, fillW, barH - 3, 5);
      ctx.fillStyle = barColor;
      ctx.fill();
    }

    ctx.restore();
  }
}

// =========================================================================
// 4 STASIUN MASAK & TEMPAT SAMPAH
// =========================================================================

function drawStationCardBase(ctx, rect, keyNum, label, isSelected, isHovered, pulse) {
  const stroke = isSelected
    ? PALETTE.turmericBright
    : isHovered
    ? PALETTE.terracotta
    : PALETTE.woodDark;
  const lineW = isSelected ? 4 : isHovered ? 3 : 2;
  const bg = pulse > 0.1 ? '#fae3b4' : PALETTE.creamWarm;
  fillStrokeRoundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14, bg, stroke, lineW);

  // Lencana tombol keyboard [1]-[4]
  fillStrokeRoundRect(
    ctx,
    rect.x + 10,
    rect.y + 10,
    26,
    26,
    7,
    isSelected ? PALETTE.turmeric : PALETTE.woodDeep,
    PALETTE.ink,
    1.5
  );
  ctx.fillStyle = isSelected ? PALETTE.woodDeep : PALETTE.cream;
  ctx.font = `900 14px ${FONT_UI}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(keyNum, rect.x + 23, rect.y + 24);

  // Judul stasiun
  ctx.fillStyle = PALETTE.ink;
  ctx.font = `900 16px ${FONT_UI}`;
  ctx.textAlign = 'left';
  ctx.fillText(label, rect.x + 44, rect.y + 24);
}

function drawProgressArc(ctx, cx, cy, r, progress, color, label) {
  // Cincin progres tebal & jelas
  ctx.save();
  ctx.lineWidth = 7;
  ctx.strokeStyle = 'rgba(42, 29, 21, 0.22)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0, Math.min(1, progress)));
  ctx.stroke();

  if (label) {
    fillStrokeRoundRect(ctx, cx - 44, cy + r - 6, 88, 22, 8, color, PALETTE.ink, 1.8);
    ctx.fillStyle = '#ffffff';
    ctx.font = `900 11px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, cy + r + 5);
  }
  ctx.restore();
}

function drawStations(ctx, state) {
  const { stations, selectedStation } = state.kitchen;
  const hover = state.pointer.hover;

  // --- 1. WAJAN ---
  {
    const st = stations.wajan;
    const r = LAYOUT.stations.wajan;
    drawStationCardBase(
      ctx,
      r,
      '1',
      'WAJAN',
      selectedStation === 'wajan',
      hover?.type === 'station' && hover.id === 'wajan',
      st.pulse
    );

    const cx = r.x + r.w / 2;
    const cy = r.y + 104;

    // Tungku kompor besi
    ctx.fillStyle = '#55473f';
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    roundRect(ctx, cx - 76, cy + 30, 152, 26, 8);
    ctx.fill();
    ctx.stroke();

    // Api kompor oranye-kuning menyala jelas di bawah wajan saat aktif
    if (st.status === 'cooking' || st.status === 'ready') {
      for (let i = -3; i <= 3; i++) {
        const flick = Math.sin(state.time * 18 + i * 1.7) * 3;
        const fx = cx + i * 18;
        ctx.fillStyle = i % 2 === 0 ? PALETTE.ember : PALETTE.flame;
        ctx.beginPath();
        ctx.moveTo(fx - 9, cy + 52);
        ctx.quadraticCurveTo(fx, cy + 20 + flick, fx + 9, cy + 52);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Gagang wajan kiri-kanan
    ctx.strokeStyle = PALETTE.iron;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx - 66, cy - 2, 14, Math.PI * 0.5, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 66, cy - 2, 14, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();

    // Badan wajan besi cor
    ctx.fillStyle = PALETTE.iron;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = PALETTE.ironMid;
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 47, 0, Math.PI * 2);
    ctx.fill();

    // Isi wajan
    if (st.status === 'cooking') {
      const bob = Math.sin(state.time * 16) * 2.5;
      drawIngredientIcon(ctx, st.inputId, cx, cy - 2 + bob, 32);
      const prog = Math.min(1, st.elapsed / st.cookDuration);
      drawProgressArc(ctx, cx, cy - 2, 52, prog, PALETTE.turmericBright, 'MASAK...');
    } else if (st.status === 'ready') {
      const warn = isStationWarning(st);
      const burnRatio = st.burnElapsed / BURN_TIME;
      drawIngredientIcon(ctx, st.outputId, cx, cy - 2, 34);
      const ringColor = warn
        ? (Math.sin(state.time * 14) > 0 ? PALETTE.chili : PALETTE.turmeric)
        : PALETTE.leafBright;
      drawProgressArc(ctx, cx, cy - 2, 52, 1 - burnRatio, ringColor, warn ? 'ANGKAT!' : 'MATANG!');
    } else if (st.status === 'burnt') {
      drawIngredientIcon(ctx, 'gosong', cx, cy - 2, 34);
      drawProgressArc(ctx, cx, cy - 2, 52, 1, PALETTE.chiliDark, 'GOSONG!');
    } else {
      ctx.fillStyle = 'rgba(247, 239, 225, 0.55)';
      ctx.font = `700 12px ${FONT_UI}`;
      ctx.textAlign = 'center';
      ctx.fillText('Nasi / Mie', cx, cy - 1);
    }
  }

  // --- 2. PANGGANGAN SATE ---
  {
    const st = stations.panggangan;
    const r = LAYOUT.stations.panggangan;
    drawStationCardBase(
      ctx,
      r,
      '2',
      'PANGGANGAN',
      selectedStation === 'panggangan',
      hover?.type === 'station' && hover.id === 'panggangan',
      st.pulse
    );

    const cx = r.x + r.w / 2;
    const cy = r.y + 104;

    // Bak panggangan besi panjang + bara api merah menyala
    fillStrokeRoundRect(ctx, cx - 96, cy - 36, 192, 74, 12, PALETTE.iron, PALETTE.ink, 2.5);
    fillStrokeRoundRect(ctx, cx - 84, cy - 24, 168, 50, 8, '#3d1c12', PALETTE.ink, 1.5);

    // Bara api menyala
    for (let i = 0; i < 7; i++) {
      const ex = cx - 68 + i * 22;
      const glow = 0.65 + 0.35 * Math.sin(state.time * 7 + i * 1.4);
      ctx.fillStyle = st.status !== 'idle'
        ? `rgba(239, 107, 45, ${glow})`
        : 'rgba(180, 62, 26, 0.55)';
      ctx.beginPath();
      ctx.ellipse(ex, cy + (i % 2 === 0 ? -4 : 8), 11, 7, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Kisi-kisi kawat panggangan
    ctx.strokeStyle = '#8b7b70';
    ctx.lineWidth = 2.4;
    for (let x = cx - 72; x <= cx + 72; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, cy - 26);
      ctx.lineTo(x, cy + 26);
      ctx.stroke();
    }

    if (st.status === 'cooking') {
      const bob = Math.sin(state.time * 12) * 2;
      drawIngredientIcon(ctx, 'sate', cx, cy - 4 + bob, 36);
      const prog = Math.min(1, st.elapsed / st.cookDuration);
      drawProgressArc(ctx, cx, cy, 48, prog, PALETTE.ember, 'BAKAR...');
    } else if (st.status === 'ready') {
      const warn = isStationWarning(st);
      const burnRatio = st.burnElapsed / BURN_TIME;
      drawIngredientIcon(ctx, 'sate_bakar', cx, cy - 4, 38);
      const ringColor = warn
        ? (Math.sin(state.time * 14) > 0 ? PALETTE.chili : PALETTE.turmeric)
        : PALETTE.leafBright;
      drawProgressArc(ctx, cx, cy, 48, 1 - burnRatio, ringColor, warn ? 'ANGKAT!' : 'MATANG!');
    } else if (st.status === 'burnt') {
      drawIngredientIcon(ctx, 'gosong', cx, cy - 4, 34);
      drawProgressArc(ctx, cx, cy, 48, 1, PALETTE.chiliDark, 'GOSONG!');
    } else {
      ctx.fillStyle = PALETTE.cream;
      ctx.font = `700 12px ${FONT_UI}`;
      ctx.textAlign = 'center';
      ctx.fillText('Taruh Sate', cx, cy + 48);
    }
  }

  // --- 3. TALENAN (INSTAN) ---
  {
    const st = stations.talenan;
    const r = LAYOUT.stations.talenan;
    drawStationCardBase(
      ctx,
      r,
      '3',
      'TALENAN',
      selectedStation === 'talenan',
      hover?.type === 'station' && hover.id === 'talenan',
      st.pulse
    );

    const cx = r.x + r.w / 2;
    const cy = r.y + 108;

    // Papan kayu talenan tebal
    fillStrokeRoundRect(ctx, cx - 86, cy - 38, 172, 74, 14, '#d9ae76', PALETTE.woodDeep, 2.5);
    fillStrokeRoundRect(ctx, cx - 76, cy - 30, 152, 58, 10, '#e6c28e', '#b6834b', 1.5);
    // Lubang pegangan talenan
    fillStrokeRoundRect(ctx, cx + 52, cy - 12, 16, 24, 6, PALETTE.creamWarm, PALETTE.woodDark, 1.5);

    // Pisau dapur / golok warung (berayun saat memotong!)
    ctx.save();
    ctx.translate(cx - 10, cy - 8);
    const chopAngle = st.chopAnim > 0 ? -0.55 + Math.sin(st.chopAnim * Math.PI * 2) * 0.55 : -0.35;
    ctx.rotate(chopAngle);
    // Bilah pisau
    ctx.fillStyle = '#dce0df';
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    roundRect(ctx, -44, -18, 64, 30, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f8faf9';
    ctx.fillRect(-38, -14, 52, 6);
    // Gagang kayu pisau
    fillStrokeRoundRect(ctx, 18, -10, 34, 16, 5, PALETTE.woodDark, PALETTE.ink, 2);
    ctx.restore();

    if (st.chopAnim > 0.05 && st.lastCutId) {
      drawIngredientIcon(ctx, st.lastCutId, cx - 38, cy + 8, 22);
    }

    // Label instan
    fillStrokeRoundRect(ctx, cx - 64, r.y + r.h - 26, 128, 20, 7, PALETTE.leafSoft, PALETTE.leafDark, 1.4);
    ctx.fillStyle = PALETTE.leafDark;
    ctx.font = `800 11px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.fillText('1 KLIK: AYAM / SAYUR', cx, r.y + r.h - 15);
  }

  // --- 4. RAK MINUMAN (INSTAN) ---
  {
    const st = stations.minuman;
    const r = LAYOUT.stations.minuman;
    drawStationCardBase(
      ctx,
      r,
      '4',
      'RAK MINUMAN',
      selectedStation === 'minuman',
      hover?.type === 'station' && hover.id === 'minuman',
      st.pulse
    );

    const cx = r.x + r.w / 2;
    const cy = r.y + 104;

    // Rak kayu mini + toples kaca dispenser teh manis
    fillStrokeRoundRect(ctx, cx - 68, cy + 28, 136, 16, 5, PALETTE.woodMid, PALETTE.woodDeep, 2);

    // Tabung kaca teh manis
    fillStrokeRoundRect(ctx, cx - 44, cy - 42, 66, 70, 12, '#eef4f3', PALETTE.ink, 2.2);
    fillStrokeRoundRect(ctx, cx - 39, cy - 18, 56, 42, 8, '#b95d1a', null);
    // Tutup terakota
    fillStrokeRoundRect(ctx, cx - 48, cy - 50, 74, 14, 6, PALETTE.terracotta, PALETTE.ink, 2);
    // Keran teh
    ctx.fillStyle = PALETTE.ironMid;
    ctx.fillRect(cx + 22, cy + 8, 18, 7);
    ctx.fillRect(cx + 34, cy + 8, 6, 12);

    // Aliran teh saat dituang
    if (st.pourAnim > 0.05) {
      ctx.fillStyle = '#c8661d';
      ctx.fillRect(cx + 35, cy + 18, 5, 22 * st.pourAnim);
    }

    // Gelas di sebelah keran
    drawIngredientIcon(ctx, 'teh_manis', cx + 44, cy + 12, 22);

    fillStrokeRoundRect(ctx, cx - 66, r.y + r.h - 26, 132, 20, 7, PALETTE.leafSoft, PALETTE.leafDark, 1.4);
    ctx.fillStyle = PALETTE.leafDark;
    ctx.font = `800 11px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.fillText('1 KLIK: TEH MANIS', cx, r.y + r.h - 15);
  }

  // --- TEMPAT SAMPAH ---
  {
    const tr = LAYOUT.trash;
    const isHov = hover?.type === 'trash';
    const scale = 1 + state.kitchen.trashAnim * 0.08;
    ctx.save();
    ctx.translate(tr.x + tr.w / 2, tr.y + tr.h / 2);
    ctx.scale(scale, scale);

    fillStrokeRoundRect(
      ctx,
      -tr.w / 2,
      -tr.h / 2,
      tr.w,
      tr.h,
      14,
      isHov ? '#f5d2c6' : '#e6d4ba',
      isHov ? PALETTE.chili : PALETTE.woodDark,
      isHov ? 3 : 2
    );

    // Tong sampah hijau/abu warung
    ctx.fillStyle = '#5f6860';
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-28, -22);
    ctx.lineTo(28, -22);
    ctx.lineTo(22, 34);
    ctx.lineTo(-22, 34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Tutup tong
    fillStrokeRoundRect(ctx, -34, -34, 68, 12, 5, '#474f48', PALETTE.ink, 2);
    fillStrokeRoundRect(ctx, -12, -42, 24, 9, 4, '#474f48', PALETTE.ink, 2);

    // Garis tong
    ctx.strokeStyle = '#383e39';
    ctx.lineWidth = 2;
    for (const gx of [-11, 0, 11]) {
      ctx.beginPath();
      ctx.moveTo(gx, -14);
      ctx.lineTo(gx * 0.85, 26);
      ctx.stroke();
    }

    ctx.fillStyle = PALETTE.ink;
    ctx.font = `900 13px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BUANG', 0, 56);
    ctx.restore();
  }
}

// =========================================================================
// MEJA RAKIT (2 PIRING) + PANEL TANGAN & PANDUAN RESEP MINI
// =========================================================================

function drawPlatesAndHand(ctx, state) {
  const hover = state.pointer.hover;

  for (let i = 0; i < LAYOUT.plates.length; i++) {
    const r = LAYOUT.plates[i];
    const plate = state.kitchen.plates[i];
    const { status, recipe, missing } = plate.analysis;
    const isHov = hover?.type === 'plate' && hover.index === i;

    const border =
      status === 'ready'
        ? PALETTE.leafBright
        : status === 'invalid'
        ? PALETTE.chili
        : status === 'building'
        ? PALETTE.turmeric
        : isHov
        ? PALETTE.terracotta
        : PALETTE.woodDark;
    const bg =
      status === 'ready'
        ? '#eaf5e4'
        : status === 'invalid'
        ? '#f9dcd5'
        : PALETTE.cream;

    fillStrokeRoundRect(ctx, r.x, r.y, r.w, r.h, 14, bg, border, status === 'ready' || isHov ? 3.5 : 2.2);

    // Alas daun pisang di bawah piring
    const pcx = r.x + 86;
    const pcy = r.y + r.h / 2 + 2;
    ctx.fillStyle = '#4f8f4e';
    ctx.strokeStyle = PALETTE.leafDark;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(pcx, pcy, 62, 50, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const pop = 1 + plate.popAnim * 0.08;
    ctx.save();
    ctx.translate(pcx, pcy);
    ctx.scale(pop, pop);

    if (status === 'ready' && recipe) {
      drawFinishedDish(ctx, recipe.id, 0, 0, 50);
    } else {
      // Piring enamel kosong / setengah dirakit
      ctx.fillStyle = PALETTE.enamel;
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = PALETTE.enamelRim;
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.stroke();

      // Gambar bahan-bahan yang sudah ada di piring
      const count = plate.items.length;
      const offsets =
        count === 1
          ? [[0, 0]]
          : count === 2
          ? [[-16, -2], [16, 4]]
          : count === 3
          ? [[-18, -10], [18, -8], [0, 16]]
          : [[-16, -14], [16, -14], [-16, 14], [16, 14]];
      for (let k = 0; k < count; k++) {
        const [ox, oy] = offsets[k];
        drawIngredientIcon(ctx, plate.items[k], ox, oy, count === 1 ? 26 : 21);
      }
    }
    ctx.restore();

    // Info kanan piring (status + slot bahan visual)
    const infoX = r.x + 162;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    if (status === 'empty') {
      ctx.fillStyle = PALETTE.ink;
      ctx.font = `900 17px ${FONT_UI}`;
      ctx.fillText(`PIRING ${i + 1}`, infoX, r.y + 38);
      ctx.fillStyle = PALETTE.inkSoft;
      ctx.font = `700 13px ${FONT_UI}`;
      ctx.fillText('Taruh bahan matang /', infoX, r.y + 68);
      ctx.fillText('potongan untuk merakit', infoX, r.y + 88);
    } else if (status === 'ready' && recipe) {
      fillStrokeRoundRect(ctx, infoX, r.y + 16, 114, 26, 8, PALETTE.leaf, PALETTE.leafDark, 1.8);
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 13px ${FONT_UI}`;
      ctx.textAlign = 'center';
      ctx.fillText('SIAP SAJI!', infoX + 57, r.y + 30);

      ctx.textAlign = 'left';
      ctx.fillStyle = PALETTE.ink;
      ctx.font = `900 20px ${FONT_UI}`;
      ctx.fillText(recipe.name, infoX, r.y + 66);

      ctx.fillStyle = PALETTE.leafDark;
      ctx.font = `700 13px ${FONT_UI}`;
      ctx.fillText('Klik piring / pelanggan!', infoX, r.y + 96);

      // Centang semua bahan
      for (let k = 0; k < recipe.ingredients.length; k++) {
        const bx = infoX + 14 + k * 34;
        const by = r.y + 122;
        ctx.fillStyle = PALETTE.leafSoft;
        ctx.strokeStyle = PALETTE.leaf;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bx, by, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        drawIngredientIcon(ctx, recipe.ingredients[k], bx, by, 10);
      }
    } else if (status === 'building' && recipe) {
      fillStrokeRoundRect(ctx, infoX, r.y + 16, 138, 25, 8, PALETTE.turmeric, PALETTE.woodDeep, 1.5);
      ctx.fillStyle = PALETTE.woodDeep;
      ctx.font = `900 12px ${FONT_UI}`;
      ctx.textAlign = 'center';
      ctx.fillText(
        `DIRAKIT ${plate.items.length}/${recipe.ingredients.length}`,
        infoX + 69,
        r.y + 29
      );

      ctx.textAlign = 'left';
      ctx.fillStyle = PALETTE.ink;
      ctx.font = `900 18px ${FONT_UI}`;
      ctx.fillText(recipe.name, infoX, r.y + 60);

      // Tampilkan ikon resep: solid untuk yang sudah masuk, redup + garis putus untuk yang kurang
      for (let k = 0; k < recipe.ingredients.length; k++) {
        const reqId = recipe.ingredients[k];
        const has = plate.items.includes(reqId);
        const bx = infoX + 20 + k * 52;
        const by = r.y + 104;

        ctx.save();
        ctx.beginPath();
        ctx.arc(bx, by, 20, 0, Math.PI * 2);
        ctx.fillStyle = has ? PALETTE.leafSoft : '#f1e5cf';
        ctx.fill();
        ctx.strokeStyle = has ? PALETTE.leaf : PALETTE.woodMid;
        ctx.lineWidth = has ? 2.4 : 1.8;
        if (!has) ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.globalAlpha = has ? 1 : 0.45;
        drawIngredientIcon(ctx, reqId, bx, by, 15);
        ctx.restore();

        if (has) {
          ctx.fillStyle = PALETTE.leaf;
          ctx.beginPath();
          ctx.arc(bx + 14, by - 14, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bx + 11, by - 14);
          ctx.lineTo(bx + 13.5, by - 11.5);
          ctx.lineTo(bx + 17.5, by - 16.5);
          ctx.stroke();
        }
      }
      if (missing.length > 0) {
        ctx.fillStyle = PALETTE.inkSoft;
        ctx.font = `700 11px ${FONT_UI}`;
        ctx.textAlign = 'left';
        ctx.fillText(`Kurang: ${missing.map((m) => INGREDIENTS[m].short).join(' + ')}`, infoX, r.y + 78);
      }
    } else if (status === 'invalid') {
      fillStrokeRoundRect(ctx, infoX, r.y + 18, 128, 26, 8, PALETTE.chili, PALETTE.ink, 1.5);
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 12px ${FONT_UI}`;
      ctx.textAlign = 'center';
      ctx.fillText('SALAH RAKIT!', infoX + 64, r.y + 32);

      ctx.textAlign = 'left';
      ctx.fillStyle = PALETTE.chiliDark;
      ctx.font = `800 14px ${FONT_UI}`;
      ctx.fillText('Klik piring lalu klik', infoX, r.y + 72);
      ctx.fillText('BUANG di Tempat Sampah', infoX, r.y + 94);
    }
  }

  // --- PANEL TANGAN & KARTU RESEP MINI ---
  const hp = LAYOUT.handPanel;
  fillStrokeRoundRect(ctx, hp.x, hp.y, hp.w, hp.h, 14, PALETTE.creamWarm, PALETTE.woodDark, 2.2);

  // Kiri panel: Sedang dipegang
  fillStrokeRoundRect(ctx, hp.x + 10, hp.y + 10, 122, hp.h - 20, 10, PALETTE.cream, PALETTE.woodMid, 1.8);
  ctx.fillStyle = PALETTE.inkSoft;
  ctx.font = `800 11px ${FONT_UI}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DI TANGAN', hp.x + 71, hp.y + 24);

  const hand = state.kitchen.hand;
  if (!hand) {
    ctx.fillStyle = 'rgba(92, 70, 55, 0.55)';
    ctx.font = `700 13px ${FONT_UI}`;
    ctx.fillText('Kosong', hp.x + 71, hp.y + 74);
    ctx.font = `700 11px ${FONT_UI}`;
    ctx.fillText('Klik bahan', hp.x + 71, hp.y + 104);
  } else if (hand.kind === 'item') {
    drawIngredientIcon(ctx, hand.id, hp.x + 71, hp.y + 68, 28);
    ctx.fillStyle = PALETTE.ink;
    ctx.font = `900 13px ${FONT_UI}`;
    ctx.fillText(INGREDIENTS[hand.id]?.short || hand.id, hp.x + 71, hp.y + 114);
  } else if (hand.kind === 'dish') {
    drawFinishedDish(ctx, hand.recipeId, hp.x + 71, hp.y + 68, 30);
    ctx.fillStyle = PALETTE.leafDark;
    ctx.font = `900 12px ${FONT_UI}`;
    ctx.fillText(RECIPE_MAP[hand.recipeId]?.short || 'Hidangan', hp.x + 71, hp.y + 114);
  } else {
    drawIngredientIcon(ctx, 'gosong', hp.x + 71, hp.y + 68, 26);
    ctx.fillStyle = PALETTE.chiliDark;
    ctx.font = `900 12px ${FONT_UI}`;
    ctx.fillText('Buang!', hp.x + 71, hp.y + 114);
  }

  // Kanan panel: Panduan Cepat 4 Resep (hanya ikon!)
  const rx = hp.x + 144;
  ctx.fillStyle = PALETTE.ink;
  ctx.font = `900 11px ${FONT_UI}`;
  ctx.textAlign = 'left';
  ctx.fillText('RESEP CEPAT  (1-4 + SPASI)', rx, hp.y + 20);

  for (let i = 0; i < RECIPES.length; i++) {
    const rec = RECIPES[i];
    const ry = hp.y + 42 + i * 26;
    drawFinishedDish(ctx, rec.id, rx + 12, ry, 11);
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.font = `800 11px ${FONT_UI}`;
    ctx.fillText('=', rx + 28, ry + 1);
    for (let k = 0; k < rec.ingredients.length; k++) {
      drawIngredientIcon(ctx, rec.ingredients[k], rx + 52 + k * 34, ry, 11);
      if (k < rec.ingredients.length - 1) {
        ctx.fillStyle = PALETTE.woodMid;
        ctx.font = `800 11px ${FONT_UI}`;
        ctx.fillText('+', rx + 65 + k * 34, ry + 1);
      }
    }
  }
}

// =========================================================================
// MEJA COUNTER BAHAN (8 KOTAK DI BAWAH)
// =========================================================================

function drawCounterBins(ctx, state) {
  const hover = state.pointer.hover;
  const heldItem = state.kitchen.hand?.kind === 'item' ? state.kitchen.hand.id : null;

  const badgeColors = {
    wajan: { bg: PALETTE.terracotta, label: '1 WAJAN' },
    panggangan: { bg: '#b8531f', label: '2 BAKAR' },
    talenan: { bg: PALETTE.leaf, label: '3 POTONG' },
    direct: { bg: PALETTE.turmericDark, label: 'LANGSUNG' },
  };

  for (let i = 0; i < COUNTER_ITEMS.length; i++) {
    const id = COUNTER_ITEMS[i];
    const ing = INGREDIENTS[id];
    const r = getCounterBinRect(i);
    const isHov = hover?.type === 'counter' && hover.index === i;
    const isHeld = heldItem === id;

    // Wadah enamel / baki bahan
    fillStrokeRoundRect(
      ctx,
      r.x,
      r.y,
      r.w,
      r.h,
      12,
      isHeld ? '#fff4d2' : isHov ? '#fdf7ec' : PALETTE.cream,
      isHeld ? PALETTE.turmeric : isHov ? PALETTE.terracotta : PALETTE.woodMid,
      isHeld || isHov ? 3.5 : 2
    );

    // Garis dalam baki
    fillStrokeRoundRect(ctx, r.x + 8, r.y + 8, r.w - 16, 74, 8, PALETTE.creamWarm, PALETTE.creamDeep, 1.5);

    // Ikon bahan besar & jelas
    drawIngredientIcon(ctx, id, r.x + r.w / 2, r.y + 45, 29);

    // Nama bahan Indonesia
    ctx.fillStyle = PALETTE.ink;
    ctx.font = `900 15px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ing.label, r.x + r.w / 2, r.y + 96);

    // Tag stasiun tujuan (warna-kode)
    const tag = badgeColors[ing.station || 'direct'];
    fillStrokeRoundRect(ctx, r.x + 16, r.y + 109, r.w - 32, 17, 6, tag.bg, null);
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 10px ${FONT_UI}`;
    ctx.fillText(tag.label, r.x + r.w / 2, r.y + 118);
  }
}

// =========================================================================
// PARTIKEL, PIRING MELUNCUR, POPUP SKOR, DAN ITEM DI KURSOR
// =========================================================================

function drawEffects(ctx, state) {
  // Partikel uap, asap, percikan potongan
  for (const p of state.particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.save();
    if (p.kind === 'steam') {
      ctx.fillStyle = `rgba(255, 252, 244, ${alpha * 0.65})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1.25 - alpha * 0.4), 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'smoke') {
      ctx.fillStyle = `rgba(60, 50, 44, ${alpha * 0.7})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1.3 - alpha * 0.3), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = p.color || PALETTE.turmericBright;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Animasi piring meluncur ke pelanggan
  for (const f of state.flyingDishes) {
    const t = Math.max(0, Math.min(1, f.t));
    const ease = 1 - Math.pow(1 - t, 3);
    const x = f.fromX + (f.toX - f.fromX) * ease;
    const y = f.fromY + (f.toY - f.fromY) * ease - Math.sin(t * Math.PI) * 44;
    const scale = 1 - t * 0.25;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    drawFinishedDish(ctx, f.recipeId, 0, 0, 36);
    ctx.restore();
  }

  // Popup skor & pesan umpan balik
  for (const pop of state.popups) {
    const alpha = Math.min(1, (pop.life / pop.maxLife) * 1.6);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `900 18px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(pop.text).width + 24;
    fillStrokeRoundRect(ctx, pop.x - tw / 2, pop.y - 16, tw, 32, 10, PALETTE.woodDeep, pop.color || PALETTE.turmericBright, 2);
    ctx.fillStyle = pop.color || PALETTE.turmericBright;
    ctx.fillText(pop.text, pop.x, pop.y + 1);
    ctx.restore();
  }

  // Toast petunjuk singkat di tengah bawah meja masak
  if (state.toast && state.toast.life > 0) {
    const alpha = Math.min(1, state.toast.life * 2);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `800 14px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(state.toast.text).width + 28;
    fillStrokeRoundRect(ctx, WIDTH / 2 - tw / 2, 398, tw, 28, 9, PALETTE.woodDeep, PALETTE.turmericBright, 2);
    ctx.fillStyle = PALETTE.cream;
    ctx.fillText(state.toast.text, WIDTH / 2, 412);
    ctx.restore();
  }

  // Item yang sedang dipegang mengikuti kursor secara halus
  if (state.mode === 'playing' && state.kitchen.hand) {
    const { x, y } = state.pointer;
    ctx.save();
    ctx.translate(x + 20, y - 16);
    ctx.fillStyle = 'rgba(42, 29, 21, 0.25)';
    ctx.beginPath();
    ctx.ellipse(3, 18, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (state.kitchen.hand.kind === 'item') {
      drawIngredientIcon(ctx, state.kitchen.hand.id, 0, 0, 22);
    } else if (state.kitchen.hand.kind === 'dish') {
      drawFinishedDish(ctx, state.kitchen.hand.recipeId, 0, 0, 26);
    } else {
      drawIngredientIcon(ctx, 'gosong', 0, 0, 20);
    }
    ctx.restore();
  }
}

// =========================================================================
// LAYAR MULAI (START) & LAYAR HASIL (END)
// =========================================================================

function drawStartOverlay(ctx, state) {
  ctx.fillStyle = 'rgba(35, 22, 13, 0.56)';
  ctx.fillRect(0, 62, WIDTH, HEIGHT - 62);

  // Kartu judul warung hangat di tengah
  const cx = WIDTH / 2;
  fillStrokeRoundRect(ctx, cx - 350, 118, 700, 476, 20, PALETTE.cream, PALETTE.woodDeep, 5);
  // Header pita terakota
  fillStrokeRoundRect(ctx, cx - 310, 136, 620, 76, 14, PALETTE.terracotta, PALETTE.terracottaDark, 3);

  ctx.fillStyle = PALETTE.cream;
  ctx.font = `900 40px ${FONT_UI}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('WARUNG RUSH', cx, 168);

  ctx.fillStyle = PALETTE.turmericBright;
  ctx.font = `800 15px ${FONT_UI}`;
  ctx.fillText('DAPUR KAKI LIMA — WARUNG BU SARI', cx, 198);

  // 4 Kartu Menu Ikonis
  ctx.fillStyle = PALETTE.ink;
  ctx.font = `900 16px ${FONT_UI}`;
  ctx.fillText('4 HIDANGAN KHAS YANG HARUS KAMU SAJIKAN', cx, 240);

  for (let i = 0; i < RECIPES.length; i++) {
    const rec = RECIPES[i];
    const rx = cx - 312 + i * 160;
    const ry = 262;
    fillStrokeRoundRect(ctx, rx, ry, 144, 142, 12, PALETTE.creamWarm, PALETTE.woodMid, 2);
    drawFinishedDish(ctx, rec.id, rx + 72, ry + 48, 34);
    ctx.fillStyle = PALETTE.ink;
    ctx.font = `900 14px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.fillText(rec.name, rx + 72, ry + 95);

    // Ikon bahan mini
    const step = 28;
    const startX = rx + 72 - ((rec.ingredients.length - 1) * step) / 2;
    for (let k = 0; k < rec.ingredients.length; k++) {
      drawIngredientIcon(ctx, rec.ingredients[k], startX + k * step, ry + 122, 11);
    }
  }

  // Ringkasan alur singkat (3 langkah visual)
  fillStrokeRoundRect(ctx, cx - 312, 420, 624, 58, 12, PALETTE.leafSoft, PALETTE.leaf, 2);
  ctx.fillStyle = PALETTE.leafDark;
  ctx.font = `800 14px ${FONT_UI}`;
  ctx.textAlign = 'center';
  ctx.fillText(
    '1. Ambil bahan di meja   •   2. Olah di stasiun (1-4)   •   3. Rakit di piring & klik pelanggan!',
    cx,
    442
  );
  ctx.fillStyle = PALETTE.inkSoft;
  ctx.font = `700 13px ${FONT_UI}`;
  ctx.fillText(
    'Shift 3 menit • Angkat masakan sebelum gosong • Spasi untuk aksi cepat',
    cx,
    464
  );

  // Tombol MULAI SHIFT
  const btn = LAYOUT.startBtn;
  const hov = state.pointer.hover?.type === 'start_btn';
  fillStrokeRoundRect(
    ctx,
    btn.x,
    btn.y,
    btn.w,
    btn.h,
    14,
    hov ? PALETTE.leafBright : PALETTE.leaf,
    PALETTE.woodDeep,
    3.5
  );
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 24px ${FONT_UI}`;
  ctx.fillText('MULAI SHIFT', btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);
}

function drawEndOverlay(ctx, state) {
  ctx.fillStyle = 'rgba(35, 22, 13, 0.64)';
  ctx.fillRect(0, 62, WIDTH, HEIGHT - 62);

  const cx = WIDTH / 2;
  const won = state.endReason !== 'reputation_empty';

  fillStrokeRoundRect(ctx, cx - 320, 118, 640, 506, 20, PALETTE.cream, PALETTE.woodDeep, 5);
  fillStrokeRoundRect(
    ctx,
    cx - 280,
    138,
    560,
    72,
    14,
    won ? PALETTE.leaf : PALETTE.terracotta,
    PALETTE.woodDeep,
    3
  );

  ctx.fillStyle = '#ffffff';
  ctx.font = `900 34px ${FONT_UI}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(won ? 'SHIFT SELESAI!' : 'WARUNG TUTUP!', cx, 166);

  ctx.fillStyle = PALETTE.turmericBright;
  ctx.font = `800 14px ${FONT_UI}`;
  ctx.fillText(
    won ? 'Kerja mantap di Warung Bu Sari!' : 'Reputasi habis — pelanggan kecewa',
    cx,
    194
  );

  // Bintang reputasi akhir
  for (let i = 0; i < MAX_REPUTATION; i++) {
    drawStar(
      ctx,
      cx - 88 + i * 44,
      244,
      17,
      i < state.reputation ? PALETTE.turmericBright : '#ccbba4',
      PALETTE.ink
    );
  }

  // 4 kotak statistik hasil
  const stats = [
    { label: 'TOTAL SKOR', value: formatNumber(state.score), accent: PALETTE.terracotta },
    { label: 'KOIN DIDAPAT', value: `${state.coins} koin`, accent: PALETTE.turmericDark },
    { label: 'HIDANGAN TERSAJI', value: `${state.served} porsi`, accent: PALETTE.leaf },
    { label: 'KOMBO TERBAIK', value: `${Math.max(1, state.bestCombo)}x`, accent: PALETTE.woodDark },
  ];

  for (let i = 0; i < stats.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = cx - 266 + col * 276;
    const sy = 282 + row * 116;
    fillStrokeRoundRect(ctx, sx, sy, 256, 98, 14, PALETTE.creamWarm, PALETTE.woodMid, 2.2);
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.font = `800 13px ${FONT_UI}`;
    ctx.textAlign = 'center';
    ctx.fillText(stats[i].label, sx + 128, sy + 30);

    ctx.fillStyle = stats[i].accent;
    ctx.font = `900 30px ${FONT_UI}`;
    ctx.fillText(stats[i].value, sx + 128, sy + 66);
  }

  // Tombol MAIN LAGI
  const btn = LAYOUT.replayBtn;
  const hov = state.pointer.hover?.type === 'replay_btn';
  fillStrokeRoundRect(
    ctx,
    btn.x,
    btn.y,
    btn.w,
    btn.h,
    14,
    hov ? PALETTE.terracottaLight : PALETTE.terracotta,
    PALETTE.woodDeep,
    3.5
  );
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 24px ${FONT_UI}`;
  ctx.fillText('MAIN LAGI', btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);
}

// =========================================================================
// FUNGSI RENDER UTAMA
// =========================================================================

export function renderGame(ctx, state) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  drawBackground(ctx, state);
  drawOrdersBoard(ctx, state);
  drawStations(ctx, state);
  drawPlatesAndHand(ctx, state);
  drawCounterBins(ctx, state);
  drawAwningAndHud(ctx, state);
  drawEffects(ctx, state);

  if (state.mode === 'start') {
    drawStartOverlay(ctx, state);
  } else if (state.mode === 'ended') {
    drawEndOverlay(ctx, state);
  }
}
