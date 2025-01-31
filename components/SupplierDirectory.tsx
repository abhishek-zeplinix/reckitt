'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation'; // Correct import for Next.js router
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
// import 'primeicons/primeicons.css';
// import 'primereact/resources/themes/saga-blue/theme.css';
// import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';
import { CustomResponse, Supplier } from '@/types';
import { GetCall } from '../app/api-config/ApiKit';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { useAppContext } from '@/layout/AppWrapper';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import CustomDataTable, { CustomDataTableRef } from './CustomDataTable';

const SupplierDirectory = () => {
    const router = useRouter();
    const { setLoading } = useAppContext();
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [page, setPage] = useState<number>(1);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedglobalSearch, setGlobalSearch] = useState('');
    const [SelectedSubCategory, setSelectedSubCategory] = useState('');
    const [procurementCategories, setprocurementCategories] = useState([]);
    const [supplierCategories, setsupplierCategories] = useState([]);

    const dataTableRef = useRef<CustomDataTableRef>(null);

    useEffect(() => {
        // setScroll(true);
        fetchData();
        fetchsupplierCategories();
        // fetchRolesData();
    }, []);

    const fetchData = async (params?: any) => {
        if (!params) {
            params = { limit: limit, page: page };
            // params = { limit: limit, page: page };
        }
        setLoading(true);
        const queryString = buildQueryParams(params);
        const response: CustomResponse = await GetCall(`/company/supplier?${queryString}`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setSuppliers(response.data);
            console.log('46', response.data);

            if (response.total) {
                setTotalRecords(response?.total);
            }
        } else {
            setSuppliers([]);
        }
    };

    const fetchprocurementCategories = async (categoryId: number | null) => {
        if (!categoryId) {
            setsupplierCategories([]); // Clear subcategories if no category is selected
            return;
        }
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/sub-category/${categoryId}`); // get all the roles
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setsupplierCategories(response.data);
        } else {
            setsupplierCategories([]);
        }
    };
    const fetchsupplierCategories = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/category`); // get all the roles
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setprocurementCategories(response.data);
        } else {
            setprocurementCategories([]);
        }
    };
    const navigateToSummary = (supId: number, catId: number, subCatId: number) => {
        console.log('supplier id-->', supId, 'cat id -->', catId, 'sub cat id -->', subCatId, 'Abhishek');

        const selectedSupplier = suppliers.find((supplier) => supplier.supId === supId);

        if (selectedSupplier) {
            // uupdate the context with the selected supplier data

            sessionStorage.setItem('supplier-data', JSON.stringify(selectedSupplier));
        }

        router.push(`/supplier-scoreboard-summary/${supId}/${catId}/${subCatId}`);
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
                placeholder="Select Department"
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
            {/* <DataTable
                value={suppliers}
                scrollable
                rows={10}
                paginator
                // scrollHeight="250px"
                responsiveLayout="scroll"
                // onRowClick={(e) => navigateToSummary(e.data.supId)}

                className="supplier-directory"
            >
                <Column field="supId" header="#" />
                <Column field="supplierName" header="Supplier Name" />
                <Column field="status" header="Status" body={statusBodyTemplate} />
                <Column field="warehouseLocation" header="Location" />
                <Column field="category.categoryName" header="Procurement Category" />
                <Column field="subCategories.subCategoryName" header="Supplier Category" />
                <Column header="History" body={HistoryBodyTemplate} />
                <Column header="Evaluate" body={evaluateBodyTemplate} />
            </DataTable> */}

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
                        header: 'Warehouse Location',
                        field: 'warehouseLocation',
                        style: { minWidth: 120 }
                    },

                    {
                        header: 'Procurement Category',
                        field: 'category.categoryName',
                        style: { minWidth: 120, maxWidth: 120 }
                    },

                    {
                        header: 'Supplier Category',
                        field: 'subCategories.subCategoryName',
                        style: { minWidth: 120, maxWidth: 180 }
                    },
                    {
                        header: 'History',
                        body: HistoryBodyTemplate,
                        style: { minWidth: 70, maxWidth: 70 },
                        className: 'text-center'
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
        </div>
    );
};

export default SupplierDirectory;
