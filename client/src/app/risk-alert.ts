import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Warning } from './warnings';

@Component({
  selector: 'app-risk-alert',
  styles: [`
    .ov { position: absolute; inset: 0; background: rgba(10, 5, 25, .75); display: grid; place-items: center; padding: 18px; z-index: 20; }
    .box { background: var(--c); border: 3px solid var(--bad); border-radius: 24px; padding: 20px; width: 100%; max-width: 360px; max-height: 100%; overflow: auto; text-align: center; box-shadow: 0 6px 0 var(--bad); }
    .ico { width: 58px; height: 58px; border-radius: 50%; background: var(--bad); color: #fff; font: 800 36px var(--hd); display: grid; place-items: center; margin: 0 auto 8px; animation: pulse 1.2s ease-in-out infinite; }
    @keyframes pulse { 50% { transform: scale(1.12); } }
    @media (prefers-reduced-motion: reduce) { .ico { animation: none; } }
    h2 { margin: 0 0 4px; }
    .w { text-align: left; border: 2px solid var(--ln); border-radius: 14px; padding: 10px 12px; margin: 8px 0; display: grid; gap: 2px; }
    .w.d { border-color: var(--bad); }
    .w b { color: var(--bad); }
    .w span { font-size: 14px; color: var(--m); }
  `],
  template: `
    <div class="ov" role="alertdialog" aria-modal="true" aria-label="Early warning">
      <div class="box">
        <div class="ico" aria-hidden="true">!</div>
        <h2>Early warning</h2>
        <p>Your twin found problems before any bad day happens.</p>
        @for (w of warnings; track w.title) {
          <div class="w" [class.d]="w.level === 'danger'"><b>{{ w.title }}</b><span>{{ w.text }}</span></div>
        }
        <button class="btn" (click)="fix.emit()">Fix my numbers</button>
        <button class="lnk" (click)="close.emit()">Got it, show me anyway</button>
      </div>
    </div>
  `,
})
export class RiskAlert {
  @Input() warnings: Warning[] = [];
  @Output() fix = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
