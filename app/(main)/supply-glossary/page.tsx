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
import { ProgressSpinner } from 'primereact/progressspinner';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { useAuth } from '@/layout/context/authContext';
import FAQSkeleton from '@/components/skeleton/FAQSkeleton';

interface Glossary {
    id: number;
    name: string;
    description: string;
}

const SupplyGlossaryPage = () => {
    const { isLoading, setLoading, setAlert } = useAppContext();
    const { layoutState } = useContext(LayoutContext);
    const { isSuperAdmin } = useAuth();
    const [glossaryData, setGlossaryData] = useState<Glossary[]>([]);
    const [visible, setVisible] = useState(false);
    const [selectedGlossary, setSelectedGlossary] = useState<Glossary | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
    const [selectedGlossaryToDelete, setSeletedGlossaryToDelete] = useState<any | null>(null);

    useEffect(() => {
        fetchGlossary();
    }, []);

    const fetchGlossary = async () => {
        try {
            setLoading(true);
            const response: CustomResponse = await GetCall(`/company/supplyglossaries`);
            setLoading(false);
            if (response.code === 'SUCCESS') {
                setGlossaryData(response.data);
            } else {
                setGlossaryData([]);
            }
        } catch (error) {
            setAlert('error', 'Failed to fetch glossary data');
        }
    };

    const handleEditClick = (glossary: Glossary) => {
        setSelectedGlossary(glossary);
        setFormData({
            name: glossary.name,
            description: glossary.description
        });
        setVisible(true);
    };

    const handleAddNew = () => {
        setSelectedGlossary(null);
        setFormData({
            name: '',
            description: ''
        });
        setVisible(true);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.description) {
            setAlert('error', 'Please fill all required fields');
            return;
        }

        try {
            setLoading(true);
            let response: CustomResponse;

            if (selectedGlossary) {
                response = await PutCall(`/company/supplyglossaries/${selectedGlossary.id}`, formData);
            } else {
                response = await PostCall(`/company/supplyglossaries`, formData);
            }

            if (response.code === 'SUCCESS') {
                setAlert('success', `Glossary ${selectedGlossary ? 'updated' : 'added'} successfully`);
                setVisible(false);
                fetchGlossary();
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            setAlert('error', 'An error occurred while submitting glossary data.');
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedGlossaryToDelete) return;

        try {
            setLoading(true);

            const response: CustomResponse = await DeleteCall(`/company/supplyglossaries/${selectedGlossaryToDelete}`);

            if (response.code === 'SUCCESS') {
                setAlert('success', 'Glossary deleted successfully');
                setIsDeleteDialogVisible(false);
                fetchGlossary();
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            setAlert('error', 'An error occurred while deleting the Glossary.');
        } finally {
            setLoading(false);
        }
    };

    const DialogFooter = () => <Button label={selectedGlossary ? 'Update' : 'Submit'} icon="pi pi-check" className="bg-primary-main border-primary-main hover:text-white my-2" onClick={handleSubmit} loading={isDetailLoading} />;

    const openDeleteDialog = (id: number) => {
        setIsDeleteDialogVisible(true);
        setSeletedGlossaryToDelete(id);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogVisible(false);
        setSeletedGlossaryToDelete(null);
    };

    return (
        <div className="grid ">
            <div className="col-12">
                <div className="p-card">
                    <div className="p-card-header flex justify-content-between items-center pt-5 px-4">
                        <div>
                            <h3 className="mb-1 text-md font-medium">Supply glossary of categories</h3>
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos, quo!</p>
                        </div>
                        {isSuperAdmin() && (
                            <div>
                                <Button icon="pi pi-plus" size="small" label="Add Supplier Glossary" className="bg-primary-main border-primary-main hover:text-white" onClick={handleAddNew} />
                            </div>
                        )}
                    </div>

                    <Dialog header={selectedGlossary ? 'Edit Supply Glossary' : 'Add New Supply Glossary'} visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)} footer={<DialogFooter />}>
                        <div className="m-0">
                            <div className="field mb-4">
                                <label htmlFor="sQuestion" className="block mb-2">
                                    Supply Glossary Question
                                </label>
                                <input id="sQuestion" type="text" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} className="p-inputtext w-full" placeholder="Enter Question" />
                            </div>
                            <div className="field">
                                <label htmlFor="sAnswer" className="block mb-2">
                                    Supply Glossary Answer
                                </label>
                                <textarea id="sAnswer" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} className="p-inputtext w-full" placeholder="Enter Answer" rows={4} />
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
                                <span>Are you sure you want to delete this Supply Glossary? </span>
                                <span>This action cannot be undone. </span>
                            </div>
                        </div>
                    </Dialog>

                    {
                        isLoading ? <FAQSkeleton rows={10} /> :

                            <div className="p-card-body">
                                { glossaryData.length > 0 ? (
                                    <Accordion>
                                        {glossaryData.map((glossary) => (
                                            <AccordionTab
                                                key={glossary.id}
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
                                                                {glossary.name}
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
                                                                            handleEditClick(glossary);
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
                                                                            openDeleteDialog(glossary.id);
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                )}
                                            >
                                                <p className="m-0">{glossary.description}</p>
                                            </AccordionTab>
                                        ))}
                                    </Accordion>
                                ) : (
                                    <p>No data available at the moment.</p>
                                )}
                            </div>
                    }

                </div>
            </div>
        </div>
    );
};

export default SupplyGlossaryPage;
