let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  void ctx.resume();
  return ctx;
}

function beep(freq: number, at: number, duration: number, gain = 0.16) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const vol = ac.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  vol.gain.setValueAtTime(0.0001, ac.currentTime + at);
  vol.gain.exponentialRampToValueAtTime(gain, ac.currentTime + at + 0.02);
  vol.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + duration);
  osc.connect(vol).connect(ac.destination);
  osc.start(ac.currentTime + at);
  osc.stop(ac.currentTime + at + duration + 0.05);
}

/** Short tick used while names are rolling. */
export function playTick() {
  beep(880, 0, 0.04, 0.05);
}

/** Fanfare when the winner is revealed. */
export function playWin() {
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => beep(f, i * 0.13, 0.3));
}
