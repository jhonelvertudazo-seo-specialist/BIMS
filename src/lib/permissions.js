// Pure permission-resolution logic shared by AuthContext's can(). Kept
// separate from the context so it can be unit tested without mounting
// React or hitting Supabase: isApproved -> isAdmin -> per-user override ->
// role default -> deny.
export function resolveCan({ isApproved, isAdmin, permissionMap, userPermissionMap, moduleKey, action }) {
    if (!isApproved) return false;
    if (isAdmin) return true;
    const override = userPermissionMap[moduleKey];
    const overrideValue = override ? override[`can_${action}`] : null;
    if (overrideValue !== null && overrideValue !== undefined) return !!overrideValue;
    const perm = permissionMap[moduleKey];
    if (!perm) return false;
    return !!perm[`can_${action}`];
}
