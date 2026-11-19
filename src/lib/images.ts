import type { ImageSourcePropType } from 'react-native';
import type { AnimalId } from './logic';

/** Bild plus Seitenverhältnis (Breite / Höhe), damit nichts verzerrt. */
export interface Sprite {
  source: ImageSourcePropType;
  aspect: number;
}

/**
 * Wie sich ein Tier im Riff bewegt:
 * - schwimmen: Wellenbahn, dreht am Rand um; mit `tail` pendelt die Schwanzflosse
 * - gleiten: ruhig, leichtes Flügelschlagen (Rochen, Schildkröte)
 * - schwarm: Wellenbahn als Gruppe
 * - wippen: bleibt an einer Stelle und wippt (Seepferdchen, Kugelfisch)
 * - qualle: steigt und sinkt langsam, pulsiert
 * - boden: liegt am Grund und „atmet“
 * - krabbeln: bewegt sich langsam am Grund entlang
 */
export type Motion = 'schwimmen' | 'gleiten' | 'schwarm' | 'wippen' | 'qualle' | 'boden' | 'krabbeln';

export interface AnimalVisual extends Sprite {
  /** Breite im Riff, Anteil an der Riffbreite */
  size: number;
  motion: Motion;
  /** Anteil von links, an dem die Schwanzflosse ansetzt (Drehpunkt) */
  tail?: number;
}

/** Riff-Hintergrund pro Level (Sandbank … Barriereriff), 941 × 1672 */
export const riffImages: ImageSourcePropType[] = [
  require('../../assets/riff/stufe-1.jpg'),
  require('../../assets/riff/stufe-2.jpg'),
  require('../../assets/riff/stufe-3.jpg'),
  require('../../assets/riff/stufe-4.jpg'),
  require('../../assets/riff/stufe-5.jpg'),
];
export const RIFF_ASPECT = 941 / 1672;

/** Alle Tiere, freigestellt (WebP), Blick nach rechts */
export const animalImages: Record<AnimalId, AnimalVisual> = {
  clownfisch: { source: require('../../assets/tiere/clownfisch.webp'), aspect: 512 / 277, size: 0.16, motion: 'schwimmen', tail: 0.3 },
  seepferdchen: { source: require('../../assets/tiere/seepferdchen.webp'), aspect: 262 / 512, size: 0.08, motion: 'wippen' },
  schildkroete: { source: require('../../assets/tiere/meeresschildkroete.webp'), aspect: 512 / 301, size: 0.28, motion: 'gleiten' },
  doktorfisch: { source: require('../../assets/tiere/doktorfisch.webp'), aspect: 512 / 305, size: 0.17, motion: 'schwimmen', tail: 0.3 },
  kugelfisch: { source: require('../../assets/tiere/kugelfisch.webp'), aspect: 512 / 390, size: 0.15, motion: 'wippen' },
  feuerfisch: { source: require('../../assets/tiere/feuerfisch.webp'), aspect: 512 / 484, size: 0.18, motion: 'gleiten' },
  kaiserfisch: { source: require('../../assets/tiere/kaiserfisch.webp'), aspect: 512 / 426, size: 0.18, motion: 'schwimmen', tail: 0.25 },
  papageifisch: { source: require('../../assets/tiere/papageifisch.webp'), aspect: 512 / 338, size: 0.2, motion: 'schwimmen', tail: 0.3 },
  'riffbarsch-schwarm': { source: require('../../assets/tiere/riffbarsch-schwarm.webp'), aspect: 512 / 414, size: 0.22, motion: 'schwarm' },
  seestern: { source: require('../../assets/tiere/seestern.webp'), aspect: 512 / 499, size: 0.12, motion: 'boden' },
  qualle: { source: require('../../assets/tiere/qualle.webp'), aspect: 485 / 512, size: 0.13, motion: 'qualle' },
  einsiedlerkrebs: { source: require('../../assets/tiere/einsiedlerkrebs.webp'), aspect: 512 / 402, size: 0.13, motion: 'krabbeln' },
  'schwarzspitzen-riffhai': { source: require('../../assets/tiere/schwarzspitzen-riffhai.webp'), aspect: 512 / 199, size: 0.34, motion: 'schwimmen', tail: 0.33 },
  oktopus: { source: require('../../assets/tiere/oktopus.webp'), aspect: 512 / 450, size: 0.2, motion: 'boden' },
  muraene: { source: require('../../assets/tiere/muraene.webp'), aspect: 512 / 439, size: 0.2, motion: 'boden' },
  adlerrochen: { source: require('../../assets/tiere/adlerrochen.webp'), aspect: 512 / 345, size: 0.3, motion: 'gleiten' },
  engelhai: { source: require('../../assets/tiere/engelhai.webp'), aspect: 512 / 397, size: 0.26, motion: 'krabbeln' },
  hammerhai: { source: require('../../assets/tiere/hammerhai.webp'), aspect: 512 / 172, size: 0.36, motion: 'schwimmen', tail: 0.33 },
  mantarochen: { source: require('../../assets/tiere/mantarochen.webp'), aspect: 512 / 183, size: 0.36, motion: 'gleiten' },
  orca: { source: require('../../assets/tiere/orca.webp'), aspect: 512 / 199, size: 0.4, motion: 'schwimmen', tail: 0.3 },
  'weisser-hai': { source: require('../../assets/tiere/weisser-hai.webp'), aspect: 512 / 191, size: 0.4, motion: 'schwimmen', tail: 0.33 },
  grindwal: { source: require('../../assets/tiere/grindwal.webp'), aspect: 512 / 176, size: 0.4, motion: 'schwimmen', tail: 0.3 },
  pottwal: { source: require('../../assets/tiere/pottwal.webp'), aspect: 512 / 156, size: 0.45, motion: 'schwimmen', tail: 0.28 },
  walhai: { source: require('../../assets/tiere/walhai.webp'), aspect: 512 / 260, size: 0.45, motion: 'schwimmen', tail: 0.3 },
  delfin: { source: require('../../assets/tiere/delfin.webp'), aspect: 512 / 394, size: 0.26, motion: 'gleiten' },
};

/** Muschel (Währung) */
export const shellImage: ImageSourcePropType = require('../../assets/icons/muschel.png');
export const shellSprite: Sprite = { source: shellImage, aspect: 512 / 428 };

/** Flaschenpost im Riff und Briefpapier für Spartipps */
export const bottleSprite: Sprite = { source: require('../../assets/icons/flaschenpost.webp'), aspect: 512 / 339 };
export const paperImage: ImageSourcePropType = require('../../assets/icons/papier.webp');

/** Schatztruhe zu / offen */
export const treasureImages = {
  closed: { source: require('../../assets/icons/schatztruhe-zu.png'), aspect: 512 / 441 } as Sprite,
  open: { source: require('../../assets/icons/schatztruhe-offen.png'), aspect: 472 / 512 } as Sprite,
};

// Schon vorbereitet, aber noch nicht eingebunden (sonst landen sie unnötig im Bundle):
//   assets/icons/perle.png              – Streak-Schutz
//   assets/themes/tiefsee.jpg           – weiteres Revier
//   assets/themes/nachtriff.jpg         – weiteres Revier
//   assets/themes/polarmeer.jpg         – weiteres Revier
