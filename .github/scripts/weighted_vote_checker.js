#!/usr/bin/env node

/**
 * Weighted Vote Checker Module
 * 
 * This module implements the weighted voting system for PR merges.
 * It ensures that all PRs meet the governance requirements before merging,
 * providing enterprise-grade control over code quality and compliance.
 * 
 * Features:
 * - Weighted voting based on maintainer roles
 * - Veto power for senior maintainers
 * - Special rules for bounty, security, and governance PRs
 * - Complete audit trail of all votes
 * - Override capabilities for founders
 */

const fs = require('fs');
const path = require('path');

class WeightedVoteChecker {
  constructor() {
    this.governanceConfigPath = path.join(__dirname, '../../github/GOVERNANCE_CONFIG.json');
    this.loadGovernanceConfig();
  }

  /**
   * Load governance configuration
   */
  loadGovernanceConfig() {
    try {
      if (fs.existsSync(this.governanceConfigPath)) {
        this.config = JSON.parse(fs.readFileSync(this.governanceConfigPath, 'utf-8'));
      } else {
        throw new Error('Governance config not found');
      }
    } catch (error) {
      console.error('Error loading governance config:', error);
      throw error;
    }
  }

  /**
   * Get maintainer by GitHub username
   * @param {string} username - GitHub username
   * @returns {Object} - Maintainer object or null
   */
  getMaintainer(username) {
    return this.config.maintainers.find(m => m.github_username === username);
  }

  /**
   * Get role configuration
   * @param {string} role - Role name
   * @returns {Object} - Role configuration
   */
  getRoleConfig(role) {
    return this.config.maintainer_roles[role];
  }

  /**
   * Determine PR type (bounty, security, governance, or normal)
   * @param {Array} labels - PR labels
   * @param {string} title - PR title
   * @param {string} body - PR body
   * @returns {string} - PR type
   */
  determinePRType(labels, title, body) {
    const allText = `${title} ${body}`.toLowerCase();
    
    if (labels.some(l => l.toLowerCase().includes('bounty'))) {
      return 'bounty';
    }
    if (labels.some(l => l.toLowerCase().includes('security')) || allText.includes('security')) {
      return 'security';
    }
    if (labels.some(l => l.toLowerCase().includes('governance')) || allText.includes('governance')) {
      return 'governance';
    }
    
    return 'normal';
  }

  /**
   * Get merge policy for PR type
   * @param {string} prType - PR type
   * @returns {Object} - Merge policy
   */
  getMergePolicy(prType) {
    if (prType === 'bounty') {
      return this.config.special_rules.bounty_prs;
    }
    if (prType === 'security') {
      return this.config.special_rules.security_prs;
    }
    if (prType === 'governance') {
      return this.config.special_rules.governance_prs;
    }
    
    return {
      weighted_vote_threshold: this.config.voting_rules.merge_approval_threshold,
      require_additional_review: false
    };
  }

