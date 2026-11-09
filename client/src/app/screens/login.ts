import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { TwinAvatar } from '../twin-avatar';
import { TwinStateService } from '../twin-state.service';

@Component({
  selector: 'app-login',
  imports: [TwinAvatar],
  template: `
    <div class="scr">
      <div class="c">
        <app-twin-avatar mood="ok" [size]="120" />
        <h1 style="margin-top:12px">{{ mode() === 'in' ? 'Welcome back' : 'Create your account' }}</h1>
        <p>{{ mode() === 'in' ? 'Sign in to see your own twin and history.' : 'Pick a username and a password.' }}</p>
        <div class="card sl" style="width:100%;text-align:left">
          <label for="u">Username</label>
          <input id="u" class="tx" type="text" autocomplete="username" [value]="user()" (input)="user.set(val($event))">
          <label for="p" style="margin-top:14px">Password</label>
          <input id="p" class="tx" type="password" autocomplete="current-password" [value]="pass()" (input)="pass.set(val($event))" (keyup.enter)="go()">
          @if (error()) { <p style="color:var(--bad);margin:10px 0 0;font-weight:700">{{ error() }}</p> }
        </div>
        <button class="btn" (click)="go()" [disabled]="busy()">{{ busy() ? 'One moment…' : mode() === 'in' ? 'Sign in' : 'Create account' }}</button>
        <button class="lnk" (click)="guest()">Continue without an account</button>
        <button class="lnk" (click)="toggle()">{{ mode() === 'in' ? 'New here? Create an account' : 'Already have an account? Sign in' }}</button>
      </div>
    </div>
  `,
})
export class LoginScreen {
  private auth = inject(AuthService);
  private router = inject(Router);
  private state = inject(TwinStateService);
  mode = signal<'in' | 'up'>('in');
  user = signal('');
  pass = signal('');
  error = signal('');
  busy = signal(false);

  val(e: Event): string { return (e.target as HTMLInputElement).value; }
  guest(): void { this.auth.continueAsGuest(); this.router.navigate([this.state.onboarded() ? '/home' : '/welcome']); }
  toggle(): void { this.mode.update(m => (m === 'in' ? 'up' : 'in')); this.error.set(''); }

  go(): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    const call = this.mode() === 'in'
      ? this.auth.login(this.user(), this.pass())
      : this.auth.register(this.user(), this.pass());
    call.subscribe({
      next: () => this.router.navigate([this.state.onboarded() ? '/home' : '/welcome']),
      error: (e: { error?: { error?: string } }) => {
        this.busy.set(false);
        this.error.set(e.error?.error ?? 'Could not reach the server. Is Django running?');
      },
    });
  }
}

