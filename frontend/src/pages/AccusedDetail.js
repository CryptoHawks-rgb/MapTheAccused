import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { accusedAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import MapComponent from '../components/MapComponent';
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  DollarSign, 
  AlertCircle, 
  User, 
  Calendar,
  Edit,
  Trash2,
  Shield
} from 'lucide-react';

const AccusedDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accused, setAccused] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccusedDetail();
  }, [id]);

  const fetchAccusedDetail = async () => {
    try {
      const response = await accusedAPI.getById(id);
      setAccused(response.data);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to fetch accused details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this accused record? This action cannot be undone.')) {
      try {
        await accusedAPI.delete(id);
        alert('Accused record deleted successfully');
        navigate('/search');
      } catch (error) {
        alert('Error deleting record: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-danger-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            to="/search"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  if (!accused) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accused Not Found</h2>
          <p className="text-gray-600 mb-4">The requested accused record could not be found.</p>
          <Link
            to="/search"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link
            to="/search"
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Accused Details</h1>
        </div>

        {(user.role === 'admin' || user.role === 'superadmin') && (
          <div className="flex space-x-2">
            <Link
              to={`/manage-accused?edit=${accused.accused_id}`}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            
            {user.role === 'superadmin' && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 bg-danger-600 text-white rounded-md hover:bg-danger-700 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow card-shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-lg font-semibold text-gray-900">{accused.full_name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Numbers</label>
                <div className="space-y-1">
                  {accused.phone_numbers?.map((phone, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{phone}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-900">{accused.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Case Information */}
          <div className="bg-white rounded-lg shadow card-shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case ID</label>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900 font-medium">{accused.case_id}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fraud Amount</label>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-danger-500" />
                  <span className="text-xl font-bold text-danger-600">
                    {formatCurrency(accused.fraud_amount)}
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Police Station</label>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900">{accused.police_station}</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">FIR Details</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{accused.fir_details}</p>
              </div>

              {accused.tags && accused.tags.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fraud Types</label>
                  <div className="flex flex-wrap gap-2">
                    {accused.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Information */}
          <div className="bg-white rounded-lg shadow card-shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Created At</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(accused.created_at)}</span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Created By</label>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{accused.created_by}</span>
                </div>
              </div>

              {accused.updated_at && (
                <>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Last Updated</label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(accused.updated_at)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Updated By</label>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{accused.updated_by}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Map Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow card-shadow p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
            
            {accused.latitude && accused.longitude ? (
              <div className="h-80 mb-4">
                <MapComponent
                  accused={[accused]}
                  selectedAccused={accused}
                />
              </div>
            ) : (
              <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <MapPin className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-gray-600">Location not available</p>
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Coordinates:</span>
                <div className="text-gray-600">
                  {accused.latitude && accused.longitude ? (
                    `${accused.latitude.toFixed(6)}, ${accused.longitude.toFixed(6)}`
                  ) : (
                    'Not available'
                  )}
                </div>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Full Address:</span>
                <div className="text-gray-600">{accused.address}</div>
              </div>
            </div>

            {/* Photo Display - Below Map Coordinates */}
            {accused.profile_photo && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Profile Photo</h3>
                <div className="flex justify-center">
                  <div className="w-48 h-48 rounded-lg overflow-hidden bg-gray-100 shadow-md">
                    <img
                      src={accused.profile_photo.startsWith('/api/uploads/') 
                        ? `${process.env.REACT_APP_BACKEND_URL}${accused.profile_photo}` 
                        : accused.profile_photo
                      }
                      alt={`${accused.full_name} profile`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccusedDetail;