/**
 * Currency Converter Module
 * 
 * This module provides real-time currency conversion using the Open Exchange Rates API
 * or a fallback to a static exchange rate table for offline operation.
 * 
 * Supported APIs:
 * - Open Exchange Rates (https://openexchangerates.org/) - Recommended
 * - Fallback: Static exchange rate table
 * 
 * Environment Variables:
 * - EXCHANGE_RATE_API_KEY: Your Open Exchange Rates API key (optional)
 * - EXCHANGE_RATE_API: API endpoint (optional, defaults to openexchangerates.org)
 */

const https = require('https');
const http = require('http');

class CurrencyConverter {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.EXCHANGE_RATE_API_KEY;
    this.baseUrl = 'openexchangerates.org';
    this.baseCurrency = 'USD'; // All rates are relative to USD
    
    // Fallback exchange rates (as of Nov 2025)
    // These are approximate rates and should be updated regularly
    this.fallbackRates = {
      'USD': 1.0,
      'EUR': 0.92,
      'GBP': 0.79,
      'JPY': 149.50,
      'CHF': 0.88,
      'CAD': 1.38,
      'AUD': 1.53,
      'NZD': 1.68,
      'CNY': 7.24,
      'INR': 83.12,
      'MXN': 17.05,
      'BRL': 5.47,
      'ZAR': 17.89,
      'NGN': 1545.00,
      'KES': 129.50,
      'GHS': 13.20,
      'UGX': 3850.00,
      'TZS': 2650.00,
      'RWF': 1295.00,
      'EGP': 49.50,
      'MAD': 10.15,
      'XOF': 603.00, // West African CFA Franc
      'XAF': 603.00  // Central African CFA Franc
    };

    this.cacheExpiry = 3600000; // 1 hour in milliseconds
    this.lastUpdate = null;
    this.cachedRates = null;
  }

  /**
   * Fetch exchange rates from the API
   * @returns {Promise<Object>} - Exchange rates object
   */
  async fetchRatesFromAPI() {
    return new Promise((resolve, reject) => {
      if (!this.apiKey) {
        console.warn('⚠️  No API key provided. Using fallback exchange rates.');
        resolve(this.fallbackRates);
        return;
      }

      const path = `/api/latest.json?app_id=${this.apiKey}&base=${this.baseCurrency}`;

      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: path,
        method: 'GET'
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.rates) {
              this.cachedRates = parsed.rates;
              this.lastUpdate = Date.now();
              console.log('✓ Exchange rates fetched from API');
              resolve(parsed.rates);
            } else {
              console.warn('⚠️  Invalid API response. Using fallback rates.');
              resolve(this.fallbackRates);
            }
          } catch (error) {
            console.warn(`⚠️  Failed to parse API response: ${error.message}. Using fallback rates.`);
            resolve(this.fallbackRates);
          }
        });
      });

      req.on('error', (error) => {
        console.warn(`⚠️  API request failed: ${error.message}. Using fallback rates.`);
        resolve(this.fallbackRates);
      });

      req.end();
    });
  }

  /**
   * Get current exchange rates (with caching)
   * @returns {Promise<Object>} - Exchange rates object
   */
  async getRates() {
    // Return cached rates if still valid
    if (this.cachedRates && this.lastUpdate && (Date.now() - this.lastUpdate) < this.cacheExpiry) {
      console.log('✓ Using cached exchange rates');
      return this.cachedRates;
    }

    // Fetch fresh rates
    return await this.fetchRatesFromAPI();
  }

  /**
   * Convert amount from one currency to another
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code
   * @returns {Promise<Object>} - Conversion result
   */
  async convert(amount, fromCurrency, toCurrency) {
    fromCurrency = fromCurrency.toUpperCase();
    toCurrency = toCurrency.toUpperCase();

    if (fromCurrency === toCurrency) {
      return {
        amount: amount,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        converted_amount: amount,
        rate: 1.0,
        timestamp: new Date().toISOString()
      };
    }

    try {
      const rates = await this.getRates();

      if (!rates[fromCurrency]) {
        throw new Error(`Currency not supported: ${fromCurrency}`);
      }

      if (!rates[toCurrency]) {
        throw new Error(`Currency not supported: ${toCurrency}`);
      }

      // Convert: (amount / fromRate) * toRate
      const fromRate = rates[fromCurrency];
      const toRate = rates[toCurrency];
      const convertedAmount = (amount / fromRate) * toRate;

      return {
        amount: amount,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        converted_amount: parseFloat(convertedAmount.toFixed(2)),
        rate: parseFloat((toRate / fromRate).toFixed(6)),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ Conversion error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get conversion rate between two currencies
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code
   * @returns {Promise<number>} - Exchange rate
   */
  async getRate(fromCurrency, toCurrency) {
    const result = await this.convert(1, fromCurrency, toCurrency);
    return result.rate;
  }

  /**
   * Get supported currencies
   * @returns {Array} - Array of supported currency codes
   */
  getSupportedCurrencies() {
    return Object.keys(this.fallbackRates).sort();
  }

  /**
   * Get currency symbol
   * @param {string} currency - Currency code
   * @returns {string} - Currency symbol
   */
  getCurrencySymbol(currency) {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CHF': 'CHF',
      'CAD': 'C$',
      'AUD': 'A$',
      'NZD': 'NZ$',
      'CNY': '¥',
      'INR': '₹',
      'MXN': '$',
      'BRL': 'R$',
      'ZAR': 'R',
      'NGN': '₦',
      'KES': 'KSh',
      'GHS': 'GH₵',
      'UGX': 'USh',
      'TZS': 'TSh',
      'RWF': 'FRw',
      'EGP': 'E£',
      'MAD': 'د.م.',
      'XOF': 'CFA',
      'XAF': 'CFA'
    };

    return symbols[currency.toUpperCase()] || currency.toUpperCase();
  }

  /**
   * Get currency name
   * @param {string} currency - Currency code
   * @returns {string} - Currency name
   */
  getCurrencyName(currency) {
    const names = {
      'USD': 'US Dollar',
      'EUR': 'Euro',
      'GBP': 'British Pound',
      'JPY': 'Japanese Yen',
      'CHF': 'Swiss Franc',
      'CAD': 'Canadian Dollar',
      'AUD': 'Australian Dollar',
      'NZD': 'New Zealand Dollar',
      'CNY': 'Chinese Yuan',
      'INR': 'Indian Rupee',
      'MXN': 'Mexican Peso',
      'BRL': 'Brazilian Real',
      'ZAR': 'South African Rand',
      'NGN': 'Nigerian Naira',
      'KES': 'Kenyan Shilling',
      'GHS': 'Ghanaian Cedi',
      'UGX': 'Ugandan Shilling',
      'TZS': 'Tanzanian Shilling',
      'RWF': 'Rwandan Franc',
      'EGP': 'Egyptian Pound',
      'MAD': 'Moroccan Dirham',
      'XOF': 'West African CFA Franc',
      'XAF': 'Central African CFA Franc'
    };

    return names[currency.toUpperCase()] || currency.toUpperCase();
  }

  /**
   * Format amount with currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   * @returns {string} - Formatted string (e.g., "$100.00")
   */
  formatCurrency(amount, currency) {
    const symbol = this.getCurrencySymbol(currency);
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  }
}

module.exports = CurrencyConverter;
