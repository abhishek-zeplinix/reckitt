/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useAppContext } from '@/layout/AppWrapper';
import { CustomResponse } from '@/types';
import { GetCall } from '@/app/api-config/ApiKit';

interface Glossary {
    id: number;
    name: string;
    description: string;
}
const SupplyGlossaryPage = () => {
    const router = useRouter();
    const { user, setLoading, isLoading } = useAppContext();
    const [glossaryData, setGlossaryData] = useState<Glossary[]>([]);
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
    return (
        <div className="grid">
            <div className="col-12">
                <div className="p-card">
                    <div className="p-card-header text-center pt-5">
                        <h1 className="mb-1 font-semibold">Supply glossary of categories</h1>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos, quo!</p>
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
