'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { CustomResponse } from '@/types';
import { buildQueryParams, validateFormData } from '@/utils/utils';
import { InputText } from 'primereact/inputtext';
import { get } from 'lodash';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { EmptySupplier } from '@/types/forms';
import Stepper from '@/components/Stepper';
import { Country, State, City } from 'country-state-city';
const defaultForm: EmptySupplier = {
    supId: null,
    supplierName: '',
    supplierNumber: '',
    supplierManufacturerName: '',
    siteAddress: '',
    procurementCategoryId: null,
    state: '',
    country: '',
    city: '',
    email: '',
    Zip: '',
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
        countryId: null
    },
    states: {
        name: '',
        stateId: null
    },
    cities: {
        name: '',
        cityId: null
    }
};

const ManageVendorAddEditPage = () => {
    const totalSteps = 1;
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
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [wordLimitErrors, setWordLimitErrors] = useState<{ [key: string]: string }>({});
    const [wordMaxLimitErrors, setWordMaxLimitErrors] = useState<{ [key: string]: string }>({});
    const [numberErrors, setNumberErrors] = useState<{ [key: string]: string }>({});
    const [alphabetErrors, setAlphabetErrors] = useState<{ [key: string]: string }>({});
    const [emailErrors, setEmailErrors] = useState<{ [key: string]: string }>({});

    // Fetch all countries on component mount
    useEffect(() => {
        const fetchCountries = async () => {
            const countries = await Country.getAllCountries();
            setAllCountry(countries);
        };
        fetchCountries();
    }, []);

    // Fetch states based on selected country
    useEffect(() => {
        const fetchStates = async () => {
            if (form.country) {
                const states = await State.getStatesOfCountry(form.country);
                setAllState(states);
            } else {
                setAllState([]); // Reset states if no country is selected
            }
        };
        fetchStates();
    }, [form.country]);

    // Fetch cities based on selected state
    useEffect(() => {
        const fetchCities = async () => {
            if (form.state) {
                const cities = await City.getCitiesOfState(form.country, form.state);
                setAllCity(cities);
            } else {
                setAllCity([]); // Reset cities if no state is selected
            }
        };
        fetchCities();
    }, [form.state]);
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
                await Promise.all([fetchCategory(), isEditMode && fetchSupplierData()]);
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

                // Fetch subcategories dynamically based on the selected category
                if (mappedForm.supplierCategoryId) {
                    await fetchSubCategoryByCategoryId(mappedForm.supplierCategoryId);
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

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response: CustomResponse = isEditMode ? await PutCall(`/company/supplier/${supId}`, form) : await PostCall(`/company/supplier`, form);

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
        if (typeof name !== 'string') return;
        if (name !== 'procurementCategoryId' && name !== 'supplierCategoryId' && name !== 'country' && name !== 'state' && name !== 'city') {
            if (val) {
                const trimmedValue = val.trim();
                const wordCount = trimmedValue.length;
                if (name !== 'siteAddress' && name !== 'warehouseLocation') {
                    if (wordCount > 50) {
                        setWordLimitErrors((prevWordErrors) => ({
                            ...prevWordErrors,
                            [name]: 'Maximum 50 characters allowed!'
                        }));
                        return;
                    } else {
                        setWordLimitErrors((prevWordErrors) => {
                            const updatedErrors = { ...prevWordErrors };
                            delete updatedErrors[name];
                            return updatedErrors;
                        });
                    }
                }
                if (name === 'siteAddress' || name === 'warehouseLocation') {
                    if (wordCount > 250) {
                        setWordMaxLimitErrors((prevWordErrors) => ({
                            ...prevWordErrors,
                            [name]: 'Maximum 250 characters allowed!'
                        }));
                        return;
                    } else {
                        setWordMaxLimitErrors((prevWordErrors) => {
                            const updatedErrors = { ...prevWordErrors };
                            delete updatedErrors[name];
                            return updatedErrors;
                        });
                    }
                }
                if (name === 'supplierNumber') {
                    if (!/^\+?\d+$/.test(val) || (val.includes('+') && val.indexOf('+') !== 0)) {
                        setNumberErrors((prevNumErrors) => ({
                            ...prevNumErrors,
                            [name]: 'Only numbers are allowed!'
                        }));
                        return;
                    } else if (val.length > 12) {
                        setNumberErrors((prevNumErrors) => ({
                            ...prevNumErrors,
                            [name]: 'Maximum 12 number allowed!'
                        }));
                        return;
                    } else {
                        setNumberErrors((prevNumErrors) => {
                            const updatedErrors = { ...prevNumErrors };
                            delete updatedErrors[name];
                            return updatedErrors;
                        });
                    }
                }

                if (name === 'email') {
                    if (!/^[a-zA-Z0-9-@.]+$/.test(val)) {
                        setEmailErrors((prevNumErrors) => ({
                            ...prevNumErrors,
                            [name]: 'Please enter a valid email address (e.g., example@domain.com).'
                        }));
                        return;
                    } else if (!val.includes('@')) {
                        setEmailErrors((prevNumErrors) => ({
                            ...prevNumErrors,
                            [name]: 'Please enter a valid email address (e.g., example@domain.com).'
                        }));
                    } else if (!val.includes('.com')) {
                        setEmailErrors((prevNumErrors) => ({
                            ...prevNumErrors,
                            [name]: 'Please enter a valid email address (e.g., example@domain.com).'
                        }));
                    } else if (val.length > 80) {
                        setEmailErrors((prevNumErrors) => ({
                            ...prevNumErrors,
                            [name]: 'Maximum Word limit 80!'
                        }));
                        return;
                    } else {
                        setEmailErrors((prevNumErrors) => {
                            const updatedErrors = { ...prevNumErrors };
                            delete updatedErrors[name];
                            return updatedErrors;
                        });
                    }
                }

                if (name === 'Zip') {
                    if (!/^[a-zA-Z0-9\s-]+$/.test(val)) {
                        // Ensure only numbers and dash are allowed
                        setNumberErrors((prevNumErrors) => ({
                            ...prevNumErrors,
                            [name]: 'Only letters,numbers,spaces and hyphens are allowed!'
                        }));
                        return;
                    } else if (val.length > 10) {
                        setNumberErrors((prevNumErrors) => ({
                            ...prevNumErrors,
                            [name]: 'Maximum 10 characters allowed! '
                        }));
                        return;
                    } else if (val.length < 1) {
                        setNumberErrors((prevNumErrors) => ({
                            ...prevNumErrors,
                            [name]: 'Zip must not be empty'
                        }));
                        return;
                    } else {
                        setNumberErrors((prevNumErrors) => {
                            const updatedErrors = { ...prevNumErrors };
                            delete updatedErrors[name];
                            return updatedErrors;
                        });
                    }
                }
                if (name === 'vendorName') {
                    const isAlphabet = /^[a-zA-Z\s]+$/.test(val);
                    if (!isAlphabet) {
                        setAlphabetErrors((prevAlphaErrors) => ({
                            ...prevAlphaErrors,
                            [name]: 'Must contain only alphabets!'
                        }));
                        return;
                    } else {
                        setAlphabetErrors((prevAlphaErrors) => {
                            const updatedErrors = { ...prevAlphaErrors };
                            delete updatedErrors[name];
                            return updatedErrors;
                        });
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
            // if (name === 'countryId') {
            //     fetchAllSatate(val);
            //     updatedForm.state = null;
            // }
            // if (name === 'stateId') {
            //     fetchAllCity(val);
            //     updatedForm.cityId = null;
            // }
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

    // adjust title based on edit mode
    const pageTitle = isEditMode ? 'Edit Vendor Information' : 'Add Vendor Information';

    const renderStepContent = () => {
        return (
            <div>
                <div className="flex flex-column gap-2 pt-2">
                    <h2 className="text-center font-bold ">{pageTitle}</h2>
                    <div className="p-fluid grid mx-1 pt-2">
                        <div className="field col-3">
                            <label htmlFor="vendorName" className="font-semibold">
                                Vendor Name
                            </label>
                            <InputText id="vendorName" type="text" value={get(form, 'vendorName')} onChange={(e) => onInputChange('vendorName', e.target.value)} className="p-inputtext w-full mb-1" placeholder="Enter Vendor Name" required />
                            {formErrors.vendorName && (
                                <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{formErrors.vendorName}</p> // Display error message
                            )}
                            {/* Display word limit errors separately */}
                            {wordLimitErrors.vendorName && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{wordLimitErrors.vendorName}</p>}
                            {alphabetErrors.vendorName && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{alphabetErrors.vendorName}</p>}
                        </div>
                        <div className="field col-3">
                            <label htmlFor="email" className="font-semibold">
                                Email Address
                            </label>
                            <InputText id="email" value={get(form, 'email')} type="email" onChange={(e) => onInputChange('email', e.target.value)} placeholder="Enter Email Address " className="p-inputtext w-full mb-1" />
                            {formErrors.email && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.email}</p>}
                            {emailErrors.email && <p style={{ color: 'red', fontSize: '10px' }}>{emailErrors.email}</p>}
                        </div>
                        <div className="field col-3">
                            <label htmlFor="supplierNumber" className="font-semibold">
                                Phone Number
                            </label>
                            <InputText id="supplierNumber" value={get(form, 'supplierNumber')} type="text" onChange={(e) => onInputChange('supplierNumber', e.target.value)} placeholder="Enter Phone Number " className="p-inputtext w-full mb-1" />
                            {formErrors.supplierNumber && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.supplierNumber}</p>}
                            {numberErrors.supplierNumber && <p style={{ color: 'red', fontSize: '10px' }}>{numberErrors.supplierNumber}</p>}
                        </div>
                        <div className="field col-3">
                            <label htmlFor="manufacturerName" className="font-semibold">
                                Enter Password
                            </label>
                            <InputText
                                id="manufacturerName"
                                type="text"
                                value={get(form, 'supplierManufacturerName')}
                                onChange={(e) => onInputChange('supplierManufacturerName', e.target.value)}
                                className="p-inputtext w-full mb-1"
                                placeholder="Enter Password"
                            />
                            {formErrors.supplierManufacturerName && (
                                <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{formErrors.supplierManufacturerName}</p> // Display error message
                            )}
                            {/* Display word limit errors separately */}
                            {wordLimitErrors.supplierManufacturerName && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{wordLimitErrors.supplierManufacturerName}</p>}
                            {alphabetErrors.supplierManufacturerName && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{alphabetErrors.supplierManufacturerName}</p>}
                        </div>
                        <div className="field col-3">
                            <label htmlFor="factoryName" className="font-semibold">
                                Confirm Password
                            </label>
                            <InputText id="factoryName" value={get(form, 'factoryName')} type="text" onChange={(e) => onInputChange('factoryName', e.target.value)} placeholder="Enter Confirm Password" className="p-inputtext w-full mb-1" />
                            {formErrors.factoryName && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.factoryName}</p>}
                            {/* Display word limit errors separately */}
                            {wordLimitErrors.factoryName && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{wordLimitErrors.factoryName}</p>}
                        </div>
                    </div>
                </div>
                {/* <div className="px-3">
                            <i className="text-red-400 text-sm">All feilds required *</i>
                        </div> */}
            </div>
        );
    };

    return (
        <div className="">
            <div className="p-card">
                <Stepper currentStep={currentStep} completedSteps={completedSteps} />
                <hr />
                <div className="p-card-body">{renderStepContent()}</div>
                <hr />
                <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400">
                    <>
                        <Button label={isEditMode ? 'Update' : 'Submit'} icon="pi pi-check" className="bg-primary-main border-primary-main hover:text-white mb-3" onClick={handleSubmit} />
                    </>
                </div>
            </div>
        </div>
    );
};

export default ManageVendorAddEditPage;
