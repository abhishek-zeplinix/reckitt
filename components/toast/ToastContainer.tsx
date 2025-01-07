import CustomToast from "./Toast";

const ToastContainer = ({ toasts, removeToast }: {toasts: any, removeToast: any}) => {

    console.log(toasts);
    
    return (

      <div className="relative" style={{ maxWidth: '25rem', zIndex: 998, margin:'0 auto', clear: 'left'}}>

        <div className="flex flex-column gap-2">

          {toasts.map((toast: any) => (
            <div
              key={toast.id}
              className="fade-in animation-duration-300"
            >
              <CustomToast
                type={toast.type}
                message={toast.message}
                onClose={() => removeToast(toast.id)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

export default ToastContainer;