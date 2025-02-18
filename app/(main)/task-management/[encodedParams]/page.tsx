'use client';
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PostCall } from '@/app/api-config/ApiKit';
import useDecodeParams from '@/hooks/useDecodeParams';
import { limitOptions } from '@/utils/constant';
import { InputText } from 'primereact/inputtext';
import useFetchDepartments from '@/hooks/useFetchDepartments';
import { Country, State, City } from 'country-state-city';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import CustomDialogBox from '@/components/dialog-box/CustomDialogBox';
import { RadioButton } from 'primereact/radiobutton';
import { debounce } from 'lodash';

const AssignSuppliers = ({
    params,
}: {
    params: { encodedParams: string };
}) => {
    const router = useRouter();
    const { layoutState } = useContext(LayoutContext);
    const [isShowSplit, setIsShowSplit] = useState(false);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(getRowLimitWithScreenHeight());
    const [tasksList, setTasksList] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const { isLoading, setLoading, setAlert } = useAppContext();
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState<any[]>([]);
    const [showTable, setShowTable] = useState(false);
    const [isCompletionDialogVisible, setIsCompletionDialogVisible] = useState(false);
    const [assignmentMode, setAssignmentMode] = useState('manual'); // 'manual' or 'all'
    const [zipCode, setZipCode] = useState('');

    const decodedParams = useDecodeParams(params.encodedParams);
    const { userId, role, name, department } = decodedParams;

    useEffect(() => {
        const allCountries = Country.getAllCountries().map(country => ({
            label: country.name,
            value: country.isoCode
        }));
        setCountries(allCountries);
        fetchData();
    }, []);


   
    console.log(userId);
    console.log(role);
    console.log(name);
    console.log(department);


    // const { departments } = useFetchDepartments();

    const fetchData = async (currentPage = page, customFilters = {}) => {

        try {
            setLoading(true);
            const queryParams = {
                limit,
                page: currentPage + 1,
                filters: customFilters
            };

            const queryString = buildQueryParams(queryParams);
            const response = await GetCall(`/company/suppliers/for-approver-evaluator?${queryString}`);

            setTotalRecords(response.total);
            setTasksList(response.data);
            setShowTable(true);
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const debouncedZipCodeSearch = useCallback(
        debounce((zipValue: string, filters: any) => {
            const updatedFilters = {
                ...filters,
                ...(zipValue && { zipCode: zipValue })
            };
            setPage(0);
            fetchData(0, updatedFilters);
        }, 700),
        []
    );

    if (!userId || !role || !name || !department) {
        router.replace('/404')
        return null;
    }

    

    const onLimitChange = (e: any) => {
        setLimit(e.value);
        setPage(0);
        fetchData(0);
    };


    const onCountryChange = (e: any) => {
        const countryCode = e.value;
        const countryData = Country.getCountryByCode(countryCode);

        setSelectedCountry(countryCode);
        setSelectedState('');
        setSelectedCity('');

        if (countryCode) {
            const countryStates = State.getStatesOfCountry(countryCode).map(state => ({
                label: state.name,
                value: state.isoCode
            }));
            setStates(countryStates);
        } else {
            setStates([]);
        }

        const filters = {
            ...(countryData && { country: countryData.name })
        };

        setPage(0);
        fetchData(0, filters);
    };

    const onStateChange = (e: any) => {
        const stateCode = e.value;
        const stateData = State.getStateByCodeAndCountry(stateCode, selectedCountry);
        const countryData = Country.getCountryByCode(selectedCountry);

        setSelectedState(stateCode);
        setSelectedCity('');

        if (stateCode) {
            const stateCities = City.getCitiesOfState(selectedCountry, stateCode).map(city => ({
                label: city.name,
                value: city.name
            }));
            setCities(stateCities);
        } else {
            setCities([]);
        }

        const filters = {
            ...(countryData && { country: countryData.name }),
            ...(stateData && { state: stateData.name })
        };

        setPage(0);
        fetchData(0, filters);
    };

    const onCityChange = (e: any) => {
        const cityName = e.value;
        const stateData = State.getStateByCodeAndCountry(selectedState, selectedCountry);
        const countryData = Country.getCountryByCode(selectedCountry);

        setSelectedCity(cityName);

        const filters = {
            ...(countryData && { country: countryData.name }),
            ...(stateData && { state: stateData.name }),
            ...(cityName && { city: cityName })
        };

        setPage(0);
        fetchData(0, filters);
    };

    const onZipCodeChange = (e: any) => {
        const zipValue = e.target.value;
        setZipCode(zipValue);

        const countryData = Country.getCountryByCode(selectedCountry);
        const stateData = State.getStateByCodeAndCountry(selectedState, selectedCountry);

        const currentFilters = {
            ...(countryData && { country: countryData.name }),
            ...(stateData && { state: stateData.name }),
            ...(selectedCity && { city: selectedCity })
        };

        debouncedZipCodeSearch(zipValue, currentFilters);
    };
    // const onDepartmentChange = (e: any) => {
    //     const departmentId = e.value;
    //     setSelectedDepartment(departmentId);
    //     fetchData(0)
    // };



    const handleSubmit = async () => {
        // if (!selectedSuppliers.length) {
        //     setAlert('error', 'Please select at least one supplier');
        //     return;
        // }

        if (assignmentMode === 'manual' && !selectedSuppliers.length) {
            setAlert('error', 'Please select at least one supplier');
            return;
        }
        // Show the confirmation dialog
        setIsCompletionDialogVisible(true);
    };



    const handleCompletionConfirm = async () => {
        try {
            setLoading(true);

            const countryData = Country.getCountryByCode(selectedCountry);
            const stateData = State.getStateByCodeAndCountry(selectedState, selectedCountry);

            const filters = {
                country: countryData?.name || "",
                state: stateData?.name || "",
                city: selectedCity || ""
            };

            const payload = assignmentMode === 'all'
                ? {
                    userId: Number(userId),
                    assignAll: true,
                    ...filters
                }
                : selectedSuppliers?.map(supplier => ({
                    userId: Number(userId),
                    supId: supplier.supId,
                    ...filters
                }));

            console.log(payload);

            const response = await PostCall('/company/suppliers-mapped', payload);

            if (response.code === 'SUCCESS') {
                setAlert('success', 'Suppliers assigned successfully!');
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            setAlert('error', 'Failed to assign suppliers!');
        } finally {
            setLoading(false);
            setIsCompletionDialogVisible(false);
        }
    };


    const handleResetSelections = () => {
        setSelectedSuppliers([]);
    }

    const onPage = (event: any) => {
        setPage(event.first / event.rows);
        fetchData(event.first / event.rows);
    };

    const renderHeader = () => (
        <div className="flex justify-content-between mb-3">
            <span className="p-input-icon-left flex align-items-center">
                <h3 className="mb-0">Assign Suppliers to {role}</h3>
            </span>
        </div>
    );

    const renderFilters = () => (
        <div className="card mt-4 p-4 bg-white rounded-lg" style={{ borderColor: '#CBD5E1', borderRadius: '10px', WebkitBoxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)', MozBoxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)', boxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)' }}>

            <div className="flex justify-content-between flex-wrap gap-4">

                <div className='flex flex-wrap gap-3 align-items'>

                    <div className="flex flex-column">
                        <label className="mb-2">{role} Name</label>
                        <InputText name='name' value={name} disabled />
                    </div>

                    <div className="flex flex-column">
                        <label className="mb-2">{role}&apos; Department </label>
                        <InputText name='department' value={department} disabled />
                        {/* <Dropdown
                            value={department}
                            onChange={onDepartmentChange}
                            options={departments}
                            optionLabel="name"
                            optionValue="departmentId"
                            placeholder="Select Department"
                            className="w-full"
                            showClear={!!selectedDepartment}
                            
                        /> */}
                    </div>
                </div>

                <div className='flex gap-3 align-items flex-wrap justify-content-end'>

                    <div className="flex flex-column">
                        <label className="mb-2">Country<span className='text-red-500'> *</span></label>
                        <Dropdown
                            value={selectedCountry}
                            onChange={onCountryChange}
                            options={countries}
                            placeholder="Select Country"
                            className="w-full"
                            // disabled={!selectedDepartment}
                            showClear={!!selectedCountry}
                            filter
                        />
                    </div>

                    <div className="flex flex-column">
                        <label className="mb-2">State</label>
                        <Dropdown
                            value={selectedState}
                            onChange={onStateChange}
                            options={states}
                            placeholder="Select State"
                            className="w-full"
                            disabled={!selectedCountry}
                            showClear={!!selectedState}
                            filter
                        />
                    </div>

                    <div className="flex flex-column">
                        <label className="mb-2">City</label>
                        <Dropdown
                            value={selectedCity}
                            onChange={onCityChange}
                            options={cities}
                            placeholder="Select City"
                            className="w-full"
                            disabled={!selectedState}
                            showClear={!!selectedCity}
                            filter
                        />

                    </div>

                    <div className="flex flex-column">
                        <label className="mb-2">Zip Code</label>
                        <InputText
                            value={zipCode}
                            onChange={onZipCodeChange}
                            placeholder="Zip Code"
                            className="w-full"
                        />

                    </div>

                </div>

            </div>
        </div>
    );

    const renderAssignmentOptions = () => (
        <div className="flex gap-4 ">
            <div className="flex align-items-center">
                <RadioButton
                    inputId="manual"
                    name="assignmentMode"
                    value="manual"
                    onChange={(e) => setAssignmentMode(e.value)}
                    checked={assignmentMode === 'manual'}
                />
                <label htmlFor="manual" className="ml-2">Assign Manually</label>
            </div>
            <div className="flex align-items-center">
                <RadioButton
                    inputId="all"
                    name="assignmentMode"
                    value="all"
                    onChange={(e) => setAssignmentMode(e.value)}
                    checked={assignmentMode === 'all'}
                />
                <label htmlFor="all" className="ml-2">Assign All</label>
            </div>
        </div>
    );


    return (
        <div className="grid">
            <div className="col-12">
                <div className={`panel-container ${isShowSplit ? (layoutState.isMobile ? 'mobile-split' : 'split') : ''}`}>
                    <div className="left-panel">
                        <div className="header">{renderHeader()}</div>
                        <div className='my-3'>{renderFilters()}</div>

                        {showTable && (
                            <div className="bg-white border border-1 p-3 shadow-lg rounded-lg" style={{ borderColor: '#CBD5E1', borderRadius: '10px', WebkitBoxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)', MozBoxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)', boxShadow: '0px 0px 2px -2px rgba(0,0,0,0.75)' }}>
                                <div className="flex justify-content-between">

                                    <div className="flex justify-content-between align-items-center align-content-center border-b pb-3 gap-3">

                                        <Dropdown
                                            value={limit}
                                            options={limitOptions}
                                            onChange={onLimitChange}
                                            placeholder="Limit"
                                            className="w-24 h-8"
                                        />


                                            <div className=''>
                                                {renderAssignmentOptions()}
                                            </div>

                                            <div className='flex gap-3 align-items-center'>

                                                {assignmentMode === 'manual' && (
                                                    <div className='font-italic font-bold'>
                                                        Total Selected Suppliers - {selectedSuppliers?.length}
                                                    </div>
                                                )}
                                            </div>
                                        {/* <div className='font-italic'>
                                            Total Selected Suppliers - {selectedSuppliers?.length}
                                        </div> */}
                                    </div>


                                    <div className='flex gap-3'>
                                        {assignmentMode === 'manual' && (
                                            <Button
                                                label="Reset"
                                                onClick={handleResetSelections}
                                                disabled={selectedSuppliers.length === 0}
                                                className="p-button-primary"
                                            />
                                        )}
                                        <Button
                                            label={assignmentMode === 'all' ? "Assign All Suppliers" : "Assign Selected Suppliers"}
                                            onClick={handleSubmit}
                                            disabled={
                                                (assignmentMode === 'manual' && selectedSuppliers.length === 0) ||
                                                !selectedCountry
                                            }
                                            className="p-button-primary"
                                        />
                                    </div>

                                </div>

                                <DataTable
                                    value={tasksList}
                                    selection={selectedSuppliers}
                                    onSelectionChange={e => setSelectedSuppliers(e.value)}
                                    dataKey="supId"
                                    paginator
                                    lazy
                                    first={page * limit}
                                    rows={limit}
                                    totalRecords={totalRecords}
                                    onPage={onPage}
                                    loading={isLoading}
                                    scrollable
                                    scrollHeight="400px"
                                    className="mt-3"
                                >
                                    {/* <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} disabled={assignmentMode === 'all'}
                                    /> */}
                                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}
                                    />
                                    <Column
                                        header="Sr. No"
                                        body={(data, options) => options.rowIndex + 1 + (page * limit)}
                                        style={{ width: '50px' }}
                                    />
                                    <Column header="Supplier Name" field="supplierName" style={{ width: '150px' }} />
                                    <Column header="Email Address" field="email" style={{ width: '150px' }} />
                                    <Column header="Phone Number" field="supplierNumber" style={{ width: '150px' }} />
                                    <Column header="Country" field="country" style={{ width: '150px' }} />
                                    <Column header="State" field="state" style={{ width: '150px' }} />
                                    <Column header="City" field="city" style={{ width: '150px' }} />
                                </DataTable>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CustomDialogBox
                visible={isCompletionDialogVisible}
                onHide={() => setIsCompletionDialogVisible(false)}
                onConfirm={handleCompletionConfirm}
                onCancel={() => setIsCompletionDialogVisible(false)}
                header="Confirmation Message"
                message={`You have assigned suppliers to ${name}.`}
                subMessage="Would you like to continue?"
                confirmLabel="Submit"
                cancelLabel="Cancel"
                icon="pi pi-exclamation-triangle"
                iconColor="#DF1740"
                loading={isLoading}
            />
        </div>
    );
};

export default AssignSuppliers;