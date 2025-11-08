/**
 * Governance Audit Logger Module
 * 
 * This module provides a comprehensive audit logging system for all governance actions.
 * It creates an immutable, append-only log of:
 * - Weighted voting decisions
 * - PR merges and rejections
 * - Governance policy changes
 * - Maintainer role changes
 * - Override actions
 * - Veto actions
 * 
 * This log is critical for compliance, transparency, and dispute resolution.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class GovernanceAuditLogger {
  constructor() {
    this.auditLogPath = path.join(__dirname, '../../github/GOVERNANCE_AUDIT.json');
    this.loadAuditLog();
  }

  /**
   * Load the governance audit log
   */
  loadAuditLog() {
    try {
      if (fs.existsSync(this.auditLogPath)) {
        this.auditLog = JSON.parse(fs.readFileSync(this.auditLogPath, 'utf-8'));
      } else {
        this.auditLog = this.initializeAuditLog();
      }
    } catch (error) {
      console.error('Error loading governance audit log:', error);
      this.auditLog = this.initializeAuditLog();
    }
  }

  /**
   * Initialize a new audit log
   */
  initializeAuditLog() {
    return {
      version: '1.0.0',
      description: 'Immutable audit log for all governance actions. This file is append-only and serves as the single source of truth for governance compliance.',
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      entries: [
        {
          id: 'GOVERNANCE_AUDIT_INIT_001',
          timestamp: new Date().toISOString(),
          event_type: 'SYSTEM_INITIALIZED',
          actor: 'system',
          action: 'Governance Audit System initialized',
          details: {
            version: '1.0.0',
            system: 'GitForge Enterprise Governance'
          },
          hash: null
        }
      ],
      summary: {
        total_entries: 1,
        total_votes: 0,
        total_merges: 0,
        total_vetoes: 0,
        total_overrides: 0,
        total_policy_changes: 0
      }
    };
  }

  /**
   * Generate a cryptographic hash for an entry
   * @param {Object} entry - The entry to hash
   * @returns {string} - SHA256 hash
   */
  generateHash(entry) {
    const entryString = JSON.stringify(entry, null, 2);
    return crypto.createHash('sha256').update(entryString).digest('hex');
  }

  /**
   * Log a voting action
   * @param {Object} voteData - Vote data
   * @returns {Object} - Audit entry
   */
  logVote(voteData) {
    const entry = {
      id: `GOVERNANCE_VOTE_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      event_type: 'VOTE_CAST',
      actor: voteData.voter,
      actor_role: voteData.voter_role,
      action: `Voted ${voteData.vote} on PR #${voteData.pr_number}`,
      details: {
        pr_number: voteData.pr_number,
        vote: voteData.vote,
        vote_weight: voteData.vote_weight,
        comment: voteData.comment || '',
        pr_type: voteData.pr_type || 'normal'
      },
      metadata: {
        repository: voteData.repository || 'unknown',
        workflow_run_id: voteData.workflow_run_id || 'unknown'
      },
      hash: null
    };

    // Generate hash for this entry
    entry.hash = this.generateHash(entry);

    // Add to audit log
    this.auditLog.entries.push(entry);
    this.auditLog.last_updated = new Date().toISOString();
    this.auditLog.summary.total_votes += 1;

    this.saveAuditLog();

    console.log(`✓ Vote logged: ${entry.id}`);
    return entry;
  }

  /**
   * Log a PR merge action
   * @param {Object} mergeData - Merge data
   * @returns {Object} - Audit entry
   */
  logMerge(mergeData) {
    const entry = {
      id: `GOVERNANCE_MERGE_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      event_type: 'PR_MERGED',
      actor: mergeData.merger,
      actor_role: mergeData.merger_role,
      action: `Merged PR #${mergeData.pr_number}: ${mergeData.pr_title}`,
      details: {
        pr_number: mergeData.pr_number,
        pr_title: mergeData.pr_title,
        pr_author: mergeData.pr_author,
        pr_type: mergeData.pr_type || 'normal',
        merge_commit: mergeData.merge_commit || 'unknown',
        weighted_vote_score: mergeData.weighted_vote_score || 0
      },
      metadata: {
        repository: mergeData.repository || 'unknown',
        workflow_run_id: mergeData.workflow_run_id || 'unknown'
      },
      hash: null
    };

    entry.hash = this.generateHash(entry);
    this.auditLog.entries.push(entry);
    this.auditLog.last_updated = new Date().toISOString();
    this.auditLog.summary.total_merges += 1;

    this.saveAuditLog();

    console.log(`✓ Merge logged: ${entry.id}`);
    return entry;
  }

  /**
   * Log a veto action
   * @param {Object} vetoData - Veto data
   * @returns {Object} - Audit entry
   */
  logVeto(vetoData) {
    const entry = {
      id: `GOVERNANCE_VETO_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      event_type: 'VETO_CAST',
      actor: vetoData.vetoer,
      actor_role: vetoData.vetoer_role,
      action: `Vetoed PR #${vetoData.pr_number}`,
      details: {
        pr_number: vetoData.pr_number,
        pr_title: vetoData.pr_title,
        reason: vetoData.reason || 'No reason provided',
        veto_weight: vetoData.veto_weight || 0
      },
      metadata: {
        repository: vetoData.repository || 'unknown'
      },
      hash: null
    };

    entry.hash = this.generateHash(entry);
    this.auditLog.entries.push(entry);
    this.auditLog.last_updated = new Date().toISOString();
    this.auditLog.summary.total_vetoes += 1;

    this.saveAuditLog();

    console.log(`✓ Veto logged: ${entry.id}`);
    return entry;
  }

  /**
   * Log an override action
   * @param {Object} overrideData - Override data
   * @returns {Object} - Audit entry
   */
  logOverride(overrideData) {
    const entry = {
      id: `GOVERNANCE_OVERRIDE_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      event_type: 'OVERRIDE_ACTION',
      actor: overrideData.overrider,
      actor_role: overrideData.overrider_role,
      action: `Override action on PR #${overrideData.pr_number}`,
      details: {
        pr_number: overrideData.pr_number,
        override_type: overrideData.override_type || 'FORCE_MERGE',
        reason: overrideData.reason || 'No reason provided',
        original_decision: overrideData.original_decision || 'unknown'
      },
      metadata: {
        repository: overrideData.repository || 'unknown'
      },
      hash: null
    };

    entry.hash = this.generateHash(entry);
    this.auditLog.entries.push(entry);
    this.auditLog.last_updated = new Date().toISOString();
    this.auditLog.summary.total_overrides += 1;

    this.saveAuditLog();

    console.log(`✓ Override logged: ${entry.id}`);
    return entry;
  }

  /**
   * Log a policy change
   * @param {Object} policyData - Policy change data
   * @returns {Object} - Audit entry
   */
  logPolicyChange(policyData) {
    const entry = {
      id: `GOVERNANCE_POLICY_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      event_type: 'POLICY_CHANGED',
      actor: policyData.actor,
      actor_role: policyData.actor_role,
      action: `Policy changed: ${policyData.policy_name}`,
      details: {
        policy_name: policyData.policy_name,
        old_value: policyData.old_value,
        new_value: policyData.new_value,
        reason: policyData.reason || 'No reason provided'
      },
      metadata: {
        repository: policyData.repository || 'unknown'
      },
      hash: null
    };

    entry.hash = this.generateHash(entry);
    this.auditLog.entries.push(entry);
    this.auditLog.last_updated = new Date().toISOString();
    this.auditLog.summary.total_policy_changes += 1;

    this.saveAuditLog();

    console.log(`✓ Policy change logged: ${entry.id}`);
    return entry;
  }

  /**
   * Get audit entries for a specific PR
   * @param {number} prNumber - PR number
   * @returns {Array} - Audit entries for the PR
   */
  getEntriesForPR(prNumber) {
    return this.auditLog.entries.filter(e => e.details?.pr_number === prNumber);
  }

  /**
   * Get audit entries by actor
   * @param {string} actor - Actor (GitHub username)
   * @returns {Array} - Audit entries by the actor
   */
  getEntriesByActor(actor) {
    return this.auditLog.entries.filter(e => e.actor === actor);
  }

  /**
   * Get audit entries by event type
   * @param {string} eventType - Event type
   * @returns {Array} - Audit entries of the type
   */
  getEntriesByEventType(eventType) {
    return this.auditLog.entries.filter(e => e.event_type === eventType);
  }

  /**
   * Get audit entries within a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} - Audit entries within the range
   */
  getEntriesByDateRange(startDate, endDate) {
    return this.auditLog.entries.filter(e => {
      const entryDate = new Date(e.timestamp);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  /**
   * Verify the integrity of the audit log
   * @returns {Object} - Verification result
   */
  verifyIntegrity() {
    console.log('\n🔐 Verifying audit log integrity...');

    let integrityOk = true;
    const issues = [];

    for (let i = 1; i < this.auditLog.entries.length; i++) {
      const entry = this.auditLog.entries[i];
      const storedHash = entry.hash;

      // Temporarily remove hash to recalculate
      entry.hash = null;
      const calculatedHash = this.generateHash(entry);
      entry.hash = storedHash;

      if (storedHash !== calculatedHash) {
        integrityOk = false;
        issues.push(`Entry ${entry.id} has been tampered with`);
      }
    }

    const result = {
      integrity_ok: integrityOk,
      total_entries: this.auditLog.entries.length,
      issues: issues
    };

    if (integrityOk) {
      console.log('✓ Audit log integrity verified');
    } else {
      console.error('✗ Audit log integrity issues detected:');
      issues.forEach(issue => console.error(`  - ${issue}`));
    }

    return result;
  }

  /**
   * Export audit log for compliance reporting
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Object} - Compliance report
   */
  exportComplianceReport(startDate, endDate) {
    const entries = this.getEntriesByDateRange(startDate, endDate);

    return {
      report_period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      summary: {
        total_entries: entries.length,
        votes: entries.filter(e => e.event_type === 'VOTE_CAST').length,
        merges: entries.filter(e => e.event_type === 'PR_MERGED').length,
        vetoes: entries.filter(e => e.event_type === 'VETO_CAST').length,
        overrides: entries.filter(e => e.event_type === 'OVERRIDE_ACTION').length,
        policy_changes: entries.filter(e => e.event_type === 'POLICY_CHANGED').length
      },
      entries: entries
    };
  }

  /**
   * Save the audit log to file
   */
  saveAuditLog() {
    try {
      fs.writeFileSync(this.auditLogPath, JSON.stringify(this.auditLog, null, 2));
    } catch (error) {
      console.error('Error saving governance audit log:', error);
      throw error;
    }
  }

  /**
   * Get audit summary
   */
  getSummary() {
    return this.auditLog.summary;
  }
}

module.exports = GovernanceAuditLogger;
