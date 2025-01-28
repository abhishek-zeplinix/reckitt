'use client';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PutCall } from '@/app/api-config/ApiKit';
import { Rules } from '@/types';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';

const FEEDBACK_ACTIONS: any = {
    APPROVE: 'approve',
    REJECT: 'reject'
};

const ManageFeedbackPage = () => {
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());

    const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
    const [action, setAction] = useState(null);
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [rejectedReason, setRejectedReason] = useState('');
    const [feedback, setFeedback] = useState<Rules[]>([]);
    const [totalRecords, setTotalRecords] = useState();
    const [selectedStatus, setSelectedStatus] = useState<any>();
    const [selectedglobalSearch, setSelectedGlobalSearch] = useState<any>();

    const { isLoading, setLoading, setAlert } = useAppContext();

    console.log(feedback);

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <span className="p-input-icon-left flex align-items-center">
                    <h3 className="mb-0">Manage Feedbacks</h3>
                </span>
            </div>
        );
    };

    const header = renderHeader();

    const fetchData = async (params?: any) => {
        try {
            setLoading(true);
            if (!params) {
                params = { limit: limit, page: page };
            }
            const queryString = buildQueryParams(params);
            setPage(params.page);

            const response = await GetCall(`company/feedback-request?${queryString}`);
            setFeedback(response.data);
            setTotalRecords(response.total);
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApproveClick = (feedback: any) => {
        setSelectedFeedback(feedback);
        setAction(FEEDBACK_ACTIONS.APPROVE);
        setIsDialogVisible(true);
    };

    const handleRejectClick = (feedback: any) => {
        setSelectedFeedback(feedback);
        setAction(FEEDBACK_ACTIONS.REJECT);
        setRejectedReason('');
        setIsDialogVisible(true);
    };

    const closeDialog = () => {
        setIsDialogVisible(false);
        setSelectedFeedback(null);
        setAction(null);
        setRejectedReason('');
    };

    const handleConfirm = async () => {
        try {
            setLoading(true);

            const payload = {
                suppliername: selectedFeedback.suppliername,
                quarter: selectedFeedback.quarter,
                info: selectedFeedback.info,
                status: action === FEEDBACK_ACTIONS.APPROVE ? 'Approved' : 'Rejected',
                file: selectedFeedback.filepath,
                ...(action === FEEDBACK_ACTIONS.REJECT && { rejectedReason: rejectedReason })
            };

            const response = await PutCall(`/company/feedback-request/${selectedFeedback.id}`, payload);
            if (response.code === 'SUCCESS') {
                setAlert('success', `Feedback ${action === FEEDBACK_ACTIONS.APPROVE ? 'approved' : 'rejected'} successfully`);
                fetchData();
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
            closeDialog();
        }
    };

    const renderDialogContent = () => {
        if (action === FEEDBACK_ACTIONS.APPROVE) {
            return (
                <div className="flex flex-column w-full surface-border p-3 text-center gap-4">
                    <i className="pi pi-check-circle text-6xl text-green-500"></i>
                    <div className="flex flex-column align-items-center gap-1">
                        <span>Are you sure you want to approve this feedback?</span>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-column w-full surface-border p-2 text-center gap-4">
                <i className="pi pi-times-circle text-6xl text-red-500"></i>
                <div className="flex flex-column align-items-center gap-3">
                    <span>Are you sure you want to reject this feedback?</span>
                    <InputTextarea value={rejectedReason} onChange={(e) => setRejectedReason(e.target.value)} rows={4} placeholder="Enter rejection reason" className="w-full" />
                </div>
            </div>
        );
    };

    const buttonRenderer = (rowData: any) => {
        if (rowData.status === 'Pending') {
            return (
                <>
                    <Button icon="pi pi-check" className="p-button-success p-button-md p-button-text hover:bg-pink-50" onClick={() => handleApproveClick(rowData)} />
                    <Button icon="pi pi-times" className="p-button-danger p-button-md p-button-text hover:bg-pink-50" onClick={() => handleRejectClick(rowData)} />
                </>
            );
        }
        return null;
    };

    const formatDate = (timestamp: any) => {
        const date = new Date(timestamp);

        const formattedDate = date
            .toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            })
            .replace(',', '');

        return formattedDate;
    };

    const dataTableHeaderStyle = { fontSize: '12px' };

    const statusOptions = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' }
    ];

    const onStatusChange = (e: any) => {
        setSelectedStatus(e.value);
        fetchData({
            filters: {
                status: e.value
            }
        });
    };

    const onGlobalSearch = (e: any) => {
        setSelectedGlobalSearch(e.target?.value); // Update limit
        fetchData({ search: e.target?.value });
    };

    // const onCategorychange = (e: any) => {
    //     setSelectedCategory(e.value); // Update limit
    //     fetchprocurementCategories(e.value);
    //     fetchData({ filters: {
    //         supplierCategoryId: e.value
    //     } });
    // };

    const dropdownStatus = () => {
        return <Dropdown value={selectedStatus} onChange={onStatusChange} options={statusOptions} optionValue="value" placeholder="Select Status" optionLabel="label" className="w-full md:w-10rem" />;
    };

    const dropdownFeedbackStatus = dropdownStatus();

    // const dropdownMenuSubCategory = () => {
    //         return <Dropdown value={SelectedSubCategory} onChange={onSubCategorychange} options={supplierCategories} optionLabel="subCategoryName" optionValue="subCategoryId" placeholder="Select Sub Category" className="w-full md:w-10rem" />;
    //     };
    // const dropdownFieldSubCategory = dropdownMenuSubCategory();

    const globalSearch = () => {
        return <InputText value={selectedglobalSearch} onChange={onGlobalSearch} placeholder="Search" className="w-full md:w-10rem" />;
    };

    const FieldGlobalSearch = globalSearch();

    const limitOptions = [
        { label: '10', value: 10 },
        { label: '20', value: 20 },
        { label: '50', value: 50 },
        { label: '70', value: 70 },
        { label: '100', value: 100 }
    ];

    const onLimitChange = (e: any) => {
        setLimit(e.value); // Update limit
        fetchData({ limit: e.value, page: 1 }); // Fetch data with new limit
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className={`panel-container ${isShowSplit ? (layoutState.isMobile ? 'mobile-split' : 'split') : ''}`}>
                    <div className="left-panel mb-0">
                        <div className="header">{header}</div>
                        <div className="bg-[#ffffff] border border-1 p-3 mt-4 shadow-lg" style={{ borderColor: '#CBD5E1', borderRadius: '10px' }}>
                            <div className="flex justify-content-between items-center border-b">
                                <div>
                                    <Dropdown className="mt-2" value={limit} options={limitOptions} onChange={onLimitChange} placeholder="Limit" style={{ width: '100px', height: '30px' }} />
                                </div>
                                <div className="flex  gap-2">
                                    <div className="mt-2">{dropdownFeedbackStatus}</div>
                                    {/* <div className="mt-2">{dropdownFieldSubCategory}</div> */}
                                    <div className="mt-2">{FieldGlobalSearch}</div>
                                </div>
                            </div>
                            <CustomDataTable
                                ref={dataTableRef}
                                filter
                                page={page}
                                limit={limit}
                                totalRecords={totalRecords}
                                // extraButtons={getExtraButtons}
                                data={feedback?.map((item: any) => ({
                                    id: item.id,
                                    suppliername: item.suppliername,
                                    quarter: item.quarter,
                                    filepath: item.filepath,
                                    info: item.info,
                                    requesteddate: formatDate(item.requesteddate),
                                    status: item.status,
                                    rejectedReason: item.rejectedReason
                                }))}
                                columns={[
                                    {
                                        header: 'Sr. No',
                                        body: (data: any, options: any) => {
                                            const normalizedRowIndex = options.rowIndex % limit;
                                            const srNo = (page - 1) * limit + normalizedRowIndex + 1;

                                            return <span>{srNo}</span>;
                                        },
                                        bodyStyle: { minWidth: 50, maxWidth: 50 }
                                    },
                                    {
                                        header: 'Supplier Name',
                                        field: 'suppliername',
                                        filter: true,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle,
                                        filterPlaceholder: 'Search Supplier Name'
                                    },
                                    {
                                        header: 'Quarter',
                                        field: 'quarter',
                                        sortable: true,
                                        filter: true,
                                        headerStyle: dataTableHeaderStyle,
                                        style: { minWidth: 120, maxWidth: 120 }
                                    },
                                    {
                                        header: 'File',
                                        field: 'filepath',
                                        filter: true,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Info',
                                        field: 'info',
                                        filter: true,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Requested Date',
                                        field: 'requesteddate',
                                        filter: true,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Status',
                                        field: 'status',
                                        filter: true,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle,
                                        body: (rowData: any) => {
                                            const getStatusClass = (status: string) => {
                                                switch (status) {
                                                    case 'Approved':
                                                        return 'bg-green-100 text-green-700 border-round-md';
                                                    case 'Rejected':
                                                        return 'bg-red-100 text-red-700 border-round-md';
                                                    case 'Pending':
                                                        return 'bg-blue-100 text-blue-700 border-round-md';
                                                    default:
                                                        return '';
                                                }
                                            };
                                            return <span className={`px-2 py-1 rounded-lg ${getStatusClass(rowData.status)}`}>{rowData.status}</span>;
                                        }
                                    },
                                    {
                                        header: 'Rejected Reason',
                                        field: 'rejectedReason',
                                        filter: true,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Actions',
                                        body: buttonRenderer,
                                        bodyStyle: { minWidth: 100 },
                                        headerStyle: dataTableHeaderStyle
                                    }
                                ]}
                                onLoad={(params: any) => fetchData(params)}
                            />
                        </div>
                    </div>
                </div>

                <Dialog
                    header={action === FEEDBACK_ACTIONS.APPROVE ? 'Approve Feedback' : 'Reject Feedback'}
                    visible={isDialogVisible}
                    style={{ width: layoutState.isMobile ? '90vw' : '35vw' }}
                    footer={
                        <div className="flex justify-content-center p-2 gap-2">
                            <Button label="Cancel" className="bg-primary-main text-white hover:bg-pink-600 border-none" onClick={closeDialog} />
                            <Button
                                label={action === FEEDBACK_ACTIONS.APPROVE ? 'Approve' : 'Reject'}
                                className={`px-4 ${action === FEEDBACK_ACTIONS.APPROVE ? 'p-button-success' : 'bg-red-600 text-white border-none hover:bg-red-700'}`}
                                onClick={handleConfirm}
                                disabled={action === FEEDBACK_ACTIONS.REJECT && !rejectedReason.trim()}
                            />
                        </div>
                    }
                    onHide={closeDialog}
                >
                    {isLoading ? (
                        <div className="flex justify-content-center">
                            <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                        </div>
                    ) : (
                        renderDialogContent()
                    )}
                </Dialog>
            </div>
        </div>
    );
};

export default ManageFeedbackPage;
