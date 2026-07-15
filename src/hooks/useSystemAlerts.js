import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { calculateAge } from '../utils/format.js';
import { isExpiringOrExpired } from '../lib/expiryStatus.js';

const SENIOR_AGE = 60;
const YOUTH_MIN_AGE = 15;
const YOUTH_MAX_AGE = 30;

const EMPTY = {
    pendingApprovals: 0,
    expiringPermits: 0,
    expiringPwdIds: 0,
    expiringSoloParentIds: 0,
    seniorCandidates: 0,
    youthCandidates: 0,
};

// Surfaces automatable follow-ups that already live in the database but
// otherwise require someone to remember to go looking for them: pending
// account approvals, permits/IDs about to lapse, and residents who have
// aged into a sectoral registry but haven't been registered yet. Pure
// read-only queries against data the app already collects — no new
// infrastructure (e.g. email) required.
export function useSystemAlerts() {
    const { residents, loading: dataLoading } = useData();
    const { isApproved, can, isAdmin } = useAuth();
    const [alerts, setAlerts] = useState(EMPTY);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!isApproved) {
            setAlerts(EMPTY);
            setLoading(false);
            return;
        }
        setLoading(true);

        const canSeeUsers = isAdmin || can('users', 'view');
        const [usersRes, permitsRes, pwdRes, soloRes, seniorRes, youthRes] = await Promise.all([
            canSeeUsers
                ? supabase.from('app_users').select('id', { count: 'exact', head: true }).eq('account_status', 'Pending')
                : Promise.resolve({ count: 0 }),
            supabase.from('business_permits').select('expiration_date'),
            supabase.from('pwd_records').select('expiration_date'),
            supabase.from('solo_parents').select('expiration_date'),
            supabase.from('senior_citizens').select('resident_id'),
            supabase.from('youth_profiles').select('resident_id'),
        ]);

        const expiringCount = (res) => (res.data || []).filter((r) => isExpiringOrExpired(r.expiration_date)).length;

        const seniorRegisteredIds = new Set((seniorRes.data || []).map((r) => r.resident_id));
        const youthRegisteredIds = new Set((youthRes.data || []).map((r) => r.resident_id));

        const seniorCandidates = residents.filter((r) => {
            const age = calculateAge(r.birthDate);
            return age !== null && age >= SENIOR_AGE && !seniorRegisteredIds.has(r.id);
        }).length;

        const youthCandidates = residents.filter((r) => {
            const age = calculateAge(r.birthDate);
            return age !== null && age >= YOUTH_MIN_AGE && age <= YOUTH_MAX_AGE && !youthRegisteredIds.has(r.id);
        }).length;

        setAlerts({
            pendingApprovals: usersRes.count || 0,
            expiringPermits: expiringCount(permitsRes),
            expiringPwdIds: expiringCount(pwdRes),
            expiringSoloParentIds: expiringCount(soloRes),
            seniorCandidates,
            youthCandidates,
        });
        setLoading(false);
    }, [isApproved, isAdmin, can, residents]);

    useEffect(() => {
        if (!dataLoading) load();
    }, [dataLoading, load]);

    return { alerts, loading: loading || dataLoading, refresh: load };
}
