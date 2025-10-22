#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load equity data
const equityData = JSON.parse(
  fs.readFileSync('github/EQUITY_TRACKING.json', 'utf8')
);

// Create charts directory
const chartsDir = 'assets/charts';
if (!fs.existsSync(chartsDir)) {
  fs.mkdirSync(chartsDir, { recursive: true });
}

// Generate SVG charts
function generateEquityDistributionSVG() {
  const contributors = [...equityData.contributors]
    .sort((a, b) => b.equity_earned - a.equity_earned)
    .slice(0, 10);
  
  const maxEquity = Math.max(...contributors.map(c => c.equity_earned), 10);
  const barHeight = 40;
  const barSpacing = 10;
  const chartHeight = contributors.length * (barHeight + barSpacing) + 100;
  const chartWidth = 800;
  const leftMargin = 200;
  
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
    '#3b82f6', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'
  ];
  
  let svg = `<svg width="${chartWidth}" height="${chartHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
      </linearGradient>
    </defs>
    
    <text x="400" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1e293b">
      Top Contributors by Equity
    </text>
    
    <text x="400" y="55" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#64748b">
      Last Updated: ${new Date(equityData.last_updated).toLocaleDateString()}
    </text>
  `;
  
  contributors.forEach((contributor, index) => {
    const y = 80 + index * (barHeight + barSpacing);
    const barWidth = (contributor.equity_earned / maxEquity) * (chartWidth - leftMargin - 100);
    
    // Background bar
    svg += `<rect x="${leftMargin}" y="${y}" width="${chartWidth - leftMargin - 50}" height="${barHeight}" 
            fill="#f1f5f9" rx="8" />`;
    
    // Actual bar
    svg += `<rect x="${leftMargin}" y="${y}" width="${barWidth}" height="${barHeight}" 
            fill="${colors[index % colors.length]}" rx="8">
            <animate attributeName="width" from="0" to="${barWidth}" dur="1s" fill="freeze" />
          </rect>`;
    
    // Username
    svg += `<text x="${leftMargin - 10}" y="${y + barHeight / 2 + 5}" text-anchor="end" 
            font-family="Arial, sans-serif" font-size="14" font-weight="600" fill="#1e293b">
            ${contributor.github_username}
          </text>`;
    
    // Equity percentage
    svg += `<text x="${leftMargin + barWidth + 10}" y="${y + barHeight / 2 + 5}" 
            font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#6366f1">
            ${contributor.equity_earned}%
          </text>`;
  });
  
  svg += '</svg>';
  
  return svg;
}

