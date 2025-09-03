import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function BookingManagement() {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [venue, setVenue] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [courtFilter, setCourtFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchVenueAndBookings();
  }, [venueId]);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter, courtFilter, searchTerm, dateFilter, dateRange]);

  const fetchVenueAndBookings = async () => {
    try {
      setLoading(true);
      if (!user?.userId) {
        console.error('User not authenticated');
        setVenue(null);
        setBookings([]);
        return;
      }

      // Fetch venue data first
      const venueData = await api.getVenueByOwner(user.userId);
      console.log('Venue data received:', venueData);
      
      if (venueData && venueData.venueId) {
        setVenue({
          name: venueData.name || 'Sports Venue',
          venueId: venueData.venueId
        });

        // Fetch real bookings from backend - using same approach as mobile app
        // First try to get all bookings and filter by venue
        const allBookingsData = await api.getBookings(); // Get all bookings
        console.log('=== VENUE DASHBOARD API DEBUG ===');
        console.log('All bookings data received:', allBookingsData);
        console.log('Number of bookings:', allBookingsData.length);
        
        // Check first few bookings for timeSlotRanges
        if (allBookingsData.length > 0) {
          console.log('First booking timeSlotRanges:', allBookingsData[0].timeSlotRanges);
          console.log('First booking structure:', Object.keys(allBookingsData[0]));
        }
        console.log('=== END VENUE DASHBOARD API DEBUG ===');
        
        // Filter bookings for this venue
        const bookingsData = allBookingsData.filter(booking => 
          booking.venueId === venueData.venueId
        );
        console.log('Filtered bookings for venue:', bookingsData);
        
        if (bookingsData && Array.isArray(bookingsData)) {
          // Transform backend data to match frontend structure
          const transformedBookings = bookingsData.map(booking => ({
            bookingId: booking.bookingId,
            customerName: booking.customerName || 'Unknown Customer',
            customerEmail: booking.customerEmail || 'No email',
            customerPhone: booking.customerPhone || 'No phone',
            venueName: venueData.name,
            courtName: booking.courtBookings?.[0]?.courtName || 'Unknown Court',
            courtType: booking.courtBookings?.[0]?.courtType || 'UNKNOWN',
            date: booking.bookingDate ? new Date(booking.bookingDate).toISOString().split('T')[0] : 'Unknown Date',
            startTime: booking.startTime || '00:00',
            endTime: booking.endTime || '00:00',
            duration: booking.duration || 0,
            status: booking.status || 'PENDING',
            totalCost: booking.totalCost || 0,
            courtCost: booking.totalCost || 0, // Simplified for now
            equipmentCost: 0, // Will be calculated from equipment bookings
            specialRequests: booking.specialRequests || '',
            bookingDate: booking.createdAt || new Date().toISOString(),
            paymentStatus: 'PENDING', // Default for now
            equipmentBookings: booking.equipmentBookings?.map(eq => ({
              name: eq.name || 'Unknown Equipment',
              quantity: eq.quantity || 0,
              cost: eq.totalPrice || 0
            })) || []
          }));
          
          setBookings(transformedBookings);
        } else {
          console.log('No bookings data or invalid format:', bookingsData);
          setBookings([]);
        }
      } else {
        console.log('No venue data or invalid venue ID:', venueData);
        setVenue(null);
        setBookings([]);
      }
          } catch (error) {
        console.error('Error fetching venue and bookings:', error);
        setVenue(null);
        setBookings([]);
      } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Court filter
    if (courtFilter !== 'all') {
      filtered = filtered.filter(booking => booking.courtType === courtFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(booking => booking.date === today);
    } else if (dateFilter === 'tomorrow') {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      filtered = filtered.filter(booking => booking.date === tomorrow);
    } else if (dateFilter === 'thisWeek') {
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
      });
    } else if (dateFilter === 'custom' && dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.date);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        return bookingDate >= startDate && bookingDate <= endDate;
      });
    }

    setFilteredBookings(filtered);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      // TODO: Replace with real API call
      // await api.updateBookingStatus(bookingId, newStatus);
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.bookingId === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'NO_SHOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // Handle LocalTime format from backend (HH:MM:SS)
    if (typeof timeString === 'string' && timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeString.substring(0, 5); // "06:00:00" -> "06:00"
    }
    
    // If it's already in HH:MM format, return as is
    if (typeof timeString === 'string' && timeString.includes(':') && timeString.split(':').length === 2) {
      return timeString;
    }
    
    // If it's in HH:MM:SS format, remove seconds
    if (typeof timeString === 'string' && timeString.includes(':') && timeString.split(':').length === 3) {
      return timeString.substring(0, 5); // Remove seconds
    }
    
    return timeString;
  };

  const calculateStats = () => {
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length;
    const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'CONFIRMED' && b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + b.totalCost, 0);
    const todayBookings = bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length;

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalRevenue,
      todayBookings
    };
  };

  const BookingModal = ({ isOpen, onClose, booking }) => {
    if (!isOpen || !booking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Customer Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="text-gray-900">{booking.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p className="text-gray-900">{booking.customerPhone}</p>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Booking Details
              </h3>
              
              {/* General Booking Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Date</p>
                  <p className="text-gray-900">{new Date(booking.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Duration</p>
                  <p className="text-gray-900">{booking.duration} hours</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Court Bookings */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-2">Court Bookings</h4>
                <div className="space-y-3">
                  {booking.courtBookings && booking.courtBookings.length > 0 ? (
                    booking.courtBookings.map((courtBooking, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Court</p>
                            <p className="text-gray-900">{courtBooking.courtName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Type</p>
                            <p className="text-gray-900 capitalize">{courtBooking.courtType?.toLowerCase() || 'Unknown'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Duration</p>
                            <p className="text-gray-900">{courtBooking.timeDuration} hours</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-600">Time Slot</p>
                          {booking.timeSlotRanges && booking.timeSlotRanges.length > 0 ? (
                            <div className="text-gray-900">
                              {booking.timeSlotRanges.map((range, index) => (
                                <p key={index}>
                                  {formatTime(range.startTime)} - {formatTime(range.endTime)}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-900">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-lg border">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Court</p>
                          <p className="text-gray-900">{booking.courtName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Type</p>
                          <p className="text-gray-900 capitalize">{booking.courtType?.toLowerCase() || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Duration</p>
                          <p className="text-gray-900">{booking.duration} hours</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-600">Time Slot</p>
                        {(() => {
                          console.log('=== DASHBOARD MODAL TIME DISPLAY DEBUG ===');
                          console.log('Booking ID:', booking.bookingId);
                          console.log('timeSlotRanges:', booking.timeSlotRanges);
                          console.log('timeSlotRanges length:', booking.timeSlotRanges?.length);
                          console.log('startTime:', booking.startTime);
                          console.log('endTime:', booking.endTime);
                          console.log('=== END DASHBOARD MODAL TIME DISPLAY DEBUG ===');
                          
                          return booking.timeSlotRanges && booking.timeSlotRanges.length > 0 ? (
                            <div className="text-gray-900">
                              {booking.timeSlotRanges.map((range, index) => (
                                <p key={index}>
                                  {formatTime(range.startTime)} - {formatTime(range.endTime)}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-900">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Equipment */}
            {booking.equipmentBookings && booking.equipmentBookings.length > 0 && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Equipment</h3>
                <div className="space-y-3">
                  {booking.equipmentBookings.map((equipment, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Equipment</p>
                          <p className="text-gray-900">{equipment.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Quantity</p>
                          <p className="text-gray-900">x{equipment.quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Cost</p>
                          <p className="text-gray-900 font-medium">LKR {equipment.cost}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Requests</h3>
                <p className="text-gray-700">{booking.specialRequests}</p>
              </div>
            )}

            {/* Cost Breakdown */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                Cost Breakdown
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Court Cost:</span>
                  <span>LKR {booking.courtCost}</span>
                </div>
                {booking.equipmentCost > 0 && (
                  <div className="flex justify-between">
                    <span>Equipment Cost:</span>
                    <span>LKR {booking.equipmentCost}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>LKR {booking.totalCost}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {booking.status === 'PENDING' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    handleStatusChange(booking.bookingId, 'CONFIRMED');
                    onClose();
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => {
                    handleStatusChange(booking.bookingId, 'CANCELLED');
                    onClose();
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center"
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const stats = calculateStats();

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading bookings...</p>
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
            Before you can manage bookings, you need to create a venue first. This will be your sports facility where customers can book courts and equipment.
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all bookings for {venue?.name}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <CheckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.confirmedBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <CurrencyDollarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">LKR {stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-500">
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayBookings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Customer, court, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Court Type</label>
              <select
                value={courtFilter}
                onChange={(e) => setCourtFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Courts</option>
                <option value="BASKETBALL">Basketball</option>
                <option value="FUTSAL">Futsal</option>
                <option value="BADMINTON">Badminton</option>
                <option value="TENNIS">Tennis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Filter</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="thisWeek">This Week</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateFilter === 'custom' && (
              <div className="col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Bookings ({filteredBookings.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Court
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.bookingId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                        <div className="text-sm text-gray-500">{booking.customerPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.courtName}</div>
                        <div className="text-sm text-gray-500 capitalize">{booking.courtType.toLowerCase()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {(() => {
                            console.log('=== DASHBOARD TIME DISPLAY DEBUG ===');
                            console.log('Booking ID:', booking.bookingId);
                            console.log('timeSlotRanges:', booking.timeSlotRanges);
                            console.log('timeSlotRanges length:', booking.timeSlotRanges?.length);
                            console.log('startTime:', booking.startTime);
                            console.log('endTime:', booking.endTime);
                            console.log('=== END DASHBOARD TIME DISPLAY DEBUG ===');
                            
                            return booking.timeSlotRanges && booking.timeSlotRanges.length > 0 ? (
                              booking.timeSlotRanges.map((range, index) => (
                                <div key={index}>
                                  {formatTime(range.startTime)} - {formatTime(range.endTime)}
                                </div>
                              ))
                            ) : (
                              <div>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</div>
                            );
                          })()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      LKR {booking.totalCost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowBookingModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        
                        {booking.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(booking.bookingId, 'CONFIRMED')}
                              className="text-green-600 hover:text-green-700 p-1"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(booking.bookingId, 'CANCELLED')}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
      />
    </div>
  );
}

