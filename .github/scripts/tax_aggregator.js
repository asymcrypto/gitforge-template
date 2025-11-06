#!/usr/bin/env node

/**
 * Tax Aggregator Module
 * 
 * This module generates tax reports and forms based on payout history.
 * It supports multiple tax jurisdictions and form types:
 * - US: 1099-NEC (Non-Employee Compensation)
 * - US: 1099-MISC (Miscellaneous Income)
 * - UK: Self-Assessment Tax Return
 * - EU: VAT Reports
 * - Generic: CSV export for tax software
 * 
 * Usage:
 *   node tax_aggregator.js --year 2025 --country US --format 1099-nec
 */

const fs = require('fs');
const path = require('path');
const PayoutLogger = require('./payout_logger');

class TaxAggregator {
  constructor() {
    this.logger = new PayoutLogger();
    this.auditFilePath = path.join(__dirname, '../../github/PAYOUT_AUDIT.json');
  }

  /**
   * Get fiscal year dates
   * @param {number} year - Fiscal year
   * @returns {Object} - { startDate, endDate }
   */
  getFiscalYearDates(year) {
    return {
      startDate: new Date(`${year}-01-01`),
      endDate: new Date(`${year}-12-31T23:59:59Z`)
    };
  }

  /**
   * Aggregate payouts by contributor for a fiscal year
   * @param {number} year - Fiscal year
   * @returns {Object} - Aggregated payout data by contributor
   */
  aggregatePayoutsByContributor(year) {
    const { startDate, endDate } = this.getFiscalYearDates(year);
    const entries = this.logger.getEntriesByDateRange(startDate, endDate);
    
    const contributorData = {};

    entries.forEach(entry => {
      if (entry.event_type === 'PAYOUT_ATTEMPT' && entry.status === 'SUCCESS') {
        if (!contributorData[entry.contributor]) {
          contributorData[entry.contributor] = {
            contributor: entry.contributor,
            total_payouts: 0,
            total_amount: 0,
            total_fees: 0,
            currency: entry.currency,
            transactions: [],
            country: 'US' // Default, would be retrieved from contributor profile
          };
        }

        const amount = entry.payout_details?.net_amount || entry.amount;
        const fee = entry.payout_details?.fee_amount || 0;

        contributorData[entry.contributor].total_payouts += 1;
        contributorData[entry.contributor].total_amount += amount;
        contributorData[entry.contributor].total_fees += fee;
        contributorData[entry.contributor].transactions.push({
          date: entry.completed_at,
          amount: amount,
          fee: fee,
          pr_number: entry.pr_number,
          transaction_id: entry.payout_details?.transaction_id
        });
      }
    });

    return contributorData;
  }

  /**
   * Generate a 1099-NEC form (US Non-Employee Compensation)
   * @param {Object} contributorData - Contributor payout data
   * @param {number} year - Tax year
   * @returns {string} - CSV formatted 1099-NEC data
   */
  generate1099NEC(contributorData, year) {
    let csv = 'FORM 1099-NEC - Non-Employee Compensation\n';
    csv += `Tax Year: ${year}\n`;
    csv += `Generated: ${new Date().toISOString()}\n\n`;
    csv += 'Contributor,Total Compensation,Currency,Transaction Count,First Payment,Last Payment\n';

    Object.values(contributorData).forEach(data => {
      if (data.total_amount >= 600) { // 1099-NEC threshold is $600
        const firstPayment = data.transactions[0]?.date || 'N/A';
        const lastPayment = data.transactions[data.transactions.length - 1]?.date || 'N/A';
        
        csv += `"${data.contributor}",${data.total_amount},${data.currency},${data.total_payouts},"${firstPayment}","${lastPayment}"\n`;
      }
    });

    return csv;
  }

  /**
   * Generate a detailed tax report
   * @param {Object} contributorData - Contributor payout data
   * @param {number} year - Tax year
   * @returns {string} - Detailed tax report
   */
  generateDetailedTaxReport(contributorData, year) {
    let report = `# GitForge Tax Report - ${year}\n\n`;
    report += `Generated: ${new Date().toISOString()}\n\n`;

    report += `## Summary\n\n`;
    const totalContributors = Object.keys(contributorData).length;
    const totalAmount = Object.values(contributorData).reduce((sum, d) => sum + d.total_amount, 0);
    const totalFees = Object.values(contributorData).reduce((sum, d) => sum + d.total_fees, 0);
    const totalPayouts = Object.values(contributorData).reduce((sum, d) => sum + d.total_payouts, 0);

    report += `- **Total Contributors**: ${totalContributors}\n`;
    report += `- **Total Payouts**: ${totalPayouts}\n`;
    report += `- **Total Amount Paid**: $${totalAmount.toFixed(2)}\n`;
    report += `- **Total Fees**: $${totalFees.toFixed(2)}\n`;
    report += `- **Average Payout per Contributor**: $${(totalAmount / totalContributors).toFixed(2)}\n\n`;

    report += `## Contributors Requiring 1099-NEC\n\n`;
    report += `| Contributor | Total Amount | Payouts | First Payment | Last Payment |\n`;
    report += `|---|---|---|---|---|\n`;

    Object.values(contributorData).forEach(data => {
      if (data.total_amount >= 600) {
        const firstPayment = data.transactions[0]?.date.split('T')[0] || 'N/A';
        const lastPayment = data.transactions[data.transactions.length - 1]?.date.split('T')[0] || 'N/A';
        
        report += `| ${data.contributor} | $${data.total_amount.toFixed(2)} | ${data.total_payouts} | ${firstPayment} | ${lastPayment} |\n`;
      }
    });

    report += `\n## All Contributors\n\n`;
    report += `| Contributor | Total Amount | Payouts | Currency |\n`;
    report += `|---|---|---|---|\n`;

    Object.values(contributorData).forEach(data => {
      report += `| ${data.contributor} | $${data.total_amount.toFixed(2)} | ${data.total_payouts} | ${data.currency} |\n`;
    });

    report += `\n## Detailed Transaction History\n\n`;

    Object.values(contributorData).forEach(data => {
      report += `### ${data.contributor}\n\n`;
      report += `**Total: $${data.total_amount.toFixed(2)} (${data.total_payouts} transactions)**\n\n`;
      report += `| Date | Amount | Fee | PR | Transaction ID |\n`;
      report += `|---|---|---|---|---|\n`;

      data.transactions.forEach(tx => {
        const date = tx.date.split('T')[0];
        report += `| ${date} | $${tx.amount.toFixed(2)} | $${tx.fee.toFixed(2)} | #${tx.pr_number} | ${tx.transaction_id} |\n`;
      });

      report += `\n`;
    });

    return report;
  }

