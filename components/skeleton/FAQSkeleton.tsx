import { Skeleton } from 'primereact/skeleton';

const FAQSkeleton = ({ rows = 7 }) => {
    return (
        <div className="p-4">
            {/* Title */}
            {/* <Skeleton width="50%" height="25px" className="mb-2" />
            {/* Subtitle */}
            {/* <Skeleton width="80%" height="18px" className="mb-4" />  */}

            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="mb-3 flex items-center">
                    <Skeleton width="20px" height="20px" className="mr-2 mt-3" />
                    <Skeleton width="100%" height="20px" className="mr-2 mt-3" />
                </div>
            ))}
        </div>
    );
};

export default FAQSkeleton;
