// File: src/components/layout/AppShell.jsx
import React, { useRef, useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Header } from './Header.jsx';
import { BottomNav } from './BottomNav.jsx';
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
    activeBrand,
    currentUser,
    brands = [],
    onSwitchBrand,
    onOpenAuthModal,
    onOpenCommandPalette,
    children
}) => {
    const toggleButtonRef = useRef(null);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        try {
            return localStorage.getItem('nacira_sidebar_collapsed') === '1';
        } catch {
            return false;
        }
    });

    const toggleCollapsed = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem('nacira_sidebar_collapsed', next ? '1' : '0');
            } catch {
                // Preference simply won't persist when storage is unavailable.
            }
            return next;
        });
    };

    return (
        <div className="flex min-h-[100dvh] overflow-x-hidden bg-bg text-fg">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-sm focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-fg"
            >
                Lewati ke konten
            </a>

            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isCollapsed={isCollapsed}
                setIsSidebarOpen={setIsSidebarOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                syncStatus={syncStatus}
                onOpenCloudModal={onOpenCloudModal}
                onOpenAuthModal={onOpenAuthModal}
                toggleButtonRef={toggleButtonRef}
                activeBrand={activeBrand}
                currentUser={currentUser}
            />

            <div className={`flex w-full min-w-0 flex-1 flex-col transition-[margin] duration-200 md:ml-[72px] ${isCollapsed ? '' : 'lg:ml-64'}`}>
                <Header
                    setIsSidebarOpen={setIsSidebarOpen}
                    isCollapsed={isCollapsed}
                    onToggleCollapsed={toggleCollapsed}
                    activeTab={activeTab}
                    toggleButtonRef={toggleButtonRef}
                    activeBrand={activeBrand}
                    currentUser={currentUser}
                    brands={brands}
                    onSwitchBrand={onSwitchBrand}
                    onOpenAuthModal={onOpenAuthModal}
                    onOpenCloudModal={onOpenCloudModal}
                    onOpenCommandPalette={onOpenCommandPalette}
                />

                <main id="main-content" tabIndex={-1} className="w-full min-w-0 flex-1 focus:outline-none">
                    <div className="mx-auto w-full min-w-0 max-w-[1600px] p-3.5 sm:p-6 lg:p-10 lg:px-8 lg:py-7">
                        <InAppReminderBanner
                            overdueCount={overdueCount}
                            todayCount={todayCount}
                            rescheduleCount={rescheduleCount}
                            onNavigateFollowUp={() => setActiveTab('crm')}
                        />
                        {children}
                    </div>
                    {/* Spacer so content clears the mobile bottom navigation */}
                    <div className="h-16 md:hidden safe-padding-bottom" aria-hidden="true" />
                </main>
            </div>

            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} onOpenMore={() => setIsSidebarOpen(true)} />
        </div>
    );
};
