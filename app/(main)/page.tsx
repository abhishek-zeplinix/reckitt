'use client';

import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, useState } from 'react';
import SupplierDirectory from '@/components/SupplierDirectory';
import { useAuth, withAuth } from '@/layout/context/authContext';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import StatusAdminSpecific from '@/components/dashboard/StatusAdminSpecific';
import StatusRoleSpecific from '@/components/dashboard/StatusRoleSpecific'; // Assuming this component exists

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const { isApprover, isEvaluator, isSuperAdmin } = useAuth();

  // Define tabs based on user roles
  const getTabs = () => {
    const baseTabs = [
      { id: 'dashboard', label: 'Dashboard', icon: 'pi pi-th-large' },
      { id: 'supplier', label: 'Supplier', icon: 'pi pi-box' },
    ];

    if (isSuperAdmin()) {
      return [
        ...baseTabs,
        { id: 'evaluated', label: 'Evaluated', icon: 'pi pi-pencil' },
        { id: 'completed', label: 'Completed', icon: 'pi pi-check-circle' },
        { id: 'rejected', label: 'Rejected', icon: 'pi pi-question-circle' },
      ];
    } else if (isApprover()) {
      return [
        ...baseTabs,
        // { id: 'completed', label: 'Completed', icon: 'pi pi-check-circle' },
        { id: 'approved', label: 'Approved', icon: 'pi pi-check-circle' },
        { id: 'rejected', label: 'Rejected', icon: 'pi pi-question-circle' },
      ];
    } else if (isEvaluator()) {
      return [
        ...baseTabs,
        { id: 'evaluated', label: 'Evaluated', icon: 'pi pi-pencil' },
      ];
    }

    return baseTabs;
  };

  const tabs = getTabs();

  // Set active tab to first available tab if current tab is not available for the user's role
  useState(() => {
    if (!tabs.some(tab => tab.id === activeTab)) {
      setActiveTab(tabs[0]?.id || 'dashboard');
    }
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent filtersVisible={filtersVisible} setFiltersVisible={setFiltersVisible} />;
      case 'supplier':
        return <SupplierDirectory />;
      case 'evaluated':
        return isSuperAdmin() ? (
          <StatusAdminSpecific status="evaluated" />
        ) : (
          <StatusRoleSpecific status="evaluated" />
        );
      case 'rejected':
        return isApprover() ? (
          <StatusRoleSpecific status="rejected" />
        ) : (
          <StatusAdminSpecific status="rejected" />
        );
      case 'completed':
        return isApprover() ? (
          <StatusRoleSpecific status="approved" />
        ) : (
          <StatusAdminSpecific status="approved" />
        );
      case 'approved':
        return isApprover() ? (
          <StatusRoleSpecific status="approved" />
        ) : (
          <StatusAdminSpecific status="approved" />
        );
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
    if (!option) return <span>Select a Tab</span>;
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
                className={`p-button-text ${activeTab === tab.id
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
                border: 'none',
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