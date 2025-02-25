'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import Link from 'next/link';
import { CustomResponse } from '@/types';
import { GetCall } from '@/app/api-config/ApiKit';
import { buildQueryParams, getBackgroundColor } from '@/utils/utils';
import SupplierPerformanceSkeleton from '@/components/skeleton/SupplierPerformanceSkeleton';
import { useAppContext } from '@/layout/AppWrapper';

interface SupplierData {
    supplier: {
        supplierName: string;
        location: string;
    };
    Score: number;
}

interface SupplierPerformanceProps {
    limit?: number;
}

const SupplierPerformance = ({ limit = 5 }: SupplierPerformanceProps) => {
    const [topSuppliers, setTopSuppliers] = useState<SupplierData[]>([]);
    const [bottomSuppliers, setBottomSuppliers] = useState<SupplierData[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [page] = useState<number>(1);
    const { setAlert, setLoading, isLoading } = useAppContext();

    const dashes = Array(22).fill('-');

    useEffect(() => {
        fetchSupplierData();
    }, []);

    const fetchSupplierData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchSuppliers('desc'),
                fetchSuppliers('asc')
            ]);
        } catch (error) {
            setAlert('error', 'Failed to fetch supplier data');
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async (sortOrder: 'asc' | 'desc') => {
        const params = {
            limit: String(limit),
            page: String(page),
            sortBy: 'asc',
            sortOrder
        };

        const queryString = buildQueryParams(params);
        const response: CustomResponse = await GetCall(`/company/dashboard-data/supplier-performance?${queryString}`);

        if (response.code === 'SUCCESS') {
            if (sortOrder === 'desc') {
                setTopSuppliers(response.data);
            } else {
                setBottomSuppliers(response.data);
            }
            setTotalRecords(response.total || 0);
        }
    };


    const renderSupplierTable = (data: SupplierData[], title: string) => (
        <div className="col-12 px-2 p-0 py-2">
            <div className="p-4 border-round-xl shadow-2 surface-card">
                <h3 className="text-900 font-bold mb-0">{title}</h3>
                <div>
                    <DataTable
                        className="mb-3 mt-3"
                        value={data}
                        paginator={false}
                        rows={limit}
                        totalRecords={totalRecords}
                        style={{ fontSize: '12px' }}
                    >
                        <Column
                            header="Sr.No."
                            body={(_, options) => {
                                const normalizedRowIndex = options.rowIndex % limit;
                                return <span>{(page - 1) * limit + normalizedRowIndex + 1}</span>;
                            }}
                            style={{ minWidth: '50px', maxWidth: '50px' }}
                        />
                        <Column
                            header="Name"
                            field="supplier.supplierName"
                            style={{ minWidth: '100px', maxWidth: '100px' }}
                        />
                        <Column
                            header="Region"
                            field="supplier.location"
                            style={{ minWidth: '60px', maxWidth: '60px' }}
                        />
                        <Column
                            header="Score"
                            field="Score"
                            style={{ minWidth: '40px', maxWidth: '40px' }}
                            body={(rowData) => {
                                const roundedScore = Math.round(rowData.Score);
                                return (
                                    <span className="font-bold" style={{ color: getBackgroundColor(roundedScore) }}>
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
    );

    // if (isLoading) {
    //     return <SupplierPerformanceSkeleton />;
    // }

    return (
        <>
            {
                isLoading ? <SupplierPerformanceSkeleton /> :
                    <>
                        {renderSupplierTable(topSuppliers, 'Top 5 Suppliers')}
                        {renderSupplierTable(bottomSuppliers, 'Bottom 5 Suppliers')}
                    </>
            }
        </>
    );
};

export default SupplierPerformance;