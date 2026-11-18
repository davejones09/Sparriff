import type { ImageSourcePropType } from 'react-native';
import type { AnimalId, CollectibleId } from './logic';

/** Bild plus Seitenverhältnis (Breite / Höhe), damit nichts verzerrt. */
export interface Sprite {
  source: ImageSourcePropType;
  aspect: number;
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

/** Start-Tiere, freigestellt, Blick nach rechts */
export const animalImages: Record<AnimalId, Sprite> = {
  clownfisch: { source: require('../../assets/tiere/clownfisch.png'), aspect: 640 / 346 },
  seepferdchen: { source: require('../../assets/tiere/seepferdchen.png'), aspect: 326 / 637 },
  schildkroete: { source: require('../../assets/tiere/meeresschildkroete.png'), aspect: 640 / 376 },
};

/** Sammel-Tiere für die Challenges (Phase 2) */
export const collectibleImages: Record<CollectibleId, Sprite> = {
  hammerhai: { source: require('../../assets/tiere/hammerhai.png'), aspect: 640 / 215 },
  mantarochen: { source: require('../../assets/tiere/mantarochen.png'), aspect: 640 / 229 },
  orca: { source: require('../../assets/tiere/orca.png'), aspect: 640 / 249 },
  'weisser-hai': { source: require('../../assets/tiere/weisser-hai.png'), aspect: 640 / 239 },
  grindwal: { source: require('../../assets/tiere/grindwal.png'), aspect: 640 / 220 },
  pottwal: { source: require('../../assets/tiere/pottwal.png'), aspect: 640 / 195 },
};

/** Muschel (Währung) */
export const shellImage: ImageSourcePropType = require('../../assets/icons/muschel.png');

/** Schatztruhe zu / offen */
export const treasureImages = {
  closed: { source: require('../../assets/icons/schatztruhe-zu.png'), aspect: 512 / 441 } as Sprite,
  open: { source: require('../../assets/icons/schatztruhe-offen.png'), aspect: 472 / 512 } as Sprite,
};

// Schon vorbereitet, aber noch nicht eingebunden (sonst landen sie unnötig im Bundle):
//   assets/icons/perle.png              – Streak-Schutz (Phase 2)
//   assets/themes/tiefsee.jpg           – Riff-Theme (Phase 3)
//   assets/themes/nachtriff.jpg         – Riff-Theme (Phase 3)
//   assets/themes/polarmeer.jpg         – Riff-Theme (Phase 3)
