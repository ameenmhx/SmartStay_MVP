/**
 * soundEffects.js
 * Web Audio API Notification Sound Helper for SmartStay
 * Generates a pleasant, 2-tone luxury hotel chime (C5 -> E5) using native Web Audio API.
 * Handles browser autoplay restrictions gracefully.
 */

let audioCtx = null;
let isAudioEnabledState = localStorage.getItem('smartstay_audio_enabled') !== 'false';
const stateListeners = new Set();

let alarmIntervalId = null;
let alarmStopTimeoutId = null;

/**
 * Stop any active repeating 5-second notification alarm
 */
export const stopNotificationSound = () => {
  if (alarmIntervalId !== null) {
    clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
  if (alarmStopTimeoutId !== null) {
    clearTimeout(alarmStopTimeoutId);
    alarmStopTimeoutId = null;
  }
};

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
  } else {
    stopNotificationSound();
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
 * Play a single chime pulse (C5 -> E5 tone sequence)
 */
const playChimePulse = async () => {
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
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Tone 2: E5 (659.25 Hz) - Bright luxury resolution tone, slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.1);

    // Envelope for Tone 2
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.3, now + 0.115);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    // Soft overtone for crystal clarity
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(1046.5, now + 0.1); // C6 shimmer
    overtoneGain.gain.setValueAtTime(0, now + 0.1);
    overtoneGain.gain.linearRampToValueAtTime(0.05, now + 0.115);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    overtone.connect(overtoneGain);
    overtoneGain.connect(ctx.destination);

    // Start oscillators
    osc1.start(now);
    osc1.stop(now + 0.4);

    osc2.start(now + 0.1);
    osc2.stop(now + 0.55);

    overtone.start(now + 0.1);
    overtone.stop(now + 0.45);
  } catch (err) {
    console.warn('Unable to play notification sound via Web Audio API:', err);
  }
};

/**
 * Play a repeating 5-second alarm sequence (pulsing double-beep chime pattern).
 * Clears any active overlapping alarm timeouts/intervals before starting.
 * Guaranteed to stop automatically after exactly 5 seconds.
 */
export const playNotificationSound = () => {
  if (!isAudioEnabledState) return;

  // Clear existing active alarm timers immediately
  stopNotificationSound();

  const startTime = Date.now();

  // Trigger initial chime pulse immediately (non-blocking)
  playChimePulse();

  // Repeat chime pulse every 1 second (1000 ms)
  alarmIntervalId = setInterval(() => {
    // Strict safety check: stop automatically if 4.8 seconds or more have elapsed
    if (Date.now() - startTime >= 4800) {
      stopNotificationSound();
      return;
    }
    playChimePulse();
  }, 1000);

  // Stop alarm loop automatically after 5000 ms (5 seconds)
  alarmStopTimeoutId = setTimeout(() => {
    stopNotificationSound();
  }, 5000);
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
