// components/StatsGrid.jsx
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  TrendingUp,
  RefreshCw
} from 'lucide-react';

const StatsGrid = ({ onStatClick, autoRefresh = true }) => {
  const [stats, setStats] = useState([
    {
      id: 'books-listed',
      icon: BookOpen,
      label: 'Books Listed',
      value: '12',
      change: '+2 this month',
      color: 'blue',
      description: 'Active book listings'
    },
    {
      id: 'books-bought',
      icon: ShoppingCart,
      label: 'Books Bought',
      value: '8',
      change: '+1 this month',
      color: 'green',
      description: 'Books purchased'
    },
    {
      id: 'total-saved',
      icon: DollarSign,
      label: 'Total Saved',
      value: '$240',
      change: '+$30 this month',
      color: 'purple',
      description: 'Compared to new prices'
    },
    {
      id: 'connections',
      icon: Users,
      label: 'Connections',
      value: '24',
      change: '+5 this month',
      color: 'orange',
      description: 'Active community members'
    }
  ]);

  const [refreshing, setRefreshing] = useState(false);

  const colorConfig = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      icon: 'text-blue-600',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      icon: 'text-green-600',
      border: 'border-green-200'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      icon: 'text-purple-600',
      border: 'border-purple-200'
    },
    orange: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      icon: 'text-orange-600',
      border: 'border-orange-200'
    }
  };

  // Simulate data refresh
  const refreshData = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setStats(prev => prev.map(stat => ({
      ...stat,
      value: String(Number(stat.value.replace('$', '')) + Math.floor(Math.random() * 3))
    })));
    
    setRefreshing(false);
  };

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleStatClick = (stat) => {
    onStatClick?.(stat);
  };

  const handleRefresh = () => {
    refreshData();
  };

  return (
    <div className="mb-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            onClick={() => handleStatClick(stat)}
            className={`bg-white rounded-lg md:rounded-xl  shadow-sm border ${
              colorConfig[stat.color].border
            } p-4 md:p-6 cursor-pointer transition duration-200 hover:shadow-md group relative overflow-hidden`}
          >
            {/* Background Pattern - Hidden on mobile */}
            <div className={`hidden md:block absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 opacity-5 ${
              colorConfig[stat.color].bg
            } rounded-full -mr-4 md:-mr-6 -mt-4 md:-mt-6 group-hover:scale-150 transition duration-500`}></div>

            <div className="flex items-center gap-6 justify-between">
              {/* Icon */}
              <div className={`p-2 md:p-2 rounded-lg md:rounded-xl ${
                colorConfig[stat.color].iconBg
              } transition duration-300`}>
                <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${
                  colorConfig[stat.color].icon
                }`} />
              </div>

              {/* Content */}
              <div className="flex-1 ml-4 md:ml-0 text-right md:text-left">
                <p className="text-lg md:text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs md:text-sm font-medium text-gray-600 mt-1">{stat.label}</p>
                <p className="text-xs text-green-600 mt-1 hidden sm:block">{stat.change}</p>
              </div>
            </div>

            {/* Change indicator - Only show on mobile in a compact way */}
            <div className="sm:hidden mt-2">
              <p className="text-xs text-green-600">{stat.change}</p>
            </div>

            {/* Loading Overlay */}
            {refreshing && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg md:rounded-xl">
                <RefreshCw className="h-5 w-5 md:h-6 md:w-6 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Bar - Hidden on mobile, shown on tablet and up */}
      <div className="hidden md:block mt-6 bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Overall positive trend</p>
              <p className="text-sm text-gray-600">All metrics showing growth this month</p>
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Updating...' : 'Update stats'}</span>
          </button>
        </div>
      </div>

      {/* Mobile refresh button - Only show on mobile */}
      <div className="md:hidden mt-4 flex justify-center">
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Updating...' : 'Refresh Stats'}</span>
        </button>
      </div>
    </div>
  );
};

export default StatsGrid;