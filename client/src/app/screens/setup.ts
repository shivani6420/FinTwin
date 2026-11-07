import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { TwinStateService } from '../twin-state.service';
import { Profile } from '../simulation.service';
import { money } from '../format';

interface Field { k: keyof Profile; label: string; hint?: string; min: number; max: number; step: number; }

@Component({
  selector: 'app-setup',
  template: `
    <div class="scr">
      <div class="top">
        @if (edit) { <button class="back" (click)="back()" aria-label="Back">‹</button> }
        <h1 style="margin:0">{{ edit ? 'Edit your twin' : 'Create your twin' }}</h1>
      </div>
      <p>Four numbers is all it takes. Stays on your device.</p>
      <div class="card sl">
        @for (f of fields; track f.k) {
          <label [attr.for]="'s-' + f.k">{{ f.label }}<output>{{ money(p[f.k]) }}</output></label>
          @if (f.hint) { <small>{{ f.hint }}</small> }
          <input [id]="'s-' + f.k" type="range" [min]="f.min" [max]="f.max" [step]="f.step" [value]="p[f.k]" (input)="set(f.k, $event)">
        }
      </div>
      <button class="btn" (click)="done()">{{ edit ? 'Save changes' : 'Create my twin' }}</button>
    </div>
  `,
})
export class SetupScreen {
  private state = inject(TwinStateService);
  private router = inject(Router);
  private loc = inject(Location);
  edit = inject(ActivatedRoute).snapshot.queryParamMap.get('edit') === '1';
  money = money;
  fields: Field[] = [
    { k: 'earn', label: 'You earn each month', min: 10000, max: 300000, step: 1000 },
    { k: 'spend', label: 'You spend each month', hint: 'Food, rent, bills, everything', min: 5000, max: 200000, step: 1000 },
    { k: 'loan', label: 'Loan payments (EMIs)', min: 0, max: 100000, step: 1000 },
    { k: 'saved', label: 'Savings you could use', min: 0, max: 2000000, step: 10000 },
  ];
  get p(): Profile { return this.state.profile(); }

  set(k: keyof Profile, e: Event): void {
    const v = +(e.target as HTMLInputElement).value;
    this.state.profile.update(p => ({ ...p, [k]: v }));
  }
  back(): void { this.loc.back(); }
  done(): void {
    this.state.onboarded.set(true);
    this.state.persist();
    this.router.navigate([this.edit ? '/me' : '/home']);
  }
}
