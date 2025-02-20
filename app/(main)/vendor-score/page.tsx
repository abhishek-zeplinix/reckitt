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
import { Dropdown } from 'primereact/dropdown';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import { useAppContext } from '@/layout/AppWrapper';
import { DeleteCall, GetCall, PostCall } from '@/app/api-config/ApiKit';
import { CustomResponse, Rules, SetRulesDir } from '@/types';
import { FileUpload } from 'primereact/fileupload';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
// import { useLoaderContext } from '@/layout/context/LoaderContext';
import { RadioButton } from 'primereact/radiobutton';
import { limitOptions } from '@/utils/constant';
import TableSkeletonSimple from '@/components/supplier-rating/skeleton/TableSkeletonSimple';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const MainRules = () => {
    const router = useRouter();
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [rules, setRules] = useState<SetRulesDir[]>([]);
    const [totalRecords, setTotalRecords] = useState();
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [visible, setVisible] = useState(false);
    const [date, setDate] = useState<Date | null>(null);
    const [selectedRuleSetId, setSelectedRuleSetId] = useState<any>([]);
    const [action, setAction] = useState(null);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
    const [isAllDeleteDialogVisible, setIsAllDeleteDialogVisible] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [procurementCategories, setprocurementCategories] = useState([]);
    const [filterCategories, setCategories] = useState([]);
    const [supplierDepartment, setSupplierDepartment] = useState([]);
    const [rulesGroup, setRulesGroup] = useState('');
    const [selectedglobalSearch, setGlobalSearch] = useState('');
    const [SelectedSubCategory, setSelectedSubCategory] = useState('');
    const [chooseRules, setChooseRules] = useState('');
    const [selectedRuleType, setSelectedRuleType] = useState<string | null>(null);
    const [bulkDialogVisible, setBulkDialogVisible] = useState(false);
    const [responseData, setResponseData] = useState<any>(null);


    const tableData= [
        {
            serialNumber:1,
            section: "Section 1",
            criteria: "Criteria 1",
            account: "Agency 1",
            Score: 35,
            assessorType: "Type 1",
            assessorRole: "Role 1",
            assessorName: "Name 1",
            type: "Type 1",
            region: "Region 1",
            country: "Country 1",
            division: "Division 1",
            brand: "Brand 1",
            location: "Location 1",
            jobFunction: "Function 1",
            segment: "Segment 1",
            reportingMonth: "Month 1",
            evaluationName: "Evaluation 1",
            profile: "Profile 1"
        },
        {
            serialNumber:2,
            section: "Section 2",
            criteria: "Criteria 2",
            account: "Agency ",
            Score: 35,
            assessorType: "Type 2",
            assessorRole: "Role 2",
            assessorName: "Name 2",
            type: "Type 2",
            region: "Region 2",
            country: "Country 2",
            division: "Division 2",
            brand: "Brand 2",
            location: "Location 2",
            jobFunction: "Function 2",
            segment: "Segment 2",
            reportingMonth: "Month 2",
            evaluationName: "Evaluation 2",
            profile: "Profile 2"
        },
        {
            serialNumber:3,
            section: "Section 3",
            criteria: "Criteria 3",
            account: "Agency 3",
            Score: 35,
            assessorType: "Type 3",
            assessorRole: "Role 3",
            assessorName: "Name 3",
            type: "Type 3",
            region: "Region 3",
            country: "Country 3",
            division: "Division 3",
            brand: "Brand 3",
            location: "Location 3",
            jobFunction: "Function 3",
            segment: "Segment 3",
            reportingMonth: "Month 3",
            evaluationName: "Evaluation 3",
            profile: "Profile 3"
        },
            ]

    const ruleTypeOptions = [
        { label: 'CAPA RULE', value: 'capa rule' },
        { label: 'MAIN RULE', value: 'main rule' }
    ];
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
    }, [limit, page]);

    const handleEditRules = (e: any) => {
            router.push(`/vendor-score/view-vendor-score`);
    };
    // const handleCreateNavigation = () => {
    //     router.push('/mapping-marketing/create-question');
    // };

    const { isLoading, setLoading, setAlert } = useAppContext();

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <span className="p-input-icon-left flex align-items-center">
                    <h3 className="mb-0">Evaluation Reports</h3>
                </span>
                <div className="flex justify-content-end">
                    <Button
                        icon="pi pi-user-plus"
                        size="small"
                        label="Export To Excel"
                        aria-label="Mapping Template Question To Agencies"
                        className="bg-primary-main hover:text-white border-primary-main"
                        style={{ marginLeft: 10 }}
                        onClick={()=>{}} // Show dialog when button is clicked
                    />
                </div>
            </div>
        );
    };

    const header = renderHeader();

    const fetchData = async (params?: any) => {
        try {
            setLoading(true);
            if (!params) {
                params = { limit: limit, page: page, sortBy: 'ruleSetId' };
            }

            setPage(params.page);

            const queryString = buildQueryParams(params);
            setLoading(true);
            const response = await GetCall(`company/rules-set?${queryString}`);

            setTotalRecords(response.total);
            setRules(response.data.rows);
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
    const globalSearch = () => {
        return <InputText value={selectedglobalSearch} onChange={onGlobalSearch} placeholder="Search" className="w-full md:w-10rem" />;
    };
    const FieldGlobalSearch = globalSearch();

    const onRowSelect = async (perm: SetRulesDir, action: any) => {
        setAction(action);

        setSelectedRuleSetId(perm);

        // if (action === ACTIONS.DELETE) {
        //     openDeleteDialog(perm);
        // }
    };

    // const openDeleteDialog = (items: SetRulesDir) => {
    //     setIsDeleteDialogVisible(true);
    // };
    const onRuleTypeChange = (e: any) => {
        setSelectedRuleType(e.value);
        fetchData({ limit, page, sortBy: 'ruleSetId', filters: { ruleType: e.value } });
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
                                    <div>
                                        <Dropdown
                                            className="mt-2"
                                            value={selectedRuleType}
                                            options={ruleTypeOptions}
                                            onChange={onRuleTypeChange}
                                            placeholder="Select Rule Type"
                                            style={{ width: '150px', height: '30px' }}
                                            showClear={!!selectedRuleType}
                                        />
                                    </div>
                                    <div className="mt-2">{FieldGlobalSearch}</div>
                                </div>
                            </div>
                            {isLoading ?(
                                <TableSkeletonSimple columns={4} rows={limit} />
                            ) : (

                            <CustomDataTable
                                ref={dataTableRef}
                                page={page}
                                limit={limit} // no of items per page
                                totalRecords={totalRecords} // total records from api response
                                // isEdit={true} // show edit button
                                // isDelete={true} // show delete button
                                extraButtons={(item) => [
                                    {
                                        icon: 'pi pi-eye',
                                        onClick: (e) => {
                                            handleEditRules(item); // Pass the item (row data) instead of e
                                        }
                                    }
                                ]}
                                data={tableData}
                                columns={[
                                    {
                                        header: 'SR. NO',
                                        field: 'serialNumber',
                                        // body: (data: any, options: any) => {
                                        //     const normalizedRowIndex = options.rowIndex % limit;
                                        //     const srNo = (page - 1) * limit + normalizedRowIndex + 1;

                                        //     return <span>{srNo}</span>;
                                        // },
                                        bodyStyle: { minWidth: 50, maxWidth: 50 }
                                    },
                                    {
                                        header: 'Section',
                                        field: 'section',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Criteria',
                                        field: 'criteria',
                                        // body: (data: any) => {
                                        //     if (data.effectiveFrom) {
                                        //         const date = new Date(data.effectiveFrom);
                                        //         return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).format(date);
                                        //     }
                                        //     return;
                                        // },
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },

                                    {
                                        header: 'Account ',
                                        field: 'account',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Score ',
                                        field: 'Score',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Assessor Type ',
                                        field: 'assessorType',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Assessor Role ',
                                        field: 'assessorRole',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Assessor Name',
                                        field: 'assessorName',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Type',
                                        field: 'type',
                                        // body: (data: any) => {
                                        //     if (data.effectiveFrom) {
                                        //         const date = new Date(data.effectiveFrom);
                                        //         return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).format(date);
                                        //     }
                                        //     return;
                                        // },
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },

                                    {
                                        header: 'Region ',
                                        field: 'region',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Country',
                                        field: 'country',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Division',
                                        field: 'division',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Brand',
                                        field: 'brand',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    }
                                ]}
                                onLoad={(params: any) => fetchData(params)}
                                // onDelete={(item: any) => onRowSelect(item, 'delete')}
                            />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainRules;
