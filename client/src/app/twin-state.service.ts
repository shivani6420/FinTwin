import { Injectable, signal } from '@angular/core';
import { Fix, Profile, ScenarioKey, SCENARIOS } from './simulation.service';

export interface HistoryItem { key: ScenarioKey; value: number; risk: number; ts: number; }

/** One line of income or savings. Income: flag = "stops if I lose my job". Savings: flag = "count it". */
export interface Source { id: number; name: string; amount: number; flag: boolean; }
export type SourceKind = 'income' | 'savings';

const KEY = 'ft-app';

@Injectable({ providedIn: 'root' })
export class TwinStateService {
  profile = signal<Profile>({ earn: 75000, spend: 35000, loan: 20000, saved: 350000, keep: 0 });
  incomeSources = signal<Source[]>([]);
  savingsSources = signal<Source[]>([]);
  fix = signal<Fix>({ cut: 0, add: 0 });
  history = signal<HistoryItem[]>([]);
  onboarded = signal(false);
  sheetOpen = signal(false);
  riskNow = signal(0);
  scenario = signal<ScenarioKey>('job');
  values = signal<Record<ScenarioKey, number>>(
    Object.fromEntries(SCENARIOS.map(s => [s.key, s.value])) as Record<ScenarioKey, number>);

  constructor() {
    let income: Source[] | null = null;
    let savings: Source[] | null = null;
    try {
      const j = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (j.profile) this.profile.set({ ...this.profile(), ...j.profile });
      if (Array.isArray(j.history)) this.history.set(j.history);
      if (Array.isArray(j.income)) income = j.income;
      if (Array.isArray(j.savings)) savings = j.savings;
      this.onboarded.set(!!j.onboarded);
    } catch { /* ignore broken storage */ }
    const p = this.profile();
    this.incomeSources.set(income ?? [{ id: 1, name: 'Salary', amount: p.earn, flag: true }]);
    this.savingsSources.set(savings ?? [{ id: 1, name: 'Savings', amount: p.saved, flag: true }]);
    this.recompute();
  }

  persist(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        profile: this.profile(), history: this.history(), onboarded: this.onboarded(),
        income: this.incomeSources(), savings: this.savingsSources(),
      }));
    } catch { /* storage unavailable */ }
  }

  /** Totals are always worked out from the sources. */
  recompute(): void {
    const sum = (l: Source[]) => l.reduce((t, s) => t + (s.amount || 0), 0);
    const inc = this.incomeSources();
    this.profile.update(p => ({
      ...p,
      earn: sum(inc),
      keep: sum(inc.filter(s => !s.flag)),
      saved: sum(this.savingsSources().filter(s => s.flag)),
    }));
  }

  private list(kind: SourceKind) { return kind === 'income' ? this.incomeSources : this.savingsSources; }

  addSource(kind: SourceKind, name: string, flag: boolean): void {
    this.list(kind).update(l => [...l, { id: Date.now() + Math.floor(Math.random() * 1000), name, amount: 0, flag }]);
    this.recompute();
  }
  removeSource(kind: SourceKind, id: number): void {
    this.list(kind).update(l => l.filter(s => s.id !== id));
    this.recompute();
  }
  updateSource(kind: SourceKind, id: number, patch: Partial<Source>): void {
    this.list(kind).update(l => l.map(s => (s.id === id ? { ...s, ...patch } : s)));
    this.recompute();
  }

  setValue(key: ScenarioKey, v: number): void { this.values.update(o => ({ ...o, [key]: v })); }

  addHistory(item: HistoryItem): void {
    this.history.update(h => [item, ...h].slice(0, 30));
    this.persist();
  }
}