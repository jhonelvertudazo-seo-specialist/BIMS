import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from './AuthContext.jsx';
import { nextSequentialCode } from '../lib/codeGen.js';
import { logAudit } from '../lib/auditLog.js';
import {
    residentFromRow, residentToRow,
    certificateFromRow, certificateToRow,
    blotterFromRow, blotterToRow,
    householdFromRow, householdToRow,
} from '../lib/mappers.js';

const DataContext = createContext(null);

export function DataProvider({ children }) {
    const { session, isApproved } = useAuth();
    const [residents, setResidents] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [blotters, setBlotters] = useState([]);
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadAll = useCallback(async () => {
        setLoading(true);
        const [residentsRes, certificatesRes, blottersRes, householdsRes] = await Promise.all([
            supabase.from('residents').select('*').order('created_at', { ascending: true }),
            supabase.from('certificates').select('*').order('issued_at', { ascending: true }),
            supabase.from('blotters').select('*').order('filed_at', { ascending: true }),
            supabase.from('households').select('*').order('created_at', { ascending: true }),
        ]);

        if (residentsRes.error) console.error('Failed to load residents:', residentsRes.error.message);
        if (certificatesRes.error) console.error('Failed to load certificates:', certificatesRes.error.message);
        if (blottersRes.error) console.error('Failed to load blotters:', blottersRes.error.message);
        if (householdsRes.error) console.error('Failed to load households:', householdsRes.error.message);

        setResidents((residentsRes.data || []).map(residentFromRow));
        setCertificates((certificatesRes.data || []).map(certificateFromRow));
        setBlotters((blottersRes.data || []).map(blotterFromRow));
        setHouseholds((householdsRes.data || []).map(householdFromRow));
        setLoading(false);
    }, []);

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

    async function addResident(data) {
        const residentId = nextSequentialCode(residents, 'residentId', /RES-(\d+)/, 'RES-', 4);
        const row = residentToRow({ ...data, residentId });
        const { data: inserted, error } = await supabase.from('residents').insert(row).select().single();
        if (error) throw error;
        const record = residentFromRow(inserted);
        setResidents((prev) => [...prev, record]);
        return record;
    }

    async function updateResident(id, data) {
        const existing = residents.find((r) => r.id === id);
        const row = residentToRow({ ...existing, ...data, residentId: existing?.residentId });
        const { data: updated, error } = await supabase.from('residents').update(row).eq('id', id).select().single();
        if (error) throw error;
        const record = residentFromRow(updated);
        setResidents((prev) => prev.map((r) => (r.id === id ? record : r)));
        return record;
    }

    async function deleteResident(id) {
        const { error } = await supabase.from('residents').delete().eq('id', id);
        if (error) throw error;
        setResidents((prev) => prev.filter((r) => r.id !== id));
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
        const { error } = await supabase.from('certificates').delete().eq('id', id);
        if (error) throw error;
        setCertificates((prev) => prev.filter((c) => c.id !== id));
        logAudit('certificates', id, 'delete', session?.user?.email);
    }

    async function deleteBlotter(id) {
        const { error } = await supabase.from('blotters').delete().eq('id', id);
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
        const { error } = await supabase.from('households').delete().eq('id', id);
        if (error) throw error;
        setHouseholds((prev) => prev.filter((h) => h.id !== id));
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
