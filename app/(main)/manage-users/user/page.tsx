/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { CustomResponse } from '@/types';
import { buildQueryParams, getRowLimitWithScreenHeight, validateFormData, validateManageUser } from '@/utils/utils';
import { Country, State, City } from 'country-state-city';
import { EmptyManageUsers } from '@/types/forms';
import { InputText } from 'primereact/inputtext';
import { get } from 'lodash';
const defaultForm: EmptyManageUsers = {
    roleId: null,
    supplierId: null,
    name: '',
    email: '',
    password: '',
    phone: '',
    state: '',
    country: '',
    departmentId:null,
    city: '',
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

const ManageUserAddPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true'; // Check if in edit mode
    const userId = searchParams.get('userId');
    const [selectedRole, setSelectedRole] = useState<any>('');
    const [supplierData, setSupplierData] = useState([]);
    const [roleName, setRoleName] = useState('');
    const [roleEmail, setRoleEmail] = useState('');
    const [rolePhone, setRolePhone] = useState('');
    const [rolePassword, setRolePassword] = useState('');
    const [createRole, setCreateRole] = useState('');
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [page, setPage] = useState<number>(1);
    const { setAlert, setLoading } = useAppContext();
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);
    const [roles, setRoles] = useState([]);
    const [allCountry, setAllCountry] = useState<any>([]);
    const [allState, setAllState] = useState<any>([]);
    const [allCity, setAllCity] = useState<any>([]);
    const [form, setForm] = useState<EmptyManageUsers>(defaultForm);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [wordLimitErrors, setWordLimitErrors] = useState<{ [key: string]: string }>({});
    const [wordMaxLimitErrors, setWordMaxLimitErrors] = useState<{ [key: string]: string }>({});
    const [numberErrors, setNumberErrors] = useState<{ [key: string]: string }>({});
    const [alphabetErrors, setAlphabetErrors] = useState<{ [key: string]: string }>({});
    const [emailErrors, setEmailErrors] = useState<{ [key: string]: string }>({});
    const [allDepartment, setAllDepartment] = useState<any>([]);
    const showFields = selectedRole.label === "Evaluator" || selectedRole.label === "Approver";

 // Fetch cities based on selected state
 useEffect(() => {
    const fetchCities = async () => {
        if(isEditMode){
            const countries = await Country.getAllCountries();
                if (form?.country) {
                    const selectedCountryObj = countries.find(
                        (c) =>
                          c.isoCode.toLowerCase() === form.country.toLowerCase() ||
                          c.name.toLowerCase() === form.country.toLowerCase()
                      );
                    if (selectedCountryObj) {
                        const states = await State.getAllStates();
                        const selectedStateObj = states.find(
                            (c) =>
                            c.isoCode.toLowerCase() === form.state.toLowerCase() ||
                            c.name.toLowerCase() === form.state.toLowerCase()
                        );
                        if(selectedStateObj){
                        const cities = await City.getCitiesOfState(selectedCountryObj.isoCode, selectedStateObj.isoCode);
                        setAllCity(cities);
                        } else {
                            setAllCity([]); // Reset cities if no state is selected
                        }
                    }};
                }
        else if (form.state) {
                const countries = await Country.getAllCountries();
                    if (form?.country) {
                        const selectedCountryObj = countries.find(
                            (c) =>
                              c.isoCode.toLowerCase() === form.country.toLowerCase() ||
                              c.name.toLowerCase() === form.country.toLowerCase()
                          );
                        if (selectedCountryObj) {
                            if (form.state) {
                                const states = await State.getAllStates();
                                const selectedStateObj = states.find(
                                    (c) =>
                                    c.isoCode.toLowerCase() === form.state.toLowerCase() ||
                                    c.name.toLowerCase() === form.state.toLowerCase()
                                );
                                if(selectedStateObj){
                                const cities = await City.getCitiesOfState(selectedCountryObj.isoCode, selectedStateObj.isoCode);
                                setAllCity(cities);
                                }
                            } else {
                                setAllCity([]); // Reset cities if no state is selected
                            }
                        }};
        } else {
            setAllCity([]); 
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
    const selectedCountryObj = countries.find(
      (c) =>
        c.isoCode.toLowerCase() === form.country.toLowerCase() ||
        c.name.toLowerCase() === form.country.toLowerCase()
    );

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
    const selectedStateObj = states.find(
      (s) =>
        s.isoCode.toLowerCase() === form.state.toLowerCase() ||
        s.name.toLowerCase() === form.state.toLowerCase()
    );
    
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
const selectedCountry = allCountry.find(
(c: { isoCode: string; name: string; }) =>
  c.isoCode.toLowerCase() === form?.country?.toLowerCase() ||
  c.name.toLowerCase() === form?.country?.toLowerCase()
);

const selectedState = allState.find(
(s: { isoCode: string; name: string; }) =>
  s.isoCode.toLowerCase() === form?.state?.toLowerCase() ||
  s.name.toLowerCase() === form?.state?.toLowerCase()
);

const selectedCity = allCity.find(
(c: { name: string; }) => c.name.toLowerCase() === form?.city?.toLowerCase()
);

    useEffect(() => {
        fetchData();
        fetchSupplierData();
        fetchDepartment();
        if (isEditMode && userId) {
            fetchUserDetails(); // Fetch and pre-fill data in edit mode
        }
    }, []);
     useEffect(() => {
        if(form.roleId){
            const selectedRole=roles.find(
                (c: { label: string; value: number; }) =>
                  c.value === form?.roleId
                );
                setSelectedRole(selectedRole)
        }else{
            setSelectedRole('')
        }
    
      }, [form?.roleId]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response: CustomResponse = await GetCall(`/company/user?filters.id=${userId}&sortBy=id`);
            if (response.code === 'SUCCESS' && response.data.length > 0) {
                const userDetails = response.data[0]; 
                setForm(userDetails)
            } else {
                setAlert('error', 'User details not found.');
            }
        } catch (error) {
            setAlert('error', 'Failed to fetch user details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const response: CustomResponse = await GetCall(`/company/roles`);
            if (response.code === 'SUCCESS') {
                const formattedData = response.data
                .filter((item: any) => item.name !== "Supplier") // Exclude "Supplier"
                .map((item: any) => ({
                    label: item.name, // Dropdown label
                    value: item.roleId // Dropdown value
                }));
            setRoles(formattedData);
            } else {
                setRoles([]);
            }
        } catch (error) {
            setRoles([]);
            setAlert('error', 'Failed to get roles');
        } finally {
            setLoading(false);
        }
    };

    const fetchSupplierData = async (params?: any) => {
        try {
            if (!params) {
                params = { limit: limit, page: page };
            }
            setLoading(true);
            const queryString = buildQueryParams(params);
            const response: CustomResponse = await GetCall(`/company/supplier?${queryString}`);
            setLoading(false);
            if (response.code == 'SUCCESS') {
                const formattedData = response.data.map((item: any) => ({
                    label: item.supplierName, // Dropdown label
                    value: item.supId // Dropdown value
                }));
                setSupplierData(formattedData);

                if (response.total) {
                    setTotalRecords(response?.total);
                }
            } else {
                setSupplierData([]);
            }
        } catch (error) {
            setRoles([]);
            setAlert('error', 'Failed to get supplier data');
        } finally {
            setLoading(false);
        }
    };
    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            handleSubmit(form);
        };

    const handleSubmit = async (form: Record<string, unknown>) => {
         const { valid, errors } = validateManageUser(form, isEditMode,showFields);
                if (!valid) {
                    setFormErrors(errors);
                    return;
                }
                setFormErrors({});
                console.log('281',userId)
        setIsDetailLoading(true);
        
        try {
            setLoading(true);
            let endpoint: string;
            let response: CustomResponse;

            // Determine API call based on isEditMode
            if (isEditMode) {
                endpoint = `/company/user/${userId}`;
                response = await PutCall(endpoint, form); 
            } else {
                endpoint = `/company/user`;
                response = await PostCall(endpoint, form); 
            }

            // Handle API response
            if (response.code === 'SUCCESS') {
                setAlert('success', isEditMode ? 'User updated successfully!' : 'User added successfully!');
                router.push('/manage-users');
            } else {
                setAlert('error', response.message || 'Failed to submit user data.');
            }
        } catch (error) {
            setAlert('error', 'An error occurred while submitting user data.');
        } finally {
            setLoading(false);
        }
    };

    // Adjust title based on edit mode
    const pageTitle = isEditMode ? 'Edit User' : 'Add User';
    const submitButtonLabel = isEditMode ? 'Save' : 'Add User';

    const renderNewRuleFooter = () => {
        return (
            <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400 ">
                <Button
                    label="Cancel"
                    className="text-primary-main bg-white border-primary-main hover:text-primary-main hover:bg-transparent transition-colors duration-150 mb-3"
                    onClick={() => router.push('/manage-users')} // Navigate back to manage users
                />
                <Button label={submitButtonLabel} icon="pi pi-check" className="bg-primary-main border-primary-main hover:text-white mb-3" onClick={handleButtonClick} />
            </div>
        );
    };

    const footerNewRules = renderNewRuleFooter();

    const onInputChange = (name: string | { [key: string]: any }, val?: any) => {
        if (typeof name !== 'string') return;
        if (name !== 'departmentId' && name !== 'roleId' && name !== 'country' && name !== 'state' && name !== 'city') {
            if (val) {
                const trimmedValue = val.trim();
                const wordCount = trimmedValue.length;
                if (name === 'password') {
                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
                    if (wordCount > 50) {
                        setWordLimitErrors((prevWordErrors) => ({
                            ...prevWordErrors,
                            [name]: 'Maximum 50 characters allowed!'
                        }));
                        return;
                    } else if (!passwordRegex.test(trimmedValue)) {
                        setWordLimitErrors((prevWordErrors) => ({
                            ...prevWordErrors,
                            [name]: 'Password must contain at least one uppercase, one lowercase, one number, and one special character.'
                        }));
                        
                    }else {
                        setWordLimitErrors((prevWordErrors) => {
                            const updatedErrors = { ...prevWordErrors };
                            delete updatedErrors[name];
                            return updatedErrors;
                        });
                    }
                }
                if (name === 'name' || name === 'email') {
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
                if (name === 'phone') {
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
                if (name === 'name') {
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
                ...(typeof name === 'string' ? { [name]: val } : name),
            };
    
            if (name === 'departmentId') {
                setForm((prev) => ({
                    ...prev,
                    departmentId: val || null,
                }));
                updatedForm.departmentId = null;
            }
            if (name === 'roleId') {   
                setForm((prev) => ({
                    ...prev,
                    roleId: val || null,
                    
                }));
                updatedForm.roleId = null;
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
    };
        const fetchDepartment = async () => {
            const response: CustomResponse = await GetCall(`/company/department`);
            if (response.code === 'SUCCESS') {
                setAllDepartment(response.data);
            }
        };
    const renderContentbody = () => {
        return (
            <div className="grid">
                <div className="col-12">
                    <div className="flex flex-column gap-3">
                        <div className="p-fluid grid mx-1 pt-2">
                            <div className="field col-3">
                                <label htmlFor="role" className="font-semibold">Role</label>
                                <Dropdown id="roleId" value={get(form, 'roleId')} options={roles} onChange={(e) => onInputChange('roleId', e.value)} placeholder="Select Role" className="w-full" showClear={!!get(form, 'roleId')}/>
                                {formErrors.roleId && (
                                    <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{formErrors.roleId}</p> // Display error message
                                )}
                            </div>
                            {/* {Number(createRole) === 2 && (
                                <div className="field col-3">
                                    <label htmlFor="supplier" className="font-semibold">Supplier</label>
                                    <Dropdown id="supplier" value={supplierId} options={supplierData} onChange={(e) => setSupplierId(e.value)} placeholder="Select Supplier" className="w-full" />
                                </div>
                            )} */}
                             {showFields && (
                                <>
                            <div className="field col-3">
                                <label htmlFor="departmentId" className="font-semibold">
                                    Department
                                </label>
                                    <Dropdown
                                        id="departmentId"
                                        value={get(form, 'departmentId')}
                                        options={allDepartment}
                                        optionLabel="name"
                                        optionValue="departmentId"
                                        onChange={(e) => onInputChange('departmentId', e.value)}
                                        placeholder="Select Department"
                                        className="w-full mb-1"
                                        showClear={!!get(form, 'departmentId')}
                                    />
                                    {formErrors.departmentId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.departmentId}</p>}
                                </div>
                                </>
                             )}
                            <div className="field col-3">
                                <label htmlFor="name" className="font-semibold">Role Name</label>
                                {/* <input id="name" type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} className="p-inputtext w-full" placeholder="Enter Role Name" /> */}
                                <InputText
                                    id="name"
                                    type="text"
                                    value={get(form, 'name')}
                                    onChange={(e) => onInputChange('name', e.target.value)}
                                    className="p-inputtext w-full mb-1"
                                    placeholder="Enter Role Name"
                                    required
                                />
                                {formErrors.name && (
                                    <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{formErrors.name}</p> // Display error message
                                )}
                                {wordMaxLimitErrors.name && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{wordMaxLimitErrors.name}</p>}
                                {alphabetErrors.name && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{alphabetErrors.name}</p>}
                            </div>
                            <div className="field col-3">
                                <label htmlFor="email" className="font-semibold">Email Address</label>
                                {/* <input id="email" type="text" value={roleEmail} onChange={(e) => setRoleEmail(e.target.value)} className="p-inputtext w-full" placeholder="Enter Role Email" disabled={isEditMode === true} /> */}
                                <InputText id="email" value={get(form, 'email')} type="email" onChange={(e) => onInputChange('email', e.target.value)} placeholder="Enter Email Address " className="p-inputtext w-full mb-1" disabled={isEditMode === true} />
                                {formErrors.email && <p style={{ color: 'red', fontSize: '10px',marginBottom:'0px' }}>{formErrors.email}</p>}
                                {emailErrors.email && <p style={{ color: 'red', fontSize: '10px' }}>{emailErrors.email}</p>}
                            </div>
                            <div className="field col-3">
                                <label htmlFor="phone" className="font-semibold">Phone Number</label>
                                {/* <input id="phone" type="text" value={rolePhone} onChange={(e) => setRolePhone(e.target.value)} className="p-inputtext w-full" placeholder="Enter Role Phone Number" disabled={isEditMode === true} /> */}
                                 <InputText
                                    id="phone"
                                    value={get(form, 'phone')}
                                    type="text"
                                    onChange={(e) => onInputChange('phone', e.target.value)}
                                    placeholder="Enter Phone Number "
                                    className="p-inputtext w-full mb-1"
                                    disabled={isEditMode === true}
                                />
                                {formErrors.phone && <p style={{ color: 'red', fontSize: '10px', marginBottom:'0px'}}>{formErrors.phone}</p>}
                                {numberErrors.phone && <p style={{ color: 'red', fontSize: '10px' ,marginBottom:'0px'}}>{numberErrors.phone}</p>}
                            </div>

                            {!isEditMode && (
                                <div className="field col-3">
                                    <label htmlFor="password" className="font-semibold">Password</label>
                                    {/* <input id="manufacturerName" type="text" value={rolePassword} onChange={(e) => setRolePassword(e.target.value)} className="p-inputtext w-full" placeholder="Enter Password" /> */}
                                    <InputText
                                    id="password"
                                    value={get(form, 'password')}
                                    type="text"
                                    onChange={(e) => onInputChange('password', e.target.value)}
                                    placeholder="Enter Password Number "
                                    className="p-inputtext w-full mb-1"
                                />
                                {formErrors.password && <p style={{ color: 'red', fontSize: '10px', marginBottom:'0px'}}>{formErrors.password}</p>}
                                {wordLimitErrors.password && <p style={{ color: 'red', fontSize: '10px' ,marginBottom:'0px'}}>{wordLimitErrors.password}</p>}
                                </div>
                            )}
                             {showFields && (
                                <>
                            <div className="field col-3">
                              <label htmlFor="country" className="font-semibold">Country</label>
                              <Dropdown
                                id="country"
                                value={selectedCountry?.name  || ''}
                                options={allCountry}
                                optionLabel="name"
                                optionValue="name"
                                filter
                                onChange={(e) => {
                                  onInputChange('country', e.value);
                                  onInputChange('state', ''); // Reset state when country changes
                                  onInputChange('city', ''); // Reset city when country changes
                                }}
                                placeholder="Select Country"
                                className="w-full mb-1"
                                showClear={!!selectedCountry}
                              />
                              {formErrors.country && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.country}</p>}
                            </div>
                            
                            <div className="field col-3">
                              <label htmlFor="state" className="font-semibold">State</label>
                              <Dropdown
                                id="state"
                                value={selectedState?.name  || ''}
                                options={allState}
                                optionLabel="name"
                                optionValue="name"
                                filter
                                onChange={(e) => {
                                  onInputChange('state', e.value);
                                  onInputChange('city', ''); // Reset city when state changes
                                }}
                                placeholder="Select State"
                                className="w-full mb-1"
                                showClear={!!selectedState}
                              />
                              {formErrors.state && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.state}</p>}
                            </div>
                            
                            <div className="field col-3">
                              <label htmlFor="city" className="font-semibold">City</label>
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
                                showClear={!!selectedCity}
                              />
                              {formErrors.city && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.city}</p>}
                            </div>
                            </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const contentBody = renderContentbody();

    const handleNavigation = () => {
        router.push('/manage-users');
    };

    return (
        <div className="" style={{ position: 'relative' }}>
            <div className="p-card">
                {/* Header Section */}
                <div className="p-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', padding: '20px' }}>
                        {/* Arrow pointing left */}
                        <Button icon="pi pi-arrow-left" className="p-button-text p-button-plain gap-5" style={{ marginRight: '1rem' }} onClick={handleNavigation}>
                            {/* Dynamic Add/Edit User text */}
                            <span style={{ fontWeight: 'bold', fontSize: '20px' }}>{pageTitle}</span>
                        </Button>
                    </div>
                </div>
                <hr />
                <div className="p-card-body">
                    {/* Body rendering */}
                    {contentBody}
                </div>

                {/* Footer Buttons */}
                <hr />
                {footerNewRules}
            </div>
        </div>
    );
};

export default ManageUserAddPage;
