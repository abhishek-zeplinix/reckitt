import { GetCall } from "@/app/api-config/ApiKit";
import { useState, useCallback } from "react";


const useCategories = () => {
    const [procurementCategories, setProcurementCategories] = useState<any[]>([]);
    const [supplierCategories, setSupplierCategories] = useState<any[]>([]);
    const [categoryLoader, setCategoryLoader] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const fetchProcurementCategories = useCallback(async (categoryId: number | null) => {
        if (categoryId == null) {
            setSupplierCategories([]);
            return;
        }

        setCategoryLoader(true);
        setError(null);

        try {
            const response = await GetCall(`/company/sub-category/${categoryId}`);
            if (response?.code === "SUCCESS" && Array.isArray(response.data)) {
                setSupplierCategories(response.data);
            } else {
                throw new Error(response?.message || "Failed to fetch subcategories.");
            }
        } catch (err: any) {
            setSupplierCategories([]);
            setError(err.message || "An error occurred while fetching subcategories.");
        } finally {
            setCategoryLoader(false);
        }
    }, []);


    const fetchSupplierCategories = useCallback(async () => {
        setCategoryLoader(true);
        setError(null);

        try {
            const response = await GetCall(`/company/category`);
            if (response?.code === "SUCCESS" && Array.isArray(response.data)) {
                setProcurementCategories(response.data);
            } else {
                throw new Error(response?.message || "Failed to fetch categories.");
            }
        } catch (err: any) {
            setProcurementCategories([]);
            setError(err.message || "An error occurred while fetching categories.");
        } finally {
            setCategoryLoader(false);
        }
    }, []);

    return {
        procurementCategories,
        supplierCategories,
        categoryLoader,
        error,
        fetchProcurementCategories,
        fetchSupplierCategories,
    };
};

export default useCategories;
