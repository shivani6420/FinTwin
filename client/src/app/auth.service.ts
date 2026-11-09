import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthReply { token: string; username: string; }
const KEY = 'ft-auth';
const GUEST = 'ft-guest';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private api = 'http://127.0.0.1:8000/api';
  token = signal<string | null>(null);
  username = signal('');
  guest = signal(false);

  constructor() {
    try {
      const j = JSON.parse(localStorage.getItem(KEY) || '{}');
      if (j.token) { this.token.set(j.token); this.username.set(j.username || ''); }
      this.guest.set(localStorage.getItem(GUEST) === '1');
    } catch { /* ignore broken storage */ }
  }

  get loggedIn(): boolean { return !!this.token(); }
  get allowed(): boolean { return this.loggedIn || this.guest(); }

  continueAsGuest(): void {
    this.guest.set(true);
    try { localStorage.setItem(GUEST, '1'); } catch { /* ignore */ }
  }
  login(username: string, password: string): Observable<AuthReply> {
    return this.http.post<AuthReply>(this.api + '/login/', { username, password }).pipe(tap(r => this.store(r)));
  }
  register(username: string, password: string): Observable<AuthReply> {
    return this.http.post<AuthReply>(this.api + '/register/', { username, password }).pipe(tap(r => this.store(r)));
  }
  logout(): void {
    this.token.set(null);
    this.username.set('');
    this.guest.set(false);
    try { localStorage.removeItem(KEY); localStorage.removeItem(GUEST); } catch { /* ignore */ }
  }
  private store(r: AuthReply): void {
    this.token.set(r.token);
    this.username.set(r.username);
    this.guest.set(false);
    try { localStorage.setItem(KEY, JSON.stringify(r)); localStorage.removeItem(GUEST); } catch { /* ignore */ }
  }
}