  /**
   * Register a vote for a PR
   * @param {Object} voteData - Vote data
   * @param {number} voteData.pr_number - PR number
   * @param {string} voteData.voter - GitHub username of voter
   * @param {string} voteData.vote - Vote ('approve', 'request_changes', 'abstain', 'veto')
   * @returns {Object} - Vote record
   */
  registerVote(voteData) {
    const maintainer = this.getMaintainer(voteData.voter);
    
    if (!maintainer) {
      throw new Error(`Voter ${voteData.voter} is not a registered maintainer`);
    }

    const voteRecord = {
      id: `VOTE_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      pr_number: voteData.pr_number,
      voter: voteData.voter,
      voter_role: maintainer.role,
      vote_weight: maintainer.vote_weight,
      vote: voteData.vote,
      comment: voteData.comment || '',
      metadata: {
        repository: voteData.repository || 'unknown',
        workflow_run_id: voteData.workflow_run_id || 'unknown'
      }
    };

    // Add to voting history
    this.config.voting_history.push(voteRecord);

    // Save updated config
    this.saveGovernanceConfig();

    return voteRecord;
  }

  /**
   * Get all votes for a PR
   * @param {number} prNumber - PR number
   * @returns {Array} - Array of vote records
   */
  getVotesForPR(prNumber) {
    return this.config.voting_history.filter(v => v.pr_number === prNumber);
  }

  /**
   * Calculate weighted vote score for a PR
   * @param {number} prNumber - PR number
   * @returns {Object} - Vote calculation result
   */
  calculateVoteScore(prNumber) {
    const votes = this.getVotesForPR(prNumber);
    
    let approveWeight = 0;
    let rejectWeight = 0;
    let vetoCount = 0;
    let totalWeight = 0;

    votes.forEach(vote => {
      const weight = vote.vote_weight;
      totalWeight += weight;

      if (vote.vote === 'approve') {
        approveWeight += weight;
      } else if (vote.vote === 'request_changes') {
        rejectWeight += weight;
      } else if (vote.vote === 'veto') {
        vetoCount += 1;
        rejectWeight += weight * 2; // Veto has double weight
      }
    });

    const approvePercentage = totalWeight > 0 ? (approveWeight / totalWeight) * 100 : 0;
    const rejectPercentage = totalWeight > 0 ? (rejectWeight / totalWeight) * 100 : 0;

    return {
      pr_number: prNumber,
      total_votes: votes.length,
      total_weight: totalWeight,
      approve_weight: approveWeight,
      reject_weight: rejectWeight,
      veto_count: vetoCount,
      approve_percentage: parseFloat(approvePercentage.toFixed(2)),
      reject_percentage: parseFloat(rejectPercentage.toFixed(2)),
      votes: votes
    };
  }

  /**
   * Check if a PR can be merged
   * @param {Object} prData - PR data
   * @param {number} prData.pr_number - PR number
   * @param {Array} prData.labels - PR labels
   * @param {string} prData.title - PR title
   * @param {string} prData.body - PR body
   * @param {boolean} prData.ci_pass - CI/CD pass status
   * @returns {Object} - Merge eligibility result
   */
  canMergePR(prData) {
    console.log(`\n🔍 Checking merge eligibility for PR #${prData.pr_number}...`);

    // Determine PR type
    const prType = this.determinePRType(prData.labels || [], prData.title || '', prData.body || '');
    console.log(`   PR Type: ${prType}`);

    // Get merge policy
    const mergePolicy = this.getMergePolicy(prType);
    const threshold = mergePolicy.weighted_vote_threshold || this.config.voting_rules.merge_approval_threshold;

    // Check CI/CD
    if (this.config.merge_policies.require_ci_pass && !prData.ci_pass) {
      return {
        can_merge: false,
        reason: 'CI/CD checks failed',
        pr_number: prData.pr_number,
        pr_type: prType,
        checks: {
          ci_pass: false,
          weighted_vote: null,
          code_review: null
        }
      };
    }

    // Calculate vote score
    const voteScore = this.calculateVoteScore(prData.pr_number);

    // Check for veto
    if (voteScore.veto_count > 0) {
      return {
        can_merge: false,
        reason: `Merge blocked by ${voteScore.veto_count} veto(s)`,
        pr_number: prData.pr_number,
        pr_type: prType,
        checks: {
          ci_pass: true,
          weighted_vote: false,
          veto_count: voteScore.veto_count
        }
      };
    }

    // Check weighted vote threshold
    const meetsThreshold = voteScore.approve_percentage >= threshold;

    console.log(`   Weighted Vote: ${voteScore.approve_percentage}% (threshold: ${threshold}%)`);
    console.log(`   Total Votes: ${voteScore.total_votes}`);

    if (!meetsThreshold) {
      return {
        can_merge: false,
        reason: `Weighted vote score (${voteScore.approve_percentage}%) below threshold (${threshold}%)`,
        pr_number: prData.pr_number,
        pr_type: prType,
        vote_score: voteScore,
        checks: {
          ci_pass: true,
          weighted_vote: false
        }
      };
    }

    // Check for required security/governance approvals
    if (mergePolicy.require_founder_approval) {
      const founderVotes = voteScore.votes.filter(v => v.voter_role === 'founder' && v.vote === 'approve');
      if (founderVotes.length === 0) {
        return {
          can_merge: false,
          reason: 'Founder approval required for this PR type',
          pr_number: prData.pr_number,
          pr_type: prType,
          checks: {
            ci_pass: true,
            weighted_vote: true,
            founder_approval: false
          }
        };
      }
    }

    return {
      can_merge: true,
      reason: 'All merge requirements met',
      pr_number: prData.pr_number,
      pr_type: prType,
      vote_score: voteScore,
      checks: {
        ci_pass: true,
        weighted_vote: true,
        founder_approval: !mergePolicy.require_founder_approval || true
      }
    };
  }

  /**
   * Override a merge decision (founder only)
   * @param {Object} overrideData - Override data
   * @param {number} overrideData.pr_number - PR number
   * @param {string} overrideData.overrider - GitHub username
   * @param {string} overrideData.reason - Override reason
   * @returns {Object} - Override record
   */
  overrideMergeDecision(overrideData) {
    const maintainer = this.getMaintainer(overrideData.overrider);

    if (!maintainer || !maintainer.permissions.can_override) {
      throw new Error(`${overrideData.overrider} does not have override permissions`);
    }

    const overrideRecord = {
      id: `OVERRIDE_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      pr_number: overrideData.pr_number,
      overrider: overrideData.overrider,
      overrider_role: maintainer.role,
      reason: overrideData.reason,
      action: 'FORCE_MERGE',
      metadata: {
        repository: overrideData.repository || 'unknown'
      }
    };

    // Log override to voting history
    this.config.voting_history.push(overrideRecord);
    this.saveGovernanceConfig();

    console.log(`⚠️  Override decision recorded: ${overrideRecord.id}`);

    return overrideRecord;
  }

  /**
   * Save governance configuration
   */
  saveGovernanceConfig() {
    try {
      fs.writeFileSync(this.governanceConfigPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Error saving governance config:', error);
      throw error;
    }
  }

  /**
   * Get governance summary
   * @returns {Object} - Summary of governance state
   */
  getSummary() {
    const totalVotes = this.config.voting_history.filter(v => v.vote).length;
    const totalOverrides = this.config.voting_history.filter(v => v.action === 'FORCE_MERGE').length;
    const activeMaintainers = this.config.maintainers.filter(m => m.active).length;

    return {
      total_maintainers: this.config.maintainers.length,
      active_maintainers: activeMaintainers,
      total_votes_cast: totalVotes,
      total_overrides: totalOverrides,
      governance_model: this.config.governance_model,
      merge_approval_threshold: this.config.voting_rules.merge_approval_threshold
    };
  }
}

module.exports = WeightedVoteChecker;
