import { Compass, HeartHandshake, Lightbulb, Sparkles, TrendingUp } from 'lucide-react';

const AREA_LABEL = {
  personal_growth: 'Personal growth',
  relationship: 'Relationships',
  career: 'Career',
  goal_alignment: 'Your goals',
  spiritual_development: 'Spiritual practice',
};

const Bar = ({ label, value, color = '#fbbf24' }) => (
  <div style={{ marginBottom: '0.6rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1' }}>
      <span style={{ textTransform: 'capitalize' }}>{label.replaceAll('_', ' ')}</span>
      <span>{value == null ? '—' : Math.round(value)}</span>
    </div>
    <div style={{ height: '6px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)' }}>
      <div style={{ height: '6px', borderRadius: '6px', width: `${value ?? 0}%`, background: color, transition: 'width 0.8s ease' }} />
    </div>
  </div>
);

const Panel = ({ icon: Icon, title, color, children }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
      <Icon size={20} style={{ color }} />
      <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0, color: '#f8fafc' }}>{title}</h3>
    </div>
    {children}
  </div>
);

const Note = ({ children }) => (
  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>{children}</p>
);

export default function InsightsSection({ data, error }) {
  if (error) {
    return (
      <div className="glass-panel" style={{ marginTop: '2rem', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.9rem' }}>
        Insights unavailable: {error}
      </div>
    );
  }
  if (!data) {
    return <p style={{ marginTop: '2rem', color: '#94a3b8', textAlign: 'center' }}>Loading your personalised insights…</p>;
  }

  const { personality, trends, categories, recommendations } = data;
  const recs = recommendations?.recommendations || [];

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 1.25rem 0', color: '#f8fafc' }}>
        Your Personalised Insights
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <Panel icon={Sparkles} title="Personality profile" color="#c084fc">
          {personality.note && <Note>{personality.note}</Note>}
          {personality.sources_used?.length > 0 && Object.entries(personality.traits).map(([k, v]) => <Bar key={k} label={k} value={v} color="#c084fc" />)}
          {personality.strengths?.map((s) => <p key={s.trait} style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0.4rem 0' }}>✨ {s.text}</p>)}
          {personality.growth_areas?.map((g) => <p key={g.trait} style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0.4rem 0' }}>🌱 {g.text}</p>)}
        </Panel>

        <Panel icon={TrendingUp} title="Life trends" color="#34d399">
          {trends.note && <Note>{trends.note}</Note>}
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '0 0 0.5rem 0' }}>
            Direction: <b style={{ color: '#f8fafc' }}>{trends.direction.replaceAll('_', ' ')}</b>
          </p>
          <Bar label="growth potential" value={trends.growth_potential} color="#34d399" />
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.25rem 0 0.75rem 0' }}>
            {trends.engagement.last_30_days} reading(s) in the last 30 days
          </p>
          {trends.opportunities?.map((o, i) => <p key={`o${i}`} style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0.4rem 0' }}>🌟 {o.reflection}</p>)}
          {trends.challenges?.map((c, i) => <p key={`c${i}`} style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0.4rem 0' }}>⚠️ {c.reflection}</p>)}
        </Panel>

        <Panel icon={Compass} title="Life areas" color="#38bdf8">
          {Object.entries(categories).map(([k, v]) => (
            <div key={k}>
              <Bar label={k} value={v.score} color="#38bdf8" />
              {v.disclaimer && v.score != null && <p style={{ fontSize: '0.68rem', color: '#64748b', margin: '-0.3rem 0 0.5rem 0' }}>{v.disclaimer}</p>}
            </div>
          ))}
        </Panel>
      </div>

      <Panel icon={Lightbulb} title="Recommended for you" color="#fbbf24">
        {recs.length === 0 && <Note>No recommendations yet. Complete a palm scan and a tarot spread.</Note>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {recs.map((r, i) => (
            <div key={i} className="metric-pill" style={{ padding: '1rem 1.1rem' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#fbbf24', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '20px', padding: '1px 8px', textTransform: 'uppercase' }}>
                  {AREA_LABEL[r.area] || r.area}
                </span>
                {r.matches_your_goals && (
                  <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '20px', padding: '1px 8px' }}>
                    <HeartHandshake size={10} style={{ marginRight: '3px', verticalAlign: '-1px' }} />matches your goals
                  </span>
                )}
              </div>
              <div style={{ fontWeight: '700', color: '#f8fafc', marginBottom: '4px' }}>{r.title}</div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.5rem 0', lineHeight: 1.45 }}>{r.rationale}</p>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                {r.steps.map((st, j) => <li key={j}>{st}</li>)}
              </ul>
              {r.disclaimer && <p style={{ fontSize: '0.68rem', color: '#64748b', margin: '0.5rem 0 0 0' }}>{r.disclaimer}</p>}
            </div>
          ))}
        </div>
      </Panel>

      <p style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center', marginTop: '1rem' }}>
        For reflection and entertainment only. Not medical, legal, or financial advice.
      </p>
    </div>
  );
}