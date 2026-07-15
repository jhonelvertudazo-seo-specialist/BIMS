import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { MODULE_LIST, PERMISSION_ACTIONS } from '../lib/modules.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

const ACTION_LABELS = {
    can_view: 'View', can_add: 'Add', can_edit: 'Edit', can_delete: 'Delete',
    can_print: 'Print', can_export: 'Export', can_approve: 'Approve',
};

function PermCell({ state, roleValue, disabled, onClick, moduleLabel, actionLabel }) {
    let className = 'btn btn-sm perm-toggle-btn ';
    let content = '–';
    let title = `${moduleLabel} · ${actionLabel}: inherits role default (${roleValue ? 'Allowed' : 'Denied'}). Click to override.`;
    if (state === 'allow') {
        className += 'btn-success';
        content = '✓';
        title = `${moduleLabel} · ${actionLabel}: explicitly allowed for this user. Click to change.`;
    } else if (state === 'deny') {
        className += 'btn-danger';
        content = '✕';
        title = `${moduleLabel} · ${actionLabel}: explicitly denied for this user. Click to change.`;
    } else {
        className += roleValue ? 'btn-outline-success' : 'btn-outline-secondary';
        content = roleValue ? '✓' : '–';
    }
    return (
        <button
            type="button"
            className={className}
            style={{ width: '2.25rem' }}
            disabled={disabled}
            onClick={onClick}
            title={title}
        >
            {content}
        </button>
    );
}

