#!/usr/bin/env node

/**
 * Governance Audit Logger Test Script
 * 
 * This script tests the governance audit logging system with various scenarios.
 */

const GovernanceAuditLogger = require('./governance_audit_logger');

async function main() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('📋 GitForge Governance Audit Logger Test');
    console.log('='.repeat(70));

    const logger = new GovernanceAuditLogger();

    // Test 1: Log votes
    console.log('\n\n📊 TEST 1: Logging Votes');
    console.log('-'.repeat(70));

    logger.logVote({
      voter: 'asymcrypto',
      voter_role: 'founder',
      pr_number: 100,
      vote: 'approve',
      vote_weight: 100,
      comment: 'Looks good to me',
      pr_type: 'normal'
    });

    logger.logVote({
      voter: 'alice-maintainer',
      voter_role: 'lead_maintainer',
      pr_number: 100,
      vote: 'approve',
      vote_weight: 75,
      comment: 'Approved',
      pr_type: 'normal'
    });

    logger.logVote({
      voter: 'bob-reviewer',
      voter_role: 'reviewer',
      pr_number: 100,
      vote: 'request_changes',
      vote_weight: 25,
      comment: 'Need some changes',
      pr_type: 'normal'
    });

    console.log('✓ Votes logged successfully');

    // Test 2: Log a PR merge
    console.log('\n\n📋 TEST 2: Logging PR Merge');
    console.log('-'.repeat(70));

    logger.logMerge({
      merger: 'asymcrypto',
      merger_role: 'founder',
      pr_number: 100,
      pr_title: 'Add new feature to dashboard',
      pr_author: 'john-developer',
      pr_type: 'normal',
      merge_commit: 'abc123def456',
      weighted_vote_score: 85
    });

    console.log('✓ PR merge logged successfully');

    // Test 3: Log a veto
    console.log('\n\n📋 TEST 3: Logging Veto');
    console.log('-'.repeat(70));

    logger.logVeto({
      vetoer: 'alice-maintainer',
      vetoer_role: 'lead_maintainer',
      pr_number: 101,
      pr_title: 'Controversial change',
      reason: 'This breaks our architecture',
      veto_weight: 75
    });

    console.log('✓ Veto logged successfully');

    // Test 4: Log an override
    console.log('\n\n📋 TEST 4: Logging Override');
    console.log('-'.repeat(70));

    logger.logOverride({
      overrider: 'asymcrypto',
      overrider_role: 'founder',
      pr_number: 101,
      override_type: 'FORCE_MERGE',
      reason: 'Critical hotfix needed',
      original_decision: 'BLOCKED_BY_VETO'
    });

    console.log('✓ Override logged successfully');

    // Test 5: Log policy changes
    console.log('\n\n📋 TEST 5: Logging Policy Changes');
    console.log('-'.repeat(70));

    logger.logPolicyChange({
      actor: 'asymcrypto',
      actor_role: 'founder',
      policy_name: 'merge_approval_threshold',
      old_value: '50%',
      new_value: '60%',
      reason: 'Increasing security requirements'
    });

    console.log('✓ Policy change logged successfully');

    // Test 6: Query audit log
    console.log('\n\n📋 TEST 6: Querying Audit Log');
    console.log('-'.repeat(70));

    const pr100Entries = logger.getEntriesForPR(100);
    console.log(`\nPR #100 entries: ${pr100Entries.length}`);
    pr100Entries.forEach(e => {
      console.log(`  - ${e.event_type}: ${e.action}`);
    });

    const asymcryptoEntries = logger.getEntriesByActor('asymcrypto');
    console.log(`\nEntries by asymcrypto: ${asymcryptoEntries.length}`);

    const voteEntries = logger.getEntriesByEventType('VOTE_CAST');
    console.log(`\nTotal votes: ${voteEntries.length}`);

    // Test 7: Verify integrity
    console.log('\n\n📋 TEST 7: Verifying Audit Log Integrity');
    console.log('-'.repeat(70));

    const integrityResult = logger.verifyIntegrity();
    console.log(`\nIntegrity OK: ${integrityResult.integrity_ok}`);
    console.log(`Total entries: ${integrityResult.total_entries}`);

    // Test 8: Export compliance report
    console.log('\n\n📋 TEST 8: Exporting Compliance Report');
    console.log('-'.repeat(70));

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();

    const complianceReport = logger.exportComplianceReport(startDate, endDate);
    console.log(`\nCompliance Report (Last 7 days):`);
    console.log(`  Total Entries: ${complianceReport.summary.total_entries}`);
    console.log(`  Votes: ${complianceReport.summary.votes}`);
    console.log(`  Merges: ${complianceReport.summary.merges}`);
    console.log(`  Vetoes: ${complianceReport.summary.vetoes}`);
    console.log(`  Overrides: ${complianceReport.summary.overrides}`);
    console.log(`  Policy Changes: ${complianceReport.summary.policy_changes}`);

    // Test 9: Summary
    console.log('\n\n📊 TEST 9: Audit Log Summary');
    console.log('-'.repeat(70));

    const summary = logger.getSummary();
    console.log(`\nTotal Entries: ${summary.total_entries}`);
    console.log(`Total Votes: ${summary.total_votes}`);
    console.log(`Total Merges: ${summary.total_merges}`);
    console.log(`Total Vetoes: ${summary.total_vetoes}`);
    console.log(`Total Overrides: ${summary.total_overrides}`);
    console.log(`Total Policy Changes: ${summary.total_policy_changes}`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ All governance audit tests completed!');
    console.log('='.repeat(70) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error during testing:');
    console.error(error);
    process.exit(1);
  }
}

main();
