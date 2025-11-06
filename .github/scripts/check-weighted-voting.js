#!/usr/bin/env node

/**
 * Check Weighted Voting CLI Script
 * 
 * This script is called by the GitHub Actions workflow to check if a PR
 * meets the weighted voting requirements for merging.
 * 
 * Usage:
 *   node check-weighted-voting.js --pr-number 100 --pr-title "..." --pr-labels "[...]" --ci-pass true
 */

const WeightedVoteChecker = require('./weighted_vote_checker');
const fs = require('fs');
const path = require('path');

// Parse command-line arguments
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace(/^--/, '');
  const value = args[i + 1];
  options[key] = value;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🗳️  Weighted Voting Check');
    console.log('='.repeat(60));

    const checker = new WeightedVoteChecker();

    // Parse PR data
    const prNumber = parseInt(options['pr-number']);
    const prTitle = options['pr-title'] || '';
    const prBody = options['pr-body'] || '';
    const prLabelsStr = options['pr-labels'] || '[]';
    const ciPass = options['ci-pass'] === 'true';

    let prLabels = [];
    try {
      prLabels = JSON.parse(prLabelsStr);
    } catch (e) {
      console.warn('Warning: Could not parse PR labels');
    }

    console.log('\n📋 PR Details:');
    console.log(`   PR Number: #${prNumber}`);
    console.log(`   Title: ${prTitle}`);
    console.log(`   Labels: ${prLabels.join(', ') || 'None'}`);
    console.log(`   CI Pass: ${ciPass}`);

    // Check weighted voting
    const result = checker.canMergePR({
      pr_number: prNumber,
      title: prTitle,
      body: prBody,
      labels: prLabels,
      ci_pass: ciPass
    });

    console.log('\n📊 Voting Result:');
    console.log(`   Can Merge: ${result.can_merge}`);
    console.log(`   Reason: ${result.reason}`);
    console.log(`   PR Type: ${result.pr_type}`);

    if (result.vote_score) {
      console.log('\n🗳️  Vote Score:');
      console.log(`   Total Votes: ${result.vote_score.total_votes}`);
      console.log(`   Approve: ${result.vote_score.approve_percentage}%`);
      console.log(`   Reject: ${result.vote_score.reject_percentage}%`);
    }

    // Write result to file for workflow to read
    const resultFile = path.join(__dirname, '../voting-result.json');
    const output = {
      can_merge: result.can_merge,
      reason: result.reason,
      pr_number: prNumber,
      pr_type: result.pr_type,
      vote_score: result.vote_score,
      checks: result.checks,
      threshold: checker.getMergePolicy(result.pr_type).weighted_vote_threshold || 50
    };

    fs.writeFileSync(resultFile, JSON.stringify(output, null, 2));

    console.log('\n' + '='.repeat(60));

    if (result.can_merge) {
      console.log('✅ PR is eligible for merge!');
      process.exit(0);
    } else {
      console.log('⚠️  PR is not yet eligible for merge.');
      console.log(`   Reason: ${result.reason}`);
      process.exit(0); // Exit 0 so workflow continues (this is a check, not a blocker)
    }
  } catch (error) {
    console.error('\n❌ Fatal error during voting check:');
    console.error(error);
    process.exit(1);
  }
}

main();
