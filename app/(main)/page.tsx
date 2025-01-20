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
const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [filtersVisible, setfiltersVisible] = useState(true);
    const [position, setPosition] = useState('center');
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);
    const [selectedCity, setSelectedCity] = useState(null);
    const { isLoading, setLoading, setScroll, setAlert } = useAppContext();
    const [tilesData, setTilesData] = useState<Tile[]>([]);
    const [topSupplierData, setTopSupplierData] = useState([]);
    const [bottomSupplierData, setBottomSupplierData] = useState([]);

    useEffect(() => {
        fetchData();
        fetchTopData();
        fetchBottomData();
    }, []);
    const fetchData = async (params?: any) => {
        if (!params) {
            params = { limit: limit, page: page };
        }
        setLoading(true);
        const queryString = buildQueryParams(params);
        const response: CustomResponse = await GetCall(`/company/dashboard-data?${queryString}`);
        setLoading(false);

        if (response.code === 'SUCCESS') {
            const apiData = response.data.evasupa;
            const mappedData = mapApiDataToTiles(apiData); // Use the mapping function
            setTilesData(mappedData);

            setTilesData(mappedData);

            if (response.total) {
                setTotalRecords(response?.total);
            }
        } else {
            setTilesData([]);
        }
    };
    const fetchTopData = async (params?: any) => {
        if (!params) {
            params = { limit: '5', page: page, sortBy: 'asc', sortOrder: 'desc' };
        }
        setLoading(true);
        const queryString = buildQueryParams(params);

        const response: CustomResponse = await GetCall(`/company/dashboard-data/supplier-performance?${queryString}`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setTopSupplierData(response.data);

            if (response.total) {
                setTotalRecords(response?.total);
            }
        } else {
            setTopSupplierData([]);
        }
    };
    const fetchBottomData = async (params?: any) => {
        if (!params) {
            params = { limit: '5', page: page, sortBy: 'asc', sortOrder: 'asc' };
        }
        setLoading(true);
        const queryString = buildQueryParams(params);
        const response: CustomResponse = await GetCall(`/company/dashboard-data/supplier-performance?${queryString}`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setBottomSupplierData(response.data);
            console.log(response.data, '83');

            if (response.total) {
                setTotalRecords(response?.total);
            }
        } else {
            setBottomSupplierData([]);
        }
    };

    const mapApiDataToTiles = (apiData: any): Tile[] => [
        {
            title: 'Total Evaluators',
            value: apiData.evaluatorCount || 0,
            change: `+ ${apiData.evaluatorCount}`,
            changeClass: 'text-green-600'
        },
        {
            title: 'Total Suppliers',
            value: apiData.supplierCount || 0,
            change: `+ ${apiData.supplierCount}`,
            changeClass: 'text-green-600',
            link: '/manage-supplier'
        },
        {
            title: 'Total Approver',
            value: apiData.approverCount || 0,
            change: `+ ${apiData.approverCount}`,
            changeClass: 'text-green-600'
        },
        {
            title: 'Total Assessment Expected',
            value: 0, // Placeholder or calculate dynamically
            change: `+ 0`,
            changeClass: 'text-red-600'
        }
    ];

    const secondData = [
        {
            title: 'Completed Assessment',
            value: 0,
            change: `+ 0`,
            changeClass: 'text-green-500'
        },
        {
            title: 'In Progress Assessment',
            value: 0,
            change: `+ 0`,
            changeClass: 'text-red-500'
        }
    ];
    const thirdData = [
        {
            title: 'Pending Assessment',
            value: 0,
            change: `+ 0`,
            changeClass: 'text-green-500'
        }
    ];
    const fourthData = [
        {
            title: 'Task Management',
            value: 'Click here to view tasks',
            change: `+ 0`,
            changeClass: 'text-green-500',
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

    const TopSuppliers = [
        { id: 1, name: 'Ramesh Kumar', region: 'Delhi', score: '95%' },
        { id: 2, name: 'Amit Sharma', region: 'Mumbai', score: '85%' },
        { id: 3, name: 'Suresh Gupta', region: 'Bangalore', score: '75%' },
        { id: 4, name: 'Rajesh Verma', region: 'Chennai', score: '72%' },
        { id: 5, name: 'Priya Patel', region: 'Kolkata', score: '70%' }
    ];
    const BottomSupplier = [
        { id: 6, name: 'Vikas Reddy', region: 'Hyderabad', score: '50%' },
        { id: 7, name: 'Anil Joshi', region: 'Pune', score: '45%' },
        { id: 8, name: 'Sunita Mehta', region: 'Ahmedabad', score: '35%' },
        { id: 9, name: 'Vijay Singh', region: 'Surat', score: '25%' },
        { id: 10, name: 'Neelam Sharma', region: 'Lucknow', score: '15%' }
    ];

    const dashes = Array(22).fill('-');

    const data = {
        labels: ['Pending ', 'In-progress', 'Completed '],
        datasets: [
            {
                data: [50, 80, 54], // Values for the donut chart
                backgroundColor: ['#FFE434', '#3A60F8', '#78C47B'], // Corresponding colors
                hoverBackgroundColor: ['#FFE434', '#3A60F8', '#78C47B']
            }
        ]
    };

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
            return 'blue';
        } else if (scoreValue >= 70) {
            return 'green';
        } else if (scoreValue >= 50) {
            return 'orange';
        } else {
            return 'red';
        }
    };
    const donutGraph = () => {
        return (
            <div className="surface-0 p-4 border-round shadow-2">
                <h3 className="text-left mb-2">Total Assessment Summary</h3>
                <p className="text-left text-sm mb-4">Lorem ipsum dummy text In Progress Assessment Lorem ipsum</p>

                <div className="grid align-items-center">
                    {/* Donut Chart Section */}
                    <div className="col-7 flex justify-content-center">
                        <div className="relative">
                            <Chart type="doughnut" data={data} options={options} />
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
                                184
                                <p className="text-sm m-0">Total</p>
                            </div>
                        </div>
                    </div>

                    {/* Legend Section */}
                    <div className="col-5">
                        <div className=" justify-content-center score-bg ">
                            <div style={{ height: '130px', width: '100%' }} className="flex flex-column gap-3 p-5 border-round-2xl">
                                <div className="flex align-items-center gap-2">
                                    <div className="border-round" style={{ width: '25px', height: '25px', background: '#FFE434' }}></div>
                                    <span className="ml-2 text-md">
                                        Pending <br /> Assessment
                                    </span>
                                </div>
                                <div className="flex align-items-center gap-2">
                                    <div className="border-round" style={{ width: '25px', height: '25px', background: '#3A60F8' }}></div>
                                    <span className="ml-2 text-md">
                                        In Progress <br /> Assessment
                                    </span>
                                </div>
                                <div className="flex align-items-center gap-2">
                                    <div className="border-round" style={{ width: '25px', height: '25px', background: '#78C47B' }}></div>
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
                backgroundColor: '#3A60F8',
                data: [20, 25, 30, 35],
                borderRadius: 20
            },
            {
                label: 'Good',
                backgroundColor: '#78C47B',
                data: [25, 20, 25, 20],
                borderRadius: 20
            },
            {
                label: 'Improvement Needed',
                backgroundColor: '#FFE434',
                data: [30, 30, 25, 25],
                borderRadius: 20
            },
            {
                label: 'Critical',
                backgroundColor: '#FD837A',
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
                            <span className="w-2rem h-2rem graphColorRed  border-round-md mr-2"></span>
                            <span className="text-sm">Critical</span>
                        </div>
                        <div className="flex align-items-center mr-4 lg:w-1/2 w-full mb-2">
                            <span className="w-2rem h-2rem graphColorGreen border-round-md mr-2"></span>
                            <span className="text-sm">Improvement Needed</span>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="flex align-items-center mr-4 lg:w-1/2 w-full mb-2">
                            <span className="w-2rem h-2rem graphColorYelloow  border-round-md mr-2"></span>
                            <span className="text-sm">Good</span>
                        </div>
                        <div className="flex align-items-center lg:w-1/2 w-full mb-2">
                            <span className="w-2rem h-2rem graphColorBlue border-round-md mr-2"></span>
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
                            <span className="w-2rem h-2rem graphColorRed  border-round-md  mr-2 "></span>
                            <span className="text-sm">NA</span>
                        </div>
                        <div className="flex align-items-center mr-4 border-right-1 pr-3 w-full mb-2 border-gray-400">
                            <span className="w-2rem h-2rem graphColorGreen border-round-md  mr-2 "></span>
                            <span className="text-sm">Tier 3</span>
                        </div>
                        <div className="flex align-items-center mr-4 border-right-1 pr-3 w-full mb-2 border-gray-400">
                            <span className="w-2rem h-2rem graphColorYelloow  border-round-md  mr-2 "></span>
                            <span className="text-sm">Tier 2</span>
                        </div>
                        <div className="flex align-items-center  w-full mb-2 border-gray-400">
                            <span className="w-2rem h-2rem graphColorBlue border-round-md  mr-2 "></span>
                            <span className="text-sm">Tier 1</span>
                        </div>
                    </div>
                </div>
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
                data: [80, 85, 90, 95, 88, 92],
                borderColor: '#007ad9',
                backgroundColor: 'rgba(0, 122, 217, 0.2)',
                fill: false,
                tension: 0.4
            },
            {
                label: 'Development',
                data: [60, 65, 70, 75, 68, 72],
                borderColor: '#f0c808',
                backgroundColor: 'rgba(240, 200, 8, 0.2)',
                fill: false,
                tension: 0.4
            },
            {
                label: 'Procurement',
                data: [50, 55, 45, 60, 58, 62],
                borderColor: '#00a652',
                backgroundColor: 'rgba(0, 166, 82, 0.2)',
                fill: false,
                tension: 0.4
            },
            {
                label: 'Planning',
                data: [30, 35, 25, 40, 38, 42],
                borderColor: '#d63031',
                backgroundColor: 'rgba(214, 48, 49, 0.2)',
                fill: false,
                tension: 0.4
            },
            {
                label: 'Quality',
                data: [20, 25, 15, 30, 28, 32],
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.2)',
                fill: false,
                tension: 0.4
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
                                <span className="w-2rem h-2rem graphColorRed  border-round-md  mr-2 "></span>
                                <span className="text-sm"> Critical (0-50)</span>
                            </div>
                            <div className="flex align-items-center mr-4 border-right-1 pr-12 w-full mb-2 border-gray-400">
                                <span className="w-2rem h-2rem graphColorGreen border-round-md  mr-2 "></span>
                                <span className="text-sm"> Improvement Needed (51-70)</span>
                            </div>
                            <div className="flex align-items-center mr-4 border-right-1 pr-12 w-full mb-2 border-gray-400">
                                <span className="w-2rem h-2rem graphColorYelloow  border-round-md  mr-2 "></span>
                                <span className="text-sm">Good (71-90)</span>
                            </div>
                            <div className="flex align-items-center  w-full mb-2 border-gray-400">
                                <span className="w-2rem h-2rem graphColorBlue border-round-md  mr-2 "></span>
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
                    <div className="py-1 ">
                        <div className="grid grid-nogutter">
                            {tilesData.map((tile, index) => (
                                <div
                                    key={index}
                                    className="col-12 sm:col-6 lg:col-3 pr-3" // Ensures 4 tiles in a row on non-mobile devices
                                >
                                    <Link href={tile.link || ''}>
                                        <div className="p-3 border-1 border-pink-400 border-round-2xl shadow-2 surface-card hover:shadow-3 transition-duration-200">
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
                                                    <i className="pi pi-angle-right text-pink-400"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid p-0">
                        {/* First Column */}
                        <div className="col-12 md:col-6">
                            <div className="pt-3">
                                <div className="grid grid-nogutter">
                                    {secondData.map((tile, index) => (
                                        <div key={index} className="col-12 md:col-4 lg:col-6 pr-3">
                                            <div className="p-3 border-1 border-pink-400 border-round-2xl shadow-1 surface-card hover:shadow-3 transition-duration-200">
                                                <div className="flex justify-content-between gap-2 align-items-center">
                                                    <div>
                                                        <h3 className="text-500 text-sm mb-0">{tile.title}</h3>
                                                        <div className="mt-2">
                                                            <h2 className="text-900 text-xl font-bold mb-1">{tile.value}</h2>
                                                            <span className={`text-sm font-semibold ${tile.changeClass}`}>{tile.change}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <i className="pi pi-angle-right text-pink-400"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="py-3">
                                    <div className="grid grid-nogutter">
                                        {thirdData.map((tile, index) => (
                                            <div key={index} className="col-12 md:col-4 lg:col-6 pr-3">
                                                <div className="p-3 border-1 border-pink-400 border-round-2xl shadow-1 surface-card hover:shadow-3 transition-duration-200">
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
                                                            <i className="pi pi-angle-right text-pink-400"></i>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="pr-3 ">{BarGraphSupplierTiers}</div>
                                <div className="pr-3 ">{BarGraph}</div>
                            </div>
                        </div>

                        {/* Second Column */}
                        <div className="col-12 md:col-6 p-0 pr-3">
                            <div className="py-3">
                                <div className="grid gap-3 pr-2">
                                    {/* Top 5 Suppliers */}
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
                                                    <span className="ml-3 flex align-items-center justify-content-center w-2rem h-2rem bg-white text-pink-500 border-circle shadow-2">
                                                        <i className="pi pi-arrow-right"></i>
                                                    </span>
                                                </button>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Bottom 5 Suppliers */}
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
                                                    <span className="ml-3 flex align-items-center justify-content-center w-2rem h-2rem bg-white text-pink-500 border-circle shadow-2">
                                                        <i className="pi pi-arrow-right"></i>
                                                    </span>
                                                </button>
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="col-12 px-2 p-0 py-2  ">{DonutGraph}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div>{WaveGraphs}</div>
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

export default Dashboard;
