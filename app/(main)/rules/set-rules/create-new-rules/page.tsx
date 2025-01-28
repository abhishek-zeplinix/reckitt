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
import { validateField } from '@/utils/utils';
import { Calendar } from 'primereact/calendar';

const CreateNewRulesPage = () => {
    const { user, isLoading, setLoading, setScroll, setAlert } = useAppContext();
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true'; // Check if in edit mode
    const ruleId = searchParams.get('ruleId');
    const ruleSetId = searchParams.get('ruleSetId');
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
    const [date, setDate] = useState<Date | null>(null);
    const router = useRouter();
    // Adjust title based on edit mode
    const pageTitle = isEditMode ? 'Edit Rules' : 'Add Rules';
    const submitButtonLabel = isEditMode ? 'Save' : 'Add Rules';
    const [fields, setFields] = useState<Field[]>([
        {
            effectiveFrom:null,
            departmentId: null,
            orderBy: null ,
            section:  '',
            categoryId:  null,
            subCategoryId:  null,
            ratedCriteria: '',
            criteriaEvaluation: '',
            score: '',
            ratiosRawpack: '',
            ratiosCopack: '',
        },
      ]);
      
      type FieldKey = 'ratedCriteria' | 'criteriaEvaluation' | 'score' | 'ratiosRawpack' | 'ratiosCopack';

const handleChange = (index: number, field: FieldKey, value: string) => {
  const updatedFields = [...fields];
  updatedFields[index][field] = value;
  setFields(updatedFields);
};
// Helper function to ensure all objects in the fields array have common fields updated
const updateCommonFields = () => {
    const commonFields = {
      effectiveFrom: date || null,
      departmentId: selectedProcurementDepartment || null,
      orderBy: parseInt(orderBy) || null,
      section: selectedsection || '',
      categoryId: selectedProcurementCategory || null,
      subCategoryId: selectedSupplierCategory || null,
      ratedCriteria:selectedCriteria || '',
      ratiosRawpack:selectedratiosRawpack || '',
      ratiosCopack:selectedratiosCopack || ''
    };
  
    const updatedFields = fields.map((field) => ({
      ...field,
      ...commonFields,
    }));
  
    setFields(updatedFields);
  };

  // Update common fields when they change
useEffect(() => {
    updateCommonFields();
  }, [date, selectedProcurementDepartment, orderBy, selectedsection, selectedProcurementCategory, selectedSupplierCategory,selectedCriteria,selectedratiosRawpack,selectedratiosCopack]);
  

  // Add new set of fields at the end
const handleAddFields = () => {
  const commonFields = {
    effectiveFrom: date || null,
    departmentId: selectedProcurementDepartment || null,
    orderBy: parseInt(orderBy) || null,
    section: selectedsection || '',
    categoryId: selectedProcurementCategory || null,
    subCategoryId: selectedSupplierCategory || null,
    ratedCriteria:selectedCriteria || '',
    ratiosRawpack:selectedratiosRawpack || '',
    ratiosCopack:selectedratiosCopack || ''
  };

  const newFieldSet: Field = {
    ...commonFields,
    criteriaEvaluation: '',
    score: '',
  };

  setFields([...fields, newFieldSet]);
};
const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
};
console.log('118',fields)
  
