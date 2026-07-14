import { useMemo } from 'react';
import { useData } from '../context/DataContext.jsx';
import { useGenericEntity } from '../hooks/useGenericEntity.js';
import { collectionsConfig } from '../lib/entityConfigs/collections.js';
import { expensesConfig } from '../lib/entityConfigs/expenses.js';
import { budgetsConfig } from '../lib/entityConfigs/budgets.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import HBarList from '../components/charts/HBarList.jsx';
import ColumnChart from '../components/charts/ColumnChart.jsx';
import { formatCurrency, monthKey } from '../utils/format.js';

function lastSixMonthBuckets() {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: d.toLocaleDateString('en-US', { month: 'short' }),
        });
    }
    return months;
}

export default function FinancialReportsPage() {
    const { certificates } = useData();
    const { items: collections, loading: cLoading } = useGenericEntity(collectionsConfig);
    const { items: expenses, loading: eLoading } = useGenericEntity(expensesConfig);
    const { items: budgets, loading: bLoading } = useGenericEntity(budgetsConfig);

    const totalCollections = useMemo(() => collections.reduce((s, i) => s + (Number(i.amount) || 0), 0), [collections]);
    const totalCertFees = useMemo(() => certificates.reduce((s, c) => s + (Number(c.fee) || 0), 0), [certificates]);
    const totalExpenses = useMemo(() => expenses.reduce((s, i) => s + (Number(i.amount) || 0), 0), [expenses]);
    const totalRevenue = totalCollections + totalCertFees;
    const netBalance = totalRevenue - totalExpenses;

    const revenueVsExpenseTrend = useMemo(() => {
        const buckets = lastSixMonthBuckets();
        const revenueByMonth = {};
        const expenseByMonth = {};
        collections.forEach((c) => {
            const key = monthKey(c.createdAt);
            revenueByMonth[key] = (revenueByMonth[key] || 0) + (Number(c.amount) || 0);
        });
        expenses.forEach((e) => {
            const key = monthKey(e.createdAt);
            expenseByMonth[key] = (expenseByMonth[key] || 0) + (Number(e.amount) || 0);
        });
        return buckets.map((m) => ({ label: m.label, value: Math.round(revenueByMonth[m.key] || 0) }));
    }, [collections, expenses]);

    const expenseByCategory = useMemo(() => {
        const counts = {};
        expenses.forEach((e) => {
            const key = e.category || 'Other';
            counts[key] = (counts[key] || 0) + (Number(e.amount) || 0);
        });
        return Object.entries(counts).map(([label, value]) => ({ label, value: Math.round(value) })).sort((a, b) => b.value - a.value);
    }, [expenses]);

    if (cLoading || eLoading || bLoading) return <LoadingSpinner label="Loading financial reports…" />;

    return (
        <section className="app-view">
            <div className="row g-3 mb-3">
                <div className="col-6 col-md-3">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">💰</div>
                            <div>
                                <div className="stat-tile-label">Total Revenue</div>
                                <div className="fs-4 stat-tile-value">{formatCurrency(totalRevenue)}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">🧾</div>
                            <div>
                                <div className="stat-tile-label">Total Expenses</div>
                                <div className="fs-4 stat-tile-value">{formatCurrency(totalExpenses)}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">📈</div>
                            <div>
                                <div className="stat-tile-label">Net Balance</div>
                                <div className="fs-4 stat-tile-value">{formatCurrency(netBalance)}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card stat-card shadow-sm border-0 h-100">
                        <div className="card-body d-flex align-items-center gap-3">
                            <div className="stat-icon bg-primary-subtle text-primary">📊</div>
                            <div>
                                <div className="stat-tile-label">Budget Lines</div>
                                <div className="fs-4 stat-tile-value">{budgets.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3">
                <div className="col-12 col-md-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="viz-card-title">Collections Trend</div>
                            <div className="viz-card-subtitle mb-2">Last 6 months</div>
                            <ColumnChart data={revenueVsExpenseTrend} />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <div className="viz-card-title">Expenses by Category</div>
                            <div className="viz-card-subtitle mb-2">All recorded expenses</div>
                            <HBarList data={expenseByCategory} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
