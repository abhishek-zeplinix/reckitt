import ReadMoreText from "@/components/read-more-text/ReadMoreText";
import SupplierSummaryRightLeftPanelSkeleton from "../../skeleton/SupplierSummaryLeftRightPanelSkeleton";
import { useState } from "react";

const SupplierScoreboardSummaryCard = ({ suppliers, isLoading }: any) => {

    const [isSmallScreen, setIsSmallScreen] = useState(false);

    const formatDate = (timestamp: any) => {
        const date = new Date(timestamp);

        //YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];

        return formattedDate;
    };
    const safeSupplierData = suppliers || {};
    
    const leftPanelData = [
        { label: 'Supplier Name :', value: safeSupplierData.supplierName ?? 'N/A' },
        { label: 'Supplier Id :', value: safeSupplierData.supId ?? 'N/A' },
        { label: 'Category :', value: safeSupplierData.category?.categoryName ?? 'N/A' },
        { label: 'Sub-Category :', value: safeSupplierData.subCategories?.subCategoryName ?? 'N/A' },
        { label: 'Supplier Manufacturer Name :', value: safeSupplierData.supplierManufacturerName ?? 'N/A' }
    ];

    const rightPanelData = [
        { label: 'Warehouse Location :', value: <ReadMoreText text={safeSupplierData?.warehouseLocation ?? 'N/A'} charLimit={70} /> },
        { label: 'Assessment Pending :', value: 'No Info' },
        { label: 'On Boarding Date :', value: safeSupplierData?.createdAt ? formatDate(safeSupplierData.createdAt) : 'N/A' },
        { label: 'Supplier Tier :', value: 'No Tier' }
    ];

    return (
        <>
            <div className="flex justify-content-between align-items-start flex-wrap gap-4">
                <div
                    className="card shadow-lg  "
                    style={{
                        flexBasis: '48%',
                        minWidth: '48%',
                        width: isSmallScreen ? '100%' : '100%',
                        flexGrow: 1,
                        height: isSmallScreen ? 'auto' : '266px',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '1rem'
                    }}
                >
               
                        <ul className="list-none p-0 m-0" style={{ flexGrow: 1, padding: '0' }}>
                            {leftPanelData.map((item, index) => (
                                <>
                                    <li key={index} className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-2" style={{ flex: '1' }}>
                                        <div>
                                            <div className="mt-1 text-600" style={{ fontSize: '0.9rem' }}>
                                                {item.label}
                                            </div>
                                        </div>
                                        <div className="mt-2 md:mt-0 flex align-items-center" style={{ fontSize: '0.9rem' }}>
                                            <span className="text-900 font-medium mr-2 mb-1 md:mb-0">{item.value}</span>
                                        </div>
                                    </li>
                                    {index < leftPanelData.length - 1 && <hr style={{ borderColor: '#CBD5E1', borderWidth: '0.1px', opacity: '0.4' }} />}
                                </>
                            ))}
                        </ul>
                </div>

                <div
                    className="card shadow-lg  "
                    style={{
                        flexBasis: '48%',
                        minWidth: '48%',
                        width: isSmallScreen ? '100%' : '100%',
                        flexGrow: 1,
                        height: isSmallScreen ? 'auto' : '266px',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '1rem'
                    }}
                >
                   
                        <ul className="list-none p-0 m-0" style={{ flexGrow: 1, padding: '0' }}>
                            {rightPanelData?.map((item, index) => (
                                <>
                                    <li key={index} className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-2" style={{ flex: '1' }}>
                                        <div>
                                            <div className="mt-1 text-600" style={{ fontSize: '0.9rem' }}>
                                                {item.label}
                                            </div>
                                        </div>
                                        <div className="mt-2 md:mt-0 flex align-items-center" style={{ fontSize: '0.9rem' }}>
                                            <span className="text-900 font-medium mr-2 mb-1 md:mb-0">{item.value}</span>
                                        </div>
                                    </li>
                                    {index < rightPanelData.length - 1 && <hr style={{ borderColor: '#CBD5E1', borderWidth: '0.1px', opacity: '0.4' }} />}
                                </>
                            ))}
                        </ul>
                </div>
            </div>
        </>
    );
};

export default SupplierScoreboardSummaryCard;