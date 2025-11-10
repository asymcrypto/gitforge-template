#!/usr/bin/env node

/**
 * GitForge Paymentor Integration
 * Decentralized payment processor supporting crypto and fiat
 * Replaces Flutterwave with a Web3-native solution
 */

const crypto = require('crypto');

class PaymentorIntegration {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.PAYMENTOR_API_KEY || 'MOCK_PAYMENTOR_KEY';
    this.apiUrl = 'https://api.paymentor.io/v1';
    this.isMockMode = !process.env.PAYMENTOR_API_KEY;
    
    // Supported payment methods
    this.paymentMethods = {
      crypto: ['USDC', 'USDT', 'ETH', 'MATIC', 'SOL', 'BNB'],
      fiat: ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'ZAR'],
      bank: ['ACH', 'SEPA', 'SWIFT']
    };

    // Supported networks
    this.networks = {
      'USDC': ['ethereum', 'polygon', 'arbitrum', 'optimism', 'solana'],
      'USDT': ['ethereum', 'polygon', 'tron', 'solana'],
      'ETH': ['ethereum'],
      'MATIC': ['polygon'],
      'SOL': ['solana'],
      'BNB': ['binance']
    };
  }

  /**
   * Initialize a payment transaction
   */
  async initializePayment(paymentData) {
    const {
      contributor_username,
      amount,
      currency,
      payment_method,
      network,
      wallet_address,
      pr_number,
      bounty_id
    } = paymentData;

    if (this.isMockMode) {
      return this.mockInitializePayment(paymentData);
    }

    try {
      const response = await this.makeRequest('POST', '/payments/initialize', {
        recipient: {
          username: contributor_username,
          wallet_address: wallet_address
        },
        amount: amount,
        currency: currency,
        payment_method: payment_method,
        network: network,
        metadata: {
          pr_number: pr_number,
          bounty_id: bounty_id,
          source: 'gitforge'
        }
      });

      return {
        success: true,
        transaction_id: response.transaction_id,
        status: 'pending',
        payment_url: response.payment_url,
        expires_at: response.expires_at
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  /**
   * Process a crypto payment directly
   */
  async processCryptoPayment(paymentData) {
    const {
      contributor_username,
      amount,
      token,
      network,
      wallet_address,
      pr_number
    } = paymentData;

    if (this.isMockMode) {
      return this.mockProcessCryptoPayment(paymentData);
    }

    try {
      // Validate network support for token
      if (!this.networks[token]?.includes(network)) {
        throw new Error(`Token ${token} not supported on ${network}`);
      }

      const response = await this.makeRequest('POST', '/payments/crypto/send', {
        recipient_wallet: wallet_address,
        amount: amount,
        token: token,
        network: network,
        metadata: {
          contributor: contributor_username,
          pr_number: pr_number,
          source: 'gitforge'
        }
      });

      return {
        success: true,
        transaction_id: response.transaction_id,
        tx_hash: response.tx_hash,
        status: 'confirmed',
        amount_sent: response.amount_sent,
        network: network,
        token: token,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  /**
   * Process a fiat payment
   */
  async processFiatPayment(paymentData) {
    const {
      contributor_username,
      amount,
      currency,
      payment_method,
      bank_account,
      pr_number
    } = paymentData;

    if (this.isMockMode) {
      return this.mockProcessFiatPayment(paymentData);
    }

    try {
      const response = await this.makeRequest('POST', '/payments/fiat/send', {
        recipient: {
          username: contributor_username,
          bank_account: bank_account
        },
        amount: amount,
        currency: currency,
        payment_method: payment_method,
        metadata: {
          pr_number: pr_number,
          source: 'gitforge'
        }
      });

      return {
        success: true,
        transaction_id: response.transaction_id,
        status: 'processing',
        amount_sent: response.amount_sent,
        currency: currency,
        estimated_arrival: response.estimated_arrival,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId) {
    if (this.isMockMode) {
      return this.mockGetPaymentStatus(transactionId);
    }

    try {
      const response = await this.makeRequest('GET', `/payments/${transactionId}`);
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get exchange rate for currency conversion
   */
  async getExchangeRate(fromCurrency, toCurrency) {
    if (this.isMockMode) {
      return this.mockGetExchangeRate(fromCurrency, toCurrency);
    }

    try {
      const response = await this.makeRequest('GET', '/rates', {
        from: fromCurrency,
        to: toCurrency
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify wallet address
   */
  async verifyWalletAddress(address, network) {
    if (this.isMockMode) {
      return this.mockVerifyWalletAddress(address, network);
    }

    try {
      const response = await this.makeRequest('POST', '/wallets/verify', {
        address: address,
        network: network
      });
      return response;
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Make API request (placeholder for real implementation)
   */
  async makeRequest(method, endpoint, data = null) {
    // In production, this would make actual HTTP requests to Paymentor API
    // For now, return mock response
    console.log(`[Paymentor API] ${method} ${endpoint}`);
    return {};
  }

  /**
   * Mock implementations for testing
   */
  mockInitializePayment(data) {
    const transactionId = `PMT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      success: true,
      transaction_id: transactionId,
      status: 'pending',
      payment_url: `https://paymentor.io/pay/${transactionId}`,
      expires_at: new Date(Date.now() + 3600000).toISOString()
    };
  }

  mockProcessCryptoPayment(data) {
    const txHash = `0x${crypto.randomBytes(32).toString('hex')}`;
    const fee = data.amount * 0.01; // 1% fee
    return {
      success: true,
      transaction_id: `PMT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tx_hash: txHash,
      status: 'confirmed',
      amount_sent: data.amount,
      fee_usd: fee,
      net_amount: data.amount - fee,
      network: data.network,
      token: data.token,
      timestamp: new Date().toISOString()
    };
  }

  mockProcessFiatPayment(data) {
    const fee = data.amount * 0.02; // 2% fee for fiat
    return {
      success: true,
      transaction_id: `PMT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'processing',
      amount_sent: data.amount,
      fee_usd: fee,
      net_amount: data.amount - fee,
      currency: data.currency,
      estimated_arrival: new Date(Date.now() + 86400000).toISOString(), // 24 hours
      timestamp: new Date().toISOString()
    };
  }

  mockGetPaymentStatus(transactionId) {
    return {
      transaction_id: transactionId,
      status: 'confirmed',
      amount: 250,
      currency: 'USDC',
      timestamp: new Date().toISOString()
    };
  }

  mockGetExchangeRate(from, to) {
    // Mock rates
    const rates = {
      'USD_EUR': 0.92,
      'USD_GBP': 0.79,
      'USD_NGN': 1240,
      'USD_KES': 132,
      'USD_ZAR': 18.5,
      'USDC_USD': 1.0,
      'USDT_USD': 1.0,
      'ETH_USD': 2500,
      'MATIC_USD': 0.85
    };

    const key = `${from}_${to}`;
    const reverseKey = `${to}_${from}`;

    if (rates[key]) {
      return {
        from: from,
        to: to,
        rate: rates[key],
        timestamp: new Date().toISOString()
      };
    } else if (rates[reverseKey]) {
      return {
        from: from,
        to: to,
        rate: 1 / rates[reverseKey],
        timestamp: new Date().toISOString()
      };
    }

    return {
      from: from,
      to: to,
      rate: 1.0,
      timestamp: new Date().toISOString()
    };
  }

  mockVerifyWalletAddress(address, network) {
    // Simple validation
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(address) || // Ethereum
                   /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || // Bitcoin
                   /^[1-5A-HJ-NP-Za-km-z]{32,44}$/.test(address); // Solana

    return {
      address: address,
      network: network,
      valid: isValid,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods() {
    return this.paymentMethods;
  }

  /**
   * Get supported networks for a token
   */
  getSupportedNetworks(token) {
    return this.networks[token] || [];
  }
}

module.exports = PaymentorIntegration;

// CLI usage
if (require.main === module) {
  const integration = new PaymentorIntegration();
  
  console.log('🚀 GitForge Paymentor Integration');
  console.log('==================================\n');
  
  console.log('Supported Payment Methods:');
  console.log(JSON.stringify(integration.getSupportedPaymentMethods(), null, 2));
  
  console.log('\nSupported Networks:');
  console.log(JSON.stringify(integration.networks, null, 2));
  
  console.log('\n✅ Paymentor integration ready!');
  console.log(`Mode: ${integration.isMockMode ? 'MOCK (Testing)' : 'PRODUCTION'}`);
}
