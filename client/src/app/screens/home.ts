import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TwinAvatar } from '../twin-avatar';
import { RiskAlert } from '../risk-alert';
import { TwinStateService } from '../twin-state.service';
import { SimulationService } from '../simulation.service';
import { computeWarnings, Warning } from '../warnings';
import { money } from '../format';

@Component({
  selector: 'app-home',
  imports: [TwinAvatar, RouterLink, RiskAlert],
  template: `
    <div class="scr">
      <p style="margin:0">Hi there</p>
      <h1>Your money twin</h1>
      <div style="display:flex;align-items:center;gap:6px">
        <app-twin-avatar [mood]="mood" [size]="120" />
        <div class="bub">With no income, I could last about {{ runway.toFixed(1) }} months.</div>
      </div>
      @if (warnings.length) {
        <button class="chip" style="border-color:var(--bad);color:var(--bad);margin-bottom:14px" (click)="showAlert.set(true)">
          ! {{ warnings.length }} early {{ warnings.length === 1 ? 'warning' : 'warnings' }}, tap to see
        </button>
      }
      <div class="card">
        <div class="stat"><span>Left over each month</span><b>{{ money(left) }}</b></div>
        <div class="stat"><span>Savings</span><b>{{ money(p.saved) }}</b></div>
      </div>
      <button class="btn" routerLink="/pick">Stress-test my twin</button>

      @if (showAlert()) {
        <app-risk-alert [warnings]="warnings" (fix)="fix()" (close)="dismiss()" />
      }
    </div>
  `,
})
export class HomeScreen {
  private state = inject(TwinStateService);
  private sim = inject(SimulationService);
  private router = inject(Router);
  money = money;
  showAlert = signal(false);

  constructor() {
    let seen = false;
    try { seen = sessionStorage.getItem('ft-alert-seen') === '1'; } catch { /* ignore */ }
    if (!seen && this.warnings.some(w => w.level === 'danger')) this.showAlert.set(true);
  }

  get p() { return this.state.profile(); }
  get runway() { return this.p.saved / ((this.p.spend + this.p.loan) || 1); }
  get left() { return this.p.earn - this.p.spend - this.p.loan; }
  get mood() { return this.sim.moodForRunway(this.runway); }
  get warnings(): Warning[] { return computeWarnings(this.p); }

  dismiss(): void {
    this.showAlert.set(false);
    try { sessionStorage.setItem('ft-alert-seen', '1'); } catch { /* ignore */ }
  }
  fix(): void {
    this.dismiss();
    this.router.navigate(['/setup'], { queryParams: { edit: 1 } });
  }
}
