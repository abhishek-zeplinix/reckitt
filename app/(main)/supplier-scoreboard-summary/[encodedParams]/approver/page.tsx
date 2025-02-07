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
import { decode as base64Decode } from 'js-base64';

const ApproverPage = ({
    params
}: {
    params: { 
        encodedParams: string 
    }
}) => {
    const { setAlert } = useAppContext();
    const { hasPermission } = useAuth();
    const urlParams = useParams();
    // const { supId, catId, subCatId, currentYear }: any = urlParams;

    // data fetching hooks
    const { departments } = useFetchDepartments();


    // state management
    const [supplierScoreData, setSupplierScoreData] = useState<any>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<string | null >();
    const [activeTab, setActiveTab] = useState('');
    const [scoreLoading, setScoreLoading] = useState(false);
    const [reload, setReload] = useState<boolean>(false);

    
    const decodedParams = React.useMemo(() => {
        try {
            const decodedStr = base64Decode(params.encodedParams);
            const parsedParams = JSON.parse(decodedStr);
            
            return {
                supId: String(parsedParams.supId),
                catId: String(parsedParams.catId),
                subCatId: String(parsedParams.subCatId),
                currentYear: String(parsedParams.currentYear)
            };
        } catch (error) {
            console.error('Error decoding parameters:', error);
            return { supId: '', catId: '', subCatId: '', currentYear: ''};
        }
    }, [params.encodedParams]);
    
    const { supId, catId, subCatId, currentYear } = decodedParams;

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
    useEffect(() => {
        if (sortedDepartments.length > 0 && !activeTab) {
            const initialDept = sortedDepartments[0];
            setActiveTab(initialDept.departmentId);
        }
    }, [sortedDepartments, activeTab]);

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

    return (
        <div className="grid" id="content-to-print">
            <div className="col-12">
                <SupplierSummaryCard />
            </div>
            <div className="col-12">
                <div className="border">
                    <div className="p-1">
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                            {sortedDepartments.map((department: any) => (
                                <div
                                    key={department.departmentId}
                                    className={`px-4 py-2 font-bold cursor-pointer transition-all duration-300 ${activeTab === department.departmentId
                                            ? 'text-primary-main border border-primary-main rounded-lg'
                                            : 'text-gray-500'
                                        }`}
                                    onClick={() => setActiveTab(department.departmentId)}
                                >
                                    {department.name.toUpperCase()}
                                </div>
                            ))}
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
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default withAuth(ApproverPage, undefined, 'approve_score');