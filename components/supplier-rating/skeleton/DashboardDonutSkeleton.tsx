import React from 'react';
import { Skeleton } from 'primereact/skeleton';

const TotalAssessmentSkeleton = () => {
    return (
        <div className="surface-0 p-4 border-round shadow-2">
            {/* Title */}
            <Skeleton width="250px" height="24px" className="mb-2" />
            <Skeleton width="300px" height="16px" className="mb-4" />

            {/* Grid Layout */}
            <div className="grid align-items-center">
                {/* Donut Chart Section */}
                <div className="col-7 flex justify-content-center">
                    <div className="relative">
                        <Skeleton width="200px" height="200px" className="border-circle" />
                        <div
                            className="flex justify-content-center align-items-center"
                            style={{
                                position: 'absolute',
                                top: '60%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#6C757D'
                            }}
                        >
                            <Skeleton width="50px" height="20px" />
                        </div>
                    </div>
                </div>

                {/* Legend Section */}
                <div className="col-5">
                    <div className="justify-content-center score-bg">
                        <div style={{ height: '130px', width: '100%' }} className="flex flex-column gap-3 p-5 border-round-2xl">
                            {[...Array(3)].map((_, index) => (
                                <div key={index} className="flex align-items-center gap-2">
                                    <Skeleton width="25px" height="25px" className="border-round" />
                                    <Skeleton width="180px" height="16px" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TotalAssessmentSkeleton;
