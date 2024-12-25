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

    const [checked, setChecked] = useState({
        gmp: false,
        gdp: false,
        reach: false,
        iso: false
    });

    useEffect(() => {
        // setScroll(true);
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
            console.log('46', response.data);
            // fetchPermissions()

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
            console.log('64', response);
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
            console.log('64', response);
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
            console.log('81', response.data);
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
            console.log('81', response.data);
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
            console.log('81', response.data);
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
            console.log('81', response.data);
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
        console.log('482', form);
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
        console.log('493', perm);
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
                    <Button icon="pi pi-plus" size="small" label="Add Supplier" aria-label="Import Supplier" className="bg-pink-500 border-pink-500 " onClick={showAddNew} style={{ marginLeft: 10 }} />
                </div>
            </div>
        );
    };
    const header = renderHeader();

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="flex flex-column gap-3 pt-5">
                        <h2 className="text-center font-bold ">Add Supplier Information</h2>
                        <div className="p-fluid grid md:mx-7 pt-5">
                            <div className="field col-6">
                                <label htmlFor="supplierId" className="font-semibold">
                                    Location
                                </label>
                                <Dropdown
                                    id="name"
                                    value={get(form, 'locationId')}
                                    options={locationDetails}
                                    optionLabel="name"
                                    optionValue="locationId"
                                    onChange={(e) => onInputChange('locationId', e.value)}
                                    placeholder="Select Location Name"
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-6">
                                <label htmlFor="supplierName" className="font-semibold">
                                    Supplier Name
                                </label>
                                <InputText id="supplierName" type="text" value={get(form, 'supplierName')} onChange={(e) => onInputChange('supplierName', e.target.value)} className="p-inputtext w-full mt-1" placeholder="Enter Supplier Name" />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="flex flex-column gap-3 pt-5">
                        <h2 className="text-center font-bold ">Add Manufacture Details</h2>
                        <div className="p-fluid grid md:mx-7 pt-5">
                            <div className="field col-6">
                                <label htmlFor="manufacturerName">Manufacturing Name</label>
                                <InputText
                                    id="manufacturerName"
                                    type="text"
                                    value={get(form, 'supplierManufacturerName')}
                                    onChange={(e) => onInputChange('supplierManufacturerName', e.target.value)}
                                    className="p-inputtext w-full"
                                    placeholder="Enter Manufacturing Name"
                                />
                            </div>
                            <div className="field col-6">
                                <label htmlFor="manufacturerName">Factory Name</label>
                                <Dropdown
                                    id="factoryName"
                                    value={get(form, 'factoryId')}
                                    options={factoryDetails}
                                    optionLabel="factoryName"
                                    optionValue="factoryId"
                                    onChange={(e) => onInputChange('factoryId', e.value)}
                                    placeholder="Select Factory Name"
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-6">
                                <label htmlFor="procurementCategory">Supplier Procurement Category</label>
                                <Dropdown
                                    id="procurementCategory"
                                    value={get(form, 'procurementCategoryId')}
                                    options={category}
                                    optionLabel="categoryName"
                                    optionValue="categoryId"
                                    onChange={(e) => onInputChange('procurementCategoryId', e.value)} // Map categoryId to procurementCategoryId
                                    placeholder="Select Procurement Category"
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-6">
                                <label htmlFor="manufacturerName">Supplier Category</label>
                                <Dropdown
                                    id="supplierCategory"
                                    value={get(form, 'supplierCategoryId')}
                                    options={subCategory}
                                    optionLabel="subCategoryName"
                                    optionValue="subCategoryId"
                                    onChange={(e) => onInputChange('supplierCategoryId', e.value)} // Map subCategoryId to supplierCategoryId
                                    placeholder="Select Supplier Category"
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-6">
                                <label htmlFor="manufacturerName">Site Address</label>
                                <InputText id="manufacturerName" type="text" value={get(form, 'siteAddress')} onChange={(e) => onInputChange('siteAddress', e.target.value)} className="p-inputtext w-full" placeholder="Enter Site Address" />
                            </div>
                            <div className="field col-6">
                                <label htmlFor="manufacturerName">Sub Location</label>
                                <Dropdown
                                    id="name"
                                    value={get(form, 'sublocationId')}
                                    options={subLocationDetails}
                                    optionLabel="name"
                                    optionValue="sublocationId"
                                    onChange={(e) => onInputChange('sublocationId', e.value)}
                                    placeholder="Select Sub Location Name"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="flex flex-column gap-3 pt-5">
                        <h2 className="text-center font-bold ">Add Manufacture Details</h2>
                        <div className="p-fluid grid md:mx-7 pt-5">
                            {/* GMP */}
                            <div className="field col-6">
                                <div className="flex items-center mb-2">
                                    <Checkbox inputId="gmp" name="gmp" checked={checked.gmp} onChange={handleCheckboxChange} className="mr-2" />
                                    <label htmlFor="gmp" className="mb-0">
                                        GMP
                                    </label>
                                </div>
                                <div className="flex items-center w-full">
                                    <InputText
                                        type="file"
                                        disabled={!checked.gmp}
                                        className={`flex-grow ${!checked.gmp ? 'opacity-50' : ''}`}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                onInputChange('gmpFile', file);
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* GDP */}
                            <div className="field col-6">
                                <div className="flex items-center mb-2">
                                    <Checkbox inputId="gdp" name="gdp" checked={checked.gdp} onChange={handleCheckboxChange} className="mr-2" />
                                    <label htmlFor="gdp" className="mb-0">
                                        GDP
                                    </label>
                                </div>
                                <div className="flex items-center w-full">
                                    <InputText
                                        type="file"
                                        disabled={!checked.gdp}
                                        className={`flex-grow ${!checked.gdp ? 'opacity-50' : ''}`}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                onInputChange('gdpFile', file);
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* REACH */}
                            <div className="field col-6">
                                <div className="flex items-center mb-2">
                                    <Checkbox inputId="reach" name="reach" checked={checked.reach} onChange={handleCheckboxChange} className="mr-2" />
                                    <label htmlFor="reach" className="mb-0">
                                        REACH
                                    </label>
                                </div>
                                <div className="flex items-center w-full">
                                    <InputText
                                        type="file"
                                        disabled={!checked.reach}
                                        className={`flex-grow ${!checked.reach ? 'opacity-50' : ''}`}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                onInputChange('reachFile', file);
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* ISO */}
                            <div className="field col-6">
                                <div className="flex items-center mb-2">
                                    <Checkbox inputId="iso" name="iso" checked={checked.iso} onChange={handleCheckboxChange} className="mr-2" />
                                    <label htmlFor="iso" className="mb-0">
                                        ISO
                                    </label>
                                </div>
                                <div className="flex items-center w-full">
                                    <InputText
                                        type="file"
                                        disabled={!checked.iso}
                                        className={`flex-grow ${!checked.iso ? 'opacity-50' : ''}`}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                onInputChange('isoFile', file);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

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

    const databoxx = [
        {
            poNumber: 'PO-12345',
            supplierName: 'ABC Supplier',
            supplierAddress: 'ABC Address',
            supplierContact: 'ABC Contact',
            supplierEmail: 'abc@gmail.com',
            supplierStatus: 'Active'
        },
        {
            poNumber: 'PO-67890',
            supplierName: 'XYZ Supplier',
            supplierAddress: 'XYZ Address',
            supplierContact: 'XYZ Contact',
            supplierEmail: 'xyz@gmail.com',
            supplierStatus: 'Inactive'
        }
        // Add more data here...
    ];
    console.log('114', companies);
    return (
        <div className="grid">
            <div className="col-12">
                <div className={`panel-container ${isShowSplit ? (layoutState.isMobile ? 'mobile-split' : 'split') : ''}`}>
                    <div className="left-panel  bg-[#F8FAFC]">
                        <div className="header">{header}</div>
                        <div
                            className="bg-[#ffffff] border border-1  p-3  mt-4 shadow-lg"
                            style={{ borderColor: '#CBD5E1', borderRadius: '10px', WebkitBoxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)', MozBoxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)', boxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)' }}
                        >
                            <div className="search-box  mt-3 ">{inputboxfeild}</div>
                            <CustomDataTable
                                className="mb-3"
                                ref={dataTableRef}
                                filter
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
                    <Sidebar
                        isVisible={isShowSplit}
                        action={action}
                        width={ACTIONS.VIEW == action ? '60vw' : undefined}
                        title={`${action == ACTIONS.EDIT || action == ACTIONS.VIEW ? selectedSupplier?.supplierName : 'Create Supplier'}`}
                        closeIcon={closeIcon}
                        onSave={onNewAdd}
                        content={
                            <>
                                {isDetailLoading && (
                                    <div className="center-pos">
                                        <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                                    </div>
                                )}
                                {(action === ACTIONS.ADD || action === ACTIONS.EDIT) && (
                                    <div className="md:p-4 md:mx-5 md:my-5">
                                        <Stepper currentStep={currentStep} completedSteps={completedSteps} />
                                        <div className="p-card">
                                            {/* Progress Bar */}
                                            {/* <ProgressBar value={(currentStep / 3) * 100} /> */}
                                            <div className="p-card-body" style={{ height: '68vh' }}>
                                                {/* Step Content */}
                                                {renderStepContent()}
                                            </div>
                                            {/* Footer Buttons */}
                                            <hr />
                                            <div className="p-card-footer flex justify-content-end px-4 gap-3 py-3 bg-slate-300 shadow-slate-400 ">
                                                {currentStep === 1 && <Button label="Next" icon="pi pi-arrow-right" className="bg-pink-500 border-pink-500 hover:bg-pink-400" onClick={handleNext} />}
                                                {currentStep === 2 && (
                                                    <>
                                                        <Button label="Previous" icon="pi pi-arrow-left" className="text-pink-500 bg-white border-pink-500 hover:text-white hover:bg-pink-400 transition-colors duration-150" onClick={handlePrevious} />
                                                        <Button label="Next" icon="pi pi-arrow-right" className="bg-pink-500 border-pink-500 hover:bg-pink-400" onClick={handleNext} />
                                                    </>
                                                )}
                                                {currentStep === 3 && (
                                                    <>
                                                        <Button label="Back" icon="pi pi-arrow-left" className="text-pink-500 bg-white border-pink-500 hover:text-white hover:bg-pink-400 transition-colors duration-150" onClick={handlePrevious} />
                                                        <Button label="Submit" icon="pi pi-check" className="bg-pink-500 border-pink-500 hover:bg-pink-400" onClick={handleSubmit} />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        }
                    />
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
