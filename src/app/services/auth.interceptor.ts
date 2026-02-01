import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // בדיקה: האם האינטרספטור בכלל התחיל לעבוד?
  console.log('🔍 Interceptor is running for URL:', req.url);

  const token = localStorage.getItem('auth_token');

  if (token) {
    // בדיקה: האם מצאנו טוקן?
    console.log('✅ Token found! Attaching to header...');
    
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  // בדיקה: אם הגענו לפה, סימן שאין טוקן
  console.warn('⚠️ No token found in LocalStorage. Sending request without auth.');
  return next(req);
};