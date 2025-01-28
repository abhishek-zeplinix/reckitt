/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useContext, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useAppContext } from '@/layout/AppWrapper';
import { CustomResponse } from '@/types';
import { GetCall, PostCall, PutCall, DeleteCall } from '@/app/api-config/ApiKit';
import { Dialog } from 'primereact/dialog';
import 'primeicons/primeicons.css';
import { ProgressSpinner } from 'primereact/progressspinner';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { useAuth } from '@/layout/context/authContext';

interface FAQ {
    id: number;
    question: string;
    answer: string;
}

const FaqPage = () => {
    const { isLoading, setLoading, setAlert } = useAppContext();
    const { layoutState } = useContext(LayoutContext);
    const { isSuperAdmin } = useAuth();
    const [faqData, setFaqData] = useState<FAQ[]>([]);
    const [visible, setVisible] = useState(false);
    const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
    const [formData, setFormData] = useState({
        question: '',
        answer: ''
    });
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
    const [selectedFaqToDelete, setSelectedFaqToDelete] = useState<any | null>(null);

    useEffect(() => {
        fetchFaq();
    }, []);

    const fetchFaq = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/faq`);
        setLoading(false);
        if (response.code === 'SUCCESS') {
            setFaqData(response.data);
        } else {
            setFaqData([]);
        }
    };

    const handleEditClick = (faq: FAQ) => {
        setSelectedFaq(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer
        });
        setVisible(true);
    };

    const handleAddNew = () => {
        setSelectedFaq(null);
        setFormData({
            question: '',
            answer: ''
        });
        setVisible(true);
    };

    const handleSubmit = async () => {
        if (!formData.question || !formData.answer) {
            setAlert('Error', 'Please fill all required fields');
            return;
        }

        setIsDetailLoading(true);

        try {
            let response: CustomResponse;

            if (selectedFaq) {
                response = await PutCall(`/company/faq/${selectedFaq.id}`, formData);
            } else {
                response = await PostCall(`/company/faq`, formData);
            }

            setIsDetailLoading(false);

            if (response.code === 'SUCCESS') {
                setAlert('success', `FAQ ${selectedFaq ? 'updated' : 'added'} successfully`);
                setVisible(false);
                fetchFaq();
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            console.error('Error submitting FAQ data:', error);

            setAlert('error', 'An error occurred while submitting FAQ data.');
        } finally {
            setIsDetailLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedFaqToDelete) return;

        try {
            setLoading(true);

            const response: CustomResponse = await DeleteCall(`/company/faq/${selectedFaqToDelete}`);

            if (response.code === 'SUCCESS') {
                setAlert('success', 'FAQ deleted successfully');
                setIsDeleteDialogVisible(false);
                fetchFaq();
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            setAlert('error', 'An error occurred while deleting the FAQ.');
        } finally {
            setLoading(false);
        }
    };

    const DialogFooter = () => <Button label={selectedFaq ? 'Update' : 'Submit'} icon="pi pi-check" className="bg-primary-main border-primary-main hover:text-white my-2" onClick={handleSubmit} loading={isDetailLoading} />;

    const openDeleteDialog = (id: number) => {
        setIsDeleteDialogVisible(true);
        setSelectedFaqToDelete(id);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogVisible(false);
        setSelectedFaqToDelete(null);
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="p-card">
                    <div className="p-card-header flex justify-content-between items-center pt-5 px-4">
                        <div>
                            <h3 className="mb-1 text-md font-medium">Frequently Asked Questions</h3>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos, quo!</p>
                        </div>
                        {isSuperAdmin() && (
                            <div>
                                <Button icon="pi pi-plus" size="small" label="Add FAQ" className="bg-primary-main hover:text-white border-primary-main" onClick={handleAddNew} />
                            </div>
                        )}
                    </div>

                    <Dialog header={selectedFaq ? 'Edit FAQ' : 'Add New FAQ'} visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)} footer={<DialogFooter />}>
                        <div className="m-0">
                            <div className="field mb-4">
                                <label htmlFor="faqQuestion" className="block mb-2">
                                    FAQ Question
                                </label>
                                <input id="faqQuestion" type="text" value={formData.question} onChange={(e) => setFormData((prev) => ({ ...prev, question: e.target.value }))} className="p-inputtext w-full" placeholder="Enter FAQ Question" />
                            </div>
                            <div className="field">
                                <label htmlFor="faqAnswer" className="block mb-2">
                                    FAQ Answer
                                </label>
                                <textarea id="faqAnswer" value={formData.answer} onChange={(e) => setFormData((prev) => ({ ...prev, answer: e.target.value }))} className="p-inputtext w-full" placeholder="Enter FAQ Answer" rows={4} />
                            </div>
                        </div>
                    </Dialog>

                    <Dialog
                        header="Delete confirmation"
                        visible={isDeleteDialogVisible}
                        style={{ width: layoutState.isMobile ? '90vw' : '35vw' }}
                        className="delete-dialog"
                        footer={
                            <div className="flex justify-content-center p-2">
                                <Button label="Cancel" style={{ color: '#DF1740' }} className="px-7" text onClick={closeDeleteDialog} />
                                <Button label="Delete" style={{ backgroundColor: '#DF1740', border: 'none' }} className="px-7 hover:text-white" onClick={confirmDelete} />
                            </div>
                        }
                        onHide={closeDeleteDialog}
                    >
                        {isLoading && (
                            <div className="center-pos">
                                <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                            </div>
                        )}
                        <div className="flex flex-column w-full surface-border p-2 text-center gap-4">
                            <i className="pi pi-info-circle text-6xl" style={{ marginRight: 10, color: '#DF1740' }}></i>

                            <div className="flex flex-column align-items-center gap-1">
                                <span>Are you sure you want to delete this FAQ? </span>
                                <span>This action cannot be undone. </span>
                            </div>
                        </div>
                    </Dialog>

                    <div className="p-card-body">
                        {isLoading ? (
                            <p>Loading FAQs...</p>
                        ) : faqData.length > 0 ? (
                            <div className="w-full">
                                <Accordion>
                                    {faqData.map((faq) => (
                                        <AccordionTab
                                            key={faq.id}
                                            headerTemplate={(options: any) => (
                                                <button className={options.className} onClick={options.onClick} style={{ width: '100%', border: 'none', background: 'none', padding: '7px', cursor: 'pointer' }}>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            width: '100%'
                                                        }}
                                                    >
                                                        <span className="font-bold" style={{ color: '#333333', fontSize: '14px', fontWeight: '500' }}>
                                                            {faq.question}
                                                        </span>
                                                        {isSuperAdmin() && (
                                                            <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                                                                <i
                                                                    className="pi pi-file-edit"
                                                                    style={{
                                                                        color: '#64748B',
                                                                        padding: '5px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditClick(faq);
                                                                    }}
                                                                />
                                                                <i
                                                                    className="pi pi-trash"
                                                                    style={{
                                                                        color: '#F56565',
                                                                        padding: '5px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openDeleteDialog(faq.id);
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            )}
                                        >
                                            <p className="m-0">{faq.answer}</p>
                                        </AccordionTab>
                                    ))}
                                </Accordion>
                            </div>
                        ) : (
                            <p>No FAQs available at the moment.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaqPage;
