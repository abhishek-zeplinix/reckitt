// // context/LoaderContext.tsx

// 'use client'; // Marking this file as a Client Component

// import React, { createContext, useContext, useState, ReactNode } from 'react';

// interface LoaderContextType {
//   loader: boolean;
//   setLoader: React.Dispatch<React.SetStateAction<boolean>>;
// }

// const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

// export const useLoaderContext = (): LoaderContextType => {
//   const context = useContext(LoaderContext);
//   if (!context) {
//     throw new Error('useLoaderContext must be used within a LoaderProvider');
//   }
//   return context;
// };

// interface LoaderProviderProps {
//   children: ReactNode;
// }

// export const LoaderProvider: React.FC<LoaderProviderProps> = ({ children }) => {
//   const [loader, setLoader] = useState<boolean>(false);

//   return (
//     <LoaderContext.Provider value={{ loader, setLoader }}>
//       {children}
//     </LoaderContext.Provider>
//   );
// };
