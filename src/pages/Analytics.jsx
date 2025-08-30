import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function Analytics() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [venue, setVenue] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchVenueAndAnalytics();
  }, [venueId, dateRange]);

  const fetchVenueAndAnalytics = async () => {
    try {
      setLoading(true);
      // TODO: Replace with real API calls
      // const venueData = await api.getVenueById(venueId);
      // const analyticsData = await api.getAnalytics(venueId, dateRange);
      
      // Mock data for now
      setVenue({
        name: 'Colombo Indoor Sports Complex',
        venueId: venueId
      });
      
      setAnalyticsData({
        revenue: {
          total: 125000,
          change: 15.5,
          trend: 'up',
          breakdown: {
            courtBookings: 98000,
            equipmentRentals: 27000
          }
        },
        occupancy: {
          average: 78.5,
          change: 8.2,
          trend: 'up',
          byCourt: [
            { name: 'Basketball Court 1', occupancy: 85.2 },
            { name: 'Futsal Court 1', occupancy: 72.8 },
            { name: 'Badminton Court 1', occupancy: 77.5 }
          ]
        },
        bookings: {
          total: 156,
          change: 12.3,
          trend: 'up',
          byStatus: {
            confirmed: 142,
            pending: 8,
            cancelled: 6
          }
        },
        customers: {
          total: 89,
          new: 23,
          returning: 66,
          change: 5.8,
          trend: 'up'
        },
        timeSlots: {
          peakHours: ['18:00', '19:00', '20:00'],
          offPeakHours: ['06:00', '07:00', '08:00'],
          weekendPeak: ['14:00', '15:00', '16:00']
        },
        popularCourts: [
          { name: 'Basketball Court 1', bookings: 45, revenue: 54000 },
          { name: 'Futsal Court 1', bookings: 38, revenue: 38000 },
          { name: 'Badminton Court 1', bookings: 32, revenue: 25600 }
        ],
        equipmentUsage: [
          { name: 'Basketball', rentals: 156, revenue: 15600 },
          { name: 'Futsal Ball', rentals: 134, revenue: 10720 },
          { name: 'Badminton Racket', rentals: 89, revenue: 13350 }
        ],
        monthlyTrends: [
          { month: 'Jan', revenue: 85000, bookings: 120, occupancy: 65 },
          { month: 'Feb', revenue: 92000, bookings: 135, occupancy: 72 },
          { month: 'Mar', revenue: 88000, bookings: 128, occupancy: 68 },
          { month: 'Apr', revenue: 95000, bookings: 142, occupancy: 75 },
          { month: 'May', revenue: 102000, bookings: 148, occupancy: 78 },
          { month: 'Jun', revenue: 125000, bookings: 156, occupancy: 78.5 }
        ]
      });
    } catch (error) {
      console.error('Error fetching venue and analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, trend, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <div className="flex items-center mt-1">
            {trend === 'up' ? (
                                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            ) : (
                              <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const RevenueChart = () => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
      <div className="h-64 flex items-end justify-between space-x-2">
        {analyticsData.monthlyTrends.map((month, index) => (
          <div key={month.month} className="flex flex-col items-center">
            <div 
              className="bg-orange-500 rounded-t w-12"
              style={{ height: `${(month.revenue / 125000) * 200}px` }}
            ></div>
            <span className="text-xs text-gray-600 mt-2">{month.month}</span>
            <span className="text-xs font-medium text-gray-900">
              LKR {(month.revenue / 1000).toFixed(0)}k
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const OccupancyChart = () => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Court Occupancy</h3>
      <div className="space-y-4">
        {analyticsData.occupancy.byCourt.map((court) => (
          <div key={court.name}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">{court.name}</span>
              <span className="text-sm font-medium text-gray-900">{court.occupancy}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${court.occupancy}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PopularCourtsTable = () => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Courts</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Court</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {analyticsData.popularCourts.map((court) => (
              <tr key={court.name}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {court.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {court.bookings}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  LKR {court.revenue.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const EquipmentUsageTable = () => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Usage</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rentals</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {analyticsData.equipmentUsage.map((equipment) => (
              <tr key={equipment.name}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {equipment.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {equipment.rentals}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  LKR {equipment.revenue.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const TimeSlotAnalysis = () => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Slot Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Peak Hours</h4>
          <div className="space-y-1">
            {analyticsData.timeSlots.peakHours.map((time) => (
              <div key={time} className="text-sm text-gray-900 bg-red-50 px-3 py-1 rounded">
                {time}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Off-Peak Hours</h4>
          <div className="space-y-1">
            {analyticsData.timeSlots.offPeakHours.map((time) => (
              <div key={time} className="text-sm text-gray-900 bg-green-50 px-3 py-1 rounded">
                {time}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Weekend Peak</h4>
          <div className="space-y-1">
            {analyticsData.timeSlots.weekendPeak.map((time) => (
              <div key={time} className="text-sm text-gray-900 bg-blue-50 px-3 py-1 rounded">
                {time}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
        <p className="text-gray-600">Analytics data will appear here once you have bookings.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-2">
                Performance insights for {venue?.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'revenue'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setActiveTab('occupancy')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'occupancy'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Occupancy
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'performance'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Performance
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={`LKR ${(analyticsData.revenue.total / 1000).toFixed(0)}k`}
                change={analyticsData.revenue.change}
                trend={analyticsData.revenue.trend}
                icon={CurrencyDollarIcon}
                color="bg-green-500"
              />
              <StatCard
                title="Average Occupancy"
                value={`${analyticsData.occupancy.average}%`}
                change={analyticsData.occupancy.change}
                trend={analyticsData.occupancy.trend}
                icon={ChartBarIcon}
                color="bg-blue-500"
              />
              <StatCard
                title="Total Bookings"
                value={analyticsData.bookings.total}
                change={analyticsData.bookings.change}
                trend={analyticsData.bookings.trend}
                icon={CalendarIcon}
                color="bg-purple-500"
              />
              <StatCard
                title="Active Customers"
                value={analyticsData.customers.total}
                change={analyticsData.customers.change}
                trend={analyticsData.customers.trend}
                icon={UserIcon}
                color="bg-orange-500"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart />
              <OccupancyChart />
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PopularCourtsTable />
              <EquipmentUsageTable />
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <RevenueChart />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Court Bookings</span>
                    <span className="font-medium">LKR {analyticsData.revenue.breakdown.courtBookings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Equipment Rentals</span>
                    <span className="font-medium">LKR {analyticsData.revenue.breakdown.equipmentRentals.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total</span>
                      <span>LKR {analyticsData.revenue.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <PopularCourtsTable />
            </div>
          </div>
        )}

        {/* Occupancy Tab */}
        {activeTab === 'occupancy' && (
          <div className="space-y-6">
            <OccupancyChart />
            <TimeSlotAnalysis />
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.occupancy.byCourt[0].occupancy}%
                  </div>
                  <div className="text-sm text-green-800">Highest Occupancy</div>
                  <div className="text-xs text-green-600">{analyticsData.occupancy.byCourt[0].name}</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData.occupancy.average}%
                  </div>
                  <div className="text-sm text-blue-800">Average Occupancy</div>
                  <div className="text-xs text-blue-600">All Courts</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.min(...analyticsData.occupancy.byCourt.map(c => c.occupancy)).toFixed(1)}%
                  </div>
                  <div className="text-sm text-orange-800">Lowest Occupancy</div>
                  <div className="text-xs text-orange-600">Room for improvement</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Customers</span>
                    <span className="font-medium">{analyticsData.customers.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">New Customers</span>
                    <span className="font-medium text-green-600">{analyticsData.customers.new}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Returning Customers</span>
                    <span className="font-medium text-blue-600">{analyticsData.customers.returning}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600">
                      Customer retention rate: {((analyticsData.customers.returning / analyticsData.customers.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Confirmed</span>
                    <span className="font-medium text-green-600">{analyticsData.bookings.byStatus.confirmed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Pending</span>
                    <span className="font-medium text-yellow-600">{analyticsData.bookings.byStatus.pending}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Cancelled</span>
                    <span className="font-medium text-red-600">{analyticsData.bookings.byStatus.cancelled}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600">
                      Confirmation rate: {((analyticsData.bookings.byStatus.confirmed / analyticsData.bookings.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <EquipmentUsageTable />
            <TimeSlotAnalysis />
          </div>
        )}
      </div>
    </div>
  );
}

