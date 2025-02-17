import { InputText } from 'primereact/inputtext';
import { useContext, useEffect, useState } from 'react';
import SubmitResetButtons from '../control-tower/submit-reset-buttons';
import { DeleteCall, GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import CustomDataTable from '../CustomDataTable';
import { getRowLimitWithScreenHeight } from '@/utils/utils';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { LayoutContext } from '@/layout/context/layoutcontext';
import TableSkeletonSimple from '../supplier-rating/skeleton/TableSkeletonSimple';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const AddPosition = () => {
    const [rolesList, setRolesList] = useState<any>([]);
    const [position, setPosition] = useState<any>('');
    const [positionList, setpositionList] = useState<any>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<any>();
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState<any>(false);
    const [selectedPositionId, setSelectedPositionId] = useState<any>();
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const { layoutState } = useContext(LayoutContext);
    const { setAlert, setLoading, isLoading } = useAppContext();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (params?: any) => {
        setLoading(true);

        try {
            const response = await GetCall('/company/position');
            setpositionList(response.data);
            setTotalRecords(response.total);
        } catch (err) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);

        if (isEditMode) {
            try {
                const payload = { positionName: position };
                const response = await PutCall(`/company/position/${selectedPositionId}`, payload);

                if (response.code.toLowerCase() === 'success') {
                    setAlert('success', 'Position successfully updated!');
                    resetInput();
                    fetchData();
                }
            } catch (err) {
                setAlert('error', 'Something went wrong!');
            } finally {
                setLoading(false);
            }
        } else {
            try {
                const payload = { positionName: position };
                const response = await PostCall('/company/position', payload);

                if (response.code.toLowerCase() === 'success') {
                    setAlert('success', 'Position successfully added!');
                    resetInput();
                    fetchData();
                }
            } catch (err) {
                setAlert('error', 'Something went wrong!');
            } finally {
                setLoading(false);
            }
        }
        resetInput();
    };

    const onDelete = async () => {
        setLoading(true);

        try {
            const response = await DeleteCall(`/company/position/${selectedPositionId}`);

            if (response.code.toLowerCase() === 'success') {
                setRolesList((prevRoles: any) => prevRoles.filter((position: any) => position.positionId!== selectedPositionId));
                fetchData();
                closeDeleteDialog();
                setAlert('success', 'Position successfully deleted!');
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
        setPosition('');
        setIsEditMode(false);
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
            setSelectedPositionId(perm.positionId);
        }

        if (action === ACTIONS.EDIT) {
            setPosition(perm.positionName);
            setSelectedPositionId(perm.positionId);
            setIsEditMode(true);
        }
    };

    return (
        <>
            <div className="flex flex-column justify-center items-center gap-2">
                <label htmlFor="position">Position</label>
                <InputText aria-label="Add Position" value={position} onChange={(e) => setPosition(e.target.value)} style={{ width: '50%' }} />
                <small>
                    <i>Enter a Position you want to add.</i>
                </small>
                <SubmitResetButtons onSubmit={handleSubmit} onReset={resetInput} label={isEditMode ? 'Update Position' : 'Add Position'} />
            </div>

            <div className="mt-4">
            {isLoading ?(
                    <TableSkeletonSimple columns={2} rows={limit} />
                ) : (
                <CustomDataTable
                    ref={positionList}
                    page={page}
                    limit={limit} // no of items per page
                    totalRecords={totalRecords} // total records from api response
                    isView={false}
                    isEdit={true} // show edit button
                    isDelete={true} // show delete button
                    data={positionList?.map((item: any) => ({
                        positionId: item?.positionId,
                        positionName: item?.positionName
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
                            header: 'Position Name',
                            field: 'positionName',
                            filter: true,
                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                            filterPlaceholder: 'Role'
                        }
                    ]}
                    onLoad={(params: any) => fetchData(params)}
                    onDelete={(item: any) => onRowSelect(item, 'delete')}
                    onEdit={(item: any) => onRowSelect(item, 'edit')}
                />
                )}
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
                        <span>Are you sure you want to delete this Position? </span>
                        <span>This action cannot be undone. </span>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default AddPosition;
