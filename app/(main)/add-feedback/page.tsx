/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import Stepper from '@/components/Stepper';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { CustomResponse, Supplier } from '@/types';
import { GetCall, PostCall } from '@/app/api-config/ApiKit';
import { EmptyFeedback } from '@/types/forms';
import { filter, find, get, groupBy, keyBy, map, uniq } from 'lodash';
import { CustomDataTableRef } from '@/components/CustomDataTable';
import { buildQueryParams } from '@/utils/uitl';

const defaultForm: EmptyFeedback = {
    supplierName: '',
    year: null,
    quarter: '',
    info: '',
    filePath: ''
};

const AddFeedBackPages = () => {
    const totalSteps = 3;
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<boolean[]>(Array(totalSteps).fill(false));
    // Form fields state
    const router = useRouter();
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [supplier, setSupplier] = useState<any>([]);
    const [locationDetails, setLocationDetails] = useState<any>([]);
    const { user, isLoading, setLoading, setScroll, setAlert } = useAppContext();
    const [selectedCompany, setSelectedCompany] = useState<Supplier | null>(null);
    const [form, setForm] = useState<EmptyFeedback>(defaultForm);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const onNewAdd = async (companyForm: EmptyFeedback) => {
        const formData = new FormData();

        // Append all fields from the form, including the file
        const isFile = (value: unknown): value is File => value instanceof File;

        Object.keys(companyForm).forEach((key) => {
            const value = companyForm[key as keyof EmptyFeedback];
            if (value) {
                if (key === 'filePath' && isFile(value)) {
                    formData.append(key, value);
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        setIsDetailLoading(true);

        try {
            const response: CustomResponse = await PostCall(`/company/feedback-request`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setIsDetailLoading(false);

            if (response.code === 'SUCCESS') {
                setAlert('success', 'Feedback Generated Successfully');
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            setIsDetailLoading(false);
            setAlert('error', 'An error occurred while submitting the feedback.');
        }
    };

    const fetchData = async (params?: any) => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/supplier`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            const formattedData = response.data.map((item: any) => ({
                name: item.supplierName, // Display in dropdown
                value: item.supId // Dropdown value
            }));
            setSupplier(formattedData);
        } else {
            setSupplier([]);
        }
    };

    const onInputChange = (name: string | { [key: string]: any }, val?: any) => {
        setForm((Form: any) => {
            let updatedForm = { ...Form };

            if (typeof name === 'string') {
                if (name === 'filePath' && val instanceof FileList) {
                    // Store the first file from the FileList
                    updatedForm[name] = val[0];
                } else {
                    updatedForm[name] = val;
                }
            } else {
                updatedForm = { ...updatedForm, ...name };
            }

            return updatedForm;
        });
    };

    const handleSubmit = () => {
        onNewAdd(form);
    };

    const currentYear = new Date().getFullYear();

    const years = Array.from({ length: 16 }, (_, index) => ({
        name: (currentYear - index).toString(), // Label for the dropdown
        locationId: currentYear - index // Value for the dropdown
    }));

    const handleSupplierChange = (e: { value: any }) => {
        setSelectedSupplier(e.value);
        console.log('Selected Supplier ID:', e.value);
    };

    const quarterOptions = [
        { label: 'Q1 2024', value: 'Q1 2024' },
        { label: 'Q2/H1 2024', value: 'Q2/H1 2024' },
        { label: 'Q3 2024', value: 'Q3 2024' },
        { label: 'Q4/H2 2024', value: 'Q4/H2 2024' }
    ];

    const feedbackForm = () => {
        return (
            <div className="flex flex-column gap-3 pt-5">
                <h2 className="text-center font-bold ">Generate Feedback</h2>
                <div className="p-fluid grid md:mx-7 pt-5">
                    <div className="field col-6">
                        <label htmlFor="supplierName" className="font-semibold">
                            Supplier ID
                        </label>
                        <Dropdown
                            id="supplierId"
                            value={form.supplierName}
                            options={supplier}
                            optionLabel="name"
                            optionValue="value"
                            onChange={(e) => onInputChange('supplierName', e.value)}
                            placeholder="Select Supplier Name"
                            className="w-full bg-white"
                        />
                    </div>
                    <div className="field col-6">
                        <label htmlFor="supplierName" className="font-semibold">
                            Year
                        </label>
                        <Dropdown
                            id="year"
                            value={form.year}
                            options={Array.from({ length: 16 }, (_, index) => ({
                                name: (new Date().getFullYear() - index).toString(),
                                value: new Date().getFullYear() - index
                            }))}
                            optionLabel="name"
                            optionValue="value"
                            onChange={(e) => onInputChange('year', e.value)}
                            placeholder="Select Year"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-6">
                        <label htmlFor="supplierName" className="font-semibold">
                            Quarter
                        </label>

                        <Dropdown
                            id="quarter"
                            value={form.quarter} // Ensure form has a 'quarter' property
                            options={quarterOptions}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => onInputChange('quarter', e.value)}
                            placeholder="Select Quarter"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-6">
                        <label htmlFor="supplierName" className="font-semibold">
                            Supplier Name
                        </label>
                        <div className="flex items-center justify-between border-1 border-gray-300 rounded-r-md " style={{ alignItems: 'center', borderRadius: '6px' }}>
                            <label className="flex-grow px-4 w-full  text-gray-500 cursor-pointer">
                                Browse a file
                                <input type="file" className="hidden" onChange={(e) => onInputChange('filePath', e.target.files)} />
                            </label>
                            <button type="button" className="w-6 cursor-pointer text-black font-medium rounded-r-md border-l border-gray-300  p-inputtext" style={{ background: '#CBD5E1' }}>
                                Choose
                            </button>
                        </div>
                    </div>
                    <div className="field col-6">
                        <label htmlFor="info" className="font-semibold">
                            More Info
                        </label>
                        <InputText id="info" type="text" value={get(form, 'info')} onChange={(e) => onInputChange('info', e.target.value)} className="p-inputtext w-full mt-1" placeholder="Enter Info" />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="md:p-4 md:mx-5 md:my-5">
            <div className="p-card">
                <div className="p-card-body" style={{ height: '68vh' }}>
                    {feedbackForm()}
                </div>
                {/* Footer Buttons */}
                <hr />
                <div className="p-card-footer flex justify-content-end px-4 gap-3 py-3 bg-slate-300 shadow-slate-400 ">
                    <Button label="Generate request" icon="pi pi-check" className="bg-pink-500 border-pink-500 hover:bg-pink-400" onClick={handleSubmit} />
                </div>
            </div>
        </div>
    );
};

export default AddFeedBackPages;
