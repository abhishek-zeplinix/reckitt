/* eslint-disable @next/next/no-img-element */
'use client';
import { useParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Menu } from 'primereact/menu';
import { ChartData, ChartOptions } from 'chart.js';
import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Link from 'next/link';
import { useAppContext } from '@/layout/AppWrapper';
import { useAuth } from '@/layout/context/authContext';

const SupplierScoreboardSummoryPage = () => {
    const [selectedProcurementOrder, setSelectedProcurementOrder] = useState(null);
    const [products, setProducts] = useState([]);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [supplierData, setSupplierData] = useState<any>();
    const {isSuperAdmin} = useAuth();
    

    const params = useParams();

    const { supId, catId, subCatId } = params;

    useEffect(() => {

        const storedData = sessionStorage.getItem('supplier-data');
        if (storedData) {
            setSupplierData(JSON.parse(storedData))
        }


        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Check the initial screen size

        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const procurementOrder = [
        { label: '2024', value: 'raw-materials' },
        { label: '2023', value: 'packaging' },
        { label: '2022', value: 'machinery' },
        { label: '2021', value: 'services' }
    ];

    const printContent = () => {
        // Create a new jsPDF instance
        const doc = new jsPDF();

        // Grab the content you want to print
        const content = document.getElementById('content-to-print');

        if (content) {
            // Use jsPDF's HTML rendering method to capture the content and generate a PDF
            doc.html(content, {
                callback: () => {
                    // Save the PDF when ready
                    doc.save('document.pdf');
                },
                margin: [10, 10, 10, 10], // Optional margins
                x: 10, // X position
                y: 10 // Y position
            });
        }
    };
    const lineData: ChartData = {
        labels: ['Q1 2025', 'Q2 h1 / 2024', 'Q3 2024', 'Q4 h2 / 2024'], // Same labels for all datasets
        datasets: [
            // First Dataset
            {
                label: 'Procurement',
                data: [65, 59, 80, 81, 56, 55, 40], // Data for the first line
                fill: false,
                backgroundColor: '#2196F3',
                borderColor: '#2196F3',
                tension: 0.01
            },
            // Second Dataset
            {
                label: ' Sustainability',
                data: [28, 48, 40, 19, 86, 27, 90], // Data for the second line
                fill: false,
                backgroundColor: '#F44336',
                borderColor: '#F44336',
                tension: 0.01
            },
            // Third Dataset (new data)
            {
                label: ' Planning',
                data: [45, 30, 72, 54, 65, 80, 60], // Data for the third line
                fill: false,
                backgroundColor: '#FFA600', // Change color for differentiation
                borderColor: '#FFA600',
                tension: 0.01
            },
            // Fourth Dataset (new data)
            {
                label: ' Quality',
                data: [12, 58, 95, 70, 44, 60, 20], // Data for the fourth line
                fill: false,
                backgroundColor: '#4CAF50', // Change color for differentiation
                borderColor: '#4CAF50',
                tension: 0.01
            },
            {
                label: 'Development',
                data: [12, 58, 95, 70, 44, 60, 20], // Data for the fourth line
                fill: false,
                backgroundColor: '#DF177C', // Change color for differentiation
                borderColor: '#DF177C',
                tension: 0.01
            }
        ]
    };

    const data = {
        labels: ['Q1 2025', 'Q2 h1 / 2024', 'Q3 2024', 'Q4 h2 / 2024'], // Labels for the x-axis
        datasets: [
            {
                label: 'First Dataset',
                data: [65, 59, 80, 81], // Use `null` to create gaps
                fill: false,
                backgroundColor: '#DF177C',
                borderColor: '#DF177C',
                borderWidth: 1,
                tension: 0.01
            }
        ]
    };

    const options = {
        responsive: true,

        plugins: {
            legend: {
                position: 'none' // Position legend on the left side
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    display: false // Hide gridlines if not required
                },
                ticks: {
                    autoSkip: true // Automatically skips labels if needed
                },
                categoryPercentage: 1.0, // Bars will cover full space
                barPercentage: 0.8 // Control the width of the bars
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 25, // Set custom step size for ticks (0, 25, 50, 75, 100)
                    max: 100, // Maximum value of y-axis
                    min: 0 // Minimum value of y-axis
                }
            }
        }
        // Adding a custom label before the graph (left side)
    };
    const baroptions = {
        responsive: true,

        plugins: {
            legend: {
                position: 'bottom' // Position legend on the left side
            },
            labels: {
                boxWidth: 20, // Set the width of the legend box
                boxHeight: 20, // Set the height of the legend box
                padding: 10 // Adjust the padding between the box and the text
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    display: false // Hide gridlines if not required
                },
                ticks: {
                    autoSkip: true // Automatically skips labels if needed
                },
                categoryPercentage: 1.0, // Bars will cover full space
                barPercentage: 0.8 // Control the width of the bars
            },
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 25, // Set custom step size for ticks (0, 25, 50, 75, 100)
                    max: 100, // Maximum value of y-axis
                    min: 0 // Minimum value of y-axis
                }
            }
        }
        // Adding a custom label before the graph (left side)
    };
    const leftPanelData = [
        { label: 'Category :', value: 'Raw & Pack' },
        { label: 'Sub-Category :', value: 'Raw Material Supplier' },
        { label: 'Supplier Name :', value: 'Bio-Health Products' },
        { label: 'Supplier Id :', value: '006' },
        { label: 'Supplier Manufacturing Name :', value: 'BioHealth Manufacturing' }
    ];
    const RightPanelData = [
        { label: 'Warehouse Location :', value: '64 Storage St, Capital City, ST 99000' },
        { label: 'Assessment Pending :', value: 'Texas' },
        { label: 'On Boarding Date :', value: 'Active' },
        { label: 'Supplier Tier :', value: 'No Tier' },
        { label: 'Supplier Tier :', value: 'No Tier' }
    ];
    const summoryCards = () => {
        return (
            <>
                <div className="flex justify-content-between align-items-start flex-wrap gap-4">
                    <div
                        className="card shadow-lg  "
                        style={{
                            flexBasis: '48%',
                            minWidth: '48%',
                            width: isSmallScreen ? '100%' : '100%',
                            flexGrow: 1,
                            height: isSmallScreen ? 'auto' : '266px',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '1rem'
                        }}
                    >
                        <ul className="list-none p-0 m-0" style={{ flexGrow: 1, padding: '0' }}>
                            {leftPanelData.map((item, index) => (
                                <>
                                    <li key={index} className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-2" style={{ flex: '1' }}>
                                        <div>
                                            <div className="mt-1 text-600" style={{ fontSize: '0.9rem' }}>
                                                {item.label}
                                            </div>
                                        </div>
                                        <div className="mt-2 md:mt-0 flex align-items-center" style={{ fontSize: '0.9rem' }}>
                                            <span className="text-900 font-medium mr-2 mb-1 md:mb-0">{item.value}</span>
                                        </div>
                                    </li>
                                    {index < leftPanelData.length - 1 && <hr style={{ borderColor: '#CBD5E1', borderWidth: '0.1px', opacity: '0.4' }} />}
                                </>
                            ))}
                        </ul>
                    </div>

                    <div
                        className="card shadow-lg  "
                        style={{
                            flexBasis: '48%',
                            minWidth: '48%',
                            width: isSmallScreen ? '100%' : '100%',
                            flexGrow: 1,
                            height: isSmallScreen ? 'auto' : '266px',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '1rem'
                        }}
                    >
                        <ul className="list-none p-0 m-0" style={{ flexGrow: 1, padding: '0' }}>
                            {RightPanelData.map((item, index) => (
                                <>
                                    <li key={index} className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-2" style={{ flex: '1' }}>
                                        <div>
                                            <div className="mt-1 text-600" style={{ fontSize: '0.9rem' }}>
                                                {item.label}
                                            </div>
                                        </div>
                                        <div className="mt-2 md:mt-0 flex align-items-center" style={{ fontSize: '0.9rem' }}>
                                            <span className="text-900 font-medium mr-2 mb-1 md:mb-0">{item.value}</span>
                                        </div>
                                    </li>
                                    {index < RightPanelData.length - 1 && <hr style={{ borderColor: '#CBD5E1', borderWidth: '0.1px', opacity: '0.4' }} />}
                                </>
                            ))}
                        </ul>
                    </div>
                </div>
            </>
        );
    };
    const renderSummoryInfo = summoryCards();



    const headerComp = () => {
        return (
            <div className="flex justify-content-between ">
                <div className="flex justify-content-start">
                    <Dropdown id="role" value={selectedProcurementOrder} options={procurementOrder} onChange={(e) => setSelectedProcurementOrder(e.value)} placeholder="Select Year" className="w-full" />
                </div>

                {isSuperAdmin() && (
                    <div className="flex-1 ml-5">
                        <Link href={`/supplier-scoreboard-summary/${supId}/${catId}/${subCatId}/supplier-rating`}>
                            <Button label="Add Inputs" outlined className='!font-light text-color-secondary'/>
                        </Link>
                    </div>
                )}

                <div className="flex justify-content-end">
                    <Button icon="pi pi-upload" size="small" label="Export" aria-label="Add Supplier" className="default-button " style={{ marginLeft: 10 }} />
                    <Button icon="pi pi-print" size="small" label="Print" aria-label="Import Supplier" className="bg-pink-500 border-pink-500 " style={{ marginLeft: 10 }} onClick={() => window.print()} />
                </div>
            </div>
        );
    };
    const renderHeader = headerComp();
    // Adjusted product data
    const intitialTable = [
        {
            id: 1,
            name: 'Sustainability',
            status1: '20%',
            status2: '67%'
        },
        {
            id: 2,
            name: 'Procurement',
            status1: '60%',
            status2: '70%'
        }
    ];
    const middleTable = [
        {
            id: 1,
            name: 'Sustainability',
            status1: '77%',
            status2: '67%'
        },
        {
            id: 2,
            name: 'Procurement',
            status1: '60%',
            status2: '70%'
        },
        {
            id: 3,
            name: 'Quality',
            status1: '20%',
            status2: '70%'
        }
    ];
    const lastTable = [
        {
            id: 1,
            name: 'Q1 2024',
            status1: '90%',
            remark: 'Good',
            action: 'Feedback to the supplier with encouragements to continue'
        },
        {
            id: 2,
            name: 'Q2/H1 2024',
            status1: '60%',
            remark: 'Improvement Needed',
            action: 'Meeting with departments to set up corrective actions - Feedback to the suppliers afterwards	'
        },
        {
            id: 3,
            name: 'Q3 2024',
            status1: '60%',
            remark: 'Good',
            action: 'Feedback to the supplier with encouragements to continue'
        },
        {
            id: 4,
            name: 'Q4/H2 2024',
            status1: '20%',
            remark: 'Good',
            action: 'Feedback to the supplier with encouragements to continue'
        }
    ];

    // Body template for rendering status with severity
    const statusBodyTemplate = (product: any, statusKey: 'status1' | 'status2') => {
        const status = product[statusKey];
        return (
            <Tag
                value={status}
                style={{
                    backgroundColor: getSeverity(status),
                    color: '#fff',
                    width: '80px'
                }}
            />
        );
    };
    const statusBodyTemplatesecond = (product: any, statusKey: 'status1' | 'status2') => {
        const status = product[statusKey];
        return (
            <>
                <Tag
                    value={status}
                    style={{
                        backgroundColor: getSeverity(status),
                        color: '#fff',
                        width: '80px'
                    }}
                />
            </>
        );
    };

    const getSeverity = (status: string) => {
        const percentage = parseInt(status.replace('%', ''), 10);

        if (percentage >= 90) {
            return '#48BB78'; // Green
        } else if (percentage >= 70 && percentage < 90) {
            return '#EC934B'; // Orange
        } else if (percentage >= 50 && percentage < 70) {
            return '#ECC94B'; // Yellow
        } else if (percentage < 50) {
            return '#F56565'; // Red
        }

        return undefined; // Return undefined if no match
    };

    // Table component
    const initialTableSummory = () => {
        return (
            <div className="card custom-box-shadow" style={{ padding: '0px' }}>
                <DataTable value={intitialTable} tableStyle={{ minWidth: '60rem' }}>
                    <Column className="text-pink-500 font-bold" field="name" style={{ width: '20%' }}></Column>
                    <Column style={{ width: '20%' }}></Column>
                    <Column header="H1 2024" body={(product) => statusBodyTemplate(product, 'status1')} style={{ width: '20%' }}></Column>
                    <Column> </Column>
                    <Column header="H2 2024" body={(product) => statusBodyTemplatesecond(product, 'status2')} style={{ width: '20%' }}></Column>
                </DataTable>
            </div>
        );
    };

    const renderInitialTableSummory = initialTableSummory();

    const middleTableSummory = () => {
        return (
            <div className="card custom-box-shadow" style={{ padding: '0px' }}>
                <DataTable value={middleTable} tableStyle={{ minWidth: '60rem' }}>
                    <Column className="text-pink-500 font-bold" field="name" style={{ width: '20%' }}></Column>
                    <Column header="Q1 2024" body={(product) => statusBodyTemplate(product, 'status1')} style={{ width: '20%' }}></Column>
                    <Column header="Q2 2024" body={(product) => statusBodyTemplate(product, 'status1')} style={{ width: '20%' }}></Column>
                    <Column header="Q3 2024" body={(product) => statusBodyTemplatesecond(product, 'status2')} style={{ width: '20%' }}></Column>
                    <Column header="Q4 2024" body={(product) => statusBodyTemplatesecond(product, 'status2')} style={{ width: '20%' }}></Column>
                </DataTable>
            </div>
        );
    };

    const rendermiddleTableSummory = middleTableSummory();

    const lastTableSummory = () => {
        return (
            <div className="card custom-box-shadow" style={{ padding: '0px' }}>
                <DataTable value={lastTable} tableStyle={{ minWidth: '60rem' }}>
                    <Column className=" font-bold" field="name" header="Quarter" style={{ width: '20%' }}></Column>
                    <Column header="Rating" body={(product) => statusBodyTemplate(product, 'status1')} style={{ width: '20%' }}></Column>
                    <Column header="Remark" field="remark" style={{ width: '200px' }}></Column>
                    <Column header="Action Needed" field="action" style={{ width: '250px' }}></Column>
                </DataTable>
            </div>
        );
    };

    const renderlastTableSummory = lastTableSummory();

    const dataPanel = () => {
        return (
            <>
                <div className="card">
                    <div>{renderHeader}</div>
                    <div className="mt-5">{renderInitialTableSummory}</div>
                    <div className="mt-5">{rendermiddleTableSummory}</div>
                    <div className="mt-5">{renderlastTableSummory}</div>
                </div>
            </>
        );
    };

    const renderDataPanel = dataPanel();

    const GraphsPanel = () => {
        return (
            <>
                <div className="flex justify-content-between align-items-start flex-wrap gap-4">
                    <div className="card shadow-lg" style={{ flexBasis: '48%', minWidth: '48%', width: '100%', flexGrow: 1, height: '470px', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                        <h4 className="mt-2 mb-6">Overall Performance per Quarter</h4>
                        <Chart type="bar" data={data} options={options} />
                        <h6 className="text-center">Quarters</h6>
                    </div>

                    <div className="card shadow-lg" style={{ flexBasis: '48%', minWidth: '48%', width: '100%', flexGrow: 1, height: '470px', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                        <h4 className="mt-2 mb-6">Overall Performance per Function</h4>
                        <Chart type="bar" data={lineData} options={baroptions} />
                        <h6 className="text-center">Quarters</h6>
                    </div>
                </div>
            </>
        );
    };

    const renderGraphsPanel = GraphsPanel();

    return (
        <div className="grid" id="content-to-print">
            <div className="col-12">
                <div>{renderSummoryInfo}</div>
            </div>
            <div className="col-12">
                <div>{renderDataPanel}</div>
            </div>
            <div className="col-12">
                <div>{renderGraphsPanel}</div>
            </div>
        </div>
    );
};

export default SupplierScoreboardSummoryPage;
