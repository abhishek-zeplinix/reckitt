import { InputText } from "primereact/inputtext"
import { useContext, useEffect, useState } from "react"
import SubmitResetButtons from "./submit-reset-buttons"
import { DeleteCall, GetCall, PostCall } from "@/app/api-config/ApiKit"
import { useAppContext } from "@/layout/AppWrapper"
import CustomDataTable from "../CustomDataTable"
import { getRowLimitWithScreenHeight } from "@/utils/uitl"
import { Dialog } from "primereact/dialog"
import { Button } from "primereact/button"
import { ProgressSpinner } from "primereact/progressspinner"
import { LayoutContext } from "@/layout/context/layoutcontext"

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};


const AddRoleControl = () => {

    const [role, setRole] = useState<any>("");
    const [rolesList, setRolesList] = useState<any>([])
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<any>();
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState<any>(false);
    const [selectedRoleId, setSelectedRoleId] = useState<any>();

    const { layoutState } = useContext(LayoutContext);
    const { setAlert, setLoading, isLoading } = useAppContext();


    useEffect(() => {
        fetchData();
    }, [])


    const fetchData = async (params?: any) => {

        setLoading(true);

        try {

            const response = await GetCall('/company/roles');
            setRolesList(response.data)
            setTotalRecords(response.total);

        } catch (err) {

            setAlert("error", "Something went wrong!")

        } finally {

            setLoading(false);

        }

    }


    const handleSubmit = async () => {
        setLoading(true);
        try {

            const payload = { name: role }
            const response = await PostCall('/company/roles', payload);
            console.log(response);

            if (response.code.toLowerCase() === 'success') {
                setAlert('success', "Role successfully added!!")
                resetInput();
                fetchData();
            }

        } catch (err) {
            setAlert("error", "Something went wrong!")

        } finally {
            setLoading(false);
        }

    }

    const onDelete = async () => {
        setLoading(true);

        try {
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
        setRole("")
    }

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
                <InputText
                    aria-label="Add Role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: '50%' }}
                />
                <small><i>
                    Enter a role you want to add.
                </i></small>
                <SubmitResetButtons onSubmit={handleSubmit} onReset={resetInput} label="Add Role" />
            </div>

            <div className="mt-4">

                <CustomDataTable
                    ref={rolesList}
                    // filter
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
                        },

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




        </>
    )
}

export default AddRoleControl;