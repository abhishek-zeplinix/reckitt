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
import { z } from 'zod';
import { useAuth } from '@/layout/context/authContext';
import { get } from 'lodash';

const rejectionSchema = z.object({
    reason: z.string().max(250, 'Rejection reason cannot exceed 250 characters')
});

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
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [rejectionError, setRejectionError] = useState('');
    const [remainingChars, setRemainingChars] = useState(250);

    const { isSupplier } = useAuth();
    const { user } = useAppContext();

    const fetchData = async (params?: any) => {
        try {
            setLoading(true);

            if (!params) {
                params = { limit: limit, page: page };
            }
            const supId = get(user, 'supplierId');
            setPage(params.page);

            let apiUrl = 'company/manageRequest';

            if (isSupplier()) {
                apiUrl = `company/manageRequest/supplier`;
            }

            const queryString = buildQueryParams(params);
            const response = await GetCall(`${apiUrl}?${queryString}`);

            setRequests(response.data);

            setTotalRecords(response.total);
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    console.log(requests);


    const handleViewClick = (request: any) => {
        setSelectedRequest(request);
        setShowRejectInput(false);
        setRejectedReason('');
        setIsDialogVisible(true);
        setRemainingChars(250)
    };

    const closeDialog = () => {
        setIsDialogVisible(false);
        setSelectedRequest(null);
        setAction(null);
        setRejectedReason('');
    };


    const handleAction = async (action: 'approve' | 'reject') => {
        if (action === 'reject' && !showRejectInput) {
            setShowRejectInput(true);
            return;
        }

        if (action === 'reject' && !rejectedReason.trim()) {
            return;
        }

        try {
            setLoading(true);
            const payload = {
                status: action === 'approve' ? 'Approved' : 'Rejected',
                ...(action === 'reject' && { rejectedReason: rejectedReason })
            };

            const response = await PutCall(`/company/manageRequest/${selectedRequest.manageReqId}`, payload);
            if (response.code === 'SUCCESS') {
                setAlert('success', `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
                fetchData();
                closeDialog();
            } else {
                setAlert('error', 'Something went wrong!')
            }

        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchData();
    }, []);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';

        try {
            // first ensure we have a valid date object
            const date = new Date(timestamp);

            // check if date is valid
            if (isNaN(date.getTime())) {
                return '-';
            }

            // Format the date
            return date.toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return '-';
        }
    };


    const CompareDataTable = ({ oldData, requestedData }: any) => {
        if (!requestedData || typeof requestedData !== 'object') return null;
        if (!oldData || typeof oldData !== 'object') return null;

        const requestedKeys = Object.keys(requestedData);
        const data = requestedKeys.filter(key => requestedData[key] !== null);

        return (
            <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-3 text-left">Field</th>
                            <th className="p-3 text-left">Existing Details</th>
                            <th className="p-3 text-left">Requested Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((key) => (
                            <tr key={key} className="border-t">
                                <td className="p-3 bg-gray-50 font-medium">
                                    {formatKeyName(key)}
                                </td>
                                <td className="p-3">
                                    {oldData[key] ? String(oldData[key]) : '-'}
                                </td>
                                <td className="p-3">
                                    {String(requestedData[key])}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderHeader = () => (
        <div className="flex justify-content-between">
            <span className="p-input-icon-left flex align-items-center">
                <h3 className="mb-0">Request of change information</h3>
            </span>
        </div>
    );


    const renderDialogContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-content-center">
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                </div>
            );
        }

        return (
            <div className="flex flex-column gap-4">
                <CompareDataTable
                    oldData={selectedRequest?.oldData}
                    requestedData={selectedRequest?.requestedData}
                />

                {showRejectInput && (
                    <div className="mt-3">
                        <div className="relative">
                            <InputTextarea
                                value={rejectedReason}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    setRejectedReason(newValue);
                                    setRemainingChars(250 - newValue.length);

                                    try {
                                        rejectionSchema.parse({ reason: newValue });
                                        setRejectionError('');
                                    } catch (error) {
                                        if (error instanceof z.ZodError) {
                                            setRejectionError(error.errors[0].message);
                                        }
                                    }
                                }}
                                rows={4}
                                placeholder="Enter rejection reason"
                                className={`w-full ${rejectionError ? 'p-invalid' : ''}`}
                            />
                            <div className="flex justify-between mt-1">
                                <small className="text-red-500">{rejectionError}</small>
                                <small className={`${remainingChars < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {remainingChars > 0 && (
                                        <small className={`${remainingChars < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                                            {remainingChars} characters remaining
                                        </small>
                                    )}
                                </small>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderDialogFooter = () => {
        if (selectedRequest?.status.toLowerCase() !== 'pending') {
            return (
                <Button
                    label="Close"
                    className="bg-primary-main text-white hover:bg-pink-600 border-none m-3"
                    onClick={closeDialog}
                />
            );
        }

        return (
            <div className="flex justify-content-center gap-2">
                {/* <Button 
                    label="Cancel" 
                    className="bg-primary-main text-white hover:bg-pink-600 border-none m-2" 
                    onClick={closeDialog} 
                /> */}

                {isSupplier() ? <></> :
                    <>
                        {(!showRejectInput || rejectedReason.trim()) && (
                            <>
                                <Button
                                    label="Approve"
                                    className="p-button-success m-2"
                                    onClick={() => handleAction('approve')}
                                    disabled={remainingChars <= 0}
                                />
                                <Button
                                    label="Reject"
                                    className="bg-red-600 text-white border-none hover:bg-red-700 m-2"
                                    onClick={() => handleAction('reject')}
                                    disabled={remainingChars <= 0}
                                />
                            </>
                        )}
                    </>
                }
            </div>
        );
    };

    const buttonRenderer = (rowData: any) => {
        return (
            <Button
                icon="pi pi-eye"
                className="p-button-rounded p-button-text"
                onClick={() => handleViewClick(rowData)}
            />
        );
    };


    const formatKeyName = (key: string) => {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
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
                                page={page}
                                limit={limit}
                                totalRecords={totalRecords}
                                data={requests?.map((item: any) => ({
                                    id: item.manageRequestId,
                                    supplierId: item.supplierId,
                                    supplierName: item.supplier.supplierName,
                                    requestedData: item.requestedData,
                                    oldData: item?.oldData,
                                    createdAtFormatted: formatDate(item.createdAt),
                                    status: item.status,
                                    rejectedReason: item.rejectedReason || 'No Reason',
                                    doc: item.doc || 'https//s3.aws.amazon.com/file/e3f923922/proof.pdf',
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
                                        header: 'Supplier Name',
                                        field: 'supplierName',
                                        filter: true,
                                        bodyStyle: { width: '120px' }
                                    },
                                    {
                                        header: 'Requested At',
                                        field: 'createdAtFormatted',
                                        filter: true,
                                        bodyStyle: { width: '150px' }
                                    },
                                    {
                                        header: 'Status',
                                        field: 'status',
                                        filter: true,
                                        bodyStyle: { width: '150px' },
                                        body: (rowData: any) => {
                                            const getStatusClass = (status: string) => {
                                                switch (status.toLowerCase()) {
                                                    case 'approved':
                                                        return 'bg-green-100 text-green-700 border-round-md';
                                                    case 'rejected':
                                                        return 'bg-red-100 text-red-700 border-round-md';
                                                    case 'pending':
                                                        return 'bg-blue-100 text-blue-700 border-round-md';
                                                    default:
                                                        return '';
                                                }
                                            };
                                            return <span className={`px-2 py-1 rounded-lg ${getStatusClass(rowData.status)}`}>{rowData.status}</span>;
                                        }
                                    },
                                    {
                                        header: 'Proof Document',
                                        field: 'doc',
                                        filter: true,
                                        bodyStyle: { width: '150px' }
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
                    header="Request Details"
                    visible={isDialogVisible}
                    style={{ width: layoutState.isMobile ? '90vw' : '60vw' }}
                    footer={renderDialogFooter()}
                    onHide={closeDialog}
                >
                    {renderDialogContent()}
                </Dialog>

            </div>
        </div>
    );
};

export default ManageRequestsPage;
