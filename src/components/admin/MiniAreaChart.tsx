interface MiniAreaChartProps {
  data: { label: string; value: number }[];
  height?: number;
}

// A small, honest area chart — no fabricated data, scales to whatever the
// caller passes in. Renders a flat baseline gracefully when there's nothing
// to show yet, rather than faking a curve.
export default function MiniAreaChart({ data, height = 200 }: MiniAreaChartProps) {
  const width = 600;
  const padding = { top: 16, right: 12, bottom: 24, left: 12 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(1, ...data.map(d => d.value));
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padding.left + (data.length > 1 ? i * stepX : innerW / 2);
    const y = padding.top + innerH - (d.value / max) * innerH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`
    : '';

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none" role="img" aria-label="Properties added over time">
      <defs>
        <linearGradient id="miniAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#AC8563" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#AC8563" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridLines.map((g, i) => {
        const y = padding.top + innerH * (1 - g);
        return <line key={i} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#C3DECB" strokeWidth="1" />;
      })}

      {points.length > 0 && <path d={areaPath} fill="url(#miniAreaFill)" />}
      {points.length > 1 && <path d={linePath} fill="none" stroke="#AC8563" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#FFFFFF" stroke="#AC8563" strokeWidth="2" />
          <text x={p.x} y={height - 6} textAnchor="middle" fontSize="10" fill="#3D654E" fontFamily="Nunito, sans-serif">{p.label}</text>
        </g>
      ))}

      {points.length === 0 && (
        <text x={width / 2} y={height / 2} textAnchor="middle" fontSize="13" fill="#3D654E" fontFamily="Nunito, sans-serif">
          No data yet
        </text>
      )}
    </svg>
  );
}
