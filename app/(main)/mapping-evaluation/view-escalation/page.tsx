'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { CustomResponse } from '@/types';
import { validateFormCreateQuestion } from '@/utils/utils';
import { InputText } from 'primereact/inputtext';
import { get } from 'lodash';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { EmptyCreatequestion } from '@/types/forms';
import Stepper from '@/components/Stepper';
import { Country, State, City } from 'country-state-city';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
const defaultForm: EmptyCreatequestion = {
  vendorId: null,
  reviewTypeId:null,
  templateTypeId: null,
  userGroupId:null,
  buId:null,
  regionId:  null,
  masterCountryId: null,
  brand:'',
};

const ManageSupplierAddEditPage = () => {
    const totalSteps = 2;
    const router = useRouter();
    const searchParams = useSearchParams();
    const supId = searchParams.get('supId');
    const isEditMode = searchParams.get('edit') === 'true';
    const { setAlert, setLoading } = useAppContext();
    const [form, setForm] = useState<EmptyCreatequestion>(defaultForm);
    const [vendors, setVendors] = useState<any>([]);
    const [reviewTypes, setReviewTypes] = useState<any>([]);
    const [templateType, setTemplateType] = useState<any>([]);
    const [userGroup, setUserGroup] = useState<any>([]);
    const [region, setRegion] = useState<any>([]);
    const [bu, setBu] = useState<any>([]);
    const [country, setCountry] = useState<any>([]);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [alphabetErrors, setAlphabetErrors] = useState<{ [key: string]: string }>({});
    const tableData = [
        { serialNumber: 1, question: 'How satisfied are you with our service?', avgRating: 4.5 },
        { serialNumber: 2, question: 'How likely are you to recommend us to others?', avgRating: 3.8 },
        { serialNumber: 3, question: 'How would you rate the quality of our product?', avgRating: 4.2 },
        { serialNumber: 4, question: 'How easy was it to use our platform?', avgRating: 4.0 },
        { serialNumber: 5, question: 'How responsive was our support team?', avgRating: 4.7 },
    ];

    useEffect(() => {
        // fetchVendors();
        // fetchReviewTypes();
        // fetchTemplateType();
        // fetchUserGroup();
        // fetchRegion();
        // fetchCountry();
        // fetchBU();
    }, []); 


    // const fetchVendors = async () => {
    //     const response: CustomResponse = await GetCall(`/company/vendors`);
    //     if (response.code === 'SUCCESS') {
    //         setVendors(response.data);
    //     }
    // };
    // const fetchReviewTypes = async () => {
    //     const response: CustomResponse = await GetCall(`/company/reviewTypes`);
    //     if (response.code === 'SUCCESS') {
    //         setReviewTypes(response.data);
    //     }
    // };
    // const fetchTemplateType = async () => {
    //     const response: CustomResponse = await GetCall(`/company/templateType`);
    //     if (response.code === 'SUCCESS') {
    //         setTemplateType(response.data);
    //     }
    // };
    // const fetchUserGroup = async () => {
    //     const response: CustomResponse = await GetCall(`/company/user-group`);
    //     if (response.code === 'SUCCESS') {
    //         setUserGroup(response.data);
    //     }
    // };
    // const fetchRegion = async () => {
    //     const response: CustomResponse = await GetCall(`/company/region`);
    //     if (response.code === 'SUCCESS') {
    //         setRegion(response.data);
    //     }
    // };
    // const fetchCountry = async () => {
    //     const response: CustomResponse = await GetCall(`/company/country`);
    //     if (response.code === 'SUCCESS') {
    //         setCountry(response.data);
    //     }
    // };
    // const fetchBU = async () => {
    //     const response: CustomResponse = await GetCall(`/company/bu`);
    //     if (response.code === 'SUCCESS') {
    //         setBu(response.data);
    //     }
    // };

    // const handleSubmit = async () => {
    //      const { valid, errors } = validateFormCreateQuestion(form);
    //             if (!valid) {
    //                 setFormErrors(errors);
    //                 return;
    //             }
        
    //             setFormErrors({});
    //     setLoading(true);
    //     try {
    //         const response: CustomResponse = isEditMode ? await PutCall(`/company/supplier/${supId}`, form) : await PostCall(`/company/supplier`, form);

    //         if (response.code === 'SUCCESS') {
    //             setAlert('success', `Supplier ${isEditMode ? 'Updated' : 'Added'} Successfully`);
    //             router.push('/manage-supplier');
    //         } else {
    //             setAlert('error', response.message);
    //         }
    //     } catch (error) {
    //         setAlert('error', 'Something went wrong!');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const onInputChange = (name: string | { [key: string]: any }, val?: any) => {
    //     if (typeof name !== 'string') return;
    //     if (name !== 'vendorId' && name !== 'reviewTypeId' && name !== 'templateTypeId' && name !== 'userGroupId' && name !== 'buId' && name !== 'regionId' && name !== 'masterCountryId') {
    //         if (val) {
    //             const trimmedValue = val.trim();
    //             const wordCount = trimmedValue.length;
    //             if (name === 'brand') {
    //                 const isAlphabet = /^[a-zA-Z\s]+$/.test(val);
    //                 if (!isAlphabet) {
    //                     setAlphabetErrors((prevAlphaErrors) => ({
    //                         ...prevAlphaErrors,
    //                         [name]: 'Must contain only alphabets!'
    //                     }));
    //                     return;
    //                 } else if (wordCount > 50) {
    //                     setAlphabetErrors((prevWordErrors) => ({
    //                         ...prevWordErrors,
    //                         [name]: 'Maximum 50 characters allowed!'
    //                     }));
    //                     return;
    //                  } else {
    //                     setAlphabetErrors((prevAlphaErrors) => {
    //                         const updatedErrors = { ...prevAlphaErrors };
    //                         delete updatedErrors[name];
    //                         return updatedErrors;
    //                     });
    //                 }
    //             }
    //         }
    //     }
    //     setForm((prevForm) => {
    //         const updatedForm = {
    //             ...prevForm,
    //             ...(typeof name === 'string' ? { [name]: val } : name),
    //         };
    
    //         return updatedForm;
    //     });
    //     // Real-time validation: Remove error if input is valid
    //     setFormErrors((prevErrors) => {
    //         const updatedErrors = { ...prevErrors };
    
    //         if (val && updatedErrors[name]) {
    //             delete updatedErrors[name]; 
    //         }
    
    //         return updatedErrors;
    //     });
    // };

    // adjust title based on edit mode
    // const pageTitle = isEditMode ? 'Edit Mapping Template Question to User Groups' : 'Add Mapping Template Question to User Groups';   
    setLoading(false)   
    const renderStepContent = () => {
        return (
            <div>
    <div className="flex flex-column gap-2 pt-2">
        <h2 className="text-center font-bold">View Escalation Mapping With Timeline</h2>
        <div className="p-fluid grid mx-1 pt-2 gap-3" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            {/* Total Members Card */}
            <div className="bg-white p-6 border-round-lg shadow-1" style={{ flex: '1 1 calc(30% - 1rem)', minWidth: '250px', margin: '0.5rem' }}>
                <h3 className="text-2xl font-semibold">Total Members</h3>
                <p className="text-2xl font-bold mt-2">120</p>
            </div>
        
            {/* Completed Card */}
            <div className="bg-white p-6 border-round-lg shadow-1" style={{ flex: '1 1 calc(30% - 1rem)', minWidth: '250px', margin: '0.5rem' }}>
                <h3 className="text-2xl font-semibold">Completed</h3>
                <p className="text-2xl font-bold mt-2">85</p>
            </div>
        
            {/* In Completed Card */}
            <div className="bg-white p-6 border-round-lg shadow-1" style={{ flex: '1 1 calc(30% - 1rem)', minWidth: '250px', margin: '0.5rem' }}>
                <h3 className="text-2xl font-semibold">In Completed</h3>
                <p className="text-2xl font-bold mt-2">35</p>
            </div>
            {/* Table Section */}
                    <div className="col-12">
                        <DataTable value={tableData} responsiveLayout="scroll">
                            <Column field="serialNumber" header="S.No" style={{ width: '10%' }} />
                            <Column field="question" header="Question" style={{ width: '70%' }} />
                            <Column field="avgRating" header="Avg. Rating" style={{ width: '20%' }} />
                        </DataTable>
                </div>
        </div>
    </div>
</div>
        
        );
    };
    

    return (
        <div className="">
            <div className="p-card">
                <hr />
                <div className="p-card-body">{renderStepContent()}</div>
                <hr />
                {/* <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400">
                            <Button label={isEditMode ? 'Update' : 'Submit'} icon="pi pi-check" className="bg-primary-main border-primary-main hover:text-white mb-3" onClick={handleSubmit} />
                </div> */}
            </div>
        </div>
    );
};

export default ManageSupplierAddEditPage;
