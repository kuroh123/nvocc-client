import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  TruckIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, activeRole } = useAuth();
  console.log("$$$", user, activeRole);
  // Mock data - replace with actual API calls
  const stats = [
    {
      name: 'Total Bookings',
      value: '2,345',
      change: '+12%',
      changeType: 'increase',
      icon: TruckIcon,
      color: 'primary'
    },
    {
      name: 'Active Shipments',
      value: '856',
      change: '+8%',
      changeType: 'increase', 
      icon: TruckIcon,
      color: 'success'
    },
    {
      name: 'Total Customers',
      value: '1,203',
      change: '+23%',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'accent'
    },
    {
      name: 'Revenue',
      value: '$2.4M',
      change: '-2%',
      changeType: 'decrease',
      icon: CurrencyDollarIcon,
      color: 'warning'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'New booking created',
      user: 'John Smith',
      time: '2 minutes ago',
      type: 'booking'
    },
    {
      id: 2,
      action: 'Shipment status updated',
      user: 'Sarah Johnson',
      time: '15 minutes ago',
      type: 'shipment'
    },
    {
      id: 3,
      action: 'Customer account created',
      user: 'Mike Davis',
      time: '1 hour ago',
      type: 'customer'
    },
    {
      id: 4,
      action: 'Payment received',
      user: 'Emma Wilson',
      time: '2 hours ago',
      type: 'payment'
    }
  ];

  const getStatColorClasses = (color) => {
    const colorMap = {
      primary: 'bg-primary-500',
      success: 'bg-success-500',
      accent: 'bg-accent-500',
      warning: 'bg-warning-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your NVOCC operations today.
            </p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Role: {activeRole?.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 rounded-full">
              <TruckIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-md ${getStatColorClasses(stat.color)}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'increase' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {stat.changeType === 'increase' ? (
                        <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                      </span>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart Placeholder */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Booking Trends</h3>
            <ChartBarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Chart will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivities.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== recentActivities.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                          <TruckIcon className="h-4 w-4 text-white" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            {activity.action} by{' '}
                            <span className="font-medium text-gray-900">{activity.user}</span>
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <TruckIcon className="h-8 w-8 text-primary-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">New Booking</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <TruckIcon className="h-8 w-8 text-success-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Track Shipment</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <UsersIcon className="h-8 w-8 text-accent-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Add Customer</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <CurrencyDollarIcon className="h-8 w-8 text-warning-600 mr-3" />
            <span className="text-sm font-medium text-gray-900">Generate Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
