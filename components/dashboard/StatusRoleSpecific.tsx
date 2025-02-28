'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { buildQueryParams, getRowLimitWithScreenHeight, getSeverity } from '@/utils/utils';
import { useAppContext } from '@/layout/AppWrapper';
import { InputText } from 'primereact/inputtext';
import { get } from 'lodash';
import CustomDataTable, { CustomDataTableRef } from '../CustomDataTable';
import { GetCall } from '@/app/api-config/ApiKit';
import TableSkeletonSimple from '../skeleton/TableSkeletonSimple';
import { Badge } from 'primereact/badge';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { years } from '@/utils/constant';
import { useAuth } from '@/layout/context/authContext';

const StatusRoleSpecific = ({ status }: any) => {
    const { isLoading, setLoading, user, setAlert } = useAppContext();
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [page, setPage] = useState<number>(1);
    const [suppliers, setSuppliers] = useState<any>([]);
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);
    const [selectedglobalSearch, setGlobalSearch] = useState('');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [selectedYear, setSelectedYear] = useState('');

    const { isApprover, isEvaluator } = useAuth();

    const dataTableRef = useRef<CustomDataTableRef>(null);

    const getStatusLabel = () => {
        switch (status.toUpperCase()) {
            case 'APPROVED': return 'Approval Status';
            case 'EVALUATED': return 'Evaluation Status';
            case 'COMPLETED': return 'Completion Status';
            case 'REJECTED': return 'Rejection Status';
            default: return 'Status';
        }
    };

    const roleConfig = {
        approver: {
            endpoint: '/company/supplier-by-status/login-user',
            getFilters: () => ({ status })
        },
        evaluator: {
            endpoint: '/company/supplier-by-status/login-user',
            getFilters: () => ({  })
        }
    };

    useEffect(() => {
        const role = get(user, 'role.name', '')?.toLowerCase();
        if (role === 'approver' || role === 'evaluator') {
            setUserRole(role);
        }
    }, [user]);

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
                const suppliersData = Array.isArray(response?.data) ? response.data : [response.data];
                setSuppliers(suppliersData);
                setTotalRecords(response?.total);
            } else {
                setSuppliers([]);
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const transformedData = suppliers[0]?.supplierAssigment?.map((assignment: any, index: any) => {
        const supplier = assignment?.suppliers[0];

        //if not a single evaluation done..status will be 'Pending'
        const evaluationStatus = assignment?.SupplierAssignmentStatus[0]?.evaluationStatus || 'Pending';
        const approvalStatus = assignment?.SupplierAssignmentStatus[0]?.approvalStatus || 'Pending';

        return {
            id: assignment.assignmentId,
            srNo: index + 1,
            supplierName: supplier.supplierName,
            approvalStatus: approvalStatus,
            evaluationStatus: evaluationStatus,
            history: 'View History',
            evaluate: 'Evaluate',
            suppliers: supplier,
            SupplierAssignmentStatus: assignment.SupplierAssignmentStatus
        };
    });

    useEffect(() => {
        if (userRole) {
            fetchData();
        }
    }, [userRole, status]);

    const showStatusDialog = (rowData: any) => {
        setSelectedSupplier(rowData);
        setDialogVisible(true);
    };

    const closeDialog = () => {
        setDialogVisible(false);
        setSelectedSupplier(null);
    };

    const statusColumnTemplate = (status: string) => {
        return (
            <Badge
                value={status}
                severity={getSeverity(status)}
            />
        );
    };

    const transformStatusData = (statusData: any) => {
        if (!statusData || !statusData.length) return [];

        const status = statusData[0];
        const year = status.year ? new Date(status.year).getFullYear() : 'N/A';
        const result: any = [];

        //check for quarterly periods (q1, q2, q3, q4)
        ['q1', 'q2', 'q3', 'q4'].forEach(quarter => {
            if (status[quarter] !== null) {
                result.push({
                    period: `Q${quarter.charAt(1)} ${year}`,
                    status: status[quarter]
                });
            }
        });

        // Check for half-yearly periods (h1, h2)
        ['h1', 'h2'].forEach(halfYear => {
            if (status[halfYear] !== null) {
                result.push({
                    period: `H${halfYear.charAt(1)} ${year}`,
                    status: status[halfYear]
                });
            }
        });

        return result;
    };

    const statusBodyTemplate = (rowData: any) => {
        const fieldName = isApprover() ? 'approvalStatus' : 'evaluationStatus'
        return (
            <div className="flex align-items-center">
                <Badge
                    value={rowData[fieldName]}
                    severity={getSeverity(rowData[fieldName])}
                />
                <Button
                    icon="pi pi-exclamation-circle"
                    className="p-button-rounded p-button-text ml-1"
                    onClick={() => showStatusDialog(rowData)}
                />
            </div>
        );
    };

    const onGlobalSearch = (e: any) => {
        setGlobalSearch(e.target?.value);
        fetchData({ search: e.target?.value });
    };

    const onYearChange = (e: any) => {
        const year = e.value;
        setSelectedYear(year);

        const filters: any = {};

        if (year) {
            filters.year = year;
        }

        fetchData({ filters });
    };

    const globalSearch = () => {
        return <InputText value={selectedglobalSearch} onChange={onGlobalSearch} placeholder="Search" className="w-full md:w-10rem" />;
    };
    const FieldGlobalSearch = globalSearch();

    return (
        <div className="p-m-4 border-round-xl shadow-2 surface-card p-3">
            <div className="flex justify-content-between items-center border-b">
                <div>
                    <h3>Evaluation Details</h3>
                </div>
                <div className="flex gap-2 pb-3">
                    <Dropdown value={selectedYear} onChange={onYearChange} options={years} placeholder="Select Year" className="w-full md:w-10rem" showClear={!!selectedYear} />
                    {/* <div className="">{FieldGlobalSearch}</div> */}
                </div>
            </div>

            {isLoading ? (
                <TableSkeletonSimple columns={6} rows={limit} />
            ) : (
                <CustomDataTable
                    ref={dataTableRef}
                    page={page}
                    limit={limit}
                    totalRecords={totalRecords}
                    data={transformedData}
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
                            header: 'Supplier Name',
                            field: 'supplierName',
                            bodyStyle: { minWidth: 120 },
                        },
                        {
                            header: getStatusLabel(),
                            field: isApprover() ? 'approvalStatus' : 'evaluationStatus',
                            bodyStyle: { minWidth: 120, maxWidth: 120, fontWeight: 'bold' },
                            body: statusBodyTemplate
                        },
                    ]}
                    onLoad={(params: any) => fetchData(params)}
                />
            )}

            <Dialog
                header="Supplier Status Details"
                visible={dialogVisible}
                style={{ width: "50vw" }}
                onHide={closeDialog}
            >
                {selectedSupplier && (
                    <>
                        {/* <div className="mb-4">
                            <DataTable value={[selectedSupplier.suppliers]} showGridlines>
                                <Column field="supplierName" header="Supplier" />
                                <Column field="category.categoryName" header="Category" />
                                <Column field="subCategories.subCategoryName" header="Sub Category" />
                            </DataTable>
                        </div>
                        <div className="mb-2 flex justify-content-between">
                            <div><strong>Year: </strong> {selectedSupplier.SupplierAssignmentStatus[0]?.year ? 
                                new Date(selectedSupplier.SupplierAssignmentStatus[0]?.year).getFullYear() : 'N/A'}</div>
                        </div> */}


                        <div className='flex justify-content-between mb-2'>
                            <div>
                                <span className='font-normal'>Supplier Name: </span><span className='font-bold font-italic text-primary-main'>{selectedSupplier?.supplierName || 'N/A'}</span>

                            </div>
                            <div> <span className='font-normal ml-4'>Year: </span><span className='font-bold font-italic text-primary-main'> {selectedSupplier.SupplierAssignmentStatus[0]?.year ?
                                new Date(selectedSupplier.SupplierAssignmentStatus[0]?.year).getFullYear() : 'N/A'}</span>
                            </div>
                        </div>

                        <DataTable
                            value={transformStatusData(selectedSupplier.SupplierAssignmentStatus)}
                            showGridlines
                            className="mb-3"
                        >
                            <Column field="period" header="Period" />
                            <Column
                                field="status"
                                header="Status"
                                body={(rowData) => statusColumnTemplate(rowData.status)}
                            />
                        </DataTable>
                    </>
                )}
            </Dialog>
        </div>
    );
};

export default StatusRoleSpecific;