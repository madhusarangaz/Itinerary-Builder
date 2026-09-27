import { BaseButton } from './BaseButton'
import { Modal } from './Modal'

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Modal
      open={open}
      title={title}
      size="sm"
      onClose={onClose}
      footer={
        <>
          <BaseButton variant="secondary" onClick={onClose}>
            Cancel
          </BaseButton>
          <BaseButton variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </BaseButton>
        </>
      }
    >
      <p className="text-sm text-gray-600 dark:text-zinc-300">{message}</p>
    </Modal>
  )
}
