// File: src/components/common/InAppReminderBanner.jsx
import React from 'react';
import { Icons } from '../Icons.jsx';

export const InAppReminderBanner = ({ overdueCount, todayCount, rescheduleCount, onNavigateFollowUp }) => {
    if (overdueCount === 0 && todayCount === 0 && rescheduleCount === 0) return null;

    return (
        <div className="mb-6 p-4 bg-[#1a1712] border border-[#c5a059]/40 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xl animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#c5a059]/20 text-[#c5a059] rounded-xl shrink-0">
                    <Icons.Bell />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white flex items-center flex-wrap gap-2">
                        Pengingat Follow-Up In-App Aktif
                        {overdueCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 text-xs font-bold border border-rose-800">
                                {overdueCount} Terlambat
                            </span>
                        )}
                        {todayCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 text-xs font-bold border border-amber-800">
                                {todayCount} Hari Ini
                            </span>
                        )}
                        {rescheduleCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 text-xs font-bold border border-purple-800">
                                {rescheduleCount} Perlu Dijadwalkan Ulang
                            </span>
                        )}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        💡 Pengingat in-app hanya aktif selama tab aplikasi ini terbuka di browser (tidak ada proses di latar belakang saat tab ditutup). Klik tombol di kanan untuk mengawal proses closing.
                    </p>
                </div>
            </div>
            <button 
                onClick={onNavigateFollowUp}
                className="gold-btn px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-md self-end md:self-auto"
            >
                Buka Follow-Up Flow &rarr;
            </button>
        </div>
    );
};
