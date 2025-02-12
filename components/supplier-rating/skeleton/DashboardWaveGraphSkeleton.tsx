import React from 'react';
import { Skeleton } from 'primereact/skeleton';

const HistoricalPerformanceSkeleton = () => {
    return (
        <div className="p-flex px-4 py-4 p-flex-column p-ai-center p-p-4 border-round-xl shadow-2 surface-card">
            {/* Title and Dropdown */}
            <div className="flex justify-content-between align-items-center">
                <div className="mb-5">
                    <Skeleton width="250px" height="24px" className="mb-2" />
                    <Skeleton width="300px" height="16px" />
                </div>
                <div>
                    <Skeleton width="14rem" height="36px" className="border-round-md" />
                </div>
            </div>

            {/* Graph Section */}
            <div className="flex justify-content-between">
                <div style={{ width: '70%', height: 'auto' }}>
                    <Skeleton width="100%" height="250px" />
                </div>
                <div style={{ background: '#F8FAFC', width: '25%' }}>
                    <Skeleton width="100%" height="250px" />
                </div>
            </div>

            {/* Score Legend */}
            <div className="grid mt-3 score-bg p-4">
                <div className="flex gap-6 px-4">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="flex align-items-center mr-4 border-right-1 pr-12 p-2 w-full mb-2 border-gray-400">
                            <Skeleton width="2rem" height="2rem" className="border-round-md mr-2" />
                            <Skeleton width="180px" height="16px" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HistoricalPerformanceSkeleton;
