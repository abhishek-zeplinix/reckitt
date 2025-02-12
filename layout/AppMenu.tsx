/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';
import { get, intersection } from 'lodash';
import { useAppContext } from './AppWrapper';
// import { getCompanyLogo } from '@/utils/uitl';
import { COMPANY_ROLE_MENU, COMPANY } from '@/config/permissions';
import { classNames } from 'primereact/utils';
import { useRouter } from 'next/navigation';
// import { useLoaderContext } from './context/LoaderContext';
import { useAuth } from './context/authContext';
import { useMemo } from 'react';

const AppMenu = () => {
    const router = useRouter();
    const { layoutConfig, layoutState, onMenuToggle } = useContext(LayoutContext);
    // const { setLoader } = useLoaderContext();
    const { hasPermission, hasAnyPermission, isSupplier } = useAuth();

    const handleMenuClick = useCallback(({ originalEvent, item }: any) => {
        if (originalEvent) {
            originalEvent.preventDefault();
        }
        router.push(item.url);
    }, [router]);
    
    
    useEffect(() => {
        console.log('AppMenu re-rendered');
    }, []);


    const model = useMemo(() => [
        {
            label: '',
            icon: 'pi pi-fw pi-bookmark',
            items: [
                {
                    label: 'Dashboard',
                    icon: 'pi pi-th-large',
                    // url: isSupplier() ? '/sup' : '/',
                    url: '/',
                    command: handleMenuClick
                },
                { separator: true }, // <-- Separator added inside items
                {
                    label: 'Guidlines & Glossary',
                    icon: 'pi pi-sliders-v',
                    check: (user: any) => {
                        if (get(user, 'isSuperAdmin')) {
                            return true;
                        }
                        return hasAnyPermission(['manage_faq', 'manage_supply_glossary']);
                    },
                    items: [
                        {
                            label: 'FAQs',
                            url: '/faq',
                            check: (user: any) => {
                                if (get(user, 'isSuperAdmin')) {
                                    return true;
                                }
                                return hasPermission('manage_faq');
                            },
                            command: handleMenuClick
                        },
                        {
                            label: 'Supply Glossary',
                            url: '/supply-glossary',
                            check: (user: any) => {
                                if (get(user, 'isSuperAdmin')) {
                                    return true;
                                }
                                return hasPermission('manage_supply_glossary');
                            },
                            command: handleMenuClick
                        }
                    ]
                },
                {
                    label: 'Task Management',
                    icon: 'pi pi-ticket',
                    check: (user: any) => {
                        // const checkComm = intersection([...PERMISSION_MENU, ...ROUTE_MENU], get(user, 'permissions', []));
                        if (get(user, 'isSuperAdmin')) {
                            return true;
                        }
                        return false;
                    },
                    items: [
                        {
                            label: 'Suppliers task',
                            url: '/task-management/supplier-tasks',
                            // check: (user: any) => {
                            //     const checkComm = intersection(ROUTE_MENU, get(user, 'permissions', []));
                            //     if (get(user, 'isSuperAdmin') || checkComm.length > 0) {
                            //         return true;
                            //     }
                            //     return false;
                            // },
                            command: handleMenuClick
                        },
                        {
                            label: 'Evaluator Tasks',
                            url: '/task-management/evaluator-tasks',
                            // check: (user: any) => {
                            //     const checkComm = intersection(PERMISSION_MENU, get(user, 'permissions', []));
                            //     if (get(user, 'isSuperAdmin') || checkComm.length > 0) {
                            //         return true;
                            //     }
                            //     return false;
                            // },
                            command: handleMenuClick
                        }
                    ]
                },
                {
                    label: 'Suppliers',
                    icon: 'pi pi-truck',
                    check: (user: any) => {
                        // Check if the user is a super admin
                        if (get(user, 'isSuperAdmin')) {
                            return true;
                        }

                        // Check if the user has the required permissions
                        const userPermissions = get(user, 'permissions.permissions', []);
                        const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                        // Grant access based on permissions
                        return hasPermission;
                    },
                    items: [
                        {
                            label: 'Manage Suppliers',
                            url: '/manage-supplier',
                            check: (user: any) => {
                                // Check if the user is a super admin
                                if (get(user, 'isSuperAdmin')) {
                                    return true;
                                }

                                // Check if the user has the required permissions
                                const userPermissions = get(user, 'permissions.permissions', []);
                                const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                                // Grant access based on permissions
                                return hasPermission;
                            },
                            command: handleMenuClick
                        }
                    ]
                },
                {
                    label: 'Supplier Score',
                    icon: 'pi pi-wifi',
                    check: (user: any) => {
                        // Check if the user is a super admin
                        if (get(user, 'isSuperAdmin')) {
                            return true;
                        }

                        // Check if the user has the required permissions
                        const userPermissions = get(user, 'permissions.permissions', []);
                        const hasPermission = intersection(COMPANY_ROLE_MENU, userPermissions).length > 0;

                        // Grant access based on permissions
                        return hasPermission;
                    },
                    items: [
                        {
                            label: 'Manage Supplier Score',
                            url: '/manage-supplier-score',
                            check: (user: any) => {
                                // Check if the user is a super admin
                                if (get(user, 'isSuperAdmin')) {
                                    return true;
                                }

                                // Check if the user has the required permissions
                                const userPermissions = get(user, 'permissions.permissions', []);
                                const hasPermission = intersection(COMPANY_ROLE_MENU, userPermissions).length > 0;

                                // Grant access based on permissions
                                return hasPermission;
                            },
                            command: handleMenuClick
                        }
                    ]
                },
                {
                    label: 'Rules Manager',
                    icon: 'pi pi-sitemap',
                    check: (user: any) => {
                        // Check if the user is a super admin
                        if (get(user, 'isSuperAdmin')) {
                            return true;
                        }

                        // Check if the user has the required permissions
                        const userPermissions = get(user, 'permissions.permissions', []);
                        const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                        // Grant access based on permissions
                        return hasPermission;
                    },
                    items: [
                        {
                            label: 'Rules',
                            url: '/rules',
                            check: (user: any) => {
                                // Check if the user is a super admin
                                if (get(user, 'isSuperAdmin')) {
                                    return true;
                                }

                                // Check if the user has the required permissions
                                const userPermissions = get(user, 'permissions.permissions', []);
                                const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                                // Grant access based on permissions
                                return hasPermission;
                            },
                            command: handleMenuClick
                        }
                    ]
                },
                {
                    label: 'Users Manager',
                    icon: 'pi pi-users',
                    check: (user: any) => {
                        // Check if the user is a super admin
                        if (get(user, 'isSuperAdmin')) {
                            return true;
                        }

                        // Check if the user has the required permissions
                        const userPermissions = get(user, 'permissions.permissions', []);
                        const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                        // Grant access based on permissions
                        return hasPermission;
                    },
                    items: [
                        {
                            label: 'Manage Users',
                            url: '/manage-users',
                            check: (user: any) => {
                                // Check if the user is a super admin
                                if (get(user, 'isSuperAdmin')) {
                                    return true;
                                }

                                // Check if the user has the required permissions
                                const userPermissions = get(user, 'permissions.permissions', []);
                                const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                                // Grant access based on permissions
                                return hasPermission;
                            },
                            command: handleMenuClick
                        }
                        // {
                        //     label: 'Create New Rules',
                        //     url: '/create-new-rules',
                        //     check: (user: any) => {
                        //         const checkComm = intersection(ROUTE_MENU, get(user, 'permissions', []));
                        //         if (get(user, 'isSuperAdmin') || checkComm.length > 0) {
                        //             return true;
                        //         }
                        //         return false;
                        //     },
                        //     command: handleMenuClick
                        // }
                    ]
                },
                {
                    label: "Api's Management",
                    icon: 'pi pi-paperclip',
                    check: (user: any) => {
                        // Check if the user is a super admin
                        if (get(user, 'isSuperAdmin')) {
                            return true;
                        }

                        // Check if the user has the required permissions
                        const userPermissions = get(user, 'permissions.permissions', []);
                        const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                        // Grant access based on permissions
                        return hasPermission;
                    },
                    items: [
                        {
                            label: "Manage Api's",
                            url: '/manage-api',
                            check: (user: any) => {
                                // Check if the user is a super admin
                                if (get(user, 'isSuperAdmin')) {
                                    return true;
                                }

                                // Check if the user has the required permissions
                                const userPermissions = get(user, 'permissions.permissions', []);
                                const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                                // Grant access based on permissions
                                return hasPermission;
                            },
                            command: handleMenuClick
                        }
                    ]
                },
                {
                    label: 'Market Metrics',
                    icon: 'pi pi-chart-bar',
                    check: (user: any) => {
                        // Check if the user is a super admin
                        if (get(user, 'isSuperAdmin')) {
                            return true;
                        }

                        // Check if the user has the required permissions
                        const userPermissions = get(user, 'permissions.permissions', []);
                        const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                        // Grant access based on permissions
                        return hasPermission;
                    },
                    items: [
                        {
                            label: 'Vendors',
                            url: '/vendors',
                            check: (user: any) => {
                                // Check if the user is a super admin
                                if (get(user, 'isSuperAdmin')) {
                                    return true;
                                }

                                // Check if the user has the required permissions
                                const userPermissions = get(user, 'permissions.permissions', []);
                                const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                                // Grant access based on permissions
                                return hasPermission;
                            },
                            command: handleMenuClick
                        },
                        {
                            label: 'User Groups',
                            url: '/user-groups',
                            check: (user: any) => {
                                // Check if the user is a super admin
                                if (get(user, 'isSuperAdmin')) {
                                    return true;
                                }

                                // Check if the user has the required permissions
                                const userPermissions = get(user, 'permissions.permissions', []);
                                const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                                // Grant access based on permissions
                                return hasPermission;
                            },
                            command: handleMenuClick
                        },
                        {
                            label: 'Marketing Templates',
                            url: '/marketing-templates',
                            check: (user: any) => {
                                // Check if the user is a super admin
                                if (get(user, 'isSuperAdmin')) {
                                    return true;
                                }

                                // Check if the user has the required permissions
                                const userPermissions = get(user, 'permissions.permissions', []);
                                const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                                // Grant access based on permissions
                                return hasPermission;
                            },
                            command: handleMenuClick
                        }
                    ]
                },
                {
                    label: 'Market Master',
                    icon: 'pi pi-bolt',
                    url: '/master',
                    check: (user: any) => {
                        // Check if the user is a super admin
                        if (get(user, 'isSuperAdmin')) {
                            return true;
                        }

                        // Check if the user has the required permissions
                        const userPermissions = get(user, 'permissions.permissions', []);
                        const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                        // Grant access based on permissions
                        return hasPermission;
                    }
                },
                {
                    label: 'Market Master',
                    icon: 'pi pi-bolt',
                    url: '/masterTwo',
                    check: (user: any) => {
                        // Check if the user is a super admin
                        if (get(user, 'isSuperAdmin')) {
                            return true;
                        }

                        // Check if the user has the required permissions
                        const userPermissions = get(user, 'permissions.permissions', []);
                        const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                        // Grant access based on permissions
                        return hasPermission;
                    }
                },

                {
                    label: 'Request Management',
                    icon: 'pi pi-bolt',
                    check: (user: any) => {
                        if (get(user, 'isSuperAdmin')) {
                            return true;
                        }
                        return hasAnyPermission(['generate_request', 'manage_request']);
                    },
                    items: [
                        {
                            label: 'Manage Request',
                            url: '/manage-requests',
                            check: (user: any) => {
                                if (get(user, 'isSuperAdmin')) {
                                    return true;
                                }
                                return hasPermission('manage_request');
                            },
                            command: handleMenuClick
                        },
                        {
                            label: 'Generate Request',
                            url: '/generate-requests',
                            check: (user: any) => {
                                if (get(user, 'isSuperAdmin')) {
                                    return true;
                                }
                                return hasPermission('generate_request');
                            },
                            command: handleMenuClick
                        }
                    ]
                },
                {
                    label: 'Supplier Feedback',
                    icon: 'pi pi-gift',
                    check: (user: any) => {
                        if (get(user, 'isSuperAdmin')) {
                            return true;
                        }
                        return hasAnyPermission(['generate_feedback', 'manage_feedback']);
                    },
                    items: [
                        {
                            label: 'Manage Feedback',
                            url: '/manage-feedback',
                            check: (user: any) => {
                                if (get(user, 'isSuperAdmin')) {
                                    return true;
                                }
                                return hasPermission('manage_feedback');
                            },
                            command: handleMenuClick
                        },
                        {
                            label: 'Create new feedback',
                            url: '/add-feedback',
                            check: (user: any) => {
                                if (get(user, 'isSuperAdmin')) {
                                    return true;
                                }
                                return hasPermission('generate_feedback');
                            },
                            command: handleMenuClick
                        }
                    ]
                },

                {
                    label: 'Control Tower',
                    icon: 'pi pi-eject',
                    url: '/control-tower',
                    check: (user: any) => {
                        // Check if the user is a super admin
                        if (get(user, 'isSuperAdmin')) {
                            return true;
                        }

                        // Check if the user has the required permissions
                        const userPermissions = get(user, 'permissions.permissions', []);
                        const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                        // Grant access based on permissions
                        return hasPermission;
                    },
                    command: handleMenuClick
                }

            ]
        }
    ], [hasPermission, hasAnyPermission, handleMenuClick]);
    return (
        <MenuProvider>
            <div className="min-h-screen flex relative lg:static">
                <div id="app-sidebar-2" className="h-screen block flex-shrink-0 absolute lg:static left-0 top-0 z-1 select-none" style={{ width: !layoutState.isMobile && layoutState.staticMenuDesktopInactive ? 60 : 265 }}>
                    <div className="flex flex-column" style={{ height: '92%' }}>
                        <div className="overflow-y-auto " style={{ scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' }}>
                            <ul className="list-none p-3 m-0">
                            {get(model, '0.items', []).map((item, i) =>
                                item.separator ? (
                                    <li key={`separator-${i}`} className="menu-separator"></li>
                                ) : (
                                    <AppMenuitem 
                                        item={item as AppMenuItem} // Type assertion to prevent TypeScript error
                                        root={true} 
                                        index={i} 
                                        key={`AppMenuitem${i}${item.label}`} 
                                    />
                                )
                            )}
                        </ul>

                        </div>
                    </div>
                </div>
            </div>
        </MenuProvider>
    );
};

export default React.memo(AppMenu, (prevProps, nextProps) => true);