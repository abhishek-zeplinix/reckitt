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

const MarketingTemplatesPage = () => {
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
            reviewType: 'Creative / Agency to Reckitt',
            category: 'STRATEGY & PLANNING',
            criteria: 'STRATEGIC PLANNING',
            description: 'Client provides a clear and consistent strategic direction with relevant research and data as part of their briefs (open to do more research if needed).',
            ratingScale: '1 to 5, N/A',
            weight: 30,
            mandatory: 'yes',
            reviewers: 2,
            userGroup: 'Agency'
        },
        {
            id: 2,
            reviewType: 'Creative / Agency to Reckitt',
            category: 'STRATEGY & PLANNING',
            criteria: 'STRATEGIC GROWTH AUDIENCES',
            description:
                'Client provides clear target segments, growth audiences / the community(ies) the brand can disproportionately benefit and creative bullseye per brief and is open to new insights from Agency to drive growth with as part of its Fight and Superior Solutions.',
            ratingScale: '1 to 5, N/A',
            weight: 40,
            mandatory: 'no',
            reviewers: 2,
            userGroup: 'Agency'
        },
        {
            id: 3,
            reviewType: 'Creative / Agency to Reckitt',
            category: 'STRATEGY & PLANNING',
            criteria: 'BEHAVIOUR CHANGE',
            description: 'Client is clear on the trigger and motivations that will drive consumer behaviour change.',
            ratingScale: '1 to 5, N/A',
            weight: 30,
            mandatory: 'yes',
            reviewers: 2,
            userGroup: 'Agency'
        },
        {
            id: 4,
            reviewType: 'Creative / Agency to Reckitt',
            category: 'CREATIVE EFFECTIVENESS',
            criteria: 'CREATIVITY THAT DRIVES EFFECTIVENESS',
            description: "When briefed to deliver creative, Client greenlights breakthrough ideas in line with Brand's Fight and/or its Superior Solutions worthy of being shortlisted or winning creative and/or effectiveness awards.",
            ratingScale: '1 to 5, N/A',
            weight: 25,
            mandatory: 'yes',
            reviewers: 2,
            userGroup: 'Agency'
        },
        {
            id: 5,
            reviewType: 'Creative / Agency to Reckitt',
            category: 'CREATIVE EFFECTIVENESS',
            criteria: 'POSITIVE PORTRAYAL IN COMMUNICATIONS',
            description: 'Client provides clear guidance on representation and portrayal ambitions as part of all projects.',
            ratingScale: '1 to 5, N/A',
            weight: 40,
            mandatory: 'yes',
            reviewers: 2,
            userGroup: 'Agency'
        },
        {
            id: 6,
            reviewType: 'Creative / Agency to Reckitt',
            category: 'CREATIVE EFFECTIVENESS',
            criteria: 'MEDIA-AGNOSTIC IDEAS',
            description: 'Client briefs request omnichannel creative ideas or include key channels based on audience and media strategy as part of the brief encouraging work that is activated across a variety of channels beyond TV.',
            ratingScale: '1 to 5, N/A',
            weight: 35,
            mandatory: 'yes',
            reviewers: 2,
            userGroup: 'Agency'
        },
        {
            id: 7,
            reviewType: 'Creative / Agency to Reckitt',
            category: 'OMNI-CHANNEL THINKING',
            criteria: 'OMNI CHANNEL THINKING',
            description: 'Client sets up a cross functional team of experts to encourage multi-channel ideas.',
            ratingScale: '1 to 5, N/A',
            weight: 100,
            mandatory: 'no',
            reviewers: 2,
            userGroup: 'Agency'
        },
        {
            id: 8,
            reviewType: 'Creative / Agency to Reckitt',
            category: 'PRODUCTION',
            criteria: 'PRODUCTION',
            description: 'Reckitt and its production director understand the creative ambition and is delivering production advice during the creative process that enables and enhances the creative execution potential.',
            ratingScale: '1 to 5, N/A',
            weight: 50,
            mandatory: 'yes',
            reviewers: 2,
            userGroup: 'Agency'
        },
        {
            id: 9,
            reviewType: 'Creative / Agency to Reckitt',
            category: 'PRODUCTION',
            criteria: 'SOW',
            description:
                "My Content Demand Management (CDM) is giving Agency the right day to day support, as well as providing Agency with the right project information (timing, output required, etc.) to plan Agency's resource in time to deliver high quality outcome, on time and inside the given target price. CDM and Marketing work in partnership with Agency bringing transparency early to enable corrective actions in case timings or target price cannot be achieved.",
            ratingScale: '1 to 5, N/A',
            weight: 25,
            mandatory: 'yes',
            reviewers: 2,
            userGroup: 'Agency'
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
    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <span className="p-input-icon-left flex align-items-center">
                    <h3 className="mb-0">Marketing Templates</h3>
                </span>
                <div className="flex justify-content-end">
                    <Button
                        icon="pi pi-plus"
                        size="small"
                        label="Import Template Questions"
                        aria-label="Import Template Questions"
                        className="default-button"
                        style={{ marginLeft: 10 }}
                        onClick={() => setVisible(true)} // Show dialog when button is clicked
                    />
                    <Dialog
                        header={dialogHeader}
                        visible={visible}
                        style={{ width: '50vw' }}
                        onHide={() => setVisible(false)} // Hide dialog when the close button is clicked
                    >
                        {/* <div className="mb-3">
                            <div>
                                <div className="flex justify-center items-center gap-4 ">
                                    <label htmlFor="calendarInput" className="block mb-2 text-md mt-2">
                                        Select Effective Date:
                                    </label>
                                    <Calendar id="calendarInput" value={date} onChange={(e) => setDate(e.value as Date)} dateFormat="yy-mm-dd" placeholder="Select a date" showIcon style={{ borderRadius: '5px', borderColor: 'black' }} />
                                </div>
                            </div>
                        </div> */}
                        <FileUpload name="demo[]" customUpload multiple={false} accept=".xls,.xlsx,image/*" maxFileSize={1000000} emptyTemplate={<p className="m-0">Drag and drop files here to upload.</p>} uploadHandler={handleFileUpload} />
                    </Dialog>
                    <Button
                        icon="pi pi-plus"
                        size="small"
                        label="Add Templates Questions"
                        aria-label="Add Templates Questions"
                        className="bg-primary-main border-primary-main hover:text-white"
                        onClick={handleCreateNavigation}
                        style={{ marginLeft: 10 }}
                    />
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

    const mappedData = membersOptions.map((item) => ({
        id: item.id,
        reviewType: item.reviewType,
        category: item.category,
        criteria: item.criteria,
        description: item.description,
        ratingScale: item.ratingScale,
        weight: item.weight,
        mandatory: item.mandatory,
        reviewers: item.reviewers,
        userGroup: item.userGroup
    }));

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
                                <h3>Maketing Template Questions</h3>
                            </div>
                            <hr />
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
                                        field: 'reviewType',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Segment ',
                                        field: 'category',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },

                                    {
                                        header: 'Question',
                                        field: 'description',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Ratings',
                                        field: 'ratingScale',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },

                                    {
                                        header: 'Ratio (%)',
                                        field: 'weight',
                                        bodyStyle: { minWidth: 50, maxWidth: 50, textAlign: 'center' },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Comment Compulsory',
                                        field: 'mandatory',
                                        bodyStyle: { minWidth: 50, maxWidth: 50, textAlign: 'center' },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Comment if rating <=',
                                        field: 'reviewers',
                                        bodyStyle: { minWidth: 50, maxWidth: 50, textAlign: 'center' },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'User Groups',
                                        field: 'userGroup',
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

export default MarketingTemplatesPage;
