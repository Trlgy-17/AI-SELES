// File: src/components/layout/AppShell.jsx
import React, { useRef } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';
import { InAppReminderBanner } from '../common/InAppReminderBanner.jsx';

export const AppShell = ({ 
    isSidebarOpen, 
    setIsSidebarOpen, 
    activeTab, 
    setActiveTab, 
    syncStatus, 
    onOpenCloudModal, 
    overdueCount, 
    todayCount, 
    rescheduleCount, 
    children 
}) => {
    const toggleButtonRef = useRef(null);

    return (
        <div className="flex min-h-[100dvh] bg-[#0d0d0d] overflow-x-hidden text-zinc-100">
            <Sidebar 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen}
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                syncStatus={syncStatus}
                onOpenCloudModal={onOpenCloudModal}
                toggleButtonRef={toggleButtonRef}
            />
            
            <main className="lg:ml-72 flex-1 p-4 sm:p-6 lg:p-10 w-full min-h-[100dvh] overflow-y-auto overflow-x-hidden">
                <Header 
                    setIsSidebarOpen={setIsSidebarOpen} 
                    activeTab={activeTab} 
                    toggleButtonRef={toggleButtonRef}
                />

                <InAppReminderBanner 
                    overdueCount={overdueCount}
                    todayCount={todayCount}
                    rescheduleCount={rescheduleCount}
                    onNavigateFollowUp={() => setActiveTab('followup')}
                />

                {children}
            </main>
        </div>
    );
};
