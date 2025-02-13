/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import { useAppContext } from '@/layout/AppWrapper';
import { DeleteCall, GetCall, PostCall } from '@/app/api-config/ApiKit';
import { CustomResponse, Rules } from '@/types';
import { ColumnBodyOptions } from 'primereact/column';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const SetRulesPage = () => {
    const router = useRouter();
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [rules, setRules] = useState<Rules[]>([]);
    const [totalRecords, setTotalRecords] = useState();
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [visible, setVisible] = useState(false);
    const [date, setDate] = useState<Date | null>(null);
    const [selectedRuleId, setSelectedRuleId] = useState();
    const [action, setAction] = useState(null);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
    const [isAllDeleteDialogVisible, setIsAllDeleteDialogVisible] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [procurementCategories, setprocurementCategories] = useState([]);
    const [filterCategories, setCategories] = useState([]);
    const [supplierDepartment, setSupplierDepartment] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedglobalSearch, setGlobalSearch] = useState('');
    const [SelectedSubCategory, setSelectedSubCategory] = useState('');
    const searchParams = useSearchParams();
    const ruleSetId = searchParams.get('ruleSetId');
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [dialogVisible, setDialogVisible] = useState(false);

    const limitOptions = [
        { label: '10', value: 10 },
        { label: '20', value: 20 },
        { label: '50', value: 50 },
        { label: '70', value: 70 },
        { label: '100', value: 100 }
    ];

    // Handle limit change
    const onCategorychange = (e: any) => {
        setSelectedCategory(e.value); // Update limit
        fetchprocurementCategories(e.value);
        fetchData({
            limit: limit,
            page: page,
            include: 'subCategories,categories,department',
            filters: {
                categoryId: e.value
            }
        });
    };
    // Handle limit change
    const onDepartmentChange = (e: any) => {
        setSelectedDepartment(e.value);
        fetchData({
            limit: limit,
            page: page,
            include: 'subCategories,categories,department',
            filters: {
                departmentId: e.value
            }
        });
    };

    // Handle limit change
    const onSubCategorychange = (e: any) => {
        setSelectedSubCategory(e.value); // Update limit
        fetchData({
            limit: limit,
            page: page,
            include: 'subCategories,categories,department',
            filters: {
                subCategoryId: e.value
            }
        });
    };
    const onGlobalSearch = (e: any) => {
        setGlobalSearch(e.target?.value); // Update limit
        fetchData({ limit: limit, page: page, include: 'subCategories,categories,department', search: e.target?.value });
    };

    // Handle limit change
    const onLimitChange = (e: any) => {
        setLimit(e.value); // Update limit
        fetchData({ limit: e.value, page: 1, include: 'subCategories,categories,department' }); // Fetch data with new limit
    };
    useEffect(() => {
        fetchData();
        fetchsupplierCategories();
        fetchsupplierDepartment();
    }, [limit, page]);

    const handleCreateNavigation = () => {
        router.push(`/rules/set-rules/create-new-rules?ruleSetId=${ruleSetId}`);
    };
    const handleEditRules = (ruleSetId: any, ruleId: any) => {
        router.push(`/rules/set-rules/create-new-rules?edit=true&ruleSetId=${ruleSetId}&ruleId=${ruleId}`);
    };
    const { isLoading, setLoading, setAlert } = useAppContext();
    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <span className="p-input-icon-left flex align-items-center">
                    <h3 className="mb-0">Manage Rules</h3>
                </span>
                <div className="flex justify-content-end">
                    <Button icon="pi pi-plus" size="small" label="Add Rules" aria-label="Add Rule" className="bg-primary-main border-primary-main hover:text-white" onClick={handleCreateNavigation} style={{ marginLeft: 10 }} />
                </div>
            </div>
        );
    };

    const header = renderHeader();

    const fetchData = async (params?: any) => {
        try {
            if (!params) {
                params = { limit: limit, page: page, include: 'subCategories,department,categories', sortOrder: 'asc' };
            }

            setPage(params.page);

            const queryString = buildQueryParams(params);

            console.log(queryString);

            const response = await GetCall(`company/rules/${ruleSetId}?${queryString}`);

            setTotalRecords(response.total);
            setRules(response.data);
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };
    console.log('159',rules)

    const dataTableHeaderStyle = { fontSize: '12px' };

    useEffect(() => {
        fetchData();
    }, []);
    const fetchprocurementCategories = async (categoryId: number | null) => {
        if (!categoryId) {
            setprocurementCategories([]);
            return;
        }
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/sub-category/${categoryId}`); // get all the roles
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setprocurementCategories(response.data);
        } else {
            setprocurementCategories([]);
        }
    };
    const fetchsupplierCategories = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/category`); // get all the roles
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setCategories(response.data);
        } else {
            setCategories([]);
        }
    };
    const fetchsupplierDepartment = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/company/department`); // get all the roles
        setLoading(false);
        if (response.code == 'SUCCESS') {
            setSupplierDepartment(response.data);
        } else {
            setSupplierDepartment([]);
        }
    };

    const dropdownMenuDepartment = () => {
        return (
            <Dropdown
                value={selectedDepartment}
                onChange={onDepartmentChange}
                options={supplierDepartment}
                optionValue="departmentId"
                placeholder="Select Department"
                optionLabel="name"
                className="w-full md:w-10rem"
                showClear={!!selectedDepartment}
            />
        );
    };

    const dropdownFieldDeparment = dropdownMenuDepartment();

    const dropdownCategory = () => {
        return (
            <Dropdown value={selectedCategory} onChange={onCategorychange} options={filterCategories} optionValue="categoryId" placeholder="Select Category" optionLabel="categoryName" className="w-full md:w-10rem" showClear={!!selectedCategory} />
        );
    };
    const dropdownFieldCategory = dropdownCategory();

    const dropdownMenuSubCategory = () => {
        return (
            <Dropdown
                value={SelectedSubCategory}
                onChange={onSubCategorychange}
                options={procurementCategories}
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
        setLoading(true)
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

    // const expandedData = rules.flatMap((item: any) => {
    //     return item.criteriaEvaluation.map((criteria: string, index: number) => ({
    //         ruleId: item.ruleId,
    //         department: item?.department?.name,
    //         category: item?.categories?.categoryName,
    //         subCategories: item?.subCategories?.subCategoryName,
    //         section: item.section,
    //         ratedCriteria: item.ratedCriteria,
    //         criteriaEvaluation: criteria,
    //         score: item.score[index],
    //         ratiosCopack: item.ratiosCopack,
    //         ratiosRawpack: item.ratiosRawpack,
    //         expandedRowId: `${item.ruleId}-${index}`
    //     }));
    // });
    const openDialog = (item: React.SetStateAction<null>) => {
        setSelectedRow(item);
        setDialogVisible(true);
    };
    
    const closeDialog = () => {
        setDialogVisible(false);
        setSelectedRow(null);
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
                            <div className="flex justify-content-between items-center border-b">
                                <div>
                                    <Dropdown className="mt-2" value={limit} options={limitOptions} onChange={onLimitChange} placeholder="Limit" style={{ width: '100px', height: '30px' }} />
                                </div>
                                <div className="flex  gap-2">
                                    <div className="mt-2">{dropdownFieldDeparment}</div>
                                    <div className="mt-2">{dropdownFieldCategory}</div>
                                    <div className="mt-2">{dropdownFieldSubCategory}</div>
                                    <div className="mt-2">{FieldGlobalSearch}</div>
                                </div>
                            </div>
                            <CustomDataTable
                                ref={dataTableRef}
                                page={page}
                                limit={limit}
                                totalRecords={totalRecords}
                                isDelete={true} 
                                extraButtons={(item) => [
                                    {
                                        icon: 'pi pi-user-edit',
                                        onClick: (e) => {
                                            handleEditRules(ruleSetId, item.ruleId); 
                                        }
                                    },
                                    {
                                        icon: 'pi pi-eye',
                                        onClick: () => openDialog(item)
                                    }
                                ]}
                                data={rules}
                                columns={[
                                    {
                                        header: 'SR. NO',
                                        body: (data: any, options: any) => {
                                            const normalizedRowIndex = options.rowIndex % limit;
                                            const srNo = (page - 1) * limit + normalizedRowIndex + 1;

                                            return <span>{srNo}</span>;
                                        },
                                        bodyStyle: { minWidth: 50, maxWidth: 50 }
                                    },
                                    {
                                        header: 'DEPARTMENT ',
                                        field: 'department.name',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'PROCUREMENT CATEGORY ',
                                        field: 'categories.categoryName',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'SUPPLIER CATEGORY',
                                        field: 'subCategories.subCategoryName',
                                        headerStyle: dataTableHeaderStyle,
                                        style: { minWidth: 150, maxWidth: 150 }
                                    },
                                    {
                                        header: 'CRITERIA CATEGORY',
                                        field: 'section',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'CRITERIA',
                                        field: 'ratedCriteria',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    // {
                                    //     header: 'CRITERIA EVALUATION',
                                    //     field: 'criteriaEvaluation',
                                    //     body: (data: any, options: ColumnBodyOptions) => {
                                    //       const rowIndex = options.rowIndex;
                                    //       const isExpanded = expandedRows[rowIndex] || false;
                                      
                                    //       if (!Array.isArray(data.criteriaEvaluation)) return null; // Ensure it's an array
                                      
                                    //       const joinedText = data.criteriaEvaluation.join(', '); // Join array values
                                    //       const words = joinedText.split(' ');
                                    //       const isLongText = words.length > 5;
                                    //       const displayText = isExpanded ? joinedText : words.slice(0, 5).join(' ') + (isLongText ? '...' : '');
                                      
                                    //       const toggleExpand = () => {
                                    //         setExpandedRows((prev) => ({
                                    //           ...prev,
                                    //           [rowIndex]: !isExpanded
                                    //         }));
                                    //       };
                                      
                                    //       return (
                                    //         <span>
                                    //           {displayText}
                                    //           {isLongText && (
                                    //             <button
                                    //               onClick={toggleExpand}
                                    //               style={{
                                    //                 color: 'red',
                                    //                 cursor: 'pointer',
                                    //                 border: 'none',
                                    //                 background: 'none',
                                    //                 marginLeft: '5px',
                                    //                 fontSize: '10px'
                                    //               }}
                                    //             >
                                    //               {isExpanded ? 'Read Less' : 'Read More'}
                                    //             </button>
                                    //           )}
                                    //         </span>
                                    //       );
                                    //     },
                                    //     bodyStyle: { minWidth: 150, maxWidth: 150 },
                                    //     headerStyle: dataTableHeaderStyle
                                    //   },
                                    //   {
                                    //     header: 'CRITERIA SCORE',
                                    //     field: 'score',
                                    //     body: (data: any) => {
                                    //       if (!Array.isArray(data.score)) return null; // Ensure it's an array
                                      
                                    //       return (
                                    //         <div style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
                                    //           {data.score.map((value: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | React.PromiseLikeOfReactNode | null | undefined, index: React.Key | null | undefined) => (
                                    //             <span key={index} style={{ padding: '2px 5px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                    //               {value}
                                    //             </span>
                                    //           ))}
                                    //         </div>
                                    //       );
                                    //     },
                                    //     bodyStyle: { minWidth: 150, maxWidth: 150, textAlign: 'center' },
                                    //     headerStyle: dataTableHeaderStyle
                                    //   },
                                      
                                    {
                                        header: 'RATIOS COPACK (%)',
                                        field: 'ratiosCopack',
                                        bodyStyle: { minWidth: 50, maxWidth: 50, textAlign: 'center' },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'RATIOS RAW&PACK (%)',
                                        field: 'ratiosRawpack',
                                        bodyStyle: { minWidth: 50, maxWidth: 50, textAlign: 'center' },
                                        headerStyle: dataTableHeaderStyle
                                    }
                                ]}
                                onLoad={(params: any) => fetchData(params)}
                                onDelete={(item: any) => onRowSelect(item, 'delete')}
                            />
                        </div>
                    </div>
                </div>
            <Dialog header="Criteria Evaluation & Score:" visible={dialogVisible} onHide={closeDialog} style={{ width: '500px' }}>
                {selectedRow && (
                    <div>
                        <ul>
                            {selectedRow.criteriaEvaluation?.map((item: any, index: number) => (
                                <li key={index} className="mb-3">
                                    {item} - <strong>{selectedRow.score?.[index] || 'N/A'}</strong>
                                </li>
                            )) || <li>N/A</li>}
                        </ul>
                    </div>
                )}
            </Dialog>


                <Dialog
                    header="Delete confirmation"
                    visible={isDeleteDialogVisible}
                    style={{ width: layoutState.isMobile ? '90vw' : '35vw' }}
                    className="delete-dialog"
                    footer={
                        <div className="flex justify-content-center p-2">
                            <Button label="Cancel" style={{ color: '#DF1740' }} className="px-7" text onClick={closeDeleteDialog} />
                            <Button label="Delete" style={{ backgroundColor: '#DF1740', border: 'none' }} className="px-7 hover:text-white" onClick={onDelete} />
                        </div>
                    }
                    onHide={closeDeleteDialog}
                >
                    {isLoading && (
                        <div className="center-pos">
                            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                        </div>
                    )}
                    <div className="flex flex-column w-full surface-border p-3 text-center gap-4">
                        <i className="pi pi-info-circle text-6xl" style={{ marginRight: 10, color: '#DF1740' }}></i>

                        <div className="flex flex-column align-items-center gap-1">
                            <span>{isAllDeleteDialogVisible ? 'Are you sure you want to delete all rule.' : 'Are you sure you want to delete selected rule.'}</span>
                            <span>This action cannot be undone. </span>
                        </div>
                    </div>
                </Dialog>
            </div>
        </div>
    );
};

export default SetRulesPage;
