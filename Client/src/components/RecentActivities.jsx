// components/RecentActivity.jsx
import React, { useState } from 'react';
import { 
  BookOpen, 
  MessageCircle, 
  UserCheck, 
  Clock, 
  DollarSign,
  CheckCircle,
  XCircle,
  Calendar,
  TrendingUp,
  Filter,
  MoreVertical,
  Eye,
  Archive,
  Bell,
  ExternalLink
} from 'lucide-react';

const RecentActivity = ({ onActivityClick, showFilters = true }) => {
  const [activities, setActivities] = useState([
    {
      id: 1,
      icon: MessageCircle,
      type: 'message',
      title: 'New message from Sarah',
      description: 'Interested in your Calculus textbook',
      time: '5 min ago',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      color: 'blue',
      status: 'unread',
      priority: 'high',
      user: {
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
        course: 'Mathematics'
      }
    },
    {
      id: 2,
      icon: BookOpen,
      type: 'sale',
      title: 'Book sold!',
      description: 'Introduction to Psychology - $25',
      time: '2 hours ago',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      color: 'green',
      status: 'read',
      priority: 'medium',
      amount: 25,
      book: {
        title: 'Introduction to Psychology',
        condition: 'Like New'
      }
    },
    {
      id: 3,
      icon: UserCheck,
      type: 'connection',
      title: 'New connection',
      description: 'Mike from Business School',
      time: '1 day ago',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      color: 'purple',
      status: 'read',
      priority: 'low',
      user: {
        name: 'Mike Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        major: 'Business Administration'
      }
    },
    {
      id: 4,
      icon: Clock,
      type: 'reminder',
      title: 'Meeting reminder',
      description: 'Book exchange tomorrow at Library',
      time: '2 days ago',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      color: 'orange',
      status: 'read',
      priority: 'medium',
      action: 'schedule'
    },
    {
      id: 5,
      icon: DollarSign,
      type: 'payment',
      title: 'Payment received',
      description: '$35 for Data Structures book',
      time: '3 days ago',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      color: 'green',
      status: 'read',
      priority: 'high',
      amount: 35
    },
    {
      id: 6,
      icon: CheckCircle,
      type: 'completion',
      title: 'Exchange completed',
      description: 'Chemistry textbook successfully exchanged',
      time: '4 days ago',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      color: 'green',
      status: 'read',
      priority: 'low'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [expandedActivity, setExpandedActivity] = useState(null);

  const colorConfig = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', light: 'bg-blue-50' },
    green: { bg: 'bg-green-100', text: 'text-green-600', light: 'bg-green-50' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', light: 'bg-purple-50' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', light: 'bg-orange-50' }
  };

  const typeConfig = {
    message: { label: 'Messages', count: activities.filter(a => a.type === 'message').length },
    sale: { label: 'Sales', count: activities.filter(a => a.type === 'sale').length },
    connection: { label: 'Connections', count: activities.filter(a => a.type === 'connection').length },
    reminder: { label: 'Reminders', count: activities.filter(a => a.type === 'reminder').length },
    payment: { label: 'Payments', count: activities.filter(a => a.type === 'payment').length },
    completion: { label: 'Completions', count: activities.filter(a => a.type === 'completion').length }
  };

  const filters = [
    { key: 'all', label: 'All Activities', count: activities.length },
    ...Object.entries(typeConfig).map(([key, value]) => ({
      key,
      label: value.label,
      count: value.count
    }))
  ];

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  const unreadCount = activities.filter(activity => activity.status === 'unread').length;

  const handleActivityClick = (activity) => {
    // Mark as read
    if (activity.status === 'unread') {
      setActivities(prev => 
        prev.map(a => a.id === activity.id ? { ...a, status: 'read' } : a)
      );
    }
    
    setExpandedActivity(expandedActivity === activity.id ? null : activity.id);
    onActivityClick?.(activity);
  };

  const markAllAsRead = () => {
    setActivities(prev => 
      prev.map(activity => ({ ...activity, status: 'read' }))
    );
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'medium':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  const getActionButton = (activity) => {
    switch (activity.type) {
      case 'message':
        return (
          <button className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition duration-200">
            Reply
          </button>
        );
      case 'reminder':
        return (
          <button className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 transition duration-200">
            Reschedule
          </button>
        );
      case 'sale':
        return (
          <button className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition duration-200">
            View Details
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Bell className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-600">
                {unreadCount > 0 
                  ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                  : 'All caught up!'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Mark all read</span>
              </button>
            )}
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition duration-200">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex space-x-1 overflow-x-auto pb-2">
            {filters.map((filterItem) => (
              <button
                key={filterItem.key}
                onClick={() => setFilter(filterItem.key)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition duration-200 ${
                  filter === filterItem.key
                    ? 'bg-green-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{filterItem.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  filter === filterItem.key
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {filterItem.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Activities List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No activities found</p>
            <p className="text-sm text-gray-400 mt-1">Activities will appear here as they happen</p>
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => handleActivityClick(activity)}
              className={`border-b border-gray-100 last:border-b-0 transition duration-200 cursor-pointer ${
                activity.status === 'unread' ? 'bg-blue-50' : 'hover:bg-gray-50'
              } ${expandedActivity === activity.id ? 'bg-gray-50' : ''}`}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${colorConfig[activity.color].bg} flex-shrink-0`}>
                    <activity.icon className={`h-4 w-4 ${colorConfig[activity.color].text}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className={`text-sm font-medium ${
                            activity.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {activity.title}
                          </p>
                          {activity.status === 'unread' && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                          {getPriorityIcon(activity.priority)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        
                        {/* Expanded Details */}
                        {expandedActivity === activity.id && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                            {activity.user && (
                              <div className="flex items-center space-x-2 mb-2">
                                <img
                                  src={activity.user.avatar}
                                  alt={activity.user.name}
                                  className="w-6 h-6 rounded-full"
                                />
                                <span className="text-sm text-gray-700">{activity.user.name}</span>
                                {activity.user.course && (
                                  <span className="text-xs text-gray-500">• {activity.user.course}</span>
                                )}
                              </div>
                            )}
                            {activity.amount && (
                              <div className="flex items-center space-x-1 text-sm text-gray-700">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                <span>Amount: ${activity.amount}</span>
                              </div>
                            )}
                            {getActionButton(activity)}
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{activity.time}</span>
                          <div className="flex items-center space-x-2">
                            {activity.amount && (
                              <span className="text-xs font-medium text-green-600">
                                ${activity.amount}
                              </span>
                            )}
                            <button className="text-xs text-gray-400 hover:text-gray-600">
                              <Eye className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <button className="w-full flex items-center justify-center space-x-2 text-green-600 hover:text-green-700 font-medium py-2 transition duration-200">
          <ExternalLink className="h-4 w-4" />
          <span>View All Activity</span>
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;