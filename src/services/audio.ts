// Audio feedback system
class SoundEffects {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private customSoundPath: string | null = null;

  constructor() {}

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(flag: boolean) {
    this.enabled = flag;
  }

  public setCustomSoundPath(path?: string | null) {
    this.customSoundPath = path || null;
  }

  public playClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {}
  }

  public playComplete() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.12, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.22);
      });
    } catch {}
  }

  // Crisp dual-tone synthetic electronic chime (0 KB bundle footprint)
  public playSyntheticChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Harmonic dual-tone bell: A5 (880Hz) followed by E6 (1318.5Hz) with acoustic resonance
      const tones = [
        { freq: 880, start: 0, dur: 0.35, gain: 0.16 },
        { freq: 1318.51, start: 0.12, dur: 0.55, gain: 0.20 },
        { freq: 1760, start: 0.16, dur: 0.65, gain: 0.10 }
      ];

      tones.forEach(t => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(t.freq, now + t.start);

        gain.gain.setValueAtTime(t.gain, now + t.start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t.start + t.dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + t.start);
        osc.stop(now + t.start + t.dur);
      });
    } catch {}
  }

  // Plays custom user audio file if available, or falls back to synthetic chime
  public playReminderChime(overridePath?: string) {
    if (!this.enabled) return;

    const soundFile = overridePath || this.customSoundPath;
    if (soundFile) {
      try {
        const safeUrl = soundFile.startsWith('file://') ? soundFile : `file:///${soundFile.replace(/\\/g, '/')}`;
        const audio = new Audio(safeUrl);
        audio.volume = 0.95;
        const promise = audio.play();
        if (promise !== undefined) {
          promise.catch(() => {
            // If custom file was deleted or moved, gracefully fallback to synth chime
            this.playSyntheticChime();
          });
          return;
        }
      } catch {
        this.playSyntheticChime();
        return;
      }
    }

    this.playSyntheticChime();
  }
}

export const sfx = new SoundEffects();
