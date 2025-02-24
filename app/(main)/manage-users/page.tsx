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
import { DeleteCall, GetCall } from '@/app/api-config/ApiKit';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import TableSkeletonSimple from '@/components/skeleton/TableSkeletonSimple';
const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const ManageUsersPage = () => {
    const router = useRouter();
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [companyUsers, setCompanyUsers] = useState<CompanyUsers[]>([]);
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);
    const [action, setAction] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState<any>(null);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
    const { isLoading, setLoading, setAlert } = useAppContext();

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
                    <Button icon="pi pi-plus" size="small" label="Add User" aria-label="Import Supplier" className="bg-primary-main hover:text-white border-primary-main " onClick={handleCreateNavigation} style={{ marginLeft: 10 }} />
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
        try {
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
        } catch (error) {
            setAlert('error', 'An error occurred while submitting user data.');
        } finally {
            setLoading(false);
        }
    };
    const onRowSelect = async (perm: any, action: any) => {
        setAction(action);

        setSelectedUserId(perm.id);

        if (action === ACTIONS.DELETE) {
            openDeleteDialog(perm);
        }
    };
    const openDeleteDialog = (items: any) => {
        setIsDeleteDialogVisible(true);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogVisible(false);
    };

    const onDelete = async () => {
        setLoading(true);
            try {
                const response = await DeleteCall(`/company/user/${selectedUserId}`);

                if (response.code === 'SUCCESS') {
                    closeDeleteDialog();
                    setAlert('success', 'User successfully deleted!');
                    fetchData();
                } else {
                    setAlert('error', 'Something went wrong!');
                    closeDeleteDialog();
                }
            } catch (error) {
                setAlert('error', 'Something went wrong!');
            } finally {
                setLoading(false);
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
                             {isLoading ?(
                                <TableSkeletonSimple columns={7} rows={limit} />
                            ) : (
                            <CustomDataTable
                                ref={dataTableRef}
                                page={page}
                                limit={limit} // no of items per page
                                isDelete={true} // show delete button
                                totalRecords={totalRecords}
                                extraButtons={(items) => [
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
                                        style: { minWidth: 150 }
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
                                        body: (rowData) => <span style={{ color: rowData.isActive ? '#15B097' : 'red' }}>{rowData.isActive ? 'Active' : 'Inactive'}</span>
                                    }
                                ]}
                                onDelete={(item: any) => onRowSelect(item, 'delete')}
                            />
                            )}
                        </div>
                    </div>
                </div>
                <Dialog
                                    header="Delete confirmation"
                                    visible={isDeleteDialogVisible}
                                    style={{ width: layoutState.isMobile ? '90vw' : '35vw' }}
                                    className="delete-dialog"
                                    footer={
                                        <div className="flex justify-content-center p-2">
                                            <Button label="Cancel" style={{ color: '#DF1740' }} className="px-7" text onClick={closeDeleteDialog} />
                                            <Button label="Delete" style={{ backgroundColor: '#DF1740', border: 'none' }} className="px-7 hover:text-white" onClick={onDelete} />
                                        </div>
                                    }
                                    onHide={closeDeleteDialog}
                                >
                                    {isLoading && (
                                        <div className="center-pos">
                                            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                                        </div>
                                    )}
                                    <div className="flex flex-column w-full surface-border p-3 text-center gap-4">
                                        <i className="pi pi-info-circle text-6xl" style={{ marginRight: 10, color: '#DF1740' }}></i>
                
                                        <div className="flex flex-column align-items-center gap-1">
                                            <span>Are you sure you want to delete selected user</span>
                                            <span>This action cannot be undone. </span>
                                        </div>
                                    </div>
                                </Dialog>
            </div>
        </div>
    );
};

export default ManageUsersPage;
