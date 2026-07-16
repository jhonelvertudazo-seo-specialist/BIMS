import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Form, Button, Dropdown } from 'react-bootstrap';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ClearFiltersButton from '../components/common/ClearFiltersButton.jsx';
import ExportButtons from '../components/common/ExportButtons.jsx';

function formatWhen(value) {
    if (!value) return 'Never';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function UsersPage() {
    const { can, appUser } = useAuth();
    const canEdit = can('users', 'edit');
    const canDelete = can('users', 'delete');
    const canApprove = can('users', 'approve');

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [editUser, setEditUser] = useState(null);
    const [form, setForm] = useState({ employeeName: '', department: '', contactNumber: '', roleId: '', accountStatus: 'Pending' });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [showAddInfo, setShowAddInfo] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const [usersRes, rolesRes] = await Promise.all([
            supabase.from('app_users').select('*, roles(role_name)').order('created_at', { ascending: true }),
            supabase.from('roles').select('*').order('role_name', { ascending: true }),
        ]);
        if (usersRes.error) console.error('Failed to load users:', usersRes.error.message);
        if (rolesRes.error) console.error('Failed to load roles:', rolesRes.error.message);
        setUsers((usersRes.data || []).map((u) => ({
            id: u.id,
            authUserId: u.auth_user_id,
            employeeName: u.employee_name || '',
            username: u.username || '',
            email: u.email || '',
            contactNumber: u.contact_number || '',
            roleId: u.role_id || '',
            roleName: u.roles?.role_name || 'Unassigned',
            department: u.department || '',
            accountStatus: u.account_status,
            lastLogin: u.last_login,
        })));
        setRoles(rolesRes.data || []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = useMemo(() => {
        return users.filter((u) => {
            if (statusFilter && u.accountStatus !== statusFilter) return false;
            if (search) {
                const term = search.toLowerCase();
                const hay = [u.employeeName, u.email, u.roleName, u.department].filter(Boolean).join(' ').toLowerCase();
                if (!hay.includes(term)) return false;
            }
            return true;
        });
    }, [users, search, statusFilter]);

    const exportHeaders = ['Name', 'Email', 'Role', 'Department', 'Status', 'Last Login'];
    const exportRows = useMemo(() => filtered.map((u) => [
        u.employeeName || '', u.email, u.roleName, u.department || '', u.accountStatus, formatWhen(u.lastLogin),
    ]), [filtered]);

    function openEdit(user) {
        setEditUser(user);
        setForm({
            employeeName: user.employeeName,
            department: user.department,
            contactNumber: user.contactNumber,
            roleId: user.roleId,
            accountStatus: user.accountStatus,
        });
    }

    async function handleSave(event) {
        event.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('app_users')
                .update({
                    employee_name: form.employeeName.trim(),
                    department: form.department.trim(),
                    contact_number: form.contactNumber.trim(),
                    role_id: form.roleId || null,
                    account_status: form.accountStatus,
                })
                .eq('id', editUser.id);
            if (error) throw error;
            setToast('User updated.');
            setEditUser(null);
            load();
        } catch (err) {
            setToast(err.message || 'Failed to update user.');
        } finally {
            setSaving(false);
        }
    }

    async function quickSetStatus(user, status) {
        try {
            const { error } = await supabase.from('app_users').update({ account_status: status }).eq('id', user.id);
            if (error) throw error;
            setToast(`${user.employeeName || user.email} is now ${status}.`);
            load();
        } catch (err) {
            setToast(err.message || 'Failed to update status.');
        }
    }

    async function handleDelete(user) {
        if (!window.confirm(`Remove app access for ${user.employeeName || user.email}? They can request access again by signing in.`)) return;
        try {
            const { error } = await supabase.from('app_users').delete().eq('id', user.id);
            if (error) throw error;
            setToast('User access removed.');
            load();
        } catch (err) {
            setToast(err.message || 'Failed to remove user.');
        }
    }

    if (loading) return <LoadingSpinner label="Loading users…" />;

    const pendingCount = users.filter((u) => u.accountStatus === 'Pending').length;

    return (
        <section className="app-view">
            {toast && (
                <div className="alert alert-info py-2 small d-flex justify-content-between align-items-center">
                    <span>{toast}</span>
                    <button type="button" className="btn-close" onClick={() => setToast('')} aria-label="Close"></button>
                </div>
            )}

            <div className="row g-3 mb-3">
                <div className="col-6 col-md-4">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">👤</div>
                            <div>
                                <div className="stat-tile-label">Total Users</div>
                                <div className="fs-4 stat-tile-value">{users.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-4">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">🕓</div>
                            <div>
                                <div className="stat-tile-label">Pending Approval</div>
                                <div className="fs-4 stat-tile-value">{pendingCount}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-4">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">🛡️</div>
                            <div>
                                <div className="stat-tile-label">Your Role</div>
                                <div className="fs-4 stat-tile-value">{appUser?.roleName || '—'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-2 mb-2">
                        <div>
                            <h5 className="mb-0">Users</h5>
                            <p className="text-muted small mb-0">Everyone who has signed into BIMS. Approve new accounts and assign roles here.</p>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            <ExportButtons title="Users" headers={exportHeaders} rows={exportRows} />
                            {canEdit && (
                                <button type="button" className="btn btn-accent text-nowrap" onClick={() => setShowAddInfo(true)}>+ Add User</button>
                            )}
                        </div>
                    </div>
                    <div className="row g-2">
                        <div className="col-12 col-md-6">
                            <div className="input-group">
                                <span className="input-group-text bg-white">🔍</span>
                                <input type="text" className="form-control" placeholder="Search name, email, role..." value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="">Status: All</option>
                                <option value="Active">Active</option>
                                <option value="Pending">Pending</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>
                        <div className="col-6 col-md-3 d-flex justify-content-md-end">
                            <ClearFiltersButton active={!!(search || statusFilter)} onClear={() => { setSearch(''); setStatusFilter(''); }} />
                        </div>
                    </div>
                </div>
                <div className="card-body">
                    <p className="text-muted small mb-2">{filtered.length} user{filtered.length === 1 ? '' : 's'}</p>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 table-stack">
                            <thead className="table-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Last Login</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u) => (
                                    <tr key={u.id}>
                                        <td data-label="Name"><span className="fw-semibold">{u.employeeName || '—'}</span></td>
                                        <td data-label="Email">{u.email}</td>
                                        <td data-label="Role">{u.roleName}</td>
                                        <td data-label="Department">{u.department || '—'}</td>
                                        <td data-label="Status">
                                            <span className={`status-pill ${u.accountStatus === 'Active' ? 'status-good' : u.accountStatus === 'Suspended' ? 'status-critical' : 'status-warning'}`}>
                                                {u.accountStatus}
                                            </span>
                                        </td>
                                        <td data-label="Last Login">{formatWhen(u.lastLogin)}</td>
                                        <td className="actions-cell text-end">
                                            <Dropdown align="end" popperConfig={{ strategy: 'fixed' }}>
                                                <Dropdown.Toggle as="button" className="btn btn-sm btn-outline-secondary">Actions</Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    {canEdit && <Dropdown.Item onClick={() => openEdit(u)}>✏️ Edit</Dropdown.Item>}
                                                    {canApprove && u.accountStatus !== 'Active' && (
                                                        <Dropdown.Item onClick={() => quickSetStatus(u, 'Active')}>✅ Approve / Activate</Dropdown.Item>
                                                    )}
                                                    {canApprove && u.accountStatus === 'Active' && (
                                                        <Dropdown.Item onClick={() => quickSetStatus(u, 'Suspended')}>🚫 Suspend</Dropdown.Item>
                                                    )}
                                                    {canDelete && (
                                                        <>
                                                            <Dropdown.Divider />
                                                            <Dropdown.Item className="text-danger" onClick={() => handleDelete(u)}>🗑️ Remove Access</Dropdown.Item>
                                                        </>
                                                    )}
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal show={showAddInfo} onHide={() => setShowAddInfo(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add a New User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="small text-muted">
                        For security, BIMS never creates login accounts from inside the app — that would require
                        embedding a privileged secret key in the browser, which is unsafe. Instead, adding someone
                        is a two-step process:
                    </p>
                    <ol className="small ps-3">
                        <li className="mb-2">Create their login in the <strong>Supabase Dashboard → Authentication → Users → Add User</strong> (set an email and temporary password, or send them an invite link).</li>
                        <li className="mb-2">Have them sign in to BIMS with that email/password. They&apos;ll appear right here with status <strong>Pending</strong>.</li>
                        <li>Open their row, assign a <strong>Role</strong>, set status to <strong>Active</strong>, and Save. They now have exactly the permissions that role grants.</li>
                    </ol>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowAddInfo(false)}>Got it</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={!!editUser} onHide={() => setEditUser(null)} fullscreen="sm-down" scrollable>
                <Form onSubmit={handleSave}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit User</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Employee Name</Form.Label>
                            <Form.Control value={form.employeeName} onChange={(e) => setForm((p) => ({ ...p, employeeName: e.target.value }))} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Department</Form.Label>
                            <Form.Control value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Contact Number</Form.Label>
                            <Form.Control value={form.contactNumber} onChange={(e) => setForm((p) => ({ ...p, contactNumber: e.target.value }))} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Role</Form.Label>
                            <Form.Select value={form.roleId} onChange={(e) => setForm((p) => ({ ...p, roleId: e.target.value }))}>
                                <option value="">Unassigned</option>
                                {roles.map((r) => <option key={r.id} value={r.id}>{r.role_name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Account Status</Form.Label>
                            <Form.Select value={form.accountStatus} onChange={(e) => setForm((p) => ({ ...p, accountStatus: e.target.value }))}>
                                <option value="Active">Active</option>
                                <option value="Pending">Pending</option>
                                <option value="Suspended">Suspended</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setEditUser(null)} disabled={saving}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </section>
    );
}
