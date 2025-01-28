import React from 'react';
import 'primereact/resources/primereact.min.css'; // PrimeReact styles
import 'primeicons/primeicons.css'; // PrimeIcons styles

const Loader = () => {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'white', // Slightly transparent white
                zIndex: 9999, // Highest z-index
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div
                style={{
                    width: '64px',
                    height: '64px',
                    border: '4px solid #DF1740', // Pink color border
                    borderTop: '4px solid transparent', // Transparent top for spin effect
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite' // Spinning effect
                }}
            ></div>
            <style>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </div>
    );
};

export default Loader;
