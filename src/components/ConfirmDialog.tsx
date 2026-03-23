import { useT } from '../lib/i18n'

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  const { t } = useT()

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box confirm-box" onClick={e => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onCancel}>{t('btn_cancel_action')}</button>
          <button className="btn btn-danger" onClick={onConfirm}>{t('btn_confirm_delete')}</button>
        </div>
      </div>
    </div>
  )
}
