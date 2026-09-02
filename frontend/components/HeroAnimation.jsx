'use client';

import Script from 'next/script';

// A self-hosted replacement for the live site's lottie.host-hosted animation
// (which this project doesn't have rights/access to re-host under its own
// account). This is our own hand-built Lottie file — a rising bar-chart +
// trend-line "growth" motif in the brand's teal/gold palette — served locally
// from /public so every hero section that uses <HeroAnimation> depends on
// nothing external. Source generator: see project notes for gen_lottie.py.
const LOTTIE_SRC = '/lottie/hero-animation.json';

export default function HeroAnimation({ maxWidth = 420 }) {
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
      <Script
        src="https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs"
        type="module"
        strategy="afterInteractive"
      />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <dotlottie-player
        src={LOTTIE_SRC}
        background="transparent"
        speed="1"
        loop
        autoplay
        style={{ width: '100%', maxWidth, position: 'relative', zIndex: 1 }}
      />
    </div>
  );
}
