// // import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
// // import { Button } from 'primereact/button';
// // import { DataTable, DataTableBaseProps, DataTableFilterEvent, DataTablePageEvent, DataTableValueArray } from 'primereact/datatable';
// // import { Column, ColumnProps } from 'primereact/column';

// // interface ColumnItem extends ColumnProps {
// //     dbField?: string;
// // }

// // interface ExtraButton {
// //     icon: any;
// //     tooltip?:string;
// //     onClick?: (item: any) => void;
// // }

// // interface CustomTableOption extends DataTableBaseProps<DataTableValueArray> {
// //     title?: string;
// //     data: any[];
// //     limit: number;
// //     page: number;
// //     columns: ColumnItem[];
// //     tree?: boolean;
// //     filter?: boolean;
// //     include?: string[];
// //     isEdit?: boolean;
// //     isDelete?: boolean;
// //     isView?: boolean;
// //     extraButtons?: (item: any) => ExtraButton[]; // Changed to a function
// //     onLoad?: (item: any) => void;
// //     onView?: (item: any) => void;
// //     onEdit?: (item: any) => void;
// //     onDelete?: (item: any) => void;
// // }

// // export interface CustomDataTableRef {
// //     refreshData: () => any;
// //     getCurrentPagerState: () => any;
// //     updatePagination: (page: any) => any;
// //     updatePaginationAfterDelete: (key: string, rowId: any) => void;
// // }

// // const CustomDataTable = forwardRef<CustomDataTableRef, CustomTableOption>((props: CustomTableOption, ref?: any) => {
// //     const [lazyParams, setLazyParams] = useState<any>({
// //         first: 0,
// //         rows: 10,
// //         page: 1,
// //         sortField: undefined,
// //         sortOrder: undefined,
// //         filters: {}
// //     });

// //     const [isActionsFrozen, setIsActionsFrozen] = useState(false);

// //     const toggleActionColumnFreeze = () => {
// //         setIsActionsFrozen((prevState) => !prevState);
// //     };

// //     const renderActions = (item: any) => {
// //         return (
// //             <div className="flex gap-1">
// //                 {props.isView && <Button type="button" icon={'pi pi-eye'} className="p-button-md p-button-text hover:bg-primary-main text-primary-main " onClick={() => props.onView && props.onView(item)} />}
// //                 {props.isEdit && <Button type="button" icon={'pi pi-user-edit'} className="p-button-md p-button-text hover:bg-primary-main text-primary-main " title="Edit" onClick={() => props.onEdit && props.onEdit(item)} />}
// //                 {props.isDelete && (
// //                     <Button type="button" icon={'pi pi-trash'} className="p-button-md p-button-text hover:bg-primary-main text-primary-main " title="Delete" style={{ color: 'red' }} onClick={() => props.onDelete && props.onDelete(item)} />
// //                 )}
// //                 {props?.extraButtons &&
// //                     props
// //                         .extraButtons(item)
// //                         .map((btn: ExtraButton, index: number) => (
// //                             <Button key={`ExtraButton${index}`} type="button" icon={btn.icon} className="p-button-md p-button-text hover:bg-primary-main text-primary-main" onClick={() => btn.onClick && btn.onClick(item) } tooltip={btn.tooltip} tooltipOptions={{ style: { fontSize: '10px', padding: '2px 4px' } }}/>
// //                         ))}
// //             </div>
// //         );
// //     };

// //     return (
// //         <div className="card reckitt-table-container mt-3">
// //             <DataTable
// //                 lazy
// //                 paginator
// //                 removableSort
// //                 {...props}
// //                 totalRecords={props.totalRecords || 0}
// //                 first={lazyParams.first}
// //                 rows={props.limit}
// //                 value={props.data}
// //                 filterDisplay={props.filter ? 'row' : undefined}
// //                 className="reckitt-table p-datatable-thead"
// //                 pageLinkSize={3}
// //                 scrollable
// //                 // scrollDirection="both" // Enables both horizontal and vertical scrolling
// //                 tableStyle={{ minWidth: '30rem' }}
// //                 onPage={(event: DataTablePageEvent) => {
// //                     const newLazyParams = {
// //                         ...lazyParams,
// //                         first: event.first,
// //                         rows: event.rows,
// //                         page: event.page ? event.page + 1 : 1
// //                     };

