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
            setSuppliers(response.data);
            return response.data;

        } catch (error) {

            setAlert('error', 'Failed to fetch departments');
            return null;

        } finally {

            setLoading(false);
        }

    }, [setLoading, setAlert]);


    // memoization
    const memoizedDepartments = useMemo(() => suppliers, [suppliers]);

    useEffect(() => {
        if (suppliers.length === 0) {
            fetchSuppliers();
        }
    }, [fetchSuppliers, suppliers]);

    return { suppliers: memoizedDepartments, fetchSuppliers };
};

export default useFetchSuppliers;