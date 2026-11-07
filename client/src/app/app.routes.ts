import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { TwinStateService } from './twin-state.service';
import { HomeScreen } from './screens/home';
import { PickScreen } from './screens/pick';
import { CfgScreen } from './screens/cfg';
import { SimScreen } from './screens/sim';
import { ResultScreen } from './screens/result';
import { HistoryScreen } from './screens/history';
import { MeScreen } from './screens/me';
import { WelcomeScreen } from './screens/welcome';
import { SetupScreen } from './screens/setup';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: () => (inject(TwinStateService).onboarded() ? 'home' : 'welcome') },
  { path: 'welcome', component: WelcomeScreen },
  { path: 'setup', component: SetupScreen },
  { path: 'home', component: HomeScreen },
  { path: 'pick', component: PickScreen },
  { path: 'cfg/:key', component: CfgScreen },
  { path: 'sim', component: SimScreen },
  { path: 'result', component: ResultScreen },
  { path: 'history', component: HistoryScreen },
  { path: 'me', component: MeScreen },
];
