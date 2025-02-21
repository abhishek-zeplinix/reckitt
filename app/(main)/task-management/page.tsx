'use client';
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import Tasks from '@/components/task-management/Tasks';
import AutoMapping from '@/components/task-management/AutoMapping';
import { withAuth } from '@/layout/context/authContext';

const TaskManagement = () => {
    const [activeTab, setActiveTab] = useState<'Approver' | 'Evaluator'>('Approver');
    const [filtersVisible, setFiltersVisible] = useState(false);


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

            <AutoMapping filtersVisible={filtersVisible} setFiltersVisible={setFiltersVisible}/>
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

export default withAuth(TaskManagement, 'superAdmin', undefined);