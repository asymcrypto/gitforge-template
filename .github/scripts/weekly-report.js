#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load equity data
const equityData = JSON.parse(
  fs.readFileSync('github/EQUITY_TRACKING.json', 'utf8')
);

// Calculate date range (last 7 days)
const today = new Date();
const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

// Filter contributors from last week
const recentContributors = equityData.contributors.filter(contributor => {
  const completionDate = new Date(contributor.completion_date);
  return completionDate >= lastWeek && completionDate <= today;
});

// Calculate weekly stats
const weeklyEquityAllocated = recentContributors.reduce(
  (sum, c) => sum + c.equity_earned, 0
);
const newContributors = recentContributors.length;

// Get top performers
const topPerformers = [...equityData.contributors]
  .sort((a, b) => b.equity_earned - a.equity_earned)
  .slice(0, 5);

// Generate report
const report = `# 📊 GitForge Weekly Report

**Report Period:** ${lastWeek.toLocaleDateString()} - ${today.toLocaleDateString()}

---

## 🎯 Weekly Highlights

### Key Metrics
- **🏆 Bounties Completed:** ${recentContributors.length}
- **💎 Equity Allocated:** ${weeklyEquityAllocated}%
- **👥 New Contributors:** ${newContributors}
- **📈 Total Contributors:** ${equityData.contributors.length}

### Overall Progress
- **Total Equity Allocated:** ${equityData.total_equity_allocated}%
- **Total Equity Available:** ${equityData.total_equity_available}%
- **Completion Rate:** ${Math.round((equityData.bounties_completed / (equityData.bounties_completed + equityData.bounties_pending)) * 100)}%

---

## 🌟 This Week's Contributors

${recentContributors.length > 0 ? recentContributors.map(contributor => `
### ${contributor.github_username}
- **Bounty:** ${contributor.bounty_completed}
- **Equity Earned:** ${contributor.equity_earned}%
- **Completed:** ${new Date(contributor.completion_date).toLocaleDateString()}
- **PR:** [View Contribution](${contributor.pr_link})
`).join('\n') : '_No new contributions this week_'}

---

## 🏆 Top Contributors (All Time)

| Rank | Contributor | Equity | Tier | Bounties |
|------|-------------|--------|------|----------|
${topPerformers.map((contributor, index) => {
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
  return `| ${medal} | [@${contributor.github_username}](https://github.com/${contributor.github_username}) | ${contributor.equity_earned}% | ${contributor.contributor_tier || 'Contributor'} | ${contributor.bounties_completed || 1} |`;
}).join('\n')}

---

## 💰 Active Bounties

${equityData.active_bounties.length > 0 ? equityData.active_bounties.map(bounty => `
### [${bounty.title}](${bounty.issue_link})
- **Equity Offer:** ${bounty.equity_offer}%
- **Status:** ${bounty.status === 'available' ? '🟢 Available' : '🟡 In Progress'}
${bounty.assigned_to ? `- **Assigned to:** @${bounty.assigned_to}` : ''}
`).join('\n') : '_No active bounties at the moment_'}

---

## 📈 Equity Distribution

![Equity Distribution](../assets/charts/equity-distribution.svg)

### Distribution Breakdown
${topPerformers.map(c => `- **${c.github_username}:** ${c.equity_earned}%`).join('\n')}
- **Available:** ${equityData.total_equity_available}%

---

## 🎯 Goals for Next Week

- [ ] Complete ${equityData.active_bounties.length} active bounties
- [ ] Onboard new contributors
- [ ] Improve documentation
- [ ] Enhance automation systems

---

## 📢 Community Updates

### Want to Contribute?
Browse our [open bounties](https://github.com/${process.env.GITHUB_REPOSITORY || 'asymcrypto/gitforge-template'}/issues?q=is:open+label:bounty) and start earning equity today!

### Join the Discussion
- 💬 [GitHub Discussions](https://github.com/${process.env.GITHUB_REPOSITORY || 'asymcrypto/gitforge-template'}/discussions)
- 🎮 [Discord Community](https://discord.gg/gitforge)
- 🐦 [Twitter Updates](https://twitter.com/gitforge)

---

## 📊 View Live Dashboard

Check out our [Live Equity Dashboard](https://github.com/${process.env.GITHUB_REPOSITORY || 'asymcrypto/gitforge-template'}/blob/main/dashboard.html) for real-time metrics and visualizations!

---

**Generated automatically by GitForge Equity Tracker**  
_Last updated: ${new Date().toLocaleString()}_

---

### 🚀 What's Next?

We're constantly improving GitForge to make it the best platform for decentralized collaboration. Here's what's coming:

1. **Enhanced Analytics** - More detailed contributor insights
2. **Automated Payouts** - Direct USDC payments on bounty completion
3. **Reputation System** - Gamification and achievement badges
4. **Mobile App** - Track your equity on the go

Stay tuned for more updates! 🎉
`;

// Create reports directory
const reportsDir = '.github/reports';
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Save report
fs.writeFileSync(
  path.join(reportsDir, 'weekly-report.md'),
  report
);

console.log('✅ Weekly report generated successfully!');

// Also generate a JSON summary for API consumption
const summary = {
  period: {
    start: lastWeek.toISOString(),
    end: today.toISOString()
  },
  metrics: {
    bounties_completed: recentContributors.length,
    equity_allocated: weeklyEquityAllocated,
    new_contributors: newContributors,
    total_contributors: equityData.contributors.length
  },
  top_performers: topPerformers.map(c => ({
    username: c.github_username,
    equity: c.equity_earned,
    tier: c.contributor_tier
  })),
  active_bounties: equityData.active_bounties.length,
  generated_at: today.toISOString()
};

fs.writeFileSync(
  path.join(reportsDir, 'weekly-summary.json'),
  JSON.stringify(summary, null, 2)
);

console.log('✅ Weekly summary JSON generated!');
