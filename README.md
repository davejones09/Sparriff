# Sparriff

Spar-App mit Belohnungssystem: Jeder gesparte Euro lässt dein eigenes Korallenriff wachsen. Du trägst Verzichte und Einzahlungen ein, sammelst Muscheln und lockst neue Meerestiere an.

Gebaut mit Expo (React Native, TypeScript). Läuft komplett offline, alle Daten bleiben auf dem Handy.

## Ausprobieren

1. [Node.js](https://nodejs.org) installieren (LTS).
2. Im Projektordner:
   ```bash
   npm install
   npx expo start
   ```
3. Auf dem Handy die App **Expo Go** installieren und den QR-Code aus dem Terminal scannen.

## Was in Version 1 drin ist

- **Riff (Start)** – dein Riff in 5 Ausbaustufen, Muschel-Stand, Level-Fortschritt, Tiere, die einziehen
- **Spar-Moment** – „Nicht gekauft“ (wird gemerkt) oder „Eingezahlt“ (sofort gesichert), mit Vorlagen
- **Gemerkt vs. gesichert** – erst wenn du das Geld wirklich überweist, gibt’s die vollen Muscheln
- **Ziel** – Betrag, Datum, Wochenrate, Schatztruhe (Anteil zum Gönnen)
- **Übersicht** – Woche, Monat, offen, gesichert, Hochrechnung aufs Jahr, alle Spar-Momente
- **Zahltag-Erinnerung** – monatliche Mitteilung an deinem Gehaltstag

### Muscheln

| Aktion | Muscheln |
| --- | --- |
| Spar-Moment eintragen | +10 |
| Spar-Moment gesichert | +25 |
| Wochenrate geschafft | +50 |
| Sparziel erreicht | +500 |

Pro Tag zählen höchstens 5 Spar-Momente. Level: Sandbank (0) · Seegraswiese (200) · Jungriff (600) · Korallengarten (1.500) · Barriereriff (3.500).

Tiere: Clownfisch (erster Spar-Moment), Seepferdchen (erster gesicherter), Meeresschildkröte (erster gesicherter Hunderter).

## Bilder einbauen

Bis die GPT-Bilder da sind, zeichnet die App Platzhalter. So kommen die echten Bilder rein:

1. Bild in den passenden Ordner legen:

   | Bild | Datei |
   | --- | --- |
   | Riff Stufe 1–5 (Hochformat 9:16) | `assets/riff/stufe-1.png` … `stufe-5.png` |
   | Clownfisch, Seepferdchen, Meeresschildkröte (freigestellt, Blick nach rechts) | `assets/tiere/clownfisch.png`, `seepferdchen.png`, `meeresschildkroete.png` |
   | Muschel-Icon (freigestellt) | `assets/icons/muschel.png` |
   | App-Icon (1024 × 1024) | `assets/icon.png` ersetzen |

2. In `src/lib/images.ts` das passende `null` ersetzen, z. B.:
   ```ts
   require('../../assets/riff/stufe-1.png'),
   ```

## Entwicklung

```bash
npm test            # Spar-Logik testen
npm run typecheck   # TypeScript prüfen
npm run lint        # Lint
```

- `src/app/` – Screens (Expo Router)
- `src/lib/logic.ts` – alle Regeln für Muscheln, Level, Tiere, Ziel und Auswertungen
- `src/lib/store.ts` – Speicher (SQLite auf dem Gerät)
- `src/lib/reminders.ts` – Zahltag-Erinnerung
- `src/components/` – Riff-Szene, Belohnungs-Hinweis, UI-Bausteine
