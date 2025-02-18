'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chart } from 'primereact/chart';
import SupplierDirectory from '@/components/SupplierDirectory';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import Image from 'next/image';
import Link from 'next/link';
import { useAppContext } from '@/layout/AppWrapper';
import { CustomResponse, Tile } from '@/types';
import { GetCall } from '../api-config/ApiKit';
import TileSkeleton from '@/components/supplier-rating/skeleton/DashboardCountSkeleton';
import SupplierPerformanceSkeleton from '@/components/supplier-rating/skeleton/SupplierPerformanceSkeleton';
import HistoricalPerformanceSkeleton from '@/components/supplier-rating/skeleton/DashboardWaveGraphSkeleton';
import TotalAssessmentSkeleton from '@/components/supplier-rating/skeleton/DashboardDonutSkeleton';
import { withAuth } from '@/layout/context/authContext';
const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [filtersVisible, setfiltersVisible] = useState(false);
    const [position, setPosition] = useState('center');
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);
    const [selectedCity, setSelectedCity] = useState(null);
    const { isLoading, setLoading, setScroll, setAlert } = useAppContext();
    const [tilesData, setTilesData] = useState<Tile[]>([]);
    const [secondTilesData, setSecondTilesData] = useState<Tile[]>([]);
    const [thirdTilesData, setThirdTilesData] = useState<Tile[]>([]);
    const [chartData, setChartData] = useState<Tile[]>([]);
    const [topSupplierData, setTopSupplierData] = useState([]);
    const [bottomSupplierData, setBottomSupplierData] = useState([]);
    const [tilesLoading, setTileLoading] = useState(false);
    const [topSupplierLoading, setTopSupplierLoading] = useState(false);
    const [bottomSupplierLoading, setBottomSupplierLoading] = useState(false);
    const [supplierPerformanceLoading, setSupplierPerformanceLoading] = useState(false);

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

    useEffect(() => {
        fetchData();
        fetchTopData();
        fetchBottomData();
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

                const { pendingAssessments, inProgressAssessments, completedAssessments } = response.data.evasupa.EvaluationData[0];

                const pending = parseInt(pendingAssessments);
                const inProgress = parseInt(inProgressAssessments);
                const completed = parseInt(completedAssessments);
                const total = pending + inProgress + completed;
                setTotalDonut(total);
                setPieData((prev) => ({
                    ...prev,
                    datasets: [
                        {
                            ...prev.datasets[0],
                            data: [parseInt(pendingAssessments), parseInt(inProgressAssessments), parseInt(completedAssessments)]
                        }
                    ]
                }));

                if (response.total) {
                    setTotalRecords(response?.total);
                }
            } else {
                setTilesData([]);
            }
        } catch (e) {
            setAlert('error', 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };
    const fetchTopData = async (params?: any) => {
        try {
            if (!params) {
                params = { limit: '5', page: page, sortBy: 'asc', sortOrder: 'desc' };
            }
            setLoading(true);
            const queryString = buildQueryParams(params);

            const response: CustomResponse = await GetCall(`/company/dashboard-data/supplier-performance?${queryString}`);
            if (response.code == 'SUCCESS') {
                setTopSupplierData(response.data);

                if (response.total) {
                    setTotalRecords(response?.total);
                }
            } else {
                setTopSupplierData([]);
            }
        } catch (e) {
            setAlert('error', 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };
    const fetchBottomData = async (params?: any) => {
        try {
            if (!params) {
                params = { limit: '5', page: page, sortBy: 'asc', sortOrder: 'asc' };
            }
            setLoading(true);
            const queryString = buildQueryParams(params);
            const response: CustomResponse = await GetCall(`/company/dashboard-data/supplier-performance?${queryString}`);
            if (response.code == 'SUCCESS') {
                setBottomSupplierData(response.data);

                if (response.total) {
                    setTotalRecords(response?.total);
                }
            } else {
                setBottomSupplierData([]);
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
                value: evaluationData.completedAssessments || 0,
                change: `+ ${evaluationData.completedAssessments}`,
                changeClass: 'good-text'
            },
            {
                title: 'In Progress Assessment',
                value: evaluationData.inProgressAssessments || 0,
                change: `+ ${evaluationData.inProgressAssessments}`,
                changeClass: 'good-text'
            }
        ];
    };
    const thirdData = (apiData: any): Tile[] => {
        const evaluationData = apiData.EvaluationData?.[0] || {};
        return [
            {
                title: 'Pending Assessment',
                value: evaluationData.pendingAssessments || 0,
                change: `+ ${evaluationData.pendingAssessments}`,
                changeClass: 'good-text'
            }
        ];
    };
    const fourthData = [
        {
            title: 'Task Management',
            value: 'Click here to view tasks',
            change: `+ 0`,
            changeClass: 'good-text',
            link: '/manage-supplier'
        }
    ];
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

    const dashes = Array(22).fill('-');

    const thirdDataa = (apiData: any) => {
        const evaluationData = apiData.EvaluationData?.[0] || {};
        return [evaluationData.pendingAssessments || 0, evaluationData.inProgressAssessments || 0, evaluationData.completedAssessments || 0];
    };

    // const data = {
    //     labels: ['Pending ', 'In-progress', 'Completed '],
    //     datasets: [
    //         {
    //             data: [
    //                 parseInt(pieData[0].pendingAssessments),
    //                 parseInt(pieData[0].inProgressAssessments),
    //                 parseInt(pieData[0].completedAssessments)
    //             ], // Values for the donut chart
    //             backgroundColor: ['#FFE434', '#3A60F8', '#78C47B'], // Corresponding colors
    //             hoverBackgroundColor: ['#FFE434', '#3A60F8', '#78C47B']
    //         }
    //     ]
    // };

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
        maintainAspectRatio: false
    };

    const getScoreColor = (score: any) => {
        const scoreValue = parseInt(score); // Assuming score is a percentage string like '100%'

        if (scoreValue >= 90) {
            return '#2196F3';
        } else if (scoreValue >= 70) {
            return '#4CAF50';
        } else if (scoreValue >= 50) {
            return '#FF9800';
        } else {
            return '#F44336';
        }
    };
    const donutGraph = () => {
        return (
            <div className="surface-0 p-4 border-round shadow-2">
                <h3 className="text-left mb-2">Total Assessment Summaryyy</h3>
                <p className="text-left text-sm mb-4">Lorem ipsum dummy text In Progress Assessment Lorem ipsum</p>

                <div className="grid align-items-center">
                    {/* Donut Chart Section */}
                    <div className="col-7 flex justify-content-center">
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
                    <div className="col-5">
                        <div className=" justify-content-center score-bg ">
                            <div style={{ height: '130px', width: '100%' }} className="flex flex-column gap-3 p-5 border-round-2xl">
                                <div className="flex align-items-center gap-2 ">
                                    <div className="border-round pending" style={{ width: '25px', height: '25px' }}></div>
                                    <span className="ml-2 text-md">
                                        Pending <br /> Assessment
                                    </span>
                                </div>
                                <div className="flex align-items-center gap-2">
                                    <div className="border-round inProgress" style={{ width: '25px', height: '25px' }}></div>
                                    <span className="ml-2 text-md">
                                        In Progress <br /> Assessment
                                    </span>
                                </div>
                                <div className="flex align-items-center gap-2">
                                    <div className="border-round completed" style={{ width: '25px', height: '25px' }}></div>
                                    <span className="ml-2 text-md">
                                        Completed <br /> Assessment
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
    const sections = [
        { label: 'Sustainability', image: '/images/waves/blue.svg' },
        { label: 'Development', image: '/images/waves/yellow.svg' },
        { label: 'Procurement', image: '/images/waves/green.svg' },
        { label: 'Planning', image: '/images/waves/red.svg' },
        { label: 'Quality', image: '/images/waves/purple.svg' }
    ];

    const waveSideGraphs = () => {
        return (
            <div className="p-4 border-round-md shadow-1 w-2xl">
                {sections.map((section, index) => (
                    <div key={index} className="p-flex p-ai-center p-jc-between py-1 border-bottom-1 border-gray-300 last:border-none">
                        {/* Icon */}
                        <div className="flex items-center pt-2">
                            <Image src={section.image} alt={section.label} width={30} height={30} className="pb-2" />
                            {/* Label */}
                            <span className="text-gray-700 text-lg ml-3">{section.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const WaveSideGraphs = waveSideGraphs();
    const dataWaveGraphs = {
        labels: ['Q1/2025', 'Q2/H1 2025', 'Q3 2025', 'Q4/H2 2025', 'Q1 2025', 'Q2/H1 2025'],
        datasets: [
            {
                label: 'Sustainability',
                data: [60, 45, 70, 95, 88, 92],
                borderColor: '#2196F3',
                backgroundColor: 'rgba(0, 122, 217, 0.2)',
                fill: false,
                tension: 0
            },
            {
                label: 'Development',
                data: [90, 68, 30, 82, 68, 22],
                borderColor: '#FF9800',
                backgroundColor: 'rgba(240, 200, 8, 0.2)',
                fill: false,
                tension: 0
            },
            {
                label: 'Procurement',
                data: [50, 55, 45, 60, 58, 62],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(0, 166, 82, 0.2)',
                fill: false,
                tension: 0
            },
            {
                label: 'Planning',
                data: [30, 35, 25, 40, 38, 42],
                borderColor: '#F44336',
                backgroundColor: 'rgba(214, 48, 49, 0.2)',
                fill: false,
                tension: 0
            },
            {
                label: 'Quality',
                data: [0, 25, 15, 30, 28, 85],
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.2)',
                fill: false,
                tension: 0
            }
        ]
    };
    const waveOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Quarter'
                }
            },
            y: {
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 10
                },
                title: {
                    display: true,
                    text: 'Score'
                }
            }
        }
    };
    const waveGraphs = () => {
        return (
            <div className="p-flex px-4 py-4 p-flex-column p-ai-center p-p-4 border-round-xl shadow-2 surface-card">
                <div className="flex justify-content-between align-items-center">
                    <div className="mb-5">
                        <h3>Historical Performance Per Function</h3>
                        <p>Lorem ipsum dummy text in progress assessment</p>
                    </div>
                    <div>
                        <Dropdown value={selectedCity} onChange={(e) => setSelectedCity(e.value)} options={cities} optionLabel="name" placeholder="All Supplier" className="w-full md:w-14rem bgActiveBtn bgActiveBtnText custom-dropdown px-2 py-1 " />
                    </div>
                </div>
                <div className="flex justify-content-between">
                    <div style={{ width: '70%', height: 'auto' }} className="">
                        <Chart type="line" data={dataWaveGraphs} options={waveOptions} />
                    </div>
                    <div style={{ background: '#F8FAFC' }}>{WaveSideGraphs}</div>
                </div>
                <div>
                    <div className="grid mt-3 score-bg p-4">
                        <div className="flex gap-6 px-4 ">
                            <div className="flex align-items-center mr-4 border-right-1 pr-12 p-2 w-full mb-2 border-gray-400">
                                <span className="w-2rem h-2rem critical  border-round-md  mr-2 "></span>
                                <span className="text-sm"> Critical (0-50)</span>
                            </div>
                            <div className="flex align-items-center mr-4 border-right-1 pr-12 w-full mb-2 border-gray-400">
                                <span className="w-2rem h-2rem improvement border-round-md  mr-2 "></span>
                                <span className="text-sm"> Improvement Needed (51-70)</span>
                            </div>
                            <div className="flex align-items-center mr-4 border-right-1 pr-12 w-full mb-2 border-gray-400">
                                <span className="w-2rem h-2rem good  border-round-md  mr-2 "></span>
                                <span className="text-sm">Good (71-90)</span>
                            </div>
                            <div className="flex align-items-center  w-full mb-2 border-gray-400">
                                <span className="w-2rem h-2rem excellent border-round-md  mr-2 "></span>
                                <span className="text-sm">Excellent (91-100)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const WaveGraphs = waveGraphs();

    const dataFilters = () => {
        return (
            <div className={`px-4 py-4  p-m-3 transition-all ${filtersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'} `}>
                <div className="relative border-bottom-1 border-300">
                    <h3>Filters</h3>
                    <span onClick={() => setfiltersVisible(false)} className="absolute top-0 right-0 border-0 bg-transparent">
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
                                    {isLoading ? (
                                        <SupplierPerformanceSkeleton />
                                    ) : (
                                        <div className="col-12 px-2 p-0 py-2 ">
                                            <div className="p-4 border-round-xl shadow-2 surface-card ">
                                                <h3 className="text-900 font-bold mb-0">Top 5 Suppliers</h3>
                                                <div className="">
                                                    <DataTable
                                                        className="mb-3 mt-3"
                                                        value={topSupplierData}
                                                        paginator={false} // Enable pagination
                                                        rows={limit} // Items per page
                                                        totalRecords={totalRecords} // Total records from API response
                                                        responsiveLayout="scroll" // Makes the table responsive
                                                        showGridlines={false} // Optional: Adds gridlines for better readability
                                                        style={{ fontSize: '12px' }}
                                                    >
                                                        <Column
                                                            header="Sr.No."
                                                            body={(data: any, options: any) => {
                                                                const normalizedRowIndex = options.rowIndex % limit;
                                                                const srNo = (page - 1) * limit + normalizedRowIndex + 1;
                                                                return <span>{srNo}</span>;
                                                            }}
                                                            style={{ minWidth: '50px', maxWidth: '50px' }}
                                                        />
                                                        <Column header="Name" field="supplier.supplierName" style={{ minWidth: '100px', maxWidth: '100px' }} />
                                                        <Column header="Region" field="supplier.location" style={{ minWidth: '60px', maxWidth: '60px' }} />
                                                        <Column
                                                            header="Score"
                                                            field="Score"
                                                            style={{ minWidth: '40px', maxWidth: '40px' }}
                                                            body={(rowData) => {
                                                                const roundedScore = Math.round(rowData.Score);
                                                                return (
                                                                    <span className="font-bold" style={{ color: getScoreColor(roundedScore) }}>
                                                                        {roundedScore}%
                                                                    </span>
                                                                );
                                                            }}
                                                            className="text-center"
                                                        />
                                                    </DataTable>
                                                </div>
                                                <Link href="/manage-supplier">
                                                    <button className="flex align-items-center justify-content-between p-2 px-4 border-round-5xl border-transparent text-white w-full dashboardButton shadow-2 hover:shadow-4 transition-duration-300 cursor-pointer">
                                                        <span className="flex align-items-center gap-2">View All</span>
                                                        <span className="flex flex-row gap-2">
                                                            {dashes.map((dash, index) => (
                                                                <span key={index}>{dash}</span>
                                                            ))}
                                                        </span>
                                                        <span className="ml-3 flex align-items-center justify-content-center w-2rem h-2rem bg-white text-primary-main border-circle shadow-2">
                                                            <i className="pi pi-arrow-right"></i>
                                                        </span>
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    {/* Bottom 5 Suppliers */}
                                    {isLoading ? (
                                        <SupplierPerformanceSkeleton />
                                    ) : (
                                        <div className="col-12 px-2 p-0 py-2 ">
                                            <div className="p-4 border-round-xl shadow-2 surface-card ">
                                                <h3 className="text-900 font-bold mb-0">Bottom 5 Suppliers</h3>
                                                <div className="">
                                                    <DataTable
                                                        className="mb-3 mt-3"
                                                        value={bottomSupplierData}
                                                        paginator={false} // Enable pagination
                                                        rows={limit} // Items per page
                                                        totalRecords={totalRecords} // Total records from API response
                                                        responsiveLayout="scroll" // Makes the table responsive
                                                        showGridlines={false} // Optional: Adds gridlines for better readability
                                                        style={{ fontSize: '12px' }}
                                                    >
                                                        <Column
                                                            header="Sr.No."
                                                            body={(data: any, options: any) => {
                                                                const normalizedRowIndex = options.rowIndex % limit;
                                                                const srNo = (page - 1) * limit + normalizedRowIndex + 1;
                                                                return <span>{srNo}</span>;
                                                            }}
                                                            style={{ minWidth: '60px', maxWidth: '60px' }}
                                                        />
                                                        <Column header="Name" field="supplier.supplierName" style={{ minWidth: '100px', maxWidth: '100px' }} />
                                                        <Column header="Region" field="supplier.location" style={{ minWidth: '60px', maxWidth: '60px' }} />
                                                        <Column
                                                            header="Score"
                                                            field="Score"
                                                            style={{ minWidth: '40px', maxWidth: '40px' }}
                                                            body={(rowData) => {
                                                                const roundedScore = Math.round(rowData.Score);
                                                                return (
                                                                    <span className="font-bold" style={{ color: getScoreColor(roundedScore) }}>
                                                                        {roundedScore}%
                                                                    </span>
                                                                );
                                                            }}
                                                            className="text-center"
                                                        />
                                                    </DataTable>
                                                </div>
                                                <Link href="/manage-suppliers">
                                                    <button className="flex align-items-center justify-content-between p-2 px-4 border-round-5xl border-transparent text-white w-full dashboardButton shadow-2 hover:shadow-4 transition-duration-300 cursor-pointer">
                                                        <span className="flex align-items-center gap-2">View All</span>
                                                        <span className="flex flex-row gap-2">
                                                            {dashes.map((dash, index) => (
                                                                <span key={index}>{dash}</span>
                                                            ))}
                                                        </span>
                                                        <span className="ml-3 flex align-items-center justify-content-center w-2rem h-2rem bg-white text-primary-main border-circle shadow-2">
                                                            <i className="pi pi-arrow-right"></i>
                                                        </span>
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    <div className="col-12 px-2 p-0 py-2  ">{isLoading ? <TotalAssessmentSkeleton /> : DonutGraph}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>{isLoading ? <HistoricalPerformanceSkeleton /> : WaveGraphs}</div>
            </>
        );
    };

    const DataTiles = dataTiles();

    return (
        <div className="p-1">
            {/* Navigation Bar */}
            <div>
                <div className="flex align-items-center justify-content-between">
                    <div className="inline-flex gap-2 p-2 border border-1 border-round-xl bg-white shadow-sm ">
                        <Button label="Dashboard" icon="pi pi-th-large" className={`p-button-text ${activeTab === 'dashboard' ? 'bgActiveBtn text-white' : 'bg-transparent text-gray-700'}`} onClick={() => setActiveTab('dashboard')} />
                        <Button label="Supplier" icon="pi pi-box" className={`p-button-text ${activeTab === 'supplier' ? 'bgActiveBtn text-white' : 'bg-transparent text-gray-700'}`} onClick={() => setActiveTab('supplier')} />
                        <Button label="Evaluated" icon="pi pi-box" className={`p-button-text ${activeTab === 'evaluated' ? 'bgActiveBtn text-white' : 'bg-transparent text-gray-700'}`} onClick={() => setActiveTab('supplier')} />
                        <Button label="Approved" icon="pi pi-box" className={`p-button-text ${activeTab === 'approved' ? 'bgActiveBtn text-white' : 'bg-transparent text-gray-700'}`} onClick={() => setActiveTab('supplier')} />
                        <Button label="Completed" icon="pi pi-box" className={`p-button-text ${activeTab === 'completed' ? 'bgActiveBtn text-white' : 'bg-transparent text-gray-700'}`} onClick={() => setActiveTab('supplier')} />
                    </div>
                    <div className={`${activeTab === 'supplier' ? ' opacity-0 invisible' : 'opacity-100 visible'}`}>
                        <Button label="Filters" icon="pi pi-filter" className={`p-button-text bgActiveBtn text-whitebg-transparent text-white `} onClick={() => setfiltersVisible(!filtersVisible)} />
                    </div>
                </div>
            </div>

            {/* Conditional Content */}
            <div className="mt-3">
                {activeTab === 'dashboard' ? (
                    <div>{DataTiles}</div>
                ) : (
                    <div>
                        <div className="mt-5">
                            <SupplierDirectory />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default withAuth(Dashboard, undefined, "view_dashboard");
