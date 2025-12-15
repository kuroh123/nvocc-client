import apiService from "./apiService";

class CurrencyExchangeRateService {
  // Get all currency exchange rates with pagination and filtering
  async getAllCurrencyExchangeRates(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `/api/currency-exchange-rates?${queryString}`
      : "/api/currency-exchange-rates";
    return await apiService.get(endpoint);
  }

  // Get a single currency exchange rate by ID
  async getCurrencyExchangeRateById(id) {
    return await apiService.get(`/api/currency-exchange-rates/${id}`);
  }

  // Get latest exchange rate between two currencies
  async getLatestExchangeRate(fromCurrencyId, toCurrencyId) {
    return await apiService.get(
      `/api/currency-exchange-rates/latest?fromCurrencyId=${fromCurrencyId}&toCurrencyId=${toCurrencyId}`
    );
  }

  // Create a new currency exchange rate
  async createCurrencyExchangeRate(data) {
    return await apiService.post("/api/currency-exchange-rates", data);
  }

  // Update an existing currency exchange rate
  async updateCurrencyExchangeRate(id, data) {
    return await apiService.put(`/api/currency-exchange-rates/${id}`, data);
  }

  // Delete a currency exchange rate
  async deleteCurrencyExchangeRate(id) {
    return await apiService.delete(`/api/currency-exchange-rates/${id}`);
  }
}

// Create and export a singleton instance
const currencyExchangeRateService = new CurrencyExchangeRateService();
export default currencyExchangeRateService;
