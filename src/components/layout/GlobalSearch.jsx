import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext.jsx';
import { useUI } from '../../context/UIContext.jsx';

const MIN_CHARS = 2;
const MAX_RESULTS_PER_GROUP = 5;

// Searches data already loaded by DataContext (residents/households/
// certificates/blotters) — no extra network calls. Picking a result opens
// its existing view modal directly; modals live at the app root via
// UIContext, so this works from any page without navigating first.
export default function GlobalSearch() {
    const { residents, households, certificates, blotters } = useData();
    const { openViewResident, openViewHousehold, openViewCertificate, openViewBlotter } = useUI();
    const navigate = useNavigate();
    const [term, setTerm] = useState('');
    const [open, setOpen] = useState(false);
    const blurTimeout = useRef(null);

    const groups = useMemo(() => {
        const q = term.trim().toLowerCase();
        if (q.length < MIN_CHARS) return [];

        const residentMatches = residents
            .filter((r) => [r.residentId, r.fullName, r.contact].filter(Boolean).join(' ').toLowerCase().includes(q))
            .slice(0, MAX_RESULTS_PER_GROUP)
            .map((r) => ({ id: r.id, label: r.fullName, sub: r.residentId, onSelect: () => { navigate('/residents'); openViewResident(r.id); } }));

        const householdMatches = households
            .filter((h) => [h.householdNo, h.headOfFamily, h.address].filter(Boolean).join(' ').toLowerCase().includes(q))
            .slice(0, MAX_RESULTS_PER_GROUP)
            .map((h) => ({ id: h.id, label: h.headOfFamily, sub: h.householdNo, onSelect: () => { navigate('/households'); openViewHousehold(h.id); } }));

        const certificateMatches = certificates
            .filter((c) => [c.referenceNo, c.residentName, c.type].filter(Boolean).join(' ').toLowerCase().includes(q))
            .slice(0, MAX_RESULTS_PER_GROUP)
            .map((c) => ({ id: c.id, label: `${c.type} — ${c.residentName}`, sub: c.referenceNo, onSelect: () => { navigate('/certificates'); openViewCertificate(c.id); } }));

        const blotterMatches = blotters
            .filter((b) => [b.caseNo, b.complainant, b.respondent, b.incidentType].filter(Boolean).join(' ').toLowerCase().includes(q))
            .slice(0, MAX_RESULTS_PER_GROUP)
            .map((b) => ({ id: b.id, label: `${b.complainant} vs ${b.respondent}`, sub: b.caseNo, onSelect: () => { navigate('/blotter'); openViewBlotter(b.id); } }));

        return [
            { label: 'Residents', items: residentMatches },
            { label: 'Households', items: householdMatches },
            { label: 'Certificates', items: certificateMatches },
            { label: 'Blotter', items: blotterMatches },
        ].filter((g) => g.items.length > 0);
    }, [term, residents, households, certificates, blotters, navigate, openViewResident, openViewHousehold, openViewCertificate, openViewBlotter]);

    function selectResult(item) {
        item.onSelect();
        setTerm('');
        setOpen(false);
    }

    return (
        <div className="position-relative global-search d-none d-sm-block">
            <div className="input-group">
                <span className="input-group-text bg-white">🔍</span>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search residents, households, certificates, blotter..."
                    value={term}
                    onChange={(e) => { setTerm(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => { blurTimeout.current = setTimeout(() => setOpen(false), 150); }}
                    aria-label="Global search"
                />
            </div>
            {open && term.trim().length >= MIN_CHARS && (
                <div className="global-search-results shadow-sm">
                    {groups.length === 0 ? (
                        <div className="text-muted small px-3 py-2">No matches found.</div>
                    ) : (
                        groups.map((group) => (
                            <div key={group.label}>
                                <div className="global-search-group-label">{group.label}</div>
                                {group.items.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className="global-search-result"
                                        onMouseDown={(e) => { e.preventDefault(); selectResult(item); }}
                                    >
                                        <span className="fw-medium">{item.label}</span>
                                        <span className="text-muted small">{item.sub}</span>
                                    </button>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
