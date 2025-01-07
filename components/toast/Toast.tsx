import React, { useEffect } from 'react';

const CustomToast = ({ type, message, onClose }: { type: string; message: string; onClose?: () => void }) => {

  console.log('custome', type);
  
  const gradientStyles: any = {
    success: 'linear-gradient(to right,rgb(195, 242, 228),rgb(236, 245, 234))',
    info: 'linear-gradient(to right,rgb(194, 206, 250),rgb(235, 237, 247))',   
    error: 'linear-gradient(to right,rgb(249, 192, 192), rgb(249, 230, 230))'
  };

  // const toastStyles: any = {
  //   success: 'bg-green-100 border-left-3 border-green-500 text-green-700',
  //   info: 'bg-blue-100 border-left-3 border-blue-500 text-blue-700',
  //   error: 'bg-red-100 border-left-3 border-red-500 text-red-700'
  // };


  const icons: any = {
    success: <i className="pi pi-check-circle" style={{ color: 'green', fontSize: '1.5rem' }} ></i>,
    info: <i className="pi pi-info-circle" style={{ color: 'blue', fontSize: '1.5rem' }} ></i>,
    error:<i className="pi pi-times-circle" style={{ color: 'red', fontSize: '1.5rem' }} ></i>
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, 3000);

    return () => clearTimeout(timer); 
  }, [onClose]);

  return (

    <div
      // className={`${toastStyles[type] || toastStyles.info} shadow-2 border-round transition-all transition-duration-300`}
      className={'shadow-2 border-round transition-all transition-duration-300'}
      style={{
        minWidth: '20rem',
        maxWidth: '25rem',
        background: gradientStyles[type] || gradientStyles.info,
        padding: '1px',
      }}
      role="alert"
    >
      <div
        className="flex align-items-center justify-content-between p-3 border-round-md"
        style={{
          
          background: gradientStyles[type] || gradientStyles.info, 
          borderRadius: 'inherit',
        }}
      >
        <div className="flex align-items-center gap-3">

          <span className="flex align-items-center justify-content-center text-xl font-bold mr-2 border-round">
            {icons[type]}
          </span>


          <div>
            <p className="font-medium text-color font-bold capitalize m-0">{type}</p>
            <p className="text-sm text-gray-500 m-0">{message}</p>
          </div>
        </div>
        
        {/* <button
          onClick={onClose}
          className="p-1 mt-0 border-round cursor-pointer hover:surface-200 transition-colors transition-duration-150"
          style={{ border: 'none', background: 'transparent' }}
        >
          <i className="pi pi-times text-pink-500" style={{ color: 'gray', fontSize: '1rem'}}></i>
        </button> */}
      </div>
    </div>
  );
};

export default CustomToast;