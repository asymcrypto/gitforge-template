#!/usr/bin/env node

/**
 * GitForge Skill Extractor
 * Automatically extracts and tags skills from contributor activity
 * Part of Phase 3: Talent Pipeline
 */

const fs = require('fs');
const path = require('path');

class SkillExtractor {
  constructor() {
    this.profilesPath = path.join(__dirname, '../../github/CONTRIBUTOR_PROFILES.json');
    this.skillsPath = path.join(__dirname, '../../github/SKILLS_INDEX.json');
    this.profiles = this.loadProfiles();
  }

  loadProfiles() {
    try {
      const data = fs.readFileSync(this.profilesPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading profiles:', error.message);
      return { profiles: [] };
    }
  }

  /**
   * Skill categories and keywords
   */
  getSkillCategories() {
    return {
      'Backend Development': {
        keywords: ['backend', 'api', 'server', 'nodejs', 'node.js', 'express', 'fastapi', 'django', 'flask', 'java', 'golang', 'rust', 'python'],
        level: 'advanced'
      },
      'Frontend Development': {
        keywords: ['frontend', 'ui', 'react', 'vue', 'angular', 'svelte', 'html', 'css', 'javascript', 'typescript', 'web'],
        level: 'advanced'
      },
      'Full Stack': {
        keywords: ['full stack', 'fullstack', 'mern', 'mean', 'lamp'],
        level: 'advanced'
      },
      'Mobile Development': {
        keywords: ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
        level: 'advanced'
      },
      'DevOps & Infrastructure': {
        keywords: ['devops', 'docker', 'kubernetes', 'ci/cd', 'github actions', 'jenkins', 'terraform', 'aws', 'gcp', 'azure', 'infrastructure'],
        level: 'advanced'
      },
      'Database & Data': {
        keywords: ['database', 'sql', 'mongodb', 'postgres', 'mysql', 'redis', 'elasticsearch', 'data', 'analytics'],
        level: 'advanced'
      },
      'Security': {
        keywords: ['security', 'audit', 'vulnerability', 'penetration', 'cryptography', 'encryption', 'auth', 'oauth'],
        level: 'advanced'
      },
      'Machine Learning': {
        keywords: ['machine learning', 'ml', 'ai', 'tensorflow', 'pytorch', 'nlp', 'computer vision', 'deep learning'],
        level: 'advanced'
      },
      'Documentation': {
        keywords: ['documentation', 'docs', 'readme', 'technical writing', 'guides', 'tutorials'],
        level: 'intermediate'
      },
      'Design': {
        keywords: ['design', 'ui/ux', 'ux', 'ui', 'figma', 'design system', 'prototyping'],
        level: 'intermediate'
      },
      'Testing': {
        keywords: ['testing', 'test', 'jest', 'mocha', 'pytest', 'unit test', 'integration test', 'e2e', 'qa'],
        level: 'intermediate'
      },
      'Project Management': {
        keywords: ['project management', 'agile', 'scrum', 'kanban', 'leadership', 'coordination'],
        level: 'intermediate'
      },
      'Community': {
        keywords: ['community', 'outreach', 'mentoring', 'teaching', 'speaking', 'conference'],
        level: 'intermediate'
      },
      'Open Source': {
        keywords: ['open source', 'oss', 'github', 'contribution', 'maintenance'],
        level: 'intermediate'
      }
    };
  }

  /**
   * Extract skills from a profile
   */
  extractSkillsFromProfile(profile) {
    const extractedSkills = {};
    const skillCategories = this.getSkillCategories();

    // Combine all text to search
    const searchText = [
      profile.bio || '',
      (profile.skills || []).join(' '),
      (profile.achievements || []).join(' ')
    ].join(' ').toLowerCase();

    // Check each skill category
    for (const [category, data] of Object.entries(skillCategories)) {
      for (const keyword of data.keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          extractedSkills[category] = {
            proficiency: this.calculateProficiency(profile, category),
            level: data.level,
            confidence: this.calculateConfidence(profile, category)
          };
          break;
        }
      }
    }

    return extractedSkills;
  }

  /**
   * Calculate proficiency level based on activity
   */
  calculateProficiency(profile, skill) {
    const bounties = profile.total_bounties_completed || 0;
    const earned = profile.total_amount_earned_usd || 0;
    const score = profile.reputation_score || 0;

    if (bounties >= 10 && earned >= 2000 && score >= 80) {
      return 'expert';
    } else if (bounties >= 5 && earned >= 1000 && score >= 60) {
      return 'advanced';
    } else if (bounties >= 2 && earned >= 300 && score >= 40) {
      return 'intermediate';
    }
    return 'beginner';
  }

  /**
   * Calculate confidence score (0-100)
   */
  calculateConfidence(profile, skill) {
    const bounties = profile.total_bounties_completed || 0;
    const score = profile.reputation_score || 0;

    // Base confidence on reputation and activity
    let confidence = Math.min(score + (bounties * 5), 100);
    return Math.round(confidence);
  }

