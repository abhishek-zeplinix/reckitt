/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { buildQueryParams, formatEvaluationPeriod, getBackgroundColor, getRowLimitWithScreenHeight, getSeverity } from '@/utils/utils';
import { Dialog } from 'primereact/dialog';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall } from '@/app/api-config/ApiKit';
import { CustomResponse, SupplierData } from '@/types';
import ScoreTiles from '@/components/supplier-score/score-tiles';
import FilterDropdowns from '@/components/supplier-score/filter-dropdown';
import useFetchDepartments from '@/hooks/useFetchDepartments';
import { withAuth } from '@/layout/context/authContext';
import TableSkeletonSimple from '@/components/skeleton/TableSkeletonSimple';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Badge } from 'primereact/badge';
import { Tag } from 'primereact/tag';
import { encodeRouteParams } from '@/utils/base64';
import { useRouter } from 'next/navigation';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';


const ManageSupplierScorePage = () => {
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [rules, setRules] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState();
    const [filters, setFilters] = useState<any>();
    const [allSuppliers, setAllSuppliers] = useState<any[]>([]);
    const { departments } = useFetchDepartments();
    const { isLoading, setLoading, setAlert } = useAppContext();
    const [dialogVisible, setDialogVisible] = useState(false);
    const [ratingDialogVisible, setRatingDialogVisible] = useState(false);
    const [selectedRating, setSelectedRating] = useState<any>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [filteredScores, setFilteredScores] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedglobalSearch, setGlobalSearch] = useState('');
    const [SelectedSubCategory, setSelectedSubCategory] = useState('');
    const [procurementCategories, setprocurementCategories] = useState([]);
    const [supplierCategories, setsupplierCategories] = useState([]);
    const router = useRouter();


    const fetchData = async (params?: any) => {
        try {
            setLoading(true);
            if (!params) {
                params = { limit: limit, page: page, sortOrder: 'asc/desc' };
            }

            if (filters) {
                params.filters = {
                    // ...params,
                    supId: filters.supplier,
                    // departmentId: filters.department,
                    // evalutionPeriod: filters.period,
                    categoryId: filters.categoryId,
                    subCategoryId: filters.subCategoryId
                };
            }

            setPage(params.page);

            const queryString = buildQueryParams(params);
            const response = await GetCall(`company/manage-supplier-score?${queryString}`);

            setTotalRecords(response.total);
            setRules(response.data);

            if (!filters) {
                setAllSuppliers(response.data);
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const dataTableHeaderStyle = { fontSize: '14px' };


    const fetchprocurementCategories = async (categoryId: number | null) => {
        if (!categoryId) {
            setsupplierCategories([]);
            return;
        }
        const response: CustomResponse = await GetCall(`/company/sub-category/${categoryId}`);
        if (response.code == 'SUCCESS') {
            setsupplierCategories(response.data);
        } else {
            setsupplierCategories([]);
        }
    };

    const fetchsupplierCategories = async () => {
        const response: CustomResponse = await GetCall(`/company/category`);
        if (response.code == 'SUCCESS') {
            setprocurementCategories(response.data);
        } else {
            setprocurementCategories([]);
        }
    };

    useEffect(() => {
        fetchData();
        fetchsupplierCategories();
    }, [filters]);


    const closeDeleteDialog = () => {
        setDialogVisible(false);
    };

    const closeRatingDialog = () => {
        setRatingDialogVisible(false);
        setSelectedRating(null);
    };

    // const handleFilterChange = (filters: any) => {
    //     setFilters(filters);
    // };


    // filter supplier scores based on selected rating period
    const filterScoresByPeriod = (supplier: any, ratingPeriod: string) => {
        if (!supplier || !supplier.supplierScores) return [];

        let filteredScores = [];

        if (ratingPeriod === 'Q1 2025') {
            filteredScores = supplier.supplierScores.filter((score: any) =>
                score.evalutionPeriod.includes('Quarterly-1')
            );
        } else if (ratingPeriod === 'Q2/H1 2025') {
            filteredScores = supplier.supplierScores.filter((score: any) =>
                score.evalutionPeriod.includes('Quarterly-2') ||
                score.evalutionPeriod.includes('Halfyearly-1')
            );
        } else if (ratingPeriod === 'Q3 2025') {
            filteredScores = supplier.supplierScores.filter((score: any) =>
                score.evalutionPeriod.includes('Quarterly-3')
            );
        } else if (ratingPeriod === 'Q4/H2 2025') {
            filteredScores = supplier.supplierScores.filter((score: any) =>
                score.evalutionPeriod.includes('Quarterly-4') ||
                score.evalutionPeriod.includes('Halfyearly-2')
            );
        }

        return filteredScores;
    };

    const viewSupplierRating = (item: any) => {
        setSelectedSupplier(item);
        setDialogVisible(true);
    };

    const viewDepartmentScores = (rating: any) => {

        setSelectedRating(rating);
        setFilteredScores(filterScoresByPeriod(selectedSupplier, rating.period));
        setRatingDialogVisible(true);
        console.log('score', filteredScores);

    };



    const renderHeader = () => {
        return (
            <>
                <div className="flex justify-content-between mt-0">
                    <span className="p-input-icon-left flex align-items-center">
                        <h3 className="mb-0">Suppliers Assessment List</h3>
                    </span>
                </div>
            </>
        );
    };

    const header = renderHeader();

    const statusBodyTemplate = (rowData: any, field: 'isEvaluatedStatus' | 'isApprovalStatus') => {
        return (
            <div className="flex align-items-center">
                <Badge
                    value={rowData?.[field]}
                    severity={getSeverity(rowData?.[field])}
                />
            </div>
        );
    };

    const ratingStatusTemplate = (rowData: any) => {
        return (
            <div className="flex align-items-center">
                <Badge
                    value={rowData?.status}
                    severity={rowData?.status === 'completed' ? 'success' :
                        rowData?.status === 'in progress' ? 'warning' : 'info'}
                />
            </div>
        );
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <Button
                icon="pi pi-eye"
                rounded
                outlined
                className="p-button-md p-button-text hover:bg-primary-main text-primary-main"
                onClick={() => viewDepartmentScores(rowData)}
                tooltip="View Department Scores"
            />
        );
    };

    const periodBodyTemplate = (rowData: any) => {
        return (
            <div className="flex align-items-center">
                {formatEvaluationPeriod(rowData?.evalutionPeriod)}
            </div>
        );
    };


    const scoreBodyTemplate = (rowData: any) => {

        const score = Math.round(rowData?.totalScore || rowData?.rating)
        const backgroundColor = getBackgroundColor(score);

        return (
            <Tag
                value={score}
                style={{
                    backgroundColor,
                    color: '#fff',
                    width: '80px',
                    textAlign: 'center'
                }}
            />
        );
    }

    const nameBodyTemplate = (rowData: any) => {
        return <span className="text-primary-main font-bold">{rowData?.department?.name}</span>;
    };

    const viewEvaluationBodyTemplate = (rowData: any) => {
        const rawYear = rowData?.evalutionPeriod;
        const year = rawYear.match(/\d{4}/)[0];
        const supId = rowData?.supId;
        const catId = selectedSupplier?.category?.categoryId;
        const subCatId = selectedSupplier?.subCategories?.subCategoryId;
        const departmentId = rowData?.departmentId;

        console.log(year, supId, catId, subCatId);

        return (
            <Button
                icon="pi pi-eye"
                rounded
                outlined
                className="p-button-md p-button-text hover:bg-primary-main text-primary-main"
                onClick={() => navigateToCompletedEvaluation(supId, catId, subCatId, year, departmentId, rawYear)}
                tooltip="View Evaluation"
            />
        );
    };

    const navigateToCompletedEvaluation = (supId: number, catId: number, subCatId: number, year: any, departmentId: number, rawYear: string) => {

        const params: any = { supId, catId, subCatId, currentYear: year, departmentId, period: rawYear};

        const encodedParams = encodeRouteParams(params);
        const url = `/supplier-scoreboard-summary/${encodedParams}/supplier-rating`;
        window.open(url, '_blank');
        // router.push(`/supplier-scoreboard-summary/${encodedParams}/supplier-rating`);
    };


    const onCategorychange = (e: any) => {
        setSelectedCategory(e.value);
        fetchprocurementCategories(e.value);
        setFilters({
            categoryId: e.value
        })
        // fetchData({
        //     filters: {
        //         categoryId: e.value
        //     }
        // });
    };

    const onSubCategorychange = (e: any) => {
        setSelectedSubCategory(e.value);

        setFilters({
            ...filters,
            subCategoryId: e.value
        })
        // fetchData({
        //     filters: {
        //         subCategoryId: e.value
        //     }
        // });
    };
    const onGlobalSearch = (e: any) => {
        setGlobalSearch(e.target?.value);
        fetchData({ search: e.target?.value });
    };

    const dropdownCategory = () => {
        return (
            <Dropdown
                value={selectedCategory}
                onChange={onCategorychange}
                options={procurementCategories}
                optionValue="categoryId"
                placeholder="Select Category"
                optionLabel="categoryName"
                className="w-full md:w-10rem"
                showClear={!!selectedCategory}
            />
        );
    };

    const dropdownFieldCategory = dropdownCategory();

    const dropdownMenuSubCategory = () => {
        return (
            <Dropdown
                value={SelectedSubCategory}
                onChange={onSubCategorychange}
                options={supplierCategories}
                optionLabel="subCategoryName"
                optionValue="subCategoryId"
                placeholder="Select Sub Category"
                className="w-full md:w-10rem"
                showClear={!!SelectedSubCategory}
            />
        );
    };
    const dropdownFieldSubCategory = dropdownMenuSubCategory();
    const globalSearch = () => {
        return <InputText value={selectedglobalSearch} onChange={onGlobalSearch} placeholder="Search" className="w-full md:w-10rem" />;
    };
    const FieldGlobalSearch = globalSearch();


    return (
        <div className="grid">
            <div className="col-12">
                <div className={`panel-container ${isShowSplit ? (layoutState.isMobile ? 'mobile-split' : 'split') : ''}`}>
                    <div className="left-panel">
                        <div className="header">{header}</div>
                        <div
                            className="bg-[#ffffff] border border-1  p-3  mt-4 shadow-lg"
                            style={{ borderColor: '#CBD5E1', borderRadius: '10px', WebkitBoxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)', MozBoxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)', boxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)' }}
                        >


                            <div className="flex flex-column gap-3">
                                <div> <ScoreTiles /></div>
                                <div className="flex flex-wrap  gap-2 justify-content-end">
                                    <div className="">{dropdownFieldCategory}</div>
                                    <div className="">{dropdownFieldSubCategory}</div>
                                    <div className="">{FieldGlobalSearch}</div>
                                </div>
                            </div>
                            {isLoading ? (
                                <div className='mt-3'>
                                    <TableSkeletonSimple columns={3} rows={limit} />
                                </div>
                            ) : (
                                <CustomDataTable
                                    ref={dataTableRef}
                                    page={page}
                                    limit={limit} // no of items per page
                                    totalRecords={totalRecords} // total records from api response
                                    data={rules}
                                    extraButtons={(item) => [
                                        {
                                            icon: 'pi pi-eye',
                                            tooltip: 'View Supplier Rating',
                                            onClick: () => viewSupplierRating(item)
                                        },
                                    ]}
                                    columns={[
                                        {
                                            header: 'Sr. No.',
                                            body: (data: any, options: any) => {
                                                const normalizedRowIndex = options.rowIndex % limit;
                                                const srNo = (page - 1) * limit + normalizedRowIndex + 1;

                                                return <span>{srNo}</span>;
                                            },
                                            bodyStyle: { minWidth: 50, maxWidth: 50 }
                                        },

                                        {
                                            header: 'Name',
                                            field: 'supplierName',
                                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                                            headerStyle: dataTableHeaderStyle
                                        },
                                        {
                                            header: 'Category',
                                            field: 'category.categoryName',
                                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                                            headerStyle: dataTableHeaderStyle
                                        },
                                        {
                                            header: 'Sub Category',
                                            field: 'subCategories.subCategoryName',
                                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                                            headerStyle: dataTableHeaderStyle
                                        },
                                        {
                                            header: 'Evaluation Status',
                                            field: 'isEvaluatedStatus',
                                            body: (rowData) => statusBodyTemplate(rowData, 'isEvaluatedStatus'),
                                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                                            headerStyle: dataTableHeaderStyle
                                        },
                                        {
                                            header: 'Approval Status',
                                            field: 'isApprovalStatus',
                                            body: (rowData) => statusBodyTemplate(rowData, 'isApprovalStatus'),
                                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                                            headerStyle: dataTableHeaderStyle
                                        }
                                    ]}

                                    onLoad={(params: any) => fetchData(params)}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* first Dialog -supplier rating overview */}
                <Dialog
                    header="Supplier Ratings"
                    visible={dialogVisible}
                    style={{ width: "60vw" }}
                    onHide={closeDeleteDialog}
                >
                    {selectedSupplier && (
                        <>
                            <div className="mb-4">
                                <DataTable value={[selectedSupplier]} showGridlines>
                                    <Column field="supplierName" header="Supplier" />
                                    <Column field="category.categoryName" header="Category" />
                                    <Column field="subCategories.subCategoryName" header="Sub Category" />
                                </DataTable>
                            </div>

                            <DataTable
                                value={selectedSupplier.ratings}
                                showGridlines
                                header="Ratings"
                            >
                                <Column
                                    field="period"
                                    header="Period" />
                                <Column
                                    header="Rating"
                                    body={scoreBodyTemplate}
                                />
                                <Column
                                    header="Status"
                                    body={ratingStatusTemplate} />
                                <Column
                                    body={actionBodyTemplate}
                                    header="View"
                                    exportable={false} />
                            </DataTable>
                        </>
                    )}
                </Dialog>

                {/* second dialog -department scores for selected rating */}


                <Dialog
                    header={`Department Scores - ${selectedRating?.period || ''}`}
                    visible={ratingDialogVisible}
                    style={{ width: "70vw" }}
                    onHide={closeRatingDialog}
                >
                    {filteredScores && filteredScores.length > 0 ? (
                        <DataTable
                            value={filteredScores}
                            showGridlines
                        >
                            <Column
                                header="Sr. No."
                                body={(data, { rowIndex }) => <span>{rowIndex + 1}</span>}
                                style={{ minWidth: '50px', maxWidth: '50px' }}
                            />
                            <Column
                                field="department.name"
                                body={nameBodyTemplate}
                                header="Department"
                                style={{ minWidth: '150px' }}
                            />
                            <Column
                                body={periodBodyTemplate}
                                header="Evaluation Period"
                                style={{ minWidth: '150px' }}
                            />
                            <Column
                                body={scoreBodyTemplate}
                                header="Total Score"
                                style={{ minWidth: '100px' }}
                            />
                            <Column
                                body={viewEvaluationBodyTemplate}
                                header="View"
                                exportable={false} />
                        </DataTable>
                    ) : (
                        <div className="p-4 text-center">No department scores available for this period.</div>
                    )}
                </Dialog>
            </div>
        </div>
    );
};

export default withAuth(ManageSupplierScorePage, undefined, 'manage_supplier_score');