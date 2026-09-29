import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
}) => {
  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? 'destructive' : isWarning ? 'emergency' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        {isDanger || isWarning ? (
          <div className="p-2 bg-amber-50 rounded-full text-amber-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        ) : (
          <div className="p-2 bg-slate-100 rounded-full text-gov-green-800 shrink-0">
            <Info className="w-5 h-5" />
          </div>
        )}
        <p className="text-xs text-gov-text-secondary leading-relaxed pt-1">
          {message}
        </p>
      </div>
    </Modal>
  );
};
