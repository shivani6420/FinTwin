import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TwinAvatar } from '../twin-avatar';
import { HistoryItem, TwinStateService } from '../twin-state.service';
import { BackendService } from '../backend.service';
import { SCENARIOS, ScenarioDef, ScenarioKey } from '../simulation.service';

@Component({
  selector: 'app-history',
  imports: [TwinAvatar, RouterLink, DatePipe],
  template: `
    <div class="scr">
      <h1>History</h1>
      <p>{{ fromServer() ? 'Saved on the server.' : 'Saved in this browser.' }}</p>
      @for (h of items(); track h.ts) {
        <button class="hist" (click)="open(h)">
          <span [class]="'badge ' + badge(h.risk)">{{ h.risk }}%</span>
          <div>
            <b>{{ def(h.key).name }}</b><br>
            <small style="color:var(--m)">{{ def(h.key).format(h.value) }}, {{ h.ts | date:'d MMM' }}</small>
          </div>
        </button>
      } @empty {
        <div class="card c" style="min-height:0">
          <app-twin-avatar mood="mid" [size]="100" />
          <h2 style="margin-top:8px">No tests yet</h2>
          <p>Run your first one and it shows up here.</p>
          <button class="btn" routerLink="/pick">Start a test</button>
        </div>
      }
    </div>
  `,
})
export class HistoryScreen {
  state = inject(TwinStateService);
  private backend = inject(BackendService);
  private router = inject(Router);
  items = signal<HistoryItem[]>(this.state.history());
  fromServer = signal(false);

  constructor() {
    this.backend.runs().subscribe({
      next: list => { this.items.set(list); this.fromServer.set(true); },
      error: () => this.items.set(this.state.history()),
    });
  }
  def(key: ScenarioKey): ScenarioDef { return SCENARIOS.find(s => s.key === key) ?? SCENARIOS[0]; }
  badge(risk: number): string { return risk < 10 ? 'ok' : risk < 50 ? 'mid' : 'bad'; }
  open(h: HistoryItem): void {
    this.state.setValue(h.key, h.value);
    this.router.navigate(['/cfg', h.key]);
  }
}
