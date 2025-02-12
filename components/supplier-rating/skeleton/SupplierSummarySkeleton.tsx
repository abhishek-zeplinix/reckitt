import { Skeleton } from 'primereact/skeleton';

const SupplierSummaryTableSkeleton = ({ rowsCount = 2, columnsCount = 5 }) => {
    return (
        <div className="card custom-box-shadow p-3">
            <table style={{ width: '100%', minWidth: '60rem', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        {Array(columnsCount)
                            .fill(null)
                            .map((_, colIndex) => (
                                <th key={colIndex} style={{ padding: '0.5rem', textAlign: colIndex % 2 === 0 ? 'left' : 'center', width: `${100 / columnsCount}%` }}>
                                    <Skeleton width="60%" height="1.5rem" />
                                </th>
                            ))}
                    </tr>
                </thead>
                <tbody>
                    {Array(rowsCount)
                        .fill(null)
                        .map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                {Array(columnsCount)
                                    .fill(null)
                                    .map((_, colIndex) => (
                                        <td
                                            key={colIndex}
                                            style={{
                                                padding: '0.5rem',
                                                textAlign: colIndex % 2 === 0 ? 'left' : 'center'
                                            }}
                                        >
                                            <Skeleton width={colIndex % 2 === 0 ? '80%' : '50%'} height={colIndex % 2 === 0 ? '1.5rem' : '2rem'} />
                                        </td>
                                    ))}
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default SupplierSummaryTableSkeleton;
