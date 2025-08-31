import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TrophyIcon
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

export default function Venues() {
  const { user } = useAuth();
  const [venues, setVenues] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [courtSearchTerm, setCourtSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [venueTypeFilter, setVenueTypeFilter] = useState("ALL");
  const [courtTypeFilter, setCourtTypeFilter] = useState("ALL");

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      
      if (!user?.userId) {
        console.error('User not authenticated');
        setVenues([]);
        setCourts([]);
        return;
      }

      // Fetch single venue from backend (each owner has only one venue)
      try {
        const venueData = await api.getVenueByOwner(user.userId);
        console.log('=== DEBUG: Venue Data Received ===');
        console.log('Raw venueData:', venueData);
        console.log('venueData.venueId:', venueData?.venueId);
        console.log('venueData type:', typeof venueData);
        console.log('venueData keys:', venueData ? Object.keys(venueData) : 'null');
        console.log('===============================');
        
        if (venueData && venueData.venueId) {
          // Transform the data to match our frontend structure
          const transformedVenue = {
            venueId: venueData.venueId,
            name: venueData.name,
            location: venueData.location,
            address: venueData.address,
            venueType: venueData.venueType || 'INDOOR',
            status: venueData.status || 'ACTIVE',
            maxCapacity: venueData.maxCapacity || 100,
            basePrice: venueData.basePrice || 0.0,
            totalCourts: venueData.courts?.length || 0,
            totalRevenue: 0, // Will be calculated from analytics
            lastBooking: null, // Will be fetched separately if needed
            images: venueData.images || [],
            description: venueData.description,
            contactNo: venueData.contactNo
          };
          
          console.log('=== DEBUG: Transformed Venue ===');
          console.log('transformedVenue:', transformedVenue);
          console.log('transformedVenue.venueId:', transformedVenue.venueId);
          console.log('===============================');
          
          setVenues([transformedVenue]);
          
          // Set courts if they exist
          if (venueData.courts && Array.isArray(venueData.courts)) {
            setCourts(venueData.courts);
          } else {
            setCourts([]);
          }
        } else {
          // No venue data
          console.log('=== DEBUG: No Venue ID Found ===');
          console.log('venueData exists:', !!venueData);
          console.log('venueData.venueId:', venueData?.venueId);
          console.log('===============================');
          setVenues([]);
          setCourts([]);
        }
      } catch (error) {
        // If no venue exists, show empty state
        console.log('No venue found for owner, showing empty state');
        setVenues([]);
        setCourts([]);
      }
    } catch (error) {
      console.error("Error fetching venue:", error);
      // Show error message to user
      alert(`Failed to fetch venue: ${error.message}`);
      setVenues([]);
      setCourts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter(venue => {
    // Add null safety checks before calling toLowerCase()
    const venueName = venue.name || '';
    const venueLocation = venue.location || '';
    
    const matchesSearch = venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venueLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || venue.status === statusFilter;
    const matchesType = venueTypeFilter === "ALL" || venue.venueType === venueTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredCourts = courts.filter(court => {
    const courtName = court.name || '';
    const courtType = court.courtType || '';
    
    const matchesSearch = courtName.toLowerCase().includes(courtSearchTerm.toLowerCase()) ||
                         courtType.toLowerCase().includes(courtSearchTerm.toLowerCase());
    const matchesType = courtTypeFilter === "ALL" || court.courtType === courtTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVenueTypeColor = (type) => {
    switch (type) {
      case 'INDOOR': return 'bg-blue-100 text-blue-800';
      case 'OUTDOOR': return 'bg-green-100 text-green-800';
      case 'MIXED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCourtTypeColor = (type) => {
    switch (type) {
      case 'TENNIS': return 'bg-green-100 text-green-800';
      case 'BADMINTON': return 'bg-blue-100 text-blue-800';
      case 'SQUASH': return 'bg-purple-100 text-purple-800';
      case 'BASKETBALL': return 'bg-orange-100 text-orange-800';
      case 'FOOTBALL': return 'bg-red-100 text-red-800';
      case 'CRICKET': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteVenue = async (venueId) => {
    if (window.confirm("Are you sure you want to delete this venue? This action cannot be undone.")) {
      try {
        // TODO: Replace with real API call
        setVenues(venues.filter(v => v.venueId !== venueId));
        setCourts([]);
        console.log("Venue deleted:", venueId);
      } catch (error) {
        console.error("Error deleting venue:", error);
      }
    }
  };

  const handleDeleteCourt = async (courtId) => {
    if (window.confirm("Are you sure you want to delete this court? This action cannot be undone.")) {
      try {
        // TODO: Replace with real API call
        setCourts(courts.filter(c => c.courtId !== courtId));
        console.log("Court deleted:", courtId);
      } catch (error) {
        console.error("Error deleting court:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If no venues exist, show clean empty state
  if (venues.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-orange-100 mb-6">
            <BuildingOfficeIcon className="h-12 w-12 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Playera!</h1>
          <p className="text-gray-600 mb-8 text-lg">
            You're all set up as a venue owner! Now it's time to create your sports venue and start managing courts, equipment, and bookings.
          </p>
          <Link
            to="/add-venue"
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors shadow-lg"
          >
            <PlusIcon className="h-6 w-6 mr-3" />
            Create Your First Venue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Venue</h1>
            <p className="text-gray-600 mt-2">Manage your sports venue, courts, and facilities</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link
              to={`/add-court/${venues[0].venueId}`}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Court
            </Link>
            <Link
              to={`/venues/${venues[0].venueId}/timeslots`}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <ClockIcon className="h-5 w-5 mr-2" />
              Time Slots
            </Link>
            <Link
              to={`/edit-venue/${venues[0].venueId}`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Edit Venue
            </Link>
          </div>
        </div>

        {/* Venue Info Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Venue Details</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600"><span className="font-medium">Name:</span> {venues[0].name}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Location:</span> {venues[0].location}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Type:</span> {venues[0].venueType}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Status:</span> 
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(venues[0].status)}`}>
                    {venues[0].status}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Stats</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600"><span className="font-medium">Total Courts:</span> {courts.length}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Base Price:</span> LKR {venues[0].basePrice}/hour</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Max Capacity:</span> {venues[0].maxCapacity}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Actions</h3>
              <div className="space-y-2">
                <Link
                  to={`/add-court/${venues[0].venueId}`}
                  className="block w-full text-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                >
                  <PlusIcon className="h-4 w-4 inline mr-2" />
                  Add Court
                </Link>
                <Link
                  to={`/edit-venue/${venues[0].venueId}`}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                >
                  <PencilIcon className="h-4 w-4 inline mr-2" />
                  Edit Venue
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Courts Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Courts</h2>
              <p className="text-gray-600 mt-1">Manage your sports courts and facilities</p>
            </div>
            <Link
              to={`/add-court/${venues[0].venueId}`}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Court
            </Link>
          </div>

          {/* Court Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courts..."
                value={courtSearchTerm}
                onChange={(e) => setCourtSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <select
                value={courtTypeFilter}
                onChange={(e) => setCourtTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="ALL">All Court Types</option>
                <option value="TENNIS">Tennis</option>
                <option value="BADMINTON">Badminton</option>
                <option value="SQUASH">Squash</option>
                <option value="BASKETBALL">Basketball</option>
                <option value="FOOTBALL">Football</option>
                <option value="CRICKET">Cricket</option>
              </select>
            </div>
            <div className="flex items-center justify-end text-sm text-gray-600">
              {filteredCourts.length} court{filteredCourts.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Courts Grid */}
          {courts.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <TrophyIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Courts Yet</h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first sports court to your venue.
              </p>
              <Link
                to={`/add-court/${venues[0].venueId}`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Your First Court
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourts.map((court) => (
                <div key={court.courtId} className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{court.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCourtTypeColor(court.courtType)}`}>
                      {court.courtType}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {court.courtType}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Price:</span> LKR {court.pricePerHour || 0}/hour
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(court.status || 'ACTIVE')}`}>
                        {court.status || 'ACTIVE'}
                      </span>
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/edit-court/${court.courtId}`}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteCourt(court.courtId)}
                      className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

