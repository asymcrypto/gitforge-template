/**
 * Payout Processor Module
 * 
 * This module handles the core logic for processing bounty payouts.
 * It integrates with payment processors (Stripe, PayPal, crypto gateways)
 * and ensures all transactions are logged and auditable.
 * 
 * Currently supports:
 * - Simulated payout (for testing)
 * - Stripe integration (future)
 * - PayPal integration (future)
 * - Crypto payment gateways (future)
 */

const PayoutLogger = require('./payout_logger');
const FlutterwaveIntegration = require('./flutterwave_integration');
const CurrencyConverter = require('./currency_converter');
const fs = require('fs');
const path = require('path');

class PayoutProcessor {
  constructor() {
    this.logger = new PayoutLogger();
    this.flutterwave = new FlutterwaveIntegration();
    this.converter = new CurrencyConverter();
    this.equityTrackingPath = path.join(__dirname, '../../github/EQUITY_TRACKING.json');
    this.bountyConfigPath = path.join(__dirname, '../../github/BOUNTY_CONFIG.json');
    this.loadConfigurations();
  }

  /**
   * Load configuration files
   */
  loadConfigurations() {
    try {
      if (fs.existsSync(this.bountyConfigPath)) {
        this.bountyConfig = JSON.parse(fs.readFileSync(this.bountyConfigPath, 'utf-8'));
      } else {
        this.bountyConfig = this.getDefaultBountyConfig();
      }

      if (fs.existsSync(this.equityTrackingPath)) {
        this.equityTracking = JSON.parse(fs.readFileSync(this.equityTrackingPath, 'utf-8'));
      } else {
        this.equityTracking = { contributors: [] };
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
      this.bountyConfig = this.getDefaultBountyConfig();
      this.equityTracking = { contributors: [] };
    }
  }

  /**
   * Get default bounty configuration
   */
  getDefaultBountyConfig() {
    return {
      payment_token: 'USDC',
      default_chain: 'polygon',
      payout_delay_hours: 24,
      min_bounty_amount: 50,
      max_bounty_amount: 5000,
      auto_assign_in_review: true,
      require_approval: false,
      payment_processor: 'simulated',
      transaction_fee_percentage: 5
    };
  }

  /**
   * Extract bounty amount from issue body
   * @param {string} issueBody - The GitHub issue body
   * @returns {Object} - { amount, currency }
   */
  extractBountyAmount(issueBody) {
    if (!issueBody) return { amount: 0, currency: 'USD' };

    // Try to match "Bounty Amount: $XXX" or "Equity: X%"
    const bountyMatch = issueBody.match(/Bounty\s+Amount[:\s]*\$?(\d+(?:\.\d{2})?)/i);
    const equityMatch = issueBody.match(/Equity[:\s]*(\d+(?:\.\d{2})?)\s*%?/i);

    if (bountyMatch) {
      return {
        amount: parseFloat(bountyMatch[1]),
        currency: 'USD'
      };
    }

    if (equityMatch) {
      // For equity-based bounties, convert to a default USD amount
      // This is a placeholder; in production, this would be calculated based on company valuation
      const equityPercentage = parseFloat(equityMatch[1]);
      const defaultValuation = 1000000; // $1M default valuation
      return {
        amount: (equityPercentage / 100) * defaultValuation,
        currency: 'USD'
      };
    }

    return { amount: 0, currency: 'USD' };
  }

  /**
   * Validate payout amount against configuration
   * @param {number} amount - The payout amount
   * @returns {Object} - { valid: boolean, error: string }
   */
  validatePayoutAmount(amount) {
    if (amount < this.bountyConfig.min_bounty_amount) {
      return {
        valid: false,
        error: `Amount $${amount} is below minimum of $${this.bountyConfig.min_bounty_amount}`
      };
    }

    if (amount > this.bountyConfig.max_bounty_amount) {
      return {
        valid: false,
        error: `Amount $${amount} exceeds maximum of $${this.bountyConfig.max_bounty_amount}`
      };
    }

    return { valid: true };
  }

  /**
   * Calculate transaction fee
   * @param {number} amount - The payout amount
   * @returns {Object} - { fee_amount, net_amount }
   */
  calculateFee(amount) {
    const feePercentage = this.bountyConfig.transaction_fee_percentage || 5;
    const feeAmount = amount * (feePercentage / 100);
    const netAmount = amount - feeAmount;

    return {
      fee_amount: parseFloat(feeAmount.toFixed(2)),
      net_amount: parseFloat(netAmount.toFixed(2)),
      fee_percentage: feePercentage
    };
  }

  /**
   * Process a payout for a merged PR
   * @param {Object} payoutRequest - The payout request
   * @param {number} payoutRequest.pr_number - PR number
   * @param {string} payoutRequest.contributor - GitHub username
   * @param {number} payoutRequest.amount - Payout amount
   * @param {string} payoutRequest.currency - Currency code
   * @param {number} payoutRequest.issue_number - Related issue number
   * @param {string} payoutRequest.bounty_label - Bounty label
   * @returns {Promise<Object>} - Payout result
   */
  async processPayout(payoutRequest) {
    console.log(`\n📊 Processing payout for PR #${payoutRequest.pr_number}...`);

    // Step 1: Log the payout attempt
    const auditEntryId = this.logger.logPayoutAttempt(payoutRequest);

    // Step 2: Validate the amount
    const validation = this.validatePayoutAmount(payoutRequest.amount);
    if (!validation.valid) {
      console.error(`❌ Validation failed: ${validation.error}`);
      this.logger.logPayoutFailure(auditEntryId, validation.error, {
        code: 'VALIDATION_ERROR'
      });
      return {
        success: false,
        error: validation.error,
        audit_id: auditEntryId
      };
    }

    // Step 3: Calculate fees
    const feeInfo = this.calculateFee(payoutRequest.amount);
    console.log(`💰 Amount: $${payoutRequest.amount} | Fee (${feeInfo.fee_percentage}%): $${feeInfo.fee_amount} | Net: $${feeInfo.net_amount}`);

    // Step 4: Handle currency conversion if needed
    let finalAmount = feeInfo.net_amount;
    let payoutCurrency = payoutRequest.currency;
    
    if (payoutRequest.currency !== 'USD' && this.bountyConfig.payment_processor === 'flutterwave') {
      console.log(`💱 Converting from ${payoutRequest.currency} to local currency...`);
      // In production, this would convert to the contributor's local currency
      // For now, we'll keep the original currency
    }

    // Step 5: Process the payout based on configured processor
    let payoutResult;
    try {
      switch (this.bountyConfig.payment_processor) {
        case 'flutterwave':
          payoutResult = await this.processFlutterwavePayment(payoutRequest, feeInfo);
          break;
        case 'stripe':
          payoutResult = await this.processStripePayment(payoutRequest, feeInfo);
          break;
        case 'paypal':
          payoutResult = await this.processPayPalPayment(payoutRequest, feeInfo);
          break;
        case 'simulated':
        default:
          payoutResult = await this.processSimulatedPayment(payoutRequest, feeInfo);
      }
    } catch (error) {
      console.error(`❌ Payout processing error: ${error.message}`);
      this.logger.logPayoutFailure(auditEntryId, error.message, {
        code: 'PROCESSING_ERROR',
        details: error.stack
      });
      return {
        success: false,
        error: error.message,
        audit_id: auditEntryId
      };
    }

    // Step 6: Log the result
    if (payoutResult.success) {
      this.logger.logPayoutSuccess(auditEntryId, {
        transaction_id: payoutResult.transaction_id,
        payment_method: payoutResult.payment_method,
        confirmation_hash: payoutResult.confirmation_hash,
        fee_amount: feeInfo.fee_amount,
        net_amount: feeInfo.net_amount
      });

      console.log(`✅ Payout successful!`);
      console.log(`   Transaction ID: ${payoutResult.transaction_id}`);
      console.log(`   Audit ID: ${auditEntryId}`);

      return {
        success: true,
        transaction_id: payoutResult.transaction_id,
        audit_id: auditEntryId,
        amount: payoutRequest.amount,
        net_amount: feeInfo.net_amount,
        fee_amount: feeInfo.fee_amount
      };
    } else {
      this.logger.logPayoutFailure(auditEntryId, payoutResult.error, {
        code: 'PAYMENT_FAILED'
      });
      return {
        success: false,
        error: payoutResult.error,
        audit_id: auditEntryId
      };
    }
  }

  /**
   * Process a simulated payment (for testing and MVP)
   * @param {Object} payoutRequest - The payout request
   * @param {Object} feeInfo - Fee information
   * @returns {Promise<Object>} - Payout result
   */
  async processSimulatedPayment(payoutRequest, feeInfo) {
    console.log(`🔄 Processing simulated payment...`);

    // Simulate a small delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const transactionId = `SIM_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return {
      success: true,
      transaction_id: transactionId,
      payment_method: 'SIMULATED',
      confirmation_hash: null
    };
  }

