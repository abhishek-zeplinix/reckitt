import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { get, intersection } from 'lodash';
import AccessDenied from '@/components/access-denied/AccessDenied';
import { ProgressSpinner } from 'primereact/progressspinner';

// Simple role definition
export const USER_ROLES = {
    SUPER_ADMIN: 'superAdmin',
    SUPPLIER: 'Supplier',
    APPROVER: 'Approver',
    EVALUATOR: 'Evaluator',
    ADMIN: 'Admin',
    USER: 'User'
} as const;

type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];


// Simple context type
type AuthContextType = {
    hasRole: (role: UserRole) => boolean;
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (requiredPermissions: string[]) => boolean;
    isSuperAdmin: () => boolean;
    isSupplier: () => boolean;
    isEvaluator: () => boolean;
    isApprover: () => boolean;
    userPermissions: string[];
    userId: string | null;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ user, children }: { user: any | null; children: React.ReactNode }) => {

    const [isLoading, setIsLoading] = useState(true);

    // Extract user permissions from the user object
    const userPermissions = useMemo(() => get(user, 'permissions.permissions', []) as string[], [user]);

    useEffect(() => {
        if (user) {
            setIsLoading(false);
        }
    }, [user]);


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
    const isApprover = useCallback(()=> hasRole(USER_ROLES.APPROVER), [hasRole]);
    const isEvaluator = useCallback(()=> hasRole(USER_ROLES.EVALUATOR), [hasRole]);

    //get user id
    const userId = useMemo(() => get(user, 'id', null) as string | null, [user]);

    const value = {
        hasRole,
        hasPermission,
        hasAnyPermission,
        isSuperAdmin,
        isSupplier,
        isApprover,
        isEvaluator,
        userPermissions,
        userId,
        isLoading
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
        const { hasRole, hasPermission, isLoading } = useAuth();

        if (isLoading) {
            return <ProgressSpinner />; // Or any other loading indicator
        }


        if (requiredRole && !hasRole(requiredRole)) {
            return <AccessDenied />
        }

        if (requiredPermission && !hasPermission(requiredPermission)) {
            return <AccessDenied />
        }

        return <WrappedComponent {...props} />;
    };
};
