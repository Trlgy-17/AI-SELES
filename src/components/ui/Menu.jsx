// File: src/components/ui/Menu.jsx
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../js/utils/cn.js';

/**
 * Lightweight accessible dropdown menu.
 * trigger: ({ open, toggle, ref, props }) => ReactNode
 * items: [{ id, label, icon, onSelect, danger, disabled, description, checked }] | { type: 'separator' } | { type: 'label', label }
 */
export const Menu = ({ trigger, items, align = 'end', className, width = 'w-56' }) => {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const wrapRef = useRef(null);
    const triggerRef = useRef(null);
    const actionable = items.map((it, i) => (!it.type && !it.disabled ? i : null)).filter((i) => i !== null);

    useEffect(() => {
        if (!open) return undefined;
        const onDoc = (e) => {
            if (!wrapRef.current?.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setOpen(false);
                triggerRef.current?.focus();
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((cur) => {
                    const pos = actionable.indexOf(cur);
                    const next = e.key === 'ArrowDown' ? (pos + 1) % actionable.length : (pos - 1 + actionable.length) % actionable.length;
                    return actionable[next];
                });
            } else if (e.key === 'Tab') {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onDoc);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDoc);
            document.removeEventListener('keydown', onKey);
        };
    }, [open, actionable]);

    useEffect(() => {
        if (open && active >= 0) wrapRef.current?.querySelector(`[data-menu-index="${active}"]`)?.focus();
    }, [open, active]);

    const toggle = () => {
        setOpen((o) => !o);
        setActive(actionable[0] ?? -1);
    };

    return (
        <div ref={wrapRef} className={cn('relative', className)}>
            {trigger({
                open,
                toggle,
                ref: triggerRef,
                props: { 'aria-haspopup': 'menu', 'aria-expanded': open, onClick: toggle, ref: triggerRef }
            })}
            {open && (
                <div
                    role="menu"
                    className={cn(
                        'absolute z-40 mt-1.5 max-h-[70dvh] overflow-y-auto rounded-md border border-border bg-surface-2 p-1 shadow-floating animate-fade-in',
                        align === 'end' ? 'right-0' : 'left-0',
                        width
                    )}
                >
                    {items.map((it, i) => {
                        if (it.type === 'separator') return <div key={`sep-${i}`} className="my-1 h-px bg-border" role="separator" />;
                        if (it.type === 'label')
                            return (
                                <div key={`lbl-${i}`} className="px-2.5 pb-1 pt-2 text-caption font-medium uppercase tracking-wide text-fg-muted">
                                    {it.label}
                                </div>
                            );
                        const Icon = it.icon;
                        return (
                            <button
                                key={it.id || i}
                                type="button"
                                role={it.checked !== undefined ? 'menuitemradio' : 'menuitem'}
                                aria-checked={it.checked}
                                data-menu-index={i}
                                disabled={it.disabled}
                                tabIndex={-1}
                                onClick={() => {
                                    setOpen(false);
                                    it.onSelect?.();
                                }}
                                className={cn(
                                    'flex w-full min-h-[40px] sm:min-h-[34px] items-center gap-2.5 rounded-xs px-2.5 py-1.5 text-left text-body-sm transition-colors',
                                    'focus:outline-none focus:bg-surface-hover disabled:opacity-40',
                                    it.danger ? 'text-red-400 hover:bg-danger/10 focus:bg-danger/10' : 'text-fg-2 hover:bg-surface-hover hover:text-fg'
                                )}
                            >
                                {Icon && <Icon size={15} className="shrink-0" aria-hidden="true" />}
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate">{it.label}</span>
                                    {it.description && <span className="block truncate text-caption text-fg-muted">{it.description}</span>}
                                </span>
                                {it.trailing}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
