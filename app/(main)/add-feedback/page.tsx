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
import { get } from 'lodash';
import { CustomDataTableRef } from '@/components/CustomDataTable';
import { buildQueryParams } from '@/utils/utils';

const defaultForm: EmptyFeedback = {
    suppliername: '',
    year: null,
    quarter: '',
    info: '',
    file: null
};

const AddFeedBackPages = () => {
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [supplier, setSupplier] = useState<any>([]);
    const { setLoading, setAlert, user } = useAppContext();
    const [form, setForm] = useState<EmptyFeedback>(defaultForm);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const onNewAdd = async (payload: EmptyFeedback | FormData) => {
        setIsDetailLoading(true);

        // Check the type of payload and set the appropriate Content-Type header
        const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' };

        try {
            // Make the API call with the correct headers and payload
            const response: CustomResponse = await PostCall(`/company/feedback-request`, payload, { headers });

            setIsDetailLoading(false);

            if (response.code === 'SUCCESS') {
                // Optionally handle the response data
                setAlert('success', 'Feedback Added Successfully');
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
                updatedForm[name] = val;
            } else {
                updatedForm = { ...updatedForm, ...name };
            }

            console.log(updatedForm, 'Abhishek');
            return updatedForm;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const { file, suppliername, year, quarter, info } = form;

        // Ensure all required fields are filled
        if (!file || !year || !quarter || !info) {
            console.error('Missing required fields or file');
            return;
        }

        // Create FormData
        const formData = new FormData();
        formData.append('file', file); // Add the file
        formData.append('suppliername', get(user, 'name'));
        formData.append('year', year?.toString() || '');
        formData.append('quarter', quarter || '');
        formData.append('info', info || '');

        console.log('Submitting FormData:', Array.from(formData.entries()));

        // Call API with FormData
        onNewAdd(formData); // Call the API
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
            <div className="flex flex-column gap-3 pt-2">
                <h2 className="text-center font-bold ">Generate Feedback</h2>
                <div className="p-fluid grid mx-1 pt-2">
                    <div className="field col-4">
                        <label htmlFor="supplierName" className="font-semibold">
                            Supplier Name
                        </label>
                        {/* <Dropdown
                            id="supplierId"
                            value={form.suppliername}
                            options={supplier}
                            optionLabel="name"
                            optionValue="value"
                            onChange={(e) => onInputChange('suppliername', e.value)}
                            placeholder="Select Supplier Name"
                            className="w-full bg-white"
                        /> */}

                        <InputText
                            type="text"
                            value={get(user, 'name')}
                            disabled
                        />
                    </div>
                    <div className="field col-4">
                        <label htmlFor="suppliername" className="font-semibold">
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
                    <div className="field col-4">
                        <label htmlFor="suppliername" className="font-semibold">
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
                    <div className="field col-4">
                        <label htmlFor="suppliername" className="font-semibold">
                            Browse a file
                        </label>
                        {/* <div className="flex items-center justify-between border-1 border-gray-300 rounded-r-md " style={{ alignItems: 'center', borderRadius: '6px' }}>
                            <label className="flex-grow px-4 w-full  text-gray-500 cursor-pointer">
                                Browse a file
                                <InputText
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                        onInputChange('file', e.target.files);
                                        console.log(e.target.files, 'Abhishek');
                                    }}
                                />
                            </label>
                            <button type="button" className="w-6 cursor-pointer text-black font-medium rounded-r-md border-l border-gray-300  p-inputtext" style={{ background: '#CBD5E1' }}>
                                Choose
                            </button>
                        </div> */}
                        <InputText
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    console.log('File selected:', file);
                                    setForm((prevForm) => ({ ...prevForm, file }));
                                }
                            }}
                        />
                    </div>
                    <div className="field col-4">
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
        <div className="">
            <div className="p-card">
                <div className="p-card-body">{feedbackForm()}</div>
                {/* Footer Buttons */}
                <hr />
                <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400 ">
                    <Button label="Generate request" icon="pi pi-check" className="bg-pink-500 border-pink-500 hover:text-white mb-3" onClick={handleSubmit} />
                </div>
            </div>
        </div>
    );
};

export default AddFeedBackPages;
