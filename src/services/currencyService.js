import apiService from "./apiService";

class CurrencyService {
  // Get all currencies with pagination and filtering
  async getAllCurrencies(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/currencies?${queryString}`
      : "/api/currencies";
    return await apiService.get(endpoint);
  }

  // Get a single currency by ID
  async getCurrencyById(id) {
    return await apiService.get(`/api/currencies/${id}`);
  }

  // Create a new currency
  async createCurrency(data) {
    return await apiService.post("/api/currencies", data);
  }

  // Update an existing currency
  async updateCurrency(id, data) {
    return await apiService.put(`/api/currencies/${id}`, data);
  }

  // Delete a currency
  async deleteCurrency(id) {
    return await apiService.delete(`/api/currencies/${id}`);
  }
}

// Create and export a singleton instance
const currencyService = new CurrencyService();
export default currencyService;
