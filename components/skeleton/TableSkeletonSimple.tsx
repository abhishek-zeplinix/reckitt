import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';

const TableSkeletonSimple = ({ columns = 5, rows = 5 }) => {
    // Generate an array of fake rows
    const dummyData = Array.from({ length: rows }, (_, rowIndex) => ({
        id: rowIndex,
        values: Array.from({ length: columns }, () => '')
    }));

    return (
        <DataTable
            className="reckitt-table p-datatable-thead"
            scrollable
            value={dummyData} // ✅ This is required for rows to render
        >
            {/* Actions Column Placeholder */}
            <Column header={<Skeleton width="80px" height="20px" />} body={() => <Skeleton width="60px" height="20px" />} />

            {/* Table Columns Skeleton */}
            {Array.from({ length: columns }).map((_, colIndex) => (
                <Column key={colIndex} header={<Skeleton width="100px" height="20px" />} body={() => <Skeleton width="80%" height="20px" />} />
            ))}
        </DataTable>
    );
};

export default TableSkeletonSimple;
