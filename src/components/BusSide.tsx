/** Side-view bus drawing painted in an operator's livery colours. */
export function BusSide({ primary, secondary, label, double = false, className = "" }: {
  primary: string; secondary: string; label?: string; double?: boolean; className?: string;
}) {
  const h = double ? 110 : 70;
  return (
    <svg viewBox={`0 0 240 ${h + 24}`} className={className} role="img" aria-label={`${label ?? "Bus"} livery`}>
      <rect x="4" y="4" width="232" height={h} rx="10" fill={primary} />
      <path d={`M4 ${h - 18} L236 ${h - 34} L236 ${h - 8} Q236 ${h + 4} 224 ${h + 4} L16 ${h + 4} Q4 ${h + 4} 4 ${h - 8} Z`} fill={secondary} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={40 + i * 38} y="14" width="32" height="22" rx="3" fill="#1b2430" opacity="0.85" />
      ))}
      {double && [0, 1, 2, 3, 4].map((i) => (
        <rect key={`u${i}`} x={40 + i * 38} y="50" width="32" height="20" rx="3" fill="#1b2430" opacity="0.85" />
      ))}
      <rect x="10" y="12" width="24" height={double ? 60 : 44} rx="3" fill="#1b2430" opacity="0.9" />
      <rect x="198" y="8" width="34" height="10" rx="2" fill="#111" />
      <text x="215" y="16" fontSize="8" textAnchor="middle" fill="#f5c400" fontFamily="Bebas Neue">{label?.slice(0, 6)}</text>
      <circle cx="52" cy={h + 6} r="13" fill="#1b1b1b" /><circle cx="52" cy={h + 6} r="5" fill="#9aa" />
      <circle cx="190" cy={h + 6} r="13" fill="#1b1b1b" /><circle cx="190" cy={h + 6} r="5" fill="#9aa" />
    </svg>
  );
}
