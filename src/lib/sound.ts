import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { useSpar } from './store';

/** Alle Sounds (Pixabay: Universfield, Dragon Studio) – gekürzt und angeglichen. */
const SOURCES = {
  kasse: require('../../assets/sounds/kasse.mp3'),
  walRuf: require('../../assets/sounds/wal-ruf.mp3'),
  walgesang: require('../../assets/sounds/walgesang.mp3'),
  atmosphaere: require('../../assets/sounds/atmosphaere.mp3'),
};

type SoundName = keyof typeof SOURCES;

const players: Partial<Record<SoundName, AudioPlayer>> = {};
let configured = false;

function setup() {
  if (configured) return;
  configured = true;
  // Stummschalter respektieren und Spotify & Co. nicht unterbrechen
  setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
}

function player(name: SoundName): AudioPlayer {
  const existing = players[name];
  if (existing) return existing;
  const created = createAudioPlayer(SOURCES[name]);
  players[name] = created;
  return created;
}

function play(name: SoundName, volume: number) {
  try {
    setup();
    const p = player(name);
    p.volume = volume;
    p.seekTo(0)
      .catch(() => {})
      .finally(() => {
        try {
          p.play();
        } catch {
          // z. B. Browser blockiert Ton vor der ersten Berührung
        }
      });
  } catch {
    // Ton ist nie wichtig genug, um die App zu stören
  }
}

/** Kurzer Effekt – nur wenn „Effekte“ an ist. */
export function playEffect(name: 'kasse' | 'walRuf') {
  if (!useSpar.getState().settings.soundEffects) return;
  play(name, name === 'kasse' ? 0.7 : 0.9);
}

/** Walgesang als Teil der Atmosphäre. */
export function playWhaleSong() {
  play('walgesang', 0.45);
}

export function startAmbience() {
  try {
    setup();
    const p = player('atmosphaere');
    p.loop = true;
    p.volume = 0.35;
    p.play();
  } catch {
    // siehe oben
  }
}

export function stopAmbience() {
  try {
    players.atmosphaere?.pause();
    players.walgesang?.pause();
  } catch {
    // siehe oben
  }
}
