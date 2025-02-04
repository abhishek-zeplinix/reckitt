import { InputText } from 'primereact/inputtext';
import { useContext, useEffect, useState } from 'react';
import { DeleteCall, GetCall, PostCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import CustomDataTable from '../CustomDataTable';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { CustomResponse } from '@/types';
import SubmitResetButtons from './submit-reset-buttons';
const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const PermissionManagement = () => {
    const [rolesList, setRolesList] = useState<any>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<any>();
    const [selectedRoleId, setSelectedRoleId] = useState<any>();
    const [selectedPermissionId, setSelectedPermissionId] = useState<any>();
    const [permissions, setPermissions] = useState<any>([]); // Store fetched permissions
    const [visible, setVisible] = useState(false);
    const { layoutState } = useContext(LayoutContext);
    const { setAlert, setLoading, isLoading } = useAppContext();
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [module, setModule] = useState('');
    const [permissionData, setPermissionData] = useState('');
    const [description, setdescription] = useState('');
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState<any>(false);
    const [allPermissions, setAllPermissions] = useState<any>([]);
    
    useEffect(() => {
        fetchData();
        // fetchPermissionData();
    }, []);
    

    const fetchData = async (params?: any) => {
        setLoading(true);

        try {
            if (!params) {
                params = { limit: limit, page: page, sortOrder: 'desc', sortBy: "permissionId" };
            }

            // setPage(params.page)
            const queryString = buildQueryParams(params);

            const response = await GetCall(`/settings/permissions?${queryString}`);

            setAllPermissions(response.data);
            setTotalRecords(response.total);

        } catch (err) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        setLoading(true);

        try {
            const response = await DeleteCall(`/settings/permissions/${selectedPermissionId}`);

            if (response.code.toLowerCase() === 'success') {
                setRolesList((prevRoles: any) => prevRoles.filter((role: any) => role.roleId !== selectedPermissionId));

                closeDeleteDialog();
                setAlert('success', 'Role successfully deleted!');
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

    const fetchPermissionData = async (params?: any) => {
        setLoading(true);

        try {
            const response = await GetCall('/settings/permissions');

            // Log the response to the console for debugging
            console.log('Fetched Permissions Response:', response);

            // Format the data into the structure expected by MultiSelect
            const formattedPermissions = response.data.map((permission: any) => ({
                label: permission.permission, // Display the permission name
                value: permission.permissionId // Use the permissionId as the value
            }));

            setPermissions(formattedPermissions); // Set the formatted data
        } catch (err) {
            console.error('Error fetching permissions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePermissionSubmit = async () => {
        if (!module || !permissionData || !description) {
            setAlert('Error', 'Please select all feilds');
            return;
        }

        setIsDetailLoading(true);

        const payload = {
            module: module,
            permission: permissionData,
            desc: description
        };

        try {
            const response: CustomResponse = await PostCall('/settings/permissions', payload);

            if (response.code === 'SUCCESS') {
                setAlert('success', 'Permission added successfully!');
                setVisible(false);
                setModule('');
                setPermissionData('');
                setdescription('');
                fetchData();
            } else {
                setAlert('error', response.message || 'Failed to add permissions.');
            }
        } catch (error) {
            console.error('Error submitting permissions :', error);
            setAlert('error', 'An error occurred while submitting permissions .');
        } finally {
            setLoading(false);
        }
    };

    const openDeleteDialog = (items: any) => {
        setIsDeleteDialogVisible(true);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogVisible(false);
    };

    const resetInput = () => {
        setModule('');
        setPermissionData('');
        setdescription('');
    };
    const onRowSelect = async (perm: any, action: any) => {
        if (action === ACTIONS.DELETE) {
            openDeleteDialog(perm);
            setSelectedPermissionId(perm.permissionId);
            console.log(selectedRoleId, 'Abhishek');
        }
    };
    return (
        <>
            <div className="mt-1">
                <div className="flex flex-column justify-center items-center gap-2">
                    <div className="p-fluid grid  pt-2">
                        <div className="field  col-4">
                            <label htmlFor="module">Module Name</label>
                            <InputText aria-label="Add Module" value={module} onChange={(e) => setModule(e.target.value)} style={{ width: '50%' }} className="ml-3" placeholder="Enter Module Name" />
                        </div>
                        <div className="field col-4">
                            <label htmlFor="permission">Permission Name</label>
                            <InputText aria-label="Add permission" value={permissionData} onChange={(e) => setPermissionData(e.target.value)} style={{ width: '50%' }} className="ml-3" placeholder="Enter Permission " />
                        </div>
                        <div className="field col-4">
                            <label htmlFor="description">Description</label>
                            <InputText aria-label="Add description" value={description} onChange={(e) => setdescription(e.target.value)} style={{ width: '50%' }} className="ml-3" placeholder="Enter Description " />
                        </div>
                    </div>

                    <small>
                        <i>Enter a permission module you want to add.</i>
                    </small>
                    <SubmitResetButtons onSubmit={handlePermissionSubmit} onReset={resetInput} label="Add Permission" />
                </div>
                <div className="mt-4">
                    <CustomDataTable
                        ref={allPermissions}
                        page={page}
                        limit={limit} // no of items per page
                        totalRecords={totalRecords} // total records from api response
                        isView={false}
                        isEdit={false} // show edit button
                        isDelete={true} // show delete button
                        data={allPermissions?.map((item: any) => ({
                            permissionId: item?.permissionId,
                            module: item?.module,
                            permission: item?.permission,
                            description: item?.desc
                        }))}
                        columns={[
                            // {
                            //     header: 'Module Name',
                            //     field: 'permissionId',
                            //     filter: true,
                            //     bodyStyle: { minWidth: 150, maxWidth: 150 },
                            //     filterPlaceholder: 'Role'
                            // },
                            {
                                header: 'Sr. No.',
                                body: (data: any, options: any) => {
                                    const normalizedRowIndex = options.rowIndex % limit;
                                    const srNo = (page - 1) * limit + normalizedRowIndex + 1;

                                    return <span>{srNo}</span>;
                                },
                                bodyStyle: { minWidth: 50, maxWidth: 50 }
                            },
                            {
                                header: 'Module Name',
                                field: 'module',
                                filter: true,
                                bodyStyle: { minWidth: 150, maxWidth: 150 },
                                filterPlaceholder: 'Role'
                            },
                            {
                                header: 'Permission Name',
                                field: 'permission',
                                filter: true,
                                bodyStyle: { minWidth: 150, maxWidth: 150 },
                                filterPlaceholder: 'Role'
                            },
                            {
                                header: 'Description',
                                field: 'description',
                                filter: true,
                                bodyStyle: { minWidth: 150, maxWidth: 150 },
                                filterPlaceholder: 'Role'
                            }
                        ]}
                        onLoad={(params: any) => fetchData(params)}
                        onDelete={(item: any) => onRowSelect(item, 'delete')}
                    />
                </div>
                <Dialog
                    header="Delete confirmation"
                    visible={isDeleteDialogVisible}
                    style={{ width: layoutState.isMobile ? '90vw' : '50vw' }}
                    className="delete-dialog"
                    headerStyle={{ backgroundColor: '#ffdddb', color: '#8c1d18' }}
                    footer={
                        <div className="flex justify-content-end p-2">
                            <Button label="Cancel" severity="secondary" text onClick={closeDeleteDialog} />
                            <Button label="Delete" severity="danger" onClick={onDelete} />
                        </div>
                    }
                    onHide={closeDeleteDialog}
                >
                    {isLoading && (
                        <div className="center-pos">
                            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                        </div>
                    )}
                    <div className="flex flex-column w-full surface-border p-3">
                        <div className="flex align-items-center">
                            <i className="pi pi-info-circle text-6xl red" style={{ marginRight: 10 }}></i>
                            <span>
                                This will permanently delete the selected role.
                                <br />
                                Do you still want to delete it? This action cannot be undone.
                            </span>
                        </div>
                    </div>
                </Dialog>
            </div>
        </>
    );
};

export default PermissionManagement;
