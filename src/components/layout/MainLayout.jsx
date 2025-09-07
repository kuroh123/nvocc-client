import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
// import MobileSidebar from './MobileSidebar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {/* <MobileSidebar open={sidebarOpen} setOpen={setSidebarOpen} /> */}
      
      {/* Desktop sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="lg:pl-72">
        {/* Header */}
        <Header setSidebarOpen={setSidebarOpen} />
        
        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
