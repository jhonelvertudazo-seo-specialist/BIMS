import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from './AuthContext.jsx';
import { useUI } from './UIContext.jsx';
import { nextSequentialCode } from '../lib/codeGen.js';
import { logAudit } from '../lib/auditLog.js';
import { computeHouseholdCounts } from '../utils/householdStats.js';
import {
    residentFromRow, residentToRow,
    certificateFromRow, certificateToRow,
    blotterFromRow, blotterToRow,
    householdFromRow, householdToRow,
} from '../lib/mappers.js';

const DataContext = createContext(null);

export function DataProvider({ children }) {
    const { session, isApproved } = useAuth();
    const { showToast } = useUI();
    const [residents, setResidents] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [blotters, setBlotters] = useState([]);
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadAll = useCallback(async () => {
        setLoading(true);
        const [residentsRes, certificatesRes, blottersRes, householdsRes] = await Promise.all([
            supabase.from('residents').select('*').is('deleted_at', null).order('created_at', { ascending: true }),
            supabase.from('certificates').select('*').is('deleted_at', null).order('issued_at', { ascending: true }),
            supabase.from('blotters').select('*').is('deleted_at', null).order('filed_at', { ascending: true }),
            supabase.from('households').select('*').is('deleted_at', null).order('created_at', { ascending: true }),
        ]);

        const loadErrors = [
            ['residents', residentsRes.error],
            ['certificates', certificatesRes.error],
            ['blotters', blottersRes.error],
            ['households', householdsRes.error],
        ].filter(([, error]) => error);

        loadErrors.forEach(([label, error]) => console.error(`Failed to load ${label}:`, error.message));
        if (loadErrors.length) {
            showToast(`Failed to load ${loadErrors.map(([label]) => label).join(', ')}. Try refreshing the page.`, true);
        }

        setResidents((residentsRes.data || []).map(residentFromRow));
        setCertificates((certificatesRes.data || []).map(certificateFromRow));
        setBlotters((blottersRes.data || []).map(blotterFromRow));
        setHouseholds((householdsRes.data || []).map(householdFromRow));
        setLoading(false);
    }, [showToast]);

    useEffect(() => {
        if (session && isApproved) {
            loadAll();
        } else {
            setResidents([]);
            setCertificates([]);
            setBlotters([]);
            setHouseholds([]);
            setLoading(false);
        }
    }, [session, isApproved, loadAll]);

    // Household member counts are derived from residents.householdId, not
    // manually typed, so any resident change that could affect a
    // household's counts (linking, unlinking, sector/voter changes,
    // deletion) recomputes and persists that household's counts here.
    async function syncHouseholdCounts(householdId, residentsSnapshot) {
        if (!householdId) return;
        const counts = computeHouseholdCounts(householdId, residentsSnapshot);
        const row = {
            family_members_count: counts.familyMembersCount,
            voter_members_count: counts.voterMembersCount,
            pwd_members_count: counts.pwdMembersCount,
            senior_members_count: counts.seniorMembersCount,
        };
        const { data: updated, error } = await supabase.from('households').update(row).eq('id', householdId).select().single();
        if (error) {
            console.error('Failed to sync household member counts:', error.message);
            return;
        }
        const record = householdFromRow(updated);
        setHouseholds((prev) => prev.map((h) => (h.id === householdId ? record : h)));
    }

    async function addResident(data) {
        const residentId = nextSequentialCode(residents, 'residentId', /RES-(\d+)/, 'RES-', 4);
        const row = residentToRow({ ...data, residentId });
        const { data: inserted, error } = await supabase.from('residents').insert(row).select().single();
        if (error) throw error;
        const record = residentFromRow(inserted);
        const nextResidents = [...residents, record];
        setResidents(nextResidents);
        if (record.householdId) await syncHouseholdCounts(record.householdId, nextResidents);
        return record;
    }

    async function updateResident(id, data) {
        const existing = residents.find((r) => r.id === id);
        const row = residentToRow({ ...existing, ...data, residentId: existing?.residentId });
        const { data: updated, error } = await supabase.from('residents').update(row).eq('id', id).select().single();
        if (error) throw error;
        const record = residentFromRow(updated);
        const nextResidents = residents.map((r) => (r.id === id ? record : r));
        setResidents(nextResidents);
        if (existing?.householdId && existing.householdId !== record.householdId) {
            await syncHouseholdCounts(existing.householdId, nextResidents);
        }
        if (record.householdId) await syncHouseholdCounts(record.householdId, nextResidents);
        return record;
    }

    // Soft delete — marks the row instead of removing it, so it can be
    // recovered from the Recycle Bin (src/pages/RecycleBinPage.jsx).
    async function deleteResident(id) {
        const existing = residents.find((r) => r.id === id);
        const { error } = await supabase.from('residents').update({ deleted_at: new Date().toISOString() }).eq('id', id);
        if (error) throw error;
        const nextResidents = residents.filter((r) => r.id !== id);
        setResidents(nextResidents);
        logAudit('residents', id, 'delete', session?.user?.email);
        if (existing?.householdId) await syncHouseholdCounts(existing.householdId, nextResidents);
    }

    async function issueCertificate({ residentId, type, fee, purpose }) {
        const resident = residents.find((r) => r.id === residentId);
        if (!resident) throw new Error('Resident not found');
        const referenceNo = nextSequentialCode(certificates, 'referenceNo', /OR-(\d+)/, 'OR-', 6);
        const row = certificateToRow({
            residentId: resident.id,
            residentName: resident.fullName,
            type,
            fee,
            purpose,
            referenceNo,
        });
        const { data: inserted, error } = await supabase.from('certificates').insert(row).select().single();
        if (error) throw error;
        const record = certificateFromRow(inserted);
        setCertificates((prev) => [...prev, record]);
        logAudit('certificates', record.id, 'create', session?.user?.email, { type, referenceNo });
        return record;
    }

    async function fileBlotter(data) {
        const year = new Date().getFullYear();
        const caseNo = nextSequentialCode(blotters, 'caseNo', new RegExp(`BLT-${year}-(\\d+)`), `BLT-${year}-`, 4);
        const row = blotterToRow({ ...data, caseNo, status: 'Active' });
        const { data: inserted, error } = await supabase.from('blotters').insert(row).select().single();
        if (error) throw error;
        const record = blotterFromRow(inserted);
        setBlotters((prev) => [...prev, record]);
        logAudit('blotters', record.id, 'create', session?.user?.email, { caseNo });
        return record;
    }

    async function settleBlotter(id) {
        const { data: updated, error } = await supabase
            .from('blotters')
            .update({ status: 'Settled', settled_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        const record = blotterFromRow(updated);
        setBlotters((prev) => prev.map((b) => (b.id === id ? record : b)));
        logAudit('blotters', id, 'update', session?.user?.email, { status: 'Settled' });
        return record;
    }

    async function deleteCertificate(id) {
        const { error } = await supabase.from('certificates').update({ deleted_at: new Date().toISOString() }).eq('id', id);
        if (error) throw error;
        setCertificates((prev) => prev.filter((c) => c.id !== id));
        logAudit('certificates', id, 'delete', session?.user?.email);
    }

    async function deleteBlotter(id) {
        const { error } = await supabase.from('blotters').update({ deleted_at: new Date().toISOString() }).eq('id', id);
        if (error) throw error;
        setBlotters((prev) => prev.filter((b) => b.id !== id));
        logAudit('blotters', id, 'delete', session?.user?.email);
    }

    async function addHousehold(data) {
        const householdNo = nextSequentialCode(households, 'householdNo', /HH-(\d+)/, 'HH-', 4);
        const row = householdToRow({ ...data, householdNo });
        const { data: inserted, error } = await supabase.from('households').insert(row).select().single();
        if (error) throw error;
        const record = householdFromRow(inserted);
        setHouseholds((prev) => [...prev, record]);
        return record;
    }

    async function updateHousehold(id, data) {
        const existing = households.find((h) => h.id === id);
        const row = householdToRow({ ...existing, ...data, householdNo: existing?.householdNo });
        const { data: updated, error } = await supabase.from('households').update(row).eq('id', id).select().single();
        if (error) throw error;
        const record = householdFromRow(updated);
        setHouseholds((prev) => prev.map((h) => (h.id === id ? record : h)));
        return record;
    }

    async function deleteHousehold(id) {
        const { error } = await supabase.from('households').update({ deleted_at: new Date().toISOString() }).eq('id', id);
        if (error) throw error;
        setHouseholds((prev) => prev.filter((h) => h.id !== id));
        logAudit('households', id, 'delete', session?.user?.email);
    }

    const value = {
        residents,
        certificates,
        blotters,
        households,
        loading,
        addResident,
        updateResident,
        deleteResident,
        issueCertificate,
        deleteCertificate,
        fileBlotter,
        settleBlotter,
        deleteBlotter,
        addHousehold,
        updateHousehold,
        deleteHousehold,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used within a DataProvider');
    return ctx;
}
