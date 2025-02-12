'use client'
import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import useDecodeParams from "@/hooks/useDecodeParams";
import { GetCall, PostCall } from '@/app/api-config/ApiKit';
import SupplierScoreTable from '@/components/supplier-feedback/SupplierFeedbackTable';
import { useAppContext } from '@/layout/AppWrapper';
import SupplierSummaryFeedbackCard from '@/components/supplier-rating/supplier-summary/SupplierSummaryFeedbackCard';

const SupplierFeedback = ({
    params,
}: {
    params: { encodedParams: string };
}) => {
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [scoreData, setScoreData] = useState<any>(null);
    const toastRef = React.useRef(null);

    const decodedParams = useDecodeParams(params.encodedParams);
    const { departmentId, period } = decodedParams;

    const { setAlert } = useAppContext();

    const fetchSupplierData = async () => {

        try {
            setLoading(true);
            const response = await GetCall(`/company/supplier-score-summary/department/${departmentId}/period/${period}`);

            if (response.code === 'SUCCESS') {
                setScoreData(response.data);
            } else {
                setAlert('error', 'Error while fetching supplier data');
            }
        } catch (error) {
            setAlert('error', 'Error while fetching supplier data')
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitFiles = async (formData: any) => {
        try {
            setUploadLoading(true);
            console.log(formData);
            for (const [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }
            const response = await PostCall('/company/supplier-cheked/file-upload', formData);

            if (response.code === 'SUCCESS') {
                setAlert('success', 'Feedback successfully submitted!')
                await fetchSupplierData();
            } else {
                setAlert('error', response.error)
            }
        } catch (error) {
            setAlert('error', 'Failed to upload files')
            setUploadLoading(false);
        }
    };

    useEffect(() => {
        if (departmentId && period) {
            fetchSupplierData();
        }
    }, [departmentId, period]);

    return (
        <div className="grid">

            <div className="col-12">
              {scoreData  && <SupplierSummaryFeedbackCard data={scoreData} /> }  
            </div>

            <div className="col-12">
                <SupplierScoreTable
                    data={scoreData}
                    loading={uploadLoading}
                    onSubmit={handleSubmitFiles}
                    setUploadLoading ={setUploadLoading}
                />
            </div>
        </div>
    );
};

export default SupplierFeedback;