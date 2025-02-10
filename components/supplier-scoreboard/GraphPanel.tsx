import { Chart } from "primereact/chart";
import React from "react";

const GraphsPanel: any = React.memo(({ ratingData, memoizedOptions, lineData, memoizedBarOptions, chartRef }: any) => {

    return (
        <>
            {/* first chart */}
            <div className="flex justify-content-between align-items-start flex-wrap gap-4" ref={chartRef}>
                <div className="card shadow-lg" style={{ flexBasis: '48%', minWidth: '48%', width: '100%', flexGrow: 1, height: '470px', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                    <h4 className="mt-2 mb-6">Overall Performance Rating per Quarter</h4>
                    <Chart type="bar" data={ratingData} options={memoizedOptions} />
                    <h6 className="text-center">Quarters</h6>
                </div>

                {/* second chart */}
                <div className="card shadow-lg" style={{ flexBasis: '48%', minWidth: '48%', width: '100%', flexGrow: 1, height: '470px', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                    <h4 className="mt-2 mb-6">Overall Performance per Function</h4>
                    <Chart type="bar" data={lineData} options={memoizedBarOptions} className="" />
                    <h6 className="text-center">Quarters</h6>
                </div>
            </div>
        </>
    );
});

export default GraphsPanel;