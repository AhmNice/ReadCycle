// components/Dashboard.jsx
import React, { useState } from 'react';
import Sidebar from '../components/SideBar';
import DashboardHeader from '../components/DashboardHeader';
import StatsGrid from '../components/StatsGrid';
import BookListings from '../components/BookListings';


const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  

  return (
    <div className="flex w-full h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 `}>
        <DashboardHeader />
        
        <main className="flex-1 w-full overflow-y-auto p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Hassy! 👋</h1>
            <p className="text-gray-600">Here's what's happening with your books today.</p>
          </div>

          {/* Stats Grid */}

          <div className="grid lg:grid-cols-1 gap-6 mt-6">
            {/* Recent Activity */}
            
            {/* Book Listings */}
            <BookListings />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;