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
interface FAQ {
    id: number;
    question: string;
    answer: string;
}

const FaqPage = () => {
    const router = useRouter();
    const { user, isLoading, setLoading, setScroll, setAlert } = useAppContext();
    const [faqData, setFaqData] = useState<FAQ[]>([]);
    const [visible, setVisible] = useState(false);
    const [faqQuestion, setFaqQuestion] = useState('');
    const [faqAnswer, setFaqAnswer] = useState('');
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    useEffect(() => {
        fetchFaq();
    }, []);
    const fetchFaq = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/faq`);
        console.log(response, 'abhishek');
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setFaqData(response.data);
            console.log(response.data, 'abhishek');
        } else {
            setFaqData([]);
        }
    };

    const handleSubmit = async () => {
        if (!faqQuestion || !faqAnswer) {
            setAlert('Error', 'Please fill all required feilds');
            return;
        }

        setIsDetailLoading(true);

        const payload = {
            question: faqQuestion,
            answer: faqAnswer
        };

        try {
            setIsDetailLoading(true);
            const response: CustomResponse = await PostCall(`/company/faq`, payload);
            setIsDetailLoading(false);
            if (response.code == 'SUCCESS') {
                // setSelectedCompany(response.data)
                setAlert('success', 'Faq Added Successfully');
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            console.error('Error submitting Faq data:', error);
            setAlert('error', 'An error occurred while submitting Faq data.');
        } finally {
            setLoading(false);
        }
    };

    const popupFooter = () => {
        return <Button label="Submit" icon="pi pi-check" className="bg-pink-500 border-pink-500 hover:bg-pink-400 my-2" onClick={handleSubmit} />;
    };

    return (
        <>
            <div className="grid p-4 ">
                <div className="col-12">
                    <div className="p-card">
                        <div className="p-card-header flex justify-content-between items-center pt-5 px-4">
                            <div>
                                <h1 className="mb-1 font-semibold">Frequently Asked Question ?</h1>
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos, quo!</p>
                            </div>
                            <div>
                                <Button icon="pi pi-plus" size="small" label="Add Faq" aria-label="Add Faq" className="bg-pink-500 border-pink-500 " onClick={() => setVisible(true)} style={{ marginLeft: 10 }} />
                            </div>
                        </div>
                        <Dialog
                            header="Add New FAQ"
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
                                    <label htmlFor="faqQuestion">Enter Faq Question</label>
                                    <input id="faqQuestion" type="text" value={faqQuestion} onChange={(e) => setFaqQuestion(e.target.value)} className="p-inputtext w-full" placeholder="Enter Faq Question" />
                                </div>
                                <div className="field ">
                                    <label htmlFor="faqAnswer">Enter Faq Answer</label>
                                    <input id="faqAnswer" type="text" value={faqAnswer} onChange={(e) => setFaqAnswer(e.target.value)} className="p-inputtext w-full" placeholder="Enter Faq Answer" />
                                </div>
                            </div>
                        </Dialog>
                        <div className="p-card-body" style={{ height: '68vh' }}>
                            <div>
                                {isLoading ? (
                                    <p>Loading FAQs...</p>
                                ) : faqData.length > 0 ? (
                                    <Accordion>
                                        {faqData.map((faq) => (
                                            <AccordionTab key={faq.id} header={faq.question}>
                                                <p>{faq.answer}</p>
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
        </>
    );
};

export default FaqPage;
