import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const options = {
    path: '/',
    sameSite: 'None'
};

// const isTokenValid = (userToken: string) => {
//     console.log('10',userToken)
//     if (!userToken) return false;
//     const decoded = jwtDecode(userToken);
//     console.log("decode", decoded);
    
//     if (decoded && decoded.exp) {
//         const currentTime = Date.now() / 1000; // Convert to seconds
//         return decoded && decoded.exp > currentTime ? decoded : false; // Check if the token is expired
//     }
//     return false;
// };
const isTokenValid = (userToken: string) => {
    try {
        if (!userToken) return false;
        const decoded: any = jwtDecode(userToken);
        if (decoded && decoded.exp) {
            const currentTime = Date.now() / 1000; // Convert to seconds
            return decoded.exp > currentTime ? decoded : false;
        }
        return false;
    } catch (error) {
        console.error("Token decode failed:", error);
        return false;
    }
};


// const getDomain = (): string => {
//     const hostname = window.location.host;
//     if (hostname.indexOf('localhost') > -1) {
//         return hostname;
//     }
//     const parts = hostname.split('.');
//     if (parts.length > 2) {
//         return `${parts.slice(-2).join('.')}`;
//     }
//     return `${parts.join('.')}`;
// };

const getDomain = (): string => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost') return '';
    const parts = hostname.split('.');
    return parts.length > 2 ? parts.slice(-2).join('.') : hostname;
};



const setAuthData = (token: string, refreshToken: string, userDetails: any) => {
    console.log('90',token)
    console.log('91',refreshToken)
    console.log('92',userDetails)
    const domain: string = getDomain();
    console.log("Domain:", domain);
    const option: any = {
        path: '/',
        secure: true,
        sameSite: 'None'
    };
    Cookies.set('userDetails', JSON.stringify(userDetails), option);


    if (domain.indexOf('localhost') == -1) {
        option.domain = `reckittserver.${domain}`;
        // option.secure = true; // Only for production
    }
    console.log('76',token, option)
    // console.log('78',)
    Cookies.set('authToken', token, option);
    Cookies.set('authRefreshToken', refreshToken, option);
    Cookies.set('userDetails', JSON.stringify(userDetails), option);
};

const setUserDetails = (userDetails: any) => {
    const domain: string = getDomain();
    const option: any = {
        path: '/',
        secure: true,
        sameSite: 'None'
    };

    if (domain.indexOf('localhost') == -1) {
        option.domain = `reckittserver.${domain}`;
    }
    Cookies.set('userDetails', JSON.stringify(userDetails), option);
};

const getAuthToken = (): string => {
    console.log('79',Cookies.get('authToken') || '')
    return Cookies.get('authToken') || '';
};

const getRefreshToken = (): string | undefined => {
    return Cookies.get('authRefreshToken');
};

const getUserDetails = () => {
    const domain = getDomain();
    const userDetails = Cookies.get('userDetails');
    console.log('75',userDetails)
    console.log('Setting userDetails:', JSON.stringify(userDetails));
    return userDetails ? JSON.parse(userDetails) : null;
};
console.log('Cookies.get("userDetails"):', Cookies.get('userDetails'));
console.log('112', Cookies.get());

const removeAuthData = () => {
    const domain: string = getDomain();
    const option: any = {
        path: '/',
        secure: true,
        sameSite: 'None'
        
    };
    console.log('Options:', option);

    if (domain.indexOf('localhost') == -1) {
        option.domain = `.${domain}`;
    }
    Cookies.remove('authToken', option);
    Cookies.remove('authRefreshToken', option);
    Cookies.remove('userDetails', option);
};

export {
    isTokenValid,
    setAuthData,
    setUserDetails,
    getAuthToken,
    getRefreshToken,
    getUserDetails,
    removeAuthData
};

// import Cookies from 'js-cookie';
// import { jwtDecode } from 'jwt-decode';
 
// const options = {
//     path: '/',
//     sameSite: 'None'
// };
 
// const isTokenValid = (userToken: string) => {
//     if (!userToken) return false;
//     const decoded = jwtDecode(userToken);
//     console.log("decode", decoded);
   
//     if (decoded && decoded.exp) {
//         const currentTime = Date.now() / 1000; // Convert to seconds
//         return decoded && decoded.exp > currentTime ? decoded : false; // Check if the token is expired
//     }
//     return false;
// };
 
// const getDomain = (): string => {
//     const hostname = window.location.host;
//     if (hostname.indexOf('localhost') > -1) {
//         return hostname;
//     }
//     const parts = hostname.split('.');
//     if (parts.length > 2) {
//         return `${parts.slice(-2).join('.')}`;
//     }
//     return `${parts.join('.')}`;
// };
 
// const setAuthData = (token: string, refreshToken: string, userDetails: any) => {
//     console.log('90',token)
//     const domain: string = getDomain();
//     const option: any = {
//         path: '/',
//         secure: true,
//         sameSite: 'None'
//     };
 
//     if (domain.indexOf('localhost') == -1) {
//         option.domain = `.${domain}`;
//     }
//     Cookies.set('authToken', token, option);
//     Cookies.set('authRefreshToken', refreshToken, option);
//     Cookies.set('userDetails', JSON.stringify(userDetails), option);
// };
 
// const setUserDetails = (userDetails: any) => {
//     const domain: string = getDomain();
//     const option: any = {
//         path: '/',
//         secure: true,
//         sameSite: 'None'
//     };
 
//     if (domain.indexOf('localhost') == -1) {
//         option.domain = `.${domain}`;
//     }
//     Cookies.set('userDetails', JSON.stringify(userDetails), option);
// };
 
// const getAuthToken = (): string => {
//     return Cookies.get('authToken') || '';
// };
 
// const getRefreshToken = (): string | undefined => {
//     return Cookies.get('authRefreshToken');
// };
 
// const getUserDetails = (): any => {
//     const domain = getDomain();
//     const userDetails = Cookies.get('userDetails');
//     return userDetails ? JSON.parse(userDetails) : null;
// };
 
// const removeAuthData = () => {
//     const domain: string = getDomain();
//     const option: any = {
//         path: '/',
//         secure: true,
//         sameSite: 'None'
//     };
 
//     if (domain.indexOf('localhost') == -1) {
//         option.domain = `.${domain}`;
//     }
//     Cookies.remove('authToken', option);
//     Cookies.remove('authRefreshToken', option);
//     Cookies.remove('userDetails', option);
// };
 
// export {
//     isTokenValid,
//     setAuthData,
//     setUserDetails,
//     getAuthToken,
//     getRefreshToken,
//     getUserDetails,
//     removeAuthData
// };
