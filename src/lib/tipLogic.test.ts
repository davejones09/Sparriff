import { describe, expect, it } from 'vitest';
import { addExtra, addGoal, addMoment, initialState, type SparState } from './logic';
import { tipSituations, tipsForToday } from './tipLogic';
import { TIPS } from './tips';

// Mittwoch, 18.11.2026
const now = new Date(2026, 10, 18, 12);

describe('Flaschenpost', () => {
  it('hat 150 Tipps mit eindeutigen IDs', () => {
    expect(TIPS).toHaveLength(150);
    expect(new Set(TIPS.map((t) => t.id)).size).toBe(150);
  });

  it('erkennt Zahltag, Wochenende, Dezember und Monatsende', () => {
    const s: SparState = { ...initialState, settings: { ...initialState.settings, paydayDay: 18 } };
    expect(tipSituations(s, now)).toEqual(['zahltag']);
    expect(tipSituations(initialState, new Date(2026, 10, 20))).toEqual(['wochenende']); // Freitag
    expect(tipSituations(initialState, new Date(2026, 11, 9))).toEqual(['dezember']);
    expect(tipSituations(initialState, new Date(2026, 10, 29))).toContain('monatsende');
  });

  it('erkennt häufigen Lieferdienst und Extra-Geld', () => {
    let s = initialState;
    for (let i = 0; i < 2; i++) {
      s = addMoment(s, { kind: 'verzicht', label: 'Lieferdienst', amountCents: 1800 }, now, `l${i}`).state;
    }
    s = addExtra(addGoal(s, { name: 'Urlaub', targetCents: 100000, dueDate: '2027-06-01' }, now, 'g1'), { label: 'Bonus', parts: [{ goalId: null, amountCents: 50000 }] }, now, 'x').state;
    expect(tipSituations(s, now)).toEqual(['extra', 'lieferdienst']);
  });

  it('zeigt zuerst einen passenden Tipp und ist am selben Tag gleich', () => {
    const s: SparState = { ...initialState, settings: { ...initialState.settings, paydayDay: 18 } };
    const list = tipsForToday(s, now);
    expect(list[0].when).toBe('zahltag');
    expect(tipsForToday(s, new Date(2026, 10, 18, 20))[0].id).toBe(list[0].id);
    expect(new Set(list.map((t) => t.id)).size).toBe(list.length);
  });

  it('wechselt den Tipp von Tag zu Tag', () => {
    const a = tipsForToday(initialState, new Date(2026, 10, 17))[0].id;
    const b = tipsForToday(initialState, new Date(2026, 10, 18))[0].id;
    expect(a).not.toBe(b);
  });
});
