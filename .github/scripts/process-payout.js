#!/usr/bin/env node

/**
 * Process Payout CLI Script
 * 
 * This script is called by the GitHub Actions workflow to process a bounty payout.
 * It uses the PayoutProcessor module to handle the actual payout logic.
 * 
 * Usage:
 *   node process-payout.js --pr-number 123 --contributor username --amount 100 --currency USD
 */

const PayoutProcessor = require('./payout_processor');
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

// Validate required arguments
const requiredArgs = ['pr-number', 'contributor', 'amount', 'currency'];
const missingArgs = requiredArgs.filter(arg => !options[arg]);

if (missingArgs.length > 0) {
  console.error(`❌ Missing required arguments: ${missingArgs.join(', ')}`);
  console.error('\nUsage: node process-payout.js --pr-number <num> --contributor <user> --amount <num> --currency <code>');
  process.exit(1);
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 GitForge Bounty Payout Processor');
    console.log('='.repeat(60));

    const processor = new PayoutProcessor();

    // Prepare the payout request
    const payoutRequest = {
      pr_number: parseInt(options['pr-number']),
      contributor: options.contributor,
      amount: parseFloat(options.amount),
      currency: options.currency,
      issue_number: parseInt(options['issue-number'] || options['pr-number']),
      bounty_label: 'bounty'
    };

    console.log('\n📋 Payout Request:');
    console.log(`   PR Number: #${payoutRequest.pr_number}`);
    console.log(`   Contributor: ${payoutRequest.contributor}`);
    console.log(`   Amount: $${payoutRequest.amount} ${payoutRequest.currency}`);

    // Process the payout
    const result = await processor.processPayout(payoutRequest);

    // Write the result to a file for the workflow to read
    const resultFile = path.join(__dirname, '../payout-result.json');
    fs.writeFileSync(resultFile, JSON.stringify(result, null, 2));

    console.log('\n' + '='.repeat(60));

    if (result.success) {
      console.log('✅ Payout processed successfully!');
      console.log(`   Audit ID: ${result.audit_id}`);
      console.log(`   Transaction ID: ${result.transaction_id}`);
      process.exit(0);
    } else {
      console.error('❌ Payout processing failed!');
      console.error(`   Error: ${result.error}`);
      console.error(`   Audit ID: ${result.audit_id}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Fatal error during payout processing:');
    console.error(error);
    process.exit(1);
  }
}

main();
