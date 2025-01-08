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
    const [permission, setPermission] = useState<any>();
    const [visible, setVisible] = useState(false);
    const { layoutState } = useContext(LayoutContext);
    const { setAlert, setLoading, isLoading } = useAppContext();
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [selectedCities, setSelectedCities] = useState(null);
    const cities = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];
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
            const response = await GetCall('/company/permissions');
            setPermission(response.data);
            setTotalRecords(response.total);
        } catch (err) {
            setAlert('error', 'Something went wrong!');
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
                <Button label="Ok" text onClick={() => {}} />
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
                    value={selectedCities}
                    onChange={(e) => setSelectedCities(e.value)}
                    options={cities}
                    optionLabel="name"
                    filter
                    placeholder="Select Cities"
                    panelFooterTemplate={multiSelectFooter}
                    maxSelectedLabels={3}
                    className="w-full "
                />
            </Dialog>
        </>
    );
};

export default Permission;
