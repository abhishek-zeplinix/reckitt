'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { CustomResponse } from '@/types';
import { buildQueryParams } from '@/utils/utils';
import { InputText } from 'primereact/inputtext';
import { get } from 'lodash';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { EmptySupplier } from '@/types/forms';
import Stepper from '@/components/Stepper';

const defaultForm: EmptySupplier = {
    supId: null,
    supplierName: '',
    supplierManufacturerName: '',
    siteAddress: '',
    procurementCategoryId: null,
    supplierCategoryId: null,
    warehouseLocation: '',
    factoryName: '',
    gmpFile: '',
    gdpFile: '',
    reachFile: '',
    isoFile: '',
    location: '',
};

const ManageSupplierAddEditPage = () => {
    const totalSteps = 2;
    const router = useRouter();
    const searchParams = useSearchParams();
    const supId = searchParams.get('supId');
       const isEditMode = searchParams.get('edit') === 'true'
    const { setAlert, setLoading } = useAppContext();

    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<boolean[]>(Array(totalSteps).fill(false));
    const [checked, setChecked] = useState({
        gmp: false,
        gdp: false,
        reach: false,
        iso: false
    });
    const [form, setForm] = useState<EmptySupplier>(defaultForm);
    const [category, setCategory] = useState<any>([]);
    const [subCategory, setSubCategory] = useState<any>([]);

    // Map API response to form structure
    const mapToForm = (incomingData: any) => {
        if (!incomingData) return defaultForm;
        
        return {
            ...defaultForm,
            ...incomingData,
            // Ensure correct mapping for dropdown values
            procurementCategoryId: incomingData.procurementCategoryId || get(incomingData, 'category.categoryId'),
            supplierCategoryId: incomingData.supplierCategoryId || get(incomingData, 'subCategories.subCategoryId'),
        };
    };

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchCategory(),
                    fetchSubCategory(),
                    isEditMode && fetchSupplierData()
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const fetchSupplierData = async () => {
        try {
            const params = { filters: { supId }, pagination: false };
            const queryString = buildQueryParams(params);
            const response = await GetCall(`/company/supplier?${queryString}`);
            
            if (response.data && response.data[0]) {
                const mappedForm = mapToForm(response.data[0]);
                setForm(mappedForm);
                
                // set checkbox states based on file existence
                setChecked({
                    gmp: Boolean(mappedForm.gmpFile),
                    gdp: Boolean(mappedForm.gdpFile),
                    reach: Boolean(mappedForm.reachFile),
                    iso: Boolean(mappedForm.isoFile)
                });
            }
        } catch (error) {
            setAlert('error', 'Failed to fetch supplier data');
        }
    };

    const fetchCategory = async () => {
        const response: CustomResponse = await GetCall(`/company/category`);
        if (response.code === 'SUCCESS') {
            setCategory(response.data);
        }
    };

    const fetchSubCategory = async () => {
        const response: CustomResponse = await GetCall(`/company/sub-category`);
        if (response.code === 'SUCCESS') {
            setSubCategory(response.data);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response: CustomResponse = isEditMode
                ? await PutCall(`/company/supplier/${supId}`, form)
                : await PostCall(`/company/supplier`, form);

            if (response.code === 'SUCCESS') {
                setAlert('success', `Supplier ${isEditMode ? 'Updated' : 'Added'} Successfully`);
                router.push('/manage-supplier');
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const onInputChange = (name: string | { [key: string]: any }, val?: any) => {
        setForm((prevForm) => ({
            ...prevForm,
            ...(typeof name === 'string' ? { [name]: val } : name)
        }));
    };

    const handleCheckboxChange = (event: any) => {
        const { name, checked } = event.target;
        setChecked((prev) => ({ ...prev, [name]: checked }));
    };

    // navigation Handlers
    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCompletedSteps((prev) => {
                const newSteps = [...prev];
                newSteps[currentStep - 1] = true;
                return newSteps;
            });
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCompletedSteps((prev) => {
                const newSteps = [...prev];
                newSteps[currentStep - 2] = false;
                return newSteps;
            });
            setCurrentStep((prev) => prev - 1);
        }
    };

    
    // adjust title based on edit mode
    const pageTitle = isEditMode ? 'Edit Supplier Information' : 'Add Supplier Information';

    const renderStepContent = () => {
            switch (currentStep) {
                case 1:
                    return (
                        <div>
                            <div className="flex flex-column gap-3 pt-2">
                                <h2 className="text-center font-bold ">{pageTitle}</h2>
                                <div className="p-fluid grid md:mx-7 pt-2">
    
                                    <div className="field col-4">
                                        <label htmlFor="supplierName" className="font-semibold">
                                            Supplier Name
                                        </label>
                                        <InputText id="supplierName" type="text" value={get(form, 'supplierName')} onChange={(e) => onInputChange('supplierName', e.target.value)} className="p-inputtext w-full " placeholder="Enter Supplier Name" required />
                                    </div>
                                    <div className="field col-4">
                                        <label htmlFor="manufacturerName" className="font-semibold">Manufacturing Name</label>
                                        <InputText
                                            id="manufacturerName"
                                            type="text"
                                            value={get(form, 'supplierManufacturerName')}
                                            onChange={(e) => onInputChange('supplierManufacturerName', e.target.value)}
                                            className="p-inputtext w-full"
                                            placeholder="Enter Manufacturing Name"
                                        />
                                    </div>
                                    <div className="field col-4">
                                        <label htmlFor="factoryName" className="font-semibold">
                                            Factory Name
                                        </label>
                                        <InputText
                                            id="factoryName"
                                            value={get(form, 'factoryName')}
                                            type='text'
                                            onChange={(e) => onInputChange('factoryName', e.target.value)}
                                            placeholder="Enter Factory Name"
                                            className="p-inputtext w-full"
                                        />
                                    </div>
                                    <div className="field col-4">
                                        <label htmlFor="procurementCategory" className="font-semibold">Supplier Procurement Category</label>
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
                                    <div className="field col-4">
                                        <label htmlFor="manufacturerName" className="font-semibold">Supplier Category</label>
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
    
                                    <div className="field col-4">
                                        <label htmlFor="location" className="font-semibold">
                                            Location
                                        </label>
                                        <InputText
                                            id="name"
                                            value={get(form, 'location')}
                                            type='text'
                                            onChange={(e) => onInputChange('location', e.target.value)}
                                            placeholder="Enter Location Name"
                                            className="p-inputtext w-full"
                                        />
                                    </div>
    
    
                                    <div className="field col-4">
                                        <label htmlFor="siteAddress" className="font-semibold">Site Address</label>
                                        <InputTextarea id="siteAddress" value={get(form, 'siteAddress')} onChange={(e) => onInputChange('siteAddress', e.target.value)} className="p-inputtext w-full" placeholder="Enter Site Address" />
                                    </div>
    
    
                                    <div className="field col-4">
                                        <label htmlFor="warehouseLocation" className="font-semibold">Warehouse Location</label>
                                        <InputTextarea
                                            id="name"
                                            // type='text'
                                            value={get(form, 'warehouseLocation')}
                                            onChange={(e) => onInputChange('warehouseLocation', e.target.value)}
                                            placeholder="Enter Warehouse Location"
                                            className="p-inputtext w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                case 2:
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
    // Rest of your component code (renderStepContent, etc.) remains the same
    // ... (keep your existing renderStepContent implementation)

    return (
        <div className="">
            <div className="p-card">
                <Stepper currentStep={currentStep} completedSteps={completedSteps} />
                <hr />
                <div className="p-card-body">
                    {renderStepContent()}
                </div>
                <hr />
                <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400">
                    {currentStep === 1 && (
                        <Button 
                            label="Next" 
                            icon="pi pi-arrow-right" 
                            className="bg-pink-500 border-pink-500 hover:text-white mb-3" 
                            onClick={handleNext} 
                        />
                    )}
                    {currentStep === 2 && (
                        <>
                            <Button 
                                label="Back" 
                                icon="pi pi-arrow-left" 
                                className="text-pink-500 bg-white border-pink-500 hover:text-pink-500 hover:bg-white transition-colors duration-150 mb-3" 
                                onClick={handlePrevious} 
                            />
                            <Button 
                                label={isEditMode ? 'Update' : 'Submit'} 
                                icon="pi pi-check" 
                                className="bg-pink-500 border-pink-500 hover:text-white mb-3" 
                                onClick={handleSubmit} 
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageSupplierAddEditPage;