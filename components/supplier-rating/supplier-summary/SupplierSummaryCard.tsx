import useFetchSingleSupplierDetails from "@/hooks/useFetchSingleSupplierDetails";
import { useParams } from "next/navigation";
import { useState } from "react";

const SupplierSummaryCard = () => {

    const urlParams = useParams();
    const { supId, catId, subCatId } = urlParams;
    const { suppliers }: any = useFetchSingleSupplierDetails({ catId, subCatId, supId })
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    const leftPanelData = [
        {
            label: 'Category :',
            value: `${suppliers?.category?.categoryName}`
        },
        {
            label: 'Sub-Category :',
            value: `${suppliers?.subCategories?.subCategoryName}`
        },
        {
            label: 'Supplier Name :',
            value: `${suppliers?.supplierName}`
        }
    ];
    const RightPanelData = [
        { label: 'Supplier Id :', value: `${suppliers?.supId}` },
        { label: 'Warehouse Location :', value: `${suppliers?.warehouseLocation}` }
    ];


    const summoryCards = () => {
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
                            height: isSmallScreen ? 'auto' : '151px',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '1rem'
                        }}
                    >
                        <ul className="list-none p-0 m-0" style={{ flexGrow: 1, padding: '0' }}>
                            {leftPanelData?.map((item, index) => (
                                <>
                                    <li key={index} className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-2 " style={{ flex: '1' }}>
                                        <div>
                                            <div className="mt-1 text-600" style={{ fontSize: '0.9rem' }}>
                                                {item.label}
                                            </div>
                                        </div>
                                        <div className="mt-2 md:mt-0 flex align-items-center " style={{ fontSize: '0.9rem' }}>
                                            <span className="text-900 font-medium mr-2 mb-1 md:mb-0 ">{item.value}</span>
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
                            height: isSmallScreen ? 'auto' : '151px',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '1rem'
                        }}
                    >
                        <ul className="list-none p-0 m-0" style={{ flexGrow: 1, padding: '0' }}>
                            {RightPanelData?.map((item, index) => (
                                <>
                                    <li key={index} className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-2 " style={{ flex: '1' }}>
                                        <div>
                                            <div className="mt-1 text-600" style={{ fontSize: '0.9rem' }}>
                                                {item.label}
                                            </div>
                                        </div>
                                        <div className="mt-2 md:mt-0 flex align-items-center" style={{ fontSize: '0.9rem' }}>
                                            <span className="text-900 font-medium mr-2 mb-1 md:mb-0">{item.value}</span>
                                        </div>
                                    </li>
                                    {index < RightPanelData.length - 1 && <hr style={{ borderColor: '#CBD5E1', borderWidth: '0.1px', opacity: '0.4' }} />}
                                </>
                            ))}
                        </ul>
                    </div>
                </div>
            </>
        );
    };

    const renderSummoryInfo = summoryCards();
    return (
        <>
        {renderSummoryInfo}
        </>
    )
}

export default SupplierSummaryCard;