import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { TwinStateService } from '../twin-state.service';
import { BackendService } from '../backend.service';
import { money } from '../format';

@Component({
  selector: 'app-me',
  imports: [RouterLink],
  template: `
    <div class="scr">
      <h1>Me</h1><p>{{ auth.loggedIn ? 'Signed in as ' + auth.username() : 'Using FinTwin as a guest' }}</p>
      <div class="card">
        <div class="stat"><span>Earn</span><b>{{ money(p.earn) }}</b></div>
        <div class="stat"><span>Spend</span><b>{{ money(p.spend) }}</b></div>
        <div class="stat"><span>Loan payments</span><b>{{ money(p.loan) }}</b></div>
        <div class="stat"><span>Savings</span><b>{{ money(p.saved) }}</b></div>
      </div>
      <button class="btn" routerLink="/setup" [queryParams]="{ edit: 1 }">Edit my twin</button>
      <button class="btn alt" (click)="toggleTheme()">Switch theme</button><button class="btn alt" (click)="logout()">Log out</button>
      <button class="btn alt" (click)="clear()">Clear history</button>
      <p style="margin-top:18px;font-size:13px">FinTwin is a college prototype. The numbers come from simplified assumptions, so treat them as possibilities, not predictions or financial advice.</p>
    </div>
  `,
})
export class MeScreen {
  private state = inject(TwinStateService); auth = inject(AuthService); private router = inject(Router);
  private backend = inject(BackendService);
  money = money;
  get p() { return this.state.profile(); }

  logout(): void { this.auth.logout(); this.state.history.set([]); this.state.persist(); this.router.navigate(['/login']); }

  toggleTheme(): void {
    const r = document.documentElement;
    const dark = r.dataset['theme'] ? r.dataset['theme'] === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
    r.dataset['theme'] = dark ? 'light' : 'dark';
  }
  clear(): void {
    this.state.history.set([]);
    this.backend.clearRuns().subscribe({ error: () => {} });
    this.state.persist();
  }
}



