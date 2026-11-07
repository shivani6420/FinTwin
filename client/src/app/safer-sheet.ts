import { Component, inject } from '@angular/core';
import { TwinStateService } from './twin-state.service';
import { money } from './format';

@Component({
  selector: 'app-safer-sheet',
  template: `
    <div id="sheet" role="dialog" aria-label="Make it safer" [class.open]="state.sheetOpen()">
      <h2>Make it safer</h2>
      <p>Try these and watch the result change.</p>
      <div class="sl">
        <label for="cut">Spend less each month
          <output>{{ state.fix().cut ? money(state.fix().cut) + ' less' : 'No change' }}</output></label>
        <input id="cut" type="range" min="0" max="20000" step="500" [value]="state.fix().cut" (input)="set('cut', $event)">
        <label for="add">Build a bigger emergency fund
          <output>{{ state.fix().add ? '+' + money(state.fix().add) : 'No change' }}</output></label>
        <input id="add" type="range" min="0" max="500000" step="10000" [value]="state.fix().add" (input)="set('add', $event)">
      </div>
      <p style="margin:14px 0 0;font-weight:700;color:var(--ink)">{{ text() }}</p>
      <button class="btn" (click)="state.sheetOpen.set(false)">Done</button>
    </div>
  `,
})
export class SaferSheet {
  state = inject(TwinStateService);
  money = money;
  set(k: 'cut' | 'add', e: Event): void {
    const v = +(e.target as HTMLInputElement).value;
    this.state.fix.update(f => ({ ...f, [k]: v }));
  }
  text(): string {
    const f = this.state.fix();
    return f.cut || f.add ? `Now ${this.state.riskNow()} in 100 futures run out of money.` : 'Drag a slider and watch the result change.';
  }
}
