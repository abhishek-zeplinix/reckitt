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

    useEffect(() => {
        fetchVendors();
        fetchReviewTypes();
        fetchTemplateType();
        fetchUserGroup();
        fetchRegion();
        fetchCountry();
        fetchBU();
    }, []); 


    const fetchVendors = async () => {
        const response: CustomResponse = await GetCall(`/company/vendors`);
        if (response.code === 'SUCCESS') {
            setVendors(response.data);
        }
    };
    const fetchReviewTypes = async () => {
        const response: CustomResponse = await GetCall(`/company/reviewTypes`);
        if (response.code === 'SUCCESS') {
            setReviewTypes(response.data);
        }
    };
    const fetchTemplateType = async () => {
        const response: CustomResponse = await GetCall(`/company/templateType`);
        if (response.code === 'SUCCESS') {
            setTemplateType(response.data);
        }
    };
    const fetchUserGroup = async () => {
        const response: CustomResponse = await GetCall(`/company/user-group`);
        if (response.code === 'SUCCESS') {
            setUserGroup(response.data);
        }
    };
    const fetchRegion = async () => {
        const response: CustomResponse = await GetCall(`/company/region`);
        if (response.code === 'SUCCESS') {
            setRegion(response.data);
        }
    };
    const fetchCountry = async () => {
        const response: CustomResponse = await GetCall(`/company/country`);
        if (response.code === 'SUCCESS') {
            setCountry(response.data);
        }
    };
    const fetchBU = async () => {
        const response: CustomResponse = await GetCall(`/company/bu`);
        if (response.code === 'SUCCESS') {
            setBu(response.data);
        }
    };

    const handleSubmit = async () => {
        console.log('101',form)
         const { valid, errors } = validateFormCreateQuestion(form);
                if (!valid) {
                    setFormErrors(errors);
                    return;
                }
        
                setFormErrors({});
        setLoading(true);
        try {
            const response: CustomResponse = isEditMode ? await PutCall(`/company/supplier/${supId}`, form) : await PostCall(`/company/supplier`, form);

            if (response.code === 'SUCCESS') {
                setAlert('success', `Supplier ${isEditMode ? 'Updated' : 'Added'} Successfully`);
                router.push('/manage-supplier');
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
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

    // adjust title based on edit mode
    const pageTitle = isEditMode ? 'Edit Mapping Template Question to User Groups' : 'Add Mapping Template Question to User Groups';      
    const renderStepContent = () => {
                return (
                    <div>
                        <div className="flex flex-column gap-2 pt-2">
                            <h2 className="text-center font-bold ">{pageTitle}</h2>
                            <div className="p-fluid grid mx-1 pt-2">
                            <div className="field col-3">
                                    <label htmlFor="vendorName" className="font-semibold">
                                    Vendor 
                                    </label>
                                    <Dropdown
                                        id="vendorName"
                                        value={get(form, 'vendorId')}
                                        options={vendors}
                                        optionLabel="vendorName"
                                        optionValue="vendorId"
                                        onChange={(e) => onInputChange('vendorId', e.value)}
                                        placeholder="Select Vendor"
                                        className="w-full mb-1"
                                        showClear={!!get(form, 'vendorId')}
                                    />
                                    {formErrors.vendorId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.vendorId}</p>}
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="reviewTypeId" className="font-semibold">
                                    Review Type
                                    </label>
                                    <Dropdown
                                        id="reviewTypeId"
                                        value={get(form, 'reviewTypeId')}
                                        options={reviewTypes}
                                        optionLabel="reviewTypeName"
                                        optionValue="reviewTypeId"
                                        onChange={(e) => onInputChange('reviewTypeId', e.value)}
                                        placeholder="Select Review Type"
                                        className="w-full mb-1"
                                        showClear={!!get(form, 'reviewTypeId')}
                                    />
                                    {formErrors.reviewTypeId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.reviewTypeId}</p>}
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="templateTypeId" className="font-semibold">
                                    Template Type
                                    </label>
                                    <Dropdown
                                        id="templateTypeId"
                                        value={get(form, 'templateTypeId')}
                                        options={templateType}
                                        optionLabel="templateTypeName"
                                        optionValue="templateTypeId"
                                        onChange={(e) => onInputChange('templateTypeId', e.value)}
                                        placeholder="Select Template Type"
                                        className="w-full mb-1"
                                        showClear={!!get(form, 'templateTypeId')}
                                    />
                                    {formErrors.templateTypeId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.templateTypeId}</p>}
                                </div>

                                <div className="field col-3">
                                    <label htmlFor="userGroupId" className="font-semibold">
                                    User Group
                                    </label>
                                    <Dropdown
                                        id="userGroupId"
                                        value={get(form, 'userGroupId')}
                                        options={userGroup}
                                        optionLabel="userGroupName"
                                        optionValue="userGroupId"
                                        onChange={(e) => onInputChange('userGroupId', e.value)}
                                        placeholder="Select User Group"
                                        className="w-full mb-1"
                                        showClear={!!get(form, 'userGroupId')}
                                    />
                                    {formErrors.userGroupId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.userGroupId}</p>}
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="buId" className="font-semibold">
                                    BU
                                    </label>
                                    <Dropdown
                                        id="buId"
                                        value={get(form, 'buId')}
                                        options={bu}
                                        optionLabel="buName"
                                        optionValue="buId"
                                        onChange={(e) => onInputChange('buId', e.value)}
                                        placeholder="Select BU"
                                        className="w-full mb-1"
                                        showClear={!!get(form, 'buId')}
                                    />
                                    {formErrors.buId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.buId}</p>}
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="regionId" className="font-semibold">
                                    Region
                                    </label>
                                    <Dropdown
                                        id="regionId"
                                        value={get(form, 'regionId')}
                                        options={region}
                                        optionLabel="regionName"
                                        optionValue="regionId"
                                        onChange={(e) => onInputChange('regionId', e.value)}
                                        placeholder="Select Region"
                                        className="w-full mb-1"
                                        showClear={!!get(form, 'regionId')}
                                    />
                                    {formErrors.regionId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.regionId}</p>}
                                </div>

                                <div className="field col-3">
                                    <label htmlFor="masterCountryId" className="font-semibold">
                                    Countries
                                    </label>
                                    <Dropdown
                                        id="masterCountryId"
                                        value={get(form, 'masterCountryId')}
                                        options={country}
                                        optionLabel="countryName"
                                        optionValue="masterCountryId"
                                        onChange={(e) => onInputChange('masterCountryId', e.value)}
                                        placeholder="Select Country"
                                        className="w-full mb-1"
                                        showClear={!!get(form, 'masterCountryId')}
                                    />
                                    {formErrors.masterCountryId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.masterCountryId}</p>}
                                </div>
                                <div className="field col-3">
                               <label htmlFor="brand" className="font-semibold">
                                        Brands
                                    </label>
                                    <InputText id="brand" value={get(form, 'brand')} type="brand" onChange={(e) => onInputChange('brand', e.target.value)} placeholder="Enter Brand " className="p-inputtext w-full mb-1" />
                                    {formErrors.brand && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.brand}</p>}
                                    {alphabetErrors.brand && <p style={{ color: 'red', fontSize: '10px' }}>{alphabetErrors.brand}</p>}
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
                <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400">
                            <Button label={isEditMode ? 'Update' : 'Submit'} icon="pi pi-check" className="bg-primary-main border-primary-main hover:text-white mb-3" onClick={handleSubmit} />
                </div>
            </div>
        </div>
    );
};

export default ManageSupplierAddEditPage;
