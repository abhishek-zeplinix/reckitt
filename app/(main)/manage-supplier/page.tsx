/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useRef, useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { useAppContext } from '@/layout/AppWrapper';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { get } from 'lodash';
import { CustomResponse } from '@/types';
import { InputText } from 'primereact/inputtext';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/uitl';
import { DeleteCall, GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { Supplier } from '@/types';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { EmptySupplier } from '@/types/forms';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import Sidebar from '@/components/Sidebar';
import Stepper from '@/components/Stepper';
const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    DELETE: 'delete',
    VIEW: 'view'
};
const defaultForm: EmptySupplier = {
    supId: null,
    supplierName: '',
    supplierManufacturerName: '',
    siteAddress: '',
    procurementCategoryId: null,
    supplierCategoryId: null,
    warehouseLocation: '',
    factoryId: null,
    gmpFile: '',
    gdpFile: '',
    reachFile: '',
    isoFile: '',
    locationId: null,
    sublocationId: null,
    // supId:number;
    // supplierName:string;
    // supplierManufacturerName:string;
    // warehouseLocation:string;
    // siteAddress:string;
    category: {
        categoryId: null,
        categoryName: ''
    },
    subCategories: {
        subCategoryId: null,
        subCategoryName: ''
    },
    factoryName: {
        factoryId: null,
        factoryName: ''
    }
};

