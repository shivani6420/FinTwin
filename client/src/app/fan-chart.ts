import { Component, Input, signal } from '@angular/core';
import { SimResult } from './simulation.service';
import { money, short } from './format';

interface Tick { y: number; label: string; }
interface Faint { d: string; neg: boolean; }
interface Line { d: string; color: string; name: string; ly: number; }

@Component({
  selector: 'app-fan-chart',
  template: `
    <svg class="ch" viewBox="0 0 340 230" role="img" aria-label="Chart of possible balances over 24 months"
         (pointermove)="onMove($event)" (pointerleave)="hover.set(null)">
      @for (t of ticks; track t.label) {
        <line class="gr" [attr.x1]="L" [attr.x2]="L + pw" [attr.y1]="t.y" [attr.y2]="t.y"/>
        <text [attr.x]="L - 5" [attr.y]="t.y + 4" text-anchor="end">{{ t.label }}</text>
      }
      <text [attr.x]="x(0)" y="224" text-anchor="middle">Now</text>
      <text [attr.x]="x(12)" y="224" text-anchor="middle">12 mo</text>
      <text [attr.x]="x(24)" y="224" text-anchor="middle">24 mo</text>
      <rect class="zone" [attr.x]="L" [attr.y]="zoneY" [attr.width]="pw" [attr.height]="zoneH"/>
      @if (zoneH > 16) {
        <text [attr.x]="L + 4" [attr.y]="zoneY + 13" style="fill:var(--bad);font-weight:700">Out of money</text>
      }
      @for (f of faint; track $index) {
        <path class="fut" [class.n]="f.neg" [attr.d]="f.d"/>
      }
      @for (l of lines; track l.name) {
        <path class="ln dr" pathLength="1" [style.stroke]="l.color" [attr.d]="l.d"/>
        <text class="lb" [attr.x]="L + pw + 5" [attr.y]="l.ly + 4" [style.fill]="l.color">{{ l.name }}</text>
      }
      @if (hover() !== null) {
        <line [attr.x1]="x(hover()!)" [attr.x2]="x(hover()!)" [attr.y1]="T" [attr.y2]="T + ph"
              stroke="currentColor" opacity=".5"/>
      }
    </svg>
    <div id="rd">{{ readout() }}</div>
  `,
})
export class FanChart {
  readonly L = 44; readonly pw = 234; readonly T = 8; readonly ph = 200;
  ticks: Tick[] = []; faint: Faint[] = []; lines: Line[] = [];
  zoneY = 0; zoneH = 0;
  hover = signal<number | null>(null);
  private res!: SimResult;
  private y0 = 0; private y1 = 1;

  @Input({ required: true }) set result(r: SimResult) { this.res = r; this.build(); }

  x(m: number): number { return this.L + m / this.res.months * this.pw; }
  private y(v: number): number { return this.T + (this.y1 - v) / (this.y1 - this.y0) * this.ph; }

  private build(): void {
    const r = this.res, M = r.months, W = M + 1;
    const lo = Math.min(0, r.minBalance), span = r.maxBalance - lo;
    this.y0 = lo - span * 0.05;
    this.y1 = r.maxBalance + span * 0.05;

    const q = (this.y1 - this.y0) / 4, e = 10 ** Math.floor(Math.log10(q)), fr = q / e;
    const u = (fr <= 1 ? 1 : fr <= 2 ? 2 : fr <= 5 ? 5 : 10) * e;
    this.ticks = [];
    for (let v = Math.ceil(this.y0 / u) * u; v <= this.y1; v += u) this.ticks.push({ y: this.y(v), label: short(v) });

    this.zoneY = this.y(0);
    this.zoneH = this.y(this.y0) - this.y(0);

    this.faint = [];
    for (let i = 0; i < r.sims; i += 12) {
      let d = '', neg = false;
      for (let m = 0; m < W; m++) {
        const v = r.paths[i * W + m];
        if (v < 0) neg = true;
        d += (m ? 'L' : 'M') + this.x(m) + ' ' + this.y(v);
      }
      this.faint.push({ d, neg });
    }

    const defs = [
      { arr: r.lucky, color: 'var(--ok)', name: 'Lucky' },
      { arr: r.likely, color: 'var(--p)', name: 'Likely' },
      { arr: r.tough, color: 'var(--bad)', name: 'Tough' },
    ];
    this.lines = defs.map(s => {
      let d = '';
      for (let m = 0; m < W; m++) d += (m ? 'L' : 'M') + this.x(m) + ' ' + this.y(s.arr[m]);
      return { d, color: s.color, name: s.name, ly: this.y(s.arr[M]) };
    });
    let last = -99;
    for (const l of this.lines) { if (l.ly - last < 13) l.ly = last + 13; last = l.ly; }
  }

  onMove(e: PointerEvent): void {
    const b = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const vx = (e.clientX - b.left) / b.width * 340;
    this.hover.set(Math.max(0, Math.min(this.res.months, Math.round((vx - this.L) / this.pw * this.res.months))));
  }

  readout(): string {
    const m = this.hover();
    if (m === null) return 'Touch the chart to read any month. Faint lines are single futures.';
    if (m === 0) return `Right now you have ${money(this.res.likely[0])}.`;
    return `Month ${m}: most likely ${money(this.res.likely[m])}. Tough case ${money(this.res.tough[m])}, lucky case ${money(this.res.lucky[m])}.`;
  }
}
