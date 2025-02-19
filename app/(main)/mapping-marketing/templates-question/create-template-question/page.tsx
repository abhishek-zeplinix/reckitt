/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import _, { get } from 'lodash';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { CustomResponse, Field } from '@/types';
import { GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { validateFormRuleData } from '@/utils/utils';
import { Calendar } from 'primereact/calendar';
import { z } from 'zod';
import { EmptyQuestion } from '@/types/forms';
const defaultForm: EmptyQuestion = {
    segment: '',
    questionTitle: '',
    questionDescription: '',
    minRating:  null,
    maxRating: null,
    compulsory: '',
    comment:null,
    na:false,
  };

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
    const [selectedSupplierCategory, setSelectedSupplierCategory] = useState<any>(null);
    const [procurementDepartment, setProcurementDepartment] = useState([]);
    const [compulsory, setCompulsory] = useState([
        { label: 'YES' },
        { label: 'NO' },
    ]);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
        const [alphabetErrors, setAlphabetErrors] = useState<{ [key: string]: string }>({});
    const [supplierCategories, setsupplierCategories] = useState([]);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    // const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [date, setDate] = useState<Date | null>(null);
    const [errors, setErrors] = useState<{ orderBy?: string; ratiosCopack?: string; ratiosRawpack?: string }>({});
    const [scoreerrors, setScoreErrors] = useState<{ [key: string]: string }>({});
    const router = useRouter();
    const [form, setForm] = useState<EmptyQuestion>(defaultForm);
    // Adjust title based on edit mode
    // const pageTitle = isEditMode ? 'Edit Rules' : 'Add Rules';
    const submitButtonLabel = isEditMode ? 'Save' : 'Save';
    // const [fields, setFields] = useState({
    //     effectiveFrom: null as Date | null,
    //     departmentId: null,
    //     orderBy: null as number | null,
    //     section: '',
    //     categoryId: null,
    //     subCategoryId: null,
    //     ratedCriteria: '',
    //     ratiosRawpack: '',
    //     ratiosCopack: '',
    //     criteriaEvaluation: [''], // Initialize with one empty value
    //     score: ['']
    // });

    // Update common fields on dependency change
    // useEffect(() => {
    //     updateCommonFields();
    // }, [date, selectedProcurementDepartment, orderBy, selectedsection, selectedProcurementCategory, selectedSupplierCategory, selectedCriteria, selectedratiosRawpack, selectedratiosCopack]);

    // const handleChange = (index: number, key: 'criteriaEvaluation' | 'score', value: string) => {
    //     // Validation for "score" field
    //     if (key === 'score') {
    //         if (!/^\d*$/.test(value)) {
    //             setScoreErrors((prevErrors) => ({
    //                 ...prevErrors,
    //                 [`${key}-${index}`]: 'Only numbers are allowed!'
    //             }));
    //             return; // Do not update the state if invalid input
    //         } else {
    //             // Remove error when valid input is entered
    //             setScoreErrors((prevErrors) => {
    //                 const updatedErrors = { ...prevErrors };
    //                 delete updatedErrors[`${key}-${index}`];
    //                 return updatedErrors;
    //             });
    //         }
    //     }

    //     // Clear the error for the field when a value is entered
    //     setFormErrors((prevErrors) => {
    //         const updatedErrors = { ...prevErrors };
    //         if (value && updatedErrors[key]) {
    //             delete updatedErrors[key];
    //         }
    //         return updatedErrors;
    //     });

    //     setFields((prev) => {
    //         const updatedArray = [...prev[key]];
    //         updatedArray[index] = value;
    //         return { ...prev, [key]: updatedArray };
    //     });
    // };

    // const updateCommonFields = () => {
    //     setFields((prev) => ({
    //         ...prev,
    //         effectiveFrom: date || null,
    //         departmentId: selectedProcurementDepartment || null,
    //         orderBy: parseInt(orderBy) || null,
    //         section: selectedsection || '',
    //         categoryId: selectedProcurementCategory || null,
    //         subCategoryId: selectedSupplierCategory || null,
    //         ratedCriteria: selectedCriteria || '',
    //         ratiosRawpack: selectedratiosRawpack || '',
    //         ratiosCopack: selectedratiosCopack || ''
    //     }));
    // };
    // Update common fields when they change
    // useEffect(() => {
    //     updateCommonFields();
    // }, [date, selectedProcurementDepartment, orderBy, selectedsection, selectedProcurementCategory, selectedSupplierCategory, selectedCriteria, selectedratiosRawpack, selectedratiosCopack]);

    // const handleAddFields = () => {
    //     // Access the latest state before updating
    //     if (fields.criteriaEvaluation.length === 0 || fields.score.length === 0 || fields.criteriaEvaluation[fields.criteriaEvaluation.length - 1].trim() === '' || fields.score[fields.score.length - 1].trim() === '') {
    //         setAlert('error', 'Please fill in the previous field before adding a new one.');
    //         return;
    //     }

    //     // Update the state safely
    //     setFields((prev) => ({
    //         ...prev,
    //         criteriaEvaluation: [...prev.criteriaEvaluation, ''],
    //         score: [...prev.score, '']
    //     }));
    // };

    // // Remove a field
    // const handleRemoveField = (index: number) => {
    //     setFields((prev) => ({
    //         ...prev,
    //         criteriaEvaluation: prev.criteriaEvaluation.filter((_, i) => i !== index),
    //         score: prev.score.filter((_, i) => i !== index)
    //     }));
    // };
    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        handleSubmit(form);
    };

    const handleSubmit = async (fields: Record<string, unknown>) => {
        const { valid, errors } = validateFormRuleData(fields);
        if (!valid) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        try {
            setLoading(true);
            if (isEditMode) {
                const endpoint = `/company/rules/${ruleId}/rule-set/${ruleSetId}`;
                try {
                    setLoading(true);
                    const response: CustomResponse = await PutCall(endpoint, fields); // Call PUT API
                    if (response.code === 'SUCCESS') {
                        router.push(`/rules/set-rules/?ruleSetId=${ruleSetId}`);
                        setAlert('success', 'Rules updated.');
                    } else {
                        setAlert('error', response.message);
                    }
                } catch (error) {
                    setAlert('error', 'Failed to update rules. Please try again.');
                } finally {
                    setLoading(false);
                }
            } else {
                try {
                    setLoading(true);
                    onNewAdd(fields); // Submit data for new addition
                } catch (error) {
                    setAlert('error', 'Failed to add rules. Please try again.');
                } finally {
                    setLoading(false);
                }
            }
        } catch (validationError) {
            if (validationError instanceof z.ZodError) {
                const errors = validationError.errors.map((err) => err.message).join(', ');
                setAlert('error', `Validation failed: ${errors}`);
            } else {
                setAlert('error', 'Unexpected error during validation.');
            }
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     fetchprocurementDepartment();
    //     // fetchprocurementCategories();
    //     fetchsupplierCategories();
    //     return () => {
    //         setScroll(true);
    //     };
    // }, []);

    useEffect(() => {
        if (isEditMode && ruleId) {
            fetchUserDetails(); // Fetch and pre-fill data in edit mode
        }
    }, []);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response: CustomResponse = await GetCall(`/company/rules?filters.ruleId=${ruleId}&sortBy=ruleId`);
            if (response.code === 'SUCCESS' && response.data.length > 0) {
            } else {
                setAlert('error', 'User details not found.');
            }
        } catch (error) {
            setAlert('error', 'Failed to fetch user details.');
        } finally {
            setLoading(false);
        }
    };
    const renderNewRuleFooter = () => {
        return (
            <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400 ">
                <Button label="Cancel" className="text-pink-500 bg-white border-pink-500 hover:text-white hover:bg-pink-400 transition-colors duration-150 mb-3" onClick={() => router.push(`/mapping-marketing/templates-question`)} />
                <Button label={submitButtonLabel} icon="pi pi-check" className="bg-pink-500 border-pink-500 hover:bg-pink-400 mb-3" onClick={handleButtonClick} />
            </div>
        );
    };

    const footerNewRules = renderNewRuleFooter();
    const onNewAdd = async (userForm: any) => {
        try {
            setLoading(true);
            const response: CustomResponse = await PostCall(`/company/rules/${ruleSetId}`, form);

            if (response.code == 'SUCCESS') {
                router.push(`/rules/set-rules/?ruleSetId=${ruleSetId}`);
                setAlert('success', 'Successfully Added');
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            setAlert('error', 'Failed to add new rule');
        } finally {
            setLoading(false);
        }
    };
    const handleCategoryChange = (value: any) => {
        setSelectedProcurementCategory(value);
        // fetchprocurementCategories(value);
        // Clear the error for the field when a value is entered
        setFormErrors((prevErrors) => {
            const updatedErrors = { ...prevErrors };
            if (value && updatedErrors['categoryId']) {
                delete updatedErrors['categoryId'];
            }
            return updatedErrors;
        });
    };
    const onInputChange = (name: string | { [key: string]: any }, val?: any) => {
        if (typeof name !== 'string') return;
        if (name !== 'vendorId' && name !== 'reviewTypeId' && name !== 'templateTypeId' && name !== 'userGroupId' && name !== 'buId' && name !== 'regionId' && name !== 'masterCountryId') {
            if (val) {
                const trimmedValue = val.trim();
                const wordCount = trimmedValue.length;
                if (name === 'brand') {
                    const isAlphabet = /^[a-zA-Z\s]+$/.test(val);
                    if (!isAlphabet) {
                        setAlphabetErrors((prevAlphaErrors) => ({
                            ...prevAlphaErrors,
                            [name]: 'Must contain only alphabets!'
                        }));
                        return;
                    } else if (wordCount > 50) {
                        setAlphabetErrors((prevWordErrors) => ({
                            ...prevWordErrors,
                            [name]: 'Maximum 50 characters allowed!'
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
    const renderContentbody = () => {
        return (
            <div className="grid">
                <div className="col-12">
                    <div className="flex flex-column gap-3 pt-2">
                        <h2 className="text-center font-bold ">Update Mapping Marketing Templates Question</h2>
                        <div className="p-fluid grid md:mx-7 pt-2">
                            {/* <div className="field col-3">
                                <label htmlFor="effectiveFrom">Select Effective Date:</label>
                                <Calendar
                                    id="effectiveFrom"
                                    value={date}
                                    onChange={(e) => handleInputChange('effectiveFrom', e.target.value ? e.target.value.toISOString() : '')}
                                    dateFormat="dd-mm-yy"
                                    placeholder="Select a date"
                                    showIcon
                                    style={{ borderRadius: '5px', borderColor: 'black' }}
                                />
                                {formErrors.effectiveFrom && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.effectiveFrom}</p>}
                            </div> */}
                            <div className="field col-3">
                                <label htmlFor="segment">Segment</label>
                                <input id="segment" type="text" value={get(form, 'segment')} onChange={(e) => onInputChange('segment', e.target.value)} className="p-inputtext w-full" placeholder="Enter segment" />
                                {formErrors.segment && <p style={{ color: 'red', fontSize: '10px', marginTop: '1px', marginBottom: '0px' }}>{formErrors.segment}</p>}
                                {/* {errors.orderBy && <span className="text-red-500 text-xs">{errors.orderBy}</span>} */}
                            </div>
                            <div className="field col-3">
                                <label htmlFor="questionTitle">Question title</label>
                                <input id="questionTitle" type="text" value={get(form, 'questionTitle')} onChange={(e) => onInputChange('questionTitle', e.target.value)} className="p-inputtext w-full" placeholder="Enter Question Title" />
                                {formErrors.questionTitle && <p style={{ color: 'red', fontSize: '10px', marginTop: '1px', marginBottom: '0px' }}>{formErrors.questionTitle}</p>}
                                {/* {errors.orderBy && <span className="text-red-500 text-xs">{errors.orderBy}</span>} */}
                            </div>
                            <div className="field col-3">
                                <label htmlFor="questionDescription">Question Description</label>
                                <input id="questionDescription" type="text" value={get(form, 'questionDescription')} onChange={(e) => onInputChange('questionDescription', e.target.value)} className="p-inputtext w-full" placeholder="Enter Question Description" />
                                {formErrors.questionDescription && <p style={{ color: 'red', fontSize: '10px', marginTop: '1px', marginBottom: '0px' }}>{formErrors.questionDescription}</p>}
                                {/* {errors.orderBy && <span className="text-red-500 text-xs">{errors.orderBy}</span>} */}
                            </div>
                            <div className="field col-3">
                                <label htmlFor="minRating">Min. Rating</label>
                                <input id="minRating" type="text" value={get(form, 'minRating') ?? ''} onChange={(e) => onInputChange('minRating', e.target.value)} className="p-inputtext w-full" placeholder="Enter Min. Rating" />
                                {formErrors.minRating && <p style={{ color: 'red', fontSize: '10px', marginTop: '1px', marginBottom: '0px' }}>{formErrors.minRating}</p>}
                                {/* {errors.orderBy && <span className="text-red-500 text-xs">{errors.orderBy}</span>} */}
                            </div>
                            <div className="field col-3">
                                <label htmlFor="maxRating">Max.Rating</label>
                                <input id="maxRating" type="text" value={get(form, 'maxRating') ?? ''} onChange={(e) => onInputChange('maxRating', e.target.value)} className="p-inputtext w-full" placeholder="Enter Max. Rating" />
                                {formErrors.maxRating && <p style={{ color: 'red', fontSize: '10px', marginTop: '1px', marginBottom: '0px' }}>{formErrors.maxRating}</p>}
                                {/* {errors.orderBy && <span className="text-red-500 text-xs">{errors.orderBy}</span>} */}
                            </div>
                            <div className="field col-3">
                                <label htmlFor="categoryId">Compulsory</label>
                                <Dropdown
                                    id="label"
                                    value={get(form, 'compulsory')}
                                    options={compulsory}
                                    onChange={(e) => onInputChange('compulsory',e.value)}
                                    placeholder="Select Procurement Category"
                                    optionLabel="label"
                                    optionValue="label"
                                    className="w-full"
                                    showClear={!!get(form, 'compulsory')}
                                />
                                {formErrors.categoryId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.categoryId}</p>}
                            </div>
                             <div className="field col-3">
                                <label htmlFor="comment">Comment if rating </label>
                                <input id="comment" type="text" value={selectedsection} onChange={(e) => onInputChange('comment', e.target.value)} className="p-inputtext w-full" placeholder="Enter Comment" />
                                {formErrors.comment && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.comment}</p>}
                            </div>
                            <div className="field col-3 mt-5">
                            <label htmlFor="na">N/A</label>
                            <input 
                                id="na"
                                type="checkbox"
                                checked={get(form, 'na') ?? false} 
                                onChange={(e) => onInputChange('na', e.target.value)} 
                                className="ml-2"
                            />
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
