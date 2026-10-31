import * as Tone from 'tone';

let synth: Tone.PolySynth | null = null;
let masterVolume: Tone.Volume | null = null;

export async function initAudio(mode: 'acoustic' | 'electric' = 'acoustic') {
  if (Tone.context.state !== 'running') {
    await Tone.start();
  }
  
  synth?.dispose();
  masterVolume?.dispose();

  masterVolume = new Tone.Volume(0).toDestination();
  synth = new Tone.PolySynth(Tone.Synth);

  if (mode === 'electric') {
    const dist = new Tone.Distortion(0.6);
    const delay = new Tone.FeedbackDelay('8n', 0.25);
    synth.chain(dist, delay, masterVolume);
  } else {
    synth.connect(masterVolume);
  }
}

export function setMasterVolume(volPercent: number) {
  if (!masterVolume) return;
  if (volPercent === 0) {
    masterVolume.volume.value = -Infinity;
  } else {
    const db = 40 * Math.log10(volPercent / 100);
    masterVolume.volume.value = Math.max(-40, Math.min(0, db));
  }
}

export const play = async (notes: string[], dur = '2n') => {
  if (Tone.context.state !== 'running') {
    await Tone.start();
  }
  if (!synth) {
    await initAudio('acoustic');
  }
  synth?.triggerAttackRelease(notes, dur);
};

// Cascading strum effect from low string to high string
export const strum = async (notes: string[], dur = '2n') => {
  if (Tone.context.state !== 'running') {
    await Tone.start();
  }
  if (!synth) {
    await initAudio('acoustic');
  }
  if (!synth || notes.length === 0) return;

  notes.forEach((note, index) => {
    setTimeout(() => {
      synth?.triggerAttackRelease(note, dur);
    }, index * 45); // 45ms stagger between strings
  });
};