export function expiryStatus(dateStr, warnDays = 30) {
    if (!dateStr) return { label: 'No Expiry', cls: 'status-good' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(dateStr);
    const diffDays = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Expired', cls: 'status-critical' };
    if (diffDays <= warnDays) return { label: `Expiring in ${diffDays}d`, cls: 'status-warning' };
    return { label: 'Active', cls: 'status-good' };
}

export function isExpiringOrExpired(dateStr, warnDays = 60) {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(dateStr);
    const diffDays = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
    return diffDays <= warnDays;
}
