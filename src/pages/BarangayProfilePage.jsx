import { useCallback, useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { uploadFile } from '../lib/uploadFile.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const EMPTY = {
    barangayName: '', barangayCode: '', municipality: '', province: '', region: '', zipCode: '',
    contactNumber: '', email: '', logoUrl: '', captain: '', secretary: '', treasurer: '', mission: '', vision: '',
};

function fromRow(row) {
    if (!row) return EMPTY;
    return {
        barangayName: row.barangay_name || '',
        barangayCode: row.barangay_code || '',
        municipality: row.municipality || '',
        province: row.province || '',
        region: row.region || '',
        zipCode: row.zip_code || '',
        contactNumber: row.contact_number || '',
        email: row.email || '',
        logoUrl: row.logo_url || '',
        captain: row.captain || '',
        secretary: row.secretary || '',
        treasurer: row.treasurer || '',
        mission: row.mission || '',
        vision: row.vision || '',
    };
}

export default function BarangayProfilePage() {
    const { can } = useAuth();
    const canEdit = can('settings', 'edit');
    const [recordId, setRecordId] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [logoFile, setLogoFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('system_settings').select('*').limit(1).maybeSingle();
        if (error) console.error('Failed to load barangay profile:', error.message);
        setRecordId(data?.id || null);
        setForm(fromRow(data));
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    function updateField(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSaving(true);
        try {
            let logoUrl = form.logoUrl;
            if (logoFile) logoUrl = await uploadFile(logoFile, 'settings');

            const row = {
                barangay_name: form.barangayName || null,
                barangay_code: form.barangayCode || null,
                municipality: form.municipality || null,
                province: form.province || null,
                region: form.region || null,
                zip_code: form.zipCode || null,
                contact_number: form.contactNumber || null,
                email: form.email || null,
                logo_url: logoUrl || null,
                captain: form.captain || null,
                secretary: form.secretary || null,
                treasurer: form.treasurer || null,
                mission: form.mission || null,
                vision: form.vision || null,
            };

            if (recordId) {
                const { error } = await supabase.from('system_settings').update(row).eq('id', recordId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('system_settings').insert(row).select().single();
                if (error) throw error;
                setRecordId(data.id);
            }
            setToast('Barangay profile saved.');
            setLogoFile(null);
        } catch (err) {
            setToast(err.message || 'Failed to save profile.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <LoadingSpinner label="Loading barangay profile…" />;

    return (
        <section className="app-view">
            {toast && (
                <div className="alert alert-info py-2 small d-flex justify-content-between align-items-center">
                    <span>{toast}</span>
                    <button type="button" className="btn-close" onClick={() => setToast('')} aria-label="Close"></button>
                </div>
            )}
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <h5 className="mb-0">Barangay Profile</h5>
                    <p className="text-muted small mb-0">Official barangay information used across certificates and reports</p>
                </div>
                <Form onSubmit={handleSubmit}>
                    <div className="card-body">
                        <fieldset disabled={!canEdit}>
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <Form.Group>
                                        <Form.Label>Barangay Name</Form.Label>
                                        <Form.Control value={form.barangayName} onChange={(e) => updateField('barangayName', e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div className="col-6 col-md-3">
                                    <Form.Group>
                                        <Form.Label>Barangay Code</Form.Label>
                                        <Form.Control value={form.barangayCode} onChange={(e) => updateField('barangayCode', e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div className="col-6 col-md-3">
                                    <Form.Group>
                                        <Form.Label>ZIP Code</Form.Label>
                                        <Form.Control value={form.zipCode} onChange={(e) => updateField('zipCode', e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div className="col-6 col-md-4">
                                    <Form.Group>
                                        <Form.Label>Municipality</Form.Label>
                                        <Form.Control value={form.municipality} onChange={(e) => updateField('municipality', e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div className="col-6 col-md-4">
                                    <Form.Group>
                                        <Form.Label>Province</Form.Label>
                                        <Form.Control value={form.province} onChange={(e) => updateField('province', e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div className="col-12 col-md-4">
                                    <Form.Group>
                                        <Form.Label>Region</Form.Label>
                                        <Form.Control value={form.region} onChange={(e) => updateField('region', e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div className="col-6 col-md-6">
                                    <Form.Group>
                                        <Form.Label>Contact Number</Form.Label>
                                        <Form.Control value={form.contactNumber} onChange={(e) => updateField('contactNumber', e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div className="col-6 col-md-6">
                                    <Form.Group>
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div className="col-12 col-md-4">
                                    <Form.Group>
                                        <Form.Label>Official Logo</Form.Label>
                                        {form.logoUrl && <div className="mb-1"><img src={form.logoUrl} alt="Barangay logo" style={{ height: 40 }} /></div>}
                                        <Form.Control type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                                    </Form.Group>
                                </div>
                                <div className="col-6 col-md-4">
                                    <Form.Group>
                                        <Form.Label>Barangay Captain</Form.Label>
                                        <Form.Control value={form.captain} onChange={(e) => updateField('captain', e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div className="col-6 col-md-2">
                                    <Form.Group>
                                        <Form.Label>Secretary</Form.Label>
                                        <Form.Control value={form.secretary} onChange={(e) => updateField('secretary', e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div className="col-6 col-md-2">
                                    <Form.Group>
                                        <Form.Label>Treasurer</Form.Label>
                                        <Form.Control value={form.treasurer} onChange={(e) => updateField('treasurer', e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div className="col-12 col-md-6">
                                    <Form.Group>
                                        <Form.Label>Mission</Form.Label>
                                        <Form.Control as="textarea" rows={3} value={form.mission} onChange={(e) => updateField('mission', e.target.value)} />
                                    </Form.Group>
                                </div>
                                <div className="col-12 col-md-6">
                                    <Form.Group>
                                        <Form.Label>Vision</Form.Label>
                                        <Form.Control as="textarea" rows={3} value={form.vision} onChange={(e) => updateField('vision', e.target.value)} />
                                    </Form.Group>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    {canEdit && (
                        <div className="card-footer bg-white text-end">
                            <button type="submit" className="btn btn-accent" disabled={saving}>{saving ? 'Saving…' : 'Save Profile'}</button>
                        </div>
                    )}
                </Form>
            </div>
        </section>
    );
}
