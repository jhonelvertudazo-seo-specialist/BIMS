import { useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';

export default function LookupSelect({ options, displayField, value, onChange, required, placeholder = 'Search…' }) {
    const [term, setTerm] = useState('');

    const filtered = useMemo(() => {
        if (!term.trim()) return options;
        const needle = term.toLowerCase();
        return options.filter((o) => String(o[displayField] || '').toLowerCase().includes(needle));
    }, [options, displayField, term]);

    return (
        <div>
            <Form.Control
                type="text"
                size="sm"
                className="mb-1"
                placeholder={placeholder}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
            />
            <Form.Select required={required} value={value || ''} onChange={(e) => onChange(e.target.value)}>
                <option value="">Select…</option>
                {filtered.map((o) => (
                    <option key={o.id} value={o.id}>{o[displayField]}</option>
                ))}
            </Form.Select>
        </div>
    );
}
