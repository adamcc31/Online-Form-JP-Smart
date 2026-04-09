'use server';

import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/jwt';

export async function setAuthCookie(token: string) {
  // Validate token before setting it
  const payload = await verifyJwtToken(token);
  
  if (!payload) {
    return { success: false, message: 'Invalid token' };
  }

  const cookieStore = await cookies();
  
  cookieStore.set({
    name: 'token',
    value: token,
    httpOnly: false, // Set false so client axios can read it, or true if we rely exclusively on server components. We will set it to false for now based on our api.ts logic. 
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    sameSite: 'lax',
  });

  return { success: true, role: payload.role };
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  return { success: true };
}
