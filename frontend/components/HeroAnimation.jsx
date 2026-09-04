'use client';

import { useEffect, useState } from 'react';

// A self-hosted replacement for the live site's lottie.host-hosted animation
// (which this project doesn't have rights/access to re-host under its own
// account). This is our own hand-built Lottie file — a rising bar-chart +
// trend-line "growth" motif in the brand's teal/gold palette — served locally
// from /public so every hero section that uses <HeroAnimation> depends on
// nothing external. Source generator: see project notes for gen_lottie.py.
const LOTTIE_SRC = '/lottie/hero-animation.json';

// The player itself now ships as an npm dependency (bundled by Next, no
// unpkg.com network hop) instead of a <Script src="https://unpkg.com/...">
// tag that every page using this component previously paid for. It's a web
// component that registers itself as a side effect on import, so it's
// imported lazily in an effect — never during the server-side render pass
// that static export still runs for client components — rather than at
// module scope.
export default function HeroAnimation({ maxWidth = 420 }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    import('@dotlottie/player-component').then(() => setReady(true));
  }, []);

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '86%',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          border: '1px dashed rgba(255,255,255,0.35)'
        }}
      />
      {ready && (
        // eslint-disable-next-line react/no-unknown-property
        <dotlottie-player
          src={LOTTIE_SRC}
          background="transparent"
          speed="1"
          loop
          autoplay
          style={{ width: '100%', maxWidth, position: 'relative', zIndex: 1 }}
        />
      )}
    </div>
  );
}