// //                     setLazyParams(newLazyParams);

// //                     // Call the parent function to fetch new data based on pagination
// //                     if (props.onLoad) {
// //                         props.onLoad(newLazyParams);
// //                     }
// //                 }}
// //                 onFilter={(event: DataTableFilterEvent) => {
// //                     setLazyParams({
// //                         ...event,
// //                         first: 0
// //                     });
// //                 }}
// //                 sortField={lazyParams.sortField}
// //                 sortOrder={lazyParams.sortOrder}
// //                 paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
// //                 currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
// //             >
// //                 {/* Actions Column */}
// //                 {(props.isEdit || props.isView || props.isDelete || props.extraButtons?.length) && (
// //                     <Column
// //                         header={
// //                             <div className="flex items-center gap-2 ">
// //                                 <span style={{ fontSize: '13px' }}>ACTIONS</span>
// //                                 <div>
// //                                     <input type="checkbox" checked={isActionsFrozen} onChange={toggleActionColumnFreeze} title="Freeze/Unfreeze Action Column" className="no-background-tooltip" />
// //                                 </div>
// //                             </div>
// //                         }
// //                         alignFrozen="left"
// //                         frozen={isActionsFrozen}
// //                         body={renderActions}
// //                     ></Column>
// //                 )}
// //                 {props.columns.map((item: ColumnProps, index: any) => (
// //                     <Column key={index} {...item} header={<span style={{ fontSize: '13px' }}>{item.header?.toString().toUpperCase()}</span>}></Column>
// //                 ))}
// //             </DataTable>
// //         </div>
// //     );
// // });

// // export default CustomDataTable;

// import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
// import { Button } from 'primereact/button';
// import { DataTable, DataTableBaseProps, DataTableFilterEvent, DataTablePageEvent, DataTableValueArray } from 'primereact/datatable';
// import { Column, ColumnProps } from 'primereact/column';

// interface ColumnItem extends ColumnProps {
//     dbField?: string;
// }

// interface ExtraButton {
//     icon: any;
//     tooltip?: string;
//     onClick?: (item: any) => void;
// }

// interface CustomTableOption extends DataTableBaseProps<DataTableValueArray> {
//     title?: string;
//     data: any[];
//     limit: number;
//     page: number;
//     columns: ColumnItem[];
//     tree?: boolean;
//     filter?: boolean;
//     include?: string[];
//     isEdit?: boolean;
//     isDelete?: boolean;
//     isView?: boolean;
//     extraButtons?: (item: any) => ExtraButton[]; // Changed to a function
//     onLoad?: (item: any) => void;
//     onView?: (item: any) => void;
//     onEdit?: (item: any) => void;
//     onDelete?: (item: any) => void;
// }

// export interface CustomDataTableRef {
//     refreshData: () => any;
//     getCurrentPagerState: () => any;
//     updatePagination: (page: any) => any;
//     updatePaginationAfterDelete: (key: string, rowId: any) => void;
// }

// const CustomDataTable = forwardRef<CustomDataTableRef, CustomTableOption>((props: CustomTableOption, ref?: any) => {
//     const [lazyParams, setLazyParams] = useState<any>({
//         first: 0,
//         rows: 10,
//         page: 1,
//         sortField: undefined,
//         sortOrder: undefined,
//         filters: {}
//     });

//     const [isActionsFrozen, setIsActionsFrozen] = useState(false);

//     const toggleActionColumnFreeze = () => {
//         setIsActionsFrozen((prevState) => !prevState);
//     };

//     const renderActions = (item: any) => {
//         return (
//             <div className="flex gap-1">
//                 {props.isView && <Button type="button" icon={'pi pi-eye'} className="p-button-md p-button-text hover:bg-primary-main text-primary-main " onClick={() => props.onView && props.onView(item)} />}
//                 {props.isEdit && <Button type="button" icon={'pi pi-user-edit'} className="p-button-md p-button-text hover:bg-primary-main text-primary-main " title="Edit" onClick={() => props.onEdit && props.onEdit(item)} />}
//                 {props.isDelete && (
//                     <Button type="button" icon={'pi pi-trash'} className="p-button-md p-button-text hover:bg-primary-main text-primary-main " title="Delete" style={{ color: 'red' }} onClick={() => props.onDelete && props.onDelete(item)} />
//                 )}
//                 {props?.extraButtons &&
//                     props
//                         .extraButtons(item)
//                         .map((btn: ExtraButton, index: number) => (
//                             <Button key={`ExtraButton${index}`} type="button" icon={btn.icon} className="p-button-md p-button-text hover:bg-primary-main text-primary-main" onClick={() => btn.onClick && btn.onClick(item)} tooltip={btn.tooltip} tooltipOptions={{ style: { fontSize: '10px', padding: '2px 4px' } }} />
//                         ))}
//             </div>
//         );
//     };

