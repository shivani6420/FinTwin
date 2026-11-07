import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { SCENARIOS } from '../simulation.service';

@Component({
  selector: 'app-pick',
  imports: [RouterLink],
  template: `
    <div class="scr">
      <div class="top">
        <button class="back" (click)="back()" aria-label="Back">‹</button>
        <h1 style="margin:0">What goes wrong?</h1>
      </div>
      <p>Pick one. It starts next month.</p>
      <div class="grid">
        @for (s of scenarios; track s.key) {
          <button class="tile" [routerLink]="['/cfg', s.key]">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              @switch (s.key) {
                @case ('job') { <rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/> }
                @case ('med') { <rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/> }
                @case ('hike') { <path d="M4 18l6-6 4 4 6-8"/><path d="M15 8h5v5"/> }
                @case ('crash') { <path d="M4 6l6 6 4-4 6 8"/><path d="M15 16h5v-5"/> }
              }
            </svg>
            <b>{{ s.name }}</b>
            <span>{{ s.desc }}</span>
          </button>
        }
      </div>
    </div>
  `,
})
export class PickScreen {
  scenarios = SCENARIOS;
  constructor(private loc: Location) {}
  back() { this.loc.back(); }
}
