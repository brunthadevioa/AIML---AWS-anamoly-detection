let audioCtx = null;
let oscillator = null;
let gainNode = null;
let intervalId = null;
let isMuted = false;

function initAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export const buzzerService = {
  startBuzzer(frequency = 880) {
    if (isMuted) return;
    initAudioContext();
    if (!audioCtx) return;

    this.stopBuzzer(); // Clear any existing tone

    try {
      let isHigh = true;
      intervalId = setInterval(() => {
        if (isMuted) return;
        try {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(isHigh ? 880 : 587.33, audioCtx.currentTime); // A5 and D5 dual-tone alarm
          isHigh = !isHigh;

          gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

          osc.connect(gain);
          gain.connect(audioCtx.destination);

          osc.start();
          osc.stop(audioCtx.currentTime + 0.25);
        } catch (e) {
          console.warn('[Buzzer Pulse Error]', e);
        }
      }, 350);
    } catch (e) {
      console.warn('[Buzzer Error]', e);
    }
  },

  stopBuzzer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  },

  toggleMute() {
    isMuted = !isMuted;
    if (isMuted) {
      this.stopBuzzer();
    }
    return isMuted;
  },

  isMuted() {
    return isMuted;
  }
};
