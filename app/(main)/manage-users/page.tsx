'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { useAppContext } from '@/layout/AppWrapper';
import { CustomResponse, CompanyUsers } from '@/types';
import { GetCall } from '@/app/api-config/ApiKit';

const ManageUsersPage = () => {
    const router = useRouter();
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const { setLoading } = useAppContext();
    const [companyUsers, setCompanyUsers] = useState<CompanyUsers[]>([]);
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateNavigation = () => {
        router.push('manage-users/user'); // Replace with the actual route for adding a new user
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <span className="p-input-icon-left flex align-items-center">
                    <h3 className="mb-0">Manage Users</h3>
                </span>
                <div className="flex justify-content-end">
                    <Button icon="pi pi-plus" size="small" label="Add User" aria-label="Import Supplier" className="bg-pink-500 hover:text-white border-pink-500 " onClick={handleCreateNavigation} style={{ marginLeft: 10 }} />
                </div>
            </div>
        );
    };

    const header = renderHeader();

    const renderInputBox = () => {
        return (
            <div style={{ position: 'relative' }}>
                <InputText placeholder="Search" style={{ paddingLeft: '40px', width: '40%' }} />
                <span
                    className="pi pi-search"
                    style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'gray',
                        fontSize: '1.5rem'
                    }}
                ></span>
            </div>
        );
    };

    const handleEditUser = (userId: any) => {
        router.push(`/manage-users/user?edit=true&userId=${userId}`);
    };

    const fetchData = async (params?: any) => {
        if (!params) {
            params = { limit: limit, page: page };
        }
        setLoading(true);
        const queryString = buildQueryParams(params);
        const response: CustomResponse = await GetCall(`/company/user?${queryString}`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setCompanyUsers(response.data);
            if (response.total) {
                setTotalRecords(response?.total);
            }
        } else {
            setCompanyUsers([]);
        }
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className={`panel-container ${isShowSplit ? (layoutState.isMobile ? 'mobile-split' : 'split') : ''}`}>
                    <div className="left-panel ">
                        <div className="header">{header}</div>

                        <div
                            className="bg-[#ffffff] border border-1  p-3  mt-4 shadow-lg"
                            style={{ borderColor: '#CBD5E1', borderRadius: '10px', WebkitBoxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)', MozBoxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)', boxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)' }}
                        >
                            <CustomDataTable
                                ref={dataTableRef}
                                page={page}
                                limit={limit} // no of items per page
                                isDelete={true} // show delete button
                                totalRecords={totalRecords}
                                extraButtons={[
                                    {
                                        icon: 'pi pi-user-edit',
                                        onClick: (e) => {
                                            handleEditUser(e.id); // Pass the userId from the row data
                                        }
                                    }
                                ]}
                                data={companyUsers}
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
                                        header: 'Name',
                                        field: 'name',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 }
                                    },
                                    {
                                        header: 'Role Name',
                                        field: 'roleName',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 }
                                    },
                                    {
                                        header: 'Email',
                                        field: 'email',
                                        style: { minWidth: 150, maxWidth: 150 }
                                    },
                                    {
                                        header: 'Phone Number',
                                        field: 'phone',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 }
                                    },
                                    {
                                        header: 'Role Id ',
                                        field: 'roleId',
                                        filter: true,
                                        bodyStyle: { minWidth: 50, maxWidth: 50, textAlign: 'center' }
                                    },
                                    {
                                        header: 'Status ',
                                        field: 'isActive',
                                        bodyStyle: { minWidth: 150, maxWidth: 150, fontWeight: 'bold' },
                                        body: (rowData) => <span style={{ color: rowData.isActive ? 'green' : 'red' }}>{rowData.isActive ? 'Active' : 'Inactive'}</span>
                                    }
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageUsersPage;
