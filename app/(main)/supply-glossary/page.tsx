/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useAppContext } from '@/layout/AppWrapper';
import { CustomResponse } from '@/types';
import { GetCall, PostCall } from '@/app/api-config/ApiKit';
import { Dialog } from 'primereact/dialog';
interface Glossary {
    id: number;
    name: string;
    description: string;
}
const SupplyGlossaryPage = () => {
    const router = useRouter();
    const { user, setLoading, isLoading, setAlert } = useAppContext();
    const [glossaryData, setGlossaryData] = useState<Glossary[]>([]);
    const [visible, setVisible] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [supplyGlossaryQuestion, setSupplyGlossaryQuestion] = useState('');
    const [supplyGlossaryAnswer, setSupplyGlossaryAnswer] = useState('');
    useEffect(() => {
        fetchGlossary();
    }, []);
    const fetchGlossary = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/supplyglossaries`);
        console.log(response, 'abhishek');
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setGlossaryData(response.data);
            console.log(response.data, 'abhishek');
        } else {
            setGlossaryData([]);
        }
    };

    const handleSubmit = async () => {
        if (!supplyGlossaryQuestion || !supplyGlossaryAnswer) {
            setAlert('Error', 'Please fill all required feilds');
            return;
        }

        setIsDetailLoading(true);

        const payload = {
            name: supplyGlossaryQuestion,
            description: supplyGlossaryAnswer
        };

        try {
            setIsDetailLoading(true);
            const response: CustomResponse = await PostCall(`/company/supplyglossaries`, payload);
            setIsDetailLoading(false);
            if (response.code == 'SUCCESS') {
                // setSelectedCompany(response.data)
                setAlert('success', 'Supplier Glossary Added Successfully');
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            console.error('Error submitting Supplier Glossary:', error);
            setAlert('error', 'An error occurred while submitting Supplier Glossary.');
        } finally {
            setLoading(false);
        }
    };
    const popupFooter = () => {
        return <Button label="Submit" icon="pi pi-check" className="bg-pink-500 border-pink-500 hover:bg-pink-400 my-2" onClick={handleSubmit} />;
    };
    return (
        <div className="grid">
            <div className="col-12">
                <div className="p-card">
                    <div className="p-card-header flex justify-content-between items-center pt-5 px-4">
                        <div>
                            <h1 className="mb-1 font-semibold">Supply glossary of categories</h1>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos, quo!</p>
                        </div>
                        <div>
                            <Button icon="pi pi-plus" size="small" label="Add Supplier Glossary" aria-label="Add Supplier Glossary" className="bg-pink-500 border-pink-500 " onClick={() => setVisible(true)} style={{ marginLeft: 10 }} />
                        </div>
                        <Dialog
                            header="Add Supplier Glossary Categories"
                            visible={visible}
                            style={{ width: '50vw' }}
                            onHide={() => {
                                if (!visible) return;
                                setVisible(false);
                            }}
                            footer={popupFooter}
                        >
                            <div className="m-0">
                                <div className="field ">
                                    <label htmlFor="supplyGlossaryQuestion">Enter Supplier Glossary Question</label>
                                    <input
                                        id="supplyGlossaryQuestion"
                                        type="text"
                                        value={supplyGlossaryQuestion}
                                        onChange={(e) => setSupplyGlossaryQuestion(e.target.value)}
                                        className="p-inputtext w-full"
                                        placeholder="Enter Supplier Glossary Question"
                                    />
                                </div>
                                <div className="field ">
                                    <label htmlFor="faqAnswer">Enter Supplier Glossary Answer</label>
                                    <input id="faqAnswer" type="text" value={supplyGlossaryAnswer} onChange={(e) => setSupplyGlossaryAnswer(e.target.value)} className="p-inputtext w-full" placeholder="Enter Supplier Glossary Answer" />
                                </div>
                            </div>
                        </Dialog>
                    </div>
                    <div className="p-card-body" style={{ height: '68vh' }}>
                        <div>
                            {isLoading ? (
                                <p>Loading FAQs...</p>
                            ) : glossaryData.length > 0 ? (
                                <Accordion>
                                    {glossaryData.map((glossary) => (
                                        <AccordionTab key={glossary.id} header={glossary.name}>
                                            <p>{glossary.description}</p>
                                        </AccordionTab>
                                    ))}
                                </Accordion>
                            ) : (
                                <p>No FAQs available at the moment.</p>
                            )}
                        </div>
                    </div>
                    {/* Footer Buttons */}
                    <hr />
                    <div className="p-card-footer flex justify-content-end px-4 gap-3 py-3 bg-slate-300 shadow-slate-400 "></div>
                </div>
            </div>
        </div>
    );
};

export default SupplyGlossaryPage;
