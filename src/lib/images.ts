import type { ImageSourcePropType } from 'react-native';
import type { AnimalId } from './logic';

/**
 * Hier kommen die GPT-Bilder rein.
 *
 * Solange ein Eintrag `null` ist, zeichnet die App einen Platzhalter.
 * Bild in den passenden Ordner legen und die Zeile ersetzen, z. B.:
 *
 *   require('../../assets/riff/stufe-1.png'),
 */

/** Riff-Hintergrund pro Level (Sandbank … Barriereriff), Hochformat 9:16 */
export const riffImages: (ImageSourcePropType | null)[] = [
  null, // assets/riff/stufe-1.png – Sandbank
  null, // assets/riff/stufe-2.png – Seegraswiese
  null, // assets/riff/stufe-3.png – Jungriff
  null, // assets/riff/stufe-4.png – Korallengarten
  null, // assets/riff/stufe-5.png – Barriereriff
];

/** Freigestellte Tiere (PNG mit transparentem Hintergrund), Blick nach rechts */
export const animalImages: Record<AnimalId, ImageSourcePropType | null> = {
  clownfisch: null, // assets/tiere/clownfisch.png
  seepferdchen: null, // assets/tiere/seepferdchen.png
  schildkroete: null, // assets/tiere/meeresschildkroete.png
};

/** Muschel-Icon (Währung), quadratisch, freigestellt */
export const shellImage: ImageSourcePropType | null = null; // assets/icons/muschel.png
