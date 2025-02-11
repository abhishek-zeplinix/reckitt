// 'use client';
// import { Ripple } from 'primereact/ripple';
// import { Menu } from 'primereact/menu';
// import React, { useEffect, useContext, useRef, useState } from 'react';
// import { AppMenuItemProps } from '@/types';
// import { usePathname, useSearchParams } from 'next/navigation';
// import { useAppContext } from './AppWrapper';
// import { LayoutContext } from './context/layoutcontext';
// import Link from 'next/link';
// import { CSSTransition } from 'react-transition-group';
// import { useLoaderContext } from './context/LoaderContext';
// import { MenuContext } from './context/menucontext';

// const AppMenuitem = (props: AppMenuItemProps) => {
//     const { activeMenu, setActiveMenu, openSubmenus, toggleSubmenu } = useContext(MenuContext);
//     const key = props.parentKey ? props.parentKey + '-' + props.index : String(props.index);
//     const searchParams = useSearchParams();
//     const active = activeMenu === key || activeMenu.startsWith(key + '-');
//     const { user } = useAppContext();
//     const menu = useRef<any>(null);
//     const { layoutState } = useContext(LayoutContext);
//     const pathname = usePathname();
//     const item = props.item;
//     const [height, setHeight] = useState<string>('0px');
//     const contentRef = useRef<HTMLUListElement>(null);
//     const { setLoader } = useLoaderContext();

//     const isOpen = openSubmenus[key] ||false;
//     console.log('isOpen:', isOpen);
//     console.log('openSubmenus:', openSubmenus);
//     const onRouteChange = (url: string) => {
//         if (item!.to && item!.to === url) {
//             setActiveMenu(key); // This should not affect isOpen
//         }
//     };
// useEffect(() => {
//     if (isOpen && contentRef.current) {
//         setHeight(`${contentRef.current.scrollHeight}px`);
//     } else {
//         setHeight('0px');
//     }
// }, [isOpen]);
    

// useEffect(() => {
//     onRouteChange(pathname);
// }, [pathname, searchParams]);

//     const isItemActive = () => {
//         return item?.url === pathname;
//     };
//     const isSubItemActive = (subItemUrl: string) => {
//         return pathname === subItemUrl;
//     };
//     const getItemClassName = (isSubItem = false, subItemUrl?: string) => {
//         const baseClass = isSubItem
//             ? 'p-ripple flex align-items-center cursor-pointer p-3 border-round transition-duration-150 transition-colors pl-5'
//             : 'p-ripple p-3 pl-1 flex align-items-center justify-content-between border-round cursor-pointer custom-menu-item';

//         const isActive = isSubItem ? isSubItemActive(subItemUrl!) : isItemActive();
//         // Adjust margins dynamically based on sidebar state
//         const marginClass = layoutState.staticMenuDesktopInactive
//             ? 'mx-collapsed' // Class for collapsed state
//             : 'mx-default'; // Class for default state

//         return `${baseClass} ${marginClass} ${isActive ? 'bg-primary-main' : ''}`;
//     };
//     const getTextColorClass = (isSubItem = false, subItemUrl?: string) => {
//         const isActive = isSubItem ? isSubItemActive(subItemUrl!) : isItemActive();
//         return isActive ? 'text-white' : 'text-slate-400';
//     };
//     const itemClick = (event: React.MouseEvent, subItem?: any) => {
//         event.preventDefault();

//         if (!subItem && item?.items) {
//             toggleSubmenu(key); // Toggle submenu using the key
//         } else {
//             event.stopPropagation();
//         }

