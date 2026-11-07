import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Fix, Profile, ScenarioKey, SimResult } from './simulation.service';

interface ServerResult {
  tough: number[]; likely: number[]; lucky: number[]; paths: number[][];
  risk: number; medianFirstNegative: number | null; buffer: number;
  minBalance: number; maxBalance: number; endLikely: number; sims: number; months: number;
}

@Injectable({ providedIn: 'root' })
export class BackendService {
  private http = inject(HttpClient);
  private url = 'http://127.0.0.1:8000/api/simulate/';

  run(profile: Profile, fix: Fix, key: ScenarioKey, value: number): Observable<SimResult> {
    const body = { ...profile, ...fix, scenario: key, value };
    return this.http.post<ServerResult>(this.url, body).pipe(map(r => this.convert(r)));
  }

  private convert(r: ServerResult): SimResult {
    const W = r.months + 1;
    const paths = new Float32Array(r.sims * W);
    r.paths.forEach((row, k) => paths.set(row, k * 12 * W));
    return {
      paths,
      tough: Float32Array.from(r.tough),
      likely: Float32Array.from(r.likely),
      lucky: Float32Array.from(r.lucky),
      risk: r.risk,
      medianFirstNegative: r.medianFirstNegative,
      buffer: r.buffer,
      minBalance: r.minBalance,
      maxBalance: r.maxBalance,
      endLikely: r.endLikely,
      sims: r.sims,
      months: r.months,
    };
  }
}
