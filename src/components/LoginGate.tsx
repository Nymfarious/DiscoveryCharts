import React from 'react';

/**
 * LoginGate — Auth is stubbed out.
 * Simply renders children without any authentication check.
 */
export default function LoginGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
