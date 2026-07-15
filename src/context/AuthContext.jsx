import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { nameFromEmail } from '../utils/format.js';
import { resolveCan } from '../lib/permissions.js';

const AuthContext = createContext(null);

const ADMIN_ROLE_NAME = 'Administrator';
// The system administrator's account is never subject to the approval
// workflow, even if the app_users row is missing, broken, or the relevant
// migrations haven't been applied to the database yet. See
// supabase/migrations/0007_admin_failsafe.sql for the matching DB-side rule.
const SUPER_ADMIN_EMAIL = 'jhonelvertudazo@gmail.com';

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [appUser, setAppUser] = useState(null);
    const [permissionMap, setPermissionMap] = useState({});
    const [userPermissionMap, setUserPermissionMap] = useState({});
    const [appUserLoading, setAppUserLoading] = useState(true);
    const loggedLoginRef = useRef(new Set());

    const resolveAppUser = useCallback(async (authUser) => {
        if (!authUser) {
            setAppUser(null);
            setPermissionMap({});
            setUserPermissionMap({});
            setAppUserLoading(false);
            return;
        }
        setAppUserLoading(true);
        const isFallbackSuperAdmin = authUser.email === SUPER_ADMIN_EMAIL;
        try {
            const { data: existing, error } = await supabase
                .from('app_users')
                .select('*, roles(role_name)')
                .eq('auth_user_id', authUser.id)
                .maybeSingle();
            if (error) throw error;

            let record = existing;
            if (!record) {
                const { count } = await supabase.from('app_users').select('id', { count: 'exact', head: true });
                const isFirstUser = !count;
                let roleId = null;
                if (isFirstUser) {
                    const { data: adminRole } = await supabase.from('roles').select('id').eq('role_name', ADMIN_ROLE_NAME).maybeSingle();
                    roleId = adminRole?.id || null;
                }
                const { data: inserted, error: insertError } = await supabase
                    .from('app_users')
                    .insert({
                        auth_user_id: authUser.id,
                        email: authUser.email,
                        employee_name: nameFromEmail(authUser.email),
                        role_id: roleId,
                        account_status: isFirstUser ? 'Active' : 'Pending',
                    })
                    .select('*, roles(role_name)')
                    .single();
                if (insertError) throw insertError;
                record = inserted;
            }

            const isSuperAdmin = isFallbackSuperAdmin || !!record.is_super_admin;

            setAppUser({
                id: record.id,
                accountStatus: isSuperAdmin ? 'Active' : record.account_status,
                roleId: record.role_id,
                roleName: isSuperAdmin ? ADMIN_ROLE_NAME : (record.roles?.role_name || null),
                employeeName: record.employee_name,
                isSuperAdmin,
            });

            if (isSuperAdmin && (record.account_status !== 'Active' || record.roles?.role_name !== ADMIN_ROLE_NAME)) {
                // Self-heal: bring the DB row in line so RLS (is_active_user/
                // is_active_administrator) also sees him as active without
                // relying solely on the SQL-level email override.
                supabase.from('roles').select('id').eq('role_name', ADMIN_ROLE_NAME).maybeSingle().then(({ data: adminRole }) => {
                    supabase.from('app_users').update({
                        account_status: 'Active',
                        role_id: adminRole?.id || record.role_id,
                    }).eq('id', record.id);
                });
            }

            if (record.account_status === 'Active' || isSuperAdmin) {
                if (record.role_id) {
                    const { data: perms } = await supabase.from('permissions').select('*').eq('role_id', record.role_id);
                    const map = {};
                    (perms || []).forEach((p) => { map[p.module_name] = p; });
                    setPermissionMap(map);
                } else {
                    setPermissionMap({});
                }
                const { data: overrides } = await supabase.from('user_permissions').select('*').eq('app_user_id', record.id);
                const overrideMap = {};
                (overrides || []).forEach((p) => { overrideMap[p.module_name] = p; });
                setUserPermissionMap(overrideMap);
                if (!loggedLoginRef.current.has(authUser.id)) {
                    loggedLoginRef.current.add(authUser.id);
                    supabase.from('login_history').insert({ auth_user_id: authUser.id, email: authUser.email });
                    supabase.from('app_users').update({ last_login: new Date().toISOString() }).eq('id', record.id);
                }
            } else {
                setPermissionMap({});
                setUserPermissionMap({});
            }
        } catch (err) {
            console.error('Failed to resolve app user:', err.message);
            if (isFallbackSuperAdmin) {
                // Never let a DB hiccup (e.g. migrations not applied yet) lock
                // the system administrator out of the app.
                setAppUser({ id: null, accountStatus: 'Active', roleId: null, roleName: ADMIN_ROLE_NAME, employeeName: nameFromEmail(authUser.email), isSuperAdmin: true });
            } else {
                setAppUser(null);
            }
            setPermissionMap({});
            setUserPermissionMap({});
        } finally {
            setAppUserLoading(false);
        }
    }, []);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
            resolveAppUser(data.session?.user ?? null);
        });

        const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
            resolveAppUser(newSession?.user ?? null);
        });

        return () => subscription.subscription.unsubscribe();
    }, [resolveAppUser]);

    async function signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    }

    async function signOut() {
        await supabase.auth.signOut();
        setAppUser(null);
        setPermissionMap({});
        setUserPermissionMap({});
    }

    const isAdmin = appUser?.roleName === ADMIN_ROLE_NAME;
    const isApproved = appUser?.accountStatus === 'Active';
    // The account allowed to grant or edit permissions for other users.
    // Backed by app_users.is_super_admin (see supabase/migrations/0012_super_admin_flag.sql);
    // the hardcoded email is kept only as a fallback if that row/column
    // isn't reachable yet. Matches the DB-side rule in is_super_admin().
    const isSuperAdmin = !!appUser?.isSuperAdmin || session?.user?.email === SUPER_ADMIN_EMAIL;

    function can(moduleKey, action) {
        return resolveCan({ isApproved, isAdmin, permissionMap, userPermissionMap, moduleKey, action });
    }

    const value = {
        session,
        user: session?.user ?? null,
        loading: loading || appUserLoading,
        appUser,
        isAdmin,
        isSuperAdmin,
        isApproved,
        can,
        signIn,
        signOut,
        refreshAppUser: () => resolveAppUser(session?.user ?? null),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
