import { Skeleton } from 'primereact/skeleton';

const PerformanceRatingSkeleton = () => {
    return (
        <div className="flex">
            <div
                className="card shadow-lg"
                style={{
                    flexBasis: '48%',
                    minWidth: '48%',
                    width: '100%',
                    flexGrow: 1,
                    height: '470px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1rem'
                }}
            >
                {/* Skeleton for the card title */}
                <Skeleton width="60%" height="2rem" className="mt-2 mb-6" />

                {/* Skeleton for the chart area */}
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Skeleton width="100%" height="80%" />
                </div>

                {/* Skeleton for the label at the bottom */}
                <Skeleton width="30%" height="1.5rem" className="mt-4 mx-auto" />
            </div>
            <div
                className="card shadow-lg"
                style={{
                    flexBasis: '48%',
                    minWidth: '48%',
                    width: '100%',
                    flexGrow: 1,
                    height: '470px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1rem'
                }}
            >
                {/* Skeleton for the card title */}
                <Skeleton width="60%" height="2rem" className="mt-2 mb-6" />

                {/* Skeleton for the chart area */}
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Skeleton width="100%" height="80%" />
                </div>

                {/* Skeleton for the label at the bottom */}
                <Skeleton width="30%" height="1.5rem" className="mt-4 mx-auto" />
            </div>
        </div>
    );
};

export default PerformanceRatingSkeleton;
