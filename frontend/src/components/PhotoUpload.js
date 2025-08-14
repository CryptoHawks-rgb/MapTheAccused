import React, { useState, useRef } from 'react';
import { Upload, X, Image, AlertCircle } from 'lucide-react';
import { photoAPI } from '../utils/api';

const PhotoUpload = ({ currentPhoto, onPhotoChange, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentPhoto || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WebP)');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await photoAPI.upload(formData);
      const photoUrl = response.data.photo_url;
      
      setPreview(photoUrl);
      onPhotoChange(photoUrl);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPreview('');
    onPhotoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Profile Photo (Optional)
      </label>
      
      {preview ? (
        <div className="relative inline-block">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={preview.startsWith('/api/uploads/') 
                ? `${process.env.REACT_APP_BACKEND_URL}${preview}` 
                : preview
              }
              alt="Profile preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NCA0NEg0NFY4NEg4NFY0NFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
              }}
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          
          {!disabled && (
            <button
              type="button"
              onClick={triggerFileInput}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
            >
              Change Photo
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          className={`w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center ${
            disabled 
              ? 'bg-gray-50 cursor-not-allowed' 
              : 'bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors'
          }`}
        >
          <Image className="h-8 w-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600">Upload Photo</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {uploading && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          <span>Uploading...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Supported formats: JPEG, PNG, WebP. Maximum size: 5MB.
      </p>
    </div>
  );
};

export default PhotoUpload;