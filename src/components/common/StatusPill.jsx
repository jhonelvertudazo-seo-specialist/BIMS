const STATUS_STYLES = {
    Active: { cls: 'status-warning', icon: '🕓' },
    Settled: { cls: 'status-good', icon: '✅' },
    Approved: { cls: 'status-good', icon: '✅' },
    Pending: { cls: 'status-warning', icon: '🕓' },
    Expired: { cls: 'status-critical', icon: '⛔' },
};

export default function StatusPill({ status, children }) {
    const style = STATUS_STYLES[status] || { cls: 'status-warning', icon: '•' };
    return (
        <span className={`status-pill ${style.cls}`}>
            {style.icon} {children || status}
        </span>
    );
}