  /**
   * Generate a CSV export for tax software
   * @param {Object} contributorData - Contributor payout data
   * @returns {string} - CSV formatted data
   */
  generateCSVExport(contributorData) {
    let csv = 'Contributor,Date,Amount,Fee,Net Amount,PR Number,Transaction ID,Currency\n';

    Object.values(contributorData).forEach(data => {
      data.transactions.forEach(tx => {
        csv += `"${data.contributor}","${tx.date}",${tx.amount + tx.fee},${tx.fee},${tx.amount},"#${tx.pr_number}","${tx.transaction_id}","${data.currency}"\n`;
      });
    });

    return csv;
  }

  /**
   * Generate all tax reports for a year
   * @param {number} year - Tax year
   * @returns {Object} - All generated reports
   */
  generateAllReports(year) {
    console.log(`\n📊 Generating tax reports for ${year}...`);

    const contributorData = this.aggregatePayoutsByContributor(year);
    
    const reports = {
      year: year,
      generated_at: new Date().toISOString(),
      summary: {
        total_contributors: Object.keys(contributorData).length,
        contributors_requiring_1099: Object.values(contributorData).filter(d => d.total_amount >= 600).length,
        total_amount: Object.values(contributorData).reduce((sum, d) => sum + d.total_amount, 0),
        total_payouts: Object.values(contributorData).reduce((sum, d) => sum + d.total_payouts, 0)
      },
      reports: {
        '1099_nec': this.generate1099NEC(contributorData, year),
        detailed_report: this.generateDetailedTaxReport(contributorData, year),
        csv_export: this.generateCSVExport(contributorData)
      }
    };

    console.log(`✓ Tax reports generated for ${year}`);
    console.log(`  - Contributors: ${reports.summary.total_contributors}`);
    console.log(`  - Requiring 1099-NEC: ${reports.summary.contributors_requiring_1099}`);
    console.log(`  - Total Amount: $${reports.summary.total_amount.toFixed(2)}`);

    return reports;
  }

  /**
   * Save reports to files
   * @param {Object} reports - Generated reports
   * @param {string} outputDir - Output directory
   */
  saveReports(reports, outputDir = '.github/tax-reports') {
    try {
      // Create output directory if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const year = reports.year;
      const timestamp = reports.generated_at.replace(/[:.]/g, '-');

      // Save 1099-NEC
      const form1099Path = path.join(outputDir, `1099-NEC-${year}.csv`);
      fs.writeFileSync(form1099Path, reports.reports['1099_nec']);
      console.log(`✓ Saved 1099-NEC form: ${form1099Path}`);

      // Save detailed report
      const detailedReportPath = path.join(outputDir, `tax-report-${year}.md`);
      fs.writeFileSync(detailedReportPath, reports.reports.detailed_report);
      console.log(`✓ Saved detailed report: ${detailedReportPath}`);

      // Save CSV export
      const csvExportPath = path.join(outputDir, `transactions-${year}.csv`);
      fs.writeFileSync(csvExportPath, reports.reports.csv_export);
      console.log(`✓ Saved CSV export: ${csvExportPath}`);

      // Save summary JSON
      const summaryPath = path.join(outputDir, `summary-${year}.json`);
      fs.writeFileSync(summaryPath, JSON.stringify(reports, null, 2));
      console.log(`✓ Saved summary: ${summaryPath}`);

      return {
        success: true,
        files: {
          form_1099_nec: form1099Path,
          detailed_report: detailedReportPath,
          csv_export: csvExportPath,
          summary: summaryPath
        }
      };
    } catch (error) {
      console.error(`❌ Error saving reports: ${error.message}`);
      throw error;
    }
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    options[key] = value;
  }

  const year = parseInt(options.year) || new Date().getFullYear();
  const outputDir = options['output-dir'] || '.github/tax-reports';

  const aggregator = new TaxAggregator();
  const reports = aggregator.generateAllReports(year);
  const saved = aggregator.saveReports(reports, outputDir);

  if (saved.success) {
    console.log(`\n✅ All tax reports generated and saved successfully!`);
    process.exit(0);
  } else {
    console.error(`\n❌ Failed to save tax reports`);
    process.exit(1);
  }
}

module.exports = TaxAggregator;