//     return (
//         <div className="card reckitt-table-container mt-3">
//             <DataTable
//                 lazy
//                 paginator
//                 removableSort
//                 {...props}
//                 totalRecords={props.totalRecords || 0}
//                 first={lazyParams.first}
//                 rows={props.limit}
//                 value={props.data}
//                 filterDisplay={props.filter ? 'row' : undefined}
//                 className="reckitt-table p-datatable-thead"
//                 pageLinkSize={3}
//                 scrollable
//                 tableStyle={{ minWidth: '30rem' }}
//                 onPage={(event: DataTablePageEvent) => {
//                     const newLazyParams = {
//                         ...lazyParams,
//                         first: event.first,
//                         rows: event.rows,
//                         page: event.page ? event.page + 1 : 1
//                     };

//                     setLazyParams(newLazyParams);

//                     // Call the parent function to fetch new data based on pagination
//                     if (props.onLoad) {
//                         props.onLoad(newLazyParams);
//                     }
//                 }}
//                 onFilter={(event: DataTableFilterEvent) => {
//                     setLazyParams({
//                         ...event,
//                         first: 0
//                     });
//                 }}
//                 sortField={lazyParams.sortField}
//                 sortOrder={lazyParams.sortOrder}
//                 paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
//                 currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
//             >
//                 {/* Actions Column */}
//                 {(props.isEdit || props.isView || props.isDelete || props.extraButtons?.length) && (
//                     <Column
//                         header={
//                             <div className="flex items-center gap-2 ">
//                                 <span style={{ fontSize: '13px' }}>ACTIONS</span>
//                                 <div>
//                                     <input type="checkbox" checked={isActionsFrozen} onChange={toggleActionColumnFreeze} title="Freeze/Unfreeze Action Column" className="no-background-tooltip" />
//                                 </div>
//                             </div>
//                         }
//                         alignFrozen="left"
//                         frozen={isActionsFrozen}
//                         body={renderActions}
//                     ></Column>
//                 )}
//                 {props.columns.map((item: ColumnProps, index: any) => (
//                     <Column key={index} {...item} header={<span style={{ fontSize: '13px' }}>{item.header?.toString().toUpperCase()}</span>}></Column>
//                 ))}
//             </DataTable>
//         </div>
//     );
// });

// export default CustomDataTable;

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable, DataTableBaseProps, DataTableFilterEvent, DataTablePageEvent, DataTableValueArray } from 'primereact/datatable';
import { Column, ColumnProps } from 'primereact/column';
import { Tooltip } from 'primereact/tooltip';

interface ColumnItem extends ColumnProps {
    dbField?: string;
}

interface ExtraButton {
    icon: any;
    tooltip?: string;
    onClick?: (item: any) => void;
}

interface CustomTableOption extends DataTableBaseProps<DataTableValueArray> {
    title?: string;
    data: any[];
    limit: number;
    page: number;
    columns: ColumnItem[];
    tree?: boolean;
    filter?: boolean;
    include?: string[];
    isEdit?: boolean;
    isDelete?: boolean;
    isView?: boolean;
    extraButtons?: (item: any) => ExtraButton[]; // Changed to a function
    onLoad?: (item: any) => void;
    onView?: (item: any) => void;
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
}

export interface CustomDataTableRef {
    refreshData: () => any;
    getCurrentPagerState: () => any;
    updatePagination: (page: any) => any;
    updatePaginationAfterDelete: (key: string, rowId: any) => void;
}

