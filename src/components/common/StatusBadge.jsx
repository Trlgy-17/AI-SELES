// File: src/components/common/StatusBadge.jsx
import React from 'react';

export const StatusBadge = ({ status }) => {
    let colorClass = 'bg-zinc-800 text-zinc-300 border-zinc-700';

    if (status === 'Prospek / Survey' || status === 'Prospek' || status === 'Survey') {
        colorClass = 'bg-blue-950/80 text-blue-300 border-blue-800';
    } else if (status === 'Design Review' || status === 'Desain') {
        colorClass = 'bg-amber-950/80 text-amber-300 border-amber-800';
    } else if (status === 'Closing / DP Masuk' || status === 'Closing' || status === 'Selesai') {
        colorClass = 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    } else if (status === 'Batal / Unqualified' || status === 'Batal') {
        colorClass = 'bg-rose-950/80 text-rose-300 border-rose-800';
    } else if (status === 'Pending') {
        colorClass = 'bg-purple-950/80 text-purple-300 border-purple-800';
    }

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${colorClass}`}>
            {status}
        </span>
    );
};
