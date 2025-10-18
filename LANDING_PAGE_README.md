# GitForge Landing Page & Documentation

Professional landing page and complete documentation site for GitForge.

## 📁 Structure

```
├── index.html                  # Main landing page
├── docs/                       # Documentation site
│   ├── index.html             # Documentation home
│   ├── setup-guide.html       # Complete setup instructions
│   ├── quick-start.html       # 5-minute quick start
│   ├── bounty-creation.html   # Guide to creating bounties
│   ├── contributing.html      # Contributor guide
│   ├── governance.html        # Governance documentation
│   └── integrations.html      # GitHub integration examples
├── assets/
│   ├── css/
│   │   ├── style.css          # Main landing page styles
│   │   └── docs.css           # Documentation styles
│   └── js/
│       ├── main.js            # Main JavaScript
│       └── docs.js            # Documentation JavaScript
```

## 🚀 Features

### Landing Page
- ✅ Modern, responsive design
- ✅ Hero section with stats
- ✅ Features showcase
- ✅ How it works section
- ✅ Bounty level cards
- ✅ Code examples
- ✅ Call-to-action sections
- ✅ Complete footer with links
- ✅ Mobile-friendly navigation

### Documentation Site
- ✅ Complete setup guide
- ✅ Quick start (5 minutes)
- ✅ Bounty creation best practices
- ✅ Contributing guide for developers
- ✅ Governance documentation
- ✅ GitHub integration examples
- ✅ Searchable sidebar
- ✅ Code syntax highlighting
- ✅ Copy-to-clipboard functionality
- ✅ Mobile-responsive layout

## 🎨 Design Features

- Modern gradient colors
- Smooth animations
- Professional typography
- Accessible (WCAG compliant)
- Fast loading times
- SEO optimized
- Print-friendly documentation

## 📱 Mobile Responsive

All pages are fully responsive and tested on:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🚀 Deployment

### GitHub Pages

1. Go to repository Settings
2. Navigate to Pages section
3. Select `main` branch and `/ (root)` folder
4. Click Save

Your site will be available at: `https://your-username.github.io/your-repo-name/`

### Custom Domain

1. Add a file named `CNAME` with your domain:
   ```
   gitforge.yourdomain.com
   ```
2. Configure DNS:
   - Add a CNAME record pointing to `your-username.github.io`
   - Wait for DNS propagation (up to 24 hours)

## 🛠️ Customization

### Colors

Edit `assets/css/style.css` and change CSS variables:

```css
:root {
    --primary-color: #6366f1;      /* Main brand color */
    --secondary-color: #10b981;     /* Secondary/accent */
    --accent-color: #f59e0b;        /* Warning/highlight */
}
```

### Content

- **Landing page:** Edit `index.html`
- **Documentation:** Edit files in `docs/` folder
- **Navigation:** Update nav menu in each HTML file
- **Footer:** Update footer section in `index.html`

### Adding New Documentation Pages

1. Create new HTML file in `docs/` folder
2. Copy header/footer from existing doc page
3. Add link in sidebar (`docs-sidebar` section)
4. Add to navigation chain at bottom

## 📚 Documentation Sections

| Page | Description | Status |
|------|-------------|--------|
| Introduction | Overview of GitForge | ✅ Complete |
| Setup Guide | Full setup instructions | ✅ Complete |
| Quick Start | 5-minute setup | ✅ Complete |
| Bounty Creation | How to create effective bounties | ✅ Complete |
| Contributing | Guide for contributors | ✅ Complete |
| Governance | DAO governance system | ✅ Complete |
| Integrations | GitHub integration examples | ✅ Complete |

### Additional Pages (Create as needed)
- Reputation System
- Configuration Reference
- Issue Templates
- GitHub Actions
- API Reference
- Troubleshooting

## 🎯 SEO Optimization

Each page includes:
- Meta descriptions
- Open Graph tags
- Proper heading hierarchy
- Semantic HTML
- Alt text for images
- Schema markup ready

## ♿ Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Color contrast ratios meet WCAG AA
- Screen reader friendly
- Reduced motion support

## 🔧 Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📊 Analytics (Optional)

To add Google Analytics, insert before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🐛 Known Issues

None at this time.

## 📝 License

This landing page and documentation is part of GitForge and follows the same license as the main project.

## 🤝 Contributing

Found a typo or want to improve the documentation? 

1. Fork the repository
2. Make your changes
3. Submit a Pull Request

## 📧 Support

- Discord: https://discord.gg/taU76cWxW
- GitHub Issues: https://github.com/asymcrypto/gitforge-template/issues
- Discussions: https://github.com/asymcrypto/gitforge-template/discussions

## 🎉 Credits

Built with:
- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript
- Font Awesome icons
- GitHub Pages

---

**Note:** This landing page and documentation site was created as part of the GitForge bounty program. 

Built with ❤️ for the GitForge community.

