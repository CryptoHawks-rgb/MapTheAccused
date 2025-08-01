import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { accusedAPI } from '../utils/api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Search, 
  Phone, 
  MapPin, 
  DollarSign,
  AlertCircle
} from 'lucide-react';

const ManageAccused = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const [accused, setAccused] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(!!editId);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_numbers: [''],
    address: '',
    fraud_amount: '',
    case_id: '',
    fir_details: '',
    police_station: '',
    tags: [''],
    profile_photo: '',
    latitude: null,
    longitude: null,
    manual_coordinates: false
  });
  const [editingId, setEditingId] = useState(editId || null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAccused();
    if (editId) {
      fetchAccusedForEdit(editId);
    }
  }, [editId]);

  const fetchAccused = async () => {
    try {
      const response = await accusedAPI.getAll();
      setAccused(response.data);
    } catch (error) {
      console.error('Error fetching accused:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccusedForEdit = async (id) => {
    try {
      const response = await accusedAPI.getById(id);
      const data = response.data;
      setFormData({
        full_name: data.full_name,
        phone_numbers: data.phone_numbers || [''],
        address: data.address,
        fraud_amount: data.fraud_amount.toString(),
        case_id: data.case_id,
        fir_details: data.fir_details,
        police_station: data.police_station,
        tags: data.tags || [''],
        profile_photo: data.profile_photo || '',
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        manual_coordinates: (data.latitude && data.longitude) ? true : false
      });
      setEditingId(id);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching accused for edit:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      fraud_amount: parseFloat(formData.fraud_amount),
      phone_numbers: formData.phone_numbers.filter(phone => phone.trim()),
      tags: formData.tags.filter(tag => tag.trim())
    };

    try {
      if (editingId) {
        await accusedAPI.update(editingId, submitData);
        alert('Accused record updated successfully');
      } else {
        await accusedAPI.create(submitData);
        alert('Accused record created successfully');
      }
      
      resetForm();
      fetchAccused();
    } catch (error) {
      alert('Error saving record: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await accusedAPI.delete(id);
        alert('Record deleted successfully');
        fetchAccused();
      } catch (error) {
        alert('Error deleting record: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone_numbers: [''],
      address: '',
      fraud_amount: '',
      case_id: '',
      fir_details: '',
      police_station: '',
      tags: [''],
      profile_photo: '',
      latitude: null,
      longitude: null,
      manual_coordinates: false
    });
    setEditingId(null);
    setShowForm(false);
  };

  const addPhoneField = () => {
    setFormData({
      ...formData,
      phone_numbers: [...formData.phone_numbers, '']
    });
  };

  const removePhoneField = (index) => {
    const newPhones = formData.phone_numbers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      phone_numbers: newPhones.length > 0 ? newPhones : ['']
    });
  };

  const updatePhoneField = (index, value) => {
    const newPhones = [...formData.phone_numbers];
    newPhones[index] = value;
    setFormData({
      ...formData,
      phone_numbers: newPhones
    });
  };

  const addTagField = () => {
    setFormData({
      ...formData,
      tags: [...formData.tags, '']
    });
  };

  const removeTagField = (index) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      tags: newTags.length > 0 ? newTags : ['']
    });
  };

  const updateTagField = (index, value) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({
      ...formData,
      tags: newTags
    });
  };

  const filteredAccused = accused.filter(person =>
    person.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.case_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.phone_numbers.some(phone => phone.includes(searchQuery))
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Accused</h1>
          <p className="text-gray-600">Add, edit, and manage accused individuals</p>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Accused
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingId ? 'Edit Accused' : 'Add New Accused'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Numbers *</label>
                {formData.phone_numbers.map((phone, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="tel"
                      required={index === 0}
                      value={phone}
                      onChange={(e) => updatePhoneField(index, e.target.value)}
                      placeholder="e.g., +91-9876543210"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removePhoneField(index)}
                        className="px-3 py-2 text-danger-600 hover:bg-danger-50 rounded-md"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPhoneField}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add another phone number
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fraud Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.fraud_amount}
                    onChange={(e) => setFormData({...formData, fraud_amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.case_id}
                    onChange={(e) => setFormData({...formData, case_id: e.target.value})}
                    placeholder="e.g., FIR/2024/001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Police Station *</label>
                <input
                  type="text"
                  required
                  value={formData.police_station}
                  onChange={(e) => setFormData({...formData, police_station: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FIR Details *</label>
                <textarea
                  required
                  value={formData.fir_details}
                  onChange={(e) => setFormData({...formData, fir_details: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fraud Types/Tags</label>
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateTagField(index, e.target.value)}
                      placeholder="e.g., loan fraud, crypto scam"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeTagField(index)}
                        className="px-3 py-2 text-danger-600 hover:bg-danger-50 rounded-md"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTagField}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add another tag
                </button>
              </div>

              {/* Coordinates Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Location Coordinates (Optional)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="manual_coordinates"
                      checked={formData.manual_coordinates || false}
                      onChange={(e) => setFormData({...formData, manual_coordinates: e.target.checked})}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="manual_coordinates" className="ml-2 text-sm text-gray-600">
                      Provide manual coordinates
                    </label>
                  </div>
                </div>
                
                {formData.manual_coordinates && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude || ''}
                        onChange={(e) => setFormData({...formData, latitude: e.target.value ? parseFloat(e.target.value) : null})}
                        placeholder="e.g., 28.6139"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude || ''}
                        onChange={(e) => setFormData({...formData, longitude: e.target.value ? parseFloat(e.target.value) : null})}
                        placeholder="e.g., 77.2090"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                )}
                
                <p className="mt-2 text-xs text-gray-500">
                  {formData.manual_coordinates 
                    ? "Manual coordinates will be used. Leave blank to auto-geocode from address."
                    : "Coordinates will be automatically generated from the address using OpenCage API."
                  }
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow card-shadow p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, case ID, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Accused List */}
      <div className="bg-white rounded-lg shadow card-shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Accused Records ({filteredAccused.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : filteredAccused.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAccused.map((person) => (
              <div key={person.accused_id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {person.full_name}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{person.phone_numbers?.join(', ')}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium text-danger-600">
                          {formatCurrency(person.fraud_amount)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>{person.case_id}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{person.address}</span>
                    </div>
                    
                    {person.tags && person.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {person.tags.map((tag, index) => (
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
                  
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => fetchAccusedForEdit(person.accused_id)}
                      className="inline-flex items-center px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDelete(person.accused_id)}
                      className="inline-flex items-center px-3 py-1 bg-danger-600 text-white text-sm rounded hover:bg-danger-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accused found</h3>
            <p className="text-gray-600">Try adjusting your search or add a new accused record</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAccused;