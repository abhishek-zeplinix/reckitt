import React, { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { getPeriodOptions } from '@/utils/evaluationPeriod';

interface Department {
    departmentId: number;
    orderBy: number;
    name: string;
    evolutionType: string;
}

const FilterDropdowns = ({ onFilterChange, suppliers, departments, category }: any) => {
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');

    const [periodOptions, setPeriodOptions] = useState([]);
    const [suppliersToList, setSuppliersToList] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);

    useEffect(() => {
        if (departments && selectedDepartment) {
            const currentDepartment = (departments as any[]).find((dep) => dep.departmentId === selectedDepartment?.departmentId);

            if (currentDepartment) {
                const options: any = getPeriodOptions(currentDepartment.evolutionType);
                setPeriodOptions(options);

                handleFilterChange({
                    supplier: selectedSupplier,
                    department: selectedDepartment?.departmentId,
                    period: selectedPeriod,
                    category: selectedCategory
                });
            }
        }

        // if (suppliers) {
        //     const suppliersListOnlyNames: any = (suppliers as any[])?.map((supplier) => ({
        //         supId: supplier.supplier.supId,
        //         supplierName: supplier.supplier.supplierName
        //     }));

        //     setSuppliersToList(suppliersListOnlyNames);
        // }

        // if (category) {
        //     const mappedCategories = category?.map((cat: any) => ({
        //         label: cat.categoryName,
        //         value: cat.categoryId,
        //     }));

        //     setCategoryOptions(mappedCategories);
        // }
    }, [departments, selectedDepartment]);

    useEffect(() => {
        if (suppliers) {
            const suppliersListOnlyNames: any = (suppliers as any[])?.map((supplier) => ({
                supId: supplier.supplier.supId,
                supplierName: supplier.supplier.supplierName
            }));
            setSuppliersToList(suppliersListOnlyNames);
        }

        if (category) {
            const mappedCategories = category.map((cat: any) => ({
                label: cat.categoryName,
                value: cat.categoryId
            }));
            setCategoryOptions(mappedCategories);
        }
    }, [suppliers, category]);

    const categories = [
        { label: 'Copack', value: 'copack' },
        { label: 'Raw & Pack', value: 'raw & pack' }
    ];

    const handleSupplierChange = (e: any) => {
        setSelectedSupplier(e.value);

        onFilterChange({
            supplier: e.value,
            department: selectedDepartment?.departmentId,
            period: selectedPeriod,
            category: selectedCategory
        });
    };

    const handleDepartmentChange = (e: any) => {
        setSelectedDepartment(e.value);

        onFilterChange({
            supplier: selectedSupplier,
            department: selectedDepartment?.departmentId,
            period: selectedPeriod,
            category: selectedCategory
        });
    };

    const handlePeriodChange = (e: any) => {
        setSelectedPeriod(e.value);
        onFilterChange({
            supplier: selectedSupplier,
            department: selectedDepartment?.departmentId,
            period: e.value,
            category: selectedCategory
        });
    };

    const handleCategoryChange = (e: any) => {
        setSelectedCategory(e.value);
        onFilterChange({
            supplier: selectedSupplier,
            department: selectedDepartment?.departmentId,
            period: selectedPeriod,
            category: e.value
        });
    };

    const handleFilterChange = (filters: any) => {
        onFilterChange(filters);
    };

    const containerStyle: any = {
        display: 'flex',
        justifyContent: 'right',
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
        width: '180px',
        minWidth: '150px',
        padding: '1px',
        height: '32px'
    };

    return (
        <div style={containerStyle}>
            <div style={itemStyle}>
                <Dropdown value={selectedSupplier} onChange={handleSupplierChange} options={suppliersToList} optionLabel="supplierName" optionValue="supId" placeholder="Select Supplier" style={fixedDropdown} showClear={!!selectedSupplier}/>
            </div>
            <div style={itemStyle}>
                <Dropdown value={selectedDepartment} onChange={handleDepartmentChange} options={departments} optionLabel="name" placeholder="Select Department" style={fixedDropdown} showClear={!!selectedDepartment}/>
            </div>
            <div style={itemStyle}>
                <Dropdown value={selectedPeriod} onChange={handlePeriodChange} options={periodOptions} optionLabel="label" placeholder="Select Quarter" style={fixedDropdown} showClear={!!selectedPeriod}/>
            </div>
            <div style={itemStyle}>
                <Dropdown value={selectedCategory} onChange={handleCategoryChange} options={categoryOptions} placeholder="Select Category" style={fixedDropdown} showClear={!!selectedCategory}/>
            </div>
            <div style={itemStyle}>
                <Dropdown value={selectedCategory} onChange={handleCategoryChange} options={categoryOptions} placeholder="Select Status" style={fixedDropdown} showClear={!!selectedCategory}/>
            </div>
        </div>
    );
};

export default FilterDropdowns;
