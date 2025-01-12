import { useContext, useEffect, useState } from 'react';
import { GetCall, PostCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import CustomDataTable from '../CustomDataTable';
import { getRowLimitWithScreenHeight } from '@/utils/utils';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { MultiSelect } from 'primereact/multiselect';
import { CustomResponse } from '@/types';
const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const Routes = () => {
    const [routeList, setRoutesList] = useState<any>([]);
    const [routeId, setSelectedRouteId] = useState<any>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<any>();
    const [permissions, setPermissions] = useState<any>([]); // Store fetched permissions
    const [selectedPermissions, setSelectedPermissions] = useState<any>([]); // Store selected permissionIds
    const [visible, setVisible] = useState(false);
    const { setAlert, setLoading, isLoading } = useAppContext();
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    useEffect(() => {
        fetchData();
        fetchPermissionData();
    }, []);

    const fetchData = async (params?: any) => {
        setLoading(true);
        try {
            const response = await GetCall('/settings/routes');
            setRoutesList(response.data);
            setTotalRecords(response.total);
            console.log(response.data, 'abhishek');
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

            console.log('Fetched Permissions Response:', response);

            const formattedPermissions = response.data.map((permission: any) => ({
                label: permission.permission,
                value: permission.permissionId
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

        const payload = [
            {
                routeId: routeId,
                permissionId: selectedPermissions.toString(),
                action: 'add'
            }
        ];

        try {
            const response: CustomResponse = await PostCall('/settings/sync-route-permissions', payload);

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
        if (action === ACTIONS.VIEW) {
            openViewDialog(perm);
            setSelectedRouteId(perm.routeId);
            setSelectedRoute(perm.path);
            console.log(perm.routeId, 'abhishek');
            console.log(perm.method);
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
                    ref={routeList}
                    page={page}
                    limit={limit} // no of items per page
                    totalRecords={totalRecords} // total records from api response
                    isView={true}
                    isEdit={false} // show edit button
                    isDelete={false} // show delete button
                    data={routeList?.map((item: any) => ({
                        routeId: item?.routeId,
                        method: item?.method,
                        path: item?.path
                    }))}
                    columns={[
                        {
                            header: 'Role ID',
                            field: 'routeId',
                            filter: true,
                            sortable: true,
                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                            filterPlaceholder: 'Role ID'
                        },
                        {
                            header: 'Role',
                            field: 'method',
                            filter: true,
                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                            filterPlaceholder: 'Role'
                        },
                        {
                            header: 'Role',
                            field: 'path',
                            filter: true,
                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                            filterPlaceholder: 'Role'
                        }
                    ]}
                    onView={(item: any) => onRowSelect(item, 'view')}
                />
            </div>

            <Dialog
                header={`Select permission for route: ${selectedRoute || 'N/A'}`}
                visible={visible}
                style={{ width: '50vw', height: '40rem' }}
                onHide={() => {
                    if (!visible) return;
                    setVisible(false);
                }}
            >
                <MultiSelect
                    value={selectedPermissions}
                    onChange={(e) => setSelectedPermissions(e.value)}
                    options={permissions}
                    optionLabel="label"
                    filter
                    placeholder="Select Permissions"
                    panelFooterTemplate={multiSelectFooter}
                    maxSelectedLabels={3}
                    className="w-full"
                />
            </Dialog>
        </>
    );
};

export default Routes;
