/**
 * Flutterwave Integration Module
 * 
 * This module provides a complete integration with the Flutterwave API for processing
 * multi-currency payouts to contributors globally. Flutterwave is chosen because it:
 * - Supports 34+ African countries and 150+ currencies
 * - Has a comprehensive REST API for transfers and payouts
 * - Supports both bank transfers and mobile money
 * - Provides real-time transaction tracking
 * 
 * API Documentation: https://developer.flutterwave.com/
 * 
 * Required Environment Variables:
 * - FLUTTERWAVE_SECRET_KEY: Your Flutterwave secret API key
 * - FLUTTERWAVE_PUBLIC_KEY: Your Flutterwave public API key (optional, for client-side)
 */

const https = require('https');

class FlutterwaveIntegration {
  constructor(secretKey = null) {
    this.secretKey = secretKey || process.env.FLUTTERWAVE_SECRET_KEY;
    this.baseUrl = 'api.flutterwave.com';
    this.apiVersion = 'v3';
    
    // Supported currencies and their codes
    this.supportedCurrencies = {
      'USD': 'USD',
      'EUR': 'EUR',
      'GBP': 'GBP',
      'NGN': 'NGN', // Nigerian Naira
      'KES': 'KES', // Kenyan Shilling
      'ZAR': 'ZAR', // South African Rand
      'GHS': 'GHS', // Ghanaian Cedi
      'UGX': 'UGX', // Ugandan Shilling
      'TZS': 'TZS', // Tanzanian Shilling
      'RWF': 'RWF', // Rwandan Franc
      'XOF': 'XOF', // West African CFA Franc
      'XAF': 'XAF', // Central African CFA Franc
      'EGP': 'EGP', // Egyptian Pound
      'MAD': 'MAD', // Moroccan Dirham
      'INR': 'INR', // Indian Rupee
      'BRL': 'BRL', // Brazilian Real
      'MXN': 'MXN'  // Mexican Peso
    };
  }

  /**
   * Make an HTTP request to the Flutterwave API
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {Object} data - Request body (for POST/PUT)
   * @returns {Promise<Object>} - API response
   */
  async makeRequest(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const path = `/${this.apiVersion}/${endpoint}`;
      
      const options = {
        hostname: this.baseUrl,
        port: 443,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.secretKey}`
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`Flutterwave API Error: ${parsed.message || responseData}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse Flutterwave response: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * Validate if a currency is supported
   * @param {string} currency - Currency code (e.g., 'USD', 'NGN')
   * @returns {boolean}
   */
  isCurrencySupported(currency) {
    return currency.toUpperCase() in this.supportedCurrencies;
  }

  /**
   * Get list of supported currencies
   * @returns {Array} - Array of supported currency codes
   */
  getSupportedCurrencies() {
    return Object.keys(this.supportedCurrencies);
  }

  /**
   * Create a beneficiary (recipient) for payouts
   * @param {Object} beneficiary - Beneficiary details
   * @param {string} beneficiary.account_number - Bank account number
   * @param {string} beneficiary.account_bank - Bank code (for bank transfers)
   * @param {string} beneficiary.currency - Currency code
   * @param {string} beneficiary.country - Country code (ISO 3166-1 alpha-2)
   * @param {string} beneficiary.first_name - First name
   * @param {string} beneficiary.last_name - Last name
   * @returns {Promise<Object>} - Beneficiary response with ID
   */
  async createBeneficiary(beneficiary) {
    console.log(`📋 Creating beneficiary: ${beneficiary.first_name} ${beneficiary.last_name}`);

    const payload = {
      account_number: beneficiary.account_number,
      account_bank: beneficiary.account_bank,
      currency: beneficiary.currency.toUpperCase(),
      country: beneficiary.country.toUpperCase(),
      first_name: beneficiary.first_name,
      last_name: beneficiary.last_name
    };

    try {
      const response = await this.makeRequest('POST', 'beneficiaries', payload);
      console.log(`✓ Beneficiary created: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to create beneficiary: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get bank list for a country
   * @param {string} country - Country code (e.g., 'NG' for Nigeria)
   * @returns {Promise<Array>} - List of banks with codes
   */
  async getBankList(country) {
    console.log(`📋 Fetching bank list for ${country}...`);

    try {
      const response = await this.makeRequest('GET', `banks/${country}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch bank list: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify bank account details
   * @param {string} account_number - Bank account number
   * @param {string} account_bank - Bank code
   * @param {string} country - Country code
   * @returns {Promise<Object>} - Account verification details
   */
  async verifyBankAccount(account_number, account_bank, country) {
    console.log(`🔍 Verifying bank account...`);

    try {
      const response = await this.makeRequest('GET', 
        `accounts/resolve?account_number=${account_number}&account_bank=${account_bank}&country=${country}`
      );
      console.log(`✓ Account verified: ${response.data.account_name}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to verify account: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initiate a transfer (payout) to a beneficiary
   * @param {Object} transfer - Transfer details
   * @param {number} transfer.amount - Amount to transfer
   * @param {string} transfer.currency - Currency code
   * @param {number} transfer.beneficiary_id - Flutterwave beneficiary ID
   * @param {string} transfer.reference - Unique reference (e.g., 'AUDIT_ID')
   * @param {string} transfer.narration - Transfer description
   * @returns {Promise<Object>} - Transfer response
   */
  async initiateTransfer(transfer) {
    console.log(`💸 Initiating transfer of ${transfer.currency} ${transfer.amount}...`);

    const payload = {
      account_bank: transfer.account_bank,
      account_number: transfer.account_number,
      amount: transfer.amount,
      currency: transfer.currency.toUpperCase(),
      reference: transfer.reference,
      narration: transfer.narration || 'GitForge Bounty Payout',
      country: transfer.country
    };

    try {
      const response = await this.makeRequest('POST', 'transfers', payload);
      console.log(`✓ Transfer initiated: ${response.data.id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to initiate transfer: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get transfer status
   * @param {number} transferId - Flutterwave transfer ID
   * @returns {Promise<Object>} - Transfer status details
   */
  async getTransferStatus(transferId) {
    try {
      const response = await this.makeRequest('GET', `transfers/${transferId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to get transfer status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get balance for a specific currency
   * @param {string} currency - Currency code
   * @returns {Promise<Object>} - Balance information
   */
  async getBalance(currency) {
    try {
      const response = await this.makeRequest('GET', `balances/${currency.toUpperCase()}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to get balance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Simulate a transfer (for testing without real API key)
   * @param {Object} transfer - Transfer details
   * @returns {Object} - Simulated transfer response
   */
  simulateTransfer(transfer) {
    console.log(`🔄 Simulating Flutterwave transfer...`);
    
    const transferId = Math.floor(Math.random() * 1000000) + 1;
    
    return {
      id: transferId,
      account_number: transfer.account_number,
      bank_code: transfer.account_bank,
      amount: transfer.amount,
      currency: transfer.currency.toUpperCase(),
      reference: transfer.reference,
      status: 'success',
      complete_message: 'Beneficiary Resolved',
      created_at: new Date().toISOString(),
      narration: transfer.narration || 'GitForge Bounty Payout'
    };
  }

  /**
   * Simulate getting transfer status
   * @param {number} transferId - Transfer ID
   * @returns {Object} - Simulated status response
   */
  simulateGetTransferStatus(transferId) {
    return {
      id: transferId,
      status: 'successful',
      complete_message: 'Transfer Successful',
      amount: 0,
      fee: 0,
      currency: 'USD',
      reference: 'SIM_REF_' + transferId
    };
  }
}

module.exports = FlutterwaveIntegration;
