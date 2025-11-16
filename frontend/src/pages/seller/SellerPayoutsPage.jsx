// Seller payouts and earnings page
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  CreditCard,
  Calendar,
  Download,
  Eye,
  Filter
} from 'lucide-react';
import { ordersAPI } from '../../services/api';

function SellerPayoutsPage() {
  const [balance, setBalance] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadPayoutData();
  }, [statusFilter]);

  const loadPayoutData = async () => {
    try {
      setLoading(true);
      const [balanceData, payoutsData] = await Promise.all([
        ordersAPI.getSellerBalance(),
        ordersAPI.getSellerPayouts(statusFilter !== 'all' ? { status: statusFilter } : {})
      ]);
      
      setBalance(balanceData);
      setPayouts(payoutsData.results || payoutsData);
    } catch (err) {
      setError('Failed to load payout information');
      console.error('Payouts loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing': return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings & Payouts</h1>
        <p className="text-gray-600">Track your store's financial performance and payouts</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Balance Overview */}
      {balance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-green-400">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Available Balance</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      ₵{parseFloat(balance.available_balance || 0).toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-blue-400">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      ₵{parseFloat(balance.total_sales || 0).toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-purple-400">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Payouts</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      ₵{parseFloat(balance.pending_payouts || 0).toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg border-l-4 border-orange-400">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-8 w-8 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Platform Fees</dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      ₵{parseFloat(balance.platform_fees || 0).toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Earnings Breakdown */}
      {balance && (
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Earnings Breakdown</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Gross Sales</p>
                  <p className="text-sm text-gray-500">Total revenue from all sales</p>
                </div>
                <p className="text-lg font-semibold text-green-600">
                  +₵{parseFloat(balance.total_sales || 0).toFixed(2)}
                </p>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Platform Fees (7.5%)</p>
                  <p className="text-sm text-gray-500">Service charges and transaction fees</p>
                </div>
                <p className="text-lg font-semibold text-red-600">
                  -₵{parseFloat(balance.platform_fees || 0).toFixed(2)}
                </p>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Payouts</p>
                  <p className="text-sm text-gray-500">Amount already paid out</p>
                </div>
                <p className="text-lg font-semibold text-blue-600">
                  -₵{parseFloat(balance.total_payouts || 0).toFixed(2)}
                </p>
              </div>
              
              <div className="flex justify-between items-center py-3">
                <div>
                  <p className="text-base font-semibold text-gray-900">Net Available Balance</p>
                  <p className="text-sm text-gray-500">Ready for withdrawal</p>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  ₵{parseFloat(balance.available_balance || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payout History */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Payout History</h2>
            
            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
              
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {payouts.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payouts yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter !== 'all' 
                ? 'No payouts match the selected filter.' 
                : 'Payouts will appear here once you start receiving payments.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payout.reference}
                      </div>
                      {payout.notes && (
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {payout.notes}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₵{parseFloat(payout.amount).toFixed(2)}
                      </div>
                      {parseFloat(payout.fee) > 0 && (
                        <div className="text-sm text-gray-500">
                          Fee: ₵{parseFloat(payout.fee).toFixed(2)}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {payout.payment_method?.replace('_', ' ').toUpperCase() || 'Bank Transfer'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                        {getStatusIcon(payout.status)}
                        <span className="ml-1">{payout.status}</span>
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(payout.created_at).toLocaleDateString()}
                      </div>
                      {payout.processed_at && (
                        <div className="text-sm text-gray-500">
                          Processed: {new Date(payout.processed_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Payout Section */}
      {balance && parseFloat(balance.available_balance) > 0 && (
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-primary-900">
                Ready to withdraw your earnings?
              </h3>
              <p className="text-sm text-primary-700 mt-1">
                You have ₵{parseFloat(balance.available_balance).toFixed(2)} available for payout
              </p>
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
              <DollarSign className="h-4 w-4 mr-2" />
              Request Payout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerPayoutsPage;