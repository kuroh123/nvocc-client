import apiService from "./apiService";

class VesselService {
  // Get all vessels with pagination and filtering
  async getAllVessels(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/vessels?${queryString}`
      : "/api/vessels";
    return await apiService.get(endpoint);
  }

  // Get a single vessel by ID
  async getVesselById(id) {
    return await apiService.get(`/api/vessels/${id}`);
  }

  // Create a new vessel
  async createVessel(vesselData) {
    return await apiService.post("/api/vessels", vesselData);
  }

  // Update an existing vessel
  async updateVessel(id, vesselData) {
    return await apiService.put(`/api/vessels/${id}`, vesselData);
  }

  // Delete a vessel
  async deleteVessel(id) {
    return await apiService.delete(`/api/vessels/${id}`);
  }
}

// Create and export a singleton instance
const vesselService = new VesselService();
export default vesselService;
