import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI, adminAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  DollarSign, 
  AlertCircle, 
  BarChart3, 
  TrendingUp,
  MapPin,
  Database
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await adminAPI.seedData();
      await fetchStats(); // Refresh stats after seeding
      alert('Sample data seeded successfully!');
    } catch (error) {
      alert('Error seeding data: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of fraud cases and accused individuals</p>
        
        {user.role === 'superadmin' && stats && stats.total_accused === 0 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-amber-600" />
              <span className="text-amber-800 font-medium">No data found</span>
            </div>
            <p className="text-amber-700 text-sm mt-1">
              Get started by seeding some sample data to explore the application.
            </p>
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 transition-colors"
            >
              {seeding ? 'Seeding...' : 'Seed Sample Data'}
            </button>
          </div>
        )}
      </div>

      {stats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow card-shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Accused</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_accused}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow card-shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-danger-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-danger-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Fraud Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.total_fraud_amount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow card-shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Fraud Types</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.top_fraud_types?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow card-shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cities Affected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.city_stats?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Fraud Types */}
            <div className="bg-white rounded-lg shadow card-shadow p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Top Fraud Types</h3>
              </div>
              <div className="space-y-3">
                {stats.top_fraud_types?.map((type, index) => (
                  <div key={type._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-600">{index + 1}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 capitalize">{type._id}</span>
                    </div>
                    <span className="text-sm text-gray-600">{type.count} cases</span>
                  </div>
                ))}
                {(!stats.top_fraud_types || stats.top_fraud_types.length === 0) && (
                  <div className="text-center text-gray-500 py-4">No fraud types data available</div>
                )}
              </div>
            </div>

            {/* City-wise Stats */}
            <div className="bg-white rounded-lg shadow card-shadow p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-gray-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Top Cities by Cases</h3>
              </div>
              <div className="space-y-3">
                {stats.city_stats?.slice(0, 5).map((city, index) => (
                  <div key={city._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-green-600">{index + 1}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{city._id}</span>
                        <div className="text-xs text-gray-500">{formatCurrency(city.total_amount)}</div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{city.count} cases</span>
                  </div>
                ))}
                {(!stats.city_stats || stats.city_stats.length === 0) && (
                  <div className="text-center text-gray-500 py-4">No city data available</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow card-shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/search"
                className="flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                <Users className="h-5 w-5 mr-2" />
                Search Accused
              </Link>
              
              {(user.role === 'admin' || user.role === 'superadmin') && (
                <Link
                  to="/manage-accused"
                  className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Manage Cases
                </Link>
              )}
              
              {user.role === 'superadmin' && (
                <Link
                  to="/manage-users"
                  className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Manage Users
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;