export default function StatTile({ icon, iconBg, label, value, className = '' }) {
    return (
        <div className={`card stat-card shadow-sm h-100 border-0 ${className}`}>
            <div className="card-body d-flex align-items-center gap-3">
                <div className={`stat-icon ${iconBg}`}>{icon}</div>
                <div className="stat-tile-text">
                    <div className="stat-tile-label text-truncate">{label}</div>
                    <div className="fs-4 stat-tile-value">{value}</div>
                </div>
            </div>
        </div>
    );
}
