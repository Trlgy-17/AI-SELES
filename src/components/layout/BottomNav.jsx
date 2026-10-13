// File: src/components/layout/BottomNav.jsx
import React from 'react';
import { Ellipsis } from 'lucide-react';
import { PAGE_META } from './navigation.js';
import { cn } from '../../js/utils/cn.js';

const TABS = ['workspace', 'crm', 'estimator', 'knowledge'];

export const BottomNav = ({ activeTab, setActiveTab, onOpenMore }) => (
    <nav
        aria-label="Navigasi bawah"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-sidebar/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
        <ul className="grid h-16 grid-cols-5">
            {TABS.map((id) => {
                const { short, icon: Icon } = PAGE_META[id];
                const isActive = activeTab === id;
                return (
                    <li key={id}>
                        <button
                            onClick={() => setActiveTab(id)}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'flex h-full w-full flex-col items-center justify-center gap-1 text-caption font-medium transition-colors',
                                isActive ? 'text-primary-text' : 'text-fg-muted hover:text-fg-2'
                            )}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.1 : 1.8} aria-hidden="true" />
                            {short}
                        </button>
                    </li>
                );
            })}
            <li>
                <button
                    onClick={onOpenMore}
                    className="flex h-full w-full flex-col items-center justify-center gap-1 text-caption font-medium text-fg-muted hover:text-fg-2"
                >
                    <Ellipsis size={20} aria-hidden="true" />
                    Lainnya
                </button>
            </li>
        </ul>
    </nav>
);
