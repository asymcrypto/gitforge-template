# 📋 Example Configurations

## Complete configuration examples for different use cases

---

## 🎯 Basic Setup (Recommended for New Projects)

### EQUITY_TRACKING.json
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

### BOUNTY_CONFIG.json
```json
{
  "payment_token": "USDC",
  "default_chain": "polygon",
  "payout_delay_hours": 24,
  "min_bounty_amount": 50,
  "max_bounty_amount": 1000,
  "auto_assign_in_review": true,
  "require_approval": false,
  "reputation_thresholds": {
    "beginner": 0,
    "intermediate": 3,
    "advanced": 10
  }
}
```

---

## 🚀 Startup Setup (For Growing Projects)

### EQUITY_TRACKING.json
```json
{
  "total_equity_allocated": 15,
  "total_equity_available": 85,
  "bounties_completed": 5,
  "bounties_pending": 3,
  "last_updated": "2024-10-22T00:00:00Z",
  "contributors": [
    {
      "github_username": "founder1",
      "bounty_completed": "Initial system setup",
      "equity_earned": 10,
      "bounties_completed": 1,
      "completion_date": "2024-01-15",
      "pr_link": "https://github.com/org/repo/pull/1",
      "status": "completed",
      "contributor_tier": "Founding Contributor"
    },
    {
      "github_username": "contributor1",
      "bounty_completed": "Landing page design",
      "equity_earned": 3,
      "bounties_completed": 2,
      "completion_date": "2024-02-01",
      "pr_link": "https://github.com/org/repo/pull/5",
      "status": "completed",
      "contributor_tier": "Core Team"
    },
    {
      "github_username": "contributor2",
      "bounty_completed": "Documentation",
      "equity_earned": 2,
      "bounties_completed": 2,
      "completion_date": "2024-02-10",
      "pr_link": "https://github.com/org/repo/pull/8",
      "status": "completed",
      "contributor_tier": "Active Contributor"
    }
  ],
  "active_bounties": [
    {
      "bounty_id": 1,
      "title": "Build payment integration",
      "equity_offer": 5,
      "assigned_to": "contributor3",
      "status": "in-progress",
      "issue_link": "https://github.com/org/repo/issues/10"
    },
    {
      "bounty_id": 2,
      "title": "Add Discord bot",
      "equity_offer": 3,
      "assigned_to": "",
      "status": "available",
      "issue_link": "https://github.com/org/repo/issues/11"
    },
    {
      "bounty_id": 3,
      "title": "Security audit",
      "equity_offer": 4,
      "assigned_to": "",
      "status": "available",
      "issue_link": "https://github.com/org/repo/issues/12"
    }
  ]
}
```

---

## 🏢 Enterprise Setup (For Large Organizations)

### EQUITY_TRACKING.json
```json
{
  "total_equity_allocated": 45,
  "total_equity_available": 55,
  "bounties_completed": 25,
  "bounties_pending": 8,
  "last_updated": "2024-10-22T00:00:00Z",
  "contributors": [
    {
      "github_username": "tech_lead",
      "bounty_completed": "Architecture design",
      "equity_earned": 12,
      "bounties_completed": 8,
      "completion_date": "2024-03-15",
      "pr_link": "https://github.com/org/repo/pull/50",
      "status": "completed",
      "contributor_tier": "Founding Contributor"
    },
    {
      "github_username": "senior_dev",
      "bounty_completed": "Core features",
      "equity_earned": 8,
      "bounties_completed": 6,
      "completion_date": "2024-04-01",
      "pr_link": "https://github.com/org/repo/pull/75",
      "status": "completed",
      "contributor_tier": "Core Team"
    },
    {
      "github_username": "designer",
      "bounty_completed": "UI/UX system",
      "equity_earned": 6,
      "bounties_completed": 5,
      "completion_date": "2024-04-10",
      "pr_link": "https://github.com/org/repo/pull/82",
      "status": "completed",
      "contributor_tier": "Core Team"
    }
  ],
  "active_bounties": [
    {
      "bounty_id": 1,
      "title": "Advanced analytics dashboard",
      "equity_offer": 4,
      "assigned_to": "data_engineer",
      "status": "in-progress",
      "issue_link": "https://github.com/org/repo/issues/100"
    },
    {
      "bounty_id": 2,
      "title": "Mobile app development",
      "equity_offer": 8,
      "assigned_to": "",
      "status": "available",
      "issue_link": "https://github.com/org/repo/issues/101"
    }
  ]
}
```

