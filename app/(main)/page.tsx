'use client';

import { useRef, useState } from 'react';
import { Button } from 'primereact/button';
import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { getRowLimitWithScreenHeight } from '@/utils/utils';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import SupplierDirectory from '@/components/SupplierDirectory';
const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);
    const firstData = [
        {
            title: 'Total Evaluators',
            value: 167,
            change: '+36%',
            changeClass: 'text-green-600'
        },
        {
            title: 'Total Suppliers',
            value: 512,
            change: '+36%',
            changeClass: 'text-green-600'
        },
        {
            title: 'Total Approver',
            value: 324,
            change: '+36%',
            changeClass: 'text-green-600'
        },
        {
            title: 'Total Assessment Expected',
            value: 234,
            change: '-12%',
            changeClass: 'text-red-600'
        }
    ];
    const secondData = [
        {
            title: 'Completed Assessment',
            value: 76,
            change: '(+36%)',
            changeClass: 'text-green-500'
        },
        {
            title: 'In Progress Assessment',
            value: 45,
            change: '(-24%)',
            changeClass: 'text-red-500'
        }
    ];
    const thirdData = [
        {
            title: 'Pending Assessment',
            value: 11,
            change: '(+36%)',
            changeClass: 'text-green-500'
        }
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
    const dataTiles = () => {
        return (
            <>
                <div className="py-1">
                    <div className="grid grid-nogutter">
                        {firstData.map((tile, index) => (
                            <div
                                key={index}
                                className="col-12 sm:col-6 lg:col-3 pr-3" // Ensures 4 tiles in a row on non-mobile devices
                            >
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
                        </div>
                    </div>

                    {/* Second Column */}
                    <div className="col-12 md:col-6 p-0 pr-3">
                        <div className="py-4">
                            <div className="grid gap-3 pr-2">
                                {/* Top 5 Suppliers */}
                                <div className="col-12 px-2 p-0 py-2 ">
                                    <div className="p-4 border-round-xl shadow-1 surface-card">
                                        <h3 className="text-900 font-bold mb-0">Top 5 Suppliers</h3>
                                        <div className="">
                                            <DataTable
                                                className="mb-3 mt-3"
                                                value={TopSuppliers}
                                                paginator={false} // Enable pagination
                                                rows={limit} // Items per page
                                                totalRecords={totalRecords} // Total records from API response
                                                responsiveLayout="scroll" // Makes the table responsive
                                                showGridlines={false} // Optional: Adds gridlines for better readability
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
                                                <Column header="Name" field="name" style={{ minWidth: '100px', maxWidth: '100px' }} />
                                                <Column header="Region" field="region" style={{ minWidth: '60px', maxWidth: '60px' }} />
                                                <Column
                                                    header="Score"
                                                    field="score"
                                                    style={{ minWidth: '40px', maxWidth: '40px' }}
                                                    body={(rowData) => (
                                                        <span className="font-bold" style={{ color: getScoreColor(rowData.score) }}>
                                                            {rowData.score}
                                                        </span>
                                                    )}
                                                />
                                            </DataTable>
                                        </div>
                                        <button
                                            onClick={() => {}}
                                            className="flex align-items-center justify-content-between p-2 px-4 border-round-5xl border-transparent text-white w-full dashboardButton shadow-2 hover:shadow-4 transition-duration-300"
                                        >
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
                                    </div>
                                </div>

                                {/* Bottom 5 Suppliers */}
                                <div className="col-12 px-2 p-0 py-2 ">
                                    <div className="p-4 border-round-xl shadow-1 surface-card">
                                        <h3 className="text-900 font-bold mb-0">Bottom 5 Suppliers</h3>
                                        <div className="">
                                            <DataTable
                                                className="mb-3 mt-3"
                                                value={BottomSupplier}
                                                paginator={false} // Enable pagination
                                                rows={limit} // Items per page
                                                totalRecords={totalRecords} // Total records from API response
                                                responsiveLayout="scroll" // Makes the table responsive
                                                showGridlines={false} // Optional: Adds gridlines for better readability
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
                                                <Column header="Name" field="name" style={{ minWidth: '100px', maxWidth: '100px' }} />
                                                <Column header="Region" field="region" style={{ minWidth: '60px', maxWidth: '60px' }} />
                                                <Column
                                                    header="Score"
                                                    field="score"
                                                    style={{ minWidth: '40px', maxWidth: '40px' }}
                                                    body={(rowData) => (
                                                        <span className="font-bold" style={{ color: getScoreColor(rowData.score) }}>
                                                            {rowData.score}
                                                        </span>
                                                    )}
                                                />
                                            </DataTable>
                                        </div>
                                        <button
                                            onClick={() => {}}
                                            className="flex align-items-center justify-content-between p-2 px-4 border-round-5xl border-transparent text-white w-full dashboardButton shadow-2 hover:shadow-4 transition-duration-300"
                                        >
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
            {/* Navigation Bar */}
            <div className="inline-flex gap-2 p-2 border border-1 border-round-xl bg-white shadow-sm ">
                <Button label="Dashboard" icon="pi pi-th-large" className={`p-button-text ${activeTab === 'dashboard' ? 'bg-gray-700 text-white' : 'bg-transparent text-gray-700'}`} onClick={() => setActiveTab('dashboard')} />
                <Button label="Supplier" icon="pi pi-box" className={`p-button-text ${activeTab === 'supplier' ? 'bg-gray-700 text-white' : 'bg-transparent text-gray-700'}`} onClick={() => setActiveTab('supplier')} />
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
