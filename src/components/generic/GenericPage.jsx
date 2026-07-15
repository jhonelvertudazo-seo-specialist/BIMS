import { useMemo, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useUI } from '../../context/UIContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useData } from '../../context/DataContext.jsx';
import { useGenericEntity } from '../../hooks/useGenericEntity.js';
import { useLookups } from '../../hooks/useLookups.js';
import { usePagination } from '../../hooks/usePagination.js';
import { lookupLabel, resolveFieldDisplay } from '../../lib/genericDisplay.js';
import GenericTable from './GenericTable.jsx';
import GenericFormModal from './GenericFormModal.jsx';
import GenericViewModal from './GenericViewModal.jsx';
import GenericDeleteModal from './GenericDeleteModal.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import Pagination from '../common/Pagination.jsx';
import ClearFiltersButton from '../common/ClearFiltersButton.jsx';
import ExportButtons from '../common/ExportButtons.jsx';

export default function GenericPage({ config }) {
    const { showToast } = useUI();
    const { can } = useAuth();
    const dataCtx = useData();
    const permissionKey = config.permissionKey || config.key;
    const canView = can(permissionKey, 'view');
    const canAdd = can(permissionKey, 'add');
    const canEdit = can(permissionKey, 'edit');
    const canDelete = can(permissionKey, 'delete');
    const { items, loading, add, update, remove } = useGenericEntity(config, { enabled: canView });

    const tableLookups = (config.lookups || []).filter((l) => l.source === 'table');
    const { lookupData: tableLookupData, lookupsLoading } = useLookups(tableLookups);

    const lookupData = useMemo(() => {
        const merged = { ...tableLookupData };
        (config.lookups || []).forEach((l) => {
            if (l.source === 'context') merged[l.key] = dataCtx[l.key] || [];
        });
        return merged;
    }, [tableLookupData, dataCtx, config]);

    const [search, setSearch] = useState('');
    const [filterValues, setFilterValues] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [viewId, setViewId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [prefillResidentId, setPrefillResidentId] = useState(null);

    const residentFieldKey = config.fields.find((f) => f.type === 'lookup' && f.lookup === 'residents')?.key;
    const candidates = config.getCandidates ? config.getCandidates(dataCtx.residents || [], items) : [];
    // Registered rows whose resident no longer qualifies (e.g. a youth
    // profile for someone who has since turned 31+) are hidden from this
    // tab entirely rather than shown alongside active ones — the DB row
    // itself is untouched, just not displayed here.
    const eligibleItems = config.isEligible
        ? items.filter((item) => config.isEligible(item, dataCtx.residents || []))
        : items;
    // Residents who qualify (by age/sector) but don't have a row in this
    // registry yet — merged straight into the table as unregistered rows
    // instead of a separate list, so they're not missed. They only carry
    // the resident link; every other column naturally renders '—' until
    // someone fills in the rest via "Register".
    const candidateItems = residentFieldKey
        ? candidates.map((r) => ({ id: `candidate-${r.id}`, [residentFieldKey]: r.id, __candidate: true }))
        : [];
    const combinedItems = candidateItems.length ? [...eligibleItems, ...candidateItems] : eligibleItems;
    const baseItems = config.filterItems ? config.filterItems(combinedItems) : combinedItems;

    const filtered = useMemo(() => {
        return baseItems.filter((item) => {
            for (const filter of config.filters || []) {
                const value = filterValues[filter.key];
                if (value && String(item[filter.field]) !== String(value)) return false;
            }
            if (search) {
                const term = search.toLowerCase();
                const searchableFields = new Set([...(config.searchFields || [])]);
                if (residentFieldKey) searchableFields.add(residentFieldKey);
                const hay = Array.from(searchableFields)
                    .map((fieldKey) => {
                        const field = config.fields.find((f) => f.key === fieldKey);
                        if (field?.type === 'lookup') return lookupLabel(field, item[fieldKey], lookupData);
                        return item[fieldKey];
                    })
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                if (!hay.includes(term)) return false;
            }
            return true;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseItems, search, filterValues, lookupData]);

    const { pageItems, page, setPage, totalPages } = usePagination(filtered, 8);

    const exportHeaders = useMemo(() => config.fields.map((f) => f.label), [config]);
    const exportRows = useMemo(
        () => filtered.map((item) => config.fields.map((f) => resolveFieldDisplay(f, item, lookupData))),
        [filtered, config, lookupData]
    );

    const filtersActive = !!(search || Object.values(filterValues).some(Boolean));
    function clearFilters() {
        setSearch('');
        setFilterValues({});
    }

    const editingItem = editId ? items.find((i) => i.id === editId) : null;
    const viewItem = viewId ? items.find((i) => i.id === viewId) : null;
    const deleteItem = deleteId ? items.find((i) => i.id === deleteId) : null;
    const initialData = residentFieldKey && prefillResidentId ? { [residentFieldKey]: prefillResidentId } : undefined;

    async function handleSave(id, data) {
        if (id) await update(id, data);
        else await add(data);
    }

    function openBlankAddModal() {
        setEditId(null);
        setPrefillResidentId(null);
        setModalOpen(true);
    }

    function openCandidateModal(residentId) {
        setEditId(null);
        setPrefillResidentId(residentId);
        setModalOpen(true);
    }

    if (!canView) {
        return (
            <section className="app-view">
                <div className="text-center text-muted py-5">
                    <p className="fs-1 mb-2">🔒</p>
                    <p className="fs-5">You don&apos;t have access to {config.title.toLowerCase()}.</p>
                    <p>Contact an administrator if you believe this is a mistake.</p>
                </div>
            </section>
        );
    }

    if (loading || lookupsLoading) {
        return <LoadingSpinner label={`Loading ${config.title.toLowerCase()}…`} />;
    }

    let emptyTitle = null;
    let emptyBody = null;
    if (baseItems.length === 0) {
        emptyTitle = `No ${config.title.toLowerCase()} records yet.`;
        emptyBody = `Click "${config.addLabel || `+ Add ${config.title}`}" to add your first record.`;
    } else if (filtered.length === 0) {
        emptyTitle = 'No matching records.';
        emptyBody = 'Try a different search or filter.';
    }

    return (
        <section className="app-view">
            {config.stats && config.stats.length > 0 && (
                <div className="row g-3 mb-3">
                    {config.stats.map((stat) => (
                        <div className="col-12 col-md-4" key={stat.label}>
                            <div className="card stat-card shadow-sm border-0 h-100">
                                <div className="card-body d-flex align-items-center gap-3">
                                    <div className="stat-icon bg-primary-subtle text-primary">{stat.icon}</div>
                                    <div>
                                        <div className="stat-tile-label">{stat.label}</div>
                                        <div className="fs-4 stat-tile-value">{stat.compute(baseItems)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-2">
                        <div>
                            <h5 className="mb-0">{config.title}</h5>
                            {config.subtitle && <p className="text-muted small mb-0">{config.subtitle}</p>}
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            <ExportButtons title={config.title} headers={exportHeaders} rows={exportRows} />
                            {canAdd && (
                                <button
                                    type="button"
                                    className="btn btn-accent"
                                    onClick={openBlankAddModal}
                                >
                                    {config.addLabel || `+ Add ${config.title}`}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="row g-2 align-items-center">
                        <div className="col-12 col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white">🔍</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder={`Search ${config.title.toLowerCase()}...`}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        {(config.filters || []).map((filter) => (
                            <div className="col-6 col-md-3" key={filter.key}>
                                <select
                                    className="form-select"
                                    value={filterValues[filter.key] || ''}
                                    onChange={(e) => setFilterValues((prev) => ({ ...prev, [filter.key]: e.target.value }))}
                                >
                                    <option value="">{filter.label}</option>
                                    {filter.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                        ))}
                        <div className="col-12 col-md-3 d-flex justify-content-md-end">
                            <ClearFiltersButton active={filtersActive} onClear={clearFilters} />
                        </div>
                    </div>
                </div>

                <div className="card-body">
                    {candidates.length > 0 && (
                        <div className="alert alert-warning small mb-3">
                            {candidates.length} resident{candidates.length === 1 ? '' : 's'} qualify for {config.title} but {candidates.length === 1 ? "isn't" : "aren't"} registered yet — shown below as <strong>Not Registered</strong>.
                        </div>
                    )}

                    <p className="text-muted small mb-2">
                        {baseItems.length
                            ? `Showing ${filtered.length} of ${baseItems.length} record${baseItems.length === 1 ? '' : 's'}`
                            : ''}
                    </p>

                    {emptyTitle && (
                        <div className="text-center text-muted py-5">
                            <p className="fs-1 mb-2">{config.emptyIcon || '🗂️'}</p>
                            <p className="fs-5">{emptyTitle}</p>
                            <p>{emptyBody}</p>
                        </div>
                    )}

                    {filtered.length > 0 && (
                        <div className="table-responsive">
                            <GenericTable
                                config={config}
                                items={pageItems}
                                lookupData={lookupData}
                                onView={setViewId}
                                onEdit={(id) => { setEditId(id); setModalOpen(true); }}
                                onDelete={setDeleteId}
                                onRegister={(residentId) => openCandidateModal(residentId)}
                                residentFieldKey={residentFieldKey}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                canAdd={canAdd}
                                extraActions={config.rowActions ? (item) => config.rowActions.map((action) => (
                                    <Dropdown.Item key={action.label} onClick={() => action.onClick(item, lookupData)}>
                                        {action.icon} {action.label}
                                    </Dropdown.Item>
                                )) : undefined}
                            />
                        </div>
                    )}
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
            </div>

            <GenericFormModal
                config={config}
                show={modalOpen}
                editingItem={editingItem}
                initialData={initialData}
                onClose={() => { setModalOpen(false); setEditId(null); setPrefillResidentId(null); }}
                onSave={handleSave}
                lookupData={lookupData}
                showToast={showToast}
            />
            <GenericViewModal
                config={config}
                item={viewItem}
                lookupData={lookupData}
                onClose={() => setViewId(null)}
                onEdit={() => { const id = viewItem.id; setViewId(null); setEditId(id); setModalOpen(true); }}
            />
            <GenericDeleteModal
                config={config}
                item={deleteItem}
                onClose={() => setDeleteId(null)}
                onConfirm={remove}
                showToast={showToast}
            />
        </section>
    );
}
