import apiService from "./apiService";

class CargoService {
  // Get all cargo with pagination and filtering
  async getAllCargo(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/cargo?${queryString}` : "/api/cargo";
    return await apiService.get(endpoint);
  }

  // Get a single cargo by ID
  async getCargoById(id) {
    return await apiService.get(`/api/cargo/${id}`);
  }

  // Create a new cargo
  async createCargo(cargoData) {
    return await apiService.post("/api/cargo", cargoData);
  }

  // Update an existing cargo
  async updateCargo(id, cargoData) {
    return await apiService.put(`/api/cargo/${id}`, cargoData);
  }

  // Delete a cargo
  async deleteCargo(id) {
    return await apiService.delete(`/api/cargo/${id}`);
  }
}

// Create and export a singleton instance
const cargoService = new CargoService();
export default cargoService;
