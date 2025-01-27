'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { CustomResponse } from '@/types';
import { buildQueryParams, validateEmail, validateFullName, validateName, validatePhoneNumber, validateSiteAddress, validateString, validateText, validateZipCode } from '@/utils/utils';
import { InputText } from 'primereact/inputtext';
import { get } from 'lodash';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { EmptySupplier } from '@/types/forms';
import Stepper from '@/components/Stepper';

const defaultForm: EmptySupplier = {
    supId: null,
    supplierName: '',
    supplierNumber:'',
    supplierManufacturerName: '',
    siteAddress: '',
    procurementCategoryId: null,
    stateId:null,
    countryId:null,
    cityId:null,
    email:'',
    Zip:'',
    supplierCategoryId: null,
    warehouseLocation: '',
    factoryName: '',
    gmpFile: '',
    gdpFile: '',
    reachFile: '',
    isoFile: '',
    location: '',
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

const ManageSupplierAddEditPage = () => {
    const totalSteps = 2;
    const router = useRouter();
    const searchParams = useSearchParams();
    const supId = searchParams.get('supId');
    const isEditMode = searchParams.get('edit') === 'true';
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
    const [allCountry, setAllCountry] = useState<any>([]);
    const [allState, setAllState] = useState<any>([]);
    const [allCity, setAllCity] = useState<any>([]);
    const [subCategory, setSubCategory] = useState<any>([]);

    // map API response to form structure
    const mapToForm = (incomingData: any) => {
        if (!incomingData) return defaultForm;

        return {
            ...defaultForm,
            ...incomingData,
            // ensure correct mapping for dropdown values
            procurementCategoryId: incomingData.procurementCategoryId || get(incomingData, 'subCategories.subCategoryId'),
            supplierCategoryId: incomingData.supplierCategoryId || get(incomingData, 'category.categoryId')
        };
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Fetch independent data first
                await Promise.all([
                    fetchCategory(),
                    fetchAllCountry(),
                    isEditMode && fetchSupplierData(),
                ]);
                console.log('97',form)
    
                // Fetch dependent data sequentially
                // const states = await fetchAllSatate(); // Dependent on fetchAllCountry
                // if (states) {
                //     await fetchAllCity(); // Dependent on fetchAllState
                // }
            } catch (error) {
                console.error('Error fetching initial data:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchInitialData();
    }, [isEditMode]); // Add isEditMode as a dependency if its value can change
    
    const fetchSupplierData = async () => {
        try {
            const params = { filters: { supId }, pagination: false };
            const queryString = buildQueryParams(params);
            const response = await GetCall(`/company/supplier?${queryString}`);

            if (response.data && response.data[0]) {
                const mappedForm = mapToForm(response.data[0]);
                setForm(mappedForm);
                console.log('123',mappedForm)

                // Fetch subcategories dynamically based on the selected category
                if (mappedForm.supplierCategoryId) {
                    await fetchSubCategoryByCategoryId(mappedForm.supplierCategoryId);
                }
                if (mappedForm.supplierCategoryId && mappedForm.countries) {
                    await fetchAllSatate(mappedForm.countryId);
                }
                if (mappedForm.supplierCategoryId && mappedForm.countries && mappedForm.states ) {
                    await fetchAllCity(mappedForm.stateId);
                }
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
    const fetchAllCountry = async () => {
        const response: CustomResponse = await GetCall(`/company/supplier/countries`);
        if (response.code === 'SUCCESS') {
            setAllCountry(response.data);
            
        }
    };
    const fetchAllSatate = async (countryId:any) => {
        const response: CustomResponse = await GetCall(`/company/supplier/states/${countryId}`);
        if (response.code === 'SUCCESS') {
            setAllState(response.data.states);
        }
    };
    const fetchAllCity = async (stateId:any) => {
        const response: CustomResponse = await GetCall(`/company/supplier/city/${stateId}`);
        if (response.code === 'SUCCESS') {
            setAllCity(response.data.city);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response: CustomResponse = isEditMode ? await PutCall(`/company/supplier/${supId}`, form) : await PostCall(`/company/supplier`, form);

            console.log(response);

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
        if (name !== 'procurementCategoryId' && name !== 'supplierCategoryId'&& name !== 'countryId'&& name !== 'stateId'&& name !== 'cityId' && name !=='email') {
            if (val) {
                const trimmedValue = val.trim();
                const wordCount = trimmedValue.length;
                if (name !== 'siteAddress' && name !== 'warehouseLocation') {
                    if (wordCount > 25) {
                        setAlert('error', 'Word limit exceeded!');
                        return;
                    }
                }
                if(name==='supplierNumber'){
                    const typeValue=typeof(val);
                    if (isNaN(Number(val)) || typeValue !== 'string') {
                        setAlert('error', 'Phone must be a valid number');
                        return;
                    }
                }
            }
        }
        setForm((prevForm) => {
            const updatedForm = {
                ...prevForm,
                ...(typeof name === 'string' ? { [name]: val } : name)
            };
            if (name === 'supplierCategoryId') {
                fetchSubCategoryByCategoryId(val);
                updatedForm.procurementCategoryId = null;
            }
            if (name === 'countryId') {
                fetchAllSatate(val);
                updatedForm.stateId = null;
            }
            if (name === 'stateId') {
                fetchAllCity(val);
                updatedForm.cityId = null;
            }
            return updatedForm;
        });
    };

    const fetchSubCategoryByCategoryId = async (categoryId: number | null) => {
        if (!categoryId) {
            setSubCategory([]); // Clear subcategories if no category is selected
            return;
        }

        setLoading(true);
        try {
            const response: CustomResponse = await GetCall(`/company/sub-category/${categoryId}`);
            if (response.code === 'SUCCESS') {
                setSubCategory(response.data);
            } else {
                setSubCategory([]);
                setAlert('error', 'Failed to fetch subcategories.');
            }
        } catch (error) {
            setSubCategory([]);
            setAlert('error', 'Something went wrong while fetching subcategories.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (event: any) => {
        const { name, checked } = event.target;
        setChecked((prev) => ({ ...prev, [name]: checked }));
    };
    // navigation Handlers
    const handleNext = () => {
        console.log('235',form)
        if (!validateFullName(form.supplierName)) {
            setAlert('error', 'Supplier name must be in proper format');
            return;
        }
        if (!validateFullName(form.supplierManufacturerName)) {
            setAlert('error', 'Supplier manufacturer must be in proper format');
            return;
        }
        if (!validateFullName(form.factoryName)) {
            setAlert('error', 'Factory must be in proper format');
            return;
        }
        if (!validateEmail(form.email)) {
            setAlert('error', 'Email must be in proper format');
            return;
        }
        if (!validatePhoneNumber(form.supplierNumber)) {
            setAlert('error', 'Phone number must be in proper format');
            return;
        }
        if (!validateZipCode(form.Zip)) {
            setAlert('error', 'Zip must be in proper format');
            return;
        }
        if (!validateSiteAddress(form.siteAddress)) {
            setAlert('error', 'Site address cannot be empty');
            return;
        }
        if (!validateText(form.warehouseLocation)) {
            setAlert('error', 'Warehouse location cannot be empty');
            return;
        }

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
                        <div className="flex flex-column gap-2 pt-2">
                            <h2 className="text-center font-bold ">{pageTitle}</h2>
                            <div className="p-fluid grid mx-1 pt-2">
                                <div className="field col-3">
                                    <label htmlFor="supplierName" className="font-semibold">
                                        Supplier Name
                                    </label>
                                    <InputText
                                        id="supplierName"
                                        type="text"
                                        value={get(form, 'supplierName')}
                                        onChange={(e) => onInputChange('supplierName', e.target.value)}
                                        className="p-inputtext w-full "
                                        placeholder="Enter Supplier Name"
                                        required
                                    />
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="manufacturerName" className="font-semibold">
                                        Manufacturer Name
                                    </label>
                                    <InputText
                                        id="manufacturerName"
                                        type="text"
                                        value={get(form, 'supplierManufacturerName')}
                                        onChange={(e) => onInputChange('supplierManufacturerName', e.target.value)}
                                        className="p-inputtext w-full"
                                        placeholder="Enter Manufacturer Name"
                                    />
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="factoryName" className="font-semibold">
                                        Factory Name
                                    </label>
                                    <InputText id="factoryName" value={get(form, 'factoryName')} type="text" onChange={(e) => onInputChange('factoryName', e.target.value)} placeholder="Enter Factory Name" className="p-inputtext w-full" />
                                </div>

                                <div className="field col-3">
                                    <label htmlFor="supplierCategory" className="font-semibold">
                                        Procurement Category
                                    </label>
                                    <Dropdown
                                        id="supplierCategory"
                                        value={get(form, 'supplierCategoryId')}
                                        options={category}
                                        optionLabel="categoryName"
                                        optionValue="categoryId"
                                        onChange={(e) => onInputChange('supplierCategoryId', e.value)} // map subCategoryId to supplierCategoryId
                                        placeholder="Select Procurement Category"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="procurementCategory" className="font-semibold">
                                        Supplier Category
                                    </label>
                                    {form.supplierCategoryId ? (
                                        <Dropdown
                                            id="procurementCategory"
                                            value={get(form, 'procurementCategoryId')}
                                            options={subCategory}
                                            optionLabel="subCategoryName"
                                            optionValue="subCategoryId"
                                            onChange={(e) => onInputChange('procurementCategoryId', e.value)}
                                            placeholder="Select Supplier Category"
                                            className="w-full"
                                        />
                                    ) : (
                                        <Dropdown id="supplierCategory" placeholder="Please Select a  Category" className="w-full" />
                                    )}
                                </div>

                                <div className="field col-3">
                                    <label htmlFor="email" className="font-semibold">
                                        Email Address
                                    </label>
                                    <InputText id="email" value={get(form, 'email')} type="text" onChange={(e) => onInputChange('email', e.target.value)} placeholder="Enter Email Address " className="p-inputtext w-full" />
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="supplierNumber" className="font-semibold">
                                        Phone Number
                                    </label>
                                    <InputText id="supplierNumber" value={get(form, 'supplierNumber')} type="text" onChange={(e) => onInputChange('supplierNumber', e.target.value)} placeholder="Enter Phone Number " className="p-inputtext w-full" />
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="country" className="font-semibold">
                                        Country
                                    </label>
                                    <Dropdown
                                        id="country"
                                        value={get(form, 'countryId')}
                                        options={allCountry}
                                        optionLabel="name"
                                        optionValue="countryId"
                                        onChange={(e) => onInputChange('countryId', e.value)}
                                        placeholder="Select Country"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="state" className="font-semibold">
                                        State
                                    </label>
                                    <Dropdown
                                        id="stateId"
                                        value={get(form, 'stateId')}
                                        options={allState}
                                        optionLabel="name"
                                        optionValue="stateId"
                                        onChange={(e) => onInputChange('stateId', e.value)}
                                        placeholder="Select state"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="city" className="font-semibold">
                                        City
                                    </label>
                                    <Dropdown
                                        id="cityId"
                                        value={get(form, 'cityId')}
                                        options={allCity}
                                        optionLabel="name"
                                        optionValue="cityId"
                                        onChange={(e) => onInputChange('cityId', e.value)}
                                        placeholder="Select city"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="Zip" className="font-semibold">
                                        ZipCode
                                    </label>
                                    <InputText id="Zip" value={get(form, 'Zip')} type="text" onChange={(e) => onInputChange('Zip', e.target.value)} placeholder="Enter ZipCode " className="p-inputtext w-full" />
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="siteAddress" className="font-semibold">
                                        Site Address
                                    </label>
                                    <InputTextarea id="siteAddress" value={get(form, 'siteAddress')} onChange={(e) => onInputChange('siteAddress', e.target.value)} className="p-inputtext w-full" placeholder="Enter Site Address" />
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="warehouseLocation" className="font-semibold">
                                        Warehouse Location
                                    </label>
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
                        {/* <div className="px-3">
                            <i className="text-red-400 text-sm">All feilds required *</i>
                        </div> */}
                    </div>
                );
            case 2:
                return (
                    <div className="flex flex-column gap-3 pt-5">
                        <h2 className="text-center font-bold ">Compliance requirement</h2>
                        <div className="p-fluid grid mx-1 pt-5">
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

    return (
        <div className="">
            <div className="p-card">
                <Stepper currentStep={currentStep} completedSteps={completedSteps} />
                <hr />
                <div className="p-card-body">{renderStepContent()}</div>
                <hr />
                <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400">
                    {currentStep === 1 && <Button label="Next" icon="pi pi-arrow-right" className="bg-pink-500 border-pink-500 hover:text-white mb-3" onClick={handleNext} />}
                    {currentStep === 2 && (
                        <>
                            <Button label="Back" icon="pi pi-arrow-left" className="text-pink-500 bg-white border-pink-500 hover:text-pink-500 hover:bg-white transition-colors duration-150 mb-3" onClick={handlePrevious} />
                            <Button label={isEditMode ? 'Update' : 'Submit'} icon="pi pi-check" className="bg-pink-500 border-pink-500 hover:text-white mb-3" onClick={handleSubmit} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageSupplierAddEditPage;
