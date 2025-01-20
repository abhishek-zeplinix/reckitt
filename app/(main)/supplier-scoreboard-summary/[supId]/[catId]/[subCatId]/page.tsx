'use client';
import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { buildQueryParams } from '@/utils/utils';
import { useAppContext } from '@/layout/AppWrapper';
import { useParams } from 'next/navigation';
import { GetCall } from '@/app/api-config/ApiKit';
import { CustomResponse, Department, SupplierScoreboardSummary } from '@/types';
import useFetchDepartments from '@/hooks/useFetchDepartments';
import { Dropdown } from 'primereact/dropdown';
import Link from 'next/link';
import { Button } from 'primereact/button';

const SupplierScoreboardTables = () => {
    const [halfYearlyData, setHalfYearlyData] = useState([]);
    const [quarterlyData, setQuarterlyData] = useState([]);
    const [ratingsData, setRatingsData] = useState([]);
    const [supplierScore, setSupplierScore] = useState<any>([]);
    const [selectedYear, setSelectedYear] = useState<any>('2025');
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [supplierData, setSupplierData] = useState<any>();
    const { departments } = useFetchDepartments();
    const { setLoading, setAlert } = useAppContext();
    const params = useParams();
    const { supId, catId, subCatId } = params;

    useEffect(() => {
        fetchData();
        fetchSupplierData();
    }, [selectedYear]);

    //fetch indivisual supplier data
    const fetchSupplierData = async () => {
        try {
            const params = {
                filters: {
                    supplierCategoryId: catId,
                    procurementCategoryId: subCatId,
                    supId
                },
                pagination: false
            };

            const queryString = buildQueryParams(params);

            const response = await GetCall(`/company/supplier?${queryString}`);
            console.log('fetch indivisual supplier data', response.data[0]);

            setSupplierData(response.data[0]);
        } catch (error) {
            setAlert('error', 'Failed to fetch supplier data');
        }
    };

    const fetchData = async (params?: any) => {
        setLoading(false);

        try {
            if (!params) {
                params = { sortBy: 'supplierScoreId', sortOrder: 'asc/desc', filters: { date: selectedYear } };
            }
            setLoading(true);

            const queryString = buildQueryParams(params);

            const response: CustomResponse = await GetCall(`/company/supplier-score-summary/${supId}?${queryString}`);
            setLoading(false);

            if (response.code == 'SUCCESS') {
                setSupplierScore(response.data);
            } else {
                setSupplierScore([]);
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (supplierScore && departments) {
            processData();
        }
    }, [supplierScore, departments]);

    const processData = () => {
        // sort departments by orderBy
        const sortedDepartments = (departments as Department[]).sort((a, b) => a.orderBy - b.orderBy);

        // Separate half-yearly and quarterly departments
        const halfYearlyDepts = sortedDepartments.filter((dept) => dept.evolutionType === 'Halfyearly');
        const quarterlyDepts = sortedDepartments.filter((dept) => dept.evolutionType === 'Quarterly');

        // process half-yearly data
        const h1Data: any = {};
        const h2Data: any = {};

        halfYearlyDepts.forEach((dept) => {
            const h1Score = (supplierScore?.supScore as any[])?.find((score) => score.departmentId === dept.departmentId && score.evalutionPeriod === `Halfyearly-1-${selectedYear}`)?.totalScore || 0;

            const h2Score = (supplierScore?.supScore as any[])?.find((score) => score.departmentId === dept.departmentId && score.evalutionPeriod === `Halfyearly-2-${selectedYear}`)?.totalScore || 0;

            h1Data[dept.name.toLowerCase()] = h1Score;
            h2Data[dept.name.toLowerCase()] = h2Score;
        });

        const halfYearlyTableData: any = halfYearlyDepts.map((dept) => ({
            name: dept.name,
            status1: `${Math.round(h1Data[dept.name.toLowerCase()])}%`,
            status2: `${Math.round(h2Data[dept.name.toLowerCase()])}%`
        }));

        // process quarterly data
        const quarterlyTableData: any = quarterlyDepts.map((dept) => {
            const quarters = ['1', '2', '3', '4'];

            const scores = quarters.map((q) => {
                const score = (supplierScore?.supScore as any[])?.find((score) => score.departmentId === dept.departmentId && score.evalutionPeriod === `Quarterly-${q}-${selectedYear}`)?.totalScore || 0;
                return `${Math.round(score)}%`;
            });

            return {
                name: dept.name,
                q1: scores[0],
                q2: scores[1],
                q3: scores[2],
                q4: scores[3]
            };
        });

        // process ratings data

        //use this if any issue with current year in rating table

        // const yearRatings = supplierScore?.ratings?.filter(rating =>
        //     rating.period.includes(selectedYear)
        // ) || [];

        const ratingsTableData = supplierScore?.ratings?.map((rating: any) => ({
            name: rating.period,
            status1: `${rating.rating}%`,
            remark: rating.value,
            action: rating.action
        }));

        setHalfYearlyData(halfYearlyTableData);
        setQuarterlyData(quarterlyTableData);
        setRatingsData(ratingsTableData);
    };

    const formatDate = (timestamp: any) => {
        const date = new Date(timestamp);

        //YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];

        return formattedDate;
    };

    const statusBodyTemplate = (rowData: any, field: any) => {
        const status = rowData[field];
        const percentage = parseInt(status);

        let backgroundColor;
        if (percentage >= 90) {
            backgroundColor = '#48BB78';
        } else if (percentage >= 70) {
            backgroundColor = '#EC934B';
        } else if (percentage >= 50) {
            backgroundColor = '#ECC94B';
        } else {
            backgroundColor = '#F56565';
        }

        return (
            <Tag
                value={status}
                style={{
                    backgroundColor,
                    color: '#fff',
                    width: '80px',
                    textAlign: 'center'
                }}
            />
        );
    };

    const nameBodyTemplate = (rowData: any) => {
        return <span className="text-pink-500 font-bold">{rowData.name}</span>;
    };

    const years = [
        { label: '2025', value: '2025' },
        { label: '2024', value: '2024' },
        { label: '2023', value: '2023' },
        { label: '2022', value: '2022' }
    ];

    const safeSupplierData = supplierData || {}; // Ensure it's never undefined

    const leftPanelData = [
        { label: 'Category :', value: safeSupplierData.category?.categoryName ?? 'N/A' },
        { label: 'Sub-Category :', value: safeSupplierData.subCategories?.subCategoryName ?? 'N/A' },
        { label: 'Supplier Name :', value: safeSupplierData.supplierName ?? 'N/A' },
        { label: 'Supplier Id :', value: safeSupplierData.supId ?? 'N/A' },
        { label: 'Supplier Manufacturing Name :', value: safeSupplierData.supplierManufacturerName ?? 'N/A' }
    ];

    const rightPanelData = [
        { label: 'Warehouse Location :', value: supplierData?.warehouseLocation ?? 'N/A' },
        { label: 'Assessment Pending :', value: 'No Info' },
        { label: 'On Boarding Date :', value: supplierData?.createdAt ? formatDate(supplierData.createdAt) : 'N/A' },
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
                            {rightPanelData?.map((item, index) => (
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
                                    {index < rightPanelData.length - 1 && <hr style={{ borderColor: '#CBD5E1', borderWidth: '0.1px', opacity: '0.4' }} />}
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
                    <Dropdown id="role" value={selectedYear} options={years} onChange={(e) => setSelectedYear(e.value)} placeholder="Select Year" className="w-full" />
                </div>

                <div className="flex-1 ml-5">
                    <Link href={`/supplier-scoreboard-summary/${supId}/${catId}/${subCatId}/${selectedYear}/supplier-rating`}>
                        <Button label="Add Inputs" outlined className="!font-light text-color-secondary" />
                    </Link>
                </div>

                <div className="flex justify-content-end">
                    <Button icon="pi pi-upload" size="small" label="Export" aria-label="Add Supplier" className="default-button " style={{ marginLeft: 10 }} />
                    <Button icon="pi pi-print" size="small" label="Print" aria-label="Import Supplier" className="bg-pink-500 border-pink-500 hover:text-white" style={{ marginLeft: 10 }} onClick={() => window.print()} />
                </div>
            </div>
        );
    };
    const renderHeader = headerComp();

    const dataPanel = () => {
        return (
            <div className="card">
                <div className="mb-4">{renderHeader}</div>
                <div>
                    {/* Half-yearly Table */}
                    <div className="card custom-box-shadow p-0">
                        <DataTable value={halfYearlyData} tableStyle={{ minWidth: '60rem' }}>
                            <Column body={nameBodyTemplate} field="name" style={{ width: '20%' }} />
                            <Column style={{ width: '20%' }} />
                            <Column header={`H1 ${selectedYear}`} body={(rowData) => statusBodyTemplate(rowData, 'status1')} style={{ width: '20%' }} />
                            <Column style={{ width: '20%' }} />
                            <Column header={`H2 ${selectedYear}`} body={(rowData) => statusBodyTemplate(rowData, 'status2')} style={{ width: '20%' }} />
                        </DataTable>
                    </div>

                    {/* Quarterly Table */}
                    <div className="card custom-box-shadow p-0">
                        <DataTable value={quarterlyData} tableStyle={{ minWidth: '60rem' }}>
                            <Column body={nameBodyTemplate} field="name" style={{ width: '20%' }} />
                            <Column header={`Q1 ${selectedYear}`} body={(rowData) => statusBodyTemplate(rowData, 'q1')} style={{ width: '20%' }} />
                            <Column header={`Q2 ${selectedYear}`} body={(rowData) => statusBodyTemplate(rowData, 'q2')} style={{ width: '20%' }} />
                            <Column header={`Q3 ${selectedYear}`} body={(rowData) => statusBodyTemplate(rowData, 'q3')} style={{ width: '20%' }} />
                            <Column header={`Q4 ${selectedYear}`} body={(rowData) => statusBodyTemplate(rowData, 'q4')} style={{ width: '20%' }} />
                        </DataTable>
                    </div>

                    {/* Ratings Table */}
                    <div className="card custom-box-shadow p-0">
                        <DataTable value={ratingsData} tableStyle={{ minWidth: '60rem' }}>
                            <Column field="name" header="Quarter" className="font-bold" style={{ width: '20%' }} />
                            <Column header="Rating" body={(rowData) => statusBodyTemplate(rowData, 'status1')} style={{ width: '20%' }} />
                            <Column field="remark" header="Remark" style={{ width: '200px' }} />
                            <Column field="action" header="Action Needed" style={{ width: '250px' }} />
                        </DataTable>
                    </div>
                </div>
            </div>
        );
    };

    const renderDataPanel = dataPanel();

    // const GraphsPanel = () => {
    //     return (
    //         <>
    //             <div className="flex justify-content-between align-items-start flex-wrap gap-4">
    //                 <div className="card shadow-lg" style={{ flexBasis: '48%', minWidth: '48%', width: '100%', flexGrow: 1, height: '470px', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
    //                     <h4 className="mt-2 mb-6">Overall Performance per Quarter</h4>
    //                     <Chart type="bar" data={data} options={options} />
    //                     <h6 className="text-center">Quarters</h6>
    //                 </div>

    //                 <div className="card shadow-lg" style={{ flexBasis: '48%', minWidth: '48%', width: '100%', flexGrow: 1, height: '470px', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
    //                     <h4 className="mt-2 mb-6">Overall Performance per Function</h4>
    //                     <Chart type="bar" data={lineData} options={baroptions} />
    //                     <h6 className="text-center">Quarters</h6>
    //                 </div>
    //             </div>
    //         </>
    //     );
    // };

    // const renderGraphsPanel = GraphsPanel();

    return (
        <div className="grid" id="content-to-print">
            <div className="col-12">
                <div>{renderSummoryInfo}</div>
            </div>
            <div className="col-12">
                <div>{renderDataPanel}</div>
            </div>
            <div className="col-12">{/* <div>{renderGraphsPanel}</div> */}</div>
        </div>
    );
};

export default SupplierScoreboardTables;
