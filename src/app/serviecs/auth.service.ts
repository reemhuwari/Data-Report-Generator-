import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable()
export class AuthService {
  signup(payload: any): Observable<any> {
    // حفظ محلي (جرب مع json-server لاحقاً)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push({ id: Date.now(), ...payload });
    localStorage.setItem('users', JSON.stringify(users));
    return of(true);
  }

  login(email: string, password: string): Observable<boolean> {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const u = users.find((x:any)=>x.email===email && x.password===password);
    if (u) {
      localStorage.setItem('currentUser', JSON.stringify(u));
      return of(true);
    }
    return of(false);
  }

  logout() { localStorage.removeItem('currentUser'); }
}
