import { describe, it, expect } from 'vitest';
import { resolveCan } from './permissions.js';

const base = {
    isApproved: true,
    isAdmin: false,
    permissionMap: {},
    userPermissionMap: {},
    moduleKey: 'residents',
    action: 'view',
};

describe('resolveCan', () => {
    it('denies when the account is not approved, even for an admin', () => {
        expect(resolveCan({ ...base, isApproved: false, isAdmin: true })).toBe(false);
    });

    it('always allows admins on approved accounts', () => {
        expect(resolveCan({ ...base, isAdmin: true })).toBe(true);
    });

    it('denies when no role permission exists for the module', () => {
        expect(resolveCan(base)).toBe(false);
    });

    it('falls back to the role default when there is no per-user override', () => {
        const permissionMap = { residents: { can_view: true } };
        expect(resolveCan({ ...base, permissionMap })).toBe(true);
    });

    it('lets an explicit per-user override deny access even if the role allows it', () => {
        const permissionMap = { residents: { can_view: true } };
        const userPermissionMap = { residents: { can_view: false } };
        expect(resolveCan({ ...base, permissionMap, userPermissionMap })).toBe(false);
    });

    it('lets an explicit per-user override grant access even if the role denies it', () => {
        const permissionMap = { residents: { can_view: false } };
        const userPermissionMap = { residents: { can_view: true } };
        expect(resolveCan({ ...base, permissionMap, userPermissionMap })).toBe(true);
    });

    it('treats a null override as "inherit from role", not as an explicit deny', () => {
        const permissionMap = { residents: { can_view: true } };
        const userPermissionMap = { residents: { can_view: null } };
        expect(resolveCan({ ...base, permissionMap, userPermissionMap })).toBe(true);
    });
});
