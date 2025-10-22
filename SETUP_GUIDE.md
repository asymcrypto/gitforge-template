# 🚀 Quick Setup Guide - GitForge Equity System

## Get Your Professional Equity Tracker Running in 10 Minutes

---

## ⚡ Quick Start

### Step 1: Enable GitHub Actions (1 min)

1. Go to your repository **Settings**
2. Click **Actions** → **General**
3. Under "Actions permissions", select **Allow all actions**
4. Click **Save**

### Step 2: Set Up GitHub Pages (2 min)

1. Go to **Settings** → **Pages**
2. Under "Source", select **Deploy from a branch**
3. Select branch: **main** and folder: **/ (root)**
4. Click **Save**
5. Wait 1-2 minutes for deployment

Your dashboards will be live at:
- `https://[username].github.io/[repo]/dashboard.html`
- `https://[username].github.io/[repo]/analytics.html`

### Step 3: Configure Discord Notifications (Optional - 3 min)

1. Open your Discord server
2. Go to **Server Settings** → **Integrations** → **Webhooks**
3. Click **New Webhook**
4. Name it "GitForge Bot"
5. Copy the webhook URL
6. In GitHub: **Settings** → **Secrets and variables** → **Actions**
7. Click **New repository secret**
8. Name: `DISCORD_WEBHOOK_URL`
9. Value: Paste your webhook URL
10. Click **Add secret**

### Step 4: Test the System (4 min)

1. Create a test issue with label `bounty`
2. Add this to the issue body:
   ```
   Equity: 1%
   ```
3. Create a PR that fixes the issue
4. Add label `bounty` to the PR
5. Merge the PR
6. Check the **Actions** tab - workflow should run
7. Visit your dashboard - data should update!

---

## 🎯 What You Get

### ✅ Automatic Features

Once set up, the system automatically:

- **Tracks equity** when PRs with `bounty` label are merged
- **Updates dashboard** with real-time data
- **Generates charts** showing distribution and trends
- **Sends notifications** to Discord (if configured)
- **Creates reports** weekly with contributor stats
- **Awards badges** for achievements
- **Calculates analytics** every 12 hours

### 📊 Dashboards

**Main Dashboard** (`dashboard.html`)
- Live equity metrics
- Top contributors leaderboard
- Active bounties
- Beautiful visualizations

**Analytics Dashboard** (`analytics.html`)
- Advanced metrics
- Velocity tracking
- Distribution analysis
- Future projections

---

## 🔧 Configuration Options

### Basic Configuration

Edit `github/EQUITY_TRACKING.json` to set initial values:

```json
{
  "total_equity_allocated": 0,
  "total_equity_available": 100,
  "bounties_completed": 0,
  "bounties_pending": 0,
  "last_updated": "2024-01-01T00:00:00Z",
  "contributors": [],
  "active_bounties": []
}
```

### Bounty Configuration

Edit `github/BOUNTY_CONFIG.json`:

```json
{
  "payment_token": "USDC",
  "default_chain": "polygon",
  "payout_delay_hours": 24,
  "min_bounty_amount": 50,
  "max_bounty_amount": 5000,
  "auto_assign_in_review": true,
  "require_approval": false
}
```

---

## 🎨 Customization

### Change Dashboard Colors

Edit the CSS variables in `dashboard.html`:

```css
:root {
    --primary: #6366f1;        /* Main brand color */
    --secondary: #8b5cf6;      /* Secondary color */
    --success: #10b981;        /* Success color */
    --warning: #f59e0b;        /* Warning color */
}
```

### Customize Notification Messages

Edit `.github/workflows/notifications.yml` to change Discord messages:

```yaml
"title": "🎉 Your Custom Title!",
"description": "Your custom message here"
```

---

## 📱 Mobile Access

All dashboards are fully mobile-responsive! Access from:
- 📱 Smartphones
- 💻 Tablets
- 🖥️ Desktops

---

## 🔐 Optional: Advanced Integrations

### Twitter Integration (Optional)

1. Create Twitter Developer account
2. Create an app at https://developer.twitter.com
3. Get API credentials
4. Add these secrets to your repository:
   - `TWITTER_API_KEY`
   - `TWITTER_API_SECRET`
   - `TWITTER_ACCESS_TOKEN`
   - `TWITTER_ACCESS_SECRET`

### Email Notifications (Optional)

Add these secrets for email notifications:
- `NOTIFICATION_EMAIL` - Recipient email
- `MAIL_SERVER` - SMTP server (e.g., smtp.gmail.com)
- `MAIL_PORT` - SMTP port (e.g., 587)
- `MAIL_USERNAME` - Your email
- `MAIL_PASSWORD` - Email password or app password

---

## 🎯 Creating Your First Bounty

### Method 1: Using Issue Template

1. Go to **Issues** → **New Issue**
2. Use the bounty template (if available)
3. Fill in:
   - Title: Clear description of task
   - Equity offer: e.g., "Equity: 2%"
   - Requirements: What needs to be done
4. Add label: `bounty`
5. Submit issue

### Method 2: Manual Issue

Create an issue with this format:

```markdown
## Task Description
[Describe what needs to be done]

## Equity Offer
Equity: 3%

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Acceptance Criteria
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Code reviewed
```

Add label: `bounty`

---

## 👥 For Contributors

### How to Claim a Bounty

1. Find an open bounty in **Issues**
2. Comment: "I'd like to work on this"
3. Wait for assignment (or start immediately if self-assign enabled)
4. Create a branch and work on the task
5. Submit a PR that references the issue (e.g., "Fixes #123")
6. Add label `bounty` to your PR
7. Wait for review and merge

