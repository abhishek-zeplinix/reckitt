import { CONFIG } from '@/config/config';
import { z } from 'zod';

export const formSchemaSupplier = z.object({
    supplierName: z.string().min(1, 'Supplier name cannot be empty'),
    supplierManufacturerName: z.string().min(1, 'Supplier manufacturer cannot be empty'),
    factoryName: z.string().min(1, 'Factory name cannot be empty'),
    email: z.string().email('Email must be in proper format').min(1, 'Email cannot be empty'),
    supplierNumber: z.string().min(10, "Phone number must be at least 10 digits")
                                .max(12, "Phone number cannot be more than 12 digits"),
    Zip: z.union([z.string(), z.number()])
        .transform((val) => String(val).trim())
        .refine((val) => val.length > 0, {
            message: 'Zip code cannot be empty',
        }),
    siteAddress: z.string().min(1, 'Site address cannot be empty'),
    warehouseLocation: z.string().min(1, 'Warehouse location cannot be empty'),
    procurementCategoryId: z
        .number()
        .nullable()
        .refine((val) => val !== null, {
            message: 'Procurement category cannot be empty'
        }),
    supplierCategoryId: z
        .number()
        .nullable()
        .refine((val) => val !== null, {
            message: 'Supplier category cannot be empty'
        }),
    country: z.string().min(1, 'country cannot be empty'),
    city: z.string().min(1, 'city cannot be empty'),
    state: z.string().min(1, 'state cannot be empty')
});

export const validateFormData = (data: unknown) => {
    try {
        formSchemaSupplier.parse(data);
        return { valid: true, errors: {} };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors.reduce((acc, curr) => {
                acc[curr.path[0]] = curr.message;
                return acc;
            }, {} as Record<string, string>);
            return { valid: false, errors };
        }
        return { valid: false, errors: { general: 'Unexpected error occurred' } };
    }
};

const fieldsSchemaRules = z.object({
    effectiveFrom: z
        .date()
        .nullable()
        .refine((val) => val !== null, {
            message: 'Effective date cannot be empty'
        }),
    departmentId: z
        .number()
        .nullable()
        .refine((val) => val !== null, {
            message: 'Department cannot be empty'
        }),
    orderBy: z
        .number()
        .nullable()
        .refine((val) => val !== null, {
            message: 'OrderBy cannot be empty'
        }),
    section: z.string().min(1, 'Section cannot be empty'),
    categoryId: z
        .number()
        .nullable()
        .refine((val) => val !== null, {
            message: 'Procurement category cannot be empty'
        }),
    subCategoryId: z
        .number()
        .nullable()
        .refine((val) => val !== null, {
            message: 'Supplier category cannot be empty'
        }),
    ratedCriteria: z.string().min(1, 'Rated Criteria cannot be empty'),
    ratiosRawpack: z.preprocess(
        (val) => (typeof val === "string" && !isNaN(Number(val)) ? Number(val) : val),
        z.number().min(1, "Ratios Raw Pack cannot be empty")
      ),
      ratiosCopack: z.preprocess(
        (val) => (typeof val === "string" && !isNaN(Number(val)) ? Number(val) : val),
        z.number().min(1, "Ratios Co Pack cannot be empty")
      ),
    criteriaEvaluation: z.array(z.string().min(1, 'Criteria Evaluation cannot be empty')),
    score: z.array(
        z
          .union([
            z.string().refine((val) => val.trim() !== "", { message: "Score cannot be empty" }), // Ensures no empty strings
            z.number().min(0, "Score must be 0 or higher"),
            z.literal("NA"),
          ])
          .transform((val) => (typeof val === "string" && !isNaN(Number(val)) ? Number(val) : val)) // Converts valid number strings to numbers
      )
});

export const validateFormRuleData = (data: unknown) => {
    try {
        fieldsSchemaRules.parse(data);
        return { valid: true, errors: {} };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors.reduce((acc, curr) => {
                acc[curr.path[0]] = curr.message;
                return acc;
            }, {} as Record<string, string>);
            return { valid: false, errors };
        }
        return { valid: false, errors: { general: 'Unexpected error occurred' } };
    }
};

const fieldsSchemaCapaRules = z.object({
    effectiveFrom: z
        .date()
        .nullable()
        .refine((val) => val !== null, {
            message: 'Effective date cannot be empty'
        }),
    departmentId: z
        .number()
        .nullable()
        .refine((val) => val !== null, {
            message: 'Department cannot be empty'
        }),
    categoryId: z
        .number()
        .nullable()
        .refine((val) => val !== null, {
            message: 'Procurement Category cannot be empty'
        }),
    subCategoryId: z
        .number()
        .nullable()
        .refine((val) => val !== null, {
            message: 'Supplier Category cannot be empty'
        }),
    orderBy: z
        .number()
        .nullable()
        .refine((val) => val !== null, {
            message: 'OrderBy cannot be empty'
        }),
    capaRulesName: z.string().min(1, 'Rapa rules name cannot be empty'),
    status: z.array(
        z
            .string()
            .min(1, 'Score cannot be empty')
    )
});

