import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { accusedAPI } from '../utils/api';
import MapComponent from '../components/MapComponent';
import { 
  Search as SearchIcon, 
  Filter, 
  MapPin, 
  Phone, 
  User, 
  DollarSign,
  Eye,
  Calendar,
  AlertCircle
} from 'lucide-react';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [results, setResults] = useState([]);
  const [allAccused, setAllAccused] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAccused, setSelectedAccused] = useState(null);
  const [filterAmount, setFilterAmount] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    fetchAllAccused();
  }, []);

  const fetchAllAccused = async () => {
    try {
      const response = await accusedAPI.getAll();
      setAllAccused(response.data);
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching accused:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setResults(allAccused);
      return;
    }

    setLoading(true);
    try {
      const response = await accusedAPI.search(searchQuery, searchType);
      setResults(response.data);
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const applyFilters = () => {
    let filtered = searchQuery.trim() ? results : allAccused;

    if (filterAmount) {
      const amount = parseFloat(filterAmount);
      filtered = filtered.filter(accused => accused.fraud_amount >= amount);
    }

    if (filterCity) {
      filtered = filtered.filter(accused => 
        accused.police_station.toLowerCase().includes(filterCity.toLowerCase()) ||
        accused.address.toLowerCase().includes(filterCity.toLowerCase())
      );
    }

    if (filterTag) {
      filtered = filtered.filter(accused => 
        accused.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase()))
      );
    }

    setResults(filtered);
  };

  const clearFilters = () => {
    setFilterAmount('');
    setFilterCity('');
    setFilterTag('');
    setResults(searchQuery.trim() ? results : allAccused);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const handleMarkerClick = (accused) => {
    setSelectedAccused(accused);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Accused</h1>
        <p className="text-gray-600">Search and locate fraud suspects by name, phone, or address</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow card-shadow p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, address, or case ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Fields</option>
              <option value="name">Name</option>
              <option value="phone">Phone</option>
              <option value="address">Address</option>
            </select>
            
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Fraud Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g., 100000"
                value={filterAmount}
                onChange={(e) => setFilterAmount(e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City/Police Station</label>
              <input
                type="text"
                placeholder="e.g., Mumbai, Delhi"
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fraud Type</label>
              <input
                type="text"
                placeholder="e.g., loan fraud, crypto scam"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div className="mt-3 flex gap-2">
            <button
              onClick={applyFilters}
              className="px-4 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Results List */}
        <div className="bg-white rounded-lg shadow card-shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Search Results ({results.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              results.map((accused) => (
                <div key={accused.accused_id} className="p-6 hover:bg-gray-50 transition-colors search-result-item">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {accused.full_name}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{accused.phone_numbers?.join(', ')}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-2">{accused.address}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium text-danger-600">
                            {formatCurrency(accused.fraud_amount)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4" />
                          <span>{accused.case_id} - {accused.police_station}</span>
                        </div>
                      </div>
                      
                      {accused.tags && accused.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {accused.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex flex-col space-y-2">
                      <Link
                        to={`/accused/${accused.accused_id}`}
                        className="inline-flex items-center px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      
                      <button
                        onClick={() => handleMarkerClick(accused)}
                        className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Map
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <SearchIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow card-shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Location Map</h2>
          </div>
          <div className="p-6">
            <div className="h-96">
              <MapComponent
                accused={results}
                selectedAccused={selectedAccused}
                onMarkerClick={handleMarkerClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;