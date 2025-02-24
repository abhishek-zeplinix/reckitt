// import React from 'react';
// import { Skeleton } from 'primereact/skeleton';

// const TableSkeletonSimple = ({col}: any) => {
//   return (
//     <div className="w-full p-4 m-5 align-self-center">
//       <div className="border rounded-lg p-4">

//         <div className="flex w-full mb-4 gap-5">
//           {[...Array(col)].map((_, index) => (
//             <Skeleton key={index} width="20%" height="30px" className="mx-2" />
//           ))}
//         </div>

//         {[...Array(10)].map((_, rowIndex) => (
//           <div key={rowIndex} className="flex w-full mb-2 gap-5">
//             {[...Array(col)].map((_, colIndex) => (
//               <Skeleton key={colIndex} width="20%" height="20px" className="mx-2 " />
//             ))}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default TableSkeletonSimple;
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
