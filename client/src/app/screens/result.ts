import { Component, OnDestroy, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TwinAvatar } from '../twin-avatar';
import { FanChart } from '../fan-chart';
import { TwinStateService } from '../twin-state.service';
import { SCENARIOS, ScenarioDef, SimulationService } from '../simulation.service';
import { money } from '../format';

@Component({
  selector: 'app-result',
  imports: [TwinAvatar, FanChart, RouterLink],
  template: `
    <div class="scr">
      <div class="top">
        <button class="back" routerLink="/home" aria-label="Home">⌂</button>
        <h2 style="margin:0">{{ def.name }}: {{ def.format(value) }}</h2>
      </div>
      <div class="top" style="justify-content:center">
        <app-twin-avatar [mood]="verdict().mood" [size]="110" [wobble]="verdict().mood === 'bad'" />
      </div>
      <div [class]="'vd ' + verdict().mood" aria-live="polite">
        <h2>{{ verdict().headline }}</h2>
        <p>{{ verdict().sub }}</p>
        <div class="dg" aria-hidden="true">
          @for (d of dots; track $index) { <i [class.x]="$index < risk()"></i> }
        </div>
      </div>
      <div class="card">
        <h2 style="font-size:17px">Your next 2 years</h2>
        <app-fan-chart [result]="res()" />
      </div>
      <div class="tl">
        <div><b>{{ risk() }} in 100</b><span>futures run out</span></div>
        <div><b>{{ res().buffer ? money(res().buffer) : 'None' }}</b><span>extra savings to be 95% safe</span></div>
        <div style="grid-column:1/3"><b>{{ money(res().endLikely) }}</b><span>you’d most likely have after 2 years</span></div>
      </div>
      <button class="btn" (click)="state.sheetOpen.set(true)">Make it safer</button>
      <button class="btn alt" routerLink="/pick">Try another bad day</button>
    </div>
  `,
})
export class ResultScreen implements OnDestroy {
  state = inject(TwinStateService);
  private sim = inject(SimulationService);
  money = money;
  dots = Array.from({ length: 100 });
  def: ScenarioDef;
  value: number;

  res = computed(() => this.sim.run(this.state.profile(), this.state.fix(), this.def.key, this.value));
  verdict = computed(() => this.sim.verdict(this.res()));
  risk = computed(() => Math.round(this.res().risk));

  constructor() {
    this.def = SCENARIOS.find(s => s.key === this.state.scenario()) ?? SCENARIOS[0];
    this.value = this.state.values()[this.def.key];
    this.state.addHistory({ key: this.def.key, value: this.value, risk: this.risk(), ts: Date.now() });
    effect(() => this.state.riskNow.set(this.risk()));
  }
  ngOnDestroy(): void { this.state.sheetOpen.set(false); }
}
