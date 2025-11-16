// Store analytics component with charts and detailed metrics
import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Eye,
  Users,
  Calendar,
  Filter
} from 'lucide-react';
import { storesAPI } from '../../services/api';

// Color palette for charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

function StoreAnalytics({ store }) {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, 1y
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await storesAPI.getStoreAnalytics(store.id, { period: timeRange });
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Use mock data for demonstration
      setAnalytics(generateMockAnalytics());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAnalytics = () => ({
    overview: {
      totalSales: 12450.00,
      totalOrders: 156,
      totalViews: 2341,
      conversionRate: 6.7,
      averageOrderValue: 79.81,
      salesGrowth: 12.5,
      ordersGrowth: 8.3,
      viewsGrowth: -2.1
    },
    salesData: [
      { date: '2024-12-13', sales: 850, orders: 12 },
      { date: '2024-12-14', sales: 1200, orders: 18 },
      { date: '2024-12-15', sales: 950, orders: 15 },
      { date: '2024-12-16', sales: 1450, orders: 22 },
      { date: '2024-12-17', sales: 1100, orders: 16 },
      { date: '2024-12-18', sales: 1680, orders: 25 },
      { date: '2024-12-19', sales: 1320, orders: 19 }
    ],
    viewsData: [
      { date: '2024-12-13', views: 245 },
      { date: '2024-12-14', views: 312 },
      { date: '2024-12-15', views: 298 },
      { date: '2024-12-16', views: 387 },
      { date: '2024-12-17', views: 334 },
      { date: '2024-12-18', views: 456 },
      { date: '2024-12-19', views: 423 }
    ],
    topProducts: [
      { name: 'Wireless Headphones', sales: 2340, percentage: 18.8 },
      { name: 'Smart Watch', sales: 1890, percentage: 15.2 },
      { name: 'Phone Case', sales: 1560, percentage: 12.5 },
      { name: 'Laptop Stand', sales: 1230, percentage: 9.9 },
      { name: 'USB Cable', sales: 890, percentage: 7.1 }
    ],
    categoryBreakdown: [
      { name: 'Electronics', value: 45, sales: 5600 },
      { name: 'Accessories', value: 30, sales: 3730 },
      { name: 'Clothing', value: 15, sales: 1870 },
      { name: 'Books', value: 10, sales: 1250 }
    ],
    customerData: {
      newCustomers: 23,
      returningCustomers: 67,
      customerRetentionRate: 74.2
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => `₵${amount.toLocaleString()}`;
  const formatPercentage = (value) => `${value > 0 ? '+' : ''}${value}%`;

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Store Analytics</h3>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Sales"
            value={formatCurrency(analytics.overview.totalSales)}
            change={analytics.overview.salesGrowth}
            icon={DollarSign}
          />
          <MetricCard
            title="Total Orders"
            value={analytics.overview.totalOrders}
            change={analytics.overview.ordersGrowth}
            icon={ShoppingCart}
          />
          <MetricCard
            title="Store Views"
            value={analytics.overview.totalViews.toLocaleString()}
            change={analytics.overview.viewsGrowth}
            icon={Eye}
          />
          <MetricCard
            title="Conversion Rate"
            value={`${analytics.overview.conversionRate}%`}
            change={null}
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Sales Overview</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tickFormatter={(value) => `₵${value}`} />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value, name) => [
                  name === 'sales' ? formatCurrency(value) : value,
                  name === 'sales' ? 'Sales' : 'Orders'
                ]}
              />
              <Area type="monotone" dataKey="sales" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Bar dataKey="orders" fill="#10B981" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Views Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Store Views</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.viewsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => [value.toLocaleString(), 'Views']}
              />
              <Line type="monotone" dataKey="views" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Sales by Category</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Top Products</h4>
          <div className="space-y-4">
            {analytics.topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.percentage}% of sales</p>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(product.sales)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Insights</h4>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">New Customers</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.customerData.newCustomers}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Returning Customers</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.customerData.returningCustomers}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Retention Rate</span>
              <span className="text-sm font-medium text-green-600">
                {analytics.customerData.customerRetentionRate}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Performance</h4>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg. Order Value</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(analytics.overview.averageOrderValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="text-sm font-medium text-gray-900">
                {analytics.overview.conversionRate}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Growth Trends</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sales Growth</span>
              <span className={`text-sm font-medium ${
                analytics.overview.salesGrowth > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercentage(analytics.overview.salesGrowth)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Order Growth</span>
              <span className={`text-sm font-medium ${
                analytics.overview.ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercentage(analytics.overview.ordersGrowth)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, change, icon: Icon }) {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center mt-1">
            <p className="text-lg font-semibold text-gray-900">{value}</p>
            {change !== null && (
              <div className={`ml-2 flex items-center text-sm ${
                isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
              }`}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : isNegative ? (
                  <TrendingDown className="h-3 w-3 mr-1" />
                ) : null}
                {formatPercentage(change)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreAnalytics;