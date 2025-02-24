'use client';
import { GetCall } from '@/app/api-config/ApiKit';
import TableSkeleton from '@/components/skeleton/TableSkeleton';
import SupplierEvaluationTable from '@/components/supplier-rating/SupplierRatingTable';
import useFetchDepartments from '@/hooks/useFetchDepartments';
import { useAppContext } from '@/layout/AppWrapper';
import { useAuth, withAuth } from '@/layout/context/authContext';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { Dropdown } from 'primereact/dropdown';
import React, { useEffect, useState } from 'react';
import useDecodeParams from '@/hooks/useDecodeParams';
import SupplierSummaryCard from '@/components/supplier-rating/supplier-summary/SupplierSummaryCard';
import { categoriesMap } from '@/utils/constant';
import SupplierSummmarySkeletonCustom from '@/components/skeleton/SupplierSummmarySkeletonCustom';


const SupplierRatingPage = ({
    params
}: {
    params: { 
        encodedParams: string 
    }
}) => {

    const [activeTab, setActiveTab] = useState('PROCUREMENT');
    const [selectedPeriod, setSelectedPeriod] = useState();
    const [rules, setRules] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState<number>(4);
    const [supplierData, setSupplierData] = useState<any>();
    const [periodOptions, setPeriodOptions] = useState<any>([]);
    const [supplierScoreData, setSupplierScoreData] = useState<any>(null);
    const [reload, setReload] = useState<boolean>(false);

    const [scoreDataLoading, setScoreDataLoading] = useState<boolean>(false)
    
    const { isLoading, setLoading, setAlert } = useAppContext();

    const { departments } = useFetchDepartments();

    const decodedParams = useDecodeParams(params.encodedParams);
    const { supId, catId, subCatId, currentYear} = decodedParams;
    
    const categoryName = supplierData?.category?.categoryName?.toLowerCase();

    const category: any = categoriesMap[categoryName] || null; // default to null if no match


    //fetch indivisual supplier data
    const fetchSupplierData = async () => {
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

            setSupplierData(response.data[0]);

            return response.data[0];
        } catch (error) {
            setAlert('error', 'Failed to fetch supplier data');
        }
    };

    // Fetch supplier score data
    const fetchSupplierScore = async () => {

        setScoreDataLoading(true)

        try {
            const params = {
                filters: {
                    supplierCategoryId: catId,
                    procurementCategoryId: subCatId,
                    supId,
                    departmentId: selectedDepartment,
                    evalutionPeriod: selectedPeriod
                },
                pagination: false
            };

            const queryString = buildQueryParams(params);

            const response = await GetCall(`/company/supplier-score?${queryString}`);

            // setSupplierScoreData(response.data[0]);


            setSupplierScoreData(response.data);

            return response.data;
        } catch (error) {
            setAlert('error', 'Failed to fetch supplier score data');
        } finally {
            setScoreDataLoading(false)
        }
    };

    //fetch rules
    const fetchRules = async () => {
        setLoading(true)
        if (!selectedPeriod || !selectedDepartment) return;

        try {
            // const rulesParams = { effectiveFrom: selectedPeriod, pagination: false };
            const rulesParams = { pagination: false };
            const queryString = buildQueryParams(rulesParams);
            const response = await GetCall(`/company/rules/${catId}/${subCatId}/${selectedDepartment}`);
            setRules(response.data);
            return response.data;
        } catch (error) {
            setAlert('error', 'Failed to fetch rules');
        }finally{
            setLoading(false)
        }
    };

    // Initial data fetch
    useEffect(() => {
        const initializeData = async () => {
            // setLoading(true);
            try {
                const supplierDetails = await fetchSupplierData();

                // Check if supplier has been evaluated for the selected department
                const isDepartmentEvaluated = supplierDetails?.supplierScores?.some((score: any) => score.departmentId === selectedDepartment);


                if (supplierDetails?.isEvaluated && isDepartmentEvaluated) {
                    await fetchSupplierScore();
                }
            } catch (error) {
                setAlert('error', 'Something went wrong during initialization');
            } finally {
                // setLoading(false);
            }
        };

        initializeData();
    }, [reload]);

    useEffect(() => {
        const fetchRulesData = async () => {
            if (!selectedPeriod) return;

            const currentDepartment = (departments as any[])?.find((dep) => dep.departmentId === selectedDepartment);
            if (!currentDepartment) return;

            const validPeriods = getPeriodOptions(currentDepartment.evolutionType);
            const isPeriodValid = validPeriods.some((option) => option.value === selectedPeriod);

            if (!isPeriodValid) return;

            // setLoading(true);
            try {
                const scoreData = await fetchSupplierScore();

                // If no score data exists for this period, fetch default rules
                // if (!scoreData || scoreData.length === 0) {
                await fetchRules();
                // }
            } catch (error) {
                // Error handled in respective fetch functions
            } finally {
                // setLoading(false);
            }
        };

        fetchRulesData();
    }, [selectedDepartment, selectedPeriod, reload]);

   
    useEffect(() => {
        if (departments) {
            const currentDepartment = (departments as any[])?.find((dep) => dep.departmentId === selectedDepartment);

            if (currentDepartment) {
                const options = getPeriodOptions(currentDepartment.evolutionType);
                setPeriodOptions(options);

                // instead of immediately setting the period, check if the current period is valid
                const defaultPeriod: any = getDefaultPeriod(currentDepartment.evolutionType);
                const isCurrentPeriodValid = options.some((option) => option.value === selectedPeriod);

                if (!isCurrentPeriodValid) {
                    setSelectedPeriod(defaultPeriod);
                }
            }
        }
    }, [selectedDepartment, departments]);

    //function to get periods based on evolution type...
    const getPeriodOptions = (evolutionType: string) => {
        const currentDate = new Date();
        // const currentYear = currentDate.getFullYear();

        if (evolutionType.toLowerCase() === 'halfyearly') {
            return [
                { label: `H1-${currentYear}`, value: `${evolutionType}-1-${currentYear}` },
                { label: `H2-${currentYear}`, value: `${evolutionType}-2-${currentYear}` }
            ];
        } else if (evolutionType.toLowerCase() === 'quarterly') {
            return [
                { label: `Q1-${currentYear}`, value: `${evolutionType}-1-${currentYear}` },
                { label: `Q2-${currentYear}`, value: `${evolutionType}-2-${currentYear}` },
                { label: `Q3-${currentYear}`, value: `${evolutionType}-3-${currentYear}` },
                { label: `Q4-${currentYear}`, value: `${evolutionType}-4-${currentYear}` }
            ];
        }

        return [];
    };

    // dunction to get default period based on current date
    const getDefaultPeriod = (evolutionType: string) => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        // const currentYear = currentDate.getFullYear();

        if (evolutionType.toLowerCase() === 'halfyearly') {
            return currentMonth <= 6 ? `${evolutionType}-1-${currentYear}` : `${evolutionType}-2-${currentYear}`;
        } else if (evolutionType.toLowerCase() === 'quarterly') {
            if (currentMonth <= 3) return `${evolutionType}-1-${currentYear}`;
            if (currentMonth <= 6) return `${evolutionType}-2-${currentYear}`;
            if (currentMonth <= 9) return `${evolutionType}-3-${currentYear}`;
            return `${evolutionType}-4-${currentYear}`;
        }
        return null;
    };


    const dataPanel = () => {
        return (
            <>
                <div className="border">
                    <div className="p-1">
                        <div className="flex flex-wrap justify-center sm:justify-start space-x-2 sm:space-x-4">
                            {departments
                                ?.sort((a: any, b: any) => a.orderBy - b.orderBy) // Sort by orderBy property
                                .map((department: any) => (
                                    <div
                                        key={department.name}
                                        className={`px-4 py-2 font-bold transition-all duration-300 cursor-pointer ${activeTab === department.name ? 'text-primary-main border border-primary-main rounded-lg' : 'text-gray-500 border-none'}`}
                                        style={{
                                            border: activeTab === department.name ? '1px solid #ec4899' : 'none',
                                            borderRadius: activeTab === department.name ? '12px' : '0'
                                        }}
                                        onClick={() => {
                                            setActiveTab(department.name); // Set activeTab state
                                            setSelectedDepartment(department.departmentId); // Set departmentID state
                                            // setSupplierScoreData(null);
                                        }}
                                    >
                                        {department.name.toUpperCase()}
                                    </div>
                                ))}
                        </div>
                    </div>
                    <hr />

                    <div className="flex justify-content-between">
                        <Dropdown value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.value)} options={periodOptions} optionLabel="label" placeholder="Select Period" className="w-full md:w-14rem" />
                      
                    </div>
                        <SupplierEvaluationTable
                            rules={rules} // Always pass rules
                            supplierScoreData={supplierScoreData}
                            category={category}
                            evaluationPeriod={selectedPeriod}
                            categoryName={categoryName}
                            departmentId={selectedDepartment}
                            department={activeTab}
                            isEvaluatedData={!!supplierScoreData?.length} // Determine if we have evaluated data
                            onSuccess={() => setReload(!reload)}
                            selectedPeriod={selectedPeriod}
                            totalScoreEvaluated={
                                supplierData?.supplierScores?.find(
                                    (score: any) =>
                                        score.departmentId === selectedDepartment &&
                                        score.evalutionPeriod === selectedPeriod
                                )?.totalScore
                                
                            }
                            catId={catId}
                            subCatId={subCatId}
                            supId={supId}
                            rulesLoading = {isLoading}
                            scoreLoading = {scoreDataLoading}
                        // key={`${selectedDepartment}-${selectedPeriod}`}

                        />
                             

                </div>
            </>
        );
    };

    const renderDataPanel = dataPanel();

    return (
        <div className="grid" id="content-to-print">
            <div className="col-12">
                <SupplierSummaryCard catId={catId} subCatId={subCatId} supId={supId} />
            </div>
            <div className="col-12">
                <div>{renderDataPanel}</div>
            </div>
        </div>
    );
};

export default withAuth(SupplierRatingPage, undefined, 'evaluate_score');
