'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import 'primeflex/primeflex.css';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { useAppContext } from '@/layout/AppWrapper';
import { InputText } from 'primereact/inputtext';
import { encodeRouteParams } from '@/utils/base64';
import { get } from 'lodash';
import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { GetCall } from '@/app/api-config/ApiKit';
import TableSkeletonSimple from '@/components/supplier-rating/skeleton/TableSkeletonSimple';
import useDecodeParams from '@/hooks/useDecodeParams';

const ViewAssignedSuppliers = ({
    params,
}: {
    params: { encodedParams: string };
}) => {
    const { isLoading, setLoading, user, setAlert } = useAppContext();
    const [categoryLoader, setCategoryLoader] = useState(false);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [page, setPage] = useState<number>(1);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);
    const [selectedglobalSearch, setGlobalSearch] = useState('');
    const [userRole, setUserRole] = useState<string | null>(null);
    const router = useRouter();



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

        // router.push(`/supplier-scoreboard-summary/${supId}/${catId}/${subCatId}`);
        router.push(`/supplier-scoreboard-summary/${encodedParams}`);
    };

    // Render the status column
    const statusBodyTemplate = (rowData: any) => (
        <span
            style={{
                color: rowData.status === 'Active' ? '#15B097' : 'red',
                fontWeight: 'bold'
            }}
        >
            {rowData.status}
        </span>
    );

    const evaluateBodyTemplate = (rowData: any) => <Button icon="pi pi-plus" className="p-button-rounded p-button-pink-400" onClick={() => navigateToSummary(rowData?.supId, rowData?.category.categoryId, rowData?.subCategories.subCategoryId)} />;

    const HistoryBodyTemplate = (rowData: any) => <Button icon="pi pi-eye" className="p-button-rounded p-button-pink-400" onClick={() => navigateToSummary(rowData?.supId, rowData?.categoryId, rowData?.subCategoryId)} />;


    const onGlobalSearch = (e: any) => {
        setGlobalSearch(e.target?.value); // Update limit
        fetchData({ search: e.target?.value });
    };


    const globalSearch = () => {
        return <InputText value={selectedglobalSearch} onChange={onGlobalSearch} placeholder="Search" className="w-full md:w-10rem" />;
    };
    const FieldGlobalSearch = globalSearch();


    const transformedData = suppliers[0]?.supplierAssigment.map((assignment: any, index: any) => {
        const supplier = assignment?.suppliers[0];

        return {
            id: assignment.assignmentId,
            srNo: index + 1,
            supplierName: supplier.supplierName,
            status: supplier.isBlocked ? 'Inactive' : 'Active',
            country: supplier.country,
            state: supplier.state,
            city: supplier.city,
            supplierCategory: supplier.supplierCategoryId,
            history: 'View History',
            evaluate: 'Evaluate'
        };
    });

    return (
        <div className="p-m-4 border-round-xl shadow-2 surface-card p-3">
            <div className="flex justify-content-between items-center border-b">
                <div>
                    <h3>Assigned Suppliers to {name}</h3>
                </div>
                <div className="flex gap-2 pb-3">
                    <div className="">{FieldGlobalSearch}</div>
                </div>
            </div>

            {isLoading || categoryLoader ? (
                <TableSkeletonSimple columns={11} rows={limit} />
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
                            header: 'Status',
                            field: 'status',
                            bodyStyle: { minWidth: 120, maxWidth: 120, fontWeight: 'bold' },
                            body: (rowData) => <span style={{ color: rowData.isBlocked ? 'red' : '#15B097' }}>{rowData.isBlocked ? 'Inactive' : 'Active'}</span>
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


                        // {
                        //     header: 'History',
                        //     body: HistoryBodyTemplate,
                        //     style: { minWidth: 70, maxWidth: 70 },
                        //     className: 'text-center'
                        // },
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
        </div>
    );
}

export default ViewAssignedSuppliers;