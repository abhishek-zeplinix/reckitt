'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Supplier } from '@/types';
import { buildQueryParams, getRowLimitWithScreenHeight, getSeverity } from '@/utils/utils';
import { useAppContext } from '@/layout/AppWrapper';
import { InputText } from 'primereact/inputtext';
import { encodeRouteParams } from '@/utils/base64';
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

const StatusAdminSpecific = ({status}: any) => {
    const { isLoading, setLoading, user, setAlert } = useAppContext();
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [page, setPage] = useState<number>(1);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);
    const [selectedglobalSearch, setGlobalSearch] = useState('');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [selectedYear, setSelectedYear] = useState('');

    const router = useRouter();

    const dataTableRef = useRef<CustomDataTableRef>(null);
    
    const getStatusFilter = (status: any) => {
        const statusMap: any= {
            'approved': 'approvalStatus',
            'evaluated': 'evaluationStatus',
            'completed': 'approvalStatus',
            'rejected': 'approvalStatus'
        };
    
        return statusMap[status] || 'NA';
    };

    console.log(status);
    

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
        admin: {
            endpoint: '/company/supplier-by-status',
            getFilters: () => ({status})
        },
        approver: {
            endpoint: '/company/supplier-by-status/login-user',
            getFilters: () => ({})
        },
        evaluator: {
            endpoint: '/company/supplier-by-status/login-user',
            getFilters: () => ({})
        }
    };

    useEffect(() => {
        const role = get(user, 'role.name', 'admin')?.toLowerCase();
        setUserRole(role === 'approver' || role === 'evaluator' ? role : 'admin');
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
                if (userRole === 'approver' || userRole === 'evaluator') {
                    const transformedData = transformSupplierData(response);

                        console.log(transformedData);
                        
                    setSuppliers(transformedData);
                    setTotalRecords(transformedData.length);
                } else {
                    setSuppliers(response?.data);
                    setTotalRecords(response?.total);
                }
            } else {
                setSuppliers([]);
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };
    

    const transformSupplierData = (responseData: any) => {
        if (!responseData?.data?.supplierAssigment) return [];

        return responseData.data.supplierAssigment.map((assignment: any) => {
            const supplier = assignment.suppliers[0];
            const assignmentStatus = assignment.SupplierAssignmentStatus[0];
            return {
                supId: supplier.supId,
                assignmentId: assignment.assignmentId,
                supplierName: supplier.supplierName,
                isBlocked: false,
                totalDepartments: 1,
                isEvaluated: assignmentStatus.evaluationStatus !== 'Pending',
                isApproved: assignmentStatus.approvalStatus !== 'Pending',
                category: {
                    categoryId: supplier.supplierCategoryId,
                    categoryName: supplier.category.categoryName
                },
                subCategories: {
                    subCategoryId: supplier.procurementCategoryId,
                    subCategoryName: supplier.subCategories.subCategoryName
                },
            };
        });
    };


    
    const navigateToSummary = (supId: number, catId: number, subCatId: number, assignmentId: number) => {
        const params: any = { supId, catId, subCatId, assignmentId };
        const encodedParams = encodeRouteParams(params);
        router.push(`/supplier-scoreboard-summary/${encodedParams}`);
    };

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

        console.log(status);
        
        return (
            <Badge
                value={status}
                severity={getSeverity(status)}
            />
        );
    };

  
    const transformDepartmentData = (departments: any, status: string) => {
        if (!departments || !departments.length) return [];
    
        // const currentYear = new Date().getFullYear();
        const yearFromAPI = selectedSupplier?.year ? new Date(selectedSupplier.year).getFullYear() : 'N/A';
        let result: any = [];
    
        departments.forEach((dept: any) => {
            const statusKey = getStatusFilter(status); // Get the actual property key (e.g., 'approvalStatus' or 'evaluationStatus')
    
            if (!statusKey || !dept[statusKey]) return; // Skip if the key is invalid or doesn't exist in dept
    
            Object.entries(dept[statusKey]).forEach(([period, value]) => {
                result.push({
                    department: dept.name,
                    period: `${period} ${yearFromAPI}`,
                    status: value, // The actual status value from dept[statusKey]
                });
            });
        });
    
        return result;
    };

    const statusBodyTemplate = (rowData: any) => {
        return (
            <div className="flex align-items-center">
                <Badge
                    value={rowData?.isEvaluated || rowData?.isApproved}
                    severity={getSeverity(rowData?.isEvaluated || rowData?.isApproved)}
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

        // if (selectedStatus) {
        //     filters.status = selectedStatus;
        // }

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
                    <div className="">{FieldGlobalSearch}</div>
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
                    data={suppliers}
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
                            body: statusBodyTemplate,
                            bodyStyle: { minWidth: 120 },
                        },
                    ]}
                    onLoad={(params: any) => fetchData(params)}
                />
            )}

            <Dialog
                header={`${getStatusLabel()} Details`}
                visible={dialogVisible}
                style={{ width: "70vw" }}
                onHide={closeDialog}
            >
                {selectedSupplier && (

                    
                    <>
                        <div className='flex justify-content-between mb-2'>
                           <div>
                            <span className='font-normal'>Supplier Name: </span><span className='font-bold font-italic text-primary-main'>{selectedSupplier?.supplierName || 'N/A'}</span>
                            <span className='font-normal ml-4'>Year: </span><span className='font-bold font-italic text-primary-main'>{selectedSupplier?.year ? new Date(selectedSupplier.year).getFullYear() : 'N/A'}</span>

                            </div> 
                           <div>Total Departments: <span className='font-bold font-italic text-primary-main'> {selectedSupplier.totalAssignedDepartments} </span></div> 
                        </div>

                        <DataTable
                            value={transformDepartmentData(selectedSupplier.departments, status)}
                            showGridlines
                            className="mb-3"
                            rowGroupMode="subheader"
                            groupRowsBy="department"
                            sortMode="single"
                            sortField="department"
                            sortOrder={1}
                            rowGroupHeaderTemplate={(data) => (
                                <strong>{data.department}</strong>
                            )}
                        >
                            <Column field="department" header="Department" hidden />
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

export default StatusAdminSpecific;