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
import TableSkeletonSimple from '../skeleton/TableSkeletonSimple';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const AddRegionControl = () => {
    const [region, setRegion] = useState<any>('');
    const [regionList, setRegionList] = useState<any>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<any>();
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState<any>(false);
    const [selectedRegionId, setSelectedRegionId] = useState<any>();
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const { layoutState } = useContext(LayoutContext);
    const { setAlert, setLoading, isLoading } = useAppContext();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (params?: any) => {
        setLoading(true);

        try {
            const response = await GetCall('/company/region');
            setRegionList(response.data);
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
                const payload = { regionName: region };
                const response = await PutCall(`/company/region/${selectedRegionId}`, payload);

                if (response.code.toLowerCase() === 'success') {
                    setAlert('success', 'Region successfully updated!');
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
                const payload = { regionName: region };
                const response = await PostCall('/company/region', payload);

                if (response.code.toLowerCase() === 'success') {
                    setAlert('success', 'Region successfully added!');
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
            const response = await DeleteCall(`/company/region/${selectedRegionId}`);

            if (response.code.toLowerCase() === 'success') {
                setRegionList((prevRoles: any) => prevRoles.filter((region: any) => region.regionId !== selectedRegionId));
                fetchData();
                closeDeleteDialog();
                setAlert('success', 'Region successfully deleted!');
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
        setRegion('');
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
            setSelectedRegionId(perm.regionId);
        }
        if (action === ACTIONS.EDIT) {
            setRegion(perm.regionName);
            setSelectedRegionId(perm.regionId);
            setIsEditMode(true);
        }
    };

    return (
        <>
            <div className="flex flex-column justify-center items-center gap-2">
                <label htmlFor="region">Add Region</label>
                <InputText aria-label="Add Region" value={region} onChange={(e) => setRegion(e.target.value)} style={{ width: '50%' }} />
                <small>
                    <i>Enter a region you want to add.</i>
                </small>
                <SubmitResetButtons onSubmit={handleSubmit} onReset={resetInput} label={isEditMode ? 'Update Region' : 'Add Region'} />
            </div>

            <div className="mt-4">
            {isLoading ?(
                    <TableSkeletonSimple columns={2} rows={limit} />
                ) : (
                <CustomDataTable
                    ref={regionList}
                    page={page}
                    limit={limit} // no of items per page
                    totalRecords={totalRecords} // total records from api response
                    isView={false}
                    isEdit={true} // show edit button
                    isDelete={true} // show delete button
                    data={regionList?.map((item: any) => ({
                        regionId: item?.regionId,
                        regionName: item?.regionName
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
                            header: 'Region Name',
                            field: 'regionName',
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
                        <span>Are you sure you want to delete this region? </span>
                        <span>This action cannot be undone. </span>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default AddRegionControl;
