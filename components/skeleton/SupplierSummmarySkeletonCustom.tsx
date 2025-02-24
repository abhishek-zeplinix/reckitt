import React from 'react';
import { Skeleton } from 'primereact/skeleton';

const SupplierSummmarySkeletonCustom = ({ 
  leftPanelRows = 3,
  rightPanelRows = 2,
  height = '151px'
}) => {
  const renderSkeletonRows = (numRows: any) => {
    return Array(numRows).fill(0).map((_, index) => (
      <React.Fragment key={index}>
        <li className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-2" style={{ flex: '1' }}>
          <div>
            <div className="mt-1">
              <Skeleton width="120px" height="1rem" />
            </div>
          </div>
          <div className="mt-2 md:mt-0 flex align-items-center">
            <Skeleton width="150px" height="1rem" />
          </div>
        </li>
        {index < numRows - 1 && (
          <hr style={{ borderColor: '#CBD5E1', borderWidth: '0.1px', opacity: '0.4' }} />
        )}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex justify-content-between align-items-start flex-wrap gap-4">
      {/* Left Panel */}
      <div
        className="card shadow-lg"
        style={{
          flexBasis: '48%',
          minWidth: '48%',
          flexGrow: 1,
          height: height,
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem'
        }}
      >
        <ul className="list-none p-0 m-0" style={{ flexGrow: 1, padding: '0' }}>
          {renderSkeletonRows(leftPanelRows)}
        </ul>
      </div>

      {/* Right Panel */}
      <div
        className="card shadow-lg"
        style={{
          flexBasis: '48%',
          minWidth: '48%',
          flexGrow: 1,
          height: height,
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem'
        }}
      >
        <ul className="list-none p-0 m-0" style={{ flexGrow: 1, padding: '0' }}>
          {renderSkeletonRows(rightPanelRows)}
        </ul>
      </div>
    </div>
  );
};

export default SupplierSummmarySkeletonCustom;