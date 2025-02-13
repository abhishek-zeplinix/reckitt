import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { Avatar } from 'primereact/avatar';
import { Menu } from 'primereact/menu';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useAppContext } from './AppWrapper';
import { get } from 'lodash';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { signOut, user } = useAppContext();
    const router = useRouter();
    const { layoutConfig, layoutState, onMenuToggle } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);

    const [visible, setVisible] = useState<boolean>(false);
    const menu = useRef<any>(null);
    const items = [
        {
            template: (item: any, options: any) => {
                return (
                    <div className="p-menuitem cursor-pointer flex flex-column gap-1" style={{ padding: '1rem' }}>
                        <div className="font-bold text-lg">{get(user, 'name', 'User')}</div>
                        <div className="text-gray-600">{get(user, 'email', '')}</div>
                        {/* <div className="text-sm text-blue-600 mt-1">{get(user, 'role.name', 'Role not assigned')}</div> */}
                    </div>
                );
            }
        },
        // {
        //     label: 'Profile',
        //     icon: 'pi pi-user',
        //     command: () => router.push('/profile')
        // },
        {
            separator: true
        },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => setVisible(true)
        }
    ];

    const menuToggleClass = classNames('menu-toggle-icon bg-primary-main', {
        'toogle-overlay': layoutConfig.menuMode === 'overlay',
        'toogle-static': layoutConfig.menuMode === 'static',
        'toogle-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'toogle-overlay-active': layoutState.overlayMenuActive,
        'toogle-mobile-active': layoutState.staticMenuMobileActive
    });

    const iconClass = classNames('pi', {
        'pi-angle-left': !layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'pi-angle-right': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static'
    });

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    const accept = () => {
        signOut();
    };

    const avatarClick = (e: any) => {
        if (menu) {
            menu.current.toggle(e);
        }
    };

    const onHide = () => setVisible(false);

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                <img src="/images/reckitt.webp" width="100px" height="40px" alt="logo" />
            </Link>

            {!layoutState.isMobile && (
                <div className={menuToggleClass} onClick={onMenuToggle}>
                    <i className={iconClass}></i>
                </div>
            )}

            {layoutState.isMobile && (
                <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                    <i className="pi pi-bars" />
                </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
                <div className="hidden md:flex flex-column items-end">
                    <span className="font-semibold">{get(user, 'name', 'User')}</span>
                    <span className="text-sm text-blue-600">{get(user, 'role.name', 'Role not assigned')}</span>
                </div>

                <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={avatarClick}>
                    <Menu model={items} popup ref={menu} />
                    <Avatar label={get(user, 'name') ? get(user, 'name')[0] : 'U'} style={{ backgroundColor: '#9c27b0', color: '#ffffff' }} shape="circle" onClick={avatarClick} />
                </button>
            </div>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                <button type="button" className="p-link layout-topbar-button profile-icon-setting">
                    <Menu model={items} popup ref={menu} />
                    <Avatar label={get(user, 'name') ? get(user, 'name')[0] : 'U'} style={{ backgroundColor: '#9c27b0', color: '#ffffff' }} shape="circle" onClick={avatarClick} />
                </button>
            </div>

            <ConfirmDialog className="custom-dialog" visible={visible} onHide={onHide} message="Are you sure you want to logout?" header="Confirmation" icon="pi pi-exclamation-triangle" accept={accept} />
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
