'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Category, CustomResponse, Supplier } from '@/types';
import { GetCall } from '../app/api-config/ApiKit';
import { buildQueryParams, getRowLimitWithScreenHeight, getSeverity } from '@/utils/utils';
import { useAppContext } from '@/layout/AppWrapper';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import CustomDataTable, { CustomDataTableRef } from './CustomDataTable';
import { encodeRouteParams } from '@/utils/base64';
import TableSkeletonSimple from './skeleton/TableSkeletonSimple';
import { get } from 'lodash';
import { Badge } from 'primereact/badge';
import { useAuth } from '@/layout/context/authContext';

const SupplierDirectory = () => {
    const { isLoading, setLoading, user, setAlert } = useAppContext();
    const [categoryLoader, setCategoryLoader] = useState(false);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [page, setPage] = useState<number>(1);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedglobalSearch, setGlobalSearch] = useState('');
    const [SelectedSubCategory, setSelectedSubCategory] = useState('');
    const [procurementCategories, setprocurementCategories] = useState([]);
    const [supplierCategories, setsupplierCategories] = useState([]);
    const [userRole, setUserRole] = useState<string | null>(null);
    const router = useRouter();
    const {isApprover, isEvaluator} = useAuth();

    const dataTableRef = useRef<CustomDataTableRef>(null);

    const roleConfig = {
        admin: {
            endpoint: '/company/supplier',
            getFilters: () => ({})
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


    useEffect(() => {
        const role = get(user, 'role.name', 'admin')?.toLowerCase();
        setUserRole(role === 'approver' || role === 'evaluator' ? role : 'admin');

        // setUserRole('admin')

    }, [user]);

    console.log(userRole);


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
            return {
                supId: supplier.supId,
                assignmentId: assignment.assignmentId,
                supplierName: supplier.supplierName,
                isBlocked: false, // you may need to adjust this based on your requirements
                totalDepartments: 1, // since it's mapped to specific department
                isEvaluated: assignment.evaluationStatus !== 'Pending',
                isApproved: assignment.approvalStatus !== 'Pending',
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

    const fetchprocurementCategories = async (categoryId: number | null) => {
        if (!categoryId) {
            setsupplierCategories([]); // Clear subcategories if no category is selected
            return;
        }
        setCategoryLoader(true);
        const response: CustomResponse = await GetCall(`/company/sub-category/${categoryId}`); // get all the roles
        setCategoryLoader(false);
        if (response.code == 'SUCCESS') {
            setsupplierCategories(response.data);
        } else {
            setsupplierCategories([]);
        }
    };
    const fetchsupplierCategories = async () => {
        setCategoryLoader(true);
        const response: CustomResponse = await GetCall(`/company/category`); // get all the roles
        setCategoryLoader(false);
        if (response.code == 'SUCCESS') {
            setprocurementCategories(response.data);
        } else {
            setprocurementCategories([]);
        }
    };
    const navigateToSummary = (supId: number, catId: number, subCatId: number, assignmentId: number) => {

        const params: any = { supId, catId, subCatId, assignmentId };

        const encodedParams = encodeRouteParams(params);

        // router.push(`/supplier-scoreboard-summary/${supId}/${catId}/${subCatId}`);
        router.push(`/supplier-scoreboard-summary/${encodedParams}`);
    };


    useEffect(() => {
        if (userRole) {
            fetchData();
            fetchsupplierCategories();
        }
    }, [userRole]);


    const evaluateBodyTemplate = (rowData: any) => {
        const categoryId = rowData?.category?.categoryId || rowData?.supplierCategoryId;
        const subCategoryId = rowData?.subCategories?.subCategoryId || rowData?.procurementCategoryId;
        const assignmentId = rowData?.assignmentId;

        return (
            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-pink-400"
                onClick={() => navigateToSummary(rowData?.supId, categoryId, subCategoryId, assignmentId)}
            />
        );
    };

    const onCategorychange = (e: any) => {
        setSelectedCategory(e.value); // Update limit
        fetchprocurementCategories(e.value);
        fetchData({
            filters: {
                supplierCategoryId: e.value
            }
        });
    };

    const onSubCategorychange = (e: any) => {
        setSelectedSubCategory(e.value); // Update limit
        fetchData({
            filters: {
                procurementCategoryId: e.value
            }
        });
    };
    const onGlobalSearch = (e: any) => {
        setGlobalSearch(e.target?.value); // Update limit
        fetchData({ search: e.target?.value });
    };
    const dropdownCategory = () => {
        return (
            <Dropdown
                value={selectedCategory}
                onChange={onCategorychange}
                options={procurementCategories}
                optionValue="categoryId"
                placeholder="Select Category"
                optionLabel="categoryName"
                className="w-full md:w-10rem"
                showClear={!!selectedCategory}
            />
        );
    };

    const dropdownFieldCategory = dropdownCategory();

    const dropdownMenuSubCategory = () => {
        return (
            <Dropdown
                value={SelectedSubCategory}
                onChange={onSubCategorychange}
                options={supplierCategories}
                optionLabel="subCategoryName"
                optionValue="subCategoryId"
                placeholder="Select Sub Category"
                className="w-full md:w-10rem"
                showClear={!!SelectedSubCategory}
            />
        );
    };
    const dropdownFieldSubCategory = dropdownMenuSubCategory();
    const globalSearch = () => {
        return <InputText value={selectedglobalSearch} onChange={onGlobalSearch} placeholder="Search" className="w-full md:w-10rem" />;
    };
    const FieldGlobalSearch = globalSearch();

    const statusBodyTemplate = (rowData: any, field: 'isEvaluatedStatus' | 'isApprovalStatus') => {
        return (
            <div className="flex align-items-center">
                <Badge
                    value={rowData?.[field]}
                    severity={getSeverity(rowData?.[field])}
                />
            </div>
        );
    };


    return (
        <div className="p-m-4 border-round-xl shadow-2 surface-card p-3">
            <div className="flex justify-content-between items-center border-b">
                <div>
                    <h3>Supplier Directory</h3>
                </div>
                <div className="flex gap-2 pb-3">
                    <div className="">{dropdownFieldCategory}</div>
                    <div className="">{dropdownFieldSubCategory}</div>
                    <div className="">{FieldGlobalSearch}</div>
                </div>
            </div>

            {isLoading || categoryLoader ? (
                <TableSkeletonSimple columns={6} rows={limit} />
            ) : (
                <CustomDataTable
                    ref={dataTableRef}
                    // filter
                    page={page}
                    limit={limit}
                    totalRecords={totalRecords}
                    // extraButtons={getExtraButtons}
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
                            bodyStyle: { minWidth: 30, maxWidth: 50 },
                            filterPlaceholder: 'Search Supplier Name'
                        },
                        {
                            header: 'Status',
                            field: 'status',
                            bodyStyle: { minWidth: 30, maxWidth: 50, fontWeight: 'bold' },
                            body: (rowData) => <span style={{ color: rowData.isBlocked ? 'red' : '#15B097' }}>{rowData.isBlocked ? 'Inactive' : 'Active'}</span>
                        },
                        {
                            header: 'Category',
                            field: 'category.categoryName',
                            bodyStyle: { minWidth: 30, maxWidth: 50 },
                            filterPlaceholder: 'Search Supplier Name'
                        },
                        {
                            header: 'Sub Category',
                            field: 'subCategories.subCategoryName',
                            bodyStyle: { minWidth: 60, maxWidth: 70 },
                            filterPlaceholder: 'Search Supplier Name'
                        },
                        {
                            header: 'Evaluation',
                            body: (rowData) => statusBodyTemplate(rowData, 'isEvaluatedStatus'),
                            style: { minWidth: 80, maxWidth: 90},
                            className: 'text-center',
                            hidden:  isApprover() || isEvaluator()
                        },
                        {
                            header: 'Approval',
                            body: (rowData) => statusBodyTemplate(rowData, 'isApprovalStatus'),
                            style: { minWidth: 80, maxWidth: 90 },
                            className: 'text-center',
                            hidden:  isApprover() || isEvaluator()
                        },
                        {
                            header: 'Evaluate',
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
};

export default SupplierDirectory;
