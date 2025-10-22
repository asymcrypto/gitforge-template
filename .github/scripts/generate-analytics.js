#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load equity data
const equityData = JSON.parse(
  fs.readFileSync('github/EQUITY_TRACKING.json', 'utf8')
);

// Calculate comprehensive analytics
function calculateAnalytics() {
  const contributors = equityData.contributors;
  
  // Time-based analytics
  const contributionsByMonth = {};
  const contributionsByWeek = {};
  
  contributors.forEach(contributor => {
    const date = new Date(contributor.completion_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const weekKey = getWeekNumber(date);
    
    if (!contributionsByMonth[monthKey]) {
      contributionsByMonth[monthKey] = { count: 0, equity: 0, contributors: [] };
    }
    if (!contributionsByWeek[weekKey]) {
      contributionsByWeek[weekKey] = { count: 0, equity: 0, contributors: [] };
    }
    
    contributionsByMonth[monthKey].count++;
    contributionsByMonth[monthKey].equity += contributor.equity_earned;
    contributionsByMonth[monthKey].contributors.push(contributor.github_username);
    
    contributionsByWeek[weekKey].count++;
    contributionsByWeek[weekKey].equity += contributor.equity_earned;
    contributionsByWeek[weekKey].contributors.push(contributor.github_username);
  });
  
  // Contributor tiers
  const tiers = {
    founding: contributors.filter(c => c.equity_earned >= 5).length,
    core: contributors.filter(c => c.equity_earned >= 3 && c.equity_earned < 5).length,
    active: contributors.filter(c => c.equity_earned >= 1 && c.equity_earned < 3).length,
    emerging: contributors.filter(c => c.equity_earned < 1).length
  };
  
  // Top performers
  const topByEquity = [...contributors]
    .sort((a, b) => b.equity_earned - a.equity_earned)
    .slice(0, 10);
  
  const topByBounties = [...contributors]
    .sort((a, b) => (b.bounties_completed || 1) - (a.bounties_completed || 1))
    .slice(0, 10);
  
  // Velocity metrics
  const last30Days = contributors.filter(c => {
    const date = new Date(c.completion_date);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return date >= thirtyDaysAgo;
  });
  
  const last7Days = contributors.filter(c => {
    const date = new Date(c.completion_date);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return date >= sevenDaysAgo;
  });
  
  // Equity distribution stats
  const equityValues = contributors.map(c => c.equity_earned);
  const avgEquity = equityValues.reduce((a, b) => a + b, 0) / equityValues.length || 0;
  const medianEquity = calculateMedian(equityValues);
  const maxEquity = Math.max(...equityValues, 0);
  const minEquity = Math.min(...equityValues, Infinity);
  
  // Growth rate
  const sortedByDate = [...contributors].sort((a, b) => 
    new Date(a.completion_date) - new Date(b.completion_date)
  );
  
  const firstDate = sortedByDate[0] ? new Date(sortedByDate[0].completion_date) : new Date();
  const daysSinceStart = Math.max((Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24), 1);
  const contributorsPerDay = contributors.length / daysSinceStart;
  const equityPerDay = equityData.total_equity_allocated / daysSinceStart;
  
  return {
    overview: {
      total_contributors: contributors.length,
      total_equity_allocated: equityData.total_equity_allocated,
      total_equity_available: equityData.total_equity_available,
      bounties_completed: equityData.bounties_completed,
      bounties_pending: equityData.bounties_pending,
      active_bounties: equityData.active_bounties.length
    },
    velocity: {
      last_7_days: {
        contributors: last7Days.length,
        equity_allocated: last7Days.reduce((sum, c) => sum + c.equity_earned, 0)
      },
      last_30_days: {
        contributors: last30Days.length,
        equity_allocated: last30Days.reduce((sum, c) => sum + c.equity_earned, 0)
      },
      daily_average: {
        contributors: contributorsPerDay.toFixed(2),
        equity: equityPerDay.toFixed(2)
      }
    },
    distribution: {
      by_tier: tiers,
      statistics: {
        average: avgEquity.toFixed(2),
        median: medianEquity.toFixed(2),
        max: maxEquity,
        min: minEquity === Infinity ? 0 : minEquity
      }
    },
    top_performers: {
      by_equity: topByEquity.map(c => ({
        username: c.github_username,
        equity: c.equity_earned,
        tier: c.contributor_tier
      })),
      by_bounties: topByBounties.map(c => ({
        username: c.github_username,
        bounties: c.bounties_completed || 1,
        equity: c.equity_earned
      }))
    },
    timeline: {
      by_month: contributionsByMonth,
      by_week: contributionsByWeek
    },
    projections: {
      days_to_full_allocation: Math.round(equityData.total_equity_available / Math.max(equityPerDay, 0.1)),
      estimated_contributors_at_100: Math.round(100 / Math.max(avgEquity, 1))
    },
    generated_at: new Date().toISOString()
  };
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function calculateMedian(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// Generate analytics
const analytics = calculateAnalytics();

// Create analytics directory
const analyticsDir = '.github/analytics';
if (!fs.existsSync(analyticsDir)) {
  fs.mkdirSync(analyticsDir, { recursive: true });
}

// Save analytics JSON
fs.writeFileSync(
  path.join(analyticsDir, 'analytics.json'),
  JSON.stringify(analytics, null, 2)
);

console.log('✅ Analytics generated successfully!');

// Generate human-readable report
const report = `# 📊 GitForge Analytics Report

**Generated:** ${new Date().toLocaleString()}

---

## 📈 Overview

| Metric | Value |
|--------|-------|
| Total Contributors | ${analytics.overview.total_contributors} |
| Equity Allocated | ${analytics.overview.total_equity_allocated}% |
| Equity Available | ${analytics.overview.total_equity_available}% |
| Bounties Completed | ${analytics.overview.bounties_completed} |
| Active Bounties | ${analytics.overview.active_bounties} |

---

## 🚀 Velocity Metrics

### Last 7 Days
- **New Contributors:** ${analytics.velocity.last_7_days.contributors}
- **Equity Allocated:** ${analytics.velocity.last_7_days.equity_allocated}%

### Last 30 Days
- **New Contributors:** ${analytics.velocity.last_30_days.contributors}
- **Equity Allocated:** ${analytics.velocity.last_30_days.equity_allocated}%

### Daily Averages
- **Contributors/Day:** ${analytics.velocity.daily_average.contributors}
- **Equity/Day:** ${analytics.velocity.daily_average.equity}%

---

## 👥 Contributor Distribution

### By Tier
- **🏆 Founding Contributors (≥5%):** ${analytics.distribution.by_tier.founding}
- **💎 Core Team (3-5%):** ${analytics.distribution.by_tier.core}
- **⭐ Active Contributors (1-3%):** ${analytics.distribution.by_tier.active}
- **🌟 Emerging Contributors (<1%):** ${analytics.distribution.by_tier.emerging}

### Equity Statistics
- **Average:** ${analytics.distribution.statistics.average}%
- **Median:** ${analytics.distribution.statistics.median}%
- **Max:** ${analytics.distribution.statistics.max}%
- **Min:** ${analytics.distribution.statistics.min}%

---

## 🏆 Top Performers

### By Equity Earned
${analytics.top_performers.by_equity.slice(0, 5).map((c, i) => 
  `${i + 1}. **${c.username}** - ${c.equity}% (${c.tier})`
).join('\n')}

### By Bounties Completed
${analytics.top_performers.by_bounties.slice(0, 5).map((c, i) => 
  `${i + 1}. **${c.username}** - ${c.bounties} bounties (${c.equity}% equity)`
).join('\n')}

---

## 🔮 Projections

- **Days to Full Allocation:** ~${analytics.projections.days_to_full_allocation} days
- **Estimated Contributors at 100%:** ~${analytics.projections.estimated_contributors_at_100}

---

## 📊 Visualizations

![Equity Distribution](../assets/charts/equity-distribution.svg)
![Equity Timeline](../assets/charts/equity-timeline.svg)

---

**View Live Dashboard:** [dashboard.html](../../dashboard.html)
`;

fs.writeFileSync(
  path.join(analyticsDir, 'analytics-report.md'),
  report
);

console.log('✅ Analytics report generated!');

// Generate CSV export for external analysis
const csvData = [
  ['Username', 'Equity', 'Bounties', 'Tier', 'Completion Date', 'Status'],
  ...equityData.contributors.map(c => [
    c.github_username,
    c.equity_earned,
    c.bounties_completed || 1,
    c.contributor_tier || 'Contributor',
    c.completion_date,
    c.status
  ])
];

const csv = csvData.map(row => row.join(',')).join('\n');
fs.writeFileSync(
  path.join(analyticsDir, 'contributors.csv'),
  csv
);

console.log('✅ CSV export generated!');
