import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const Customers = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock customers data
  const customers = [
    {
      id: 'CUST001',
      name: 'ABC Trading Co.',
      email: 'contact@abctrading.com',
      phone: '+1-555-0123',
      address: '123 Business St, New York, NY 10001',
      country: 'United States',
      status: 'active',
      totalBookings: 15,
      lastBooking: '2025-08-28',
      creditLimit: 50000
    },
    {
      id: 'CUST002',
      name: 'Global Imports Ltd.',
      email: 'info@globalimports.com',
      phone: '+44-20-7123-4567',
      address: '456 Import Ave, London, EC1A 1BB',
      country: 'United Kingdom',
      status: 'active',
      totalBookings: 32,
      lastBooking: '2025-08-30',
      creditLimit: 75000
    },
    {
      id: 'CUST003',
      name: 'Pacific Traders',
      email: 'sales@pacifictraders.com',
      phone: '+86-21-1234-5678',
      address: '789 Export Rd, Shanghai, 200001',
      country: 'China',
      status: 'inactive',
      totalBookings: 8,
      lastBooking: '2025-07-15',
      creditLimit: 25000
    },
    {
      id: 'CUST004',
      name: 'Euro Logistics',
      email: 'orders@eurologistics.de',
      phone: '+49-40-123-4567',
      address: '321 Logistics Blvd, Hamburg, 20095',
      country: 'Germany',
      status: 'active',
      totalBookings: 28,
      lastBooking: '2025-08-29',
      creditLimit: 60000
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: 'bg-success-100 text-success-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-danger-100 text-danger-800'
    };
    
    return statusConfig[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <div className="bg-accent-500 p-3 rounded-lg mr-4">
              <UserCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-600">Manage your customer database</p>
            </div>
          </div>
          {hasPermission('customers:create') && (
            <div className="mt-4 sm:mt-0">
              <button className="btn btn-primary flex items-center">
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Customer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-md bg-success-500">
                <UserCircleIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                <dd className="text-2xl font-semibold text-gray-900">{customers.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-md bg-primary-500">
                <UserCircleIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Customers</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {customers.filter(c => c.status === 'active').length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-md bg-accent-500">
                <UserCircleIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Credit Limit</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(customers.reduce((sum, c) => sum + c.creditLimit, 0))}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers..."
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Customers ({filteredCustomers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserCircleIcon className="h-6 w-6 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{customer.country}</div>
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {customer.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.totalBookings} total</div>
                    <div className="text-sm text-gray-500">Last: {customer.lastBooking}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(customer.creditLimit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                        title="View"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {hasPermission('customers:edit') && (
                        <button
                          className="p-2 text-gray-400 hover:text-accent-600 transition-colors duration-200"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission('customers:delete') && (
                        <button
                          className="p-2 text-gray-400 hover:text-danger-600 transition-colors duration-200"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Get started by adding your first customer.'
              }
            </p>
            {hasPermission('customers:create') && !searchTerm && (
              <div className="mt-6">
                <button className="btn btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Customer
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
