import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useState, useEffect } from "react";
import { Country, State, City } from 'country-state-city';
import { PostCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import useFetchDepartments from '@/hooks/useFetchDepartments';

const AutoMapping = ({filtersVisible, setFiltersVisible}: any) => {
    const {isLoading, setLoading, setAlert } = useAppContext();
    const { departments } = useFetchDepartments();

    // State management
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [zipCode, setZipCode] = useState('');

    // Options for dropdowns
    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);

    //loader
    const [configLoader, setConfigLoader] = useState(false);

    const roles = [
        { label: 'Evaluator', value: 1 },
        { label: 'Approver', value: 3 }
    ];

    // Initialize countries on component mount
    useEffect(() => {
        const allCountries = Country.getAllCountries().map(country => ({
            label: country.name,
            value: country.isoCode
        }));
        setCountries(allCountries);
    }, []);

    const handleCountryChange = (e: any) => {
        const countryCode = e.value;
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
    };

    const handleStateChange = (e: any) => {
        const stateCode = e.value;
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
    };

    const handleSubmit = async () => {
        if (!selectedRole || !selectedDepartment || !selectedCountry) {
            setAlert('error', 'Please fill in all required fields');
            return;
        }

        try {
            setConfigLoader(true);
            const countryData = Country.getCountryByCode(selectedCountry);
            const stateData = State.getStateByCodeAndCountry(selectedState, selectedCountry);

            const payload = {
                roleId: selectedRole,
                departmentId: selectedDepartment,
                country: countryData?.name || "",
                state: stateData?.name || "",
                city: selectedCity || "",
                zipCode: zipCode || ""
            };

            console.log(payload);
            

            const response = await PostCall('/company/suppliers-mapped-config', payload);
            
            if (response.code === 'SUCCESS') {
                setAlert('success', 'Auto mapping configured successfully!');
                setFiltersVisible(false);
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            setAlert('error', 'Failed to configure auto mapping!');
        } finally {
            setConfigLoader(false);
        }
    };

    return (
        <>
        <div className={`filters-container ${filtersVisible ? 'filters-container-visible' : ''}`}>
            {filtersVisible && (
                <div className="mt-3 shadow-2 surface-card border-round-2xl mr-3 mb-3">
                    <div className="px-4 py-4">
                        <div className="relative border-bottom-1 border-300">
                            <h3>Auto Mapping Configuration Settings</h3>
                            <span
                                onClick={() => setFiltersVisible(false)}
                                className="absolute top-0 right-0 cursor-pointer"
                            >
                                <i className="pi pi-times text-sm"></i>
                            </span>
                        </div>
                        
                        <div className="grid mt-4 gap-4 px-2">
                            <div className="flex flex-column">
                                <label className="mb-1">User Type<span className="text-red-500"> *</span></label>
                                <Dropdown
                                    value={selectedRole}
                                    options={roles}
                                    onChange={(e) => setSelectedRole(e.value)}
                                    placeholder="Select User Type"
                                    className="w-full md:w-15rem"
                                    showClear
                                />
                            </div>

                            <div className="flex flex-column">
                                <label className="mb-1">Department<span className="text-red-500"> *</span></label>
                                <Dropdown
                                    value={selectedDepartment}
                                    options={departments}
                                    onChange={(e) => setSelectedDepartment(e.value)}
                                    optionLabel="name"
                                    optionValue="departmentId"
                                    placeholder="Select Department"
                                    className="w-full md:w-15rem"
                                    showClear
                                />
                            </div>

                            <div className="flex flex-column">
                                <label className="mb-1">Country<span className="text-red-500"> *</span></label>
                                <Dropdown
                                    value={selectedCountry}
                                    options={countries}
                                    onChange={handleCountryChange}
                                    placeholder="Select Country"
                                    className="w-full md:w-15rem"
                                    showClear
                                    filter
                                />
                            </div>

                            <div className="flex flex-column">
                                <label className="mb-1">State</label>
                                <Dropdown
                                    value={selectedState}
                                    options={states}
                                    onChange={handleStateChange}
                                    placeholder="Select State"
                                    className="w-full md:w-15rem"
                                    disabled={!selectedCountry}
                                    showClear
                                    filter
                                />
                            </div>

                            <div className="flex flex-column">
                                <label className="mb-1">City</label>
                                <Dropdown
                                    value={selectedCity}
                                    options={cities}
                                    onChange={(e) => setSelectedCity(e.value)}
                                    placeholder="Select City"
                                    className="w-full md:w-15rem"
                                    disabled={!selectedState}
                                    showClear
                                    filter
                                />
                            </div>

                            <div className="flex flex-column">
                                <label className="mb-1">ZipCode</label>
                                <InputText
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                    placeholder="Enter Zip Code"
                                    className="w-full md:w-15rem"
                                />
                            </div>
                        </div>

                        <div className="flex justify-content-end mt-4">
                            <Button
                                icon="pi pi-sync"
                                label={configLoader ? 'Mapping' : 'Apply'}
                                onClick={handleSubmit}
                                className="bg-primary-main border-primary-main hover:text-white"
                                loading={configLoader}
                            />
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
};

export default AutoMapping;