// Seller verification component for enhanced trust
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Upload, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Camera,
  FileText,
  Star,
  X
} from 'lucide-react';
import { storesAPI } from '../../services/api';

function SellerVerificationBadge({ store, size = 'sm' }) {
  const getVerificationStatus = () => {
    if (!store.verification_status) {
      return { status: 'unverified', label: 'Unverified', color: 'gray' };
    }
    
    switch (store.verification_status) {
      case 'verified':
        return { status: 'verified', label: 'Verified Seller', color: 'green' };
      case 'pending':
        return { status: 'pending', label: 'Verification Pending', color: 'yellow' };
      case 'rejected':
        return { status: 'rejected', label: 'Verification Rejected', color: 'red' };
      default:
        return { status: 'unverified', label: 'Unverified', color: 'gray' };
    }
  };

  const verification = getVerificationStatus();
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${sizeClasses[size]} ${colorClasses[verification.color]}`}>
      {verification.status === 'verified' && <Shield className={`${iconSize[size]} mr-1`} />}
      {verification.status === 'pending' && <Clock className={`${iconSize[size]} mr-1`} />}
      {verification.status === 'rejected' && <AlertCircle className={`${iconSize[size]} mr-1`} />}
      {verification.status === 'unverified' && <Shield className={`${iconSize[size]} mr-1`} />}
      {verification.label}
    </span>
  );
}

function SellerVerificationModal({ isOpen, onClose, store, onVerificationSubmitted }) {
  const [step, setStep] = useState(1); // 1: Info, 2: Documents, 3: Review, 4: Submit
  const [formData, setFormData] = useState({
    business_name: store?.name || '',
    business_registration_number: '',
    tax_identification_number: '',
    business_address: store?.address || '',
    business_phone: store?.contact_phone || '',
    business_email: store?.contact_email || '',
    owner_name: '',
    owner_phone: '',
    owner_email: '',
    business_type: '',
    years_in_business: '',
    description_of_business: '',
    social_media_links: {
      website: store?.social_media?.website || '',
      facebook: store?.social_media?.facebook || '',
      instagram: store?.social_media?.instagram || ''
    }
  });

  const [documents, setDocuments] = useState({
    business_registration: null,
    tax_certificate: null,
    owner_id: null,
    business_permit: null,
    bank_statement: null
  });

  const [documentPreviews, setDocumentPreviews] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const businessTypes = [
    'Sole Proprietorship',
    'Partnership',
    'Limited Company',
    'NGO/Non-Profit',
    'Cooperative',
    'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDocumentUpload = (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload PDF or image files only');
      return;
    }

    setDocuments(prev => ({ ...prev, [documentType]: file }));

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentPreviews(prev => ({ ...prev, [documentType]: e.target.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setDocumentPreviews(prev => ({ ...prev, [documentType]: 'pdf' }));
    }
  };

  const validateStep = (stepNumber) => {
    const newErrors = {};

    if (stepNumber === 1) {
      if (!formData.business_name.trim()) newErrors.business_name = 'Business name is required';
      if (!formData.owner_name.trim()) newErrors.owner_name = 'Owner name is required';
      if (!formData.business_type) newErrors.business_type = 'Business type is required';
      if (!formData.business_address.trim()) newErrors.business_address = 'Business address is required';
    }

    if (stepNumber === 2) {
      if (!documents.business_registration) newErrors.business_registration = 'Business registration is required';
      if (!documents.owner_id) newErrors.owner_id = 'Owner ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const submitData = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Append documents
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          submitData.append(key, documents[key]);
        }
      });

      const response = await storesAPI.submitVerification(store.id, submitData);
      onVerificationSubmitted(response);
      onClose();
    } catch (error) {
      console.error('Failed to submit verification:', error);
      alert('Failed to submit verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-3xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Seller Verification</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Get verified to build trust with customers
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="mt-4 flex items-center space-x-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step >= stepNumber 
                      ? 'bg-primary-600 border-primary-600 text-white' 
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {step > stepNumber ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step > stepNumber ? 'bg-primary-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {step === 1 && (
              <BusinessInformationStep 
                formData={formData} 
                onChange={handleInputChange}
                errors={errors}
                businessTypes={businessTypes}
              />
            )}
            
            {step === 2 && (
              <DocumentUploadStep 
                documents={documents}
                previews={documentPreviews}
                onUpload={handleDocumentUpload}
                errors={errors}
              />
            )}
            
            {step === 3 && (
              <ReviewStep 
                formData={formData}
                documents={documents}
              />
            )}
            
            {step === 4 && (
              <SubmissionStep />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              
              {step < 3 && (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                >
                  Next
                </button>
              )}
              
              {step === 3 && (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Submit for Verification'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function BusinessInformationStep({ formData, onChange, errors, businessTypes }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Business Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name *
            </label>
            <input
              type="text"
              name="business_name"
              value={formData.business_name}
              onChange={onChange}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                errors.business_name ? 'border-red-300' : ''
              }`}
            />
            {errors.business_name && <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Type *
            </label>
            <select
              name="business_type"
              value={formData.business_type}
              onChange={onChange}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                errors.business_type ? 'border-red-300' : ''
              }`}
            >
              <option value="">Select business type</option>
              {businessTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.business_type && <p className="mt-1 text-sm text-red-600">{errors.business_type}</p>}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Owner Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Full Name *
            </label>
            <input
              type="text"
              name="owner_name"
              value={formData.owner_name}
              onChange={onChange}
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
                errors.owner_name ? 'border-red-300' : ''
              }`}
            />
            {errors.owner_name && <p className="mt-1 text-sm text-red-600">{errors.owner_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner Phone
            </label>
            <input
              type="tel"
              name="owner_phone"
              value={formData.owner_phone}
              onChange={onChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Address *
        </label>
        <textarea
          name="business_address"
          value={formData.business_address}
          onChange={onChange}
          rows={3}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${
            errors.business_address ? 'border-red-300' : ''
          }`}
        />
        {errors.business_address && <p className="mt-1 text-sm text-red-600">{errors.business_address}</p>}
      </div>
    </div>
  );
}

function DocumentUploadStep({ documents, previews, onUpload, errors }) {
  const documentTypes = [
    { key: 'business_registration', label: 'Business Registration Certificate', required: true },
    { key: 'tax_certificate', label: 'Tax Certificate', required: false },
    { key: 'owner_id', label: 'Owner National ID/Passport', required: true },
    { key: 'business_permit', label: 'Business Permit/License', required: false },
    { key: 'bank_statement', label: 'Bank Statement (Last 3 months)', required: false }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h4>
        <p className="text-sm text-gray-600 mb-6">
          Please upload clear, readable copies of your documents. Accepted formats: PDF, JPG, PNG (max 5MB each)
        </p>
      </div>

      <div className="space-y-4">
        {documentTypes.map(({ key, label, required }) => (
          <div key={key} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              {documents[key] && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Upload className="h-4 w-4 mr-2" />
                {documents[key] ? 'Replace File' : 'Choose File'}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => onUpload(e, key)}
                  className="hidden"
                />
              </label>
              
              {documents[key] && (
                <span className="text-sm text-gray-600">
                  {documents[key].name}
                </span>
              )}
            </div>
            
            {errors[key] && <p className="mt-2 text-sm text-red-600">{errors[key]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewStep({ formData, documents }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Review Your Information</h4>
        <p className="text-sm text-gray-600 mb-6">
          Please review all information before submitting. You can go back to make changes if needed.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div>
          <h5 className="font-medium text-gray-900">Business Information</h5>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p><strong>Name:</strong> {formData.business_name}</p>
            <p><strong>Type:</strong> {formData.business_type}</p>
            <p><strong>Address:</strong> {formData.business_address}</p>
          </div>
        </div>

        <div>
          <h5 className="font-medium text-gray-900">Owner Information</h5>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p><strong>Name:</strong> {formData.owner_name}</p>
            {formData.owner_phone && <p><strong>Phone:</strong> {formData.owner_phone}</p>}
          </div>
        </div>

        <div>
          <h5 className="font-medium text-gray-900">Uploaded Documents</h5>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            {Object.keys(documents).map(key => 
              documents[key] && (
                <p key={key}>
                  <CheckCircle className="h-4 w-4 inline text-green-500 mr-2" />
                  {documents[key].name}
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmissionStep() {
  return (
    <div className="text-center py-8">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
      <h4 className="text-lg font-medium text-gray-900 mb-2">
        Verification Submitted Successfully!
      </h4>
      <p className="text-gray-600 mb-4">
        Thank you for submitting your verification documents. Our team will review your application within 2-3 business days.
      </p>
      <p className="text-sm text-gray-500">
        You'll receive an email notification once your verification is complete.
      </p>
    </div>
  );
}

export default SellerVerificationModal;
export { SellerVerificationBadge };