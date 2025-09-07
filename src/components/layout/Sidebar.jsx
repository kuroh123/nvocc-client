import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  TruckIcon,
  UsersIcon,
  CogIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  ChevronDownIcon,
  ChevronRightIcon
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

const Sidebar = () => {
  const { activeRole, hasRole } = useAuth();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState(new Set());

  // Static menu structure based on roles
  const getMenusForRole = (activeRole) => {
    const allMenus = [
      { 
        id: '1', 
        name: 'dashboard', 
        displayName: 'Dashboard', 
        path: '/dashboard', 
        icon: 'dashboard',
        children: []
      },
      { 
        id: '2', 
        name: 'bookings', 
        displayName: 'Bookings', 
        path: '/bookings', 
        icon: 'booking',
        children: [
          { id: '2.1', name: 'bookings_list', displayName: 'All Bookings', path: '/bookings', icon: 'list' },
          { id: '2.2', name: 'bookings_create', displayName: 'New Booking', path: '/bookings/create', icon: 'add' }
        ]
      },
      { 
        id: '3', 
        name: 'vessels', 
        displayName: 'Vessels', 
        path: '/vessels', 
        icon: 'ship',
        children: [
          { id: '3.1', name: 'vessels_list', displayName: 'All Vessels', path: '/vessels', icon: 'list' },
          { id: '3.2', name: 'vessels_schedules', displayName: 'Schedules', path: '/vessels/schedules', icon: 'schedule' }
        ]
      },
      { 
        id: '4', 
        name: 'containers', 
        displayName: 'Containers', 
        path: '/containers', 
        icon: 'container',
        children: [
          { id: '4.1', name: 'containers_inventory', displayName: 'Inventory', path: '/containers/inventory', icon: 'inventory' }
        ]
      },
      { 
        id: '5', 
        name: 'customers', 
        displayName: 'Customers', 
        path: '/customers', 
        icon: 'people',
        children: []
      },
      { 
        id: '6', 
        name: 'reports', 
        displayName: 'Reports', 
        path: '/reports', 
        icon: 'report',
        children: []
      },
      { 
        id: '7', 
        name: 'administration', 
        displayName: 'Administration', 
        path: '/admin', 
        icon: 'admin',
        children: [
          { id: '7.1', name: 'admin_users', displayName: 'User Management', path: '/admin/users', icon: 'users' },
          { id: '7.2', name: 'admin_roles', displayName: 'Role Management', path: '/admin/roles', icon: 'roles' }
        ]
      },
      { 
        id: '8', 
        name: 'hr', 
        displayName: 'Human Resources', 
        path: '/hr', 
        icon: 'hr',
        children: [
          { id: '8.1', name: 'hr_employees', displayName: 'Employees', path: '/hr/employees', icon: 'employee' }
        ]
      }
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

  const toggleMenu = (menuId) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const renderMenuItem = (menu, level = 0) => {
    const IconComponent = iconMap[menu.icon] || HomeIcon;
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedMenus.has(menu.id);
    const active = isActive(menu.path);

    return (
      <li key={menu.id}>
        {hasChildren ? (
          // Parent menu with children
          <>
            <button
              onClick={() => toggleMenu(menu.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                active
                  ? 'bg-primary-100 text-primary-900'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              style={{ paddingLeft: `${0.75 + level * 1}rem` }}
            >
              <div className="flex items-center">
                <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
                {menu.displayName}
              </div>
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>
            {isExpanded && (
              <ul className="mt-1 space-y-1">
                {menu.children.map((child) => renderMenuItem(child, level + 1))}
              </ul>
            )}
          </>
        ) : (
          // Leaf menu item
          <Link
            to={menu.path}
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              active
                ? 'bg-primary-100 text-primary-900'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
            style={{ paddingLeft: `${0.75 + level * 1}rem` }}
          >
            <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
            {menu.displayName}
          </Link>
        )}
      </li>
    );
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 border-r border-gray-200">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center">
            <div className="bg-primary-600 p-2 rounded-lg">
              <TruckIcon className="h-6 w-6" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-bold text-gray-900">NVOCC</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
        </div>

        {/* Role Badge */}
        {activeRole && (
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-3">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-5 w-5 text-primary-600 mr-2" />
              <div>
                <p className="text-xs text-primary-600 font-medium">Active Role</p>
                <p className="text-sm font-semibold text-primary-900">
                  {activeRole.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {menus.map((menu) => renderMenuItem(menu))}
              </ul>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-4 pb-4">
          <p className="text-xs text-gray-500 text-center">
            © 2025 NVOCC Management
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
