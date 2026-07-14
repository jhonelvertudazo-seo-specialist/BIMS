export const loginHistoryConfig = {
    key: 'loginHistory',
    table: 'login_history',
    title: 'Login History',
    orderBy: { column: 'login_at', ascending: false },
    fields: [
        { key: 'email', label: 'Email', type: 'text' },
        { key: 'loginAt', label: 'Login At', type: 'text', column: 'login_at' },
    ],
};
