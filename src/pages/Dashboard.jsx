import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BuildingOfficeIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  ClockIcon,
  UsersIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [venue, setVenue] = useState(null);
  const [stats, setStats] = useState({
    totalCourts: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    activeBookings: 0
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch venue and dashboard data from API
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Fetch venue data when component mounts
    fetchVenueData();
  }, []);

  const fetchVenueData = async () => {
    try {
      if (!user?.userId) {
        console.error('User not authenticated');
        return;
      }

      // Fetch venue data from backend
      try {
        const venueData = await api.getVenueByOwner(user.userId);
        setVenue(venueData);
      } catch (error) {
        if (error.message.includes('Venue not found for owner')) {
          // This is expected for new venue owners
          console.log('No venue found - new venue owner');
          setVenue(null);
        } else {
          console.error("Error fetching venue data:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching venue data:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      if (!user?.userId) {
        console.error('User not authenticated');
        return;
      }

      // Only fetch dashboard data if venue exists
      if (venue) {
        // TODO: Replace with real API calls to get venue-specific analytics
        setStats({
          totalCourts: venue?.courts?.length || 0,
          totalBookings: 0, // Will be fetched from real API
          totalRevenue: 0,   // Will be fetched from real API
          pendingBookings: 0, // Will be fetched from real API
          activeBookings: 0   // Will be fetched from real API
        });

        // TODO: Replace with real API call for recent bookings
        setRecentBookings([]);
      } else {
        // For new venue owners, show setup-focused stats
        setStats({
          totalCourts: 0,
          totalBookings: 0,
          totalRevenue: 0,
          pendingBookings: 0,
          activeBookings: 0
        });
        setRecentBookings([]);
      }
          } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setStats({
          totalCourts: 0,
          totalBookings: 0,
          totalRevenue: 0,
          pendingBookings: 0,
          activeBookings: 0
        });
        setRecentBookings([]);
      } finally {
        setLoading(false);
      }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change !== null && change !== undefined && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, href, color }) => (
    <Link to={href} className="block">
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
        <div className={`p-3 rounded-lg ${color} w-fit mb-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your venues today.</p>
        </div>

        {/* Venue Info or Welcome Screen */}
        {venue ? (
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{venue.name}</h2>
                <p className="text-gray-600 mt-1">{venue.description}</p>
                <p className="text-gray-500 mt-1">{venue.address}, {venue.location}</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  venue.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {venue.status}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Your Venue Dashboard!</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                You're just a few steps away from managing your sports venue. Create your venue to start accepting bookings, 
                managing courts, and tracking your business performance. The setup process is quick and easy!
              </p>
              
              {/* Setup Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-4xl mx-auto">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                  <h4 className="font-medium text-gray-900 mb-1">Create Venue</h4>
                  <p className="text-sm text-gray-600">Set up your venue details and location</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                  <h4 className="font-medium text-gray-900 mb-1">Add Courts</h4>
                  <p className="text-sm text-gray-600">Create different types of sports courts</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                  <h4 className="font-medium text-gray-900 mb-1">Start Accepting</h4>
                  <p className="text-sm text-gray-600">Begin taking bookings from customers</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/add-venue"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Your First Venue
                </Link>
                <Link
                  to="/venues"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  View Documentation
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {venue ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Courts"
              value={stats.totalCourts}
              icon={UsersIcon}
              color="bg-green-500"
              change={12}
            />
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              icon={ChartBarIcon}
              color="bg-purple-500"
              change={8}
            />
            <StatCard
              title="Total Revenue"
              value={`LKR ${stats.totalRevenue.toLocaleString()}`}
              icon={CurrencyDollarIcon}
              color="bg-orange-500"
              change={15}
            />
            <StatCard
              title="Pending Bookings"
              value={stats.pendingBookings}
              icon={ClockIcon}
              color="bg-blue-500"
              change={5}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Next Steps"
              value="1"
              icon={PlusIcon}
              color="bg-blue-500"
              change={null}
            />
            <StatCard
              title="Setup Time"
              value="~15 min"
              icon={ClockIcon}
              color="bg-green-500"
              change={null}
            />
            <StatCard
              title="Features"
              value="Unlimited"
              icon={StarIcon}
              color="bg-purple-500"
              change={null}
            />
            <StatCard
              title="Support"
              value="24/7"
              icon={UsersIcon}
              color="bg-orange-500"
              change={null}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {venue ? 'Quick Actions' : 'Get Started'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              title={venue ? "Manage Venue" : "Create Venue"}
              description={venue ? "Edit venue details, amenities, and business settings" : "Set up your sports venue with courts and facilities"}
              icon={BuildingOfficeIcon}
              href={venue ? `/edit-venue/${venue.venueId}` : "/add-venue"}
              color="bg-blue-500"
            />
            {venue && (
              <>
                <QuickActionCard
                  title="Manage Bookings"
                  description="View and manage all venue bookings and reservations"
                  icon={CalendarIcon}
                  href="/bookings"
                  color="bg-green-500"
                />
                <QuickActionCard
                  title="Manage Time Slots"
                  description="Configure court availability, maintenance schedules, and operating hours"
                  icon={ClockIcon}
                  href={`/venues/${venue.venueId}/timeslots`}
                  color="bg-purple-500"
                />
                <QuickActionCard
                  title="Manage Equipment"
                  description="Add and manage rental equipment for your courts"
                  icon={StarIcon}
                  href={`/venues/${venue.venueId}/equipment`}
                  color="bg-green-500"
                />
                <QuickActionCard
                  title="View Analytics"
                  description="Analyze revenue, occupancy, and performance metrics"
                  icon={ChartBarIcon}
                  href="/analytics"
                  color="bg-indigo-500"
                />
                <QuickActionCard
                  title="Settings"
                  description="Configure business rules, notifications, and preferences"
                  icon={StarIcon}
                  href="/venues"
                  color="bg-orange-500"
                />
              </>
            )}
            {!venue && (
              <>
                <QuickActionCard
                  title="Add Courts"
                  description="Create different types of sports courts for your venue"
                  icon={UsersIcon}
                  href="/add-venue"
                  color="bg-green-500"
                />
                <QuickActionCard
                  title="Add Equipment"
                  description="Set up equipment rental for your sports facilities"
                  icon={StarIcon}
                  href="/add-venue"
                  color="bg-purple-500"
                />
                <QuickActionCard
                  title="Learn More"
                  description="Discover all the features available for venue owners"
                  icon={ChartBarIcon}
                  href="/venues"
                  color="bg-orange-500"
                />
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {venue ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              </div>
              <div className="p-6">
                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{booking.customerName}</p>
                          <p className="text-sm text-gray-600">{booking.venueName} - {booking.courtName}</p>
                          <p className="text-sm text-gray-500">{booking.date} • {booking.time}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'CONFIRMED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            LKR {booking.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent bookings</p>
                )}
                <div className="mt-4">
                  <Link to="/bookings" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                    View all bookings →
                  </Link>
                </div>
              </div>
            </div>

            {/* Pending Actions */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Pending Actions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Pending Bookings</p>
                        <p className="text-sm text-gray-600">{stats.pendingBookings} require approval</p>
                      </div>
                    </div>
                    <Link to="/bookings" className="text-yellow-700 hover:text-yellow-800 text-sm font-medium">
                      Review →
                    </Link>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <UsersIcon className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Active Bookings</p>
                        <p className="text-sm text-gray-600">{stats.activeBookings} ongoing today</p>
                      </div>
                    </div>
                    <Link to="/bookings" className="text-blue-700 hover:text-blue-800 text-sm font-medium">
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Your Venue Dashboard!</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                You're just a few steps away from managing your sports venue. Create your venue to start accepting bookings, 
                managing courts, and tracking your business performance. The setup process is quick and easy!
              </p>
              
              {/* Setup Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-4xl mx-auto">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                  <h4 className="font-medium text-gray-900 mb-1">Create Venue</h4>
                  <p className="text-sm text-gray-600">Set up your venue details and location</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                  <h4 className="font-medium text-gray-900 mb-1">Add Courts</h4>
                  <p className="text-sm text-gray-600">Create different types of sports courts</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                  <h4 className="font-medium text-gray-900 mb-1">Start Accepting</h4>
                  <p className="text-sm text-gray-600">Begin taking bookings from customers</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/add-venue"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Your First Venue
                </Link>
                <Link
                  to="/venues"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  View Documentation
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
