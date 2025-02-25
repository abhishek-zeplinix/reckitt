'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { buildQueryParams, getRowLimitWithScreenHeight, getSeverity, getStatusOptions } from '@/utils/utils';
import { useAppContext } from '@/layout/AppWrapper';
import { InputText } from 'primereact/inputtext';
import { encodeRouteParams } from '@/utils/base64';
import { get } from 'lodash';
import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { GetCall } from '@/app/api-config/ApiKit';
import TableSkeletonSimple from '@/components/skeleton/TableSkeletonSimple';
import useDecodeParams from '@/hooks/useDecodeParams';
import { Badge } from 'primereact/badge';
import { Dropdown } from 'primereact/dropdown';
import { years } from '@/utils/constant';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';

const ViewAssignedSuppliers = ({
    params,
}: {
    params: { encodedParams: string };
}) => {
    const [categoryLoader, setCategoryLoader] = useState(false);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [page, setPage] = useState<number>(1);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);
    const [selectedglobalSearch, setGlobalSearch] = useState('');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [department, setDepartment] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);


    const router = useRouter();

    const { isLoading, setLoading, user, setAlert } = useAppContext();

    const decodedParams = useDecodeParams(params.encodedParams);
    const { userId, role, name } = decodedParams;

    const dataTableRef = useRef<CustomDataTableRef>(null);


    useEffect(() => {
        const role = get(user, 'role.name', 'admin')?.toLowerCase();
        setUserRole(role === 'approver' || role === 'evaluator' ? role : 'admin');
    }, [user]);


    useEffect(() => {
        if (userRole) {
            fetchData();
        }
    }, [userRole]);



    if (!userId || !role || !name) {
        router.replace('/404')
        return null;
    }

    const roleConfig = {
        admin: {
            endpoint: '/company/suppliers-mapped-config',
            getFilters: () => ({ role: role, userId: userId })
        },
        approver: {
            endpoint: '/company/suppliers-mapped-config-login-user',
            getFilters: () => ({})
        },
        evaluator: {
            endpoint: '/company/suppliers-mapped-config-login-user',
            getFilters: () => ({})
        }
    };

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
                console.log(response?.data);

                const suppliersData = Array.isArray(response?.data) ? response.data : [response.data];

                setSuppliers(suppliersData);
                setDepartment(suppliersData[0]?.department?.name || 'N/A')
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


    const navigateToSummary = (supId: number, catId: number, subCatId: number) => {

        const params: any = { supId, catId, subCatId };

        const encodedParams = encodeRouteParams(params);
        router.push(`/supplier-scoreboard-summary/${encodedParams}`);
    };


    // const evaluateBodyTemplate = (rowData: any) => <Button icon="pi pi-plus" className="p-button-rounded p-button-pink-400" onClick={() => navigateToSummary(rowData?.supId, rowData?.category.categoryId, rowData?.subCategories.subCategoryId)} />;

    const evaluateBodyTemplate = (rowData: any) => {
        const categoryId = rowData?.category?.categoryId || rowData?.supplierCategoryId;
        const subCategoryId = rowData?.subCategories?.subCategoryId || rowData?.procurementCategoryId;

        return (
            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-pink-400"
                onClick={() => navigateToSummary(rowData?.supId, categoryId, subCategoryId)}
            />
        );
    };

    const onGlobalSearch = (e: any) => {
        setGlobalSearch(e.target?.value);
        fetchData({ search: e.target?.value });
    };


    const globalSearch = () => {
        return <InputText value={selectedglobalSearch} onChange={onGlobalSearch} placeholder="Search" className="w-full md:w-10rem" />;
    };
    const FieldGlobalSearch = globalSearch();

    const showStatusDialog = (rowData: any) => {
        // Find the original supplier data that matches this row
        const supplierAssignment = suppliers[0]?.supplierAssigment?.find(
            (assignment: any) => assignment.suppliers[0].supplierName === rowData.supplierName
        );

        if (supplierAssignment) {
            setSelectedSupplier(supplierAssignment);
            setDialogVisible(true);
        }
    };

    const closeDialog = () => {
        setDialogVisible(false);
        setSelectedSupplier(null);
    };


    const transformStatusData = (statusData: any) => {
        if (!statusData || !statusData.length) return [];
        
        const year = new Date(statusData[0]?.year).getFullYear();
        
        if (department === 'PROCUREMENT' || department === 'SUSTAINABILITY') {
            return [
                { period: `H1 ${year}`, status: statusData[0]?.h1 || 'Pending' },
                { period: `H2 ${year}`, status: statusData[0]?.h2 || 'Pending' }
            ];
        } 
        else {
            return [
                { period: `Q1 ${year}`, status: statusData[0]?.q1 || 'Pending' },
                { period: `Q2 ${year}`, status: statusData[0]?.q2 || 'Pending' },
                { period: `Q3 ${year}`, status: statusData[0]?.q3 || 'Pending' },
                { period: `Q4 ${year}`, status: statusData[0]?.q4 || 'Pending' }
            ];
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
            // status: supplier.isBlocked ? 'Inactive' : 'Active',
            approvalStatus: approvalStatus,
            country: supplier.country,
            state: supplier.state,
            city: supplier.city,
            supplierCategory: supplier.supplierCategoryId,
            evaluationStatus: evaluationStatus,
            history: 'View History',
            evaluate: 'Evaluate'
        };
    });


    const statusBodyTemplate = (rowData: any) => {
        const fieldName = role.toLowerCase() === 'approver' ? 'approvalStatus' : 'evaluationStatus';
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

    const statusColumnTemplate = (status: string) => {
        return <Badge value={status} severity={getSeverity(status)} />;
    };

    const onStatusChange = (e: any) => {
        const status = e.value;
        setSelectedStatus(status);

        const filters: any = {};

        if (status) {
            filters.status = status;
        }

        if (selectedYear) {
            filters.year = selectedYear;
        }

        fetchData({ filters });
    };

    const onYearChange = (e: any) => {
        const year = e.value;
        setSelectedYear(year);

        const filters: any = {};

        if (selectedStatus) {
            filters.status = selectedStatus;
        }

        if (year) {
            filters.year = year;
        }

        fetchData({ filters });
    };

    return (
        <div className="p-m-4 border-round-xl shadow-2 surface-card p-3">
            <div className="flex flex-wrap justify-content-between items-center border-b">
                <div>
                    <h3>Assigned Suppliers to <span className='font-bold font-italic'> {name}</span></h3>
                </div>

                <div className="flex flex-wrap gap-2 pb-3">
                    <Dropdown value={selectedYear} onChange={onYearChange} options={years} placeholder="Select Year" className="w-full md:w-10rem" showClear={!!selectedYear} />
                    <Dropdown value={selectedStatus} onChange={onStatusChange} options={getStatusOptions(role)} placeholder="Select Status" className="w-full md:w-10rem" showClear={!!selectedStatus} />
                    <div className="w-full md:w-10rem">{FieldGlobalSearch}</div>
                </div>

            </div>
            <div>
                {role} Department - <span className='font-bold'>{department}</span>
            </div>

            {isLoading || categoryLoader ? (
                <div className='mt-3'>
                    <TableSkeletonSimple columns={11} rows={limit} />
                </div>

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
                            field: 'srNo',
                            bodyStyle: { minWidth: 50, maxWidth: 50 }
                        },
                        {
                            header: 'Supplier Name',
                            field: 'supplierName',
                            bodyStyle: { minWidth: 120 },
                            filterPlaceholder: 'Search Supplier Name'
                        },


                        {
                            header: 'Country',
                            field: 'country',
                            style: { minWidth: 120, maxWidth: 120 }
                        },
                        {
                            header: 'State',
                            field: 'state',
                            style: { minWidth: 120, maxWidth: 120 }
                        },
                        {
                            header: 'City',
                            field: 'city',
                            style: { minWidth: 120, maxWidth: 120 }
                        },

                        {
                            header: 'Status',
                            field: role.toLowerCase() === 'approver' ? 'approvalStatus' : 'evaluationStatus',
                            bodyStyle: { minWidth: 120, maxWidth: 120, fontWeight: 'bold' },
                            body: statusBodyTemplate
                        },

                        {
                            header: role.toLowerCase() === 'evaluator' ? 'Evaluate' : 'Approve',
                            body: evaluateBodyTemplate,
                            style: { minWidth: 70, maxWidth: 70 },
                            className: 'text-center'
                        }
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
                        <div className="mb-4">
                            <DataTable value={[selectedSupplier.suppliers[0]]} showGridlines>
                                <Column field="supplierName" header="Supplier" />
                                <Column field="category.categoryName" header="Category" />
                                <Column field="subCategories.subCategoryName" header="Sub Category" />
                            </DataTable>
                        </div>
                        <div className="mb-2 flex justify-content-between">
                            <div><strong>Department:</strong> {department}</div>
                            <div><strong>Year: </strong>  {new Date(selectedSupplier.SupplierAssignmentStatus[0]?.year).getFullYear() || 'N/A'}</div>
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
}

export default ViewAssignedSuppliers;

