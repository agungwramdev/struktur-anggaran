'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Redirect to login immediately on mount
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login';
    }
  }, []);

  // Return null to prevent any flicker
  return null;
}
