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
import { InputTextarea } from 'primereact/inputtextarea';

const defaultForm: EmptyFeedback = {
    suppliername: '',
    year: null,
    quarter: '',
    info: '',
    file: null
};

const AddFeedBackPages = () => {
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    // const [supplier, setSupplier] = useState<any>([]);
    const { setLoading, setAlert, user } = useAppContext();
    const [form, setForm] = useState<EmptyFeedback>(defaultForm);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

    // useEffect(() => {
    //     fetchData();
    // }, []);

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

    // const fetchData = async (params?: any) => {
    //     setLoading(true);
    //     const response: CustomResponse = await GetCall(`/company/supplier`);
    //     setLoading(false);
    //     if (response.code == 'SUCCESS') {
    //         const formattedData = response.data.map((item: any) => ({
    //             name: item.supplierName, // Display in dropdown
    //             value: item.supId // Dropdown value
    //         }));
    //         setSupplier(formattedData);
    //     } else {
    //         setSupplier([]);
    //     }
    // };

    const onInputChange = (name: string | { [key: string]: any }, val?: any) => {
        setForm((Form: any) => {
            let updatedForm = { ...Form };

            if (typeof name === 'string') {
                updatedForm[name] = val;
            } else {
                updatedForm = { ...updatedForm, ...name };
            }
            return updatedForm;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const { file, year, quarter, info } = form;

        // Ensure all required fields are filled
        if (!file || !year || !quarter || !info) {
            setAlert('info', 'Missing required fields or file');
            return;
        }

        // Create FormData
        const formData = new FormData();
        formData.append('file', file); // Add the file
        formData.append('suppliername', get(user, 'name'));
        formData.append('year', year?.toString() || '');
        formData.append('quarter', quarter || '');
        formData.append('info', info || '');
        onNewAdd(formData); // Call the API
    };

    const currentYear = new Date().getFullYear();

    const years = Array.from({ length: 16 }, (_, index) => ({
        name: (currentYear - index).toString(), // Label for the dropdown
        locationId: currentYear - index // Value for the dropdown
    }));

    const handleSupplierChange = (e: { value: any }) => {
        setSelectedSupplier(e.value);
    };

    const quarterOptions = [
        { label: `Q1 ${form?.year}`, value: `Q1 ${form?.year}` },
        { label: `Q2/H1 ${form?.year}`, value: `Q2/H1 ${form?.year}` },
        { label: `Q3 ${form?.year}`, value: `Q3 ${form?.year}` },
        { label: `Q4/H2 ${form?.year}`, value: `Q4/H2 ${form?.year}` }
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

                        <InputText type="text" value={get(user, 'name')} disabled />
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
                            Period
                        </label>

                        <Dropdown
                            id="quarter"
                            value={form.quarter}
                            options={quarterOptions}
                            optionLabel="label"
                            optionValue="value"
                            onChange={(e) => onInputChange('quarter', e.value)}
                            placeholder="Select Period"
                            className="w-full"
                            disabled={form?.year == null}
                        />
                    </div>
                    <div className="field col-4">
                        <label htmlFor="suppliername" className="font-semibold">
                            Browse a file <i className="text-sm">(only pdf`s and image supported)</i>
                        </label>

                        <InputText
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setForm((prevForm) => ({ ...prevForm, file }));
                                }
                            }}
                        />
                    </div>
                    <div className="field col-4">
                        <label htmlFor="info" className="font-semibold">
                            More Info
                        </label>
                        <InputTextarea id="info" value={get(form, 'info')} onChange={(e) => onInputChange('info', e.target.value)} className="p-inputtext w-full mt-1" placeholder="Enter Info" />
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
                    <Button label="Generate request" icon="pi pi-check" className="bg-primary-main border-primary-main hover:text-white mb-3" onClick={handleSubmit} />
                </div>
            </div>
        </div>
    );
};

export default AddFeedBackPages;
