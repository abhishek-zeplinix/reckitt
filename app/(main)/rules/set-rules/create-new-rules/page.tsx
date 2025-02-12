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

const CreateNewRulesPage = () => {
    const { user, isLoading, setLoading, setScroll, setAlert } = useAppContext();
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true'; // Check if in edit mode
    const ruleId = searchParams.get('ruleId');
    const ruleSetId = searchParams.get('ruleSetId');
    const [orderBy, setorderBy] = useState('');
    const [selectedProcurementCategory, setSelectedProcurementCategory] = useState<any>(null);
    const [selectedsection, setSelectedsection] = useState('');
    const [selectedCriteria, setCriteria] = useState('');
    const [selectedcriteriaEvaluation, setcriteriaEvaluation] = useState('');
    const [selectedScore, setScore] = useState('');
    const [selectedratiosRawpack, setratiosRawpack] = useState('');
    const [selectedratiosCopack, setratiosCopack] = useState('');
    const [selectedProcurementDepartment, setSelectedProcurementDepartment] = useState<any>(null);
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
    const pageTitle = isEditMode ? 'Edit Rules' : 'Add Rules';
    const submitButtonLabel = isEditMode ? 'Save' : 'Add Rules';
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
    
        // Clear the error for the field when a value is entered
        setFormErrors((prevErrors) => {
            const updatedErrors = { ...prevErrors };
            if (value && updatedErrors[key]) {
                delete updatedErrors[key];
            }
            return updatedErrors;
        });
    
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
        console.log('136',fields)
        const { valid, errors } = validateFormRuleData(fields);
        if (!valid) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        try {
            if (isEditMode) {
                const endpoint = `/company/rules/${ruleId}/rule-set/${ruleSetId}`;
                try {
                    const response: CustomResponse = await PutCall(endpoint, fields); // Call PUT API
                    if (response.code === 'SUCCESS') {
                        router.push(`/rules/set-rules/?ruleSetId=${ruleSetId}`);
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
                const userDetails = response.data[0]; 
                setorderBy(userDetails.orderBy || '');
                setSelectedProcurementDepartment(userDetails.departmentId || null);
                setSelectedProcurementCategory(userDetails.categoryId || '');
                fetchprocurementCategories(userDetails.categoryId);
                setSelectedSupplierCategory(userDetails.subCategoryId || '');
                setSelectedsection(userDetails.section || '');
                setCriteria(userDetails.ratedCriteria || '');
                setFields((prev) => ({
                    ...prev,
                    criteriaEvaluation: userDetails.criteriaEvaluation || [''],
                    score: userDetails.score || ['']
                }));                
                setratiosRawpack(userDetails.ratiosRawpack || null);
                setratiosCopack(userDetails.ratiosCopack || null);
                const parsedDate = userDetails.effectiveFrom ? new Date(userDetails.effectiveFrom) : null;
                setDate(parsedDate);
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
                <Button label="Cancel" className="text-pink-500 bg-white border-pink-500 hover:text-white hover:bg-pink-400 transition-colors duration-150 mb-3" onClick={() => router.push(`/rules/set-rules/?ruleSetId=${ruleSetId}`)} />
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
        const response: CustomResponse = await PostCall(`/company/rules/${ruleSetId}`, fields);
        setIsDetailLoading(false);
        if (response.code == 'SUCCESS') {
            router.push(`/rules/set-rules/?ruleSetId=${ruleSetId}`);
            setAlert('success', 'Successfully Added');
        } else {
            setAlert('error', response.message);
        }
    };
    const handleCategoryChange = (value: any) => {
        setSelectedSupplierCategory(value);
        fetchprocurementCategories(value);
         // Clear the error for the field when a value is entered
         setFormErrors((prevErrors) => {
            const updatedErrors = { ...prevErrors };
            if (value && updatedErrors['categoryId']) {
                delete updatedErrors['categoryId'];
            }
            return updatedErrors;
        });
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
                    [name]: 'Only numbers are allowed!'
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
                    [name]: 'Only numbers are allowed!'
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
    
        // Clear the error for the field when a value is entered
        setFormErrors((prevErrors) => {
            const updatedErrors = { ...prevErrors };
            if (value && updatedErrors[name]) {
                delete updatedErrors[name];
            }
            return updatedErrors;
        });
        setFields((prevForm) => {
            const updatedForm = {
                ...prevForm,
                ...(typeof name === 'string' ? { [name]: value } : name),
            };
    
            if (name === 'departmentId') {
                setSelectedProcurementDepartment(Number(value));
                updatedForm.departmentId = null;
            }
    
            return updatedForm;
        });
        setFields((prevForm) => {
            const updatedForm = {
                ...prevForm,
                ...(typeof name === 'string' ? { [name]: value } : name),
            };
    
            if (name === 'subCategoryId') {
                setSelectedProcurementCategory(Number(value));
                updatedForm.subCategoryId = null;
            }
    
            return updatedForm;
        });
        setFields((prevForm) => {
            const updatedForm = {
                ...prevForm,
                ...(typeof name === 'string' ? { [name]: value } : name),
            };
    
            if (name === 'section') {
                setSelectedsection(value);
                updatedForm.section = '';
            }
    
            return updatedForm;
        });
        setFields((prevForm) => {
            const updatedForm = {
                ...prevForm,
                ...(typeof name === 'string' ? { [name]: value } : name),
            };
    
            if (name === 'ratedCriteria') {
                setCriteria(value);
                updatedForm.ratedCriteria = '';
            }
    
            return updatedForm;
        });
        setFields((prevForm) => {
            const updatedForm = {
                ...prevForm,
                ...(typeof name === 'string' ? { [name]: value } : name),
            };
    
            if (name === 'effectiveFrom') {
                setDate(value ? new Date(value) : null); 
                updatedForm.effectiveFrom = null;
            }            
    
            return updatedForm;
        });
    };
    const renderContentbody = () => {
        return (
            <div className="grid">
                <div className="col-12">
                    <div className="flex flex-column gap-3 pt-2">
                        <h2 className="text-center font-bold ">{pageTitle}</h2>
                        <div className="p-fluid grid md:mx-7 pt-2">
                            <div className="field col-4">
                                <label htmlFor="effectiveFrom">Select Effective Date:</label>
                                <Calendar id="effectiveFrom" value={date} onChange={(e) =>handleInputChange('effectiveFrom', e.target.value ? e.target.value.toISOString() : '')}
 dateFormat="dd-mm-yy" placeholder="Select a date" showIcon style={{ borderRadius: '5px', borderColor: 'black' }} />
                                {formErrors.effectiveFrom && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.effectiveFrom}</p>}
                            </div>
                            <div className="field col-4">
                                <label htmlFor="orderBy">Order By</label>
                                <input id="orderBy" type="text" value={orderBy} onChange={(e) => handleInputChange('orderBy', e.target.value)} className="p-inputtext w-full" placeholder="Enter order by" />
                                {formErrors.orderBy && <p style={{ color: 'red', fontSize: '10px', marginTop: '1px', marginBottom: '0px' }}>{formErrors.orderBy}</p>}
                                {errors.orderBy && <span className="text-red-500 text-xs">{errors.orderBy}</span>}
                            </div>
                            <div className="field col-4">
                                <label htmlFor="departmentId">Department</label>
                                <Dropdown
                                    id="departmentId"
                                    value={selectedProcurementDepartment}
                                    options={procurementDepartment}
                                    // onChange={(e) => setSelectedProcurementDepartment(e.value)}
                                    onChange={(e) => handleInputChange('departmentId', e.target.value)}
                                    placeholder="Select Department"
                                    optionLabel="name"
                                    optionValue="departmentId"
                                    className="w-full"
                                />
                                {formErrors.departmentId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.departmentId}</p>}
                            </div>
                            <div className="field col-4">
                                <label htmlFor="categoryId">Procurement Category</label>
                                <Dropdown
                                    id="categoryId"
                                    value={selectedSupplierCategory}
                                    options={supplierCategories}
                                    onChange={(e) => handleCategoryChange(e.value)}
                                    placeholder="Select Procurement Category"
                                    optionLabel="categoryName"
                                    optionValue="categoryId"
                                    className="w-full"
                                />
                                {formErrors.categoryId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.categoryId}</p>}
                            </div>
                            <div className="field col-4">
                                <label htmlFor="subCategoryId">Supplier Category</label>
                                <Dropdown
                                    id="subCategoryId"
                                    value={selectedProcurementCategory}
                                    options={procurementCategories}
                                    // onChange={(e) => setSelectedProcurementCategory(e.value)}
                                    onChange={(e) => handleInputChange('subCategoryId', e.target.value)}
                                    optionLabel="subCategoryName"
                                    optionValue="subCategoryId"
                                    placeholder="Select Supplier Category"
                                    className="w-full"
                                />
                                {formErrors.subCategoryId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.subCategoryId}</p>}
                            </div>
                            <div className="field col-4">
                                <label htmlFor="section">Section</label>
                                <input id="section" type="text" value={selectedsection} onChange={(e) => handleInputChange('section', e.target.value)} className="p-inputtext w-full" placeholder="Enter Section Name" />
                                {formErrors.section && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.section}</p>}
                            </div>

                            <div className="field col-4">
                                <label htmlFor="ratedCriteria">Criteria</label>
                                <input type="text" placeholder="Criteria" value={selectedCriteria} onChange={(e) => handleInputChange('ratedCriteria', e.target.value)} className="p-inputtext w-full" />
                                {formErrors.ratedCriteria && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.ratedCriteria}</p>}
                            </div>

                            <div className="field col-4">
                                <label htmlFor="ratiosRawpack">Ratios Raw & Pack</label>
                                <input type="text" placeholder="Ratios Raw & Pack" value={selectedratiosRawpack} onChange={(e) => handleInputChange('ratiosRawpack', e.target.value)} className="p-inputtext w-full" />
                                {formErrors.ratiosRawpack && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{formErrors.ratiosRawpack}</p>}
                                {errors.ratiosRawpack && <span className="text-red-500 text-xs">{errors.ratiosRawpack}</span>}
                            </div>
                            <div className="field col-4">
                                <label htmlFor="ratiosCopack">Ratio Co Pack</label>
                                <input type="text" placeholder="Ratio Co Pack" value={selectedratiosCopack} onChange={(e) => handleInputChange('ratiosCopack', e.target.value)} className="p-inputtext w-full" />
                                {formErrors.ratiosCopack && <p style={{ color: 'red', fontSize: '10px', marginBottom: '0px' }}>{formErrors.ratiosCopack}</p>}
                                {errors.ratiosCopack && <span className="text-red-500 text-xs">{errors.ratiosCopack}</span>}
                            </div>
                            {fields.criteriaEvaluation.map((_, index) => (
                                <React.Fragment key={index}>
                                    <div className="field col-4">
                                        <label htmlFor={`criteriaEvaluation-${index}`}>Criteria Evaluation</label>
                                        <input
                                            id={`criteriaEvaluation-${index}`}
                                            type="text"
                                            placeholder="Criteria Evaluation"
                                            value={fields.criteriaEvaluation[index]}
                                            onChange={(e) => handleChange(index, 'criteriaEvaluation', e.target.value)}
                                            className="p-inputtext w-full"
                                        />
                                        {formErrors.criteriaEvaluation && <p style={{ color: 'red', fontSize: '10px' ,marginBottom: '0px'}}>{formErrors.criteriaEvaluation}</p>}
                                    </div>
                                    <div className="field col-4">
                                        <label htmlFor={`score-${index}`}>Score</label>
                                        <input id={`score-${index}`} type="text" placeholder="Score" value={fields.score[index]} onChange={(e) => handleChange(index, 'score', e.target.value)} className="p-inputtext w-full" />
                                        {formErrors.score && <p style={{ color: 'red', fontSize: '10px',marginBottom: '0px' }}>{formErrors.score}</p>}
                                        {scoreerrors[`score-${index}`] && <p className="text-red-500 text-xs">{scoreerrors[`score-${index}`]}</p>}
                                    </div>
                                    {fields.score.length > 1 && (
                                        <div className="field col-4">
                                            <Button className="p-button-rounded p-button-danger mt-4" icon="pi pi-trash" onClick={() => handleRemoveField(index)} />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                            <div className="field col-4 mt-4">
                                <Button icon="pi pi-plus" onClick={handleAddFields} className="p-button-sm p-button-secondary mb-4 col-2 ml-2" />
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

export default CreateNewRulesPage;
