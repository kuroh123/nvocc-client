import apiService from "./apiService";

class ContainerTypeService {
  // Get all container types with pagination and filtering
  async getAllContainerTypes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/container-types?${queryString}`
      : "/api/container-types";
    return await apiService.get(endpoint);
  }

  // Get a single container type by ID
  async getContainerTypeById(id) {
    return await apiService.get(`/api/container-types/${id}`);
  }

  // Get container type by ISO code
  async getContainerTypeByIsoCode(isoCode) {
    return await apiService.get(`/api/container-types/iso/${isoCode}`);
  }

  // Create a new container type
  async createContainerType(containerTypeData) {
    return await apiService.post("/api/container-types", containerTypeData);
  }

  // Update an existing container type
  async updateContainerType(id, containerTypeData) {
    return await apiService.put(
      `/api/container-types/${id}`,
      containerTypeData
    );
  }

  // Delete a container type
  async deleteContainerType(id) {
    return await apiService.delete(`/api/container-types/${id}`);
  }
}

// Create and export a singleton instance
const containerTypeService = new ContainerTypeService();
export default containerTypeService;
