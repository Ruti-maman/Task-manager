import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './services/auth.interceptor'; // הייבוא של המיירט שלנו

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // כאן אנחנו מפעילים את המיירט
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
};
