/**
 * Top-down NYC-yellow-taxi icon, nose pointed DOWN the page (in the same
 * direction the user is scrolling). Sized to ride comfortably on a ~40-56px
 * wide road. Inline SVG so we can tint and animate without loading external
 * assets. Shared by the marketing RoadProcess section and the studio client
 * tracker.
 */
export function TopDownTaxi() {
  return (
    <svg
      width="44"
      height="68"
      viewBox="0 0 40 60"
      xmlns="http://www.w3.org/2000/svg"
      className="block"
    >
      {/* body */}
      <rect x="5" y="3" width="30" height="54" rx="7" fill="#F5D518" stroke="#0A0A0A" strokeWidth="1.4" />
      {/* hood + trunk seam lines */}
      <line x1="5" y1="14" x2="35" y2="14" stroke="#0A0A0A" strokeOpacity="0.35" strokeWidth="1" />
      <line x1="5" y1="46" x2="35" y2="46" stroke="#0A0A0A" strokeOpacity="0.35" strokeWidth="1" />
      {/* rear window (top) */}
      <rect x="9" y="16" width="22" height="11" rx="3" fill="#1F2937" />
      {/* windshield (bottom) */}
      <rect x="9" y="33" width="22" height="13" rx="3" fill="#1F2937" />
      {/* iconic checker stripe across the roof */}
      <g>
        {Array.from({ length: 6 }).map((_, i) => (
          <rect
            key={i}
            x={9 + i * 3.7}
            y={27.5}
            width={3.7}
            height={5.5}
            fill={i % 2 === 0 ? '#0A0A0A' : '#F5D518'}
          />
        ))}
      </g>
      {/* side mirrors */}
      <rect x="2.5" y="22" width="3" height="5" rx="1" fill="#0A0A0A" />
      <rect x="34.5" y="22" width="3" height="5" rx="1" fill="#0A0A0A" />
      {/* headlights (at the bottom, leading the way) */}
      <circle cx="12" cy="53" r="1.8" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="0.5" />
      <circle cx="28" cy="53" r="1.8" fill="#FFFFFF" stroke="#0A0A0A" strokeWidth="0.5" />
      {/* taillights (at the top) */}
      <circle cx="12" cy="6.5" r="1.3" fill="#DC2626" />
      <circle cx="28" cy="6.5" r="1.3" fill="#DC2626" />
    </svg>
  );
}
