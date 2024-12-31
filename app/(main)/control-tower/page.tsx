'use client';
import React, { useState } from 'react';
import AddRoleControl from '@/components/control-tower/add-role-control';
import DynamicInput from '@/components/control-tower/dynamic-inputs';

const Tabs = ["Location", "Sub Location", "Category", "Sub Category", "Department", "Roles"]

const ControlTower = () => {
    const [activeTab, setActiveTab] = useState("Roles");
  

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <span className="p-input-icon-left flex align-items-center">
                    <h3 className="mb-0">Control Tower</h3>
                </span>
            </div>
        );
    };

    const header = renderHeader();


    const renderTabContent = () => {
        switch (activeTab) {
            case 'Roles':
                return (
                    <AddRoleControl />
                );
            case 'Location':
                return (
                    <DynamicInput />
                );
            default:
                return (
                    <></>
                );
            }
            }

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
                                    className={`px-4 py-2 font-bold transition-all duration-300 cursor-pointer ${activeTab === item
                                        ? 'text-pink-500 border border-pink-500 rounded-lg'
                                        : 'text-gray-500 border-none'
                                        }`}
                                    style={{
                                        border: activeTab === item ? '1px solid #ec4899' : 'none',
                                        borderRadius: activeTab === item ? '12px' : '0',
                                    }}
                                    onClick={() => setActiveTab(item)}
                                >
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card mt-4 p-6">

                            {tabContent}

                </div>

            </div>


        </div>
    );
};

export default ControlTower;