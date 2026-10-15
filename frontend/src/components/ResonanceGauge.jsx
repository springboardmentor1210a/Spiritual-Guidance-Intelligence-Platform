
const ResonanceGauge = ({ score = 88.5, tier = 'High Alignment' }) => {
  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg height="160" width="160" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            stroke="rgba(255, 255, 255, 0.08)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx="80"
            cy="80"
          />
          <circle
            stroke="url(#resonanceGradient)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx="80"
            cy="80"
          />
          <defs>
            <linearGradient id="resonanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Glow Counter */}
        <div style={{ position: 'absolute', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fbbf24', letterSpacing: '-0.5px' }}>
            {score}%
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Resonance
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.4)', color: '#fbbf24', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>
          {tier}
        </div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px 0' }}>
          Celestial Harmonic Frequency
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '420px', lineHeight: '1.5' }}>
          Calculated via real-time multi-factor synthesis across palm line biometric density, archetype alignments, and tarot matrix.
        </p>
      </div>
    </div>
  );
};

export default ResonanceGauge;