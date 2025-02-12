'use client';
import React, { useState } from 'react';
import ApproverTasks from './approver-tasks/approverTasks';
import { Button } from 'primereact/button';
import EvaluatorTasks from './evaluator-tasks/evaluatorTasks';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';

const Tabs = ['Approvers', 'Evaluators'];

const TaskManagement = () => {
    const [activeTab, setActiveTab] = useState('Approvers');
    const [filtersVisible, setfiltersVisible] = useState(false);

    const cities = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Overdue', value: 'overdue' }
    ];
    const dataFilters = () => {
        return (
            <div className={`px-4 py-4  p-m-3 transition-all ${filtersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'} `}>
                <div className="relative border-bottom-1 border-300">
                    <h3>Auto Mapping Configuration Settings</h3>
                    <span onClick={() => setfiltersVisible(false)} className="absolute top-0 right-0 border-0 bg-transparent">
                        <i className="pi pi-times text-sm"></i>
                    </span>
                </div>
                <div className="grid mt-4 gap-4 px-2">
                    <div className="flex flex-column">
                        <label className="mb-1">User Type</label>
                        <Dropdown options={cities} optionLabel="name" showClear placeholder="" className="w-full md:w-15rem" />
                    </div>
                    <div className="flex flex-column">
                        <label className="mb-1">Department</label>
                        <Dropdown options={cities} optionLabel="name" showClear placeholder="" className="w-full md:w-15rem" />
                    </div>
                    <div className="flex flex-column">
                        <label className="mb-1">Country</label>
                        <Dropdown options={cities} optionLabel="name" showClear placeholder="" className="w-full md:w-15rem" />
                    </div>
                    <div className="flex flex-column">
                        <label className="mb-1">State</label>
                        <Dropdown options={cities} optionLabel="name" showClear placeholder="" className="w-full md:w-15rem" />
                    </div>
                    <div className="flex flex-column">
                        <label className="mb-1">City</label>
                        <Dropdown options={cities} optionLabel="name" showClear placeholder="" className="w-full md:w-15rem" />
                    </div>
                    <div className="flex flex-column">
                        <label className="mb-1">ZipCode</label>
                        <InputText id="email" type="text" placeholder="Enter Zip Code" className="w-full md:w-15rem" />
                    </div>
                </div>
                <div className="flex justify-content-end">
                    <Button icon="pi pi-sync" size="small" label="Apply" aria-label="Apply" className="bg-primary-main border-primary-main hover:text-white" style={{ marginLeft: 10 }} onClick={() => {}} />
                </div>
            </div>
        );
    };

    const DataFilters = dataFilters();

    const renderHeader = () => {
        return (
            <>
                <div className="flex justify-content-between">
                    <span className="p-input-icon-left flex align-items-center">
                        <h3 className="mb-0">Task Management</h3>
                    </span>
                    <div className="flex justify-content-between">
                        <div className="flex justify-content-end">
                            {/* <Button icon="pi pi-plus" size="small" label="Add Rules" aria-label="Add Rule" className="bg-primary-main border-primary-main hover:text-white" onClick={handleCreateNavigation} style={{ marginLeft: 10 }} /> */}
                            <Button
                                icon="pi pi-plus"
                                size="small"
                                label="Auto Mapping Configuration"
                                aria-label="Auto Mapping Configuration"
                                className="bg-primary-main border-primary-main hover:text-white"
                                style={{ marginLeft: 10 }}
                                onClick={() => setfiltersVisible(true)}
                            />
                        </div>
                    </div>
                </div>
                <div className={`mt-3 transition-all duration-300 ease-in-out ${filtersVisible ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 invisible'} overflow-hidden shadow-2 surface-card border-round-2xl mr-3 mb-3`}>
                    {DataFilters}
                </div>
            </>
        );
    };

    const header = renderHeader();

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Approvers':
                return <ApproverTasks />;
            case 'Evaluators':
                return <EvaluatorTasks />;
            default:
                return <></>;
        }
    };

    const tabContent = renderTabContent();

    return (
        <div className="grid">
            <div className="col-12">
                <div className="header">{header}</div>

                <div className="card mt-4">
                    <div className="">
                        <div className="flex flex-wrap justify-center sm:justify-start space-x-2 sm:space-x-4">
                            {Tabs?.map((item: any) => (
                                <div
                                    key={item}
                                    className={`px-4 py-2 font-bold transition-all duration-300 cursor-pointer ${activeTab === item ? 'text-primary-main border border-primary-main rounded-lg' : 'text-gray-500 border-none'}`}
                                    style={{
                                        border: activeTab === item ? '1px solid #ec4899' : 'none',
                                        borderRadius: activeTab === item ? '12px' : '0'
                                    }}
                                    onClick={() => setActiveTab(item)}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="">{tabContent}</div>
            </div>
        </div>
    );
};

export default TaskManagement;
