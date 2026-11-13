/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;
  private volume = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      if (this.ambientGain && this.ctx && this.ctx.state !== 'closed') {
        this.ambientGain.gain.setTargetAtTime(this.volume * 0.12, this.ctx.currentTime, 0.1);
      }
    } catch {
      // Safe fallback
    }
  }

  public getVolume() {
    return this.volume;
  }

  // Soft tactile pop for UI clicks
  public playClick() {
    try {
      this.initContext();
      if (!this.ctx || this.volume <= 0) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

      gain.gain.setValueAtTime(this.volume * 0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Audio error ignored safely
    }
  }

  // Harmonic node chime for memory & sequence taps
  public playNodeChime(pitchIndex = 0) {
    try {
      this.initContext();
      if (!this.ctx || this.volume <= 0) return;

      // Pentatonic scale starting at C4
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
      const freq = scale[Math.abs(pitchIndex) % scale.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(this.volume * 0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Audio error ignored safely
    }
  }

  // Harmonious Major 7th completion chord
  public playSuccess() {
    try {
      this.initContext();
      if (!this.ctx || this.volume <= 0) return;

      // C5, E5, G5, B5 arpeggio
      const notes = [523.25, 659.25, 783.99, 987.77, 1046.50];
      const now = this.ctx.currentTime;

      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        const startTime = now + i * 0.07;
        gain.gain.setValueAtTime(this.volume * 0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.65);
      });
    } catch {
      // Audio error ignored safely
    }
  }

  // Soft low-tone gentle prompt (never abrasive)
  public playSoftMistake() {
    try {
      this.initContext();
      if (!this.ctx || this.volume <= 0) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(146.83, now); // D3
      osc.frequency.linearRampToValueAtTime(130.81, now + 0.15); // C3

      gain.gain.setValueAtTime(this.volume * 0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio error ignored safely
    }
  }

  // Toggle relaxing ambient drone
  public toggleAmbient(enable: boolean) {
    try {
      this.initContext();
      if (!this.ctx) return;

      if (enable && !this.isAmbientPlaying) {
        const now = this.ctx.currentTime;

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.0001, now);
        this.ambientGain.gain.exponentialRampToValueAtTime(this.volume * 0.1, now + 1.5);
        this.ambientGain.connect(this.ctx.destination);

        // Low binaural frequencies: 108Hz and 112Hz (4Hz Theta wave relaxation)
        this.ambientOsc1 = this.ctx.createOscillator();
        this.ambientOsc1.type = 'sine';
        this.ambientOsc1.frequency.setValueAtTime(108, now);
        this.ambientOsc1.connect(this.ambientGain);

        this.ambientOsc2 = this.ctx.createOscillator();
        this.ambientOsc2.type = 'sine';
        this.ambientOsc2.frequency.setValueAtTime(112, now);
        this.ambientOsc2.connect(this.ambientGain);

        this.ambientOsc1.start(now);
        this.ambientOsc2.start(now);
        this.isAmbientPlaying = true;
      } else if (!enable && this.isAmbientPlaying) {
        if (this.ambientGain && this.ctx) {
          const now = this.ctx.currentTime;
          this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
          setTimeout(() => {
            try {
              this.ambientOsc1?.stop();
              this.ambientOsc2?.stop();
              this.ambientOsc1?.disconnect();
              this.ambientOsc2?.disconnect();
              this.ambientGain?.disconnect();
              this.ambientOsc1 = null;
              this.ambientOsc2 = null;
              this.ambientGain = null;
              this.isAmbientPlaying = false;
            } catch {
              // Safe cleanup
            }
          }, 550);
        }
      }
    } catch {
      // Audio error ignored safely
    }
  }

  // Device haptic vibration
  public triggerHaptic(duration = 20) {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(duration);
      }
    } catch {
      // Ignored
    }
  }
}

export const soundEngine = new SoundEngine();
