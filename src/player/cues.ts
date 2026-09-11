/**
 * Short tones at the start, halfway point and end of each exercise.
 *
 * Synthesised rather than shipped as audio files so the break player has no
 * network dependency — the core loop is meant to work offline.
 */

type CueKind = 'start' | 'halfway' | 'end';

const TONES: Record<CueKind, { frequency: number; duration: number }> = {
  start: { frequency: 660, duration: 0.12 },
  halfway: { frequency: 550, duration: 0.09 },
  end: { frequency: 880, duration: 0.22 },
};

let context: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext;
  if (!Ctor) return null;
  context ??= new Ctor();
  return context;
}

export function playCue(kind: CueKind): void {
  const ctx = audioContext();
  if (!ctx) return;

  // Browsers start the context suspended until a gesture; the player only
  // calls this after the user has tapped, so resuming here is safe.
  void ctx.resume();

  const { frequency, duration } = TONES[kind];
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;

  // A short fade in and out, so the cue never clicks.
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}
