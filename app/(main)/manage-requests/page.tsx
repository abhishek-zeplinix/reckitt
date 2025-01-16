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
import { DeleteCall, GetCall } from '@/app/api-config/ApiKit';
import { Rules } from '@/types';
import { InputTextarea } from 'primereact/inputtextarea';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const REQUEST_ACTIONS: any = {
    APPROVE: 'approve',
    REJECT: 'reject'
};
const ManageRequestsPage = () => {
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [selectedRuleId, setSelectedRuleId] = useState();
    const [action, setAction] = useState(null);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
    const [rules, setRules] = useState<Rules[]>([]);
    const [feedback, setFeedback] = useState<Rules[]>([]);
    const [totalRecords, setTotalRecords] = useState();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [rejectedReason, setRejectedReason] = useState('');
    const { isLoading, setLoading, setAlert } = useAppContext();

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <span className="p-input-icon-left flex align-items-center">
                    <h3 className="mb-0">Request of change information</h3>
                </span>
            </div>
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

    const fetchData = async (params?: any) => {
        try {
            if (!params) {
                params = { limit: limit, page: page };
            }

            setPage(params.page);

            const response = await GetCall(`company/feedback-request`);

            setFeedback(response.data);
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        try {
            setLoading(true);
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
            closeDialog();
        }
    };
    const dataTableHeaderStyle = { fontSize: '12px' };

    useEffect(() => {
        fetchData();
    }, []);

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

    const closeDialog = () => {
        setIsDialogVisible(false);
        setAction(null);
    };
    const handleApproveClick = (feedback: any) => {
        setIsDialogVisible(true);
    };

    const handleRejectClick = (feedback: any) => {
        setIsDialogVisible(true);
    };
    const renderDialogContent = () => {
        if (action === REQUEST_ACTIONS.APPROVE) {
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
    return (
        <div className="grid">
            <div className="col-12">
                <div className={`panel-container ${isShowSplit ? (layoutState.isMobile ? 'mobile-split' : 'split') : ''}`}>
                    <div className="left-panel mb-0">
                        <div className="header">{header}</div>
                        <div
                            className="bg-[#ffffff] border border-1  p-3  mt-4 shadow-lg"
                            style={{ borderColor: '#CBD5E1', borderRadius: '10px', WebkitBoxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)', MozBoxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)', boxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)' }}
                        >
                            <CustomDataTable
                                ref={dataTableRef}
                                filter
                                page={page}
                                limit={limit} // no of items per page
                                totalRecords={totalRecords} // total records from api response
                                data={feedback.map((item: any) => ({
                                    id: item.id,
                                    supplierName: item.supplierName,
                                    quarter: item.quarter,
                                    filePath: item.filePath,
                                    info: item.info,
                                    requestedDate: item.requestedDate,
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
                                        field: 'supplierName',
                                        filter: true,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle,
                                        filterPlaceholder: 'Supplier Id'
                                    },
                                    {
                                        header: 'Requested Data',
                                        field: 'quarter',
                                        sortable: true,
                                        filter: true,
                                        filterPlaceholder: 'Supplier Name',
                                        headerStyle: dataTableHeaderStyle,
                                        style: { minWidth: 120, maxWidth: 120 }
                                    },
                                    {
                                        header: 'Old Data',
                                        field: 'filePath',
                                        filter: true,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle,
                                        filterPlaceholder: 'Search Procurement Category'
                                    },
                                    {
                                        header: 'Requested At',
                                        field: 'info',
                                        filter: true,
                                        filterPlaceholder: 'Search Supplier Category',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Status',
                                        field: 'requestedDate',
                                        filter: true,
                                        filterPlaceholder: 'Search Supplier Manufacturing Name',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Rejected Reason',
                                        field: 'status',
                                        filter: true,
                                        filterPlaceholder: 'Search Site Address',
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
                                onDelete={(item: any) => onRowSelect(item, 'delete')}
                            />
                        </div>
                    </div>
                </div>

                <Dialog
                    header={action === REQUEST_ACTIONS.APPROVE ? 'Approve Feedback' : 'Reject Feedback'}
                    visible={isDialogVisible}
                    style={{ width: layoutState.isMobile ? '90vw' : '35vw' }}
                    footer={
                        <div className="flex justify-content-center p-2 gap-2">
                            <Button label="Cancel" className="bg-pink-500 text-white hover:bg-pink-600 border-none" onClick={closeDialog} />
                            <Button
                                label={action === REQUEST_ACTIONS.APPROVE ? 'Approve' : 'Reject'}
                                className={`px-4 ${action === REQUEST_ACTIONS.APPROVE ? 'p-button-success' : 'bg-red-600 text-white border-none hover:bg-red-700'}`}
                                onClick={handleConfirm}
                                disabled={action === REQUEST_ACTIONS.REJECT && !rejectedReason.trim()}
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

export default ManageRequestsPage;
