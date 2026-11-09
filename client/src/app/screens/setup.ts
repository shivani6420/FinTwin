import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { SourceKind, TwinStateService } from '../twin-state.service';
import { money } from '../format';

interface Preset { name: string; flag: boolean; }
interface Out { k: 'spend' | 'loan'; label: string; hint?: string; max: number; step: number; }

@Component({
  selector: 'app-setup',
  styles: [`
    .row { display: grid; grid-template-columns: 1fr 130px 34px; gap: 8px; align-items: center; margin-top: 10px; }
    .row .tx, .row2 .tx { margin-top: 0; }
    .amt { display: flex; align-items: center; gap: 4px; font-weight: 700; }
    .chk { grid-column: 1 / 4; font-size: 13px; color: var(--m); display: flex; gap: 8px; align-items: center; }
    .x { border: 2px solid var(--ink); background: var(--c); border-radius: 10px; height: 34px; font-weight: 800; }
    .pre { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 6px; }
    .pre button { border: 2px solid var(--ink); background: var(--bg); border-radius: 99px; padding: 6px 12px; font-weight: 700; font-size: 13px; }
    .hint { font-size: 13px; margin: 0 0 4px; }
    .row2 { display: grid; grid-template-columns: 1fr 130px; gap: 10px; align-items: center; }
  `],
  template: `
    <div class="scr">
      <div class="top">
        @if (edit) { <button class="back" (click)="back()" aria-label="Back">‹</button> }
        <h1 style="margin:0">{{ edit ? 'Edit your twin' : 'Create your twin' }}</h1>
      </div>
      <p>Add every source of money. You can type any number.</p>

      <div class="card">
        <h2>Money coming in</h2>
        <p class="hint">Tick “Stops if I lose my job” for pay that ends with your job. The rest keeps coming in.</p>
        @for (s of state.incomeSources(); track s.id) {
          <div class="row">
            <input class="tx" type="text" placeholder="Name this income" [value]="s.name" (input)="rename('income', s.id, $event)" aria-label="Income name">
            <div class="amt"><span>₹</span><input class="tx" type="number" min="0" step="1000" placeholder="0" [attr.value]="s.amount || ''" (input)="setAmount('income', s.id, $event)" aria-label="Amount per month"></div>
            <button class="x" (click)="remove('income', s.id)" aria-label="Remove">✕</button>
            <label class="chk"><input type="checkbox" [checked]="s.flag" (change)="setFlag('income', s.id, $event)"> Stops if I lose my job</label>
          </div>
        }
        <div class="pre">
          @for (p of incomePresets; track p.name) { <button (click)="add('income', p)">+ {{ p.name }}</button> }
          <button (click)="add('income', { name: '', flag: true })">+ Other</button>
        </div>
        <div class="stat"><span>Total coming in</span><b>{{ money(state.profile().earn) }}</b></div>
        <div class="stat"><span>Keeps coming if I lose my job</span><b>{{ money(state.profile().keep ?? 0) }}</b></div>
      </div>

      <div class="card sl">
        <h2>Money going out</h2>
        @for (f of outgoing; track f.k) {
          <label [attr.for]="'o-' + f.k">{{ f.label }}</label>
          @if (f.hint) { <small>{{ f.hint }}</small> }
          <div class="row2">
            <input [id]="'o-' + f.k" type="range" min="0" [max]="f.max" [step]="f.step" [value]="state.profile()[f.k]" (input)="setP(f.k, $event)">
            <div class="amt"><span>₹</span><input class="tx" type="number" min="0" [step]="f.step" [value]="state.profile()[f.k]" (input)="setP(f.k, $event)" [attr.aria-label]="f.label"></div>
          </div>
        }
      </div>

      <div class="card">
        <h2>Your savings</h2>
        <p class="hint">Switch off money you can’t get quickly, like PPF or EPF.</p>
        @for (s of state.savingsSources(); track s.id) {
          <div class="row">
            <input class="tx" type="text" placeholder="Name this saving" [value]="s.name" (input)="rename('savings', s.id, $event)" aria-label="Savings name">
            <div class="amt"><span>₹</span><input class="tx" type="number" min="0" step="10000" placeholder="0" [attr.value]="s.amount || ''" (input)="setAmount('savings', s.id, $event)" aria-label="Amount saved"></div>
            <button class="x" (click)="remove('savings', s.id)" aria-label="Remove">✕</button>
            <label class="chk"><input type="checkbox" [checked]="s.flag" (change)="setFlag('savings', s.id, $event)"> Count it (I can use it quickly)</label>
          </div>
        }
        <div class="pre">
          @for (p of savingsPresets; track p.name) { <button (click)="add('savings', p)">+ {{ p.name }}</button> }
          <button (click)="add('savings', { name: '', flag: true })">+ Other</button>
        </div>
        <div class="stat"><span>Savings I could use</span><b>{{ money(state.profile().saved) }}</b></div>
        @if (notCounted() > 0) { <div class="stat"><span>Not counted</span><b>{{ money(notCounted()) }}</b></div> }
      </div>

      <button class="btn" (click)="done()">{{ edit ? 'Save changes' : 'Create my twin' }}</button>
    </div>
  `,
})
export class SetupScreen {
  state = inject(TwinStateService);
  private router = inject(Router);
  private loc = inject(Location);
  edit = inject(ActivatedRoute).snapshot.queryParamMap.get('edit') === '1';
  money = money;

  incomePresets: Preset[] = [
    { name: 'Salary', flag: true }, { name: 'Freelance', flag: true }, { name: 'Side business', flag: false },
    { name: 'Rent received', flag: false }, { name: 'Interest / dividends', flag: false },
    { name: 'Pension', flag: false }, { name: 'Family support', flag: false },
  ];
  savingsPresets: Preset[] = [
    { name: 'Bank savings', flag: true }, { name: 'Fixed deposit', flag: true }, { name: 'Mutual funds', flag: true },
    { name: 'Stocks', flag: true }, { name: 'Gold', flag: false }, { name: 'Cash at home', flag: true },
    { name: 'PPF / EPF', flag: false },
  ];
  outgoing: Out[] = [
    { k: 'spend', label: 'You spend each month', hint: 'Food, rent, bills, everything', max: 200000, step: 1000 },
    { k: 'loan', label: 'Loan payments (EMIs)', max: 100000, step: 1000 },
  ];

  private num(e: Event): number { return Math.max(0, +(e.target as HTMLInputElement).value || 0); }
  add(kind: SourceKind, p: Preset): void { this.state.addSource(kind, p.name, p.flag); }
  remove(kind: SourceKind, id: number): void { this.state.removeSource(kind, id); }
  rename(kind: SourceKind, id: number, e: Event): void { this.state.updateSource(kind, id, { name: (e.target as HTMLInputElement).value }); }
  setAmount(kind: SourceKind, id: number, e: Event): void { this.state.updateSource(kind, id, { amount: this.num(e) }); }
  setFlag(kind: SourceKind, id: number, e: Event): void { this.state.updateSource(kind, id, { flag: (e.target as HTMLInputElement).checked }); }
  setP(k: 'spend' | 'loan', e: Event): void {
    const v = this.num(e);
    this.state.profile.update(p => ({ ...p, [k]: v }));
  }
  notCounted(): number {
    return this.state.savingsSources().filter(s => !s.flag).reduce((t, s) => t + (s.amount || 0), 0);
  }
  back(): void { this.loc.back(); }
  done(): void {
    this.state.onboarded.set(true);
    this.state.persist();
    this.router.navigate([this.edit ? '/me' : '/home']);
  }
}