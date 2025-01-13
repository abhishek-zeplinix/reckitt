import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { getPeriodOptions } from '@/utils/evaluationPeriod';

interface Department {
    departmentId: number;
    orderBy: number;
    name: string;
    evolutionType: string;
}

const FilterDropdowns = ({ onFilterChange, suppliers, departments }: any) => {
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');

    const [periodOptions, setPeriodOptions] = useState([]);
    const [suppliersToList, setSuppliersToList] = useState([]);

    useEffect(() => {
        if (departments && selectedDepartment) {
            const currentDepartment = (departments as any[]).find((dep) => dep.departmentId === selectedDepartment?.departmentId);

            if (currentDepartment) {
                const options: any = getPeriodOptions(currentDepartment.evolutionType);
                setPeriodOptions(options);

                handleFilterChange({
                    supplier: selectedSupplier,
                    department: selectedDepartment?.name,
                    period: selectedPeriod,
                    category: selectedCategory
                });
            }
        }

        if (suppliers) {
            const suppliersListOnlyNames: any = (suppliers as any[])?.map((supplier) => ({
                supId: supplier.supId,
                supplierName: supplier.supplierName
            }));

            setSuppliersToList(suppliersListOnlyNames);
        }
    }, [departments, selectedDepartment]);

    const categories = [
        { label: 'Copack Material', value: 'copack' },
        { label: 'Raw & Pack Material', value: 'raw_pack' }
    ];

    const handleSupplierChange = (e: any) => {
        setSelectedSupplier(e.value);

        onFilterChange({
            supplier: e.value,
            department: selectedDepartment?.name || '',
            period: selectedPeriod,
            category: selectedCategory
        });
    };

    const handleDepartmentChange = (e: any) => {
        setSelectedDepartment(e.value);

        onFilterChange({
            supplier: selectedSupplier,
            department: e.target.value.name || '',
            period: selectedPeriod,
            category: selectedCategory
        });
    };

    const handlePeriodChange = (e: any) => {
        setSelectedPeriod(e.value);
        onFilterChange({
            supplier: selectedSupplier,
            department: selectedDepartment?.name || '',
            period: e.value,
            category: selectedCategory
        });
    };

    const handleCategoryChange = (e: any) => {
        setSelectedCategory(e.value);
        onFilterChange({
            supplier: selectedSupplier,
            department: selectedDepartment?.name || '',
            period: selectedPeriod,
            category: e.value
        });
    };

    const handleFilterChange = (filters: any) => {
        onFilterChange(filters);
    };

    const containerStyle: any = {
        display: 'flex',
        // justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
    };

    const itemStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    };

    const fixedDropdown = {
        width: '230px' /* fixed width for the dropdown */,
        minWidth: '150px' /*ensures dropdown is not smaller than this */,
        padding: '4px',
        height: '45px'
    };

    return (
        <div style={containerStyle}>
            <div style={itemStyle}>
                <Dropdown value={selectedSupplier} onChange={handleSupplierChange} options={suppliersToList} optionLabel="supplierName" optionValue="supId" placeholder="-- Select Supplier --" style={fixedDropdown} />
            </div>
            <div style={itemStyle}>
                <Dropdown value={selectedDepartment} onChange={handleDepartmentChange} options={departments} optionLabel="name" placeholder="-- Select Department --" style={fixedDropdown} />
            </div>
            <div style={itemStyle}>
                <Dropdown value={selectedPeriod} onChange={handlePeriodChange} options={periodOptions} optionLabel="label" placeholder="-- Select Quarter --" style={fixedDropdown} />
            </div>
            <div style={itemStyle}>
                <Dropdown value={selectedCategory} onChange={handleCategoryChange} options={categories} optionLabel="label" placeholder="-- Select Category --" style={fixedDropdown} />
            </div>
        </div>
    );
};

export default FilterDropdowns;
