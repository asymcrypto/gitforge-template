#!/usr/bin/env node

/**
 * Weighted Voting System Test Script
 * 
 * This script tests the weighted voting system with various scenarios:
 * - Normal PR approval
 * - Bounty PR with special rules
 * - Security PR requiring founder approval
 * - Veto scenarios
 * - Override scenarios
 */

const WeightedVoteChecker = require('./weighted_vote_checker');

async function main() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🗳️  GitForge Weighted Voting System Test');
    console.log('='.repeat(70));

    const checker = new WeightedVoteChecker();

    // Test 1: Normal PR with sufficient votes
    console.log('\n\n📋 TEST 1: Normal PR with Sufficient Votes');
    console.log('-'.repeat(70));

    const pr1 = {
      pr_number: 100,
      title: 'Add new feature to dashboard',
      body: 'This PR adds a new feature to the dashboard',
      labels: ['feature'],
      ci_pass: true
    };

    // Register votes
    checker.registerVote({
      pr_number: 100,
      voter: 'asymcrypto',
      vote: 'approve',
      comment: 'Looks good to me'
    });

    checker.registerVote({
      pr_number: 100,
      voter: 'alice-maintainer',
      vote: 'approve',
      comment: 'Approved'
    });

    const result1 = checker.canMergePR(pr1);
    console.log(`\nMerge Eligible: ${result1.can_merge}`);
    console.log(`Reason: ${result1.reason}`);
    if (result1.vote_score) {
      console.log(`Vote Score: ${result1.vote_score.approve_percentage}%`);
    }

    // Test 2: Bounty PR
    console.log('\n\n📋 TEST 2: Bounty PR with Special Rules');
    console.log('-'.repeat(70));

    const pr2 = {
      pr_number: 101,
      title: 'Fix bug in payout system',
      body: 'This PR fixes a critical bug',
      labels: ['bounty', 'bug'],
      ci_pass: true
    };

    checker.registerVote({
      pr_number: 101,
      voter: 'asymcrypto',
      vote: 'approve',
      comment: 'Bounty approved'
    });

    checker.registerVote({
      pr_number: 101,
      voter: 'alice-maintainer',
      vote: 'approve',
      comment: 'Verified fix'
    });

    const result2 = checker.canMergePR(pr2);
    console.log(`\nPR Type: bounty`);
    console.log(`Merge Eligible: ${result2.can_merge}`);
    console.log(`Reason: ${result2.reason}`);
    if (result2.vote_score) {
      console.log(`Vote Score: ${result2.vote_score.approve_percentage}%`);
    }

    // Test 3: Security PR requiring founder approval
    console.log('\n\n📋 TEST 3: Security PR (Requires Founder Approval)');
    console.log('-'.repeat(70));

    const pr3 = {
      pr_number: 102,
      title: 'Fix security vulnerability',
      body: 'This PR fixes a critical security issue',
      labels: ['security'],
      ci_pass: true
    };

    // Try without founder approval
    checker.registerVote({
      pr_number: 102,
      voter: 'alice-maintainer',
      vote: 'approve',
      comment: 'Security fix verified'
    });

    const result3a = checker.canMergePR(pr3);
    console.log(`\nWithout Founder Approval:`);
    console.log(`Merge Eligible: ${result3a.can_merge}`);
    console.log(`Reason: ${result3a.reason}`);

    // Add founder approval
    checker.registerVote({
      pr_number: 102,
      voter: 'asymcrypto',
      vote: 'approve',
      comment: 'Founder approved'
    });

    const result3b = checker.canMergePR(pr3);
    console.log(`\nWith Founder Approval:`);
    console.log(`Merge Eligible: ${result3b.can_merge}`);
    console.log(`Reason: ${result3b.reason}`);

    // Test 4: PR with Veto
    console.log('\n\n📋 TEST 4: PR with Veto (Blocked)');
    console.log('-'.repeat(70));

    const pr4 = {
      pr_number: 103,
      title: 'Controversial change',
      body: 'This PR makes a controversial change',
      labels: ['feature'],
      ci_pass: true
    };

    checker.registerVote({
      pr_number: 103,
      voter: 'asymcrypto',
      vote: 'approve',
      comment: 'I approve'
    });

    checker.registerVote({
      pr_number: 103,
      voter: 'alice-maintainer',
      vote: 'veto',
      comment: 'This breaks our architecture'
    });

    const result4 = checker.canMergePR(pr4);
    console.log(`\nMerge Eligible: ${result4.can_merge}`);
    console.log(`Reason: ${result4.reason}`);
    if (result4.vote_score) {
      console.log(`Veto Count: ${result4.vote_score.veto_count}`);
    }

    // Test 5: PR with insufficient votes
    console.log('\n\n📋 TEST 5: PR with Insufficient Votes');
    console.log('-'.repeat(70));

    const pr5 = {
      pr_number: 104,
      title: 'Minor documentation update',
      body: 'This PR updates documentation',
      labels: ['docs'],
      ci_pass: true
    };

    checker.registerVote({
      pr_number: 104,
      voter: 'bob-reviewer',
      vote: 'approve',
      comment: 'Looks good'
    });

    const result5 = checker.canMergePR(pr5);
    console.log(`\nMerge Eligible: ${result5.can_merge}`);
    console.log(`Reason: ${result5.reason}`);
    if (result5.vote_score) {
      console.log(`Vote Score: ${result5.vote_score.approve_percentage}%`);
      console.log(`Threshold: 50%`);
    }

    // Test 6: Governance Summary
    console.log('\n\n📊 TEST 6: Governance Summary');
    console.log('-'.repeat(70));

    const summary = checker.getSummary();
    console.log(`\nTotal Maintainers: ${summary.total_maintainers}`);
    console.log(`Active Maintainers: ${summary.active_maintainers}`);
    console.log(`Total Votes Cast: ${summary.total_votes_cast}`);
    console.log(`Total Overrides: ${summary.total_overrides}`);
    console.log(`Governance Model: ${summary.governance_model}`);
    console.log(`Merge Approval Threshold: ${summary.merge_approval_threshold}%`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ All weighted voting tests completed!');
    console.log('='.repeat(70) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error during testing:');
    console.error(error);
    process.exit(1);
  }
}

main();
