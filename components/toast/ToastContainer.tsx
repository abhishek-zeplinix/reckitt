import CustomToast from './Toast';

const ToastContainer = ({ toasts, removeToast }: { toasts: any; removeToast: any }) => {
    console.log(toasts);

    return (
        <div className="fixed top-0 left-0 right-0" style={{ maxWidth: '25rem', zIndex: 99999, margin: '0 auto' }}>
            <div className="flex flex-column gap-2">
                {toasts.map((toast: any) => (
                    <div key={toast.id} className="fade-in animation-duration-300">
                        <CustomToast type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ToastContainer;
