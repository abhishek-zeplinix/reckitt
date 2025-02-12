import { Skeleton } from 'primereact/skeleton';

const SupplierSummaryRightLeftPanelSkeleton = ({ itemCount = 5 }) => {
    return (
        <ul>
            {Array(itemCount)
                .fill(null)
                .map((_, index) => (
                    <>
                        <li key={index} className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-2" style={{ flex: '1' }}>
                            {/* Label Skeleton */}
                            <div>
                                <Skeleton width="8rem" height="1rem" className="mt-1" />
                            </div>

                            {/* Value Skeleton */}
                            <div className="mt-2 md:mt-0 flex align-items-center" style={{ fontSize: '0.9rem' }}>
                                <Skeleton width="6rem" height="1rem" className="mr-2 mb-1 md:mb-0" />
                            </div>
                        </li>

                        {/* Divider Skeleton */}
                        {index < itemCount - 1 && (
                            <hr
                                style={{
                                    borderColor: '#CBD5E1',
                                    borderWidth: '0.1px',
                                    opacity: '0.4'
                                }}
                            />
                        )}
                    </>
                ))}
        </ul>
    );
};

export default SupplierSummaryRightLeftPanelSkeleton;
