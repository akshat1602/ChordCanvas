import * as Tone from 'tone';

let synth: Tone.PolySynth | null = null;
let effects: Tone.ToneAudioNode[] = [];

export async function initAudio(mode: 'acoustic' | 'electric') {
  await Tone.start(); // Must run after a user gesture

  // Clean up previous instances to prevent memory leaks and stacked audio
  synth?.dispose();
  effects.forEach(fx => fx.dispose());
  effects = [];

  if (mode === 'electric') {
    // Electric: Sawtooth wave for a grittier base tone
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 1.2 }
    });

    // Amplifier lead tone FX
    const dist = new Tone.Distortion(0.6);
    const delay = new Tone.FeedbackDelay('8n', 0.25);
    effects = [dist, delay];

    synth.chain(dist, delay, Tone.getDestination());
  } else {
    // Acoustic: Clean, resonant string synthesis
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.005, decay: 2, sustain: 0.1, release: 2.5 }
    });

    synth.toDestination();
  }
}

export const play = (notes: string[], dur = '2n') => synth?.triggerAttackRelease(notes, dur);

export function setGlobalVolume(db: number) {
  // Ramps to the new volume over 0.1 seconds to prevent audio artifacts
  Tone.getDestination().volume.rampTo(db, 0.1); 
}