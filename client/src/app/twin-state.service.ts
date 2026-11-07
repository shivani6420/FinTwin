import { Injectable, signal } from '@angular/core';
import { Fix, Profile, ScenarioKey, SCENARIOS } from './simulation.service';

export interface HistoryItem { key: ScenarioKey; value: number; risk: number; ts: number; }
const KEY = 'ft-app';

@Injectable({ providedIn: 'root' })
export class TwinStateService {
  profile = signal<Profile>({ earn: 75000, spend: 35000, loan: 20000, saved: 350000 });
  fix = signal<Fix>({ cut: 0, add: 0 });
  history = signal<HistoryItem[]>([]);
  onboarded = signal(false);
  sheetOpen = signal(false);
  riskNow = signal(0);
  scenario = signal<ScenarioKey>('job');
  values = signal<Record<ScenarioKey, number>>(
    Object.fromEntries(SCENARIOS.map(s => [s.key, s.value])) as Record<ScenarioKey, number>);

  constructor() {
    try {
      const j = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (j.profile) this.profile.set({ ...this.profile(), ...j.profile });
      if (Array.isArray(j.history)) this.history.set(j.history);
      this.onboarded.set(!!j.onboarded);
    } catch { /* ignore broken storage */ }
  }

  persist(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify({ profile: this.profile(), history: this.history(), onboarded: this.onboarded() }));
    } catch { /* storage unavailable */ }
  }

  setValue(key: ScenarioKey, v: number): void { this.values.update(o => ({ ...o, [key]: v })); }

  addHistory(item: HistoryItem): void {
    this.history.update(h => [item, ...h].slice(0, 30));
    this.persist();
  }
}