const CustomDataTable = forwardRef<CustomDataTableRef, CustomTableOption>((props: CustomTableOption, ref?: any) => {
    const [lazyParams, setLazyParams] = useState<any>({
        first: (props.page - 1) * props.limit, // Calculate initial `first` based on `page` and `limit`
        rows: props.limit,
        page: props.page,
        sortField: undefined,
        sortOrder: undefined,
        filters: {}
    });

    const [isActionsFrozen, setIsActionsFrozen] = useState(false);

    const toggleActionColumnFreeze = () => {
        setIsActionsFrozen((prevState) => !prevState);
    };

    const renderActions = (item: any) => {
        return (
            <div className="flex gap-1">
                {props.isView && <Button type="button" icon={'pi pi-eye'} className="p-button-md p-button-text hover:bg-primary-main text-primary-main " onClick={() => props.onView && props.onView(item)} />}
                {props.isEdit && <Button type="button" icon={'pi pi-user-edit'} className="p-button-md p-button-text hover:bg-primary-main text-primary-main " title="Edit" onClick={() => props.onEdit && props.onEdit(item)} />}
                {props.isDelete && (
                    <Button type="button" icon={'pi pi-trash'} className="p-button-md p-button-text hover:bg-primary-main text-primary-main " title="Delete" style={{ color: 'red' }} onClick={() => props.onDelete && props.onDelete(item)} />
                )}
                {props?.extraButtons &&
                    props
                        .extraButtons(item)
                        .map((btn: ExtraButton, index: number) => (
                            <Button
                                key={`ExtraButton${index}`}
                                type="button"
                                icon={btn.icon}
                                className="p-button-md p-button-text hover:bg-primary-main text-primary-main"
                                onClick={() => btn.onClick && btn.onClick(item)}
                                tooltip={btn.tooltip}
                                tooltipOptions={{ style: { fontSize: '10px', padding: '2px 4px' } }}
                            />
                        ))}
            </div>
        );
    };

    useEffect(() => {
        // Update `lazyParams` when `props.page` or `props.limit` changes
        setLazyParams((prevParams: any) => ({
            ...prevParams,
            first: (props.page - 1) * props.limit, // Calculate `first` based on `page` and `limit`
            rows: props.limit,
            page: props.page
        }));
    }, [props.page, props.limit]);

    return (
        <div className="card reckitt-table-container mt-3">
            <DataTable
                lazy
                paginator
                removableSort
                {...props}
                totalRecords={props.totalRecords || 0}
                first={lazyParams.first}
                rows={lazyParams.rows}
                value={props.data}
                filterDisplay={props.filter ? 'row' : undefined}
                className="reckitt-table p-datatable-thead"
                pageLinkSize={3}
                scrollable
                tableStyle={{ minWidth: '30rem' }}
                onPage={(event: DataTablePageEvent) => {
                    const newLazyParams = {
                        ...lazyParams,
                        first: event.first,
                        rows: event.rows,
                        page: event.page ? event.page + 1 : 1 // Update `page` based on `event.page`
                    };

                    setLazyParams(newLazyParams);

                    // Call the parent function to fetch new data based on pagination
                    if (props.onLoad) {
                        props.onLoad(newLazyParams);
                    }
                }}
                onFilter={(event: DataTableFilterEvent) => {
                    setLazyParams({
                        ...event,
                        first: 0
                    });
                }}
                sortField={lazyParams.sortField}
                sortOrder={lazyParams.sortOrder}
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
            >
                {/* Actions Column */}
                {(props.isEdit || props.isView || props.isDelete || props.extraButtons?.length) && (
                    <Column
                        header={
                            <div className="flex items-center gap-2 ">
                                <span style={{ fontSize: '13px' }}>ACTIONS</span>
                                <div>
                                    <input type="checkbox" id="freezeCheckbox" checked={isActionsFrozen} onChange={toggleActionColumnFreeze} className="no-background-tooltip" />
                                    <Tooltip target="#freezeCheckbox" content="Freeze/Unfreeze Action Column" position="top" />
                                </div>
                            </div>
                        }
                        alignFrozen="left"
                        frozen={isActionsFrozen}
                        body={renderActions}
                    ></Column>
                )}
                {props.columns.map((item: ColumnProps, index: any) => (
                    <Column key={index} {...item} header={<span style={{ fontSize: '13px' }}>{item.header?.toString().toUpperCase()}</span>}></Column>
                ))}
            </DataTable>
        </div>
    );
});

export default CustomDataTable;
