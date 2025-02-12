'use client';
import React, { useState } from 'react';
import ApproverTasks from './approver-tasks/approverTasks';
import { Button } from 'primereact/button';
import EvaluatorTasks from './evaluator-tasks/page';

const Tabs = ['Approvers', 'Evaluators'];

const MasterTowerTwo = () => {
    const [activeTab, setActiveTab] = useState('Approvers');

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <span className="p-input-icon-left flex align-items-center">
                    <h3 className="mb-0">Task Management</h3>
                </span>
                <div className="flex justify-content-between">
                    <div className="flex justify-content-end">
                        {/* <Button icon="pi pi-plus" size="small" label="Add Rules" aria-label="Add Rule" className="bg-primary-main border-primary-main hover:text-white" onClick={handleCreateNavigation} style={{ marginLeft: 10 }} /> */}
                        <Button icon="pi pi-plus" size="small" label="Auto Mapping" aria-label="Auto Mapping" className="bg-primary-main border-primary-main hover:text-white" style={{ marginLeft: 10 }} />
                    </div>
                </div>
            </div>
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

export default MasterTowerTwo;
