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

## Was drin ist

- **Riff (Start)** – dein Riff in 5 Ausbaustufen, Muschel-Stand, Level-Fortschritt; bis zu 8 Tiere schwimmen darin herum
- **Spar-Moment** – „Nicht gekauft“ (wird gemerkt) oder „Zur Seite gelegt“ (sofort gesichert), mit Vorlagen
- **Gemerkt vs. gesichert** – erst wenn du das Geld wirklich zur Seite legst (Tagesgeld, Unterkonto, ETF, Spardose …), gibt’s die vollen Muscheln
- **Mehrere Ziele** – eins ist Hauptziel; beim Sichern wählst du, in welches Ziel das Geld geht
- **Truhen** – Wochenrate eines Ziels geschafft: kleine Truhe; Ziel erreicht: große Truhe mit einem seltenen Tier. Doppelte Tiere werden zu Muscheln
- **Sammlung** – 25 Tiere in 4 Seltenheiten, unentdeckte als Silhouette
- **Übersicht** – Woche, Monat, offen, gesichert, Hochrechnung aufs Jahr, alle Spar-Momente
- **Zahltag-Erinnerung** – monatliche Mitteilung an deinem Gehaltstag
- **Tutorial** – beim ersten Start, jederzeit wieder unter Einstellungen → „Tutorial ansehen“

### Muscheln

| Aktion | Muscheln |
| --- | --- |
| Spar-Moment eintragen | +10 |
| Spar-Moment gesichert | +25 |
| Wochenrate eines Ziels geschafft | +50 und kleine Truhe |
| Sparziel erreicht | +500 und große Truhe |
| Doppeltes Tier aus einer Truhe | +30 / +80 / +200 je nach Seltenheit |

Pro Tag zählen höchstens 5 Spar-Momente. Level: Sandbank (0) · Seegraswiese (200) · Jungriff (600) · Korallengarten (1.500) · Barriereriff (3.500).

### Truhen

| Truhe | Häufig | Selten | Sehr selten |
| --- | --- | --- | --- |
| Klein (Wochenrate) | 75 % | 22 % | 3 % |
| Groß (Ziel erreicht) | – | 60 % | 40 % |

Innerhalb einer Seltenheit kommen zuerst Tiere, die du noch nicht hast.

## Bilder

Alle Bilder kommen aus GPT, freigestellt und zugeschnitten. Eingebunden werden sie in `src/lib/images.ts`.

| Ordner | Inhalt | Status |
| --- | --- | --- |
| `assets/riff/` | Riff Stufe 1–5 (Sandbank … Barriereriff), 941 × 1672 | in der App |
| `assets/tiere/` | 25 Tiere als WebP (freigestellt, Blick nach rechts) | Riff, Truhen, Sammlung |
| `assets/icons/` | Muschel, Schatztruhe zu/offen | in der App |
| `assets/icons/perle.png` | Perle (Streak-Schutz) | vorbereitet |
| `assets/themes/` | Tiefsee, Nachtriff, Polarmeer | vorbereitet für weitere Reviere |
| `assets/icon.png`, `android-icon-*` | App-Icon (Kaurimuschel) | in der App |

Neue Tiere: freigestellt, Blick nach rechts, als WebP in `assets/tiere/` legen, in `src/lib/logic.ts` (Name, Seltenheit) und `src/lib/images.ts` (Größe, Bewegung, ggf. Schwanzflosse) eintragen.

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
- `src/components/` – Riff-Szene, Schwimm-Animation (`AnimalActor`), Belohnungs-Hinweis, UI-Bausteine
- `src/lib/images.ts` – alle Bilder an einer Stelle
