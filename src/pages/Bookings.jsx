import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

const Bookings = () => {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock bookings data
  const bookings = [
    {
      id: 'BKG001',
      customer: 'ABC Trading Co.',
      origin: 'Shanghai',
      destination: 'Los Angeles',
      status: 'confirmed',
      vessel: 'MSC Diana',
      etd: '2025-09-15',
      eta: '2025-10-02',
      containers: 2,
      type: 'FCL'
    },
    {
      id: 'BKG002',
      customer: 'Global Imports Ltd.',
      origin: 'Rotterdam',
      destination: 'New York',
      status: 'in-transit',
      vessel: 'Ever Given',
      etd: '2025-09-10',
      eta: '2025-09-28',
      containers: 5,
      type: 'FCL'
    },
    {
      id: 'BKG003',
      customer: 'Pacific Traders',
      origin: 'Hong Kong',
      destination: 'Long Beach',
      status: 'pending',
      vessel: 'COSCO Glory',
      etd: '2025-09-20',
      eta: '2025-10-08',
      containers: 1,
      type: 'LCL'
    },
    {
      id: 'BKG004',
      customer: 'Euro Logistics',
      origin: 'Hamburg',
      destination: 'Miami',
      status: 'delivered',
      vessel: 'Maersk Estonia',
      etd: '2025-08-25',
      eta: '2025-09-15',
      containers: 3,
      type: 'FCL'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: 'bg-warning-100 text-warning-800',
      confirmed: 'bg-primary-100 text-primary-800',
      'in-transit': 'bg-accent-100 text-accent-800',
      delivered: 'bg-success-100 text-success-800',
      cancelled: 'bg-danger-100 text-danger-800'
    };
    
    return statusConfig[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.destination.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <div className="bg-primary-500 p-3 rounded-lg mr-4">
              <TruckIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
              <p className="text-gray-600">Manage and track your shipping bookings</p>
            </div>
          </div>
          {hasPermission('bookings:create') && (
            <div className="mt-4 sm:mt-0">
              <button className="btn btn-primary flex items-center">
                <PlusIcon className="h-5 w-5 mr-2" />
                New Booking
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search bookings..."
              className="input pl-10 w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input w-auto"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Bookings ({filteredBookings.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vessel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ETD/ETA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Containers
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
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{booking.origin}</div>
                      <div className="text-gray-500">↓</div>
                      <div className="font-medium">{booking.destination}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.vessel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>ETD: {booking.etd}</div>
                      <div>ETA: {booking.eta}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <span className="font-medium">{booking.containers}</span>
                      <span className="text-gray-500 ml-1">({booking.type})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(booking.status)}`}>
                      {booking.status}
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
                      {hasPermission('bookings:edit') && (
                        <button
                          className="p-2 text-gray-400 hover:text-accent-600 transition-colors duration-200"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission('bookings:delete') && (
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

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating a new booking.'
              }
            </p>
            {hasPermission('bookings:create') && !searchTerm && filterStatus === 'all' && (
              <div className="mt-6">
                <button className="btn btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  New Booking
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
