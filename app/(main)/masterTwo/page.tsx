'use client';
import React, { useState } from 'react';
import AddAssesorType from '@/components/market-master/assesorType';
import AddAssesorRole from '@/components/market-master/assesorRole';
import AddPosition from '@/components/market-master/position';
import AddReviewType from '@/components/market-master/reviewType';
import AddTemplateType from '@/components/market-master/templateType';
import AddWhitelistedDomain from '@/components/market-master/whitelistedDomain';

const Tabs = ['Assesor Type', 'Assesor Role', 'Position', 'Review Type', 'Template Type', 'Whitelisted Domain'];

const MasterTowerTwo = () => {
    const [activeTab, setActiveTab] = useState('Assesor Type');

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <span className="p-input-icon-left flex align-items-center">
                    <h3 className="mb-0">Other Master</h3>
                </span>
            </div>
        );
    };

    const header = renderHeader();

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Assesor Type':
                return <AddAssesorType />;
            case 'Assesor Role':
                return <AddAssesorRole />;
            case 'Position':
                return <AddPosition />;
            case 'Review Type':
                return <AddReviewType />;
            case 'Template Type':
                return <AddTemplateType />;
            case 'Whitelisted Domain':
                return <AddWhitelistedDomain />;
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

                <div className="card mt-4 px-5">{tabContent}</div>
            </div>
        </div>
    );
};

export default MasterTowerTwo;
