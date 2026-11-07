import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { SCENARIOS, ScenarioDef, ScenarioKey } from '../simulation.service';
import { TwinStateService } from '../twin-state.service';

@Component({
  selector: 'app-cfg',
  template: `
    <div class="scr">
      <div class="top">
        <button class="back" (click)="back()" aria-label="Back">‹</button>
        <h1 style="margin:0;font-size:24px">{{ def.name }}</h1>
      </div>
      <div class="card sl" style="text-align:center">
        <p style="margin:0">{{ def.question }}</p>
        <div class="big">{{ def.format(value) }}</div>
        <input type="range" [min]="def.min" [max]="def.max" [step]="def.step" [value]="value"
               (input)="onInput($event)" [attr.aria-label]="def.question">
      </div>
      <p>We’ll play out 500 versions of your next 2 years with this happening.</p>
      <button class="btn" (click)="run()">Run the test</button>
    </div>
  `,
})
export class CfgScreen {
  private state = inject(TwinStateService);
  private loc = inject(Location);
  private router = inject(Router);
  def: ScenarioDef = SCENARIOS[0];

  constructor() {
    const key = inject(ActivatedRoute).snapshot.paramMap.get('key') as ScenarioKey;
    this.def = SCENARIOS.find(s => s.key === key) ?? SCENARIOS[0];
    this.state.scenario.set(this.def.key);
  }
  get value(): number { return this.state.values()[this.def.key]; }
  onInput(e: Event): void { this.state.setValue(this.def.key, +(e.target as HTMLInputElement).value); }
  back(): void { this.loc.back(); }
  run(): void {
    this.state.fix.set({ cut: 0, add: 0 });
    this.router.navigate(['/sim']);
  }
}
