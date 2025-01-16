/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import { useAppContext } from '@/layout/AppWrapper';
import { DeleteCall, GetCall, PostCall } from '@/app/api-config/ApiKit';
import { CustomResponse, Rules, Scores } from '@/types';
import ScoreTiles from '@/components/supplier-score/score-tiles';
import FilterDropdowns from '@/components/supplier-score/filter-dropdown';
import useFetchDepartments from '@/hooks/useFetchDepartments';
import useFetchSuppliers from '@/hooks/useFetchSuppliers';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const ManageSupplierScorePage = () => {
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [selectedRuleId, setSelectedRuleId] = useState();
    const [action, setAction] = useState(null);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
    const [rules, setRules] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState();

    const [filters, setFilters] = useState<any>();

    const [category, setCategory] = useState<any>([]);
    const [allSuppliers, setAllSuppliers] = useState<any[]>([]);

    const { departments } = useFetchDepartments();
    const { isLoading, setLoading, setAlert } = useAppContext();

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

    const fetchData = async (params?: any) => {
        try {
            if (!params) {
                params = { limit: limit, page: page, sortBy: 'supplierScoreId', sortOrder: 'asc/desc' };
            }

            if (filters) {
                params.filters = {
                    // ...params,
                    supId: filters.supplier,
                    departmentId: filters.department,
                    evalutionPeriod: filters.period,
                    categoryId: filters.category
                };
            }

            setPage(params.page);

            const queryString = buildQueryParams(params);

            console.log('Fetching data with params:', queryString); // Debug log

            const response = await GetCall(`company/supplier-score?${queryString}`);

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

    const fetchCategory = async () => {
        const response: CustomResponse = await GetCall(`/company/category`);
        if (response.code === 'SUCCESS') {
            setCategory(response.data);
        }
    };

    useEffect(() => {
        fetchData();
        fetchCategory();
    }, [filters]);

    const onRowSelect = async (perm: Rules, action: any) => {
        setAction(action);

        setSelectedRuleId(perm.ruleId);

        if (action === ACTIONS.DELETE) {
            openDeleteDialog(perm);
        }
    };

    const openDeleteDialog = (items: Rules) => {
        setIsDeleteDialogVisible(true);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogVisible(false);
    };

    const onDelete = async () => {
        setLoading(true);

        try {
            const response = await DeleteCall(`/company/rules/${selectedRuleId}`);

            if (response.code === 'SUCCESS') {
                setRules((prevRules) => prevRules.filter((rule) => rule.ruleId !== selectedRuleId));
                closeDeleteDialog();
                setAlert('success', 'Rule successfully deleted!');
            } else {
                setAlert('error', 'Something went wrong!');
                closeDeleteDialog();
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filters: any) => {
        console.log(filters);

        setFilters(filters);
    };

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
                            <div>
                                <FilterDropdowns onFilterChange={handleFilterChange} suppliers={allSuppliers} departments={departments} category={category} />
                            </div>

                            <div className="mt-3 ">
                                <ScoreTiles />
                            </div>

                            <CustomDataTable
                                ref={dataTableRef}
                                page={page}
                                limit={limit} // no of items per page
                                totalRecords={totalRecords} // total records from api response
                                data={rules?.map((item: any) => ({
                                    ruleId: item.ruleId,
                                    supplierName: item.supplier?.supplierName,
                                    depName: item.department?.name,
                                    evalutionPeriod: item.evalutionPeriod,
                                    totalScore: item.totalScore,
                                    categoryName: item.category?.categoryName,
                                    subCategoryName: item.subCategory?.subCategoryName,
                                    status: item.status
                                }))}
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
                                        // filter: true,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle,
                                        filterPlaceholder: 'Supplier Id'
                                    },
                                    {
                                        header: 'Type',
                                        field: 'depName',
                                        sortable: true,
                                        filter: true,
                                        filterPlaceholder: 'Supplier Name',
                                        headerStyle: dataTableHeaderStyle,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 }
                                    },
                                    {
                                        header: 'Quarter',
                                        field: 'evalutionPeriod',
                                        filter: true,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle,
                                        filterPlaceholder: 'Search Procurement Category'
                                    },
                                    {
                                        header: 'Supplier Score',
                                        field: 'totalScore',
                                        body: (rowData) => {
                                            const score = rowData.totalScore;
                                            let color = '';

                                            if (score >= 0 && score <= 50) {
                                                color = '#F44336';
                                            } else if (score >= 51 && score <= 70) {
                                                color = '#FF9800';
                                            } else if (score >= 71 && score <= 90) {
                                                color = '#4CAF50';
                                            } else if (score >= 91 && score <= 100) {
                                                color = '#2196F3';
                                            }

                                            return <div style={{ color: color, fontWeight: 'bold' }}>{score}</div>;
                                        },
                                        filter: true,
                                        filterPlaceholder: 'Search Supplier Category',
                                        bodyStyle: { minWidth: 100, maxWidth: 100, textAlign: 'center' },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Procurement Category',
                                        field: 'categoryName',
                                        filter: true,
                                        filterPlaceholder: 'Search Supplier Manufacturing Name',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Supplier Category',
                                        field: 'subCategoryName',
                                        filter: true,
                                        filterPlaceholder: 'Search Site Address',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Status',
                                        field: 'status',
                                        filter: true,
                                        body: (rowData) => {
                                            const status = rowData.status;
                                            const color = status === 'completed' ? 'green' : 'red';

                                            return <div style={{ color: color, fontWeight: 'bold' }}>{status}</div>;
                                        },
                                        filterPlaceholder: 'Search Factory Name',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    }
                                ]}
                                onLoad={(params: any) => fetchData(params)}
                                onDelete={(item: any) => onRowSelect(item, 'delete')}
                            />
                        </div>
                    </div>
                </div>

                <Dialog
                    header="Delete confirmation"
                    visible={isDeleteDialogVisible}
                    style={{ width: layoutState.isMobile ? '90vw' : '50vw' }}
                    className="delete-dialog"
                    headerStyle={{ backgroundColor: '#ffdddb', color: '#8c1d18' }}
                    footer={
                        <div className="flex justify-content-end p-2">
                            <Button label="Cancel" severity="secondary" text onClick={closeDeleteDialog} />
                            <Button label="Delete" severity="danger" onClick={onDelete} />
                        </div>
                    }
                    onHide={closeDeleteDialog}
                >
                    {isLoading && (
                        <div className="center-pos">
                            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                        </div>
                    )}
                    <div className="flex flex-column w-full surface-border p-3">
                        <div className="flex align-items-center">
                            <i className="pi pi-info-circle text-6xl red" style={{ marginRight: 10 }}></i>
                            <span>
                                This will permanently delete the selected rule.
                                <br />
                                Do you still want to delete it? This action cannot be undone.
                            </span>
                        </div>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default ManageSupplierScorePage;
