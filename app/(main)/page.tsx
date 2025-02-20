'use client';

import { useState } from 'react';
import SupplierDirectory from '@/components/SupplierDirectory';
import { withAuth } from '@/layout/context/authContext';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { Button } from 'primereact/button';


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
          return <DashboardContent filtersVisible={filtersVisible} setFiltersVisible={setFiltersVisible}/>;
      }
    };
  
    return (
      <div className="p-1">
        {/* Navigation Bar */}
        <div>
          <div className="flex align-items-center justify-content-between">
            <div className="inline-flex gap-2 p-2 border border-1 border-round-xl bg-white shadow-sm">
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
