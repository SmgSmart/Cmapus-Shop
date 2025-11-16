// Store editing modal component for sellers
import React, { useState, useEffect } from 'react';
import { X, Upload, MapPin, Phone, Mail, Globe, Facebook, Twitter, Instagram } from 'lucide-react';
import { storesAPI, categoriesAPI } from '../../services/api';

function StoreEditModal({ isOpen, onClose, store, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    contact_phone: '',
    contact_email: '',
    website: '',
    facebook: '',
    twitter: '',
    instagram: '',
    categories: [],
    delivery_options: {
      home_delivery: false,
      pickup: false,
      shipping: false
    },
    business_hours: {
      monday: { open: '', close: '', closed: false },
      tuesday: { open: '', close: '', closed: false },
      wednesday: { open: '', close: '', closed: false },
      thursday: { open: '', close: '', closed: false },
      friday: { open: '', close: '', closed: false },
      saturday: { open: '', close: '', closed: false },
      sunday: { open: '', close: '', closed: false }
    }
  });
  
  const [categories, setCategories] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && store) {
      loadCategories();
      populateFormData();
    }
  }, [isOpen, store]);

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getCategories();
      setCategories(data.results || data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const populateFormData = () => {
    setFormData({
      name: store.name || '',
      description: store.description || '',
      address: store.address || '',
      contact_phone: store.contact_phone || '',
      contact_email: store.contact_email || '',
      website: store.social_media?.website || '',
      facebook: store.social_media?.facebook || '',
      twitter: store.social_media?.twitter || '',
      instagram: store.social_media?.instagram || '',
      categories: store.categories?.map(cat => cat.id) || [],
      delivery_options: {
        home_delivery: store.delivery_options?.home_delivery || false,
        pickup: store.delivery_options?.pickup || false,
        shipping: store.delivery_options?.shipping || false
      },
      business_hours: store.business_hours || {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '17:00', closed: false },
        sunday: { open: '', close: '', closed: true }
      }
    });

    // Set image previews
    setLogoPreview(store.logo || '');
    setBannerPreview(store.banner || '');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      business_hours: {
        ...prev.business_hours,
        [day]: {
          ...prev.business_hours[day],
          [field]: value
        }
      }
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB');
      return;
    }

    if (type === 'logo') {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    } else if (type === 'banner') {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setBannerPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Store name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Store description is required';
    }
    
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Valid email is required';
    }
    
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website URL must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Append text fields
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('address', formData.address);
      submitData.append('contact_phone', formData.contact_phone);
      submitData.append('contact_email', formData.contact_email);
      
      // Append social media as JSON
      const socialMedia = {
        website: formData.website,
        facebook: formData.facebook,
        twitter: formData.twitter,
        instagram: formData.instagram
      };
      submitData.append('social_media', JSON.stringify(socialMedia));
      
      // Append delivery options as JSON
      submitData.append('delivery_options', JSON.stringify(formData.delivery_options));
      
      // Append business hours as JSON
      submitData.append('business_hours', JSON.stringify(formData.business_hours));
      
      // Append categories
      formData.categories.forEach(catId => {
        submitData.append('categories', catId);
      });
      
      // Append image files if selected
      if (logoFile) {
        submitData.append('logo', logoFile);
      }
      if (bannerFile) {
        submitData.append('banner', bannerFile);
      }
      
      console.log('Store data being sent:', Object.fromEntries(submitData));
      
      const response = await storesAPI.updateStore(store.id, submitData);
      onSave(response);
      onClose();
    } catch (error) {
      console.error('Failed to update store:', error);
      console.error('Error details:', error.response);
      
      if (error.response?.data) {
        console.log('Server error response:', error.response.data);
        if (typeof error.response.data === 'object') {
          setErrors(error.response.data);
          // Show detailed validation errors
          const errorMessages = Object.entries(error.response.data)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          alert(`Validation errors:\n${errorMessages}`);
        } else {
          alert(`Server error: ${error.response.data}`);
        }
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Failed to update store. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Edit Store Information</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 max-h-[80vh] overflow-y-auto">
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                        errors.name ? 'border-red-300 ring-red-500' : ''
                      }`}
                      placeholder="Enter your store name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      id="contact_email"
                      name="contact_email"
                      value={formData.contact_email}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                        errors.contact_email ? 'border-red-300 ring-red-500' : ''
                      }`}
                      placeholder="store@example.com"
                    />
                    {errors.contact_email && (
                      <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Store Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                      errors.description ? 'border-red-300 ring-red-500' : ''
                    }`}
                    placeholder="Describe your store and what you sell..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="contact_phone"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="+233 XX XXX XXXX"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Store address"
                    />
                  </div>
                </div>
              </div>

              {/* Store Images */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Store Images</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-lg border border-gray-300 flex items-center justify-center overflow-hidden">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'logo')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Banner
                    </label>
                    <div className="space-y-2">
                      <div className="w-full h-24 rounded-lg border border-gray-300 flex items-center justify-center overflow-hidden">
                        {bannerPreview ? (
                          <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                        ) : (
                          <Upload className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Banner
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'banner')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Store Categories</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        checked={formData.categories.includes(category.id)}
                        onChange={() => handleCategoryChange(category.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`category-${category.id}`} className="ml-2 block text-sm text-gray-700">
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media Links */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Social Media & Website</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                      <Globe className="h-4 w-4 inline mr-1" />
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="https://yourstore.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                      <Facebook className="h-4 w-4 inline mr-1" />
                      Facebook
                    </label>
                    <input
                      type="url"
                      id="facebook"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="https://facebook.com/yourstore"
                    />
                  </div>

                  <div>
                    <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-1">
                      <Twitter className="h-4 w-4 inline mr-1" />
                      Twitter
                    </label>
                    <input
                      type="url"
                      id="twitter"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="https://twitter.com/yourstore"
                    />
                  </div>

                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                      <Instagram className="h-4 w-4 inline mr-1" />
                      Instagram
                    </label>
                    <input
                      type="url"
                      id="instagram"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="https://instagram.com/yourstore"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Options */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Delivery Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="home_delivery"
                      checked={formData.delivery_options.home_delivery}
                      onChange={(e) => handleInputChange({
                        target: { name: 'delivery_options.home_delivery', type: 'checkbox', checked: e.target.checked }
                      })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="home_delivery" className="ml-2 block text-sm text-gray-700">
                      Home Delivery Available
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="pickup"
                      checked={formData.delivery_options.pickup}
                      onChange={(e) => handleInputChange({
                        target: { name: 'delivery_options.pickup', type: 'checkbox', checked: e.target.checked }
                      })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="pickup" className="ml-2 block text-sm text-gray-700">
                      In-Store Pickup Available
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="shipping"
                      checked={formData.delivery_options.shipping}
                      onChange={(e) => handleInputChange({
                        target: { name: 'delivery_options.shipping', type: 'checkbox', checked: e.target.checked }
                      })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="shipping" className="ml-2 block text-sm text-gray-700">
                      Nationwide Shipping Available
                    </label>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Business Hours</h4>
                <div className="space-y-4">
                  {dayNames.map((day) => (
                    <div key={day} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3">
                        <label className="text-sm font-medium text-gray-700 capitalize">
                          {day}
                        </label>
                      </div>
                      
                      <div className="col-span-2">
                        <input
                          type="checkbox"
                          checked={formData.business_hours[day]?.closed || false}
                          onChange={(e) => handleBusinessHoursChange(day, 'closed', e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Closed</span>
                      </div>

                      {!formData.business_hours[day]?.closed && (
                        <>
                          <div className="col-span-3">
                            <input
                              type="time"
                              value={formData.business_hours[day]?.open || ''}
                              onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                            />
                          </div>
                          
                          <div className="col-span-1 text-center">
                            <span className="text-sm text-gray-500">to</span>
                          </div>
                          
                          <div className="col-span-3">
                            <input
                              type="time"
                              value={formData.business_hours[day]?.close || ''}
                              onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4 space-x-3 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreEditModal;