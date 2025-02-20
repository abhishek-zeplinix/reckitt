/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { PostCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import { setAuthData, setUserDetails } from '@/utils/cookies';
import { encryptPassword } from '@/utils/encryptions';

const LoginPage = () => {
    const { isLoading, setAlert, setLoading, setUser, setAuthToken, setDisplayName } = useAppContext();
    const [email, setEmail] = useState('reckitt@gmail.com');
    const [password, setPassword] = useState('reckitt@123');
    const [checked, setChecked] = useState(false);
    const { layoutConfig, layoutState } = useContext(LayoutContext);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState<string>('');
    const [role, setRole] = useState('admin');
    const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [isPhoneNumber, setIsPhoneNumber] = useState<boolean>(false);
    const router = useRouter();

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => setOtp(e.target.value);
    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value);

    const toggleInputType = () => setIsPhoneNumber(!isPhoneNumber);

    const handleRoleChange = (e: any) => {
        setRole(e.target.value); // Update role based on selected radio button
        setOtpSent(false); // Reset OTP state when switching roles
    };

    const handlePassword = (event: any) => {
        setPassword(event.target.value);
    };

    const sendOtp = async () => {
        if (!email && !phoneNumber) return alert('Please enter your email.');

        setLoading(true);

        const payload = isPhoneNumber ? { supplierNumber: phoneNumber } : { email };

        try {
            const response = await PostCall('/auth/supplier/login', payload);

            if (response?.otp) {
                setIsOtpSent(true);
                setOtp(response?.otp);
            } else {
                setAlert('error', 'OTP generation failed');
            }
        } catch (error) {
            setAlert('error', 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    // setTimeout(() => {
    //     setIsOtpSent(true); // Show OTP field after sending OTP
    //     setLoading(false);
    // }, 1000);
    // setTimeout(() => {
    //     setIsOtpSent(true); // Show OTP field after sending OTP
    //     setLoading(false);
    // }, 1000);

    const loginClick = async () => {
        if (isLoading) {
            return;
        }

        if (email && password) {
            setLoading(true);

            // const encryptedPassword = await encryptPassword(password);

            // console.log(encryptedPassword);
            
            const response: any = await PostCall('/auth/sign-in', { email, password });

            setLoading(false);
            if (response.code == 'SUCCESS') {
                setAlert('success', 'Login success!');
                setUser(response.data);
                setAuthToken(response.token);
                setAuthData(response.token, response.refreshToken, response.data);
                setUserDetails(response.data);
            } else if (response.code == 'RESET_PASSWORD') {
                setDisplayName(response.name);
                setAlert('success', 'Please reset you password');
                router.push(`/reset-password?resetToken=${response.resetToken}`);
            } else {
                setAlert('error', response.message);
            }
        }
    };

    const loginOTPClick = async () => {
        if (isLoading) {
            return;
        }

        if ((!email && !phoneNumber) || !otp) {
            return alert('Please enter your email or phone number and OTP.');
        }

        setLoading(true);

        const payload = isPhoneNumber ? { supplierNumber: phoneNumber, otp } : { email, otp };

        try {
            const response: any = await PostCall('/auth/supplier/verify-otp', payload);

            if (response?.code === 'SUCCESS') {
                setAlert('success', response.message);
                setUser(response.data);
                setAuthToken(response.token);
                setAuthData(response.token, response.refreshToken, response.data);
                setUserDetails(response.data);
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setAlert('error', 'There was an error verifying the OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (e: any) => {
        setChecked(e.checked); // Update checked state
    };

    const containerClassName = classNames('surface-ground flex align-items-center justify-between min-h-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    return (
        <div className={containerClassName}>
            <div className="flex align-items-center justify-between w-full h-screen">
                {/* Left side image (hidden on small devices) */}
                <div className="img-box hidden md:flex justify-content-center align-items-center w-1/2 h-full">
                    <img src="/images/login.png" alt="Login" className="w-full h-full object-cover" />
                </div>

                {/* Right side form with huge space between */}
                <div>
                    <div
                        className={`surface-card p-4 shadow-2 border-round ${layoutState.isMobile ? 'w-full h-auto p-5' : 'w-1/2'}`}
                        style={{
                            minWidth: layoutState.isMobile ? '100%' : '400px',
                            margin: layoutState.isMobile ? 'auto' : 'unset',
                            marginLeft: layoutState.isMobile ? '0' : 'calc(10% + 8rem)' // Dynamic margin based on screen size
                        }}
                    >
                        <div className="logo-login-panel text-center mb-5">
                            <img src="/images/reckitt.webp" alt="Logo" width="120px" height={'50px'} />
                        </div>

                        <div className="text-center mb-3">
                            <div className="text-900 text-3xl font-medium mb-3">Welcome Back</div>
                            <span className="text-600 font-medium line-height-3">Enter your credentials to access your account</span>
                        </div>

                        <div className="mb-3 text-center flex justify-content-center gap-5">
                            <label className="flex items-center cursor-pointer">
                                <input type="radio" value="admin" checked={role === 'admin'} onChange={handleRoleChange} className="m-0 mr-2 " />
                                <p>Reckitt</p>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input type="radio" value="user" checked={role === 'user'} onChange={handleRoleChange} className="m-0 mr-2 " />
                                <p>Supplier</p>
                            </label>
                        </div>
                        <div>
                            {role === 'user' && (
                                <div>
                                    <div className="flex justify-content-between  align-items-center">
                                        <label htmlFor="email" className="block text-900 font-medium ">
                                            {isPhoneNumber ? 'Phone Number' : 'Email Address'}
                                        </label>
                                        <Button label={isPhoneNumber ? 'Use Email' : 'Use Phone Number'} className="p-button-text text-primary-main" onClick={toggleInputType} />
                                    </div>

                                    {isPhoneNumber ? (
                                        <InputText id="phoneNumber" value={phoneNumber} type="text" placeholder="Phone number" className="w-full mb-3" onChange={handlePhoneNumberChange} />
                                    ) : (
                                        <InputText id="email" value={email} type="text" placeholder="Email address" className="w-full mb-3" onChange={handleEmailChange} />
                                    )}

                                    {!isOtpSent && <Button label="Get OTP" icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-user'} className="w-full bg-primary-main border-primary-main mb-2 hover:text-white" onClick={sendOtp} />}
                                    {isOtpSent && (
                                        <div>
                                            <label htmlFor="otp" className="block text-900 font-medium mb-2">
                                                Enter OTP
                                            </label>
                                            <InputText id="otp" value={otp} type="text" placeholder="Enter OTP" className="w-full mb-3" onChange={handleOtpChange} />

                                            <Button label="Login" icon="pi pi-user" className="w-full bg-primary-main border-primary-main mb-2 hover:text-white" onClick={loginOTPClick} />
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className=" align-items-center justify-content-between mb-2">
                                {role === 'admin' && (
                                    <div>
                                        <label htmlFor="email" className="block text-900 font-medium mb-2">
                                            Email Address
                                        </label>
                                        <InputText id="email" value={email} type="text" placeholder="Email address" className="w-full mb-3" onChange={handleEmailChange} />
                                        <div className="flex align-items-center justify-content-between mb-2">
                                            <div className="flex align-items-center">
                                                <label htmlFor="password" className="block text-900 font-medium ">
                                                    Password
                                                </label>
                                            </div>
                                        </div>
                                        <InputText id="password" value={password} type="password" placeholder="Password" className="w-full mb-3" onChange={handlePassword} />
                                        <div className="flex flex-wrap justify-content-left gap-3 mb-2">
                                            <div className="flex align-items-center mb-2">
                                                <Checkbox
                                                    inputId="rememberme"
                                                    name="rememberme"
                                                    value="rememberme"
                                                    onChange={handleCheckboxChange}
                                                    checked={checked} // Make sure `checked` is a boolean
                                                    className="p-checkbox-checked:bg-primary-main"
                                                    style={{ width: '25px', height: '20px' }}
                                                />
                                                <label htmlFor="ingredient1" className="ml-2">
                                                    Remember Me
                                                </label>
                                            </div>
                                        </div>
                                        <Button label={'Login'} icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-user'} className="w-full bg-primary-main border-primary-main mb-2 hover:text-white" onClick={loginClick} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
