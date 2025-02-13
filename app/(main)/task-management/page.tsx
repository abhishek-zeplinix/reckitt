'use client';
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import Tasks from '@/components/task-management/Tasks';

const TaskManagement = () => {
    const [activeTab, setActiveTab] = useState<'Approver' | 'Evaluator'>('Approver');
    const [filtersVisible, setFiltersVisible] = useState(false);

    const cities = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Overdue', value: 'overdue' }
    ];

    const renderHeader = () => (
        <>
            <div className="flex justify-content-between">
                <span className="p-input-icon-left flex align-items-center">
                    <h3 className="mb-0">Task Management</h3>
                </span>
                <div className="flex justify-content-end">
                    <Button
                        icon="pi pi-plus"
                        size="small"
                        label="Auto Mapping Configuration"
                        className="bg-primary-main border-primary-main hover:text-white"
                        onClick={() => setFiltersVisible(true)}
                    />
                </div>
            </div>
            {filtersVisible && (
                <div className="mt-3 shadow-2 surface-card border-round-2xl mr-3 mb-3">
                    <div className="px-4 py-4">
                        <div className="relative border-bottom-1 border-300">
                            <h3>Auto Mapping Configuration Settings</h3>
                            <span 
                                onClick={() => setFiltersVisible(false)} 
                                className="absolute top-0 right-0 cursor-pointer"
                            >
                                <i className="pi pi-times text-sm"></i>
                            </span>
                        </div>
                        <div className="grid mt-4 gap-4 px-2">
                            {['User Type', 'Department', 'Country', 'State', 'City'].map((label) => (
                                <div key={label} className="flex flex-column">
                                    <label className="mb-1">{label}</label>
                                    <Dropdown 
                                        options={cities} 
                                        optionLabel="name" 
                                        showClear 
                                        placeholder="" 
                                        className="w-full md:w-15rem" 
                                    />
                                </div>
                            ))}
                            <div className="flex flex-column">
                                <label className="mb-1">ZipCode</label>
                                <InputText 
                                    type="text" 
                                    placeholder="Enter Zip Code" 
                                    className="w-full md:w-15rem" 
                                />
                            </div>
                        </div>
                        <div className="flex justify-content-end">
                            <Button 
                                icon="pi pi-sync" 
                                size="small" 
                                label="Apply" 
                                className="bg-primary-main border-primary-main hover:text-white" 
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <div className="header">{renderHeader()}</div>

                <div className="card mt-4">
                    <div className="flex flex-wrap justify-center sm:justify-start space-x-4">
                        {['Approver', 'Evaluator'].map((tab) => (
                            <div
                                key={tab}
                                className={`px-4 py-2 font-bold cursor-pointer transition-all duration-300 ${
                                    activeTab === tab 
                                        ? 'text-primary-main border border-primary-main rounded-lg' 
                                        : 'text-gray-500'
                                }`}
                                style={{
                                    border: activeTab === tab ? '1px solid #ec4899' : 'none',
                                    borderRadius: activeTab === tab ? '12px' : '0'
                                }}
                                onClick={() => setActiveTab(tab as 'Approver' | 'Evaluator')}
                            >
                                {tab}s
                            </div>
                        ))}
                    </div>
                </div>

                <Tasks role={activeTab} />
            </div>
        </div>
    );
};

export default TaskManagement;