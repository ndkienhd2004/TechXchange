import { APIRequestContext, expect } from '@playwright/test';

export type AuthContext = {
  accessToken: string;
  refreshToken?: string;
  userId?: string | number;
  role?: string;
};

export async function loginByApi(request: APIRequestContext): Promise<AuthContext> {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing E2E_USER_EMAIL or E2E_USER_PASSWORD env vars');
  }

  const response = await request.post('/api/auth/login', {
    data: { email, password },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  const data = body?.data || {};

  return {
    accessToken: data?.accessToken || data?.access_token || '',
    refreshToken: data?.refreshToken || data?.refresh_token,
    userId: data?.user?.id,
    role: data?.user?.role,
  };
}

export function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}
