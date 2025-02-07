import { useState, useEffect, useCallback, useMemo } from 'react';
import { GetCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import { buildQueryParams } from '@/utils/utils';


const useFetchSingleSupplierDetails = ({catId, subCatId, supId}: any) => {
    const [suppliers, setSuppliers] = useState([]);
    const { setLoading, setAlert } = useAppContext();


    const fetchSupplier = useCallback(async () => {

        if (!catId || !subCatId || !supId) return;

        try {

            const params = {
                filters: {
                    supplierCategoryId: catId,
                    procurementCategoryId: subCatId,
                    supId
                },
                pagination: false
            };

            const queryString = buildQueryParams(params);

            const response = await GetCall(`/company/supplier?${queryString}`);

            setSuppliers(response.data[0] || []);

            return response.data[0];

        } catch (error) {

            setAlert('error', 'Failed to fetch supplier');

        } finally {

        }

    }, [catId, subCatId, supId]);


    // memoization
    const memoizedSuppliers = useMemo(() => suppliers, [suppliers]);

    useEffect(() => {
        fetchSupplier();
    }, []);

    return { suppliers: memoizedSuppliers, fetchSupplier };
};

export default useFetchSingleSupplierDetails;