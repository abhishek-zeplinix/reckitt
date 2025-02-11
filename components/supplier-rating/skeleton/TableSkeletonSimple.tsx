import React from 'react';
import { Skeleton } from 'primereact/skeleton';

const TableSkeletonSimple = ({col}: any) => {
  return (
    <div className="w-full p-4 m-5 align-self-center">
      <div className="border rounded-lg p-4">

        <div className="flex w-full mb-4 gap-5">
          {[...Array(col)].map((_, index) => (
            <Skeleton key={index} width="20%" height="30px" className="mx-2" />
          ))}
        </div>

        {[...Array(10)].map((_, rowIndex) => (
          <div key={rowIndex} className="flex w-full mb-2 gap-5">
            {[...Array(col)].map((_, colIndex) => (
              <Skeleton key={colIndex} width="20%" height="20px" className="mx-2 " />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeletonSimple;
