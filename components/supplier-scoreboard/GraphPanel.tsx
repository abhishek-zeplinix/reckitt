import html2canvas from 'html2canvas';
import { Chart } from 'primereact/chart';
import React, { useEffect, useState } from 'react';

const GraphsPanel = React.memo(({ ratingData, memoizedOptions, lineData, memoizedBarOptions, chartRef, chartImage, setChartImage, setPdfReady, pdfReady, selectedYear, ratingsData }: any) => {

    const [ChartsLoaded, setChartsLoaded] = useState(false);
    
    useEffect(() => {
        setChartsLoaded(true);
    }, []);

    
    useEffect(() => {
        const captureTimer = setTimeout(async () => {
            if (!chartRef.current) return;

            await new Promise((resolve) => requestAnimationFrame(resolve));
            const canvas = await html2canvas(chartRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            setChartImage(canvas.toDataURL('image/png'));
        }, 1000); // Add debounce delay

        return () => clearTimeout(captureTimer);
    }, [ratingsData, selectedYear, pdfReady]);


    useEffect(() => {
        if (chartImage) {
            setPdfReady(!!chartImage);
        }
    }, [chartImage]);


    useEffect(() => {
        return () => {
            setChartImage(null);
            setPdfReady(false);
        };
    }, [selectedYear]);

    if (!ChartsLoaded) return null;

    
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
