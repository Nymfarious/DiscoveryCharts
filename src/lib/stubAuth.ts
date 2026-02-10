/**
 * Stub Auth System
 * Replaces real Supabase auth with mock user/session for development.
 * All pages that previously required authentication now use this stub.
 */

export const STUB_USER = {
  id: 'stub-user-00000000-0000-0000-0000-000000000000',
  email: 'explorer@discoverycharts.dev',
  role: 'authenticated' as const,
  aud: 'authenticated' as const,
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: { name: 'Explorer' },
};

export const STUB_SESSION = {
  access_token: 'stub-token',
  refresh_token: 'stub-refresh',
  expires_in: 999999,
  expires_at: Date.now() / 1000 + 999999,
  token_type: 'bearer' as const,
  user: STUB_USER,
};

/** Always returns true — admin check is stubbed */
export function isAdminStub(): boolean {
  return true;
}

/** Returns a mock user object matching Supabase's User type shape */
export function getStubUser() {
  return STUB_USER;
}

/** Returns a mock session object */
export function getStubSession() {
  return STUB_SESSION;
}
