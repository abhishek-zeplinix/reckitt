// 'use client';

// import { useState } from 'react';
// import SupplierDirectory from '@/components/SupplierDirectory';
// import { withAuth } from '@/layout/context/authContext';
// import DashboardContent from '@/components/dashboard/DashboardContent';
// import { Button } from 'primereact/button';


// const Dashboard = () => {
//     const [activeTab, setActiveTab] = useState('dashboard');
//     const [filtersVisible, setFiltersVisible] = useState(false);
  
//     const tabs = [
//       { id: 'dashboard', label: 'Dashboard', icon: 'pi pi-th-large' },
//       { id: 'supplier', label: 'Supplier', icon: 'pi pi-box' },
//       { id: 'evaluated', label: 'Evaluated', icon: 'pi pi-box' },
//       { id: 'approved', label: 'Approved', icon: 'pi pi-box' },
//       { id: 'completed', label: 'Completed', icon: 'pi pi-box' }
//     ];
  
//     const renderContent = () => {
//       switch (activeTab) {
//         case 'dashboard':
//           return <DashboardContent filtersVisible={filtersVisible} setFiltersVisible={setFiltersVisible} />;
//         case 'supplier':
//           return <SupplierDirectory />;
//         case 'evaluated':
//           return <SupplierDirectory />;
//         case 'approved':
//           return <SupplierDirectory />;
//         case 'completed':
//           return <SupplierDirectory />;
//         default:
//           return <DashboardContent filtersVisible={filtersVisible} setFiltersVisible={setFiltersVisible}/>;
//       }
//     };
  
//     return (
//       <div className="p-1">
//         {/* Navigation Bar */}
//         <div>
//           <div className="flex align-items-center justify-content-between">
//             <div className="inline-flex gap-2 p-2 border border-1 border-round-xl bg-white shadow-sm">
//               {tabs.map(tab => (
//                 <Button
//                   key={tab.id}
//                   label={tab.label}
//                   icon={tab.icon}
//                   className={`p-button-text ${
//                     activeTab === tab.id 
//                       ? 'bgActiveBtn text-white' 
//                       : 'bg-transparent text-gray-700'
//                   }`}
//                   onClick={() => setActiveTab(tab.id)}
//                 />
//               ))}
//             </div>
  
//             <div className={`${activeTab !== 'dashboard' ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
//               <Button
//                 label="Filters"
//                 icon="pi pi-filter"
//                 className="p-button-text bgActiveBtn text-white"
//                 onClick={() => setFiltersVisible(!filtersVisible)}
//               />
              
//             </div>
//           </div>
//         </div>
  
//         {/* Dynamic Content */}
//         <div className="mt-3">
//           {renderContent()}
//         </div>
//       </div>
//     );
//   };
  

// export default withAuth(Dashboard, undefined, "view_dashboard");
'use client';

import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, useState } from 'react';
import SupplierDirectory from '@/components/SupplierDirectory';
import { withAuth } from '@/layout/context/authContext';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filtersVisible, setFiltersVisible] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'pi pi-th-large' },
    { id: 'supplier', label: 'Supplier', icon: 'pi pi-box' },
    { id: 'evaluated', label: 'Evaluated', icon: 'pi pi-box' },
    { id: 'approved', label: 'Approved', icon: 'pi pi-box' },
    { id: 'completed', label: 'Completed', icon: 'pi pi-box' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent filtersVisible={filtersVisible} setFiltersVisible={setFiltersVisible} />;
      case 'supplier':
        return <SupplierDirectory />;
      case 'evaluated':
        return <SupplierDirectory />;
      case 'approved':
        return <SupplierDirectory />;
      case 'completed':
        return <SupplierDirectory />;
      default:
        return <DashboardContent filtersVisible={filtersVisible} setFiltersVisible={setFiltersVisible} />;
    }
  };

  // Custom template for dropdown items
  const itemTemplate = (option: { icon: string | undefined; label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }) => {
    return (
      <div className="flex align-items-center gap-2">
        <i className={option.icon}></i>
        <span>{option.label}</span>
      </div>
    );
  };

  // Custom template for selected dropdown item
  const valueTemplate = (option: { icon: string | undefined; label: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }) => {
    if (!option) return <span>Select a Tab</span>; // Handle case when no option is selected
    return (
      <div className="flex align-items-center gap-2">
        <i className={option.icon}></i>
        <span className="text-white">{option.label}</span>
      </div>
    );
  };

  return (
    <div className="p-1">
      {/* Navigation Bar */}
      <div>
        <div className="flex align-items-center justify-content-between">
          {/* Tabs for Desktop */}
          <div className="hidden md:inline-flex gap-2 p-2 border border-1 border-round-xl bg-white shadow-sm">
            {tabs.map(tab => (
              <Button
                key={tab.id}
                label={tab.label}
                icon={tab.icon}
                className={`p-button-text ${
                  activeTab === tab.id 
                    ? 'bgActiveBtn text-white' 
                    : 'bg-transparent text-gray-700'
                }`}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          {/* Dropdown for Mobile */}
          <div className="md:hidden">
            <Dropdown
              value={tabs.find(tab => tab.id === activeTab)} // Set the selected tab object
              options={tabs}
              onChange={(e) => setActiveTab(e.value.id)} // Update activeTab when dropdown changes
              optionLabel="label"
              itemTemplate={itemTemplate} // Custom template for dropdown items
              valueTemplate={valueTemplate} // Custom template for selected item
              placeholder="Select a Tab"
              className="p-dropdown-sm bgActiveBtn text-white " 
              style={{ 
                border: 'none' ,
                fontWeight: 'bold'
              }}
            />
          </div>

          <div className={`${activeTab !== 'dashboard' ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
            <Button
              label="Filters"
              icon="pi pi-filter"
              className="p-button-text bgActiveBtn text-white"
              onClick={() => setFiltersVisible(!filtersVisible)}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="mt-3">
        {renderContent()}
      </div>
    </div>
  );
};

export default withAuth(Dashboard, undefined, "view_dashboard");