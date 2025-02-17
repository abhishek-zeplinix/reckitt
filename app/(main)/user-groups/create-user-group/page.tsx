/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { CustomResponse } from '@/types';
import { buildQueryParams, getRowLimitWithScreenHeight, validateUserGroup} from '@/utils/utils';
import { EmptyUsersGroup } from '@/types/forms';
import { InputText } from 'primereact/inputtext';
import { get } from 'lodash';
import { InputTextarea } from 'primereact/inputtextarea';
const defaultForm: EmptyUsersGroup = {
  assesorTypeId: null,
  positionId:  null,
  assesorRoleId: null,
  email:'',
  name:'',
  phone:'',
};

const ManageUserAddPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true'; // Check if in edit mode
    const userGroupId = searchParams.get('userGroupId');
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [page, setPage] = useState<number>(1);
    const { setAlert, setLoading } = useAppContext();
    const [roles, setRoles] = useState([]);
    const [form, setForm] = useState<EmptyUsersGroup>(defaultForm);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [wordLimitErrors, setWordLimitErrors] = useState<{ [key: string]: string }>({});
    const [wordMaxLimitErrors, setWordMaxLimitErrors] = useState<{ [key: string]: string }>({});
    const [numberErrors, setNumberErrors] = useState<{ [key: string]: string }>({});
    const [alphabetErrors, setAlphabetErrors] = useState<{ [key: string]: string }>({});
    const [emailErrors, setEmailErrors] = useState<{ [key: string]: string }>({});
    const [WhitelistedDomain, setAllWhitelistedDomain] = useState<any>([]);
    const [allAssesortype, setAllAssesortype] = useState<any>([]);
    const [allPosition, setAllPosition] = useState<any>([]);
    const [allAssesorrole, setAllAssesorrole] = useState<any>([]);
    // const showFields = selectedRole.label === "Evaluator" || selectedRole.label === "Approver";

    useEffect(() => {
        fetchWhitelistedDomain();
        fetchAssesortype();
        fetchPosition();
        fetchAssesorrole();
        if (isEditMode && userGroupId) {
            fetchUserDetails(); // Fetch and pre-fill data in edit mode
        }
    }, []);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response: CustomResponse = await GetCall(`/company/user-group?filters.userGroupId=${userGroupId}&sortBy=id`);
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
    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            handleSubmit(form);
        };

    const handleSubmit = async (form: Record<string, unknown>) => {
         const { valid, errors } = validateUserGroup(form);
                if (!valid) {
                    setFormErrors(errors);
                    return;
                }
                setFormErrors({});
        setIsDetailLoading(true);
        
        try {
            setLoading(true);
            let endpoint: string;
            let response: CustomResponse;

            // Determine API call based on isEditMode
            if (isEditMode) {
                endpoint = `/company/user-group/${userGroupId}`;
                response = await PutCall(endpoint, form); 
            } else {
                endpoint = `/company/user-group`;
                response = await PostCall(endpoint, form); 
            }

            // Handle API response
            if (response.code === 'SUCCESS') {
                setAlert('success', isEditMode ? 'User updated successfully!' : 'User added successfully!');
                router.push('/user-groups');
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
    const pageTitle = isEditMode ? 'Edit User' : 'Add groups';
    const submitButtonLabel = isEditMode ? 'Save' : 'Add groups';

    const renderNewRuleFooter = () => {
        return (
            <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400 ">
                <Button
                    label="Cancel"
                    className="text-primary-main bg-white border-primary-main hover:text-primary-main hover:bg-transparent transition-colors duration-150 mb-3"
                    onClick={() => router.push('/user-groups')}
                />
                <Button label={submitButtonLabel} icon="pi pi-check" className="bg-primary-main border-primary-main hover:text-white mb-3" onClick={handleButtonClick} />
            </div>
        );
    };

    const footerNewRules = renderNewRuleFooter();

    const onInputChange = (name: string | { [key: string]: any }, val?: any) => {
        if (typeof name !== 'string') return;
        if (name !== 'assesorTypeId' && name !== 'positionId' && name !== 'assesorRoleId') {
            if (val) {
                const trimmedValue = val.trim();
                const wordCount = trimmedValue.length;
                // if (name === 'password') {
                //     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
                //     if (wordCount > 50) {
                //         setWordLimitErrors((prevWordErrors) => ({
                //             ...prevWordErrors,
                //             [name]: 'Maximum 50 characters allowed!'
                //         }));
                //         return;
                //     } else if (!passwordRegex.test(trimmedValue)) {
                //         setWordLimitErrors((prevWordErrors) => ({
                //             ...prevWordErrors,
                //             [name]: 'Password must contain at least one uppercase, one lowercase, one number, and one special character.'
                //         }));
                        
                //     }else {
                //         setWordLimitErrors((prevWordErrors) => {
                //             const updatedErrors = { ...prevWordErrors };
                //             delete updatedErrors[name];
                //             return updatedErrors;
                //         });
                //     }
                // }
                if (name === 'name' || name === 'email' || name === 'address') {
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
                // if (name === 'zip') {
                //     if (!/^[a-zA-Z0-9\s-]+$/.test(val)) {
                //         // Ensure only numbers and dash are allowed
                //         setNumberErrors((prevNumErrors) => ({
                //             ...prevNumErrors,
                //             [name]: 'Only letters,numbers,spaces and hyphens are allowed!'
                //         }));
                //         return;
                //     } else if (val.length > 10) {
                //         setNumberErrors((prevNumErrors) => ({
                //             ...prevNumErrors,
                //             [name]: 'Maximum 10 characters allowed! '
                //         }));
                //         return;
                //     } else if (val.length < 1) {
                //         setNumberErrors((prevNumErrors) => ({
                //             ...prevNumErrors,
                //             [name]: 'Zip must not be empty'
                //         }));
                //         return;
                //     } else {
                //         setNumberErrors((prevNumErrors) => {
                //             const updatedErrors = { ...prevNumErrors };
                //             delete updatedErrors[name];
                //             return updatedErrors;
                //         });
                //     }
                // }
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
            return updatedForm;
        });
    
        // Real-time validation: Remove error if input is valid
        setFormErrors((prevErrors) => {
            const updatedErrors = { ...prevErrors };
    
            if (val && updatedErrors[name]) {
                delete updatedErrors[name]; 
            }
    
            return updatedErrors;
        });
    };
        const fetchWhitelistedDomain = async () => {
            const response: CustomResponse = await GetCall(`/company/whitelistedDomain`);
            if (response.code === 'SUCCESS') {
                setAllWhitelistedDomain(response.data);
            }
        };
        const fetchAssesortype = async () => {
            const response: CustomResponse = await GetCall(`/company/assesortype`);
            if (response.code === 'SUCCESS') {
                setAllAssesortype(response.data);
            }
        };
        const fetchPosition = async () => {
            const response: CustomResponse = await GetCall(`/company/position`);
            if (response.code === 'SUCCESS') {
                setAllPosition(response.data);
            }
        };
        const fetchAssesorrole = async () => {
            const response: CustomResponse = await GetCall(`/company/assesorrole`);
            if (response.code === 'SUCCESS') {
                setAllAssesorrole(response.data);
            }
        };
    const renderContentbody = () => {
        return (
            <div className="grid">
                <div className="col-12">
                    <div className="flex flex-column gap-3">
                        <div className="p-fluid grid mx-1 pt-2">
                            <div className="field col-3">
                                <label htmlFor="role" className="font-semibold">Allowed Domains</label>
                                {WhitelistedDomain.length > 0 && (
                                    <p className="text-sm text-gray-600 mb-2">{WhitelistedDomain.map((domain: { whitelistedDomainName: any; }) => domain.whitelistedDomainName).join(", ")}</p>
                                )}
                            </div>
                            <div className="field col-3">
                                <label htmlFor="assesorTypeId" className="font-semibold">
                                Assesor Type
                                </label>
                                    <Dropdown
                                        id="assesorTypeId"
                                        value={get(form, 'assesorTypeId')}
                                        options={allAssesortype}
                                        optionLabel="assesorTypeName"
                                        optionValue="assesorTypeId"
                                        onChange={(e) => onInputChange('assesorTypeId', e.value)}
                                        placeholder="Select Assesor Type"
                                        className="w-full mb-1"
                                        showClear={!!get(form, 'assesorTypeId')}
                                    />
                                    {formErrors.assesorTypeId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.assesorTypeId}</p>}
                                </div>
                                <div className="field col-3">
                                <label htmlFor="name" className="font-semibold">User Name</label>
                                {/* <input id="name" type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} className="p-inputtext w-full" placeholder="Enter Role Name" /> */}
                                <InputText
                                    id="name"
                                    type="text"
                                    value={get(form, 'name')}
                                    onChange={(e) => onInputChange('name', e.target.value)}
                                    className="p-inputtext w-full mb-1"
                                    placeholder="Enter User Name"
                                    required
                                />
                                {formErrors.name && (
                                    <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{formErrors.name}</p> // Display error message
                                )}
                                {wordMaxLimitErrors.name && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{wordMaxLimitErrors.name}</p>}
                                {alphabetErrors.name && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{alphabetErrors.name}</p>}
                            </div>

                                <div className="field col-3">
                                <label htmlFor="positionId" className="font-semibold">
                                Position
                                </label>
                                    <Dropdown
                                        id="positionId"
                                        value={get(form, 'positionId')}
                                        options={allPosition}
                                        optionLabel="positionName"
                                        optionValue="positionId"
                                        onChange={(e) => onInputChange('positionId', e.value)}
                                        placeholder="Select position"
                                        className="w-full mb-1"
                                        showClear={!!get(form, 'positionId')}
                                    />
                                    {formErrors.positionId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.positionId}</p>}
                                </div>

                                <div className="field col-3">
                                <label htmlFor="assesorRoleId" className="font-semibold">
                                Assessor Role
                                </label>
                                    <Dropdown
                                        id="assesorRoleId"
                                        value={get(form, 'assesorRoleId')}
                                        options={allAssesorrole}
                                        optionLabel="assesorRoleName"
                                        optionValue="assesorRoleId"
                                        onChange={(e) => onInputChange('assesorRoleId', e.value)}
                                        placeholder="Select Assesor Role"
                                        className="w-full mb-1"
                                        showClear={!!get(form, 'assesorRoleId')}
                                    />
                                    {formErrors.assesorRoleId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.assesorRoleId}</p>}
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
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const contentBody = renderContentbody();

    const handleNavigation = () => {
        router.push('/user-groups');
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
