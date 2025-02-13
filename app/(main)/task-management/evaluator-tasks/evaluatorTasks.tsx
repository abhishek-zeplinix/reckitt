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

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const EvaluatorTasks = () => {
    const router = useRouter();
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [rules, setRules] = useState<SetRulesDir[]>([]);
    const [approverEvaluatorsList, setApproverEvaluatorsList] = useState<SetRulesDir[]>([]);
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
    // const [isValid, setIsValid] = useState(true);
    // const { loader } = useLoaderContext();
    // const { loader, setLoader } = useLoaderContext();

    const limitOptions = [
        { label: '10', value: 10 },
        { label: '20', value: 20 },
        { label: '50', value: 50 },
        { label: '70', value: 70 },
        { label: '100', value: 100 }
    ];
    const ruleTypeOptions = [
        { label: 'CAPA RULE', value: 'capa rule' },
        { label: 'MAIN RULE', value: 'main rule' }
    ];
    // Handle limit change
    // const onCategorychange = (e: any) => {
    //     setSelectedCategory(e.value); // Update limit
    //     // fetchprocurementCategories(e.value);
    //     fetchData({
    //         limit: limit,
    //         page: page,
    //         include: 'subCategories,categories,department',
    //         filters: {
    //             categoryId: e.value
    //         }
    //     });
    // };
    // // Handle limit change
    // const onDepartmentChange = (e: any) => {
    //     setSelectedDepartment(e.value);
    //     fetchData({
    //         limit: limit,
    //         page: page,
    //         include: 'subCategories,categories,department',
    //         filters: {
    //             departmentId: e.value
    //         }
    //     });
    // };
    // // Handle limit change
    // const onSubCategorychange = (e: any) => {
    //     setSelectedSubCategory(e.value); // Update limit
    //     fetchData({
    //         limit: limit,
    //         page: page,
    //         include: 'subCategories,categories,department',
    //         filters: {
    //             subCategoryId: e.value
    //         }
    //     });
    // };
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
        // fetchsupplierCategories();
        // fetchsupplierDepartment();
    }, [limit, page]);
    // const handleCreateNavigation = () => {
    //     router.push('/manage-rules/create-new-rules');
    // };

    const handleFileUpload = async (event: { files: File[] }) => {
        const file = event.files[0]; // Retrieve the uploaded file
        if (!file) {
            setAlert('error', 'Please select a file to upload.');
            return;
        }

        if (!date) {
            setAlert('error', 'Please enter a valid date.');
            return;
        }

        if (!rulesGroup) {
            setAlert('error', 'Please enter a valid name for the Rules Group.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const formatDate = (date: Date): string => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const year = date.getFullYear();
            return `${year}-${month}-${day}`;
        };

        formData.append('effectiveFrom', formatDate(date)); // Add formatted date
        formData.append('set', rulesGroup); // Add rules group name

        // Determine API endpoint based on selected rule type
        const apiEndpoint = chooseRules === 'Capa Rules' ? '/company/caparule/bulk/capa-rules' : '/company/bulk-rules';

        setIsDetailLoading(true);
        try {
            // Use the existing PostCall function
            const response: CustomResponse = await PostCall(apiEndpoint, formData);

            setIsDetailLoading(false);

            if (response.code === 'SUCCESS') {
                setAlert('success', 'Rules imported successfully');
                setVisible(false);
                fetchData();
                setResponseData(response);
                setBulkDialogVisible(true);
            } else {
                setAlert('error', response.message || 'File upload failed');
            }
        } catch (error) {
            setIsDetailLoading(false);
            console.error('An error occurred during file upload:', error);
            setAlert('error', 'An unexpected error occurred during file upload');
        }
    };

    const handleEditRules = (e: any) => {
        if (e.ruleType === 'MAIN RULE') {
            router.push(`/rules/set-rules?ruleSetId=${e.ruleSetId}`);
        } else {
            router.push(`/rules/set-capa-rules?ruleSetId=${e.ruleSetId}`);
        }
    };

    const { isLoading, setLoading, setAlert } = useAppContext();

    const fetchData = async (params?: any) => {
        try {
            setLoading(true);
            const role = 'Evaluator';
            if (!params) {
                params = { limit: limit, page: page, filters: { role } };
            }

            setPage(params.page);

            const queryString = buildQueryParams(params);
            const response = await GetCall(`company/approver-evaluator?${queryString}`);

            setTotalRecords(response.total);
            setApproverEvaluatorsList(response.data);
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

        if (action === ACTIONS.DELETE) {
            openDeleteDialog(perm);
        }
    };

    const openDeleteDialog = (items: SetRulesDir) => {
        setIsDeleteDialogVisible(true);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogVisible(false);
        setIsAllDeleteDialogVisible(false);
    };
    const handleAllDelete = () => {
        setIsAllDeleteDialogVisible(true);
        setIsDeleteDialogVisible(true);
    };

    const onDelete = async () => {
        setLoading(true);
        if (isAllDeleteDialogVisible) {
            try {
                const response = await DeleteCall(`/company/rules`);

                if (response.code === 'SUCCESS') {
                    closeDeleteDialog();
                    setAlert('success', 'Rule successfully deleted!');
                    fetchData();
                } else {
                    setAlert('error', 'Something went wrong!');
                    closeDeleteDialog();
                }
            } catch (error) {
                setAlert('error', 'Something went wrong!');
            } finally {
                setLoading(false);
            }
        } else {
            if (selectedRuleSetId.ruleType === 'MAIN RULE') {
                try {
                    const response = await DeleteCall(`/company/rules-set/${selectedRuleSetId.ruleSetId}`);

                    if (response.code === 'SUCCESS') {
                        setRules((prevRules) => prevRules.filter((rule) => rule.ruleSetId !== selectedRuleSetId.ruleSetId));
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
            } else {
                try {
                    const response = await DeleteCall(`/company/caparule-set/${selectedRuleSetId.ruleSetId}`);

                    if (response.code === 'SUCCESS') {
                        setRules((prevRules) => prevRules.filter((rule) => rule.ruleSetId !== selectedRuleSetId.ruleSetId));
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
            }
        }
    };
    // Handle rule type selection and fetch data
    const onRuleTypeChange = (e: any) => {
        setSelectedRuleType(e.value);
        fetchData({ limit, page, sortBy: 'ruleSetId', filters: { ruleType: e.value } });
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className={`panel-container ${isShowSplit ? (layoutState.isMobile ? 'mobile-split' : 'split') : ''}`}>
                    <div className="left-panel">
                        <div
                            className="bg-[#ffffff] border border-1  p-3   shadow-lg"
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
                                data={approverEvaluatorsList.map((item: any) => ({
                                    userId: item.userId,
                                    evaluatorName: item.users?.name,
                                    departmentName: item.department?.name,
                                    email: item.users?.email,
                                    phone: item.users?.phone,
                                    country: item.country,
                                    state: item.state,
                                    city: item.city
                                }))}
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
                                        header: 'Approver Name ',
                                        field: 'evaluatorName',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Department Name',
                                        field: 'departmentName',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Email Address',
                                        field: 'email',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Phone Number',
                                        field: 'phone',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },

                                    {
                                        header: 'Country ',
                                        field: 'country',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'State ',
                                        field: 'state',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'City ',
                                        field: 'city',
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

                <Dialog visible={bulkDialogVisible} onHide={() => setBulkDialogVisible(false)} header="Upload Summary" style={{ width: '600px' }}>
                    {responseData && (
                        <div>
                            <p>
                                <strong>Inserted Count:</strong> {responseData.insertedCount}
                            </p>
                            <p>
                                <strong>Skipped Count:</strong> {responseData.skippedCount}
                            </p>
                            <h4>Skipped Data:</h4>
                            {responseData.skippedData.length > 0 ? (
                                <ul>
                                    {responseData.skippedData.map(
                                        (
                                            skipped: {
                                                rule: {
                                                    departmentName: string;
                                                    categoryName: string;
                                                    subCategoryName: string;
                                                    effective_from: string;
                                                    criteriaEvaluation: any;
                                                };
                                                reason: string;
                                            },
                                            index: number
                                        ) => (
                                            <li key={index}>
                                                <strong>Department Name:</strong> {skipped.rule?.departmentName || 'N/A'} <br />
                                                <strong>Category Name:</strong> {skipped.rule?.categoryName || 'N/A'} <br />
                                                <strong>SubCategory Name:</strong> {skipped.rule?.subCategoryName || 'N/A'} <br />
                                                <strong>Effective From:</strong> {skipped.rule?.effective_from || 'N/A'} <br />
                                                <strong>Criteria Evaluation:</strong> {skipped.rule?.criteriaEvaluation || 'N/A'} <br />
                                                <strong>Reason:</strong> {skipped.reason}
                                            </li>
                                        )
                                    )}
                                </ul>
                            ) : (
                                <p>No skipped data.</p>
                            )}

                            {/* Not Found Data */}
                            <h4>Not Found Data:</h4>
                            <ul>
                                <li>
                                    <strong>Departments:</strong> {responseData.missingDepartments.length > 0 ? responseData.missingDepartments.join(', ') : 'None'}
                                </li>
                                <li>
                                    <strong>Categories:</strong> {responseData.missingCategories.length > 0 ? responseData.missingCategories.join(', ') : 'None'}
                                </li>
                                <li>
                                    <strong>SubCategories:</strong> {responseData.missingSubCategories.length > 0 ? responseData.missingSubCategories.join(', ') : 'None'}
                                </li>
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

export default EvaluatorTasks;
