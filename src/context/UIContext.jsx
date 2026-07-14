import { createContext, useCallback, useContext, useState } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
    const [toast, setToast] = useState({ show: false, message: '', isError: false });

    const [residentModal, setResidentModal] = useState({ open: false, id: null });
    const [residentViewId, setResidentViewId] = useState(null);
    const [residentDeleteId, setResidentDeleteId] = useState(null);
    const [certificateModalOpen, setCertificateModalOpen] = useState(false);
    const [certificateViewId, setCertificateViewId] = useState(null);
    const [certificateDeleteId, setCertificateDeleteId] = useState(null);
    const [blotterModalOpen, setBlotterModalOpen] = useState(false);
    const [blotterViewId, setBlotterViewId] = useState(null);
    const [blotterDeleteId, setBlotterDeleteId] = useState(null);

    const [householdModal, setHouseholdModal] = useState({ open: false, id: null });
    const [householdViewId, setHouseholdViewId] = useState(null);
    const [householdDeleteId, setHouseholdDeleteId] = useState(null);

    const showToast = useCallback((message, isError = false) => {
        setToast({ show: true, message, isError, key: Date.now() });
    }, []);
    const hideToast = useCallback(() => setToast((prev) => ({ ...prev, show: false })), []);

    const openAddResident = useCallback(() => setResidentModal({ open: true, id: null }), []);
    const openEditResident = useCallback((id) => setResidentModal({ open: true, id }), []);
    const closeResidentModal = useCallback(() => setResidentModal({ open: false, id: null }), []);

    const openViewResident = useCallback((id) => setResidentViewId(id), []);
    const closeViewResident = useCallback(() => setResidentViewId(null), []);

    const openDeleteResident = useCallback((id) => setResidentDeleteId(id), []);
    const closeDeleteResident = useCallback(() => setResidentDeleteId(null), []);

    const openCertificateModal = useCallback(() => setCertificateModalOpen(true), []);
    const closeCertificateModal = useCallback(() => setCertificateModalOpen(false), []);

    const openViewCertificate = useCallback((id) => setCertificateViewId(id), []);
    const closeViewCertificate = useCallback(() => setCertificateViewId(null), []);

    const openDeleteCertificate = useCallback((id) => setCertificateDeleteId(id), []);
    const closeDeleteCertificate = useCallback(() => setCertificateDeleteId(null), []);

    const openBlotterModal = useCallback(() => setBlotterModalOpen(true), []);
    const closeBlotterModal = useCallback(() => setBlotterModalOpen(false), []);

    const openViewBlotter = useCallback((id) => setBlotterViewId(id), []);
    const closeViewBlotter = useCallback(() => setBlotterViewId(null), []);

    const openDeleteBlotter = useCallback((id) => setBlotterDeleteId(id), []);
    const closeDeleteBlotter = useCallback(() => setBlotterDeleteId(null), []);

    const openAddHousehold = useCallback(() => setHouseholdModal({ open: true, id: null }), []);
    const openEditHousehold = useCallback((id) => setHouseholdModal({ open: true, id }), []);
    const closeHouseholdModal = useCallback(() => setHouseholdModal({ open: false, id: null }), []);

    const openViewHousehold = useCallback((id) => setHouseholdViewId(id), []);
    const closeViewHousehold = useCallback(() => setHouseholdViewId(null), []);

    const openDeleteHousehold = useCallback((id) => setHouseholdDeleteId(id), []);
    const closeDeleteHousehold = useCallback(() => setHouseholdDeleteId(null), []);

    const value = {
        toast, showToast, hideToast,
        residentModal, openAddResident, openEditResident, closeResidentModal,
        residentViewId, openViewResident, closeViewResident,
        residentDeleteId, openDeleteResident, closeDeleteResident,
        certificateModalOpen, openCertificateModal, closeCertificateModal,
        certificateViewId, openViewCertificate, closeViewCertificate,
        certificateDeleteId, openDeleteCertificate, closeDeleteCertificate,
        blotterModalOpen, openBlotterModal, closeBlotterModal,
        blotterViewId, openViewBlotter, closeViewBlotter,
        blotterDeleteId, openDeleteBlotter, closeDeleteBlotter,
        householdModal, openAddHousehold, openEditHousehold, closeHouseholdModal,
        householdViewId, openViewHousehold, closeViewHousehold,
        householdDeleteId, openDeleteHousehold, closeDeleteHousehold,
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
    const ctx = useContext(UIContext);
    if (!ctx) throw new Error('useUI must be used within a UIProvider');
    return ctx;
}