export const validateFormCapaRuleData = (data: unknown) => {
    try {
        fieldsSchemaCapaRules.parse(data);
        return { valid: true, errors: {} };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errors = error.errors.reduce((acc, curr) => {
                acc[curr.path[0]] = curr.message;
                return acc;
            }, {} as Record<string, string>);
            return { valid: false, errors };
        }
        return { valid: false, errors: { general: 'Unexpected error occurred' } };
    }
};

export const validateSubdomain = (subdomain: string) => {
    const subdomainLower = subdomain.toLowerCase();
    const subdomainRegex = /^[a-z0-9-]{3,63}$/;

    // List of reserved subdomain names (lowercase)
    const reservedNames = ['admin', 'user', 'erp', 'localhost', 'local', 'login', 'reset', 'change', 'example'];

    // Check if the subdomain matches the regex
    if (!subdomainRegex.test(subdomain)) {
        return false;
    }

    // Check if the subdomain does not start or end with a hyphen
    if (subdomainLower.startsWith('-') || subdomainLower.endsWith('-')) {
        return false;
    }

    // Check if the subdomain is one of the reserved names
    if (reservedNames.includes(subdomainLower)) {
        return false;
    }

    return true;
};

export const validateName = (firstName: string, key?: string) => {
    const namePattern = /^[a-zA-Z\s'-.]+$/;
    if (typeof firstName !== 'string' || firstName.trim() === '') {
        return false;
    }
    if (!namePattern.test(firstName)) {
        return false;
    }
    return true;
};

export const validateZipNumber = (phoneNumber: string) => {
    const phonePattern = /^[0-9]{5,6}$/; // Pattern that allows only 10 digits
    if (typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
        return false;
    }
    if (!phonePattern.test(phoneNumber)) {
        return false;
    }
    return true;
};
export const validateCountryCode = (countryCode: string) => {
    const countryCodePattern = /^\+[0-9]{1,3}$/; // Pattern that allows + followed by 1 to 3 digits
    if (typeof countryCode !== 'string' || countryCode.trim() === '') {
        return false;
    }
    if (!countryCodePattern.test(countryCode)) {
        return false;
    }
    return true;
};

// export const validateEmail = (email: string) => {
//     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (typeof email !== 'string' || email.trim() === '') {
//         return false;
//     }
//     if (!emailPattern.test(email)) {
//         return false;
//     }
//     return true;
// };
export const validateNumberOfRacks = (noOfRacks: number) => {
    if (typeof noOfRacks !== 'string' || noOfRacks <= 0) {
        return false; // Invalid if not a positive number
    }
    if (noOfRacks > 50) {
        return false; // Invalid if more than 50
    }
    return true; // Valid
};

export const formatBytes = (bytes = 0, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const parseYouTubeID = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
};

export const formatString = (str = '') => {
    return str
        .toLowerCase() // Convert to lowercase
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
};

export const generateRandomId = () => {
    const timestamp = Date.now(); // Current timestamp in milliseconds
    const randomNum = Math.floor(Math.random() * 1000000); // Generate a random number
    return `${timestamp}-${randomNum}`;
};

// Function to get the logo URL
// export const getCompanyLogo = (logo: string | undefined, fallback: string = '/images/reckitt.webp') => {
//     // Return fallback if logo is not defined
//     if (!logo) {
//         return fallback;
//     }

//     // Check if logo contains 'http' and return accordingly
//     return logo.includes('http') ? logo : `${CONFIG.ASSET_LINK}${logo}`;
// };

// Login Page

// export const getLoginScreenImage = (image: string | undefined, fallback: string = '/images/login.svg') => {
//     // Return fallback if image is not defined
//     if (!image) {
//         return fallback;
//     }

//     // Check if image contains 'http' and return accordingly
//     return image.includes('http') ? image : `${CONFIG.ASSET_LINK}${image}`;
// };

export const filterArray = (data: any[], filters: any) => {
    return data.filter((item) => {
        // Check global filter first
        if (filters.global && filters.global.value) {
            const globalValue = filters.global.value.toLowerCase();
            if (filters.global.matchMode === 'contains') {
                const containsGlobal = Object.values(item).some((value) => String(value).toLowerCase().includes(globalValue));
                if (!containsGlobal) return false;
            }
        }

        // Check field-specific filters
        for (const key in filters) {
            if (key === 'global') continue; // Skip global filter here

            const filter = filters[key];
            const itemValue = String(item[key] || '').toLowerCase();
            const filterValue = filter.value.toLowerCase();

            switch (filter.matchMode) {
                case 'contains':
                    if (!itemValue.includes(filterValue)) return false;
                    break;
                case 'startsWith':
                    if (!itemValue.startsWith(filterValue)) return false;
                    break;
                default:
                    return false;
            }
        }
        return true;
    });
};

export const buildQueryParams = (params: any) => {
    const query = new URLSearchParams();

    if (params.pagination !== false) {
        query.append('limit', (params.limit ? params.limit : 10) || 10);
        query.append('page', (params.page ? params.page : 1) || 1);
    }

    // Sorting parameters
    if (params.sortBy) {
        query.append('sortBy', params.sortBy);
        query.append('sortOrder', params.sortOrder);
    }

    // Filters
    for (const filterField in params.filters) {
        if (params.filters[filterField]) {
            query.append(`filters.${filterField}`, params.filters[filterField]);
        }
    }

    // Include parameters
    if (typeof params.include == 'object') {
        query.append('include', params.include.join(','));
    } else if (typeof params.include == 'string') {
        query.append('include', params.include);
    } else if (Array.isArray(params.include)) {
        query.append('include', params.include.map((i: any) => i.trim()).join(','));
    }

    // if another parameter passed apart from above ...
    for (const key in params) {
        if (!['limit', 'page', 'sortBy', 'sortOrder', 'filters', 'include', 'pagination'].includes(key)) {
            query.append(key, params[key]);
        }
    }

    return query.toString();
};

export const getRowLimitWithScreenHeight = ({ headerHeight = 250, footerHeight = 50 } = { headerHeight: 250, footerHeight: 50 }) => {
    if (typeof window === "undefined") {
        return 10; 
    }

    const availableHeight = window.innerHeight - headerHeight - footerHeight;
    return Math.max(Math.floor(availableHeight / 50), 10);
};

export const validateString = (firstName: string, key?: string) => {
    const namePattern = /^[a-zA-Z0-9\-_()]+( [a-zA-Z0-9\-_()]+)*$/;
    if (typeof firstName !== 'string' || firstName.trim() === '') {
        return false;
    }
    if (!namePattern.test(firstName)) {
        return false;
    }
    return true;
};

//sort and map data based on specific property

const sortAndMap = (array: any, sortKey: any, mapFn: any, order = 'asc') => {
    return (array as any[]).sort((a, b) => (order === 'asc' ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey])).map(mapFn);
};

