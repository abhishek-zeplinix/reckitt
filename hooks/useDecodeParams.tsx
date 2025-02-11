import { useMemo } from 'react';
import { decode as base64Decode } from 'js-base64';

// const useDecodeParams = (encodedParams: string) => {
//     return useMemo(() => {
//         try {

//             const cleanEncodedParams = encodedParams.trim();
//             const decodedStr = base64Decode(cleanEncodedParams);
//             const parsedParams = JSON.parse(decodedStr);

//             return {
//                 supId: String(parsedParams.supId),
//                 catId: String(parsedParams.catId),
//                 subCatId: String(parsedParams.subCatId),
//                 currentYear: String(parsedParams.currentYear),
//                 departmentId: String(parsedParams.departmentId),
//                 period: String(parsedParams.period)
//             };
//         } catch (error) {
//             console.error('Error decoding parameters:', error);
//             return { supId: '', catId: '', subCatId: '', currentYear: '', departmentId: '', period: ''};
//         }
//     }, [encodedParams]);
// };

// export default useDecodeParams;


const useDecodeParams = (encodedParams: string) => {
    return useMemo(() => {
        try {
            // Decode URL encoding first
            const urlDecodedParams = decodeURIComponent(encodedParams);

            // Trim any extra spaces
            const cleanEncodedParams = urlDecodedParams.trim();

            // Base64 decode
            const decodedStr = base64Decode(cleanEncodedParams);

            // Parse JSON
            const parsedParams = JSON.parse(decodedStr);

            return {
                supId: String(parsedParams.supId || ''),
                catId: String(parsedParams.catId || ''),
                subCatId: String(parsedParams.subCatId || ''),
                currentYear: String(parsedParams.currentYear || ''),
                departmentId: String(parsedParams.departmentId || ''),
                period: String(parsedParams.period || '')
            };
        } catch (error) {
            console.error('Error decoding parameters:', error);
            return { supId: '', catId: '', subCatId: '', currentYear: '', departmentId: '', period: '' };
        }
    }, [encodedParams]);
};

export default useDecodeParams;
