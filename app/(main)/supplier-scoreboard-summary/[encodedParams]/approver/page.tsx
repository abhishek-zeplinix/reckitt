'use client';
import { GetCall } from "@/app/api-config/ApiKit";
import SupplierSummaryCard from "@/components/supplier-rating/supplier-summary/SupplierSummaryCard";
import SupplierEvaluationTableApprover from "@/components/supplier-rating/SupplierRatingTableApprover";
import useFetchDepartments from "@/hooks/useFetchDepartments";
import useFetchSingleSupplierDetails from "@/hooks/useFetchSingleSupplierDetails";
import { useAppContext } from "@/layout/AppWrapper";
import { useAuth, withAuth } from "@/layout/context/authContext";
import { buildQueryParams } from "@/utils/utils";
import { EvolutionType, getDefaultPeriod, getPeriodOptions } from "@/utils/periodUtils";
import { useParams } from "next/navigation";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import React, { useEffect, useMemo, useState } from "react";
import useDecodeParams from "@/hooks/useDecodeParams";
import { get } from "lodash";

const ApproverPage = ({
    params
}: {
    params: {
        encodedParams: string
    }
}) => {
    const { setAlert, user } = useAppContext();
    const { hasPermission } = useAuth();

    // data fetching hooks
    const { departments } = useFetchDepartments();

       // get user's assigned department
       const userDepartment = get(user, 'RoleSpecificDetails.department.name', 'all');
    
    // state management
    const [supplierScoreData, setSupplierScoreData] = useState<any>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<string | null>();
    const [activeTab, setActiveTab] = useState('');
    const [scoreLoading, setScoreLoading] = useState(false);
    const [reload, setReload] = useState<boolean>(false);

    const decodedParams = useDecodeParams(params.encodedParams);
    const { supId, catId, subCatId, currentYear, assignmentId } = decodedParams;

    const { suppliers }: any = useFetchSingleSupplierDetails({ catId, subCatId, supId });
    //  values
    const sortedDepartments: any = useMemo(() =>
        departments?.sort((a: any, b: any) => a.orderBy - b.orderBy) || []
        , [departments]);

    const currentDepartment: any = useMemo(() =>
        sortedDepartments.find((d: any) => d.departmentId === activeTab)
        , [sortedDepartments, activeTab]);

 
    
    // period calculations
    const periodOptions = useMemo(() => {
        if (!currentDepartment || !currentYear) return [];
        return getPeriodOptions(
            currentDepartment.evolutionType.toLowerCase() as EvolutionType,
            currentYear
        );
    }, [currentDepartment, currentYear]);


    // initialize department and period
    // useEffect(() => {
    //     if (sortedDepartments.length > 0 && !activeTab) {
    //         const initialDept = sortedDepartments[0];
    //         setActiveTab(initialDept.departmentId);
    //     }
    // }, [sortedDepartments, activeTab]);


    useEffect(() => {
        if (sortedDepartments.length > 0 && !activeTab) {
            if (userDepartment !== 'all') {
                // If user has a specific department, find and set it
                const userDept = sortedDepartments.find((dept: any) => 
                    dept.name.toLowerCase() === userDepartment.toLowerCase()
                );
                if (userDept) {
                    setActiveTab(userDept.departmentId);
                } else {
                    // Fallback to first department if user's department not found
                    setActiveTab(sortedDepartments[0].departmentId);
                }
            } else {
                // If user has 'all' access, use first department (original behavior)
                setActiveTab(sortedDepartments[0].departmentId);
            }
        }
    }, [sortedDepartments, activeTab, userDepartment]);


    // Set default period when department changes
    useEffect(() => {
        if (currentDepartment && currentYear) {
            const defaultPeriod: any = getDefaultPeriod(
                currentDepartment.evolutionType.toLowerCase() as EvolutionType,
                currentYear
            );
            setSelectedPeriod(null);
            setTimeout(() => setSelectedPeriod(defaultPeriod), 0);
        }
    }, [currentDepartment, currentYear]);

    // fetch supplier scores
    const fetchSupplierScore = async () => {
        if (!selectedPeriod || !currentDepartment) return;

        setScoreLoading(true);
        try {
            const params = {
                filters: {
                    supplierCategoryId: catId,
                    procurementCategoryId: subCatId,
                    supId,
                    departmentId: currentDepartment.departmentId,
                    evalutionPeriod: selectedPeriod
                },
                pagination: false
            };

            const response = await GetCall(`/company/supplier-score?${buildQueryParams(params)}`);
            setSupplierScoreData(response.data);
        } catch (error) {
            setAlert('error', 'Failed to fetch supplier score data');
        } finally {
            setScoreLoading(false);
        }
    };


    useEffect(() => {
        if (selectedPeriod && currentDepartment) {
            fetchSupplierScore();
        }
    }, [selectedPeriod, reload]);

    // category mapping
    const categoryMap: any = useMemo(() => ({
        'raw & pack': 'ratiosRawpack',
        copack: 'ratiosCopack'
    }), []);

    const categoryKey = categoryMap[suppliers?.category?.categoryName?.toLowerCase()] || null;

     // check if a department should be disabled
     const isDepartmentDisabled = (department: any) => {
        if (userDepartment === 'all') return false;
        return department.name.toLowerCase() !== userDepartment.toLowerCase();
    };

    return (
        <div className="grid" id="content-to-print">
            <div className="col-12">
                <SupplierSummaryCard catId={catId} subCatId={subCatId} supId={supId} />
            </div>
            <div className="col-12">
                <div className="border">
                    <div className="p-1">
                        <div className="flex flex-wrap justify-center sm:justify-start space-x-2 sm:space-x-4">
                        {sortedDepartments.map((department: any) => {
                                const isDisabled = isDepartmentDisabled(department);
                                return (
                                    <div
                                        key={department.departmentId}
                                        className={`px-4 py-2 font-bold transition-all duration-300 ${
                                            isDisabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'
                                        } ${activeTab === department.departmentId
                                            ? 'text-primary-main border border-primary-main rounded-lg' 
                                            : 'text-gray-500 border-none'
                                        }`}
                                        style={{
                                            border: activeTab === department.departmentId ? '1px solid #ec4899' : 'none',
                                            borderRadius: activeTab === department.departmentId ? '12px' : '0',
                                            opacity: isDisabled ? 0.5 : 1
                                        }}
                                        onClick={() => {
                                            if (!isDisabled) {
                                                setActiveTab(department.departmentId);
                                            }
                                        }}
                                    >
                                        {department.name.toUpperCase()}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <hr />

                    <div className="flex justify-content-between p-2">
                        <Dropdown
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.value)}
                            options={periodOptions}
                            optionLabel="label"
                            placeholder="Select Period"
                            className="w-full md:w-14rem"
                            disabled={!currentDepartment}
                        />
                        <Button
                            label="APPROVER PANEL"
                            outlined
                            className="text-color-primary hover:bg-transparent hover:border-transparent"
                        />
                    </div>

                    {hasPermission('approve_score') && currentDepartment && (
                        <SupplierEvaluationTableApprover
                            supplierScoreData={supplierScoreData}
                            category={categoryKey}
                            evaluationPeriod={selectedPeriod}
                            categoryName={suppliers?.category?.categoryName?.toLowerCase()}
                            departmentId={currentDepartment.departmentId}
                            department={currentDepartment.name}
                            isEvaluatedData={!!supplierScoreData?.length}
                            selectedPeriod={selectedPeriod}
                            onSuccess={() => setReload(!reload)}
                            totalScoreEvaluated={
                                suppliers?.supplierScores?.find(
                                    (score: any) =>
                                        score.departmentId === currentDepartment.departmentId &&
                                        score.evalutionPeriod === selectedPeriod
                                )?.totalScore
                            }
                            isTableLoading={scoreLoading}
                            catId={catId}
                            subCatId={subCatId}
                            assignmentId={assignmentId}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default withAuth(ApproverPage, undefined, 'approve_score');