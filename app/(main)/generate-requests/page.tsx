'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PostCall } from '@/app/api-config/ApiKit';
import { InputText } from 'primereact/inputtext';
import { get } from 'lodash';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';

const GenerateRequestPage = () => {
    const router = useRouter();
    const { setAlert, setLoading, user } = useAppContext();

    // Single form state instead of separate form and originalForm
    const [formData, setFormData] = useState<any>({
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
        // Keep IDs for backward compatibility
        supplierCategoryId: null,
        procurementCategoryId: null,
    });

    const [categories, setCategories] = useState<any>([]);
    const [subCategories, setSubCategories] = useState<any>([]);
    const [selectedFields, setSelectedFields] = useState<any>({});

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchCategories(),
                fetchSupplierData()
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        const response = await GetCall('/company/category');
        if (response.code === 'SUCCESS') {
            setCategories(response.data);
        }
    };

    const fetchSubCategories = async (categoryId: any) => {
        if (!categoryId) {
            setSubCategories([]);
            return;
        }

        try {
            const response = await GetCall(`/company/sub-category/${categoryId}`);
            if (response.code === 'SUCCESS') {
                setSubCategories(response.data);
            }
        } catch (error) {
            setSubCategories([]);
            setAlert('error', 'Failed to fetch subcategories');
        }
    };

    const fetchSupplierData = async () => {
        try {
            const supId = get(user, 'supplierId');
            const response = await GetCall(`/company/supplier?filters[supId]=${supId}`);

            if (response.data?.[0]) {
                const data = response.data[0];

                // Pre-select category and fetch subcategories if available
                if (data.supplierCategoryId) {
                    await fetchSubCategories(data.supplierCategoryId);
                }

                setFormData({
                    supplierId: data.supId,
                    supplierName: get(user, 'name', ''),
                    supplierEmail: data.supplierEmail || '',
                    supplierContact: data.supplierContact || '',
                    supplierManufacturerName: data.supplierManufacturerName || '',
                    factoryName: data.factoryName || '',
                    warehouseLocation: data.warehouseLocation || '',
                    siteAddress: data.siteAddress || '',
                    // Store both ID and name for categories
                    supplierCategoryId: get(data, 'category.categoryId'),
                    procurementCategoryId: get(data, 'subCategories.subCategoryId'),
                    supplierCategory: get(data, 'subCategories.subCategoryName', ''),
                    procurementCategory: get(data, 'subCategories.subCategoryName', ''),
                    status: 'Pending'
                });
            }
        } catch (error) {
            setAlert('error', 'Failed to fetch supplier data');
        }
    };

    // const handleSubmit = async () => {
    //     // Get requested data based on checked fields
    //     const requestedData: any = {};
    //     Object.keys(selectedFields).forEach(field => {
    //         if (selectedFields[field]) {
    //             requestedData[field] = formData[field];
    //         }
    //     });

    //     if (Object.keys(requestedData).length === 0) {
    //         setAlert('info', 'No fields selected for update');
    //         return;
    //     }

    //     try {
    //         setLoading(true);

    //         // You can choose to send either IDs or names by uncommenting the relevant section
    //         const apiData = {
    //             ...formData,
    //             requestedData,
    //             // // Option 1: Send category names
    //             // procurementCategory: formData.procurementCategory,
    //             // supplierCategory: formData.supplierCategory,

    //             /* Option 2: Send category IDs
    //             procurementCategory: formData.procurementCategoryId?.toString(),
    //             supplierCategory: formData.supplierCategoryId?.toString(),
    //             */
    //         };
    //         console.log(apiData);

    //         const response = await PostCall('/company/manageRequest', apiData);

    //         if (response.code === 'SUCCESS') {
    //             setAlert('success', 'Request submitted successfully');
    //             router.push('/manage-requests');
    //         } else {
    //             setAlert('error', response.message);
    //         }

    //     } catch (error) {
    //         setAlert('error', 'Failed to submit request');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const handleInputChange = (name: any, value: any) => {
    //     setFormData((prev: any) => {
    //         const updated = { ...prev, [name]: value };

    //         // Handle category selection
    //         if (name === 'supplierCategoryId') {
    //             const category = categories.find((c: any) => c.categoryId === value);
    //             updated.supplierCategory = category?.categoryName || '';
    //             updated.procurementCategoryId = null;
    //             updated.procurementCategory = '';
    //             fetchSubCategories(value);
    //         }

    //         // Handle subcategory selection
    //         if (name === 'procurementCategoryId') {
    //             const subCategory = subCategories.find((sc: any) => sc.subCategoryId === value);
    //             updated.procurementCategory = subCategory?.subCategoryName || '';
    //         }

    //         return updated;
    //     });
    // };

    
    const handleSubmit = async () => {
        // Get requested data based on checked fields
        const requestedData: any = {};
        Object.keys(selectedFields).forEach(field => {
            if (selectedFields[field]) {
                // For categories, send the names instead of IDs
                if (field === 'supplierCategoryId') {
                    requestedData['procurementCategory'] = formData.supplierCategory;
                } else if (field === 'procurementCategoryId') {
                    requestedData['supplierCategory'] = formData.procurementCategory;
                } else {
                    requestedData[field] = formData[field];
                }
            }
        });
    
        if (Object.keys(requestedData).length === 0) {
            setAlert('info', 'No fields selected for update');
            return;
        }
    
        try {
            setLoading(true);
            const apiData = {
                supplierId: get(formData, 'supplierId'),
                requestedData
            };

            console.log(apiData);
            
            
            const response = await PostCall('/company/manageRequest', apiData);

                    if (response.code === 'SUCCESS') {
                        setAlert('success', 'Request submitted successfully');
                        router.push('/manage-requests');
                    } else {
                        setAlert('error', response.message);
                    }
                    
        } catch (error) {
            setAlert('error', 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (name: any, value: any) => {
        setFormData((prev: any) => {
            const updated = { ...prev, [name]: value };
    
            // Handle category selection
            if (name === 'supplierCategoryId') {
                const category = categories.find((c: any) => c.categoryId === value);
                updated.supplierCategory = category?.categoryName || '';
                updated.procurementCategoryId = null;
                updated.procurementCategory = '';
                fetchSubCategories(value);
            }
    
            // Handle subcategory selection
            if (name === 'procurementCategoryId') {
                const subCategory = subCategories.find((sc: any) => sc.subCategoryId === value);
                updated.procurementCategory = subCategory?.subCategoryName || '';
            }
    
            return updated;
        });
    };

    const toggleField = (fieldName: any) => {
        setSelectedFields((prev: any) => ({
            ...prev,
            [fieldName]: !prev[fieldName]
        }));
    };

    const renderField = (fieldName: any, label: any, component: any) => {
        return (
            <div className="flexfield col-4">
                <div className="flex align-items-center gap-2 mb-1">
                    <Checkbox
                        checked={selectedFields[fieldName] || false}
                        onChange={() => toggleField(fieldName)}
                    />
                    <label className="font-semibold">{label}</label>
                </div>
                <div>
                    {React.cloneElement(component, {
                        disabled: !selectedFields[fieldName]
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="">
            <div className="p-card">
                <hr />
                <div className="p-card-body">
                    <div className="flex flex-column gap-3 pt-2">
                        <h2 className="text-center font-bold">Generate request to change information</h2>

                        <div className="p-fluid grid mx-1 pt-2">
                            {renderField('supplierName', 'Supplier Name', <InputText value={formData.supplierName}
                                onChange={(e) => handleInputChange('supplierName', e.target.value)} className="p-inputtext w-full"
                                placeholder="Enter Supplier Name" />)}

                            {renderField('supplierEmail', 'Supplier Email', <InputText value={formData.supplierEmail} onChange={(e) => handleInputChange('supplierEmail', e.target.value)} className="p-inputtext w-full" placeholder="Enter Supplier Email" />)}

                            {renderField(
                                'supplierContact',
                                'Supplier Contact',
                                <InputText value={formData.supplierContact} onChange={(e) => handleInputChange('supplierContact', e.target.value)} className="p-inputtext w-full" placeholder="Enter Supplier Contact" />
                            )}

                            {renderField(
                                'supplierManufacturerName',
                                'Manufacturer Name',
                                <InputText value={formData.supplierManufacturerName} onChange={(e) => handleInputChange('supplierManufacturerName', e.target.value)} className="p-inputtext w-full" placeholder="Enter Manufacturer Name" />
                            )}

                            {renderField('factoryName', 'Factory Name', <InputText value={formData.factoryName} onChange={(e) => handleInputChange('factoryName', e.target.value)} className="p-inputtext w-full" placeholder="Enter Factory Name" />)}

                            {renderField(
                                'supplierCategoryId',
                                'Supplier Category',
                                <Dropdown
                                    value={formData.supplierCategoryId}
                                    options={categories}
                                    optionLabel="categoryName"
                                    optionValue="categoryId"
                                    onChange={(e) => handleInputChange('supplierCategoryId', e.value)}
                                    placeholder="Select Supplier Category"
                                    className="w-full"
                                />
                            )}

                            {renderField(
                                'procurementCategoryId',
                                'Procurement Category',
                                <Dropdown
                                    value={formData.procurementCategoryId}
                                    options={subCategories}
                                    optionLabel="subCategoryName"
                                    optionValue="subCategoryId"
                                    onChange={(e) => handleInputChange('procurementCategoryId', e.value)}
                                    placeholder="Select Procurement Category"
                                    className="w-full"
                                />
                            )}

                            {renderField(
                                'warehouseLocation',
                                'Warehouse Location',
                                <InputTextarea value={formData.warehouseLocation} onChange={(e) => handleInputChange('warehouseLocation', e.target.value)} className="p-inputtext w-full" placeholder="Enter Warehouse Location" />
                            )}

                            {renderField('siteAddress', 'Site Address', <InputTextarea value={formData.siteAddress} onChange={(e) => handleInputChange('siteAddress', e.target.value)} className="p-inputtext w-full" placeholder="Enter Site Address" />)}
                        </div>


                    </div>
                </div>
                <hr />
                <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400">
                    <Button
                        label="Update"
                        icon="pi pi-check"
                        className="bg-pink-500 border-pink-500 hover:text-white mb-3"
                        onClick={handleSubmit}
                        disabled={Object.keys(selectedFields).length === 0}
                    />
                </div>
            </div>
        </div>
    );
};

export default GenerateRequestPage;