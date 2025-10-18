# GitForge Assets

This folder contains images and assets for the GitForge landing page and documentation.

## 📁 Current Assets

- `logo.svg` - Main GitForge logo (64x64px)
- `favicon.svg` - Favicon for browser tabs (32x32px)

## 🎨 Using the Logo

### In HTML
```html
<img src="assets/images/logo.svg" alt="GitForge Logo" width="64" height="64">
```

### In CSS
```css
.logo {
    background-image: url('../images/logo.svg');
    width: 64px;
    height: 64px;
}
```

## 🔖 Adding Favicon

Add to the `<head>` section of your HTML:

```html
<link rel="icon" type="image/svg+xml" href="assets/images/favicon.svg">
<link rel="alternate icon" href="assets/images/favicon.ico">
```

### Converting SVG to ICO

For older browser support, convert `favicon.svg` to `favicon.ico`:

1. Use an online converter like https://convertio.co/svg-ico/
2. Or use ImageMagick:
   ```bash
   convert favicon.svg -define icon:auto-resize=16,32,48,64 favicon.ico
   ```

## 📸 Recommended Additional Images

Create these images to enhance your landing page:

### 1. Hero Section Background
- **Filename:** `hero-bg.svg` or `hero-bg.png`
- **Size:** 1920x1080px
- **Type:** Gradient, pattern, or subtle illustration

### 2. Feature Icons
- **Filename:** `icon-bounties.svg`, `icon-governance.svg`, etc.
- **Size:** 64x64px
- **Type:** Simple, colorful icons

### 3. Screenshots
- **Filename:** `screenshot-bounty.png`, `screenshot-dashboard.png`
- **Size:** 1200x800px
- **Type:** Actual screenshots or mockups

### 4. Social Media Image
- **Filename:** `og-image.png`
- **Size:** 1200x630px (for Open Graph)
- **Purpose:** Shows when sharing on social media

### 5. Contributor Avatars
- **Filename:** `avatar-placeholder.svg`
- **Size:** 128x128px
- **Type:** Default avatar for contributors

## 🎨 Brand Colors

Use these colors consistently:

```css
Primary:   #6366f1  /* Indigo */
Secondary: #10b981  /* Green */
Accent:    #f59e0b  /* Amber */
Dark:      #111827  /* Gray-900 */
Light:     #f9fafb  /* Gray-50 */
```

## 📐 Design Guidelines

### Logo Usage
- ✅ Use on white or dark backgrounds
- ✅ Maintain aspect ratio
- ✅ Minimum size: 32x32px
- ❌ Don't distort or rotate
- ❌ Don't change colors
- ❌ Don't add effects

### Spacing
- Minimum clear space: 8px around logo
- Use multiples of 8px for consistency

## 🖼️ Image Optimization

Before adding images:

1. **Compress images:**
   - PNG: Use TinyPNG or similar
   - JPG: Quality 80-85%
   - SVG: Optimize with SVGO

2. **Responsive images:**
   ```html
   <picture>
     <source srcset="image-small.jpg" media="(max-width: 768px)">
     <source srcset="image-large.jpg" media="(min-width: 769px)">
     <img src="image-default.jpg" alt="Description">
   </picture>
   ```

3. **Lazy loading:**
   ```html
   <img src="image.jpg" alt="Description" loading="lazy">
   ```

## 📱 Responsive Sizes

Provide multiple sizes for key images:

- Mobile: 320px, 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px

Example naming:
- `hero-mobile.png`
- `hero-tablet.png`
- `hero-desktop.png`

## 🎬 Creating Screenshots

For documentation screenshots:

1. Use actual GitForge interface
2. Highlight important elements
3. Use consistent window size (1200px wide)
4. Add annotations if needed
5. Compress to keep size under 200KB

## 🔗 External Image Services

Consider using CDN services:

- **Cloudinary:** Free tier, automatic optimization
- **ImgIX:** Advanced image processing
- **GitHub:** Can host images in repository

## 📝 Alt Text Guidelines

Always include descriptive alt text:

```html
<!-- Good -->
<img src="logo.svg" alt="GitForge logo - hammer icon">

<!-- Bad -->
<img src="logo.svg" alt="logo">
```

## 🚀 Adding New Assets

1. Place image in this folder
2. Update this README
3. Optimize file size
4. Test on different devices
5. Commit with descriptive message

## 📋 Asset Checklist

- [x] Logo (SVG)
- [x] Favicon (SVG)
- [ ] Favicon (ICO) - Convert from SVG
- [ ] Hero background
- [ ] Feature icons
- [ ] Screenshots
- [ ] Social media image (OG)
- [ ] Avatar placeholder

## 🤝 Contributing

Need help with design assets? Open an issue or join our Discord!

