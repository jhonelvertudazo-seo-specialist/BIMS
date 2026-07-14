import { useMemo, useState } from 'react';
import { useGenericEntity } from '../hooks/useGenericEntity.js';
import { eventsConfig } from '../lib/entityConfigs/scheduling.js';
import { appointmentsConfig } from '../lib/entityConfigs/scheduling.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { formatDate } from '../utils/format.js';

function toDateKey(dateStr) {
    if (!dateStr) return null;
    return dateStr.slice(0, 10);
}

export default function CalendarPage() {
    const { items: events, loading: eLoading } = useGenericEntity(eventsConfig);
    const { items: appointments, loading: aLoading } = useGenericEntity(appointmentsConfig);
    const [cursor, setCursor] = useState(() => {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth() };
    });

    const itemsByDate = useMemo(() => {
        const map = {};
        events.forEach((e) => {
            const key = toDateKey(e.date);
            if (!key) return;
            if (!map[key]) map[key] = [];
            map[key].push({ label: e.eventName, type: e.eventType === 'Session' ? 'Session' : 'Event' });
        });
        appointments.forEach((a) => {
            const key = toDateKey(a.date);
            if (!key) return;
            if (!map[key]) map[key] = [];
            map[key].push({ label: a.purpose, type: 'Appointment' });
        });
        return map;
    }, [events, appointments]);

    const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const firstDay = new Date(cursor.year, cursor.month, 1);
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const startWeekday = firstDay.getDay();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    function changeMonth(delta) {
        setCursor((prev) => {
            const d = new Date(prev.year, prev.month + delta, 1);
            return { year: d.getFullYear(), month: d.getMonth() };
        });
    }

    const upcoming = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        return Object.entries(itemsByDate)
            .filter(([date]) => date >= today)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(0, 8);
    }, [itemsByDate]);

    if (eLoading || aLoading) return <LoadingSpinner label="Loading calendar…" />;

    return (
        <section className="app-view">
            <div className="row g-3">
                <div className="col-12 col-lg-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => changeMonth(-1)}>‹ Prev</button>
                            <h5 className="mb-0 text-center flex-grow-1">{monthLabel}</h5>
                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => changeMonth(1)}>Next ›</button>
                        </div>
                        <div className="card-body">
                            <div className="calendar-scroll">
                                <div className="calendar-grid-inner">
                                    <div className="row row-cols-7 g-1 text-center small fw-semibold text-muted mb-1">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                                            <div className="col" key={d}>{d}</div>
                                        ))}
                                    </div>
                                    <div className="row row-cols-7 g-1">
                                        {cells.map((day, idx) => {
                                            if (!day) return <div className="col" key={`empty-${idx}`} style={{ minHeight: 70 }} />;
                                            const key = `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                            const dayItems = itemsByDate[key] || [];
                                            return (
                                                <div className="col" key={key}>
                                                    <div className="border rounded p-1" style={{ minHeight: 70 }}>
                                                        <div className="small fw-semibold">{day}</div>
                                                        {dayItems.slice(0, 2).map((it, i) => (
                                                            <div key={i} className="small text-truncate text-primary">{it.label}</div>
                                                        ))}
                                                        {dayItems.length > 2 && <div className="small text-muted">+{dayItems.length - 2} more</div>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-white">
                            <h5 className="mb-0">Upcoming</h5>
                        </div>
                        <div className="card-body">
                            {upcoming.length === 0 && <p className="text-muted small mb-0">Nothing scheduled.</p>}
                            {upcoming.map(([date, items]) => (
                                <div key={date} className="mb-3">
                                    <div className="small text-muted">{formatDate(date)}</div>
                                    {items.map((it, i) => (
                                        <div key={i} className="small">
                                            <span className="badge bg-secondary-subtle text-secondary me-1">{it.type}</span>
                                            {it.label}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
