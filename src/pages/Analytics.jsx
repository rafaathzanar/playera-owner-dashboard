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
  ExclamationTriangleIcon,
  PlusIcon,
  TrophyIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function Analytics() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [venue, setVenue] = useState(null);
  const [courts, setCourts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVenueAndAnalytics();
  }, [dateRange]);

  const fetchVenueAndAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.userId) {
        console.error('User not authenticated');
        setVenue(null);
        setAnalyticsData(null);
        return;
      }

      // Fetch venue data first
      const venueData = await api.getVenueByOwner(user.userId);
      console.log('Venue data received:', venueData);
      
      if (venueData && venueData.venueId) {
        setVenue(venueData);
        
        // Fetch courts and equipment
        try {
          const courtsData = await api.getCourts(venueData.venueId);
          setCourts(courtsData || []);
        } catch (error) {
          console.log('No courts found');
          setCourts([]);
        }

        try {
          const equipmentData = await api.getEquipment(venueData.venueId);
          setEquipment(equipmentData || []);
        } catch (error) {
          console.log('No equipment found');
          setEquipment([]);
        }

        // Fetch analytics data
        try {
          const analytics = await api.getVenueAnalytics(venueData.venueId, dateRange);
          console.log('Analytics data received:', analytics);
          setAnalyticsData(analytics);
        } catch (error) {
          console.error('Error fetching analytics:', error);
          setError('Failed to load analytics data');
          // Set empty analytics data structure
          setAnalyticsData({
            totalRevenue: 0,
            courtRevenue: 0,
            equipmentRevenue: 0,
            revenueChange: 0,
            revenueTrend: 'neutral',
            totalBookings: 0,
            confirmedBookings: 0,
            pendingBookings: 0,
            cancelledBookings: 0,
            totalCustomers: 0,
            newCustomers: 0,
            returningCustomers: 0,
            courtOccupancy: {},
            courtBookings: {},
            courtRevenue: {},
            equipmentUsage: {},
            equipmentRevenueMap: {},
            peakHours: [],
            offPeakHours: [],
            monthlyTrends: {}
          });
        }
      } else {
        console.log('No venue data or invalid venue ID:', venueData);
        setVenue(null);
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error('Error fetching venue and analytics:', error);
      setError('Failed to load venue data');
      setVenue(null);
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, trend, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {change !== undefined && (
            <div className="flex items-center mt-1">
              {trend === 'up' ? (
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : trend === 'down' ? (
                <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
              ) : null}
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const RevenueChart = () => {
    const monthlyData = analyticsData.monthlyTrends || {};
    const months = Object.keys(monthlyData);
    const maxRevenue = Math.max(...Object.values(monthlyData), 1);

    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
        {months.length > 0 ? (
          <div className="h-64 flex items-end justify-between space-x-2">
            {months.map((month) => (
              <div key={month} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-orange-500 rounded-t w-full min-w-[30px]"
                  style={{ height: `${(monthlyData[month] / maxRevenue) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{month}</span>
                <span className="text-xs font-medium text-gray-900">
                  LKR {(monthlyData[month] / 1000).toFixed(0)}k
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No revenue data available</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const OccupancyChart = () => {
    const courtOccupancy = analyticsData.courtOccupancy || {};
    const courtBookings = analyticsData.courtBookings || {};

    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Court Occupancy</h3>
        {courts.length > 0 ? (
          <div className="space-y-4">
            {courts.map((court) => {
              const occupancy = courtOccupancy[court.courtId] || 0;
              const bookings = courtBookings[court.courtId] || 0;
              return (
                <div key={court.courtId}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{court.courtName}</span>
                    <span className="text-sm font-medium text-gray-900">{occupancy.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(occupancy, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{bookings} bookings</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrophyIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No courts available</p>
          </div>
        )}
      </div>
    );
  };

  const PopularCourtsTable = () => {
    const courtRevenue = analyticsData.courtRevenue || {};
    const courtBookings = analyticsData.courtBookings || {};

    const courtData = courts.map(court => ({
      ...court,
      revenue: courtRevenue[court.courtId] || 0,
      bookings: courtBookings[court.courtId] || 0
    })).sort((a, b) => b.revenue - a.revenue);

    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Court Performance</h3>
        {courtData.length > 0 ? (
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
                {courtData.map((court) => (
                  <tr key={court.courtId}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {court.courtName}
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
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrophyIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No court data available</p>
          </div>
        )}
      </div>
    );
  };

  const EquipmentUsageTable = () => {
    const equipmentUsage = analyticsData.equipmentUsage || {};
    const equipmentRevenue = analyticsData.equipmentRevenueMap || {};

    const equipmentData = equipment.map(eq => ({
      ...eq,
      usage: equipmentUsage[eq.equipmentId] || 0,
      revenue: equipmentRevenue[eq.equipmentId] || 0
    })).sort((a, b) => b.revenue - a.revenue);

    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Usage</h3>
        {equipmentData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipmentData.map((eq) => (
                  <tr key={eq.equipmentId}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {eq.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {eq.usage}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      LKR {eq.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrophyIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No equipment data available</p>
          </div>
        )}
      </div>
    );
  };

  const TimeSlotAnalysis = () => {
    const peakHours = analyticsData.peakHours || [];
    const offPeakHours = analyticsData.offPeakHours || [];

    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Slot Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Peak Hours</h4>
            <div className="space-y-1">
              {peakHours.length > 0 ? (
                peakHours.map((time) => (
                  <div key={time} className="text-sm text-gray-900 bg-red-50 px-3 py-1 rounded">
                    {time}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No peak hours data</div>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Off-Peak Hours</h4>
            <div className="space-y-1">
              {offPeakHours.length > 0 ? (
                offPeakHours.map((time) => (
                  <div key={time} className="text-sm text-gray-900 bg-green-50 px-3 py-1 rounded">
                    {time}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No off-peak hours data</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Show onboarding state if no venue found
  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
            <PlusIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your First Venue</h3>
          <p className="text-gray-600 mb-6">
            Before you can view analytics, you need to create a venue first. This will be your sports facility where customers can book courts and equipment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/add-venue')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Venue
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchVenueAndAnalytics}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            Try Again
          </button>
        </div>
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
                value={`LKR ${(analyticsData.totalRevenue / 1000).toFixed(0)}k`}
                change={analyticsData.revenueChange}
                trend={analyticsData.revenueTrend}
                icon={CurrencyDollarIcon}
                color="bg-green-500"
                subtitle={`Court: LKR ${(analyticsData.courtRevenue / 1000).toFixed(0)}k`}
              />
              <StatCard
                title="Total Bookings"
                value={analyticsData.totalBookings}
                change={0}
                trend="neutral"
                icon={CalendarIcon}
                color="bg-blue-500"
                subtitle={`Confirmed: ${analyticsData.confirmedBookings}`}
              />
              <StatCard
                title="Active Customers"
                value={analyticsData.totalCustomers}
                change={0}
                trend="neutral"
                icon={UserIcon}
                color="bg-purple-500"
                subtitle={`New: ${analyticsData.newCustomers}`}
              />
              <StatCard
                title="Equipment Revenue"
                value={`LKR ${(analyticsData.equipmentRevenue / 1000).toFixed(0)}k`}
                change={0}
                trend="neutral"
                icon={TrophyIcon}
                color="bg-orange-500"
                subtitle={`${equipment.length} items`}
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
                    <span className="font-medium">LKR {analyticsData.courtRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Equipment Rentals</span>
                    <span className="font-medium">LKR {analyticsData.equipmentRevenue.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total</span>
                      <span>LKR {analyticsData.totalRevenue.toLocaleString()}</span>
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
                    {courts.length > 0 ? Math.max(...Object.values(analyticsData.courtOccupancy || {})).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-green-800">Highest Occupancy</div>
                  <div className="text-xs text-green-600">Best performing court</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {courts.length > 0 ? (Object.values(analyticsData.courtOccupancy || {}).reduce((a, b) => a + b, 0) / courts.length).toFixed(1) : 0}%
                  </div>
                  <div className="text-sm text-blue-800">Average Occupancy</div>
                  <div className="text-xs text-blue-600">All Courts</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {courts.length > 0 ? Math.min(...Object.values(analyticsData.courtOccupancy || {}), 0).toFixed(1) : 0}%
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
                    <span className="font-medium">{analyticsData.totalCustomers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">New Customers</span>
                    <span className="font-medium text-green-600">{analyticsData.newCustomers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Returning Customers</span>
                    <span className="font-medium text-blue-600">{analyticsData.returningCustomers}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600">
                      Customer retention rate: {analyticsData.totalCustomers > 0 ? ((analyticsData.returningCustomers / analyticsData.totalCustomers) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Confirmed</span>
                    <span className="font-medium text-green-600">{analyticsData.confirmedBookings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Pending</span>
                    <span className="font-medium text-yellow-600">{analyticsData.pendingBookings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Cancelled</span>
                    <span className="font-medium text-red-600">{analyticsData.cancelledBookings}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600">
                      Confirmation rate: {analyticsData.totalBookings > 0 ? ((analyticsData.confirmedBookings / analyticsData.totalBookings) * 100).toFixed(1) : 0}%
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