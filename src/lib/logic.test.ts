import { describe, expect, it } from 'vitest';
import {
  ANIMALS,
  addExtra,
  addGoal,
  goalForecast,
  initialWeeklyRateCents,
  addMoment,
  closedChests,
  deleteGoal,
  deleteMoment,
  formatEuro,
  goalProgress,
  initialState,
  levelFor,
  migrateFromV1,
  openChest,
  parseEuro,
  parseGermanDate,
  secureMoments,
  setPrimaryGoal,
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
function zurSeite(state: SparState, cents: number, when = now, goalId?: string) {
  return addMoment(state, { kind: 'einzahlung', label: '', amountCents: cents, goalId }, when, nextId());
}

// 18.11.2026 bis 13.01.2027 = 8 Wochen
const urlaub = { name: 'Urlaub', targetCents: 1000_00, dueDate: '2027-01-13' };
const kamera = { name: 'Kamera', targetCents: 200_00, dueDate: '2027-01-13' };

describe('Spar-Momente', () => {
  it('gibt 10 Muscheln für einen Verzicht und merkt ihn vor', () => {
    const { state, gain } = verzicht(initialState, 350);
    expect(gain.shells).toBe(10);
    expect(state.moments[0].status).toBe('gemerkt');
    expect(gain.newAnimals.map((a) => a.id)).toEqual(['clownfisch']);
  });

  it('gibt für „Zur Seite gelegt“ 10 + 25 Muscheln und sichert sofort', () => {
    const { state, gain } = zurSeite(initialState, 2000);
    expect(gain.shells).toBe(35);
    expect(state.moments[0].status).toBe('gesichert');
    expect(state.moments[0].label).toBe('Zur Seite gelegt');
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
    expect(verzicht(s, 100, at(1)).gain.shells).toBe(10);
  });

  it('gibt 25 Muscheln beim Sichern – aber nur für belohnte Momente', () => {
    let s = initialState;
    for (let i = 0; i < 6; i++) s = verzicht(s, 100).state;
    const ids = s.moments.map((m) => m.id);
    const { state, gain } = secureMoments(s, ids, null, at(0, 2));
    expect(gain.shells).toBe(5 * 25);
    expect(state.moments.every((m) => m.status === 'gesichert')).toBe(true);
    expect(secureMoments(state, ids, null, at(0, 3)).gain.shells).toBe(0);
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

describe('Mehrere Ziele', () => {
  it('macht das erste Ziel zum Hauptziel und sichert standardmäßig dort', () => {
    let s = addGoal(initialState, urlaub, now, 'g1');
    s = addGoal(s, kamera, now, 'g2');
    expect(s.primaryGoalId).toBe('g1');
    s = verzicht(s, 500).state;
    s = secureMoments(s, [s.moments[0].id], null, at(0, 1)).state;
    expect(goalProgress(s, 'g1', now)!.securedCents).toBe(500);
    expect(goalProgress(s, 'g2', now)!.securedCents).toBe(0);
  });

  it('sichert in das gewählte Ziel', () => {
    let s = addGoal(initialState, urlaub, now, 'g1');
    s = addGoal(s, kamera, now, 'g2');
    s = zurSeite(s, 3000, at(0, 1), 'g2').state;
    expect(goalProgress(s, 'g2', now)!.securedCents).toBe(3000);
    expect(goalProgress(s, 'g1', now)!.securedCents).toBe(0);
  });

  it('wechselt das Hauptziel und übernimmt es beim Löschen', () => {
    let s = addGoal(initialState, urlaub, now, 'g1');
    s = addGoal(s, kamera, now, 'g2');
    s = setPrimaryGoal(s, 'g2');
    expect(s.primaryGoalId).toBe('g2');
    s = zurSeite(s, 1000, at(0, 1)).state;
    s = deleteGoal(s, 'g2');
    expect(s.primaryGoalId).toBe('g1');
    expect(s.moments[0].goalId).toBeUndefined();
    expect(s.moments[0].status).toBe('gesichert');
  });

  it('rechnet die Wochenrate je Ziel aus', () => {
    const s = addGoal(initialState, urlaub, now, 'g1');
    expect(weeklyRateCents(s, s.goals[0], now)).toBe(125_00);
  });
});

describe('Wochenrate, Ziel und Truhen', () => {
  it('gibt bei geschaffter Wochenrate 50 Muscheln und eine kleine Truhe – einmal pro Woche und Ziel', () => {
    let s = addGoal(initialState, urlaub, now, 'g1');
    let r = zurSeite(s, 100_00, at(0, 1));
    expect(r.gain.newChests).toHaveLength(0);
    r = zurSeite(r.state, 30_00, at(1));
    expect(r.gain.rewards.filter((x) => x.type === 'wochenrate')).toHaveLength(1);
    expect(r.gain.newChests.map((c) => c.kind)).toEqual(['klein']);
    r = zurSeite(r.state, 200_00, at(2));
    expect(r.gain.newChests).toHaveLength(0);
    r = zurSeite(r.state, 125_00, at(5)); // Montag, neue Woche
    expect(r.gain.newChests.map((c) => c.kind)).toEqual(['klein']);
    s = r.state;
    expect(goalProgress(s, 'g1', at(5))!.thisWeekCents).toBe(125_00);
  });

  it('gibt bei erreichtem Ziel 500 Muscheln und eine große Truhe', () => {
    const s = addGoal(initialState, kamera, now, 'g2');
    const r = zurSeite(s, 200_00, at(0, 1));
    expect(r.gain.rewards.some((x) => x.type === 'ziel')).toBe(true);
    expect(r.gain.newChests.map((c) => c.kind).sort()).toEqual(['gross', 'klein']);
    const p = goalProgress(r.state, 'g2', at(0, 1))!;
    expect(p.reached).toBe(true);
    expect(r.state.goals[0].reachedAt).toBeDefined();
  });

  it('kleine Truhe: niedriger Wurf ergibt ein häufiges, neues Tier', () => {
    let s = addGoal(initialState, kamera, now, 'g2');
    s = zurSeite(s, 30_00, at(0, 1)).state;
    const chest = closedChests(s)[0];
    const rolls = [0.1, 0];
    const r = openChest(s, chest.id, at(0, 2), () => rolls.shift()!);
    expect(r.gain.opened?.animal).toBe('doktorfisch');
    expect(r.gain.opened?.duplicate).toBe(false);
    expect(r.state.collection).toEqual(['doktorfisch']);
    expect(closedChests(r.state)).toHaveLength(0);
    expect(r.gain.newAnimals.map((a) => a.id)).toEqual(['doktorfisch']);
    // nochmal öffnen geht nicht
    expect(openChest(r.state, chest.id, at(0, 3)).gain.opened).toBeUndefined();
  });

  it('große Truhe enthält nie ein häufiges Tier', () => {
    let s = addGoal(initialState, kamera, now, 'g2');
    s = zurSeite(s, 200_00, at(0, 1)).state;
    const big = s.chests.find((c) => c.kind === 'gross')!;
    for (const roll of [0, 0.3, 0.59, 0.61, 0.99]) {
      const r = openChest(s, big.id, at(0, 2), () => roll);
      const rarity = ANIMALS.find((a) => a.id === r.gain.opened!.animal)!.rarity;
      expect(['selten', 'sehr-selten']).toContain(rarity);
    }
  });

  it('bevorzugt neue Tiere und gibt für Doppelte Muscheln', () => {
    const haeufig = ANIMALS.filter((a) => a.rarity === 'haeufig').map((a) => a.id);
    let s: SparState = { ...addGoal(initialState, kamera, now, 'g2'), collection: haeufig.slice(0, -1) };
    s = { ...s, chests: [{ id: 'c1', kind: 'klein', reason: 'Test', at: now.toISOString() }, { id: 'c2', kind: 'klein', reason: 'Test', at: now.toISOString() }] };
    let r = openChest(s, 'c1', now, () => 0);
    expect(r.gain.opened?.animal).toBe(haeufig.at(-1));
    r = openChest(r.state, 'c2', now, () => 0);
    expect(r.gain.opened?.duplicate).toBe(true);
    expect(r.gain.shells).toBe(30);
  });

  it('nimmt Truhen-Tiere ins Riff auf', () => {
    const s: SparState = { ...initialState, collection: ['orca'] };
    expect(unlockedAnimals(s)).toEqual(['orca']);
  });
});

describe('Extra-Geld, Wochenrate und Prognose', () => {
  it('verteilt Extra-Geld auf mehrere Ziele und gibt Muscheln nur einmal', () => {
    let s = addGoal(initialState, urlaub, now, 'g1');
    s = addGoal(s, kamera, now, 'g2');
    const r = addExtra(s, { label: 'Weihnachtsgeld', parts: [{ goalId: 'g1', amountCents: 300_00 }, { goalId: 'g2', amountCents: 50_00 }] }, at(0, 1), 'x');
    expect(goalProgress(r.state, 'g1', now)!.securedCents).toBe(300_00);
    expect(goalProgress(r.state, 'g2', now)!.securedCents).toBe(50_00);
    expect(r.state.moments.filter((m) => m.kind === 'extra')).toHaveLength(2);
    // +10 +25 einmal, plus Wochenrate für beide Ziele
    expect(r.gain.rewards.filter((x) => x.type === 'moment' || x.type === 'gesichert')).toHaveLength(2);
    expect(r.gain.newChests).toHaveLength(2);
  });

  it('senkt die Wochenrate ab der nächsten Woche', () => {
    let s = addGoal(initialState, urlaub, now, 'g1');
    s = addExtra(s, { label: 'Weihnachtsgeld', parts: [{ goalId: null, amountCents: 300_00 }] }, at(0, 1), 'x').state;
    const g = s.goals[0];
    expect(weeklyRateCents(s, g, at(0, 2))).toBe(125_00); // diese Woche stabil
    expect(weeklyRateCents(s, g, at(5))).toBe(87_50); // 700 € auf 8 Wochen
    expect(initialWeeklyRateCents(g)).toBe(125_00);
    expect(goalProgress(s, 'g1', at(5))!.initialWeeklyRateCents).toBe(125_00);
  });

  it('gibt nach erreichtem Ziel keine Wochenraten-Truhen mehr', () => {
    let s = addGoal(initialState, kamera, now, 'g2');
    s = zurSeite(s, 200_00, at(0, 1)).state;
    const r = zurSeite(s, 10_00, at(7));
    expect(r.gain.newChests).toHaveLength(0);
  });

  it('prognostiziert aus dem regulären Tempo – Extra-Geld zählt zum Stand, nicht zum Tempo', () => {
    let s = addGoal(initialState, urlaub, now, 'g1');
    s = zurSeite(s, 125_00, at(0, 1)).state;
    const ohne = goalForecast(s, 'g1', at(0, 2))!;
    expect(ohne.daysEarly).toBe(7);
    s = addExtra(s, { label: 'Zulage', parts: [{ goalId: null, amountCents: 300_00 }] }, at(0, 2), 'x').state;
    const mit = goalForecast(s, 'g1', at(0, 3))!;
    expect(mit.daysEarly).toBeGreaterThan(ohne.daysEarly);
    expect(goalForecast(initialState, 'g1', now)).toBeNull();
  });

  it('vergibt Frühstarter nur bei mindestens 2 Wochen Vorsprung und Laufzeit', () => {
    const base = addGoal(initialState, kamera, now, 'g2');
    const spaet = zurSeite(base, 200_00, at(20));
    expect(spaet.state.goals[0].early).toBe(true);
    expect(spaet.gain.newBadges.map((g) => g.id)).toEqual(['g2']);
    const zuFrueh = zurSeite(base, 200_00, at(3));
    expect(zuFrueh.state.goals[0].early).toBe(false);
    expect(zuFrueh.gain.newBadges).toHaveLength(0);
  });
});

describe('Alte Daten übernehmen', () => {
  it('macht aus dem einen Ziel ein Hauptziel und ordnet gesichertes Geld zu', () => {
    const created = now.toISOString();
    const old = {
      goal: { name: 'Urlaub', targetCents: 150000, dueDate: '2027-05-19', createdAt: created },
      moments: [
        { id: 'a', kind: 'einzahlung' as const, label: 'x', amountCents: 5000, status: 'gesichert' as const, createdAt: at(0, 1).toISOString(), securedAt: at(0, 1).toISOString(), rewarded: true },
        { id: 'b', kind: 'verzicht' as const, label: 'y', amountCents: 350, status: 'gemerkt' as const, createdAt: at(0, 1).toISOString(), rewarded: true },
      ],
      rewards: [{ id: 'wochenrate:2026-W47', type: 'wochenrate' as const, shells: 50, at: created, ref: '2026-W47' }],
      settings: { paydayDay: 15, reminderHour: 9, remindersEnabled: false },
    };
    const s = migrateFromV1(old);
    expect(s.goals.map((g) => g.name)).toEqual(['Urlaub']);
    expect(s.primaryGoalId).toBe('ziel-1');
    expect(goalProgress(s, 'ziel-1', now)!.securedCents).toBe(5000);
    expect(s.rewards[0].ref).toBe('ziel-1:2026-W47');
    expect(s.settings.paydayDay).toBe(15);
    expect(s.settings.tutorialSeen).toBe(false);
    expect(totalShells(s)).toBe(50);
  });
});

describe('Level und Übersicht', () => {
  it('ordnet Muscheln dem Level zu', () => {
    expect(levelFor(0).level.name).toBe('Sandbank');
    expect(levelFor(200).level.name).toBe('Seegraswiese');
    expect(levelFor(400).progress).toBeCloseTo(0.5);
    expect(levelFor(9999).next).toBeNull();
  });

  it('summiert Woche, Monat und offene Beträge', () => {
    let s = verzicht(initialState, 350, at(-20)).state;
    s = verzicht(s, 1500, at(-2)).state;
    s = zurSeite(s, 2000).state;
    const t = totals(s, now);
    expect(t.weekCents).toBe(3500);
    expect(t.monthCents).toBe(3500);
    expect(t.openCents).toBe(1850);
    expect(t.securedCents).toBe(2000);
  });
});

describe('Geld und Datum', () => {
  it('liest deutsche Beträge', () => {
    expect(parseEuro('3,50')).toBe(350);
    expect(parseEuro('1.234,56 €')).toBe(123456);
    expect(parseEuro('1.500')).toBe(150000);
    expect(parseEuro('0')).toBeNull();
    expect(parseEuro('3,555')).toBeNull();
  });

  it('formatiert Euro', () => {
    expect(formatEuro(350)).toBe('3,50 €');
    expect(formatEuro(150000)).toBe('1.500,00 €');
  });

  it('liest TT.MM.JJJJ', () => {
    expect(parseGermanDate('13.01.2027')).toBe('2027-01-13');
    expect(parseGermanDate('31.02.2027')).toBeNull();
  });

  it('bildet ISO-Wochen', () => {
    expect(weekKey(new Date(2026, 10, 18))).toBe('2026-W47');
    expect(weekKey(new Date(2027, 0, 1))).toBe('2026-W53');
  });
});
