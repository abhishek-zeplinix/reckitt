import React from 'react';
import { Skeleton } from 'primereact/skeleton';

interface TileSkeletonProps {
    count: number;
    colClass?: string; // Optional prop to define column classes
}

const TileSkeleton: React.FC<TileSkeletonProps> = ({ count, colClass = 'col-12 sm:col-6 lg:col-3' }) => {
    return (
        <div className="py-1">
            <div className="grid grid-nogutter">
                {[...Array(count)].map((_, index) => (
                    <div key={index} className={`${colClass} pr-3`}>
                        <div className="p-3 border-1 border-primary-main border-round-2xl shadow-2 surface-card">
                            <div className="flex justify-content-between gap-2 align-items-center">
                                <div>
                                    <Skeleton width="80px" height="16px" className="mb-2" />
                                    <Skeleton width="120px" height="24px" className="mb-1" />
                                    <Skeleton width="60px" height="14px" />
                                </div>
                                <div>
                                    <Skeleton shape="circle" size="20px" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TileSkeleton;
