import { Chart } from 'primereact/chart';
import { Dropdown } from "primereact/dropdown";
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from "react";
import { buildQueryParams } from '@/utils/utils';
import { GetCall } from '@/app/api-config/ApiKit';
import { useAuth } from '@/layout/context/authContext';
import { any } from 'zod';

const HistoricalPerformanceGraph = () => {

    const [selectedSupId, setSelectedSupId] = useState(null);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const { role } = useAuth();

    console.log(role);
    console.log(suppliers);
    console.log(selectedSupId);
    
    const roleConfig: any = {
        admin: {
            endpoint: '/company/supplier',
            getFilters: () => ({})
        },
        superadmin: {
            endpoint: '/company/supplier',
            getFilters: () => ({})
        },
        approver: {
            endpoint: '/company/suppliers-mapped-config-login-user',
            getFilters: () => ({})
        },
        evaluator: {
            endpoint: '/company/suppliers-mapped-config-login-user',
            getFilters: () => ({})
        }
    };

    const fetchData = async (params?: any) => {
        if (!role) return;

        try {

            const config = roleConfig[role];
            if (!config) {
                throw new Error('Invalid user role');
            }

            const defaultParams = {
                filters: config.getFilters()
            };

            const queryString = buildQueryParams(defaultParams);
            const response = await GetCall(`${config.endpoint}?${queryString}`);

            if (response.code === 'SUCCESS') {
                if (role === 'approver' || role === 'evaluator') {
                    const transformedData = transformSupplierData(response);
                    setSuppliers(transformedData);
                } else {
                    const transformedData = transformAdminData(response?.data);
                    setSuppliers(transformedData);
                }
            } else {
                setSuppliers([]);
            }
        } catch (error) {
            // setAlert('error', 'Something went wrong!');
        } finally {
        }
    };

    const fetchSpecificData = async (supId: any) => {
            
    }

    useEffect(() => {
        fetchData();
    }, [role]);


    const transformSupplierData = (responseData: any) => {
        if (!responseData?.data?.supplierAssigment) return [];

        return responseData.data.supplierAssigment.map((assignment: any) => {
            const supplier = assignment.suppliers[0];
            return {
                value: supplier.supId,
                supplierName: supplier.supplierName,
            };
        });
    };


    const transformAdminData = (responseData: any) => {
        if (!responseData) return [];
    
        return responseData.map((supplier: any) => ({
            value: supplier.supId,
            supplierName: supplier.supplierName
        }));
    }



    const dataWaveGraphs = {
        labels: ['Q1/2025', 'Q2/H1 2025', 'Q3 2025', 'Q4/H2 2025', 'Q1 2025', 'Q2/H1 2025'],
        datasets: [
            {
                label: 'Sustainability',
                data: [60, 45, 70, 95, 88, 92],
                borderColor: '#2196F3',
                backgroundColor: 'rgba(0, 122, 217, 0.2)',
                fill: false,
                tension: 0
            },
            {
                label: 'Development',
                data: [90, 68, 30, 82, 68, 22],
                borderColor: '#FF9800',
                backgroundColor: 'rgba(240, 200, 8, 0.2)',
                fill: false,
                tension: 0
            },
            {
                label: 'Procurement',
                data: [50, 55, 45, 60, 58, 62],
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(0, 166, 82, 0.2)',
                fill: false,
                tension: 0
            },
            {
                label: 'Planning',
                data: [30, 35, 25, 40, 38, 42],
                borderColor: '#F44336',
                backgroundColor: 'rgba(214, 48, 49, 0.2)',
                fill: false,
                tension: 0
            },
            {
                label: 'Quality',
                data: [0, 25, 15, 30, 28, 85],
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.2)',
                fill: false,
                tension: 0
            }
        ]
    };
    const waveOptions = {
        responsive: true,
        animation: false,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Quarter'
                }
            },
            y: {
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 10
                },
                title: {
                    display: true,
                    text: 'Score'
                }
            }
        }
    };

    const sections = [
        { label: 'Sustainability', image: '/images/waves/blue.svg' },
        { label: 'Development', image: '/images/waves/yellow.svg' },
        { label: 'Procurement', image: '/images/waves/green.svg' },
        { label: 'Planning', image: '/images/waves/red.svg' },
        { label: 'Quality', image: '/images/waves/purple.svg' }
    ];

    const cities = [
        { name: 'New York', code: 'NY' },
        { name: 'Rome', code: 'RM' },
        { name: 'London', code: 'LDN' },
        { name: 'Istanbul', code: 'IST' },
        { name: 'Paris', code: 'PRS' }
    ];


    const waveSideGraphs = () => {
        return (
            <div className="p-4 border-round-md shadow-1 w-2xl">
                {sections.map((section, index) => (
                    <div key={index} className="p-flex p-ai-center p-jc-between py-1 border-bottom-1 border-gray-300 last:border-none">
                        {/* Icon */}
                        <div className="flex items-center pt-2">
                            <Image src={section.image} alt={section.label} width={30} height={30} className="pb-2" />
                            {/* Label */}
                            <span className="text-gray-700 text-lg ml-3">{section.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const WaveSideGraphs = waveSideGraphs();

    return (

        <div className="p-flex px-4 py-4 p-flex-column p-ai-center p-p-4 border-round-xl shadow-2 surface-card">
            <div className="flex justify-content-between align-items-center">
                <div className="mb-5">
                    <h3>Historical Performance Per Function</h3>
                    <p>Lorem ipsum dummy text in progress assessment</p>
                </div>
                <div>
                    <Dropdown value={selectedSupId} onChange={(e) => setSelectedSupId(e.value)} options={suppliers} optionLabel="supplierName" placeholder="All Supplier" className="w-full md:w-14rem bgActiveBtn bgActiveBtnText custom-dropdown px-2 py-1 " />
                </div>
            </div>
            <div className="flex justify-content-between">
                <div style={{ width: '70%', height: 'auto' }} className="">
                    <Chart type="line" data={dataWaveGraphs} options={waveOptions} />
                </div>
                <div style={{ background: '#F8FAFC' }}>{WaveSideGraphs}</div>
            </div>
            <div>
                <div className="grid mt-3 score-bg p-4">
                    <div className="flex gap-6 px-4 ">
                        <div className="flex align-items-center mr-4 border-right-1 pr-12 p-2 w-full mb-2 border-gray-400">
                            <span className="w-2rem h-2rem critical  border-round-md  mr-2 "></span>
                            <span className="text-sm"> Critical (0-50)</span>
                        </div>
                        <div className="flex align-items-center mr-4 border-right-1 pr-12 w-full mb-2 border-gray-400">
                            <span className="w-2rem h-2rem improvement border-round-md  mr-2 "></span>
                            <span className="text-sm"> Improvement Needed (51-70)</span>
                        </div>
                        <div className="flex align-items-center mr-4 border-right-1 pr-12 w-full mb-2 border-gray-400">
                            <span className="w-2rem h-2rem good  border-round-md  mr-2 "></span>
                            <span className="text-sm">Good (71-90)</span>
                        </div>
                        <div className="flex align-items-center  w-full mb-2 border-gray-400">
                            <span className="w-2rem h-2rem excellent border-round-md  mr-2 "></span>
                            <span className="text-sm">Excellent (91-100)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HistoricalPerformanceGraph;