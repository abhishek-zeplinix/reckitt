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
import { GetCall } from '../../api-config/ApiKit';
import { InputText } from 'primereact/inputtext';
const TaskManagement = () => {
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
            <div className="pt-4 px-4  border-round-xl shadow-2 surface-card mb-4 ">
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
                        <Dropdown value={selectedCity} onChange={(e) => setSelectedCity(e.value)} options={cities} optionLabel="name" placeholder="All Supplier" className="w-full md:w-14rem bgActiveBtn bgActiveBtnText px-2 py-1 " />
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

    const dataTiles = () => {
        return (
            <>
                <div>
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
                    <div className="grid p-0">
                        {/* Second Column */}
                        <div className="col-12 md:col-12 p-0 pr-3">
                            <div className="py-4">
                                <div className="grid gap-3 pr-2">
                                    {/* Top 5 Suppliers */}
                                    <div className="col-12 px-2 p-0 py-2 ">
                                        <div className="p-4 border-round-xl shadow-2 surface-card ">
                                            <div className="flex justify-content-between items-center">
                                                <div>
                                                    <h3 className="text-900 font-bold mb-0">Supplier Directory</h3>
                                                    <p>Loreum ipsum dummy text In Progress Assessment</p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div>
                                                        <Dropdown value={''} onChange={() => {}} optionLabel="subCategoryName" optionValue="subCategoryId" placeholder="Select Sub Category" className="w-full md:w-10rem" showClear />
                                                    </div>
                                                    <div>
                                                        <InputText value={''} onChange={() => {}} placeholder="Search" className="w-full md:w-10rem" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="">
                                                <CustomDataTable
                                                    className="mb-3 mt-3"
                                                    ref={dataTableRef}
                                                    page={page}
                                                    limit={limit} // no of items per page
                                                    totalRecords={totalRecords} // total records from api response
                                                    // isEdit={true} // show edit button
                                                    isDelete={true} // show delete button
                                                    data={topSupplierData.map((item: any) => ({}))}
                                                    columns={[]}
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
                                                </CustomDataTable>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };

    const DataTiles = dataTiles();

    return (
        <div className="p-1">
            <div className="mt-3">
                <div>{DataTiles}</div>
            </div>
        </div>
    );
};

export default TaskManagement;
