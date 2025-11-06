#!/usr/bin/env node

/**
 * Update Equity on Payout Script
 * 
 * This script updates the EQUITY_TRACKING.json file when a bounty payout is successful.
 * It ensures that the equity/contributor data is synchronized with the payout audit trail.
 * 
 * Usage:
 *   node update-equity-on-payout.js --contributor username --amount 100 --pr-number 123
 */

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

const equityTrackingPath = path.join(__dirname, '../../github/EQUITY_TRACKING.json');

/**
 * Load equity tracking data
 */
function loadEquityTracking() {
  try {
    if (fs.existsSync(equityTrackingPath)) {
      return JSON.parse(fs.readFileSync(equityTrackingPath, 'utf-8'));
    }
  } catch (error) {
    console.error('Error loading equity tracking:', error);
  }

  return {
    total_equity_allocated: 0,
    total_equity_available: 100,
    bounties_completed: 0,
    bounties_pending: 0,
    last_updated: new Date().toISOString(),
    contributors: [],
    active_bounties: []
  };
}

/**
 * Save equity tracking data
 */
function saveEquityTracking(data) {
  try {
    fs.writeFileSync(equityTrackingPath, JSON.stringify(data, null, 2));
    console.log(`✓ Equity tracking updated: ${equityTrackingPath}`);
  } catch (error) {
    console.error('Error saving equity tracking:', error);
    throw error;
  }
}

/**
 * Main execution
 */
function main() {
  try {
    console.log('\n📊 Updating equity tracking on successful payout...');

    const contributor = options.contributor;
    const amount = parseFloat(options.amount);
    const prNumber = parseInt(options['pr-number']);

    if (!contributor || !amount || !prNumber) {
      console.error('❌ Missing required arguments: --contributor, --amount, --pr-number');
      process.exit(1);
    }

    // Load current equity tracking
    const equityData = loadEquityTracking();

    // Find or create contributor record
    let contributorRecord = equityData.contributors.find(c => c.username === contributor);

    if (!contributorRecord) {
      contributorRecord = {
        username: contributor,
        total_earned: 0,
        bounties_completed: 0,
        payout_history: [],
        reputation_score: 0,
        skills: [],
        joined_date: new Date().toISOString()
      };
      equityData.contributors.push(contributorRecord);
      console.log(`   ✓ Created new contributor record: ${contributor}`);
    }

    // Update contributor record
    contributorRecord.total_earned += amount;
    contributorRecord.bounties_completed += 1;
    contributorRecord.payout_history.push({
      date: new Date().toISOString(),
      amount: amount,
      pr_number: prNumber,
      status: 'completed'
    });

    // Calculate reputation score (simple formula: 1 point per $100 earned, 5 points per bounty)
    contributorRecord.reputation_score = Math.floor(contributorRecord.total_earned / 100) + (contributorRecord.bounties_completed * 5);

    // Update summary statistics
    equityData.bounties_completed += 1;
    equityData.total_equity_allocated += amount;
    equityData.last_updated = new Date().toISOString();

    console.log(`   ✓ Updated contributor: ${contributor}`);
    console.log(`     - Total Earned: $${contributorRecord.total_earned}`);
    console.log(`     - Bounties Completed: ${contributorRecord.bounties_completed}`);
    console.log(`     - Reputation Score: ${contributorRecord.reputation_score}`);

    // Save updated equity tracking
    saveEquityTracking(equityData);

    console.log('\n✅ Equity tracking updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error updating equity tracking:');
    console.error(error);
    process.exit(1);
  }
}

main();
