import { useState, useEffect, useCallback, useMemo } from 'react';
import { GetCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';


const useFetchSuppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const { setLoading, setAlert } = useAppContext();


    const fetchSuppliers = useCallback(async () => {

        setLoading(true);

        try {

            const response = await GetCall('/company/supplier');
            setSuppliers(response.data || []);

        } catch (error) {

            setAlert('error', 'Failed to fetch suppliers');

        } finally {

            setLoading(false);
        }

    }, []);


    // memoization
    const memoizedSuppliers  = useMemo(() => suppliers, [suppliers]);

    useEffect(() => {
            fetchSuppliers();
    }, []);

    return { suppliers: memoizedSuppliers , fetchSuppliers };
};

export default useFetchSuppliers;