// Admin verification review dashboard
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  User, 
  Building, 
  Calendar,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { storesAPI } from '../../services/api';

function AdminVerificationDashboard() {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, verified, rejected
  const [searchTerm, setSearchTerm] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    loadPendingVerifications();
  }, []);

  const loadPendingVerifications = async () => {
    try {
      setIsLoading(true);
      const response = await storesAPI.getPendingVerifications();
      setPendingVerifications(response.pending_verifications || []);
    } catch (err) {
      setError('Failed to load verification requests');
      console.error('Verification loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveVerification = async (storeId, notes = '') => {
    try {
      await storesAPI.approveVerification(storeId, { notes });
      await loadPendingVerifications(); // Reload data
      setShowReviewModal(false);
      setSelectedVerification(null);
    } catch (error) {
      console.error('Failed to approve verification:', error);
      alert('Failed to approve verification. Please try again.');
    }
  };

  const handleRejectVerification = async (storeId, notes = '') => {
    try {
      await storesAPI.rejectVerification(storeId, { notes });
      await loadPendingVerifications(); // Reload data
      setShowReviewModal(false);
      setSelectedVerification(null);
    } catch (error) {
      console.error('Failed to reject verification:', error);
      alert('Failed to reject verification. Please try again.');
    }
  };

  const openReviewModal = async (verification) => {
    try {
      // Load full verification details
      const fullDetails = await storesAPI.getVerificationDetails(verification.store_id);
      setSelectedVerification({ ...verification, ...fullDetails });
      setShowReviewModal(true);
    } catch (error) {
      console.error('Failed to load verification details:', error);
      alert('Failed to load verification details.');
    }
  };

  const filteredVerifications = pendingVerifications.filter(verification => {
    const matchesSearch = 
      verification.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.business_name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Verifications</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadPendingVerifications}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verification Dashboard</h1>
        <p className="text-gray-600">Review and manage store verification requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending Review</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pendingVerifications.filter(v => !v.error).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">With Documents</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pendingVerifications.filter(v => v.has_documents).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Business Types</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {new Set(pendingVerifications.map(v => v.business_type).filter(Boolean)).size}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Incomplete</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {pendingVerifications.filter(v => v.error || !v.has_documents).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stores, owners, or businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Verifications Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pending Verifications</h3>
        </div>

        {filteredVerifications.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h4 className="mt-2 text-sm font-medium text-gray-900">No pending verifications</h4>
            <p className="mt-1 text-sm text-gray-500">
              All verification requests have been reviewed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store / Business
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Business Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVerifications.map((verification) => (
                  <tr key={verification.store_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {verification.store_name}
                        </div>
                        {verification.business_name && (
                          <div className="text-sm text-gray-500">
                            {verification.business_name}
                          </div>
                        )}
                        {verification.error && (
                          <div className="text-sm text-red-500">
                            ⚠️ {verification.error}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {verification.owner_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {verification.owner_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {verification.business_type || 'Not specified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {verification.submitted_at ? 
                        new Date(verification.submitted_at).toLocaleDateString() : 
                        'Unknown'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {verification.has_documents ? (
                        <span className="inline-flex items-center text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-sm text-red-600">
                          <XCircle className="h-4 w-4 mr-1" />
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openReviewModal(verification)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedVerification && (
        <VerificationReviewModal
          verification={selectedVerification}
          onClose={() => setShowReviewModal(false)}
          onApprove={handleApproveVerification}
          onReject={handleRejectVerification}
        />
      )}
    </div>
  );
}

// Verification Review Modal Component
function VerificationReviewModal({ verification, onClose, onApprove, onReject }) {
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState(null); // 'approve' or 'reject'

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(verification.store_id, notes);
    } else if (action === 'reject') {
      onReject(verification.store_id, notes);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Review Verification: {verification.store_name}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Store Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Store Name</label>
                    <p className="text-sm text-gray-900">{verification.store_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Owner</label>
                    <p className="text-sm text-gray-900">{verification.owner_name}</p>
                    <p className="text-sm text-gray-500">{verification.owner_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Submitted</label>
                    <p className="text-sm text-gray-900">
                      {verification.submitted_at ? 
                        new Date(verification.submitted_at).toLocaleDateString() : 
                        'Unknown'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Business Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Name</label>
                    <p className="text-sm text-gray-900">{verification.business_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Type</label>
                    <p className="text-sm text-gray-900">{verification.business_type || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Documents Status</label>
                    <p className={`text-sm ${verification.has_documents ? 'text-green-600' : 'text-red-600'}`}>
                      {verification.has_documents ? '✅ Documents Available' : '❌ Documents Missing'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Add notes about your decision..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setAction('reject');
                  handleSubmit();
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </button>
              
              <button
                onClick={() => {
                  setAction('approve');
                  handleSubmit();
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminVerificationDashboard;