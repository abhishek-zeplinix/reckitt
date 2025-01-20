/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { CustomResponse } from '@/types';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';

const ManageUserAddPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditMode = searchParams.get('edit') === 'true'; // Check if in edit mode
    const userId = searchParams.get('userId');
    const [supplierId, setSupplierId] = useState('');
    const [supplierData, setSupplierData] = useState([]);
    const [roleName, setRoleName] = useState('');
    const [roleEmail, setRoleEmail] = useState('');
    const [rolePhone, setRolePhone] = useState('');
    const [rolePassword, setRolePassword] = useState('');
    const [createRole, setCreateRole] = useState('');
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [page, setPage] = useState<number>(1);
    const { setAlert, setLoading } = useAppContext();
    const [totalRecords, setTotalRecords] = useState<number | undefined>(undefined);
    const [roles, setRoles] = useState([]);

    // useEffect(() => {
    //     fetchData();
    //     fetchSupplierData();
    // }, []);

    // console.log('sup id selected on dropdown', supplierId);
    

    useEffect(() => {
        fetchData();
        fetchSupplierData();
        if (isEditMode && userId) {
            fetchUserDetails(); // Fetch and pre-fill data in edit mode
        }
    }, []);
    
    const fetchUserDetails = async () => {
        setLoading(true);
        try {
            const response: CustomResponse = await GetCall(`/company/user?filters.id=${userId}&sortBy=id`);
            if (response.code === 'SUCCESS' && response.data.length > 0) {
                console.log('49',response.data)
                const userDetails = response.data[0]; // Assuming the API returns an array of users
                setRoleName(userDetails.name || '');
                setRoleEmail(userDetails.email || '');
                setRolePhone(userDetails.phone || '');
                setRolePassword(userDetails.password || '');
                setCreateRole(userDetails.roleId || '');
            } else {
                setAlert('error', 'User details not found.');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            setAlert('error', 'Failed to fetch user details.');
        } finally {
            setLoading(false);
        }
    };
    

    const fetchData = async () => {
        setLoading(true);
        try {
            const response: CustomResponse = await GetCall(`/company/roles`);
            if (response.code === 'SUCCESS') {
                const formattedData = response.data.map((item: any) => ({
                    label: item.name, // Dropdown label
                    value: item.roleId // Dropdown value
                }));
                setRoles(formattedData);
            } else {
                setRoles([]);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            setRoles([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSupplierData = async (params?: any) => {
        if (!params) {
            params = { limit: limit, page: page };
        }
        setLoading(true);
        const queryString = buildQueryParams(params);
        const response: CustomResponse = await GetCall(`/company/supplier?${queryString}`);
        setLoading(false);
        if (response.code == 'SUCCESS') {
            const formattedData = response.data.map((item: any) => ({
                label: item.supplierName, // Dropdown label
                value: item.supId // Dropdown value
            }));
            setSupplierData(formattedData);

            if (response.total) {
                setTotalRecords(response?.total);
            }
        } else {
            setSupplierData([]);
        }
    };

    const handleSubmit = async () => {
        // Validate required fields
       
    
        setIsDetailLoading(true);
    
        const payload = {
            roleId: createRole,
            supplierId: supplierId,
            name: roleName,
            email: roleEmail,
            password: rolePassword,
            phone: rolePhone,
        };
    
        try {
            let endpoint: string;
            let response: CustomResponse;
    
            // Determine API call based on isEditMode
            if (isEditMode) {
                endpoint = `/company/user/${userId}`;
                response = await PutCall(endpoint, payload); // Call PUT API
            } else {
                if (!roleName || !roleEmail || !rolePhone || !rolePassword || !roles) {
                    setAlert('Error', 'Please fill all required fields');
                    return;
                }
                endpoint = `/company/user`;
                response = await PostCall(endpoint, payload); // Call POST API
            }
    
            // Handle API response
            if (response.code === 'SUCCESS') {
                setAlert('success', isEditMode ? 'User updated successfully!' : 'User added successfully!');
                router.push('/manage-users');
            } else {
                setAlert('error', response.message || 'Failed to submit user data.');
            }
        } catch (error) {
            console.error('Error submitting user data:', error);
            setAlert('error', 'An error occurred while submitting user data.');
        } finally {
            setIsDetailLoading(false);
        }
    };
    

    // Adjust title based on edit mode
    const pageTitle = isEditMode ? 'Edit User' : 'Add User';
    const submitButtonLabel = isEditMode ? 'Save' : 'Add User';

    const renderNewRuleFooter = () => {
        return (
            <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400 ">
                <Button
                    label="Cancel"
                    className="text-pink-500 bg-white border-pink-500 hover:text-pink-500 hover:bg-transparent transition-colors duration-150 mb-3"
                    onClick={() => router.push('/manage-users')} // Navigate back to manage users
                />
                <Button label={submitButtonLabel} icon="pi pi-check" className="bg-pink-500 border-pink-500 hover:text-white mb-3" onClick={handleSubmit} />
            </div>
        );
    };

    const footerNewRules = renderNewRuleFooter();

    const renderContentbody = () => {
        return (
            <div className="grid">
                <div className="col-12">
                    <div className="flex flex-column gap-3">
                        <div className="p-fluid grid mx-1 pt-2">
                            <div className="field col-4">
                                <label htmlFor="role">Role</label>
                                <Dropdown id="role" value={createRole} options={roles} onChange={(e) => setCreateRole(e.value)} placeholder="Select Role" className="w-full" />
                            </div>
                            {Number(createRole) === 2 && (
                                <div className="field col-4">
                                    <label htmlFor="supplier">Supplier</label>
                                    <Dropdown id="supplier" value={supplierId} options={supplierData} onChange={(e) => setSupplierId(e.value)} placeholder="Select Supplier" className="w-full" />
                                </div>
                            )}
                            <div className="field col-4">
                                <label htmlFor="name">Role Name</label>
                                <input id="name" type="text" value={roleName} onChange={(e) => setRoleName(e.target.value)} className="p-inputtext w-full" placeholder="Enter Role Name" />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="email">Role Email</label>
                                <input id="email" type="text" value={roleEmail} onChange={(e) => setRoleEmail(e.target.value)} className="p-inputtext w-full" placeholder="Enter Role Email"  disabled={isEditMode === true}/>
                            </div>
                            <div className="field col-4">
                                <label htmlFor="phone">Role Phone Number</label>
                                <input id="phone" type="text" value={rolePhone} onChange={(e) => setRolePhone(e.target.value)} className="p-inputtext w-full" placeholder="Enter Role Phone Number" disabled={isEditMode === true} />
                            </div>
                            
                            {!isEditMode && (
                                <div className="field col-4">
                                    <label htmlFor="manufacturerName">Password</label>
                                    <input
                                        id="manufacturerName"
                                        type="text"
                                        value={rolePassword}
                                        onChange={(e) => setRolePassword(e.target.value)}
                                        className="p-inputtext w-full"
                                        placeholder="Enter Password"
                                    />
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const contentBody = renderContentbody();

    const handleNavigation = () => {
        router.push('/manage-users');
    };

    return (
        <div className="" style={{ position: 'relative' }}>
            <div className="p-card">
                {/* Header Section */}
                <div className="p-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', padding: '20px' }}>
                        {/* Arrow pointing left */}
                        <Button icon="pi pi-arrow-left" className="p-button-text p-button-plain gap-5" style={{ marginRight: '1rem' }} onClick={handleNavigation}>
                            {/* Dynamic Add/Edit User text */}
                            <span style={{ fontWeight: 'bold', fontSize: '20px' }}>{pageTitle}</span>
                        </Button>
                    </div>
                </div>
                <hr />
                <div className="p-card-body">
                    {/* Body rendering */}
                    {contentBody}
                </div>

                {/* Footer Buttons */}
                <hr />
                {footerNewRules}
            </div>
        </div>
    );
};

export default ManageUserAddPage;
