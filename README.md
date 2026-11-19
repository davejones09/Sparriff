# Sparriff

Spar-App mit Belohnungssystem: Jeder gesparte Euro lässt dein eigenes Korallenriff wachsen. Du trägst Verzichte und Einzahlungen ein, sammelst Muscheln und lockst neue Meerestiere an.

Gebaut mit Expo (React Native, TypeScript). Läuft komplett offline, alle Daten bleiben auf dem Handy.

## Im Browser ansehen

**https://davejones09.github.io/Sparriff/** – läuft im Handy-Browser, ohne Installation.

Bei jedem Push auf `main` baut die GitHub Action „Web-Vorschau“ die Seite neu. Die Daten bleiben im Browser gespeichert. Die Zahltag-Erinnerung gibt’s im Browser nicht.

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
- **Spar-Moment** – „Nicht gekauft“ (wird gemerkt) oder „Zur Seite gelegt“ (sofort gesichert), mit Vorlagen
- **Gemerkt vs. gesichert** – erst wenn du das Geld wirklich zur Seite legst (Tagesgeld, Unterkonto, ETF, Spardose …), gibt’s die vollen Muscheln
- **Ziel** – Betrag, Datum, Wochenrate, Schatztruhe (Anteil zum Gönnen)
- **Übersicht** – Woche, Monat, offen, gesichert, Hochrechnung aufs Jahr, alle Spar-Momente
- **Zahltag-Erinnerung** – monatliche Mitteilung an deinem Gehaltstag
- **Tutorial** – 5 Schritte beim ersten Start, jederzeit wieder unter Einstellungen → „Tutorial ansehen“

### Muscheln

| Aktion | Muscheln |
| --- | --- |
| Spar-Moment eintragen | +10 |
| Spar-Moment gesichert | +25 |
| Wochenrate geschafft | +50 |
| Sparziel erreicht | +500 |

Pro Tag zählen höchstens 5 Spar-Momente. Level: Sandbank (0) · Seegraswiese (200) · Jungriff (600) · Korallengarten (1.500) · Barriereriff (3.500).

Tiere: Clownfisch (erster Spar-Moment), Seepferdchen (erster gesicherter), Meeresschildkröte (erster gesicherter Hunderter).

## Bilder

Alle Bilder kommen aus GPT, freigestellt und zugeschnitten. Eingebunden werden sie in `src/lib/images.ts`.

| Ordner | Inhalt | Status |
| --- | --- | --- |
| `assets/riff/` | Riff Stufe 1–5 (Sandbank … Barriereriff), 941 × 1672 | in der App |
| `assets/tiere/` | Clownfisch, Seepferdchen, Meeresschildkröte | im Riff |
| `assets/tiere/` | Hammerhai, Mantarochen, Orca, Weißer Hai, Indischer Grindwal, Pottwal | Sammlung, noch gesperrt (Challenges, Phase 2) |
| `assets/icons/` | Muschel, Schatztruhe zu/offen | in der App |
| `assets/icons/perle.png` | Perle (Streak-Schutz) | vorbereitet, Phase 2 |
| `assets/themes/` | Tiefsee, Nachtriff, Polarmeer | vorbereitet, Phase 3 |
| `assets/icon.png`, `android-icon-*` | App-Icon (Kaurimuschel) | in der App |

Neue Tiere: freigestellt als PNG, Blick nach rechts, in `assets/tiere/` legen und mit Seitenverhältnis in `src/lib/images.ts` eintragen.

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
- `src/lib/images.ts` – alle Bilder an einer Stelle
