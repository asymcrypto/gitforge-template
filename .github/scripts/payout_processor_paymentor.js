#!/usr/bin/env node

/**
 * GitForge Payout Processor - Paymentor Edition
 * Processes bounty payouts using Paymentor (crypto + fiat)
 * Supports USDC, USDT, ETH, and fiat currencies
 */

const fs = require('fs');
const path = require('path');
const PaymentorIntegration = require('./paymentor_integration');

class PayoutProcessor {
  constructor() {
    this.paymentor = new PaymentorIntegration();
    this.auditPath = path.join(__dirname, '../../github/PAYOUT_AUDIT.json');
    this.equityPath = path.join(__dirname, '../../github/EQUITY_TRACKING.json');
    this.configPath = path.join(__dirname, '../../github/BOUNTY_CONFIG.json');
  }

  /**
   * Load configuration
   */
  loadConfig() {
    try {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    } catch (error) {
      return this.getDefaultConfig();
    }
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      payment_processor: 'paymentor',
      default_payment_method: 'crypto',
      default_crypto_token: 'USDC',
      default_network: 'polygon',
      default_fiat_currency: 'USD',
      transaction_fee_percent: 1.0, // 1% for crypto, 2% for fiat
      min_payout_amount: 10,
      max_payout_amount: 50000,
      auto_convert_to_usd: true
    };
  }

  /**
   * Process a bounty payout
   */
  async processPayout(paymentData) {
    const {
      contributor_username,
      bounty_amount,
      currency = 'USD',
      payment_method = 'crypto',
      crypto_token = 'USDC',
      network = 'polygon',
      wallet_address,
      pr_number,
      bounty_id
    } = paymentData;

    console.log(`\n💳 Processing payout for @${contributor_username}`);
    console.log(`Amount: ${bounty_amount} ${currency}`);
    console.log(`Method: ${payment_method}`);

    // Validate payout
    const validation = this.validatePayout(bounty_amount, currency);
    if (!validation.valid) {
      console.error(`❌ Validation failed: ${validation.error}`);
      return {
        success: false,
        error: validation.error,
        status: 'failed'
      };
    }

    // Calculate fees
    const feePercent = payment_method === 'crypto' ? 1.0 : 2.0;
    const fee = (bounty_amount * feePercent) / 100;
    const netAmount = bounty_amount - fee;

    console.log(`Fee (${feePercent}%): $${fee.toFixed(2)}`);
    console.log(`Net Amount: $${netAmount.toFixed(2)}`);

    let paymentResult;

    if (payment_method === 'crypto') {
      // Process crypto payment
      paymentResult = await this.paymentor.processCryptoPayment({
        contributor_username,
        amount: netAmount,
        token: crypto_token,
        network: network,
        wallet_address: wallet_address,
        pr_number: pr_number
      });
    } else if (payment_method === 'fiat') {
      // Process fiat payment
      paymentResult = await this.paymentor.processFiatPayment({
        contributor_username,
        amount: netAmount,
        currency: currency,
        payment_method: 'bank_transfer',
        pr_number: pr_number
      });
    } else {
      return {
        success: false,
        error: `Unknown payment method: ${payment_method}`,
        status: 'failed'
      };
    }

    if (!paymentResult.success) {
      console.error(`❌ Payment failed: ${paymentResult.error}`);
      return paymentResult;
    }

    // Log to audit trail
    const auditEntry = {
      id: `PAYOUT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      event_type: 'PAYOUT_PROCESSED',
      contributor: contributor_username,
      bounty_id: bounty_id,
      pr_number: pr_number,
      amount_usd: bounty_amount,
      fee_usd: fee,
      net_amount_usd: netAmount,
      payment_method: payment_method,
      payment_processor: 'paymentor',
      crypto_token: crypto_token,
      network: network,
      transaction_id: paymentResult.transaction_id,
      tx_hash: paymentResult.tx_hash,
      status: paymentResult.status,
      metadata: {
        wallet_address: wallet_address,
        currency: currency
      }
    };

    // Save to audit log
    this.logToAudit(auditEntry);

    console.log(`✅ Payout processed successfully!`);
    console.log(`Transaction ID: ${paymentResult.transaction_id}`);

    return {
      success: true,
      ...paymentResult,
      fee_usd: fee,
      net_amount_usd: netAmount,
      audit_entry: auditEntry
    };
  }

  /**
   * Validate payout amount
   */
  validatePayout(amount, currency) {
    const config = this.loadConfig();

    if (amount < config.min_payout_amount) {
      return {
        valid: false,
        error: `Amount $${amount} is below minimum $${config.min_payout_amount}`
      };
    }

    if (amount > config.max_payout_amount) {
      return {
        valid: false,
        error: `Amount $${amount} exceeds maximum $${config.max_payout_amount}`
      };
    }

    return { valid: true };
  }

  /**
   * Log payout to audit trail
   */
  logToAudit(entry) {
    let auditLog = [];

    try {
      if (fs.existsSync(this.auditPath)) {
        const data = fs.readFileSync(this.auditPath, 'utf8');
        const parsed = JSON.parse(data);
        auditLog = parsed.entries || [];
      }
    } catch (error) {
      console.warn('Could not load existing audit log, starting fresh');
    }

    auditLog.push(entry);

    const output = {
      version: '2.0.0',
      description: 'GitForge Payout Audit Trail - Paymentor Edition',
      generated_at: new Date().toISOString(),
      total_payouts: auditLog.length,
      total_amount_usd: auditLog.reduce((sum, e) => sum + (e.amount_usd || 0), 0),
      total_fees_collected: auditLog.reduce((sum, e) => sum + (e.fee_usd || 0), 0),
      entries: auditLog
    };

    fs.writeFileSync(this.auditPath, JSON.stringify(output, null, 2));
  }

  /**
   * Get payout history for a contributor
   */
  getPayoutHistory(contributor) {
    try {
      const data = fs.readFileSync(this.auditPath, 'utf8');
      const parsed = JSON.parse(data);
      return parsed.entries.filter(e => e.contributor === contributor);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get total payouts
   */
  getTotalPayouts() {
    try {
      const data = fs.readFileSync(this.auditPath, 'utf8');
      const parsed = JSON.parse(data);
      return {
        total_payouts: parsed.total_payouts,
        total_amount_usd: parsed.total_amount_usd,
        total_fees_collected: parsed.total_fees_collected
      };
    } catch (error) {
      return {
        total_payouts: 0,
        total_amount_usd: 0,
        total_fees_collected: 0
      };
    }
  }
}

// CLI usage
if (require.main === module) {
  const processor = new PayoutProcessor();

  // Example usage
  const examplePayout = {
    contributor_username: 'john-developer',
    bounty_amount: 250,
    currency: 'USD',
    payment_method: 'crypto',
    crypto_token: 'USDC',
    network: 'polygon',
    wallet_address: '0x1234567890123456789012345678901234567890',
    pr_number: 42,
    bounty_id: 'bounty_042'
  };

  processor.processPayout(examplePayout).then(result => {
    console.log('\n📊 Payout Result:');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n📈 Total Payouts:');
    console.log(JSON.stringify(processor.getTotalPayouts(), null, 2));
  });
}

module.exports = PayoutProcessor;
