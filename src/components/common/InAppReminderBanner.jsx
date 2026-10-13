// File: src/components/common/InAppReminderBanner.jsx
import React from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import { Badge } from '../ui/Surface.jsx';

export const InAppReminderBanner = ({ overdueCount, todayCount, rescheduleCount, onNavigateFollowUp }) => {
    if (overdueCount === 0 && todayCount === 0 && rescheduleCount === 0) return null;

    return (
        <div className="mb-5 flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-3 animate-fade-in sm:flex-row sm:items-center sm:justify-between" role="status">
            <div className="flex min-w-0 items-start gap-3">
                <Bell size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-body-sm font-medium text-fg">Pengingat follow-up</span>
                        {overdueCount > 0 && <Badge variant="danger">{overdueCount} terlambat</Badge>}
                        {todayCount > 0 && <Badge variant="warning">{todayCount} hari ini</Badge>}
                        {rescheduleCount > 0 && <Badge variant="purple">{rescheduleCount} perlu dijadwalkan</Badge>}
                    </div>
                    <p className="mt-0.5 text-caption text-fg-muted">Pengingat hanya aktif selama tab aplikasi ini terbuka.</p>
                </div>
            </div>
            <button
                onClick={onNavigateFollowUp}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-sm px-3 text-body-sm font-medium text-primary-text hover:bg-primary-subtle sm:self-auto"
            >
                Buka CRM
                <ArrowRight size={14} aria-hidden="true" />
            </button>
        </div>
    );
};
