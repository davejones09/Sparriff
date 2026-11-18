import { describe, expect, it } from 'vitest';
import {
  addMoment,
  deleteMoment,
  formatEuro,
  goalProgress,
  initialState,
  levelFor,
  parseEuro,
  parseGermanDate,
  secureMoments,
  setGoal,
  startNewGoal,
  totalShells,
  totals,
  unlockedAnimals,
  weekKey,
  weeklyRateCents,
  type SparState,
} from './logic';

// Mittwoch, 18.11.2026, 12:00 lokal
const now = new Date(2026, 10, 18, 12, 0, 0);
const at = (days: number, hours = 0) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, 12 + hours);

let counter = 0;
const nextId = () => `m${++counter}`;

function verzicht(state: SparState, cents: number, when = now) {
  return addMoment(state, { kind: 'verzicht', label: 'Coffee to go', amountCents: cents }, when, nextId());
}

describe('Spar-Momente', () => {
  it('gibt 10 Muscheln für einen Verzicht und merkt ihn vor', () => {
    const { state, gain } = verzicht(initialState, 350);
    expect(gain.shells).toBe(10);
    expect(state.moments[0].status).toBe('gemerkt');
    expect(gain.newAnimals.map((a) => a.id)).toEqual(['clownfisch']);
  });

  it('gibt für eine Einzahlung 10 + 25 Muscheln und sichert sofort', () => {
    const { state, gain } = addMoment(
      initialState,
      { kind: 'einzahlung', label: '', amountCents: 2000 },
      now,
      nextId(),
    );
    expect(gain.shells).toBe(35);
    expect(state.moments[0].status).toBe('gesichert');
    expect(state.moments[0].label).toBe('Einzahlung');
  });

  it('belohnt höchstens 5 Spar-Momente pro Tag', () => {
    let s = initialState;
    const gains: number[] = [];
    for (let i = 0; i < 7; i++) {
      const r = verzicht(s, 100, at(0, i % 3));
      s = r.state;
      gains.push(r.gain.shells);
    }
    expect(gains).toEqual([10, 10, 10, 10, 10, 0, 0]);
    // am nächsten Tag geht's wieder
    expect(verzicht(s, 100, at(1)).gain.shells).toBe(10);
  });

  it('gibt 25 Muscheln beim Sichern – aber nur für belohnte Momente', () => {
    let s = initialState;
    for (let i = 0; i < 6; i++) s = verzicht(s, 100).state;
    const ids = s.moments.map((m) => m.id);
    const { state, gain } = secureMoments(s, ids, at(0, 2));
    expect(gain.shells).toBe(5 * 25);
    expect(state.moments.every((m) => m.status === 'gesichert')).toBe(true);
    expect(gain.newAnimals.map((a) => a.id)).toEqual(['seepferdchen']);
    // doppelt sichern bringt nichts
    expect(secureMoments(state, ids, at(0, 3)).gain.shells).toBe(0);
  });

  it('entfernt beim Löschen auch die Muscheln des Moments', () => {
    const s = verzicht(initialState, 500).state;
    const after = deleteMoment(s, s.moments[0].id);
    expect(after.moments).toHaveLength(0);
    expect(totalShells(after)).toBe(0);
  });

  it('lehnt Beträge <= 0 ab', () => {
    expect(() => verzicht(initialState, 0)).toThrow();
  });
});