  /**
   * Process a Flutterwave payment (multi-currency support)
   * @param {Object} payoutRequest - The payout request
   * @param {Object} feeInfo - Fee information
   * @returns {Promise<Object>} - Payout result
   */
  async processFlutterwavePayment(payoutRequest, feeInfo) {
    console.log(`🔄 Processing Flutterwave payment...`);
    
    // For now, simulate the Flutterwave transfer
    // In production, this would:
    // 1. Retrieve contributor's bank details from secure storage
    // 2. Verify the bank account
    // 3. Initiate a transfer via Flutterwave API
    // 4. Return the transaction ID
    
    const transfer = {
      account_number: '0123456789', // Would be retrieved from contributor profile
      account_bank: '044', // Would be retrieved from contributor profile
      country: 'NG', // Would be retrieved from contributor profile
      amount: feeInfo.net_amount,
      currency: payoutRequest.currency,
      reference: `GITFORGE_${payoutRequest.pr_number}_${Date.now()}`,
      narration: `GitForge Bounty Payout - PR #${payoutRequest.pr_number}`
    };

    try {
      // Use simulated transfer for now (no real API key in sandbox)
      const result = this.flutterwave.simulateTransfer(transfer);
      return {
        success: true,
        transaction_id: `FLW_${result.id}`,
        payment_method: 'FLUTTERWAVE',
        confirmation_hash: result.reference
      };
    } catch (error) {
      console.error(`❌ Flutterwave error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process a Stripe payment (placeholder for future implementation)
   * @param {Object} payoutRequest - The payout request
   * @param {Object} feeInfo - Fee information
   * @returns {Promise<Object>} - Payout result
   */
  async processStripePayment(payoutRequest, feeInfo) {
    console.log(`🔄 Processing Stripe payment...`);
    
    // This is a placeholder. In production, this would:
    // 1. Retrieve contributor's Stripe account or payment method
    // 2. Create a payout to the contributor
    // 3. Return the transaction ID
    
    throw new Error('Stripe integration not yet implemented. Use "flutterwave" or "simulated" payment processor.');
  }

  /**
   * Process a PayPal payment (placeholder for future implementation)
   * @param {Object} payoutRequest - The payout request
   * @param {Object} feeInfo - Fee information
   * @returns {Promise<Object>} - Payout result
   */
  async processPayPalPayment(payoutRequest, feeInfo) {
    console.log(`🔄 Processing PayPal payment...`);
    
    // This is a placeholder. In production, this would:
    // 1. Retrieve contributor's PayPal email
    // 2. Create a payout via PayPal API
    // 3. Return the transaction ID
    
    throw new Error('PayPal integration not yet implemented. Use "simulated" payment processor.');
  }

  /**
   * Get payout history for a contributor
   * @param {string} contributor - GitHub username
   * @returns {Array} - Array of payout records
   */
  getContributorPayoutHistory(contributor) {
    return this.logger.getContributorPayouts(contributor);
  }

  /**
   * Get audit summary
   * @returns {Object} - Audit summary
   */
  getAuditSummary() {
    return this.logger.getSummary();
  }

  /**
   * Export audit data for tax reporting
   * @param {Date} startDate - Fiscal year start
   * @param {Date} endDate - Fiscal year end
   * @returns {Object} - Tax report data
   */
  exportTaxReport(startDate, endDate) {
    return this.logger.exportForTaxReporting(startDate, endDate);
  }
}

module.exports = PayoutProcessor;
