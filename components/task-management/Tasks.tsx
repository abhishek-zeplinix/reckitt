'use client';
import React, { useContext, useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall } from '@/app/api-config/ApiKit';
import { encodeRouteParams } from '@/utils/base64';
import TableSkeletonSimple from '../supplier-rating/skeleton/TableSkeletonSimple';

interface TasksProps {
    role: 'Approver' | 'Evaluator';
}

const Tasks: React.FC<TasksProps> = ({ role }) => {
    const router = useRouter();
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState(false);
    const [page, setPage] = useState(1);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState(getRowLimitWithScreenHeight());
    const [tasksList, setTasksList] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const { isLoading, setLoading, setAlert } = useAppContext();

    const limitOptions = [
        { label: '10', value: 10 },
        { label: '20', value: 20 },
        { label: '50', value: 50 },
        { label: '70', value: 70 },
        { label: '100', value: 100 }
    ];

    const navigateToViewSuppliers = (rowData: any) => {
        router.push(
            `/task-management/view-suppliers/${encodeRouteParams({
                userId: rowData?.userId,
                role: role,
                name: rowData?.user.name,
                department: rowData?.department.name,
            })}`
        );
    };
    
    const navigateToAssign = (rowData: any) => {
        router.push(
            `/task-management/${encodeRouteParams({
                userId: rowData?.userId,
                role: role,
                name: rowData?.user.name,
                department: rowData?.department.name,
            })}`
        );
    };

    const fetchData = async (params?: any) => {
        try {
            setLoading(true);
            if (!params) {
                params = { limit, page, filters: { role } };
            }

            setPage(params.page);
            const queryString = buildQueryParams(params);
            const response = await GetCall(`company/approver-evaluator?${queryString}`);

            setTotalRecords(response.total);
            setTasksList(response.data);
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [limit, page, role]);

    const onLimitChange = (e: any) => {
        setLimit(e.value);
        fetchData({ limit: e.value, page: 1 });
    };

    const columns = [
        {
            header: 'SR. NO',
            body: (data: any, options: any) => {
                const normalizedRowIndex = options.rowIndex % limit;
                return <span>{(page - 1) * limit + normalizedRowIndex + 1}</span>;
            },
            bodyStyle: { minWidth: 50, maxWidth: 50 }
        },
        {
            header: `${role} Name`,
            field: 'user.name',
            bodyStyle: { minWidth: 150, maxWidth: 150 }
        },
        {
            header: 'Department Name',
            field: 'department.name',
            bodyStyle: { minWidth: 150, maxWidth: 150 }
        },
        {
            header: 'Email Address',
            field: 'user.email',
            bodyStyle: { minWidth: 150, maxWidth: 150 }
        },
        {
            header: 'Phone Number',
            field: 'user.phone',
            bodyStyle: { minWidth: 150, maxWidth: 150 }
        },
        {
            header: 'Country',
            field: 'country',
            bodyStyle: { minWidth: 150, maxWidth: 150 }
        },
        {
            header: 'State',
            field: 'state',
            bodyStyle: { minWidth: 150, maxWidth: 150 }
        },
        {
            header: 'City',
            field: 'city',
            bodyStyle: { minWidth: 150, maxWidth: 150 }
        }
    ];

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
                                    <Dropdown
                                        className="mt-2"
                                        value={limit}
                                        options={limitOptions}
                                        onChange={onLimitChange}
                                        placeholder="Limit"
                                        style={{ width: '100px', height: '30px' }}
                                    />
                                </div>
                            </div>
                            {
                                isLoading ? 
                                <div className='mt-3'>
                                <TableSkeletonSimple columns={9} />
                                </div>
                                :
                                    <CustomDataTable
                                        ref={dataTableRef}
                                        page={page}
                                        limit={limit}
                                        totalRecords={totalRecords}
                                        extraButtons={(item) => [
                                            {
                                                icon: 'pi pi-eye',
                                                tooltip: 'View Assigned Suppliers ',
                                                onClick: () => navigateToViewSuppliers(item)
                                            },
                                            {
                                                icon: 'pi pi-pencil',
                                                tooltip: 'Assign Suppliers ',
                                                onClick: () => navigateToAssign(item)
                                            },
                                           
                                        ]}
                                        data={tasksList}
                                        columns={columns}
                                        onLoad={fetchData}
                                    />
                            }

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tasks;