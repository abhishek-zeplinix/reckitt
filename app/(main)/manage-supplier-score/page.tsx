/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/uitl';
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import { useAppContext } from '@/layout/AppWrapper';
import { sortBy } from 'lodash';
import { SortOrder } from 'primereact/api';
import { DeleteCall, GetCall, PostCall } from '@/app/api-config/ApiKit';
import { CustomResponse, Rules } from '@/types';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const ManageSupplierScorePage = () => {
    const router = useRouter();
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());

    const [selectedRuleId, setSelectedRuleId] = useState();
    const [action, setAction] = useState(null);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSubCategory, setSelectedSubCategory] = useState('');
    const [rules, setRules] = useState<Rules[]>([]);
    const [totalRecords, setTotalRecords] = useState();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);

    const handleCreateNavigation = () => {
        router.push('/create-supplier'); // Replace with the route you want to navigate to
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            setIsDetailLoading(true);
            try {
                // Use the existing PostCall function
                const response: CustomResponse = await PostCall('/company/bulk-rules', formData);

                setIsDetailLoading(false);

                if (response.code === 'SUCCESS') {
                    setAlert('success', 'Rules imported successfully');
                } else {
                    setAlert('error', response.message || 'File upload failed');
                }
            } catch (error) {
                setIsDetailLoading(false);
                console.error('An error occurred during file upload:', error);
                setAlert('error', 'An unexpected error occurred during file upload');
            }
        }
    };
    const { isLoading, setLoading, setAlert } = useAppContext();

    const renderHeader = () => {
        return (
            <>
                <div className="flex justify-content-between">
                    <span className="p-input-icon-left flex align-items-center">
                        <h3 className="mb-0">Manage Supplier Rule</h3>
                    </span>
                    {/* <div className="flex justify-content-end">
                    <Button icon="pi pi-plus" size="small" label="Import Rules" aria-label="Add Rules" className="default-button " onClick={handleButtonClick} style={{ marginLeft: 10 }}>
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".xls,.xlsx" onChange={handleFileChange} />
                    </Button>
                    <Button icon="pi pi-trash" size="small" label="Delete Rules" aria-label="Add Supplier" className="default-button " style={{ marginLeft: 10 }} />
                    <Button icon="pi pi-plus" size="small" label="Add Rules" aria-label="Add Rule" className="bg-pink-500 border-pink-500" onClick={handleCreateNavigation} style={{ marginLeft: 10 }} />
                    </div> */}
                </div>
            </>
        );
    };

    const header = renderHeader();

    const renderInputBox = () => {
        return (
            <div style={{ position: 'relative' }}>
                <InputText placeholder="Search" style={{ paddingLeft: '40px', width: '40%' }} />
                <span
                    className="pi pi-search"
                    style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'gray',
                        fontSize: '1.5rem'
                    }}
                ></span>
            </div>
        );
    };

    const inputboxfeild = renderInputBox();

    const fetchData = async (params?: any) => {
        try {
            if (!params) {
                params = { limit: limit, page: page, include: 'subCategories', sortOrder: 'asc' };
            }

            setPage(params.page);

            const queryString = buildQueryParams(params);

            const response = await GetCall(`company/rules?${queryString}`);

            setTotalRecords(response.total);
            setRules(response.data);
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const dataTableHeaderStyle = { fontSize: '12px' };

    useEffect(() => {
        fetchData();
    }, []);

    const departments = [
        { label: 'Planning', value: 'Planning' },
        { label: 'Quality', value: 'Quality' },
        { label: 'Development', value: 'Development' },
        { label: 'Procurement', value: 'Procurement' },
        { label: 'Sustainability', value: 'Sustainability' }
    ];

    const subcategories = [
        { label: 'Packing Material Supplier', value: 'Packing Material Supplier' },
        { label: 'Raw Material Supplier', value: 'Raw Material Supplier' },
        { label: 'Copack Material Supplier', value: 'Copack Material Supplier' }
    ];

    const dropdownMenuDepartment = () => {
        return <Dropdown value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.value)} options={departments} optionLabel="label" placeholder="-- Select Department --" className="w-full md:w-[15rem] lg:w-[25rem] xl:w-[25rem]" />;
    };

    const dropdownFieldDeparment = dropdownMenuDepartment();

    const dropdownMenuSubCategory = () => {
        return <Dropdown value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.value)} options={subcategories} optionLabel="label" placeholder="-- Select Sub Category --" className="w-full md:w-[15rem] lg:w-[25rem] xl:w-[25rem]" />;
    };

    const dropdownFieldSubCategory = dropdownMenuSubCategory();

    const representationColor = () => {
        return (
            <div className="col-span-12">
                <div className="legend-box flex justify-between">
                    <div className="legend-item flex items-center">
                        <span className="legend-color w-4 h-4 rounded-full" style={{ backgroundColor: '#F44336' }}></span>
                        <span className="legend-label ml-2">Critical (0-50)</span>
                    </div>
                    <div className="legend-item flex items-center mt-2">
                        <span className="legend-color w-4 h-4 rounded-full" style={{ backgroundColor: '#FF9800' }}></span>
                        <span className="legend-label ml-2">Improvement Needed (51-70)</span>
                    </div>
                    <div className="legend-item flex items-center mt-2">
                        <span className="legend-color w-4 h-4 rounded-full" style={{ backgroundColor: '#4CAF50' }}></span>
                        <span className="legend-label ml-2">Good (71-90)</span>
                    </div>
                    <div className="legend-item flex items-center mt-2">
                        <span className="legend-color w-4 h-4 rounded-full" style={{ backgroundColor: '#2196F3' }}></span>
                        <span className="legend-label ml-2">Excellent (91-100)</span>
                    </div>
                </div>
            </div>
        );
    };

    const RepresentationColor = representationColor();

    const onRowSelect = async (perm: Rules, action: any) => {
        setAction(action);

        setSelectedRuleId(perm.ruleId);

        if (action === ACTIONS.DELETE) {
            openDeleteDialog(perm);
        }
        // if (action === ACTIONS.VIEW) {
        //     setIsShowSplit(true);
        // }
        // if (action === ACTIONS.EDIT) {
        //     setIsShowSplit(true);
        //     // fetchSoDetails(perm.estimateId)
        // }
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
                            {/* <div className="search-box  mt-5 w-70">{inputboxfeild}</div> */}
                            <div className="flex flex-wrap gap-2 md:justify-between lg:justify-start">
                                <div className="mt-5 w-full md:w-auto">{dropdownFieldDeparment}</div>
                                <div className="mt-5 w-full md:w-auto">{dropdownFieldDeparment}</div>
                                <div className="mt-5 w-full md:w-auto">{dropdownFieldDeparment}</div>
                                <div className="mt-5 w-full md:w-auto">{dropdownFieldSubCategory}</div>
                            </div>

                            <div className="mt-5 ">{RepresentationColor}</div>

                            <CustomDataTable
                                ref={dataTableRef}
                                filter
                                page={page}
                                limit={limit} // no of items per page
                                totalRecords={totalRecords} // total records from api response
                                // isView={true}
                                // isEdit={true} // show edit button
                                // isDelete={true} // show delete button
                                // extraButtons={[
                                //     {
                                //         icon: 'pi pi-cloud-upload',
                                //         onClick: (item) => openDialog()
                                //     },
                                //     {
                                //         icon: 'pi pi-external-link',
                                //         onClick: async (item) => {
                                //             setDialogVisible(true);
                                //             setPoId(item.poId); // Set the poId from the clicked item

                                //             await fetchTrackingData(item.poId);
                                //         }
                                //     }
                                // ]}
                                data={rules.map((item: any) => ({
                                    ruleId: item.ruleId,
                                    subCategoryName: item.subCategories?.subCategoryName,
                                    section: item.section,
                                    ratedCriteria: item.ratedCriteria,
                                    criteriaEvaluation: item.criteriaEvaluation,
                                    score: item.score,
                                    ratiosCopack: item.ratiosCopack,
                                    ratiosRawpack: item.ratiosRawpack
                                }))}
                                columns={[
                                    {
                                        header: 'Sr No',
                                        field: 'ruleId',
                                        filter: true,
                                        sortable: true,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle,
                                        filterPlaceholder: 'Sr No'
                                    },
                                    {
                                        header: 'Supplier Name',
                                        field: 'supplierid',
                                        // body: renderVendor,
                                        filter: true,
                                        // filterElement: vendorDropdown,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle,
                                        filterPlaceholder: 'Supplier Id'
                                    },
                                    {
                                        header: 'Type',
                                        field: 'subCategoryName',
                                        sortable: true,
                                        filter: true,
                                        filterPlaceholder: 'Supplier Name',
                                        headerStyle: dataTableHeaderStyle,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 }
                                    },
                                    {
                                        header: 'Quarter',
                                        field: 'section',
                                        // body: renderWarehouse,
                                        filter: true,
                                        // filterElement: warehouseDropdown,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle,
                                        filterPlaceholder: 'Search Procurement Category'
                                    },
                                    {
                                        header: 'Supplier Score',
                                        field: 'ratedCriteria',
                                        // body: renderStatus,
                                        filter: true,
                                        filterPlaceholder: 'Search Supplier Category',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                        // filterElement: statusDropdown
                                    },
                                    {
                                        header: 'Procurement Category',
                                        field: 'criteriaEvaluation',
                                        filter: true,
                                        filterPlaceholder: 'Search Supplier Manufacturing Name',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                        // body: renderPOTotal
                                    },
                                    {
                                        header: 'Supplier Category',
                                        field: 'score',
                                        filter: true,
                                        filterPlaceholder: 'Search Site Address',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Status',
                                        field: 'ratiosCopack',
                                        filter: true,
                                        filterPlaceholder: 'Search Factory Name',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    }
                                ]}
                                onLoad={(params: any) => fetchData(params)}
                                // // onView={(item: any) => onRowSelect(item, 'view')}
                                // onEdit={(item: any) => onRowSelect(item, 'edit')}
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
