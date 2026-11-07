import { Injectable } from '@angular/core';
import { money } from './format';

export type ScenarioKey = 'job' | 'med' | 'hike' | 'crash';
export type Mood = 'ok' | 'mid' | 'bad';

export interface Profile { earn: number; spend: number; loan: number; saved: number; }
export interface Fix { cut: number; add: number; }

export interface ScenarioDef {
  key: ScenarioKey; name: string; desc: string; question: string;
  min: number; max: number; step: number; value: number;
  format: (v: number) => string;
}

export const SCENARIOS: ScenarioDef[] = [
  { key: 'job', name: 'I lose my job', desc: 'No income for a while', question: 'Months without income', min: 1, max: 12, step: 1, value: 6, format: v => v + ' months' },
  { key: 'med', name: 'Medical emergency', desc: 'One big surprise bill', question: 'Size of the bill', min: 20000, max: 500000, step: 10000, value: 200000, format: money },
  { key: 'hike', name: 'Everything gets pricier', desc: 'Your spending jumps', question: 'How much costs rise', min: 5, max: 50, step: 5, value: 20, format: v => v + '%' },
  { key: 'crash', name: 'Markets crash', desc: 'Savings take a hit', question: 'Share of savings lost', min: 10, max: 60, step: 5, value: 30, format: v => v + '%' },
];

export interface SimResult {
  paths: Float32Array;          // sims x (months + 1), row-major
  tough: Float32Array;          // 10th percentile per month
  likely: Float32Array;         // median per month
  lucky: Float32Array;          // 90th percentile per month
  risk: number;                 // % of futures that go below zero
  medianFirstNegative: number | null;
  buffer: number;               // extra savings so ~95% of futures stay above zero
  minBalance: number;
  maxBalance: number;
  endLikely: number;
  sims: number;
  months: number;
}

@Injectable({ providedIn: 'root' })
export class SimulationService {
  readonly SIMS = 500;
  readonly MONTHS = 24;

  private rng(a: number) {
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Monte Carlo run. Later this method can call the Node/Django backend instead. */
  run(profile: Profile, fix: Fix, key: ScenarioKey, value: number, seed = 7): SimResult {
    const N = this.SIMS, M = this.MONTHS, W = M + 1;
    const r = this.rng(seed);
    const normal = () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(6.2831853 * r());
    const paths = new Float32Array(N * W);
    const start = profile.saved + fix.add;
    const spend = Math.max(0, profile.spend - fix.cut);

    for (let i = 0; i < N; i++) {
      let b = start;
      paths[i * W] = b;
      for (let m = 0; m < M; m++) {
        let income = profile.earn, expense = spend;
        if (key === 'job' && m < value) income = 0;
        if (key === 'hike') expense *= 1 + value / 100;
        expense *= 1 + 0.1 * normal();
        b += income - expense - profile.loan;
        if (m === 0) {
          if (key === 'med') b -= value;
          if (key === 'crash') b -= start * value / 100;
        }
        paths[i * W + m + 1] = b;
      }
    }

    const lines = [new Float32Array(W), new Float32Array(W), new Float32Array(W)];
    const mins = new Float32Array(N), col = new Float32Array(N), firstNeg: number[] = [];
    let max = -1e12;
    for (let i = 0; i < N; i++) {
      let mn = 1e12, first = -1;
      for (let m = 0; m < W; m++) {
        const v = paths[i * W + m];
        if (v < mn) mn = v;
        if (v > max) max = v;
        if (v < 0 && first < 0) first = m;
      }
      mins[i] = mn;
      if (first >= 0) firstNeg.push(first);
    }
    [0.1, 0.5, 0.9].forEach((q, j) => {
      for (let m = 0; m < W; m++) {
        for (let i = 0; i < N; i++) col[i] = paths[i * W + m];
        col.sort();
        lines[j][m] = col[Math.floor(q * N)];
      }
    });
    mins.sort();
    firstNeg.sort((a, b) => a - b);
    const low = mins[Math.floor(0.05 * N)];

    return {
      paths, tough: lines[0], likely: lines[1], lucky: lines[2],
      risk: firstNeg.length / N * 100,
      medianFirstNegative: firstNeg.length ? firstNeg[firstNeg.length >> 1] : null,
      buffer: Math.max(0, Math.ceil(-low / 1000) * 1000),
      minBalance: mins[0], maxBalance: max, endLikely: lines[1][M], sims: N, months: M,
    };
  }

  moodForRisk(risk: number): Mood { return risk < 10 ? 'ok' : risk < 50 ? 'mid' : 'bad'; }
  moodForRunway(months: number): Mood { return months < 3 ? 'bad' : months < 6 ? 'mid' : 'ok'; }

  verdict(res: SimResult): { mood: Mood; headline: string; sub: string } {
    const mood = this.moodForRisk(res.risk), r = Math.round(res.risk);
    const headline = mood === 'ok' ? 'You’d likely be fine.'
      : mood === 'mid' ? 'It could get tight.'
      : res.medianFirstNegative !== null ? `You’d run out of money around month ${res.medianFirstNegative}.`
      : 'You’d probably run out of money.';
    const sub = mood === 'ok' ? `Safe in ${100 - r} of 100 possible futures.` : `${r} of 100 possible futures run out of money.`;
    return { mood, headline, sub };
  }
}
