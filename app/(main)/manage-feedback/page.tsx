'use client';
import React, { useContext, useEffect, useRef, useState } from 'react';

import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { buildQueryParams, formatEvaluationPeriod, getRowLimitWithScreenHeight } from '@/utils/utils';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PutCall } from '@/app/api-config/ApiKit';
import { Rules } from '@/types';
import { Dropdown } from 'primereact/dropdown';
import Link from 'next/link';
import { encodeRouteParams } from '@/utils/base64';
import { Button } from 'primereact/button';
import { get } from 'lodash';
import TableSkeleton from '@/components/supplier-rating/skeleton/TableSkeleton';
import { useRouter } from 'next/navigation';
import TableSkeletonSimple from '@/components/supplier-rating/skeleton/TableSkeletonSimple';

const ManageFeedbackPage = () => {
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());

    const [action, setAction] = useState(null);
    const [feedback, setFeedback] = useState<Rules[]>([]);
    const [totalRecords, setTotalRecords] = useState();

    const { isLoading, setLoading, setAlert, user } = useAppContext();
    const router = useRouter();

    console.log(feedback);

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <span className="p-input-icon-left flex align-items-center">
                    <h3 className="mb-0">Manage Feedbacks</h3>
                </span>
            </div>
        );
    };

    const header = renderHeader();

    const fetchData = async (params?: any) => {
        try {
            setLoading(true);

            const supId = get(user, 'supplierId');

            if (!params) {
                params = { limit: limit, page: page, filters: { supId } };
            }
            const queryString = buildQueryParams(params);
            setPage(params.page);

            const response = await GetCall(`/company/supplier-score-checked-data?${queryString}`);

            if (response.code === 'SUCCESS') {
                setFeedback(response.data);
                setTotalRecords(response.total);
            } else {
                setFeedback([]);
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatDate = (timestamp: any) => {
        const date = new Date(timestamp);

        const formattedDate = date
            .toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            })
            .replace(',', '');

        return formattedDate;
    };

    const dataTableHeaderStyle = { fontSize: '12px' };

    const limitOptions = [
        { label: '10', value: 10 },
        { label: '20', value: 20 },
        { label: '50', value: 50 },
        { label: '70', value: 70 },
        { label: '100', value: 100 }
    ];

    const onLimitChange = (e: any) => {
        setLimit(e.value); // Update limit
        fetchData({ limit: e.value, page: 1 }); // Fetch data with new limit
    };

    const buttonRenderer = (rowData: any) => {
        const navigateToFeedback = () => {
            router.push(
                `/supplier-feedback/${encodeRouteParams({
                    departmentId: rowData.departmentId,
                    period: rowData.rawPeriod
                })}`
            );
        };

        return (
            <div className="flex gap-2">
                <Button icon="pi pi-eye" className="p-button-rounded p-button-sm" tooltip="View Feedback" tooltipOptions={{ position: 'top' }} onClick={navigateToFeedback} />
            </div>
        );
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className={`panel-container ${isShowSplit ? (layoutState.isMobile ? 'mobile-split' : 'split') : ''}`}>
                    <div className="left-panel mb-0">
                        <div className="header">{header}</div>
                        <div className="bg-[#ffffff] border border-1 p-3 mt-4 shadow-lg" style={{ borderColor: '#CBD5E1', borderRadius: '10px' }}>
                            <div className="flex justify-content-between items-center border-b">
                                <div>{/* <Dropdown className="mt-2" value={limit} options={limitOptions} onChange={onLimitChange} placeholder="Limit" style={{ width: '100px', height: '30px' }} /> */}</div>
                                <div className="flex  gap-2">
                                    {/* <div className="mt-2">{dropdownFeedbackStatus}</div> */}
                                    {/* <div className="mt-2">{dropdownFieldSubCategory}</div> */}
                                    {/* <div className="mt-2">{FieldGlobalSearch}</div> */}
                                </div>
                            </div>

                            {isLoading ? (
                                <TableSkeletonSimple columns={4} rows={limit} />
                            ) : (
                                <CustomDataTable
                                    ref={dataTableRef}
                                    page={page}
                                    limit={limit}
                                    totalRecords={totalRecords}
                                    // extraButtons={getExtraButtons}
                                    data={feedback?.map((item: any) => ({
                                        id: item.supplierScoreId,
                                        departmentId: item.departmentId,
                                        departmentName: item?.department.name,
                                        period: formatEvaluationPeriod(item?.evalutionPeriod),
                                        rawPeriod: item?.evalutionPeriod
                                    }))}
                                    columns={[
                                        {
                                            header: 'Sr. No',
                                            body: (data: any, options: any) => {
                                                const normalizedRowIndex = options.rowIndex % limit;
                                                const srNo = (page - 1) * limit + normalizedRowIndex + 1;

                                                return <span>{srNo}</span>;
                                            },
                                            bodyStyle: { minWidth: 50, maxWidth: 50 }
                                        },
                                        {
                                            header: 'Department Name',
                                            field: 'departmentName',
                                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                                            headerStyle: dataTableHeaderStyle,
                                            filterPlaceholder: 'Search Supplier Name'
                                        },
                                        {
                                            header: 'Period',
                                            field: 'period',
                                            headerStyle: dataTableHeaderStyle,
                                            style: { minWidth: 120, maxWidth: 120 }
                                        },

                                        {
                                            header: 'Actions',
                                            body: buttonRenderer,
                                            bodyStyle: { minWidth: 100 },
                                            headerStyle: dataTableHeaderStyle
                                        }
                                    ]}
                                    onLoad={(params: any) => fetchData(params)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageFeedbackPage;
