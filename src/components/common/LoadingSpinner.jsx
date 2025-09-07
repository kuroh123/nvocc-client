import React from 'react';
import { TruckIcon } from '@heroicons/react/24/solid';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <TruckIcon className="h-6 w-6 text-primary-600" />
          </div>
        </div>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
