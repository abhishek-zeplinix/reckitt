import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { get, intersection } from 'lodash';
import AccessDenied from '@/components/access-denied/AccessDenied';

// Simple role definition
export const USER_ROLES = {
    SUPER_ADMIN: 'superAdmin',
    SUPPLIER: 'Supplier',
    APPROVER: 'Approver',
    ADMIN: 'Admin',
    USER: 'User'
} as const;

type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

//permissions by role
// const ROLE_PERMISSIONS = {
//     [USER_ROLES.SUPER_ADMIN]: ['all'],
//     [USER_ROLES.SUPPLIER]: ['view_products', 'edit_products'],
//     [USER_ROLES.APPROVER]: ['view_dashboard', 'manage_suppliers', "manage_input_request"],
//     [USER_ROLES.ADMIN]: ['view_users', 'edit_users'],
//     [USER_ROLES.USER]: ['view_products']
// } as const;

// Simple context type
type AuthContextType = {
    hasRole: (role: UserRole) => boolean;
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (requiredPermissions: string[]) => boolean;
    isSuperAdmin: () => boolean;
    isSupplier: () => boolean;
    userPermissions: string[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ user, children }: { user: any | null; children: React.ReactNode }) => {
    // Extract user permissions from the user object
    const userPermissions = useMemo(() => get(user, 'permissions.permissions', []) as string[], [user]);
    console.log(userPermissions);

    // Check if user has a specific role
    const hasRole = useCallback((role: UserRole): boolean => {
        if (!user) return false;
        // if (get(user, 'isSuperAdmin', false)) return true;
        return get(user, 'userRole') === role;
    }, [user]);    
    

    // Check if user has a specific permission
    const hasPermission = useCallback(
        (permission: string): boolean => {
            if (!user) return false;

            //if user is Super Admin, he will get all permissions by default
            //remove this line if you want to assign custom permission to the superAdmin
            if (get(user, 'isSuperAdmin', false)) return true;

            // //retrieve userRole of logged in user to check his permission
            // const userRole = get(user, 'userRole') as UserRole;

            // //here you will get all assigned permission to the logged in user
            // const permissions: any = ROLE_PERMISSIONS[userRole] || [];

            //return boolen if passed permission is available in above permissions..
            return userPermissions.includes(permission);
        },
        [user, userPermissions]
    );

    // Check if the user has any of the required permissions
    const hasAnyPermission = useCallback(
        (requiredPermissions: string[]): boolean => {
            return intersection(requiredPermissions, userPermissions).length > 0;
        },
        [userPermissions]
    );

    // Common role checks
    const isSuperAdmin = useCallback(() => hasRole(USER_ROLES.SUPER_ADMIN), [hasRole]);
    const isSupplier = useCallback(() => hasRole(USER_ROLES.SUPPLIER), [hasRole]);

    const value = {
        hasRole,
        hasPermission,
        hasAnyPermission,
        isSuperAdmin,
        isSupplier,
        userPermissions
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// HOC for protected components
export const withAuth = (WrappedComponent: React.ComponentType<any>, requiredRole?: UserRole, requiredPermission?: string) => {
    return function WithAuthComponent(props: any) {
        const { hasRole, hasPermission } = useAuth();

        if (requiredRole && !hasRole(requiredRole)) {
            return <AccessDenied />
        }

        if (requiredPermission && !hasPermission(requiredPermission)) {
            return <AccessDenied />
        }

        return <WrappedComponent {...props} />;
    };
};