describe('Ziel, Wochenrate und Schatztruhe', () => {
  const goalInput = { name: 'Urlaub', targetCents: 1000_00, dueDate: '2027-01-13', treasurePercent: 10 };

  it('rechnet die Wochenrate aus', () => {
    const s = setGoal(initialState, goalInput, now);
    // 18.11.2026 bis 13.01.2027 = 56 Tage = 8 Wochen
    expect(weeklyRateCents(s.goal!)).toBe(125_00);
  });

  it('gibt 50 Muscheln, wenn die Wochenrate gesichert ist – einmal pro Woche', () => {
    let s = setGoal(initialState, goalInput, now);
    let r = addMoment(s, { kind: 'einzahlung', label: '', amountCents: 100_00 }, at(0, 1), nextId());
    expect(r.gain.rewards.some((x) => x.type === 'wochenrate')).toBe(false);
    r = addMoment(r.state, { kind: 'einzahlung', label: '', amountCents: 30_00 }, at(1), nextId());
    expect(r.gain.rewards.filter((x) => x.type === 'wochenrate')).toHaveLength(1);
    r = addMoment(r.state, { kind: 'einzahlung', label: '', amountCents: 200_00 }, at(2), nextId());
    expect(r.gain.rewards.some((x) => x.type === 'wochenrate')).toBe(false);
    // nächste Woche (Mo 23.11.) wieder möglich
    r = addMoment(r.state, { kind: 'einzahlung', label: '', amountCents: 125_00 }, at(5), nextId());
    expect(r.gain.rewards.some((x) => x.type === 'wochenrate')).toBe(true);
    s = r.state;
    expect(goalProgress(s, at(5))!.thisWeekCents).toBe(125_00);
  });

  it('gibt 500 Muscheln bei erreichtem Ziel und füllt die Schatztruhe', () => {
    const s = setGoal(initialState, goalInput, now);
    const r = addMoment(s, { kind: 'einzahlung', label: '', amountCents: 1000_00 }, at(0, 1), nextId());
    expect(r.gain.rewards.some((x) => x.type === 'ziel')).toBe(true);
    const p = goalProgress(r.state, at(0, 1))!;
    expect(p.reached).toBe(true);
    expect(p.fraction).toBe(1);
    expect(p.treasureCents).toBe(100_00);
    expect(r.gain.newAnimals.map((a) => a.id)).toContain('schildkroete');
  });

  it('zählt für ein neues Ziel erst ab dessen Start', () => {
    let s = setGoal(initialState, goalInput, now);
    s = addMoment(s, { kind: 'einzahlung', label: '', amountCents: 50_00 }, at(0, 1), nextId()).state;
    s = startNewGoal(s, goalInput, at(1));
    expect(goalProgress(s, at(1))!.securedCents).toBe(0);
  });

  it('behält beim Bearbeiten den Fortschritt', () => {
    let s = setGoal(initialState, goalInput, now);
    s = addMoment(s, { kind: 'einzahlung', label: '', amountCents: 50_00 }, at(0, 1), nextId()).state;
    s = setGoal(s, { ...goalInput, targetCents: 2000_00 }, at(1));
    expect(goalProgress(s, at(1))!.securedCents).toBe(50_00);
  });
});

describe('Level und Übersicht', () => {
  it('ordnet Muscheln dem Level zu', () => {
    expect(levelFor(0).level.name).toBe('Sandbank');
    expect(levelFor(199).level.name).toBe('Sandbank');
    expect(levelFor(200).level.name).toBe('Seegraswiese');
    expect(levelFor(400).progress).toBeCloseTo(0.5);
    expect(levelFor(9999).next).toBeNull();
  });

  it('meldet ein Level-Up', () => {
    let s: SparState = initialState;
    let levelUp = null;
    for (let d = 0; d < 6 && !levelUp; d++) {
      for (let i = 0; i < 5; i++) {
        const r = addMoment(s, { kind: 'einzahlung', label: '', amountCents: 100 }, at(d, i), nextId());
        s = r.state;
        levelUp = levelUp ?? r.gain.levelUp;
      }
    }
    expect(levelUp?.name).toBe('Seegraswiese');
  });

  it('summiert Woche, Monat und offene Beträge', () => {
    let s = verzicht(initialState, 350, at(-20)).state; // Oktober
    s = verzicht(s, 1500, at(-2)).state; // Montag, diese Woche
    s = addMoment(s, { kind: 'einzahlung', label: '', amountCents: 2000 }, now, nextId()).state;
    const t = totals(s, now);
    expect(t.weekCents).toBe(3500);
    expect(t.monthCents).toBe(3500);
    expect(t.openCents).toBe(1850);
    expect(t.securedCents).toBe(2000);
    expect(t.yearProjectionCents).toBe(Math.round((3850 / 20) * 365));
  });

  it('schaltet Tiere passend frei', () => {
    expect(unlockedAnimals(initialState)).toEqual([]);
  });
});

describe('Geld und Datum', () => {
  it('liest deutsche Beträge', () => {
    expect(parseEuro('3,50')).toBe(350);
    expect(parseEuro('3.50')).toBe(350);
    expect(parseEuro('12')).toBe(1200);
    expect(parseEuro('1.234,56 €')).toBe(123456);
    expect(parseEuro('1.500')).toBe(150000);
    expect(parseEuro('0')).toBeNull();
    expect(parseEuro('abc')).toBeNull();
    expect(parseEuro('3,555')).toBeNull();
  });

  it('formatiert Euro', () => {
    expect(formatEuro(350)).toBe('3,50 €');
    expect(formatEuro(150000)).toBe('1.500,00 €');
    expect(formatEuro(0)).toBe('0,00 €');
  });

  it('liest TT.MM.JJJJ', () => {
    expect(parseGermanDate('13.01.2027')).toBe('2027-01-13');
    expect(parseGermanDate('31.02.2027')).toBeNull();
    expect(parseGermanDate('2027-01-13')).toBeNull();
  });

  it('bildet ISO-Wochen', () => {
    expect(weekKey(new Date(2026, 10, 18))).toBe('2026-W47');
    expect(weekKey(new Date(2027, 0, 1))).toBe('2026-W53');
    expect(weekKey(new Date(2027, 0, 4))).toBe('2027-W01');
  });
});
