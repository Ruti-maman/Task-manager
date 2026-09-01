import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './services/auth.interceptor'; // הייבוא של המיירט שלנו
import { demoBackendInterceptor } from './demo-backend.interceptor'; // מיירט הדמו ל-GitHub Pages

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // כאן אנחנו מפעילים את המיירט
    // מיירט הדמו רשום אחרון, כך שהוא מקבל את הבקשה אחרי שהטוקן כבר צורף אליה
    // ומחזיר את התשובה במקום השרת, כי ב-GitHub Pages אין שרת.
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, demoBackendInterceptor])),
  ],
};
