import { type FC } from 'react';
import DialogPrimary from './DialogPrimary';
import ButtonBase from './BaseButton';
import { usePopupStore } from '../../store/popup';

const ConfirmationPopup: FC = () => {
  const {
    open,
    closePopup,
    title,
    message,
    cancelButtonText,
    confirmButtonText,
    onConfirm,
  } = usePopupStore();

  const confirmationHandler = () => {
    if (onConfirm) {
      onConfirm();
    }
    closePopup();
  };

  if (!open) {
    return null;
  }

  return (
    <DialogPrimary isOpen onClose={closePopup} title={title}>
      <p className="text-grey-100 text-base font-semibold">{message}</p>

      <div className="flex justify-end gap-2 mt-2">
        <ButtonBase
          label={cancelButtonText}
          onclick={closePopup}
          size="md"
          variant="secondary"
        />
        <ButtonBase
          label={confirmButtonText}
          size="md"
          onclick={confirmationHandler || closePopup}
        />
      </div>
    </DialogPrimary>
  );
};

export default ConfirmationPopup;