const ManageSupplierPage = () => {
    const totalSteps = 3;
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<boolean[]>(Array(totalSteps).fill(false));
    const { user, isLoading, setLoading, setScroll, setAlert } = useAppContext();
    const router = useRouter();
    const [factoryDetails, setFactoryDetails] = useState<any>([]);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [category, setCategory] = useState<any>([]);
    const [subCategory, setSubCategory] = useState<any>([]);
    const [locationDetails, setLocationDetails] = useState<any>([]);
    const [subLocationDetails, setSubLocationDetails] = useState<any>([]);
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState<boolean>(false);
    const [companies, setCompanies] = useState<Supplier[]>([]);
    const [page, setPage] = useState<number>(1);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);
    const [action, setAction] = useState<any>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
    const [form, setForm] = useState<EmptySupplier>(defaultForm);
    const [selectedSupplierToDelete, setSelectedSupplierToDelete] = useState<Supplier | null>(null);
    const [selectedDropdownValue, setSelectedDropdownValue] = useState<number | null>(null);
    const [checked, setChecked] = useState({
        gmp: false,
        gdp: false,
        reach: false,
        iso: false
    });

    useEffect(() => {
        setScroll(true);
        fetchData();
        // fetchRolesData();
        return () => {
            // setScroll(true);
        };
    }, []);
    useEffect(() => {
        fetchFactory();
        fetchCategory();
        fetchSubCategory();
        fetchLocation();
        fetchSubLocation();
    }, []);

    const fetchData = async (params?: any) => {
        if (!params) {
            params = { limit: limit, page: page };
        }
        setLoading(true);
        const queryString = buildQueryParams(params);
        const response: CustomResponse = await GetCall(`/company/supplier?${queryString}`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setCompanies(response.data);

            if (response.total) {
                setTotalRecords(response?.total);
            }
        } else {
            setCompanies([]);
        }
    };
    const confirmDelete = async () => {
        if (!selectedSupplierToDelete) return;
        setLoading(true);
        const response: CustomResponse = await DeleteCall(`/company/supplier/${selectedSupplierToDelete.supId}`);
        setLoading(false);
        if (response.code === 'SUCCESS') {
            setIsDeleteDialogVisible(false);
            fetchData();
            setAlert('success', 'Successfully Deleted');
        } else {
            setAlert('error', response.message);
        }
    };
    const openDeleteDialog = (perm: Supplier) => {
        setSelectedSupplierToDelete(perm);
        setIsDeleteDialogVisible(true);
    };
    const closeDeleteDialog = () => {
        setIsDeleteDialogVisible(false);
        setSelectedSupplierToDelete(null);
    };

    const onNewAdd = async (companyForm: any) => {
        if (action == ACTIONS.ADD) {
            setIsDetailLoading(true);
            const response: CustomResponse = await PostCall(`/company/supplier`, companyForm);
            setIsDetailLoading(false);
            if (response.code == 'SUCCESS') {
                // setSelectedCompany(response.data)
                setAlert('success', 'Supplier Added Successfully');
                dataTableRef.current?.updatePagination(1);
                router.push('/manage-supplier');
            } else {
                setAlert('error', response.message);
            }
        }
        if (action == ACTIONS.EDIT) {
            setIsDetailLoading(true);
            const response: CustomResponse = await PutCall(`/company/supplier/${selectedSupplier?.supId}`, companyForm);
            setIsDetailLoading(false);
            if (response.code == 'SUCCESS') {
                // setSelectedCompany(response.data)
                setAlert('success', 'Supplier Updated Successfully');
                dataTableRef.current?.updatePagination(1);
                // router.push('/manage-supplier');
            } else {
                setAlert('error', response.message);
            }
        }
    };

    // Navigation Handlers
    const handleNext = () => {
        if (currentStep < totalSteps) {
            const newCompletedSteps = [...completedSteps];
            newCompletedSteps[currentStep - 1] = true;
            setCompletedSteps(newCompletedSteps);
            setCurrentStep((prevStep) => prevStep + 1);
        }
    };
    const fetchFactory = async () => {
        // const companyId = get(user, 'company.companyId');
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/factory`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            // setsingleRoleId(response.data.roleId);

            setFactoryDetails(response.data);
        } else {
            setFactoryDetails([]);
        }
    };
    const fetchLocation = async () => {
        // const companyId = get(user, 'company.companyId');
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/location`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            // setsingleRoleId(response.data.roleId);

            setLocationDetails(response.data);
        } else {
            setLocationDetails([]);
        }
    };
    const fetchSubLocation = async () => {
        // const companyId = get(user, 'company.companyId');
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/sub-location`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            // setsingleRoleId(response.data.roleId);

            setSubLocationDetails(response.data);
        } else {
            setSubLocationDetails([]);
        }
    };
    const fetchCategory = async () => {
        // const companyId = get(user, 'company.companyId');
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/category`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            // setsingleRoleId(response.data.roleId);

            setCategory(response.data);
        } else {
            setCategory([]);
        }
    };
    const fetchSubCategory = async () => {
        // const companyId = get(user, 'company.companyId');
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/sub-category`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            // setsingleRoleId(response.data.roleId);

            setSubCategory(response.data);
        } else {
            setSubCategory([]);
        }
    };

    const closeIcon = () => {
        setSelectedSupplier(null);
        setIsShowSplit(false);
        setForm(defaultForm);
        setAction(null);
        // setSelectedKeys(null);
    };
    const showAddNew = () => {
        // fetchPermissions();
        setIsShowSplit(true);
        setAction('add');
        setSelectedSupplier(null);
        setForm(defaultForm);
    };

    const onInputChange = (name: string | { [key: string]: any }, val?: any) => {
        setForm((Form: any) => {
            let updatedForm = { ...Form };

            if (typeof name === 'string') {
                updatedForm[name] = val;
            } else {
                updatedForm = { ...updatedForm, ...name };
            }

            return updatedForm;
        });
    };
    const handlePrevious = () => {
        if (currentStep > 1) {
            const newCompletedSteps = [...completedSteps];
            newCompletedSteps[currentStep - 2] = false; // Revert previous step to incomplete
            setCompletedSteps(newCompletedSteps);
            setCurrentStep((prevStep) => prevStep - 1);
        }
    };

    const handleSubmit = () => {
        console;
        onNewAdd(form);
    };

    const handleCheckboxChange = (event: any) => {
        const { name, checked } = event.target;
        setChecked((prevState) => ({
            ...prevState,
            [name]: checked
        }));
    };
    const onRowSelect = async (perm: Supplier, action: any) => {
        setAction(action);
        // setIsShowSplit(true);
        await setSelectedSupplier(perm);
        if (action === ACTIONS.DELETE) {
            openDeleteDialog(perm);
        }
        if (action == ACTIONS.EDIT) {
            setForm(perm);
            setIsShowSplit(true);
        }
    };
    const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDropdownValue(Number(event.target.value));
    };

    const tableValueDropdown = () => {
        return (
            <div className="flex ">
                <select
                    id="dropdown"
                    value={selectedDropdownValue ?? ''}
                    onChange={handleDropdownChange}
                    className="block w-full px-1 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="" disabled>
                        Choose a value
                    </option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="50">50</option>
                </select>
            </div>
        );
    };
    const handleCreateNavigation = () => {
        router.push('/create-supplier'); // Replace with the route you want to navigate to
    };
    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <span className="p-input-icon-left flex align-items-center">
                    <h3 className="mb-0">Manage Suppliers</h3>
                </span>
                <div className="flex justify-content-end">
                    <Button icon="pi pi-plus" size="small" label="Import Supplier" aria-label="Add Supplier" className="default-button " style={{ marginLeft: 10 }} />
                    <Button icon="pi pi-plus" size="small" label="Add Supplier" aria-label="Import Supplier" className="bg-pink-500 border-pink-500 " onClick={handleCreateNavigation} style={{ marginLeft: 10 }} />
                    <div className="ml-3">{tableValueDropdown()}</div>
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
    const inputboxfeild = renderInputBox();

    // const databoxx = [
    //     {
    //         poNumber: 'PO-12345',
    //         supplierName: 'ABC Supplier',
    //         supplierAddress: 'ABC Address',
    //         supplierContact: 'ABC Contact',
    //         supplierEmail: 'abc@gmail.com',
    //         supplierStatus: 'Active'
    //     },
    //     {
    //         poNumber: 'PO-67890',
    //         supplierName: 'XYZ Supplier',
    //         supplierAddress: 'XYZ Address',
    //         supplierContact: 'XYZ Contact',
    //         supplierEmail: 'xyz@gmail.com',
    //         supplierStatus: 'Inactive'
    //     }
    //     // Add more data here...
    // ];
    return (
        <div className="grid">
            <div className="col-12">
                <div className={`panel-container ${isShowSplit ? (layoutState.isMobile ? 'mobile-split' : 'split') : ''}`}>
                    <div className="left-panel  bg-[#F8FAFC]">
                        <div className="header">{header}</div>
                        <div
                        // className="bg-[#ffffff] border border-1  p-3  mt-4 shadow-lg"
                        // style={{ borderColor: '#CBD5E1', borderRadius: '10px', WebkitBoxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)', MozBoxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)', boxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)' }}
                        >
                            {/* <div className="search-box  mt-3 ">{inputboxfeild}</div> */}
                            <CustomDataTable
                                className="mb-3"
                                ref={dataTableRef}
                                // filter
                                page={page}
                                limit={limit} // no of items per page
                                totalRecords={totalRecords} // total records from api response
                                // isView={true}
                                isEdit={true} // show edit button
                                isDelete={true} // show delete button
                                data={companies}
                                columns={[
                                    {
                                        header: 'Supplier Id',
                                        field: 'supId',
                                        filter: true,
                                        sortable: true,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        filterPlaceholder: 'Supplier No'
                                    },
                                    {
                                        header: 'Supplier Name',
                                        field: 'supplierName',
                                        sortable: true,
                                        filter: true,
                                        filterPlaceholder: 'Supplier Name',
                                        style: { minWidth: 120, maxWidth: 120 }
                                    },
                                    {
                                        header: 'Procurement Category',
                                        field: 'category.categoryName',
                                        // body: renderWarehouse,
                                        filter: true,
                                        // filterElement: warehouseDropdown,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        filterPlaceholder: 'Search Procurement Category'
                                    },
                                    {
                                        header: 'Supplier Category',
                                        field: 'subCategories.subCategoryName',
                                        // body: renderStatus,
                                        filter: true,
                                        filterPlaceholder: 'Search Supplier Category',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 }
                                        // filterElement: statusDropdown
                                    },
                                    {
                                        header: 'Supplier Manufacturing Name',
                                        field: 'supplierManufacturerName',
                                        filter: true,
                                        filterPlaceholder: 'Search Supplier Manufacturing Name',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 }
                                        // body: renderPOTotal
                                    },
                                    {
                                        header: 'Site Address',
                                        field: 'siteAddress',
                                        filter: true,
                                        filterPlaceholder: 'Search Site Address',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 }
                                    },
                                    {
                                        header: 'Factory Name',
                                        field: 'factoryName.factoryName',
                                        filter: true,
                                        filterPlaceholder: 'Search Factory Name',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 }
                                    },
                                    {
                                        header: 'Warehouse Location',
                                        field: 'warehouseLocation',
                                        filter: true,
                                        filterPlaceholder: 'Search Warehouse Location',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 }
                                    }
                                ]}
                                onLoad={(params: any) => fetchData(params)}
                                // // onView={(item: any) => onRowSelect(item, 'view')}
                                onEdit={(item: any) => onRowSelect(item, 'edit')}
                                onDelete={(item: any) => onRowSelect(item, 'delete')}
                            />
                        </div>
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
                        <Button label="Cancel" style={{ color: '#DF177C' }} className="px-7" text onClick={closeDeleteDialog} />
                        <Button label="Delete" style={{ backgroundColor: '#DF177C', border: 'none' }} className="px-7" onClick={confirmDelete} />
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
                    <i className="pi pi-info-circle text-6xl" style={{ marginRight: 10, color: '#DF177C' }}></i>

                    <div className="flex flex-column align-items-center gap-1">
                        <span>Are you sure you want to delete this supplier? </span>
                        <span>Do you still want to delete it? This action cannot be undone. </span>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default ManageSupplierPage;
