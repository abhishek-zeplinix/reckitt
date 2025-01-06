'use client';
import { useRouter } from 'next/navigation';
import { Ripple } from 'primereact/ripple';
import { Menu } from 'primereact/menu';
import React, { useEffect, useContext, useRef, useState } from 'react';
import { MenuContext } from './context/menucontext';
import { AppMenuItemProps } from '@/types';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAppContext } from './AppWrapper';
import { StyleClass } from 'primereact/styleclass';
import { LayoutContext } from './context/layoutcontext';
import Link from 'next/link';

const AppMenuitem = (props: AppMenuItemProps) => {
    const { user } = useAppContext();
    const menu = useRef<any>(null);
    const { layoutConfig, layoutState, setLayoutState, onMenuToggle } = useContext(LayoutContext);
    const btnRef4 = useRef(null);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { activeMenu, setActiveMenu } = useContext(MenuContext);
    const item = props.item;
    const key = props.parentKey ? props.parentKey + '-' + props.index : String(props.index) + '-0';
    const active = activeMenu === key || activeMenu?.startsWith(key + '-');


    const [isHydrated, setIsHydrated] = useState(false);


    const isItemActive = () => {
        // Active if activeMenu matches key and the item has no subitems
        return activeMenu === key && (!item?.items || item?.items?.length === 0);
    };

    const isSubItemActive = (subItemLabel: string) => {
        // Active if activeMenu matches the subitem key
        return activeMenu === `${key}-${subItemLabel}`;
    };
    


    useEffect(() => {
        setIsHydrated(true);
    }, []);
    
    useEffect(() => {
        if (isHydrated && !activeMenu && pathname === '/') {
            setActiveMenu('0-0'); 
        }
    }, [isHydrated, activeMenu, pathname]);




    const onRouteChange = (url: string) => {
        if (item!.to && item!.to === url) {
            setActiveMenu(key);
        }
    };

    useEffect(() => {
        onRouteChange(pathname);
    }, [pathname, searchParams]);

   
    const itemClick = (event: any, subItem?: any) => {
        if (item!.disabled) {
            event.preventDefault();
            return;
        }
    
        if (subItem) {
            const subItemKey = `${key}-${subItem.label}`;
            setActiveMenu(subItemKey);
        } else if (!item?.items || item?.items?.length === 0) {
            setActiveMenu(key); // Correctly set for standalone items
        }
    
        // Additional logic
        if (item?.command) {
            item.command({ originalEvent: event, item: item });
        }
    
        if (subItem?.command) {
            subItem.command({ originalEvent: event, item: subItem });
        }
    };
    

    if (item?.check && !item.check(user)) {
        return null;
    }

 

    const getItemClassName = (isSubItem = false, subItemLabel?: string) => {
        const baseClass = isSubItem
            ? "p-ripple flex align-items-center cursor-pointer p-3 border-round transition-duration-150 transition-colors  pl-5 mx-1"
            : "p-ripple p-3 pl-1 flex align-items-center justify-content-between border-round cursor-pointer custom-menu-item mx-1";

        const isActive = isSubItem
            ? isSubItemActive(subItemLabel!)
            : isItemActive(); // Use the updated isItemActive for standalone items

        return `${baseClass} ${isActive ? 'bg-pink-500' : ''}`;
    };


    const getTextColorClass = (isSubItem = false, subItemLabel?: string) => {
        const isActive = isSubItem
            ? isSubItemActive(subItemLabel!)
            : isItemActive(); // Now accurately checks for standalone items

        return isActive ? 'text-white' : 'text-slate-400';
    };

  

    return (
        <li>
            {item && item.items && item.items.length > 0 ? (

                <StyleClass nodeRef={btnRef4} selector="@next" enterClassName="hidden" enterActiveClassName="slidedown" leaveToClassName="hidden" leaveActiveClassName="slideup">
                    <div ref={btnRef4} className={getItemClassName()} onClick={itemClick}>
                        <div className="flex align-items-center">
                            {item.icon && (
                                <i className={`${item.icon} mr-2 text-xl ${getTextColorClass()}`}></i>
                            )}
                            {(layoutState.isMobile || !layoutState.staticMenuDesktopInactive) && (
                                <span className={`font-medium text-lg ${getTextColorClass()}`}>
                                    {item.label}
                                </span>
                            )}
                        </div>
                        {(layoutState.isMobile || !layoutState.staticMenuDesktopInactive) && (
                            <i className={`pi pi-chevron-down ${getTextColorClass()}`}></i>
                        )}
                        <Ripple />
                    </div>
                </StyleClass>
            ) : item?.url ? (
                <Link href={item.url} className={getItemClassName()} onClick={itemClick}>
                    <div className="flex align-items-center">
                        {item.icon && (
                            <i className={`${item.icon} mr-2 text-xl ${getTextColorClass()}`}></i>
                        )}
                        {(layoutState.isMobile || !layoutState.staticMenuDesktopInactive) && (
                            <span className={`font-medium text-lg ${getTextColorClass()}`}>
                                {item.label}
                            </span>
                        )}
                    </div>
                    <Ripple />
                </Link>
            ) : null}

            {item && item.items && item.items.length > 0 && (
                <ul className="list-none p-0 m-0 hidden overflow-hidden">
                    {item.items.map((child, i) => {
                        if (child.check && !child.check(user)) {
                            return null;
                        }
                        if (!layoutState.isMobile && layoutState.staticMenuDesktopInactive) {
                            return (
                                <Menu
                                    model={item.items}
                                    popup
                                    ref={menu}
                                    key={`menu-${i}`}
                                />
                            );
                        }
                        if (child.url) {
                            return (
                                <li key={`item-${i}`}>
                                    <Link
                                        href={child.url}
                                        className={getItemClassName(true, child.label)}
                                        onClick={(event) => itemClick(event, child)}
                                    >
                                        {child.icon && (
                                            <i className={`${child.icon} mr-2 ${getTextColorClass(true, child.label)}`}></i>
                                        )}
                                        {(layoutState.isMobile || !layoutState.staticMenuDesktopInactive) && (
                                            <span className={`font-medium text-lg ${getTextColorClass(true, child.label)}`}>
                                                {child.label}
                                            </span>
                                        )}
                                        <Ripple />
                                    </Link>
                                </li>
                            );
                        }
                        return null;
                    })}
                </ul>
            )}
        </li>
    );
};

export default AppMenuitem;