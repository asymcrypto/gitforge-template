#!/usr/bin/env node

/**
 * Multi-Currency Payout Test Script
 * 
 * This script tests the multi-currency payout functionality with Flutterwave integration
 * and currency conversion capabilities.
 * 
 * Usage:
 *   node multi_currency_payout_test.js
 */

const PayoutProcessor = require('./payout_processor');
const CurrencyConverter = require('./currency_converter');
const FlutterwaveIntegration = require('./flutterwave_integration');

async function main() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🌍 GitForge Multi-Currency Payout System Test');
    console.log('='.repeat(70));

    // Initialize components
    const processor = new PayoutProcessor();
    const converter = new CurrencyConverter();
    const flutterwave = new FlutterwaveIntegration();

    // Test 1: Currency Conversion
    console.log('\n\n📊 TEST 1: Currency Conversion');
    console.log('-'.repeat(70));

    const testConversions = [
      { from: 'USD', to: 'NGN', amount: 100 },
      { from: 'USD', to: 'KES', amount: 100 },
      { from: 'USD', to: 'ZAR', amount: 100 },
      { from: 'USD', to: 'EUR', amount: 100 },
      { from: 'EUR', to: 'GBP', amount: 50 }
    ];

    for (const test of testConversions) {
      try {
        const result = await converter.convert(test.amount, test.from, test.to);
        console.log(`\n✓ ${test.amount} ${test.from} = ${result.converted_amount} ${test.to}`);
        console.log(`  Rate: 1 ${test.from} = ${result.rate} ${test.to}`);
        console.log(`  Symbol: ${converter.getCurrencySymbol(test.to)} (${converter.getCurrencyName(test.to)})`);
      } catch (error) {
        console.error(`✗ Conversion failed: ${error.message}`);
      }
    }

    // Test 2: Supported Currencies
    console.log('\n\n📋 TEST 2: Supported Currencies');
    console.log('-'.repeat(70));
    const supportedCurrencies = converter.getSupportedCurrencies();
    console.log(`Total supported currencies: ${supportedCurrencies.length}`);
    console.log(`Currencies: ${supportedCurrencies.join(', ')}`);

    // Test 3: Flutterwave Integration
    console.log('\n\n💳 TEST 3: Flutterwave Integration');
    console.log('-'.repeat(70));

    const flutterwaveSupportedCurrencies = flutterwave.getSupportedCurrencies();
    console.log(`Flutterwave supported currencies: ${flutterwaveSupportedCurrencies.length}`);
    console.log(`Currencies: ${flutterwaveSupportedCurrencies.join(', ')}`);

    // Test 4: Multi-Currency Payout Processing
    console.log('\n\n💰 TEST 4: Multi-Currency Payout Processing');
    console.log('-'.repeat(70));

    const multiCurrencyPayouts = [
      {
        pr_number: 50,
        contributor: 'alice-ng',
        amount: 200,
        currency: 'USD',
        country: 'NG',
        description: 'Nigerian Developer'
      },
      {
        pr_number: 51,
        contributor: 'bob-ke',
        amount: 150,
        currency: 'USD',
        country: 'KE',
        description: 'Kenyan Designer'
      },
      {
        pr_number: 52,
        contributor: 'carol-za',
        amount: 300,
        currency: 'USD',
        country: 'ZA',
        description: 'South African Developer'
      }
    ];

    for (const payout of multiCurrencyPayouts) {
      console.log(`\n📍 Processing payout for ${payout.description}...`);
      
      const payoutRequest = {
        pr_number: payout.pr_number,
        contributor: payout.contributor,
        amount: payout.amount,
        currency: payout.currency,
        issue_number: payout.pr_number,
        bounty_label: 'bounty'
      };

      try {
        const result = await processor.processPayout(payoutRequest);
        
        if (result.success) {
          console.log(`✅ Payout successful!`);
          const currency = payout.currency || 'USD';
          console.log(`   Amount: ${converter.formatCurrency(result.amount, currency)}`);
          console.log(`   Net Amount: ${converter.formatCurrency(result.net_amount, currency)}`);
          console.log(`   Fee: ${converter.formatCurrency(result.fee_amount, currency)}`);
          console.log(`   Transaction ID: ${result.transaction_id}`);
          console.log(`   Audit ID: ${result.audit_id}`);
        } else {
          console.error(`   ❌ Payout failed: ${result.error}`);
        }
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
      }
    }

    // Test 5: Audit Trail Summary
    console.log('\n\n📊 TEST 5: Audit Trail Summary');
    console.log('-'.repeat(70));

    const summary = processor.getAuditSummary();
    console.log(`Total Payouts Processed: ${summary.total_payouts_processed}`);
    console.log(`Total Amount Paid: ${converter.formatCurrency(summary.total_amount_paid, 'USD')}`);
    console.log(`Failed Payouts: ${summary.failed_payouts}`);
    console.log(`Pending Payouts: ${summary.pending_payouts}`);
    console.log(`Last Payout Date: ${summary.last_payout_date || 'N/A'}`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ All tests completed!');
    console.log('='.repeat(70) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error during testing:');
    console.error(error);
    process.exit(1);
  }
}

main();
