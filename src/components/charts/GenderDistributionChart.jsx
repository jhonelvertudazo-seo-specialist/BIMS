export default function GenderDistributionChart({ residents }) {
    const male = residents.filter((r) => r.gender === 'Male').length;
    const female = residents.filter((r) => r.gender === 'Female').length;
    const total = male + female;

    if (!total) {
        return <p className="text-muted small mb-0">No resident data yet.</p>;
    }

    const malePct = Math.round((male / total) * 100);
    const femalePct = 100 - malePct;

    return (
        <>
            <div className="stacked-bar" title={`Male ${male} (${malePct}%) · Female ${female} (${femalePct}%)`}>
                <div className="stacked-bar-segment" style={{ width: `${malePct}%`, backgroundColor: 'var(--viz-blue)' }}>
                    {malePct >= 12 ? `${malePct}%` : ''}
                </div>
                <div className="stacked-bar-segment" style={{ width: `${femalePct}%`, backgroundColor: 'var(--viz-orange)' }}>
                    {femalePct >= 12 ? `${femalePct}%` : ''}
                </div>
            </div>
            <div className="viz-legend">
                <span className="viz-legend-item">
                    <span className="viz-legend-swatch" style={{ backgroundColor: 'var(--viz-blue)' }}></span>
                    Male <span className="viz-legend-value">{male}</span>
                </span>
                <span className="viz-legend-item">
                    <span className="viz-legend-swatch" style={{ backgroundColor: 'var(--viz-orange)' }}></span>
                    Female <span className="viz-legend-value">{female}</span>
                </span>
            </div>
        </>
    );
}
