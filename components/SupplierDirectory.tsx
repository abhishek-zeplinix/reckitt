'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Correct import for Next.js router
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeflex/primeflex.css';

const SupplierDirectory = () => {
    const router = useRouter();

    const suppliers = [
        {
            id: 1,
            name: '45667',
            status: 'Active',
            location: 'Copack',
            category: 'Copack',
            onboardingDate: '11-15-2024',
            lastEvaluated: 'Q2 2024'
        },
        {
            id: 2,
            name: 'Apex Medical Supplies',
            status: 'Active',
            location: 'Raw & Pack',
            category: 'Raw & Pack',
            onboardingDate: '10-14-2024',
            lastEvaluated: 'Q2 2023'
        },
        {
            id: 3,
            name: 'BioHealth Products',
            status: 'Active',
            location: 'Pennsylvania',
            category: 'Raw & Pack',
            onboardingDate: '10-03-2024',
            lastEvaluated: 'Q1 2024'
        },
        {
            id: 4,
            name: 'Supplier Four',
            status: 'Active',
            location: 'Texas',
            category: 'Packaging',
            onboardingDate: '11-01-2023',
            lastEvaluated: 'Q3 2023'
        },
        {
            id: 5,
            name: 'Supplier Five',
            status: 'Inactive',
            location: 'California',
            category: 'Raw',
            onboardingDate: '08-12-2024',
            lastEvaluated: 'Q1 2024'
        }
    ];

    const navigateToSummary = (id: number) => {
        router.push(`/supplier-scoreboard-summary`);
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

    // Render the history button
    const historyBodyTemplate = (rowData: any) => <Button icon="pi pi-eye" className="p-button-rounded p-button-danger" onClick={() => navigateToSummary(rowData.id)} />;

    // Render the evaluate button
    const evaluateBodyTemplate = (rowData: any) => <Button icon="pi pi-plus" className="p-button-rounded p-button-danger" onClick={() => navigateToSummary(rowData.id)} />;

    return (
        <div className="p-m-4">
            <h3>Supplier Directory</h3>
            <DataTable value={suppliers} scrollable scrollHeight="250px" responsiveLayout="scroll" onRowClick={(e) => navigateToSummary(e.data.id)}>
                <Column field="id" header="#" />
                <Column field="name" header="Supplier Name" />
                <Column field="status" header="Status" body={statusBodyTemplate} />
                <Column field="location" header="Location" />
                <Column field="category" header="Category" />
                <Column field="onboardingDate" header="Onboarding Date" />
                <Column field="lastEvaluated" header="Last Evaluated" />
                <Column header="History" body={historyBodyTemplate} />
                <Column header="Evaluate" body={evaluateBodyTemplate} />
            </DataTable>
        </div>
    );
};

export default SupplierDirectory;