export const validateText = (text: string): boolean => {
    if (typeof text !== 'string' || text.trim() === '') {
        return false; // Text should not be empty
    }
    return true;
};
export const validateSiteAddress = (address: string): boolean => {
    if (typeof address !== 'string' || address.trim() === '') {
        return false; // Address should not be empty
    }
    return true; // Any non-empty string is valid
};

export const validateField = (fieldValue: any): boolean => {
    if (fieldValue === null || fieldValue === undefined || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
        return false; // Field is empty
    }
    return true; // Field has data
};

// Email Validation
export const validateEmail = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation pattern
    if (typeof email !== 'string' || email.trim() === '') {
        return false; // Email must be a non-empty string
    }
    return emailPattern.test(email);
};

// Phone Number Validation
export const validatePhoneNumber = (phoneNumber: string): boolean => {
    const phonePattern = /^[0-9]{10}$/; // Validates a 10-digit phone number
    if (typeof phoneNumber !== 'string' || phoneNumber.trim() === '') {
        return false; // Phone number must be a non-empty string
    }
    return phonePattern.test(phoneNumber);
};

export const validateZipCode = (zip: string): boolean => {
    const zipPattern = /^[0-9]{1,6}$/; // Matches 1 to 5 digits
    if (typeof zip !== 'string' || zip.trim() === '') {
        return false; // ZIP code must be a non-empty string
    }
    return zipPattern.test(zip);
};

export const validateFullName = (fullName: string): boolean => {
    const fullNamePattern = /^[a-zA-Z]+( [a-zA-Z]+)*$/; // Validates full name format (case-insensitive)
    if (typeof fullName !== 'string' || fullName.trim() === '') {
        return false; // Full name must be a non-empty string
    }
    return fullNamePattern.test(fullName);
};

export const getBackgroundColor = (percentage: any) => {
    if (percentage >= 90) {
        return '#2196F3';
    } else if (percentage >= 70) {
        return '#4CAF50';
    } else if (percentage >= 50) {
        return '#FF9800';
    } else {
        return '#F44336';
    }
};

// Quarterly and Halfyearly to Q and H

export const formatEvaluationPeriod = (period: string): string => {
    return period
        .replace('Quarterly-', 'Q')
        .replace('Halfyearly-', 'H')
        .replace(/-(\d{4})$/, ' $1'); // Adds space before the year
};


export const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
        case 'approved':
            return 'bg-green-100 text-green-700 border-round-md';
        case 'rejected':
            return 'bg-red-100 text-red-700 border-round-md';
        case 'pending':
            return 'bg-blue-100 text-blue-700 border-round-md';
        default:
            return '';
    }
};

export const renderColorStatus = (status: string) => {
    return <span className={`px-2 py-1 rounded-lg ${getStatusClass(status)}`}>{status}</span>;
};