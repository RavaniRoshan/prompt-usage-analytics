# 🚀 Publishing Guide

This guide will help you publish Prompt Pal to GitHub and the Chrome Web Store.

---

## 📦 Step 1: Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)

```bash
# Install GitHub CLI if you haven't already
# macOS: brew install gh
# Windows: winget install --id GitHub.cli
# Linux: see https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# Authenticate with GitHub
gh auth login

# Create repository and push
cd prompt-usage-analytics
gh repo create prompt-pal --public --source=. --push --description "🤖 A cute Chrome extension to track and optimize your LLM prompts"
```

### Option B: Manual Setup

1. **Create repo on GitHub:**
   - Go to https://github.com/new
   - Name: `prompt-pal` (or your preferred name)
   - Description: `🤖 A cute Chrome extension to track and optimize your LLM prompts`
   - Make it Public
   - Don't initialize with README (we already have one)
   - Click "Create repository"

2. **Push your code:**
   ```bash
   cd prompt-usage-analytics
   
   # Add remote (replace with your actual URL)
   git remote add origin https://github.com/YOUR_USERNAME/prompt-pal.git
   
   # Push to main branch
   git branch -M main
   git push -u origin main
   ```

3. **Verify:** Visit `https://github.com/YOUR_USERNAME/prompt-pal`

---

## 🌐 Step 2: Deploy Landing Page to GitHub Pages

### Enable GitHub Pages:

1. Go to your repo on GitHub
2. Click **Settings** → **Pages** (in left sidebar)
3. Under "Source", select **Deploy from a branch**
4. Select branch: `main`
5. Select folder: `/ (root)` or `/landing-page`
6. Click **Save**

### Option A: Deploy from /landing-page folder (Recommended)

Move or copy the landing page files to root:

```bash
# Option 1: Move landing page to root
git mv landing-page/index.html .

# Update paths in index.html if needed
# Then commit and push
git add -A
git commit -m "Move landing page to root for GitHub Pages"
git push
```

### Option B: Keep in subfolder

Create a simple redirect or use GitHub Actions to deploy from subfolder.

### Configure Custom Domain (Optional):

1. Go to Settings → Pages
2. Under "Custom domain", enter: `promptpal.yourdomain.com`
3. Add DNS record:
   - Type: CNAME
   - Name: promptpal
   - Value: YOUR_USERNAME.github.io
4. Check "Enforce HTTPS"

**Your site will be live at:** `https://YOUR_USERNAME.github.io/prompt-pal`

---

## 🏪 Step 3: Publish to Chrome Web Store

### 3.1 Create Chrome Web Store Account

1. Go to https://chrome.google.com/webstore/devconsole
2. Click "Add new item"
3. Pay one-time $5 developer registration fee
4. Complete your developer profile

### 3.2 Prepare Extension Package

```bash
# Create a clean zip file (exclude unnecessary files)
cd prompt-usage-analytics

# Create manifest with correct name
# Update manifest.json if needed

# Create zip
zip -r prompt-pal-v1.0.0.zip \
  manifest.json \
  background.js \
  popup.html \
  popup.js \
  popup.css \
  README.md \
  LICENSE \
  icons/ \
  -x "*.git*" -x "landing-page/*" -x "*.md" -x "docs/*"

# On Windows, manually zip these files:
# manifest.json, background.js, popup.html, popup.js, popup.css, icons/
```

### 3.3 Upload to Chrome Web Store

1. Go to https://chrome.google.com/webstore/devconsole
2. Click "New Item"
3. Upload your `prompt-pal-v1.0.0.zip`
4. Fill in store listing:

**Basic Information:**
- **Name:** Prompt Pal - LLM Analytics
- **Category:** Productivity
- **Language:** English

**Detailed Description:**
```
🤖 Prompt Pal is your friendly AI companion that helps you track and optimize your LLM prompts!

Features:
✨ Track prompts across ChatGPT, Claude, Grok, OpenRouter, and Poe
📊 See efficiency scores (lower is better!)
📤 Export data as JSON or CSV
🔒 100% private - all data stays local
🎨 Beautiful, modern UI

Perfect for:
• Prompt engineers optimizing their workflows
• Researchers analyzing LLM usage
• Anyone curious about their AI habits

How it works:
Simply install and use your favorite LLM platforms normally. Prompt Pal works in the background, capturing prompts and calculating efficiency metrics. Click the extension icon anytime to view your analytics!

Privacy First:
• No data leaves your computer
• No external servers
• No tracking
• Open source

Support & Source Code:
https://github.com/YOUR_USERNAME/prompt-pal
```

