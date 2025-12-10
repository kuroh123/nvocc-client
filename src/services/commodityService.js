import apiService from "./apiService";

class CommodityService {
  // Get all commodities with pagination and filtering
  async getAllCommodities(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/commodities?${queryString}`
      : "/api/commodities";
    return await apiService.get(endpoint);
  }

  // Get a single commodity by ID
  async getCommodityById(id) {
    return await apiService.get(`/api/commodities/${id}`);
  }

  // Get commodities by cargo
  async getCommoditiesByCargo(cargoId) {
    return await apiService.get(`/api/commodities/cargo/${cargoId}`);
  }

  // Create a new commodity
  async createCommodity(commodityData) {
    return await apiService.post("/api/commodities", commodityData);
  }

  // Update an existing commodity
  async updateCommodity(id, commodityData) {
    return await apiService.put(`/api/commodities/${id}`, commodityData);
  }

  // Delete a commodity
  async deleteCommodity(id) {
    return await apiService.delete(`/api/commodities/${id}`);
  }
}

// Create and export a singleton instance
const commodityService = new CommodityService();
export default commodityService;