  /**
   * Generate a searchable skills index
   */
  generateSkillsIndex() {
    const skillsIndex = {
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      total_profiles_indexed: this.profiles.profiles?.length || 0,
      skills_by_category: {},
      contributors_by_skill: {},
      top_skills: []
    };

    const skillFrequency = {};

    // Index all profiles
    if (this.profiles.profiles && Array.isArray(this.profiles.profiles)) {
      this.profiles.profiles.forEach(profile => {
        const extractedSkills = this.extractSkillsFromProfile(profile);

        // Add to category index
        for (const [skill, data] of Object.entries(extractedSkills)) {
          if (!skillsIndex.skills_by_category[skill]) {
            skillsIndex.skills_by_category[skill] = [];
          }
          skillsIndex.skills_by_category[skill].push({
            username: profile.github_username,
            proficiency: data.proficiency,
            confidence: data.confidence
          });

          // Track frequency
          skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;

          // Add to contributor index
          if (!skillsIndex.contributors_by_skill[skill]) {
            skillsIndex.contributors_by_skill[skill] = [];
          }
          skillsIndex.contributors_by_skill[skill].push(profile.github_username);
        }
      });
    }

    // Calculate top skills
    skillsIndex.top_skills = Object.entries(skillFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([skill, count]) => ({
        skill,
        contributors: count,
        percentage: ((count / (this.profiles.profiles?.length || 1)) * 100).toFixed(1)
      }));

    return skillsIndex;
  }

  /**
   * Generate skill search interface
   */
  generateSkillSearchPage(skillsIndex) {
    const topSkills = skillsIndex.top_skills || [];
    const skillsByCategory = skillsIndex.skills_by_category || {};

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitForge Skill Search</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 40px 20px; border-radius: 8px; margin-bottom: 40px; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .search-box { background: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
        .search-input { width: 100%; padding: 12px 16px; font-size: 1em; border: 2px solid #ddd; border-radius: 4px; }
        .search-input:focus { outline: none; border-color: #6366f1; }
        .top-skills { background: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .top-skills h2 { margin-bottom: 20px; color: #333; }
        .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 15px; }
        .skill-card { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; cursor: pointer; transition: transform 0.3s; }
        .skill-card:hover { transform: translateY(-4px); }
        .skill-name { font-weight: bold; margin-bottom: 10px; }
        .skill-count { font-size: 1.5em; font-weight: bold; margin-bottom: 5px; }
        .skill-percentage { font-size: 0.9em; opacity: 0.9; }
        .categories { background: white; padding: 20px; border-radius: 8px; }
        .categories h2 { margin-bottom: 20px; color: #333; }
        .category { margin-bottom: 30px; }
        .category h3 { color: #6366f1; margin-bottom: 15px; font-size: 1.1em; }
        .contributors-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .contributor-badge { background: #f0f0f0; padding: 8px 12px; border-radius: 20px; font-size: 0.9em; cursor: pointer; transition: all 0.3s; }
        .contributor-badge:hover { background: #6366f1; color: white; }
        .stats { background: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; }
        .stat { text-align: center; }
        .stat-value { font-size: 2em; font-weight: bold; color: #6366f1; }
        .stat-label { font-size: 0.9em; color: #666; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 GitForge Skill Search</h1>
            <p>Find contributors by verified skills</p>
        </div>

        <div class="stats">
            <div class="stat">
                <div class="stat-value">${skillsIndex.total_profiles_indexed}</div>
                <div class="stat-label">Profiles Indexed</div>
            </div>
            <div class="stat">
                <div class="stat-value">${Object.keys(skillsByCategory).length}</div>
                <div class="stat-label">Skills Tracked</div>
            </div>
            <div class="stat">
                <div class="stat-value">${topSkills.length}</div>
                <div class="stat-label">Top Skills</div>
            </div>
        </div>

        <div class="search-box">
            <input type="text" class="search-input" id="searchInput" placeholder="Search for skills (e.g., React, DevOps, Machine Learning)...">
        </div>

        <div class="top-skills">
            <h2>🔥 Top Skills</h2>
            <div class="skills-grid">
                ${topSkills.map(skill => `
                    <div class="skill-card" onclick="searchSkill('${skill.skill}')">
                        <div class="skill-count">${skill.contributors}</div>
                        <div class="skill-name">${skill.skill}</div>
                        <div class="skill-percentage">${skill.percentage}% of contributors</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="categories">
            <h2>📚 All Skills by Category</h2>
            ${Object.entries(skillsByCategory).map(([skill, contributors]) => `
                <div class="category">
                    <h3>${skill} (${contributors.length} contributors)</h3>
                    <div class="contributors-list">
                        ${contributors.slice(0, 10).map(c => `
                            <span class="contributor-badge">@${c.username}</span>
                        `).join('')}
                        ${contributors.length > 10 ? `<span class="contributor-badge">+${contributors.length - 10} more</span>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>

    <script>
        function searchSkill(skill) {
            document.getElementById('searchInput').value = skill;
            // Implement search functionality
        }
    </script>
</body>
</html>`;

    const skillPagePath = path.join(__dirname, '../../skill-search.html');
    fs.writeFileSync(skillPagePath, html);
    console.log(`✅ Generated skill search page`);
    console.log(`📄 Page saved to: ${skillPagePath}`);
  }

  /**
   * Run the skill extractor
   */
  run() {
    console.log('🚀 GitForge Skill Extractor');
    console.log('============================\n');

    const skillsIndex = this.generateSkillsIndex();
    
    // Save skills index
    fs.writeFileSync(this.skillsPath, JSON.stringify(skillsIndex, null, 2));
    console.log(`✅ Generated skills index`);
    console.log(`📁 Index saved to: ${this.skillsPath}`);

    // Generate search page
    this.generateSkillSearchPage(skillsIndex);

    console.log('\n✅ Skill extraction complete!');
    console.log(`📊 Indexed ${Object.keys(skillsIndex.skills_by_category).length} unique skills`);
    console.log(`👥 Analyzed ${skillsIndex.total_profiles_indexed} contributor profiles`);
  }
}

// Run the extractor
const extractor = new SkillExtractor();
extractor.run();
