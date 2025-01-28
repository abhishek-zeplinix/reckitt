/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useRef, useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { useAppContext } from '@/layout/AppWrapper';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { CustomResponse } from '@/types';
import { InputText } from 'primereact/inputtext';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { DeleteCall, GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { Supplier } from '@/types';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { EmptySupplier } from '@/types/forms';
import { FileUpload } from 'primereact/fileupload';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    DELETE: 'delete',
    VIEW: 'view'
};
const defaultForm: EmptySupplier = {
    supId: null,
    supplierName: '',
    email: '',
    supplierNumber: '',
    Zip: '',
    supplierManufacturerName: '',
    siteAddress: '',
    procurementCategoryId: null,
    supplierCategoryId: null,
    stateId:null,
    countryId:null,
    cityId:null,
    warehouseLocation: '',
    factoryId: null,
    gmpFile: '',
    gdpFile: '',
    reachFile: '',
    isoFile: '',
    location: '',
    sublocationId: null,
    category: {
        categoryId: null,
        categoryName: ''
    },
    subCategories: {
        subCategoryId: null,
        subCategoryName: ''
    },
    factoryName: '',
    countries: {
        name: '',
        countryId: null,
      },
      states: {
        name: '',
        stateId: null,
      },
      cities: {
        name:'',
        cityId:  null,
      }
};

