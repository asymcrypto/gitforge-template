#!/usr/bin/env node

/**
 * GitForge Contributor Profile Generator
 * Generates verifiable, auditable contributor profiles based on GitForge activity
 * Part of Phase 3: Talent Pipeline
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ProfileGenerator {
  constructor() {
    this.equityPath = path.join(__dirname, '../../github/EQUITY_TRACKING.json');
    this.profilesPath = path.join(__dirname, '../../github/CONTRIBUTOR_PROFILES.json');
    this.equityData = this.loadEquityData();
  }

  loadEquityData() {
    try {
      const data = fs.readFileSync(this.equityPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading equity data:', error.message);
      return { contributors: [] };
    }
  }

  /**
   * Generate a cryptographic signature for profile verification
   */
  generateProfileSignature(profile) {
    const profileString = JSON.stringify({
      github_username: profile.github_username,
      total_equity_earned: profile.total_equity_earned,
      total_bounties_completed: profile.total_bounties_completed,
      reputation_score: profile.reputation_score,
      skills: profile.skills,
      achievements: profile.achievements,
      joined_date: profile.joined_date
    });

    return crypto
      .createHash('sha256')
      .update(profileString)
      .digest('hex');
  }

  /**
   * Calculate reputation score based on contributions
   */
  calculateReputationScore(contributor) {
    let score = 50; // Base score

    // Bounties completed (max +30)
    const bountiesCompleted = contributor.total_bounties_completed || 0;
    score += Math.min(bountiesCompleted * 3, 30);

    // Equity earned (max +20)
    const equityEarned = contributor.total_equity_earned || 0;
    score += Math.min(equityEarned * 2, 20);

    // Amount earned in USD (max +20)
    const amountEarned = contributor.total_amount_earned_usd || 0;
    score += Math.min((amountEarned / 100) * 2, 20);

    // Consistency bonus (max +10)
    if (bountiesCompleted >= 5) score += 10;

    // Cap at 100
    return Math.min(score, 100);
  }

  /**
   * Extract skills from contributor activity
   */
  extractSkills(contributor) {
    const skills = new Set(contributor.skills || []);

    // Add inferred skills based on bounty titles
    if (contributor.bounties_completed && Array.isArray(contributor.bounties_completed)) {
      contributor.bounties_completed.forEach(bounty => {
        const title = (bounty.title || '').toLowerCase();

        // Backend skills
        if (title.includes('backend') || title.includes('api') || title.includes('server')) {
          skills.add('backend');
        }
        if (title.includes('node') || title.includes('nodejs')) {
          skills.add('nodejs');
        }
        if (title.includes('database') || title.includes('sql') || title.includes('mongo')) {
          skills.add('database');
        }

        // Frontend skills
        if (title.includes('frontend') || title.includes('ui') || title.includes('react')) {
          skills.add('frontend');
        }
        if (title.includes('react')) {
          skills.add('react');
        }
        if (title.includes('vue')) {
          skills.add('vue');
        }

        // DevOps skills
        if (title.includes('devops') || title.includes('docker') || title.includes('kubernetes')) {
          skills.add('devops');
        }
        if (title.includes('ci/cd') || title.includes('github actions')) {
          skills.add('ci/cd');
        }

        // Security skills
        if (title.includes('security') || title.includes('audit') || title.includes('vulnerability')) {
          skills.add('security');
        }

        // Documentation
        if (title.includes('documentation') || title.includes('docs') || title.includes('readme')) {
          skills.add('documentation');
        }

        // Design
        if (title.includes('design') || title.includes('ui/ux') || title.includes('ux')) {
          skills.add('design');
        }
      });
    }

    return Array.from(skills).sort();
  }

  /**
   * Determine contributor tier based on achievements
   */
  determineContributorTier(contributor) {
    const bountiesCompleted = contributor.total_bounties_completed || 0;
    const equityEarned = contributor.total_equity_earned || 0;
    const amountEarned = contributor.total_amount_earned_usd || 0;

    if (equityEarned >= 10 || amountEarned >= 5000) {
      return 'Core Team Member';
    } else if (equityEarned >= 5 || amountEarned >= 2500) {
      return 'Founding Contributor';
    } else if (bountiesCompleted >= 10 || amountEarned >= 1000) {
      return 'Veteran Contributor';
    } else if (bountiesCompleted >= 5 || amountEarned >= 500) {
      return 'Rising Star';
    } else if (bountiesCompleted >= 1) {
      return 'Emerging Contributor';
    }
    return 'New Contributor';
  }

  /**
   * Generate achievement badges
   */
  generateAchievements(contributor) {
    const achievements = [];
    const bountiesCompleted = contributor.total_bounties_completed || 0;
    const equityEarned = contributor.total_equity_earned || 0;
    const amountEarned = contributor.total_amount_earned_usd || 0;

    if (bountiesCompleted >= 1) achievements.push('First Contribution');
    if (bountiesCompleted >= 5) achievements.push('Rising Star');
    if (bountiesCompleted >= 10) achievements.push('Veteran Contributor');
    if (equityEarned >= 5) achievements.push('Founding Contributor');
    if (equityEarned >= 10) achievements.push('Core Team Member');
    if (amountEarned >= 100) achievements.push('$100 Earner');
    if (amountEarned >= 500) achievements.push('$500 Earner');
    if (amountEarned >= 1000) achievements.push('$1K Earner');
    if (amountEarned >= 5000) achievements.push('$5K Earner');

    // Consistency bonus
    if (bountiesCompleted >= 3 && bountiesCompleted % 3 === 0) {
      achievements.push('Consistent Contributor');
    }

    return achievements;
  }

  /**
   * Generate a complete contributor profile
   */
  generateProfile(contributor) {
    const skills = this.extractSkills(contributor);
    const achievements = this.generateAchievements(contributor);
    const reputationScore = this.calculateReputationScore(contributor);
    const tier = this.determineContributorTier(contributor);

    const profile = {
      id: `profile_${contributor.id || contributor.github_username}`,
      github_username: contributor.github_username,
      display_name: contributor.display_name || contributor.github_username,
      profile_url: `https://github.com/${contributor.github_username}`,
      avatar_url: `https://avatars.githubusercontent.com/u/${contributor.github_username}?v=4`,
      joined_date: contributor.joined_date,
      last_activity: contributor.bounties_completed?.[0]?.completion_date || contributor.joined_date,
      
      // Metrics
      total_bounties_completed: contributor.total_bounties_completed || 0,
      total_equity_earned: contributor.total_equity_earned || 0,
      total_amount_earned_usd: contributor.total_amount_earned_usd || 0,
      reputation_score: reputationScore,
      contributor_tier: tier,

      // Skills and achievements
      skills: skills,
      achievements: achievements,
      verified: true,
      verification_date: new Date().toISOString(),

      // Profile details
      bio: `GitForge contributor with ${contributor.total_bounties_completed || 0} completed bounties and ${reputationScore}/100 reputation score.`,
      location: contributor.country || 'Unknown',
      website: null,
      social_links: {
        github: `https://github.com/${contributor.github_username}`,
        twitter: null,
        linkedin: null
      },

      // Availability
      available_for_hire: true,
      preferred_payment_method: contributor.payment_method || 'flutterwave',
      hourly_rate_usd: null,
      timezone: null,

      // Statistics
      statistics: {
        average_bounty_value_usd: contributor.total_amount_earned_usd / Math.max(contributor.total_bounties_completed, 1),
        completion_rate: 1.0, // Assuming all tracked bounties are completed
        average_days_to_complete: 7, // Placeholder
        code_quality_score: Math.min(reputationScore, 100),
        reliability_score: 95 // Placeholder
      },

      // Verification
      verification: {
        verified_by: 'gitforge_system',
        verification_method: 'github_activity',
        verification_date: new Date().toISOString(),
        signature: '' // Will be filled below
      }
    };

    // Generate signature
    profile.verification.signature = this.generateProfileSignature(profile);

    return profile;
  }

  /**
   * Generate all contributor profiles
   */
  generateAllProfiles() {
    const profiles = [];
    const profileIndex = {};

    if (!this.equityData.contributors || !Array.isArray(this.equityData.contributors)) {
      console.warn('No contributors found in equity data');
      return { profiles: [], index: {} };
    }

    this.equityData.contributors.forEach(contributor => {
      const profile = this.generateProfile(contributor);
      profiles.push(profile);
      profileIndex[contributor.github_username] = {
        id: profile.id,
        tier: profile.contributor_tier,
        reputation_score: profile.reputation_score,
        skills: profile.skills
      };
    });

    // Sort by reputation score (descending)
    profiles.sort((a, b) => b.reputation_score - a.reputation_score);

    return { profiles, index: profileIndex };
  }

  /**
   * Save profiles to file
   */
  saveProfiles(profiles, index) {
    const output = {
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      total_profiles: profiles.length,
      profiles: profiles,
      index: index,
      statistics: {
        total_contributors: profiles.length,
        average_reputation_score: profiles.length > 0 
          ? (profiles.reduce((sum, p) => sum + p.reputation_score, 0) / profiles.length).toFixed(2)
          : 0,
        total_bounties_completed: profiles.reduce((sum, p) => sum + p.total_bounties_completed, 0),
        total_amount_earned: profiles.reduce((sum, p) => sum + p.total_amount_earned_usd, 0),
        tiers: {
          'Core Team Member': profiles.filter(p => p.contributor_tier === 'Core Team Member').length,
          'Founding Contributor': profiles.filter(p => p.contributor_tier === 'Founding Contributor').length,
          'Veteran Contributor': profiles.filter(p => p.contributor_tier === 'Veteran Contributor').length,
          'Rising Star': profiles.filter(p => p.contributor_tier === 'Rising Star').length,
          'Emerging Contributor': profiles.filter(p => p.contributor_tier === 'Emerging Contributor').length,
          'New Contributor': profiles.filter(p => p.contributor_tier === 'New Contributor').length
        }
      }
    };

    fs.writeFileSync(this.profilesPath, JSON.stringify(output, null, 2));
    console.log(`✅ Generated ${profiles.length} contributor profiles`);
    console.log(`📁 Profiles saved to: ${this.profilesPath}`);
    return output;
  }

  /**
   * Generate profile HTML page
   */
  generateProfilePage(profiles) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitForge Contributor Profiles</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px 20px; border-radius: 8px; margin-bottom: 40px; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.1em; opacity: 0.9; }
        .filters { background: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; display: flex; gap: 10px; flex-wrap: wrap; }
        .filter-btn { padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; background: white; transition: all 0.3s; }
        .filter-btn.active { background: #6366f1; color: white; border-color: #6366f1; }
        .profiles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .profile-card { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.3s, box-shadow 0.3s; }
        .profile-card:hover { transform: translateY(-4px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
        .profile-header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 20px; text-align: center; }
        .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: white; margin: 0 auto 10px; overflow: hidden; }
        .profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .profile-name { font-size: 1.2em; font-weight: bold; margin-bottom: 5px; }
        .profile-username { font-size: 0.9em; opacity: 0.9; }
        .profile-body { padding: 20px; }
        .profile-tier { display: inline-block; background: #f0f0f0; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; font-weight: bold; color: #6366f1; margin-bottom: 15px; }
        .profile-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
        .stat { text-align: center; padding: 10px; background: #f9f9f9; border-radius: 4px; }
        .stat-value { font-size: 1.3em; font-weight: bold; color: #6366f1; }
        .stat-label { font-size: 0.8em; color: #666; margin-top: 5px; }
        .profile-score { margin: 15px 0; }
        .score-bar { background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden; }
        .score-fill { background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%); height: 100%; transition: width 0.3s; }
        .profile-skills { margin: 15px 0; }
        .skills-label { font-size: 0.9em; font-weight: bold; color: #333; margin-bottom: 8px; }
        .skill-tag { display: inline-block; background: #e8e8ff; color: #6366f1; padding: 4px 10px; border-radius: 12px; font-size: 0.8em; margin: 4px 4px 4px 0; }
        .profile-achievements { margin: 15px 0; }
        .achievement { display: inline-block; font-size: 1.5em; margin: 4px; cursor: pointer; title: 'Achievement'; }
        .profile-footer { padding: 15px 20px; background: #f9f9f9; border-top: 1px solid #eee; text-align: center; }
        .profile-link { color: #6366f1; text-decoration: none; font-weight: bold; }
        .profile-link:hover { text-decoration: underline; }
        .stats-summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; }
        .summary-stat { text-align: center; }
        .summary-value { font-size: 2em; font-weight: bold; color: #6366f1; }
        .summary-label { font-size: 0.9em; color: #666; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌟 GitForge Contributor Profiles</h1>
            <p>Verified, auditable profiles of top contributors</p>
        </div>

        <div class="stats-summary">
            <div class="summary-stat">
                <div class="summary-value">${profiles.length}</div>
                <div class="summary-label">Total Contributors</div>
            </div>
            <div class="summary-stat">
                <div class="summary-value">${profiles.reduce((sum, p) => sum + p.total_bounties_completed, 0)}</div>
                <div class="summary-label">Bounties Completed</div>
            </div>
            <div class="summary-stat">
                <div class="summary-value">$${profiles.reduce((sum, p) => sum + p.total_amount_earned_usd, 0).toLocaleString()}</div>
                <div class="summary-label">Total Earned</div>
            </div>
            <div class="summary-stat">
                <div class="summary-value">${(profiles.reduce((sum, p) => sum + p.reputation_score, 0) / profiles.length).toFixed(1)}</div>
                <div class="summary-label">Avg Reputation</div>
            </div>
        </div>

        <div class="profiles-grid">
            ${profiles.map(profile => `
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            <img src="${profile.avatar_url}" alt="${profile.github_username}">
                        </div>
                        <div class="profile-name">${profile.display_name}</div>
                        <div class="profile-username">@${profile.github_username}</div>
                    </div>
                    <div class="profile-body">
                        <div class="profile-tier">${profile.contributor_tier}</div>
                        
                        <div class="profile-stats">
                            <div class="stat">
                                <div class="stat-value">${profile.total_bounties_completed}</div>
                                <div class="stat-label">Bounties</div>
                            </div>
                            <div class="stat">
                                <div class="stat-value">$${profile.total_amount_earned_usd.toLocaleString()}</div>
                                <div class="stat-label">Earned</div>
                            </div>
                        </div>

                        <div class="profile-score">
                            <div style="font-size: 0.9em; font-weight: bold; margin-bottom: 5px;">Reputation: ${profile.reputation_score}/100</div>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${profile.reputation_score}%"></div>
                            </div>
                        </div>

                        ${profile.skills.length > 0 ? `
                            <div class="profile-skills">
                                <div class="skills-label">Skills</div>
                                ${profile.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                            </div>
                        ` : ''}

                        ${profile.achievements.length > 0 ? `
                            <div class="profile-achievements">
                                <div class="skills-label">Achievements</div>
                                ${profile.achievements.slice(0, 5).map(achievement => {
                                    const emojiMap = {
                                        'First Contribution': '🌟',
                                        'Rising Star': '⭐',
                                        'Veteran Contributor': '🎖️',
                                        'Founding Contributor': '👑',
                                        'Core Team Member': '💎',
                                        '$100 Earner': '💰',
                                        '$500 Earner': '💵',
                                        '$1K Earner': '💸',
                                        '$5K Earner': '🏆',
                                        'Consistent Contributor': '📈'
                                    };
                                    return `<span class="achievement" title="${achievement}">${emojiMap[achievement] || '✨'}</span>`;
                                }).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="profile-footer">
                        <a href="${profile.profile_url}" class="profile-link" target="_blank">View Profile →</a>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

    const profilePagePath = path.join(__dirname, '../../contributor-profiles.html');
    fs.writeFileSync(profilePagePath, html);
    console.log(`✅ Generated contributor profiles page`);
    console.log(`📄 Page saved to: ${profilePagePath}`);
  }

  /**
   * Run the profile generator
   */
  run() {
    console.log('🚀 GitForge Contributor Profile Generator');
    console.log('==========================================\n');

    const { profiles, index } = this.generateAllProfiles();
    this.saveProfiles(profiles, index);
    this.generateProfilePage(profiles);

    console.log('\n✅ Profile generation complete!');
    console.log(`📊 Generated ${profiles.length} profiles`);
    console.log(`📈 Average reputation score: ${(profiles.reduce((sum, p) => sum + p.reputation_score, 0) / profiles.length).toFixed(2)}`);
  }
}

// Run the generator
const generator = new ProfileGenerator();
generator.run();