### After Your PR is Merged

Automatically happens:
- ✅ Equity allocated to you
- 📊 Dashboard updated with your contribution
- 🎉 Notification sent to Discord
- 🏅 Achievement badges awarded (if earned)
- 📧 Email confirmation (if configured)

---

## 📊 Monitoring Your System

### Check Workflow Status

1. Go to **Actions** tab
2. See recent workflow runs
3. Click on any run to see details
4. Green checkmark = success
5. Red X = failed (click to see error)

### View Live Data

- **Dashboard**: `https://[username].github.io/[repo]/dashboard.html`
- **Analytics**: `https://[username].github.io/[repo]/analytics.html`
- **Raw Data**: `github/EQUITY_TRACKING.json`
- **Reports**: `.github/analytics/analytics-report.md`

---

## 🐛 Troubleshooting

### Dashboard Not Loading?

**Check:**
1. Is GitHub Pages enabled?
2. Did you wait 1-2 minutes after enabling?
3. Is the URL correct?
4. Try clearing browser cache

**Fix:**
```bash
# Manually trigger dashboard generation
Go to Actions → Equity Tracker → Run workflow
```

### Workflow Not Running?

**Check:**
1. Are Actions enabled?
2. Does PR have `bounty` label?
3. Was PR actually merged?
4. Check Actions tab for errors

**Fix:**
```bash
# Manually trigger workflow
Go to Actions → Equity Tracker → Run workflow → Run
```

### Discord Notifications Not Working?

**Check:**
1. Is webhook URL correct?
2. Is secret named exactly `DISCORD_WEBHOOK_URL`?
3. Test webhook manually:

```bash
curl -H "Content-Type: application/json" \
  -d '{"content": "Test message"}' \
  YOUR_WEBHOOK_URL
```

### Data Not Updating?

**Check:**
1. Look at recent commits - is `EQUITY_TRACKING.json` being updated?
2. Check workflow logs for errors
3. Verify JSON syntax is valid

**Fix:**
```bash
# Validate JSON
cat github/EQUITY_TRACKING.json | jq .
```

---

## 📈 Best Practices

### For Project Maintainers

1. **Start Small**: Begin with 1-2% equity bounties
2. **Be Clear**: Write detailed bounty descriptions
3. **Review Fast**: Merge PRs quickly to maintain momentum
4. **Communicate**: Keep contributors informed
5. **Monitor**: Check analytics weekly

### For Contributors

1. **Read Carefully**: Understand requirements before claiming
2. **Ask Questions**: Clarify unclear requirements
3. **Test Thoroughly**: Ensure your code works
4. **Document**: Update docs if needed
5. **Be Patient**: Wait for review before asking

---

## 🎓 Learning Resources

### Understanding the System

- **Full Documentation**: See `EQUITY_SYSTEM_DOCS.md`
- **GitHub Actions**: https://docs.github.com/actions
- **Chart.js**: https://www.chartjs.org/docs/
- **Discord Webhooks**: https://discord.com/developers/docs/resources/webhook

### Example Workflows

Check the `.github/workflows/` directory:
- `equity-tracker.yml` - Main tracking
- `notifications.yml` - Notification system
- `analytics-update.yml` - Analytics generation

---

## 💡 Pro Tips

### Tip 1: Manual Workflow Triggers
You can manually trigger any workflow from the Actions tab for testing.

### Tip 2: Check Logs
Always check workflow logs if something doesn't work - they show exactly what happened.

### Tip 3: Test in Stages
Test each feature separately:
1. First: Basic equity tracking
2. Then: Dashboard generation
3. Then: Notifications
4. Finally: Analytics

### Tip 4: Use Labels
Create custom labels for different bounty types:
- `bounty-easy` - Simple tasks
- `bounty-medium` - Moderate tasks
- `bounty-hard` - Complex tasks

### Tip 5: Backup Data
Regularly export your equity data:
```bash
# Download from GitHub
curl https://raw.githubusercontent.com/[user]/[repo]/main/github/EQUITY_TRACKING.json > backup.json
```

---

## 🎉 You're Ready!

Your professional equity tracking system is now set up! 

### Next Steps:

1. ✅ Create your first bounty
2. ✅ Share dashboard link with team
3. ✅ Join Discord/Twitter for updates
4. ✅ Customize colors and branding
5. ✅ Invite contributors

### Share Your Success!

Tweet about your setup:
```
Just set up @GitForge equity tracking! 🚀
Real-time dashboards, automated notifications, and professional analytics.
Making our project look like a funded startup! 💎

#GitForge #OpenSource #Web3
```

---

## 📞 Need Help?

- **Documentation**: `EQUITY_SYSTEM_DOCS.md`
- **Issues**: Create a GitHub issue
- **Discord**: Join our community
- **Email**: support@gitforge.dev

---

## 🌟 Success Stories

> "GitForge equity system made our project look 10x more professional. Contributors love the real-time dashboard!"
> — Project Maintainer

> "The automated notifications keep me engaged. I always know when new bounties are available!"
> — Active Contributor

---

**Built with ❤️ by the GitForge Community**

*Making decentralized collaboration professional and accessible*

---

## Quick Reference Card

```
📊 Dashboard URL: https://[user].github.io/[repo]/dashboard.html
🔧 Main Config: github/EQUITY_TRACKING.json
🤖 Workflows: .github/workflows/
📈 Analytics: .github/analytics/
🔔 Notifications: Settings → Secrets → DISCORD_WEBHOOK_URL
```

**Happy Building! 🚀**
