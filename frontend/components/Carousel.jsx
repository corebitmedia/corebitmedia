'use client';

import { useRef } from 'react';

// Lightweight, dependency-free slider. Uses native CSS scroll-snap so it
// works with touch/trackpad swiping out of the box; the arrow buttons just
// nudge the scroll position. Mirrors the carousel widgets (testimonials,
// case studies) used on the live site.
export default function Carousel({ children }) {
  const trackRef = useRef(null);

  function scrollByPage(direction) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  }

  return (
    <div className="carousel">
      <div className="carousel-track" ref={trackRef}>
        {children}
      </div>
      <button type="button" aria-label="Previous" className="carousel-arrow carousel-arrow-left" onClick={() => scrollByPage(-1)}>
        &#8249;
      </button>
      <button type="button" aria-label="Next" className="carousel-arrow carousel-arrow-right" onClick={() => scrollByPage(1)}>
        &#8250;
      </button>
    </div>
  );
}
