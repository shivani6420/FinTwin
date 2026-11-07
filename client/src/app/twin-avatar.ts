import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-twin-avatar',
  standalone: true,
  template: `
    <svg [class.wob]="wobble" [attr.width]="size" [attr.height]="size" viewBox="0 0 100 100" role="img" [attr.aria-label]="label">
      <circle cx="56" cy="54" r="38" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-dasharray="5 5" opacity=".5"/>
      <circle cx="50" cy="50" r="38" [attr.fill]="fill" stroke="#1a1033" stroke-width="3"/>
      <circle cx="38" cy="44" r="4.5" fill="#1a1033"/>
      <circle cx="62" cy="44" r="4.5" fill="#1a1033"/>
      <g fill="none" stroke="#1a1033" stroke-width="3.2" stroke-linecap="round">
        @if (mood === 'ok') { <path d="M38 66q12 14 24 0"/> }
        @if (mood === 'mid') { <path d="M40 70h20"/> }
        @if (mood === 'bad') { <path d="M38 74q12-12 24 0"/> }
      </g>
      @if (mood === 'bad') { <path d="M72 40q4 8 0 12q-4-4 0-12" fill="#7dd3fc" stroke="#1a1033" stroke-width="2"/> }
    </svg>
  `,
})
export class TwinAvatar {
  @Input() mood: 'ok' | 'mid' | 'bad' = 'ok';
  @Input() size = 120;
  @Input() wobble = false;

  get fill(): string { return { ok: '#17b26a', mid: '#ffb020', bad: '#ff4d6d' }[this.mood]; }
  get label(): string { return 'Your twin looks ' + (this.mood === 'ok' ? 'happy' : this.mood === 'mid' ? 'worried' : 'stressed'); }
}
