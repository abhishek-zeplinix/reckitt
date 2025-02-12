'use client';
import React, { useContext, useEffect, useRef, useState } from 'react';
import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { buildQueryParams, formatEvaluationPeriod, getRowLimitWithScreenHeight, renderColorStatus } from '@/utils/utils';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall } from '@/app/api-config/ApiKit';
import { Department, Rules } from '@/types';
import { encodeRouteParams } from '@/utils/base64';
import { Button } from 'primereact/button';
import { get } from 'lodash';
import { useRouter } from 'next/navigation';
import TableSkeletonSimple from '@/components/supplier-rating/skeleton/TableSkeletonSimple';
import { useAuth } from '@/layout/context/authContext';
import useFetchDepartments from '@/hooks/useFetchDepartments';
import { Dropdown } from 'primereact/dropdown';
import { getPeriodOptions } from '@/utils/periodUtils';

const ManageFeedbackPage = () => {
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [feedback, setFeedback] = useState<Rules[]>([]);
    const [totalRecords, setTotalRecords] = useState();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState('');

    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [periodOptions, setPeriodOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [selectedStatus, setSelectedStatus] = useState('');


    const { isLoading, setLoading, setAlert, user } = useAppContext();
    const { isSupplier } = useAuth();
    const router = useRouter();
    const { departments } = useFetchDepartments();

    const currentYear = new Date().getFullYear();

    const STATUS_OPTIONS = [
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' }
    ];

    const roleConfig = {
        supplier: {
            endpoint: '/company/supplier-score-checked-data',
            getFilters: () => ({ supId: get(user, 'supplierId') })
        },
        admin: {
            endpoint: '/company/score-checked-data',
            getFilters: () => ({})
        }
        // Add more roles as needed:
        // approver: {
        //     endpoint: '/company/approver-score-data',
        //     getFilters: () => ({ approverId: get(user, 'approverId') })
        // },
        // evaluator: {
        //     endpoint: '/company/evaluator-score-data',
        //     getFilters: () => ({ evaluatorId: get(user, 'evaluatorId') })
        // }
    };

    useEffect(() => {
        if (user) {
            setUserRole(isSupplier() ? 'supplier' : 'admin');
        }
    }, [user]);

    useEffect(() => {
        if (userRole) {
            fetchData();
        }
    }, [userRole]);

    const fetchData = async (params?: any) => {
        if (!userRole) return;

        try {
            setLoading(true);

            const config = roleConfig[userRole as keyof typeof roleConfig];
            if (!config) {
                throw new Error('Invalid user role');
            }

            // merge default params with role-specific filters and any additional params
            const defaultParams = {
                limit,
                page,
                filters: config.getFilters()
            };

            const mergedParams = {
                ...defaultParams,
                ...params,
                filters: {
                    ...defaultParams.filters,
                    ...(params?.filters || {})
                }
            };

            const queryString = buildQueryParams(mergedParams);
            setPage(mergedParams.page);

            const response = await GetCall(`${config.endpoint}?${queryString}`);

            if (response.code === 'SUCCESS') {
                setFeedback(response.data);
                setTotalRecords(response.total);
            } else {
                setFeedback([]);
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const dataTableHeaderStyle = { fontSize: '12px' };

    const buttonRenderer = (rowData: any) => {
        const navigateToFeedback = () => {
            router.push(
                `/supplier-feedback/${encodeRouteParams({
                    departmentId: rowData.departmentId,
                    period: rowData.rawPeriod,
                    supId: rowData.supId
                })}`
            );
        };

        return (
            <div className="flex gap-2">
                <Button 
                    icon="pi pi-eye" 
                    className="p-button-rounded p-button-sm" 
                    tooltip="View Feedback" 
                    tooltipOptions={{ position: 'top' }} 
                    onClick={navigateToFeedback} 
                />
            </div>
        );
    };

    const onDepartmentChange = (e: any) => {
        const departmentId = e.value;
        setSelectedDepartment(departmentId);
        setSelectedPeriod(''); // Reset period when department changes
        
        if (departmentId) {
            const selectedDept: any = departments.find(
                (dept: Department) => dept.departmentId === departmentId
            );
            
            if (selectedDept) {
                const options = getPeriodOptions(selectedDept.evolutionType, currentYear);
                setPeriodOptions(options);
            } else {
                setPeriodOptions([]);
            }
        } else {
            setPeriodOptions([]);
        }
        
        fetchData({
            limit,
            page,
            filters: {
                departmentId
            }
        });
    };

    
    const onPeriodChange = (e: any) => {
        const period = e.value;
        setSelectedPeriod(period);
        
        fetchData({
            limit,
            page,
            filters: {
                departmentId: selectedDepartment,
                evalutionPeriod: period
            }
        });
    };

    const onStatusChange = (e: any) => {
        const status = e.value;
        setSelectedStatus(status);
        
        fetchData({
            limit,
            page,
            filters: {
                departmentId: selectedDepartment,
                evalutionPeriod: selectedPeriod,
                status: status
            }
        });
    };


    const renderHeader = () => (
        <div className="flex justify-content-between">
            <span className="p-input-icon-left flex align-items-center">
                <h3 className="mb-0">Manage Feedbacks</h3>
            </span>
        </div>
    );

    const dropdownMenuDepartment = () => (
        <Dropdown
            value={selectedDepartment}
            onChange={onDepartmentChange}
            options={departments}
            optionValue="departmentId"
            placeholder="Select Department"
            optionLabel="name"
            className="w-full md:w-10rem"
            showClear={!!selectedDepartment}
        />
    );

    const dropdownMenuPeriod = () => (
        <Dropdown
            value={selectedPeriod}
            onChange={onPeriodChange}
            options={periodOptions}
            placeholder="Select Period"
            className="w-full md:w-10rem"
            showClear={!!selectedPeriod}
            disabled={!selectedDepartment || periodOptions.length === 0}
        />
    );

    const dropdownMenuStatus = () => (
        <Dropdown
            value={selectedStatus}
            onChange={onStatusChange}
            options={STATUS_OPTIONS}
            placeholder="Select Status"
            className="w-full md:w-10rem"
            showClear={!!selectedStatus}
        />
    );

    return (
        <div className="grid">
            <div className="col-12">
                <div className={`panel-container ${isShowSplit ? (layoutState.isMobile ? 'mobile-split' : 'split') : ''}`}>
                    <div className="left-panel mb-0">
                        <div className="header">{renderHeader()}</div>
                        <div className="bg-[#ffffff] border border-1 p-3 mt-4 shadow-lg" style={{ borderColor: '#CBD5E1', borderRadius: '10px' }}>
                            <div className="flex justify-content-between items-center border-b">
                                <div></div>
                                <div className="flex gap-2">
                                    <div className="mt-2">{dropdownMenuDepartment()}</div>
                                    <div className="mt-2">{dropdownMenuPeriod()}</div>
                                    <div className="mt-2">{dropdownMenuStatus()}</div>
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
                                    data={feedback?.map((item: any) => ({
                                        id: item?.supplierScoreId,
                                        supId: item?.supId,
                                        supplierName: item?.supplier.supplierName,
                                        departmentId: item?.departmentId,
                                        departmentName: item?.department.name,
                                        period: formatEvaluationPeriod(item?.evalutionPeriod),
                                        rawPeriod: item?.evalutionPeriod,
                                        approvalStatus: item?.scoreApprovals.approvalStatus
                                    }))}
                                    columns={[
                                        {
                                            header: 'Sr. No',
                                            body: (data: any, options: any) => {
                                                const normalizedRowIndex = options.rowIndex % limit;
                                                return <span>{(page - 1) * limit + normalizedRowIndex + 1}</span>;
                                            },
                                            bodyStyle: { minWidth: 50, maxWidth: 50 }
                                        },
                                        {
                                            header: 'Supplier Name',
                                            field: 'supplierName',
                                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                                            headerStyle: dataTableHeaderStyle,
                                        },
                                        {
                                            header: 'Department Name',
                                            field: 'departmentName',
                                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                                            headerStyle: dataTableHeaderStyle,
                                        },
                                        {
                                            header: 'Period',
                                            field: 'period',
                                            headerStyle: dataTableHeaderStyle,
                                            style: { minWidth: 120, maxWidth: 120 }
                                        },
                                        {
                                            header: 'Approval Status',
                                            field: 'approvalStatus',
                                            headerStyle: dataTableHeaderStyle,
                                            style: { minWidth: 120, maxWidth: 120 },
                                            body: (rowData: any) => renderColorStatus(rowData.approvalStatus)
                                        },
                                        {
                                            header: 'Actions',
                                            body: buttonRenderer,
                                            bodyStyle: { minWidth: 100 },
                                            headerStyle: dataTableHeaderStyle
                                        }
                                    ]}
                                    onLoad={fetchData}
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