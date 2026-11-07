import { Component, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TwinAvatar } from '../twin-avatar';

@Component({
  selector: 'app-sim',
  imports: [TwinAvatar],
  template: `
    <div class="scr">
      <div class="c">
        <app-twin-avatar mood="bad" [size]="150" [wobble]="true" />
        <h1 style="margin-top:16px">{{ msg() }}</h1>
        <div class="pb"><i [style.width]="width()"></i></div>
      </div>
    </div>
  `,
})
export class SimScreen implements OnDestroy {
  private router = inject(Router);
  private messages = ['Waking up your twin…', 'Applying the bad news…', 'Playing out 500 futures…', 'Counting the damage…'];
  msg = signal(this.messages[0]);
  width = signal('0%');
  private timers: ReturnType<typeof setTimeout>[] = [];
  private ticker: ReturnType<typeof setInterval>;

  constructor() {
    let i = 0;
    this.timers.push(setTimeout(() => this.width.set('100%'), 60));
    this.ticker = setInterval(() => { i++; this.msg.set(this.messages[Math.min(i, 3)]); }, 600);
    this.timers.push(setTimeout(() => this.router.navigate(['/result'], { replaceUrl: true }), 2500));
  }
  ngOnDestroy(): void {
    clearInterval(this.ticker);
    this.timers.forEach(t => clearTimeout(t));
  }
}
