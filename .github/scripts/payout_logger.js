/**
 * Payout Logger Module
 * 
 * This module provides a centralized logging system for all bounty payout events.
 * It ensures that every payout attempt, success, failure, and status change is
 * logged to an immutable audit trail for compliance and tax reporting.
 * 
 * Usage:
 *   const PayoutLogger = require('./payout_logger');
 *   const logger = new PayoutLogger();
 *   logger.logPayoutAttempt({...});
 */

const fs = require('fs');
const path = require('path');

class PayoutLogger {
  constructor() {
    this.auditFilePath = path.join(__dirname, '../../github/PAYOUT_AUDIT.json');
    this.auditData = this.loadAuditData();
  }

  /**
   * Load the audit data from the JSON file
   */
  loadAuditData() {
    try {
      if (fs.existsSync(this.auditFilePath)) {
        const data = fs.readFileSync(this.auditFilePath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading audit data:', error);
    }
    return this.getDefaultAuditStructure();
  }

  /**
   * Get the default audit structure
   */
  getDefaultAuditStructure() {
    return {
      version: '1.0.0',
      description: 'Immutable audit log for all bounty payouts',
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      audit_entries: [],
      summary: {
        total_entries: 0,
        total_payouts_processed: 0,
        total_amount_paid: 0,
        failed_payouts: 0,
        pending_payouts: 0,
        currencies_supported: ['USD', 'EUR', 'USDC', 'GBP', 'JPY'],
        last_payout_date: null
      }
    };
  }

  /**
   * Generate a unique audit entry ID
   */
  generateEntryId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `AUDIT_${timestamp}_${random}`;
  }

  /**
   * Log a payout attempt
   * @param {Object} payoutData - The payout data
   * @param {string} payoutData.pr_number - GitHub PR number
   * @param {string} payoutData.contributor - GitHub username of the contributor
   * @param {number} payoutData.amount - Payout amount
   * @param {string} payoutData.currency - Currency code (USD, EUR, etc.)
   * @param {string} payoutData.issue_number - Related issue number
   * @param {string} payoutData.bounty_label - Bounty label from the issue
   */
  logPayoutAttempt(payoutData) {
    const entry = {
      id: this.generateEntryId(),
      timestamp: new Date().toISOString(),
      event_type: 'PAYOUT_ATTEMPT',
      status: 'PENDING',
      pr_number: payoutData.pr_number,
      contributor: payoutData.contributor,
      amount: payoutData.amount,
      currency: payoutData.currency || 'USD',
      issue_number: payoutData.issue_number,
      bounty_label: payoutData.bounty_label,
      metadata: {
        repository: process.env.GITHUB_REPOSITORY || 'unknown',
        workflow_run_id: process.env.GITHUB_RUN_ID || 'unknown',
        actor: process.env.GITHUB_ACTOR || 'unknown'
      }
    };

    this.auditData.audit_entries.push(entry);
    this.updateSummary();
    this.saveAuditData();

    console.log(`✓ Payout attempt logged: ${entry.id}`);
    return entry.id;
  }

  /**
   * Log a successful payout
   * @param {string} entryId - The audit entry ID from the attempt
   * @param {Object} payoutDetails - Details of the successful payout
   */
  logPayoutSuccess(entryId, payoutDetails) {
    const entry = this.auditData.audit_entries.find(e => e.id === entryId);
    
    if (!entry) {
      console.error(`Entry not found: ${entryId}`);
      return false;
    }

    entry.status = 'SUCCESS';
    entry.completed_at = new Date().toISOString();
    entry.payout_details = {
      transaction_id: payoutDetails.transaction_id || 'N/A',
      payment_method: payoutDetails.payment_method || 'UNKNOWN',
      confirmation_hash: payoutDetails.confirmation_hash || null,
      fee_amount: payoutDetails.fee_amount || 0,
      net_amount: payoutDetails.net_amount || entry.amount
    };

    this.updateSummary();
    this.saveAuditData();

    console.log(`✓ Payout success logged: ${entryId}`);
    return true;
  }

  /**
   * Log a failed payout
   * @param {string} entryId - The audit entry ID from the attempt
   * @param {string} errorMessage - Error message
   * @param {Object} errorDetails - Additional error details
   */
  logPayoutFailure(entryId, errorMessage, errorDetails = {}) {
    const entry = this.auditData.audit_entries.find(e => e.id === entryId);
    
    if (!entry) {
      console.error(`Entry not found: ${entryId}`);
      return false;
    }

    entry.status = 'FAILED';
    entry.failed_at = new Date().toISOString();
    entry.error = {
      message: errorMessage,
      code: errorDetails.code || 'UNKNOWN_ERROR',
      details: errorDetails.details || null,
      retry_count: errorDetails.retry_count || 0
    };

    this.updateSummary();
    this.saveAuditData();

    console.log(`✗ Payout failure logged: ${entryId} - ${errorMessage}`);
    return true;
  }

  /**
   * Update the summary statistics
   */
  updateSummary() {
    const entries = this.auditData.audit_entries;
    const payoutEntries = entries.filter(e => e.event_type === 'PAYOUT_ATTEMPT');

    this.auditData.summary.total_entries = entries.length;
    this.auditData.summary.total_payouts_processed = payoutEntries.filter(e => e.status === 'SUCCESS').length;
    this.auditData.summary.failed_payouts = payoutEntries.filter(e => e.status === 'FAILED').length;
    this.auditData.summary.pending_payouts = payoutEntries.filter(e => e.status === 'PENDING').length;

    // Calculate total amount paid
    this.auditData.summary.total_amount_paid = payoutEntries
      .filter(e => e.status === 'SUCCESS' && e.payout_details)
      .reduce((sum, e) => sum + (e.payout_details.net_amount || e.amount), 0);

    // Set last payout date
    const lastSuccessful = payoutEntries
      .filter(e => e.status === 'SUCCESS')
      .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))[0];
    
