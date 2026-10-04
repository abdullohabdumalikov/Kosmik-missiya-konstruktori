// High-fidelity Satisfying Web Audio API Synthesizer (SimpleRockets 2 Inspired)
// Warm, pleasant, analog-filtered acoustic and space-ambient acoustics

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    
    // Engine continuous rumble nodes
    this.engineNoiseNode = null;
    this.engineFilterNode = null;
    this.engineGainNode = null;
    this.subBassOsc1 = null;
    this.subBassOsc2 = null;

    // Ambient space music nodes
    this.ambientNodes = [];
    this.ambientGain = null;

    this.sfxVolume = 0.75;
    this.musicVolume = 0.45;
    this.muted = false;
    this.isEngineRunning = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.startAmbientSpaceDrone();
    } catch (e) {
      console.warn('Web Audio not supported or failed to init:', e);
    }
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1, this.ctx.currentTime);
    }
    return this.muted;
  }

  // --- 1. PLEASANT UI & DOCKING SOUNDS ---

  playClick() {
    this.ensureContext();
    if (!this.ctx) return;
    // Pleasant dampened tactile click (soft 420Hz tap with warm low-pass decay)
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.035);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);

    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.038);
  }

  playEquip() {
    this.ensureContext();
    if (!this.ctx) return;
    // SimpleRockets 2 Style: Satisfying metallic dock clack (thud + latch click)
    const t = this.ctx.currentTime;

    // Sub thump
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(130, t);
    subOsc.frequency.exponentialRampToValueAtTime(50, t + 0.07);
    subGain.gain.setValueAtTime(0.25, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(t);
    subOsc.stop(t + 0.08);

    // Metallic ring
    const ringOsc = this.ctx.createOscillator();
    const ringFilter = this.ctx.createBiquadFilter();
    const ringGain = this.ctx.createGain();

    ringOsc.type = 'triangle';
    ringOsc.frequency.setValueAtTime(640, t);
    ringOsc.frequency.exponentialRampToValueAtTime(820, t + 0.04);

    ringFilter.type = 'bandpass';
    ringFilter.frequency.setValueAtTime(750, t);
    ringFilter.Q.setValueAtTime(4, t);

    ringGain.gain.setValueAtTime(0.12, t);
    ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    ringOsc.connect(ringFilter);
    ringFilter.connect(ringGain);
    ringGain.connect(this.sfxGain);

    ringOsc.start(t);
    ringOsc.stop(t + 0.1);
  }

  playStageSeparation() {
    this.ensureContext();
    if (!this.ctx) return;
    // SimpleRockets 2 Decoupler: Deep pneumatic thud + resonant air expansion
    const t = this.ctx.currentTime;

    // Low sub thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.28);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.32);

    // Warm air whoosh
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.25);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, t);
    filter.frequency.exponentialRampToValueAtTime(90, t + 0.25);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(t);
  }

  playCountdownBeep(isFinal = false) {
    this.ensureContext();
    if (!this.ctx) return;
    // Pleasant radar sonar blip (pure sine, zero harsh buzz)
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const freq = isFinal ? 1046.50 : 783.99; // C6 or G5
    const duration = isFinal ? 0.24 : 0.08;

    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(isFinal ? 0.22 : 0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  playIgnitionBoom() {
    this.ensureContext();
    if (!this.ctx) return;
    // Cinematic deep sub-bass liftoff rumble
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 1.2);

    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 1.35);
  }

  // --- 2. PLEASANT CONTINUOUS ROCKET ENGINE RUMBLE (NO HARSH SAWTOOTH!) ---

  startEngineRoar() {
    this.ensureContext();
    if (!this.ctx || this.isEngineRunning) return;
    this.isEngineRunning = true;
    const t = this.ctx.currentTime;

    // 1. Soft Brownian Noise generator for deep turbulent combustion
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.03 * white) / 1.03;
      lastOut = output[i];
      output[i] *= 2.6; // warm level
    }

    this.engineNoiseNode = this.ctx.createBufferSource();
    this.engineNoiseNode.buffer = noiseBuffer;
    this.engineNoiseNode.loop = true;

    // Resonant lowpass filter to remove any harsh hiss, keeping only pleasant deep roar
    this.engineFilterNode = this.ctx.createBiquadFilter();
    this.engineFilterNode.type = 'lowpass';
    this.engineFilterNode.frequency.setValueAtTime(260, t);
    this.engineFilterNode.Q.setValueAtTime(1.8, t);

    this.engineGainNode = this.ctx.createGain();
    this.engineGainNode.gain.setValueAtTime(0.01, t);
    this.engineGainNode.gain.linearRampToValueAtTime(0.32, t + 0.6);

    // 2. Dual warm sub-bass sine oscillators (pure warm low-end, zero sawtooth buzz!)
    this.subBassOsc1 = this.ctx.createOscillator();
    this.subBassOsc1.type = 'sine';
    this.subBassOsc1.frequency.setValueAtTime(42, t);

    this.subBassOsc2 = this.ctx.createOscillator();
    this.subBassOsc2.type = 'sine';
    this.subBassOsc2.frequency.setValueAtTime(64, t);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.18, t);

    this.subBassOsc1.connect(subGain);
    this.subBassOsc2.connect(subGain);
    subGain.connect(this.engineGainNode);

    this.engineNoiseNode.connect(this.engineFilterNode);
    this.engineFilterNode.connect(this.engineGainNode);

    this.engineGainNode.connect(this.sfxGain);

    this.engineNoiseNode.start(t);
    this.subBassOsc1.start(t);
    this.subBassOsc2.start(t);
  }

  updateEngineRoar(throttle, isBoosting) {
    if (!this.ctx || !this.engineGainNode || !this.engineFilterNode) return;
    const t = this.ctx.currentTime;
    const targetGain = 0.12 + throttle * 0.28 + (isBoosting ? 0.18 : 0);
    const targetFreq = 220 + throttle * 240 + (isBoosting ? 180 : 0);
    this.engineGainNode.gain.setTargetAtTime(targetGain, t, 0.08);
    this.engineFilterNode.frequency.setTargetAtTime(targetFreq, t, 0.08);
  }

  stopEngineRoar() {
    if (!this.isEngineRunning || !this.ctx) return;
    this.isEngineRunning = false;
    const t = this.ctx.currentTime;
    if (this.engineGainNode) {
      this.engineGainNode.gain.linearRampToValueAtTime(0.001, t + 0.25);
      setTimeout(() => {
        try {
          if (this.engineNoiseNode) this.engineNoiseNode.stop();
          if (this.subBassOsc1) this.subBassOsc1.stop();
          if (this.subBassOsc2) this.subBassOsc2.stop();
        } catch (_) {}
      }, 300);
    }
  }

  // --- 3. REWARDING & CELEBRATORY CHIMES ---

  playCoinCollect() {
    this.ensureContext();
    if (!this.ctx) return;
    // Ethereal celesta sparkle chime (warm pentatonic tones: E5, G#5, B5)
    const t = this.ctx.currentTime;
    const freqs = [659.25, 830.61, 987.77];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      gain.gain.setValueAtTime(0.14, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + idx * 0.06 + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.38);
    });
  }

  playDiscoveryFanfare() {
    this.ensureContext();
    if (!this.ctx) return;
    // Calming atmospheric space triumph chord (C Major 9th: C4, G4, B4, E5)
    const t = this.ctx.currentTime;
    const notes = [261.63, 392.00, 493.88, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);
      gain.gain.setValueAtTime(0.12, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + i * 0.08 + 0.65);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.7);
    });
  }

  playRecordTrumpet() {
    this.ensureContext();
    if (!this.ctx) return;
    // Warm triumphant synth-brass fanfare (A Major triad: A4, C#5, E5, A5)
    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.09);
      gain.gain.setValueAtTime(0.18, t + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.55);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.09);
      osc.stop(t + idx * 0.09 + 0.6);
    });
  }

  playCraftSuccess() {
    this.ensureContext();
    if (!this.ctx) return;
    // Pleasant ascending harp shimmer
    const t = this.ctx.currentTime;
    [392.00, 523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.05);
      gain.gain.setValueAtTime(0.13, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + i * 0.05 + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.42);
    });
  }

  playAsteroidHit() {
    this.ensureContext();
    if (!this.ctx) return;
    // Deep dampened hull impact thud (low-pass filtered impact, zero harsh screech)
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, t);

    gain.gain.setValueAtTime(0.38, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  playFlameout() {
    this.ensureContext();
    if (!this.ctx) return;
    // Smooth aerodynamic pressure bleed (gentle whoosh)
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.35);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.38);
  }

  playRadioChirp() {
    this.ensureContext();
    if (!this.ctx) return;
    // Genuine NASA Apollo Quindar Tone (2524Hz pure gentle blip)
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2524, t);
    gain.gain.setValueAtTime(0.045, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.055);
  }

  // --- 4. RELAXING SPACE AMBIENT DRONE (SimpleRockets 2 / Kerbal Vibe) ---

  startAmbientSpaceDrone() {
    if (!this.ctx || this.ambientGain) return;
    try {
      const t = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.05, t); // gentle background level
      this.ambientGain.connect(this.musicGain);

      // Warm soothing chord pad: A2 (110Hz), E3 (164.81Hz), C#4 (277.18Hz)
      const freqs = [110, 164.81, 277.18];
      this.ambientNodes = freqs.map((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320 + idx * 80, t);

        gain.gain.setValueAtTime(0.14 - idx * 0.03, t);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);

        osc.start(t);
        return osc;
      });
    } catch (_) {}
  }
}

export const sound = new SoundEngine();
