export default function LineChart({ data, formatValue = (v) => `₱${v.toLocaleString()}`, ariaLabel = 'Line chart' }) {
    const width = 300;
    const height = 90;
    const padding = 8;
    const max = Math.max(...data.map((d) => d.value)) * 1.15 || 1;
    const stepX = (width - padding * 2) / (data.length - 1 || 1);

    const points = data.map((d, i) => ({
        x: padding + i * stepX,
        y: height - padding - (d.value / max) * (height - padding * 2),
        ...d,
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(height - padding).toFixed(1)} L ${points[0].x.toFixed(1)} ${(height - padding).toFixed(1)} Z`;
    const lastPoint = points[points.length - 1];

    return (
        <>
            <div className="line-chart-wrap">
                <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={ariaLabel}>
                    {[0.25, 0.5, 0.75].map((f) => {
                        const y = (padding + f * (height - padding * 2)).toFixed(1);
                        return <line key={f} className="line-chart-gridline" x1={padding} y1={y} x2={width - padding} y2={y}></line>;
                    })}
                    <path className="line-chart-area" d={areaD}></path>
                    <path className="line-chart-path" d={pathD}></path>
                    {points.map((p) => (
                        <circle key={p.label} className="line-chart-dot" cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="4">
                            <title>{p.label}: {formatValue(p.value)}</title>
                        </circle>
                    ))}
                </svg>
                <div className="line-chart-labels">
                    {data.map((d) => <span key={d.label}>{d.label}</span>)}
                </div>
            </div>
            <div className="viz-card-subtitle mt-2">Latest: <strong className="text-body">{formatValue(lastPoint.value)}</strong></div>
        </>
    );
}
