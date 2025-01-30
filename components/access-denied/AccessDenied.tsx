import React from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
// import { useRouter } from 'next/router';

const AccessDenied = () => {
//   const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-content-center py-12 px-4">
      <div className="max-w-md mx-auto w-full">
        <Card className="shadow-lg">
          <div className="text-center mb-5">
            <i className="pi pi-ban text-6xl text-red-500 mb-4"></i>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don&apos;t have permission to access this resource.
            </p>
            <p className="text-sm text-gray-500">
              Please contact your administrator if you believe this is a mistake.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button 
              icon="pi pi-arrow-left"
              label="Go Back"
              severity="info"
            //   onClick={() => router.back()}
              className="w-full max-w-xs bg-primary-main border-none"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AccessDenied;