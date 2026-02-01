import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router'; // הוספנו את הראוטר לניתוב בהתנתקות

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'auth_token';

  // הזרקנו גם את Router כדי שנוכל להעביר את המשתמש לדף ההתחברות כשהוא מתנתק
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(credentials: any) {
    return this.http.post<{ token: string; user: any }>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        this.saveToken(res.token);
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      }),
    );
  }

  register(userData: any) {
    return this.http.post<{ token: string; user: any }>(`${this.apiUrl}/register`, userData).pipe(
      tap((res) => {
        this.saveToken(res.token);
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      }),
    );
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // --- זו הפונקציה שהייתה חסרה! ---
  isLoggedIn(): boolean {
    // מחזיר "אמת" אם יש טוקן, ו"שקר" אם אין
    return !!localStorage.getItem(this.tokenKey);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
