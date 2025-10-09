import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  TruckIcon,
  UsersIcon,
  CogIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

// Icon mapping for menu items
const iconMap = {
  home: HomeIcon,
  ship: TruckIcon,
  truck: TruckIcon,
  users: UsersIcon,
  'user-check': UsersIcon,
  anchor: BuildingOfficeIcon,
  warehouse: BuildingStorefrontIcon,
  shield: ShieldCheckIcon,
  'file-text': DocumentTextIcon,
  settings: CogIcon
};

const MobileSidebar = ({ open, setOpen }) => {
  const { activeRole, getRoleDisplayName } = useAuth();
  const location = useLocation();

  // Static menu structure based on roles (same as Sidebar)
  const getMenusForRole = (activeRole) => {
    const allMenus = [
      { id: '1', name: 'dashboard', displayName: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
      { id: '2', name: 'bookings', displayName: 'Bookings', path: '/bookings', icon: 'booking' },
      { id: '3', name: 'vessels', displayName: 'Vessels', path: '/vessels', icon: 'ship' },
      { id: '4', name: 'containers', displayName: 'Containers', path: '/containers', icon: 'container' },
      { id: '5', name: 'customers', displayName: 'Customers', path: '/customers', icon: 'people' },
      { id: '6', name: 'reports', displayName: 'Reports', path: '/reports', icon: 'report' },
      { id: '7', name: 'administration', displayName: 'Administration', path: '/admin', icon: 'admin' },
      { id: '8', name: 'hr', displayName: 'Human Resources', path: '/hr', icon: 'hr' }
    ];

    // Filter menus based on active role
    if (activeRole === 'ADMIN') {
      return allMenus;
    } else if (activeRole === 'CUSTOMER') {
      return allMenus.filter(menu => ['dashboard', 'bookings'].includes(menu.name));
    } else if (activeRole === 'PORT') {
      return allMenus.filter(menu => ['dashboard', 'vessels'].includes(menu.name));
    } else if (activeRole === 'DEPOT') {
      return allMenus.filter(menu => ['dashboard', 'containers'].includes(menu.name));
    } else if (activeRole === 'SALES') {
      return allMenus.filter(menu => ['dashboard', 'bookings', 'customers', 'reports'].includes(menu.name));
    } else if (activeRole === 'MASTER_PORT') {
      return allMenus.filter(menu => ['dashboard', 'vessels'].includes(menu.name));
    } else if (activeRole === 'HR') {
      return allMenus.filter(menu => ['dashboard', 'hr', 'reports'].includes(menu.name));
    }
    
    return [allMenus[0]]; // Dashboard only for unknown roles
  };

  const menus = getMenusForRole(activeRole);

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/80 z-50 lg:hidden"
        onClick={() => setOpen(false)}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 lg:hidden">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-primary-600 p-2 rounded-lg">
                <TruckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900">NVOCC</h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </div>
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700"
              onClick={() => setOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Role Badge */}
          {activeRole && (
            <div className="mx-6 mt-4 bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-3">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 text-primary-600 mr-2" />
                <div>
                  <p className="text-xs text-primary-600 font-medium">Active Role</p>
                  <p className="text-sm font-semibold text-primary-900">
                    {getRoleDisplayName(activeRole)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-6 py-4">
            <ul className="space-y-1">
              {menus.map((menu) => {
                const IconComponent = iconMap[menu.icon] || HomeIcon;
                const active = isActive(menu.path);

                return (
                  <li key={menu.id}>
                    <Link
                      to={menu.path}
                      onClick={() => setOpen(false)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        active
                          ? 'bg-primary-100 text-primary-900'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
                      {menu.displayName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-4 pb-4 px-6">
            <p className="text-xs text-gray-500 text-center">
              © 2025 NVOCC Management
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
