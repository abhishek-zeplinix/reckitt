/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { GetCall } from '@/app/api-config/ApiKit';
import eventEmitter from '@/app/api-config/event';
import Preloader from '@/components/Preloader';
import { CONFIG } from '@/config/config';
import { AppContextType, CustomResponse } from '@/types';
import { getAuthToken, getUserDetails, isTokenValid, removeAuthData, setAuthData, setUserDetails } from '@/utils/cookies';
import { get } from 'lodash';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Toast } from 'primereact/toast';
import React, { useCallback } from 'react';
import { createContext, Suspense, useContext, useEffect, useRef, useState } from 'react';
import { AuthProvider } from './context/authContext';
import CustomToast from '@/components/toast/Toast';
import ToastContainer from '@/components/toast/ToastContainer';
import { encodeRouteParams } from '@/utils/base64';

const defaultContext: AppContextType = {
    displayName: '',
    setDisplayName: () => { },
    user: null,
    setUser: () => { },
    company: null,
    setCompany: () => { },
    isLoading: true,
    setLoading: () => { },
    signOut: () => { },
    setAlert: () => { },
    authToken: null,
    setAuthToken: () => { },
    isScroll: true,
    setScroll: () => { },
    selectedSubLocation: null,
    setSelectedSubLocation: () => { }
};
const AppContext = createContext(defaultContext);

const authRoutes = ['/login', '/reset-password', '/forgot-password'];

export const userRoles = {
    SUPER_ADMIN: 'Superadmin',
    SUPPLIER: 'Supplier',
    ADMIN: 'Admin',
    APPROVER: 'Approver',
    EVALUATOR:'Evaluator'
} as const;


export const AppWrapper = React.memo(({ children }: any) => {
    const pathname = usePathname();
    const router = useRouter();
    const [displayName, setDisplayName] = useState('');
    const [authToken, setAuthToken] = useState(getAuthToken());
    const [user, setUser] = useState(null);
    const [company, setCompany] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [isScroll, setScroll] = useState(true);
    const [selectedSubLocation, setSelectedSubLocation] = useState<any>(null);
    const [toasts, setToasts] = useState<Array<{ id: number; type: string; message: string }>>([]);

    // Handle authentication routing
    useEffect(() => {
        const isValid = isTokenValid(authToken);
        
        if (!isValid) {
            if (authRoutes.includes(pathname)) {
                return;
            }
            router.replace('/login');

        } else if (authToken && isValid) {

            if (authRoutes.includes(pathname)) {

                const userData = getUserDetails();

                if (userData?.role === userRoles.SUPPLIER) {
                    const { categoryId, subCategoryId, supplierId } = userData;
                    const params: any = { supId: supplierId, catId: categoryId, subCatId: subCategoryId };
                    const encodedParams = encodeRouteParams(params);
                    router.replace(`/supplier-scoreboard-summary/${encodedParams}`);
                } else {
                    router.replace(get(isValid, 'portalLink', '/'));
                }
            }
        }
    }, [authToken]);

    // Handle initial user data loading
    useEffect(() => {
        setLoading(true);
        
        const userToken: string = getAuthToken();
        if (userToken) {
            if (!isTokenValid(userToken)) {
                signOut();
                setLoading(false);
                return;
            }
        }else {
            setLoading(false);
        }

        const userData = getUserDetails();
        
        if (userData) {
            try {
                setUser(userData);
            } catch (error) { }

            if (userData && userData.company) {
                try {
                    setCompany(userData.company);
                } catch (error) {
                    
                }
            }
        }


        eventEmitter.on('signOut', (data: any) => {
            removeAuthData();
            signOut();
            setAlert('info', 'Session expired');
        });

        // return () => {
        //     eventEmitter.off('signOut');
        // };
    }, []);

    const signOut = async () => {
        await removeAuthData();
        setUser(null);
        router.replace('/login', undefined);
    };

     
    const removeToast = useCallback((id: number) => {

        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, []);


    const setAlert = (type: string, message: string) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, message }]);
      };


    return (
        <Suspense fallback={<Preloader />}>
            <AppContext.Provider
                value={{
                    displayName,
                    setDisplayName,
                    user,
                    setUser,
                    company,
                    setCompany,
                    authToken,
                    setAuthToken,
                    isLoading,
                    setLoading,
                    signOut,
                    setAlert,
                    isScroll,
                    setScroll,
                    selectedSubLocation,
                    setSelectedSubLocation,
                }}
            >
                <AuthProvider user={user}>
                    <ToastContainer toasts={toasts} removeToast={removeToast} />
                    {isLoading && <div className="running-border"></div>}
                    <div style={{ overflow: isScroll ? 'auto' : 'hidden', maxHeight: '100vh'}}>
                        {children}
                    </div>
                </AuthProvider>
            </AppContext.Provider>
        </Suspense>
    );
});

export function useAppContext() {
    return useContext(AppContext);
}