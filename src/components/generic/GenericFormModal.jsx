import { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import LookupSelect from './LookupSelect.jsx';
import { uploadFile } from '../../lib/uploadFile.js';

function buildEmptyForm(config) {
    const empty = {};
    config.fields.forEach((field) => {
        if (field.auto) return;
        empty[field.key] = field.type === 'checkbox' ? false : field.type === 'number' || field.type === 'currency' ? 0 : '';
    });
    return empty;
}

function FieldInput({ field, value, onChange, lookupData, onFileSelect }) {
    const controlId = `field-${field.key}`;

    if (field.type === 'file') {
        return (
            <div>
                {value && (
                    <div className="small mb-1">
                        <a href={value} target="_blank" rel="noopener noreferrer">📎 Current file</a>
                    </div>
                )}
                <Form.Control
                    id={controlId}
                    type="file"
                    accept={field.accept}
                    onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
                />
            </div>
        );
    }

    if (field.type === 'lookup') {
        const options = (lookupData && lookupData[field.lookup]) || [];
        return (
            <LookupSelect
                options={options}
                displayField={field.displayField}
                value={value}
                onChange={(v) => onChange(v)}
                required={field.required}
                placeholder={`Search ${field.label.toLowerCase()}…`}
            />
        );
    }

    if (field.type === 'select') {
        return (
            <Form.Select id={controlId} required={field.required} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
                <option value="">Select {field.label}</option>
                {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </Form.Select>
        );
    }

    if (field.type === 'textarea') {
        return (
            <Form.Control
                id={controlId}
                as="textarea"
                rows={field.rows || 3}
                required={field.required}
                placeholder={field.placeholder}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    if (field.type === 'checkbox') {
        return (
            <Form.Check
                id={controlId}
                type="checkbox"
                label={field.checkLabel || 'Yes'}
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
            />
        );
    }

    if (field.type === 'number' || field.type === 'currency') {
        return (
            <Form.Control
                id={controlId}
                type="number"
                step={field.type === 'currency' ? '0.01' : field.step || '1'}
                min={field.min ?? '0'}
                required={field.required}
                placeholder={field.placeholder}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    if (field.type === 'date') {
        return (
            <Form.Control
                id={controlId}
                type="date"
                required={field.required}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
            />
        );
    }

    return (
        <Form.Control
            id={controlId}
            type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'}
            required={field.required}
            placeholder={field.placeholder}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

export default function GenericFormModal({ config, show, editingItem, onClose, onSave, lookupData, showToast }) {
    const [form, setForm] = useState(() => buildEmptyForm(config));
    const [validated, setValidated] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [fileSelections, setFileSelections] = useState({});

    useEffect(() => {
        if (!show) return;
        setValidated(false);
        setFileSelections({});
        if (editingItem) {
            const next = {};
            config.fields.forEach((field) => { next[field.key] = editingItem[field.key]; });
            setForm(next);
        } else {
            setForm(buildEmptyForm(config));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show, editingItem?.id]);

    function updateField(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSubmit(event) {
        const formEl = event.currentTarget;
        event.preventDefault();

        if (!formEl.checkValidity()) {
            event.stopPropagation();
            setValidated(true);
            return;
        }

        setSubmitting(true);
        try {
            let data = form;
            const fileFields = config.fields.filter((f) => f.type === 'file' && fileSelections[f.key]);
            if (fileFields.length > 0) {
                const uploads = await Promise.all(
                    fileFields.map((f) => uploadFile(fileSelections[f.key], f.uploadFolder || config.table))
                );
                data = { ...form };
                fileFields.forEach((f, i) => { data[f.key] = uploads[i]; });
            }

            if (editingItem) {
                await onSave(editingItem.id, data);
                showToast(`${config.title} updated.`);
            } else {
                await onSave(null, data);
                showToast(`${config.title} added.`);
            }
            setValidated(false);
            onClose();
        } catch (err) {
            showToast(err.message || `Failed to save ${config.title.toLowerCase()}.`, true);
        } finally {
            setSubmitting(false);
        }
    }

    const visibleFields = config.fields.filter((f) => !f.auto || editingItem);

    return (
        <Modal show={show} onHide={onClose} size="lg" fullscreen="sm-down" scrollable>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingItem ? `Update ${config.title}` : `${config.addLabel || `Add ${config.title}`}`}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row g-3">
                        {visibleFields.map((field) => (
                            <div className={field.col || 'col-12 col-md-6'} key={field.key}>
                                <Form.Group controlId={`field-${field.key}`}>
                                    <Form.Label>
                                        {field.label} {field.required && <span className="required-marker">*</span>}
                                    </Form.Label>
                                    <FieldInput
                                        field={field}
                                        value={form[field.key]}
                                        onChange={(v) => updateField(field.key, v)}
                                        lookupData={lookupData}
                                        onFileSelect={(file) => setFileSelections((prev) => ({ ...prev, [field.key]: file }))}
                                    />
                                    {field.required && (
                                        <Form.Control.Feedback type="invalid">{field.label} is required.</Form.Control.Feedback>
                                    )}
                                    {field.hint && <Form.Text className="text-muted">{field.hint}</Form.Text>}
                                </Form.Group>
                            </div>
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancel</Button>
                    <Button variant="primary" type="submit" disabled={submitting}>
                        {submitting ? 'Saving…' : `Save ${config.title}`}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