//         if (subItem?.command) {
//             subItem.command({ originalEvent: event, item: subItem });
//         }
//     };
//     return (
//         <li>
//             {item && item.items && item.items.length > 0 ? (
//                 <>
//                     <div className={getItemClassName()} onClick={(e) => itemClick(e)}>
//                         <div className="flex align-items-center">
//                             {item.icon && <i className={`${item.icon} mr-2 text-base font-semibold ${getTextColorClass()}`}></i>}
//                             {(layoutState.isMobile || !layoutState.staticMenuDesktopInactive) && <span className={`font-semibold text-base ${getTextColorClass()}`}>{item.label}</span>}
//                         </div>
//                         {(layoutState.isMobile || !layoutState.staticMenuDesktopInactive) && <i className={`pi pi-chevron-down transition-transform transition-duration-200 ${isOpen ? 'rotate-180' : ''} ${getTextColorClass()}`}></i>}
//                         <Ripple />
//                     </div>
//                     {layoutState.staticMenuDesktopInactive ? (
//                         <Menu model={item.items} popup ref={menu} />
//                     ) : (
//                         <ul ref={contentRef} className="list-none p-0 m-0 overflow-hidden transition-all transition-duration-200 ease-in-out" style={{ maxHeight: height }}>
//                             {item.items.map((child, i) => {
//                                 if (child.check && !child.check(user)) {
//                                     return null;
//                                 }
//                                 return (
//                                     <li key={`item-${i}`}>
//                                         {child.url ? (
//                                             <Link
//                                                 href={child.url as string} // Ensuring it's a valid string
//                                                 className={getItemClassName(true, child.url)}
//                                                 onClick={(event) => itemClick(event, child)}
//                                             >
//                                                 {child.icon && <i className={`${child.icon} mr-2 ${getTextColorClass(true, child.url)}`}></i>}
//                                                 <span className={`font-semibold text-base ${getTextColorClass(true, child.url)}`}>{child.label}</span>
//                                                 <Ripple />
//                                             </Link>
//                                         ) : (
//                                             <span className={getItemClassName(true)} onClick={(event) => itemClick(event, child)}>
//                                                 {child.icon && <i className={`${child.icon} mr-2 ${getTextColorClass(true)}`}></i>}
//                                                 <span className={`font-semibold text-base ${getTextColorClass(true)}`}>{child.label}</span>
//                                                 <Ripple />
//                                             </span>
//                                         )}
//                                     </li>
//                                 );
//                             })}
//                         </ul>
//                     )}
//                 </>
//             ) : item?.url ? (
//                 <Link href={item.url} className={getItemClassName()} onClick={itemClick}>
//                     <div className="flex align-items-center">
//                         {item.icon && <i className={`${item.icon} mr-2 text-base ${getTextColorClass()}`}></i>}
//                         <span className={`font-semibold text-base ${getTextColorClass()}`}>{item.label}</span>
//                     </div>
//                     <Ripple />
//                 </Link>
//             ) : null}
//         </li>
//     );
// };

// export default AppMenuitem;






// 'use client';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { Ripple } from 'primereact/ripple';
// import { classNames } from 'primereact/utils';
// import React, { useEffect, useContext } from 'react';
// import { CSSTransition } from 'react-transition-group';
// import { MenuContext } from './context/menucontext';
// import { AppMenuItemProps } from '@/types';
// import { usePathname, useSearchParams } from 'next/navigation';

// const AppMenuitem = (props: AppMenuItemProps) => {
//     const pathname = usePathname();
//     const searchParams = useSearchParams();
//     const { activeMenu, setActiveMenu } = useContext(MenuContext);
//     const item = props.item;
//     const key = props.parentKey ? props.parentKey + '-' + props.index : String(props.index);
//     const isActiveRoute = item!.to && pathname === item!.to;
//     const active = activeMenu === key || activeMenu.startsWith(key + '-');

//     const onRouteChange = (url: string) => {
//         if (item!.to && item!.to === url) {
//             setActiveMenu(key);
//         }
//     };

//     useEffect(() => {
//         onRouteChange(pathname);
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [pathname, searchParams]);

//     const itemClick = (event: React.MouseEvent<HTMLAnchorElement | HTMLSpanElement, MouseEvent>) => {
//         event.preventDefault();
    
//         if (item!.disabled) {
//             return;
//         }
    
//         if (item!.command) {
//             item!.command({ originalEvent: event as React.MouseEvent<HTMLAnchorElement, MouseEvent>, item: item });
//         }
    
//         if (item!.items) {
//             // Toggle only this submenu while closing others
//             setActiveMenu(active ? '' : key);
//         } else {
//             setActiveMenu(key);
//         }
//     };
    

