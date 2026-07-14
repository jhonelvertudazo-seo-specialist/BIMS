export default function HBarList({ data }) {
    if (!data.length) {
        return <p className="text-muted small mb-0">No data yet.</p>;
    }
    const max = Math.max(1, ...data.map((d) => d.value));

    return (
        <div>
            {data.map((d) => (
                <div className="hbar-row" key={d.label}>
                    <div className="hbar-label">{d.label}</div>
                    <div className="hbar-track">
                        <div
                            className="hbar-fill"
                            style={{ width: `${Math.round((d.value / max) * 100)}%` }}
                            title={`${d.label}: ${d.value}`}
                        ></div>
                    </div>
                    <div className="hbar-value">{d.value}</div>
                </div>
            ))}
        </div>
    );
}
