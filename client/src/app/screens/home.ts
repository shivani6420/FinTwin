import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TwinAvatar } from '../twin-avatar';
import { TwinStateService } from '../twin-state.service';
import { SimulationService } from '../simulation.service';
import { money } from '../format';

@Component({
  selector: 'app-home',
  imports: [TwinAvatar, RouterLink],
  template: `
    <div class="scr">
      <p style="margin:0">Hi there</p>
      <h1>Your money twin</h1>
      <div style="display:flex;align-items:center;gap:6px">
        <app-twin-avatar [mood]="mood" [size]="120" />
        <div class="bub">With no income, I could last about {{ runway.toFixed(1) }} months.</div>
      </div>
      <div class="card">
        <div class="stat"><span>Left over each month</span><b>{{ money(left) }}</b></div>
        <div class="stat"><span>Savings</span><b>{{ money(p.saved) }}</b></div>
      </div>
      <button class="btn" routerLink="/pick">Stress-test my twin</button>
    </div>
  `,
})
export class HomeScreen {
  private state = inject(TwinStateService);
  private sim = inject(SimulationService);
  money = money;
  get p() { return this.state.profile(); }
  get runway() { return this.p.saved / ((this.p.spend + this.p.loan) || 1); }
  get left() { return this.p.earn - this.p.spend - this.p.loan; }
  get mood() { return this.sim.moodForRunway(this.runway); }
}
