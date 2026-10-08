type Sound = 'beat' | 'click' | 'boom' | 'timeout' | 'clear';
class AudioFeedback {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  unlock() {
    try {
      const Audio =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Audio) return;
      this.ctx ??= new Audio();
      if (!this.master) {
        // Raise the mix while controlling peaks when several feedback sounds overlap.
        const master = this.ctx.createGain();
        const compressor = this.ctx.createDynamicsCompressor();
        master.gain.value = 1.7;
        compressor.threshold.value = -8;
        compressor.knee.value = 6;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.12;
        master.connect(compressor);
        compressor.connect(this.ctx.destination);
        this.master = master;
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => {});
    } catch {
      /* Audio is optional, including Safari user-gesture restrictions. */
    }
  }
  play(kind: Sound, enabled: boolean, mood = { heat: 0, mechanical: 0, alarm: 0 }) {
    if (!enabled || !this.ctx || !this.master || this.ctx.state !== 'running') return;
    try {
      const c = this.ctx;
      const t = c.currentTime;
      const output = this.master;
      const tone = (freq: number, length: number, offset = 0, volume = 0.18, end = freq) => {
        const osc = c.createOscillator(),
          gain = c.createGain();
        osc.type = kind === 'click' ? 'square' : 'sine';
        osc.frequency.setValueAtTime(freq, t + offset);
        osc.frequency.exponentialRampToValueAtTime(end, t + offset + length);
        gain.gain.setValueAtTime(0.001, t + offset);
        gain.gain.linearRampToValueAtTime(volume, t + offset + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.001, t + offset + length);
        osc.connect(gain);
        gain.connect(output);
        osc.start(t + offset);
        osc.stop(t + offset + length + 0.01);
        osc.onended = () => {
          osc.disconnect();
          gain.disconnect();
        };
      };
      if (kind === 'beat') {
        // One oscillator morphs in pitch, harmonics and envelope: no competing pitched tracks.
        const { heat, mechanical, alarm } = mood;
        const strike = c.createOscillator(),
          envelope = c.createGain();
        const real = new Float32Array(12),
          imaginary = new Float32Array(12);
        imaginary[1] = 1;
        for (let harmonic = 2; harmonic < 12; harmonic++) {
          imaginary[harmonic] =
            (mechanical * (1 - alarm) * 0.3) / (harmonic * harmonic) +
            (harmonic % 2 ? (alarm * 0.34) / harmonic : 0);
        }
        strike.setPeriodicWave(c.createPeriodicWave(real, imaginary));
        const pitch = 112 + mechanical * 160 + alarm * 650;
        const length = 0.22 - mechanical * 0.1 - alarm * 0.065;
        strike.frequency.setValueAtTime(pitch, t);
        strike.frequency.exponentialRampToValueAtTime(pitch * (0.65 + alarm * 0.3), t + length);
        envelope.gain.setValueAtTime(0.001, t);
        envelope.gain.linearRampToValueAtTime(0.4 + heat * 0.1 - alarm * 0.12, t + 0.007);
        envelope.gain.exponentialRampToValueAtTime(0.001, t + length);
        strike.connect(envelope);
        envelope.connect(output);
        strike.start(t);
        strike.stop(t + length + 0.005);
        strike.onended = () => {
          strike.disconnect();
          envelope.disconnect();
        };
      }
      if (kind === 'click') tone(720, 0.07, 0, 0.16, 220);
      if (kind === 'timeout') {
        tone(340, 0.17);
        tone(230, 0.24, 0.19);
      }
      if (kind === 'clear') {
        tone(440, 0.15);
        tone(660, 0.15, 0.15);
        tone(880, 0.3, 0.3);
      }
      if (kind === 'boom') {
        tone(130, 0.7, 0, 0.35, 28);
        const buffer = c.createBuffer(1, Math.floor(c.sampleRate * 0.65), c.sampleRate),
          data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++)
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
        const noise = c.createBufferSource(),
          gain = c.createGain(),
          filter = c.createBiquadFilter();
        noise.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.value = 1400;
        gain.gain.value = 0.35;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(output);
        noise.start();
        noise.onended = () => {
          noise.disconnect();
          filter.disconnect();
          gain.disconnect();
        };
      }
    } catch {
      /* A missing audio device must not stop a round. */
    }
  }
}
export const audio = new AudioFeedback();