//     const subMenu = item!.items && item!.visible !== false && (
//         <CSSTransition timeout={{ enter: 1000, exit: 450 }} classNames="layout-submenu" in={props.root ? true : active} key={item!.label}>
//             <ul>
//                 {item!.items.map((child, i) => {
//                     return <AppMenuitem item={child} index={i} className={child.badgeClass} parentKey={key} key={child.label} />;
//                 })}
//             </ul>
//         </CSSTransition>
//     );

//     return (
//         <li className={classNames({ 'layout-root-menuitem': props.root, 'active-menuitem': active })}>
//             {(!item!.to || item!.items) && item!.visible !== false ? (
//                 <a href={item!.url} onClick={(e) => itemClick(e)} className={classNames(item!.class, 'p-ripple')} target={item!.target} tabIndex={0}>
//                     <i className={classNames('layout-menuitem-icon', item!.icon)}></i>
//                     <span className="layout-menuitem-text">{item!.label}</span>
//                     {item!.items && (
//                         <i className="pi pi-fw pi-angle-down layout-submenu-toggler" onClick={(e) => itemClick(e)}></i>
//                     )}
//                     <Ripple />
//                 </a>
//             ) : null}

//             {item!.to && !item!.items && item!.visible !== false ? (
//                 <Link href={item!.to} replace={item!.replaceUrl} target={item!.target} onClick={(e) => itemClick(e)} className={classNames(item!.class, 'p-ripple', { 'active-route': isActiveRoute })} tabIndex={0}>
//                     <i className={classNames('layout-menuitem-icon', item!.icon)}></i>
//                     <span className="layout-menuitem-text">{item!.label}</span>
//                     {item!.items && <i className="pi pi-fw pi-angle-down layout-submenu-toggler"></i>}
//                     <Ripple />
//                 </Link>
//             ) : null}
//             {subMenu}
//         </li>
//     );
// };

// export default AppMenuitem;






'use client';
import { Ripple } from 'primereact/ripple';
import { Menu } from 'primereact/menu';
import React, { useEffect, useContext, useRef, useState } from 'react';
import { AppMenuItemProps } from '@/types';
import { usePathname } from 'next/navigation';
import { useAppContext } from './AppWrapper';
import { LayoutContext } from './context/layoutcontext';
import Link from 'next/link';
// import { useLoaderContext } from './context/LoaderContext';
 
