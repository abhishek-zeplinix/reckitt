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
import { buildQueryParams } from '@/utils/utils';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { ProgressSpinner } from 'primereact/progressspinner';
import { withAuth } from '@/layout/context/authContext';

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
        procurementCategoryId: null
    });

    const [categories, setCategories] = useState<any>([]);
    const [subCategories, setSubCategories] = useState<any>([]);
    const [selectedFields, setSelectedFields] = useState<any>({});
    const [visible, setVisible] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchCategories(), fetchSupplierData()]);
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

    const fetchSupplierData = async (params?: any) => {
        try {

            const supId = get(user, 'supplierId');

            const params = { filters: { supId }, pagination: false };

            const queryString = buildQueryParams(params);
            console.log(params);

            const response = await GetCall(`/company/supplier?${queryString}`);

            if (response.data?.[0]) {
                const data = response.data[0];

                // pre-select category and fetch subcategories if available
                if (data.supplierCategoryId) {
                    await fetchSubCategories(data.supplierCategoryId);
                }

                setFormData({
                    supplierId: data.supId,
                    supplierName: data.supplierName,
                    supplierEmail: data.email || '',
                    supplierContact: data.supplierNumber || '',
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


    const handleSubmit = async (event: { files: File[] }) => {

        // get requested data based on checked fields
        const file = event.files[0];

        if (!file) {
            setAlert('error', 'Please select a file to upload.');
            return;
        }

        const requestedData: any = {
            file,
        };

        Object.keys(selectedFields).forEach((field) => {
            if (selectedFields[field]) {
                // For categories, send the names instead of IDs
                if (field === 'supplierCategoryId') {
                    requestedData['categoryName'] = formData.supplierCategory;
                } else if (field === 'procurementCategoryId') {
                    requestedData['subCategoryName'] = formData.procurementCategory;
                } else {
                    requestedData[field] = formData[field];
                }
            }
        });

        // Object.keys(selectedFields).forEach((field) => {
        //     if (selectedFields[field]) {
        //         // For categories, send the names instead of IDs
        //         if (field === 'supplierCategoryId') {
        //             requestedData['supplierCategoryId'] = formData.supplierCategoryId;
        //         } else if (field === 'procurementCategoryId') {
        //             requestedData['procurementCategoryId'] = formData.procurementCategoryId;
        //         } else {
        //             requestedData[field] = formData[field];
        //         }
        //     }
        // });

        if (Object.keys(requestedData).length === 0) {
            setAlert('info', 'No fields selected for update');
            return;
        }

        try {
            setLoading(true);

            const apiData = new FormData();

            // Append the file separately
            apiData.append('file', file);

            // Append requested fields to FormData
            apiData.append(
                'requestedData',
                JSON.stringify(
                    Object.fromEntries(Object.entries(requestedData).filter(([key]) => key !== 'file'))
                )
            );           

            const supId = get(formData, 'supplierId');

            console.log(requestedData);
            

            const response = await PostCall(`/company/manageRequest/supplier/${supId}`, apiData);

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
                    <Checkbox checked={selectedFields[fieldName] || false} onChange={() => toggleField(fieldName)} />
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

    const dialogHeader = () => {
        return (
            <div className="flex justify-content-between align-items-center w-full">
                <span>Attach valid proof to change information</span>
                <p className="text-sm text-gray-500 mr-4">
                    <p> Supported Formats: <span className='text-red-500'>jpg, png, pdf.</span></p>
                    <p> Max File Size:  <span className='text-red-500'>5 MB</span></p>
                </p>

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
                            {renderField(
                                'supplierName',
                                'Supplier Name',
                                <InputText value={formData.supplierName} onChange={(e) => handleInputChange('supplierName', e.target.value)} className="p-inputtext w-full" placeholder="Enter Supplier Name" />
                            )}

                            {renderField(
                                'supplierEmail',
                                'Supplier Email',
                                <InputText value={formData.supplierEmail} onChange={(e) => handleInputChange('supplierEmail', e.target.value)} className="p-inputtext w-full" placeholder="Enter Supplier Email" />
                            )}

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

                            {renderField(
                                'siteAddress',
                                'Site Address',
                                <InputTextarea value={formData.siteAddress} onChange={(e) => handleInputChange('siteAddress', e.target.value)} className="p-inputtext w-full" placeholder="Enter Site Address" />
                            )}
                        </div>
                    </div>
                </div>
                <hr />
                <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400">
                    <Button label="Update" icon="pi pi-check" className="bg-primary-main border-primary-main hover:text-white mb-3" onClick={() => setVisible(true)} disabled={Object.keys(selectedFields).length === 0} />
                </div>
            </div>

            <Dialog
                header={dialogHeader}
                visible={visible}
                style={{ width: '50vw' }}
                onHide={() => setVisible(false)} // Hide dialog when the close button is clicked
            >
                <div className="card px-3 py-2">
                    {isDetailLoading ? (
                        <div className="flex justify-center mb-3 mt-5">
                            <ProgressSpinner style={{ width: '30px' }} />
                        </div>
                    ) : (
                        <FileUpload
                            name="generate request proof"
                            customUpload multiple={false}
                            accept=".pdf,image/*"
                            maxFileSize={5000000}
                            emptyTemplate={<p className="m-0">Drag and drop file here to upload.</p>}
                            uploadHandler={handleSubmit}
                            uploadLabel="Submit"
                            chooseLabel="Choose File"
                        />
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default withAuth(GenerateRequestPage, undefined, 'generate_request');
