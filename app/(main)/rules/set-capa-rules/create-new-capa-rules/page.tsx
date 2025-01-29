/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import _ from 'lodash';
import { Dropdown } from 'primereact/dropdown';
import { CustomResponse } from '@/types';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { Calendar } from 'primereact/calendar';
import { validateField } from '@/utils/utils';
import { z } from 'zod';

const CreateNewRulesPage = () => {
    const { user, isLoading, setLoading, setScroll, setAlert } = useAppContext();
    const [orderBy, setorderBy] = useState('');
    const [selectcapaRulesName, setcapaRulesName] = useState('');
    const [status, setstatus] = useState('');
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true'; // Check if in edit mode
    const capaRuleId = searchParams.get('capaRuleId');
    const ruleSetId = searchParams.get('ruleSetId');
    const [selectedProcurementCategory, setSelectedProcurementCategory] = useState(null);
    const [selectedProcurementDepartment, setSelectedProcurementDepartment] = useState(null);
    const [selectedSupplierCategory, setSelectedSupplierCategory] = useState(null);
    const [procurementDepartment, setProcurementDepartment] = useState([]);
    const [procurementCategories, setprocurementCategories] = useState([]);
    const [supplierCategories, setsupplierCategories] = useState([]);
    const [date, setDate] = useState<Date | null>(null);
    const router = useRouter();
    // Adjust title based on edit mode
    const pageTitle = isEditMode ? 'Edit Capa Rules' : 'New Capa Rules';
    const submitButtonLabel = isEditMode ? 'Save' : 'Add Capa Rules';
     const [fields, setFields] = useState({
            effectiveFrom: null as Date | null,
            departmentId: null,
            orderBy: null as number | null,
            categoryId: null,
            subCategoryId: null,
            capaRulesName:'',
            status:[''],  
          });
          // Update common fields on dependency change
          useEffect(() => {
              updateCommonFields();
            }, [
              date,
              selectedProcurementDepartment,
              orderBy,
              selectedProcurementCategory,
              selectedSupplierCategory,
              selectcapaRulesName,
            ]);

              const updateCommonFields = () => {
                setFields((prev) => ({
                  ...prev,
                  effectiveFrom: date || null,
                  departmentId: selectedProcurementDepartment || null,
                  orderBy: parseInt(orderBy) || null,
                  categoryId: selectedProcurementCategory || null,
                  subCategoryId: selectedSupplierCategory || null,
                  capaRulesName:selectcapaRulesName || '',
                }));
              };
              // Update common fields when they change
              useEffect(() => {
                  updateCommonFields();
                }, [date, selectedProcurementDepartment, orderBy, selectedProcurementCategory, selectedSupplierCategory,selectcapaRulesName]);
             // Add new set of criteriaEvaluation and score
const handleAddFields = () => {
    setFields((prev) => ({
      ...prev,
    //   capaRulesName: [...prev.capaRulesName, ""],
      status: [...prev.status, ""],
    }));
  };  
  const handleChange = (
    index: number,
    key: "status",
    value: string
  ) => {
    setFields((prev) => {
      const updatedArray = [...prev[key]];
      updatedArray[index] = value;
      return { ...prev, [key]: updatedArray };
    });
  };
  // Remove a field
const handleRemoveField = (index: number) => {
    setFields((prev) => ({
      ...prev,
    //   capaRulesName: prev.capaRulesName.filter((_, i) => i !== index),
      status: prev.status.filter((_, i) => i !== index),
    }));
  }; 
  const handleSubmit = async () => {
    try {
      console.log('100',fields)
      // Validate fields using Zod schema
    //   fieldsSchema.parse(fields);
  
      let endpoint: string;
      let response: CustomResponse;
  
      if (isEditMode) {
        endpoint = `/company/caparule/${capaRuleId}`;
        try {
          response = await PutCall(endpoint, fields); // Call PUT API
          if (response.code === 'SUCCESS') {
            router.push(`/rules/set-capa-rules&ruleSetId=${ruleSetId}`);
            setAlert('success', 'CAPA Rules updated.');
          } else {
            setAlert('error', response.message);
          }
        } catch (error) {
          setAlert('error', 'Failed to update CAPA Rules. Please try again.');
        }
      } else {
        try {
          // Submit data for new addition
          onNewAdd(fields);
          setAlert('success', 'CAPA Rules added successfully.');
        } catch (error) {
          setAlert('error', 'Failed to add CAPA Rules. Please try again.');
        }
      }
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        // Handle validation errors
        const errors = validationError.errors.map((err) => err.message).join(', ');
        setAlert('error', `Validation failed: ${errors}`);
      } else {
        setAlert('error', 'Unexpected error during validation.');
      }
    }
  };
  
    useEffect(() => {
            fetchprocurementDepartment();
            fetchsupplierCategories();
            return () => {
                setScroll(true);
            };
        }, []);
        useEffect(() => {
                    if (isEditMode && capaRuleId) {
                        fetchUserDetails(); // Fetch and pre-fill data in edit mode
                    }
                }, []);
                
                const fetchUserDetails = async () => {
                    setLoading(true);
                    try {
                        const response: CustomResponse = await GetCall(`/company/caparule?id=${capaRuleId}`);
                        if (response.code === 'SUCCESS' && response.data.length > 0) {
                            const userDetails = response.data[0]; // Assuming the API returns an array of users
                            setorderBy(userDetails.orderBy || '');
                            setSelectedProcurementDepartment(userDetails.departmentId || null);
                            setSelectedProcurementCategory(userDetails.categoryId || '');
                            fetchprocurementCategories(userDetails.categoryId),
                            setSelectedSupplierCategory(userDetails.subCategoryId || '');
                            setcapaRulesName(userDetails.capaRulesName || '');
                            setstatus(userDetails.status || '');
                            // Parse the date string into a Date object
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
                <Button label="Cancel" className="text-primary-main bg-white border-primary-main hover:text-white hover:bg-pink-400 transition-colors duration-150 mb-3" onClick={() => router.push(`/rules/set-capa-rules?ruleSetId=${ruleSetId}`)} />
                <Button label={submitButtonLabel} icon="pi pi-check" className="bg-primary-main border-primary-main hover:bg-pink-400 mb-3" onClick={handleSubmit} />
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
        const response: CustomResponse = await GetCall(`/company/sub-category/${categoryId}`); // get all the roles
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
        
        const response: CustomResponse = await PostCall(`/company/caparule`, userForm);
        if (response.code == 'SUCCESS') {
            router.push('rules/set-capa-rules');
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
                                <input id="orderBy" type="text" value={orderBy} onChange={(e) => setorderBy(e.target.value)} className="p-inputtext w-full" placeholder="Enter orderBy" />
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
                                                                <label htmlFor='capaRulesName'>Capa Rules Name</label>
                                                                <input
                                                                    id='capaRulesName'
                                                                    type="text"
                                                                    placeholder="Capa Rules Name"
                                                                    value={selectcapaRulesName}
                                                                    onChange={(e) => setcapaRulesName( e.target.value)}
                                                                    className="p-inputtext w-full"
                                                                />
                                                            </div>
                                                            {fields.status.map((_, index) => (
                                                        <React.Fragment key={index}>
                                                            <div className="field col-4">
                                                                <label htmlFor={`status-${index}`}>Status</label>
                                                                <input
                                                                    id={`status-${index}`}
                                                                    type="text"
                                                                    placeholder="Status"
                                                                    value={fields.status[index]}
                                                                    onChange={(e) => handleChange(index, "status", e.target.value)}
                                                                    className="p-inputtext w-full"
                                                                />
                                                            </div>
                                                            
                                                            {fields.status.length>1 && (
                                                              <>
                                                            <div className="field col-4">
                                                            <Button
                                                                className="p-button-rounded p-button-danger mt-4"
                                                                icon="pi pi-trash"
                                                                onClick={() => handleRemoveField(index)}
                                                            />
                                                            </div>
                                                            <div className="field col-4"></div>
                                                            </>
                                                            
                                                            )}
                                                        </React.Fragment>
                                                        ))}
                                                        <div className="field col-4 mt-4">
                                                        <Button
                                                            icon="pi pi-plus"
                                                            // label="Add"
                                                            onClick={handleAddFields}
                                                            className="p-button-sm p-button-secondary mb-4 col-2 ml-2"
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
