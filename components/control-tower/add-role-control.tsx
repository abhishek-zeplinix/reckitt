import { InputText } from 'primereact/inputtext';
import { useContext, useEffect, useState } from 'react';
import SubmitResetButtons from './submit-reset-buttons';
import { DeleteCall, GetCall, PostCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import CustomDataTable from '../CustomDataTable';
import { getRowLimitWithScreenHeight } from '@/utils/utils';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { LayoutContext } from '@/layout/context/layoutcontext';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const AddRoleControl = () => {
    const [role, setRole] = useState<any>('');
    const [rolesList, setRolesList] = useState<any>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<any>();
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState<any>(false);
    const [selectedRoleId, setSelectedRoleId] = useState<any>();

    const { layoutState } = useContext(LayoutContext);
    const { setAlert, setLoading, isLoading } = useAppContext();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (params?: any) => {
        try {
            setLoading(true);
            const response = await GetCall('/company/roles');
            setRolesList(response.data);
            setTotalRecords(response.total);
        } catch (err) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const payload = { name: role };
            const response = await PostCall('/company/roles', payload);

            if (response.code.toLowerCase() === 'success') {
                setAlert('success', 'Role successfully added!!');
                resetInput();
                fetchData();
            }
        } catch (err) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            const response = await DeleteCall(`/company/roles/${selectedRoleId}`);

            if (response.code.toLowerCase() === 'success') {
                setRolesList((prevRoles: any) => prevRoles.filter((role: any) => role.roleId !== selectedRoleId));

                closeDeleteDialog();
                setAlert('success', 'Role successfully deleted!');
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

    const resetInput = () => {
        setRole('');
    };

    const openDeleteDialog = (items: any) => {
        setIsDeleteDialogVisible(true);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogVisible(false);
    };

    const onRowSelect = async (perm: any, action: any) => {
        // setAction(action);

        if (action === ACTIONS.DELETE) {
            openDeleteDialog(perm);
            setSelectedRoleId(perm.roleId);
        }
    };

    return (
        <>
            <div className="flex flex-column justify-center items-center gap-2">
                <label htmlFor="role">Add Role</label>
                <InputText aria-label="Add Role" value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '50%' }} />
                <small>
                    <i>Enter a role you want to add.</i>
                </small>
                <SubmitResetButtons onSubmit={handleSubmit} onReset={resetInput} label="Add Role" />
            </div>

            <div className="mt-4">
                <CustomDataTable
                    ref={rolesList}
                    page={page}
                    limit={limit} // no of items per page
                    totalRecords={totalRecords} // total records from api response
                    isView={false}
                    isEdit={false} // show edit button
                    isDelete={true} // show delete button
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
                    onDelete={(item: any) => onRowSelect(item, 'delete')}
                />
            </div>

            <Dialog
                header="Delete confirmation"
                visible={isDeleteDialogVisible}
                style={{ width: layoutState.isMobile ? '90vw' : '50vw' }}
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
                <div className="flex flex-column w-full surface-border p-2 text-center gap-4">
                    <i className="pi pi-info-circle text-6xl" style={{ marginRight: 10, color: '#DF1740' }}></i>

                    <div className="flex flex-column align-items-center gap-1">
                        <span>Are you sure you want to delete this role? </span>
                        <span>This action cannot be undone. </span>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default AddRoleControl;
