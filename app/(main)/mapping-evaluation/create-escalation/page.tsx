'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
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
import { Calendar } from 'primereact/calendar';
import { Tooltip } from 'primereact/tooltip';
import { Margin } from '@mui/icons-material';
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
    // const totalSteps = 2;
    const infoRef = useRef(null);
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
    const [reminders, setReminders] = useState([{ id: 1, name: "Reminder 1" }]);
    const [remindersSuperior, setRemindersSuperior] = useState([{ id: 1, name: "Reminder 1" }]);
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
    setLoading(false)
    const handleSubmit = async () => {
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
    
    const addReminder = () => {
        const newId = reminders.length + 1;
        setReminders([...reminders, { id: newId, name: `Reminder ${newId}` }]);
    };

    const removeReminder = (id: number) => {
        const updatedReminders = reminders.filter((reminder) => reminder.id !== id);
        const reindexedReminders = updatedReminders.map((reminder, index) => ({
            id: index + 1,
            name: `Reminder ${index + 1}`
        }));
        setReminders(reindexedReminders);
    };
    const addReminderSuperior = () => {
        const newId = remindersSuperior.length + 1;
        setRemindersSuperior([...remindersSuperior, { id: newId, name: `Reminder ${newId}` }]);
    };

    const removeReminderSuperior = (id: number) => {
        const updatedReminders = remindersSuperior.filter((reminder) => reminder.id !== id);
        const reindexedReminders = updatedReminders.map((reminder, index) => ({
            id: index + 1,
            name: `Reminder ${index + 1}`
        }));
        setRemindersSuperior(reindexedReminders);
    };      
    const renderStepContent = () => {
                return (
                    <div>
                        <div className="flex flex-column gap-2 pt-2">
                        <h3 className="font-bold text-lg col-12">Escalation Mapping With Timeline</h3>
                            {/* <h2 className="text-center font-bold ">Escalation Mapping With Timeline</h2> */}
                            <div className="p-fluid grid mx-1 pt-2">
                            <div className="field col-3">
                               <label htmlFor="evaluationName" className="font-semibold">
                               Evaluation Name
                                    </label>
                                    <InputText id="evaluationName" value={get(form, 'evaluationName')} type="evaluationName" onChange={(e) => onInputChange('evaluationName', e.target.value)} placeholder="Enter Evaluation Name " className="p-inputtext w-full mb-1" />
                                    {formErrors.evaluationName && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.evaluationName}</p>}
                                    {alphabetErrors.evaluationName && <p style={{ color: 'red', fontSize: '10px' }}>{alphabetErrors.evaluationName}</p>}
                                    </div>
                            <div className="field col-3">
                                    <label htmlFor="evaluationType" className="font-semibold">
                                    Evaluation Type 
                                    </label>
                                    <Dropdown
                                        id="evaluationType"
                                        value={get(form, 'evaluationTypeId')}
                                        options={vendors}
                                        optionLabel="evaluationType"
                                        optionValue="evaluationTypeId"
                                        onChange={(e) => onInputChange('evaluationTypeId', e.value)}
                                        placeholder="Select Evaluation Type"
                                        className="w-full mb-1"
                                        showClear={!!get(form, 'evaluationTypeId')}
                                    />
                                    {formErrors.evaluationTypeId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.evaluationTypeId}</p>}
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="reportingMonth" className="font-semibold">Reporting Month</label>
                                    <Calendar
                                        id="reportingMonth"
                                        value={get(form, 'reportingMonth')}
                                        onChange={(e) => onInputChange('reportingMonth', e.target.value ? e.target.value.toISOString() : '')}
                                        dateFormat="dd-mm-yy"
                                        placeholder="Select a date"
                                        showIcon
                                        style={{ borderRadius: '5px', borderColor: 'black' }}
                                    />
                                    {formErrors.reportingMonth && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.reportingMonth}</p>}
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="templateTypeId" className="font-semibold">
                                    Templates Account
                                    </label>
                                    <Dropdown
                                        id="templateTypeId"
                                        value={get(form, 'templateTypeId')}
                                        options={templateType}
                                        optionLabel="templateTypeName"
                                        optionValue="templateTypeId"
                                        onChange={(e) => onInputChange('templateTypeId', e.value)}
                                        placeholder="Select Templates Account"
                                        className="w-full mb-1"
                                        showClear={!!get(form, 'templateTypeId')}
                                    />
                                    {formErrors.templateTypeId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.templateTypeId}</p>}
                                </div>

                                <div className="field col-3">
                                    <label htmlFor="userGroupId" className="font-semibold">
                                    Assessor Group 
                                    </label>
                                    <Dropdown
                                        id="userGroupId"
                                        value={get(form, 'userGroupId')}
                                        options={userGroup}
                                        optionLabel="userGroupName"
                                        optionValue="userGroupId"
                                        onChange={(e) => onInputChange('userGroupId', e.value)}
                                        placeholder="Select Assessor Group "
                                        className="w-full mb-1"
                                        showClear={!!get(form, 'userGroupId')}
                                    />
                                    {formErrors.userGroupId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.userGroupId}</p>}
                                </div>
                                <hr className="my-4 border-t-2 border-gray-300 w-full" />
                                {/* New Section Header */}
                                <h3 className="font-bold text-lg col-12">Project Timelines</h3>
                                <div className="field col-3">
                                    <label htmlFor="reportingMonth" className="font-semibold">Escalation initiation Email
                                    <i className="pi pi-info-circle text-red-500 hover:text-red cursor-pointer ml-2 text-s"
                                    // data-pr-tooltip="Specify how many days before the submission deadline to send the first reminder."
                                    data-pr-position="top"
                                    id={`tooltipEscalation`} // Unique ID for each tooltip
                                    />
                                    </label>
                                    <Tooltip
                                        target={`#tooltipEscalation`} // Attach tooltip to the specific icon
                                        content="When Initialize(Escalation initiation Email)"
                                        pt={{ text: { style: { fontSize: '12px', padding: '4px 6px'} } }} // Set small font size
                                    />
                                    <Calendar
                                        id="reportingMonth"
                                        value={get(form, 'reportingMonth')}
                                        onChange={(e) => onInputChange('reportingMonth', e.target.value ? e.target.value.toISOString() : '')}
                                        dateFormat="dd-mm-yy"
                                        placeholder="Select a date"
                                        showIcon
                                        style={{ borderRadius: '5px', borderColor: 'black' }}
                                    />
                                    {formErrors.reportingMonth && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.reportingMonth}</p>}
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="reportingMonth" className="font-semibold">When Finish</label>
                                    <Calendar
                                        id="reportingMonth"
                                        value={get(form, 'reportingMonth')}
                                        onChange={(e) => onInputChange('reportingMonth', e.target.value ? e.target.value.toISOString() : '')}
                                        dateFormat="dd-mm-yy"
                                        placeholder="Select a date"
                                        showIcon
                                        style={{ borderRadius: '5px', borderColor: 'black' }}
                                    />
                                    {formErrors.reportingMonth && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.reportingMonth}</p>}
                                </div>
                                <hr className="my-4 border-t-2 border-gray-300 w-full" />
                                {/* New Section Header */}
                                <h3 className="font-bold text-lg col-12">Reminders</h3>

                                <div className="field col-3">
                                    <label htmlFor="masterCountryId" className="font-semibold">
                                    1. Before Completions
                                    <i className="pi pi-info-circle text-red-500 hover:text-red cursor-pointer ml-2 text-s"
                                    // data-pr-tooltip="Specify how many days before the submission deadline to send the first reminder."
                                    data-pr-position="top"
                                    id={`tooltipBefore`} // Unique ID for each tooltip
                                    />
                                    </label>
                                    <Tooltip
                                        target={`#tooltipBefore`} // Attach tooltip to the specific icon
                                        content="1. Before Completions (In Days) Type"
                                        pt={{ text: { style: { fontSize: '12px', padding: '4px 6px'} } }} // Set small font size
                                    />
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
                                {reminders.map((reminder) => (
                <div className="flex items-center gap-2 field col-3" key={reminder.id}>
                    <div className="w-full">
                        <label htmlFor={reminder.name} className="font-semibold">
                            {reminder.name}
                        </label>
                        <i className="pi pi-info-circle text-red-500 hover:text-red cursor-pointer ml-2 text-s"
                                    // data-pr-tooltip="Specify how many days before the submission deadline to send the first reminder."
                                    data-pr-position="top"
                                    id={`tooltip-${reminder.id}`} // Unique ID for each tooltip
                                    />
                        <Tooltip
                            target={`#tooltip-${reminder.id}`} // Attach tooltip to the specific icon
                            content="Specify how many days before the submission deadline to send the first reminder."
                            pt={{ text: { style: { fontSize: '12px', padding: '4px 6px'} } }} // Set small font size
                        />
                        <InputText
                            id={reminder.name}
                            value={''}
                            type="text"
                            onChange={(e) => onInputChange(reminder.name, e.target.value)}
                            placeholder={`Enter ${reminder.name}`}
                            className="p-inputtext w-full mb-1 mt-2"
                        />
                        {formErrors[reminder.name] && <p className="text-red-500 text-xs">{formErrors[reminder.name]}</p>}
                        {alphabetErrors[reminder.name] && <p className="text-red-500 text-xs">{alphabetErrors[reminder.name]}</p>}
                    </div>
                    <Button
                        icon="pi pi-trash"
                        className="p-button-danger p-button-rounded p-button-sm mt-4"
                        onClick={() => removeReminder(reminder.id)}
                        disabled={reminders.length === 1} // Disable removal if only 1 reminder exists
                    />
                </div>
            ))}
            <div className="field col-4 mt-4">
             <Button icon="pi pi-plus" className="bg-red-600 p-button-rounded p-button-sm mt-2 " onClick={addReminder} />
             </div>
             {reminders.length === 2 && <div className="field col-6 "></div>}
             {reminders.length === 3 && <div className="field col-6 "></div>}
             {reminders.length === 4 && <div className="field col-3 "></div>}

             <div className="field col-3">
                                    <label htmlFor="masterCountryId" className="font-semibold">
                                    2.For Superior
                                    <i className="pi pi-info-circle text-red-500 hover:text-red cursor-pointer ml-2 text-s"
                                    // data-pr-tooltip="Specify how many days before the submission deadline to send the first reminder."
                                    data-pr-position="top"
                                    id={`tooltipSuperior`} // Unique ID for each tooltip
                                    />
                                    </label>
                                    <Tooltip
                                        target={`#tooltipSuperior`} // Attach tooltip to the specific icon
                                        content="2. For Superior (In Hours) Type"
                                        pt={{ text: { style: { fontSize: '12px', padding: '4px 6px'} } }} // Set small font size
                                    />
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
                                {remindersSuperior.map((reminder) => (
                <div className="flex items-center gap-2 field col-3" key={reminder.id}>
                    <div className="w-full">
                        <label htmlFor={reminder.name} className="font-semibold">
                            {reminder.name}
                        </label>
                        <i className="pi pi-info-circle text-red-500 hover:text-red cursor-pointer ml-2 text-s"
                                    // data-pr-tooltip="Specify how many days before the submission deadline to send the first reminder."
                                    data-pr-position="top"
                                    id={`tooltip-Superior`} // Unique ID for each tooltip
                                    />
                        <Tooltip
                            target={`#tooltip-Superior`} // Attach tooltip to the specific icon
                            content="Specify how many hrs before the submission deadline to send the second reminder."
                            pt={{ text: { style: { fontSize: '12px', padding: '4px 6px'} } }} // Set small font size
                        />
                        <InputText
                            id={reminder.name}
                            value={''}
                            type="text"
                            onChange={(e) => onInputChange(reminder.name, e.target.value)}
                            placeholder={`Enter ${reminder.name}`}
                            className="p-inputtext w-full mb-1 mt-2"
                        />
                        {formErrors[reminder.name] && <p className="text-red-500 text-xs">{formErrors[reminder.name]}</p>}
                        {alphabetErrors[reminder.name] && <p className="text-red-500 text-xs">{alphabetErrors[reminder.name]}</p>}
                    </div>
                    <Button
                        icon="pi pi-trash"
                        className="p-button-danger p-button-rounded p-button-sm mt-4"
                        onClick={() => removeReminderSuperior(reminder.id)}
                        disabled={remindersSuperior.length === 1} // Disable removal if only 1 reminder exists
                    />
                </div>
            ))}
            <div className="field col-4 mt-4">
             <Button icon="pi pi-plus" className="bg-red-600 p-button-rounded p-button-sm mt-2" onClick={addReminderSuperior} />
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
                            <Button label='Submit Mapping With Timelines' icon="pi pi-check" className="bg-primary-main border-primary-main hover:text-white mb-3" onClick={handleSubmit} />
                </div>
            </div>
        </div>
    );
};

export default ManageSupplierAddEditPage;
