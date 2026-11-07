import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TwinAvatar } from '../twin-avatar';

interface Slide { mood: 'ok' | 'mid' | 'bad'; title: string; text: string; }

@Component({
  selector: 'app-welcome',
  imports: [TwinAvatar],
  template: `
    <div class="scr">
      <div class="c">
        <app-twin-avatar [mood]="slide().mood" [size]="170" />
        <h1 style="margin-top:14px">{{ slide().title }}</h1>
        <p>{{ slide().text }}</p>
        <div class="dots">
          @for (s of slides; track $index) { <i [class.on]="$index === i()"></i> }
        </div>
        <button class="btn" (click)="next()">{{ i() < 2 ? 'Next' : 'Let’s start' }}</button>
        <button class="lnk" (click)="skip()">Skip</button>
      </div>
    </div>
  `,
})
export class WelcomeScreen {
  private router = inject(Router);
  slides: Slide[] = [
    { mood: 'ok', title: 'Meet your money twin', text: 'A digital copy of your finances. We test bad days on it, so the real you doesn’t have to.' },
    { mood: 'mid', title: 'Pick a bad day', text: 'Job loss, a medical bill, rising prices, a market crash. Tap one and see what happens.' },
    { mood: 'bad', title: 'See 100 possible futures', text: 'We play out your next two years again and again, and count how many end badly.' },
  ];
  i = signal(0);
  slide = computed(() => this.slides[this.i()]);

  next(): void { this.i() < 2 ? this.i.update(v => v + 1) : this.skip(); }
  skip(): void { this.router.navigate(['/setup']); }
}
