'use client';
import { useContext, useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import CustomDataTable from '@/components/CustomDataTable';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PutCall } from '@/app/api-config/ApiKit';
import { InputTextarea } from 'primereact/inputtextarea';

const REQUEST_ACTIONS: any = {
    APPROVE: 'approve',
    REJECT: 'reject'
};

const ManageRequestsPage = () => {
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState(false);
    const [page, setPage] = useState(1);
    const dataTableRef = useRef(null);
    const [limit, setLimit] = useState(getRowLimitWithScreenHeight());
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [action, setAction] = useState(null);
    const [requests, setRequests] = useState<any>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [rejectedReason, setRejectedReason] = useState('');
    const { isLoading, setLoading, setAlert } = useAppContext();
    const [selectedRequest, setSelectedRequest] = useState<any>();

    const renderHeader = () => (
        <div className="flex justify-content-between">
            <span className="p-input-icon-left flex align-items-center">
                <h3 className="mb-0">Request of change information</h3>
            </span>
        </div>
    );

    const formatRequestedData = (data: any) => {
        if (!data) return '';
        if (typeof data === 'string') return data;
        if (typeof data !== 'object') return '';

        return Object.entries(data)
            .filter(([key, value]) => value !== null)
            .map(([key, value]) => {
                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                return `${formattedKey}: ${value}`;
            })
            .join('\n');
    };

    // Updated function to show only corresponding old data
    const formatOldData = (requestedData: any, oldData: any) => {
        if (!requestedData || !oldData || typeof requestedData !== 'object' || typeof oldData !== 'object') return '';

        // Get keys from requested data
        const requestedKeys = Object.keys(requestedData);

        return Object.entries(oldData)
            .filter(([key, value]) => {
                // Only include fields that are in the requested changes
                return requestedKeys.includes(key) && value !== null;
            })
            .map(([key, value]) => {
                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                return `${formattedKey}: ${value}`;
            })
            .join('\n');
    };

    const fetchData = async (params?: any) => {
        try {
            setLoading(true);

            if (!params) {
                params = { limit: limit, page: page };
            }
            setPage(params.page);
            const queryString = buildQueryParams(params);
            const response = await GetCall(`company/manageRequest?${queryString}`);
            setRequests(response.data);
            setTotalRecords(response.total);
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = (request: any) => {
        setSelectedRequest(request);
        setAction(REQUEST_ACTIONS.APPROVE);
        setIsDialogVisible(true);
    };

    const handleRejectClick = (request: any) => {
        setSelectedRequest(request);
        setAction(REQUEST_ACTIONS.REJECT);
        setRejectedReason('');
        setIsDialogVisible(true);
    };

    const closeDialog = () => {
        setIsDialogVisible(false);
        setSelectedRequest(null);
        setAction(null);
        setRejectedReason('');
    };

    const handleConfirm = async () => {
        try {
            setLoading(true);
            const payload = {
                // supId: selectedRequest?.supplierId,
                id: selectedRequest?.manageRequestId,
                // requestedData: selectedRequest?.requestedData,
                status: action === REQUEST_ACTIONS.APPROVE ? 'Approved' : 'Rejected',
                ...(action === REQUEST_ACTIONS.REJECT && { rejectedReason: rejectedReason })
            };

            console.log(payload);

            const response = await PutCall(`/company/manageRequest/${selectedRequest.manageRequestId}`, payload);
            if (response.code === 'SUCCESS') {
                setAlert('success', `Request ${action === REQUEST_ACTIONS.APPROVE ? 'approved' : 'rejected'} successfully`);
                fetchData();
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
            closeDialog();
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return date
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
    const renderDialogContent = () => {
        if (action === REQUEST_ACTIONS.APPROVE) {
            return (
                <div className="flex flex-column w-full surface-border p-3 text-center gap-4">
                    <i className="pi pi-check-circle text-6xl text-green-500"></i>
                    <div className="flex flex-column align-items-center gap-1">
                        <span>Are you sure you want to approve this request?</span>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex flex-column w-full surface-border p-2 text-center gap-4">
                <i className="pi pi-times-circle text-6xl text-red-500"></i>
                <div className="flex flex-column align-items-center gap-3">
                    <span>Are you sure you want to reject this request?</span>
                    <InputTextarea value={rejectedReason} onChange={(e) => setRejectedReason(e.target.value)} rows={4} placeholder="Enter rejection reason" className="w-full" />
                </div>
            </div>
        );
    };

    const requestedDataBody = (rowData: any) => {
        return <div style={{ whiteSpace: 'pre-line' }}>{formatRequestedData(rowData.requestedData)}</div>;
    };

    const oldDataBody = (rowData: any) => {
        return <div style={{ whiteSpace: 'pre-line' }}>{formatOldData(rowData.requestedData, rowData.oldData)}</div>;
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className={`panel-container ${isShowSplit ? (layoutState.isMobile ? 'mobile-split' : 'split') : ''}`}>
                    <div className="left-panel mb-0">
                        <div className="header">{renderHeader()}</div>
                        <div className="bg-[#ffffff] border border-1 p-3 mt-4 shadow-lg" style={{ borderColor: '#CBD5E1', borderRadius: '10px' }}>
                            <CustomDataTable
                                ref={dataTableRef}
                                filter
                                page={page}
                                limit={limit}
                                totalRecords={totalRecords}
                                data={requests?.map((item: any) => ({
                                    id: item.manageRequestId,
                                    supplierId: item.supplierId,
                                    requestedData: item.requestedData,
                                    oldData: item.oldData,
                                    requestedDate: formatDate(item.requestedDate),
                                    status: item.status,
                                    rejectedReason: item.rejectedReason || 'No Reason',
                                    ...item
                                }))}
                                columns={[
                                    {
                                        header: 'Sr. No',
                                        body: (data: any, options: any) => {
                                            const normalizedRowIndex = options.rowIndex % limit;
                                            const srNo = (page - 1) * limit + normalizedRowIndex + 1;
                                            return <span>{srNo}</span>;
                                        },
                                        bodyStyle: { width: '120px' }
                                    },
                                    {
                                        header: 'Supplier ID',
                                        field: 'supplierId',
                                        filter: true,
                                        bodyStyle: { width: '120px' }
                                    },
                                    {
                                        header: 'Requested Changes',
                                        field: 'requestedData',
                                        filter: true,
                                        body: requestedDataBody,
                                        bodyStyle: { width: '250px' }
                                    },
                                    {
                                        header: 'Old Data',
                                        field: 'oldData',
                                        filter: true,
                                        body: oldDataBody,
                                        bodyStyle: { width: '250px' }
                                    },
                                    {
                                        header: 'Requested At',
                                        field: 'requestedDate',
                                        filter: true,
                                        bodyStyle: { width: '150px' }
                                    },
                                    {
                                        header: 'Status',
                                        field: 'status',
                                        filter: true,
                                        bodyStyle: { width: '150px' },
                                        // headerStyle: dataTableHeaderStyle,
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
                                        bodyStyle: { width: '200px' }
                                    },
                                    {
                                        header: 'Actions',
                                        body: buttonRenderer,
                                        bodyStyle: { width: '100px' }
                                    }
                                ]}
                                onLoad={(params: any) => fetchData(params)}
                            />
                        </div>
                    </div>
                </div>

                <Dialog
                    header={action === REQUEST_ACTIONS.APPROVE ? 'Approve Request' : 'Reject Request'}
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
