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
- **Spar-Moment** – „Nicht gekauft“ (wird gemerkt), „Zur Seite gelegt“ (sofort gesichert) oder „Extra-Geld“ (Weihnachtsgeld, Zulage … – auch auf mehrere Ziele verteilbar)
- **Gemerkt vs. gesichert** – erst wenn du das Geld wirklich zur Seite legst (Tagesgeld, Unterkonto, ETF, Spardose …), gibt’s die vollen Muscheln
- **Mehrere Ziele** – eins ist Hauptziel; beim Sichern wählst du, in welches Ziel das Geld geht
- **Mitwachsende Wochenrate** – was zu Wochenbeginn noch fehlt, verteilt auf die restlichen Wochen; dazu eine Prognose („In deinem Tempo: 12.03.2027 – 2 Monate früher“). Extra-Geld zählt zum Stand, aber nicht zum Tempo
- **Abzeichen „Frühstarter“** – Ziel mindestens 2 Wochen vor dem Termin erreicht (Ziel lief mindestens 2 Wochen); ohne extra Belohnung
- **Truhen** – Wochenrate eines Ziels geschafft: kleine Truhe; Ziel erreicht: große Truhe mit einem seltenen Tier. Doppelte Tiere werden zu Muscheln
- **Sammlung** – 25 Tiere in 4 Seltenheiten, unentdeckte als Silhouette
- **Übersicht** – Woche, Monat, offen, gesichert, Hochrechnung aufs Jahr, alle Spar-Momente
- **Zahltag-Erinnerung** – monatliche Mitteilung an deinem Gehaltstag
- **Flaschenpost** – treibt im Riff, jeden Tag ein Spartipp (150 Stück, passend zu Zahltag, Wochenende, Lieferdienst & Co.); gute Tipps aufheben und unter „Meine Flaschenpost“ auf Briefpapier nachlesen
- **Sound** – Kasse beim Sichern, Wal-Ruf aus der Truhe, Unterwasser-Atmosphäre mit Walgesang (abschaltbar)
- **Tutorial** – beim ersten Start, jederzeit wieder unter Einstellungen → „Tutorial ansehen“

### Muscheln

| Aktion | Muscheln |
| --- | --- |
| Spar-Moment eintragen | +10 |
| Spar-Moment gesichert | +25 |
| Extra-Geld (egal wie viel, auch aufgeteilt) | +10 +25, einmal |
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
| `assets/icons/flaschenpost.webp`, `papier.webp` | Flaschenpost im Riff, Briefpapier für Tipps | in der App |
| `assets/icons/perle.png` | Perle (Streak-Schutz) | vorbereitet |
| `assets/themes/` | Tiefsee, Nachtriff, Polarmeer | vorbereitet für weitere Reviere |
| `assets/icon.png`, `android-icon-*` | App-Icon (Kaurimuschel) | in der App |

Neue Tiere: freigestellt, Blick nach rechts, als WebP in `assets/tiere/` legen, in `src/lib/logic.ts` (Name, Seltenheit) und `src/lib/images.ts` (Größe, Bewegung, ggf. Schwanzflosse) eintragen.

## Sound

| Datei | Wofür |
| --- | --- |
| `assets/sounds/kasse.mp3` | Geld gesichert („Zur Seite gelegt“, Extra-Geld, Sichern) |
| `assets/sounds/wal-ruf.mp3` | Wal aus einer Truhe (Orca, Grindwal, Pottwal) |
| `assets/sounds/atmosphaere.mp3` | Unterwasser-Atmosphäre im Riff, 20 s nahtlose Schleife |
| `assets/sounds/walgesang.mp3` | Alle 30–75 s im Riff, wenn ein Wal da ist |

Einstellungen: „Effekte“ (Standard an) und „Atmosphäre“ (Standard aus). Die App respektiert den Stummschalter und unterbricht keine Musik anderer Apps. Noch offen: Truhe öffnen, Muscheln, Level-Up.

Sounds von [Pixabay](https://pixabay.com) (Universfield, Dragon Studio), gekürzt und in der Lautstärke angeglichen.

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
- `src/lib/tips.ts` – die 150 Spartipps; `src/lib/tipLogic.ts` – Tipp des Tages je nach Situation
