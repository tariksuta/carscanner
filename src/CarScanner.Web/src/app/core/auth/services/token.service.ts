import { Injectable } from '@angular/core';
import { APP_CONSTANTS } from '../../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class TokenService {
  getAccessToken(): string | null {
    return localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN);
  }

  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    console.log('isTokenExpired - token exists:', !!token);
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expMs = payload.exp * 1000;
      const now = Date.now();
      console.log('isTokenExpired - exp:', payload.exp, 'expMs:', expMs, 'now:', now, 'expired:', expMs < now);
      return expMs < now;
    } catch (e) {
      console.error('isTokenExpired - parse error:', e);
      return true;
    }
  }
}
