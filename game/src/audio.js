// Sintesis efek suara prosedural WebAudio tanpa file audio eksternal.

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.noiseBuffer = null;
  }

  ensureContext() {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.noiseBuffer && this.ctx) {
      const length = Math.floor(this.ctx.sampleRate * 0.6);
      const buf = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buf;
    }
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, dur, type = 'triangle', gainVal = 0.14, delay = 0, endFreq = null) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), t0 + dur);
    }
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(gainVal, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  noise(dur, filterFreq, q = 1.2, gainVal = 0.14, delay = 0, filterType = 'bandpass') {
    const ctx = this.ensureContext();
    if (!ctx || !this.noiseBuffer) return;
    const t0 = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, t0);
    filter.Q.setValueAtTime(q, t0);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.linearRampToValueAtTime(gainVal, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  play(name) {
    if (this.muted) return;
    switch (name) {
      case 'click':
        this.tone(420, 0.055, 'triangle', 0.09, 0, 280);
        break;
      case 'pickup':
        this.tone(480, 0.075, 'sine', 0.13, 0, 680);
        break;
      case 'plate':
        // Denting piring enamel ringan
        this.tone(860, 0.09, 'sine', 0.11, 0, 740);
        this.tone(1320, 0.07, 'triangle', 0.06, 0.015, 1180);
        break;
      case 'chop':
        // Potongan pisau di talenan kayu ("tak-tak!")
        this.noise(0.05, 1200, 1.5, 0.2, 0, 'bandpass');
        this.tone(240, 0.05, 'triangle', 0.14, 0, 110);
        this.noise(0.05, 1450, 1.5, 0.18, 0.07, 'bandpass');
        this.tone(280, 0.045, 'triangle', 0.12, 0.07, 120);
        break;
      case 'sizzle':
        // Bunyi "cess!" wajan panas
        this.noise(0.42, 3400, 0.7, 0.22, 0, 'highpass');
        this.noise(0.32, 1800, 1.2, 0.12, 0.05, 'bandpass');
        break;
      case 'grill':
        // Desis panggangan sate di atas bara
        this.noise(0.36, 2200, 0.9, 0.18, 0, 'bandpass');
        this.tone(140, 0.12, 'sawtooth', 0.04, 0, 90);
        break;
      case 'pour':
        // Tuang es teh ke gelas
        this.tone(360, 0.12, 'sine', 0.1, 0, 620);
        this.tone(540, 0.11, 'sine', 0.09, 0.08, 860);
        this.noise(0.18, 2800, 2.0, 0.08, 0.02, 'bandpass');
        break;
      case 'cooked':
        // Lonceng kecil masakan matang
        this.tone(784, 0.12, 'sine', 0.14, 0);
        this.tone(1046, 0.18, 'sine', 0.15, 0.09);
        break;
      case 'ready':
        // Hidangan selesai dirakit di piring
        this.tone(587, 0.1, 'triangle', 0.13, 0);
        this.tone(880, 0.14, 'triangle', 0.14, 0.07);
        break;
      case 'serve':
        // Denting koin + kepuasan pelanggan
        this.tone(659, 0.09, 'triangle', 0.14, 0);
        this.tone(880, 0.1, 'triangle', 0.15, 0.07);
        this.tone(1318, 0.22, 'sine', 0.16, 0.14);
        break;
      case 'trash':
        this.tone(220, 0.1, 'sawtooth', 0.09, 0, 95);
        this.noise(0.08, 700, 1.0, 0.1, 0, 'lowpass');
        break;
      case 'error':
        this.tone(210, 0.12, 'square', 0.08, 0, 150);
        break;
      case 'burn':
        this.tone(260, 0.18, 'sawtooth', 0.11, 0, 140);
        this.tone(190, 0.22, 'sawtooth', 0.11, 0.16, 110);
        break;
      case 'leave':
        this.tone(330, 0.14, 'triangle', 0.12, 0, 250);
        this.tone(240, 0.22, 'triangle', 0.12, 0.12, 160);
        break;
      case 'rush':
        // Lonceng pengumuman Rush Hour
        this.tone(740, 0.12, 'triangle', 0.16, 0);
        this.tone(988, 0.12, 'triangle', 0.16, 0.11);
        this.tone(740, 0.12, 'triangle', 0.14, 0.22);
        this.tone(1175, 0.28, 'sine', 0.18, 0.33);
        break;
      case 'gameover':
        this.tone(440, 0.2, 'triangle', 0.14, 0, 392);
        this.tone(349, 0.22, 'triangle', 0.14, 0.18, 311);
        this.tone(261, 0.4, 'triangle', 0.16, 0.38, 220);
        break;
      case 'win':
        this.tone(523, 0.12, 'triangle', 0.14, 0);
        this.tone(659, 0.12, 'triangle', 0.14, 0.1);
        this.tone(784, 0.14, 'triangle', 0.15, 0.2);
        this.tone(1046, 0.32, 'sine', 0.18, 0.32);
        break;
      default:
        break;
    }
  }
}

export const sound = new SoundEngine();
