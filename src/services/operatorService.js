import apiService from "./apiService";

class OperatorService {
  // Get all operators with pagination and filtering
  async getAllOperators(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/operators?${queryString}`
      : "/api/operators";
    return await apiService.get(endpoint);
  }

  // Get a single operator by ID
  async getOperatorById(id) {
    return await apiService.get(`/api/operators/${id}`);
  }

  // Get operators by port
  async getOperatorsByPort(portId) {
    return await apiService.get(`/api/operators/port/${portId}`);
  }

  // Create a new operator
  async createOperator(operatorData) {
    return await apiService.post("/api/operators", operatorData);
  }

  // Update an existing operator
  async updateOperator(id, operatorData) {
    return await apiService.put(`/api/operators/${id}`, operatorData);
  }

  // Delete an operator
  async deleteOperator(id) {
    return await apiService.delete(`/api/operators/${id}`);
  }
}

// Create and export a singleton instance
const operatorService = new OperatorService();
export default operatorService;