const handleSubmit = async () => {
    // Validate all fields
    for (const field of fields) {
        const {
            effectiveFrom,
            departmentId,
            orderBy,
            section,
            categoryId,
            subCategoryId,
            ratedCriteria,
            criteriaEvaluation,
            score,
            ratiosRawpack,
            ratiosCopack,
        } = field;

        if (!validateField(effectiveFrom)) {
            setAlert('error', 'effective From cannot be empty');
            return;
        }
        if (!validateField(orderBy)) {
            setAlert('error', 'OrderBy cannot be empty');
            return;
        }
        if (!validateField(departmentId)) {
            setAlert('error', 'Department cannot be empty');
            return;
        }
        if (!validateField(categoryId)) {
            setAlert('error', 'Supplier Category cannot be empty');
            return;
        }
        if (!validateField(subCategoryId)) {
            setAlert('error', 'Procurement Category cannot be empty');
            return;
        }
        if (!validateField(section)) {
            setAlert('error', 'Section cannot be empty');
            return;
        }
        if (!validateField(ratedCriteria)) {
            setAlert('error', 'Criteria cannot be empty');
            return;
        }
        if (!validateField(criteriaEvaluation)) {
            setAlert('error', 'Criteria evaluation cannot be empty');
            return;
        }
        if (!validateField(score)) {
            setAlert('error', 'Score cannot be empty');
            return;
        }
        if (!validateField(ratiosCopack)) {
            setAlert('error', 'Ratios copack cannot be empty');
            return;
        }
        if (!validateField(ratiosRawpack)) {
            setAlert('error', 'Ratios rawpack cannot be empty');
            return;
        }
    }


    if (isEditMode) {
        const endpoint = `/company/rules/${ruleId}`;
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
            setAlert('success', 'Rules added successfully.');
        } catch (error) {
            setAlert('error', 'Failed to add rules. Please try again.');
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
    console.log('243',ruleSetId)
    const renderNewRuleFooter = () => {
        return (
            <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400 ">
                <Button label="Cancel" className="text-pink-500 bg-white border-pink-500 hover:text-white hover:bg-pink-400 transition-colors duration-150 mb-3" onClick={() => router.push(`/rules/set-rules/?ruleSetId=${ruleSetId}`)} />
                <Button label={submitButtonLabel} icon="pi pi-check" className="bg-pink-500 border-pink-500 hover:bg-pink-400 mb-3" onClick={handleSubmit} />
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
    const fetchprocurementCategories = async (categoryId:any) => {
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
        for (const field of fields) {
            const {
                effectiveFrom,
                departmentId,
                orderBy,
                section,
                categoryId,
                subCategoryId,
                ratedCriteria,
                criteriaEvaluation,
                score,
                ratiosRawpack,
                ratiosCopack,
            } = field;
    
            if (!validateField(effectiveFrom)) {
                setAlert('error', 'effective From cannot be empty');
                return;
            }
            if (!validateField(orderBy)) {
                setAlert('error', 'OrderBy cannot be empty');
                return;
            }
            if (!validateField(departmentId)) {
                setAlert('error', 'Department cannot be empty');
                return;
            }
            if (!validateField(categoryId)) {
                setAlert('error', 'Supplier Category cannot be empty');
                return;
            }
            if (!validateField(subCategoryId)) {
                setAlert('error', 'Procurement Category cannot be empty');
                return;
            }
            if (!validateField(section)) {
                setAlert('error', 'Section cannot be empty');
                return;
            }
            if (!validateField(ratedCriteria)) {
                setAlert('error', 'Criteria cannot be empty');
                return;
            }
            if (!validateField(criteriaEvaluation)) {
                setAlert('error', 'Criteria evaluation cannot be empty');
                return;
            }
            if (!validateField(score)) {
                setAlert('error', 'Score cannot be empty');
                return;
            }
            if (!validateField(ratiosCopack)) {
                setAlert('error', 'Ratios copack cannot be empty');
                return;
            }
            if (!validateField(ratiosRawpack)) {
                setAlert('error', 'Ratios rawpack cannot be empty');
                return;
            }
        }
    
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
        setSelectedSupplierCategory(value); // Update the selected value
        fetchprocurementCategories(value); // Call the API with the selected value
    };

    const renderContentbody = () => {
        return (
            <div className="grid">
                <div className="col-12">
                    <div className="flex flex-column gap-3 pt-2">
                        <h2 className="text-center font-bold ">{pageTitle}</h2>
                        <div className="p-fluid grid md:mx-7 pt-2">
                            <div className="field col-4">
                                <label htmlFor="effectiveFrom">
                                    Select Effective Date:
                                </label>
                                <Calendar id="effectiveFrom" value={date} onChange={(e) => setDate(e.value as Date)} dateFormat="dd-mm-yy" placeholder="Select a date" showIcon style={{ borderRadius: '5px', borderColor: 'black' }} />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="orderBy">Order By</label>
                                <input id="orderBy" type="text" value={orderBy} onChange={(e) => setorderBy(e.target.value)} className="p-inputtext w-full" placeholder="Enter order by" />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="departmentId">Department</label>
                                <Dropdown
                                    id="departmentId"
                                    value={selectedProcurementDepartment}
                                    options={procurementDepartment}
                                    onChange={(e) => setSelectedProcurementDepartment(e.value)}
                                    placeholder="Select Department"
                                    optionLabel="name"
                                    optionValue="departmentId"
                                    className="w-full"
                                />
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
                            </div>
                            <div className="field col-4">
                                <label htmlFor="subCategoryId">Supplier Category</label>
                                <Dropdown
                                    id="subCategoryId"
                                    value={selectedProcurementCategory}
                                    options={procurementCategories}
                                    onChange={(e) => setSelectedProcurementCategory(e.value)}
                                    optionLabel="subCategoryName"
                                    optionValue="subCategoryId"
                                    placeholder="Select Supplier Category"
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="section">Section</label>
                                <input id="section" type="text" value={selectedsection} onChange={(e) => setSelectedsection(e.target.value)} className="p-inputtext w-full" placeholder="Enter Section Name" />
                            </div>
                            
                                
                                <div className="field col-4">
                                <label htmlFor="ratedCriteria">Criteria</label>
                                <input
                                    type="text"
                                    placeholder="Criteria"
                                    value={selectedCriteria}
                                    onChange={(e) => setCriteria( e.target.value)}
                                    className="p-inputtext w-full"
                                />
                                </div>
                               
                                <div className="field col-4">
                                <label htmlFor="ratiosRawpack">Ratios Raw & Pack</label>
                                <input
                                    type="text"
                                    placeholder="Ratios Raw & Pack"
                                    value={selectedratiosRawpack}
                                    onChange={(e) => setratiosRawpack( e.target.value)}
                                    className="p-inputtext w-full"
                                />
                                </div>
                                <div className="field col-4">
                                <label htmlFor="ratiosCopack">Ratio Co Pack</label>
                                <input
                                    type="text"
                                    placeholder="Ratio Co Pack"
                                    value={selectedratiosCopack}
                                    onChange={(e) => setratiosCopack(e.target.value)}
                                    className="p-inputtext w-full"
                                />
                                </div>
                                {fields.map((field, index) => (
                                <>
                                <div key={index} className="field col-4">
                                <label htmlFor="criteriaEvaluation">Criteria Evaluation List</label>
                                <input
                                    type="text"
                                    placeholder="Criteria Evaluation List"
                                    value={field.criteriaEvaluation}
                                    onChange={(e) => handleChange(index, 'criteriaEvaluation', e.target.value)}
                                    className="p-inputtext w-full"
                                />
                                </div>
                                <div key={index} className="field col-4">
                                <label htmlFor="score">Criteria Score</label>
                                <input
                                    type="text"
                                    placeholder="Criteria Score"
                                    value={field.score}
                                    onChange={(e) => handleChange(index, 'score', e.target.value)}
                                    className="p-inputtext w-full"
                                />
                                </div>
                                <div key={index} className="field col-4">
                    
                    {fields.length>1 && (
                        <Button
                            className="p-button-rounded p-button-red-400 mt-4"
                            // label="Remove"
                            icon="pi pi-trash"
                            // className="p-button-danger"
                            onClick={() => handleRemoveField(index)}
                        />
                    )}
                    </div>
                                </>
                            ))}
                            <Button
                                icon="pi pi-plus"
                                label="Add"
                                onClick={handleAddFields}
                                className="p-button-sm p-button-secondary mb-4 col-2 ml-2"
                            />
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
