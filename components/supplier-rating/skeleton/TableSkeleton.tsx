import React from 'react';
import { Skeleton } from 'primereact/skeleton';

const TableSkeleton = () => {
  return (
    <div className="w-full h-screen p-4">
      <div className="mb-2">
        <Skeleton width="100px" height="30px" className="mb-2" />
      </div>
      <div className="border rounded-lg p-4 h-full">
        <Skeleton width="100%" height="100%" />
      </div>
    </div>
  );
};

export default TableSkeleton;