import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

interface CustomDialogBoxProps {
    visible: boolean;
    onHide: () => void;
    onConfirm: () => void;
    onCancel: () => void;
    header: string;
    message: string;
    subMessage?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    icon?: string;
    iconColor?: string;
    loading?: boolean;
}

const CustomDialogBox = ({
    visible,
    onHide,
    onConfirm,
    onCancel,
    header,
    message,
    subMessage,
    loading,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    icon = "pi pi-info-circle",
    iconColor = "#DF1740"
}: CustomDialogBoxProps) => {
    return (
        <Dialog
            header={header}
            visible={visible}
            style={{ width: '35vw' }}
            className="custom-dialog"
            footer={
                <div className="flex justify-content-center p-2">
                    <Button
                        label={cancelLabel}
                        style={{ color: iconColor }}
                        className="px-7"
                        text
                        onClick={onCancel}
                    />
                    <Button
                        label={confirmLabel}
                        style={{ backgroundColor: iconColor, border: 'none' }}
                        className="px-7 hover:text-white"
                        onClick={onConfirm}
                        loading={loading}
                    />
                </div>
            }
            onHide={onHide}
        >
            <div className="flex flex-column w-full surface-border p-3 text-center gap-4">
                <i className={icon + " text-6xl"} style={{ marginRight: 10, color: iconColor }}></i>
                <div className="flex flex-column align-items-center gap-1">
                    <span>{message}</span>
                    {subMessage && <span>{subMessage}</span>}
                </div>
            </div>
        </Dialog>
    );
};

export default CustomDialogBox;