export default function PermissionsPage() {
    const { isSuperAdmin } = useAuth();
    const { showToast } = useUI();
    const [mode, setMode] = useState('role');

    // --- Role-based matrix -------------------------------------------------
    const [roles, setRoles] = useState([]);
    const [roleId, setRoleId] = useState('');
    const [permsByModule, setPermsByModule] = useState({});
    const [roleLoading, setRoleLoading] = useState(true);
    const [savingKey, setSavingKey] = useState('');

    const loadRoles = useCallback(async () => {
        const { data, error } = await supabase.from('roles').select('*').order('role_name', { ascending: true });
        if (error) {
            console.error('Failed to load roles:', error.message);
            showToast('Failed to load roles.', true);
        }
        setRoles(data || []);
        if (data && data.length > 0) setRoleId((prev) => prev || data[0].id);
    }, [showToast]);

    const loadPermissions = useCallback(async (rid) => {
        if (!rid) return;
        setRoleLoading(true);
        const { data, error } = await supabase.from('permissions').select('*').eq('role_id', rid);
        if (error) {
            console.error('Failed to load permissions:', error.message);
            showToast('Failed to load permissions.', true);
        }
        const map = {};
        (data || []).forEach((p) => { map[p.module_name] = p; });
        setPermsByModule(map);
        setRoleLoading(false);
    }, [showToast]);

    useEffect(() => { loadRoles(); }, [loadRoles]);
    useEffect(() => { if (roleId) loadPermissions(roleId); }, [roleId, loadPermissions]);

    const currentRole = useMemo(() => roles.find((r) => r.id === roleId), [roles, roleId]);
    const isAdminRole = currentRole?.role_name === 'Administrator';

    async function toggleRolePerm(moduleKey, action) {
        if (!isSuperAdmin || isAdminRole) return;
        const existing = permsByModule[moduleKey] || {};
        const nextValue = !existing[action];
        const key = `role-${moduleKey}-${action}`;
        setSavingKey(key);
        const payload = {
            role_id: roleId,
            module_name: moduleKey,
            can_view: existing.can_view || false,
            can_add: existing.can_add || false,
            can_edit: existing.can_edit || false,
            can_delete: existing.can_delete || false,
            can_print: existing.can_print || false,
            can_export: existing.can_export || false,
            can_approve: existing.can_approve || false,
            [action]: nextValue,
        };
        setPermsByModule((prev) => ({ ...prev, [moduleKey]: { ...existing, [action]: nextValue } }));
        const { error } = await supabase.from('permissions').upsert(payload, { onConflict: 'role_id,module_name' });
        if (error) {
            console.error('Failed to update permission:', error.message);
            showToast('Failed to update permission.', true);
            setPermsByModule((prev) => ({ ...prev, [moduleKey]: existing }));
        }
        setSavingKey('');
    }

    // --- Per-user overrides --------------------------------------------------
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [userId, setUserId] = useState('');
    const [userRolePerms, setUserRolePerms] = useState({});
    const [userOverrides, setUserOverrides] = useState({});
    const [userPermsLoading, setUserPermsLoading] = useState(true);

    const loadUsers = useCallback(async () => {
        setUsersLoading(true);
        const { data, error } = await supabase
            .from('app_users')
            .select('id, employee_name, email, role_id, roles(role_name)')
            .order('employee_name', { ascending: true });
        if (error) {
            console.error('Failed to load users:', error.message);
            showToast('Failed to load users.', true);
        }
        const list = data || [];
        setUsers(list);
        if (list.length > 0) setUserId((prev) => prev || list[0].id);
        setUsersLoading(false);
    }, [showToast]);

    const loadUserPermissions = useCallback(async (uid) => {
        if (!uid) return;
        setUserPermsLoading(true);
        const selected = users.find((u) => u.id === uid);
        const [roleRes, overrideRes] = await Promise.all([
            selected?.role_id
                ? supabase.from('permissions').select('*').eq('role_id', selected.role_id)
                : Promise.resolve({ data: [] }),
            supabase.from('user_permissions').select('*').eq('app_user_id', uid),
        ]);
        if (roleRes.error) {
            console.error('Failed to load role permissions:', roleRes.error.message);
            showToast('Failed to load role permissions.', true);
        }
        if (overrideRes.error) {
            console.error('Failed to load user overrides:', overrideRes.error.message);
            showToast('Failed to load user overrides.', true);
        }
        const roleMap = {};
        (roleRes.data || []).forEach((p) => { roleMap[p.module_name] = p; });
        const overrideMap = {};
        (overrideRes.data || []).forEach((p) => { overrideMap[p.module_name] = p; });
        setUserRolePerms(roleMap);
        setUserOverrides(overrideMap);
        setUserPermsLoading(false);
    }, [users, showToast]);

    useEffect(() => { if (mode === 'user') loadUsers(); }, [mode, loadUsers]);
    useEffect(() => { if (mode === 'user' && userId && users.length > 0) loadUserPermissions(userId); }, [mode, userId, users, loadUserPermissions]);

    const selectedUser = useMemo(() => users.find((u) => u.id === userId), [users, userId]);
    const selectedUserIsAdminRole = selectedUser?.roles?.role_name === 'Administrator';

    async function toggleUserOverride(moduleKey, action) {
        if (!isSuperAdmin || selectedUserIsAdminRole) return;
        const existing = userOverrides[moduleKey] || {};
        const current = existing[action];
        const next = current === true ? false : current === false ? null : true;
        const key = `user-${moduleKey}-${action}`;
        setSavingKey(key);

        const merged = { ...existing, [action]: next };
        const allNull = PERMISSION_ACTIONS.every((a) => merged[a] === null || merged[a] === undefined);

        setUserOverrides((prev) => ({ ...prev, [moduleKey]: merged }));

        if (allNull) {
            const { error } = await supabase.from('user_permissions').delete().eq('app_user_id', userId).eq('module_name', moduleKey);
            if (error) {
                console.error('Failed to clear override:', error.message);
                showToast('Failed to clear override.', true);
                setUserOverrides((prev) => ({ ...prev, [moduleKey]: existing }));
            } else {
                setUserOverrides((prev) => {
                    const next = { ...prev };
                    delete next[moduleKey];
                    return next;
                });
            }
        } else {
            const payload = { app_user_id: userId, module_name: moduleKey };
            PERMISSION_ACTIONS.forEach((a) => { payload[a] = a === action ? next : (existing[a] ?? null); });
            const { error } = await supabase.from('user_permissions').upsert(payload, { onConflict: 'app_user_id,module_name' });
            if (error) {
                console.error('Failed to update override:', error.message);
                showToast('Failed to update override.', true);
                setUserOverrides((prev) => ({ ...prev, [moduleKey]: existing }));
            }
        }
        setSavingKey('');
    }

    function overrideState(moduleKey, action) {
        const val = userOverrides[moduleKey]?.[action];
        if (val === true) return 'allow';
        if (val === false) return 'deny';
        return 'inherit';
    }

    return (
        <section className="app-view">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white">
                    <div className="mb-2">
                        <h5 className="mb-0">Permissions</h5>
                        <p className="text-muted small mb-0">
                            Set defaults per role, or override access for one specific person. Administrator always has full access.
                            {!isSuperAdmin && ' Only the system administrator can make changes here.'}
                        </p>
                    </div>
                    <div className="btn-group" role="group">
                        <button type="button" className={`btn btn-sm ${mode === 'role' ? 'btn-accent' : 'btn-outline-secondary'}`} onClick={() => setMode('role')}>By Role</button>
                        <button type="button" className={`btn btn-sm ${mode === 'user' ? 'btn-accent' : 'btn-outline-secondary'}`} onClick={() => setMode('user')}>By User</button>
                    </div>
                </div>
                <div className="card-body">
                    {mode === 'role' ? (
                        <>
                            <div className="row g-2 mb-3">
                                <div className="col-12 col-md-4">
                                    <select className="form-select" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                                        {roles.map((r) => <option key={r.id} value={r.id}>{r.role_name}</option>)}
                                    </select>
                                </div>
                            </div>
                            {isAdminRole && (
                                <div className="alert alert-secondary small">Administrator role always has full access to every module and cannot be restricted.</div>
                            )}
                            {roleLoading ? (
                                <LoadingSpinner label="Loading permissions…" />
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0 table-stack">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Module</th>
                                                {PERMISSION_ACTIONS.map((a) => <th key={a} className="text-center">{ACTION_LABELS[a]}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {MODULE_LIST.map((m) => {
                                                const perm = permsByModule[m.key] || {};
                                                return (
                                                    <tr key={m.key}>
                                                        <td data-label="Module"><span className="fw-semibold">{m.label}</span></td>
                                                        {PERMISSION_ACTIONS.map((a) => (
                                                            <td key={a} data-label={ACTION_LABELS[a]} className="text-md-center">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input mt-0"
                                                                    checked={isAdminRole || !!perm[a]}
                                                                    disabled={!isSuperAdmin || isAdminRole || savingKey === `role-${m.key}-${a}`}
                                                                    onChange={() => toggleRolePerm(m.key, a)}
                                                                />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="row g-2 mb-3">
                                <div className="col-12 col-md-5">
                                    {usersLoading ? (
                                        <LoadingSpinner label="Loading users…" />
                                    ) : (
                                        <select className="form-select" value={userId} onChange={(e) => setUserId(e.target.value)}>
                                            {users.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {(u.employee_name || u.email)} — {u.roles?.role_name || 'Unassigned'}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <p className="text-muted small">
                                Green ✓ / red ✕ are overrides just for this person. A grey dash or outlined check means they still inherit
                                their role&apos;s default — click a cell to override it, click again to deny it, click again to go back to inherit.
                            </p>
                            {selectedUserIsAdminRole && (
                                <div className="alert alert-secondary small">This user&apos;s role (Administrator) always has full access to every module; per-user overrides don&apos;t apply.</div>
                            )}
                            {userPermsLoading || usersLoading ? (
                                <LoadingSpinner label="Loading permissions…" />
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0 table-stack">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Module</th>
                                                {PERMISSION_ACTIONS.map((a) => <th key={a} className="text-center">{ACTION_LABELS[a]}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {MODULE_LIST.map((m) => {
                                                const rolePerm = userRolePerms[m.key] || {};
                                                return (
                                                    <tr key={m.key}>
                                                        <td data-label="Module"><span className="fw-semibold">{m.label}</span></td>
                                                        {PERMISSION_ACTIONS.map((a) => (
                                                            <td key={a} data-label={ACTION_LABELS[a]} className="text-md-center">
                                                                <PermCell
                                                                    state={selectedUserIsAdminRole ? 'allow' : overrideState(m.key, a)}
                                                                    roleValue={selectedUserIsAdminRole || !!rolePerm[a]}
                                                                    disabled={!isSuperAdmin || selectedUserIsAdminRole || savingKey === `user-${m.key}-${a}`}
                                                                    onClick={() => toggleUserOverride(m.key, a)}
                                                                    moduleLabel={m.label}
                                                                    actionLabel={ACTION_LABELS[a]}
                                                                />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
