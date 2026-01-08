/**
 * Authentication utilities for JWT handling
 */

export interface User {
  id: string;
  email: string;
  username: string;
  nama: string;
  role: 'admin' | 'superadmin';
}

/**
 * Get stored JWT token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Get stored user data
 */
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Store authentication data
 */
export function setAuth(token: string, user: User): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Clear authentication data
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  const user = getUser();
  return !!(token && user);
}

/**
 * Check if user is superadmin
 */
export function isSuperAdmin(): boolean {
  const user = getUser();
  return user?.role === 'superadmin';
}

/**
 * Parse JWT token (without verification - only for display purposes)
 * Note: Never trust client-side JWT parsing for security
 */
export function parseJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired (client-side only, not secure)
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = parseJWT(token);
    if (!payload || !payload.exp) return true;
    
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    return true;
  }
}

/**
 * Get time until token expiration in milliseconds
 */
export function getTokenExpirationTime(token: string): number {
  try {
    const payload = parseJWT(token);
    if (!payload || !payload.exp) return 0;
    
    const expirationTime = payload.exp * 1000;
    return Math.max(0, expirationTime - Date.now());
  } catch (error) {
    return 0;
  }
}