function generateEquityPieChartSVG() {
  const contributors = [...equityData.contributors]
    .sort((a, b) => b.equity_earned - a.equity_earned)
    .slice(0, 5);
  
  const centerX = 400;
  const centerY = 300;
  const radius = 150;
  
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#e2e8f0'];
  
  let svg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <text x="400" y="40" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1e293b">
      Equity Distribution
    </text>
  `;
  
  // Calculate angles
  const total = equityData.total_equity_allocated + equityData.total_equity_available;
  let currentAngle = -90; // Start from top
  
  // Draw pie slices for contributors
  contributors.forEach((contributor, index) => {
    const sliceAngle = (contributor.equity_earned / total) * 360;
    const endAngle = currentAngle + sliceAngle;
    
    const startX = centerX + radius * Math.cos((currentAngle * Math.PI) / 180);
    const startY = centerY + radius * Math.sin((currentAngle * Math.PI) / 180);
    const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
    const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
    
    const largeArcFlag = sliceAngle > 180 ? 1 : 0;
    
    svg += `<path d="M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z" 
            fill="${colors[index]}" stroke="white" stroke-width="2">
            <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="${index * 0.1}s" fill="freeze" />
          </path>`;
    
    currentAngle = endAngle;
  });
  
  // Available equity slice
  const availableAngle = (equityData.total_equity_available / total) * 360;
  const endAngle = currentAngle + availableAngle;
  
  const startX = centerX + radius * Math.cos((currentAngle * Math.PI) / 180);
  const startY = centerY + radius * Math.sin((currentAngle * Math.PI) / 180);
  const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
  const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
  
  const largeArcFlag = availableAngle > 180 ? 1 : 0;
  
  svg += `<path d="M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z" 
          fill="${colors[5]}" stroke="white" stroke-width="2" />`;
  
  // Center circle
  svg += `<circle cx="${centerX}" cy="${centerY}" r="80" fill="white" />`;
  svg += `<text x="${centerX}" y="${centerY - 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#6366f1">
          ${equityData.total_equity_allocated}%
        </text>`;
  svg += `<text x="${centerX}" y="${centerY + 20}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#64748b">
          Allocated
        </text>`;
  
  // Legend
  let legendY = 100;
  contributors.forEach((contributor, index) => {
    svg += `<rect x="650" y="${legendY}" width="20" height="20" fill="${colors[index]}" rx="4" />`;
    svg += `<text x="680" y="${legendY + 15}" font-family="Arial, sans-serif" font-size="12" fill="#1e293b">
            ${contributor.github_username} (${contributor.equity_earned}%)
          </text>`;
    legendY += 30;
  });
  
  svg += `<rect x="650" y="${legendY}" width="20" height="20" fill="${colors[5]}" rx="4" />`;
  svg += `<text x="680" y="${legendY + 15}" font-family="Arial, sans-serif" font-size="12" fill="#1e293b">
          Available (${equityData.total_equity_available}%)
        </text>`;
  
  svg += '</svg>';
  
  return svg;
}

function generateTimelineChart() {
  // Group contributors by completion date
  const timeline = {};
  equityData.contributors.forEach(contributor => {
    const date = contributor.completion_date || new Date().toISOString().split('T')[0];
    if (!timeline[date]) {
      timeline[date] = 0;
    }
    timeline[date] += contributor.equity_earned;
  });
  
  const dates = Object.keys(timeline).sort();
  const chartWidth = 800;
  const chartHeight = 400;
  const padding = 60;
  const plotWidth = chartWidth - 2 * padding;
  const plotHeight = chartHeight - 2 * padding;
  
  let svg = `<svg width="${chartWidth}" height="${chartHeight}" xmlns="http://www.w3.org/2000/svg">
    <text x="400" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#1e293b">
      Equity Allocation Timeline
    </text>
    
    <!-- Axes -->
    <line x1="${padding}" y1="${chartHeight - padding}" x2="${chartWidth - padding}" y2="${chartHeight - padding}" 
          stroke="#cbd5e1" stroke-width="2" />
    <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${chartHeight - padding}" 
          stroke="#cbd5e1" stroke-width="2" />
  `;
  
  if (dates.length > 0) {
    const maxEquity = Math.max(...Object.values(timeline));
    const stepX = plotWidth / Math.max(dates.length - 1, 1);
    
    // Draw line
    let pathData = '';
    let cumulativeEquity = 0;
    dates.forEach((date, index) => {
      cumulativeEquity += timeline[date];
      const x = padding + index * stepX;
      const y = chartHeight - padding - (cumulativeEquity / equityData.total_equity_allocated) * plotHeight;
      
      if (index === 0) {
        pathData += `M ${x} ${y}`;
      } else {
        pathData += ` L ${x} ${y}`;
      }
      
      // Draw point
      svg += `<circle cx="${x}" cy="${y}" r="6" fill="#6366f1" stroke="white" stroke-width="2">
              <animate attributeName="r" from="0" to="6" dur="0.5s" begin="${index * 0.1}s" fill="freeze" />
            </circle>`;
      
      // Date label
      if (dates.length <= 10 || index % Math.ceil(dates.length / 10) === 0) {
        svg += `<text x="${x}" y="${chartHeight - padding + 20}" text-anchor="middle" 
                font-family="Arial, sans-serif" font-size="10" fill="#64748b">
                ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>`;
      }
    });
    
    svg += `<path d="${pathData}" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round">
            <animate attributeName="stroke-dasharray" from="0 1000" to="1000 0" dur="2s" fill="freeze" />
          </path>`;
  }
  
  // Y-axis labels
  for (let i = 0; i <= 5; i++) {
    const y = chartHeight - padding - (i / 5) * plotHeight;
    const value = Math.round((i / 5) * equityData.total_equity_allocated);
    svg += `<text x="${padding - 10}" y="${y + 5}" text-anchor="end" 
            font-family="Arial, sans-serif" font-size="12" fill="#64748b">
            ${value}%
          </text>`;
  }
  
  svg += '</svg>';
  
  return svg;
}

// Generate and save charts
console.log('📊 Generating charts...');

fs.writeFileSync(
  path.join(chartsDir, 'equity-distribution.svg'),
  generateEquityDistributionSVG()
);
console.log('✅ Generated equity-distribution.svg');

fs.writeFileSync(
  path.join(chartsDir, 'equity-pie-chart.svg'),
  generateEquityPieChartSVG()
);
console.log('✅ Generated equity-pie-chart.svg');

fs.writeFileSync(
  path.join(chartsDir, 'equity-timeline.svg'),
  generateTimelineChart()
);
console.log('✅ Generated equity-timeline.svg');

console.log('✅ All charts generated successfully!');