const ManageSupplierPage = () => {
    const totalSteps = 3;
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<boolean[]>(Array(totalSteps).fill(false));
    const { isLoading, setLoading, setScroll, setAlert } = useAppContext();
    const router = useRouter();
    const [factoryDetails, setFactoryDetails] = useState<any>([]);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [category, setCategory] = useState<any>([]);
    const [subCategory, setSubCategory] = useState<any>([]);
    const [locationDetails, setLocationDetails] = useState<any>([]);
    const [subLocationDetails, setSubLocationDetails] = useState<any>([]);
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState<boolean>(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [page, setPage] = useState<number>(1);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);
    const [action, setAction] = useState<any>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
    const [form, setForm] = useState<EmptySupplier>(defaultForm);
    const [selectedSupplierToDelete, setSelectedSupplierToDelete] = useState<Supplier | null>(null);
    const [visible, setVisible] = useState(false);
    const [procurementCategories, setprocurementCategories] = useState([]);
    const [supplierCategories, setsupplierCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedglobalSearch, setGlobalSearch] = useState('');
    const [SelectedSubCategory, setSelectedSubCategory] = useState('');
    const [chooseBlockOption, setChooseBlockOption] = useState('');
    const [date, setDate] = useState<Date | null>(null);
    useEffect(() => {
        setScroll(true);
        fetchData();
        return () => {};
    }, []);
    useEffect(() => {
        fetchFactory();
        fetchCategory();
        fetchSubCategory();
        fetchLocation();
        fetchSubLocation();
        fetchsupplierCategories();
    }, []);
    const limitOptions = [
        { label: '10', value: 10 },
        { label: '20', value: 20 },
        { label: '50', value: 50 },
        { label: '70', value: 70 },
        { label: '100', value: 100 }
    ];
    // Handle limit change
    const onLimitChange = (e: any) => {
        setLimit(e.value); // Update limit
        fetchData({ limit: e.value, page: 1 }); // Fetch data with new limit
    };

    // Handle limit change
    const onCategorychange = (e: any) => {
        setSelectedCategory(e.value); // Update limit
        fetchprocurementCategories(e.value);
        fetchData({
            filters: {
                supplierCategoryId: e.value
            }
        });
    };
    // Handle limit change
    const onSubCategorychange = (e: any) => {
        setSelectedSubCategory(e.value); // Update limit
        fetchData({
            filters: {
                procurementCategoryId: e.value
            }
        });
    };
    const onGlobalSearch = (e: any) => {
        setGlobalSearch(e.target?.value); // Update limit
        fetchData({ search: e.target?.value });
    };

    const fetchData = async (params?: any) => {
        if (!params) {
            params = { limit: limit, page: page };
        }
        setLoading(true);
        const queryString = buildQueryParams(params);
        const response: CustomResponse = await GetCall(`/company/supplier?${queryString}`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setSuppliers(response.data);

            if (response.total) {
                setTotalRecords(response?.total);
            }
        } else {
            setSuppliers([]);
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
                setAlert('success', 'Supplier Updated Successfully');
                dataTableRef.current?.updatePagination(1);
            } else {
                setAlert('error', response.message);
            }
        }
    };

    const fetchFactory = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/factory`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setFactoryDetails(response.data);
        } else {
            setFactoryDetails([]);
        }
    };
    const fetchLocation = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/location`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setLocationDetails(response.data);
        } else {
            setLocationDetails([]);
        }
    };
    const fetchSubLocation = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/sub-location`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setSubLocationDetails(response.data);
        } else {
            setSubLocationDetails([]);
        }
    };
    const fetchCategory = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/category`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setCategory(response.data);
        } else {
            setCategory([]);
        }
    };
    const fetchSubCategory = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/sub-category`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setSubCategory(response.data);
        } else {
            setSubCategory([]);
        }
    };

    const handleFileUpload = async (event: { files: File[] }) => {
        const file = event.files[0]; // Retrieve the uploaded file
        if (!file) {
            setAlert('error', 'Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsDetailLoading(true);
        try {
            // Use the existing PostCall function
            const response: CustomResponse = await PostCall('/company/addbulksupplier', formData);

            setIsDetailLoading(false);

            if (response.code === 'SUCCESS') {
                setAlert('success', 'Rules imported successfully');
                setVisible(false);
                fetchData();
            } else {
                setAlert('error', response.message || 'File upload failed');
            }
        } catch (error) {
            setIsDetailLoading(false);
            setAlert('error', 'An unexpected error occurred during file upload');
        }
    };

    const onRowSelect = async (perm: any, action: any) => {
        setAction(action);
        // setIsShowSplit(true);
        await setSelectedSupplier(perm);
        if (action === ACTIONS.DELETE) {
            openDeleteDialog(perm);
        }
        if (action == ACTIONS.EDIT) {
            setForm(perm);
            setIsShowSplit(true);
            handleEditSupplier(perm);
        }
    };
    const fetchprocurementCategories = async (categoryId: number | null) => {
        if (!categoryId) {
            setsupplierCategories([]); // Clear subcategories if no category is selected
            return;
        }
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/sub-category/${categoryId}`); // get all the roles
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setsupplierCategories(response.data);
        } else {
            setsupplierCategories([]);
        }
    };
    const fetchsupplierCategories = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/category`); // get all the roles
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setprocurementCategories(response.data);
        } else {
            setprocurementCategories([]);
        }
    };

    const dropdownCategory = () => {
        return (
            <Dropdown
                value={selectedCategory}
                onChange={onCategorychange}
                options={procurementCategories}
                optionValue="categoryId"
                placeholder="Select Category"
                optionLabel="categoryName"
                className="w-full md:w-10rem"
                showClear={!!selectedCategory}
            />
        );
    };

    const dropdownFieldCategory = dropdownCategory();

    const dropdownMenuSubCategory = () => {
        return (
            <Dropdown
                value={SelectedSubCategory}
                onChange={onSubCategorychange}
                options={supplierCategories}
                optionLabel="subCategoryName"
                optionValue="subCategoryId"
                placeholder="Select Sub Category"
                className="w-full md:w-10rem"
                showClear={!!SelectedSubCategory}
            />
        );
    };
    const dropdownFieldSubCategory = dropdownMenuSubCategory();
    const globalSearch = () => {
        return <InputText value={selectedglobalSearch} onChange={onGlobalSearch} placeholder="Search" className="w-full md:w-10rem" />;
    };
    const FieldGlobalSearch = globalSearch();

    const handleEditSupplier = (sup: any) => {
        const supId = sup.supId;
        router.push(`/manage-supplier/supplier?edit=true&supId=${supId}`);
    };

    const handleCreateNavigation = () => {
        router.push('/manage-supplier/supplier');
    };

    const dialogHeader = () => {
        return (
            <div className="flex justify-content-between align-items-center w-full">
                <span>Choose your file</span>
                <Button
                    label="Download Sample PDF"
                    icon="pi pi-download"
                    className="p-button-text p-button-sm text-pink-600"
                    onClick={() => {
                        // Trigger PDF download
                        const link = document.createElement('a');
                        link.href = '/path-to-your-pdf.pdf'; // Replace with the actual path to your PDF
                        link.download = 'example.pdf'; // Replace with the desired file name
                        link.click();
                    }}
                />
            </div>
        );
    };
    const renderHeader = () => {
        return (
            <div className="flex justify-content-between ">
                <span className="p-input-icon-left flex align-items-center">
                    <h3 className="mb-0">Manage Suppliers</h3>
                </span>
                <div className="flex justify-content-end">
                    <Button icon="pi pi-plus" size="small" label="Import Supplier" aria-label="Add Supplier" className="default-button " style={{ marginLeft: 10 }} onClick={() => setVisible(true)} />
                    <Dialog
                        header={dialogHeader}
                        visible={visible}
                        style={{ width: '50vw' }}
                        onHide={() => setVisible(false)} // Hide dialog when the close button is clicked
                    >
                        <FileUpload name="demo[]" customUpload multiple={false} accept=".xls,.xlsx,image/*" maxFileSize={5000000} emptyTemplate={<p className="m-0">Drag and drop files here to upload.</p>} uploadHandler={handleFileUpload} />
                    </Dialog>
                    <Button icon="pi pi-plus" size="small" label="Add Supplier" aria-label="Import Supplier" className="bg-pink-500 border-pink-500 hover:text-white" onClick={handleCreateNavigation} style={{ marginLeft: 10 }} />
                </div>
            </div>
        );
    };
    const header = renderHeader();

    return (
        <div className="grid">
            <div className="col-12">
                <div className={`panel-container ${isShowSplit ? (layoutState.isMobile ? 'mobile-split' : 'split') : ''}`}>
                    <div className="left-panel  bg-[#F8FAFC]">
                        <div className="header">{header}</div>
                        <div>
                            <div
                                className="bg-[#ffffff] border border-1  p-3  mt-4 shadow-lg"
                                style={{ borderColor: '#CBD5E1', borderRadius: '10px', WebkitBoxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)', MozBoxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)', boxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)' }}
                            >
                                <div className="flex justify-content-between items-center border-b">
                                    <div>
                                        <Dropdown className="mt-2" value={limit} options={limitOptions} onChange={onLimitChange} placeholder="Limit" style={{ width: '100px', height: '30px' }} />
                                    </div>
                                    <div className="flex  gap-2">
                                        <div className="mt-2">{dropdownFieldCategory}</div>
                                        <div className="mt-2">{dropdownFieldSubCategory}</div>
                                        <div className="mt-2">{FieldGlobalSearch}</div>
                                    </div>
                                </div>
                                <CustomDataTable
                                    className="mb-3"
                                    ref={dataTableRef}
                                    page={page}
                                    limit={limit} // no of items per page
                                    totalRecords={totalRecords} // total records from api response
                                    isEdit={true} // show edit button
                                    isDelete={true} // show delete button
                                    data={suppliers}
                                    extraButtons={[
                                        {
                                            icon: 'pi pi-ban'
                                        }
                                    ]}
                                    columns={[
                                        {
                                            header: 'Sr. No',
                                            body: (data: any, options: any) => {
                                                const normalizedRowIndex = options.rowIndex % limit;
                                                const srNo = (page - 1) * limit + normalizedRowIndex + 1;

                                                return <span>{srNo}</span>;
                                            },
                                            bodyStyle: { minWidth: 50, maxWidth: 50 }
                                        },
                                        {
                                            header: 'Name',
                                            field: 'supplierName',
                                            style: { minWidth: 150, maxWidth: 150 }
                                        },
                                        {
                                            header: 'Procurement Category',
                                            field: 'category.categoryName',
                                            bodyStyle: { minWidth: 150, maxWidth: 150 }
                                        },
                                        {
                                            header: 'Supplier Category',
                                            field: 'subCategories.subCategoryName',
                                            bodyStyle: { minWidth: 150, maxWidth: 150 }
                                        },
                                        {
                                            header: 'Manufacturer Name',
                                            field: 'supplierManufacturerName',
                                            bodyStyle: { minWidth: 200, maxWidth: 200 }
                                        },
                                        {
                                            header: 'Email',
                                            field: 'email',
                                            bodyStyle: { minWidth: 200, maxWidth: 200 }
                                        },
                                        {
                                            header: 'Site Address',
                                            field: 'siteAddress',
                                            bodyStyle: { minWidth: 150, maxWidth: 150 }
                                        },
                                        {
                                            header: 'Factory Name',
                                            field: 'factoryName',
                                            bodyStyle: { minWidth: 150, maxWidth: 150 }
                                        },
                                        {
                                            header: 'Warehouse Location',
                                            field: 'warehouseLocation',
                                            bodyStyle: { minWidth: 200, maxWidth: 200 }
                                        },
                                        {
                                            header: 'Country',
                                            field: 'countries.name',
                                            bodyStyle: { minWidth: 150, maxWidth: 150 }
                                        },
                                        {
                                            header: 'State',
                                            field: 'states.name',
                                            bodyStyle: { minWidth: 150, maxWidth: 150 }
                                        },
                                        {
                                            header: 'City',
                                            field: 'cities.name',

                                            bodyStyle: { minWidth: 150, maxWidth: 150 }
                                        },
                                        {
                                            header: 'Zip',
                                            field: 'Zip',
                                            bodyStyle: { minWidth: 150, maxWidth: 150 }
                                        }
                                    ]}
                                    onLoad={(params: any) => fetchData(params)}
                                    onEdit={(item: any) => onRowSelect(item, 'edit')}
                                    onDelete={(item: any) => onRowSelect(item, 'delete')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog
                header="Blocking confirmation"
                visible={isDeleteDialogVisible}
                style={{ width: layoutState.isMobile ? '90vw' : '35vw' }}
                className="delete-dialog"
                footer={
                    <div className="flex justify-content-center p-2">
                        <Button label="Cancel" style={{ color: '#DF177C' }} className="px-7" text onClick={closeDeleteDialog} />
                        <Button label="Save" style={{ backgroundColor: '#DF177C', border: 'none' }} className="px-7 hover:text-white" onClick={confirmDelete} />
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
                    <div className="flex flex-wrap gap-3 mt-2 mb-1 justify-content-center">
                        <div className="flex align-items-center flex-column gap-3">
                            <div className="flex align-items-center">
                                <RadioButton inputId="block" name="block" value="Permanent Block" onChange={(e) => setChooseBlockOption(e.value)} checked={chooseBlockOption === 'Permanent Block'} />
                                <label htmlFor="block" className="ml-2">
                                    Permanent Block
                                </label>
                            </div>
                        </div>
                        <div className="flex align-items-center flex-column gap-3">
                            <div className="flex align-items-center">
                                <RadioButton inputId="tempBlock" name="tempBlock" value="Temporary Block" onChange={(e) => setChooseBlockOption(e.value)} checked={chooseBlockOption === 'Temporary Block'} />

                                <label htmlFor="tempBlock" className="ml-2">
                                    Temporary Block
                                </label>
                            </div>
                        </div>
                    </div>
                    {/* <i className="pi pi-info-circle text-6xl" style={{ marginRight: 10, color: '#DF177C' }}></i>

                    <div className="flex flex-column align-items-center gap-1">
                        <span>Are you sure you want to delete this supplier? </span>
                        <span>This action cannot be undone. </span>
                    </div> */}
                    <div className="flex flex-column align-items-center gap-1">
                        {chooseBlockOption === 'Permanent Block' && (
                            <div className="w-full">
                                <InputTextarea
                                    id="name"
                                    // type='text'
                                    onChange={(e: any) => {}}
                                    placeholder="Enter Reason"
                                    className="p-inputtext w-full"
                                />
                            </div>
                        )}
                        {chooseBlockOption === 'Temporary Block' && (
                            <div className="flex flex-column">
                                <InputTextarea
                                    id="name"
                                    // type='text'
                                    onChange={(e: any) => {}}
                                    placeholder="Enter Reason"
                                    className="p-inputtext w-full"
                                />
                                <div className="flex flex-column justify-center items-center gap-2 mt-4">
                                    <label htmlFor="calendarInput" className="block mb-1 text-md ">
                                        Select Period of Block:
                                    </label>
                                    <div className="flex gap-4">
                                        <Calendar id="calendarInput" value={date} onChange={(e) => setDate(e.value as Date)} dateFormat="yy-mm-dd" placeholder="Select a date" showIcon style={{ borderRadius: '5px', borderColor: 'black' }} />
                                        <Calendar id="calendarInput" value={date} onChange={(e) => setDate(e.value as Date)} dateFormat="yy-mm-dd" placeholder="Select a date" showIcon style={{ borderRadius: '5px', borderColor: 'black' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default ManageSupplierPage;
