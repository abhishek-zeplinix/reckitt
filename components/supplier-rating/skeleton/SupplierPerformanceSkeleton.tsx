import React from 'react';
import { Skeleton } from 'primereact/skeleton';

const SupplierPerformanceSkeleton = () => {
    return (
        <div className="pt-4 px-4 border-round-xl shadow-2 surface-card mb-4 relative">
            <Skeleton width="60%" height="24px" className="mb-2" />
            <Skeleton width="80%" height="16px" className="mb-3" />

            <div style={{ height: '350px' }}>
                <Skeleton width="100%" height="360px" />
            </div>

            <div className="mt-3 score-bg p-4">
                <div className="flex gap-2 px-2">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="flex align-items-center mr-4 border-right-1 pr-3 p-2 w-full mb-2 border-gray-400">
                            <Skeleton width="2rem" height="2rem" className="border-round-md mr-2" />
                            <Skeleton width="50px" height="16px" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SupplierPerformanceSkeleton;
