'use client';
import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { buildQueryParams, formatEvaluationPeriod, getBackgroundColor } from '@/utils/utils';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall } from '@/app/api-config/ApiKit';
import { CustomResponse, Department } from '@/types';
import useFetchDepartments from '@/hooks/useFetchDepartments';
import { Dropdown } from 'primereact/dropdown';
import Link from 'next/link';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { PDFDownloadLink } from '@react-pdf/renderer';
import SupplierScoreboardPDF from '@/components/pdf/supplier-scoreboard/SupplierScoreboardPDF';
import { useAuth } from '@/layout/context/authContext';
import { Badge } from 'primereact/badge';
import GraphsPanel from '@/components/supplier-scoreboard/GraphPanel';
import { encodeRouteParams, extractRouteParams } from '@/utils/base64';
import useDecodeParams from '@/hooks/useDecodeParams';
import useFetchSingleSupplierDetails from '@/hooks/useFetchSingleSupplierDetails';
import SupplierSummaryTableSkeleton from '@/components/supplier-rating/skeleton/SupplierSummarySkeleton';
import PerformanceRatingSkeleton from '@/components/supplier-rating/skeleton/OverallPerformanceSkeleton';

import SupplierScoreboardSummaryCard from '@/components/supplier-rating/supplier-summary/SupplierScoreboardSummaryCard';
import { memoizedBarOptions, memoizedOptions } from '@/utils/graph-constants';
import { ProgressSpinner } from 'primereact/progressspinner';

