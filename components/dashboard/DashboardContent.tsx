'use client';
import React, { useEffect, useState } from 'react';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import Image from 'next/image';
import Link from 'next/link';
import { useAppContext } from '@/layout/AppWrapper';
import { CustomResponse, Tile } from '@/types';
import TileSkeleton from '@/components/skeleton/DashboardCountSkeleton';
import SupplierPerformanceSkeleton from '@/components/skeleton/SupplierPerformanceSkeleton';
import HistoricalPerformanceSkeleton from '@/components/skeleton/DashboardWaveGraphSkeleton';
import TotalAssessmentSkeleton from '@/components/skeleton/DashboardDonutSkeleton';
import { GetCall } from '@/app/api-config/ApiKit';
import SupplierPerformance from './SupplierPerformanceTopBottom';
import HistoricalPerformanceGraph from './graphs/HistoricalPerformanceGraph';

interface DashboardContentProps {
    filtersVisible: boolean;
    setFiltersVisible: React.Dispatch<React.SetStateAction<boolean>>;

}

const DashboardContent = ({ filtersVisible, setFiltersVisible }: DashboardContentProps) => {

    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [selectedCity, setSelectedCity] = useState(null);
    const { isLoading, setLoading, setScroll, setAlert } = useAppContext();
    const [tilesData, setTilesData] = useState<Tile[]>([]);
    const [secondTilesData, setSecondTilesData] = useState<Tile[]>([]);
    const [thirdTilesData, setThirdTilesData] = useState<Tile[]>([]);
    const [chartData, setChartData] = useState<Tile[]>([]);

    const [pieData, setPieData] = useState({
        labels: ['Pending', 'In-progress', 'Completed'],
        datasets: [
            {
                data: [0, 0, 0],
                backgroundColor: ['#FFA600', '#4CAF50', '#2196F3']
            }
        ]
    });

    const [totalDonut, setTotalDonut] = useState<any>();

    const totalDonutt = 0;

    const chartCustomoptions = {
        animation: false
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (params?: any) => {
        try {
            if (!params) {
                params = { limit: limit, page: page };
            }
            setLoading(true);
            const queryString = buildQueryParams(params);
            const response: CustomResponse = await GetCall(`/company/dashboard-data?${queryString}`);

            if (response.code === 'SUCCESS') {
                const apiData = response.data.evasupa;
                const chartData = mapApiDataToTiles(apiData);
                const mappedData = mapApiDataToTiles(apiData); // Use the mapping function
                const SecondTilesData = secondData(apiData); // Use the mapping function
                const ThirdTilesData = thirdData(apiData); // Use the mapping function
                setTilesData(mappedData);
                setSecondTilesData(SecondTilesData);
                setThirdTilesData(ThirdTilesData);
                setChartData(chartData);

                const { pendingAssessment, inProgressAssessment, completedAssessment } = response.data.evasupa.EvaluationData[0];

                const pending = parseInt(pendingAssessment);
                const inProgress = parseInt(inProgressAssessment);
                const completed = parseInt(completedAssessment);
                const total = pending + inProgress + completed;
                setTotalDonut(total);
                setPieData((prev) => ({
                    ...prev,
                    datasets: [
                        {
                            ...prev.datasets[0],
                            data: [parseInt(pendingAssessment), parseInt(inProgressAssessment), parseInt(completedAssessment)]
                        }
                    ]
                }));

            } else {
                setTilesData([]);
            }
        } catch (e) {
            setAlert('error', 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const mapApiDataToTiles = (apiData: any): Tile[] => {
        const evaluationData = apiData.EvaluationData?.[0] || {}; // Get the first item in the EvaluationData array or an empty object

        return [
            {
                title: 'Total Evaluators',
                value: apiData.evaluatorCount || 0,
                change: `+ ${apiData.evaluatorCount}`,
                changeClass: 'good-text'
            },
            {
                title: 'Total Suppliers',
                value: apiData.supplierCount || 0,
                change: `+ ${apiData.supplierCount}`,
                changeClass: 'good-text',
                link: '/manage-supplier'
            },
            {
                title: 'Total Approvers',
                value: apiData.approverCount || 0,
                change: `+ ${apiData.approverCount}`,
                changeClass: 'good-text'
            },
            {
                title: 'Total Assessment Expected',
                value: evaluationData.totalAssessments || 0, // Extract "totalAssessments" from EvaluationData
                change: `+ ${evaluationData.totalAssessments}`, // Optional: show pending assessments
                changeClass: 'good-text' // Dynamic class based on value
            }
        ];
    };
    const secondData = (apiData: any): Tile[] => {
        const evaluationData = apiData.EvaluationData?.[0] || {};
        return [
            {
                title: 'Completed Assessment',
                value: evaluationData.completedAssessment || 0,
                change: `+ ${evaluationData.completedAssessment}`,
                changeClass: 'good-text'
            },
            {
                title: 'In Progress Assessment',
                value: evaluationData.inProgressAssessment || 0,
                change: `+ ${evaluationData.inProgressAssessment}`,
                changeClass: 'good-text'
            }
        ];
    };
    const thirdData = (apiData: any): Tile[] => {
        const evaluationData = apiData.EvaluationData?.[0] || {};
        return [
            {
                title: 'Pending Assessment',
                value: evaluationData.pendingAssessment || 0,
                change: `+ ${evaluationData.pendingAssessment}`,
                changeClass: 'good-text'
            },
            {
                title: 'Assigned Suppliers',
                value: evaluationData.assignedSupplierCount || 0,
                change: `+ ${evaluationData.assignedSupplierCount}`,
                changeClass: 'good-text'
            },
            
        ];
    };


    const cities = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];
    const dropdownConfigs = [
        { label: "Period's", placeholder: 'Select a Period' },
        { label: 'Action', placeholder: 'Select Action' },
        { label: 'Supplier Category', placeholder: 'Select Supplier Category' },
        { label: 'Supplier Name', placeholder: 'Select Supplier' },
        { label: 'Supplier Name', placeholder: 'Select Supplier' },
        { label: 'Supplier Name', placeholder: 'Select Supplier' },
        { label: 'Supplier Name', placeholder: 'Select Supplier' }
    ];


    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: (tooltipItem: any) => `${tooltipItem.label}: ${tooltipItem.raw}` // Show label with value
                }
            }
        },
        cutout: '70%', // Inner cutout for the donut chart
        responsive: true,
        animation: false,
        maintainAspectRatio: false
    };


    const donutGraph = () => {
        return (
            <div className="surface-0 p-4 border-round shadow-2">
                <h3 className="text-left mb-2">Total Assessment Summary</h3>
                <p className="text-left text-sm mb-4">Lorem ipsum dummy text In Progress Assessment Lorem ipsum</p>

                <div className="grid align-items-center grid-wrap">
                    {/* Donut Chart Section */}
                    <div className="col-12 md:col-7 flex justify-content-center">
                        <div className="relative">
                            <Chart type="doughnut" data={pieData} options={options} />
                            <div
                                className="flex justify-content-center align-items-center "
                                style={{
                                    position: 'absolute',
                                    top: '60%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: '#6C757D'
                                }}
                            >
                                {totalDonut}
                                <p className="text-sm m-0">Total</p>
                            </div>
                        </div>
                    </div>

                    {/* Legend Section */}
                    <div className="col-12 md:col-5 mt-4 md:mt-0">
                        <div className="justify-content-center score-bg">
                            <div style={{ height: '150px', width: '100%' }} className="flex flex-column gap-3 p-5 justify-content-center border-round-2xl">
                                <div className="flex align-items-center gap-2">
                                    <div className="border-round pending" style={{ width: '25px', height: '25px' }}></div>
                                    <span className="ml-2 text-md">
                                        Pending <br />
                                    </span>
                                </div>
                                <div className="flex align-items-center gap-2">
                                    <div className="border-round inProgress" style={{ width: '25px', height: '25px' }}></div>
                                    <span className="ml-2 text-md">
                                        In Progress <br />
                                    </span>
                                </div>
                                <div className="flex align-items-center gap-2">
                                    <div className="border-round completed" style={{ width: '25px', height: '25px' }}></div>
                                    <span className="ml-2 text-md">
                                        Completed <br />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const DonutGraph = donutGraph();

    const Bardata = {
        labels: ['Q1/2025', 'Q2/2025', 'Q3/2025', 'Q4/2025'],
        datasets: [
            {
                label: 'Excellent',
                backgroundColor: '#2196F3',
                data: [20, 25, 30, 35],
                borderRadius: 20
            },
            {
                label: 'Good',
                backgroundColor: '#4CAF50',
                data: [25, 20, 25, 20],
                borderRadius: 20
            },
            {
                label: 'Improvement Needed',
                backgroundColor: '#FF9800',
                data: [30, 30, 25, 25],
                borderRadius: 20
            },
            {
                label: 'Critical',
                backgroundColor: '#F44336',
                data: [25, 25, 20, 20],
                borderRadius: 20
            }
        ]
    };

    const Baroptions = {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    boxWidth: 15, // Reduce the box width of the legend
                    boxHeight: 10, // Reduce the box height of the legend
                    padding: 15, // Reduce the spacing between legend items
                    font: {
                        size: 10 // Adjust the font size of legend text
                    }
                }
            },
            tooltip: {
                callbacks: {
                    title: (context: any) => `Stats Details`
                }
            }
        },
        layout: {
            padding: {
                top: 0,
                bottom: 20
            }
        },
        scales: {
            x: {
                stacked: true,
                grid: {
                    display: false
                },
                barPercentage: 0.3, // Adjust bar width
                categoryPercentage: 5 // Add space between bars
            },
            y: {
                stacked: true,
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 25,
                    display: true // Hides Y-axis labels
                },
                grid: {
                    drawBorder: false, // Removes border at the bottom
                    drawTicks: true, // Removes ticks from the Y-axis
                    display: true // Removes horizontal grid lines
                }
            }
        },
        elements: {
            bar: {
                borderRadius: 20, // Add rounded corners to the bars
                orderSkipped: false
            }
        }
    };
    const barGraph = () => {
        return (
            <div className="pt-4 px-4 border-round-xl shadow-2 surface-card mb-4">
                <h3 className="text-900">Supplier Performance Trend</h3>
                <p className="text-600 text-sm">Lorem ipsum dummy text In Progress Assessment</p>
                <div style={{ height: '350px' }}>
                    <Chart type="bar" data={Bardata} options={Baroptions} style={{ height: '360px' }} />
                </div>
                <div className="grid mt-3 score-bg p-4">
                    <div className="col-6">
                        <div className="flex align-items-center mr-4 lg:w-1/2 w-full mb-2">
                            <span className="w-2rem h-2rem critical  border-round-md mr-2"></span>
                            <span className="text-sm">Critical</span>
                        </div>
                        <div className="flex align-items-center mr-4 lg:w-1/2 w-full mb-2">
                            <span className="w-2rem h-2rem improvement border-round-md mr-2"></span>
                            <span className="text-sm">Improvement Needed</span>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="flex align-items-center mr-4 lg:w-1/2 w-full mb-2">
                            <span className="w-2rem h-2rem good  border-round-md mr-2"></span>
                            <span className="text-sm">Good</span>
                        </div>
                        <div className="flex align-items-center lg:w-1/2 w-full mb-2">
                            <span className="w-2rem h-2rem excellent border-round-md mr-2"></span>
                            <span className="text-sm">Excellent</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const BarGraph = barGraph();
    const barGraphSupplierTiers = () => {
        return (
            <div className="pt-4 px-4  border-round-xl shadow-2 surface-card mb-4 relative">
                <h3 className="text-900">Supplier Performance Trend</h3>
                <p className="text-600 text-sm">Lorem ipsum dummy text In Progress Assessment</p>
                <div style={{ height: '350px' }}>
                    <Chart type="bar" data={Bardata} options={Baroptions} style={{ height: '360px' }} />
                </div>
                <div className="grid mt-3 score-bg p-4">
                    <div className="flex gap-2  px-2">
                        <div className="flex align-items-center mr-4 border-right-1 pr-3 p-2 w-full mb-2 border-gray-400">
                            <span className="w-2rem h-2rem critical  border-round-md  mr-2 "></span>
                            <span className="text-sm">NA</span>
                        </div>
                        <div className="flex align-items-center mr-4 border-right-1 pr-3 w-full mb-2 border-gray-400">
                            <span className="w-2rem h-2rem good border-round-md  mr-2 "></span>
                            <span className="text-sm">Tier 3</span>
                        </div>
                        <div className="flex align-items-center mr-4 border-right-1 pr-3 w-full mb-2 border-gray-400">
                            <span className="w-2rem h-2rem improvement  border-round-md  mr-2 "></span>
                            <span className="text-sm">Tier 2</span>
                        </div>
                        <div className="flex align-items-center  w-full mb-2 border-gray-400">
                            <span className="w-2rem h-2rem excellent border-round-md  mr-2 "></span>
                            <span className="text-sm">Tier 1</span>
                        </div>
                    </div>
                </div>
                {/* <div className="custom-div p-3">
                    <div className="content">
                        <p>This is a custom-shaped div.</p>
                    </div>
                </div> */}
            </div>
        );
    };

    const BarGraphSupplierTiers = barGraphSupplierTiers();

    const dataFilters = () => {
        return (
            <div className={`px-4 py-4  p-m-3 filters-container ${filtersVisible ? 'filters-container-visible' : ''} `}>
                <div className="relative border-bottom-1 border-300">
                    <h3>Filters</h3>
                    <span onClick={() => setFiltersVisible(false)} className="absolute top-0 right-0 border-0 bg-transparent">
                        <i className="pi pi-times text-sm"></i>
                    </span>
                </div>
                <div className="grid mt-4 gap-4 px-2">
                    {dropdownConfigs.map((config, index) => (
                        <div key={index} className="flex flex-column">
                            <label className="mb-1">{config.label}</label>
                            <Dropdown value={selectedCity} onChange={(e) => setSelectedCity(e.value)} options={cities} optionLabel="name" showClear placeholder={config.placeholder} className="w-full md:w-14rem" />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const DataFilters = dataFilters();

    const dataTiles = () => {
        return (
            <>
                <div>
                    <div className={`transition-all duration-300 ease-in-out ${filtersVisible ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 invisible'} overflow-hidden shadow-2 surface-card border-round-2xl mr-3 mb-3`}>{DataFilters}</div>

                    {isLoading ? (
                        <TileSkeleton count={4} colClass="col-12 sm:col-6 lg:col-3" />
                    ) : (
                        <div className="py-1 ">
                            <div className="grid grid-nogutter">
                                {tilesData.map((tile, index) => (
                                    <div
                                        key={index}
                                        className="col-12 sm:col-6 lg:col-3 pr-3" // Ensures 4 tiles in a row on non-mobile devices
                                    >
                                        <Link href={tile.link || ''}>
                                            <div className="p-3 border-1 border-primary-main border-round-2xl shadow-2 surface-card hover:shadow-3 transition-duration-200">
                                                <div className="flex justify-content-between gap-2 align-items-center">
                                                    <div>
                                                        <div>
                                                            <h3 className="text-500 text-sm mb-0">{tile.title}</h3>
                                                        </div>
                                                        <div className="mt-2">
                                                            <h2 className="text-900 text-xl font-bold mb-1">{tile.value}</h2>
                                                            <span className={`text-sm font-semibold ${tile.changeClass}`}>{tile.change}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <i className="pi pi-angle-right text-primary-main"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid p-0">
                        {/* First Column */}

                        <div className="col-12 md:col-6">
                            <div className="pt-3">
                                {isLoading ? (
                                    <TileSkeleton count={2} colClass="col-12 sm:col-12 lg:col-6" />
                                ) : (
                                    <div className="grid grid-nogutter">
                                        {secondTilesData.map((tile, index) => (
                                            <div key={index} className="col-12 md:col-4 lg:col-6 pr-3">
                                                <div className="p-3 border-1 border-primary-main border-round-2xl shadow-1 surface-card hover:shadow-3 transition-duration-200">
                                                    <div className="flex justify-content-between gap-2 align-items-center">
                                                        <div>
                                                            <h3 className="text-500 text-sm mb-0">{tile.title}</h3>
                                                            <div className="mt-2">
                                                                <h2 className="text-900 text-xl font-bold mb-1">{tile.value}</h2>
                                                                <span className={`text-sm font-semibold ${tile.changeClass}`}>{tile.change}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <i className="pi pi-angle-right text-primary-main"></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="py-3">
                                    {isLoading ? (
                                        <TileSkeleton count={1} colClass="col-12 sm:col-12 lg:col-12" />
                                    ) : (
                                        <div className="grid grid-nogutter">
                                            {thirdTilesData.map((tile, index) => (
                                                <div key={index} className="col-12 md:col-4 lg:col-6 pr-3">
                                                    <div className="p-3 border-1 border-primary-main border-round-2xl shadow-1 surface-card hover:shadow-3 transition-duration-200">
                                                        <div className="flex justify-content-between gap-2 align-items-center">
                                                            <div>
                                                                <div>
                                                                    <h3 className="text-500 text-sm mb-0">{tile.title}</h3>
                                                                </div>
                                                                <div className="mt-2">
                                                                    <h2 className="text-900 text-xl font-bold mb-1">{tile.value}</h2>
                                                                    <span className={`text-sm font-semibold ${tile.changeClass}`}>{tile.change}</span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <i className="pi pi-angle-right text-primary-main"></i>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="pr-3">{isLoading ? <SupplierPerformanceSkeleton /> : BarGraphSupplierTiers}</div>

                                <div className="pr-3 ">{isLoading ? <SupplierPerformanceSkeleton /> : BarGraph}</div>
                            </div>
                        </div>

                        {/* Second Column */}
                        <div className="col-12 md:col-6 p-0 pr-3">
                            <div className="py-3">
                                <div className=" gap-3 pr-2">
                                    {/* Top 5 Suppliers */}
                                    <SupplierPerformance
                                        limit={5}
                                    />
                                    <div className="col-12 px-2 p-0 py-2  ">{isLoading ? <TotalAssessmentSkeleton /> : DonutGraph}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div>{isLoading ? <HistoricalPerformanceSkeleton /> : <HistoricalPerformanceGraph />}</div>
            </>


        );

    };

    const DataTiles = dataTiles();

    return (
        <>
            {DataTiles}
        </>
    )
};

export default DashboardContent;
