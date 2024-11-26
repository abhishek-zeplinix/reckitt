/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';

const SupplyGlossaryPage = () => {
    const router = useRouter();

    return (
        <div className="grid">
            <div className="col-12">
                <div className="p-card">
                    <div className="p-card-header text-center pt-5">
                        <h1 className="mb-1 font-semibold">Supply glossary of categories</h1>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos, quo!</p>
                    </div>
                    <div className="p-card-body" style={{ height: '68vh' }}>
                        <Accordion>
                            <AccordionTab header="What is PrimeReact?">
                                <p>PFR pack fill rate</p>
                            </AccordionTab>
                            <AccordionTab header="How do I install PrimeReact?">
                                <p>
                                    You can install PrimeReact using npm with the following command: <code>npm install primereact primeicons</code>.
                                </p>
                            </AccordionTab>
                            <AccordionTab header="Is PrimeReact free?">
                                <p>Yes, PrimeReact is open-source and free to use under the MIT license.</p>
                            </AccordionTab>
                        </Accordion>
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
