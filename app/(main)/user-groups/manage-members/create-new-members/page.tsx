/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import _ from 'lodash';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { CustomResponse, Field } from '@/types';
import { GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { validateFormRuleData } from '@/utils/utils';
import { Calendar } from 'primereact/calendar';
import { z } from 'zod';

const CreateNewMembersPage = () => {
    const { user, isLoading, setLoading, setScroll, setAlert } = useAppContext();
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true'; // Check if in edit mode
    const ruleId = searchParams.get('ruleId');
    const memberId = searchParams.get('memberId');
    const [orderBy, setorderBy] = useState('');
    const [selectedProcurementCategory, setSelectedProcurementCategory] = useState(null);
    const [selectedsection, setSelectedsection] = useState('');
    const [selectedCriteria, setCriteria] = useState('');
    const [selectedcriteriaEvaluation, setcriteriaEvaluation] = useState('');
    const [selectedScore, setScore] = useState('');
    const [selectedratiosRawpack, setratiosRawpack] = useState('');
    const [selectedratiosCopack, setratiosCopack] = useState('');
    const [selectedProcurementDepartment, setSelectedProcurementDepartment] = useState(null);
    const [selectedSupplierCategory, setSelectedSupplierCategory] = useState(null);
    const [procurementDepartment, setProcurementDepartment] = useState([]);
    const [procurementCategories, setprocurementCategories] = useState([]);
    const [supplierCategories, setsupplierCategories] = useState([]);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [date, setDate] = useState<Date | null>(null);
    const [errors, setErrors] = useState<{ orderBy?: string; ratiosCopack?: string; ratiosRawpack?: string }>({});
    const [scoreerrors, setScoreErrors] = useState<{ [key: string]: string }>({});
    const router = useRouter();
    // Adjust title based on edit mode
    const pageTitle = isEditMode ? 'Edit Members' : 'Add Members';
    const submitButtonLabel = isEditMode ? 'Save' : 'Add Members';
    const [fields, setFields] = useState({
        effectiveFrom: null as Date | null,
        departmentId: null,
        orderBy: null as number | null,
        section: '',
        categoryId: null,
        subCategoryId: null,
        ratedCriteria: '',
        ratiosRawpack: '',
        ratiosCopack: '',
        criteriaEvaluation: [''], // Initialize with one empty value
        score: ['']
    });

    // Update common fields on dependency change
    useEffect(() => {
        updateCommonFields();
    }, [date, selectedProcurementDepartment, orderBy, selectedsection, selectedProcurementCategory, selectedSupplierCategory, selectedCriteria, selectedratiosRawpack, selectedratiosCopack]);

    const handleChange = (index: number, key: 'criteriaEvaluation' | 'score', value: string) => {
        // Validation for "score" field
        if (key === 'score') {
            if (!/^\d*$/.test(value)) {
                setScoreErrors((prevErrors) => ({
                    ...prevErrors,
                    [`${key}-${index}`]: 'Only numbers are allowed!'
                }));
                return; // Do not update the state if invalid input
            } else {
                // Remove error when valid input is entered
                setScoreErrors((prevErrors) => {
                    const updatedErrors = { ...prevErrors };
                    delete updatedErrors[`${key}-${index}`];
                    return updatedErrors;
                });
            }
        }
        setFields((prev) => {
            const updatedArray = [...prev[key]];
            updatedArray[index] = value;
            return { ...prev, [key]: updatedArray };
        });
    };

    const updateCommonFields = () => {
        setFields((prev) => ({
            ...prev,
            effectiveFrom: date || null,
            departmentId: selectedProcurementDepartment || null,
            orderBy: parseInt(orderBy) || null,
            section: selectedsection || '',
            categoryId: selectedProcurementCategory || null,
            subCategoryId: selectedSupplierCategory || null,
            ratedCriteria: selectedCriteria || '',
            ratiosRawpack: selectedratiosRawpack || '',
            ratiosCopack: selectedratiosCopack || ''
        }));
    };
    console.log('117', fields);
    // Update common fields when they change
    useEffect(() => {
        updateCommonFields();
    }, [date, selectedProcurementDepartment, orderBy, selectedsection, selectedProcurementCategory, selectedSupplierCategory, selectedCriteria, selectedratiosRawpack, selectedratiosCopack]);

    const handleAddFields = () => {
        // Access the latest state before updating
        if (fields.criteriaEvaluation.length === 0 || fields.score.length === 0 || fields.criteriaEvaluation[fields.criteriaEvaluation.length - 1].trim() === '' || fields.score[fields.score.length - 1].trim() === '') {
            setAlert('Error', 'Please fill in the previous field before adding a new one.');
            return;
        }

        // Update the state safely
        setFields((prev) => ({
            ...prev,
            criteriaEvaluation: [...prev.criteriaEvaluation, ''],
            score: [...prev.score, '']
        }));
    };

    // Remove a field
    const handleRemoveField = (index: number) => {
        setFields((prev) => ({
            ...prev,
            criteriaEvaluation: prev.criteriaEvaluation.filter((_, i) => i !== index),
            score: prev.score.filter((_, i) => i !== index)
        }));
    };
    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        handleSubmit(fields);
    };

    const handleSubmit = async (fields: Record<string, unknown>) => {
        const { valid, errors } = validateFormRuleData(fields);
        if (!valid) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        try {
            if (isEditMode) {
                const endpoint = `/company/rules/${ruleId}`;
                try {
                    const response: CustomResponse = await PutCall(endpoint, fields); // Call PUT API
                    if (response.code === 'SUCCESS') {
                        router.push(`/rules/set-rules/?memberId=${memberId}`);
                        setAlert('success', 'Rules updated.');
                    } else {
                        setAlert('error', response.message);
                    }
                } catch (error) {
                    setAlert('error', 'Failed to update rules. Please try again.');
                }
            } else {
                try {
                    onNewAdd(fields); // Submit data for new addition
                } catch (error) {
                    setAlert('error', 'Failed to add rules. Please try again.');
                }
            }
        } catch (validationError) {
            if (validationError instanceof z.ZodError) {
                const errors = validationError.errors.map((err) => err.message).join(', ');
                setAlert('error', `Validation failed: ${errors}`);
            } else {
                setAlert('error', 'Unexpected error during validation.');
            }
        }
    };

    useEffect(() => {
        fetchprocurementDepartment();
        // fetchprocurementCategories();
        fetchsupplierCategories();
        return () => {
            setScroll(true);
        };
    }, []);

    useEffect(() => {
        if (isEditMode && ruleId) {
            fetchUserDetails(); // Fetch and pre-fill data in edit mode
        }
    }, []);

    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            const response: CustomResponse = await GetCall(`/company/rules?filters.ruleId=${ruleId}&sortBy=ruleId`);
            if (response.code === 'SUCCESS' && response.data.length > 0) {
                const userDetails = response.data[0]; // Assuming the API returns an array of users
                setorderBy(userDetails.orderBy || '');
                setSelectedProcurementDepartment(userDetails.departmentId || null);
                setSelectedProcurementCategory(userDetails.categoryId || '');
                fetchprocurementCategories(userDetails.categoryId);
                setSelectedSupplierCategory(userDetails.subCategoryId || '');
                setSelectedsection(userDetails.section || '');
                setCriteria(userDetails.ratedCriteria || '');
                setcriteriaEvaluation(userDetails.criteriaEvaluation || null);
                setScore(userDetails.score || null);
                setratiosRawpack(userDetails.ratiosRawpack || null);
                setratiosCopack(userDetails.ratiosCopack || null);
            } else {
                setAlert('error', 'User details not found.');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            setAlert('error', 'Failed to fetch user details.');
        } finally {
            setLoading(false);
        }
    };
    const renderNewRuleFooter = () => {
        return (
            <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400 ">
                <Button label="Cancel" className="text-pink-500 bg-white border-pink-500 hover:text-white hover:bg-pink-400 transition-colors duration-150 mb-3" onClick={() => router.push(`/user-groups/manage-members/?memberId=${memberId}`)} />
                <Button label={submitButtonLabel} icon="pi pi-check" className="bg-pink-500 border-pink-500 hover:bg-pink-400 mb-3" onClick={handleButtonClick} />
            </div>
        );
    };

    const footerNewRules = renderNewRuleFooter();

    const fetchprocurementDepartment = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/department`); // get all the roles
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setProcurementDepartment(response.data);
        } else {
            setProcurementDepartment([]);
        }
    };
    const fetchprocurementCategories = async (categoryId: any) => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/sub-category/${categoryId}`); // get all t-he roles
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setprocurementCategories(response.data);
        } else {
            setprocurementCategories([]);
        }
    };
    const fetchsupplierCategories = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/category`); // get all the roles
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setsupplierCategories(response.data);
        } else {
            setsupplierCategories([]);
        }
    };

    const onNewAdd = async (userForm: any) => {
        setIsDetailLoading(true);
        const response: CustomResponse = await PostCall(`/company/rules/${memberId}`, fields);
        setIsDetailLoading(false);
        if (response.code == 'SUCCESS') {
            router.push(`/rules/set-rules/?memberId=${memberId}`);
            setAlert('success', 'Successfully Added');
        } else {
            setAlert('error', response.message);
        }
    };
    const handleCategoryChange = (value: any) => {
        setSelectedSupplierCategory(value);
        fetchprocurementCategories(value);
    };
    const handleInputChange = (name: string, value: string) => {
        if (name === 'orderBy') {
            if (!/^\d*$/.test(value)) {
                setErrors((prevAlphaErrors) => ({
                    ...prevAlphaErrors,
                    [name]: 'Only numbers are allowed!'
                }));
                return;
            } else if (value.length > 2) {
                setErrors((prevAlphaErrors) => ({
                    ...prevAlphaErrors,
                    [name]: 'Only 2 digits are allowed!'
                }));
                return;
            } else {
                setErrors((prevAlphaErrors) => {
                    const updatedErrors = { ...prevAlphaErrors };
                    delete updatedErrors[name];
                    return updatedErrors;
                });
            }
            setorderBy(value);
        } else if (name === 'ratiosRawpack') {
            if (!/^\d*$/.test(value)) {
                setErrors((prevAlphaErrors) => ({
                    ...prevAlphaErrors,
                    [name]: 'Only letters are allowed!'
                }));
                return;
            } else {
                setErrors((prevAlphaErrors) => {
                    const updatedErrors = { ...prevAlphaErrors };
                    delete updatedErrors[name];
                    return updatedErrors;
                });
            }
            setratiosRawpack(value);
        } else if (name === 'ratiosCopack') {
            if (!/^\d*$/.test(value)) {
                setErrors((prevAlphaErrors) => ({
                    ...prevAlphaErrors,
                    [name]: 'Only letters are allowed!'
                }));
                return;
            } else {
                setErrors((prevAlphaErrors) => {
                    const updatedErrors = { ...prevAlphaErrors };
                    delete updatedErrors[name];
                    return updatedErrors;
                });
            }
            setratiosCopack(value);
        }
        // validateFields(name, value);
    };

    const renderContentbody = () => {
        return (
            <div className="grid">
                <div className="col-12">
                    <div className="flex flex-column gap-3 pt-2">
                        <h2 className="text-center font-bold ">{pageTitle}</h2>
                        <div className="p-fluid grid md:mx-7 pt-2">
                            <div className="field col-4">
                                <label htmlFor="departmentId">Assesor Type</label>
                                <Dropdown
                                    id="departmentId"
                                    value={selectedProcurementDepartment}
                                    options={procurementDepartment}
                                    onChange={(e) => setSelectedProcurementDepartment(e.value)}
                                    placeholder="Select Assesor Type"
                                    optionLabel="name"
                                    optionValue="departmentId"
                                    className="w-full"
                                />
                                {formErrors.departmentId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.departmentId}</p>}
                            </div>
                            <div className="field col-4">
                                <label htmlFor="orderBy">Name</label>
                                <input id="orderBy" type="text" value={orderBy} onChange={(e) => handleInputChange('orderBy', e.target.value)} className="p-inputtext w-full" placeholder="Enter Name" />
                                {formErrors.orderBy && <p style={{ color: 'red', fontSize: '10px', marginTop: '1px', marginBottom: '0px' }}>{formErrors.orderBy}</p>}
                                {errors.orderBy && <span className="text-red-500 text-xs">{errors.orderBy}</span>}
                            </div>
                            <div className="field col-4">
                                <label htmlFor="categoryId">Position</label>
                                <Dropdown
                                    id="categoryId"
                                    value={selectedSupplierCategory}
                                    options={supplierCategories}
                                    onChange={(e) => handleCategoryChange(e.value)}
                                    placeholder="Select Position"
                                    optionLabel="categoryName"
                                    optionValue="categoryId"
                                    className="w-full"
                                />
                                {formErrors.categoryId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.categoryId}</p>}
                            </div>
                            <div className="field col-4">
                                <label htmlFor="categoryId">Assessor Role</label>
                                <Dropdown
                                    id="categoryId"
                                    value={selectedSupplierCategory}
                                    options={supplierCategories}
                                    onChange={(e) => handleCategoryChange(e.value)}
                                    placeholder="Select Assessor Role"
                                    optionLabel="categoryName"
                                    optionValue="categoryId"
                                    className="w-full"
                                />
                                {formErrors.categoryId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.categoryId}</p>}
                            </div>

                            <div className="field col-4">
                                <label htmlFor="section">Email</label>
                                <input id="section" type="text" value={selectedsection} onChange={(e) => setSelectedsection(e.target.value)} className="p-inputtext w-full" placeholder="Enter Email" />
                                {formErrors.section && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.section}</p>}
                            </div>

                            <div className="field col-4">
                                <label htmlFor="ratedCriteria">Phone Number</label>
                                <input type="text" placeholder="Enter Phone Number" value={selectedCriteria} onChange={(e) => setCriteria(e.target.value)} className="p-inputtext w-full" />
                                {formErrors.ratedCriteria && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.ratedCriteria}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    const contentBody = renderContentbody();
    return (
        <div className="">
            <div className="p-card">
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

export default CreateNewMembersPage;