    this.auditData.summary.last_payout_date = lastSuccessful ? lastSuccessful.completed_at : null;
    this.auditData.last_updated = new Date().toISOString();
  }

  /**
   * Save the audit data to the JSON file
   */
  saveAuditData() {
    try {
      const dir = path.dirname(this.auditFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.auditFilePath, JSON.stringify(this.auditData, null, 2));
      console.log(`✓ Audit data saved to ${this.auditFilePath}`);
    } catch (error) {
      console.error('Error saving audit data:', error);
      throw error;
    }
  }

  /**
   * Get all audit entries
   */
  getAuditEntries() {
    return this.auditData.audit_entries;
  }

  /**
   * Get audit entries for a specific contributor
   * @param {string} contributor - GitHub username
   */
  getContributorPayouts(contributor) {
    return this.auditData.audit_entries.filter(
      e => e.event_type === 'PAYOUT_ATTEMPT' && e.contributor === contributor
    );
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    return this.auditData.summary;
  }

  /**
   * Get audit entries within a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   */
  getEntriesByDateRange(startDate, endDate) {
    return this.auditData.audit_entries.filter(e => {
      const entryDate = new Date(e.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  /**
   * Export audit data for tax reporting
   * @param {Date} startDate - Fiscal year start date
   * @param {Date} endDate - Fiscal year end date
   */
  exportForTaxReporting(startDate, endDate) {
    const entries = this.getEntriesByDateRange(startDate, endDate);
    const payoutsByContributor = {};

    entries.forEach(entry => {
      if (entry.event_type === 'PAYOUT_ATTEMPT' && entry.status === 'SUCCESS') {
        if (!payoutsByContributor[entry.contributor]) {
          payoutsByContributor[entry.contributor] = {
            contributor: entry.contributor,
            total_payouts: 0,
            total_amount: 0,
            currency: entry.currency,
            transactions: []
          };
        }
        payoutsByContributor[entry.contributor].total_payouts += 1;
        payoutsByContributor[entry.contributor].total_amount += entry.payout_details?.net_amount || entry.amount;
        payoutsByContributor[entry.contributor].transactions.push({
          date: entry.completed_at,
          amount: entry.payout_details?.net_amount || entry.amount,
          pr_number: entry.pr_number,
          transaction_id: entry.payout_details?.transaction_id
        });
      }
    });

    return {
      period_start: startDate.toISOString(),
      period_end: endDate.toISOString(),
      total_contributors: Object.keys(payoutsByContributor).length,
      total_payouts: Object.values(payoutsByContributor).reduce((sum, c) => sum + c.total_payouts, 0),
      total_amount: Object.values(payoutsByContributor).reduce((sum, c) => sum + c.total_amount, 0),
      contributors: payoutsByContributor
    };
  }
}

module.exports = PayoutLogger;
