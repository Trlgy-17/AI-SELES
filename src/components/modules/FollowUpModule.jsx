// File: src/components/modules/FollowUpModule.jsx
import React, { useState, useMemo } from 'react';
import { Icons } from '../Icons.jsx';
import { StatusBadge } from '../common/StatusBadge.jsx';
import { ConfirmModal } from '../common/ConfirmModal.jsx';
import { EditTaskModal } from '../modals/EditTaskModal.jsx';
import { normalizePhone, formatDisplayPhone, buildWaLink } from '../../js/utils/phone.js';
import { generateId } from '../../js/utils/id.js';
import { getAsiaJakartaDate, getAsiaJakartaIso, addDaysToDate } from '../../js/utils/date.js';
import { addTombstone } from '../../js/services/migration.js';

export const FollowUpModule = ({ followUpTasks = [], setFollowUpTasks, crmLeads = [], userId, showToast }) => {
    const [followUpSearch, setFollowUpSearch] = useState('');
    const [taskFilter, setTaskFilter] = useState('Semua');

    const [selectedLeadId, setSelectedLeadId] = useState('');
    const [newFollowClient, setNewFollowClient] = useState('');
    const [newFollowPhone, setNewFollowPhone] = useState('');
    const [newFollowType, setNewFollowType] = useState('');
    const [newFollowDue, setNewFollowDue] = useState('');

    const [followUpError, setFollowUpError] = useState(null);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [deleteTaskId, setDeleteTaskId] = useState(null);
    const [isDeletingTask, setIsDeletingTask] = useState(false);
    const [togglingTaskIds, setTogglingTaskIds] = useState(new Set());

    const todayStr = getAsiaJakartaDate();

    const handleLeadSelect = (e) => {
        const leadId = e.target.value;
        setSelectedLeadId(leadId);
        if (leadId) {
            const found = crmLeads.find(l => l.id === leadId);
            if (found) {
                setNewFollowClient(found.name);
                setNewFollowPhone(found.phoneRaw || found.phoneNormalized || '');
            }
        }
    };

    const handleAddTask = async () => {
        const clientName = newFollowClient.trim();
        if (!clientName) {
            setFollowUpError("Mohon masukkan nama klien follow-up.");
            return;
        }

        setFollowUpError(null);
        setIsAddingTask(true);

        const phoneRaw = newFollowPhone.trim();
        const phoneNormalized = normalizePhone(phoneRaw);
        const taskId = generateId('task');

        const taskData = {
            id: taskId,
            schemaVersion: 2,
            leadId: selectedLeadId || null,
            client: clientName.slice(0, 100),
            phoneRaw: phoneRaw.slice(0, 30),
            phoneNormalized: phoneNormalized,
            type: (newFollowType.trim() || 'Follow-Up Prospek').slice(0, 100),
            status: 'Pending',
            dueDate: newFollowDue || null,
            needsReschedule: !newFollowDue,
            createdAt: getAsiaJakartaIso(),
            updatedAt: getAsiaJakartaIso(),
            isDetachedFromDeletedLead: false,
            syncStatus: 'synced'
        };

        setFollowUpTasks(prev => [taskData, ...prev]);

        if (window.firebaseServices?.db && userId) {
            try {
                const { db, appId, doc, setDoc } = window.firebaseServices;
                await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'followUpTasks', taskId), taskData);
                showToast("Tugas follow-up berhasil dijadwalkan & disinkronkan ke Cloud!");
            } catch (e) {
                console.warn("[FollowUp] Cloud save failed:", e);
                showToast("Tersimpan lokal. (Sinkronisasi cloud tertunda)", "warning");
            }
        } else {
            showToast("Tugas follow-up berhasil dijadwalkan!");
        }

        setSelectedLeadId('');
        setNewFollowClient('');
        setNewFollowPhone('');
        setNewFollowType('');
        setNewFollowDue('');
        setIsAddingTask(false);
    };

    const handleToggleTaskStatus = async (task) => {
        const newStatus = task.status === 'Selesai' ? 'Pending' : 'Selesai';
        const updatedTask = {
            ...task,
            status: newStatus,
            updatedAt: getAsiaJakartaIso()
        };

        setTogglingTaskIds(prev => new Set(prev).add(task.id));
        setFollowUpTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));

        if (window.firebaseServices?.db && userId) {
            try {
                const { db, appId, doc, updateDoc } = window.firebaseServices;
                await updateDoc(doc(db, 'artifacts', appId, 'users', userId, 'followUpTasks', task.id), {
                    status: newStatus,
                    updatedAt: updatedTask.updatedAt
                });
                showToast(`Tugas ditandai sebagai ${newStatus}!`);
            } catch (e) {
                console.warn("[FollowUp] Status toggle cloud failed:", e);
                showToast(`Status diubah lokal ke ${newStatus}. (Cloud sync tertunda)`, "warning");
            }
        } else {
            showToast(`Status diubah ke ${newStatus}!`);
        }

        setTogglingTaskIds(prev => {
            const next = new Set(prev);
            next.delete(task.id);
            return next;
        });
    };

    const handleUpdateTask = async (updatedTask) => {
        setFollowUpTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

        if (window.firebaseServices?.db && userId) {
            try {
                const { db, appId, doc, setDoc } = window.firebaseServices;
                await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'followUpTasks', updatedTask.id), updatedTask);
                showToast("Tugas follow-up berhasil diperbarui di cloud!");
            } catch (e) {
                console.warn("[FollowUp] Update cloud failed:", e);
                showToast("Diperbarui lokal. (Cloud sync tertunda)", "warning");
            }
        } else {
            showToast("Tugas follow-up diperbarui.");
        }
        setEditingTask(null);
    };

    const confirmDeleteTask = async () => {
        if (!deleteTaskId) return;
        const taskId = deleteTaskId;
        setIsDeletingTask(true);

        addTombstone('tasks', taskId, userId);
        setFollowUpTasks(prev => prev.filter(t => t.id !== String(taskId)));

        if (window.firebaseServices?.db && userId) {
            try {
                const { db, appId, doc, deleteDoc } = window.firebaseServices;
                await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'followUpTasks', String(taskId)));
                showToast("Tugas dihapus dari lokal & cloud.");
            } catch (e) {
                console.warn("[FollowUp] Delete cloud failed:", e);
                showToast("Dihapus lokal. (Cloud delete tertunda)", "warning");
            }
        } else {
            showToast("Tugas follow-up dihapus.");
        }

        setIsDeletingTask(false);
        setDeleteTaskId(null);
    };

    const filteredTasks = useMemo(() => {
        return followUpTasks.filter(task => {
            const searchLower = followUpSearch.toLowerCase();
            const matchesSearch = 
                (task.client || '').toLowerCase().includes(searchLower) ||
                (task.type || '').toLowerCase().includes(searchLower) ||
                (task.phoneRaw || '').toLowerCase().includes(searchLower) ||
                (task.phoneNormalized || '').toLowerCase().includes(searchLower);

            let matchesFilter = true;
            if (taskFilter === 'Pending') matchesFilter = task.status === 'Pending';
            else if (taskFilter === 'Selesai') matchesFilter = task.status === 'Selesai';
            else if (taskFilter === 'Terlambat') {
                matchesFilter = task.status !== 'Selesai' && task.dueDate && task.dueDate < todayStr;
            } else if (taskFilter === 'Butuh Reschedule') {
                matchesFilter = task.needsReschedule || (!task.dueDate && task.status !== 'Selesai');
            }

            return matchesSearch && matchesFilter;
        });
    }, [followUpTasks, followUpSearch, taskFilter, todayStr]);

    return (
        <div className="space-y-6 pb-12 animate-fade-in">
            {/* Form Tambah Tugas Follow-Up */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl border border-[#26262d]">
                <h3 className="serif-font font-bold text-lg text-white mb-4 flex items-center gap-2">
                    <Icons.Plus /> Jadwalkan Tugas Follow-Up Baru
                </h3>

                {followUpError && (
                    <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-xs font-semibold" role="alert">
                        ⚠️ {followUpError}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
                    <select
                        value={selectedLeadId}
                        onChange={handleLeadSelect}
                        className="bg-[#15151a] border border-[#26262d] rounded-xl px-3 py-2.5 text-xs text-zinc-300 sm:col-span-1 md:col-span-1 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                    >
                        <option value="">-- Pilih dari CRM --</option>
                        {crmLeads.map(l => (
                            <option key={l.id} value={l.id}>{l.name} {l.project ? `(${l.project})` : ''}</option>
                        ))}
                    </select>

                    <input 
                        type="text" 
                        placeholder="Nama Klien..." 
                        value={newFollowClient}
                        onChange={(e) => setNewFollowClient(e.target.value)}
                        className="bg-[#15151a] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white shadow-inner placeholder:text-zinc-600 sm:col-span-1 md:col-span-1 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                    />

                    <input 
                        type="text" 
                        placeholder="No WA (08... / +62...)" 
                        value={newFollowPhone}
                        onChange={(e) => setNewFollowPhone(e.target.value)}
                        className="bg-[#15151a] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white shadow-inner placeholder:text-zinc-600 sm:col-span-1 md:col-span-1 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                    />

                    <input 
                        type="text" 
                        placeholder="Jenis Tugas (mis. Survey H+1)" 
                        value={newFollowType}
                        onChange={(e) => setNewFollowType(e.target.value)}
                        className="bg-[#15151a] border border-[#26262d] rounded-xl px-4 py-2.5 text-sm text-white shadow-inner placeholder:text-zinc-600 sm:col-span-1 md:col-span-1 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                    />

                    <div className="sm:col-span-1 md:col-span-1 space-y-1">
                        <div className="flex items-center gap-1">
                            <input 
                                type="date"
                                value={newFollowDue}
                                onChange={(e) => setNewFollowDue(e.target.value)}
                                className="bg-[#15151a] border border-[#26262d] rounded-xl px-2.5 py-2 text-xs text-zinc-200 shadow-inner w-full focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30"
                            />
                            {newFollowDue && (
                                <button 
                                    type="button" 
                                    onClick={() => setNewFollowDue('')}
                                    className="px-1.5 py-1 text-zinc-500 hover:text-zinc-300 text-xs"
                                    title="Kosongkan tanggal"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
                            <button 
                                type="button" 
                                onClick={() => setNewFollowDue(todayStr)}
                                className="px-1.5 py-0.5 bg-[#202028] hover:bg-[#282832] text-[#c5a059] rounded border border-[#2e2e38] whitespace-nowrap font-medium"
                                title="Set Hari Ini"
                            >
                                Hari Ini
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setNewFollowDue(addDaysToDate(todayStr, 1))}
                                className="px-1.5 py-0.5 bg-[#202028] hover:bg-[#282832] text-zinc-300 rounded border border-[#2e2e38] whitespace-nowrap font-medium"
                                title="Set Besok"
                            >
                                +Besok
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setNewFollowDue(addDaysToDate(todayStr, 3))}
                                className="px-1.5 py-0.5 bg-[#202028] hover:bg-[#282832] text-zinc-300 rounded border border-[#2e2e38] whitespace-nowrap font-medium"
                                title="Set +3 Hari"
                            >
                                +3 H
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setNewFollowDue(addDaysToDate(todayStr, 7))}
                                className="px-1.5 py-0.5 bg-[#202028] hover:bg-[#282832] text-zinc-300 rounded border border-[#2e2e38] whitespace-nowrap font-medium"
                                title="Set +1 Minggu"
                            >
                                +1 M
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={handleAddTask}
                        disabled={isAddingTask}
                        className="gold-btn px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#c5a059]/25 sm:col-span-1 md:col-span-1"
                    >
                        {isAddingTask ? 'Menyimpan...' : <React.Fragment><Icons.Plus /> Simpan</React.Fragment>}
                    </button>
                </div>
            </div>

            {/* Filter & Pencarian Tugas */}
            <div className="bg-[#15151a] rounded-3xl p-4 md:p-6 shadow-2xl border border-[#26262d] flex items-center justify-between gap-4 flex-wrap">
                <div className="relative flex-1 max-w-md">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Icons.Search />
                    </span>
                    <input 
                        type="text"
                        placeholder="Cari nama klien atau jenis tugas..."
                        value={followUpSearch}
                        onChange={(e) => setFollowUpSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#1b1b22] border border-[#26262d] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059]/30 font-medium text-white placeholder:text-zinc-600"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                    {['Semua', 'Pending', 'Selesai', 'Terlambat', 'Butuh Reschedule'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setTaskFilter(f)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                taskFilter === f 
                                    ? 'bg-[#c5a059] text-[#0d0d0d] shadow-md shadow-[#c5a059]/20' 
                                    : 'bg-[#202028] text-zinc-400 hover:text-white border border-[#2e2e38]'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Kartu Tugas Follow-Up */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-zinc-500 bg-[#15151a] rounded-3xl border border-[#26262d] p-8">
                        <div className="w-16 h-16 bg-[#202028] rounded-2xl flex items-center justify-center text-zinc-400 mx-auto mb-4">
                            <Icons.CheckCircle />
                        </div>
                        <h4 className="serif-font font-bold text-white text-base">Tidak Ada Tugas Follow-Up</h4>
                        <p className="text-sm mt-1 max-w-sm mx-auto text-zinc-400">
                            Semua tugas follow-up telah selesai atau tidak cocok dengan filter pencarian yang Anda pilih.
                        </p>
                    </div>
                ) : (
                    filteredTasks.map((task) => {
                        const displayPhone = formatDisplayPhone(task.phoneRaw, task.phoneNormalized);
                        const hasValidWa = !!task.phoneNormalized;
                        const isOverdue = task.status !== 'Selesai' && task.dueDate && task.dueDate < todayStr;
                        const isToggling = togglingTaskIds.has(task.id);

                        return (
                            <div 
                                key={task.id} 
                                className={`bg-[#15151a] rounded-3xl p-6 border shadow-2xl flex flex-col justify-between transition-all ${
                                    isOverdue ? 'border-rose-900/60 bg-rose-950/10' : 'border-[#26262d]'
                                }`}
                            >
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        {task.needsReschedule || !task.dueDate ? (
                                            <span className="text-xs font-bold px-3 py-1 bg-purple-950 text-purple-300 rounded-xl border border-purple-800">
                                                ⚠️ Perlu dijadwalkan ulang
                                            </span>
                                        ) : (
                                            <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                                                isOverdue ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-[#202028] text-[#c5a059] border-[#2e2e38]'
                                            }`}>
                                                📅 {task.dueDate} {isOverdue && '(TERLAMBAT)'}
                                            </span>
                                        )}
                                        <StatusBadge status={task.status} />
                                    </div>
                                    
                                    <h3 className="serif-font font-extrabold text-white text-lg flex items-center justify-between">
                                        {task.client}
                                        <div className="flex items-center gap-1">
                                            {task.leadId && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#202028] text-zinc-400 border border-[#2e2e38]">
                                                    CRM Linked
                                                </span>
                                            )}
                                            {task.isDetachedFromDeletedLead && (
                                                <span 
                                                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700" 
                                                    title="Data klien telah dihapus dari CRM, tugas tetap disimpan secara mandiri"
                                                >
                                                    Standalone
                                                </span>
                                            )}
                                        </div>
                                    </h3>
                                    <p className="text-xs text-zinc-400 mt-0.5">WA: {displayPhone}</p>
                                    <p className="text-sm text-zinc-300 mt-2.5 font-semibold bg-[#1b1b22] p-3 rounded-xl border border-[#26262d]">{task.type}</p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-[#26262d] flex justify-between items-center gap-2">
                                    <button 
                                        onClick={() => handleToggleTaskStatus(task)}
                                        disabled={isToggling}
                                        className="text-xs font-bold text-[#c5a059] hover:underline bg-[#202028] px-3 py-1.5 rounded-xl border border-[#2e2e38] transition-colors disabled:opacity-50"
                                    >
                                        {isToggling ? 'Menyimpan...' : task.status === 'Selesai' ? 'Tandai Pending' : 'Tandai Selesai'}
                                    </button>

                                    <div className="flex items-center gap-1.5">
                                        {hasValidWa ? (
                                            <a 
                                                href={buildWaLink(task.phoneNormalized, task.client)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs font-bold text-emerald-300 bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-800 hover:bg-emerald-900 transition-colors flex items-center gap-1"
                                            >
                                                WA
                                            </a>
                                        ) : (
                                            <button 
                                                disabled
                                                className="text-xs font-bold text-zinc-600 bg-[#1b1b22] px-3 py-1.5 rounded-xl border border-[#26262d] cursor-not-allowed opacity-50"
                                                title="Nomor WhatsApp belum diisi atau tidak valid"
                                            >
                                                WA
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => setEditingTask(task)}
                                            className="text-zinc-400 hover:text-white text-xs font-semibold p-1.5 rounded-lg hover:bg-[#202028]"
                                            aria-label={`Edit tugas ${task.client}`}
                                        >
                                            <Icons.Edit />
                                        </button>
                                        <button 
                                            onClick={() => setDeleteTaskId(task.id)}
                                            className="text-zinc-500 hover:text-rose-400 text-xs font-semibold p-1.5 rounded-lg hover:bg-rose-950/40"
                                            aria-label={`Hapus tugas ${task.client}`}
                                        >
                                            <Icons.Trash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <EditTaskModal 
                isOpen={!!editingTask}
                task={editingTask}
                crmLeads={crmLeads}
                onSave={handleUpdateTask}
                onCancel={() => setEditingTask(null)}
            />

            <ConfirmModal 
                isOpen={!!deleteTaskId}
                title="Hapus Tugas Follow-Up"
                message="Apakah Anda yakin ingin menghapus tugas ini secara permanen?"
                onConfirm={confirmDeleteTask}
                onCancel={() => setDeleteTaskId(null)}
                isLoading={isDeletingTask}
            />
        </div>
    );
};
