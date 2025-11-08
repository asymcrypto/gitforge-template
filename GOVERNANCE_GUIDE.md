# 🗳️ GitForge Governance Guide

**Enterprise-Grade Governance with Weighted Voting and Complete Audit Trails**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Governance Model](#governance-model)
3. [Weighted Voting System](#weighted-voting-system)
4. [Governance Audit Log](#governance-audit-log)
5. [Configuration Guide](#configuration-guide)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

GitForge Governance provides enterprise-grade control over critical decisions through a transparent, auditable weighted voting system. Every vote, merge, veto, and policy change is recorded in an immutable audit log.

### **Key Principles**

- **Transparency:** Every decision is recorded and auditable
- **Accountability:** All actions tied to specific actors with timestamps
- **Security:** Cryptographically hashed audit trail prevents tampering
- **Compliance:** 7-year retention meets regulatory requirements
- **Flexibility:** Customizable roles, weights, and thresholds

---

## 🏛️ Governance Model

### **Role-Based Hierarchy**

GitForge uses a role-based governance model where each role has specific permissions and voting power:

| Role | Vote Weight | Can Merge | Can Override | Can Veto | Permissions |
|------|-------------|-----------|-------------|----------|------------|
| **Founder** | 100 | ✅ Yes | ✅ Yes | ✅ Yes | Full control |
| **Lead Maintainer** | 75 | ✅ Yes | ❌ No | ✅ Yes | Senior decisions |
| **Maintainer** | 50 | ✅ Yes | ❌ No | ❌ No | Standard decisions |
| **Reviewer** | 25 | ❌ No | ❌ No | ❌ No | Code review only |
| **Contributor** | 10 | ❌ No | ❌ No | ❌ No | Voting only |

### **How Voting Works**

1. **PR Created:** Developer submits pull request
2. **Voting Begins:** Maintainers review and vote
3. **Score Calculated:** Weighted votes are summed
4. **Threshold Check:** Does approval percentage meet threshold?
5. **Veto Check:** Has anyone vetoed?
6. **Merge Decision:** PR is merged or blocked

### **Voting Thresholds**

Different PR types require different approval thresholds:

| PR Type | Threshold | Special Rules |
|---------|-----------|---------------|
| **Normal** | 50% | Standard approval |
| **Bounty** | 60% | Requires additional review |
| **Security** | 75% | Requires founder approval |
| **Governance** | 80% | Requires founder approval |

---

## 🗳️ Weighted Voting System

### **Understanding Vote Weights**

Vote weights determine how much influence each maintainer's vote has on the final decision:

```
Example: PR with 3 votes

Founder votes "approve" (weight: 100)
Lead Maintainer votes "approve" (weight: 75)
Reviewer votes "request changes" (weight: 25)

Total weight: 100 + 75 + 25 = 200
Approve weight: 100 + 75 = 175
Approval percentage: 175 / 200 = 87.5%

Result: APPROVED (exceeds 50% threshold)
```

### **Vote Types**

Each maintainer can cast one of four vote types:

1. **Approve** - Supports the PR
2. **Request Changes** - Opposes the PR
3. **Abstain** - Neutral, doesn't count toward approval
4. **Veto** - Blocks the PR regardless of other votes

### **Veto Power**

A veto vote immediately blocks a PR from merging:

```
Founder votes "approve" (weight: 100)
Lead Maintainer votes "veto" (weight: 75)

Result: BLOCKED (veto overrides approval)
```

**Who Can Veto:**
- Founder
- Lead Maintainers
- (Configurable in GOVERNANCE_CONFIG.json)

**When to Use Veto:**
- Security vulnerabilities
- Architectural violations
- Policy breaches
- Critical bugs

### **Override Capability**

Only the Founder can override a blocked PR:

```
PR is blocked due to insufficient votes
Founder executes override with reason: "Critical hotfix"

Result: PR MERGED (override recorded in audit log)
```

**Important:** Overrides are logged and auditable. Use sparingly.

---

## 📋 Governance Audit Log

### **What Gets Logged**

The governance audit log (`github/GOVERNANCE_AUDIT.json`) records:

1. **Votes Cast**
   - Who voted
   - What they voted
   - When they voted
   - Their role and vote weight
   - PR details

2. **PR Merges**
   - Who merged
   - Which PR
   - Weighted vote score
   - Merge commit hash

3. **Vetoes**
   - Who vetoed
   - Which PR
   - Reason for veto
   - Timestamp

4. **Overrides**
   - Who overrode
   - Which PR
   - Reason for override
   - Original decision

5. **Policy Changes**
   - What changed
   - Old value
   - New value
   - Who changed it
   - Reason

### **Audit Entry Structure**

Each entry in the audit log has this structure:

```json
{
  "id": "GOVERNANCE_VOTE_1762471624918_enhhmm",
  "timestamp": "2025-11-06T23:27:04.918Z",
  "event_type": "VOTE_CAST",
  "actor": "asymcrypto",
  "actor_role": "founder",
  "action": "Voted approve on PR #100",
  "details": {
    "pr_number": 100,
    "vote": "approve",
    "vote_weight": 100,
    "comment": "Looks good to me",
    "pr_type": "normal"
  },
  "metadata": {
    "repository": "asymcrypto/gitforge-template",
    "workflow_run_id": "12345"
  },
  "hash": "e49fb39de5da655f999ea5404248d639018a74ee1f1d5e4d2a4f85adbcc4b6af"
}
```

### **Cryptographic Hashing**

Each audit entry is cryptographically hashed using SHA-256:

- **Purpose:** Detect tampering
- **How:** Hash is computed from entry data
- **Verification:** Recalculate hash and compare with stored value
- **Integrity:** If hashes don't match, entry has been modified

### **Querying the Audit Log**

You can query the audit log for specific information:

```javascript
// Get all votes for PR #100
const pr100Votes = logger.getEntriesForPR(100);

// Get all actions by a specific actor
const founderActions = logger.getEntriesByActor('asymcrypto');

// Get all vetoes
const vetoes = logger.getEntriesByEventType('VETO_CAST');

// Get entries within a date range
const thisMonth = logger.getEntriesByDateRange(startDate, endDate);
```

### **Compliance Reporting**

Generate compliance reports for audits:

```javascript
// Export compliance report for Q1 2025
const report = logger.exportComplianceReport(
  new Date('2025-01-01'),
  new Date('2025-03-31')
);

// Report includes:
// - Total votes cast
// - Total merges
// - Total vetoes
// - Total overrides
// - All entries with full details
```

---

## ⚙️ Configuration Guide

### **Governance Configuration File**

Edit `github/GOVERNANCE_CONFIG.json` to customize your governance:

```json
{
  "version": "1.0.0",
  "governance_model": "weighted_voting",
  "voting_rules": {
    "merge_approval_threshold": 50,
    "voting_method": "weighted_majority"
  },
  "maintainer_roles": {
    "founder": {
      "vote_weight": 100,
      "can_merge": true,
      "can_override": true,
      "can_veto": true
    },
    "lead_maintainer": {
      "vote_weight": 75,
      "can_merge": true,
      "can_override": false,
      "can_veto": true
    }
    // ... more roles
  },
  "maintainers": [
    {
      "github_username": "asymcrypto",
      "role": "founder",
      "active": true
    }
    // ... more maintainers
  ],
  "special_rules": {
    "bounty_prs": {
      "weighted_vote_threshold": 60,
      "require_additional_review": true
    },
    "security_prs": {
      "weighted_vote_threshold": 75,
      "require_founder_approval": true
    }
  }
}
```

### **Adding a New Maintainer**

1. Edit `github/GOVERNANCE_CONFIG.json`
2. Add entry to `maintainers` array:

```json
{
  "github_username": "new-maintainer",
  "role": "maintainer",
  "vote_weight": 50,
  "active": true,
  "joined_date": "2025-11-06",
  "permissions": {
    "can_merge": true,
    "can_override": false,
    "can_veto": false,
    "can_modify_governance": false
  }
}
```

3. Commit and push changes
4. New maintainer can now vote on PRs

### **Changing Vote Thresholds**

1. Edit `github/GOVERNANCE_CONFIG.json`
2. Update `voting_rules.merge_approval_threshold`:

```json
{
  "voting_rules": {
    "merge_approval_threshold": 60  // Changed from 50
  }
}
```

3. This change is logged in the governance audit
4. All future votes use the new threshold

### **Customizing Special Rules**

Define different rules for different PR types:

```json
{
  "special_rules": {
    "bounty_prs": {
      "weighted_vote_threshold": 60,
      "require_additional_review": true,
      "additional_reviewers_needed": 1
    },
    "security_prs": {
      "weighted_vote_threshold": 75,
      "require_founder_approval": true,
      "additional_reviewers_needed": 2
    },
    "governance_prs": {
      "weighted_vote_threshold": 80,
      "require_founder_approval": true,
      "additional_reviewers_needed": 2
    }
  }
}
```

---

## 🏆 Best Practices

### **For Maintainers**

1. **Be Transparent**
   - Always provide comments when voting
   - Explain your reasoning
   - Reference relevant issues or discussions

2. **Use Veto Sparingly**
   - Veto only for critical issues
   - Always provide a reason
   - Discuss with team before vetoing

3. **Review Thoroughly**
   - Read PR description and code
   - Check for security issues
   - Verify tests pass
   - Consider impact on other systems

4. **Monitor Governance**
   - Review audit log regularly
   - Check vote patterns
   - Identify problematic trends
   - Discuss governance improvements

### **For Contributors**

1. **Understand Governance**
   - Read this guide
   - Know the voting thresholds
   - Understand special rules for your PR type

2. **Prepare Your PR**
   - Clear description
   - Comprehensive tests
   - Updated documentation
   - Linked issue

3. **Engage with Reviewers**
   - Respond to feedback promptly
   - Ask for clarification if needed
   - Make requested changes quickly
   - Thank reviewers for their time

4. **Respect the Process**
   - Don't pressure for merges
   - Accept veto decisions
   - Learn from rejections
   - Improve for next time

### **For Project Leads**

1. **Set Clear Policies**
   - Document governance rules
   - Explain voting thresholds
   - Define PR types and rules
   - Communicate changes

2. **Maintain Fairness**
   - Ensure consistent voting
   - Prevent favoritism
   - Review audit log for patterns
   - Address concerns promptly

3. **Build Trust**
   - Be transparent
   - Explain decisions
   - Listen to feedback
   - Make improvements based on input

4. **Monitor Health**
   - Track merge times
   - Monitor contributor satisfaction
   - Review governance metrics
   - Adjust policies as needed

---

## 🔧 Troubleshooting

### **PR Not Merging Despite Approval**

**Possible Causes:**
1. Weighted vote score below threshold
2. Someone has vetoed
3. CI/CD checks failed
4. Required reviews not met

**Solution:**
1. Check weighted vote score: `PR #100 has 45% approval (threshold: 50%)`
2. Look for vetoes in audit log
3. Verify all CI checks pass
4. Ensure all required reviewers have voted

### **Veto Seems Unfair**

**Process:**
1. Discuss with the vetoer
2. Address their concerns
3. Request veto withdrawal if appropriate
4. If necessary, founder can override

**Prevention:**
1. Establish veto guidelines
2. Require veto comments
3. Review veto patterns in audit log
4. Discuss governance improvements

### **Audit Log Not Updating**

**Possible Causes:**
1. Workflow not triggered
2. Permissions issue
3. File write error
4. JSON syntax error

**Solution:**
1. Check workflow logs in Actions tab
2. Verify repository permissions
3. Check for JSON errors: `jq . github/GOVERNANCE_AUDIT.json`
4. Manually trigger workflow if needed

### **Maintainer Can't Vote**

**Possible Causes:**
1. Not in maintainers list
2. Role not configured
3. Workflow not running
4. GitHub permissions issue

**Solution:**
1. Verify in GOVERNANCE_CONFIG.json
2. Check role configuration
3. Manually trigger weighted-voting-check workflow
4. Verify GitHub Actions permissions

---

## 📊 Monitoring Governance

### **Key Metrics to Track**

| Metric | What It Means | Target |
|--------|--------------|--------|
| **Average Merge Time** | How long PRs take to merge | < 24 hours |
| **Veto Rate** | Percentage of PRs vetoed | < 5% |
| **Override Rate** | Percentage of overrides | < 1% |
| **Voter Participation** | Percentage of maintainers voting | > 80% |
| **Vote Consensus** | Percentage of unanimous votes | > 70% |

### **Governance Dashboard**

View governance metrics at: `https://[user].github.io/[repo]/governance.html` (coming soon)

Shows:
- Recent votes and merges
- Veto history
- Override history
- Voting patterns by maintainer
- PR type distribution

---

## 🔐 Security Considerations

### **Protecting Your Governance**

1. **Limit Maintainer Access**
   - Only trusted people should be maintainers
   - Review regularly
   - Remove inactive maintainers

2. **Monitor Audit Log**
   - Review regularly
   - Look for unusual patterns
   - Investigate suspicious activity

3. **Secure Credentials**
   - Never commit secrets
   - Use GitHub Secrets for API keys
   - Rotate credentials regularly

4. **Backup Audit Log**
   - Export regularly
   - Store securely
   - Verify integrity

---

## 📞 Support

For questions or issues with governance:

- **Documentation:** This guide
- **Issues:** Create a GitHub issue
- **Discussions:** [GitHub Discussions](https://github.com/asymcrypto/gitforge-template/discussions)
- **Enterprise:** enterprise@gitforge.dev

---

**Built with ❤️ by the GitForge Team**

*Making governance transparent, fair, and auditable*
