// File: src/components/common/ConfirmModal.jsx
import React from 'react';
import { TriangleAlert } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';

export const ConfirmModal = ({
    isOpen,
    title = 'Konfirmasi tindakan',
    message,
    confirmText = 'Hapus',
    cancelText = 'Batal',
    onConfirm,
    onCancel,
    isLoading = false
}) => (
    <Modal
        isOpen={isOpen}
        onClose={onCancel}
        closeDisabled={isLoading}
        title={title}
        icon={TriangleAlert}
        size="sm"
        className="max-h-[90dvh]"
        bodyClassName="overflow-y-auto"
        footer={
            <>
                <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
                    {cancelText}
                </Button>
                <Button variant="danger-solid" onClick={onConfirm} loading={isLoading} data-autofocus>
                    {isLoading ? 'Memproses…' : confirmText}
                </Button>
            </>
        }
    >
        <p className="text-body text-fg-2 leading-relaxed">{message}</p>
    </Modal>
);
