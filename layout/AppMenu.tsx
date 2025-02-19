/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useContext, useRef, useState } from 'react';
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
import { encodeRouteParams } from '@/utils/base64';

const AppMenu = () => {
    const router = useRouter();
    const { layoutConfig, layoutState, onMenuToggle } = useContext(LayoutContext);
    // const { setLoader } = useLoaderContext();
    const { hasPermission, hasAnyPermission, isSupplier } = useAuth();
    const { user } = useAppContext();

    const handleMenuClick = ({ originalEvent, item }: any) => {
        if (originalEvent) {
            originalEvent.preventDefault();
        }

        // Show the loade

        // Simulate a delay of 1 second before routing
        // setTimeout(() => {
        router.push(item.url);
        // setLoader(true);
        //     setLoader(false); // Hide the loader after 1 second
        // }, 500);
    };

    const model: AppMenuItem[] = [
        {
            label: '',
            icon: 'pi pi-fw pi-bookmark',
            items: [
                {
                    label: 'Dashboard',
                    icon: 'pi pi-th-large',
                    url: isSupplier()
                        ? (() => {
                              const supplierId = get(user, 'supplierId');
                              const categoryId = get(user, 'categoryId');
                              const subCategoryId = get(user, 'subCategoryId');
    
                              if (supplierId && categoryId && subCategoryId) {
                                  const params: any = { supId: supplierId, catId: categoryId, subCatId: subCategoryId };
                                  const encodedParams = encodeRouteParams(params);
                                  return `/supplier-scoreboard-summary/${encodedParams}`;
                              }
                              return '/';
                          })()
                        : '/',
                    command: handleMenuClick
                },
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
                        if (get(user, 'isSuperAdmin')) {
                            return true;
                        }
                        return hasAnyPermission(['get_approver_evaluator_assigned_suppliers']);
                        // return hasPermission('manage_supply_glossary');
                    },

                items: [
                    {
                        label: 'Manage Tasks',
                        url: '/task-management',
                        check: (user: any) => {
                            // Check if the user is a super admin
                            if (get(user, 'isSuperAdmin')) {
                                return true;
                            }

                            return hasPermission('');
                            
                        },
                        command: handleMenuClick
                    },
                    {
                        label: 'My Tasks',
                        url: (() => {
                            if (hasPermission('get_approver_evaluator_assigned_suppliers')) {
                                const userId = get(user, 'id');
                                const role = get(user, 'userRole');
                                const name = get(user, 'name');

                                console.log(userId, role, name);
                                
                                if (userId && role && name) {
                                    return `/task-management/view-suppliers/${encodeRouteParams({ userId, role, name })}`;
                                }
                            }
                            return '/task-management'; // Default if user doesn't have required fields
                        })(),
                        check: (user: any) => {
                            if (get(user, 'isSuperAdmin')) {
                                return false;
                            }
                            return hasPermission('get_approver_evaluator_assigned_suppliers');
                        },
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
                        // {
                        //     label: 'Manage Rule',
                        //     url: '/manage-rules',
                        //     check: (user: any) => {
                        //         // Check if the user is a super admin
                        //         if (get(user, 'isSuperAdmin')) {
                        //             return true;
                        //         }

                        //         // Check if the user has the required permissions
                        //         const userPermissions = get(user, 'permissions.permissions', []);
                        //         const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                        //         // Grant access based on permissions
                        //         return hasPermission;
                        //     },
                        //     command: handleMenuClick
                        // },
                        // {
                        //     label: 'Manage CAPA Rule',
                        //     url: '/manage-capa-rules',
                        //     check: (user: any) => {
                        //         // Check if the user is a super admin
                        //         if (get(user, 'isSuperAdmin')) {
                        //             return true;
                        //         }

                        //         // Check if the user has the required permissions
                        //         const userPermissions = get(user, 'permissions.permissions', []);
                        //         const hasPermission = intersection(COMPANY, userPermissions).length > 0;

                        //         // Grant access based on permissions
                        //         return hasPermission;
                        //     },
                        //     command: handleMenuClick
                        // }
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
                        },
                        {
                            label: 'Mapping-Marketing',
                            url: '/mapping-marketing',
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
                            label: 'Mapping-Evaluation',
                            url: '/mapping-evaluation',
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
                            label: 'Location Master',
                            icon: 'pi pi-bolt',
                            url: '/master',
                            check: (user: any) => {
                                if (get(user, 'isSuperAdmin')) {
                                    return true;
                                }
                                return hasAnyPermission(['generate_request', 'manage_request']);
                            }
                        },
                        {
                            label: 'Other Master',
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
                        }
                    ]
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
    ];

    const menuToggleClass = classNames('menu-toggle-icon', {
        'toogle-overlay': layoutConfig.menuMode === 'overlay',
        'toogle-static': layoutConfig.menuMode === 'static',
        'toogle-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'toogle-overlay-active': layoutState.overlayMenuActive,
        'toogle-mobile-active': layoutState.staticMenuMobileActive
    });

    const iconClass = classNames('pi', {
        'pi-angle-left text-lg text-white p-3': !layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'pi-angle-right text-lg text-white p-3': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static'
    });
    return (
        <MenuProvider>
            <div className="min-h-screen flex relative lg:static">
                <div id="app-sidebar-2" className="h-screen block flex-shrink-0 absolute lg:static left-0 top-0 z-1 select-none" style={{ width: !layoutState.isMobile && layoutState.staticMenuDesktopInactive ? 60 : 265 }}>
                    <div className="flex flex-column" style={{ height: '92%' }}>
                        <div className="overflow-y-auto " style={{ scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' }}>
                            <ul className="list-none p-3 m-0">
                                {get(model, '0.items', []).map((item, i) =>
                                    !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={`AppMenuitem${i}${item.label}`} /> : <li key={`AppMenuitem${i}${item.label}`} className="menu-separator"></li>
                                )}
                            </ul>
                        </div>
                        {!layoutState.isMobile && (
                            <div className="mt-auto">
                                <a
                                    v-ripple
                                    className="flex mb-1 justify-content-center align-items-center  p-2 text-700 transition-duration-150 transition-colors p-ripple "
                                    style={{ width: layoutState.staticMenuDesktopInactive ? 60 : 250, height: '15px' }}
                                ></a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MenuProvider>
    );
};

export default AppMenu;
