import { encode as base64Encode } from 'js-base64';

interface RouteParams {
  supId: string | number;
  catId: string | number;
  subCatId: string | number;
  currentYear?: string;
  type?: string;
}

export function encodeRouteParams(params: RouteParams): string {
  try {
    // Ensure all required parameters are present
    const { supId, catId, subCatId } = params;
    if (!supId || !catId || !subCatId) {
      throw new Error('supId, catId, and subCatId are required');
    }

    // Create a clean object with only defined values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    );

    return base64Encode(JSON.stringify(cleanParams));
  } catch (error) {
    console.error('Error encoding route params:', error);
    return '';
  }
}

export function extractRouteParams(params: { 
  supId: string, 
  catId: string, 
  subCatId: string 
}) {
  return {
    supId: String(params.supId),
    catId: String(params.catId),
    subCatId: String(params.subCatId)
  };
}