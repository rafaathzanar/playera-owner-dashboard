import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  WifiIcon,
  TruckIcon,
  StarIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch real venue data
  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        setLoading(true);
        
        // Fetch venue details
        const venueData = await api.getVenueById(id);
        console.log('Venue data received:', venueData);
        
        if (venueData && venueData.venueId) {
          // Fetch courts for this venue
          const courtsData = await api.getCourtsByVenue(venueData.venueId);
          console.log('Courts data received:', courtsData);
          
          // Fetch equipment for this venue
          const equipmentData = await api.getEquipment(venueData.venueId);
          console.log('Equipment data received:', equipmentData);
          
          // Combine all data
          const fullVenueData = {
            ...venueData,
            courts: courtsData && Array.isArray(courtsData) ? courtsData : [],
            equipment: equipmentData && Array.isArray(equipmentData) ? equipmentData : []
          };
          
          setVenue(fullVenueData);
        } else {
          console.error('Invalid venue data received:', venueData);
          setVenue(null);
        }
      } catch (error) {
        console.error('Error fetching venue data:', error);
        setVenue(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVenueData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-center">Venue not found</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BuildingOfficeIcon },
    { id: 'courts', name: 'Courts', icon: UsersIcon },
    { id: 'equipment', name: 'Equipment', icon: TruckIcon },
    { id: 'timeslots', name: 'Time Slots', icon: ClockIcon },
    { id: 'pricing', name: 'Pricing', icon: CurrencyDollarIcon },
    { id: 'bookings', name: 'Bookings', icon: ClockIcon }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{venue.name}</h1>
              <p className="text-gray-600 mt-1">{venue.description}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/edit-venue/${id}`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Venue
              </button>
              <button
                onClick={() => navigate(`/venues/${id}/courts`)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Manage Courts
              </button>
              <button
                onClick={() => navigate(`/venues/${id}/equipment`)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <TruckIcon className="h-4 w-4 mr-2" />
                Manage Equipment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{venue.address}</span>
                  </div>
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{venue.contactNo}</span>
                  </div>
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{venue.email}</span>
                  </div>
                  <div className="flex items-center">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{venue.website}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{venue.venueType}</span>
                  </div>
                  <div className="flex items-center">
                    <UsersIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">Max Capacity: {venue.maxCapacity}</span>
                  </div>
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">Base Price: ${venue.basePrice}</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{venue.openingHours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <WifiIcon className={`h-5 w-5 mr-2 ${venue.wifiAvailable ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={venue.wifiAvailable ? 'text-green-700' : 'text-gray-500'}>WiFi</span>
                </div>
                <div className="flex items-center">
                  <TruckIcon className={`h-5 w-5 mr-2 ${venue.parkingAvailable ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={venue.parkingAvailable ? 'text-green-700' : 'text-gray-500'}>Parking</span>
                </div>
                <div className="flex items-center">
                  <StarIcon className={`h-5 w-5 mr-2 ${venue.foodAvailable ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={venue.foodAvailable ? 'text-green-700' : 'text-gray-500'}>Food</span>
                </div>
                <div className="flex items-center">
                  <UsersIcon className={`h-5 w-5 mr-2 ${venue.changingRoomsAvailable ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={venue.changingRoomsAvailable ? 'text-green-700' : 'text-gray-500'}>Changing Rooms</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UsersIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Courts</dt>
                      <dd className="text-lg font-medium text-gray-900">{venue.courts.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TruckIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Equipment Items</dt>
                      <dd className="text-lg font-medium text-gray-900">{venue.equipment.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Commission Rate</dt>
                      <dd className="text-lg font-medium text-gray-900">{(venue.commissionRate * 100).toFixed(1)}%</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courts' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Courts</h3>
                <button
                  onClick={() => navigate(`/venues/${id}/courts`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Court
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Hour</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {venue.courts.map((court) => (
                    <tr key={court.courtId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{court.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{court.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          court.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {court.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${court.pricePerHour}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Equipment</h3>
                <button
                  onClick={() => navigate(`/venues/${id}/equipment`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Equipment
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate/Hour</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {venue.equipment.map((item) => (
                    <tr key={item.equipmentId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.availableQuantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.ratePerHour}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'timeslots' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Time Slot Management</h3>
                <button
                  onClick={() => navigate(`/venues/${id}/timeslots`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Manage Time Slots
                </button>
              </div>
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Configure Court Availability</h4>
                <p className="text-gray-600 mb-4">
                  Set operating hours, configure maintenance schedules, and manage court availability for optimal booking management
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Operating Hours</div>
                    <div>Configure daily opening and closing times</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Maintenance</div>
                    <div>Schedule court maintenance and repairs</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Break Times</div>
                    <div>Set lunch breaks and rest periods</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dynamic Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Multipliers</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peak Hour Multiplier:</span>
                      <span className="font-medium">{venue.peakHourMultiplier}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Off-Peak Multiplier:</span>
                      <span className="font-medium">{venue.offPeakMultiplier}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weekend Multiplier:</span>
                      <span className="font-medium">{venue.weekendMultiplier}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Holiday Multiplier:</span>
                      <span className="font-medium">{venue.holidayMultiplier}x</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Settings</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dynamic Pricing:</span>
                      <span className={`font-medium ${venue.dynamicPricingEnabled ? 'text-green-600' : 'text-red-600'}`}>
                        {venue.dynamicPricingEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Commission Rate:</span>
                      <span className="font-medium">{(venue.commissionRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Auto Approval:</span>
                      <span className={`font-medium ${venue.autoApprovalEnabled ? 'text-green-600' : 'text-red-600'}`}>
                        {venue.autoApprovalEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => navigate(`/venues/${id}/pricing`)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Pricing
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
                <button
                  onClick={() => navigate('/bookings')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  View All Bookings
                </button>
              </div>
            </div>
            <div className="p-6 text-center text-gray-500">
              <ClockIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p>No recent bookings to display</p>
              <p className="text-sm">Bookings will appear here once customers start booking your courts</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueDetails;
