import { useContext, useEffect, useState } from 'react';
import { GetCall, PostCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import CustomDataTable from '../CustomDataTable';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { CustomResponse } from '@/types';
import { ProgressSpinner } from 'primereact/progressspinner';
import SubmitResetButtons from './submit-reset-buttons';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const Permission = () => {
    const [rolesList, setRolesList] = useState<any>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<any>();
    // const [selectedRoleId, setSelectedRoleId] = useState<any>();
    const [permissions, setPermissions] = useState<any>([]); // Store fetched permissions
    const [selectedPermissions, setSelectedPermissions] = useState<any>([]); // Store selected permissionIds
    const [visible, setVisible] = useState(false);
    const { setAlert, setLoading, isLoading } = useAppContext();
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [specificRolePermissions, setSpecificRolePermissions] = useState<any>([]);
    const [roleId, setSelectedRoleId] = useState<any>([]);

    useEffect(() => {
        fetchData();
        fetchPermissionData();
    }, []);

    const fetchData = async (params?: any) => {
        setLoading(true);

        try {
            const response = await GetCall('/company/roles');
            setRolesList(response.data);
            setTotalRecords(response.total);
        } catch (err) {
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
            console.log('Fetched Permissions Response:', response.data);

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

    // const fetchPermissionsByRoleId = async (rId: Number) => {
    //     try {
    //         setIsDetailLoading(true);
    //         const params = {filters: {roleId: rId}}

    //         const queryString = buildQueryParams(params);

    //         const response = await GetCall(`/settings/role-permissions?${queryString}`);
    //         console.log('Fetched role permissions:', response.data);
    //         setSpecificRolePermissions(response.data);
    //         console.log(response.data);

    //         // pre-select existing permissions in MultiSelect
    //         // const existingPermissionIds = response.data.permission.map((perm: any) => perm.permission.permissionId);
    //         const existingPermissionIds = response.data.map((item: any) => item.permission.permissionId);

    //         console.log('existing permissions',existingPermissionIds);

    //         setSelectedPermissions(existingPermissionIds);
    //     } catch (error) {
    //         setAlert('error', 'Failed to fetch role permissions');
    //     } finally {
    //         setIsDetailLoading(false);
    //     }
    // };

    const fetchPermissionsByRoleId = async (rId: Number) => {
        try {
            setIsDetailLoading(true);
            const params = { filters: { roleId: rId }, pagination: false };
            const queryString = buildQueryParams(params);

            const response = await GetCall(`/settings/role-permissions?${queryString}`);
            console.log('Fetched role permissions:', response.data);

            // Update to handle the new response structure
            setSpecificRolePermissions({
                permissions: response.data.map((item: any) => ({
                    routePermissionId: item.rolePermissionId,
                    permission: {
                        permissionId: item.permission.permissionId,
                        permission: item.permission.permission,
                        module: item.permission.module
                    }
                }))
            });

            // Update selected permissions based on the new structure
            const existingPermissionIds = response.data.map((item: any) => item.permission.permissionId);

            console.log('existing permissions', existingPermissionIds);
            setSelectedPermissions(existingPermissionIds);
        } catch (error) {
            setAlert('error', 'Failed to fetch role permissions');
        } finally {
            setIsDetailLoading(false);
        }
    };

    const openViewDialog = async (items: any) => {
        setVisible(true);
        // selectedRoleId(items.rouleId);
        console.log(items);

        setSelectedRoleId(items.roleId);
        setSelectedRole(items.role);
        await fetchPermissionsByRoleId(items.roleId);
    };

    const onRowSelect = (perm: any, action: any) => {
        if (action === ACTIONS.VIEW) {
            openViewDialog(perm);
        }
    };

    // const handleSubmit = async () => {

    //     setIsDetailLoading(true);

    //     // get the current permissions for comparison
    //     const currentPermissions = specificRolePermissions?.permissions?.map((perm: any) => perm.permission.permissionId) || [];

    //     const payloadToSend = [];

    //     // this haandles removed permissions
    //     for (const permId of currentPermissions) {
    //         if (!selectedPermissions.includes(permId)) {
    //             payloadToSend.push({
    //                 roleId: roleId,
    //                 permissionId: permId,
    //                 action: 'remove'
    //             });
    //         }
    //     }

    //     //this handles added permissions
    //     for (const permId of selectedPermissions) {
    //         if (!currentPermissions.includes(permId)) {
    //             payloadToSend.push({
    //                 roleId: roleId,
    //                 permissionId: permId,
    //                 action: 'add'
    //             });
    //         }
    //     }

    //     try {
    //         if (payloadToSend.length === 0) {
    //             setAlert('info', 'No changes to submit');
    //             return;
    //         }

    //         const response: CustomResponse = await PostCall('/settings/role-permissions', payloadToSend);

    //         if (response.code === 'SUCCESS') {
    //             setAlert('success', 'Permissions updated successfully!');
    //             // Refresh the permissions list for this role
    //             await fetchPermissionsByRoleId(roleId);
    //         } else {
    //             setAlert('error', response.message || 'Failed to update permissions.');
    //         }
    //     } catch (error) {
    //         console.error('Error submitting permissions:', error);
    //         setAlert('error', 'An error occurred while updating permissions.');
    //     } finally {
    //         setIsDetailLoading(false);
    //     }

    // };

    const handleSubmit = async () => {
        setIsDetailLoading(true);

        // Get current permissions from the new structure
        const currentPermissions = specificRolePermissions?.permissions?.map((perm: any) => perm.permission.permissionId) || [];

        // const payloadToSend = [];

        // // Handle removed permissions
        // for (const permId of currentPermissions) {
        //     if (!selectedPermissions.includes(permId)) {
        //         payloadToSend.push({
        //             roleId: roleId,
        //             permissionId: permId,
        //             // action: 'remove'
        //         });
        //     }
        // }

        // // Handle added permissions
        // for (const permId of selectedPermissions) {
        //     if (!currentPermissions.includes(permId)) {
        //         payloadToSend.push({
        //             roleId: roleId,
        //             permissionId: permId,
        //             // action: 'add'
        //         });
        //     }
        // }

        const payload = {
            roleId: roleId,
            permissionId: selectedPermissions
        };

        // Check if there are any changes
        if (!payload.permissionId || payload.permissionId.length === 0) {
            setAlert('info', 'No permissions selected');
            return;
        }

        try {
            // if (payloadToSend.length === 0) {
            //     setAlert('info', 'No changes to submit');
            //     return;
            // }

            const response: CustomResponse = await PostCall('/settings/role-permissions', payload);

            if (response.code === 'SUCCESS') {
                setAlert('success', 'Permissions updated successfully!');
                await fetchPermissionsByRoleId(roleId);
            } else {
                setAlert('error', response.message || 'Failed to update permissions.');
            }
        } catch (error) {
            console.error('Error submitting permissions:', error);
            setAlert('error', 'An error occurred while updating permissions.');
        } finally {
            setIsDetailLoading(false);
        }
    };

    const multiSelectFooter = () => {
        return (
            <div className="flex justify-content-end p-2 footer-panel gap-3">
                {/* <Button
                    label="Reset"
                    className='bg-white text-primary-main border-none'
                    onClick={() => setSelectedPermissions([])}
                />
                <Button
                    label="Ok"
                    className='bg-primary-main text-white'
                    onClick={handleSubmit}
                    disabled={!selectedPermissions || selectedPermissions.length === 0}
                /> */}

                <SubmitResetButtons onSubmit={handleSubmit} onReset={() => setSelectedPermissions([])} label="Assign" />
            </div>
        );
    };

    const isSmallScreen = window.innerWidth <= 768;

    const DilogBoxstyle = {
        width: isSmallScreen ? '80%' : '40vw',
        maxHeight: isSmallScreen ? '80%' : '50vh'
    };

    return (
        <>
            <div className="mt-1">
                <CustomDataTable
                    ref={rolesList}
                    page={page}
                    limit={limit} // no of items per page
                    totalRecords={totalRecords} // total records from api response
                    isView={true}
                    isEdit={false} // show edit button
                    isDelete={false} // show delete button
                    data={rolesList?.map((item: any) => ({
                        roleId: item?.roleId,
                        role: item?.name
                    }))}
                    columns={[
                        // {
                        //     header: 'Role ID',
                        //     field: 'roleId',
                        //     filter: true,
                        //     sortable: true,
                        //     bodyStyle: { minWidth: 150, maxWidth: 150 },
                        //     filterPlaceholder: 'Role ID'
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
                            header: 'Role',
                            field: 'role',
                            filter: true,
                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                            filterPlaceholder: 'Role'
                        }
                    ]}
                    onLoad={(params: any) => fetchData(params)}
                    onView={(item: any) => onRowSelect(item, 'view')}
                />
            </div>

            <Dialog
                header={`Select permission for role: ${selectedRole || 'N/A'}`}
                visible={visible}
                style={DilogBoxstyle}
                onHide={() => {
                    if (!visible) return;
                    setVisible(false);
                    setSelectedPermissions([]);
                }}
            >
                <div className="space-y-6">
                    <div>
                        <MultiSelect
                            value={selectedPermissions}
                            onChange={(e) => setSelectedPermissions(e.value)}
                            options={permissions}
                            optionLabel="label"
                            filter
                            placeholder="Select Permissions"
                            panelFooterTemplate={multiSelectFooter}
                            // maxSelectedLabels={3}
                            className="w-full"
                            display="chip"
                        />
                    </div>

                    {isDetailLoading ? (
                        <div className="text-center py-4">
                            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                        </div>
                    ) : (
                        <div className="mt-2">
                            <div className="flex align-items-center gap-2 mb-3">
                                <i className="pi pi-shield text-primary text-xl"></i>
                                <h3 className="text-xl font-medium">Current Permissions</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {specificRolePermissions?.permissions?.map((permissionData: any) => (
                                    <div key={permissionData.routePermissionId} className="flex align-items-center p-3 bg-gray-50 border-round border-1 surface-border hover:surface-100 transition-colors">
                                        <div className="w-2 h-2 border-circle bg-green-500 mr-3"></div>
                                        <div className="flex flex-column">
                                            <span className="text-700 font-medium">{permissionData.permission.permission}</span>
                                            <span className="text-500 text-sm">{permissionData.permission.module}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {(!specificRolePermissions?.permissions || specificRolePermissions.permissions.length === 0) && (
                                <div className="text-center py-6">
                                    <i className="pi pi-shield text-500 text-4xl mb-3 block"></i>
                                    <p className="text-500">No permissions assigned to this role yet</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Dialog>
        </>
    );
};

export default Permission;
