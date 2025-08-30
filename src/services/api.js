const API_BASE_URL = "http://localhost:8080/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem("authToken");
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    localStorage.setItem("authToken", token);
  }

  // Remove auth token from localStorage
  removeAuthToken() {
    localStorage.removeItem("authToken");
  }

  // Get headers with auth token
  getHeaders() {
    const token = this.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    try {
      const headers = this.getHeaders();
      const url = `${this.baseURL}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, remove it
          this.removeAuthToken();
          throw new Error("Authentication expired. Please login again.");
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Authentication APIs
  async login(email, password) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      this.setAuthToken(response.token);
    }

    return response;
  }

  async register(userData) {
    return await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return await this.request("/auth/me");
  }

  // Venue Management APIs
  async getVenues() {
    return await this.request("/venues");
  }

  async getVenueById(id) {
    return await this.request(`/venues/${id}`);
  }

  async createVenue(venueData) {
    return await this.request("/venues", {
      method: "POST",
      body: JSON.stringify(venueData),
    });
  }

  async updateVenue(id, venueData) {
    return await this.request(`/venues/${id}`, {
      method: "PUT",
      body: JSON.stringify(venueData),
    });
  }

  async deleteVenue(id) {
    return await this.request(`/venues/${id}`, {
      method: "DELETE",
    });
  }

  // Get venue by owner ID (each owner has only one venue)
  async getVenueByOwner(ownerId) {
    return await this.request(`/venues/owner/${ownerId}/venue`);
  }

  // Get venues by owner ID (legacy method - returns list with single venue)
  async getVenuesByOwner(ownerId) {
    return await this.request(`/venues/owner/${ownerId}`);
  }

  // Court Management APIs
  async getCourts(venueId) {
    return await this.request(`/courts/venue/${venueId}`);
  }

  async createCourt(courtData) {
    return await this.request("/courts", {
      method: "POST",
      body: JSON.stringify(courtData),
    });
  }

  async updateCourt(id, courtData) {
    return await this.request(`/courts/${id}`, {
      method: "PUT",
      body: JSON.stringify(courtData),
    });
  }

  async deleteCourt(id) {
    return await this.request(`/courts/${id}`, {
      method: "DELETE",
    });
  }

  // Equipment Management APIs
  async getEquipment(venueId) {
    return await this.request(`/equipment/venue/${venueId}`);
  }

  async createEquipment(equipmentData) {
    return await this.request("/equipment", {
      method: "POST",
      body: JSON.stringify(equipmentData),
    });
  }

  async updateEquipment(id, equipmentData) {
    return await this.request(`/equipment/${id}`, {
      method: "PUT",
      body: JSON.stringify(equipmentData),
    });
  }

  async deleteEquipment(id) {
    return await this.request(`/equipment/${id}`, {
      method: "DELETE",
    });
  }

  // Booking Management APIs
  async getBookings(venueId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = venueId
      ? `/bookings/venue/${venueId}?${queryParams}`
      : `/bookings?${queryParams}`;
    return await this.request(endpoint);
  }

  async updateBookingStatus(id, status) {
    return await this.request(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // Dashboard Analytics APIs
  async getDashboardSummary(ownerId, startDate, endDate) {
    return await this.request(
      `/owner-dashboard/summary?ownerId=${ownerId}&start=${startDate}&end=${endDate}`
    );
  }

  async getVenueAnalytics(venueId, period) {
    return await this.request(`/venues/${venueId}/analytics?period=${period}`);
  }

  // Payment APIs
  async getPayments(venueId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = venueId
      ? `/payments/venue/${venueId}?${queryParams}`
      : `/payments?${queryParams}`;
    return await this.request(endpoint);
  }

  // Review Management APIs
  async getReviews(venueId, filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = venueId
      ? `/reviews/venue/${venueId}?${queryParams}`
      : `/reviews?${queryParams}`;
    return await this.request(endpoint);
  }

  async respondToReview(reviewId, response) {
    return await this.request(`/reviews/${reviewId}/respond`, {
      method: "POST",
      body: JSON.stringify({ response }),
    });
  }

  // Logout
  async logout() {
    this.removeAuthToken();
  }
}

export default new ApiService();
