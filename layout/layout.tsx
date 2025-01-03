/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useRouter } from 'next/navigation';
import { useEventListener, useMountEffect, useUnmountEffect } from 'primereact/hooks';
import React, { useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { classNames } from 'primereact/utils';
import AppFooter from './AppFooter';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import AppConfig from './AppConfig';
import { LayoutContext } from './context/layoutcontext';
import { PrimeReactContext } from 'primereact/api';
import { ChildContainerProps, LayoutState, AppTopbarRef } from '@/types';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAppContext } from './AppWrapper';
import Preloader from '@/components/Preloader';
import TopLinerLoader from '@/components/TopLineLoader';
import MyFileUpload from '@/components/MyFileUpload';
import { Menubar } from 'primereact/menubar';
import router from 'next/router';

const Layout = React.memo(({ children }: ChildContainerProps) => {
    const { user, isScroll } = useAppContext();
    const { layoutConfig, layoutState, setLayoutState, onMenuToggle } = useContext(LayoutContext);
    const [pageTitle, setPageTitle] = useState('');
    const { setRipple } = useContext(PrimeReactContext);
    const topbarRef = useRef<AppTopbarRef>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [bindMenuOutsideClickListener, unbindMenuOutsideClickListener] = useEventListener({
        type: 'click',
        listener: (event) => {
            const isOutsideClicked = !(
                sidebarRef.current?.isSameNode(event.target as Node) ||
                sidebarRef.current?.contains(event.target as Node) ||
                topbarRef.current?.menubutton?.isSameNode(event.target as Node) ||
                topbarRef.current?.menubutton?.contains(event.target as Node)
            );

            if (isOutsideClicked) {
                hideMenu();
            }
        }
    });

    const pathname = usePathname();
    const searchParams = useSearchParams();
    useEffect(() => {
        hideMenu();
        hideProfileMenu();
    }, [pathname, searchParams]);

    const [bindProfileMenuOutsideClickListener, unbindProfileMenuOutsideClickListener] = useEventListener({
        type: 'click',
        listener: (event) => {
            const isOutsideClicked = !(
                topbarRef.current?.topbarmenu?.isSameNode(event.target as Node) ||
                topbarRef.current?.topbarmenu?.contains(event.target as Node) ||
                topbarRef.current?.topbarmenubutton?.isSameNode(event.target as Node) ||
                topbarRef.current?.topbarmenubutton?.contains(event.target as Node)
            );

            if (isOutsideClicked) {
                hideProfileMenu();
            }
        }
    });

    const hideMenu = () => {
        setLayoutState((prevLayoutState: LayoutState) => ({
            ...prevLayoutState,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false
        }));
        unbindMenuOutsideClickListener();
        unblockBodyScroll();
    };

    const hideProfileMenu = () => {
        setLayoutState((prevLayoutState: LayoutState) => ({
            ...prevLayoutState,
            profileSidebarVisible: false
        }));
        unbindProfileMenuOutsideClickListener();
    };

    const blockBodyScroll = (): void => {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' blocked-scroll';
        }
    };

    const unblockBodyScroll = (): void => {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    };

    useEffect(() => {
        if (layoutState.overlayMenuActive || layoutState.staticMenuMobileActive) {
            bindMenuOutsideClickListener();
        }

        layoutState.staticMenuMobileActive && blockBodyScroll();
    }, [layoutState.overlayMenuActive, layoutState.staticMenuMobileActive]);

    useEffect(() => {
        if (layoutState.profileSidebarVisible) {
            bindProfileMenuOutsideClickListener();
        }
    }, [layoutState.profileSidebarVisible]);

    useUnmountEffect(() => {
        unbindMenuOutsideClickListener();
        unbindProfileMenuOutsideClickListener();
    });

    const containerClass = classNames('layout-wrapper', {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive,
        'p-input-filled': layoutConfig.inputStyle === 'filled',
        'p-ripple-disabled': !layoutConfig.ripple
    });

    const menuToggleClass = classNames('menu-toggle-icon bg-pink-500', {
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

    if (!user) {
        return (
            <>
                <Preloader />
            </>
        );
    }

    // function for splitting url
    // Extract the last part of the path, e.g., '/some-path' -> 'some-path'
    // Extract the last part of the path, e.g., '/some-path' -> 'some-path'
    const pathParts = pathname.split('/').filter(Boolean);

    // Determine the page name
    const pageName = pathParts.pop() || ''; // This will give you the last part of the URL, e.g., 'faq', 'add-faq'

    // Clean the name: remove dashes, capitalize first letter, and make the rest lowercase
    const cleanedName = pageName
        .replace(/-/g, ' ') // Replace dashes with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word

    // Determine if there's any additional path (i.e., not the root page)
    const hasAdditionalPath = pathParts.length > 0;

    // Set the icon and label based on whether there is an additional path
    const items = [
        {
            label: cleanedName,
            icon: hasAdditionalPath ? 'pi pi-arrow-left' : '' // Only show the arrow icon if there is an additional path
        }
    ];

    const isDefaultPage = pathname === '/';

    return (
        <React.Fragment>
            <TopLinerLoader />
            <div className={containerClass}>
                <MyFileUpload />
                <AppTopbar ref={topbarRef} />
                {/* {!layoutState.isMobile && (
                    <div className={menuToggleClass} onClick={onMenuToggle}>
                        <i className={iconClass}></i>
                    </div>
                )} */}
                <div ref={sidebarRef} className="layout-sidebar">
                    <AppSidebar />
                </div>
                <div className={'layout-main-container'}>
                    {/* {!isDefaultPage && <Menubar className="layout-upper-panel bg-white border-t  border-gray-300 rounded-none font-bold text-2xl" model={items} />} */}

                    <div className={`layout-main ${!isScroll ? 'layout-main-pad' : ''}`}>{children}</div>
                    <AppFooter />
                </div>
                <AppConfig />
                <div className="layout-mask"></div>
            </div>
        </React.Fragment>
    );
});

export default Layout;
