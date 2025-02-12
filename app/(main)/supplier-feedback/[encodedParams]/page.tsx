'use client'
import React, { useEffect, useState } from 'react';
import useDecodeParams from "@/hooks/useDecodeParams";
import { GetCall, PostCall } from '@/app/api-config/ApiKit';
import SupplierScoreTable from '@/components/supplier-feedback/SupplierFeedbackTable';
import { useAppContext } from '@/layout/AppWrapper';
import SupplierSummaryFeedbackCard from '@/components/supplier-rating/supplier-summary/SupplierSummaryFeedbackCard';
import { buildQueryParams } from '@/utils/utils';
import { useAuth } from '@/layout/context/authContext';

const SupplierFeedback = ({
    params,
}: {
    params: { encodedParams: string };
}) => {
    // const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [scoreData, setScoreData] = useState<any>(null);
    const toastRef = React.useRef(null);


    const decodedParams = useDecodeParams(params.encodedParams);
    const { departmentId, period, supId } = decodedParams;

    const { setAlert, user, setLoading, isLoading } = useAppContext();
    const { isSupplier } = useAuth();

    console.log(supId);
    console.log(departmentId);
    console.log(period);
    console.log(user);

    const fetchSupplierFeedbackBySupplier = async (params?: any) => {

        try {
            setLoading(true);

            if (!params) {
                params = { filters: { supId } };
            }
            const queryString = buildQueryParams(params);

            const response = await GetCall(`/company/supplier-score-summary/department/${departmentId}/period/${period}?${queryString}`);

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

    const fetchSupplierFeedbackByFilter = async (params?: any) => {

        try {
            setLoading(true);

            if (!params) {
                params = { filters: { supId, departmentId, evalutionPeriod: period } };
            }
            const queryString = buildQueryParams(params);

            const response = await GetCall(`/company/score-checked-data?${queryString}`);

            if (response.code === 'SUCCESS') {
                setScoreData(response.data[0]);
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
                await fetchSupplierFeedbackBySupplier();
            } else {
                setAlert('error', response.error)
            }
        } catch (error) {
            setAlert('error', 'Failed to upload files')
            setUploadLoading(false);
        }
    };

    useEffect(() => {

        if (user && departmentId && period) {

            if (isSupplier()) {
                fetchSupplierFeedbackBySupplier();
            } else {
                fetchSupplierFeedbackByFilter();
            }
        }

    }, [departmentId, period, supId, user]);

    return (
        <div className="grid">

            <div className="col-12">
                {scoreData && <SupplierSummaryFeedbackCard data={scoreData} />}
            </div>
            <div className="col-12">

                <SupplierScoreTable
                    data={scoreData}
                    loading={uploadLoading}
                    onSubmit={handleSubmitFiles}
                    setUploadLoading={setUploadLoading}

                />

            </div>

        </div>
    );
};

export default SupplierFeedback;