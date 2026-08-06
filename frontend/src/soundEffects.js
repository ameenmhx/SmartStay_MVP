/**
 * soundEffects.js
 * Web Audio API Notification Sound Helper for SmartStay
 * Generates a pleasant, 2-tone luxury hotel chime (C5 -> E5) using native Web Audio API.
 * Handles browser autoplay restrictions gracefully.
 */

let audioCtx = null;
let isAudioEnabledState = localStorage.getItem('smartstay_audio_enabled') !== 'false';
const stateListeners = new Set();

/**
 * Get or create singleton AudioContext
 */
export const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
};

/**
 * Initialize or resume AudioContext on user interaction
 */
export const initAudioContext = async () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return ctx.state === 'running';
  } catch (err) {
    console.warn('Web Audio API context initialization failed:', err);
    return false;
  }
};

/**
 * Get current audio alerts enabled state
 */
export const isAudioEnabled = () => isAudioEnabledState;

/**
 * Set audio alerts enabled state
 */
export const setAudioEnabled = (enabled) => {
  isAudioEnabledState = Boolean(enabled);
  localStorage.setItem('smartstay_audio_enabled', String(isAudioEnabledState));
  if (isAudioEnabledState) {
    initAudioContext();
  }
  stateListeners.forEach((listener) => listener(isAudioEnabledState));
};

/**
 * Toggle audio alerts enabled state
 */
export const toggleAudio = () => {
  const newState = !isAudioEnabledState;
  setAudioEnabled(newState);
  return newState;
};

/**
 * Subscribe to audio state changes
 */
export const subscribeAudioState = (callback) => {
  stateListeners.add(callback);
  return () => stateListeners.delete(callback);
};

/**
 * Play a 2-tone luxury hotel chime (C5: 523.25Hz -> E5: 659.25Hz)
 */
export const playNotificationSound = async () => {
  if (!isAudioEnabledState) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const now = ctx.currentTime;

    // Tone 1: C5 (523.25 Hz) - Pristine warm chime entry
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);

    // Envelope for Tone 1
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Tone 2: E5 (659.25 Hz) - Bright luxury resolution tone, slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.12);

    // Envelope for Tone 2
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.135);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    // Soft overtone for crystal clarity
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(1046.5, now + 0.12); // C6 shimmer
    overtoneGain.gain.setValueAtTime(0, now + 0.12);
    overtoneGain.gain.linearRampToValueAtTime(0.05, now + 0.135);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

    overtone.connect(overtoneGain);
    overtoneGain.connect(ctx.destination);

    // Start oscillators
    osc1.start(now);
    osc1.stop(now + 0.5);

    osc2.start(now + 0.12);
    osc2.stop(now + 0.9);

    overtone.start(now + 0.12);
    overtone.stop(now + 0.55);
  } catch (err) {
    console.warn('Unable to play notification sound via Web Audio API:', err);
  }
};

/**
 * Setup page-wide event listeners to unlock AudioContext on user's first interaction
 */
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    initAudioContext();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };

  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });
}
