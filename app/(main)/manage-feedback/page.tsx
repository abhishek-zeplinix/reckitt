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
import { DeleteCall, GetCall, PutCall } from '@/app/api-config/ApiKit';
import { Rules } from '@/types';
import { error } from 'console';
import { get } from 'lodash';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const ManageFeedbackPage = () => {
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());

    const [selectedRuleId, setSelectedRuleId] = useState();
    const [action, setAction] = useState(null);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
    const [rules, setRules] = useState<Rules[]>([]);
    const [feedback, setFeedback] = useState<Rules[]>([]);
    const [totalRecords, setTotalRecords] = useState();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const { isLoading, setLoading, setAlert, user} = useAppContext();

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
    // {feedbackRequestId, suppliername, quarter, info, status, file}    

    const handleApproveFeedback = async (e: any) =>{

        const payload = {

            suppliername: get(user, 'name'),
            quarter: e.quarter,
            info: e.info,
            status: e.status,
            file: e.filepath
        };

        console.log(payload);
        
        try{

            const response = await PutCall(`/company/feedback-request/${e.id}`, payload);
            if(response.data === 'SUCCESS'){
                setAlert('success', '')
            }

        }catch(error){


        }finally{


        }
    }

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
                                isDelete={true}
                                extraButtons={[
                                    // {
                                    //     icon: 'pi pi-check'
                                    // },
                                    // {
                                    //     icon: 'pi pi-times'
                                    // }

                                    {
                                        icon: 'pi pi-check',
                                        onClick: (e) => {
                                            handleApproveFeedback(e);
                                        }
                                    }
                                ]}
                                data={feedback.map((item: any) => ({
                                    id: item.id,
                                    suppliername: item.suppliername,
                                    quarter: item.quarter,
                                    filepath: item.filepath,
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
                                        field: 'suppliername',
                                        filter: true,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle,
                                        filterPlaceholder: 'Supplier Id'
                                    },
                                    {
                                        header: 'Quarter',
                                        field: 'quarter',
                                        sortable: true,
                                        filter: true,
                                        filterPlaceholder: 'Supplier Name',
                                        headerStyle: dataTableHeaderStyle,
                                        style: { minWidth: 120, maxWidth: 120 }
                                    },
                                    {
                                        header: 'File',
                                        field: 'filepath',
                                        filter: true,
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle,
                                        filterPlaceholder: 'Search Procurement Category'
                                    },
                                    {
                                        header: 'Info',
                                        field: 'info',
                                        filter: true,
                                        filterPlaceholder: 'Search Supplier Category',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Requested Date',
                                        field: 'requestedDate',
                                        filter: true,
                                        filterPlaceholder: 'Search Supplier Manufacturing Name',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Status',
                                        field: 'status',
                                        filter: true,
                                        filterPlaceholder: 'Search Site Address',
                                        bodyStyle: { minWidth: 150, maxWidth: 150 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Rejected Reason',
                                        field: 'rejectedReason',
                                        filter: true,
                                        filterPlaceholder: 'Search Factory Name',
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

export default ManageFeedbackPage;
