import { InputText } from 'primereact/inputtext';
import { useContext, useEffect, useState } from 'react';
import { DeleteCall, GetCall, PostCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import CustomDataTable from '../CustomDataTable';
import { getRowLimitWithScreenHeight } from '@/utils/uitl';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { MultiSelect } from 'primereact/multiselect';
import { CustomResponse } from '@/types';
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
    const [selectedRoleId, setSelectedRoleId] = useState<any>();
    const [permissions, setPermissions] = useState<any>([]); // Store fetched permissions
    const [selectedPermissions, setSelectedPermissions] = useState<any>([]); // Store selected permissionIds
    const [visible, setVisible] = useState(false);
    const { layoutState } = useContext(LayoutContext);
    const { setAlert, setLoading, isLoading } = useAppContext();
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [module, setModule] = useState('');
    const [permissionData, setPermissionData] = useState('');
    const [description, setdescription] = useState('');
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

    const handleSubmit = async () => {
        if (!selectedPermissions) {
            setAlert('Error', 'Please select permissions');
            return;
        }

        setIsDetailLoading(true);

        // const payload = {
        //     roleId: createRole,
        //     name: roleName,
        //     email: roleEmail,
        //     password: rolePassword,
        //     phone: rolePhone
        // };
        const payload = {
            roleId: selectedRoleId,
            permissionId: selectedPermissions
        };
        console.log(selectedRoleId, 'Abh');

        try {
            const response: CustomResponse = await PostCall('/settings/role-permissions', payload);

            if (response.code === 'SUCCESS') {
                setAlert('success', 'Permission added successfully!');
                setVisible(false);
                setSelectedPermissions(null);
            } else {
                setAlert('error', response.message || 'Failed to provide permissions.');
            }
        } catch (error) {
            console.error('Error submitting permissions :', error);
            setAlert('error', 'An error occurred while submitting permissions .');
        } finally {
            setLoading(false);
        }
    };

    const openViewDialog = (items: any) => {
        setVisible(true);
    };

    const onRowSelect = async (perm: any, action: any) => {
        // setAction(action);

        if (action === ACTIONS.VIEW) {
            openViewDialog(perm);
            setSelectedRoleId(perm.roleId);
            setSelectedRole(perm.role);
            console.log(perm.roleId);
            console.log(perm.role);
        }
    };
    const multiSelectFooter = () => {
        return (
            <div className="flex justify-content-end p-2 footer-panel">
                <Button label="Cancel" severity="secondary" text onClick={() => {}} />
                <Button label="Ok" text onClick={handleSubmit} />
            </div>
        );
    };

    return (
        <>
            <div className="mt-1">
                <CustomDataTable
                    ref={rolesList}
                    // filter
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
                        {
                            header: 'Role ID',
                            field: 'roleId',
                            filter: true,
                            sortable: true,
                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                            filterPlaceholder: 'Role ID'
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
                style={{ width: '50vw', height: '40rem' }}
                onHide={() => {
                    if (!visible) return;
                    setVisible(false);
                }}
            >
                <MultiSelect
                    value={selectedPermissions} // Selected permissionIds
                    onChange={(e) => setSelectedPermissions(e.value)} // Update selected permissionIds
                    options={permissions} // Pass the formatted permissions as options
                    optionLabel="label" // Use 'label' to display the permission name
                    filter // Enable filtering
                    placeholder="Select Permissions" // Placeholder text
                    panelFooterTemplate={multiSelectFooter} // Optional footer template
                    maxSelectedLabels={3} // Limit the number of selected labels
                    className="w-full"
                />
            </Dialog>
        </>
    );
};

export default Permission;
