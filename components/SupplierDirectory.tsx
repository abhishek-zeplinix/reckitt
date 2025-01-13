'use client';
import React, { useEffect, useState } from 'react';
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

const SupplierDirectory = () => {
    const router = useRouter();
    const { setLoading } = useAppContext();
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [page, setPage] = useState<number>(1);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);

    useEffect(() => {
        // setScroll(true);
        fetchData();
        // fetchRolesData();
        return () => {
            // setScroll(true);
        };
    }, []);

    const fetchData = async (params?: any) => {
        if (!params) {
            params = { limit: limit, page: page };
            // params = { limit: limit, page: page };
        }
        setLoading(true);
        const queryString = buildQueryParams(params);
        const response: CustomResponse = await GetCall(`/company/supplier`);
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

    const navigateToSummary = (supId: number, catId: number, subCatId: number) => {
        console.log('supplier id-->', supId, 'cat id -->', catId, 'sub cat id -->', subCatId);

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
                color: rowData.status === 'Active' ? 'green' : 'red',
                fontWeight: 'bold'
            }}
        >
            {rowData.status}
        </span>
    );

    const evaluateBodyTemplate = (rowData: any) => <Button icon="pi pi-plus" className="p-button-rounded p-button-danger" onClick={() => navigateToSummary(rowData.supId, rowData.category.categoryId, rowData.subCategories.subCategoryId)} />;

    return (
        <div className="p-m-4">
            <h3>Supplier Directory</h3>
            <DataTable
                value={suppliers}
                scrollable
                scrollHeight="250px"
                responsiveLayout="scroll"
                // onRowClick={(e) => navigateToSummary(e.data.supId)}

                className="supplier-directory"
            >
                <Column field="supId" header="#" />
                <Column field="supplierName" header="Supplier Name" />
                <Column field="status" header="Status" body={statusBodyTemplate} />
                <Column field="location.name" header="Location" />
                <Column field="category.categoryName" header="Category" />

                <Column header="Evaluate" body={evaluateBodyTemplate} />
            </DataTable>
        </div>
    );
};

export default SupplierDirectory;
