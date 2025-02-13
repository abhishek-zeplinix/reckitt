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
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [wordLimitErrors, setWordLimitErrors] = useState<{ [key: string]: string }>({});
    const [wordMaxLimitErrors, setWordMaxLimitErrors] = useState<{ [key: string]: string }>({});
    const [numberErrors, setNumberErrors] = useState<{ [key: string]: string }>({});
    const [alphabetErrors, setAlphabetErrors] = useState<{ [key: string]: string }>({});
    const [emailErrors, setEmailErrors] = useState<{ [key: string]: string }>({});

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
            if (isEditMode) {
                const countries = await Country.getAllCountries();
                if (form?.country) {
                    const selectedCountryObj = countries.find((c) => c.isoCode.toLowerCase() === form.country.toLowerCase() || c.name.toLowerCase() === form.country.toLowerCase());
                    if (selectedCountryObj) {
                        if (form.state) {
                            const cities = await City.getCitiesOfState(selectedCountryObj.isoCode, form.state);
                            setAllCity(cities);
                        } else {
                            setAllCity([]); // Reset cities if no state is selected
                        }
                    }
                }
            } else if (form.state) {
                const cities = await City.getCitiesOfState(form.country, form.state);
                setAllCity(cities);
            } else {
                setAllCity([]); // Reset cities if no state is selected
            }
        };
        fetchCities();
    }, [form.state]);
    // Fetch Countries
    useEffect(() => {
        const fetchCountries = async () => {
            const countries = await Country.getAllCountries();
            setAllCountry(countries);

            if (form?.country) {
                const selectedCountryObj = countries.find((c) => c.isoCode.toLowerCase() === form.country.toLowerCase() || c.name.toLowerCase() === form.country.toLowerCase());

                if (selectedCountryObj) {
                    fetchStates(selectedCountryObj.isoCode);
                }
            }
        };

        fetchCountries();
    }, [form?.country]);

    // Fetch States

    const fetchStates = async (countryCode: string) => {
        if (countryCode) {
            const states = await State.getStatesOfCountry(countryCode);
            setAllState(states);

            if (form?.state) {
                const selectedStateObj = states.find((s) => s.isoCode.toLowerCase() === form.state.toLowerCase() || s.name.toLowerCase() === form.state.toLowerCase());

                if (selectedStateObj) {
                    fetchCities(countryCode, selectedStateObj.isoCode);
                }
            }
        } else {
            setAllState([]);
        }
    };

    // Fetch Cities
    const fetchCities = async (countryCode: string, stateCode: string) => {
        if (countryCode && stateCode) {
            const cities = await City.getCitiesOfState(countryCode, stateCode);

            setAllCity(cities);
        } else {
            setAllCity([]);
        }
    };

    // Get Selected Values
    const selectedCountry = allCountry.find((c: { isoCode: string; name: string }) => c.isoCode.toLowerCase() === form?.country?.toLowerCase() || c.name.toLowerCase() === form?.country?.toLowerCase());

    const selectedState = allState.find((s: { isoCode: string; name: string }) => s.isoCode.toLowerCase() === form?.state?.toLowerCase() || s.name.toLowerCase() === form?.state?.toLowerCase());

    const selectedCity = allCity.find((c: { name: string }) => c.name.toLowerCase() === form?.city?.toLowerCase());

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
                setAlert('error', 'Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [isEditMode]); // Add isEditMode as a dependency if its value can change

    const fetchSupplierData = async () => {
        try {
            setLoading(true);
            const params = { filters: { supId }, pagination: false };
            const queryString = buildQueryParams(params);
            const response = await GetCall(`/company/supplier?${queryString}`);

            if (response.data && response.data[0]) {
                const mappedForm = mapToForm(response.data[0]);
                setForm(mappedForm);
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
        } finally {
            setLoading(false);
        }
    };

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const response: CustomResponse = await GetCall(`/company/category`);
            if (response.code === 'SUCCESS') {
                setCategory(response.data);
            }
        } catch (error) {
            setAlert('error', 'Failed to fetch category data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            setLoading(true);
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
                if (name === 'supplierName') {
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

            return updatedForm;
        });

        // Real-time validation: Remove error if input is valid
        setFormErrors((prevErrors) => {
            const updatedErrors = { ...prevErrors };

            if (val && updatedErrors[name]) {
                delete updatedErrors[name]; // Remove error when the field is filled
            }

            return updatedErrors;
        });
        setForm((prevForm) => {
            const updatedForm = {
                ...prevForm,
                ...(typeof name === 'string' ? { [name]: val } : name)
            };
            if (name === 'supplierCategoryId') {
                fetchSubCategoryByCategoryId(val);
                updatedForm.procurementCategoryId = null;
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
            setLoading(true);
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
    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        handleNext(form);
    };

    const handleCheckboxChange = (event: any) => {
        const { name, checked } = event.target;
        setChecked((prev) => ({ ...prev, [name]: checked }));
    };
    // navigation Handlers
    const handleNext = (form: Record<string, unknown>) => {
        const { valid, errors } = validateFormData(form);
        if (!valid) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
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
                                        className="p-inputtext w-full mb-1"
                                        placeholder="Enter Supplier Name"
                                        required
                                    />
                                    {formErrors.supplierName && (
                                        <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{formErrors.supplierName}</p> // Display error message
                                    )}
                                    {/* Display word limit errors separately */}
                                    {wordLimitErrors.supplierName && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{wordLimitErrors.supplierName}</p>}
                                    {alphabetErrors.supplierName && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{alphabetErrors.supplierName}</p>}
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
                                        className="p-inputtext w-full mb-1"
                                        placeholder="Enter Manufacturer Name"
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
                                        Factory Name
                                    </label>
                                    <InputText id="factoryName" value={get(form, 'factoryName')} type="text" onChange={(e) => onInputChange('factoryName', e.target.value)} placeholder="Enter Factory Name" className="p-inputtext w-full mb-1" />
                                    {formErrors.factoryName && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{formErrors.factoryName}</p>}
                                    {/* Display word limit errors separately */}
                                    {wordLimitErrors.factoryName && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{wordLimitErrors.factoryName}</p>}
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
                                        onChange={(e) => onInputChange('supplierCategoryId', e.value)}
                                        placeholder="Select Procurement Category"
                                        className="w-full mb-1"
                                    />
                                    {formErrors.supplierCategoryId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.supplierCategoryId}</p>}
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
                                            className="w-full mb-1"
                                        />
                                    ) : (
                                        <Dropdown id="supplierCategory" placeholder="Please Select a  Category" className="w-full" />
                                    )}
                                    {formErrors.procurementCategoryId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.procurementCategoryId}</p>}
                                </div>

                                <div className="field col-3">
                                    <label htmlFor="email" className="font-semibold">
                                        Email Address
                                    </label>
                                    <InputText id="email" value={get(form, 'email')} type="email" onChange={(e) => onInputChange('email', e.target.value)} placeholder="Enter Email Address " className="p-inputtext w-full mb-1" />
                                    {formErrors.email && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{formErrors.email}</p>}
                                    {emailErrors.email && <p style={{ color: 'red', fontSize: '10px' }}>{emailErrors.email}</p>}
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="supplierNumber" className="font-semibold">
                                        Phone Number
                                    </label>
                                    <InputText
                                        id="supplierNumber"
                                        value={get(form, 'supplierNumber')}
                                        type="text"
                                        onChange={(e) => onInputChange('supplierNumber', e.target.value)}
                                        placeholder="Enter Phone Number "
                                        className="p-inputtext w-full mb-1"
                                    />
                                    {formErrors.supplierNumber && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{formErrors.supplierNumber}</p>}
                                    {numberErrors.supplierNumber && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{numberErrors.supplierNumber}</p>}
                                </div>

                                <div className="field col-3">
                                    <label htmlFor="country" className="font-semibold">
                                        Country
                                    </label>
                                    <Dropdown
                                        id="country"
                                        value={selectedCountry?.isoCode || ''}
                                        options={allCountry}
                                        optionLabel="name"
                                        optionValue="isoCode"
                                        filter
                                        onChange={(e) => {
                                            onInputChange('country', e.value);
                                            onInputChange('state', ''); // Reset state when country changes
                                            onInputChange('city', ''); // Reset city when country changes
                                        }}
                                        placeholder="Select Country"
                                        className="w-full mb-1"
                                    />
                                    {formErrors.country && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.country}</p>}
                                </div>

                                <div className="field col-3">
                                    <label htmlFor="state" className="font-semibold">
                                        State
                                    </label>
                                    <Dropdown
                                        id="state"
                                        value={selectedState?.isoCode || ''}
                                        options={allState}
                                        optionLabel="name"
                                        optionValue="isoCode"
                                        filter
                                        onChange={(e) => {
                                            onInputChange('state', e.value);
                                            onInputChange('city', ''); // Reset city when state changes
                                        }}
                                        placeholder="Select State"
                                        className="w-full mb-1"
                                    />
                                    {formErrors.state && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.state}</p>}
                                </div>

                                <div className="field col-3">
                                    <label htmlFor="city" className="font-semibold">
                                        City
                                    </label>
                                    <Dropdown
                                        id="city"
                                        value={selectedCity?.name || ''}
                                        options={allCity}
                                        optionLabel="name"
                                        optionValue="name"
                                        filter
                                        onChange={(e) => onInputChange('city', e.value)}
                                        placeholder="Select City"
                                        className="w-full mb-1"
                                    />
                                    {formErrors.city && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.city}</p>}
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="Zip" className="font-semibold">
                                        ZipCode
                                    </label>
                                    <InputText id="Zip" value={get(form, 'Zip')} type="text" onChange={(e) => onInputChange('Zip', e.target.value)} placeholder="Enter ZipCode " className="p-inputtext w-full mb-1" />
                                    {formErrors.Zip && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{formErrors.Zip}</p>}
                                    {numberErrors.Zip && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{numberErrors.Zip}</p>}
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="siteAddress" className="font-semibold">
                                        Site Address
                                    </label>
                                    <InputTextarea id="siteAddress" value={get(form, 'siteAddress')} onChange={(e) => onInputChange('siteAddress', e.target.value)} className="p-inputtext w-full mb-1" placeholder="Enter Site Address" />
                                    {formErrors.siteAddress && (
                                        <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{formErrors.siteAddress}</p> // Display error message
                                    )}
                                    {wordMaxLimitErrors.siteAddress && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{wordMaxLimitErrors.siteAddress}</p>}
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
                                        className="p-inputtext w-full mb-1"
                                    />
                                    {formErrors.warehouseLocation && (
                                        <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{formErrors.warehouseLocation}</p> // Display error message
                                    )}
                                    {/* Display word limit errors separately */}
                                    {wordMaxLimitErrors.warehouseLocation && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{wordMaxLimitErrors.warehouseLocation}</p>}
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

                            <p className="mx-2 font-italic text-sm text-primary-main">* Only PDF, DOC, JPG, and PNG files are allowed, with a maximum size of 2MB</p>
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
                    {currentStep === 1 && <Button label="Next" icon="pi pi-arrow-right" className="bg-primary-main border-primary-main hover:text-white mb-3" onClick={handleButtonClick} />}
                    {currentStep === 2 && (
                        <>
                            <Button label="Back" icon="pi pi-arrow-left" className="text-primary-main bg-white border-primary-main hover:text-primary-main hover:bg-white transition-colors duration-150 mb-3" onClick={handlePrevious} />
                            <Button label={isEditMode ? 'Update' : 'Submit'} icon="pi pi-check" className="bg-primary-main border-primary-main hover:text-white mb-3" onClick={handleSubmit} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageSupplierAddEditPage;
