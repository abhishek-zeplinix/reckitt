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

const CreateNewRulesPage = () => {
    const { user, isLoading, setLoading, setScroll, setAlert} = useAppContext();
    const [orderBy, setorderBy] = useState('');
    const [capaRulesName, setcapaRulesName] = useState('');
    const [status, setstatus] = useState('');
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true'; // Check if in edit mode
    const capaRuleId = searchParams.get('capaRuleId');
    const [selectedProcurementCategory, setSelectedProcurementCategory] = useState(null);
    const [selectedProcurementDepartment, setSelectedProcurementDepartment] = useState(null);
    const [selectedSupplierCategory, setSelectedSupplierCategory] = useState(null);
    const [procurementDepartment,setProcurementDepartment]=useState([]);
    const [procurementCategories,setprocurementCategories]=useState([]);
    const [supplierCategories,setsupplierCategories]=useState([]);
    const [date, setDate] = useState<Date | null>(null);
    const router = useRouter();
    // Adjust title based on edit mode
    const pageTitle = isEditMode ? 'Edit Capa Rules' : 'New Capa Rules';
    const submitButtonLabel = isEditMode ? 'Save' : 'Add Capa Rules';
    const handleSubmit = async() => {
        const userForm = {
            departmentId: selectedProcurementDepartment || null,
            orderBy: parseInt(orderBy) || null,
            categoryId:  selectedSupplierCategory || null,
            subCategoryId: selectedProcurementCategory || null,
            capaRulesName: capaRulesName || '',
            status: status || '',
            effectiveFrom: date || null,
        };
        let endpoint: string;
        let response: CustomResponse;
        if (isEditMode) {
            if (!validateField(userForm.orderBy)) {    
                setAlert('error', 'OrderBy cannot be empty');
                return;
                }
            if (!validateField(userForm.departmentId)) {
                    setAlert('error', 'Department cannot be empty');
                    return;
                }
                
                    if (!validateField(userForm.subCategoryId)) {
                        setAlert('error', 'Procurement Category cannot be empty');
                        return;
                    }
                    if (!validateField(userForm.categoryId)) {
                    
                        setAlert('error', 'Supplier Category cannot be empty');
                        return;
                        }
                if (!validateField(userForm.capaRulesName)) {
                    setAlert('error', 'Capa Rules Name cannot be empty');
                    return;
                }
            
            if (!validateField(userForm.status)) {
                    
                setAlert('error', 'Status cannot be empty');
                return;
                }
                if (!validateField(userForm.effectiveFrom)) {
                    setAlert('error', 'Effective From cannot be empty');
                    return;
                }
            endpoint = `/company/caparule/${capaRuleId}`;
            response = await PutCall(endpoint, userForm); 
            if(response.code === 'SUCCESS'){
                router.push('/manage-capa-rules');
                setAlert('success', 'CAPA Rules updated.');
                
            }else{
                setAlert('error',response.message);
            }
        } else {
            // Submit data to API
        onNewAdd(userForm);
        }
    };
    useEffect(() => {
            fetchprocurementDepartment();
            fetchprocurementCategories();
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
                            console.log('49',response.data)
                            const userDetails = response.data[0]; // Assuming the API returns an array of users
                            console.log('112',response.data[0])
                            setorderBy(userDetails.orderBy || '');
                            setSelectedProcurementDepartment(userDetails.departmentId || null);
                            setSelectedProcurementCategory(userDetails.categoryId || '');
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
                <Button label="Cancel" className="text-pink-500 bg-white border-pink-500 hover:text-white hover:bg-pink-400 transition-colors duration-150 mb-3" onClick={() => router.push('/manage-capa-rules')} />
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
            setProcurementDepartment(response.data)
        } else {
            setProcurementDepartment([])
        }
    };
    const fetchprocurementCategories = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/sub-category`); // get all the roles
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setprocurementCategories(response.data)
        } else {
            setprocurementCategories([])
        }
    };
    const fetchsupplierCategories = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/category`); // get all the roles
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setsupplierCategories(response.data)
        } else {
            setsupplierCategories([])
        }
    };
    const onNewAdd = async (userForm: any) => {
        if (!validateField(userForm.orderBy)) {    
                    setAlert('error', 'OrderBy cannot be empty');
                    return;
                    }
                if (!validateField(userForm.departmentId)) {
                        setAlert('error', 'Department cannot be empty');
                        return;
                    }
                    
                        if (!validateField(userForm.subCategoryId)) {
                            setAlert('error', 'Procurement Category cannot be empty');
                            return;
                        }
                        if (!validateField(userForm.categoryId)) {
                        
                            setAlert('error', 'Supplier Category cannot be empty');
                            return;
                            }
                    if (!validateField(userForm.capaRulesName)) {
                        setAlert('error', 'Capa Rules Name cannot be empty');
                        return;
                    }
                
                if (!validateField(userForm.status)) {
                        
                    setAlert('error', 'Status cannot be empty');
                    return;
                    }
                    if (!validateField(userForm.effectiveFrom)) {
                        setAlert('error', 'Effective From cannot be empty');
                        return;
                    }
        const response: CustomResponse = await PostCall(`/company/caparule`, userForm);
        if (response.code == 'SUCCESS') {
            router.push('/manage-capa-rules');
            setAlert('success', 'Successfully Added');
        } else {
            setAlert('error', response.message);
        }
    };
    const renderContentbody = () => {
        return (
            <div className="grid">
                <div className="col-12">
                    <div className="flex flex-column gap-3 pt-2">
                        <h2 className="text-center font-bold ">{pageTitle}</h2>
                        <div className="p-fluid grid md:mx-7 pt-2">
                            <div className="field col-4">
                                <label htmlFor="orderBy">Order By</label>
                                <input id="orderBy" type="text" value={orderBy} onChange={(e) => setorderBy(e.target.value)} className="p-inputtext w-full" placeholder="Enter orderBy" />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="departmentId">Department</label>
                                <Dropdown id="departmentId" value={selectedProcurementDepartment} options={procurementDepartment} onChange={(e) => setSelectedProcurementDepartment(e.value)} placeholder="Select Department" optionLabel="name" optionValue="departmentId" className="w-full" />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="subCategoryId">Procurement Category</label>
                                    <Dropdown
                                    id="subCategoryId"
                                    value={selectedProcurementCategory}
                                    options={procurementCategories}
                                    onChange={(e) => setSelectedProcurementCategory(e.value)}
                                    optionLabel="subCategoryName"
                                    optionValue="subCategoryId"
                                    placeholder="Select Procurement Category"
                                    className="w-full"
                                    />
                                </div>
                                <div className="field col-4">
                                    <label htmlFor="categoryId">Supplier Category</label>
                                    <Dropdown id="categoryId" value={selectedSupplierCategory} options={supplierCategories} onChange={(e) => setSelectedSupplierCategory(e.value)} placeholder="Select Supplier Category" optionLabel="categoryName" optionValue="categoryId" className="w-full" />
                                </div>
                                <div className="field col-4">
                                <label htmlFor="capaRulesName">Capa Rules Name</label>
                                <input id="capaRulesName" type="text" value={capaRulesName} onChange={(e) => setcapaRulesName(e.target.value)} className="p-inputtext w-full" placeholder="Enter if capa is required" />
                            </div>
                            {/* <div className="field col-4">
                                <label htmlFor="capaRulesName">Complete below if capa is required</label>
                                <input id="capaRulesName" type="text" value={manufacturerName} onChange={(e) => setManufacturerName(e.target.value)} className="p-inputtext w-full" placeholder="Enter if capa is required" />
                            </div> */}
                            <div className="field col-4">
                                <label htmlFor="status">Status</label>
                                <input id="status" type="text" value={status} onChange={(e) => setstatus(e.target.value)} className="p-inputtext w-full" placeholder="Enter status" />
                            </div>
                            <div className="field col-4">
                            <label htmlFor="effectiveFrom">
                                            Select Effective Date:
                                        </label>
                                <Calendar id="effectiveFrom" value={date} onChange={(e) => setDate(e.value as Date)} dateFormat="dd-mm-yy" placeholder="Select a date" showIcon style={{ borderRadius: '5px', borderColor: 'black' }} />
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


