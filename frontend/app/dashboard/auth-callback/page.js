'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { setToken } from '../../../lib/customerApi';

function AuthCallbackHandler() {
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      setToken(token);
      window.location.href = '/dashboard/';
    } else {
      window.location.href = '/dashboard/login/?error=google_failed';
    }
  }, [params]);

  return <p className="text-muted" style={{ textAlign: 'center' }}>Signing you in…</p>;
}

export default function AuthCallbackPage() {
  return (
    <section className="section">
      <div className="container">
        <Suspense fallback={null}>
          <AuthCallbackHandler />
        </Suspense>
      </div>
    </section>
  );
}
