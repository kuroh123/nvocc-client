import apiService from "./apiService";

class DepotService {
  // Get all depots with pagination and filtering
  async getAllDepots(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/depots?${queryString}` : "/api/depots";
    return await apiService.get(endpoint);
  }

  // Get a single depot by ID
  async getDepotById(id) {
    return await apiService.get(`/api/depots/${id}`);
  }

  // Get depots by port
  async getDepotsByPort(portId) {
    return await apiService.get(`/api/depots/port/${portId}`);
  }

  // Create a new depot
  async createDepot(depotData) {
    return await apiService.post("/api/depots", depotData);
  }

  // Update an existing depot
  async updateDepot(id, depotData) {
    return await apiService.put(`/api/depots/${id}`, depotData);
  }

  // Delete a depot
  async deleteDepot(id) {
    return await apiService.delete(`/api/depots/${id}`);
  }
}

// Create and export a singleton instance
const depotService = new DepotService();
export default depotService;
