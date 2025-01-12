'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';

const PermissionsPage = () => {
    const [permissions, setPermissions] = useState([
        { module: 'Dashboard', read: false, write: false, execute: false, view: false, admin: false },
        { module: 'Manage Rule', read: false, write: false, execute: false, view: false, admin: false },
        { module: 'Manage Users', read: false, write: false, execute: false, view: false, admin: false },
        { module: 'Manage Input Request', read: false, write: false, execute: false, view: false, admin: false },
        { module: 'Manage Suppliers', read: false, write: false, execute: false, view: false, admin: true }
    ]);

    const toggleCheckbox = (rowIndex: any, field: any) => {
        const updatedPermissions: any = [...permissions];
        updatedPermissions[rowIndex][field] = !updatedPermissions[rowIndex][field];
        setPermissions(updatedPermissions);
    };

    const checkboxBodyTemplate = (rowData: any, { rowIndex, field }: { rowIndex: any; field: any }) => <Checkbox checked={rowData[field]} onChange={() => toggleCheckbox(rowIndex, field)} />;

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <span className="p-input-icon-left flex align-items-center">
                    <h3 className="mb-0">User Permission Management</h3>
                </span>
            </div>

            //
        );
    };

    const header = renderHeader();

    console.log(permissions);

    return (
        <div className="grid">
            <div className="col-12">
                <div className="header">{header}</div>
                <div className="card mt-4">
                    <DataTable value={permissions} showGridlines>
                        <Column field="module" header="Module" className="text-black font-medium" />
                        <Column field="read" header="Read" body={(rowData, options) => checkboxBodyTemplate(rowData, { ...options, field: 'read' })} />
                        <Column field="write" header="Write" body={(rowData, options) => checkboxBodyTemplate(rowData, { ...options, field: 'write' })} />
                        <Column field="execute" header="Execute" body={(rowData, options) => checkboxBodyTemplate(rowData, { ...options, field: 'execute' })} />
                        <Column field="view" header="View" body={(rowData, options) => checkboxBodyTemplate(rowData, { ...options, field: 'view' })} />
                        <Column field="admin" header="Admin" body={(rowData, options) => checkboxBodyTemplate(rowData, { ...options, field: 'admin' })} />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default PermissionsPage;
