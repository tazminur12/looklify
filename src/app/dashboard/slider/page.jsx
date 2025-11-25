'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Swal from 'sweetalert2';

export default function SliderManagementPage() {
  const router = useRouter();
  const [sliderImages, setSliderImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    image: { url: '', publicId: '', alt: '' },
    title: '',
    description: '',
    buttonText: 'Shop Now',
    buttonLink: '/shop',
    status: 'active',
    sortOrder: 0
  });

  // Fetch slider images
  useEffect(() => {
    fetchSliderImages();
  }, []);

  const fetchSliderImages = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch all slider images (not just active) for dashboard management
      const response = await fetch('/api/slider?sortBy=sortOrder');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const images = Array.isArray(data.data) ? data.data : [];
        setSliderImages(images);
      } else {
        setSliderImages([]);
        if (data.error) {
          setError(data.error);
        } else if (!data.success) {
          setError('No slider images found');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch slider images');
      setSliderImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'looklify-slider');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      
      if (data.success && data.url) {
        setFormData(prev => ({
          ...prev,
          image: {
            url: data.url,
            publicId: data.publicId,
            alt: prev.image.alt || 'Slider Image'
          }
        }));
        Swal.fire({
          icon: 'success',
          title: 'Image Uploaded!',
          text: 'Your image has been successfully uploaded',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      } else {
        throw new Error('Upload failed - no URL returned');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err.message || 'Failed to upload image. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.image.url) {
      Swal.fire({
        icon: 'warning',
        title: 'Image Required',
        text: 'Please upload an image first',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      Swal.fire({
        title: 'Adding Slider Image...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await fetch('/api/slider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Slider image added successfully!',
          timer: 2000,
          showConfirmButton: false
        });
        setFormData({
          image: { url: '', publicId: '', alt: '' },
          title: '',
          description: '',
          buttonText: 'Shop Now',
          buttonLink: '/shop',
          status: 'active',
          sortOrder: 0
        });
        fetchSliderImages();
      } else {
        throw new Error(data.error || 'Failed to add slider image');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: err.message || 'Failed to add slider image. Please try again.',
        confirmButtonText: 'OK'
      });
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid slider ID',
        confirmButtonText: 'OK'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      Swal.fire({
        title: 'Deleting...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Ensure ID is a string
      const sliderId = String(id).trim();

      const response = await fetch(`/api/slider/${sliderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Parse response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Server error: ${response.status}`);
      }

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Slider image has been deleted.',
          timer: 2000,
          showConfirmButton: false
        });
        fetchSliderImages();
      } else {
        throw new Error(data.error || data.message || 'Failed to delete slider image');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: err.message || 'Failed to delete slider image. Please try again.',
        confirmButtonText: 'OK'
      });
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (id, currentStatus) => {
    if (!id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid slider ID',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      Swal.fire({
        title: 'Updating Status...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Ensure ID is a string
      const sliderId = String(id).trim();
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      const response = await fetch(`/api/slider/${sliderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      // Parse response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Server error: ${response.status}`);
      }

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Status updated successfully!',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
        fetchSliderImages();
      } else {
        throw new Error(data.error || data.message || 'Failed to update status');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: err.message || 'Failed to update status. Please try again.',
        confirmButtonText: 'OK'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading slider images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Image Slider Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Upload and manage slider images for the homepage
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800 dark:text-red-300 text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-green-800 dark:text-green-300 text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Add New Slider Image
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image <span className="text-red-500">*</span>
              </label>
              
              {/* Image Size Recommendation */}
              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-1">
                  📐 Recommended Image Size:
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  <span className="font-semibold">1920 x 600 pixels</span> (3:1 ratio) বা <span className="font-semibold">1920 x 800 pixels</span> (12:5 ratio)
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                  Minimum: 1200 x 400 pixels | Maximum file size: 5MB
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                  Supported formats: PNG, JPG, WEBP
                </p>
              </div>
              
              {formData.image.url ? (
                <div className="relative group">
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                    <Image
                      src={formData.image.url}
                      alt={formData.image.alt || 'Slider Image'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: { url: '', publicId: '', alt: '' } }))}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-purple-500 dark:hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer flex flex-col items-center gap-4 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploading ? (
                      <>
                        <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-600 dark:text-gray-400">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">
                            Click to upload image
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                            PNG, JPG, WEBP up to 5MB
                          </p>
                          <p className="text-gray-400 dark:text-gray-500 text-xs">
                            Recommended: 1920 x 600px (3:1 ratio)
                          </p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter slider title"
                maxLength={200}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                placeholder="Enter slider description"
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Button Text & Link */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Shop Now"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Button Link
                </label>
                <input
                  type="text"
                  value={formData.buttonLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, buttonLink: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="/shop"
                />
              </div>
            </div>

            {/* Status & Sort Order */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!formData.image.url || uploading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Add Slider Image'}
            </button>
          </form>
        </div>

        {/* Existing Slider Images */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Existing Slider Images ({sliderImages.length})
          </h2>

          {sliderImages.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No slider images yet</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Upload your first image to get started</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {sliderImages.map((slider) => (
                <div
                  key={slider._id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-purple-500 dark:hover:border-purple-400 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Image Preview */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
                      {slider.image?.url ? (
                        <Image
                          src={slider.image.url}
                          alt={slider.image.alt || slider.title || 'Slider Image'}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {slider.title || 'Untitled'}
                          </h3>
                          {slider.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                              {slider.description}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          slider.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {slider.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!slider._id) {
                              Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Slider ID is missing',
                                confirmButtonText: 'OK'
                              });
                              return;
                            }
                            handleStatusToggle(slider._id, slider.status);
                          }}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            slider.status === 'active'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/40'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/40'
                          }`}
                        >
                          {slider.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!slider._id) {
                              Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Slider ID is missing',
                                confirmButtonText: 'OK'
                              });
                              return;
                            }
                            handleDelete(slider._id);
                          }}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                        >
                          Delete
                        </button>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Order: {slider.sortOrder}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

