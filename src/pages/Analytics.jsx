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
  BuildingOfficeIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ChartPieIcon,
  TableCellsIcon
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
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    fetchVenueAndAnalytics();
  }, [dateRange]);

  const exportCSV = async (reportType) => {
    if (!venue?.venueId) return;
    
    try {
      setExporting(true);
      
      // Use the API service for proper URL and headers
      const blob = await api.exportRevenueReport(venue.venueId, reportType);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType.toLowerCase()}_revenue_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Show success notification
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

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
          console.log('=== FRONTEND ANALYTICS DEBUG ===');
          console.log('Analytics data received:', analytics);
          console.log('Total Revenue:', analytics.totalRevenue);
          console.log('Court Revenue:', analytics.courtRevenue);
          console.log('Equipment Revenue:', analytics.equipmentRevenue);
          console.log('Total Bookings:', analytics.totalBookings);
          console.log('Confirmed Bookings:', analytics.confirmedBookings);
          console.log('Total Customers:', analytics.totalCustomers);
          console.log('New Customers:', analytics.newCustomers);
          console.log('Returning Customers:', analytics.returningCustomers);
          console.log('Court Occupancy:', analytics.courtOccupancy);
          console.log('Court Revenue Map:', analytics.courtRevenueMap);
          console.log('Equipment Usage:', analytics.equipmentUsage);
          console.log('Equipment Revenue Map:', analytics.equipmentRevenueMap);
          console.log('Monthly Trends:', analytics.monthlyTrends);
          console.log('=== END FRONTEND ANALYTICS DEBUG ===');
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

  const StatCard = ({ title, value, change, trend, icon: Icon, color, subtitle, description }) => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {description && <p className="text-xs text-gray-400 mt-1 italic">{description}</p>}
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
          <ChartBarIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        {/* Description */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>What this shows:</strong> Monthly revenue trends to help you track business growth 
            and identify seasonal patterns in your venue's performance.
          </p>
        </div>

        {months.length > 0 ? (
          <div className="h-64 flex items-end justify-between space-x-2">
            {months.map((month) => (
              <div key={month} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-gradient-to-t from-orange-500 to-orange-400 rounded-t w-full min-w-[30px] transition-all duration-300 hover:from-orange-600 hover:to-orange-500"
                  style={{ height: `${(monthlyData[month] / maxRevenue) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{month}</span>
                <span className="text-xs font-medium text-gray-900">
                  LKR {monthlyData[month].toLocaleString()}
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

  const RevenueBreakdownChart = () => {
    const courtRevenue = analyticsData.courtRevenue || 0;
    const equipmentRevenue = analyticsData.equipmentRevenue || 0;
    const totalRevenue = analyticsData.totalRevenue || 1;
    
    const courtPercentage = (courtRevenue / totalRevenue) * 100;
    const equipmentPercentage = (equipmentRevenue / totalRevenue) * 100;

    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Breakdown</h3>
          <ChartPieIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        {/* Description */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>What this shows:</strong> How your total revenue is split between court bookings 
            and equipment rentals. This helps you understand your revenue sources.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Court Bookings</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">LKR {courtRevenue.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{courtPercentage.toFixed(1)}%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${courtPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
              <span className="text-sm font-medium text-gray-700">Equipment Rentals</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">LKR {equipmentRevenue.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{equipmentPercentage.toFixed(1)}%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${equipmentPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  const OccupancyChart = () => {
    const courtOccupancy = analyticsData.courtOccupancy || {};
    const courtBookings = analyticsData.courtBookings || {};

    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Court Occupancy</h3>
          <ChartBarIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        {/* Description */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>What this shows:</strong> Percentage of time each court is booked vs. available time. 
            Higher occupancy means better utilization of your venue space.
          </p>
        </div>

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
    const courtRevenueMap = analyticsData.courtRevenueMap || {};
    const courtBookings = analyticsData.courtBookings || {};

    console.log('=== COURT PERFORMANCE DEBUG ===');
    console.log('Court Revenue Map:', courtRevenueMap);
    console.log('Court Bookings:', courtBookings);
    console.log('Courts:', courts);
    console.log('=== END COURT PERFORMANCE DEBUG ===');

    const courtData = courts.map(court => ({
      ...court,
      revenue: courtRevenueMap[court.courtId] || 0,
      bookings: courtBookings[court.courtId] || 0
    })).sort((a, b) => b.revenue - a.revenue);

    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Court Performance</h3>
          <TrophyIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        {/* Description */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>What this shows:</strong> Revenue and booking count for each court. 
            This helps you identify which courts are most popular and profitable.
          </p>
        </div>

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

  const KeyInsights = () => {
    const insights = [];
    
    // Revenue insights
    if (analyticsData.totalRevenue > 0) {
      const avgBookingValue = analyticsData.totalRevenue / analyticsData.totalBookings;
      insights.push({
        icon: CurrencyDollarIcon,
        title: "Average Booking Value",
        value: `LKR ${avgBookingValue.toFixed(0)}`,
        color: "text-green-600",
        bgColor: "bg-green-50"
      });
    }
    
    // Occupancy insights
    const maxOccupancy = Math.max(...Object.values(analyticsData.courtOccupancy || {}), 0);
    if (maxOccupancy > 0) {
      insights.push({
        icon: ChartBarIcon,
        title: "Peak Court Occupancy",
        value: `${maxOccupancy.toFixed(1)}%`,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      });
    }
    
    // Customer insights
    if (analyticsData.totalCustomers > 0) {
      // For single customer, show customer acquisition instead of retention
      if (analyticsData.totalCustomers === 1) {
        insights.push({
          icon: UserIcon,
          title: "Customer Acquisition",
          value: `${analyticsData.newCustomers} new customer${analyticsData.newCustomers > 1 ? 's' : ''}`,
          color: "text-green-600",
          bgColor: "bg-green-50"
        });
      } else {
        const retentionRate = (analyticsData.returningCustomers / analyticsData.totalCustomers) * 100;
        insights.push({
          icon: UserIcon,
          title: "Customer Retention",
          value: `${retentionRate.toFixed(1)}%`,
          color: "text-purple-600",
          bgColor: "bg-purple-50"
        });
      }
    }
    
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
          <TrophyIcon className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className={`p-4 rounded-lg ${insight.bgColor}`}>
              <div className="flex items-center">
                <insight.icon className={`h-6 w-6 ${insight.color} mr-3`} />
                <div>
                  <div className="text-sm font-medium text-gray-700">{insight.title}</div>
                  <div className={`text-lg font-semibold ${insight.color}`}>{insight.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TimeSlotAnalysis = () => {
    const peakHours = analyticsData.peakHours || [];
    const offPeakHours = analyticsData.offPeakHours || [];

    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Time Slot Analysis</h3>
          <ClockIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        {/* Description */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>What this shows:</strong> Peak hours are your busiest times with higher pricing, 
            while off-peak hours have lower pricing and more availability. This helps you understand 
            when your venue is most in demand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">Peak Hours</h4>
              <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">Higher Pricing</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Times when your venue is busiest and charges premium rates</p>
            <div className="space-y-1">
              {peakHours.length > 0 ? (
                peakHours.map((time) => (
                  <div key={time} className="text-sm text-gray-900 bg-red-50 px-3 py-2 rounded border-l-4 border-red-400">
                    {time}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded">No peak hours configured</div>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">Off-Peak Hours</h4>
              <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Lower Pricing</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Times with lower demand and discounted rates</p>
            <div className="space-y-1">
              {offPeakHours.length > 0 ? (
                offPeakHours.map((time) => (
                  <div key={time} className="text-sm text-gray-900 bg-green-50 px-3 py-2 rounded border-l-4 border-green-400">
                    {time}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded">No off-peak hours configured</div>
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
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
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
              
              {/* Export Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchVenueAndAnalytics}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <button
                  onClick={() => exportCSV('weekly')}
                  disabled={exporting}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  ) : (
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  )}
                  Weekly Report
                </button>
                <button
                  onClick={() => exportCSV('monthly')}
                  disabled={exporting}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  ) : (
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  )}
                  Monthly Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Notification */}
        {exportSuccess && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in">
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span>Report exported successfully!</span>
          </div>
        )}

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
                value={`LKR ${analyticsData.totalRevenue.toLocaleString()}`}
                change={analyticsData.revenueChange}
                trend={analyticsData.revenueTrend}
                icon={CurrencyDollarIcon}
                color="bg-green-500"
                subtitle={`Court: LKR ${analyticsData.courtRevenue.toLocaleString()}`}
                description="Total income from all bookings and equipment rentals"
              />
              <StatCard
                title="Total Bookings"
                value={analyticsData.totalBookings}
                change={0}
                trend="neutral"
                icon={CalendarIcon}
                color="bg-blue-500"
                subtitle={`Confirmed: ${analyticsData.confirmedBookings}`}
                description="All bookings including confirmed, pending, and cancelled"
              />
              <StatCard
                title="Active Customers"
                value={analyticsData.totalCustomers}
                change={0}
                trend="neutral"
                icon={UserIcon}
                color="bg-purple-500"
                subtitle={`New: ${analyticsData.newCustomers}`}
                description="Unique customers who have made bookings"
              />
              <StatCard
                title="Equipment Revenue"
                value={`LKR ${analyticsData.equipmentRevenue.toLocaleString()}`}
                change={0}
                trend="neutral"
                icon={TrophyIcon}
                color="bg-orange-500"
                subtitle={`${equipment.length} items`}
                description="Income from equipment rentals and accessories"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart />
              <OccupancyChart />
            </div>

            {/* Key Insights */}
            <KeyInsights />

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart />
              <RevenueBreakdownChart />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PopularCourtsTable />
              <EquipmentUsageTable />
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