const SupplierScoreboardTables = ({
    params
}: {
    params: {
        encodedParams: string;
    };
}) => {
    const [halfYearlyData, setHalfYearlyData] = useState<any>([]);
    const [quarterlyData, setQuarterlyData] = useState<any>([]);
    const [ratingsData, setRatingsData] = useState<any>([]);
    const [supplierScore, setSupplierScore] = useState<any>([]);
    const [selectedYear, setSelectedYear] = useState<any>('2025');
    const [bottomFlatData, setbottomFlatData] = useState<any>();
    const { departments } = useFetchDepartments();

    const [chartImage, setChartImage] = useState<string | null>(null);
    const [pdfReady, setPdfReady] = useState(false);
    const { isLoading, setLoading, setAlert } = useAppContext();

    const [dialogVisible, setDialogVisible] = useState(false);
    const [evaluationData, setEvaluationData] = useState([]);

    const [isPopupLoading, setIsPopupLoading] = useState(false);
    const [loadingCell, setLoadingCell] = useState<{ departmentId: string, period: string } | null>(null);

    const chartRef = useRef(null);
    const { hasPermission, isSupplier } = useAuth();
    const decodedParams = useDecodeParams(params.encodedParams);
    const { supId, catId, subCatId } = decodedParams;
    const { suppliers }: any = useFetchSingleSupplierDetails({ catId, subCatId, supId });

    useEffect(() => {
        fetchData();
    }, [selectedYear]);



    const fetchData = async (params?: any) => {
        setLoading(false);

        try {
            if (!params) {
                params = { sortBy: 'supplierScoreId', sortOrder: 'asc/desc', filters: { date: selectedYear } };
            }
            setLoading(true);

            const queryString = buildQueryParams(params);

            const response: CustomResponse = await GetCall(`/company/supplier-score-summary/${supId}?${queryString}`);
            setLoading(false);

            if (response.code == 'SUCCESS') {
                setSupplierScore(response.data);
            } else {
                setSupplierScore([]);
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const fetchSpecificSupplierWithLessScore = async (depId: any, period: any) => {
        try {
            setIsPopupLoading(true);

            const response: CustomResponse = await GetCall(`/company/supplier-score-summary/${supId}/department/${depId}/period/${period}`);

            if (response.code == 'SUCCESS') {
                const flatData = response.data.filteredData.flatMap((section: any) =>
                    section.ratedCriteria.map((criteria: any) => ({
                        type: section.sectionName,
                        criteria: criteria.criteriaName,
                        ratio: criteria.evaluations[0]?.ratiosCopack || criteria.evaluations[0]?.ratiosRawpack || 'N/A',
                        evaluation: criteria.evaluations[0]?.criteriaEvaluation || 'N/A',
                        score: criteria.evaluations[0]?.score || 'N/A'
                    }))
                );
                const BottomflatData = response.data.supplierScoreData;
                setbottomFlatData(BottomflatData);
                setEvaluationData(flatData);
            } else {
                setEvaluationData([]);
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setIsPopupLoading(false);
        }
    };

    const fetchSpecificSupplierCheckedData = async (depId: any, period: any) => {
        try {
            setIsPopupLoading(true);

            const response: CustomResponse = await GetCall(`/company/supplier-score-summary/department/${depId}/period/${period}`);

            if (response.code == 'SUCCESS') {
                // transform checked data into flat format matching evaluationData structure
                const flatData = response?.data?.scoreApprovals?.checkedData?.map((item: any) => ({
                    type: item.sectionName,
                    criteria: item.ratedCriteria,
                    ratio: item.ratio,
                    evaluation: item.evaluation,
                    score: item.score
                }));

                setbottomFlatData(response.data);
                setEvaluationData(flatData);
            } else {
                setEvaluationData([]);
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setIsPopupLoading(false);
        }
    };

    useEffect(() => {
        if (supplierScore && departments) {
            processData();
        }
    }, [supplierScore, departments]);


    const processData = () => {
        // sort departments by orderBy
        const sortedDepartments = (departments as Department[]).sort((a, b) => a.orderBy - b.orderBy);

        //separate half-yearly and quarterly departments
        const halfYearlyDepts = sortedDepartments.filter((dept) => dept.evolutionType === 'Halfyearly');
        const quarterlyDepts = sortedDepartments.filter((dept) => dept.evolutionType === 'Quarterly');

        // process half-yearly data
        const h1Data: any = {};
        const h2Data: any = {};

        halfYearlyDepts.forEach((dept) => {
            const h1Score = (supplierScore?.supScore as any[])?.find((score) => score.departmentId === dept.departmentId && score.evalutionPeriod === `Halfyearly-1-${selectedYear}`)?.totalScore || 0;

            const h2Score = (supplierScore?.supScore as any[])?.find((score) => score.departmentId === dept.departmentId && score.evalutionPeriod === `Halfyearly-2-${selectedYear}`)?.totalScore || 0;

            h1Data[dept.name.toLowerCase()] = h1Score;
            h2Data[dept.name.toLowerCase()] = h2Score;
        });

        const halfYearlyTableData: any = halfYearlyDepts.map((dept) => ({
            name: dept.name,
            status1: `${Math.round(h1Data[dept.name.toLowerCase()])}%`,
            status2: `${Math.round(h2Data[dept.name.toLowerCase()])}%`
        }));

        // process quarterly data
        const quarterlyTableData: any = quarterlyDepts.map((dept) => {
            const quarters = ['1', '2', '3', '4'];

            const scores = quarters.map((q) => {
                const score = (supplierScore?.supScore as any[])?.find((score) => score.departmentId === dept.departmentId && score.evalutionPeriod === `Quarterly-${q}-${selectedYear}`)?.totalScore || 0;
                return `${Math.round(score)}%`;
            });

            return {
                name: dept.name,
                q1: scores[0],
                q2: scores[1],
                q3: scores[2],
                q4: scores[3]
            };
        });

        const ratingsTableData = supplierScore?.ratings?.map((rating: any) => ({
            name: rating.period,
            status1: `${rating.rating}%`,
            remark: rating.value,
            action: rating.action
        }));

        setHalfYearlyData(halfYearlyTableData);
        setQuarterlyData(quarterlyTableData);
        setRatingsData(ratingsTableData);
    };



    const statusBodyTemplateForRating = (rowData: any, field: any) => {
        const status = rowData[field];
        const percentage = parseInt(status);

        const backgroundColor = getBackgroundColor(percentage);

        return (
            <Tag
                value={status}
                style={{
                    backgroundColor,
                    color: '#fff',
                    width: '80px',
                    textAlign: 'center'
                }}
            />
        );
    };


    const statusBodyTemplate = (rowData: any, field: any, isHalfYearly = false) => {
        const status = rowData[field];
        const percentage = parseInt(status);
        const backgroundColor = getBackgroundColor(percentage);

        const period = isHalfYearly ?
            `Halfyearly-${field === 'status1' ? '1' : '2'}-${selectedYear}` :
            `Quarterly-${field.slice(1)}-${selectedYear}`;

        const depId = (departments as any[])?.find(
            (dept: any) => dept?.name.toLowerCase() === rowData.name.toLowerCase()
        )?.departmentId || '';


        const handleIconClick = async (e: React.MouseEvent) => {
            e.stopPropagation();
            setDialogVisible(true);
            await fetchSpecificSupplierWithLessScore(depId, period);
        };

        const handleAddFeedbackClick = async (e: React.MouseEvent) => {
            e.stopPropagation();
            setDialogVisible(true);
            await fetchSpecificSupplierCheckedData(depId, period);
        };

        return (
            <div className="flex align-items-center gap-2">
                <Tag
                    value={status}
                    style={{
                        backgroundColor,
                        color: '#fff',
                        width: '80px',
                        textAlign: 'center'
                    }}
                />
                {percentage <= 50 && percentage !== 0 && !isSupplier() && (
                    <i className="pi pi-info-circle text-yellow-500 cursor-pointer" onClick={handleIconClick} />
                )}

                {percentage <= 50 && percentage !== 0 && isSupplier() && (
                    <Badge value="+ Feedback" severity="success" onClick={handleAddFeedbackClick} className="cursor-pointer" />
                )}
            </div>
        );
    };

    const nameBodyTemplate = (rowData: any) => {
        return <span className="text-primary-main font-bold">{rowData.name}</span>;
    };

    const years = [
        { label: '2025', value: '2025' },
        { label: '2024', value: '2024' },
        { label: '2023', value: '2023' },
        { label: '2022', value: '2022' }
    ];


    const headerComp = () => {
        return (
            <div className="flex justify-content-between ">
                <div className="flex justify-content-start">
                    <Dropdown id="role" value={selectedYear} options={years} onChange={(e) => setSelectedYear(e.value)} placeholder="Select Year" className="w-full" />
                </div>

                <div className="flex-1 justify-content-start gap-2">
                    {hasPermission('approve_score') && (
                        <Link href={`/supplier-scoreboard-summary/${encodeRouteParams({ supId, catId, subCatId, currentYear: selectedYear })}/approver`}>
                            <Button label="View Inputs" outlined className="!font-light text-color-secondary ml-4" />
                        </Link>
                    )}

                    {hasPermission('evaluate_score') && (
                        <Link href={`/supplier-scoreboard-summary/${encodeRouteParams({ supId, catId, subCatId, currentYear: selectedYear })}/supplier-rating`}>
                            <Button label="Add Inputs" outlined className="!font-light text-color-secondary ml-4" />
                        </Link>
                    )}
                </div>

                <div className="flex justify-content-end">

                    <PDFDownloadLink
                        document={<SupplierScoreboardPDF supplierData={suppliers} ratingsData={ratingsData} selectedYear={selectedYear} chartImage={chartImage} quarterlyData={quarterlyData} halfYearlyData={halfYearlyData} />}
                        fileName={`Supplier-scoreboard-summary-${supId}.pdf`}
                        style={{ color: 'white', marginLeft: 10 }}
                    >
                        <Button icon="pi pi-download" size="small" label="Donwload PDF" className="default-button" aria-label="Donwload PDF" disabled={!pdfReady} />
                    </PDFDownloadLink>
                </div>
            </div>
        );
    };
    const renderHeader = headerComp();
    const valuesPopupHeader = () => {
        return (
            <div className="flex justify-content-between">
                <div className="flex-1">
                    <div className="text-2xl font-medium text-gray-800">Evaluation Period - {bottomFlatData?.evaluationPeriod ? formatEvaluationPeriod(bottomFlatData.evaluationPeriod) : 'N/A'}</div>
                    <div className="text-sm text-gray-500 mt-1">Evaluation Score - {bottomFlatData?.totalScore ? Math.round(bottomFlatData.totalScore) : 'N/A'}</div>
                    <div className="text-sm text-gray-500 mt-1">Department - {bottomFlatData?.department?.name}</div>
                    {bottomFlatData?.scoreApprovals?.approvalStatus && <div className="text-sm text-gray-500 mt-1">Approval Status - {bottomFlatData.scoreApprovals.approvalStatus}</div>}
                </div>

                {isSupplier() && (
                    <div className="mr-4">
                        <Link href={`/supplier-feedback/${encodeRouteParams({ departmentId: bottomFlatData?.departmentId, period: bottomFlatData?.evalutionPeriod })}`}>
                            <Button label="Add Feedback" outlined className="bg-green-500 text-white border-none" />
                        </Link>
                    </div>
                )}
            </div>
        );
    };
    const dataPanel = () => {
        return (
            <div className="card">
                <div className="mb-4">{renderHeader}</div>
                <div>
                    {/* Half-yearly Table */}
                    {isLoading ? (
                        <SupplierSummaryTableSkeleton rowsCount={2} columnsCount={3} />
                    ) : (
                        <div className="card custom-box-shadow p-0">
                            <DataTable value={halfYearlyData} tableStyle={{ minWidth: '60rem' }}>
                                <Column body={nameBodyTemplate} field="name" style={{ width: '20%' }} />
                                <Column style={{ width: '20%' }} />
                                <Column header={`H1 ${selectedYear}`} body={(rowData) => statusBodyTemplate(rowData, 'status1', true)} style={{ width: '20%' }} />
                                <Column style={{ width: '20%' }} />
                                <Column header={`H2 ${selectedYear}`} body={(rowData) => statusBodyTemplate(rowData, 'status2', true)} style={{ width: '20%' }} />
                            </DataTable>
                        </div>
                    )}

                    {/* Quarterly Table */}
                    {isLoading ? (
                        <SupplierSummaryTableSkeleton rowsCount={3} columnsCount={5} />
                    ) : (
                        <div className="card custom-box-shadow p-0">
                            <DataTable value={quarterlyData} tableStyle={{ minWidth: '60rem' }}>
                                <Column body={nameBodyTemplate} field="name" style={{ width: '20%' }} />
                                <Column header={`Q1 ${selectedYear}`} body={(rowData) => statusBodyTemplate(rowData, 'q1')} style={{ width: '20%' }} />
                                <Column header={`Q2 ${selectedYear}`} body={(rowData) => statusBodyTemplate(rowData, 'q2')} style={{ width: '20%' }} />
                                <Column header={`Q3 ${selectedYear}`} body={(rowData) => statusBodyTemplate(rowData, 'q3')} style={{ width: '20%' }} />
                                <Column header={`Q4 ${selectedYear}`} body={(rowData) => statusBodyTemplate(rowData, 'q4')} style={{ width: '20%' }} />
                            </DataTable>
                        </div>
                    )}

                    {/* Ratings Table */}
                    {isLoading ? (
                        <SupplierSummaryTableSkeleton rowsCount={4} columnsCount={4} />
                    ) : (
                        <div className="card custom-box-shadow p-0">
                            <DataTable value={ratingsData} tableStyle={{ minWidth: '60rem' }}>
                                <Column field="name" header="Quarter" className="font-bold" style={{ width: '20%' }} />
                                <Column header="Rating" body={(rowData) => statusBodyTemplateForRating(rowData, 'status1')} style={{ width: '20%' }} />
                                <Column field="remark" header="Remark" style={{ width: '200px' }} />
                                <Column field="action" header="Action Needed" style={{ width: '250px' }} />
                            </DataTable>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderDataPanel = dataPanel();



    const prepareChartData = () => {
        //chart 1
        const ratingLabels = ratingsData?.map((rating: any) => rating.name) || [];
        const ratingValues = ratingsData?.map((rating: any) => parseFloat(rating.status1.replace('%', ''))) || [];

        const ratingData = {
            labels: ratingLabels,
            datasets: [
                {
                    label: 'Rating',
                    data: ratingValues,
                    backgroundColor: '#1F77B4',
                    borderColor: '#1F77B4',
                    borderWidth: 1,
                    barThickness: 100
                }
            ]
        };

        //chart 2
        const periods = [`Q1 ${selectedYear}`, `Q2/H1 ${selectedYear}`, `Q3 ${selectedYear}`, `Q4/H2 ${selectedYear}`];

        const departmentColors: any = {
            procurement: '#3F5169',
            sustainability: '#FFC60C',
            planning: '#EC7D31',
            quality: '#00AF50',
            development: '#00ADF0'
        };

        const datasets: any = [];

        // process quarterly departments
        quarterlyData.forEach((dept: any) => {
            const data = periods.map((period) => {
                if (period.includes('Q1')) return parseFloat(dept.q1.replace('%', ''));
                if (period.includes('Q2')) return parseFloat(dept.q2.replace('%', ''));
                if (period.includes('Q3')) return parseFloat(dept.q3.replace('%', ''));
                if (period.includes('Q4')) return parseFloat(dept.q4.replace('%', ''));
                return null;
            });

            datasets.push({
                label: dept.name,
                data: data,
                backgroundColor: departmentColors[dept.name.toLowerCase()],
                borderColor: departmentColors[dept.name.toLowerCase()],
                borderWidth: 1,
                tension: 0.01
            });
        });

        // process half-yearly departments
        halfYearlyData.forEach((dept: any) => {
            const data = periods.map((period) => {
                if (period.includes('H1')) return parseFloat(dept.status1.replace('%', ''));
                if (period.includes('H2')) return parseFloat(dept.status2.replace('%', ''));
                return null; // Return null for Q1 and Q3 periods
            });

            datasets.push({
                label: dept.name,
                data: data,
                backgroundColor: departmentColors[dept.name.toLowerCase()],
                borderColor: departmentColors[dept.name.toLowerCase()],
                borderWidth: 1,
                tension: 0.01
            });
        });

        const lineData = {
            labels: periods,
            datasets: datasets
        };

        return { ratingData, lineData };
    };

    const { ratingData, lineData } = React.useMemo(() => prepareChartData(), [halfYearlyData, quarterlyData, ratingsData]);

    return (
        <>
            <div className="grid">
                <div className="col-12">
                    <div><SupplierScoreboardSummaryCard suppliers={suppliers} isLoading={isLoading} /></div>
                </div>
                <div className="col-12">
                    <div>{renderDataPanel}</div>
                </div>
                <div className="col-12">{isLoading ?
                    <PerformanceRatingSkeleton />
                    :
                    <GraphsPanel
                        ratingData={ratingData}
                        memoizedOptions={memoizedOptions}
                        lineData={lineData}
                        memoizedBarOptions={memoizedBarOptions}
                        chartRef={chartRef} chartImage={chartImage}
                        setChartImage={setChartImage}
                        setPdfReady={setPdfReady}
                        pdfReady={pdfReady}
                        selectedYear={selectedYear}
                        ratingsData={ratingsData}
                    />}</div>
            </div>

            <Dialog
                visible={dialogVisible}
                style={{ width: '80vw' }}
                className="delete-dialog"
                onHide={() => setDialogVisible(false)}
                header={valuesPopupHeader}
                modal
                closeOnEscape
                dismissableMask
            >
                {isPopupLoading ? (
                    <div className="flex justify-content-center align-items-center" style={{ height: '200px' }}>
                        <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" />
                    </div>
                ) : (
                    <div className="flex flex-column w-full surface-border p-1 gap-4">
                        <div></div>
                        <div>
                            <DataTable value={evaluationData}>
                                <Column field="type" header="Type" style={{ width: '250px' }} />
                                <Column field="criteria" header="Criteria" style={{ width: '250px' }} />
                                <Column field="ratio" header="Ratio (%)" style={{ width: '250px' }} />
                                <Column field="evaluation" header="Evaluation" style={{ width: '250px' }} />
                                <Column field="score" header="Score" style={{ width: '250px' }} />
                            </DataTable>
                        </div>
                    </div>
                )}
            </Dialog>
        </>
    );
};

export default SupplierScoreboardTables;