### BOUNTY_CONFIG.json
```json
{
  "payment_token": "USDC",
  "default_chain": "ethereum",
  "payout_delay_hours": 48,
  "min_bounty_amount": 100,
  "max_bounty_amount": 10000,
  "auto_assign_in_review": false,
  "require_approval": true,
  "reputation_thresholds": {
    "beginner": 0,
    "intermediate": 5,
    "advanced": 15,
    "expert": 30
  },
  "tier_multipliers": {
    "beginner": 1.0,
    "intermediate": 1.2,
    "advanced": 1.5,
    "expert": 2.0
  },
  "bonus_structure": {
    "early_completion": 0.1,
    "exceptional_quality": 0.15,
    "first_time_contributor": 0.05
  }
}
```

---

## 🎮 DAO Setup (For Decentralized Organizations)

### EQUITY_TRACKING.json
```json
{
  "total_equity_allocated": 30,
  "total_equity_available": 70,
  "bounties_completed": 15,
  "bounties_pending": 5,
  "last_updated": "2024-10-22T00:00:00Z",
  "governance": {
    "voting_enabled": true,
    "proposal_threshold": 1,
    "voting_period_days": 7,
    "quorum_percentage": 30
  },
  "contributors": [
    {
      "github_username": "dao_founder",
      "bounty_completed": "DAO infrastructure",
      "equity_earned": 15,
      "bounties_completed": 5,
      "completion_date": "2024-05-01",
      "pr_link": "https://github.com/dao/repo/pull/1",
      "status": "completed",
      "contributor_tier": "Founding Contributor",
      "voting_power": 15
    },
    {
      "github_username": "community_lead",
      "bounty_completed": "Community building",
      "equity_earned": 8,
      "bounties_completed": 4,
      "completion_date": "2024-06-01",
      "pr_link": "https://github.com/dao/repo/pull/15",
      "status": "completed",
      "contributor_tier": "Core Team",
      "voting_power": 8
    }
  ],
  "active_bounties": [
    {
      "bounty_id": 1,
      "title": "Governance dashboard",
      "equity_offer": 5,
      "assigned_to": "",
      "status": "available",
      "issue_link": "https://github.com/dao/repo/issues/20",
      "proposal_id": "PROP-001",
      "votes_for": 85,
      "votes_against": 15
    }
  ]
}
```

---

## 🎓 Educational Project Setup

### EQUITY_TRACKING.json
```json
{
  "total_equity_allocated": 20,
  "total_equity_available": 80,
  "bounties_completed": 10,
  "bounties_pending": 5,
  "last_updated": "2024-10-22T00:00:00Z",
  "learning_tracks": {
    "beginner": ["documentation", "testing", "bug-fixes"],
    "intermediate": ["features", "integrations", "optimization"],
    "advanced": ["architecture", "security", "infrastructure"]
  },
  "contributors": [
    {
      "github_username": "student1",
      "bounty_completed": "Fix documentation typos",
      "equity_earned": 0.5,
      "bounties_completed": 3,
      "completion_date": "2024-07-01",
      "pr_link": "https://github.com/edu/repo/pull/5",
      "status": "completed",
      "contributor_tier": "Beginner",
      "learning_path": "documentation",
      "mentor": "senior_contributor"
    },
    {
      "github_username": "student2",
      "bounty_completed": "Add unit tests",
      "equity_earned": 1,
      "bounties_completed": 2,
      "completion_date": "2024-07-15",
      "pr_link": "https://github.com/edu/repo/pull/8",
      "status": "completed",
      "contributor_tier": "Beginner",
      "learning_path": "testing"
    }
  ],
  "active_bounties": [
    {
      "bounty_id": 1,
      "title": "Write tutorial: Getting Started",
      "equity_offer": 1,
      "assigned_to": "",
      "status": "available",
      "issue_link": "https://github.com/edu/repo/issues/15",
      "difficulty": "beginner",
      "estimated_hours": 4,
      "learning_objectives": ["documentation", "markdown", "git"]
    }
  ]
}
```

---

## 🔧 GitHub Secrets Configuration

### Required Secrets

```bash
# GitHub Token (automatically provided)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Discord Integration (optional)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxxxx/yyyyy

# Twitter Integration (optional)
TWITTER_API_KEY=xxxxxxxxxxxxxxxxxxxx
TWITTER_API_SECRET=yyyyyyyyyyyyyyyyyyyy
TWITTER_ACCESS_TOKEN=zzzzzzzzzzzzzzzzzzzz
TWITTER_ACCESS_SECRET=aaaaaaaaaaaaaaaaaaa

# Email Notifications (optional)
NOTIFICATION_EMAIL=notifications@yourproject.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Custom Integrations (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
CUSTOM_WEBHOOK_URL=https://your-api.com/webhook
```

---

## 📊 Dashboard Customization

### Custom Colors (dashboard.html)

```css
:root {
    /* Brand Colors */
    --primary: #6366f1;
    --primary-dark: #4f46e5;
    --secondary: #8b5cf6;
    
    /* Status Colors */
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --info: #3b82f6;
    
    /* Neutral Colors */
    --dark: #1e293b;
    --dark-light: #334155;
    --light: #f8fafc;
    --border: #e2e8f0;
    
    /* Text Colors */
    --text: #0f172a;
    --text-light: #64748b;
    --text-muted: #94a3b8;
}
```

