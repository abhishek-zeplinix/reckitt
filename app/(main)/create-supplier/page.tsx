'use client';
import React, { useState,useEffect } from 'react';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import Stepper from '@/components/Stepper';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { CustomResponse } from '@/types';
import { GetCall, PostCall } from '@/app/api/ApiKit';
import { EmptySupplier } from '@/types/forms';
import { filter, find, get, groupBy, keyBy, map, uniq } from 'lodash';

const defaultForm: EmptySupplier = {
    supId:'',
    supplierName : '',
    supplierManufacturerName : '',
    siteAddress : '',
    procurementCategoryId : null,
    supplierCategoryId :null,
    warehouseLocation : '',
    factoryId : null,
    gmpFile:'',
    gdpFile:'',
    reachFile:'',
    isoFile:'',
};

const CreateSupplierPage = () => {
    const totalSteps = 3;
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<boolean[]>(Array(totalSteps).fill(false));
    // Form fields state
    const [supplierId, setSupplierId] = useState('');
    const [factoryDetails,setFactoryDetails]=useState<any>([])
    const [category,setCategory]=useState<any>([])
    const [subCategory,setSubCategory]=useState<any>([])
    const [supplierName, setSupplierName] = useState('');
    const [manufacturerName, setManufacturerName] = useState('');
    const [complianceStatus, setComplianceStatus] = useState(false);
    const [selectedProcurementCategory, setSelectedProcurementCategory] = useState(null);
    const { user, isLoading, setLoading, setScroll, setAlert } = useAppContext();
    const [form, setForm] = useState<EmptySupplier>(defaultForm);

    const [checked, setChecked] = useState({
        gmp: false,
        gdp: false,
        reach: false,
        iso: false
    });
    useEffect(() => {
        fetchFactory();
        fetchCategory();
        fetchSubCategory();
        // fetchRolesData();
    }, []);


    const onNewAdd = async (companyForm: any) => {
        console.log('148',companyForm);
        setLoading(true);
        const response: CustomResponse = await PostCall(`/company/supplier`, companyForm);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setAlert('success',response.message)
            
        } else {
            setAlert('error', response.message);
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
            console.log('81',response.data)
        } else {
            setFactoryDetails([]);
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
            console.log('81',response.data)
        } else {
            setSubCategory([]);
        }
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
        console
        onNewAdd(form)
        
    };

    const handleCheckboxChange = (event: any) => {
        const { name, checked } = event.target;
        setChecked((prevState) => ({
            ...prevState,
            [name]: checked
        }));
    };

    const procurementCategories = [
        { label: 'Raw Materials', value: 'raw-materials' },
        { label: 'Packaging', value: 'packaging' },
        { label: 'Machinery', value: 'machinery' },
        { label: 'Services', value: 'services' }
    ];
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="flex flex-column gap-3 pt-5">
                        <h2 className="text-center font-bold ">Add Supplier Information</h2>
                        <div className="p-fluid grid md:mx-7 pt-5">
                            <div className="field col-6">
                                <label htmlFor="supplierId" className="font-semibold">
                                    Supplier ID
                                </label>
                                <InputText id="supplierId" type="text" value={get(form, 'supId')} onChange={(e) => onInputChange('supId', e.target.value)} className="p-inputtext w-full mt-1" placeholder="Enter Supplier Id" />
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
                                <InputText id="manufacturerName" type="text" value={get(form, 'supplierManufacturerName')} onChange={(e) => onInputChange('supplierManufacturerName', e.target.value)} className="p-inputtext w-full" placeholder="Enter Manufacturing Name" />
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
                                <label htmlFor="manufacturerName">Warehouse Location</label>
                                <InputText id="manufacturerName" type="text" value={get(form, 'warehouseLocation')} onChange={(e) => onInputChange('warehouseLocation', e.target.value)} className="p-inputtext w-full" placeholder="Enter Warehouse Location" />
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
                                <Checkbox
                                    inputId="gmp"
                                    name="gmp"
                                    checked={checked.gmp}
                                    onChange={handleCheckboxChange}
                                    className="mr-2"
                                />
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
                                <Checkbox
                                    inputId="gdp"
                                    name="gdp"
                                    checked={checked.gdp}
                                    onChange={handleCheckboxChange}
                                    className="mr-2"
                                />
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
                                <Checkbox
                                    inputId="reach"
                                    name="reach"
                                    checked={checked.reach}
                                    onChange={handleCheckboxChange}
                                    className="mr-2"
                                />
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
                                <Checkbox
                                    inputId="iso"
                                    name="iso"
                                    checked={checked.iso}
                                    onChange={handleCheckboxChange}
                                    className="mr-2"
                                />
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

    return (
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
    );
};

export default CreateSupplierPage;
