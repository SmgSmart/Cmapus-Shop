// Component for buyers to become sellers by creating their first store
import React, { useState } from 'react';
import { Store, ArrowRight, CheckCircle, Upload } from 'lucide-react';
import { storesAPI, categoriesAPI } from '../../services/api';

function BecomeSellerModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Info, 2: Store Setup, 3: Success
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact_phone: '',
    contact_email: '',
    address: '',
    categories: []
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    if (isOpen && step === 2) {
      loadCategories();
    }
  }, [isOpen, step]);

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getCategories();
      setCategories(data.results || data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const validateStoreForm = () => {
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
    
    if (formData.categories.length === 0) {
      newErrors.categories = 'Please select at least one category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateStore = async () => {
    if (!validateStoreForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const storeData = {
        ...formData,
        categories: formData.categories
      };
      
      const response = await storesAPI.createStore(storeData);
      setStep(3);
      
      // Call success callback after a delay to show success screen
      setTimeout(() => {
        onSuccess(response);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Failed to create store:', error);
      
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          setErrors(error.response.data);
        } else {
          alert(`Error: ${error.response.data}`);
        }
      } else {
        alert('Failed to create store. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      name: '',
      description: '',
      contact_phone: '',
      contact_email: '',
      address: '',
      categories: []
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={step !== 3 ? handleClose : undefined}
        ></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {step === 1 && (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Become a Seller</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Start selling on our platform and reach thousands of customers
                </p>
              </div>

              {/* Content */}
              <div className="px-6 py-8">
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                    <Store className="h-8 w-8 text-primary-600" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to start your business?
                  </h4>
                  <p className="text-gray-600">
                    Join thousands of sellers already making money on our platform
                  </p>
                </div>

                {/* Benefits */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">No setup fees</p>
                      <p className="text-sm text-gray-600">Start selling immediately with no upfront costs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Reach thousands of customers</p>
                      <p className="text-sm text-gray-600">Access our growing customer base across the region</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Easy store management</p>
                      <p className="text-sm text-gray-600">Powerful tools to manage products, orders, and analytics</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Multiple payment options</p>
                      <p className="text-sm text-gray-600">Accept payments via mobile money, cards, and bank transfers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end px-6 py-4 space-x-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Create Your Store</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Set up your store information to start selling
                </p>
              </div>

              {/* Form */}
              <div className="px-6 py-4 max-h-96 overflow-y-auto">
                <div className="space-y-6">
                  {/* Store Name */}
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

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Store Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                        errors.description ? 'border-red-300 ring-red-500' : ''
                      }`}
                      placeholder="Describe what you sell and what makes your store special"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div>
                      <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
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
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Store Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Your store's physical address"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Store Categories * <span className="text-gray-500">(Select all that apply)</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
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
                    {errors.categories && (
                      <p className="mt-1 text-sm text-red-600">{errors.categories}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end px-6 py-4 space-x-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateStore}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {isLoading ? 'Creating Store...' : 'Create Store'}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              {/* Success Screen */}
              <div className="px-6 py-8 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Congratulations! 🎉
                </h3>
                <p className="text-gray-600 mb-4">
                  Your store has been created successfully. You are now a seller!
                </p>
                <p className="text-sm text-gray-500">
                  Redirecting you to your seller dashboard...
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BecomeSellerModal;