import { SoundType } from '../types';

class SoundService {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize audio context on first user interaction usually, but we prep here
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error("Web Audio API not supported");
    }
  }

  private ensureContext() {
    if (!this.audioContext) return;
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public play(type: SoundType) {
    this.ensureContext();
    if (!this.audioContext) return;

    switch (type) {
      case SoundType.KEY_PRESS:
        this.playClick(1.0);
        break;
      case SoundType.SPACE:
        this.playClick(0.8, 0.05); // Lower pitch, slightly longer
        this.playMechanicalNoise(0.1);
        break;
      case SoundType.RETURN:
        this.playZip();
        this.playBell();
        break;
      case SoundType.BELL:
        this.playBell();
        break;
    }
  }

  private playClick(pitchMultiplier: number = 1.0, delay: number = 0) {
    if (!this.audioContext) return;
    const t = this.audioContext.currentTime + delay;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(200 * pitchMultiplier, t);
    osc.frequency.exponentialRampToValueAtTime(50 * pitchMultiplier, t + 0.05);
    
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.start(t);
    osc.stop(t + 0.05);

    // Add a high frequency "clack"
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2000 * pitchMultiplier, t);
    gain2.gain.setValueAtTime(0.1, t);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.03);
    
    osc2.connect(gain2);
    gain2.connect(this.audioContext.destination);
    osc2.start(t);
    osc2.stop(t + 0.03);
  }

  private playBell() {
    if (!this.audioContext) return;
    const t = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start(t);
    osc.stop(t + 1.5);
  }

  private playZip() {
    if (!this.audioContext) return;
    const t = this.audioContext.currentTime;
    // White noise burst for carriage return mechanism
    const bufferSize = this.audioContext.sampleRate * 0.3; // 300ms
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    const gain = this.audioContext.createGain();
    
    // Bandpass filter to make it sound mechanical
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 1;

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.3);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    noise.start(t);
  }

  private playMechanicalNoise(duration: number) {
     // Subtle background mechanical noise
     if (!this.audioContext) return;
  }
}

export const soundService = new SoundService();
