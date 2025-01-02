// authContext.tsx
import React, { createContext, useContext, useCallback } from 'react';
import { get } from 'lodash';

// Simple role definition
export const USER_ROLES = {
    SUPER_ADMIN: 'Superadmin',
    SUPPLIER: 'Supplier',
    APPROVER: 'Approver',
    ADMIN: 'Admin',
    USER: 'User'
} as const;

type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

//permissions by role
const ROLE_PERMISSIONS = {
    [USER_ROLES.SUPER_ADMIN]: ['all'],
    [USER_ROLES.SUPPLIER]: ['view_products', 'edit_products'],
    [USER_ROLES.APPROVER]: ['view_dashboard', 'manage_suppliers', "manage_input_request"],
    [USER_ROLES.ADMIN]: ['view_users', 'edit_users'],
    [USER_ROLES.USER]: ['view_products']
} as const;

// Simple context type
type AuthContextType = {

    hasRole: (role: UserRole) => boolean;
    hasPermission: (permission: string) => boolean;
    isSuperAdmin: () => boolean;
    isSupplier: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({user,children}: {user: any | null; children: React.ReactNode;}) => {

    
    // Check if user has a specific role
    const hasRole = useCallback((role: UserRole): boolean => {
        if (!user) return false;
        if (get(user, 'isSuperAdmin', false)) return true;
        return get(user, 'userRole') === role;
    }, [user]);



    // Check if user has a specific permission
    const hasPermission = useCallback((permission: string): boolean => {
        if (!user) return false;
        if (get(user, 'isSuperAdmin', false)) return true;

        const userRole = get(user, 'userRole') as UserRole;
        const permissions: any = ROLE_PERMISSIONS[userRole] || [];
        return permissions.includes(permission);
    }, [user]);



    // Common role checks
    const isSuperAdmin = useCallback(() => hasRole(USER_ROLES.SUPER_ADMIN), [hasRole]);
    const isSupplier = useCallback(() => hasRole(USER_ROLES.SUPPLIER), [hasRole]);

    const value = {
        hasRole,
        hasPermission,
        isSuperAdmin,
        isSupplier
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// // Simple HOC for protected components
// export const withAuth = (
//     WrappedComponent: React.ComponentType<any>,
//     requiredRole?: UserRole
// ) => {
//     return function WithAuthComponent(props: any) {
//         const { hasRole } = useAuth();

//         if (requiredRole && !hasRole(requiredRole)) {
//             return <div>Access Denied</div>;
//         }

//         return <WrappedComponent {...props} />;
//     };
// };