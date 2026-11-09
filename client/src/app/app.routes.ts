import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { TwinStateService } from './twin-state.service';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';
import { HomeScreen } from './screens/home';
import { PickScreen } from './screens/pick';
import { CfgScreen } from './screens/cfg';
import { SimScreen } from './screens/sim';
import { ResultScreen } from './screens/result';
import { HistoryScreen } from './screens/history';
import { MeScreen } from './screens/me';
import { WelcomeScreen } from './screens/welcome';
import { SetupScreen } from './screens/setup';
import { LoginScreen } from './screens/login';

export const routes: Routes = [
  {
    path: '', pathMatch: 'full',
    redirectTo: () => {
      const auth = inject(AuthService);
      const state = inject(TwinStateService);
      return auth.allowed ? (state.onboarded() ? 'home' : 'welcome') : 'login';
    },
  },
  { path: 'login', component: LoginScreen },
  { path: 'welcome', component: WelcomeScreen, canActivate: [authGuard] },
  { path: 'setup', component: SetupScreen, canActivate: [authGuard] },
  { path: 'home', component: HomeScreen, canActivate: [authGuard] },
  { path: 'pick', component: PickScreen, canActivate: [authGuard] },
  { path: 'cfg/:key', component: CfgScreen, canActivate: [authGuard] },
  { path: 'sim', component: SimScreen, canActivate: [authGuard] },
  { path: 'result', component: ResultScreen, canActivate: [authGuard] },
  { path: 'history', component: HistoryScreen, canActivate: [authGuard] },
  { path: 'me', component: MeScreen, canActivate: [authGuard] },
];

