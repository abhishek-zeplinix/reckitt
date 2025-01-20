'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PostCall } from '@/app/api-config/ApiKit';
import { CustomResponse } from '@/types';
import { buildQueryParams } from '@/utils/utils';
import { InputText } from 'primereact/inputtext';
import { get } from 'lodash';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';

interface SupplierForm {
    supplierId: number | null;
    supplierName: string;
    supplierEmail: string;
    supplierContact: string;
    supplierManufacturerName: string;
    factoryName: string;
    warehouseLocation: string;
    siteAddress: string;
    procurementCategory: string;
    supplierCategory: string;
    status: string;
    supplierCategoryId: number | null;
    procurementCategoryId: number | null;
}

const defaultForm: SupplierForm = {
    supplierId: null,
    supplierName: '',
    supplierEmail: '',
    supplierContact: '',
    supplierManufacturerName: '',
    factoryName: '',
    warehouseLocation: '',
    siteAddress: '',
    procurementCategory: '',
    supplierCategory: '',
    status: 'Pending',
    supplierCategoryId: null,
    procurementCategoryId: null
};

const GenerateRequestPage = () => {
    const router = useRouter();
    const { setAlert, setLoading, user } = useAppContext();
    
    const [form, setForm] = useState<SupplierForm>(defaultForm);
    const [originalForm, setOriginalForm] = useState<SupplierForm>(defaultForm);
    const [category, setCategory] = useState<any>([]);
    const [subCategory, setSubCategory] = useState<any>([]);
    const [editableFields, setEditableFields] = useState<{[key: string]: boolean}>({});

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchCategory(),
                    fetchSupplierData()
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const fetchSupplierData = async () => {
        try {
            const supId = get(user, 'supplierId');
            const params = { filters: { supId }, pagination: false };
            const queryString = buildQueryParams(params);
            const response = await GetCall(`/company/supplier?${queryString}`);

            if (response.data && response.data[0]) {
                const data = response.data[0];
                const mappedData = {
                    supplierId: data.supId,
                    supplierName: data.supplierName || '',
                    supplierEmail: data.supplierEmail || '',
                    supplierContact: data.supplierContact || '',
                    supplierManufacturerName: data.supplierManufacturerName || '',
                    factoryName: data.factoryName || '',
                    warehouseLocation: data.warehouseLocation || '',
                    siteAddress: data.siteAddress || '',
                    procurementCategory: data.procurementCategoryId || '',
                    supplierCategory: data.supplierCategoryId || '',
                    status: 'Pending',
                    supplierCategoryId: get(data, 'category.categoryId', null),
                    procurementCategoryId: get(data, 'subCategories.subCategoryId', null)
                };
                
                setForm(mappedData);
                setOriginalForm(mappedData);

                if (mappedData.supplierCategoryId) {
                    await fetchSubCategoryByCategoryId(mappedData.supplierCategoryId);
                }
            }
        } catch (error) {
            setAlert('error', 'Failed to fetch supplier data');
        }
    };

    const fetchCategory = async () => {
        const response: CustomResponse = await GetCall(`/company/category`);
        if (response.code === 'SUCCESS') {
            setCategory(response.data);
        }
    };

    const fetchSubCategoryByCategoryId = async (categoryId: number) => {
        if (!categoryId) {
            setSubCategory([]);
            return;
        }

        try {
            const response: CustomResponse = await GetCall(`/company/sub-category/${categoryId}`);
            if (response.code === 'SUCCESS') {
                setSubCategory(response.data);
            }
        } catch (error) {
            setSubCategory([]);
            setAlert('error', 'Failed to fetch subcategories');
        }
    };

    const handleSubmit = async () => {
        // Get requested data based on checked fields
        const requestedData: { [key: string]: any } = {};
        Object.keys(editableFields).forEach(key => {
            if (editableFields[key] && form[key as keyof SupplierForm] !== originalForm[key as keyof SupplierForm]) {
                requestedData[key] = form[key as keyof SupplierForm];
            }
        });

        if (Object.keys(requestedData).length === 0) {
            setAlert('info', 'No changes detected');
            return;
        }

        // Format data for API
        const apiData = {
            supplierId: form.supplierId,
            // supplierName: form.supplierName,
            // supplierEmail: form.supplierEmail,
            // supplierContact: form.supplierContact,
            // supplierManufacturerName: form.supplierManufacturerName,
            // factoryName: form.factoryName,
            // warehouseLocation: form.warehouseLocation,
            // siteAddress: form.siteAddress,
            procurementCategory: form.procurementCategoryId?.toString() || '',
            supplierCategory: form.supplierCategoryId?.toString() || '',
            status: 'Pending',
            requestedData
        };

        setLoading(true);
        try {
            console.log(apiData);
            
            console.log(apiData);
            
            const response: CustomResponse = await PostCall('/company/manageRequest', apiData);

            if (response.code === 'SUCCESS') {
                setAlert('success', 'Information change request raised successfully');
                router.push('/manage-requests');
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const onInputChange = (name: string, value: any) => {
        setForm(prev => {
            const updatedForm = {
                ...prev,
                [name]: value
            };

            // Handle category selection
            if (name === 'supplierCategoryId') {
                updatedForm.supplierCategory = value?.toString() || '';
                updatedForm.procurementCategoryId = null;
                updatedForm.procurementCategory = '';
                fetchSubCategoryByCategoryId(value);
            }

            // Handle subcategory selection
            if (name === 'procurementCategoryId') {
                updatedForm.procurementCategory = value?.toString() || '';
            }

            return updatedForm;
        });
    };

    const toggleFieldEdit = (fieldName: string) => {
        setEditableFields(prev => ({
            ...prev,
            [fieldName]: !prev[fieldName]
        }));
    };

    const renderField = (fieldName: string, label: string, component: React.ReactNode) => {
        return (
            <div className="flexfield col-4">
                <div className="flex align-items-center gap-2 mb-1">
                    <Checkbox
                        checked={editableFields[fieldName] || false}
                        onChange={() => toggleFieldEdit(fieldName)}
                    />
                    <label className="font-semibold">{label}</label>
                </div>
                <div>
                {React.cloneElement(component as React.ReactElement, {
                    disabled: !editableFields[fieldName]
                })}
                </div>

            </div>
        );
    };

    const renderRequestChangeContent = () => {
        return (
            <div>
                <div className="flex flex-column gap-3 pt-2">
                    <h2 className="text-center font-bold">Generate request to change information</h2>
                    <div className="p-fluid grid mx-1 pt-2">
                        {renderField(
                            'supplierName',
                            'Supplier Name',
                            <InputText
                                value={form.supplierName}
                                onChange={(e) => onInputChange('supplierName', e.target.value)}
                                className="p-inputtext w-full"
                                placeholder="Enter Supplier Name"
                            />
                        )}

                        {renderField(
                            'supplierEmail',
                            'Supplier Email',
                            <InputText
                                value={form.supplierEmail}
                                onChange={(e) => onInputChange('supplierEmail', e.target.value)}
                                className="p-inputtext w-full"
                                placeholder="Enter Supplier Email"
                            />
                        )}

                        {renderField(
                            'supplierContact',
                            'Supplier Contact',
                            <InputText
                                value={form.supplierContact}
                                onChange={(e) => onInputChange('supplierContact', e.target.value)}
                                className="p-inputtext w-full"
                                placeholder="Enter Supplier Contact"
                            />
                        )}

                        {renderField(
                            'supplierManufacturerName',
                            'Manufacturing Name',
                            <InputText
                                value={form.supplierManufacturerName}
                                onChange={(e) => onInputChange('supplierManufacturerName', e.target.value)}
                                className="p-inputtext w-full"
                                placeholder="Enter Manufacturing Name"
                            />
                        )}

                        {renderField(
                            'factoryName',
                            'Factory Name',
                            <InputText
                                value={form.factoryName}
                                onChange={(e) => onInputChange('factoryName', e.target.value)}
                                className="p-inputtext w-full"
                                placeholder="Enter Factory Name"
                            />
                        )}

                        {renderField(
                            'supplierCategoryId',
                            'Supplier Category',
                            <Dropdown
                                value={form.supplierCategoryId}
                                options={category}
                                optionLabel="categoryName"
                                optionValue="categoryId"
                                onChange={(e) => onInputChange('supplierCategoryId', e.value)}
                                placeholder="Select Supplier Category"
                                className="w-full"
                            />
                        )}

                        {renderField(
                            'procurementCategoryId',
                            'Procurement Category',
                            <Dropdown
                                value={form.procurementCategoryId}
                                options={subCategory}
                                optionLabel="subCategoryName"
                                optionValue="subCategoryId"
                                onChange={(e) => onInputChange('procurementCategoryId', e.value)}
                                placeholder="Select Procurement Category"
                                className="w-full"
                            />
                        )}

                        {renderField(
                            'warehouseLocation',
                            'Warehouse Location',
                            <InputTextarea
                                value={form.warehouseLocation}
                                onChange={(e) => onInputChange('warehouseLocation', e.target.value)}
                                className="p-inputtext w-full"
                                placeholder="Enter Warehouse Location"
                            />
                        )}

                        {renderField(
                            'siteAddress',
                            'Site Address',
                            <InputTextarea
                                value={form.siteAddress}
                                onChange={(e) => onInputChange('siteAddress', e.target.value)}
                                className="p-inputtext w-full"
                                placeholder="Enter Site Address"
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="">
            <div className="p-card">
                <hr />
                <div className="p-card-body">{renderRequestChangeContent()}</div>
                <hr />
                <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400">
                    <Button 
                        label='Update' 
                        icon="pi pi-check" 
                        className="bg-pink-500 border-pink-500 hover:text-white mb-3" 
                        onClick={handleSubmit}
                        disabled={Object.keys(editableFields).length === 0}
                    />
                </div>
            </div>
        </div>
    );
};

export default GenerateRequestPage;