### Custom Metrics

```javascript
// Add to dashboard.html
const customMetrics = {
    velocity: calculateVelocity(),
    momentum: calculateMomentum(),
    engagement: calculateEngagement(),
    quality: calculateQuality()
};
```

---

## 🎯 Bounty Templates

### Simple Bounty Template

```markdown
## 🎯 Bounty: [Task Title]

**Equity Offer:** X%

### Description
[Clear description of what needs to be done]

### Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### Acceptance Criteria
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Code reviewed

### Resources
- [Link to docs]
- [Link to examples]

---
**To claim:** Comment "I'd like to work on this"
```

### Advanced Bounty Template

```markdown
## 🎯 Bounty: [Task Title]

**Equity Offer:** X%  
**Difficulty:** [Beginner/Intermediate/Advanced]  
**Estimated Time:** X hours  
**Skills Required:** [List skills]

### 📋 Description
[Detailed description]

### 🎯 Goals
1. Goal 1
2. Goal 2
3. Goal 3

### ✅ Requirements
- [ ] Functional requirement 1
- [ ] Functional requirement 2
- [ ] Non-functional requirement 1

### 🧪 Testing Requirements
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing checklist

### 📚 Documentation Requirements
- [ ] Code comments
- [ ] API documentation
- [ ] User guide updates

### 🎨 Design Requirements
- [ ] Follows design system
- [ ] Mobile responsive
- [ ] Accessibility compliant

### 🔍 Code Review Checklist
- [ ] Follows coding standards
- [ ] No security vulnerabilities
- [ ] Performance optimized
- [ ] Error handling implemented

### 📦 Deliverables
1. Working code
2. Tests
3. Documentation
4. Demo/screenshots

### 🏆 Bonus Points (Extra Equity)
- Early completion: +10%
- Exceptional quality: +15%
- Additional features: +20%

### 📞 Support
- Mentor: @mentor_username
- Questions: #bounty-help channel
- Resources: [Link to resources]

---
**To claim:** Comment "I'd like to work on this" and tag @maintainer
```

---

## 🔄 Workflow Customization

### Custom Notification Message

```yaml
# In .github/workflows/notifications.yml
- name: Custom Notification
  run: |
    MESSAGE="🎉 Amazing work @${CONTRIBUTOR}! 
    
    You've just earned ${EQUITY}% equity for completing:
    ${TITLE}
    
    Your total equity: ${TOTAL_EQUITY}%
    Your rank: #${RANK}
    
    Keep up the great work! 🚀"
    
    # Send to Discord
    curl -H "Content-Type: application/json" \
      -d "{\"content\": \"$MESSAGE\"}" \
      $DISCORD_WEBHOOK
```

### Custom Analytics Calculation

```javascript
// In .github/scripts/generate-analytics.js
function calculateCustomMetrics(equityData) {
  return {
    momentum: calculateMomentum(equityData),
    velocity: calculateVelocity(equityData),
    engagement: calculateEngagement(equityData),
    quality: calculateQuality(equityData),
    retention: calculateRetention(equityData)
  };
}
```

---

## 🎨 Theme Presets

### Dark Theme
```css
:root {
    --primary: #818cf8;
    --secondary: #a78bfa;
    --background: #0f172a;
    --surface: #1e293b;
    --text: #f1f5f9;
    --text-light: #cbd5e1;
}
```

### Light Theme (Default)
```css
:root {
    --primary: #6366f1;
    --secondary: #8b5cf6;
    --background: #ffffff;
    --surface: #f8fafc;
    --text: #0f172a;
    --text-light: #64748b;
}
```

### Neon Theme
```css
:root {
    --primary: #00ff88;
    --secondary: #00ccff;
    --background: #0a0a0a;
    --surface: #1a1a1a;
    --text: #ffffff;
    --text-light: #cccccc;
}
```

---

## 📧 Email Templates

### Bounty Completion Email

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8fafc; }
        .button { background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Bounty Completed!</h1>
        </div>
        <div class="content">
            <p>Congratulations <strong>@{contributor}</strong>!</p>
            <p>Your contribution has been merged and equity has been allocated.</p>
            <h3>Details:</h3>
            <ul>
                <li><strong>Equity Earned:</strong> {equity}%</li>
                <li><strong>PR:</strong> #{pr_number}</li>
                <li><strong>Title:</strong> {title}</li>
            </ul>
            <p><a href="{dashboard_url}" class="button">View Dashboard</a></p>
        </div>
    </div>
</body>
</html>
```

---

**These configurations are ready to use! Copy and customize for your project.**
