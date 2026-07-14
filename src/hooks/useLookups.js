import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const cache = {};

export function useLookups(lookupConfigs = []) {
    const key = lookupConfigs.map((l) => l.table).join(',');
    const [data, setData] = useState(() => {
        const initial = {};
        lookupConfigs.forEach((l) => { if (cache[l.table]) initial[l.key] = cache[l.table]; });
        return initial;
    });
    const [loading, setLoading] = useState(lookupConfigs.some((l) => !cache[l.table]));

    useEffect(() => {
        let active = true;
        if (lookupConfigs.length === 0) {
            setLoading(false);
            return undefined;
        }
        setLoading(true);
        Promise.all(lookupConfigs.map((l) => (
            cache[l.table] ? Promise.resolve({ data: cache[l.table], error: null }) : supabase.from(l.table).select('*')
        ))).then((results) => {
            if (!active) return;
            const next = {};
            results.forEach((res, i) => {
                const { table, key: lookupKey } = lookupConfigs[i];
                if (res.error) {
                    console.error(`Failed to load ${table}:`, res.error.message);
                    next[lookupKey] = [];
                } else {
                    cache[table] = res.data || [];
                    next[lookupKey] = res.data || [];
                }
            });
            setData(next);
            setLoading(false);
        });
        return () => { active = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return { lookupData: data, lookupsLoading: loading };
}

export function invalidateLookupCache(table) {
    delete cache[table];
}
