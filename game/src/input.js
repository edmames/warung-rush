// Penanganan input mouse (klik & hover) serta keyboard (1-4, Spasi, Enter, M).

import {
  HEIGHT,
  LAYOUT,
  STATION_ORDER,
  WIDTH,
  getCounterBinRect,
} from './config.js';
import { COUNTER_ITEMS } from './recipes.js';

function hitRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function hitTest(x, y, mode) {
  if (hitRect(x, y, LAYOUT.muteBtn)) {
    return { type: 'mute' };
  }

  if (mode === 'start') {
    if (hitRect(x, y, LAYOUT.startBtn)) return { type: 'start_btn' };
    return null;
  }

  if (mode === 'ended') {
    if (hitRect(x, y, LAYOUT.replayBtn)) return { type: 'replay_btn' };
    return null;
  }

  // Kartu pesanan
  for (let i = 0; i < LAYOUT.orders.length; i++) {
    if (hitRect(x, y, LAYOUT.orders[i])) {
      return { type: 'order', index: i };
    }
  }

  // 4 stasiun masak
  for (const id of STATION_ORDER) {
    if (hitRect(x, y, LAYOUT.stations[id])) {
      return { type: 'station', id };
    }
  }

  // Tempat sampah
  if (hitRect(x, y, LAYOUT.trash)) {
    return { type: 'trash' };
  }

  // 2 piring rakit
  for (let i = 0; i < LAYOUT.plates.length; i++) {
    if (hitRect(x, y, LAYOUT.plates[i])) {
      return { type: 'plate', index: i };
    }
  }

  // 8 kotak bahan di meja counter
  for (let i = 0; i < COUNTER_ITEMS.length; i++) {
    if (hitRect(x, y, getCounterBinRect(i))) {
      return { type: 'counter', itemId: COUNTER_ITEMS[i], index: i };
    }
  }

  return null;
}

export function attachInput(canvas, handlers) {
  const pointer = { x: WIDTH / 2, y: HEIGHT / 2, hover: null };

  function toCanvasCoords(ev) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    return {
      x: (ev.clientX - rect.left) * scaleX,
      y: (ev.clientY - rect.top) * scaleY,
    };
  }

  canvas.addEventListener('mousemove', (ev) => {
    const pt = toCanvasCoords(ev);
    pointer.x = pt.x;
    pointer.y = pt.y;
    pointer.hover = hitTest(pt.x, pt.y, handlers.getMode());
    canvas.style.cursor = pointer.hover ? 'pointer' : 'default';
  });

  canvas.addEventListener('mousedown', (ev) => {
    if (ev.button !== 0) return;
    const pt = toCanvasCoords(ev);
    pointer.x = pt.x;
    pointer.y = pt.y;
    const hit = hitTest(pt.x, pt.y, handlers.getMode());
    pointer.hover = hit;
    if (hit) handlers.onHit(hit, pt);
  });

  window.addEventListener('keydown', (ev) => {
    if (ev.repeat) return;
    const key = ev.key;
    if (key === '1' || key === '2' || key === '3' || key === '4') {
      ev.preventDefault();
      handlers.onStationKey(STATION_ORDER[Number(key) - 1]);
      return;
    }
    if (key === ' ' || ev.code === 'Space') {
      ev.preventDefault();
      handlers.onSpaceKey();
      return;
    }
    if (key === 'Enter') {
      ev.preventDefault();
      handlers.onEnterKey();
      return;
    }
    if (key === 'm' || key === 'M') {
      handlers.onMuteKey();
    }
  });

  return pointer;
}