const AppMenuitem = (props: AppMenuItemProps) => {
    const { user } = useAppContext();
    const menu = useRef<any>(null);
    const { layoutState } = useContext(LayoutContext);
    const pathname = usePathname();
    const item = props.item;
    const [isOpen, setIsOpen] = useState(false);
    const [height, setHeight] = useState<string>('0px');
    const contentRef = useRef<HTMLUListElement>(null);
    // const { setLoader } = useLoaderContext();
 
    useEffect(() => {
        // Keep dropdown open if the current path matches any child URL
        if (item?.items) {
            const shouldBeOpen = item.items.some((child) => child.url === pathname);
            setIsOpen(shouldBeOpen);
            if (shouldBeOpen && contentRef.current) {
                setHeight(`${contentRef.current.scrollHeight}px`);
            } else {
                setHeight('0px');
            }
        }
    }, [pathname, item]);
 
    useEffect(() => {
        if (contentRef.current) {
            setHeight(isOpen ? `${contentRef.current.scrollHeight}px` : '0px');
        }
    }, [isOpen]);
 
    const isItemActive = () => {
        return item?.url === pathname;
    };
 
    const isSubItemActive = (subItemUrl: string) => {
        return pathname === subItemUrl;
    };
    // // Use useEffect to set loader when the page changes or the active state changes
    // useEffect(() => {
    //     if (getTextColorClass()) {
    //         setTimeout(() => {
    //             setLoader(false); // Set loader to false when the item is active
    //         }, 500);
    //     }
    // }, [pathname, item, setLoader]);
 
    const itemClick = (event: React.MouseEvent, subItem?: any) => {
        if (item!.disabled) {
            event.preventDefault();
            return;
        }
 
        if (!subItem && item?.items) {
            setIsOpen(!isOpen);
        }
 
        if (layoutState.staticMenuDesktopInactive && menu.current) {
            menu.current.toggle(event); // Show popup menu in collapsed mode
            return;
        }
 
        if (item?.command) {
            item.command({ originalEvent: event, item: item } as any);
        }
 
        if (subItem?.command) {
            subItem.command({ originalEvent: event, item: subItem });
        }
    };
 
    const getItemClassName = (isSubItem = false, subItemUrl?: string) => {
        const baseClass = isSubItem
            ? 'p-ripple flex align-items-center cursor-pointer p-3 border-round transition-duration-150 transition-colors pl-5'
            : 'p-ripple p-3 pl-1 flex align-items-center justify-content-between border-round cursor-pointer custom-menu-item';
 
        const isActive = isSubItem ? isSubItemActive(subItemUrl!) : isItemActive();
        // Adjust margins dynamically based on sidebar state
        const marginClass = layoutState.staticMenuDesktopInactive
            ? 'mx-collapsed' // Class for collapsed state
            : 'mx-default'; // Class for default state
 
        return `${baseClass} ${marginClass} ${isActive ? 'bg-primary-main' : ''}`;
    };
    const getTextColorClass = (isSubItem = false, subItemUrl?: string) => {
        const isActive = isSubItem ? isSubItemActive(subItemUrl!) : isItemActive();
        return isActive ? 'text-white' : 'text-slate-400';
    };
 
    if (item?.check && !item.check(user)) {
        return null;
    }
    return (
        <li>
            {item && item.items && item.items.length > 0 ? (
                <>
                    <div className={getItemClassName()} onClick={(e) => itemClick(e)}>
                        <div className="flex align-items-center">
                            {item.icon && <i className={`${item.icon} mr-2 text-base font-semibold ${getTextColorClass()}`}></i>}
                            {(layoutState.isMobile || !layoutState.staticMenuDesktopInactive) && <span className={`font-semibold text-base ${getTextColorClass()}`}>{item.label}</span>}
                        </div>
                        {(layoutState.isMobile || !layoutState.staticMenuDesktopInactive) && <i className={`pi pi-chevron-down transition-transform transition-duration-200 ${isOpen ? 'rotate-180' : ''} ${getTextColorClass()}`}></i>}
                        <Ripple />
                    </div>
                    {layoutState.staticMenuDesktopInactive ? (
                        <Menu model={item.items} popup ref={menu} />
                    ) : (
                        <ul ref={contentRef} className="list-none p-0 m-0 overflow-hidden transition-all transition-duration-200 ease-in-out" style={{ maxHeight: height }}>
                            {item.items.map((child, i) => {
                                if (child.check && !child.check(user)) {
                                    return null;
                                }
                                return (
                                    <li key={`item-${i}`}>
                                        {child.url ? (
                                            <Link
                                                href={child.url as string} // Ensuring it's a valid string
                                                className={getItemClassName(true, child.url)}
                                                onClick={(event) => itemClick(event, child)}
                                            >
                                                {child.icon && <i className={`${child.icon} mr-2 ${getTextColorClass(true, child.url)}`}></i>}
                                                <span className={`font-semibold text-base ${getTextColorClass(true, child.url)}`}>{child.label}</span>
                                                <Ripple />
                                            </Link>
                                        ) : (
                                            <span className={getItemClassName(true)} onClick={(event) => itemClick(event, child)}>
                                                {child.icon && <i className={`${child.icon} mr-2 ${getTextColorClass(true)}`}></i>}
                                                <span className={`font-semibold text-base ${getTextColorClass(true)}`}>{child.label}</span>
                                                <Ripple />
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </>
            ) : item?.url ? (
                <Link href={item.url} className={getItemClassName()} onClick={itemClick}>
                    <div className="flex align-items-center">
                        {item.icon && <i className={`${item.icon} mr-2 text-base ${getTextColorClass()}`}></i>}
                        <span className={`font-semibold text-base ${getTextColorClass()}`}>{item.label}</span>
                    </div>
                    <Ripple />
                </Link>
            ) : null}
        </li>
    );
};
 
export default AppMenuitem;
 