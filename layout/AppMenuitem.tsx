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
