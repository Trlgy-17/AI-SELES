// File: src/components/ui/Modal.jsx
import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../js/utils/cn.js';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-3xl' };

/**
 * variant: 'center' (dialog), 'sheet' (right side panel on desktop), 'bottom' (bottom sheet on mobile, center on desktop)
 */
export const Modal = ({
    isOpen,
    onClose,
    title,
    description,
    icon: Icon,
    size = 'md',
    variant = 'center',
    footer,
    children,
    closeOnBackdrop = true,
    closeDisabled = false,
    className,
    bodyClassName
}) => {
    const panelRef = useRef(null);
    const restoreRef = useRef(null);
    const titleId = useId();
    const descId = useId();
    const closeRef = useRef(onClose);
    const closeDisabledRef = useRef(closeDisabled);
    closeRef.current = onClose;
    closeDisabledRef.current = closeDisabled;

    useEffect(() => {
        if (!isOpen) return undefined;
        restoreRef.current = document.activeElement;
        const panel = panelRef.current;
        const first = panel?.querySelector('[data-autofocus]') || panel?.querySelector(FOCUSABLE);
        requestAnimationFrame(() => (first || panel)?.focus());

        const onKey = (e) => {
            if (e.key === 'Escape' && !closeDisabledRef.current) {
                e.stopPropagation();
                closeRef.current?.();
                return;
            }
            if (e.key === 'Tab' && panel) {
                const nodes = [...panel.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
                if (!nodes.length) return;
                const firstEl = nodes[0];
                const lastEl = nodes[nodes.length - 1];
                if (e.shiftKey && document.activeElement === firstEl) {
                    e.preventDefault();
                    lastEl.focus();
                } else if (!e.shiftKey && document.activeElement === lastEl) {
                    e.preventDefault();
                    firstEl.focus();
                }
            }
        };
        document.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
            restoreRef.current?.focus?.();
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const layout = {
        center: 'items-end sm:items-center justify-center p-0 sm:p-4',
        bottom: 'items-end sm:items-center justify-center p-0 sm:p-4',
        sheet: 'items-end sm:items-stretch justify-end p-0'
    }[variant];

    const panelShape = {
        center: cn('w-full rounded-t-xl sm:rounded-xl max-h-[90dvh]', SIZES[size]),
        bottom: cn('w-full rounded-t-xl sm:rounded-xl max-h-[90dvh]', SIZES[size]),
        sheet: cn('w-full rounded-t-xl sm:rounded-none sm:h-full max-h-[90dvh] sm:max-h-none sm:border-l', SIZES[size])
    }[variant];

    return createPortal(
        <div className={cn('fixed inset-0 z-50 flex', layout)} role="presentation">
            <div
                className="absolute inset-0 bg-overlay backdrop-blur-[2px] animate-fade-in"
                onClick={() => closeOnBackdrop && !closeDisabled && onClose?.()}
                aria-hidden="true"
            />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                aria-describedby={description ? descId : undefined}
                tabIndex={-1}
                className={cn(
                    'relative flex flex-col overflow-hidden border border-border bg-surface shadow-floating animate-sheet-up focus:outline-none',
                    panelShape,
                    className
                )}
            >
                {(title || onClose) && (
                    <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
                        <div className="flex min-w-0 items-start gap-3">
                            {Icon && (
                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-surface-3 text-fg-2">
                                    <Icon size={16} aria-hidden="true" />
                                </span>
                            )}
                            <div className="min-w-0">
                                {title && <h2 id={titleId} className="text-h3 font-semibold text-fg">{title}</h2>}
                                {description && <p id={descId} className="mt-0.5 text-body-sm text-fg-3">{description}</p>}
                            </div>
                        </div>
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={closeDisabled}
                                aria-label="Tutup"
                                title="Tutup"
                                className="-mr-1.5 flex h-11 w-11 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-sm text-fg-3 hover:bg-surface-hover hover:text-fg disabled:opacity-40"
                            >
                                <X size={16} aria-hidden="true" />
                            </button>
                        )}
                    </div>
                )}
                <div className={cn('flex-1 overflow-y-auto px-5 py-4', bodyClassName)}>{children}</div>
                {footer && (
                    <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface-2/60 px-5 py-3 sm:flex-row sm:justify-end safe-padding-bottom sm:pb-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
