'use client';
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { SplitButton } from 'primereact/splitbutton';

const Tabs = ["Location", "Sub Location", "Category", "Sub Category", "Department"]

const ControlTower = () => {
    const [activeTab, setActiveTab] = useState("Location");
    const [inputs, setInputs] = useState([
        { id: 1, value: '' }
    ]);

    const handleInputChange = (index: any, value: any) => {
        const newInputs = [...inputs];
        newInputs[index].value = value;
        setInputs(newInputs);
    };

    const addNewField = () => {
        setInputs([
            ...inputs,
            { id: inputs.length + 1, value: '' }
        ]);
    };

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

    return (
        <div className="grid">
            <div className="col-12">
                <div className="header">{header}</div>

                <div className="card mt-4">
                    <div className="p-1">
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

                    <div className="max-w-[1200px] mx-auto">

                        <div className="grid">

                            <div className="col-12">

                                <div className="grid">
                                    {inputs.map((input, index) => (
                                        <div key={input.id} className="col-12 md:col-6 lg:col-6">
                                            <div className="p-2">
                                                <label className="block text-sm font-medium mb-2">
                                                    Field {input.id}
                                                </label>
                                                <span className="p-input-icon-right w-full">
                                                    <InputText
                                                        value={input.value}
                                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                                        placeholder="Input"
                                                        className="w-full"
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Button label="Add More Field" icon="pi pi-plus" onClick={addNewField} outlined size='small' className="custom-add-field-button"
                            text />


                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlTower;