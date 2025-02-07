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
import { FileUpload } from 'primereact/fileupload';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { ColumnBodyOptions } from 'primereact/column';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const TrendSummaryPage = () => {
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
    const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
    const memberId = searchParams.get('memberId');
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

    const membersOptions = [
        {
            id: 1,
            agency_account: 'Vendor 1/Agency, NAC, Air Wick/Botanica',
            Dec_2024: 4.4,
            Jan_2025: null,
            Feb_2025: null,
            Mar_2025: null,
            Apr_2025: null
        },
        {
            id: 2,
            agency_account: 'Vendor 1/Agency, LATAM, Gaviscon',
            Dec_2024: null,
            Jan_2025: null,
            Feb_2025: null,
            Mar_2025: null,
            Apr_2025: 4.1
        },
        {
            id: 3,
            agency_account: 'Vendor 1/Agency, NAC, Gaviscon',
            Dec_2024: null,
            Jan_2025: null,
            Feb_2025: 1.0,
            Mar_2025: null,
            Apr_2025: null
        },
        {
            id: 4,
            agency_account: 'Vendor 1/Agency, LATAM, Air Wick/Botanica',
            Dec_2024: null,
            Jan_2025: null,
            Feb_2025: 3.1,
            Mar_2025: null,
            Apr_2025: null
        },
        {
            id: 5,
            agency_account: 'Vendor 1/Asset production, NAC, Vanish',
            Dec_2024: null,
            Jan_2025: null,
            Feb_2025: 4.85,
            Mar_2025: null,
            Apr_2025: null
        },
        {
            id: 6,
            agency_account: 'Vendor 2/Agency, LATAM, Air Wick/Botanica',
            Dec_2024: null,
            Jan_2025: null,
            Feb_2025: 1.4,
            Mar_2025: null,
            Apr_2025: null
        },
        {
            id: 7,
            agency_account: 'Vendor 2/Agency, NAC, Gaviscon',
            Dec_2024: null,
            Jan_2025: null,
            Feb_2025: null,
            Mar_2025: 3.2,
            Apr_2025: null
        },
        {
            id: 8,
            agency_account: 'Vendor 2/Agency, Ibera, Gaviscon',
            Dec_2024: null,
            Jan_2025: null,
            Feb_2025: null,
            Mar_2025: 3.3,
            Apr_2025: null
        }
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
        router.push(`/marketing-templates/template-question?memberId=${memberId}`);
    };

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

        const formData = new FormData();
        formData.append('file', file);

        const formatDate = (date: Date): string => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const year = date.getFullYear();
            return `${year}-${month}-${day}`;
        };

        // In the handleFileUpload function
        if (date) {
            formData.append('effectiveFrom', formatDate(date)); // Format the date as DD-MM-YYYY
        }

        setIsDetailLoading(true);
        try {
            // Use the existing PostCall function
            const response: CustomResponse = await PostCall('/company/bulk-rules', formData);

            setIsDetailLoading(false);

            if (response.code === 'SUCCESS') {
                setAlert('success', 'Rules imported successfully');
                setVisible(false);
                fetchData();
            } else {
                setAlert('error', response.message || 'File upload failed');
            }
        } catch (error) {
            setIsDetailLoading(false);
            console.error('An error occurred during file upload:', error);
            setAlert('error', 'An unexpected error occurred during file upload');
        }
    };
    const handleEditRules = (memberId: any, ruleId: any) => {
        router.push(`/marketing-templates/template-question?edit=true&ruleSetId=${memberId}&ruleId=${ruleId}`);
    };

    const { isLoading, setLoading, setAlert } = useAppContext();

    const dialogHeader = () => {
        return (
            <div className="flex justify-content-between align-items-center w-full">
                <span>Choose your file</span>
                <Button
                    label="Download Sample PDF"
                    icon="pi pi-download"
                    className="p-button-text p-button-sm text-primary-main"
                    onClick={() => {
                        // Trigger PDF download
                        const link = document.createElement('a');
                        link.href = '/path-to-your-pdf.pdf'; // Replace with the actual path to your PDF
                        link.download = 'example.pdf'; // Replace with the desired file name
                        link.click();
                    }}
                />
            </div>
        );
    };
    const mappedData = membersOptions.map((item) => ({
        id: item.id,
        agency_account: item.agency_account,
        Dec_2024: item.Dec_2024 ?? '-',
        Jan_2025: item.Jan_2025 ?? '-',
        Feb_2025: item.Feb_2025 ?? '-',
        Mar_2025: item.Mar_2025 ?? '-',
        Apr_2025: item.Apr_2025 ?? '-'
    }));

    const exportToExcel = () => {
        // const ws = XLSX.utils.json_to_sheet(mappedData);
        // const wb = XLSX.utils.book_new();
        // XLSX.utils.book_append_sheet(wb, ws, 'Data');
        // XLSX.writeFile(wb, 'Exported_Data.xlsx');
    };
    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <span className="p-input-icon-left flex align-items-center">
                    <h3 className="mb-0">Marketing Templates</h3>
                </span>
                <div className="flex justify-content-end">
                    <Button icon="pi pi-plus" size="small" label="Export to excel" aria-label="Export to excel" className="bg-primary-main border-primary-main hover:text-white" onClick={exportToExcel} style={{ marginLeft: 10 }} />
                    {/* <Button
                        icon="pi pi-plus"
                        size="small"
                        label="Delete Rules"
                        aria-label="Delete Rule"
                        className="bg-primary-main border-primary-main hover:text-white"
                        onClick={() => {
                            handleAllDelete();
                        }}
                        style={{ marginLeft: 10 }}
                    /> */}
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

            const response = await GetCall(`company/rules/${memberId}?${queryString}`);

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
    const fetchprocurementCategories = async (categoryId: number | null) => {
        if (!categoryId) {
            setprocurementCategories([]); // Clear subcategories if no category is selected
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
                            <CustomDataTable
                                ref={dataTableRef}
                                page={page}
                                limit={limit} // no of items per page
                                totalRecords={totalRecords} // total records from api response
                                // isEdit={true} // show edit button
                                isDelete={true} // show delete button
                                extraButtons={(item) => [
                                    {
                                        icon: 'pi pi-user-edit',
                                        onClick: (e) => {
                                            handleEditRules(memberId, item.ruleId); // Pass the userId from the row data
                                        }
                                    }
                                ]}
                                data={mappedData}
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
                                        header: 'Review Type/Template Type	 ',
                                        field: 'agency_account',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Dec 2024 ',
                                        field: 'Dec_2024',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },

                                    {
                                        header: 'Jan 2025',
                                        field: 'Jan_2025',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Feb 2025',
                                        field: 'Feb_2025',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },

                                    {
                                        header: 'Mar 2025',
                                        field: 'Mar_2025',
                                        bodyStyle: { minWidth: 50, maxWidth: 50, textAlign: 'center' },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Apr 2025',
                                        field: 'Apr_2025',
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

export default TrendSummaryPage;
