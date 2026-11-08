import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';
import { Fix, Profile, ScenarioKey, SimResult } from './simulation.service';

interface ServerResult {
  tough: number[]; likely: number[]; lucky: number[]; paths: number[][];
  risk: number; medianFirstNegative: number | null; buffer: number;
  minBalance: number; maxBalance: number; endLikely: number; sims: number; months: number;
  requestId?: number;
}

@Injectable({ providedIn: 'root' })
export class BackendService {
  private socket = io('http://localhost:4000', { reconnectionAttempts: 5 });
  private counter = 0;

  run(profile: Profile, fix: Fix, key: ScenarioKey, value: number): Observable<SimResult> {
    const body = { ...profile, ...fix, scenario: key, value };
    return new Observable<SimResult>(sub => {
      const id = ++this.counter;
      const send = () => this.socket.emit('run_simulation', { ...body, requestId: id });
      const onResult = (r: ServerResult) => {
        if (r.requestId !== id) return;
        cleanup();
        sub.next(this.convert(r));
        sub.complete();
      };
      const onError = (e: { message: string; requestId?: number }) => {
        if (e.requestId !== id) return;
        cleanup();
        sub.error(new Error(e.message));
      };
      const timer = setTimeout(() => { cleanup(); sub.error(new Error('Node relay not reachable')); }, 4000);
      const cleanup = () => {
        clearTimeout(timer);
        this.socket.off('simulation_result', onResult);
        this.socket.off('simulation_error', onError);
        this.socket.off('connect', send);
      };
      this.socket.on('simulation_result', onResult);
      this.socket.on('simulation_error', onError);
      if (this.socket.connected) send(); else this.socket.on('connect', send);
      return cleanup;
    });
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
