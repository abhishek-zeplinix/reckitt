import { encode as base64Encode } from 'js-base64';

interface RouteParams {
  supId?: string | number;
  catId?: string | number;
  subCatId?: string | number;
  currentYear?: string;
  type?: string;
  departmentId?: any;
  period?: any;
  userId?: any;
  role?: string;
  name? : string,
  department?: string
  // Add any other optional parameters you might need
}

// export function encodeRouteParams(params: Partial<RouteParams>): string {
//   try {
//     // Create a clean object with only defined values
//     const cleanParams = Object.fromEntries(
//       Object.entries(params).filter(([_, v]) => v != null)
//     );

//     // Encode the cleaned parameters to a base64 string
//     return base64Encode(JSON.stringify(cleanParams));
//   } catch (error) {
//     console.error('Error encoding route params:', error);
//     return '';
//   }
// }

export function encodeRouteParams(params: Partial<RouteParams>): string {
  try {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    );

    return encodeURIComponent(base64Encode(JSON.stringify(cleanParams)));
  } catch (error) {
    console.error('Error encoding route params:', error);
    return '';
  }
}

export function extractRouteParams(encodedParams: string): Partial<RouteParams> {
  try {
    // decode the base64 string and parse it back to an object
    const decodedParams = JSON.parse(atob(encodedParams));
    return decodedParams;
  } catch (error) {
    console.error('Error extracting route params:', error);
    return {};
  }
}