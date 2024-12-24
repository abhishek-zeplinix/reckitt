'use client'
import { GetCall } from "@/app/api-config/ApiKit";
import SupplierEvaluationTable from "@/components/supplier-rating/SupplierRatingTable";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { useEffect, useState } from "react";

const tabs = ['Procurement', 'Development', 'Quality', 'Sustainability', 'Planning'];

const SupplierRatingPage = () => {

    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [activeTab, setActiveTab] = useState("Procurement");
    const [selectedPeriod, setSelectedPeriod] = useState()
    const [rules, setRules] = useState([])
    const [selectedEvaluations, setSelectedEvaluations] = useState({});


    const renderContent = () => {
        switch (activeTab) {
            case 'Procurement':
                return <div>Procurement Content</div>;
            case 'Development':
                return <div>Development Content</div>;
            case 'Quality':
                return <div>Quality Content</div>;
            case 'Sustainability':
                return <div>Sustainability Content</div>;
            case 'Planning':
                return <div>Planning Content</div>;
            default: return null;
        }
    };

    useEffect(() => {

        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Check the initial screen size


        // fetchData();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const leftPanelData = [
        { label: 'Category :', value: 'Raw & Pack' },
        { label: 'Sub-Category :', value: 'Raw Material Supplier' },
        { label: 'Supplier Name :', value: 'Bio-Health Products' },

    ];
    const RightPanelData = [
        { label: 'Supplier Id :', value: '006' },
        { label: 'Warehouse Location :', value: '64 Storage St, Capital City, ST 99000' },

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
                            height: isSmallScreen ? 'auto' : '151px',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '1rem'
                        }}
                    >
                        <ul className="list-none p-0 m-0" style={{ flexGrow: 1, padding: '0' }}>
                            {RightPanelData.map((item, index) => (
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


    const years = [
        { label: 'H1-2024', value: 'H1' },
        { label: 'H2-2024', value: 'H2' },
        { label: 'H3-2024', value: 'H3' },
        { label: 'H4-2024', value: 'H4' }
    ];

    const fetchData = async() => {

        const response = await GetCall('/company/rules/2/2/4');
        setRules(response.data)
    }


    const dummy2 = {
        code: "SUCCESS",
        data: {
            sections: [
                {
                    sectionName: "COMPETITIVENESS",
                    ratedCriteria: [
                        {
                            criteriaName: "Price competitiveness on tenders",
                            percentage: 14,
                            evaluations: [
                                {
                                    criteriaEvaluation: "Always competitive",
                                    score: "10",
                                    ratiosRawpack: 11,
                                    ratiosCopack: 12
                                },
                                {
                                    criteriaEvaluation: "Mostly competitive",
                                    score: "7.5",
                                    ratiosRawpack: 11,
                                    ratiosCopack: 12
                                },
                                {
                                    criteriaEvaluation: "Market average",
                                    score: "5",
                                    ratiosRawpack: 11,
                                    ratiosCopack: 12
                                },
                                {
                                    criteriaEvaluation: "Mostly uncompetitive",
                                    score: "2.5",
                                    ratiosRawpack: 11,
                                    ratiosCopack: 12
                                },
                                {
                                    criteriaEvaluation: "Not applicable (no quotes requested in quarter)",
                                    score: "NA",
                                    ratiosRawpack: 11,
                                    ratiosCopack: 12
                                },
                                {
                                    criteriaEvaluation: "Always not competitive",
                                    score: "0",
                                    ratiosRawpack: 11,
                                    ratiosCopack: 12
                                }
                            ]
                        },
                        {
                            criteriaName: "Payment terms",
                            percentage: 11,
                            evaluations: [
                                {
                                    criteriaEvaluation: ">= 91 days",
                                    score: "10",
                                    ratiosRawpack: 10,
                                    ratiosCopack: 10
                                },
                                {
                                    criteriaEvaluation: "90 days",
                                    score: "2",
                                    ratiosRawpack: 10,
                                    ratiosCopack: 10
                                },
                                {
                                    criteriaEvaluation: "61-89 days",
                                    score: "1",
                                    ratiosRawpack: 10,
                                    ratiosCopack: 10
                                },
                                {
                                    criteriaEvaluation: "60 days or less",
                                    score: "0",
                                    ratiosRawpack: 10,
                                    ratiosCopack: 10
                                },
                                {
                                    criteriaEvaluation: "60 days (France only)",
                                    score: "10",
                                    ratiosRawpack: 10,
                                    ratiosCopack: 10
                                },
                                {
                                    criteriaEvaluation: "30-59 days (France only)",
                                    score: "5",
                                    ratiosRawpack: 10,
                                    ratiosCopack: 10
                                },
                                {
                                    criteriaEvaluation: "Less than 30 days (France only)",
                                    score: "0",
                                    ratiosRawpack: 10,
                                    ratiosCopack: 10
                                },
                                {
                                    criteriaEvaluation: "Not applicable in the quarter",
                                    score: "NA",
                                    ratiosRawpack: 10,
                                    ratiosCopack: 10
                                }
                            ]
                        },
                        {
                            criteriaName: "Vendor Management Inventory",
                            percentage: 18,
                            evaluations: [
                                {
                                    criteriaEvaluation: "Consignment stock based on conditions",
                                    score: "10",
                                    ratiosRawpack: 5,
                                    ratiosCopack: 0
                                },
                                {
                                    criteriaEvaluation: "SOI based on conditions + Blank PO + call off",
                                    score: "9",
                                    ratiosRawpack: 5,
                                    ratiosCopack: 0
                                },
                                {
                                    criteriaEvaluation: "Make to order",
                                    score: "8",
                                    ratiosRawpack: 5,
                                    ratiosCopack: 0
                                },
                                {
                                    criteriaEvaluation:
                                        "Not applicable (site not ready to evaluate this criteria)Not applicable",
                                    score: "NA",
                                    ratiosRawpack: 5,
                                    ratiosCopack: 5
                                }
                            ]
                        },
                        {
                            criteriaName:
                                "Supplier shares info about innovation, new trends, ideas and solutions",
                            percentage: 16,
                            evaluations: [
                                {
                                    criteriaEvaluation: "Reckitt is always first choice to share new concepts",
                                    score: "10",
                                    ratiosRawpack: 5,
                                    ratiosCopack: 5
                                },
                                {
                                    criteriaEvaluation: "All new concepts are presented and offered to Reckitt",
                                    score: "9",
                                    ratiosRawpack: 5,
                                    ratiosCopack: 5
                                },
                                {
                                    criteriaEvaluation: "New concepts are presented on request",
                                    score: "8",
                                    ratiosRawpack: 5,
                                    ratiosCopack: 5
                                },
                                {
                                    criteriaEvaluation: "New concepts are obtained with some obstacles",
                                    score: "5",
                                    ratiosRawpack: 5,
                                    ratiosCopack: 5
                                },
                                {
                                    criteriaEvaluation: "New concepts / innovations are not available ",
                                    score: "0",
                                    ratiosRawpack: 5,
                                    ratiosCopack: 5
                                },
                                {
                                    criteriaEvaluation:
                                        "Not applicable (supplier not expected to provide technical developments)",
                                    score: "NA",
                                    ratiosRawpack: 5,
                                    ratiosCopack: 5
                                }
                            ]
                        }
                    ]
                },
                {
                    sectionName: "FLEXIBILITY",
                    ratedCriteria: [
                        {
                            criteriaName: "Order responsiveness",
                            percentage: 10,
                            evaluations: [
                                {
                                    criteriaEvaluation:
                                        "Always confirms demand changes and covers additional requirements",
                                    score: "10",
                                    ratiosRawpack: 0,
                                    ratiosCopack: 0
                                },
                                {
                                    criteriaEvaluation: "Frequently confirms demand changes",
                                    score: "8",
                                    ratiosRawpack: 0,
                                    ratiosCopack: 0
                                },
                                {
                                    criteriaEvaluation: "Sometimes confirms demand changes",
                                    score: "6",
                                    ratiosRawpack: 0,
                                    ratiosCopack: 0
                                },
                                {
                                    criteriaEvaluation: "Never confirms demand changes",
                                    score: "0",
                                    ratiosRawpack: 0,
                                    ratiosCopack: 0
                                },
                                {
                                    criteriaEvaluation: "Not applicable in the quarter",
                                    score: "NA",
                                    ratiosRawpack: 0,
                                    ratiosCopack: 0
                                }
                            ]
                        }
                    ]
                },
                {
                    sectionName: "STABILITY",
                    ratedCriteria: [
                        {
                            criteriaName: "Financial stability",
                            percentage: 13,
                            evaluations: [
                                {
                                    criteriaEvaluation: "Strong financial condition",
                                    score: "10",
                                    ratiosRawpack: 0,
                                    ratiosCopack: 0
                                },
                                {
                                    criteriaEvaluation: "Moderate financial condition",
                                    score: "5",
                                    ratiosRawpack: 0,
                                    ratiosCopack: 0
                                },
                                {
                                    criteriaEvaluation: "Weak financial condition",
                                    score: "0",
                                    ratiosRawpack: 0,
                                    ratiosCopack: 0
                                }
                            ]
                        }
                    ]
                },
                {
                    sectionName: "SPECIFICS",
                    ratedCriteria: [
                        {
                            criteriaName: "Supplier’s behavior",
                            percentage: 18,
                            evaluations: [
                                {
                                    criteriaEvaluation: "Professional behavior with full support",
                                    score: "10",
                                    ratiosRawpack: 0,
                                    ratiosCopack: 0
                                },
                                {
                                    criteriaEvaluation: "Somewhat professional behavior",
                                    score: "5",
                                    ratiosRawpack: 0,
                                    ratiosCopack: 0
                                },
                                {
                                    criteriaEvaluation: "Unprofessional behavior",
                                    score: "0",
                                    ratiosRawpack: 0,
                                    ratiosCopack: 0
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    };



    const dataPanel = () => {
        return (
            <>
                <div className="border">
                    <div className="p-1">
                        <div className="flex flex-wrap justify-center sm:justify-start space-x-2 sm:space-x-4">
                            {tabs.map((tab) => (
                                <div
                                    key={tab}
                                    className={`px-4 py-2 font-bold transition-all duration-300 cursor-pointer ${activeTab === tab
                                        ? 'text-pink-500 border border-pink-500 rounded-lg'
                                        : 'text-gray-500 border-none'
                                        }`}
                                    style={{
                                        border: activeTab === tab ? '1px solid #ec4899' : 'none',
                                        borderRadius: activeTab === tab ? '12px' : '0',
                                    }}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </div>
                            ))}
                        </div>
                    </div>
                    <hr />

                    <div className="flex justify-content-between">
                        <Dropdown value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.value)} options={years} optionLabel="label"
                            placeholder="Select Period" className="w-full md:w-14rem" />

                        <div className="flex justify-content-end">
                            <Button icon="pi pi-upload" size="small" label="Export" aria-label="Add Supplier" className="default-button " style={{ marginLeft: 10 }} />
                            <Button icon="pi pi-print" size="small" label="Print" aria-label="Import Supplier" className="bg-pink-500 border-pink-500 " style={{ marginLeft: 10 }} onClick={() => window.print()} />
                        </div>

                    </div>

                    {/* <div className="mt-4">{renderContent()}</div> */}

                            {rules && <SupplierEvaluationTable rules={dummy2} />}


                   

                </div>
            </>
        );
    };

    const renderDataPanel = dataPanel();



    return (

        <div className="grid" id="content-to-print">
            <div className="col-12">
                <div>{renderSummoryInfo}</div>
            </div>
            <div className="col-12">
                <div>{renderDataPanel}</div>
            </div>
            {/*  <div className="col-12">
                <div>{renderGraphsPanel}</div>
            </div> */}
        </div>
    )
}

export default SupplierRatingPage;