import Modal from '@/components/Modal';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title = "Confirmar ação",
  description = "Tem certeza que deseja continuar?",
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {description}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-outline flex-1"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="btn-destructive flex-1"
          >
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
}