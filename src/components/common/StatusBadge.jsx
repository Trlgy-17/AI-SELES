// File: src/components/common/StatusBadge.jsx
import React from 'react';

export const STATUS_TONES = {
    sky: { badge: 'bg-sky-500/10 text-sky-300 border-sky-500/20', dot: 'bg-sky-400' },
    violet: { badge: 'bg-violet-500/10 text-violet-300 border-violet-500/20', dot: 'bg-violet-400' },
    amber: { badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20', dot: 'bg-amber-400' },
    emerald: { badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', dot: 'bg-emerald-400' },
    neutral: { badge: 'bg-slate-500/10 text-slate-300 border-slate-500/20', dot: 'bg-slate-400' },
    red: { badge: 'bg-red-500/10 text-red-300 border-red-500/20', dot: 'bg-red-400' }
};

export const getStatusTone = (status) => {
    if (status === 'Prospek / Survey' || status === 'Prospek' || status === 'Survey') return 'sky';
    if (status === 'Design Review' || status === 'Desain') return 'violet';
    if (status === 'Penawaran RAB' || status === 'Penawaran' || status === 'Pending') return 'amber';
    if (status === 'Closing / DP Masuk' || status === 'Closing') return 'emerald';
    if (status === 'Selesai / Terpasang' || status === 'Selesai') return 'neutral';
    if (status === 'Batal / Unqualified' || status === 'Batal') return 'red';
    return 'neutral';
};

export const StatusBadge = ({ status }) => {
    const tone = STATUS_TONES[getStatusTone(status)];
    return (
        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xs border px-2 py-0.5 text-caption font-medium ${tone.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} aria-hidden="true" />
            {status}
        </span>
    );
};
