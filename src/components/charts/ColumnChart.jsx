export default function ColumnChart({ data }) {
    const max = Math.max(1, ...data.map((d) => d.value));

    return (
        <div className="column-chart">
            {data.map((d) => {
                const heightPct = Math.max(Math.round((d.value / max) * 100), d.value > 0 ? 4 : 0);
                const showValue = d.value === max && d.value > 0;
                return (
                    <div className="column-chart-col" key={d.label}>
                        <div className="column-chart-value">{showValue ? d.value : ' '}</div>
                        <div
                            className="column-chart-bar"
                            style={{ height: `${heightPct}%` }}
                            title={`${d.label}: ${d.value} new resident${d.value === 1 ? '' : 's'}`}
                        ></div>
                        <div className="column-chart-label">{d.label}</div>
                    </div>
                );
            })}
        </div>
    );
}
