/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import _ from 'lodash';
import { Dropdown } from 'primereact/dropdown';
import useFetchDepartments from '@/hooks/useFetchDepartments';
import { useAppContext } from '@/layout/AppWrapper';
import { CustomResponse } from '@/types';
import { GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { validateField } from '@/utils/utils';

const CreateNewRulesPage = () => {
    const { user, isLoading, setLoading, setScroll, setAlert } = useAppContext();
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true'; // Check if in edit mode
    const ruleId = searchParams.get('ruleId');
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
    const router = useRouter();
    // Adjust title based on edit mode
    const pageTitle = isEditMode ? 'Edit Rules' : 'Add Rules';
    const submitButtonLabel = isEditMode ? 'Save' : 'Add Rules';
    const handleSubmit = async () => {
        const userForm = {
            departmentId: selectedProcurementDepartment || null,
            orderBy: parseInt(orderBy) || null,
            section: selectedsection || '',
            categoryId: selectedProcurementCategory || null,
            subCategoryId: selectedSupplierCategory || null,
            ratedCriteria: selectedCriteria || '',
            criteriaEvaluation: selectedcriteriaEvaluation || '',
            score: selectedScore || null,
            ratiosRawpack: parseInt(selectedratiosRawpack) || 0,
            ratiosCopack: parseInt(selectedratiosCopack) || 0
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
            if (!validateField(userForm.categoryId)) {
                setAlert('error', 'Supplier Category cannot be empty');
                return;
            }
            if (!validateField(userForm.subCategoryId)) {
                setAlert('error', 'Procurement Category cannot be empty');
                return;
            }
            if (!validateField(userForm.section)) {
                setAlert('error', 'Section cannot be empty');
                return;
            }

            if (!validateField(userForm.ratedCriteria)) {
                setAlert('error', 'Criteria cannot be empty');
                return;
            }
            if (!validateField(userForm.criteriaEvaluation)) {
                setAlert('error', 'Criteria evaluation cannot be empty');
                return;
            }
            if (!validateField(userForm.score)) {
                setAlert('error', 'Score name cannot be empty');
                return;
            }

            if (!validateField(userForm.ratiosCopack)) {
                setAlert('error', 'Ratios copack name cannot be empty');
                return;
            }
            if (!validateField(userForm.ratiosRawpack)) {
                setAlert('error', 'Ratios rawpack cannot be empty');
                return;
            }
            endpoint = `/company/rules/${ruleId}`;
            response = await PutCall(endpoint, userForm); // Call PUT API
            if (response.code === 'SUCCESS') {
                router.push('/manage-rules');
                setAlert('success', 'Rules updated.');
            } else {
                setAlert('error', response.message);
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
                <Button label="Cancel" className="text-pink-500 bg-white border-pink-500 hover:text-white hover:bg-pink-400 transition-colors duration-150 mb-3" onClick={() => router.push('/manage-rules')} />
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
    const fetchprocurementCategories = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/sub-category`); // get all the roles
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
        if (!validateField(userForm.orderBy)) {
            setAlert('error', 'OrderBy cannot be empty');
            return;
        }
        if (!validateField(userForm.departmentId)) {
            setAlert('error', 'Department cannot be empty');
            return;
        }
        if (!validateField(userForm.categoryId)) {
            setAlert('error', 'Supplier Category cannot be empty');
            return;
        }
        if (!validateField(userForm.subCategoryId)) {
            setAlert('error', 'Procurement Category cannot be empty');
            return;
        }
        if (!validateField(userForm.section)) {
            setAlert('error', 'Section cannot be empty');
            return;
        }

        if (!validateField(userForm.ratedCriteria)) {
            setAlert('error', 'Criteria cannot be empty');
            return;
        }
        if (!validateField(userForm.criteriaEvaluation)) {
            setAlert('error', 'Criteria evaluation cannot be empty');
            return;
        }
        if (!validateField(userForm.score)) {
            setAlert('error', 'Score name cannot be empty');
            return;
        }

        if (!validateField(userForm.ratiosCopack)) {
            setAlert('error', 'Ratios copack name cannot be empty');
            return;
        }
        if (!validateField(userForm.ratiosRawpack)) {
            setAlert('error', 'Ratios rawpack cannot be empty');
            return;
        }
        setIsDetailLoading(true);
        const response: CustomResponse = await PostCall(`/company/rules`, userForm);
        setIsDetailLoading(false);
        if (response.code == 'SUCCESS') {
            router.push('/manage-rules');
            setAlert('success', 'Successfully Added');
        } else {
            setAlert('error', response.message);
        }
    };

    const { departments } = useFetchDepartments();
    const renderContentbody = () => {
        return (
            <div className="grid">
                <div className="col-12">
                    <div className="flex flex-column gap-3 pt-2">
                        <h2 className="text-center font-bold ">{pageTitle}</h2>
                        <div className="p-fluid grid md:mx-7 pt-2">
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
                                    onChange={(e) => setSelectedSupplierCategory(e.value)}
                                    placeholder="Select Supplier Category"
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
                                    placeholder="Select Procurement Category"
                                    className="w-full"
                                />
                            </div>

                            {/* <div className="field col-4">
                                <label htmlFor="manufacturerName">Criteria Category</label>
                                <input id="manufacturerName" type="text" value={manufacturerName} onChange={(e) => setManufacturerName(e.target.value)} className="p-inputtext w-full" placeholder="Enter Manufacturing Name" />
                            </div> */}
                            <div className="field col-4">
                                <label htmlFor="section">Section</label>
                                <input id="section" type="text" value={selectedsection} onChange={(e) => setSelectedsection(e.target.value)} className="p-inputtext w-full" placeholder="Enter Section Name" />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="ratedCriteria">Criteria</label>
                                <input id="ratedCriteria" type="text" value={selectedCriteria} onChange={(e) => setCriteria(e.target.value)} className="p-inputtext w-full" placeholder="Enter Factory Name" />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="criteriaEvaluation">Criteria Evaluation List</label>
                                <input id="criteriaEvaluation" type="text" value={selectedcriteriaEvaluation} onChange={(e) => setcriteriaEvaluation(e.target.value)} className="p-inputtext w-full" placeholder="Enter Criteria Evaluation" />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="score">Criteria Score</label>
                                <input id="score" type="text" value={selectedScore} onChange={(e) => setScore(e.target.value)} className="p-inputtext w-full" placeholder="Enter Score" />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="ratiosRawpack">Ratio Co Pack</label>
                                <input id="ratiosRawpack" type="text" value={selectedratiosRawpack} onChange={(e) => setratiosRawpack(e.target.value)} className="p-inputtext w-full" placeholder="Enter Ratio Co Pack" />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="ratiosCopack">Ratios Raw & Pack</label>
                                <input id="ratiosCopack" type="text" value={selectedratiosCopack} onChange={(e) => setratiosCopack(e.target.value)} className="p-inputtext w-full" placeholder="Enter Ratios Raw & Pack" />
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