**Screenshots:**
- Screenshot 1: Main dashboard (1280x800)
- Screenshot 2: Prompt list view (1280x800)
- Screenshot 3: Export feature (1280x800)
- Small promo tile: 440x280
- Large promo tile: 920x680
- Marquee promo tile: 1400x560

**Icons:** Already included in package (16x16, 48x48, 128x128)

### 3.4 Privacy & Permissions

**Privacy Policy URL:**
Create a simple privacy policy page:

```markdown
# Privacy Policy for Prompt Pal

Last updated: February 10, 2025

## Overview
Prompt Pal is committed to protecting your privacy. This policy explains what data we collect and how we use it.

## Data Collection
Prompt Pal collects the following data LOCALLY on your device:
- LLM prompts you submit
- Response metadata (token counts, model names)
- Timestamps
- Site information (e.g., "chatgpt.com")

## Data Storage
All data is stored locally in your browser using Chrome's storage API. We do NOT:
- Send data to external servers
- Use cloud storage
- Track you across websites
- Sell or share your data

## Data Retention
Data is stored until you:
- Clear it manually via the extension
- Uninstall the extension
- Exceed 1000 entries (oldest auto-deleted)

## Permissions
The extension requires:
- webRequest: To capture LLM API calls
- storage: To save your data locally
- host permissions: To work on LLM websites

## Contact
For questions about this privacy policy, please open an issue on GitHub:
https://github.com/YOUR_USERNAME/prompt-pal/issues
```

Save this as `PRIVACY.md` and host it on your GitHub Pages site.

**Permission Justifications:**
- `webRequest`: Required to capture LLM API requests
- `storage`: Required to save data locally
- `host_permissions`: Required to work on LLM domains

### 3.5 Submit for Review

1. Click "Submit for review"
2. Select visibility: Public
3. Click "Submit"

**Review time:** Typically 1-3 business days

### 3.6 After Approval

Once approved:
1. You'll get an email
2. The extension goes live on Chrome Web Store
3. Update your landing page with the real Chrome Web Store link
4. Share on social media, Product Hunt, etc.

---

## 📣 Step 4: Marketing & Launch

### Update Landing Page

Edit `landing-page/index.html`:
- Replace `yourusername` with your actual GitHub username
- Update Chrome Web Store button link after approval
- Add real screenshots

### Launch Checklist

- [ ] GitHub repo created and public
- [ ] GitHub Pages deployed
- [ ] Chrome Web Store listing submitted
- [ ] Screenshots uploaded
- [ ] Privacy policy published
- [ ] README.md updated with links
- [ ] Social media announcement
- [ ] Product Hunt submission
- [ ] Reddit communities (r/chrome_extensions, r/machinelearning)

### Social Media Post Template

```
🚀 Just launched Prompt Pal!

A cute Chrome extension that tracks your LLM prompts across ChatGPT, Claude, Grok & more.

✨ Features:
• Track prompts & token usage
• Success scoring algorithm
• 100% private (local storage)
• Export JSON/CSV
• Beautiful UI

🔒 No tracking, no servers, 100% open source

Get it: [Chrome Web Store link]
Star it: [GitHub link]

#AI #LLM #ChromeExtension #OpenSource
```

---

## 🔄 Step 5: Future Updates

### Version Bump Process

1. Update version in `manifest.json`:
   ```json
   "version": "1.1.0"
   ```

2. Update `landing-page/index.html` version badge

3. Create new zip:
   ```bash
   zip -r prompt-pal-v1.1.0.zip manifest.json background.js popup.html popup.js popup.css icons/ README.md LICENSE
   ```

4. Upload to Chrome Web Store
5. Tag release on GitHub:
   ```bash
   git tag -a v1.1.0 -m "Version 1.1.0 - Added new features"
   git push origin v1.1.0
   ```

6. Create GitHub Release with changelog

---

## 🆘 Troubleshooting

### Chrome Web Store Rejection

Common reasons:
- **Missing privacy policy** → Add PRIVACY.md
- **Vague permissions** → Add detailed justification
- **Incomplete description** → Expand store listing
- **Low-quality screenshots** → Use 1280x800 PNGs
- **Misleading claims** → Be honest about functionality

### GitHub Pages Not Working

- Ensure repo is public
- Check branch is set to `main` or `master`
- Verify index.html is in root or correct folder
- Wait 5-10 minutes for DNS propagation

### Extension Not Capturing Prompts

- Check host_permissions in manifest
- Verify you're on a supported site
- Open service worker console for errors
- Check if site uses WebSockets (not supported)

---

## 📞 Support

- GitHub Issues: https://github.com/YOUR_USERNAME/prompt-pal/issues
- Email: your.email@example.com
- Twitter: @yourhandle

Good luck with your launch! 🎉
