import React, { useState, useRef, useEffect } from 'react';
import { useAuth, ROLE_TYPES } from '../../contexts/AuthContext';
import { 
  BellIcon, 
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  CogIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const Header = ({ setSidebarOpen }) => {
  const { user, roles, activeRole, logout, switchRole, getAvailableRoles, getRoleDisplayName } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [notifications] = useState(3); // Mock notification count
  const [availableRoles, setAvailableRoles] = useState([]);
  
  const profileRef = useRef(null);
  const roleRef = useRef(null);

  // Fetch available roles when component mounts
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getAvailableRoles();
        setAvailableRoles(rolesData.roles || []);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };

    if (user) {
      fetchRoles();
    }
  }, [user, getAvailableRoles]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setShowRoleMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRoleSwitch = async (roleName) => {
    try {
      await switchRole(roleName);
      setShowRoleMenu(false);
      // Refresh available roles after switching
      const rolesData = await getAvailableRoles();
      setAvailableRoles(rolesData.roles || []);
    } catch (error) {
      console.error('Role switch failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search bar placeholder */}
        <div className="flex flex-1 items-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Role Switcher */}
          {roles && roles.length > 1 && (
            <div className="relative" ref={roleRef}>
              <button
                type="button"
                className="flex items-center gap-x-2 rounded-md bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors duration-200"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
              >
                <span>Role: {getRoleDisplayName(activeRole)}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-3">
                    <p className="text-sm text-gray-900 font-medium">Switch Role</p>
                    <p className="text-sm text-gray-500">Select a different role</p>
                  </div>
                  <div className="py-1">
                    {availableRoles.map((role) => (
                      <button
                        key={role.name}
                        onClick={() => handleRoleSwitch(role.name)}
                        className={`group flex w-full items-center px-4 py-2 text-sm transition-colors duration-200 ${
                          activeRole === role.name
                            ? 'bg-primary-100 text-primary-900'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        {role.displayName}
                        {activeRole === role.name && (
                          <span className="ml-auto text-primary-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          {/* <button
            type="button"
            className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-danger-500 flex items-center justify-center text-xs font-medium text-white">
                {notifications}
              </span>
            )}
          </button> */}

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              className="flex items-center gap-x-2 -m-1.5 p-1.5"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <span className="sr-only">Open user menu</span>
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-2 text-sm font-semibold leading-6">
                  {user?.firstName || user?.email}
                </span>
                <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" />
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 z-10 mt-2.5 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-3">
                  <p className="text-sm text-gray-900 font-medium">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email
                    }
                  </p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <div className="py-1">
                  <a
                    href="#"
                    className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <UserIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Your profile
                  </a>
                  <a
                    href="#"
                    className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <CogIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Settings
                  </a>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
